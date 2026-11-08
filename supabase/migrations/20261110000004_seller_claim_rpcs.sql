-- =============================================================================
-- Hela Hop Fintech — Seller confirm / reject (part 4 of 4)
-- Migration : 20261110000004_seller_claim_rpcs
-- Description:
--   confirm_payment_claim: claim -> confirmed, invoice -> paid, receipt created,
--     all in ONE transaction, and only for a PENDING claim owned by the caller
--     (D9: a receipt exists only after the seller confirms).
--   reject_payment_claim: PENDING claim -> rejected, invoice back to unpaid.
--   Receipt numbers are per seller: REC-0001, REC-0002, ...
-- =============================================================================

CREATE OR REPLACE FUNCTION public.confirm_payment_claim(p_claim_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid    UUID := auth.uid();
  c        public.payment_claims%ROWTYPE;
  v_next   BIGINT;
  v_number TEXT;
  v_token  TEXT;
BEGIN
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_authenticated');
  END IF;

  SELECT * INTO c
  FROM public.payment_claims
  WHERE id = p_claim_id AND seller_id = v_uid
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_found');
  END IF;
  IF c.status <> 'pending' THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_pending');
  END IF;

  -- Serialise receipt numbering per seller
  PERFORM pg_advisory_xact_lock(hashtext('receipt:' || v_uid::text));

  -- Older receipts (REC-2026-1234) do not match the pattern and are ignored.
  SELECT COALESCE(MAX((substring(receipt_number FROM '^REC-([0-9]+)$'))::BIGINT), 0) + 1
    INTO v_next
  FROM public.receipts
  WHERE seller_id = v_uid;

  v_number := 'REC-' || lpad(v_next::text, 4, '0');
  v_token  := 'rec-' || replace(gen_random_uuid()::text, '-', '');

  UPDATE public.payment_claims SET status = 'confirmed' WHERE id = c.id;

  IF c.invoice_id IS NOT NULL THEN
    UPDATE public.invoices
       SET status = 'paid'
     WHERE id = c.invoice_id AND status IN ('unpaid', 'claimed');
  END IF;

  INSERT INTO public.receipts (claim_id, seller_id, receipt_number, public_token)
  VALUES (c.id, v_uid, v_number, v_token);

  RETURN jsonb_build_object('ok', true, 'receipt_token', v_token, 'receipt_number', v_number);
END;
$$;

CREATE OR REPLACE FUNCTION public.reject_payment_claim(p_claim_id UUID, p_reason TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid    UUID := auth.uid();
  c        public.payment_claims%ROWTYPE;
  v_reason TEXT;
BEGIN
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_authenticated');
  END IF;

  SELECT * INTO c
  FROM public.payment_claims
  WHERE id = p_claim_id AND seller_id = v_uid
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_found');
  END IF;
  IF c.status <> 'pending' THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_pending');
  END IF;

  v_reason := COALESCE(
    NULLIF(left(btrim(COALESCE(p_reason, '')), 200), ''),
    'Code not found in the seller''s M-PESA SMS.'
  );

  UPDATE public.payment_claims
     SET status = 'rejected', reject_reason = v_reason
   WHERE id = c.id;

  IF c.invoice_id IS NOT NULL THEN
    UPDATE public.invoices
       SET status = 'unpaid'
     WHERE id = c.invoice_id AND status = 'claimed';
  END IF;

  RETURN jsonb_build_object('ok', true);
END;
$$;

REVOKE ALL ON FUNCTION public.confirm_payment_claim(UUID)      FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.reject_payment_claim(UUID, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.confirm_payment_claim(UUID)      TO authenticated;
GRANT EXECUTE ON FUNCTION public.reject_payment_claim(UUID, TEXT) TO authenticated;
