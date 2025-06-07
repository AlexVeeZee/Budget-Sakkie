import React from 'react';
import { ShoppingCart, Search, Menu, Globe } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';

interface HeaderProps {
  onMenuClick: () => void;
  onSearchClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick, onSearchClick }) => {
  const { language, toggleLanguage, t } = useLanguage();

  return (
    <header className="bg-gradient-to-r from-green-600 via-orange-500 to-blue-600 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <button
              onClick={onMenuClick}
              className="p-2 rounded-md hover:bg-black/10 transition-colors"
            >
              <Menu className="h-6 w-6" />
            </button>
            
            <div className="flex items-center space-x-2">
              <ShoppingCart className="h-8 w-8" />
              <div>
                <h1 className="text-xl font-bold">{t('header.title')}</h1>
                <p className="text-xs text-white/80">{t('header.subtitle')}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onSearchClick}
              className="p-2 rounded-md hover:bg-black/10 transition-colors"
            >
              <Search className="h-6 w-6" />
            </button>
            
            <button
              onClick={toggleLanguage}
              className="flex items-center space-x-1 px-3 py-1 rounded-md hover:bg-black/10 transition-colors text-sm font-medium"
            >
              <Globe className="h-4 w-4" />
              <span>{language.toUpperCase()}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};