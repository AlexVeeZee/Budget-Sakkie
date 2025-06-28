import React, { useState, useEffect } from 'react';
import { X, UserPlus, LogIn, ShieldCheck } from 'lucide-react';
import { AuthForm } from './AuthForm';
import { GuestAccessForm } from './GuestAccessForm';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'signin' | 'signup' | 'reset' | 'guest';
}

export const AuthModal: React.FC<AuthModalProps> = ({ 
  isOpen, 
  onClose, 
  initialMode = 'signin' 
}) => {
  const [mode, setMode] = useState<'signin' | 'signup' | 'reset' | 'guest'>(initialMode);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  
  // Reset mode when modal opens
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setShowSuccessMessage(false);
    }
  }, [isOpen, initialMode]);
  
  const handleSuccess = () => {
    setShowSuccessMessage(true);
    setTimeout(() => {
      onClose();
      setShowSuccessMessage(false);
    }, 1500);
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              {mode === 'signin' && <LogIn className="h-5 w-5 text-green-600" />}
              {mode === 'signup' && <UserPlus className="h-5 w-5 text-green-600" />}
              {mode === 'reset' && <ShieldCheck className="h-5 w-5 text-green-600" />}
              {mode === 'guest' && <UserPlus className="h-5 w-5 text-green-600" />}
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              {mode === 'signin' && 'Sign In'}
              {mode === 'signup' && 'Create Account'}
              {mode === 'reset' && 'Reset Password'}
              {mode === 'guest' && 'Continue as Guest'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>
        
        {/* Success Message */}
        {showSuccessMessage ? (
          <div className="p-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {mode === 'signin' && 'Welcome back!'}
              {mode === 'signup' && 'Account created!'}
              {mode === 'reset' && 'Check your email!'}
              {mode === 'guest' && 'Welcome, Guest!'}
            </h3>
            <p className="text-gray-600">
              {mode === 'signin' && 'You have successfully signed in.'}
              {mode === 'signup' && 'Your account has been created successfully.'}
              {mode === 'reset' && 'Password reset instructions have been sent to your email.'}
              {mode === 'guest' && 'You can now browse as a guest.'}
            </p>
          </div>
        ) : (
          <div className="p-6">
            {mode === 'guest' ? (
              <GuestAccessForm onSuccess={handleSuccess} />
            ) : (
              <AuthForm 
                mode={mode} 
                onModeChange={(newMode) => setMode(newMode)}
                onSuccess={handleSuccess}
              />
            )}
            
            {/* Guest Access Option */}
            {mode !== 'guest' && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-sm text-center text-gray-600 mb-4">
                  Don't want to create an account yet?
                </p>
                <button
                  type="button"
                  onClick={() => setMode('guest')}
                  className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Continue as Guest
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};