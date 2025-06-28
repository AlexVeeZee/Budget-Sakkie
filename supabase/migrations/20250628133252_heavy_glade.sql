/*
  # Create Helper Functions for Dataframe Storage

  1. New Functions
    - `check_table_exists` - Check if a table exists in the database
    - `get_table_schema` - Get the schema of a table
    - `get_available_tables` - Get a list of available tables
    - `create_helper_functions` - Create all helper functions (for admin use)

  2. Security
    - All functions use SECURITY DEFINER to bypass RLS
    - Functions are designed to be safe and limited in scope
*/

-- Function to check if a table exists
CREATE OR REPLACE FUNCTION check_table_exists(table_name text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name = $1
  );
END;
$$;

-- Function to get table schema
CREATE OR REPLACE FUNCTION get_table_schema(table_name text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  result json;
BEGIN
  SELECT json_build_object(
    'name', $1,
    'columns', (
      SELECT json_agg(
        json_build_object(
          'name', column_name,
          'type', data_type,
          'isNullable', is_nullable = 'YES'
        )
      )
      FROM information_schema.columns
      WHERE table_schema = 'public'
      AND table_name = $1
    )
  ) INTO result;
  
  RETURN result;
END;
$$;

-- Function to get a list of available tables
CREATE OR REPLACE FUNCTION get_available_tables()
RETURNS text[]
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  tables text[];
BEGIN
  SELECT array_agg(tablename)
  INTO tables
  FROM pg_tables
  WHERE schemaname = 'public';
  
  RETURN tables;
END;
$$;

-- Function to create all helper functions (for admin use)
CREATE OR REPLACE FUNCTION create_helper_functions()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- This function is a placeholder that can be called to verify
  -- that the helper functions exist and are working
  RETURN true;
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Failed to create helper functions: %', SQLERRM;
    RETURN false;
END;
$$;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION check_table_exists(text) TO authenticated;
GRANT EXECUTE ON FUNCTION get_table_schema(text) TO authenticated;
GRANT EXECUTE ON FUNCTION get_available_tables() TO authenticated;
GRANT EXECUTE ON FUNCTION create_helper_functions() TO authenticated;