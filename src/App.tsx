import React, { useState } from 'react';
import { Header } from './components/Header';
import { BottomNavigation } from './components/BottomNavigation';
import { SearchTab } from './components/tabs/SearchTab';
import { CompareTab } from './components/tabs/CompareTab';
import { ListsTab } from './components/tabs/ListsTab';
import { DealsTab } from './components/tabs/DealsTab';
import { ProfileTab } from './components/tabs/ProfileTab';
import { Sidebar } from './components/Sidebar';

function App() {
  const [activeTab, setActiveTab] = useState('search');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchClick = () => {
    setActiveTab('search');
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
      />
      
      <main className="pb-20 pt-4">
        {renderActiveTab()}
      </main>
      
      <BottomNavigation 
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
    </div>
  );
}

export default App;