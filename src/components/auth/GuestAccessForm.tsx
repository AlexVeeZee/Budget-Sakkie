import React, { useState } from 'react';
import { User, Loader2, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

interface GuestAccessFormProps {
  onSuccess?: () => void;
}

export const GuestAccessForm: React.FC<GuestAccessFormProps> = ({ onSuccess }) => {
  const { createGuestSession, isLoading } = useAuthStore();
  const [error, setError] = useState<string | null>(null);
  
  const handleContinueAsGuest = async () => {
    try {
      setError(null);
      await createGuestSession();
      onSuccess?.();
    } catch (err) {
      setError('Failed to create guest session. Please try again.');
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Info Message */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-800 mb-2">Guest Access Information</h3>
        <p className="text-sm text-blue-700">
          You can browse and use basic features without creating an account. Your data will be stored locally on this device only.
        </p>
      </div>
      
      {/* Guest Avatar */}
      <div className="flex flex-col items-center">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <User className="h-10 w-10 text-gray-400" />
        </div>
        <p className="text-gray-600 text-sm">
          You'll be identified as a guest user
        </p>
      </div>
      
      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2">
          <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}
      
      {/* Limitations */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-gray-700">Guest Access Limitations:</h4>
        <ul className="text-sm text-gray-600 space-y-1 list-disc pl-5">
          <li>Your data will only be stored on this device</li>
          <li>You won't be able to sync across devices</li>
          <li>Some features may be limited or unavailable</li>
          <li>You can create an account later to save your data</li>
        </ul>
      </div>
      
      {/* Continue Button */}
      <button
        type="button"
        onClick={handleContinueAsGuest}
        disabled={isLoading}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-green-400 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          'Continue as Guest'
        )}
      </button>
    </div>
  );
};