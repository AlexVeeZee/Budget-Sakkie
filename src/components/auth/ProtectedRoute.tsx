import React from 'react';
import { useAuthStore } from '../../store/authStore';
import { AuthModal } from './AuthModal';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowGuest?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  allowGuest = false 
}) => {
  const { isAuthenticated, isGuest, isLoading } = useAuthStore();
  const [showAuthModal, setShowAuthModal] = React.useState(false);
  
  // If still loading, show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }
  
  // If authenticated or guest is allowed and user is a guest, show children
  if (isAuthenticated || (allowGuest && isGuest)) {
    return <>{children}</>;
  }
  
  // Otherwise, show login prompt
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h2>
        <p className="text-gray-600 mb-6">
          You need to sign in to access this page.
          {allowGuest && ' You can also continue as a guest.'}
        </p>
        
        <div className="space-y-3">
          <button
            onClick={() => setShowAuthModal(true)}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            Sign In
          </button>
          
          {allowGuest && (
            <button
              onClick={() => setShowAuthModal(true)}
              className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Continue as Guest
            </button>
          )}
        </div>
      </div>
      
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode={allowGuest ? 'guest' : 'signin'}
      />
    </div>
  );
};