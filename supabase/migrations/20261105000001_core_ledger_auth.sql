-- =============================================================================
-- Hela Hop Fintech — Core Ledger & Auth Migration
-- Migration : 20261105000001_core_ledger_auth
-- Description: Creates profiles, payment_links, transactions, and
--              ledger_entries tables with RLS enabled.
--              All monetary values stored as INTEGER minor units (e.g. KES cents).
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 0. EXTENSIONS
-- ---------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "pgcrypto";   -- gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "citext";     -- case-insensitive text for email/username

-- ---------------------------------------------------------------------------
-- 1. CUSTOM TYPES / ENUMS
-- ---------------------------------------------------------------------------
DO $$ BEGIN
  CREATE TYPE kyc_tier AS ENUM ('unverified', 'tier1', 'tier2', 'tier3');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE payout_method AS ENUM ('mpesa', 'bank', 'wave', 'airtel_money', 'manual');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE transaction_status AS ENUM (
    'pending', 'processing', 'completed', 'failed', 'reversed', 'disputed'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE payer_type AS ENUM ('customer', 'guest', 'merchant', 'system');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE ledger_direction AS ENUM ('credit', 'debit');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE ledger_entry_type AS ENUM (
    'payment_received', 'fee_charged', 'payout_sent',
    'refund_issued', 'reversal', 'adjustment'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ---------------------------------------------------------------------------
-- 2. PROFILES
--    One-to-one with auth.users (id = auth.users.id).
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id                   UUID           PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email                CITEXT         NOT NULL UNIQUE,
  username             CITEXT         NOT NULL UNIQUE,
  kyc_tier             kyc_tier       NOT NULL DEFAULT 'unverified',
  payout_method        payout_method,
  -- Phone, account number, or wallet address depending on payout_method
  payout_destination   TEXT,
  -- Gamified loyalty points (Kakitu Score)
  kakitu_score_points  INTEGER        NOT NULL DEFAULT 0 CHECK (kakitu_score_points >= 0),
  created_at           TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- 3. PAYMENT LINKS
--    A shareable slug a merchant creates to receive money.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.payment_links (
  id           UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  slug         TEXT           NOT NULL UNIQUE
                              CHECK (slug ~ '^[a-z0-9\-]{3,80}$'),
  user_id      UUID           NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title        TEXT           NOT NULL CHECK (char_length(title) BETWEEN 1 AND 200),
  -- ISO 4217 currency code (e.g. 'KES', 'UGX', 'USD')
  currency     CHAR(3)        NOT NULL,
  -- Minor units (e.g. 50000 = KES 500.00). NULL means "pay any amount".
  amount_minor INTEGER        CHECK (amount_minor IS NULL OR amount_minor > 0),
  is_active    BOOLEAN        NOT NULL DEFAULT TRUE,
  expires_at   TIMESTAMPTZ,
  created_at   TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

CREATE TRIGGER payment_links_updated_at
  BEFORE UPDATE ON public.payment_links
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX IF NOT EXISTS idx_payment_links_user_id  ON public.payment_links(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_links_slug      ON public.payment_links(slug);

-- ---------------------------------------------------------------------------
-- 4. TRANSACTIONS
--    Every inbound or outbound money movement (one provider call = one row).
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.transactions (
  id                UUID               PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Caller-supplied deduplication key (UUID or any unique string ≤ 128 chars)
  idempotency_key   TEXT               NOT NULL UNIQUE CHECK (char_length(idempotency_key) <= 128),
  -- Reference returned by the payment provider (M-Pesa checkout ID, etc.)
  provider_ref      TEXT,
  -- FK to the payment link that generated this transaction (optional)
  payment_link_id   UUID               REFERENCES public.payment_links(id) ON DELETE SET NULL,
  -- The merchant receiving the funds
  merchant_id       UUID               REFERENCES public.profiles(id) ON DELETE SET NULL,
  status            transaction_status NOT NULL DEFAULT 'pending',
  payer_type        payer_type         NOT NULL DEFAULT 'customer',
  -- Payer identifier: phone, email, or guest token
  payer_ref         TEXT,
  -- ISO 4217 currency code
  currency          CHAR(3)            NOT NULL,
  -- Amount collected from the payer in minor units (e.g. 100000 = KES 1000.00)
  amount_minor      INTEGER            NOT NULL CHECK (amount_minor > 0),
  -- Platform fee in minor units (deducted from amount_minor)
  fee_minor         INTEGER            NOT NULL DEFAULT 0 CHECK (fee_minor >= 0),
  -- Optional metadata (provider callback payload, device info, etc.)
  metadata          JSONB,
  initiated_at      TIMESTAMPTZ        NOT NULL DEFAULT NOW(),
  completed_at      TIMESTAMPTZ,
  created_at        TIMESTAMPTZ        NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ        NOT NULL DEFAULT NOW(),
  -- fee must not exceed the collected amount
  CONSTRAINT fee_lte_amount CHECK (fee_minor <= amount_minor)
);

CREATE TRIGGER transactions_updated_at
  BEFORE UPDATE ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX IF NOT EXISTS idx_transactions_merchant_id     ON public.transactions(merchant_id);
CREATE INDEX IF NOT EXISTS idx_transactions_payment_link_id ON public.transactions(payment_link_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status          ON public.transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_provider_ref    ON public.transactions(provider_ref);

-- ---------------------------------------------------------------------------
-- 5. LEDGER ENTRIES
--    Double-entry-style audit trail — integer minor units only, NO floats.
--    Every transaction produces at least two rows (credit + debit).
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.ledger_entries (
  id              UUID               PRIMARY KEY DEFAULT gen_random_uuid(),
  -- The transaction that triggered this entry
  transaction_id  UUID               NOT NULL REFERENCES public.transactions(id) ON DELETE RESTRICT,
  -- Which account (profile) this entry belongs to; NULL = platform account
  account_id      UUID               REFERENCES public.profiles(id) ON DELETE SET NULL,
  entry_type      ledger_entry_type  NOT NULL,
  direction       ledger_direction   NOT NULL,
  -- Minor units (e.g. 100000 = KES 1000.00). Always positive.
  amount_minor    INTEGER            NOT NULL CHECK (amount_minor > 0),
  -- ISO 4217 currency code
  currency        CHAR(3)            NOT NULL,
  -- Human-readable note for statements / reconciliation
  description     TEXT,
  -- Running balance snapshot for this account after this entry (minor units)
  balance_after   INTEGER            NOT NULL,
  -- Immutable: once written, entries must not change
  created_at      TIMESTAMPTZ        NOT NULL DEFAULT NOW()
  -- NOTE: No updated_at — ledger entries are append-only.
);

-- Useful for statement generation (account × time)
CREATE INDEX IF NOT EXISTS idx_ledger_entries_account_id    ON public.ledger_entries(account_id);
CREATE INDEX IF NOT EXISTS idx_ledger_entries_transaction_id ON public.ledger_entries(transaction_id);
CREATE INDEX IF NOT EXISTS idx_ledger_entries_created_at    ON public.ledger_entries(created_at DESC);

-- Prevent any UPDATE or DELETE on ledger_entries (append-only guarantee)
CREATE OR REPLACE FUNCTION public.ledger_immutable()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'ledger_entries is append-only: updates and deletes are not allowed';
END;
$$;

CREATE TRIGGER ledger_no_update
  BEFORE UPDATE ON public.ledger_entries
  FOR EACH ROW EXECUTE FUNCTION public.ledger_immutable();

CREATE TRIGGER ledger_no_delete
  BEFORE DELETE ON public.ledger_entries
  FOR EACH ROW EXECUTE FUNCTION public.ledger_immutable();

-- ---------------------------------------------------------------------------
-- 6. ROW LEVEL SECURITY (RLS)
-- ---------------------------------------------------------------------------

-- ---- profiles ----
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Users can read and update only their own profile
CREATE POLICY "profiles: owner select"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "profiles: owner update"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Service role (backend) can insert a profile on sign-up
CREATE POLICY "profiles: service insert"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ---- payment_links ----
ALTER TABLE public.payment_links ENABLE ROW LEVEL SECURITY;

-- Public read: anyone can resolve a slug (needed for the payment page)
CREATE POLICY "payment_links: public select"
  ON public.payment_links FOR SELECT
  USING (is_active = TRUE);

-- Only the owning merchant can manage their links
CREATE POLICY "payment_links: owner insert"
  ON public.payment_links FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "payment_links: owner update"
  ON public.payment_links FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "payment_links: owner delete"
  ON public.payment_links FOR DELETE
  USING (auth.uid() = user_id);

-- ---- transactions ----
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- A merchant can see their own transactions
CREATE POLICY "transactions: merchant select"
  ON public.transactions FOR SELECT
  USING (auth.uid() = merchant_id);

-- Inserts are performed by the backend service role; authenticated users cannot
-- insert directly (use server-side API). Keeping default deny for anon/user.

-- ---- ledger_entries ----
ALTER TABLE public.ledger_entries ENABLE ROW LEVEL SECURITY;

-- Users can read their own ledger entries (account statement)
CREATE POLICY "ledger_entries: account owner select"
  ON public.ledger_entries FOR SELECT
  USING (auth.uid() = account_id);

-- No INSERT/UPDATE/DELETE from client side; handled exclusively by server role.

-- ---------------------------------------------------------------------------
-- 7. HELPER: auto-create profile on auth.users insert (optional trigger)
--    Remove if you prefer to create profiles from your API layer.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, username)
  VALUES (
    NEW.id,
    NEW.email,
    -- Default username: left part of email, lowercased
    lower(split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ---------------------------------------------------------------------------
-- END OF MIGRATION
-- ---------------------------------------------------------------------------

