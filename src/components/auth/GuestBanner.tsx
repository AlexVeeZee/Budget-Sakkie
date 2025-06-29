import React, { useState } from 'react';
import { UserPlus, X } from 'lucide-react';
import { GuestConversionModal } from './GuestConversionModal';

export const GuestBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [showConversionModal, setShowConversionModal] = useState(false);
  
  if (!isVisible) return null;
  
  return (
    <>
      <div className="bg-blue-50 border-b border-blue-200 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="hidden sm:flex h-8 w-8 bg-blue-100 rounded-full items-center justify-center">
              <UserPlus className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-blue-800">
                You're browsing as a guest
              </p>
              <p className="text-xs text-blue-600">
                Create an account to save your data and access all features
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowConversionModal(true)}
              className="text-xs sm:text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md transition-colors"
            >
              Create Account
            </button>
            <button
              onClick={() => setIsVisible(false)}
              className="text-blue-600 hover:text-blue-800"
              aria-label="Dismiss"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
      
      <GuestConversionModal
        isOpen={showConversionModal}
        onClose={() => setShowConversionModal(false)}
      />
    </>
  );
};