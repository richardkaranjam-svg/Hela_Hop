-- =============================================================================
-- Hela Hop Fintech — Payment Claims & Receipts Migration
-- Migration : 20261109000003_claims_and_receipts
-- Description: Creates payment_claims and receipts tables with RLS enabled.
--              Enforces M-PESA code uniqueness per seller to prevent reuse.
-- =============================================================================

-- 1. Create claim status enum
DO $$ BEGIN
  CREATE TYPE claim_status AS ENUM ('pending', 'confirmed', 'rejected');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 2. Create payment_claims table
CREATE TABLE IF NOT EXISTS public.payment_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  invoice_id UUID REFERENCES public.invoices(id) ON DELETE SET NULL,
  payment_link_id UUID REFERENCES public.payment_links(id) ON DELETE SET NULL,
  payer_name TEXT NOT NULL,
  payer_phone TEXT NOT NULL,
  -- Exactly 10 uppercase alphanumeric chars (e.g. SDF489K1L2)
  mpesa_code TEXT NOT NULL CHECK (mpesa_code ~ '^[A-Z0-9]{10}$'),
  amount_minor INTEGER NOT NULL CHECK (amount_minor > 0),
  status claim_status NOT NULL DEFAULT 'pending',
  reject_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- Constraint: prevent reusing the same M-PESA code for the same seller
  CONSTRAINT unique_seller_mpesa_code UNIQUE (seller_id, mpesa_code)
);

-- Trigger for payment_claims updated_at
CREATE TRIGGER payment_claims_updated_at
  BEFORE UPDATE ON public.payment_claims
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 3. Create receipts table
CREATE TABLE IF NOT EXISTS public.receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_id UUID NOT NULL UNIQUE REFERENCES public.payment_claims(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  receipt_number TEXT NOT NULL,
  -- Crypto-secure, unguessable public token (min 10 chars)
  public_token TEXT NOT NULL UNIQUE CHECK (char_length(public_token) >= 10),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Enable Row Level Security
ALTER TABLE public.payment_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.receipts ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies for payment_claims
-- Sellers can view, update, and manage claims submitted to them
CREATE POLICY "payment_claims: seller select"
  ON public.payment_claims FOR SELECT
  USING (auth.uid() = seller_id);

CREATE POLICY "payment_claims: seller update"
  ON public.payment_claims FOR UPDATE
  USING (auth.uid() = seller_id)
  WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "payment_claims: seller delete"
  ON public.payment_claims FOR DELETE
  USING (auth.uid() = seller_id);

-- Anyone (public buyers) can submit an "I've Paid" claim
CREATE POLICY "payment_claims: public insert"
  ON public.payment_claims FOR INSERT
  WITH CHECK (true);

-- 6. RLS Policies for receipts
-- Public can read receipt by its unguessable public_token
CREATE POLICY "receipts: public select by token"
  ON public.receipts FOR SELECT
  USING (true);

-- Sellers can manage their own receipts
CREATE POLICY "receipts: seller insert"
  ON public.receipts FOR INSERT
  WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "receipts: seller update"
  ON public.receipts FOR UPDATE
  USING (auth.uid() = seller_id)
  WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "receipts: seller delete"
  ON public.receipts FOR DELETE
  USING (auth.uid() = seller_id);

-- 7. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_payment_claims_seller_id ON public.payment_claims(seller_id);
CREATE INDEX IF NOT EXISTS idx_payment_claims_invoice_id ON public.payment_claims(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payment_claims_link_id ON public.payment_claims(payment_link_id);
CREATE INDEX IF NOT EXISTS idx_payment_claims_status ON public.payment_claims(status);
CREATE INDEX IF NOT EXISTS idx_receipts_public_token ON public.receipts(public_token);
CREATE INDEX IF NOT EXISTS idx_receipts_seller_id ON public.receipts(seller_id);
