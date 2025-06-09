import React, { useState } from 'react';
import { Header } from './components/Header';
import { BottomNavigation } from './components/BottomNavigation';
import { SearchTab } from './components/tabs/SearchTab';
import { CompareTab } from './components/tabs/CompareTab';
import { ListsTab } from './components/tabs/ListsTab';
import { DealsTab } from './components/tabs/DealsTab';
import { ProfileTab } from './components/tabs/ProfileTab';
import { Sidebar } from './components/Sidebar';
import { SettingsModal } from './components/modals/SettingsModal';
import { LocationModal } from './components/modals/LocationModal';
import { LoyaltyCardsModal } from './components/modals/LoyaltyCardsModal';
import { RewardsModal } from './components/modals/RewardsModal';
import { FamilySharingModal } from './components/modals/FamilySharingModal';
import { HelpSupportModal } from './components/modals/HelpSupportModal';

function App() {
  const [activeTab, setActiveTab] = useState('search');
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

  const handleSettingsClick = () => {
    // Keep sidebar open and show settings modal
    setSettingsOpen(true);
  };

  const handleLocationClick = () => {
    // Keep sidebar open and show location modal
    setLocationOpen(true);
  };

  const handleLoyaltyCardsClick = () => {
    // Keep sidebar open and show loyalty cards modal
    setLoyaltyCardsOpen(true);
  };

  const handleRewardsClick = () => {
    // Keep sidebar open and show rewards modal
    setRewardsOpen(true);
  };

  const handleFamilySharingClick = () => {
    // Keep sidebar open and show family sharing modal
    setFamilySharingOpen(true);
  };

  const handleHelpSupportClick = () => {
    // Keep sidebar open and show help support modal
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

      {/* Modals */}
      <SettingsModal 
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />

      <LocationModal 
        isOpen={locationOpen}
        onClose={() => setLocationOpen(false)}
      />

      <LoyaltyCardsModal 
        isOpen={loyaltyCardsOpen}
        onClose={() => setLoyaltyCardsOpen(false)}
      />

      <RewardsModal 
        isOpen={rewardsOpen}
        onClose={() => setRewardsOpen(false)}
      />

      <FamilySharingModal 
        isOpen={familySharingOpen}
        onClose={() => setFamilySharingOpen(false)}
      />

      <HelpSupportModal 
        isOpen={helpSupportOpen}
        onClose={() => setHelpSupportOpen(false)}
      />
    </div>
  );
}

export default App;