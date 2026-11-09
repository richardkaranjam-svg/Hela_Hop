-- =============================================================================
-- Hela Hop Fintech — Repair: columns that migration 20261109000001 should have
-- added but that were missing on the live database.
-- Migration : 20261110000005_repair_missing_columns
-- Found by: a visitor-level check after running 20261110000001-4, which showed
--   "column pl.payout_method_id does not exist" in get_public_payment_link and
--   get_public_receipt.
-- Safe to run more than once (IF NOT EXISTS everywhere).
-- =============================================================================

-- payment_links.payout_method_id (used by /pay pages and by creating a link)
ALTER TABLE public.payment_links
  ADD COLUMN IF NOT EXISTS payout_method_id UUID
  REFERENCES public.payout_methods(id) ON DELETE SET NULL;

-- seller profile fields (used by public pages and Settings)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS full_name TEXT,
  ADD COLUMN IF NOT EXISTS phone TEXT;

-- invoices.payout_method_id is created by 20261109000002; make sure it exists too
ALTER TABLE public.invoices
  ADD COLUMN IF NOT EXISTS payout_method_id UUID
  REFERENCES public.payout_methods(id) ON DELETE SET NULL;

-- Ask Supabase's API layer to pick up the new columns straight away
NOTIFY pgrst, 'reload schema';
