/*
  # Family Sharing Tables

  1. New Tables
    - `family_invitations` - For inviting users to join families
    - `shared_shopping_lists` - For family shopping lists
    - `shared_list_items` - For items in shared shopping lists
    - `family_budgets` - For family budget tracking
    - `family_expenses` - For tracking family expenses
    - `list_collaborations` - For tracking user activity on lists
    - `price_history` - For tracking product price changes
    - `loyalty_cards` - For storing user loyalty cards

  2. Security
    - Enable RLS on all tables
    - Add policies for proper access control
    - Ensure family members can only access their own family's data

  3. Functions
    - Add function to update budget spent amount when expenses change
    - Add function to track product price changes
*/

-- Create family_invitations table
CREATE TABLE IF NOT EXISTS family_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id uuid REFERENCES families(id) ON DELETE CASCADE,
  invited_email text NOT NULL,
  invited_by uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  invitation_token uuid DEFAULT gen_random_uuid(),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
  expires_at timestamptz DEFAULT (now() + '7 days'::interval),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create shared_shopping_lists table
CREATE TABLE IF NOT EXISTS shared_shopping_lists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  family_id uuid REFERENCES families(id) ON DELETE CASCADE,
  created_by uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  budget_amount numeric(10,2),
  currency text DEFAULT 'ZAR',
  status text DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create shared_list_items table
CREATE TABLE IF NOT EXISTS shared_list_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id uuid REFERENCES shared_shopping_lists(id) ON DELETE CASCADE,
  product_name text NOT NULL,
  quantity integer DEFAULT 1,
  estimated_price numeric(10,2),
  actual_price numeric(10,2),
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

-- Create family_budgets table
CREATE TABLE IF NOT EXISTS family_budgets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id uuid REFERENCES families(id) ON DELETE CASCADE,
  name text NOT NULL,
  total_amount numeric(10,2) NOT NULL CHECK (total_amount >= 0),
  spent_amount numeric(10,2) DEFAULT 0,
  currency text DEFAULT 'ZAR',
  period_type text DEFAULT 'monthly' CHECK (period_type IN ('weekly', 'monthly', 'yearly')),
  start_date date NOT NULL,
  end_date date NOT NULL,
  created_by uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create family_expenses table
CREATE TABLE IF NOT EXISTS family_expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id uuid REFERENCES families(id) ON DELETE CASCADE,
  budget_id uuid REFERENCES family_budgets(id) ON DELETE SET NULL,
  list_id uuid REFERENCES shared_shopping_lists(id) ON DELETE SET NULL,
  description text NOT NULL,
  amount numeric(10,2) NOT NULL,
  currency text DEFAULT 'ZAR',
  category text,
  receipt_url text,
  paid_by uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  expense_date date DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create list_collaborations table to track user activity
CREATE TABLE IF NOT EXISTS list_collaborations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id uuid REFERENCES shared_shopping_lists(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  action text NOT NULL,
  item_id uuid REFERENCES shared_list_items(id) ON DELETE SET NULL,
  last_activity timestamptz DEFAULT now(),
  UNIQUE(list_id, user_id)
);

-- Create price_history table
CREATE TABLE IF NOT EXISTS price_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  store_id text NOT NULL,
  price numeric(10,2) NOT NULL CHECK (price >= 0),
  recorded_at timestamptz DEFAULT now(),
  currency text DEFAULT 'ZAR'
);

