import React, { useState } from 'react';
import { User, Settings, CreditCard, MapPin, Bell, Shield, HelpCircle, LogOut, Edit2, TrendingUp } from 'lucide-react';
import { useLanguage } from '../../hooks/useLanguage';
import { useAuth } from '../../hooks/useAuth';

export const ProfileTab: React.FC = () => {
  const { t, language, toggleLanguage } = useLanguage();
  const { user, signOut } = useAuth();
  const [editingBudget, setEditingBudget] = useState(false);
  const [monthlyBudget, setMonthlyBudget] = useState(1500);
  const [isSigningOut, setIsSigningOut] = useState(false);

  console.log('ProfileTab rendering, user:', user);

  const profileStats = [
    { label: 'Total Saved', value: 'R1,247.50', icon: TrendingUp, color: 'text-green-600' },
    { label: 'Lists Created', value: '12', icon: User, color: 'text-blue-600' },
    { label: 'Products Compared', value: '156', icon: Settings, color: 'text-purple-600' },
  ];

  const menuSections = [
    {
      title: 'Account',
      items: [
        { icon: User, label: 'Personal Information', action: () => console.log('Personal Information clicked') },
        { icon: MapPin, label: t('profile.location'), value: 'Centurion, GP', action: () => console.log('Location clicked') },
        { icon: CreditCard, label: t('profile.loyalty_cards'), value: '3 cards', action: () => console.log('Loyalty cards clicked') },
      ]
    },
    {
      title: 'Preferences',
      items: [
        { 
          icon: Settings, 
          label: t('profile.language'), 
          value: language === 'en' ? 'English' : 'Afrikaans', 
          action: () => {
            console.log('Language toggle clicked');
            toggleLanguage();
          }
        },
        { icon: Bell, label: 'Notifications', value: 'Enabled', action: () => console.log('Notifications clicked') },
        { icon: Shield, label: 'Privacy & Security', action: () => console.log('Privacy clicked') },
      ]
    },
    {
      title: 'Support',
      items: [
        { icon: HelpCircle, label: 'Help & Support', action: () => console.log('Help clicked') },
      ]
    }
  ];

  const handleSignOut = async () => {
    if (isSigningOut) return;
    
    const confirmed = window.confirm('Are you sure you want to sign out?');
    if (!confirmed) return;

    setIsSigningOut(true);
    
    try {
      await signOut();
      console.log('Sign out successful');
    } catch (error) {
      console.error('Error signing out:', error);
      alert('Failed to sign out. Please try again.');
    } finally {
      setIsSigningOut(false);
    }
  };

  const handleMenuItemClick = (action: () => void, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    console.log('Menu item clicked');
    action();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Debug Info */}
      <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-medium text-blue-900">Debug Info</h4>
        <p className="text-sm text-blue-700">ProfileTab is rendering successfully</p>
        <p className="text-sm text-blue-700">User: {user?.displayName || 'Not logged in'}</p>
        <p className="text-sm text-blue-700">Timestamp: {new Date().toLocaleTimeString()}</p>
      </div>

      {/* Profile Header */}
      <div className="bg-gradient-to-r from-green-600 via-orange-500 to-blue-600 rounded-xl p-6 text-white mb-6">
        <div className="flex items-center space-x-4">
          <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center overflow-hidden">
            {user?.profileImageUrl ? (
              <img 
                src={user.profileImageUrl} 
                alt={user.displayName}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="h-10 w-10" />
            )}
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold">{user?.displayName || 'User'}</h2>
            <p className="text-white text-opacity-90">{user?.email || 'user@example.com'}</p>
            <p className="text-white text-opacity-90">Member since January 2024</p>
            <p className="text-white text-opacity-90">Family of 4 • Premium Member</p>
          </div>
          <button className="p-2 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors">
            <Edit2 className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {profileStats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl p-4 text-center shadow-sm">
            <div className={`inline-flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 mb-2`}>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-sm text-gray-600">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Monthly Budget */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{t('profile.budget')}</h3>
          <button
            onClick={() => setEditingBudget(!editingBudget)}
            className="text-blue-600 hover:text-blue-700 font-medium text-sm"
          >
            {editingBudget ? 'Save' : 'Edit'}
          </button>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Monthly Budget</span>
            {editingBudget ? (
              <input
                type="number"
                value={monthlyBudget}
                onChange={(e) => setMonthlyBudget(Number(e.target.value))}
                className="w-24 px-2 py-1 border border-gray-300 rounded text-right"
              />
            ) : (
              <span className="text-xl font-bold text-gray-900">R{monthlyBudget.toFixed(2)}</span>
            )}
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Spent This Month</span>
            <span className="text-lg font-semibold text-orange-600">R847.30</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Remaining</span>
            <span className="text-lg font-semibold text-green-600">R652.70</span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(847.30 / monthlyBudget) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Menu Sections */}
      {menuSections.map((section, sectionIndex) => (
        <div key={sectionIndex} className="bg-white rounded-xl shadow-sm overflow-hidden mb-4">
          <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
            <h4 className="font-semibold text-gray-900">{section.title}</h4>
          </div>
          <div className="divide-y divide-gray-200">
            {section.items.map((item, itemIndex) => (
              <button
                key={itemIndex}
                onClick={(e) => handleMenuItemClick(item.action, e)}
                className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors text-left"
              >
                <div className="flex items-center space-x-3">
                  <item.icon className="h-5 w-5 text-gray-600" />
                  <span className="font-medium text-gray-900">{item.label}</span>
                </div>
                {item.value && (
                  <span className="text-sm text-gray-600">{item.value}</span>
                )}
              </button>
            ))}
          </div>
        </div>
      ))}

      {/* Sign Out Section */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-4">
        <div className="divide-y divide-gray-200">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleSignOut();
            }}
            disabled={isSigningOut}
            className="w-full flex items-center justify-between px-6 py-4 hover:bg-red-50 transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex items-center space-x-3">
              <LogOut className="h-5 w-5 text-red-600" />
              <span className="font-medium text-red-600">
                {isSigningOut ? 'Signing Out...' : 'Sign Out'}
              </span>
            </div>
            {isSigningOut && (
              <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
            )}
          </button>
        </div>
      </div>

      {/* App Info */}
      <div className="bg-gray-50 rounded-xl p-6 text-center">
        <h4 className="font-semibold text-gray-900 mb-2">Budget Sakkie</h4>
        <p className="text-sm text-gray-600 mb-1">Version 1.0.0</p>
        <p className="text-xs text-gray-500">Made with ❤️ for South African families</p>
      </div>
    </div>
  );
};