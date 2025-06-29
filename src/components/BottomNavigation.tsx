import React from 'react';
import { Search, BarChart3, List, Tag, User } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';

type TabType = 'search' | 'compare' | 'lists' | 'deals' | 'profile';

interface BottomNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({ activeTab, onTabChange }) => {
  const { t } = useLanguage();

  const tabs = [
    { id: 'search' as const, icon: Search, label: t('nav.search') },
    { id: 'compare' as const, icon: BarChart3, label: t('nav.compare') },
    { id: 'lists' as const, icon: List, label: t('nav.lists') },
    { id: 'deals' as const, icon: Tag, label: t('nav.deals') },
    { id: 'profile' as const, icon: User, label: t('nav.profile') }
  ];

  const handleTabClick = (tabId: TabType) => {
    onTabChange(tabId);
  };

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 border-t border-gray-200 px-4 py-2 z-40 shadow-lg"
      style={{ backgroundColor: '#ffffff' }}
    >
      <div className="flex justify-around">
        {tabs.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => handleTabClick(id)}
            className={`flex flex-col items-center space-y-1 py-2 px-3 rounded-lg transition-colors ${
              activeTab === id
                ? 'text-green-600'
                : 'text-gray-600 hover:text-green-600 hover:bg-gray-50'
            }`}
            style={activeTab === id ? { 
              backgroundColor: 'rgb(240, 253, 244)',
              color: 'rgb(22, 163, 74)',
              fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif',
              fontSize: '16px'
            } : {
              fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif',
              fontSize: '16px'
            }}
          >
            <Icon className="h-5 w-5" />
            <span className="text-xs font-medium">{label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};