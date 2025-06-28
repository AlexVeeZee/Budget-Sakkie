/*
  # Fix is_family_admin function

  1. Changes
     - Creates a new version of the is_family_admin function with improved implementation
     - Preserves existing function dependencies
     - Updates function to properly handle user authentication
     - Adds security definer and search path settings
*/

-- Create an improved version of the function with a different name first
CREATE OR REPLACE FUNCTION is_family_admin_v2(
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

-- Add a comment to the new function
COMMENT ON FUNCTION is_family_admin_v2(uuid, uuid) IS 'Improved version that checks if a user is an admin of a specific family';

-- Now update the original function to use the new implementation
CREATE OR REPLACE FUNCTION is_family_admin(
  p_family_id uuid,
  p_user_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Call the new implementation
  RETURN is_family_admin_v2(p_family_id, p_user_id);
END;
$$;

-- Add a comment to the updated function
COMMENT ON FUNCTION is_family_admin(uuid, uuid) IS 'Checks if a user is an admin of a specific family';

-- Create any additional overloaded versions if needed
CREATE OR REPLACE FUNCTION is_family_admin(
  p_family_id text,
  p_user_id text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Convert text parameters to UUID and call the main function
  RETURN is_family_admin_v2(
    p_family_id::uuid,
    p_user_id::uuid
  );
EXCEPTION
  WHEN invalid_text_representation THEN
    RETURN false;
END;
$$;

-- Add a comment to the overloaded function
COMMENT ON FUNCTION is_family_admin(text, text) IS 'Text parameter version that checks if a user is an admin of a specific family';