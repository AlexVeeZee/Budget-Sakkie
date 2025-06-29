/*
  # Fix is_family_admin Function

  1. Problem
    - Error: 42P13: cannot change name of input parameter "check_family_id"
    - Function needs to be properly dropped before recreation
    - Parameter naming conflicts causing issues

  2. Solution
    - Explicitly drop all versions of the function
    - Recreate with clean parameter names
    - Use SECURITY DEFINER and proper search_path
    - Avoid naming collisions
*/

-- First, drop all versions of the function
DROP FUNCTION IF EXISTS is_family_admin(uuid, uuid);
DROP FUNCTION IF EXISTS is_family_admin(text, text);
DROP FUNCTION IF EXISTS is_family_admin(uuid, text);
DROP FUNCTION IF EXISTS is_family_admin(text, uuid);
DROP FUNCTION IF EXISTS check_user_is_family_admin(uuid, uuid);

-- Create a clean version with proper parameter names
CREATE OR REPLACE FUNCTION is_family_admin(
  p_family_id uuid,
  p_user_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_is_admin boolean;
BEGIN
  -- Check if the user is an admin of the specified family
  SELECT EXISTS (
    SELECT 1
    FROM family_relationships fr
    JOIN family_members fm ON fr.member_id = fm.member_id
    WHERE fr.family_id = p_family_id
    AND fm.email = (SELECT email FROM auth.users WHERE id = p_user_id)
    AND fr.is_admin = true
    AND fr.status = 'active'
  ) INTO v_is_admin;
  
  RETURN COALESCE(v_is_admin, false);
END;
$$;

-- Add a comment to the function
COMMENT ON FUNCTION is_family_admin(uuid, uuid) IS 'Checks if a user is an admin of a specific family';

-- Update any RLS policies that might be using this function
DO $$
BEGIN
  -- Drop and recreate policies that use is_family_admin
  -- Family relationships policies
  DROP POLICY IF EXISTS "Family admins can update member roles" ON family_relationships;
  DROP POLICY IF EXISTS "Family admins can remove members" ON family_relationships;
  
  -- Recreate policies with the fixed function
  CREATE POLICY "Family admins can update member roles"
    ON family_relationships
    FOR UPDATE
    TO authenticated
    USING (
      user_id != auth.uid() AND 
      is_family_admin(family_id, auth.uid())
    )
    WITH CHECK (
      user_id != auth.uid() AND 
      is_family_admin(family_id, auth.uid())
    );

  CREATE POLICY "Family admins can remove members"
    ON family_relationships
    FOR DELETE
    TO authenticated
    USING (
      user_id != auth.uid() AND 
      is_family_admin(family_id, auth.uid())
    );
END $$;