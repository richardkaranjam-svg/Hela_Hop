-- =============================================================================
-- Hela Hop Fintech — Payout method RPC test
-- File: supabase/tests/payout_methods.sql
--
-- How to run:
--   1. Apply migration 20261125000001_payout_method_rpcs first.
--   2. Open Supabase Dashboard -> SQL Editor, paste this file, click "Run".
--   3. Expect "All payout_methods checks PASSED!" in the output.
--   The transaction ends with ROLLBACK so no test rows persist.
--
-- Checks verified:
--   1. The first method a seller adds becomes the default even if not asked
--   2. Adding a new default leaves exactly one default
--   3. set_default_payout_method moves the default; still exactly one
--   4. Another seller cannot set or delete someone else's method (not_found)
--   5. Deleting the default promotes the oldest remaining method
--   6. Deleting the last method leaves zero methods and no error
--   7. The unique index blocks two defaults written directly
--   8. Anonymous callers cannot execute the functions
-- =============================================================================

BEGIN;

DO $$
DECLARE
  v_seller1 UUID := gen_random_uuid();
  v_seller2 UUID := gen_random_uuid();
  v_first   UUID;
  v_second  UUID;
  v_third   UUID;
  v_res     JSONB;
  v_count   INTEGER;
  v_default UUID;
