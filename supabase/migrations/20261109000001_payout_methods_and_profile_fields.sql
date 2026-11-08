-- =============================================================================
-- Hela Hop Fintech — Payout Methods & Seller Profile Fields Migration
-- Migration : 20261109000001_payout_methods_and_profile_fields
-- Description: Adds full_name and phone to profiles table.
--              Creates payout_methods table with RLS enabled.
-- =============================================================================

-- 1. Add seller profile fields to public.profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS full_name TEXT,
  ADD COLUMN IF NOT EXISTS phone TEXT;

-- 2. Create payout method type enum
DO $$ BEGIN
  CREATE TYPE payout_method_type AS ENUM ('till', 'paybill', 'pochi', 'phone');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 3. Create payout_methods table
CREATE TABLE IF NOT EXISTS public.payout_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type payout_method_type NOT NULL,
  number TEXT NOT NULL,
  account_ref TEXT,
  label TEXT,
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Trigger for updated_at
CREATE TRIGGER payout_methods_updated_at
  BEFORE UPDATE ON public.payout_methods
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 5. Enable Row Level Security
ALTER TABLE public.payout_methods ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies: users see and manage only their own payout methods
CREATE POLICY "payout_methods: user can view own"
  ON public.payout_methods FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "payout_methods: user can insert own"
  ON public.payout_methods FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "payout_methods: user can update own"
  ON public.payout_methods FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "payout_methods: user can delete own"
  ON public.payout_methods FOR DELETE
  USING (auth.uid() = user_id);

-- 7. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_payout_methods_user_id ON public.payout_methods(user_id);
CREATE INDEX IF NOT EXISTS idx_payout_methods_is_default ON public.payout_methods(user_id, is_default);

-- 8. Add payout_method_id to payment_links
ALTER TABLE public.payment_links
  ADD COLUMN IF NOT EXISTS payout_method_id UUID REFERENCES public.payout_methods(id) ON DELETE SET NULL;

-- 9. Allow public read of payout methods (required for public /pay and /i pages)
CREATE POLICY "payout_methods: public read"
  ON public.payout_methods FOR SELECT
  USING (true);

-- 10. Allow public read of profiles (required for resolving merchant names on /pay and /i pages)
CREATE POLICY "profiles: public read"
  ON public.profiles FOR SELECT
  USING (true);
