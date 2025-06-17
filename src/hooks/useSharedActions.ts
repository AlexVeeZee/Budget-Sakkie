import { useLanguage } from './useLanguage';

/**
 * Shared action handlers for consistent functionality across the application
 * These handlers are used by both the Sidebar and ProfileTab components
 */
export const useSharedActions = () => {
  const { language, toggleLanguage } = useLanguage();

  const handlePersonalInfo = () => {
    console.log('Personal Information clicked');
    alert('Personal Information feature coming soon!\n\nThis will open your profile settings where you can:\n• Update your name and contact details\n• Change your profile picture\n• Manage account preferences');
  };

  const handleLocation = () => {
    console.log('Location clicked');
    alert('Location settings feature coming soon!\n\nThis will open location management where you can:\n• Set your home address\n• Manage recent locations\n• Update delivery preferences\n• Set store preferences by area');
  };

  const handleLoyaltyCards = () => {
    console.log('Loyalty cards clicked');
    alert('Loyalty Cards feature coming soon!\n\nThis will open loyalty card management where you can:\n• Add your store loyalty cards\n• View points balances\n• Track rewards and benefits\n• Manage card preferences');
  };

  const handleLanguageToggle = () => {
    console.log('Language toggle clicked');
    const newLanguage = language === 'en' ? 'Afrikaans' : 'English';
    toggleLanguage();
    alert(`Language changed to ${newLanguage}!\n\nThe app interface will now display in ${newLanguage}.`);
  };

  const handleNotifications = () => {
    console.log('Notifications clicked');
    alert('Notification settings feature coming soon!\n\nThis will open notification preferences where you can:\n• Enable/disable price alerts\n• Manage deal notifications\n• Set shopping reminders\n• Configure email and SMS preferences');
  };

  const handlePrivacySecurity = () => {
    console.log('Privacy & Security clicked');
    alert('Privacy & Security settings feature coming soon!\n\nThis will open security settings where you can:\n• Change your password\n• Manage two-factor authentication\n• Review privacy settings\n• Control data sharing preferences');
  };

  const handleHelpSupport = () => {
    console.log('Help & Support clicked');
    alert('Help & Support feature coming soon!\n\nThis will open the help center where you can:\n• Browse frequently asked questions\n• Contact customer support\n• Access user guides and tutorials\n• Report issues or provide feedback');
  };

  const handleSettings = () => {
    console.log('Settings clicked');
    alert('Settings feature coming soon!\n\nThis will open the main settings panel where you can:\n• Manage all app preferences\n• Configure account settings\n• Adjust privacy and security options\n• Customize your experience');
  };

  const handleRewards = () => {
    console.log('Rewards clicked');
    alert('Rewards feature coming soon!\n\nThis will open your rewards dashboard where you can:\n• View your points balance\n• Browse available rewards\n• Track your savings achievements\n• Redeem points for discounts');
  };

  const handleFamilySharing = () => {
    console.log('Family Sharing clicked');
    alert('Family Sharing feature coming soon!\n\nThis will open family management where you can:\n• Invite family members\n• Share shopping lists\n• Manage family budgets\n• Set permissions and roles');
  };

  return {
    handlePersonalInfo,
    handleLocation,
    handleLoyaltyCards,
    handleLanguageToggle,
    handleNotifications,
    handlePrivacySecurity,
    handleHelpSupport,
    handleSettings,
    handleRewards,
    handleFamilySharing,
    // Expose language info for display purposes
    currentLanguage: language,
    currentLanguageDisplay: language === 'en' ? 'English' : 'Afrikaans'
  };
};