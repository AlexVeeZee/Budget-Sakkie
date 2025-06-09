import React from 'react';
import { X, Settings, HelpCircle, Star, Gift, Users, MapPin } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onSettingsClick: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, onSettingsClick }) => {
  const { t } = useLanguage();

  const menuItems = [
    { 
      icon: Settings, 
      label: t('profile.settings'), 
      action: onSettingsClick
    },
    { icon: MapPin, label: t('profile.location'), action: () => {} },
    { icon: Star, label: t('profile.loyalty_cards'), action: () => {} },
    { icon: Gift, label: 'Rewards', action: () => {} },
    { icon: Users, label: 'Family Sharing', action: () => {} },
    { icon: HelpCircle, label: 'Help & Support', action: () => {} },
  ];

  if (!isOpen) return null;

  return (
    <>
      {/* Invisible overlay for closing sidebar - only covers the area not occupied by sidebar */}
      <div 
        className="fixed inset-0 z-40"
        onClick={onClose}
        style={{ 
          background: 'transparent',
          paddingLeft: '320px' // Leave space for sidebar
        }}
      />
      
      {/* Sidebar */}
      <div 
        className="fixed left-0 top-0 h-full w-80 z-50 transform transition-transform duration-300 shadow-xl"
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
          <div className="bg-gradient-to-r from-green-500 to-blue-500 rounded-lg p-4 text-white mb-6">
            <h3 className="font-semibold mb-1">Monthly Savings</h3>
            <p className="text-2xl font-bold">R247.50</p>
            <p className="text-sm opacity-90">15% saved this month</p>
          </div>

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