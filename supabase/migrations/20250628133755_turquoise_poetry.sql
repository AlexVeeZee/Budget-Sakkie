/*
  # Fix Duplicate Policy Issue

  1. Changes
     - Safely drop and recreate the "Users can view own family membership" policy
     - Add proper error handling with DO blocks
     - Ensure idempotent execution (can be run multiple times safely)

  2. Security
     - Maintain the same security rules as the original policy
     - Ensure no data access is compromised during migration
*/

-- Safely drop the existing policy if it exists
DO $$
BEGIN
  -- Check if the policy exists before attempting to drop it
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'family_members' 
    AND policyname = 'Users can view own family membership'
  ) THEN
    DROP POLICY "Users can view own family membership" ON public.family_members;
    RAISE NOTICE 'Dropped existing policy "Users can view own family membership"';
  ELSE
    RAISE NOTICE 'Policy "Users can view own family membership" does not exist, skipping drop';
  END IF;
END $$;

-- Create the policy with the correct definition
DO $$
BEGIN
  -- Create the policy
  CREATE POLICY "Users can view own family membership"
    ON public.family_members
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());
  
  RAISE NOTICE 'Successfully created policy "Users can view own family membership"';
EXCEPTION
  WHEN duplicate_object THEN
    RAISE NOTICE 'Policy "Users can view own family membership" already exists';
END $$;

-- Verify the policy exists with the correct definition
DO $$
DECLARE
  policy_exists boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'family_members' 
    AND policyname = 'Users can view own family membership'
  ) INTO policy_exists;
  
  IF policy_exists THEN
    RAISE NOTICE 'Verification successful: Policy "Users can view own family membership" exists';
  ELSE
    RAISE WARNING 'Verification failed: Policy "Users can view own family membership" does not exist';
  END IF;
END $$;