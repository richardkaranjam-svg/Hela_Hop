-- =============================================================================
-- Hela Hop Fintech — Claims Flow Integration Test
-- File: supabase/tests/claims_flow.sql
--
-- How to run:
--   1. Open Supabase Dashboard -> SQL Editor.
--   2. Paste this entire file into the SQL Editor.
--   3. Click "Run" (or press Cmd+Enter / Ctrl+Enter).
--   4. Verify the output displays "All claims_flow integration test checks PASSED!"
--   The transaction automatically ends with ROLLBACK so no test rows persist.
--
-- Checks verified:
--   - Anonymous user cannot select from invoices, receipts, profiles, or payout_methods
--   - get_public_invoice returns a masked phone number, never the real unmasked phone
--   - submit_payment_claim works on an unpaid invoice, rejects duplicate M-PESA code,
--     and rejects claims against cancelled invoices
--   - confirm_payment_claim as the seller creates exactly one receipt, marks the invoice
--     status as 'paid', and fails a second time with 'not_pending'
--   - Another seller cannot confirm someone else's claim (fails with 'not_found')
-- =============================================================================

BEGIN;

DO $$
DECLARE
  v_seller1_id UUID := gen_random_uuid();
  v_seller2_id UUID := gen_random_uuid();
  v_payout_id  UUID := gen_random_uuid();
  v_invoice_unpaid_id UUID := gen_random_uuid();
  v_invoice_cancelled_id UUID := gen_random_uuid();
  v_code_unpaid TEXT := 'inv-' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 12);
  v_code_cancelled TEXT := 'inv-' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 12);
  v_mpesa_code TEXT := 'TEST' || substr(upper(replace(gen_random_uuid()::text, '-', '')), 1, 6);
  v_claim_id UUID;
  v_res JSONB;
  v_count INTEGER;
  v_status TEXT;
