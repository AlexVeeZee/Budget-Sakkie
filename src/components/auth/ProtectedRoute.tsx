import React from 'react';
import { useAuth } from '../../hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  fallback 
}) => {
  const { isAuthenticated, loading, initialized } = useAuth();

  // Show loading spinner while initializing auth
  if (!initialized || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Budget Sakkie...</p>
        </div>
      </div>
    );
  }

  // Show fallback or auth modal if not authenticated
  if (!isAuthenticated) {
    return fallback || (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Welcome to Budget Sakkie</h1>
          <p className="text-gray-600 mb-6">
            Smart grocery shopping for South African families. Compare prices, save money, and shop smarter.
          </p>
          <p className="text-sm text-gray-500">
            Please sign in to continue
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};