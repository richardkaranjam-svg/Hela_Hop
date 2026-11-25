-- =============================================================================
-- Hela Hop Fintech — Rate-limit counter is server-only
-- Migration : 20261125000002_rate_limit_server_only
-- Description:
--   hit_rate_limit() was executable by `anon` and `authenticated`, so anyone
--   holding the public anon key could call it directly with any key, e.g.
--   'claim:<buyer-ip>:link:<public link id>', and fill the counter to block
--   real buyers from sending "I've paid" claims.
--   From now on only the server (service_role key, via createAdminClient in
--   src/lib/security/rate-limit.ts) can call it.
-- =============================================================================

REVOKE EXECUTE ON FUNCTION public.hit_rate_limit(TEXT, INTEGER, INTEGER)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.hit_rate_limit(TEXT, INTEGER, INTEGER)
  TO service_role;

NOTIFY pgrst, 'reload schema';
