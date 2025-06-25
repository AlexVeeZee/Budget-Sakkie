import React, { useState, lazy, Suspense } from 'react';
import { Header } from './components/Header';
import { BottomNavigation } from './components/BottomNavigation';
import { SearchTab } from './components/tabs/SearchTab';
import { CompareTab } from './components/tabs/CompareTab';
import { ListsTab } from './components/tabs/ListsTab';
import { DealsTab } from './components/tabs/DealsTab';
import { ProfileTab } from './components/tabs/ProfileTab';
import { Sidebar } from './components/Sidebar';
import { AuthProvider } from './hooks/useAuth';

// Lazy load heavy modals
const SettingsModal = lazy(() => import('./components/modals/SettingsModal').then(module => ({ default: module.SettingsModal })));
const LocationModal = lazy(() => import('./components/modals/LocationModal').then(module => ({ default: module.LocationModal })));
const LoyaltyCardsModal = lazy(() => import('./components/modals/LoyaltyCardsModal').then(module => ({ default: module.LoyaltyCardsModal })));
const RewardsModal = lazy(() => import('./components/modals/RewardsModal').then(module => ({ default: module.RewardsModal })));
const FamilySharingModal = lazy(() => import('./components/modals/FamilySharingModal').then(module => ({ default: module.FamilySharingModal })));
const HelpSupportModal = lazy(() => import('./components/modals/HelpSupportModal').then(module => ({ default: module.HelpSupportModal })));

type TabType = 'search' | 'compare' | 'lists' | 'deals' | 'profile';

function AppContent() {
  const [activeTab, setActiveTab] = useState<TabType>('search');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [locationOpen, setLocationOpen] = useState(false);
  const [loyaltyCardsOpen, setLoyaltyCardsOpen] = useState(false);
  const [rewardsOpen, setRewardsOpen] = useState(false);
  const [familySharingOpen, setFamilySharingOpen] = useState(false);
  const [helpSupportOpen, setHelpSupportOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchClick = () => {
    setActiveTab('search');
  };

  // Close all modals helper function
  const closeAllModals = () => {
    setSettingsOpen(false);
    setLocationOpen(false);
    setLoyaltyCardsOpen(false);
    setRewardsOpen(false);
    setFamilySharingOpen(false);
    setHelpSupportOpen(false);
  };

  const handleSettingsClick = () => {
    console.log('Settings clicked from sidebar/profile');
    closeAllModals();
    setSettingsOpen(true);
    setSidebarOpen(false); // Close sidebar when opening modal
  };

  const handleLocationClick = () => {
    console.log('Location clicked from sidebar/profile');
    closeAllModals();
    setLocationOpen(true);
    setSidebarOpen(false); // Close sidebar when opening modal
  };

  const handleLoyaltyCardsClick = () => {
    console.log('Loyalty cards clicked from sidebar/profile');
    closeAllModals();
    setLoyaltyCardsOpen(true);
    setSidebarOpen(false); // Close sidebar when opening modal
  };

  const handleRewardsClick = () => {
    console.log('Rewards clicked from sidebar/profile');
    closeAllModals();
    setRewardsOpen(true);
    setSidebarOpen(false); // Close sidebar when opening modal
  };

  const handleFamilySharingClick = () => {
    console.log('Family sharing clicked from sidebar/profile');
    closeAllModals();
    setFamilySharingOpen(true);
    setSidebarOpen(false); // Close sidebar when opening modal
  };

  const handleHelpSupportClick = () => {
    console.log('Help support clicked from sidebar/profile');
    closeAllModals();
    setHelpSupportOpen(true);
    setSidebarOpen(false); // Close sidebar when opening modal
  };

  // Simple tab change handler with explicit logging
  const handleTabChange = (tab: TabType) => {
    console.log('Tab change requested:', tab);
    console.log('Current active tab:', activeTab);
    
    setActiveTab(tab);
    
    // Log after state change (will show in next render)
    setTimeout(() => {
      console.log('Tab changed to:', tab);
    }, 0);
  };

  const renderActiveTab = () => {
    console.log('Rendering tab:', activeTab);
    
    switch (activeTab) {
      case 'search':
        return <SearchTab searchQuery={searchQuery} onSearchChange={setSearchQuery} />;
      case 'compare':
        return <CompareTab />;
      case 'lists':
        return <ListsTab />;
      case 'deals':
        return <DealsTab />;
      case 'profile':
        return (
          <ProfileTab 
            onSettingsClick={handleSettingsClick}
            onLocationClick={handleLocationClick}
            onLoyaltyCardsClick={handleLoyaltyCardsClick}
            onRewardsClick={handleRewardsClick}
            onFamilySharingClick={handleFamilySharingClick}
            onHelpSupportClick={handleHelpSupportClick}
          />
        );
      default:
        return <SearchTab searchQuery={searchQuery} onSearchChange={setSearchQuery} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        onMenuClick={() => setSidebarOpen(true)}
        onSearchClick={handleSearchClick}
      />
      
      <Sidebar 
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onSettingsClick={handleSettingsClick}
        onLocationClick={handleLocationClick}
        onLoyaltyCardsClick={handleLoyaltyCardsClick}
        onRewardsClick={handleRewardsClick}
        onFamilySharingClick={handleFamilySharingClick}
        onHelpSupportClick={handleHelpSupportClick}
      />
      
      <main className={`pb-20 pt-4 transition-all duration-300 ${sidebarOpen ? 'ml-80' : ''}`}>
        {renderActiveTab()}
      </main>
      
      <BottomNavigation 
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />

      {/* Lazy loaded modals with loading fallback */}
      <Suspense fallback={<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div></div>}>
        {settingsOpen && (
          <SettingsModal 
            isOpen={settingsOpen}
            onClose={() => setSettingsOpen(false)}
          />
        )}

        {locationOpen && (
          <LocationModal 
            isOpen={locationOpen}
            onClose={() => setLocationOpen(false)}
          />
        )}

        {loyaltyCardsOpen && (
          <LoyaltyCardsModal 
            isOpen={loyaltyCardsOpen}
            onClose={() => setLoyaltyCardsOpen(false)}
          />
        )}

        {rewardsOpen && (
          <RewardsModal 
            isOpen={rewardsOpen}
            onClose={() => setRewardsOpen(false)}
          />
        )}

        {familySharingOpen && (
          <FamilySharingModal 
            isOpen={familySharingOpen}
            onClose={() => setFamilySharingOpen(false)}
          />
        )}

        {helpSupportOpen && (
          <HelpSupportModal 
            isOpen={helpSupportOpen}
            onClose={() => setHelpSupportOpen(false)}
          />
        )}
      </Suspense>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;