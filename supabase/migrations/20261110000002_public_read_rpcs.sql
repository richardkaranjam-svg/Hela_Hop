-- =============================================================================
-- Hela Hop Fintech — Public read functions (part 2 of 4)
-- Migration : 20261110000002_public_read_rpcs
-- Description: The /pay, /i and /r pages call these instead of reading tables
--              directly. They return only the fields a public page needs, with
--              phone numbers already masked (D10). Unknown/inactive -> NULL.
-- =============================================================================

CREATE OR REPLACE FUNCTION public.get_public_payment_link(p_slug TEXT)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v JSONB;
BEGIN
  SELECT jsonb_build_object(
           'id',              pl.id,
           'slug',            pl.slug,
           'title',           pl.title,
           'currency',        pl.currency,
           'amount_minor',    pl.amount_minor,
           'seller_name',     COALESCE(NULLIF(btrim(p.full_name), ''), p.username::text),
           'seller_username', p.username::text,
           'payout',          public._payout_json(pl.user_id, pl.payout_method_id)
         )
    INTO v
  FROM public.payment_links pl
  JOIN public.profiles p ON p.id = pl.user_id
  WHERE pl.slug = p_slug
    AND pl.is_active
    AND (pl.expires_at IS NULL OR pl.expires_at > NOW());

  RETURN v;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_public_invoice(p_code TEXT)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v JSONB;
BEGIN
  SELECT jsonb_build_object(
           'code',                  i.code,
           'customer_name',         i.customer_name,
           'customer_phone_masked', public.mask_phone(i.customer_phone),
           'items',                 i.items,
           'total_minor',           i.total_minor,
           'currency',              i.currency,
           'due_date',              i.due_date,
           'status',                i.status,
           'seller_name',           COALESCE(NULLIF(btrim(p.full_name), ''), p.username::text),
           'seller_username',       p.username::text,
           'payout',                public._payout_json(i.user_id, i.payout_method_id)
         )
    INTO v
  FROM public.invoices i
  JOIN public.profiles p ON p.id = i.user_id
  WHERE i.code = p_code;

  RETURN v;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_public_receipt(p_token TEXT)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v JSONB;
BEGIN
  -- The invoice code is deliberately NOT returned: it is the key to the invoice
  -- page, and receipt links tend to be shared more widely.
  SELECT jsonb_build_object(
           'receipt_number',     r.receipt_number,
           'public_token',       r.public_token,
           'created_at',         r.created_at,
           'amount_minor',       c.amount_minor,
           'mpesa_code',         c.mpesa_code,
           'payer_name',         c.payer_name,
           'payer_phone_masked', public.mask_phone(c.payer_phone),
           'seller_name',        COALESCE(NULLIF(btrim(p.full_name), ''), p.username::text),
           'reference',          CASE WHEN i.id IS NOT NULL THEN 'Invoice payment' ELSE pl.title END,
           'payout',             public._payout_json(
                                   r.seller_id,
                                   COALESCE(i.payout_method_id, pl.payout_method_id)
                                 )
         )
    INTO v
  FROM public.receipts r
  JOIN public.payment_claims c      ON c.id = r.claim_id
  JOIN public.profiles p            ON p.id = r.seller_id
  LEFT JOIN public.invoices i       ON i.id = c.invoice_id
  LEFT JOIN public.payment_links pl ON pl.id = c.payment_link_id
  WHERE r.public_token = p_token
    AND c.status = 'confirmed';

  RETURN v;
END;
$$;

REVOKE ALL ON FUNCTION public.get_public_payment_link(TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_public_invoice(TEXT)      FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_public_receipt(TEXT)      FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_payment_link(TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_public_invoice(TEXT)      TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_public_receipt(TEXT)      TO anon, authenticated;
