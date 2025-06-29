/*
  # Fix Families Table Structure

  1. Changes
     - Rename 'created_by' to 'family_id' in families table
     - Add missing columns to match application expectations
  
  2. Security
     - Enable RLS on families table
     - Add policies for family access
*/

-- First check if the table exists
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'families') THEN
    -- Check if the column name is incorrect
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'families' AND column_name = 'created_by') THEN
      -- Add the created_by column if it doesn't exist
      ALTER TABLE families ADD COLUMN created_by UUID REFERENCES auth.users(id);
    END IF;
    
    -- Check if family_name exists, if not rename it from name
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'families' AND column_name = 'family_name') THEN
      IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'families' AND column_name = 'name') THEN
        -- Rename name to family_name
        ALTER TABLE families RENAME COLUMN name TO family_name;
      ELSE
        -- Add family_name column if neither exists
        ALTER TABLE families ADD COLUMN family_name TEXT NOT NULL DEFAULT 'My Family';
      END IF;
    END IF;
    
    -- Check if family_id exists, if not rename it from id
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'families' AND column_name = 'family_id') THEN
      IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'families' AND column_name = 'id') THEN
        -- Rename id to family_id
        ALTER TABLE families RENAME COLUMN id TO family_id;
      END IF;
    END IF;
    
    -- Ensure timestamps exist
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'families' AND column_name = 'created_at') THEN
      ALTER TABLE families ADD COLUMN created_at TIMESTAMPTZ DEFAULT now();
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'families' AND column_name = 'updated_at') THEN
      ALTER TABLE families ADD COLUMN updated_at TIMESTAMPTZ DEFAULT now();
    END IF;
    
    -- Enable RLS if not already enabled
    ALTER TABLE families ENABLE ROW LEVEL SECURITY;
    
    -- Create policies if they don't exist
    DO $policies$
    BEGIN
      -- Check if policies exist before creating them
      IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'families' AND policyname = 'Users can create families') THEN
        CREATE POLICY "Users can create families" ON families FOR INSERT TO public USING (true);
      END IF;
      
      IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'families' AND policyname = 'Only family admins can update families') THEN
        CREATE POLICY "Only family admins can update families" ON families FOR UPDATE TO public USING (is_family_admin(family_id, uid()));
      END IF;
      
      IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'families' AND policyname = 'Only family admins can delete families') THEN
        CREATE POLICY "Only family admins can delete families" ON families FOR DELETE TO public USING (is_family_admin(family_id, uid()));
      END IF;
    END;
    $policies$;
    
  ELSE
    -- Create the families table if it doesn't exist
    CREATE TABLE families (
      family_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      family_name TEXT NOT NULL,
      created_by UUID REFERENCES auth.users(id),
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
    );
    
    -- Enable RLS
    ALTER TABLE families ENABLE ROW LEVEL SECURITY;
    
    -- Create policies
    CREATE POLICY "Users can create families" ON families FOR INSERT TO public USING (true);
    CREATE POLICY "Only family admins can update families" ON families FOR UPDATE TO public USING (is_family_admin(family_id, uid()));
    CREATE POLICY "Only family admins can delete families" ON families FOR DELETE TO public USING (is_family_admin(family_id, uid()));
  END IF;
  
  -- Create the is_family_admin function if it doesn't exist
  IF NOT EXISTS (SELECT FROM pg_proc WHERE proname = 'is_family_admin') THEN
    CREATE OR REPLACE FUNCTION is_family_admin(family_id UUID, user_id UUID)
    RETURNS BOOLEAN AS $$
    DECLARE
      is_admin BOOLEAN;
    BEGIN
      SELECT EXISTS (
        SELECT 1 FROM family_members 
        WHERE family_id = $1 
        AND user_id = $2 
        AND role = 'admin'
      ) INTO is_admin;
      
      RETURN is_admin;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;
  END IF;
END;
$$;

-- Create trigger to update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = now();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_trigger WHERE tgname = 'update_families_updated_at') THEN
    CREATE TRIGGER update_families_updated_at
    BEFORE UPDATE ON families
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
  END IF;
END;
$$;