import React, { useState, useRef, useEffect } from 'react';
import { User, LogOut, Settings, UserPlus, LogIn, ChevronDown } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { AuthModal } from './AuthModal';
import { GuestConversionModal } from './GuestConversionModal';

interface UserProfileDropdownProps {
  onSettingsClick?: () => void;
}

export const UserProfileDropdown: React.FC<UserProfileDropdownProps> = ({ 
  onSettingsClick 
}) => {
  const { user, isAuthenticated, isGuest, signOut } = useAuthStore();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup'>('signin');
  const [showConversionModal, setShowConversionModal] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const handleSignIn = () => {
    setAuthModalMode('signin');
    setShowAuthModal(true);
    setIsDropdownOpen(false);
  };
  
  const handleSignUp = () => {
    setAuthModalMode('signup');
    setShowAuthModal(true);
    setIsDropdownOpen(false);
  };
  
  const handleSignOut = async () => {
    await signOut();
    setIsDropdownOpen(false);
  };
  
  const handleConvertAccount = () => {
    setShowConversionModal(true);
    setIsDropdownOpen(false);
  };
  
  const handleSettingsClick = () => {
    if (onSettingsClick) {
      onSettingsClick();
      setIsDropdownOpen(false);
    }
  };
  
  return (
    <div className="relative" ref={dropdownRef}>
      {/* Profile Button */}
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
          {user?.avatarUrl ? (
            <img 
              src={user.avatarUrl} 
              alt={user.displayName || user.username} 
              className="w-full h-full object-cover"
            />
          ) : (
            <User className="h-5 w-5 text-gray-500" />
          )}
        </div>
        <div className="hidden md:block text-left">
          <p className="text-sm font-medium text-gray-700">
            {isAuthenticated 
              ? (user?.displayName || user?.username) 
              : isGuest 
                ? user?.username 
                : 'Sign In'
            }
          </p>
          <p className="text-xs text-gray-500">
            {isAuthenticated 
              ? 'Account' 
              : isGuest 
                ? 'Guest User' 
                : 'Create Account'
            }
          </p>
        </div>
        <ChevronDown className="h-4 w-4 text-gray-500" />
      </button>
      
      {/* Dropdown Menu */}
      {isDropdownOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200">
          {isAuthenticated ? (
            <>
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.displayName || user?.username}
                </p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
              <button
                onClick={handleSettingsClick}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
              >
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </button>
              <button
                onClick={handleSignOut}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </button>
            </>
          ) : isGuest ? (
            <>
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-900">
                  {user?.username}
                </p>
                <p className="text-xs text-gray-500">Guest User</p>
              </div>
              <button
                onClick={handleConvertAccount}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
              >
                <UserPlus className="h-4 w-4" />
                <span>Create Account</span>
              </button>
              <button
                onClick={handleSignIn}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
              >
                <LogIn className="h-4 w-4" />
                <span>Sign In</span>
              </button>
              <button
                onClick={handleSignOut}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
              >
                <LogOut className="h-4 w-4" />
                <span>Exit Guest Mode</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleSignIn}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
              >
                <LogIn className="h-4 w-4" />
                <span>Sign In</span>
              </button>
              <button
                onClick={handleSignUp}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
              >
                <UserPlus className="h-4 w-4" />
                <span>Create Account</span>
              </button>
            </>
          )}
        </div>
      )}
      
      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode={authModalMode}
      />
      
      {/* Guest Conversion Modal */}
      <GuestConversionModal
        isOpen={showConversionModal}
        onClose={() => setShowConversionModal(false)}
      />
    </div>
  );
};