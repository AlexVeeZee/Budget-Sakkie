/*
  # Create products and categories schema

  1. New Tables
    - `categories`
      - `id` (uuid, primary key)
      - `name` (text, not null)
      - `description` (text, optional)
      - `parent_category_id` (uuid, self-reference)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    - `products`
      - `id` (uuid, primary key)
      - `store_id` (text, not null)
      - `name` (text, not null)
      - `description` (text, optional)
      - `price` (numeric, not null)
      - `currency` (text, default 'ZAR')
      - `stock_quantity` (integer, default 0)
      - `category_id` (uuid, foreign key)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      - `image_url` (text, optional)
      - `sku` (text, unique)

  2. Security
    - Enable RLS on both tables
    - Add policies for public read access
    - Add policies for authenticated user management

  3. Performance
    - Add indexes for frequently queried columns
    - Add triggers for automatic updated_at timestamps

  4. Sample Data
    - Insert sample categories
    - Insert sample products with realistic South African grocery data
*/

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  parent_category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id text NOT NULL,
  name text NOT NULL,
  description text,
  price numeric(10,2) NOT NULL,
  currency text DEFAULT 'ZAR',
  stock_quantity integer DEFAULT 0,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  image_url text,
  sku text UNIQUE
);

-- Enable Row Level Security (only if not already enabled)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE tablename = 'categories' 
    AND rowsecurity = true
  ) THEN
    ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE tablename = 'products' 
    AND rowsecurity = true
  ) THEN
    ALTER TABLE products ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Create policies for categories (with conflict handling)
DO $$
BEGIN
  -- Drop existing policies if they exist
  DROP POLICY IF EXISTS "Anyone can read categories" ON categories;
  DROP POLICY IF EXISTS "Authenticated users can manage categories" ON categories;
  
  -- Create new policies
  CREATE POLICY "Anyone can read categories"
    ON categories
    FOR SELECT
    TO public
    USING (true);

  CREATE POLICY "Authenticated users can manage categories"
    ON categories
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);
END $$;

-- Create policies for products (with conflict handling)
DO $$
BEGIN
  -- Drop existing policies if they exist
  DROP POLICY IF EXISTS "Anyone can read products" ON products;
  DROP POLICY IF EXISTS "Authenticated users can manage products" ON products;
  
  -- Create new policies
  CREATE POLICY "Anyone can read products"
    ON products
    FOR SELECT
    TO public
    USING (true);

  CREATE POLICY "Authenticated users can manage products"
    ON products
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);
END $$;

-- Create indexes for performance (with conflict handling)
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_store_id ON products(store_id);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON categories(parent_category_id);

-- Create unique constraint on SKU (with conflict handling)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'products_sku_key'
  ) THEN
    CREATE UNIQUE INDEX products_sku_key ON products(sku);
  END IF;
END $$;

-- Create update_updated_at_column function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at (with conflict handling)
DO $$
BEGIN
  -- Drop existing triggers if they exist
  DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;
  DROP TRIGGER IF EXISTS update_products_updated_at ON products;
  
  -- Create new triggers
  CREATE TRIGGER update_categories_updated_at
    BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

  CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
END $$;

-- Insert sample categories (with conflict handling)
INSERT INTO categories (name, description) VALUES
  ('Fresh Produce', 'Fresh fruits and vegetables'),
  ('Dairy & Eggs', 'Milk, cheese, eggs and dairy products'),
  ('Meat & Poultry', 'Fresh meat, chicken and seafood'),
  ('Bakery', 'Bread, pastries and baked goods'),
  ('Pantry Essentials', 'Rice, pasta, canned goods and dry ingredients'),
  ('Beverages', 'Coffee, tea, juices and soft drinks'),
  ('Household Items', 'Cleaning supplies and household necessities')
ON CONFLICT DO NOTHING;

-- Insert sample products with realistic South African grocery data (with conflict handling)
INSERT INTO products (store_id, name, description, price, currency, stock_quantity, category_id, image_url, sku) VALUES
  (
    'pick-n-pay',
    'Full Cream Milk',
    'Fresh full cream milk, 1 liter',
    22.99,
    'ZAR',
    150,
    (SELECT id FROM categories WHERE name = 'Dairy & Eggs' LIMIT 1),
    'https://images.pexels.com/photos/416978/pexels-photo-416978.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop',
    'PNP-MILK-001'
  ),
  (
    'shoprite',
    'White Bread',
    'Albany Superior White Bread, 700g',
    15.99,
    'ZAR',
    200,
    (SELECT id FROM categories WHERE name = 'Bakery' LIMIT 1),
    'https://images.pexels.com/photos/209206/pexels-photo-209206.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop',
    'SR-BREAD-001'
  ),
  (
    'checkers',
    'Large Eggs',
    'Free range large eggs, 18 pack',
    45.99,
    'ZAR',
    80,
    (SELECT id FROM categories WHERE name = 'Dairy & Eggs' LIMIT 1),
    'https://images.pexels.com/photos/162712/egg-white-food-protein-162712.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop',
    'CHK-EGGS-001'
  ),
  (
    'woolworths',
    'Premium Coffee Beans',
    'Arabica coffee beans, 250g',
    89.99,
    'ZAR',
    45,
    (SELECT id FROM categories WHERE name = 'Beverages' LIMIT 1),
    'https://images.pexels.com/photos/312418/pexels-photo-312418.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop',
    'WW-COFFEE-001'
  ),
  (
    'spar',
    'Bananas',
    'Fresh bananas per kilogram',
    19.99,
    'ZAR',
    300,
    (SELECT id FROM categories WHERE name = 'Fresh Produce' LIMIT 1),
    'https://images.pexels.com/photos/61127/pexels-photo-61127.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop',
    'SPAR-BAN-001'
  ),
  (
    'pick-n-pay',
    'Basmati Rice',
    'Premium basmati rice, 2kg bag',
    65.99,
    'ZAR',
    120,
    (SELECT id FROM categories WHERE name = 'Pantry Essentials' LIMIT 1),
    'https://images.pexels.com/photos/315755/pexels-photo-315755.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop',
    'PNP-RICE-001'
  ),
  (
    'shoprite',
    'Chicken Breasts',
    'Fresh chicken breast fillets per kg',
    89.99,
    'ZAR',
    60,
    (SELECT id FROM categories WHERE name = 'Meat & Poultry' LIMIT 1),
    'https://images.pexels.com/photos/616354/pexels-photo-616354.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop',
    'SR-CHICK-001'
  ),
  (
    'checkers',
    'Red Apples',
    'Fresh red apples per kilogram',
    29.99,
    'ZAR',
    180,
    (SELECT id FROM categories WHERE name = 'Fresh Produce' LIMIT 1),
    'https://images.pexels.com/photos/102104/pexels-photo-102104.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop',
    'CHK-APPLE-001'
  ),
  (
    'woolworths',
    'Cheddar Cheese',
    'Mature cheddar cheese, 200g',
    55.99,
    'ZAR',
    90,
    (SELECT id FROM categories WHERE name = 'Dairy & Eggs' LIMIT 1),
    'https://images.pexels.com/photos/773253/pexels-photo-773253.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop',
    'WW-CHEESE-001'
  ),
  (
    'spar',
    'Dishwashing Liquid',
    'Sunlight dishwashing liquid, 750ml',
    24.99,
    'ZAR',
    200,
    (SELECT id FROM categories WHERE name = 'Household Items' LIMIT 1),
    'https://images.pexels.com/photos/4099354/pexels-photo-4099354.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop',
    'SPAR-DISH-001'
  )
ON CONFLICT (sku) DO NOTHING;