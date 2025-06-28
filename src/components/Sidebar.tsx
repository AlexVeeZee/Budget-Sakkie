import React, { useState } from 'react';
import { X, Settings, HelpCircle, Star, Gift, Users, MapPin, LogIn, UserPlus, Home, Briefcase, Map } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';
import { useAuthStore } from '../store/authStore';
import { useLocation } from '../hooks/useLocation';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onSettingsClick: () => void;
  onLocationClick: () => void;
  onLoyaltyCardsClick: () => void;
  onRewardsClick: () => void;
  onFamilySharingClick: () => void;
  onHelpSupportClick: () => void;
  onSignInClick?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen, 
  onClose, 
  onSettingsClick,
  onLocationClick,
  onLoyaltyCardsClick,
  onRewardsClick,
  onFamilySharingClick,
  onHelpSupportClick,
  onSignInClick
}) => {
  const { t } = useLanguage();
  const { isAuthenticated, isGuest, user } = useAuthStore();
  const { currentLocation, homeLocation, savedLocations, setCurrentLocation } = useLocation();
  
  // Show location section if user has saved locations or is authenticated
  const showLocationSection = isAuthenticated || isGuest || savedLocations.length > 0;
  
  // Get all available locations
  const allLocations = [
    homeLocation,
    ...savedLocations.filter(loc => loc.id !== 'home')
  ];

  const authenticatedMenuItems = [
    { 
      icon: Settings, 
      label: t('profile.settings'), 
      action: onSettingsClick
    },
    { 
      icon: Star, 
      label: t('profile.loyalty_cards'), 
      action: onLoyaltyCardsClick
    },
    { 
      icon: Gift, 
      label: 'Rewards', 
      action: onRewardsClick
    },
    { 
      icon: Users, 
      label: 'Family Sharing', 
      action: onFamilySharingClick
    },
    { 
      icon: HelpCircle, 
      label: 'Help & Support', 
      action: onHelpSupportClick
    },
  ];

  const unauthenticatedMenuItems = [
    { 
      icon: LogIn, 
      label: 'Sign In', 
      action: onSignInClick
    },
    { 
      icon: UserPlus, 
      label: 'Create Account', 
      action: onSignInClick
    },
    { 
      icon: HelpCircle, 
      label: 'Help & Support', 
      action: onHelpSupportClick
    },
  ];

  const menuItems = isAuthenticated || isGuest ? authenticatedMenuItems : unauthenticatedMenuItems;

  if (!isOpen) return null;

  return (
    <>
      {/* Sidebar */}
      <div 
        className="fixed left-0 top-0 h-full w-80 z-50 transform transition-transform duration-300 shadow-xl border-r border-gray-200"
        style={{ backgroundColor: '#ffffff' }}
      >
        {/* Header */}
        <div 
          className="p-6 border-b border-gray-200"
          style={{ backgroundColor: '#ffffff' }}
        >
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Budget Sakkie</h2>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              style={{ backgroundColor: 'transparent' }}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-1">Smart Grocery Shopping</p>
        </div>

        {/* Content */}
        <div 
          className="p-6"
          style={{ backgroundColor: '#ffffff' }}
        >
          {(isAuthenticated || isGuest) && user && (
            <div className="bg-gradient-to-r from-green-500 to-blue-500 rounded-lg p-4 text-white mb-6">
              <h3 className="font-semibold mb-1">Welcome, {user.displayName || user.username}</h3>
              {isGuest ? (
                <p className="text-sm opacity-90">Guest Account</p>
              ) : (
                <>
                  <p className="text-sm opacity-90">Monthly Savings: R247.50</p>
                  <p className="text-sm opacity-90">15% saved this month</p>
                </>
              )}
            </div>
          )}

          {/* Locations Section */}
          {showLocationSection && (
            <div className="mb-6">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                My Locations
              </h4>
              <div className="space-y-2">
                {/* Main Location Management Button */}
                <button
                  onClick={onLocationClick}
                  className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors border border-gray-200"
                  style={{ backgroundColor: '#ffffff' }}
                >
                  <MapPin className="h-5 w-5 text-gray-600" />
                  <span className="text-gray-900 font-medium">Manage Locations</span>
                </button>
                
                {/* Individual Locations */}
                {allLocations.map((location) => {
                  // Determine icon based on location type
                  let Icon = MapPin;
                  let iconColor = "text-gray-600";
                  
                  if (location.type === 'home') {
                    Icon = Home;
                    iconColor = "text-green-600";
                  } else if (location.type === 'work') {
                    Icon = Briefcase;
                    iconColor = "text-blue-600";
                  } else if (location.type === 'travel') {
                    Icon = Map;
                    iconColor = "text-purple-600";
                  }
                  
                  return (
                    <button
                      key={location.id}
                      onClick={() => {
                        setCurrentLocation(location);
                        onClose(); // Close sidebar after selection
                      }}
                      className={`w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors border ${
                        currentLocation.id === location.id
                          ? 'border-green-200 bg-green-50'
                          : 'border-gray-200'
                      }`}
                    >
                      <Icon className={`h-5 w-5 ${iconColor}`} />
                      <div className="flex-1 min-w-0">
                        <p className={`font-medium truncate ${
                          currentLocation.id === location.id ? 'text-green-700' : 'text-gray-900'
                        }`}>
                          {location.name}
                        </p>
                        <p className="text-xs text-gray-500 truncate">{location.address}</p>
                      </div>
                      {currentLocation.id === location.id && (
                        <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <nav className="space-y-2">
            {menuItems.map((item, index) => (
              <button
                key={index}
                onClick={item.action}
                className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors border border-gray-200"
                style={{ backgroundColor: '#ffffff' }}
              >
                <item.icon className="h-5 w-5 text-gray-600" />
                <span className="text-gray-900 font-medium">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Footer */}
        <div 
          className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-200"
          style={{ backgroundColor: '#ffffff' }}
        >
          <div className="text-center">
            <p className="text-sm text-gray-600">Version 1.0.0</p>
            <p className="text-xs text-gray-500 mt-1">Made with ❤️ for South African families</p>
          </div>
        </div>
      </div>
    </>
  );
};