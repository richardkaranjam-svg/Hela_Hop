-- =============================================================================
-- Hela Hop Fintech — Invoices Migration
-- Migration : 20261109000002_invoices
-- Description: Creates invoices table with RLS enabled.
-- =============================================================================

-- 1. Create invoice status enum
DO $$ BEGIN
  CREATE TYPE invoice_status AS ENUM ('unpaid', 'claimed', 'paid', 'cancelled');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 2. Create invoices table
CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  -- Crypto-secure, unguessable, non-sequential code (min 10 chars)
  code TEXT NOT NULL UNIQUE CHECK (char_length(code) >= 10),
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  -- Array of { description: string, quantity: number, unit_price_minor: number }
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  total_minor INTEGER NOT NULL CHECK (total_minor >= 0),
  currency CHAR(3) NOT NULL DEFAULT 'KES',
  due_date DATE,
  status invoice_status NOT NULL DEFAULT 'unpaid',
  payout_method_id UUID REFERENCES public.payout_methods(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Auto-update updated_at trigger
CREATE TRIGGER invoices_updated_at
  BEFORE UPDATE ON public.invoices
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 4. Enable Row Level Security
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- 5. Owner CRUD Policies
CREATE POLICY "invoices: owner select"
  ON public.invoices FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "invoices: owner insert"
  ON public.invoices FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "invoices: owner update"
  ON public.invoices FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "invoices: owner delete"
  ON public.invoices FOR DELETE
  USING (auth.uid() = user_id);

-- 6. Public read policy: Anyone can select an invoice by its unique unguessable code
CREATE POLICY "invoices: public select by code"
  ON public.invoices FOR SELECT
  USING (true);

-- 7. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON public.invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_code ON public.invoices(code);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON public.invoices(status);
