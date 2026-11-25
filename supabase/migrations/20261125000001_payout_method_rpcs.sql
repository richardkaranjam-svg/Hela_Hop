-- =============================================================================
-- Hela Hop Fintech — Atomic payout-method changes
-- Migration : 20261125000001_payout_method_rpcs
-- Description:
--   Adding, re-defaulting and deleting a payout method used to be several
--   separate requests from the server action ("clear every default", then
--   "insert / set the new one"). If the second step failed, the seller was
--   left with NO default payout method, and errors on the first step were
--   ignored. These functions do each change in ONE transaction.
--
--   Rule enforced from now on: a seller with at least one payout method has
--   exactly one default. The unique index guarantees "at most one"; the
--   functions guarantee "at least one".
--
--   SECURITY INVOKER: the existing "user can ... own" RLS policies on
--   payout_methods still apply, so a seller can only ever touch their own rows.
-- =============================================================================

-- 1. Repair existing data so the unique index can be created --------------------

-- More than one default: keep the most recently updated one.
WITH ranked AS (
  SELECT id,
         row_number() OVER (PARTITION BY user_id ORDER BY updated_at DESC, created_at DESC) AS rn
  FROM public.payout_methods
  WHERE is_default
)
UPDATE public.payout_methods p
   SET is_default = FALSE
  FROM ranked r
 WHERE p.id = r.id AND r.rn > 1;

-- Methods but no default (the old bug): make the oldest one the default.
UPDATE public.payout_methods
   SET is_default = TRUE
 WHERE id IN (
   SELECT DISTINCT ON (m.user_id) m.id
   FROM public.payout_methods m
   WHERE NOT EXISTS (
     SELECT 1 FROM public.payout_methods d
     WHERE d.user_id = m.user_id AND d.is_default
   )
   ORDER BY m.user_id, m.created_at ASC
 );

-- 2. At most one default per seller --------------------------------------------

CREATE UNIQUE INDEX IF NOT EXISTS payout_methods_one_default_per_user
  ON public.payout_methods (user_id)
  WHERE is_default;

-- 3. Add ------------------------------------------------------------------------
-- The first method a seller adds always becomes the default.

CREATE OR REPLACE FUNCTION public.add_payout_method(
  p_type         public.payout_method_type,
  p_number       TEXT,
  p_account_ref  TEXT,
  p_label        TEXT,
  p_make_default BOOLEAN
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_uid     UUID := auth.uid();
  v_default BOOLEAN;
  v_id      UUID;
BEGIN
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_authenticated');
  END IF;

  -- Serialise payout-method changes per seller (two tabs adding at once).
  PERFORM pg_advisory_xact_lock(hashtext('payout:' || v_uid::text));

  v_default := COALESCE(p_make_default, FALSE)
    OR NOT EXISTS (SELECT 1 FROM public.payout_methods WHERE user_id = v_uid);

  IF v_default THEN
    UPDATE public.payout_methods
       SET is_default = FALSE
     WHERE user_id = v_uid AND is_default;
  END IF;

  INSERT INTO public.payout_methods (user_id, type, number, account_ref, label, is_default)
  VALUES (v_uid, p_type, p_number, NULLIF(p_account_ref, ''), NULLIF(p_label, ''), v_default)
  RETURNING id INTO v_id;

  RETURN jsonb_build_object('ok', true, 'id', v_id, 'is_default', v_default);
END;
$$;

-- 4. Set default ----------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.set_default_payout_method(p_method_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_uid UUID := auth.uid();
BEGIN
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_authenticated');
  END IF;

  PERFORM pg_advisory_xact_lock(hashtext('payout:' || v_uid::text));

  IF NOT EXISTS (
    SELECT 1 FROM public.payout_methods WHERE id = p_method_id AND user_id = v_uid
  ) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_found');
  END IF;

  UPDATE public.payout_methods
     SET is_default = FALSE
   WHERE user_id = v_uid AND is_default AND id <> p_method_id;

  UPDATE public.payout_methods
     SET is_default = TRUE
   WHERE id = p_method_id AND user_id = v_uid;

  RETURN jsonb_build_object('ok', true);
END;
$$;

-- 5. Delete ---------------------------------------------------------------------
-- Deleting the default promotes the oldest remaining method.
-- Links and invoices that pointed at it fall back via ON DELETE SET NULL.

CREATE OR REPLACE FUNCTION public.delete_payout_method(p_method_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_uid         UUID := auth.uid();
  v_was_default BOOLEAN;
BEGIN
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_authenticated');
  END IF;

  PERFORM pg_advisory_xact_lock(hashtext('payout:' || v_uid::text));

  DELETE FROM public.payout_methods
   WHERE id = p_method_id AND user_id = v_uid
  RETURNING is_default INTO v_was_default;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_found');
  END IF;

  IF v_was_default THEN
    UPDATE public.payout_methods
       SET is_default = TRUE
     WHERE id = (
       SELECT id FROM public.payout_methods
       WHERE user_id = v_uid
       ORDER BY created_at ASC
       LIMIT 1
     );
  END IF;

  RETURN jsonb_build_object('ok', true);
END;
$$;

REVOKE ALL ON FUNCTION public.add_payout_method(public.payout_method_type, TEXT, TEXT, TEXT, BOOLEAN) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.set_default_payout_method(UUID) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.delete_payout_method(UUID)      FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.add_payout_method(public.payout_method_type, TEXT, TEXT, TEXT, BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION public.set_default_payout_method(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.delete_payout_method(UUID)      TO authenticated;
