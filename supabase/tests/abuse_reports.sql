-- =============================================================================
-- Hela Hop Fintech — Report Abuse Test (Task 1.9B)
-- File: supabase/tests/abuse_reports.sql
--
-- Run AFTER migration 20261112000001_abuse_reports.
--
-- How to run:
--   1. Supabase Dashboard -> SQL Editor -> new query.
--   2. Paste this whole file and click "Run".
--   3. The Messages tab should show "All abuse_reports checks PASSED!"
--   Everything runs in one transaction that ends with ROLLBACK.
--
-- Checks:
--   - An anonymous visitor can report a payment link (by slug) and an
--     invoice (by code); the report is attached to the right id
--   - Unknown slug/code -> not_found; bad type -> invalid_target
--   - Reason under 10 or over 500 chars -> invalid_reason; long name ->
--     invalid_name
--   - Visitors and sellers cannot read, insert or update abuse_reports
--     directly (only through the function)
--   - More than 20 reports a day on one target are not stored
-- =============================================================================

BEGIN;

DO $$
DECLARE
  v_seller_id  UUID := gen_random_uuid();
  v_email      TEXT := 'abuse_' || replace(gen_random_uuid()::text, '-', '') || '@example.com';
  v_link_id    UUID := gen_random_uuid();
  v_slug       TEXT := 'abuse-test-' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 12);
  v_invoice_id UUID := gen_random_uuid();
  v_code       TEXT := 'AbuseTest_' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 16);
  v_res        JSONB;
  v_count      INTEGER;
  i            INTEGER;
BEGIN
  -- ===========================================================================
  -- 1. SETUP (as postgres)
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

  INSERT INTO public.payment_links (id, slug, user_id, title, currency)
  VALUES (v_link_id, v_slug, v_seller_id, 'Abuse test link', 'KES');

  INSERT INTO public.invoices (id, user_id, code, customer_name, customer_phone, total_minor)
  VALUES (v_invoice_id, v_seller_id, v_code, 'Test Customer', '+254700000002', 10000);

  -- ===========================================================================
  -- 2. Anonymous visitor reports a link and an invoice
  -- ===========================================================================
  EXECUTE 'SET ROLE anon';
  PERFORM set_config('request.jwt.claims', '{"role":"anon"}', true);

  v_res := public.submit_abuse_report(v_slug, 'link', 'Jane', 'This seller never delivered my order.');
  IF NOT (v_res->>'ok')::boolean THEN
    RAISE EXCEPTION '[FAIL] Link report rejected: %', v_res;
  END IF;

  v_res := public.submit_abuse_report(v_code, 'invoice', NULL, 'I do not know this seller at all.');
  IF NOT (v_res->>'ok')::boolean THEN
    RAISE EXCEPTION '[FAIL] Invoice report rejected: %', v_res;
  END IF;

  -- ===========================================================================
  -- 3. Validation errors
  -- ===========================================================================
  v_res := public.submit_abuse_report('no-such-slug-xyz', 'link', NULL, 'Ten chars or more here.');
  IF v_res->>'error' IS DISTINCT FROM 'not_found' THEN
    RAISE EXCEPTION '[FAIL] Unknown slug should be not_found, got %', v_res;
  END IF;

  v_res := public.submit_abuse_report(v_slug, 'profile', NULL, 'Ten chars or more here.');
  IF v_res->>'error' IS DISTINCT FROM 'invalid_target' THEN
    RAISE EXCEPTION '[FAIL] Bad type should be invalid_target, got %', v_res;
  END IF;

  v_res := public.submit_abuse_report(v_slug, 'link', NULL, 'short');
  IF v_res->>'error' IS DISTINCT FROM 'invalid_reason' THEN
    RAISE EXCEPTION '[FAIL] Short reason should be invalid_reason, got %', v_res;
  END IF;

  v_res := public.submit_abuse_report(v_slug, 'link', NULL, repeat('x', 501));
  IF v_res->>'error' IS DISTINCT FROM 'invalid_reason' THEN
    RAISE EXCEPTION '[FAIL] Long reason should be invalid_reason, got %', v_res;
  END IF;

  v_res := public.submit_abuse_report(v_slug, 'link', repeat('n', 101), 'Ten chars or more here.');
  IF v_res->>'error' IS DISTINCT FROM 'invalid_name' THEN
    RAISE EXCEPTION '[FAIL] Long name should be invalid_name, got %', v_res;
  END IF;

  -- ===========================================================================
  -- 4. No direct table access for anon
  -- ===========================================================================
  BEGIN
    PERFORM 1 FROM public.abuse_reports LIMIT 1;
    RAISE EXCEPTION '[FAIL] anon could SELECT from abuse_reports';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;

  BEGIN
    INSERT INTO public.abuse_reports (target_type, target_id, reason)
    VALUES ('link', v_link_id, 'Direct insert attempt');
    RAISE EXCEPTION '[FAIL] anon could INSERT into abuse_reports';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;

  -- ... nor for a signed-in seller
  EXECUTE 'RESET ROLE';
  EXECUTE 'SET ROLE authenticated';
  PERFORM set_config('request.jwt.claims',
    jsonb_build_object('sub', v_seller_id::text, 'role', 'authenticated')::text, true);

  BEGIN
    PERFORM 1 FROM public.abuse_reports LIMIT 1;
    RAISE EXCEPTION '[FAIL] authenticated could SELECT from abuse_reports';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;

  BEGIN
    UPDATE public.abuse_reports SET status = 'reviewed';
    RAISE EXCEPTION '[FAIL] authenticated could UPDATE abuse_reports';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;

  -- ===========================================================================
  -- 5. Check stored rows (as postgres)
  -- ===========================================================================
  EXECUTE 'RESET ROLE';

  SELECT count(*) INTO v_count FROM public.abuse_reports
  WHERE target_type = 'link' AND target_id = v_link_id
    AND reporter_name = 'Jane' AND status = 'open';
  IF v_count <> 1 THEN
    RAISE EXCEPTION '[FAIL] Expected 1 open link report by Jane, found %', v_count;
  END IF;

  SELECT count(*) INTO v_count FROM public.abuse_reports
  WHERE target_type = 'invoice' AND target_id = v_invoice_id AND reporter_name IS NULL;
  IF v_count <> 1 THEN
    RAISE EXCEPTION '[FAIL] Expected 1 anonymous invoice report, found %', v_count;
  END IF;

  -- ===========================================================================
  -- 6. Flood cap: 20 per target per day are stored, the rest are not
  -- ===========================================================================
  FOR i IN 1..25 LOOP
    v_res := public.submit_abuse_report(v_slug, 'link', NULL, 'Flood test report number ' || i);
    IF NOT (v_res->>'ok')::boolean THEN
      RAISE EXCEPTION '[FAIL] Flood report % returned %', i, v_res;
    END IF;
  END LOOP;

  SELECT count(*) INTO v_count FROM public.abuse_reports
  WHERE target_type = 'link' AND target_id = v_link_id;
  IF v_count <> 20 THEN
    RAISE EXCEPTION '[FAIL] Flood cap: expected 20 stored link reports, found %', v_count;
  END IF;

  RAISE NOTICE '==================================================';
  RAISE NOTICE 'All abuse_reports checks PASSED!';
  RAISE NOTICE 'Transaction will now ROLLBACK cleanly.';
  RAISE NOTICE '==================================================';
END $$;

ROLLBACK;
