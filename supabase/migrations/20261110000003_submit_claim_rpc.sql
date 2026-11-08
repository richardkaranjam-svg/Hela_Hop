-- =============================================================================
-- Hela Hop Fintech — Public claim submission (part 3 of 4)
-- Migration : 20261110000003_submit_claim_rpc
-- Description: "I've Paid" claim from /pay/[slug] or /i/[code].
--   Pass EITHER p_payment_link_id OR p_invoice_code.
--   The seller is looked up here; the browser never chooses it.
--   Returns { ok: true, claim_id } or { ok: false, field, error }.
-- =============================================================================

CREATE OR REPLACE FUNCTION public.submit_payment_claim(
  p_payment_link_id UUID,
  p_invoice_code    TEXT,
  p_payer_name      TEXT,
  p_payer_phone     TEXT,
  p_mpesa_code      TEXT,
  p_amount_minor    INTEGER
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_code     TEXT := upper(btrim(COALESCE(p_mpesa_code, '')));
  v_name     TEXT := btrim(COALESCE(p_payer_name, ''));
  v_phone    TEXT := btrim(COALESCE(p_payer_phone, ''));
  v_seller   UUID;
  v_amount   INTEGER;
  v_invoice  public.invoices%ROWTYPE;
  v_link     public.payment_links%ROWTYPE;
  v_claim_id UUID;
BEGIN
  IF v_code !~ '^[A-Z0-9]{10}$' THEN
    RETURN jsonb_build_object('ok', false, 'field', 'mpesa_code', 'error', 'invalid_code');
  END IF;

  IF (p_payment_link_id IS NULL) = (p_invoice_code IS NULL) THEN
    RETURN jsonb_build_object('ok', false, 'field', 'general', 'error', 'invalid_target');
  END IF;

  IF p_invoice_code IS NOT NULL THEN
    SELECT * INTO v_invoice FROM public.invoices WHERE code = p_invoice_code FOR UPDATE;
    IF NOT FOUND THEN
      RETURN jsonb_build_object('ok', false, 'field', 'general', 'error', 'not_found');
    END IF;
    IF v_invoice.status = 'paid' THEN
      RETURN jsonb_build_object('ok', false, 'field', 'general', 'error', 'already_paid');
    ELSIF v_invoice.status = 'cancelled' THEN
      RETURN jsonb_build_object('ok', false, 'field', 'general', 'error', 'cancelled');
    ELSIF v_invoice.status = 'claimed' THEN
      RETURN jsonb_build_object('ok', false, 'field', 'general', 'error', 'already_claimed');
    END IF;
    v_seller := v_invoice.user_id;
    v_amount := v_invoice.total_minor;
    v_name   := COALESCE(NULLIF(v_name, ''),  v_invoice.customer_name);
    v_phone  := COALESCE(NULLIF(v_phone, ''), v_invoice.customer_phone);
  ELSE
    SELECT * INTO v_link
    FROM public.payment_links
    WHERE id = p_payment_link_id
      AND is_active
      AND (expires_at IS NULL OR expires_at > NOW());
    IF NOT FOUND THEN
      RETURN jsonb_build_object('ok', false, 'field', 'general', 'error', 'not_found');
    END IF;
    v_seller := v_link.user_id;
    -- A fixed-amount link always claims its fixed amount.
    v_amount := COALESCE(v_link.amount_minor, p_amount_minor);
  END IF;

  IF char_length(v_name) < 1 OR char_length(v_name) > 100 THEN
    RETURN jsonb_build_object('ok', false, 'field', 'payer_name', 'error', 'invalid_name');
  END IF;
  IF char_length(v_phone) < 7 OR char_length(v_phone) > 20 THEN
    RETURN jsonb_build_object('ok', false, 'field', 'payer_phone', 'error', 'invalid_phone');
  END IF;
  -- KES 150,000 M-PESA limit, in minor units
  IF v_amount IS NULL OR v_amount <= 0 OR v_amount > 15000000 THEN
    RETURN jsonb_build_object('ok', false, 'field', 'amount', 'error', 'invalid_amount');
  END IF;

  BEGIN
    INSERT INTO public.payment_claims (
      seller_id, invoice_id, payment_link_id,
      payer_name, payer_phone, mpesa_code, amount_minor, status
    ) VALUES (
      v_seller, v_invoice.id, v_link.id,
      v_name, v_phone, v_code, v_amount, 'pending'
    )
    RETURNING id INTO v_claim_id;
  EXCEPTION WHEN unique_violation THEN
    RETURN jsonb_build_object('ok', false, 'field', 'mpesa_code', 'error', 'duplicate_code');
  END;

  IF v_invoice.id IS NOT NULL THEN
    UPDATE public.invoices SET status = 'claimed' WHERE id = v_invoice.id;
  END IF;

  RETURN jsonb_build_object('ok', true, 'claim_id', v_claim_id);
END;
$$;

REVOKE ALL ON FUNCTION public.submit_payment_claim(UUID, TEXT, TEXT, TEXT, TEXT, INTEGER) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_payment_claim(UUID, TEXT, TEXT, TEXT, TEXT, INTEGER)
  TO anon, authenticated;
