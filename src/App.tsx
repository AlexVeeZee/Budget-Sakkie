import React, { useState, lazy, Suspense, useEffect } from 'react';
import { Header } from './components/Header';
import { BottomNavigation } from './components/BottomNavigation';
import { SearchTab } from './components/tabs/SearchTab';
import { CompareTab } from './components/tabs/CompareTab';
import { ListsTab } from './components/tabs/ListsTab';
import { DealsTab } from './components/tabs/DealsTab';
import { ProfileTab } from './components/tabs/ProfileTab';
import { Sidebar } from './components/Sidebar';
import { AuthProvider } from './hooks/useAuth';
import { AuthModal } from './components/auth/AuthModal';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

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
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup'>('signin');

  // Close all modals helper function
  const closeAllModals = () => {
    setSettingsOpen(false);
    setLocationOpen(false);
    setLoyaltyCardsOpen(false);
    setRewardsOpen(false);
    setFamilySharingOpen(false);
    setHelpSupportOpen(false);
    setShowAuthModal(false);
  };

  const handleSearchClick = () => {
    setActiveTab('search');
  };

  const handleSettingsClick = () => {
    closeAllModals();
    setSettingsOpen(true);
    setSidebarOpen(false); // Close sidebar when opening modal
  };

  const handleLocationClick = () => {
    closeAllModals();
    setLocationOpen(true);
    setSidebarOpen(false); // Close sidebar when opening modal
  };

  const handleLoyaltyCardsClick = () => {
    closeAllModals();
    setLoyaltyCardsOpen(true);
    setSidebarOpen(false); // Close sidebar when opening modal
  };

  const handleRewardsClick = () => {
    closeAllModals();
    setRewardsOpen(true);
    setSidebarOpen(false); // Close sidebar when opening modal
  };

  const handleFamilySharingClick = () => {
    closeAllModals();
    setFamilySharingOpen(true);
    setSidebarOpen(false); // Close sidebar when opening modal
  };

  const handleHelpSupportClick = () => {
    closeAllModals();
    setHelpSupportOpen(true);
    setSidebarOpen(false); // Close sidebar when opening modal
  };

  const handleSignInClick = () => {
    closeAllModals();
    setAuthModalMode('signin');
    setShowAuthModal(true);
  };

  const handleSignUpClick = () => {
    closeAllModals();
    setAuthModalMode('signup');
    setShowAuthModal(true);
  };

  // Simple tab change handler with explicit logging
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
  };

  // Handle escape key to close modals
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeAllModals();
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, []);

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
        return (
          <ProfileTab 
            onSettingsClick={handleSettingsClick}
            onLocationClick={handleLocationClick}
            onLoyaltyCardsClick={handleLoyaltyCardsClick}
            onRewardsClick={handleRewardsClick}
            onFamilySharingClick={handleFamilySharingClick}
            onHelpSupportClick={handleHelpSupportClick}
            onSignInClick={handleSignInClick}
          />
        );
      default:
        return <SearchTab searchQuery={searchQuery} onSearchChange={setSearchQuery} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Bolt.new Badge */}
      <style dangerouslySetInnerHTML={{
        __html: `
          .bolt-badge {
            transition: all 0.3s ease;
          }
          @keyframes badgeIntro {
            0% { transform: scale(0); opacity: 0; }
            100% { transform: scale(1); opacity: 1; }
          }
          .bolt-badge-intro {
            animation: badgeIntro 0.5s ease-out 1s both;
          }
          .bolt-badge-intro.animated {
            animation: none;
          }
          @keyframes badgeHover {
            0% { transform: scale(1) rotate(0deg); }
            50% { transform: scale(1.1) rotate(22deg); }
            100% { transform: scale(1) rotate(0deg); }
          }
          .bolt-badge:hover {
            animation: badgeHover 0.6s ease-in-out;
          }
        `
      }} />
      
      <div className="fixed top-4 right-4" style={{ zIndex: 1000000 }}>
        <a 
          href="https://bolt.new/?rid=os72mi" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="block transition-all duration-300 hover:shadow-2xl"
        >
          <img 
            src="https://storage.bolt.army/logotext_poweredby_360w.png" 
            alt="Powered by Bolt.new badge" 
            className="h-8 md:h-10 w-auto shadow-lg opacity-90 hover:opacity-100 bolt-badge bolt-badge-intro"
            onAnimationEnd={(e) => e.currentTarget.classList.add('animated')}
          />
        </a>
      </div>

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
        onSignInClick={handleSignInClick}
      />
      
      <main className={`pb-20 pt-4 transition-all duration-300 ${sidebarOpen ? 'ml-80' : ''}`}>
        <ProtectedRoute fallback={
          <div className="max-w-md mx-auto mt-12 p-6 bg-white rounded-xl shadow-md">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Welcome to Budget Sakkie</h2>
            <p className="text-gray-600 mb-6">
              Sign in to access all features and start saving on your grocery shopping.
            </p>
            <div className="space-y-4">
              <button
                onClick={handleSignInClick}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={handleSignUpClick}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
              >
                Create Account
              </button>
              <button
                onClick={() => setActiveTab('search')}
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 px-4 rounded-lg transition-colors"
              >
                Continue as Guest
              </button>
            </div>
          </div>
        }>
          {renderActiveTab()}
        </ProtectedRoute>
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

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode={authModalMode}
      />
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