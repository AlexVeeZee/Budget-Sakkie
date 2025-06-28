import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { AuthState, SignInCredentials, SignUpCredentials, UserProfile } from '../types/auth';

interface AuthStore extends AuthState {
  initialize: () => Promise<void>;
  signIn: (credentials: SignInCredentials) => Promise<{ success: boolean; error?: string }>;
  signUp: (credentials: SignUpCredentials) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ success: boolean; error?: string }>;
  createGuestSession: () => Promise<void>;
  convertGuestToUser: (credentials: SignUpCredentials) => Promise<{ success: boolean; error?: string }>;
}

// Generate a random guest ID
const generateGuestId = () => {
  return Math.random().toString(36).substring(2, 10);
};

// Create a guest profile
const createGuestProfile = (): UserProfile => {
  const guestId = generateGuestId();
  return {
    id: `guest_${guestId}`,
    email: `guest_${guestId}@example.com`,
    username: `Guest_${guestId.toUpperCase()}`,
    isGuest: true,
    createdAt: new Date().toISOString(),
    preferences: {
      theme: 'light',
      language: 'en',
      currency: 'ZAR',
      notifications: {
        email: false,
        push: false,
        sms: false
      }
    }
  };
};

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  session: null,
  isLoading: true,
  isAuthenticated: false,
  isGuest: false,
  error: null,

  initialize: async () => {
    try {
      set({ isLoading: true, error: null });
      
      // Check for existing session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        // Get user profile from database
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (profileError && profileError.code !== 'PGRST116') {
          console.error('Error fetching user profile:', profileError);
        }
        
        // Create user object
        const user: UserProfile = {
          id: session.user.id,
          email: session.user.email || '',
          username: profile?.display_name || session.user.email?.split('@')[0] || '',
          displayName: profile?.display_name || undefined,
          avatarUrl: profile?.profile_image_url || undefined,
          isGuest: false,
          createdAt: session.user.created_at || new Date().toISOString()
        };
        
        set({ 
          user, 
          session, 
          isAuthenticated: true, 
          isGuest: false, 
          isLoading: false 
        });
      } else {
        // Check for guest session in localStorage
        const guestUser = localStorage.getItem('guestUser');
        if (guestUser) {
          const parsedUser = JSON.parse(guestUser) as UserProfile;
          set({ 
            user: parsedUser, 
            session: null, 
            isAuthenticated: false, 
            isGuest: true, 
            isLoading: false 
          });
        } else {
          set({ 
            user: null, 
            session: null, 
            isAuthenticated: false, 
            isGuest: false, 
            isLoading: false 
          });
        }
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      set({ 
        user: null, 
        session: null, 
        isAuthenticated: false, 
        isGuest: false, 
        isLoading: false, 
        error: 'Failed to initialize authentication' 
      });
    }
  },

  signIn: async ({ email, password, rememberMe = false }) => {
    try {
      set({ isLoading: true, error: null });
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
        options: {
          // Set session expiry based on rememberMe option
          expiresIn: rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60 // 30 days or 1 day
        }
      });
      
      if (error) {
        set({ isLoading: false, error: error.message });
        return { success: false, error: error.message };
      }
      
      // Get user profile from database
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();
      
      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Error fetching user profile:', profileError);
      }
      
      // Create user object
      const user: UserProfile = {
        id: data.user.id,
        email: data.user.email || '',
        username: profile?.display_name || data.user.email?.split('@')[0] || '',
        displayName: profile?.display_name || undefined,
        avatarUrl: profile?.profile_image_url || undefined,
        isGuest: false,
        createdAt: data.user.created_at || new Date().toISOString()
      };
      
      set({ 
        user, 
        session: data.session, 
        isAuthenticated: true, 
        isGuest: false, 
        isLoading: false 
      });
      
      // Clear any guest user data
      localStorage.removeItem('guestUser');
      
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      set({ isLoading: false, error: errorMessage });
      return { success: false, error: errorMessage };
    }
  },

  signUp: async ({ email, password, username, displayName }) => {
    try {
      set({ isLoading: true, error: null });
      
      // Check if username is already taken
      const { data: existingUsers, error: usernameError } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('display_name', username);
      
      if (usernameError) {
        console.error('Error checking username:', usernameError);
      } else if (existingUsers && existingUsers.length > 0) {
        set({ isLoading: false });
        return { success: false, error: 'Username is already taken' };
      }
      
      // Create new user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName || username
          }
        }
      });
      
      if (error) {
        set({ isLoading: false, error: error.message });
        return { success: false, error: error.message };
      }
      
      // If email confirmation is required
      if (data.user && !data.session) {
        set({ isLoading: false });
        return { 
          success: true, 
          error: 'Please check your email for a confirmation link' 
        };
      }
      
      // If auto-confirmed, create user profile
      if (data.user) {
        // The profile should be created automatically by the database trigger,
        // but we'll update it with additional information
        const { error: profileError } = await supabase
          .from('user_profiles')
          .upsert({
            id: data.user.id,
            display_name: displayName || username,
            updated_at: new Date().toISOString()
          });
        
        if (profileError) {
          console.error('Error updating user profile:', profileError);
        }
        
        // Create user object
        const user: UserProfile = {
          id: data.user.id,
          email: data.user.email || '',
          username: username,
          displayName: displayName || username,
          isGuest: false,
          createdAt: data.user.created_at || new Date().toISOString()
        };
        
        set({ 
          user, 
          session: data.session, 
          isAuthenticated: !!data.session, 
          isGuest: false, 
          isLoading: false 
        });
        
        // Clear any guest user data
        localStorage.removeItem('guestUser');
      }
      
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      set({ isLoading: false, error: errorMessage });
      return { success: false, error: errorMessage };
    }
  },

  signOut: async () => {
    try {
      set({ isLoading: true });
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Error signing out:', error);
      }
      
      // Clear any guest user data
      localStorage.removeItem('guestUser');
      
      set({ 
        user: null, 
        session: null, 
        isAuthenticated: false, 
        isGuest: false, 
        isLoading: false 
      });
    } catch (error) {
      console.error('Error during sign out:', error);
      set({ isLoading: false });
    }
  },

  resetPassword: async (email) => {
    try {
      set({ isLoading: true, error: null });
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });
      
      set({ isLoading: false });
      
      if (error) {
        return { success: false, error: error.message };
      }
      
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      set({ isLoading: false, error: errorMessage });
      return { success: false, error: errorMessage };
    }
  },

  updateProfile: async (updates) => {
    try {
      const { user } = get();
      
      if (!user) {
        return { success: false, error: 'No user logged in' };
      }
      
      set({ isLoading: true, error: null });
      
      if (user.isGuest) {
        // Update local storage for guest users
        const updatedUser = { ...user, ...updates };
        localStorage.setItem('guestUser', JSON.stringify(updatedUser));
        set({ user: updatedUser, isLoading: false });
        return { success: true };
      } else {
        // Update database for authenticated users
        const { error } = await supabase
          .from('user_profiles')
          .upsert({
            id: user.id,
            display_name: updates.displayName || user.displayName,
            profile_image_url: updates.avatarUrl || user.avatarUrl,
            updated_at: new Date().toISOString()
          });
        
        if (error) {
          set({ isLoading: false, error: error.message });
          return { success: false, error: error.message };
        }
        
        set({ 
          user: { ...user, ...updates }, 
          isLoading: false 
        });
        
        return { success: true };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      set({ isLoading: false, error: errorMessage });
      return { success: false, error: errorMessage };
    }
  },

  createGuestSession: async () => {
    try {
      set({ isLoading: true, error: null });
      
      const guestUser = createGuestProfile();
      
      // Store guest user in localStorage
      localStorage.setItem('guestUser', JSON.stringify(guestUser));
      
      set({ 
        user: guestUser, 
        session: null, 
        isAuthenticated: false, 
        isGuest: true, 
        isLoading: false 
      });
    } catch (error) {
      console.error('Error creating guest session:', error);
      set({ isLoading: false });
    }
  },

  convertGuestToUser: async ({ email, password, username, displayName }) => {
    try {
      const { user: guestUser } = get();
      
      if (!guestUser || !guestUser.isGuest) {
        return { success: false, error: 'No guest session to convert' };
      }
      
      set({ isLoading: true, error: null });
      
      // Create new user account
      const { success, error } = await get().signUp({
        email,
        password,
        username,
        displayName: displayName || username
      });
      
      if (!success) {
        set({ isLoading: false });
        return { success: false, error };
      }
      
      // Clear guest session
      localStorage.removeItem('guestUser');
      
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      set({ isLoading: false, error: errorMessage });
      return { success: false, error: errorMessage };
    }
  }
}));