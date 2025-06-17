export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          parent_category_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          parent_category_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          parent_category_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      products: {
        Row: {
          id: string;
          store_id: string;
          name: string;
          description: string | null;
          price: number;
          currency: string;
          stock_quantity: number | null;
          category_id: string | null;
          created_at: string;
          updated_at: string;
          image_url: string | null;
          sku: string | null;
        };
        Insert: {
          id?: string;
          store_id: string;
          name: string;
          description?: string | null;
          price: number;
          currency?: string;
          stock_quantity?: number | null;
          category_id?: string | null;
          created_at?: string;
          updated_at?: string;
          image_url?: string | null;
          sku?: string | null;
        };
        Update: {
          id?: string;
          store_id?: string;
          name?: string;
          description?: string | null;
          price?: number;
          currency?: string;
          stock_quantity?: number | null;
          category_id?: string | null;
          created_at?: string;
          updated_at?: string;
          image_url?: string | null;
          sku?: string | null;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

// Convenience types for easier usage
export type Category = Database['public']['Tables']['categories']['Row'];
export type Product = Database['public']['Tables']['products']['Row'];
export type ProductWithCategory = Product & {
  categories: Category | null;
};

export type InsertCategory = Database['public']['Tables']['categories']['Insert'];
export type InsertProduct = Database['public']['Tables']['products']['Insert'];

export type UpdateCategory = Database['public']['Tables']['categories']['Update'];
export type UpdateProduct = Database['public']['Tables']['products']['Update'];