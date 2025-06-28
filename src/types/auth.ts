export interface UserProfile {
  id: string;
  email: string;
  username: string;
  displayName?: string;
  avatarUrl?: string;
  address?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  isGuest: boolean;
  createdAt: string;
  preferences?: UserPreferences;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: 'en' | 'af';
  currency: 'ZAR' | 'USD' | 'EUR' | 'GBP';
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
}

export interface AuthState {
  user: UserProfile | null;
  session: any | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isGuest: boolean;
  error: string | null;
}

export interface SignInCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface SignUpCredentials {
  email: string;
  password: string;
  username: string;
  displayName?: string;
}

export interface AuthFormState {
  email: string;
  password: string;
  confirmPassword: string;
  username: string;
  displayName: string;
  rememberMe: boolean;
  errors: {
    email?: string;
    password?: string;
    confirmPassword?: string;
    username?: string;
    displayName?: string;
    general?: string;
  };
}