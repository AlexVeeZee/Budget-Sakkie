import { useState, useEffect, useCallback } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase, UserProfile } from '../lib/supabase';

interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
  initialized: boolean;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    profile: null,
    session: null,
    loading: true,
    error: null,
    initialized: false
  });

  // Load user profile with retry logic and auto-creation
  const loadUserProfile = useCallback(async (userId: string, retryCount = 0) => {
    try {
      console.log(`Loading profile for user ${userId}, attempt ${retryCount + 1}`);
      
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        // If profile doesn't exist, create it
        if (error.code === 'PGRST116') {
          console.log('Profile not found, creating new profile...');
          
          // Get user data from auth
          const { data: { user }, error: userError } = await supabase.auth.getUser();
          if (userError) {
            console.error('Error getting user data:', userError);
            throw userError;
          }
          
          if (user) {
            const displayName = user.user_metadata?.display_name || 
                              user.email?.split('@')[0] || 
                              'User';
            
            console.log('Creating profile with display name:', displayName);
            
            const { data: newProfile, error: createError } = await supabase
              .from('user_profiles')
              .insert({
                id: userId,
                display_name: displayName,
                profile_image_url: null,
                family_id: null,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              })
              .select()
              .single();
            
            if (createError) {
              console.error('Error creating profile:', createError);
              
              // If it's a duplicate key error, try to fetch the existing profile
              if (createError.code === '23505') {
                console.log('Profile already exists, fetching it...');
                const { data: existingProfile, error: fetchError } = await supabase
                  .from('user_profiles')
                  .select('*')
                  .eq('id', userId)
                  .single();
                
                if (!fetchError && existingProfile) {
                  console.log('Found existing profile:', existingProfile);
                  setAuthState(prev => ({ 
                    ...prev, 
                    profile: existingProfile, 
                    loading: false,
                    initialized: true,
                    error: null
                  }));
                  return;
                }
              }
              
              // If creation failed and this is not the last retry, wait and retry
              if (retryCount < 2) {
                console.log(`Profile creation failed, retrying in ${(retryCount + 1) * 1000}ms...`);
                setTimeout(() => {
                  loadUserProfile(userId, retryCount + 1);
                }, (retryCount + 1) * 1000);
                return;
              }
              
              // If all retries failed, continue without profile but mark as initialized
              console.error('Failed to create profile after retries, continuing without profile');
              setAuthState(prev => ({ 
                ...prev, 
                profile: null, 
                loading: false,
                initialized: true,
                error: 'Failed to load user profile'
              }));
              return;
            }
            
            console.log('Profile created successfully:', newProfile);
            setAuthState(prev => ({ 
              ...prev, 
              profile: newProfile, 
              loading: false,
              initialized: true,
              error: null
            }));
            return;
          }
        }
        
        // For other errors, retry if we haven't exceeded retry count
        if (retryCount < 2) {
          console.log(`Profile loading failed, retrying in ${(retryCount + 1) * 1000}ms...`);
          setTimeout(() => {
            loadUserProfile(userId, retryCount + 1);
          }, (retryCount + 1) * 1000);
          return;
        }
        
        throw error;
      }
      
      console.log('Profile loaded successfully:', profile);
      setAuthState(prev => ({ 
        ...prev, 
        profile, 
        loading: false,
        initialized: true,
        error: null
      }));
    } catch (error) {
      console.error('Error loading user profile:', error);
      
      // Even if profile loading fails, we should still initialize the app
      // The user can use the app without a complete profile
      setAuthState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to load profile',
        loading: false,
        initialized: true
      }));
    }
  }, []);

  // Initialize auth state
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        console.log('Initializing auth...');
        
        // Get initial session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Session error:', error);
          if (mounted) {
            setAuthState(prev => ({ 
              ...prev, 
              error: error.message, 
              loading: false,
              initialized: true
            }));
          }
          return;
        }

        console.log('Session loaded:', session ? 'Found' : 'None');

        if (mounted) {
          setAuthState(prev => ({
            ...prev,
            session,
            user: session?.user ?? null,
            loading: session?.user ? true : false, // Keep loading if we have a user but need to load profile
            initialized: !session?.user // If no user, we're done initializing
          }));
        }

        if (session?.user && mounted) {
          await loadUserProfile(session.user.id);
        } else if (mounted) {
          setAuthState(prev => ({ 
            ...prev, 
            loading: false,
            initialized: true
          }));
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        if (mounted) {
          setAuthState(prev => ({
            ...prev,
            error: error instanceof Error ? error.message : 'Authentication initialization failed',
            loading: false,
            initialized: true
          }));
        }
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        
        if (!mounted) return;

        // Handle sign out
        if (event === 'SIGNED_OUT') {
          setAuthState({
            user: null,
            profile: null,
            session: null,
            loading: false,
            error: null,
            initialized: true
          });
          
          // Clear any cached data
          localStorage.removeItem('supabase.auth.token');
          return;
        }

        // Handle sign in or token refresh
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          setAuthState(prev => ({
            ...prev,
            session,
            user: session?.user ?? null,
            error: null,
            loading: session?.user ? true : false,
            initialized: !session?.user
          }));

          if (session?.user) {
            await loadUserProfile(session.user.id);
          }
          return;
        }

        // Handle other events
        setAuthState(prev => ({
          ...prev,
          session,
          user: session?.user ?? null,
          profile: session?.user ? prev.profile : null,
          error: null,
          loading: session?.user && !prev.profile ? true : false,
          initialized: true
        }));
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [loadUserProfile]);

  // Sign up with email and password
  const signUp = useCallback(async (email: string, password: string, displayName?: string) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName
          }
        }
      });

      if (error) throw error;

      // Don't set loading to false here - let the auth state change handler manage it
      return { data, error: null };
    } catch (error) {
      console.error('Sign up error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Sign up failed';
      setAuthState(prev => ({ ...prev, error: errorMessage, loading: false }));
      return { data: null, error: errorMessage };
    }
  }, []);

  // Sign in with email and password
  const signIn = useCallback(async (email: string, password: string) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      // Don't set loading to false here - let the auth state change handler manage it
      return { data, error: null };
    } catch (error) {
      console.error('Sign in error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Sign in failed';
      setAuthState(prev => ({ ...prev, error: errorMessage, loading: false }));
      return { data: null, error: errorMessage };
    }
  }, []);

  // Sign out
  const signOut = useCallback(async () => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));

      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      // Clear local state immediately
      setAuthState({
        user: null,
        profile: null,
        session: null,
        loading: false,
        error: null,
        initialized: true
      });

      // Clear any additional cached data
      localStorage.removeItem('supabase.auth.token');
      localStorage.removeItem('budgetSakkie_locations');
      
      return { error: null };
    } catch (error) {
      console.error('Sign out error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Sign out failed';
      setAuthState(prev => ({ ...prev, error: errorMessage, loading: false }));
      return { error: errorMessage };
    }
  }, []);

  // Update user profile
  const updateProfile = useCallback(async (updates: Partial<UserProfile>) => {
    if (!authState.user) {
      throw new Error('No authenticated user');
    }

    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));

      const { data, error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('id', authState.user.id)
        .select()
        .single();

      if (error) throw error;

      setAuthState(prev => ({ 
        ...prev, 
        profile: data,
        loading: false 
      }));

      return { data, error: null };
    } catch (error) {
      console.error('Profile update error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Profile update failed';
      setAuthState(prev => ({ ...prev, error: errorMessage, loading: false }));
      return { data: null, error: errorMessage };
    }
  }, [authState.user]);

  // Reset password
  const resetPassword = useCallback(async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Password reset error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Password reset failed';
      return { error: errorMessage };
    }
  }, []);

  // Resend confirmation email
  const resendConfirmationEmail = useCallback(async (email: string) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));

      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email
      });

      if (error) throw error;

      setAuthState(prev => ({ ...prev, loading: false }));
      return { error: null };
    } catch (error) {
      console.error('Resend confirmation error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to resend confirmation email';
      setAuthState(prev => ({ ...prev, error: errorMessage, loading: false }));
      return { error: errorMessage };
    }
  }, []);

  return {
    ...authState,
    signUp,
    signIn,
    signOut,
    updateProfile,
    resetPassword,
    resendConfirmationEmail,
    isAuthenticated: !!authState.user && !!authState.session
  };
};