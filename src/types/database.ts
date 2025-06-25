export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string
          name: string
          description: string | null
          parent_category_id: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          parent_category_id?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          parent_category_id?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_category_id_fkey"
            columns: ["parent_category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          }
        ]
      }
      products: {
        Row: {
          id: string
          store_id: string
          name: string
          description: string | null
          price: number
          currency: string | null
          stock_quantity: number | null
          category_id: string | null
          created_at: string | null
          updated_at: string | null
          image_url: string | null
          sku: string | null
        }
        Insert: {
          id?: string
          store_id: string
          name: string
          description?: string | null
          price: number
          currency?: string | null
          stock_quantity?: number | null
          category_id?: string | null
          created_at?: string | null
          updated_at?: string | null
          image_url?: string | null
          sku?: string | null
        }
        Update: {
          id?: string
          store_id?: string
          name?: string
          description?: string | null
          price?: number
          currency?: string | null
          stock_quantity?: number | null
          category_id?: string | null
          created_at?: string | null
          updated_at?: string | null
          image_url?: string | null
          sku?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          }
        ]
      }
      families: {
        Row: {
          id: string
          name: string
          created_by: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          created_by?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          created_by?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "families_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      user_profiles: {
        Row: {
          id: string
          display_name: string | null
          profile_image_url: string | null
          family_id: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id: string
          display_name?: string | null
          profile_image_url?: string | null
          family_id?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          display_name?: string | null
          profile_image_url?: string | null
          family_id?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_profiles_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      family_members: {
        Row: {
          id: string
          family_id: string | null
          user_id: string | null
          role: string
          joined_at: string | null
        }
        Insert: {
          id?: string
          family_id?: string | null
          user_id?: string | null
          role?: string
          joined_at?: string | null
        }
        Update: {
          id?: string
          family_id?: string | null
          user_id?: string | null
          role?: string
          joined_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "family_members_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "family_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}