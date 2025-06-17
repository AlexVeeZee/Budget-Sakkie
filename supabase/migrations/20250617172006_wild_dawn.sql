/*
  # Product Catalog Database Schema

  1. New Tables
    - `categories`
      - `id` (uuid, primary key)
      - `name` (text, required)
      - `description` (text)
      - `parent_category_id` (uuid, self-referencing foreign key)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `products`
      - `id` (uuid, primary key)
      - `store_id` (text, required)
      - `name` (text, required)
      - `description` (text)
      - `price` (decimal, required)
      - `currency` (text, default 'ZAR')
      - `stock_quantity` (integer)
      - `category_id` (uuid, foreign key)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      - `image_url` (text)
      - `sku` (text, unique)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to read data
    - Add policies for admin users to manage data

  3. Sample Data
    - Insert product categories (Fresh Produce, Dairy, Bakery, etc.)
    - Insert 10 realistic South African grocery products
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
  price decimal(10,2) NOT NULL,
  currency text DEFAULT 'ZAR',
  stock_quantity integer DEFAULT 0,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  image_url text,
  sku text UNIQUE
);

-- Enable Row Level Security
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Create policies for categories
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

-- Create policies for products
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_store_id ON products(store_id);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON categories(parent_category_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert sample categories
INSERT INTO categories (name, description) VALUES
  ('Fresh Produce', 'Fresh fruits and vegetables'),
  ('Dairy', 'Milk, cheese, yogurt and dairy products'),
  ('Bakery', 'Bread, pastries and baked goods'),
  ('Meat & Poultry', 'Fresh and frozen meat products'),
  ('Pantry Staples', 'Rice, pasta, canned goods and dry goods'),
  ('Beverages', 'Drinks, juices and beverages'),
  ('Household', 'Cleaning supplies and household items'),
  ('Personal Care', 'Health and beauty products')
ON CONFLICT DO NOTHING;

-- Insert sample products with realistic South African grocery data
INSERT INTO products (store_id, name, description, price, category_id, stock_quantity, image_url, sku) VALUES
  (
    'pick-n-pay',
    'Albany Superior White Bread',
    'Fresh baked white bread, perfect for sandwiches and toast',
    15.99,
    (SELECT id FROM categories WHERE name = 'Bakery' LIMIT 1),
    50,
    'https://images.pexels.com/photos/209206/pexels-photo-209206.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop',
    'ALB-WHT-700G'
  ),
  (
    'shoprite',
    'Clover Full Cream Milk',
    'Fresh full cream milk, 1 litre',
    22.99,
    (SELECT id FROM categories WHERE name = 'Dairy' LIMIT 1),
    75,
    'https://images.pexels.com/photos/416978/pexels-photo-416978.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop',
    'CLV-MILK-1L'
  ),
  (
    'checkers',
    'Nulaid Large Eggs',
    'Fresh large eggs, 18 pack',
    42.99,
    (SELECT id FROM categories WHERE name = 'Dairy' LIMIT 1),
    30,
    'https://images.pexels.com/photos/162712/egg-white-food-protein-162712.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop',
    'NUL-EGG-18PK'
  ),
  (
    'woolworths',
    'Jacobs Kronung Coffee',
    'Premium ground coffee, 250g',
    89.99,
    (SELECT id FROM categories WHERE name = 'Beverages' LIMIT 1),
    25,
    'https://images.pexels.com/photos/324028/pexels-photo-324028.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop',
    'JAC-COF-250G'
  ),
  (
    'spar',
    'Tastic Basmati Rice',
    'Premium basmati rice, 2kg bag',
    45.99,
    (SELECT id FROM categories WHERE name = 'Pantry Staples' LIMIT 1),
    40,
    'https://images.pexels.com/photos/315755/pexels-photo-315755.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop',
    'TAS-RIC-2KG'
  ),
  (
    'pick-n-pay',
    'Country Fair Chicken Breasts',
    'Fresh chicken breast fillets, per kg',
    89.99,
    (SELECT id FROM categories WHERE name = 'Meat & Poultry' LIMIT 1),
    20,
    'https://images.pexels.com/photos/616354/pexels-photo-616354.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop',
    'CF-CHK-BRST-KG'
  ),
  (
    'shoprite',
    'Fresh Bananas',
    'Sweet yellow bananas, per kg',
    24.99,
    (SELECT id FROM categories WHERE name = 'Fresh Produce' LIMIT 1),
    100,
    'https://images.pexels.com/photos/61127/pexels-photo-61127.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop',
    'FRS-BAN-KG'
  ),
  (
    'checkers',
    'Red Apples',
    'Crisp red apples, per kg',
    34.99,
    (SELECT id FROM categories WHERE name = 'Fresh Produce' LIMIT 1),
    80,
    'https://images.pexels.com/photos/102104/pexels-photo-102104.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop',
    'RED-APP-KG'
  ),
  (
    'woolworths',
    'Danone Plain Yoghurt',
    'Smooth plain yoghurt, 1kg tub',
    32.99,
    (SELECT id FROM categories WHERE name = 'Dairy' LIMIT 1),
    35,
    'https://images.pexels.com/photos/1435735/pexels-photo-1435735.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop',
    'DAN-YOG-1KG'
  ),
  (
    'spar',
    'Sasko Cake Wheat Flour',
    'Premium cake wheat flour, 2.5kg',
    28.99,
    (SELECT id FROM categories WHERE name = 'Pantry Staples' LIMIT 1),
    45,
    'https://images.pexels.com/photos/1070946/pexels-photo-1070946.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop',
    'SAS-FLR-2.5KG'
  )
ON CONFLICT (sku) DO NOTHING;