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
import { useRouter } from './hooks/useRouter';

// Lazy load heavy modals
const SettingsModal = lazy(() => import('./components/modals/SettingsModal').then(module => ({ default: module.SettingsModal })));
const LocationModal = lazy(() => import('./components/modals/LocationModal').then(module => ({ default: module.LocationModal })));
const LoyaltyCardsModal = lazy(() => import('./components/modals/LoyaltyCardsModal').then(module => ({ default: module.LoyaltyCardsModal })));
const RewardsModal = lazy(() => import('./components/modals/RewardsModal').then(module => ({ default: module.RewardsModal })));
const FamilySharingModal = lazy(() => import('./components/modals/FamilySharingModal').then(module => ({ default: module.FamilySharingModal })));
const HelpSupportModal = lazy(() => import('./components/modals/HelpSupportModal').then(module => ({ default: module.HelpSupportModal })));

function AppContent() {
  const { currentRoute, navigate } = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [locationOpen, setLocationOpen] = useState(false);
  const [loyaltyCardsOpen, setLoyaltyCardsOpen] = useState(false);
  const [rewardsOpen, setRewardsOpen] = useState(false);
  const [familySharingOpen, setFamilySharingOpen] = useState(false);
  const [helpSupportOpen, setHelpSupportOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchClick = () => {
    navigate('search');
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
    closeAllModals();
    setSettingsOpen(true);
  };

  const handleLocationClick = () => {
    closeAllModals();
    setLocationOpen(true);
  };

  const handleLoyaltyCardsClick = () => {
    closeAllModals();
    setLoyaltyCardsOpen(true);
  };

  const handleRewardsClick = () => {
    closeAllModals();
    setRewardsOpen(true);
  };

  const handleFamilySharingClick = () => {
    closeAllModals();
    setFamilySharingOpen(true);
  };

  const handleHelpSupportClick = () => {
    closeAllModals();
    setHelpSupportOpen(true);
  };

  const renderActiveTab = () => {
    // Handle profile sub-routes - ensure profile stays rendered
    if (currentRoute.startsWith('profile')) {
      return <ProfileTab />;
    }

    switch (currentRoute) {
      case 'search':
        return <SearchTab searchQuery={searchQuery} onSearchChange={setSearchQuery} />;
      case 'compare':
        return <CompareTab />;
      case 'lists':
        return <ListsTab />;
      case 'deals':
        return <DealsTab />;
      default:
        return <SearchTab searchQuery={searchQuery} onSearchChange={setSearchQuery} />;
    }
  };

  const getActiveBottomTab = () => {
    // Ensure profile tab stays active for all profile routes
    if (currentRoute.startsWith('profile')) {
      return 'profile';
    }
    return currentRoute;
  };

  const handleTabChange = (tab: string) => {
    // Ensure proper navigation without interference
    navigate(tab as any);
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
        activeTab={getActiveBottomTab()}
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