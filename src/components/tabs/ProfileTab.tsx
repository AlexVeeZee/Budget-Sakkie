import React, { useState, useEffect } from 'react';
import { User, Settings, CreditCard, MapPin, Bell, Shield, HelpCircle, LogOut, Edit2, TrendingUp, LogIn, UserPlus } from 'lucide-react';
import { useLanguage } from '../../hooks/useLanguage';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';

interface ProfileTabProps {
  onSettingsClick?: () => void;
  onLocationClick?: () => void;
  onLoyaltyCardsClick?: () => void;
  onRewardsClick?: () => void;
  onFamilySharingClick?: () => void;
  onHelpSupportClick?: () => void;
  onSignInClick?: () => void;
}

export const ProfileTab: React.FC<ProfileTabProps> = ({
  onSettingsClick,
  onLocationClick,
  onLoyaltyCardsClick,
  onRewardsClick,
  onFamilySharingClick,
  onHelpSupportClick,
  onSignInClick
}) => {
  const { t, language, toggleLanguage } = useLanguage();
  const { user, isAuthenticated, signOut } = useAuth();
  const [editingBudget, setEditingBudget] = useState(false);
  const [monthlyBudget, setMonthlyBudget] = useState(1500);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const profileStats = [
    { label: 'Total Saved', value: 'R1,247.50', icon: TrendingUp, color: 'text-green-600' },
    { label: 'Lists Created', value: '12', icon: User, color: 'text-blue-600' },
    { label: 'Products Compared', value: '156', icon: Settings, color: 'text-purple-600' },
  ];

  // Fetch user profile data from Supabase
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!isAuthenticated) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Get the current user
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        
        if (!currentUser) {
          throw new Error('No authenticated user found');
        }
        
        // Fetch user profile from user_profiles table
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', currentUser.id)
          .single();
        
        if (profileError) {
          throw profileError;
        }
        
        setUserProfile(profile);
        
        // Fetch user preferences to get budget
        const { data: preferences, error: preferencesError } = await supabase
          .from('user_preferences')
          .select('*')
          .eq('user_id', currentUser.id)
          .single();
        
        if (preferencesError && preferencesError.code !== 'PGRST116') {
          console.error('Error fetching user preferences:', preferencesError);
        }
        
        if (preferences) {
          // Set budget if available
          setMonthlyBudget(preferences.monthly_budget || 1500);
        }
        
      } catch (err) {
        console.error('Error fetching user profile:', err);
        setError(err instanceof Error ? err.message : 'Failed to load user profile');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [isAuthenticated]);

  // Use actual user data or fallback to Sarah's data
  const displayUser = userProfile ? {
    displayName: userProfile.display_name || 'Guest User',
    email: user?.email || 'guest@example.com',
    profileImageUrl: userProfile.profile_image_url
  } : user || {
    displayName: 'Guest User',
    email: 'guest@example.com',
    profileImageUrl: undefined
  };

  // Use sidebar functionality if available, otherwise fallback to alerts
  const handlePersonalInfo = () => {
    if (onSettingsClick) {
      onSettingsClick();
    } else {
      alert('Personal Information feature coming soon!');
    }
  };

  const handleLocation = () => {
    if (onLocationClick) {
      onLocationClick();
    } else {
      alert('Location settings feature coming soon!');
    }
  };

  const handleLoyaltyCards = () => {
    if (onLoyaltyCardsClick) {
      onLoyaltyCardsClick();
    } else {
      alert('Loyalty Cards feature coming soon!');
    }
  };

  const handleLanguageToggle = () => {
    toggleLanguage();
    alert(`Language changed to ${language === 'en' ? 'Afrikaans' : 'English'}!`);
  };

  const handleNotifications = () => {
    if (onSettingsClick) {
      // Notifications are part of settings
      onSettingsClick();
    } else {
      alert('Notification settings feature coming soon!');
    }
  };

  const handlePrivacy = () => {
    if (onSettingsClick) {
      // Privacy is part of settings
      onSettingsClick();
    } else {
      alert('Privacy & Security settings feature coming soon!');
    }
  };

  const handleHelp = () => {
    if (onHelpSupportClick) {
      onHelpSupportClick();
    } else {
      alert('Help & Support feature coming soon!');
    }
  };

  const handleSignIn = () => {
    if (onSignInClick) {
      onSignInClick();
    } else {
      alert('Sign in feature coming soon!');
    }
  };

  const authenticatedMenuSections = [
    {
      title: 'Account',
      items: [
        { icon: User, label: 'Personal Information', action: handlePersonalInfo },
        { icon: MapPin, label: t('profile.location'), value: 'Centurion, GP', action: handleLocation },
        { icon: CreditCard, label: t('profile.loyalty_cards'), value: '3 cards', action: handleLoyaltyCards },
      ]
    },
    {
      title: 'Preferences',
      items: [
        { 
          icon: Settings, 
          label: t('profile.language'), 
          value: language === 'en' ? 'English' : 'Afrikaans', 
          action: handleLanguageToggle
        },
        { icon: Bell, label: 'Notifications', value: 'Enabled', action: handleNotifications },
        { icon: Shield, label: 'Privacy & Security', action: handlePrivacy },
      ]
    },
    {
      title: 'Support',
      items: [
        { icon: HelpCircle, label: 'Help & Support', action: handleHelp },
      ]
    }
  ];

  const unauthenticatedMenuSections = [
    {
      title: 'Account',
      items: [
        { icon: LogIn, label: 'Sign In', action: handleSignIn },
        { icon: UserPlus, label: 'Create Account', action: handleSignIn },
      ]
    },
    {
      title: 'Support',
      items: [
        { icon: HelpCircle, label: 'Help & Support', action: handleHelp },
      ]
    }
  ];

  const menuSections = isAuthenticated ? authenticatedMenuSections : unauthenticatedMenuSections;

  const handleSignOut = async () => {
    if (isSigningOut) return;
    
    const confirmed = window.confirm('Are you sure you want to sign out?');
    if (!confirmed) return;

    setIsSigningOut(true);
    
    try {
      await signOut();
      alert('You have been signed out successfully!');
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
    
    // Add a small delay to ensure the click is registered
    setTimeout(() => {
      action();
    }, 50);
  };

  const handleBudgetSave = async () => {
    if (!isAuthenticated) {
      setEditingBudget(false);
      alert(`Budget updated to R${monthlyBudget.toFixed(2)}!`);
      return;
    }
    
    try {
      setLoading(true);
      
      // Get the current user
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      
      if (!currentUser) {
        throw new Error('No authenticated user found');
      }
      
      // Update user preferences with new budget
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: currentUser.id,
          monthly_budget: monthlyBudget,
          updated_at: new Date().toISOString()
        });
      
      if (error) {
        throw error;
      }
      
      setEditingBudget(false);
      alert(`Budget updated to R${monthlyBudget.toFixed(2)}!`);
      
    } catch (err) {
      console.error('Error updating budget:', err);
      alert('Failed to update budget. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Profile Header */}
      <div className="bg-gradient-to-r from-green-600 via-orange-500 to-blue-600 rounded-xl p-6 text-white mb-6">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mr-3"></div>
            <span>Loading profile...</span>
          </div>
        ) : (
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center overflow-hidden">
              {isAuthenticated && displayUser.profileImageUrl ? (
                <img 
                  src={displayUser.profileImageUrl} 
                  alt={displayUser.displayName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="h-10 w-10" />
              )}
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold">{displayUser.displayName}</h2>
              {isAuthenticated ? (
                <>
                  <p className="text-white text-opacity-90">{displayUser.email}</p>
                  <p className="text-white text-opacity-90">Member since {userProfile ? new Date(userProfile.created_at).toLocaleDateString() : 'January 2024'}</p>
                  <p className="text-white text-opacity-90">
                    {userProfile?.family_id ? 'Family Member' : 'Individual Account'}
                    {userProfile?.premium_member ? ' • Premium Member' : ''}
                  </p>
                </>
              ) : (
                <p className="text-white text-opacity-90">Sign in to access all features</p>
              )}
            </div>
            {isAuthenticated && (
              <button 
                onClick={() => handlePersonalInfo()}
                className="p-2 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors"
              >
                <Edit2 className="h-5 w-5" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Statistics - Only show for authenticated users */}
      {isAuthenticated && (
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
      )}

      {/* Monthly Budget - Only show for authenticated users */}
      {isAuthenticated && (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">{t('profile.budget')}</h3>
            <button
              onClick={() => editingBudget ? handleBudgetSave() : setEditingBudget(true)}
              disabled={loading}
              className="text-blue-600 hover:text-blue-700 font-medium text-sm px-3 py-1 rounded-lg hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : editingBudget ? 'Save' : 'Edit'}
            </button>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Monthly Budget</span>
              {editingBudget ? (
                <div className="flex items-center space-x-2">
                  <span className="text-gray-500">R</span>
                  <input
                    type="number"
                    value={monthlyBudget}
                    onChange={(e) => setMonthlyBudget(Number(e.target.value))}
                    className="w-32 px-2 py-1 border border-gray-300 rounded text-right focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    min="0"
                    step="0.01"
                  />
                </div>
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
              <span className="text-lg font-semibold text-green-600">R{(monthlyBudget - 847.30).toFixed(2)}</span>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min((847.30 / monthlyBudget) * 100, 100)}%` }}
              />
            </div>
          </div>
        </div>
      )}

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
                className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors text-left focus:outline-none focus:bg-gray-50 active:bg-gray-100"
                type="button"
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

      {/* Sign Out Section - Only show for authenticated users */}
      {isAuthenticated && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-4">
          <div className="divide-y divide-gray-200">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleSignOut();
              }}
              disabled={isSigningOut}
              className="w-full flex items-center justify-between px-6 py-4 hover:bg-red-50 transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:bg-red-50 active:bg-red-100"
              type="button"
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
      )}

      {/* App Info */}
      <div className="bg-gray-50 rounded-xl p-6 text-center">
        <h4 className="font-semibold text-gray-900 mb-2">Budget Sakkie</h4>
        <p className="text-sm text-gray-600 mb-1">Version 1.0.0</p>
        <p className="text-xs text-gray-500">Made with ❤️ for South African families</p>
      </div>
    </div>
  );
};