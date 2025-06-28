/*
  # Fix is_family_admin function implementation
  
  1. Changes
     - Creates a new helper function with improved implementation
     - Creates a wrapper function that maintains the original function signature
     - Adds text parameter overloaded version for flexibility
  
  2. Security
     - All functions use SECURITY DEFINER
     - Proper search_path setting to prevent search path attacks
*/

-- Create a new helper function with a different name
CREATE OR REPLACE FUNCTION check_family_admin_status(
  family_id uuid,
  user_id uuid
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
    WHERE fr.family_id = family_id
    AND fm.email = (SELECT email FROM auth.users WHERE id = user_id)
    AND fr.is_admin = true
    AND fr.status = 'active'
  ) INTO v_is_admin;
  
  RETURN COALESCE(v_is_admin, false);
END;
$$;

-- Add a comment to the helper function
COMMENT ON FUNCTION check_family_admin_status(uuid, uuid) IS 'Helper function that checks if a user is an admin of a specific family';

-- Create a wrapper function that maintains the original function signature
CREATE OR REPLACE FUNCTION is_family_admin(
  family_id uuid,
  user_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Call the helper function
  RETURN check_family_admin_status(family_id, user_id);
END;
$$;

-- Add a comment to the wrapper function
COMMENT ON FUNCTION is_family_admin(uuid, uuid) IS 'Checks if a user is an admin of a specific family';

-- Create an overloaded version that accepts text parameters
CREATE OR REPLACE FUNCTION is_family_admin(
  family_id text,
  user_id text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Convert text parameters to UUID and call the helper function
  RETURN check_family_admin_status(
    family_id::uuid,
    user_id::uuid
  );
EXCEPTION
  WHEN invalid_text_representation THEN
    RETURN false;
END;
$$;

-- Add a comment to the overloaded function
COMMENT ON FUNCTION is_family_admin(text, text) IS 'Text parameter version that checks if a user is an admin of a specific family';