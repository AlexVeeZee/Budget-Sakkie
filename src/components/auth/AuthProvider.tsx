import React, { useEffect, ReactNode } from 'react';
import { useAuthStore } from '../../store/authStore';
import { Loader2 } from 'lucide-react';

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const { initialize, isLoading } = useAuthStore();
  
  useEffect(() => {
    initialize();
  }, [initialize]);
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }
  
  return <>{children}</>;
};