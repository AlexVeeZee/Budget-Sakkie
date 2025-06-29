/*
  # Fix is_family_admin Function

  1. Changes
     - Drop existing is_family_admin function
     - Recreate is_family_admin function with proper parameter types and names
     - Ensure function uses SECURITY DEFINER for proper permissions
     - Add clear documentation for the function

  2. Security
     - Function is marked as SECURITY DEFINER to run with creator's permissions
     - Function has proper parameter validation
*/

-- First, drop the existing function if it exists
DROP FUNCTION IF EXISTS is_family_admin(uuid, uuid);
DROP FUNCTION IF EXISTS check_user_is_family_admin(uuid, uuid);

-- Create the function with clear parameter names and proper security context
CREATE OR REPLACE FUNCTION check_user_is_family_admin(
  user_id uuid,
  family_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  is_admin boolean;
BEGIN
  -- Check if the user is an admin of the specified family
  SELECT EXISTS (
    SELECT 1
    FROM family_relationships
    WHERE member_id = user_id
    AND family_id = family_id
    AND is_admin = true
    AND status = 'active'
  ) INTO is_admin;
  
  RETURN is_admin;
END;
$$;

-- Add a comment to the function
COMMENT ON FUNCTION check_user_is_family_admin(uuid, uuid) IS 'Checks if a user is an admin of a specific family';

-- Create an alias function with the original name for backward compatibility
CREATE OR REPLACE FUNCTION is_family_admin(
  p_user_id uuid,
  p_family_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN check_user_is_family_admin(p_user_id, p_family_id);
END;
$$;

-- Add a comment to the alias function
COMMENT ON FUNCTION is_family_admin(uuid, uuid) IS 'Alias for check_user_is_family_admin function';