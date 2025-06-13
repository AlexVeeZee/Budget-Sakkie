import React, { useState, lazy, Suspense } from 'react';
import { Header } from './components/Header';
import { BottomNavigation } from './components/BottomNavigation';
import { SearchTab } from './components/tabs/SearchTab';
import { CompareTab } from './components/tabs/CompareTab';
import { ListsTab } from './components/tabs/ListsTab';
import { DealsTab } from './components/tabs/DealsTab';
import { ProfileTab } from './components/tabs/ProfileTab';
import { Sidebar } from './components/Sidebar';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { AuthModal } from './components/auth/AuthModal';
import { useAuth } from './hooks/useAuth';

// Lazy load heavy modals
const SettingsModal = lazy(() => import('./components/modals/SettingsModal').then(module => ({ default: module.SettingsModal })));
const LocationModal = lazy(() => import('./components/modals/LocationModal').then(module => ({ default: module.LocationModal })));
const LoyaltyCardsModal = lazy(() => import('./components/modals/LoyaltyCardsModal').then(module => ({ default: module.LoyaltyCardsModal })));
const RewardsModal = lazy(() => import('./components/modals/RewardsModal').then(module => ({ default: module.RewardsModal })));
const FamilySharingModal = lazy(() => import('./components/modals/FamilySharingModal').then(module => ({ default: module.FamilySharingModal })));
const HelpSupportModal = lazy(() => import('./components/modals/HelpSupportModal').then(module => ({ default: module.HelpSupportModal })));

function App() {
  const [activeTab, setActiveTab] = useState('search');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [locationOpen, setLocationOpen] = useState(false);
  const [loyaltyCardsOpen, setLoyaltyCardsOpen] = useState(false);
  const [rewardsOpen, setRewardsOpen] = useState(false);
  const [familySharingOpen, setFamilySharingOpen] = useState(false);
  const [helpSupportOpen, setHelpSupportOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { isAuthenticated, loading, initialized } = useAuth();

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
        return <ProfileTab />;
      default:
        return <SearchTab searchQuery={searchQuery} onSearchChange={setSearchQuery} />;
    }
  };

  // Show loading spinner while checking auth
  if (!initialized || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Budget Sakkie...</p>
        </div>
      </div>
    );
  }

  // Show auth modal if not authenticated
  if (!isAuthenticated) {
    return (
      <>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto p-6">
            <div className="mb-8">
              <div className="w-20 h-20 bg-gradient-to-r from-green-600 via-orange-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🛒</span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Welcome to Budget Sakkie</h1>
              <p className="text-gray-600 mb-6">
                Smart grocery shopping for South African families. Compare prices, save money, and shop smarter.
              </p>
            </div>
            <button
              onClick={() => setAuthModalOpen(true)}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors mb-4"
            >
              Get Started
            </button>
            <p className="text-sm text-gray-500">
              Join thousands of families saving money on groceries
            </p>
          </div>
        </div>

        {/* Auth Modal */}
        <AuthModal
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
        />
      </>
    );
  }

  // Render authenticated app
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
        onTabChange={setActiveTab}
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

export default App;