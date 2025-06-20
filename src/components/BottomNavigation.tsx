import React from 'react';
import { Search, BarChart3, List, Tag, User } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';

interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({ activeTab, onTabChange }) => {
  const { t } = useLanguage();

  const tabs = [
    { id: 'search', icon: Search, label: t('nav.search') },
    { id: 'compare', icon: BarChart3, label: t('nav.compare') },
    { id: 'lists', icon: List, label: t('nav.lists') },
    { id: 'deals', icon: Tag, label: t('nav.deals') },
    { id: 'profile', icon: User, label: t('nav.profile') }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-40">
      <div className="flex justify-around">
        {tabs.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => onTabChange(id)}
            className={`flex flex-col items-center space-y-1 py-2 px-3 rounded-lg transition-colors ${
              activeTab === id
                ? 'text-green-600 bg-green-50'
                : 'text-gray-600 hover:text-green-600 hover:bg-gray-50'
            }`}
          >
            <Icon className="h-5 w-5" />
            <span className="text-xs font-medium">{label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};