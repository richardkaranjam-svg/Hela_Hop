-- =============================================================================
-- Hela Hop Fintech — User interview log (Task 0.4, updated for Master Plan v1.5)
-- Migration : 20261118000001_interviews
-- Description:
--   Moves the /admin/interviews tracker from browser localStorage into the
--   database so interviews are not lost when the browser is cleared or the
--   founder switches phones.
--
--   Adds the B2B "supplier" segment and the fields needed to test hypotheses
--   H1, H11 and H13 (Master Plan 1.10 and 3.8): pain described unprompted,
--   current tracking tool, orders per month, credit customers, eTIMS requests
--   and price reaction.
--
--   The table has RLS on and NO policies, and no grants to anon/authenticated:
--   browsers can neither read nor write it. Only the server actions in
--   src/app/admin/interviews/actions.ts touch it, through the service-role
--   client, after checking the ADMIN_EMAILS allow-list.
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.interviews (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  interview_date  DATE        NOT NULL,
  person_name     TEXT        NOT NULL CHECK (char_length(person_name) BETWEEN 1 AND 120),
  segment         TEXT        NOT NULL
                  CHECK (segment IN ('seller', 'supplier', 'student', 'freelancer')),
  business_type   TEXT        CHECK (business_type IS NULL OR char_length(business_type) <= 120),
  -- H1 / H11: did they describe the "who paid / who owes me" pain before we
  -- mentioned it?
  pain_unprompted BOOLEAN     NOT NULL DEFAULT false,
  pain_points     TEXT[]      NOT NULL DEFAULT '{}'
                  CHECK (cardinality(pain_points) <= 3),
  exact_quote     TEXT        CHECK (exact_quote IS NULL OR char_length(exact_quote) <= 1000),
  current_tool    TEXT        CHECK (current_tool IS NULL OR current_tool IN (
                    'notebook', 'excel', 'whatsapp', 'memory',
                    'accounting_software', 'other', 'none')),
  -- Supplier (B2B) questions; NULL = not asked.
  monthly_orders   INTEGER    CHECK (monthly_orders IS NULL OR monthly_orders BETWEEN 0 AND 1000000),
  credit_customers BOOLEAN,
  asked_for_etims  BOOLEAN,
  -- H13 / Q24: reaction to the price we quoted.
  price_reaction  TEXT        CHECK (price_reaction IS NULL OR price_reaction IN (
                    'founding_yes', 'would_pay', 'too_expensive', 'free_only', 'unsure')),
  would_try       TEXT        NOT NULL CHECK (would_try IN ('yes', 'maybe', 'no')),
  referral        TEXT        CHECK (referral IS NULL OR char_length(referral) <= 200),
  notes           TEXT        CHECK (notes IS NULL OR char_length(notes) <= 2000),
  created_by      UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_interviews_date
  ON public.interviews (interview_date DESC, created_at DESC);

ALTER TABLE public.interviews ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.interviews FROM PUBLIC, anon, authenticated;

NOTIFY pgrst, 'reload schema';
