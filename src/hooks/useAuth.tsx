import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  displayName: string;
  profileImageUrl?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  initialized: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string, displayName: string) => Promise<{ data?: any; error?: string }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error?: string }>;
  resendConfirmationEmail: (email: string) => Promise<{ error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize auth state with Sarah's data as default
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check for existing session
        const savedUser = localStorage.getItem('budgetSakkie_user');
        if (savedUser) {
          setUser(JSON.parse(savedUser));
        } else {
          // Set Sarah as the default logged-in user for demo purposes
          const defaultUser: User = {
            id: 'sarah-1',
            email: 'sarah.vandermerwe@email.com',
            displayName: 'Sarah Van Der Merwe',
            profileImageUrl: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop'
          };
          
          setUser(defaultUser);
          localStorage.setItem('budgetSakkie_user', JSON.stringify(defaultUser));
          localStorage.setItem('budgetSakkie_token', 'demo-jwt-token');
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setInitialized(true);
      }
    };

    initializeAuth();
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock successful sign in with Sarah's data
      const mockUser: User = {
        id: 'sarah-1',
        email: 'sarah.vandermerwe@email.com',
        displayName: 'Sarah Van Der Merwe',
        profileImageUrl: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop'
      };

      setUser(mockUser);
      localStorage.setItem('budgetSakkie_user', JSON.stringify(mockUser));
      localStorage.setItem('budgetSakkie_token', 'demo-jwt-token');

      return {};
    } catch (error) {
      const errorMessage = 'Invalid login credentials';
      setError(errorMessage);
      return { error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, displayName: string) => {
    setLoading(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Mock successful sign up
      const mockUser: User = {
        id: Date.now().toString(),
        email,
        displayName,
        profileImageUrl: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop'
      };

      setUser(mockUser);
      localStorage.setItem('budgetSakkie_user', JSON.stringify(mockUser));
      localStorage.setItem('budgetSakkie_token', 'demo-jwt-token');

      return { data: mockUser };
    } catch (error) {
      const errorMessage = 'Failed to create account';
      setError(errorMessage);
      return { error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

      // Clear user data
      setUser(null);
      localStorage.removeItem('budgetSakkie_user');
      localStorage.removeItem('budgetSakkie_token');
      localStorage.removeItem('budgetSakkie_locations');
      localStorage.removeItem('budgetSakkie_currency');

      // Clear any other app-specific data
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('budgetSakkie_')) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));

    } catch (error) {
      console.error('Error during sign out:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    setLoading(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock successful password reset
      return {};
    } catch (error) {
      const errorMessage = 'Failed to send password reset email';
      setError(errorMessage);
      return { error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const resendConfirmationEmail = async (email: string) => {
    setLoading(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock successful resend
      return {};
    } catch (error) {
      const errorMessage = 'Failed to resend confirmation email';
      setError(errorMessage);
      return { error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const contextValue: AuthContextType = {
    user,
    isAuthenticated: !!user,
    loading,
    initialized,
    error,
    signIn,
    signUp,
    signOut,
    resetPassword,
    resendConfirmationEmail
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};