BEGIN
  -- ===========================================================================
  -- 1. SETUP FIXTURES (Running as session user: postgres)
  -- ===========================================================================

  -- Insert mock auth users for Seller 1 and Seller 2
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at
  ) VALUES
    ('00000000-0000-0000-0000-000000000000', v_seller1_id, 'authenticated', 'authenticated',
     'seller1_' || v_seller1_id || '@example.com', '', now(),
     '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, now(), now()),
    ('00000000-0000-0000-0000-000000000000', v_seller2_id, 'authenticated', 'authenticated',
     'seller2_' || v_seller2_id || '@example.com', '', now(),
     '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, now(), now());

  -- Ensure profiles exist with name and phone
  INSERT INTO public.profiles (id, email, username, full_name, phone)
  VALUES
    (v_seller1_id, 'seller1_' || v_seller1_id || '@example.com', 'seller1_' || substr(v_seller1_id::text, 1, 8), 'Seller One', '+254711111111'),
    (v_seller2_id, 'seller2_' || v_seller2_id || '@example.com', 'seller2_' || substr(v_seller2_id::text, 1, 8), 'Seller Two', '+254722222222')
  ON CONFLICT (id) DO UPDATE
    SET full_name = EXCLUDED.full_name,
        phone = EXCLUDED.phone;

  -- Create payout method for Seller 1
  INSERT INTO public.payout_methods (id, user_id, type, number, account_ref, label, is_default)
  VALUES (v_payout_id, v_seller1_id, 'till', '888123', NULL, 'Main Till', true);

  -- Create unpaid invoice for Seller 1 (code >= 10 chars)
  INSERT INTO public.invoices (
    id, user_id, code, customer_name, customer_phone, items,
    total_minor, currency, status, payout_method_id
  ) VALUES (
    v_invoice_unpaid_id,
    v_seller1_id,
    v_code_unpaid,
    'Jane Customer',
    '+254712345678',
    '[{"description":"Consultation Services","quantity":1,"unit_price_minor":150000}]'::jsonb,
    150000,
    'KES',
    'unpaid',
    v_payout_id
  );

  -- Create cancelled invoice for Seller 1
  INSERT INTO public.invoices (
    id, user_id, code, customer_name, customer_phone, items,
    total_minor, currency, status, payout_method_id
  ) VALUES (
    v_invoice_cancelled_id,
    v_seller1_id,
    v_code_cancelled,
    'John Customer',
    '+254798765432',
    '[{"description":"Cancelled Order","quantity":1,"unit_price_minor":250000}]'::jsonb,
    250000,
    'KES',
    'cancelled',
    v_payout_id
  );

  -- ===========================================================================
  -- 2. CHECK: Anonymous user cannot select from sensitive tables
  -- ===========================================================================
  EXECUTE 'SET ROLE anon';
  PERFORM set_config('request.jwt.claims', '{"role":"anon"}', true);

  EXECUTE 'SELECT count(*) FROM public.invoices' INTO v_count;
  IF v_count > 0 THEN
    RAISE EXCEPTION '[FAIL] Anonymous user was able to read public.invoices (found % rows)', v_count;
  END IF;

  EXECUTE 'SELECT count(*) FROM public.receipts' INTO v_count;
  IF v_count > 0 THEN
    RAISE EXCEPTION '[FAIL] Anonymous user was able to read public.receipts (found % rows)', v_count;
  END IF;

  EXECUTE 'SELECT count(*) FROM public.profiles' INTO v_count;
  IF v_count > 0 THEN
    RAISE EXCEPTION '[FAIL] Anonymous user was able to read public.profiles (found % rows)', v_count;
  END IF;

  EXECUTE 'SELECT count(*) FROM public.payout_methods' INTO v_count;
  IF v_count > 0 THEN
    RAISE EXCEPTION '[FAIL] Anonymous user was able to read public.payout_methods (found % rows)', v_count;
  END IF;

  RAISE NOTICE '[PASS] Check 1: Anonymous user cannot select from invoices, receipts, profiles, or payout_methods';

  -- ===========================================================================
  -- 3. CHECK: get_public_invoice returns masked phone, not the real one
  -- ===========================================================================
  -- Anonymous visitors read invoices via the get_public_invoice RPC
  v_res := public.get_public_invoice(v_code_unpaid);
  IF v_res IS NULL THEN
    RAISE EXCEPTION '[FAIL] get_public_invoice returned NULL for code %', v_code_unpaid;
  END IF;

  IF v_res ? 'customer_phone' THEN
    RAISE EXCEPTION '[FAIL] get_public_invoice leaked raw customer_phone key';
  END IF;

  IF v_res->>'customer_phone_masked' IS NULL THEN
    RAISE EXCEPTION '[FAIL] get_public_invoice missing customer_phone_masked key';
  END IF;

  IF v_res->>'customer_phone_masked' = '+254712345678' THEN
    RAISE EXCEPTION '[FAIL] get_public_invoice returned plaintext phone instead of masked';
  END IF;

  IF v_res->>'customer_phone_masked' <> '+254 712 *** 678' THEN
    RAISE EXCEPTION '[FAIL] get_public_invoice returned unexpected phone mask: % (expected +254 712 *** 678)', v_res->>'customer_phone_masked';
  END IF;

  RAISE NOTICE '[PASS] Check 2: get_public_invoice returns masked phone, not plaintext';

  -- ===========================================================================
  -- 4. CHECK: submit_payment_claim flow
  --    - Works on unpaid invoice
  --    - Rejects duplicate M-PESA code
  --    - Rejects claim against cancelled invoice
  -- ===========================================================================
  v_res := public.submit_payment_claim(
    NULL,
    v_code_unpaid,
    'Jane Payer',
    '+254712345678',
    v_mpesa_code,
    NULL
  );

  IF (v_res->>'ok')::boolean IS NOT TRUE THEN
    RAISE EXCEPTION '[FAIL] submit_payment_claim failed on unpaid invoice: %', v_res;
  END IF;

  v_claim_id := (v_res->>'claim_id')::UUID;
  IF v_claim_id IS NULL THEN
    RAISE EXCEPTION '[FAIL] submit_payment_claim did not return claim_id: %', v_res;
  END IF;

  -- Confirm invoice status is updated to 'claimed'
  EXECUTE 'RESET ROLE';
  SELECT status INTO v_status FROM public.invoices WHERE id = v_invoice_unpaid_id;
  IF v_status <> 'claimed' THEN
    RAISE EXCEPTION '[FAIL] Expected invoice status to be claimed after claim submission, got %', v_status;
  END IF;

  -- Switch back to anon for duplicate and cancelled submission tests
  EXECUTE 'SET ROLE anon';
  PERFORM set_config('request.jwt.claims', '{"role":"anon"}', true);

  -- Duplicate M-PESA code test
  v_res := public.submit_payment_claim(
    NULL,
    v_code_unpaid,
    'Another Payer',
    '+254799999999',
    v_mpesa_code,
    NULL
  );

  IF (v_res->>'ok')::boolean IS NOT FALSE OR v_res->>'error' <> 'duplicate_code' THEN
    RAISE EXCEPTION '[FAIL] Expected duplicate_code error on duplicate M-PESA code submission, got %', v_res;
  END IF;

  -- Cancelled invoice test
  v_res := public.submit_payment_claim(
    NULL,
    v_code_cancelled,
    'John Payer',
    '+254798765432',
    'UNIQUE9999',
    NULL
  );

  IF (v_res->>'ok')::boolean IS NOT FALSE OR v_res->>'error' <> 'cancelled' THEN
    RAISE EXCEPTION '[FAIL] Expected cancelled error when submitting against cancelled invoice, got %', v_res;
  END IF;

  RAISE NOTICE '[PASS] Check 3: submit_payment_claim succeeded on unpaid invoice, rejected duplicate code, and rejected cancelled invoice';

  -- ===========================================================================
  -- 5. CHECK: Another seller cannot confirm someone else's claim (not_found)
  -- ===========================================================================
  EXECUTE 'RESET ROLE';
  EXECUTE 'SET ROLE authenticated';
  PERFORM set_config('request.jwt.claims', jsonb_build_object('sub', v_seller2_id::text, 'role', 'authenticated')::text, true);

  v_res := public.confirm_payment_claim(v_claim_id);
  IF (v_res->>'ok')::boolean IS NOT FALSE OR v_res->>'error' <> 'not_found' THEN
    RAISE EXCEPTION '[FAIL] Expected not_found when Seller 2 attempts to confirm Seller 1 claim, got %', v_res;
  END IF;

  RAISE NOTICE '[PASS] Check 4: Another seller cannot confirm someone else''s claim (rejected with not_found)';

  -- ===========================================================================
  -- 6. CHECK: confirm_payment_claim as the seller creates exactly one receipt,
  --    sets invoice to paid, and fails a second time (not_pending)
  -- ===========================================================================
  EXECUTE 'RESET ROLE';
  EXECUTE 'SET ROLE authenticated';
  PERFORM set_config('request.jwt.claims', jsonb_build_object('sub', v_seller1_id::text, 'role', 'authenticated')::text, true);

  v_res := public.confirm_payment_claim(v_claim_id);
  IF (v_res->>'ok')::boolean IS NOT TRUE THEN
    RAISE EXCEPTION '[FAIL] confirm_payment_claim failed for seller: %', v_res;
  END IF;

  -- Exactly one receipt created
  EXECUTE 'SELECT count(*) FROM public.receipts WHERE claim_id = $1' INTO v_count USING v_claim_id;
  IF v_count <> 1 THEN
    RAISE EXCEPTION '[FAIL] Expected exactly 1 receipt created for claim %, found %', v_claim_id, v_count;
  END IF;

  -- Invoice status is 'paid'
  EXECUTE 'SELECT status FROM public.invoices WHERE id = $1' INTO v_status USING v_invoice_unpaid_id;
  IF v_status <> 'paid' THEN
    RAISE EXCEPTION '[FAIL] Expected invoice status to be paid, got %', v_status;
  END IF;

  -- Confirming a second time fails with 'not_pending'
  v_res := public.confirm_payment_claim(v_claim_id);
  IF (v_res->>'ok')::boolean IS NOT FALSE OR v_res->>'error' <> 'not_pending' THEN
    RAISE EXCEPTION '[FAIL] Expected second confirmation attempt to fail with not_pending, got %', v_res;
  END IF;

  RAISE NOTICE '[PASS] Check 5: confirm_payment_claim created exactly 1 receipt, updated invoice to paid, and prevented double confirmation';

  -- ===========================================================================
  -- 7. CLEANUP ROLE & SUCCESS SUMMARY
  -- ===========================================================================
  EXECUTE 'RESET ROLE';
  PERFORM set_config('request.jwt.claims', '', true);

  RAISE NOTICE '==================================================';
  RAISE NOTICE 'All claims_flow integration test checks PASSED!';
  RAISE NOTICE 'Transaction will now ROLLBACK cleanly.';
  RAISE NOTICE '==================================================';
END $$;

ROLLBACK;
