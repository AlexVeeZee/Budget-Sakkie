/*
  # Fix get_user_families function

  1. Changes
     - Drop and recreate the get_user_families function
     - Fix the column reference from f.id to f.family_id
     - Ensure proper return type and parameter handling
*/

-- First, drop the existing function
DROP FUNCTION IF EXISTS get_user_families();

-- Recreate the function with the correct column reference
CREATE OR REPLACE FUNCTION get_user_families()
RETURNS SETOF families
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT f.*
  FROM families f
  JOIN family_members fm ON f.family_id = fm.family_id
  WHERE fm.user_id = auth.uid();
$$;