import React, { useState, lazy, Suspense, useEffect } from 'react';
import { X, User, MapPin, Star, Gift, Users, HelpCircle, Settings } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

// Lazy load individual modal sections
const SettingsSection = lazy(() => import('./settings/SettingsSection').then(module => ({ default: module.SettingsSection })));
const LocationSection = lazy(() => import('./sections/LocationSection').then(module => ({ default: module.LocationSection })));
const LoyaltyCardsSection = lazy(() => import('./sections/LoyaltyCardsSection').then(module => ({ default: module.LoyaltyCardsSection })));
const RewardsSection = lazy(() => import('./sections/RewardsSection').then(module => ({ default: module.RewardsSection })));
const FamilySharingSection = lazy(() => import('./sections/FamilySharingSection').then(module => ({ default: module.FamilySharingSection })));
const HelpSupportSection = lazy(() => import('./sections/HelpSupportSection').then(module => ({ default: module.HelpSupportSection })));

export type SidebarModalSection = 'settings' | 'location' | 'loyalty' | 'rewards' | 'family' | 'help';

interface UnifiedSidebarModalProps {
  isOpen: boolean;
  activeSection: SidebarModalSection;
  onClose: () => void;
}

export const UnifiedSidebarModal: React.FC<UnifiedSidebarModalProps> = ({ 
  isOpen, 
  activeSection, 
  onClose 
}) => {
  const { user } = useAuthStore();
  const [currentSection, setCurrentSection] = useState<SidebarModalSection>(activeSection);
  
  // Update current section when activeSection prop changes
  useEffect(() => {
    if (activeSection) {
      setCurrentSection(activeSection);
    }
  }, [activeSection]);

  // Get section title and icon
  const getSectionInfo = (section: SidebarModalSection) => {
    switch (section) {
      case 'settings':
        return { title: 'Settings', icon: Settings };
      case 'location':
        return { title: 'Location Settings', icon: MapPin };
      case 'loyalty':
        return { title: 'Loyalty Cards', icon: Star };
      case 'rewards':
        return { title: 'Rewards & Achievements', icon: Gift };
      case 'family':
        return { title: 'Family Sharing', icon: Users };
      case 'help':
        return { title: 'Help & Support', icon: HelpCircle };
      default:
        return { title: 'Settings', icon: Settings };
    }
  };

  const sectionInfo = getSectionInfo(currentSection);
  const SectionIcon = sectionInfo.icon;

  // Navigation items for the sidebar
  const navigationItems = [
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'location', label: 'Location Settings', icon: MapPin },
    { id: 'loyalty', label: 'Loyalty Cards', icon: Star },
    { id: 'rewards', label: 'Rewards', icon: Gift },
    { id: 'family', label: 'Family Sharing', icon: Users },
    { id: 'help', label: 'Help & Support', icon: HelpCircle }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
      
      {/* Position the modal on the left side */}
      <div className="absolute inset-y-0 left-0 max-w-full flex">
        <div 
          className="relative w-screen max-w-4xl"
          style={{ 
            transform: 'translate3d(0, 0, 0)',
            transition: 'transform 0.3s ease-out'
          }}
        >
          <div className="h-full flex flex-col bg-white shadow-xl">
            <div className="flex-1 h-0 overflow-hidden">
              <div className="flex h-full flex-col md:flex-row">
                {/* Sidebar Navigation - Hidden on mobile */}
                <div className="hidden md:block w-64 bg-gray-50 border-r border-gray-200 overflow-y-auto">
                  {/* User Info */}
                  {user && (
                    <div className="p-6 border-b border-gray-200">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                          {user.displayName?.[0] || user.username?.[0] || 'U'}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{user.displayName || user.username}</h3>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Navigation Items */}
                  <nav className="p-4">
                    {navigationItems.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setCurrentSection(item.id as SidebarModalSection)}
                        className={`w-full flex items-center space-x-3 p-3 mb-2 rounded-lg transition-colors text-left ${
                          currentSection === item.id
                            ? 'bg-green-50 text-green-700 border border-green-200'
                            : 'text-gray-700 hover:bg-gray-100 border border-transparent'
                        }`}
                      >
                        <item.icon className="h-5 w-5" />
                        <span className="font-medium">{item.label}</span>
                      </button>
                    ))}
                  </nav>
                </div>
                
                {/* Main Content */}
                <div className="flex-1 flex flex-col overflow-hidden">
                  {/* Header */}
                  <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-200 bg-gradient-to-r from-green-600 via-orange-500 to-blue-600 text-white">
                    <div className="flex items-center space-x-3">
                      <SectionIcon className="h-6 w-6" />
                      <div>
                        <h2 className="text-xl md:text-2xl font-bold">{sectionInfo.title}</h2>
                        {/* Mobile section selector - only visible on small screens */}
                        <div className="md:hidden">
                          <select
                            value={currentSection}
                            onChange={(e) => setCurrentSection(e.target.value as SidebarModalSection)}
                            className="mt-1 text-sm bg-white/20 border-0 rounded-md text-white py-1 pl-2 pr-8 focus:ring-2 focus:ring-white/50"
                            style={{
                              backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23ffffff' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                              backgroundRepeat: 'no-repeat',
                              backgroundPosition: 'right 0.5rem center',
                              backgroundSize: '1.5em 1.5em',
                              paddingRight: '2.5rem'
                            }}
                          >
                            {navigationItems.map((item) => (
                              <option key={item.id} value={item.id}>{item.label}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={onClose}
                      className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                      <X className="h-6 w-6" />
                    </button>
                  </div>
                  
                  {/* Content Area */}
                  <div className="flex-1 overflow-y-auto p-4 md:p-6">
                    <Suspense fallback={
                      <div className="flex items-center justify-center h-full">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                      </div>
                    }>
                      {currentSection === 'settings' && <SettingsSection />}
                      {currentSection === 'location' && <LocationSection />}
                      {currentSection === 'loyalty' && <LoyaltyCardsSection />}
                      {currentSection === 'rewards' && <RewardsSection />}
                      {currentSection === 'family' && <FamilySharingSection />}
                      {currentSection === 'help' && <HelpSupportSection />}
                    </Suspense>
                  </div>
                  
                  {/* Footer */}
                  <div className="p-4 md:p-6 border-t border-gray-200 flex justify-end">
                    <button
                      onClick={onClose}
                      className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnifiedSidebarModal;