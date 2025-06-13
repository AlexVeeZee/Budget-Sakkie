import React, { useState } from 'react';
import { User, Settings, LogOut, Users, ChevronDown } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useFamily } from '../../hooks/useFamily';

export const UserMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, profile, signOut } = useAuth();
  const { family, isInFamily } = useFamily();

  const handleSignOut = async () => {
    await signOut();
    setIsOpen(false);
  };

  if (!user || !profile) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 p-2 rounded-lg hover:bg-black/10 transition-colors text-white"
      >
        {profile.profile_image_url ? (
          <img
            src={profile.profile_image_url}
            alt={profile.display_name || 'User'}
            className="w-8 h-8 rounded-full object-cover"
          />
        ) : (
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
            <User className="h-4 w-4" />
          </div>
        )}
        <span className="hidden sm:block font-medium">
          {profile.display_name || 'User'}
        </span>
        <ChevronDown className="h-4 w-4" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20">
            {/* User Info */}
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="font-medium text-gray-900">
                {profile.display_name || 'User'}
              </p>
              <p className="text-sm text-gray-600">{user.email}</p>
              {isInFamily && family && (
                <p className="text-xs text-blue-600 mt-1">
                  Family: {family.name}
                </p>
              )}
            </div>

            {/* Menu Items */}
            <div className="py-2">
              <button className="w-full flex items-center space-x-3 px-4 py-2 text-left hover:bg-gray-50 transition-colors">
                <Settings className="h-4 w-4 text-gray-600" />
                <span className="text-gray-900">Settings</span>
              </button>
              
              <button className="w-full flex items-center space-x-3 px-4 py-2 text-left hover:bg-gray-50 transition-colors">
                <Users className="h-4 w-4 text-gray-600" />
                <span className="text-gray-900">
                  {isInFamily ? 'Manage Family' : 'Create Family'}
                </span>
              </button>
            </div>

            {/* Sign Out */}
            <div className="border-t border-gray-100 pt-2">
              <button
                onClick={handleSignOut}
                className="w-full flex items-center space-x-3 px-4 py-2 text-left hover:bg-gray-50 transition-colors text-red-600"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};