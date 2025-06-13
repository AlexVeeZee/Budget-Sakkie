import React, { useState } from 'react';
import { X, Mail, Lock, User, Eye, EyeOff, Loader2, CheckCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'signin' | 'signup';
}

export const AuthModal: React.FC<AuthModalProps> = ({ 
  isOpen, 
  onClose, 
  initialMode = 'signin' 
}) => {
  const [mode, setMode] = useState<'signin' | 'signup' | 'reset'>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [resendingConfirmation, setResendingConfirmation] = useState(false);
  const [confirmationSent, setConfirmationSent] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    displayName: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { signIn, signUp, resetPassword, resendConfirmationEmail, loading, error } = useAuth();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (mode !== 'reset') {
      if (!formData.password) {
        newErrors.password = 'Password is required';
      } else if (formData.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
      }

      if (mode === 'signup') {
        if (!formData.displayName.trim()) {
          newErrors.displayName = 'Display name is required';
        } else if (formData.displayName.trim().length < 2) {
          newErrors.displayName = 'Display name must be at least 2 characters';
        }

        if (formData.password !== formData.confirmPassword) {
          newErrors.confirmPassword = 'Passwords do not match';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      if (mode === 'signin') {
        const { error } = await signIn(formData.email, formData.password);
        if (!error) {
          setShowSuccess(true);
          setTimeout(() => {
            onClose();
            setShowSuccess(false);
          }, 1500);
        }
      } else if (mode === 'signup') {
        const { data, error } = await signUp(
          formData.email, 
          formData.password, 
          formData.displayName.trim()
        );
        
        if (!error) {
          setShowSuccess(true);
          setTimeout(() => {
            onClose();
            setShowSuccess(false);
          }, 2000);
        }
      } else if (mode === 'reset') {
        const { error } = await resetPassword(formData.email);
        if (!error) {
          setShowSuccess(true);
          setTimeout(() => {
            setMode('signin');
            setShowSuccess(false);
          }, 2000);
        }
      }
    } catch (err) {
      console.error('Auth error:', err);
    }
  };

  const handleResendConfirmation = async () => {
    if (!formData.email) return;

    setResendingConfirmation(true);
    setConfirmationSent(false);

    try {
      const { error } = await resendConfirmationEmail(formData.email);
      if (!error) {
        setConfirmationSent(true);
        setTimeout(() => setConfirmationSent(false), 5000);
      }
    } catch (err) {
      console.error('Resend confirmation error:', err);
    } finally {
      setResendingConfirmation(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      displayName: ''
    });
    setErrors({});
    setShowSuccess(false);
    setConfirmationSent(false);
  };

  const handleModeChange = (newMode: 'signin' | 'signup' | 'reset') => {
    setMode(newMode);
    resetForm();
  };

  const isEmailNotConfirmedError = error && (
    error.toLowerCase().includes('email not confirmed') ||
    error.toLowerCase().includes('email_not_confirmed')
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
        {/* Success State */}
        {showSuccess && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {mode === 'signin' && 'Welcome back!'}
              {mode === 'signup' && 'Account created successfully!'}
              {mode === 'reset' && 'Reset email sent!'}
            </h3>
            <p className="text-gray-600">
              {mode === 'signin' && 'Redirecting to your dashboard...'}
              {mode === 'signup' && 'Setting up your account...'}
              {mode === 'reset' && 'Check your email for reset instructions.'}
            </p>
          </div>
        )}

        {/* Form State */}
        {!showSuccess && (
          <>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {mode === 'signin' && 'Welcome Back'}
                {mode === 'signup' && 'Create Account'}
                {mode === 'reset' && 'Reset Password'}
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            {/* Subtitle */}
            <p className="text-gray-600 mb-6">
              {mode === 'signin' && 'Sign in to your Budget Sakkie account'}
              {mode === 'signup' && 'Join thousands of families saving money on groceries'}
              {mode === 'reset' && 'Enter your email to receive a password reset link'}
            </p>

            {/* Email Confirmation Error */}
            {isEmailNotConfirmedError && (
              <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-start space-x-3">
                  <Mail className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-amber-800 mb-1">
                      Email Confirmation Required
                    </h4>
                    <p className="text-sm text-amber-700 mb-3">
                      Please check your inbox and click the confirmation link to verify your email address before signing in.
                    </p>
                    {confirmationSent && (
                      <div className="mb-3 p-2 bg-green-50 border border-green-200 rounded text-sm text-green-700">
                        ✓ Confirmation email sent! Check your inbox.
                      </div>
                    )}
                    <button
                      onClick={handleResendConfirmation}
                      disabled={resendingConfirmation || !formData.email}
                      className="inline-flex items-center space-x-2 text-sm text-amber-700 hover:text-amber-800 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {resendingConfirmation ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <RefreshCw className="h-4 w-4" />
                      )}
                      <span>
                        {resendingConfirmation ? 'Sending...' : 'Resend confirmation email'}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Other Error Messages */}
            {error && !isEmailNotConfirmedError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Display Name (Signup only) */}
              {mode === 'signup' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Display Name *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      value={formData.displayName}
                      onChange={(e) => handleInputChange('displayName', e.target.value)}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
                        errors.displayName ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Enter your display name"
                    />
                  </div>
                  {errors.displayName && (
                    <p className="mt-1 text-sm text-red-600">{errors.displayName}</p>
                  )}
                </div>
              )}

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
                      errors.email ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter your email"
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              {/* Password (not for reset) */}
              {mode !== 'reset' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
                        errors.password ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                  )}
                  {mode === 'signup' && (
                    <p className="mt-1 text-xs text-gray-500">
                      Password must be at least 6 characters long
                    </p>
                  )}
                </div>
              )}

              {/* Confirm Password (Signup only) */}
              {mode === 'signup' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
                        errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Confirm your password"
                    />
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                  )}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                <span>
                  {loading && mode === 'signin' && 'Signing In...'}
                  {loading && mode === 'signup' && 'Creating Account...'}
                  {loading && mode === 'reset' && 'Sending Email...'}
                  {!loading && mode === 'signin' && 'Sign In'}
                  {!loading && mode === 'signup' && 'Create Account'}
                  {!loading && mode === 'reset' && 'Send Reset Email'}
                </span>
              </button>
            </form>

            {/* Footer Links */}
            <div className="mt-6 text-center space-y-2">
              {mode === 'signin' && (
                <>
                  <button
                    onClick={() => handleModeChange('reset')}
                    className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    Forgot your password?
                  </button>
                  <p className="text-sm text-gray-600">
                    Don't have an account?{' '}
                    <button
                      onClick={() => handleModeChange('signup')}
                      className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
                    >
                      Sign up
                    </button>
                  </p>
                </>
              )}

              {mode === 'signup' && (
                <p className="text-sm text-gray-600">
                  Already have an account?{' '}
                  <button
                    onClick={() => handleModeChange('signin')}
                    className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
                  >
                    Sign in
                  </button>
                </p>
              )}

              {mode === 'reset' && (
                <button
                  onClick={() => handleModeChange('signin')}
                  className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
                >
                  Back to sign in
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};