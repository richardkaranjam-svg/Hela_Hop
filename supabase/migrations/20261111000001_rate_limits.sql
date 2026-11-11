-- =============================================================================
-- Hela Hop Fintech — Shared rate limiting (Task 1.9, part 1)
-- Migration : 20261111000001_rate_limits
-- Description:
--   An in-memory limiter does not work on Vercel (every server copy keeps its
--   own count and forgets it on restart). This keeps the counts in Postgres so
--   every server copy shares them.
--
--   hit_rate_limit(key, window_seconds, max) records one hit for `key` in the
--   current fixed time window and returns TRUE if the caller is still within
--   `max` hits, FALSE if they should be blocked.
--
--   Used by: submitClaimAction (/pay and /i claims), /api/mpesa/stk-push, and
--   the report-abuse action (Task 1.9B).
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.rate_limits (
  key          TEXT        NOT NULL,
  window_start TIMESTAMPTZ NOT NULL,
  count        INTEGER     NOT NULL DEFAULT 0,
  PRIMARY KEY (key, window_start)
);

-- Used by the cleanup inside hit_rate_limit.
CREATE INDEX IF NOT EXISTS idx_rate_limits_window_start
  ON public.rate_limits (window_start);

-- RLS on with NO policies: nobody can read or write the table directly from the
-- browser. Only hit_rate_limit (SECURITY DEFINER) touches it.
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.rate_limits FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.hit_rate_limit(
  p_key            TEXT,
  p_window_seconds INTEGER,
  p_max            INTEGER
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_window_start TIMESTAMPTZ;
  v_count        INTEGER;
BEGIN
  -- Reject silly input instead of storing it (keeps the table small).
  IF p_key IS NULL OR char_length(p_key) = 0 OR char_length(p_key) > 200 THEN
    RAISE EXCEPTION 'hit_rate_limit: invalid key';
  END IF;
  IF p_window_seconds IS NULL OR p_window_seconds < 1 OR p_window_seconds > 86400 THEN
    RAISE EXCEPTION 'hit_rate_limit: window must be 1 to 86400 seconds';
  END IF;
  IF p_max IS NULL OR p_max < 1 THEN
    RAISE EXCEPTION 'hit_rate_limit: max must be at least 1';
  END IF;

  -- Fixed window: round "now" down to the start of the current window.
  v_window_start := to_timestamp(
    floor(extract(epoch FROM now()) / p_window_seconds) * p_window_seconds
  );

  -- Simple cleanup: forget anything older than 1 day.
  DELETE FROM public.rate_limits
  WHERE window_start < now() - INTERVAL '1 day';

  -- Count this hit (atomic, safe when many requests arrive at once).
  INSERT INTO public.rate_limits AS rl (key, window_start, count)
  VALUES (p_key, v_window_start, 1)
  ON CONFLICT (key, window_start)
  DO UPDATE SET count = rl.count + 1
  RETURNING rl.count INTO v_count;

  RETURN v_count <= p_max;
END;
$$;

REVOKE ALL ON FUNCTION public.hit_rate_limit(TEXT, INTEGER, INTEGER) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.hit_rate_limit(TEXT, INTEGER, INTEGER)
  TO anon, authenticated;

NOTIFY pgrst, 'reload schema';