-- Create loyalty_cards table
CREATE TABLE IF NOT EXISTS loyalty_cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  retailer_id text NOT NULL,
  card_number text NOT NULL,
  points_balance integer DEFAULT 0 CHECK (points_balance >= 0),
  tier text DEFAULT 'standard',
  expiry_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE family_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_shopping_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_list_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE list_collaborations ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_cards ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance (with existence checks)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_family_invitations_family_id') THEN
    CREATE INDEX idx_family_invitations_family_id ON family_invitations(family_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_family_invitations_email') THEN
    CREATE INDEX idx_family_invitations_email ON family_invitations(invited_email);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_family_invitations_token') THEN
    CREATE INDEX idx_family_invitations_token ON family_invitations(invitation_token);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_shared_lists_family_id') THEN
    CREATE INDEX idx_shared_lists_family_id ON shared_shopping_lists(family_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_shared_list_items_list_id') THEN
    CREATE INDEX idx_shared_list_items_list_id ON shared_list_items(list_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_family_expenses_family_id') THEN
    CREATE INDEX idx_family_expenses_family_id ON family_expenses(family_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_family_expenses_expense_date') THEN
    CREATE INDEX idx_family_expenses_expense_date ON family_expenses(expense_date);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_family_budgets_family_id') THEN
    CREATE INDEX idx_family_budgets_family_id ON family_budgets(family_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_list_collaborations_list_id') THEN
    CREATE INDEX idx_list_collaborations_list_id ON list_collaborations(list_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_price_history_product_id') THEN
    CREATE INDEX idx_price_history_product_id ON price_history(product_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_price_history_store_id') THEN
    CREATE INDEX idx_price_history_store_id ON price_history(store_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_price_history_recorded_at') THEN
    CREATE INDEX idx_price_history_recorded_at ON price_history(recorded_at);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_loyalty_cards_user_id') THEN
    CREATE INDEX idx_loyalty_cards_user_id ON loyalty_cards(user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_loyalty_cards_retailer_id') THEN
    CREATE INDEX idx_loyalty_cards_retailer_id ON loyalty_cards(retailer_id);
  END IF;
END $$;

-- Create policies for family_invitations (with existence checks)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Family admins can manage invitations' AND tablename = 'family_invitations') THEN
    CREATE POLICY "Family admins can manage invitations"
      ON family_invitations
      FOR ALL
      TO authenticated
      USING (
        family_id IN (
          SELECT family_id 
          FROM family_members 
          WHERE user_id = auth.uid() AND role = 'admin'
        )
      );
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view invitations sent to them' AND tablename = 'family_invitations') THEN
    CREATE POLICY "Users can view invitations sent to them"
      ON family_invitations
      FOR SELECT
      TO authenticated
      USING (invited_email = auth.email());
  END IF;
END $$;

-- Create policies for shared_shopping_lists (with existence checks)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Family members can view shared lists' AND tablename = 'shared_shopping_lists') THEN
    CREATE POLICY "Family members can view shared lists"
      ON shared_shopping_lists
      FOR SELECT
      TO authenticated
      USING (
        family_id IN (
          SELECT family_id 
          FROM family_members 
          WHERE user_id = auth.uid()
        )
      );
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Family members can create shared lists' AND tablename = 'shared_shopping_lists') THEN
    CREATE POLICY "Family members can create shared lists"
      ON shared_shopping_lists
      FOR INSERT
      TO authenticated
      WITH CHECK (
        family_id IN (
          SELECT family_id 
          FROM family_members 
          WHERE user_id = auth.uid()
        ) AND created_by = auth.uid()
      );
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Family members can update shared lists' AND tablename = 'shared_shopping_lists') THEN
    CREATE POLICY "Family members can update shared lists"
      ON shared_shopping_lists
      FOR UPDATE
      TO authenticated
      USING (
        family_id IN (
          SELECT family_id 
          FROM family_members 
          WHERE user_id = auth.uid()
        )
      );
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Family admins can delete shared lists' AND tablename = 'shared_shopping_lists') THEN
    CREATE POLICY "Family admins can delete shared lists"
      ON shared_shopping_lists
      FOR DELETE
      TO authenticated
      USING (
        family_id IN (
          SELECT family_id 
          FROM family_members 
          WHERE user_id = auth.uid() AND role = 'admin'
        )
      );
  END IF;
END $$;

-- Create policies for shared_list_items (with existence checks)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Family members can manage list items' AND tablename = 'shared_list_items') THEN
    CREATE POLICY "Family members can manage list items"
      ON shared_list_items
      FOR ALL
      TO authenticated
      USING (
        list_id IN (
          SELECT id 
          FROM shared_shopping_lists 
          WHERE family_id IN (
            SELECT family_id 
            FROM family_members 
            WHERE user_id = auth.uid()
          )
        )
      );
  END IF;
END $$;

-- Create policies for family_budgets (with existence checks)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Family members can view budgets' AND tablename = 'family_budgets') THEN
    CREATE POLICY "Family members can view budgets"
      ON family_budgets
      FOR SELECT
      TO authenticated
      USING (
        family_id IN (
          SELECT family_id 
          FROM family_members 
          WHERE user_id = auth.uid()
        )
      );
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Family admins can manage budgets' AND tablename = 'family_budgets') THEN
    CREATE POLICY "Family admins can manage budgets"
      ON family_budgets
      FOR ALL
      TO authenticated
      USING (
        family_id IN (
          SELECT family_id 
          FROM family_members 
          WHERE user_id = auth.uid() AND role = 'admin'
        )
      );
  END IF;
END $$;

-- Create policies for family_expenses (with existence checks)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Family members can view expenses' AND tablename = 'family_expenses') THEN
    CREATE POLICY "Family members can view expenses"
      ON family_expenses
      FOR SELECT
      TO authenticated
      USING (
        family_id IN (
          SELECT family_id 
          FROM family_members 
          WHERE user_id = auth.uid()
        )
      );
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Family members can add expenses' AND tablename = 'family_expenses') THEN
    CREATE POLICY "Family members can add expenses"
      ON family_expenses
      FOR INSERT
      TO authenticated
      WITH CHECK (
        family_id IN (
          SELECT family_id 
          FROM family_members 
          WHERE user_id = auth.uid()
        ) AND paid_by = auth.uid()
      );
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Family members can update own expenses' AND tablename = 'family_expenses') THEN
    CREATE POLICY "Family members can update own expenses"
      ON family_expenses
      FOR UPDATE
      TO authenticated
      USING (
        family_id IN (
          SELECT family_id 
          FROM family_members 
          WHERE user_id = auth.uid()
        ) AND paid_by = auth.uid()
      );
  END IF;
END $$;

-- Create policies for list_collaborations (with existence checks)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Family members can manage collaborations' AND tablename = 'list_collaborations') THEN
    CREATE POLICY "Family members can manage collaborations"
      ON list_collaborations
      FOR ALL
      TO authenticated
      USING (
        list_id IN (
          SELECT id 
          FROM shared_shopping_lists 
          WHERE family_id IN (
            SELECT family_id 
            FROM family_members 
            WHERE user_id = auth.uid()
          )
        )
      );
  END IF;
END $$;

-- Create policies for price_history (with existence checks)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can read price history' AND tablename = 'price_history') THEN
    CREATE POLICY "Anyone can read price history"
      ON price_history
      FOR SELECT
      TO public
      USING (true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can insert price history' AND tablename = 'price_history') THEN
    CREATE POLICY "Authenticated users can insert price history"
      ON price_history
      FOR INSERT
      TO authenticated
      WITH CHECK (true);
  END IF;
END $$;

-- Create policies for loyalty_cards (with existence checks)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can manage their loyalty cards' AND tablename = 'loyalty_cards') THEN
    CREATE POLICY "Users can manage their loyalty cards"
      ON loyalty_cards
      FOR ALL
      TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Create function to update budget spent amount when expenses change (with existence check)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_budget_spent_amount') THEN
    CREATE FUNCTION update_budget_spent_amount()
    RETURNS TRIGGER AS $$
    DECLARE
      budget_id uuid;
    BEGIN
      -- For INSERT
      IF TG_OP = 'INSERT' THEN
        budget_id := NEW.budget_id;
        
        -- Update the budget's spent amount
        IF budget_id IS NOT NULL THEN
          UPDATE family_budgets
          SET spent_amount = (
            SELECT COALESCE(SUM(amount), 0)
            FROM family_expenses
            WHERE budget_id = NEW.budget_id
          )
          WHERE id = budget_id;
        END IF;
        
        RETURN NEW;
      
      -- For UPDATE
      ELSIF TG_OP = 'UPDATE' THEN
        -- If budget_id changed, update both old and new budgets
        IF OLD.budget_id IS DISTINCT FROM NEW.budget_id OR OLD.amount IS DISTINCT FROM NEW.amount THEN
          -- Update old budget if it exists
          IF OLD.budget_id IS NOT NULL THEN
            UPDATE family_budgets
            SET spent_amount = (
              SELECT COALESCE(SUM(amount), 0)
              FROM family_expenses
              WHERE budget_id = OLD.budget_id
            )
            WHERE id = OLD.budget_id;
          END IF;
          
          -- Update new budget if it exists
          IF NEW.budget_id IS NOT NULL THEN
            UPDATE family_budgets
            SET spent_amount = (
              SELECT COALESCE(SUM(amount), 0)
              FROM family_expenses
              WHERE budget_id = NEW.budget_id
            )
            WHERE id = NEW.budget_id;
          END IF;
        END IF;
        
        RETURN NEW;
      
      -- For DELETE
      ELSIF TG_OP = 'DELETE' THEN
        budget_id := OLD.budget_id;
        
        -- Update the budget's spent amount
        IF budget_id IS NOT NULL THEN
          UPDATE family_budgets
          SET spent_amount = (
            SELECT COALESCE(SUM(amount), 0)
            FROM family_expenses
            WHERE budget_id = OLD.budget_id
          )
          WHERE id = budget_id;
        END IF;
        
        RETURN OLD;
      END IF;
      
      RETURN NULL;
    END;
    $$ LANGUAGE plpgsql;
  END IF;
END $$;

-- Create function to track product price changes (with existence check)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'track_product_price_changes') THEN
    CREATE FUNCTION track_product_price_changes()
    RETURNS TRIGGER AS $$
    BEGIN
      -- Only track if price changed
      IF NEW.price <> OLD.price THEN
        INSERT INTO price_history (
          product_id,
          store_id,
          price,
          currency,
          recorded_at
        ) VALUES (
          NEW.id,
          NEW.store_id,
          NEW.price,
          NEW.currency,
          now()
        );
      END IF;
      
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  END IF;
END $$;

-- Create triggers with existence checks
DO $$
BEGIN
  -- Trigger for updating budget spent amount
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_update_budget_spent_amount') THEN
    CREATE TRIGGER trigger_update_budget_spent_amount
      AFTER INSERT OR UPDATE OR DELETE ON family_expenses
      FOR EACH ROW EXECUTE FUNCTION update_budget_spent_amount();
  END IF;
  
  -- Trigger for tracking product price changes
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'track_product_price_changes') THEN
    CREATE TRIGGER track_product_price_changes
      AFTER UPDATE ON products
      FOR EACH ROW
      WHEN (NEW.price <> OLD.price)
      EXECUTE FUNCTION track_product_price_changes();
  END IF;
  
  -- Triggers for updated_at columns
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_family_invitations_updated_at') THEN
    CREATE TRIGGER update_family_invitations_updated_at
      BEFORE UPDATE ON family_invitations
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_shared_shopping_lists_updated_at') THEN
    CREATE TRIGGER update_shared_shopping_lists_updated_at
      BEFORE UPDATE ON shared_shopping_lists
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_shared_list_items_updated_at') THEN
    CREATE TRIGGER update_shared_list_items_updated_at
      BEFORE UPDATE ON shared_list_items
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_family_budgets_updated_at') THEN
    CREATE TRIGGER update_family_budgets_updated_at
      BEFORE UPDATE ON family_budgets
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_family_expenses_updated_at') THEN
    CREATE TRIGGER update_family_expenses_updated_at
      BEFORE UPDATE ON family_expenses
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_loyalty_cards_updated_at') THEN
    CREATE TRIGGER update_loyalty_cards_updated_at
      BEFORE UPDATE ON loyalty_cards
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;