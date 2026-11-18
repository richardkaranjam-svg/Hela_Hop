-- =============================================================================
-- Hela Hop Fintech — Interview log test (Task 0.4, v1.5)
-- File: supabase/tests/interviews.sql
--
-- Run AFTER migration 20261118000001_interviews.
--
-- How to run:
--   1. Supabase Dashboard -> SQL Editor -> new query.
--   2. Paste this whole file and click "Run".
--   3. The Messages tab should show "All interviews checks PASSED!"
--   Everything runs in one transaction that ends with ROLLBACK.
--
-- Checks:
--   - The server (postgres / service role) can insert a supplier interview
--   - Bad segment, bad price reaction and more than 3 pain points are rejected
--   - Visitors (anon) and logged-in sellers (authenticated) cannot read or
--     write the table
-- =============================================================================

BEGIN;

DO $$
DECLARE
  v_id    UUID;
  v_count INTEGER;
  v_ok    BOOLEAN;
BEGIN
  -- 1. Server insert works
  INSERT INTO public.interviews (
    interview_date, person_name, segment, business_type, pain_unprompted,
    pain_points, current_tool, monthly_orders, credit_customers,
    asked_for_etims, price_reaction, would_try
  ) VALUES (
    CURRENT_DATE, 'Test Supplier', 'supplier', 'Hardware supplier', true,
    ARRAY['Customers pay 60 days late'], 'notebook', 200, true,
    true, 'founding_yes', 'yes'
  ) RETURNING id INTO v_id;
  IF v_id IS NULL THEN
    RAISE EXCEPTION 'FAIL: server insert returned no id';
  END IF;

  -- 2. Constraints
  BEGIN
    INSERT INTO public.interviews (interview_date, person_name, segment, would_try)
    VALUES (CURRENT_DATE, 'Bad', 'tourist', 'yes');
    RAISE EXCEPTION 'FAIL: bad segment accepted';
  EXCEPTION WHEN check_violation THEN NULL;
  END;

  BEGIN
    INSERT INTO public.interviews (interview_date, person_name, segment, would_try, price_reaction)
    VALUES (CURRENT_DATE, 'Bad', 'seller', 'yes', 'love_it');
    RAISE EXCEPTION 'FAIL: bad price_reaction accepted';
  EXCEPTION WHEN check_violation THEN NULL;
  END;

  BEGIN
    INSERT INTO public.interviews (interview_date, person_name, segment, would_try, pain_points)
    VALUES (CURRENT_DATE, 'Bad', 'seller', 'yes', ARRAY['a', 'b', 'c', 'd']);
    RAISE EXCEPTION 'FAIL: 4 pain points accepted';
  EXCEPTION WHEN check_violation THEN NULL;
  END;

  -- 3. Browsers cannot read or write
  EXECUTE 'SET ROLE anon';
  v_ok := false;
  BEGIN
    SELECT count(*) INTO v_count FROM public.interviews;
  EXCEPTION WHEN insufficient_privilege THEN v_ok := true;
  END;
  IF NOT v_ok THEN RAISE EXCEPTION 'FAIL: anon can read interviews'; END IF;

  v_ok := false;
  BEGIN
    INSERT INTO public.interviews (interview_date, person_name, segment, would_try)
    VALUES (CURRENT_DATE, 'Anon', 'seller', 'yes');
  EXCEPTION WHEN insufficient_privilege THEN v_ok := true;
  END;
  IF NOT v_ok THEN RAISE EXCEPTION 'FAIL: anon can insert interviews'; END IF;
  EXECUTE 'RESET ROLE';

  EXECUTE 'SET ROLE authenticated';
  v_ok := false;
  BEGIN
    SELECT count(*) INTO v_count FROM public.interviews;
  EXCEPTION WHEN insufficient_privilege THEN v_ok := true;
  END;
  IF NOT v_ok THEN RAISE EXCEPTION 'FAIL: authenticated can read interviews'; END IF;

  v_ok := false;
  BEGIN
    DELETE FROM public.interviews WHERE id = v_id;
  EXCEPTION WHEN insufficient_privilege THEN v_ok := true;
  END;
  IF NOT v_ok THEN RAISE EXCEPTION 'FAIL: authenticated can delete interviews'; END IF;
  EXECUTE 'RESET ROLE';

  RAISE NOTICE 'All interviews checks PASSED!';
END $$;

ROLLBACK;
