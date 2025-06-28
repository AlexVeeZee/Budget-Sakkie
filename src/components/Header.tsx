import React, { useState, useRef, useEffect } from 'react';
import { ShoppingCart, Search, Menu, Globe, MapPin, ChevronDown } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';
import { UserProfileDropdown } from './auth/UserProfileDropdown';
import { useLocation } from '../hooks/useLocation';
import { useAuthStore } from '../store/authStore';

interface HeaderProps {
  onMenuClick: () => void;
  onSearchClick: () => void;
  onSettingsClick?: () => void;
  onLocationClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  onMenuClick, 
  onSearchClick,
  onSettingsClick,
  onLocationClick
}) => {
  const { language, toggleLanguage, t } = useLanguage();
  const { currentLocation, savedLocations, setCurrentLocation } = useLocation();
  const { user } = useAuthStore();
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Check if user has an address set in their profile
  const hasAddress = user && user.address;
  
  // Get all available locations
  const allLocations = [
    ...savedLocations,
    // Don't include recent locations in the dropdown to keep it clean
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowLocationDropdown(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header 
      className="text-white shadow-lg sticky top-0 z-50"
      style={{ 
        background: 'linear-gradient(to right, #059669, #f97316, #2563eb)',
        backgroundColor: '#059669' // Fallback solid color
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <button
              onClick={onMenuClick}
              className="p-2 rounded-md hover:bg-black/10 transition-colors"
              style={{ backgroundColor: 'transparent' }}
            >
              <Menu className="h-6 w-6" />
            </button>
            
            <div className="flex items-center space-x-2">
              <ShoppingCart className="h-8 w-8" />
              <div>
                <h1 className="text-xl font-bold">{t('header.title')}</h1>
                <p className="text-xs text-white/80">{t('header.subtitle')}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Current Location Display - Only show if user has an address */}
            {hasAddress && (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => {
                    if (onLocationClick) {
                      // If clicking when dropdown is open, just close the dropdown
                      if (showLocationDropdown) {
                        setShowLocationDropdown(false);
                      } else {
                        // If location modal handler is provided, use it
                        onLocationClick();
                      }
                    } else {
                      // Otherwise toggle the dropdown
                      setShowLocationDropdown(!showLocationDropdown);
                    }
                  }}
                  className="hidden sm:flex items-center space-x-2 px-3 py-1 rounded-md text-sm font-medium hover:bg-black/10 transition-colors"
                >
                  <MapPin className="h-4 w-4" />
                  <span className="hidden sm:inline">{currentLocation.name}</span>
                  <ChevronDown className="h-3 w-3" />
                </button>
                
                {/* Location Dropdown */}
                {showLocationDropdown && (
                  <div className="absolute right-0 mt-1 w-56 bg-white rounded-md shadow-lg overflow-hidden z-10">
                    <div className="py-1">
                      {allLocations.map((location) => (
                        <button
                          key={location.id}
                          onClick={() => {
                            setCurrentLocation(location);
                            setShowLocationDropdown(false);
                          }}
                          className={`w-full text-left px-4 py-2 text-sm ${
                            currentLocation.id === location.id
                              ? 'bg-green-50 text-green-700'
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          {location.name}
                        </button>
                      ))}
                      
                      <div className="border-t border-gray-100 mt-1 pt-1">
                        <button
                          onClick={() => {
                            if (onLocationClick) {
                              onLocationClick();
                              setShowLocationDropdown(false);
                            }
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-blue-50"
                        >
                          Manage Locations
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            <button
              onClick={onSearchClick}
              className="p-2 rounded-md hover:bg-black/10 transition-colors"
              style={{ backgroundColor: 'transparent' }}
            >
              <Search className="h-6 w-6" />
            </button>
            
            <button
              onClick={toggleLanguage}
              className="hidden sm:flex items-center space-x-1 px-3 py-1 rounded-md hover:bg-black/10 transition-colors text-sm font-medium"
              style={{ backgroundColor: 'transparent' }}
            >
              <Globe className="h-4 w-4" />
              <span>{language.toUpperCase()}</span>
            </button>
            
            {/* User Profile Dropdown */}
            <UserProfileDropdown onSettingsClick={onSettingsClick} />
          </div>
        </div>
      </div>
    </header>
  );
};