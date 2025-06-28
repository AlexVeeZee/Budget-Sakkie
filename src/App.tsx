import React, { useState, lazy, Suspense, useEffect } from 'react';
import { Header } from './components/Header';
import { BottomNavigation } from './components/BottomNavigation';
import { SearchTab } from './components/tabs/SearchTab';
import { CompareTab } from './components/tabs/CompareTab';
import { ListsTab } from './components/tabs/ListsTab';
import { DealsTab } from './components/tabs/DealsTab';
import { ProfileTab } from './components/tabs/ProfileTab';
import { Sidebar } from './components/Sidebar';
import { AuthProvider } from './components/auth/AuthProvider';
import { AuthModal } from './components/auth/AuthModal';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { useAuthStore } from './store/authStore';
import { GuestBanner } from './components/auth/GuestBanner';
import { CartProvider } from './context/CartContext';
import { TemporaryItemsBar } from './components/TemporaryItemsBar';

// Lazy load heavy modals
const UnifiedSidebarModal = lazy(() => import('./components/modals/UnifiedSidebarModal').then(module => ({ default: module.UnifiedSidebarModal })));

type TabType = 'search' | 'compare' | 'lists' | 'deals' | 'profile';
type ModalType = 'settings' | 'location' | 'loyalty' | 'rewards' | 'family' | 'help' | null;

// Interface for product selection in compare tab
interface SelectedProductInfo {
  id: string;
  name: string;
}

function AppContent() {
  const { isAuthenticated, isGuest } = useAuthStore();
  const [activeTab, setActiveTab] = useState<TabType>('search');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup'>('signin');
  const [selectedProduct, setSelectedProduct] = useState<SelectedProductInfo | null>(null);

  // Close all modals helper function
  const closeAllModals = () => {
    setActiveModal(null);
    setShowAuthModal(false);
  };

  const handleSearchClick = () => {
    setActiveTab('search');
  };

  const handleSettingsClick = () => {
    closeAllModals();
    setActiveModal('settings');
    setSidebarOpen(false); // Close sidebar when opening modal
  };

  const handleLocationClick = () => {
    closeAllModals();
    setActiveModal('location');
    setSidebarOpen(false); // Close sidebar when opening modal
  };

  const handleLoyaltyCardsClick = () => {
    closeAllModals();
    setActiveModal('loyalty');
    setSidebarOpen(false); // Close sidebar when opening modal
  };

  const handleRewardsClick = () => {
    closeAllModals();
    setActiveModal('rewards');
    setSidebarOpen(false); // Close sidebar when opening modal
  };

  const handleFamilySharingClick = () => {
    closeAllModals();
    setActiveModal('family');
    setSidebarOpen(false); // Close sidebar when opening modal
  };

  const handleHelpSupportClick = () => {
    closeAllModals();
    setActiveModal('help');
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

  // Function to handle product selection for comparison
  const handleProductSelect = (productInfo: SelectedProductInfo) => {
    setSelectedProduct(productInfo);
    setActiveTab('compare');
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
        return <SearchTab 
                searchQuery={searchQuery} 
                onSearchChange={setSearchQuery} 
                onProductSelect={handleProductSelect} 
              />;
      case 'compare':
        return <CompareTab selectedProductId={selectedProduct?.id} />;
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

      {/* Guest Banner - only show for guest users */}
      {isGuest && <GuestBanner />}

      <Header 
        onMenuClick={() => setSidebarOpen(true)}
        onSearchClick={handleSearchClick}
        onSettingsClick={handleSettingsClick}
        onLocationClick={handleLocationClick}
      />
      
      <div className="flex">
        {/* Sidebar */}
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
        
        {/* Main Content */}
        <main className="flex-1 pb-20 pt-4">
          <ProtectedRoute 
            allowGuest={activeTab !== 'lists' && activeTab !== 'profile'}
            fallback={
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
                    onClick={() => {
                      setAuthModalMode('guest');
                      setShowAuthModal(true);
                    }}
                    className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 px-4 rounded-lg transition-colors"
                  >
                    Continue as Guest
                  </button>
                </div>
              </div>
            }
          >
            {renderActiveTab()}
          </ProtectedRoute>
        </main>
      </div>
      
      {/* Temporary Items Bar */}
      <TemporaryItemsBar />
      
      <BottomNavigation 
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />

      {/* Unified Sidebar Modal */}
      <Suspense fallback={<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div></div>}>
        {activeModal && (
          <UnifiedSidebarModal
            activeSection={activeModal}
            isOpen={activeModal !== null}
            onClose={() => setActiveModal(null)}
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
      <CartProvider>
        <AppContent />
      </CartProvider>
    </AuthProvider>
  );
}

export default App;