/*
  # Family Sharing Feature - Complete Schema

  1. New Tables
    - `family_invitations` - Track pending invitations
    - `shared_shopping_lists` - Lists shared with family members
    - `family_budgets` - Family budget tracking
    - `family_expenses` - Shared expense tracking
    - `list_collaborations` - Real-time collaboration tracking

  2. Enhanced Tables
    - Update `families` table with additional fields
    - Update `family_members` with enhanced permissions
    - Add family-specific fields to existing tables

  3. Security
    - Enable RLS on all new tables
    - Add comprehensive policies for family data access
    - Ensure proper permission checks

  4. Functions
    - Family invitation management
    - Real-time collaboration triggers
    - Budget calculation functions
*/

-- Family Invitations Table
CREATE TABLE IF NOT EXISTS family_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id uuid REFERENCES families(id) ON DELETE CASCADE,
  invited_email text NOT NULL,
  invited_by uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  invitation_token uuid DEFAULT gen_random_uuid(),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
  expires_at timestamptz DEFAULT (now() + interval '7 days'),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Shared Shopping Lists Table
CREATE TABLE IF NOT EXISTS shared_shopping_lists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  family_id uuid REFERENCES families(id) ON DELETE CASCADE,
  created_by uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  budget_amount decimal(10,2),
  currency text DEFAULT 'ZAR',
  status text DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Shopping List Items for Shared Lists
CREATE TABLE IF NOT EXISTS shared_list_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id uuid REFERENCES shared_shopping_lists(id) ON DELETE CASCADE,
  product_name text NOT NULL,
  quantity integer DEFAULT 1,
  estimated_price decimal(10,2),
  actual_price decimal(10,2),
  category text,
  notes text,
  priority text DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
  completed boolean DEFAULT false,
  completed_by uuid REFERENCES auth.users(id),
  completed_at timestamptz,
  created_by uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Family Budgets Table
CREATE TABLE IF NOT EXISTS family_budgets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id uuid REFERENCES families(id) ON DELETE CASCADE,
  name text NOT NULL,
  total_amount decimal(10,2) NOT NULL,
  spent_amount decimal(10,2) DEFAULT 0,
  currency text DEFAULT 'ZAR',
  period_type text DEFAULT 'monthly' CHECK (period_type IN ('weekly', 'monthly', 'yearly')),
  start_date date NOT NULL,
  end_date date NOT NULL,
  created_by uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Family Expenses Table
CREATE TABLE IF NOT EXISTS family_expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id uuid REFERENCES families(id) ON DELETE CASCADE,
  budget_id uuid REFERENCES family_budgets(id) ON DELETE SET NULL,
  list_id uuid REFERENCES shared_shopping_lists(id) ON DELETE SET NULL,
  description text NOT NULL,
  amount decimal(10,2) NOT NULL,
  currency text DEFAULT 'ZAR',
  category text,
  receipt_url text,
  paid_by uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  expense_date date DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- List Collaborations for Real-time Tracking
