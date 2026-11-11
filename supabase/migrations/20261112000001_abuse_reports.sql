-- =============================================================================
-- Hela Hop Fintech — Report abuse (Task 1.9B, part 3)
-- Migration : 20261112000001_abuse_reports
-- Description:
--   Lets anyone flag a payment link (/pay/[slug]) or invoice (/i/[code]) as a
--   possible scam. Reports are reviewed by the founder in the Supabase
--   dashboard (Table Editor > abuse_reports) until the admin area (Task 2.5).
--
--   The table has RLS on and NO policies, and no grants to anon/authenticated:
--   browsers can neither read nor write it. The only way in is
--   submit_abuse_report(), which looks the target up itself, so a caller cannot
--   attach a report to an arbitrary UUID.
--
--   Returns { ok: true } or { ok: false, field, error }.
--   The app also rate-limits per IP + target with hit_rate_limit (Task 1.9).
-- =============================================================================

DO $$ BEGIN
  CREATE TYPE abuse_target_type AS ENUM ('link', 'invoice');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE abuse_report_status AS ENUM ('open', 'reviewed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.abuse_reports (
  id            UUID                PRIMARY KEY DEFAULT gen_random_uuid(),
  target_type   abuse_target_type   NOT NULL,
  -- payment_links.id or invoices.id (no FK: the report must survive if the
  -- seller deletes the link/invoice, so we can still see what happened).
  target_id     UUID                NOT NULL,
  reporter_name TEXT                CHECK (reporter_name IS NULL OR char_length(reporter_name) BETWEEN 1 AND 100),
  reason        TEXT                NOT NULL CHECK (char_length(reason) BETWEEN 10 AND 500),
  status        abuse_report_status NOT NULL DEFAULT 'open',
  created_at    TIMESTAMPTZ         NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_abuse_reports_target
  ON public.abuse_reports (target_type, target_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_abuse_reports_open
  ON public.abuse_reports (created_at DESC) WHERE status = 'open';

ALTER TABLE public.abuse_reports ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.abuse_reports FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.submit_abuse_report(
  p_slug_or_code TEXT,
  p_type         TEXT,
  p_name         TEXT,
  p_reason       TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_key       TEXT := btrim(COALESCE(p_slug_or_code, ''));
  v_name      TEXT := NULLIF(btrim(COALESCE(p_name, '')), '');
  v_reason    TEXT := btrim(COALESCE(p_reason, ''));
  v_type      abuse_target_type;
  v_target_id UUID;
  v_recent    INTEGER;
BEGIN
  IF p_type = 'link' THEN
    v_type := 'link';
    SELECT id INTO v_target_id FROM public.payment_links WHERE slug = v_key;
  ELSIF p_type = 'invoice' THEN
    v_type := 'invoice';
    SELECT id INTO v_target_id FROM public.invoices WHERE code = v_key;
  ELSE
    RETURN jsonb_build_object('ok', false, 'field', 'general', 'error', 'invalid_target');
  END IF;

  IF v_target_id IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'field', 'general', 'error', 'not_found');
  END IF;

  IF v_name IS NOT NULL AND char_length(v_name) > 100 THEN
    RETURN jsonb_build_object('ok', false, 'field', 'name', 'error', 'invalid_name');
  END IF;
  IF char_length(v_reason) < 10 OR char_length(v_reason) > 500 THEN
    RETURN jsonb_build_object('ok', false, 'field', 'reason', 'error', 'invalid_reason');
  END IF;

  -- Backstop against flooding one page (the app rate limit fails open if the
  -- database call errors). Past 20 reports a day on one target we already know
  -- something is wrong; say "thanks" but do not store more.
  SELECT count(*) INTO v_recent
  FROM public.abuse_reports
  WHERE target_type = v_type
    AND target_id = v_target_id
    AND created_at > NOW() - INTERVAL '1 day';
  IF v_recent >= 20 THEN
    RETURN jsonb_build_object('ok', true);
  END IF;

  INSERT INTO public.abuse_reports (target_type, target_id, reporter_name, reason)
  VALUES (v_type, v_target_id, v_name, v_reason);

  RETURN jsonb_build_object('ok', true);
END;
$$;

REVOKE ALL ON FUNCTION public.submit_abuse_report(TEXT, TEXT, TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_abuse_report(TEXT, TEXT, TEXT, TEXT)
  TO anon, authenticated;

NOTIFY pgrst, 'reload schema';
