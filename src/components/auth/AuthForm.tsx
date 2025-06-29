import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Mail, User, Lock, AlertCircle, Loader2 } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { AuthFormState } from '../../types/auth';

interface AuthFormProps {
  mode: 'signin' | 'signup' | 'reset';
  onModeChange: (mode: 'signin' | 'signup' | 'reset' | 'guest') => void;
  onSuccess?: () => void;
}

export const AuthForm: React.FC<AuthFormProps> = ({ 
  mode, 
  onModeChange,
  onSuccess
}) => {
  const { signIn, signUp, resetPassword, isLoading, error: authError } = useAuthStore();
  
  const [formState, setFormState] = useState<AuthFormState>({
    email: '',
    password: '',
    confirmPassword: '',
    username: '',
    displayName: '',
    rememberMe: false,
    errors: {}
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  
  // Reset form errors when mode changes
  useEffect(() => {
    setFormState(prev => ({ ...prev, errors: {} }));
    setFormError(null);
    setFormSuccess(null);
  }, [mode]);
  
  // Set form error from auth store
  useEffect(() => {
    if (authError) {
      setFormError(authError);
    }
  }, [authError]);
  
  const validateForm = (): boolean => {
    const errors: AuthFormState['errors'] = {};
    
    // Email validation
    if (!formState.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formState.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (mode !== 'reset') {
      // Password validation
      if (!formState.password) {
        errors.password = 'Password is required';
      } else if (formState.password.length < 6) {
        errors.password = 'Password must be at least 6 characters';
      }
      
      if (mode === 'signup') {
        // Username validation
        if (!formState.username) {
          errors.username = 'Username is required';
        } else if (formState.username.length < 3) {
          errors.username = 'Username must be at least 3 characters';
        } else if (!/^[a-zA-Z0-9_]+$/.test(formState.username)) {
          errors.username = 'Username can only contain letters, numbers, and underscores';
        }
        
        // Confirm password validation
        if (formState.password !== formState.confirmPassword) {
          errors.confirmPassword = 'Passwords do not match';
        }
      }
    }
    
    setFormState(prev => ({ ...prev, errors }));
    return Object.keys(errors).length === 0;
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    
    setFormState(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
      errors: {
        ...prev.errors,
        [name]: undefined // Clear error when field is changed
      }
    }));
    
    // Clear form-level errors when user types
    setFormError(null);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      if (mode === 'signin') {
        const { success, error } = await signIn({
          email: formState.email,
          password: formState.password,
          rememberMe: formState.rememberMe
        });
        
        if (success) {
          setFormSuccess('Sign in successful!');
          onSuccess?.();
        } else if (error) {
          setFormError(error);
        }
      } else if (mode === 'signup') {
        const { success, error } = await signUp({
          email: formState.email,
          password: formState.password,
          username: formState.username,
          displayName: formState.displayName || formState.username
        });
        
        if (success) {
          if (error && error.includes('confirmation')) {
            // Email confirmation required
            setFormSuccess('Account created! Please check your email to confirm your account.');
          } else {
            setFormSuccess('Account created successfully!');
            onSuccess?.();
          }
        } else if (error) {
          setFormError(error);
        }
      } else if (mode === 'reset') {
        const { success, error } = await resetPassword(formState.email);
        
        if (success) {
          setFormSuccess('Password reset instructions sent to your email.');
        } else if (error) {
          setFormError(error);
        }
      }
    } catch (error) {
      setFormError('An unexpected error occurred. Please try again.');
    }
  };
  
  return (
    <div className="w-full max-w-md mx-auto">
      {/* Form Success Message */}
      {formSuccess && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800">{formSuccess}</p>
        </div>
      )}
      
      {/* Form Error Message */}
      {formError && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2">
          <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
          <p className="text-red-800">{formError}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Email Field */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email Address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={formState.email}
              onChange={handleInputChange}
              className={`block w-full pl-10 pr-3 py-2 border ${
                formState.errors.email ? 'border-red-300' : 'border-gray-300'
              } rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500`}
              placeholder="you@example.com"
            />
          </div>
          {formState.errors.email && (
            <p className="mt-1 text-sm text-red-600">{formState.errors.email}</p>
          )}
        </div>
        
        {/* Username Field - Only for Sign Up */}
        {mode === 'signup' && (
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                value={formState.username}
                onChange={handleInputChange}
                className={`block w-full pl-10 pr-3 py-2 border ${
                  formState.errors.username ? 'border-red-300' : 'border-gray-300'
                } rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500`}
                placeholder="johndoe"
              />
            </div>
            {formState.errors.username && (
              <p className="mt-1 text-sm text-red-600">{formState.errors.username}</p>
            )}
          </div>
        )}
        
        {/* Display Name Field - Only for Sign Up */}
        {mode === 'signup' && (
          <div>
            <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-1">
              Display Name (Optional)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="displayName"
                name="displayName"
                type="text"
                value={formState.displayName}
                onChange={handleInputChange}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                placeholder="John Doe"
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">
              This is how your name will appear to others. If left blank, your username will be used.
            </p>
          </div>
        )}
        
        {/* Password Field - Not for Reset Password */}
        {mode !== 'reset' && (
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                value={formState.password}
                onChange={handleInputChange}
                className={`block w-full pl-10 pr-10 py-2 border ${
                  formState.errors.password ? 'border-red-300' : 'border-gray-300'
                } rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500`}
                placeholder={mode === 'signin' ? '••••••••' : 'Min. 6 characters'}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
            {formState.errors.password && (
              <p className="mt-1 text-sm text-red-600">{formState.errors.password}</p>
            )}
          </div>
        )}
        
        {/* Confirm Password Field - Only for Sign Up */}
        {mode === 'signup' && (
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                autoComplete="new-password"
                value={formState.confirmPassword}
                onChange={handleInputChange}
                className={`block w-full pl-10 pr-10 py-2 border ${
                  formState.errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                } rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500`}
                placeholder="••••••••"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
            {formState.errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600">{formState.errors.confirmPassword}</p>
            )}
          </div>
        )}
        
        {/* Remember Me Checkbox - Only for Sign In */}
        {mode === 'signin' && (
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="rememberMe"
                name="rememberMe"
                type="checkbox"
                checked={formState.rememberMe}
                onChange={handleInputChange}
                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              />
              <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700">
                Remember me
              </label>
            </div>
            
            <div className="text-sm">
              <button
                type="button"
                onClick={() => onModeChange('reset')}
                className="font-medium text-green-600 hover:text-green-500"
              >
                Forgot your password?
              </button>
            </div>
          </div>
        )}
        
        {/* Submit Button */}
        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-green-400 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              mode === 'signin' ? 'Sign In' : mode === 'signup' ? 'Create Account' : 'Reset Password'
            )}
          </button>
        </div>
        
        {/* Mode Toggle Links */}
        <div className="text-sm text-center">
          {mode === 'signin' && (
            <p className="text-gray-600">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => onModeChange('signup')}
                className="font-medium text-green-600 hover:text-green-500"
              >
                Sign up
              </button>
            </p>
          )}
          
          {mode === 'signup' && (
            <p className="text-gray-600">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => onModeChange('signin')}
                className="font-medium text-green-600 hover:text-green-500"
              >
                Sign in
              </button>
            </p>
          )}
          
          {mode === 'reset' && (
            <p className="text-gray-600">
              Remember your password?{' '}
              <button
                type="button"
                onClick={() => onModeChange('signin')}
                className="font-medium text-green-600 hover:text-green-500"
              >
                Sign in
              </button>
            </p>
          )}
        </div>
      </form>
    </div>
  );
};