CREATE TABLE IF NOT EXISTS list_collaborations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id uuid REFERENCES shared_shopping_lists(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  action text NOT NULL, -- 'viewing', 'editing', 'adding_item', etc.
  item_id uuid REFERENCES shared_list_items(id) ON DELETE SET NULL,
  last_activity timestamptz DEFAULT now(),
  UNIQUE(list_id, user_id)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_family_invitations_family_id ON family_invitations(family_id);
CREATE INDEX IF NOT EXISTS idx_family_invitations_email ON family_invitations(invited_email);
CREATE INDEX IF NOT EXISTS idx_family_invitations_token ON family_invitations(invitation_token);
CREATE INDEX IF NOT EXISTS idx_shared_lists_family_id ON shared_shopping_lists(family_id);
CREATE INDEX IF NOT EXISTS idx_shared_list_items_list_id ON shared_list_items(list_id);
CREATE INDEX IF NOT EXISTS idx_family_budgets_family_id ON family_budgets(family_id);
CREATE INDEX IF NOT EXISTS idx_family_expenses_family_id ON family_expenses(family_id);
CREATE INDEX IF NOT EXISTS idx_list_collaborations_list_id ON list_collaborations(list_id);

-- Enable Row Level Security
ALTER TABLE family_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_shopping_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_list_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE list_collaborations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Family Invitations
CREATE POLICY "Family admins can manage invitations"
  ON family_invitations
  FOR ALL
  TO authenticated
  USING (
    family_id IN (
      SELECT family_id FROM family_members 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Users can view invitations sent to them"
  ON family_invitations
  FOR SELECT
  TO authenticated
  USING (invited_email = auth.email());

-- RLS Policies for Shared Shopping Lists
CREATE POLICY "Family members can view shared lists"
  ON shared_shopping_lists
  FOR SELECT
  TO authenticated
  USING (
    family_id IN (
      SELECT family_id FROM family_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Family members can create shared lists"
  ON shared_shopping_lists
  FOR INSERT
  TO authenticated
  WITH CHECK (
    family_id IN (
      SELECT family_id FROM family_members 
      WHERE user_id = auth.uid()
    ) AND created_by = auth.uid()
  );

CREATE POLICY "Family members can update shared lists"
  ON shared_shopping_lists
  FOR UPDATE
  TO authenticated
  USING (
    family_id IN (
      SELECT family_id FROM family_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Family admins can delete shared lists"
  ON shared_shopping_lists
  FOR DELETE
  TO authenticated
  USING (
    family_id IN (
      SELECT family_id FROM family_members 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for Shared List Items
CREATE POLICY "Family members can manage list items"
  ON shared_list_items
  FOR ALL
  TO authenticated
  USING (
    list_id IN (
      SELECT id FROM shared_shopping_lists 
      WHERE family_id IN (
        SELECT family_id FROM family_members 
        WHERE user_id = auth.uid()
      )
    )
  );

-- RLS Policies for Family Budgets
CREATE POLICY "Family members can view budgets"
  ON family_budgets
  FOR SELECT
  TO authenticated
  USING (
    family_id IN (
      SELECT family_id FROM family_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Family admins can manage budgets"
  ON family_budgets
  FOR ALL
  TO authenticated
  USING (
    family_id IN (
      SELECT family_id FROM family_members 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for Family Expenses
CREATE POLICY "Family members can view expenses"
  ON family_expenses
  FOR SELECT
  TO authenticated
  USING (
    family_id IN (
      SELECT family_id FROM family_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Family members can add expenses"
  ON family_expenses
  FOR INSERT
  TO authenticated
  WITH CHECK (
    family_id IN (
      SELECT family_id FROM family_members 
      WHERE user_id = auth.uid()
    ) AND paid_by = auth.uid()
  );

CREATE POLICY "Family members can update own expenses"
  ON family_expenses
  FOR UPDATE
  TO authenticated
  USING (
    family_id IN (
      SELECT family_id FROM family_members 
      WHERE user_id = auth.uid()
    ) AND paid_by = auth.uid()
  );

-- RLS Policies for List Collaborations
CREATE POLICY "Family members can manage collaborations"
  ON list_collaborations
  FOR ALL
  TO authenticated
  USING (
    list_id IN (
      SELECT id FROM shared_shopping_lists 
      WHERE family_id IN (
        SELECT family_id FROM family_members 
        WHERE user_id = auth.uid()
      )
    )
  );

-- Functions for family management
CREATE OR REPLACE FUNCTION accept_family_invitation(invitation_token uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  invitation_record family_invitations%ROWTYPE;
  new_member_id uuid;
BEGIN
  -- Get the invitation
  SELECT * INTO invitation_record
  FROM family_invitations
  WHERE invitation_token = accept_family_invitation.invitation_token
    AND status = 'pending'
    AND expires_at > now()
    AND invited_email = auth.email();

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Invalid or expired invitation');
  END IF;

  -- Add user to family
  INSERT INTO family_members (family_id, user_id, role)
  VALUES (invitation_record.family_id, auth.uid(), invitation_record.role)
  RETURNING id INTO new_member_id;

  -- Update invitation status
  UPDATE family_invitations
  SET status = 'accepted', updated_at = now()
  WHERE id = invitation_record.id;

  -- Update user profile with family_id
  UPDATE user_profiles
  SET family_id = invitation_record.family_id, updated_at = now()
  WHERE id = auth.uid();

  RETURN json_build_object(
    'success', true,
    'family_id', invitation_record.family_id,
    'member_id', new_member_id
  );
END;
$$;

-- Function to calculate family budget usage
CREATE OR REPLACE FUNCTION calculate_family_budget_usage(budget_id uuid)
RETURNS decimal(10,2)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  total_spent decimal(10,2) := 0;
BEGIN
  SELECT COALESCE(SUM(amount), 0)
  INTO total_spent
  FROM family_expenses
  WHERE family_expenses.budget_id = calculate_family_budget_usage.budget_id;

  -- Update the budget spent amount
  UPDATE family_budgets
  SET spent_amount = total_spent, updated_at = now()
  WHERE id = calculate_family_budget_usage.budget_id;

  RETURN total_spent;
END;
$$;

-- Trigger to update budget spent amount when expenses change
CREATE OR REPLACE FUNCTION update_budget_spent_amount()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    IF NEW.budget_id IS NOT NULL THEN
      PERFORM calculate_family_budget_usage(NEW.budget_id);
    END IF;
  END IF;

  IF TG_OP = 'DELETE' THEN
    IF OLD.budget_id IS NOT NULL THEN
      PERFORM calculate_family_budget_usage(OLD.budget_id);
    END IF;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER trigger_update_budget_spent_amount
  AFTER INSERT OR UPDATE OR DELETE ON family_expenses
  FOR EACH ROW
  EXECUTE FUNCTION update_budget_spent_amount();

-- Trigger to update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_family_invitations_updated_at
  BEFORE UPDATE ON family_invitations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shared_shopping_lists_updated_at
  BEFORE UPDATE ON shared_shopping_lists
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shared_list_items_updated_at
  BEFORE UPDATE ON shared_list_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_family_budgets_updated_at
  BEFORE UPDATE ON family_budgets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_family_expenses_updated_at
  BEFORE UPDATE ON family_expenses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();