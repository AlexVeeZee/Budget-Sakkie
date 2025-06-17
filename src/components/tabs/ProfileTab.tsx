import React, { useState } from 'react';
import { User, Settings, CreditCard, MapPin, Bell, Shield, HelpCircle, LogOut, Edit2, TrendingUp, ArrowLeft } from 'lucide-react';
import { useLanguage } from '../../hooks/useLanguage';
import { useAuth } from '../../hooks/useAuth';
import { useRouter } from '../../hooks/useRouter';
import { ProfileSettingsView } from './profile/ProfileSettingsView';
import { SecuritySettingsView } from './profile/SecuritySettingsView';
import { PreferencesView } from './profile/PreferencesView';
import { SupportView } from './profile/SupportView';

export const ProfileTab: React.FC = () => {
  const { t, language, toggleLanguage } = useLanguage();
  const { user, signOut } = useAuth();
  const { currentRoute, navigate } = useRouter();
  const [editingBudget, setEditingBudget] = useState(false);
  const [monthlyBudget, setMonthlyBudget] = useState(1500);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const profileStats = [
    { label: 'Total Saved', value: 'R1,247.50', icon: TrendingUp, color: 'text-green-600' },
    { label: 'Lists Created', value: '12', icon: User, color: 'text-blue-600' },
    { label: 'Products Compared', value: '156', icon: Settings, color: 'text-purple-600' },
  ];

  const menuSections = [
    {
      title: 'Account',
      items: [
        { 
          icon: User, 
          label: 'Profile Settings', 
          route: 'profile/settings' as const,
          description: 'Manage your personal information and preferences'
        },
        { 
          icon: Shield, 
          label: 'Security Settings', 
          route: 'profile/security' as const,
          description: 'Password, two-factor authentication, and security'
        },
        { 
          icon: Settings, 
          label: 'Account Preferences', 
          route: 'profile/preferences' as const,
          description: 'Language, currency, and app preferences'
        },
      ]
    },
    {
      title: 'Support',
      items: [
        { 
          icon: HelpCircle, 
          label: 'Help & Support', 
          route: 'profile/support' as const,
          description: 'Get help, contact support, and view documentation'
        },
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
      navigate('search'); // Navigate to search instead of login since we don't have a login route
    } catch (error) {
      console.error('Error signing out:', error);
      alert('Failed to sign out. Please try again.');
    } finally {
      setIsSigningOut(false);
    }
  };

  const handleMenuItemClick = (route: 'profile/settings' | 'profile/security' | 'profile/preferences' | 'profile/support') => {
    navigate(route);
  };

  const handleBackToProfile = () => {
    navigate('profile');
  };

  // Render specific profile sub-views
  if (currentRoute === 'profile/settings') {
    return <ProfileSettingsView onBack={handleBackToProfile} />;
  }

  if (currentRoute === 'profile/security') {
    return <SecuritySettingsView onBack={handleBackToProfile} />;
  }

  if (currentRoute === 'profile/preferences') {
    return <PreferencesView onBack={handleBackToProfile} />;
  }

  if (currentRoute === 'profile/support') {
    return <SupportView onBack={handleBackToProfile} />;
  }

  // Main profile view
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
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
            <p className="text-white text-opacity-90">{user?.email}</p>
            <p className="text-white text-opacity-90">Member since January 2024</p>
            <p className="text-white text-opacity-90">Family of 4 • Premium Member</p>
          </div>
          <button 
            onClick={() => handleMenuItemClick('profile/settings')}
            className="p-2 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors"
          >
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
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleMenuItemClick(item.route);
                }}
                className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors text-left"
              >
                <div className="flex items-center space-x-3">
                  <item.icon className="h-5 w-5 text-gray-600" />
                  <div>
                    <span className="font-medium text-gray-900">{item.label}</span>
                    <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                  </div>
                </div>
                <div className="text-gray-400">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
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