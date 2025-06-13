import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  console.log('VITE_SUPABASE_URL:', supabaseUrl ? 'Set' : 'Missing');
  console.log('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Set' : 'Missing');
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '', {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    flowType: 'pkce'
  }
});

// Types for our database
export interface UserProfile {
  id: string;
  display_name: string | null;
  profile_image_url: string | null;
  family_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Family {
  id: string;
  name: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface FamilyMember {
  id: string;
  family_id: string;
  user_id: string;
  role: 'admin' | 'member';
  joined_at: string;
  user_profiles?: UserProfile;
}

// Helper function to check if Supabase is properly configured
export const checkSupabaseConfig = () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Supabase configuration missing. Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your environment variables.'
    );
  }
  return true;
};

// Helper function to clear all auth-related storage
export const clearAuthStorage = () => {
  // Clear Supabase auth storage
  localStorage.removeItem('supabase.auth.token');
  
  // Clear any app-specific storage
  localStorage.removeItem('budgetSakkie_locations');
  localStorage.removeItem('budgetSakkie_currency');
  
  // Clear session storage
  sessionStorage.clear();
};