-- =============================================================================
-- Hela Hop Fintech — Security Hardening Test (Task 1.9)
-- File: supabase/tests/security_hardening.sql
--
-- Run AFTER migrations 20261111000001_rate_limits and
-- 20261111000002_lock_profile_columns.
--
-- How to run:
--   1. Supabase Dashboard -> SQL Editor -> new query.
--   2. Paste this whole file and click "Run".
--   3. The Messages tab should show
--      "All security_hardening checks PASSED!"
--   Everything runs in one transaction that ends with ROLLBACK.
--
-- Checks:
--   - A seller CAN update their own full_name, phone and username
--   - A seller CANNOT update kyc_tier, kakitu_score_points, email or
--     payout_method, and cannot insert or delete profiles
--   - Visitors and sellers cannot read or write public.rate_limits directly
--   - hit_rate_limit allows up to the max, then blocks; other keys are separate
--   - hit_rate_limit rejects an empty key
-- =============================================================================

BEGIN;

DO $$
DECLARE
  v_seller_id UUID := gen_random_uuid();
  v_email     TEXT := 'hardening_' || replace(gen_random_uuid()::text, '-', '') || '@example.com';
  v_key       TEXT := 'test:' || gen_random_uuid()::text;
  v_rows      INTEGER;
  v_ok        BOOLEAN;
  v_blocked   BOOLEAN;
BEGIN
  -- ===========================================================================
  -- 1. SETUP (as postgres). The handle_new_user trigger creates the profile.
  -- ===========================================================================
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at
  ) VALUES (
    '00000000-0000-0000-0000-000000000000', v_seller_id, 'authenticated',
    'authenticated', v_email, '', now(),
    '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, now(), now()
  );

  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = v_seller_id) THEN
    RAISE EXCEPTION '[SETUP] handle_new_user did not create a profile';
  END IF;

  -- ===========================================================================
  -- 2. Seller can update the allowed columns
  -- ===========================================================================
  EXECUTE 'SET ROLE authenticated';
  PERFORM set_config('request.jwt.claims',
    jsonb_build_object('sub', v_seller_id::text, 'role', 'authenticated')::text, true);

  EXECUTE format(
    'UPDATE public.profiles SET full_name = %L, phone = %L, username = %L WHERE id = %L',
    'Hardening Test', '+254700000001', 'hardening-' || substr(v_seller_id::text, 1, 8), v_seller_id
  );
  GET DIAGNOSTICS v_rows = ROW_COUNT;
  IF v_rows <> 1 THEN
    RAISE EXCEPTION '[FAIL] Seller could not update full_name/phone/username (rows: %)', v_rows;
  END IF;

  -- ===========================================================================
  -- 3. Seller cannot update locked columns (each must raise
  --    insufficient_privilege). Setting a column to itself is enough to test
  --    the privilege without needing valid enum values.
  -- ===========================================================================
  BEGIN
    EXECUTE format('UPDATE public.profiles SET kyc_tier = kyc_tier WHERE id = %L', v_seller_id);
    RAISE EXCEPTION '[FAIL] Seller was able to update kyc_tier';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;

  BEGIN
    EXECUTE format('UPDATE public.profiles SET kakitu_score_points = 999 WHERE id = %L', v_seller_id);
    RAISE EXCEPTION '[FAIL] Seller was able to update kakitu_score_points';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;

  BEGIN
    EXECUTE format('UPDATE public.profiles SET email = %L WHERE id = %L', 'x@evil.com', v_seller_id);
    RAISE EXCEPTION '[FAIL] Seller was able to update email';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;

  BEGIN
    EXECUTE format('UPDATE public.profiles SET payout_method = payout_method WHERE id = %L', v_seller_id);
    RAISE EXCEPTION '[FAIL] Seller was able to update payout_method';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;

  BEGIN
    EXECUTE format(
      'INSERT INTO public.profiles (id, email, username) VALUES (%L, %L, %L)',
      gen_random_uuid(), 'other@example.com', 'other-user'
    );
    RAISE EXCEPTION '[FAIL] Seller was able to insert a profile';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;

  BEGIN
    EXECUTE format('DELETE FROM public.profiles WHERE id = %L', v_seller_id);
    RAISE EXCEPTION '[FAIL] Seller was able to delete their profile';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;

  BEGIN
    EXECUTE 'SELECT count(*) FROM public.rate_limits';
    RAISE EXCEPTION '[FAIL] Seller was able to read public.rate_limits';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;

  -- ===========================================================================
  -- 4. Visitor (anon): no direct access to rate_limits; function works
  -- ===========================================================================
  EXECUTE 'RESET ROLE';
  EXECUTE 'SET ROLE anon';
  PERFORM set_config('request.jwt.claims', '{"role":"anon"}', true);

  BEGIN
    EXECUTE 'SELECT count(*) FROM public.rate_limits';
    RAISE EXCEPTION '[FAIL] Visitor was able to read public.rate_limits';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;

  BEGIN
    EXECUTE format(
      'INSERT INTO public.rate_limits (key, window_start, count) VALUES (%L, now(), 0)',
      v_key
    );
    RAISE EXCEPTION '[FAIL] Visitor was able to write public.rate_limits';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;

  -- max = 2 in a 1-hour window: hits 1 and 2 allowed, hit 3 blocked.
  SELECT public.hit_rate_limit(v_key, 3600, 2) INTO v_ok;
  IF NOT v_ok THEN RAISE EXCEPTION '[FAIL] hit 1 should be allowed'; END IF;
  SELECT public.hit_rate_limit(v_key, 3600, 2) INTO v_ok;
  IF NOT v_ok THEN RAISE EXCEPTION '[FAIL] hit 2 should be allowed'; END IF;
  SELECT public.hit_rate_limit(v_key, 3600, 2) INTO v_blocked;
  IF v_blocked THEN RAISE EXCEPTION '[FAIL] hit 3 should be blocked'; END IF;

  -- A different key has its own count.
  SELECT public.hit_rate_limit(v_key || ':other', 3600, 2) INTO v_ok;
  IF NOT v_ok THEN RAISE EXCEPTION '[FAIL] a different key should be allowed'; END IF;

  -- Junk input is rejected.
  BEGIN
    PERFORM public.hit_rate_limit('', 60, 5);
    RAISE EXCEPTION '[FAIL] empty key should be rejected';
  EXCEPTION WHEN raise_exception THEN
    IF SQLERRM LIKE '[FAIL]%' THEN RAISE; END IF;
  END;

  -- ===========================================================================
  -- 5. DONE
  -- ===========================================================================
  EXECUTE 'RESET ROLE';
  PERFORM set_config('request.jwt.claims', '', true);

  RAISE NOTICE '==================================================';
  RAISE NOTICE 'All security_hardening checks PASSED!';
  RAISE NOTICE 'Transaction will now ROLLBACK cleanly.';
  RAISE NOTICE '==================================================';
END $$;

ROLLBACK;