BEGIN
  -- ---------------------------------------------------------------------------
  -- Fixtures (as postgres)
  -- ---------------------------------------------------------------------------
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at
  ) VALUES
    ('00000000-0000-0000-0000-000000000000', v_seller1, 'authenticated', 'authenticated',
     'pm1_' || v_seller1 || '@example.com', '', now(),
     '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, now(), now()),
    ('00000000-0000-0000-0000-000000000000', v_seller2, 'authenticated', 'authenticated',
     'pm2_' || v_seller2 || '@example.com', '', now(),
     '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, now(), now());

  INSERT INTO public.profiles (id, email, username)
  VALUES
    (v_seller1, 'pm1_' || v_seller1 || '@example.com', 'pm1_' || substr(v_seller1::text, 1, 8)),
    (v_seller2, 'pm2_' || v_seller2 || '@example.com', 'pm2_' || substr(v_seller2::text, 1, 8))
  ON CONFLICT (id) DO NOTHING;

  -- ---------------------------------------------------------------------------
  -- 1. First method becomes default even with p_make_default = false
  -- ---------------------------------------------------------------------------
  EXECUTE 'SET ROLE authenticated';
  PERFORM set_config('request.jwt.claims',
    jsonb_build_object('sub', v_seller1::text, 'role', 'authenticated')::text, true);

  v_res := public.add_payout_method('till', '123456', '', 'Shop till', false);
  IF NOT (v_res->>'ok')::boolean OR NOT (v_res->>'is_default')::boolean THEN
    RAISE EXCEPTION '[FAIL] First method should be ok and default, got %', v_res;
  END IF;
  v_first := (v_res->>'id')::uuid;
  RAISE NOTICE '[PASS] Check 1: first method became the default';

  -- ---------------------------------------------------------------------------
  -- 2. Adding a second method as default leaves exactly one default
  -- ---------------------------------------------------------------------------
  v_res := public.add_payout_method('phone', '254712345678', '', NULL, true);
  v_second := (v_res->>'id')::uuid;
  v_res := public.add_payout_method('paybill', '400200', 'ACC1', NULL, false);
  v_third := (v_res->>'id')::uuid;

  -- now() is frozen inside one transaction, so all three share created_at.
  -- Spread them out so "oldest remaining" in check 5 is deterministic.
  EXECUTE 'RESET ROLE';
  UPDATE public.payout_methods SET created_at = now() - interval '3 days' WHERE id = v_first;
  UPDATE public.payout_methods SET created_at = now() - interval '2 days' WHERE id = v_second;
  UPDATE public.payout_methods SET created_at = now() - interval '1 day'  WHERE id = v_third;
  EXECUTE 'SET ROLE authenticated';

  SELECT count(*) INTO v_count FROM public.payout_methods WHERE user_id = v_seller1 AND is_default;
  SELECT id INTO v_default FROM public.payout_methods WHERE user_id = v_seller1 AND is_default;
  IF v_count <> 1 OR v_default <> v_second THEN
    RAISE EXCEPTION '[FAIL] Expected exactly one default (second), got % defaults, default=%', v_count, v_default;
  END IF;
  RAISE NOTICE '[PASS] Check 2: new default replaced the old one; exactly one default';

  -- ---------------------------------------------------------------------------
  -- 3. set_default moves the default
  -- ---------------------------------------------------------------------------
  v_res := public.set_default_payout_method(v_third);
  SELECT count(*) INTO v_count FROM public.payout_methods WHERE user_id = v_seller1 AND is_default;
  SELECT id INTO v_default FROM public.payout_methods WHERE user_id = v_seller1 AND is_default;
  IF NOT (v_res->>'ok')::boolean OR v_count <> 1 OR v_default <> v_third THEN
    RAISE EXCEPTION '[FAIL] set_default: res=%, defaults=%, default=%', v_res, v_count, v_default;
  END IF;
  RAISE NOTICE '[PASS] Check 3: set_default_payout_method moved the default';

  -- ---------------------------------------------------------------------------
  -- 4. Seller 2 cannot touch Seller 1's methods
  -- ---------------------------------------------------------------------------
  PERFORM set_config('request.jwt.claims',
    jsonb_build_object('sub', v_seller2::text, 'role', 'authenticated')::text, true);

  v_res := public.set_default_payout_method(v_first);
  IF v_res->>'error' IS DISTINCT FROM 'not_found' THEN
    RAISE EXCEPTION '[FAIL] Seller 2 set_default on Seller 1 method: expected not_found, got %', v_res;
  END IF;
  v_res := public.delete_payout_method(v_first);
  IF v_res->>'error' IS DISTINCT FROM 'not_found' THEN
    RAISE EXCEPTION '[FAIL] Seller 2 delete on Seller 1 method: expected not_found, got %', v_res;
  END IF;
  RAISE NOTICE '[PASS] Check 4: another seller gets not_found and changes nothing';

  -- ---------------------------------------------------------------------------
  -- 5. Deleting the default promotes the oldest remaining (v_first)
  -- ---------------------------------------------------------------------------
  PERFORM set_config('request.jwt.claims',
    jsonb_build_object('sub', v_seller1::text, 'role', 'authenticated')::text, true);

  v_res := public.delete_payout_method(v_third);
  SELECT id INTO v_default FROM public.payout_methods WHERE user_id = v_seller1 AND is_default;
  IF NOT (v_res->>'ok')::boolean OR v_default IS DISTINCT FROM v_first THEN
    RAISE EXCEPTION '[FAIL] After deleting default, expected oldest (%) as default, got %', v_first, v_default;
  END IF;
  RAISE NOTICE '[PASS] Check 5: deleting the default promoted the oldest remaining method';

  -- ---------------------------------------------------------------------------
  -- 6. Deleting everything leaves zero methods, no error
  -- ---------------------------------------------------------------------------
  v_res := public.delete_payout_method(v_first);
  v_res := public.delete_payout_method(v_second);
  SELECT count(*) INTO v_count FROM public.payout_methods WHERE user_id = v_seller1;
  IF NOT (v_res->>'ok')::boolean OR v_count <> 0 THEN
    RAISE EXCEPTION '[FAIL] Expected 0 methods after deleting all, got % (res=%)', v_count, v_res;
  END IF;
  RAISE NOTICE '[PASS] Check 6: deleting the last method works';

  -- ---------------------------------------------------------------------------
  -- 7. Unique index blocks two defaults written directly
  -- ---------------------------------------------------------------------------
  EXECUTE 'RESET ROLE';
  INSERT INTO public.payout_methods (user_id, type, number, is_default)
  VALUES (v_seller2, 'till', '111111', true);
  BEGIN
    INSERT INTO public.payout_methods (user_id, type, number, is_default)
    VALUES (v_seller2, 'till', '222222', true);
    RAISE EXCEPTION '[FAIL] Second default for the same seller was allowed';
  EXCEPTION WHEN unique_violation THEN
    RAISE NOTICE '[PASS] Check 7: unique index blocks a second default';
  END;

  -- ---------------------------------------------------------------------------
  -- 8. Anonymous callers cannot execute the functions
  -- ---------------------------------------------------------------------------
  EXECUTE 'SET ROLE anon';
  PERFORM set_config('request.jwt.claims', '{"role":"anon"}', true);
  BEGIN
    v_res := public.add_payout_method('till', '999999', '', NULL, true);
    RAISE EXCEPTION '[FAIL] anon was able to call add_payout_method';
  EXCEPTION WHEN insufficient_privilege THEN
    RAISE NOTICE '[PASS] Check 8: anon cannot call the payout functions';
  END;
  EXECUTE 'RESET ROLE';

  RAISE NOTICE 'All payout_methods checks PASSED!';
END;
$$;

ROLLBACK;
