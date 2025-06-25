import { supabase } from '../lib/supabase';
import type { Database } from '../types/database';

type Product = Database['public']['Tables']['products']['Row'];
type Category = Database['public']['Tables']['categories']['Row'];

export interface ProductWithCategory extends Product {
  category?: Category;
}

export class ProductService {
  /**
   * Fetch all products with their categories
   */
  static async getAllProducts(): Promise<ProductWithCategory[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(*)
        `)
        .order('name');

      if (error) {
        console.error('Error fetching products:', error);
        throw new Error(`Failed to fetch products: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Product service error:', error);
      throw error;
    }
  }

  /**
   * Fetch products by category
   */
  static async getProductsByCategory(categoryId: string): Promise<ProductWithCategory[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(*)
        `)
        .eq('category_id', categoryId)
        .order('name');

      if (error) {
        console.error('Error fetching products by category:', error);
        throw new Error(`Failed to fetch products by category: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Product service error:', error);
      throw error;
    }
  }

  /**
   * Search products by name or description
   */
  static async searchProducts(query: string): Promise<ProductWithCategory[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(*)
        `)
        .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
        .order('name');

      if (error) {
        console.error('Error searching products:', error);
        throw new Error(`Failed to search products: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Product service error:', error);
      throw error;
    }
  }

  /**
   * Fetch products by store
   */
  static async getProductsByStore(storeId: string): Promise<ProductWithCategory[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(*)
        `)
        .eq('store_id', storeId)
        .order('name');

      if (error) {
        console.error('Error fetching products by store:', error);
        throw new Error(`Failed to fetch products by store: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Product service error:', error);
      throw error;
    }
  }

  /**
   * Get a single product by ID
   */
  static async getProductById(id: string): Promise<ProductWithCategory | null> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(*)
        `)
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Product not found
        }
        console.error('Error fetching product:', error);
        throw new Error(`Failed to fetch product: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Product service error:', error);
      throw error;
    }
  }

  /**
   * Get all categories
   */
  static async getAllCategories(): Promise<Category[]> {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching categories:', error);
        throw new Error(`Failed to fetch categories: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Category service error:', error);
      throw error;
    }
  }

  /**
   * Get products with price comparison across stores
   */
  static async getProductPriceComparison(productName: string): Promise<ProductWithCategory[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(*)
        `)
        .ilike('name', `%${productName}%`)
        .order('price');

      if (error) {
        console.error('Error fetching price comparison:', error);
        throw new Error(`Failed to fetch price comparison: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Product service error:', error);
      throw error;
    }
  }

  /**
   * Get featured/popular products
   */
  static async getFeaturedProducts(limit: number = 10): Promise<ProductWithCategory[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(*)
        `)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching featured products:', error);
        throw new Error(`Failed to fetch featured products: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Product service error:', error);
      throw error;
    }
  }

  /**
   * Get products on sale (with stock quantity > 0)
   */
  static async getProductsInStock(): Promise<ProductWithCategory[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(*)
        `)
        .gt('stock_quantity', 0)
        .order('name');

      if (error) {
        console.error('Error fetching products in stock:', error);
        throw new Error(`Failed to fetch products in stock: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Product service error:', error);
      throw error;
    }
  }
}