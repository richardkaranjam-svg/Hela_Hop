-- =============================================================================
-- Hela Hop Fintech — Harden RLS (part 1 of 4 for the 2026-11-10 review fixes)
-- Migration : 20261110000001_harden_rls
-- Description:
--   * Removes the over-broad "USING (true)" read policies that exposed every
--     profile, payout method, invoice and receipt to anyone holding the anon key.
--   * Removes the open INSERT policy on payment_claims, and the direct seller
--     UPDATE/DELETE/INSERT policies on claims/receipts. From now on claims and
--     receipts change ONLY through the SECURITY DEFINER functions added in
--     migrations 20261110000002 - 20261110000004.
--   * Adds owner SELECT policies that were missing.
-- Safe to run on top of migrations 20261105000001 .. 20261109000003.
-- =============================================================================

-- 1. Drop over-broad policies ------------------------------------------------
DROP POLICY IF EXISTS "profiles: public read"            ON public.profiles;
DROP POLICY IF EXISTS "payout_methods: public read"      ON public.payout_methods;
DROP POLICY IF EXISTS "invoices: public select by code"  ON public.invoices;
DROP POLICY IF EXISTS "receipts: public select by token" ON public.receipts;
DROP POLICY IF EXISTS "payment_claims: public insert"    ON public.payment_claims;

-- 2. Claims/receipts are changed only via functions ---------------------------
DROP POLICY IF EXISTS "payment_claims: seller update"    ON public.payment_claims;
DROP POLICY IF EXISTS "payment_claims: seller delete"    ON public.payment_claims;
DROP POLICY IF EXISTS "receipts: seller insert"          ON public.receipts;
DROP POLICY IF EXISTS "receipts: seller update"          ON public.receipts;
DROP POLICY IF EXISTS "receipts: seller delete"          ON public.receipts;

-- 3. Owners must still be able to read their own rows -------------------------
-- payment_links only had a public policy for is_active = TRUE, so a seller could
-- not see (or re-activate) their own deactivated links.
DROP POLICY IF EXISTS "payment_links: owner select" ON public.payment_links;
CREATE POLICY "payment_links: owner select"
  ON public.payment_links FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "receipts: seller select" ON public.receipts;
CREATE POLICY "receipts: seller select"
  ON public.receipts FOR SELECT
  USING (auth.uid() = seller_id);

-- 4. Receipt numbers are unique per seller -------------------------------------
DO $$ BEGIN
  CREATE UNIQUE INDEX IF NOT EXISTS uq_receipts_seller_number
    ON public.receipts (seller_id, receipt_number);
EXCEPTION WHEN unique_violation THEN
  RAISE NOTICE 'Existing receipts contain duplicate numbers for a seller; unique index skipped.';
END $$;

-- 5. Helpers ---------------------------------------------------------------------

-- Mask a phone number for public pages (D10). Mirrors maskPhoneNumber() in TS.
--   0712345678     -> 0712 *** 678
--   +254712345678  -> +254 712 *** 678
CREATE OR REPLACE FUNCTION public.mask_phone(p_phone TEXT)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public
AS $$
DECLARE
  c TEXT;
BEGIN
  IF p_phone IS NULL THEN
    RETURN '';
  END IF;
  c := regexp_replace(p_phone, '[\s\-()]', '', 'g');
  IF c LIKE '+254%' AND length(c) >= 13 THEN
    RETURN '+254 ' || substr(c, 5, 3) || ' *** ' || right(c, 3);
  ELSIF c LIKE '0%' AND length(c) >= 10 THEN
    RETURN substr(c, 1, 4) || ' *** ' || right(c, 3);
  ELSIF length(c) > 6 THEN
    RETURN substr(c, 1, 3) || ' *** ' || right(c, 3);
  END IF;
  RETURN '***';
END;
$$;

-- Internal: the payout method to show on a public page. Prefers the method chosen
-- on the link/invoice, then the seller's default, then the oldest one.
CREATE OR REPLACE FUNCTION public._payout_json(p_user_id UUID, p_preferred UUID)
RETURNS JSONB
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT jsonb_build_object(
           'type',        m.type,
           'number',      m.number,
           'account_ref', m.account_ref,
           'label',       m.label
         )
  FROM public.payout_methods m
  WHERE m.user_id = p_user_id
  ORDER BY (m.id = p_preferred) DESC NULLS LAST,
           m.is_default DESC,
           m.created_at ASC
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public._payout_json(UUID, UUID) FROM PUBLIC, anon, authenticated;
