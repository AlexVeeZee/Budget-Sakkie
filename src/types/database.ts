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
      family_invitations: {
        Row: {
          id: string
          family_id: string | null
          invited_email: string
          invited_by: string | null
          role: string
          invitation_token: string | null
          status: string
          expires_at: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          family_id?: string | null
          invited_email: string
          invited_by?: string | null
          role?: string
          invitation_token?: string | null
          status?: string
          expires_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          family_id?: string | null
          invited_email?: string
          invited_by?: string | null
          role?: string
          invitation_token?: string | null
          status?: string
          expires_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "family_invitations_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "family_invitations_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      shared_shopping_lists: {
        Row: {
          id: string
          name: string
          description: string | null
          family_id: string | null
          created_by: string | null
          budget_amount: number | null
          currency: string | null
          status: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          family_id?: string | null
          created_by?: string | null
          budget_amount?: number | null
          currency?: string | null
          status?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          family_id?: string | null
          created_by?: string | null
          budget_amount?: number | null
          currency?: string | null
          status?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shared_shopping_lists_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shared_shopping_lists_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          }
        ]
      }
      shared_list_items: {
        Row: {
          id: string
          list_id: string | null
          product_name: string
          quantity: number | null
          estimated_price: number | null
          actual_price: number | null
          category: string | null
          notes: string | null
          priority: string | null
          completed: boolean | null
          completed_by: string | null
          completed_at: string | null
          created_by: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          list_id?: string | null
          product_name: string
          quantity?: number | null
          estimated_price?: number | null
          actual_price?: number | null
          category?: string | null
          notes?: string | null
          priority?: string | null
          completed?: boolean | null
          completed_by?: string | null
          completed_at?: string | null
          created_by?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          list_id?: string | null
          product_name?: string
          quantity?: number | null
          estimated_price?: number | null
          actual_price?: number | null
          category?: string | null
          notes?: string | null
          priority?: string | null
          completed?: boolean | null
          completed_by?: string | null
          completed_at?: string | null
          created_by?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shared_list_items_completed_by_fkey"
            columns: ["completed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shared_list_items_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shared_list_items_list_id_fkey"
            columns: ["list_id"]
            isOneToOne: false
            referencedRelation: "shared_shopping_lists"
            referencedColumns: ["id"]
          }
        ]
      }
      family_budgets: {
        Row: {
          id: string
          family_id: string | null
          name: string
          total_amount: number
          spent_amount: number | null
          currency: string | null
          period_type: string | null
          start_date: string
          end_date: string
          created_by: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          family_id?: string | null
          name: string
          total_amount: number
          spent_amount?: number | null
          currency?: string | null
          period_type?: string | null
          start_date: string
          end_date: string
          created_by?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          family_id?: string | null
          name?: string
          total_amount?: number
          spent_amount?: number | null
          currency?: string | null
          period_type?: string | null
          start_date?: string
          end_date?: string
          created_by?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "family_budgets_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "family_budgets_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          }
        ]
      }
      family_expenses: {
        Row: {
          id: string
          family_id: string | null
          budget_id: string | null
          list_id: string | null
          description: string
          amount: number
          currency: string | null
          category: string | null
          receipt_url: string | null
          paid_by: string | null
          expense_date: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          family_id?: string | null
          budget_id?: string | null
          list_id?: string | null
          description: string
          amount: number
          currency?: string | null
          category?: string | null
          receipt_url?: string | null
          paid_by?: string | null
          expense_date?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          family_id?: string | null
          budget_id?: string | null
          list_id?: string | null
          description?: string
          amount?: number
          currency?: string | null
          category?: string | null
          receipt_url?: string | null
          paid_by?: string | null
          expense_date?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "family_expenses_budget_id_fkey"
            columns: ["budget_id"]
            isOneToOne: false
            referencedRelation: "family_budgets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "family_expenses_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "family_expenses_list_id_fkey"
            columns: ["list_id"]
            isOneToOne: false
            referencedRelation: "shared_shopping_lists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "family_expenses_paid_by_fkey"
            columns: ["paid_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      list_collaborations: {
        Row: {
          id: string
          list_id: string | null
          user_id: string | null
          action: string
          item_id: string | null
          last_activity: string | null
        }
        Insert: {
          id?: string
          list_id?: string | null
          user_id?: string | null
          action: string
          item_id?: string | null
          last_activity?: string | null
        }
        Update: {
          id?: string
          list_id?: string | null
          user_id?: string | null
          action?: string
          item_id?: string | null
          last_activity?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "list_collaborations_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "shared_list_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "list_collaborations_list_id_fkey"
            columns: ["list_id"]
            isOneToOne: false
            referencedRelation: "shared_shopping_lists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "list_collaborations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      price_history: {
        Row: {
          id: string
          product_id: string | null
          store_id: string
          price: number
          recorded_at: string | null
          currency: string | null
        }
        Insert: {
          id?: string
          product_id?: string | null
          store_id: string
          price: number
          recorded_at?: string | null
          currency?: string | null
        }
        Update: {
          id?: string
          product_id?: string | null
          store_id?: string
          price?: number
          recorded_at?: string | null
          currency?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "price_history_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          }
        ]
      }
      loyalty_cards: {
        Row: {
          id: string
          user_id: string | null
          retailer_id: string
          card_number: string
          points_balance: number | null
          tier: string | null
          expiry_date: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          retailer_id: string
          card_number: string
          points_balance?: number | null
          tier?: string | null
          expiry_date?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          retailer_id?: string
          card_number?: string
          points_balance?: number | null
          tier?: string | null
          expiry_date?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "loyalty_cards_user_id_fkey"
            columns: ["user_id"]
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
          phone_number: string | null
          address: string | null
          city: string | null
          province: string | null
          postal_code: string | null
          country: string | null
          alternative_email: string | null
        }
        Insert: {
          id: string
          display_name?: string | null
          profile_image_url?: string | null
          family_id?: string | null
          created_at?: string | null
          updated_at?: string | null
          phone_number?: string | null
          address?: string | null
          city?: string | null
          province?: string | null
          postal_code?: string | null
          country?: string | null
          alternative_email?: string | null
        }
        Update: {
          id?: string
          display_name?: string | null
          profile_image_url?: string | null
          family_id?: string | null
          created_at?: string | null
          updated_at?: string | null
          phone_number?: string | null
          address?: string | null
          city?: string | null
          province?: string | null
          postal_code?: string | null
          country?: string | null
          alternative_email?: string | null
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
      user_preferences: {
        Row: {
          user_id: string
          language: string | null
          currency: string | null
          distance_unit: string | null
          notification_preferences: Json | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          user_id: string
          language?: string | null
          currency?: string | null
          distance_unit?: string | null
          notification_preferences?: Json | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          user_id?: string
          language?: string | null
          currency?: string | null
          distance_unit?: string | null
          notification_preferences?: Json | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
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
      check_family_membership: {
        Args: {
          user_id: string
          family_id: string
        }
        Returns: boolean
      }
      check_user_in_same_family: {
        Args: {
          user_id1: string
          user_id2: string
        }
        Returns: boolean
      }
      check_user_is_family_admin: {
        Args: {
          user_id: string
          family_id: string
        }
        Returns: boolean
      }
      check_users_in_same_family: {
        Args: {
          user_id1: string
          user_id2: string
        }
        Returns: boolean
      }
      get_user_family_id: {
        Args: {
          user_id: string
        }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}