import { supabase, handleSupabaseError } from '../lib/supabase';
import { Product, Category, ProductWithCategory } from '../types/database';

export interface ProductFilters {
  categoryId?: string;
  storeId?: string;
  searchQuery?: string;
  minPrice?: number;
  maxPrice?: number;
  inStockOnly?: boolean;
}

export interface ProductServiceError {
  message: string;
  code?: string;
}

export class ProductService {
  /**
   * Fetch all products with optional filtering
   */
  static async getProducts(filters: ProductFilters = {}): Promise<{
    data: ProductWithCategory[] | null;
    error: ProductServiceError | null;
  }> {
    try {
      let query = supabase
        .from('products')
        .select(`
          *,
          categories (
            id,
            name,
            description
          )
        `);

      // Apply filters
      if (filters.categoryId) {
        query = query.eq('category_id', filters.categoryId);
      }

      if (filters.storeId) {
        query = query.eq('store_id', filters.storeId);
      }

      if (filters.searchQuery) {
        query = query.or(`name.ilike.%${filters.searchQuery}%,description.ilike.%${filters.searchQuery}%`);
      }

      if (filters.minPrice !== undefined) {
        query = query.gte('price', filters.minPrice);
      }

      if (filters.maxPrice !== undefined) {
        query = query.lte('price', filters.maxPrice);
      }

      if (filters.inStockOnly) {
        query = query.gt('stock_quantity', 0);
      }

      // Order by name for consistent results
      query = query.order('name');

      const { data, error } = await query;

      if (error) {
        return {
          data: null,
          error: { message: handleSupabaseError(error) }
        };
      }

      return { data, error: null };
    } catch (error) {
      return {
        data: null,
        error: { message: handleSupabaseError(error) }
      };
    }
  }

  /**
   * Get a single product by ID
   */
  static async getProductById(id: string): Promise<{
    data: ProductWithCategory | null;
    error: ProductServiceError | null;
  }> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories (
            id,
            name,
            description
          )
        `)
        .eq('id', id)
        .single();

      if (error) {
        return {
          data: null,
          error: { message: handleSupabaseError(error) }
        };
      }

      return { data, error: null };
    } catch (error) {
      return {
        data: null,
        error: { message: handleSupabaseError(error) }
      };
    }
  }

  /**
   * Get products by store ID
   */
  static async getProductsByStore(storeId: string): Promise<{
    data: ProductWithCategory[] | null;
    error: ProductServiceError | null;
  }> {
    return this.getProducts({ storeId });
  }

  /**
   * Search products by name or description
   */
  static async searchProducts(searchQuery: string): Promise<{
    data: ProductWithCategory[] | null;
    error: ProductServiceError | null;
  }> {
    return this.getProducts({ searchQuery });
  }

  /**
   * Get all categories
   */
  static async getCategories(): Promise<{
    data: Category[] | null;
    error: ProductServiceError | null;
  }> {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) {
        return {
          data: null,
          error: { message: handleSupabaseError(error) }
        };
      }

      return { data, error: null };
    } catch (error) {
      return {
        data: null,
        error: { message: handleSupabaseError(error) }
      };
    }
  }

  /**
   * Get products by category
   */
  static async getProductsByCategory(categoryId: string): Promise<{
    data: ProductWithCategory[] | null;
    error: ProductServiceError | null;
  }> {
    return this.getProducts({ categoryId });
  }

  /**
   * Get featured products (top 6 products with good stock)
   */
  static async getFeaturedProducts(): Promise<{
    data: ProductWithCategory[] | null;
    error: ProductServiceError | null;
  }> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories (
            id,
            name,
            description
          )
        `)
        .gt('stock_quantity', 10)
        .order('created_at', { ascending: false })
        .limit(6);

      if (error) {
        return {
          data: null,
          error: { message: handleSupabaseError(error) }
        };
      }

      return { data, error: null };
    } catch (error) {
      return {
        data: null,
        error: { message: handleSupabaseError(error) }
      };
    }
  }

  /**
   * Get price comparison data for a product across stores
   */
  static async getProductPriceComparison(productName: string): Promise<{
    data: ProductWithCategory[] | null;
    error: ProductServiceError | null;
  }> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories (
            id,
            name,
            description
          )
        `)
        .ilike('name', `%${productName}%`)
        .order('price');

      if (error) {
        return {
          data: null,
          error: { message: handleSupabaseError(error) }
        };
      }

      return { data, error: null };
    } catch (error) {
      return {
        data: null,
        error: { message: handleSupabaseError(error) }
      };
    }
  }
}