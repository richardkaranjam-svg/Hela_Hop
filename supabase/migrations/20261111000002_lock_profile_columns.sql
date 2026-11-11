-- =============================================================================
-- Hela Hop Fintech — Lock down profile columns (Task 1.9, part 3)
-- Migration : 20261111000002_lock_profile_columns
-- Description:
--   The "profiles: owner update" policy lets a seller update THEIR OWN row,
--   but it did not limit WHICH columns. From the browser (anon key + their
--   session) a seller could set their own kyc_tier, kakitu_score_points,
--   email or payout_method.
--
--   Fix: column-level privileges. Sellers may update only full_name, phone and
--   username. updated_at is still set automatically by the profiles_updated_at
--   trigger (triggers are not limited by column grants).
--
--   Profiles are created only by the handle_new_user trigger (SECURITY
--   DEFINER) on sign-up, so browsers do not need INSERT either.
-- =============================================================================

-- 1. UPDATE: only full_name, phone, username --------------------------------
REVOKE UPDATE ON public.profiles FROM PUBLIC, anon, authenticated;
GRANT UPDATE (full_name, phone, username) ON public.profiles TO authenticated;

-- 2. INSERT: not needed from the browser ------------------------------------
-- The old "profiles: service insert" policy let a signed-in user insert a row
-- for their own id with any kyc_tier / score. The sign-up trigger already
-- creates the row, so remove both the policy and the privilege.
DROP POLICY IF EXISTS "profiles: service insert" ON public.profiles;
REVOKE INSERT ON public.profiles FROM PUBLIC, anon, authenticated;

-- 3. DELETE: profiles are removed only when the auth user is deleted (CASCADE).
REVOKE DELETE ON public.profiles FROM PUBLIC, anon, authenticated;

NOTIFY pgrst, 'reload schema';
