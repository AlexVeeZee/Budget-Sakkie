/*
  # Fix get_user_families Function

  1. Problem
    - Error: Could not find the function public.get_user_families without parameters
    - The function exists but is being called incorrectly or has parameter issues

  2. Solution
    - Drop the existing function
    - Create a new version that properly handles parameters
    - Ensure it works with the current schema
*/

-- Drop the existing function
DROP FUNCTION IF EXISTS get_user_families();

-- Create a new version of the function
CREATE OR REPLACE FUNCTION get_user_families()
RETURNS TABLE (
  family_id UUID,
  family_name TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
) AS $$
DECLARE
  v_user_id UUID;
  v_user_email TEXT;
BEGIN
  -- Get current user
  v_user_id := auth.uid();
  v_user_email := auth.email();
  
  IF v_user_id IS NULL THEN
    RETURN;
  END IF;
  
  -- Return families where user is a member
  RETURN QUERY
    SELECT f.*
    FROM families f
    JOIN family_members fm ON f.id = fm.family_id
    WHERE fm.user_id = v_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add a comment to the function
COMMENT ON FUNCTION get_user_families() IS 'Returns all families that the current user belongs to';

-- Create an alternative version that takes a user_id parameter for flexibility
CREATE OR REPLACE FUNCTION get_user_families(p_user_id UUID)
RETURNS TABLE (
  family_id UUID,
  family_name TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
) AS $$
BEGIN
  -- Return families where specified user is a member
  RETURN QUERY
    SELECT f.*
    FROM families f
    JOIN family_members fm ON f.id = fm.family_id
    WHERE fm.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add a comment to the function
COMMENT ON FUNCTION get_user_families(UUID) IS 'Returns all families that the specified user belongs to';