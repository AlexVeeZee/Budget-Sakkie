import React, { useState, useMemo } from 'react';
import { Search, Filter, ScanLine, MapPin } from 'lucide-react';
import { ProductCard } from '../ProductCard';
import { products, prices } from '../../data/mockData';
import { useLanguage } from '../../hooks/useLanguage';

interface SearchTabProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const SearchTab: React.FC<SearchTabProps> = ({ searchQuery, onSearchChange }) => {
  const { t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'All Categories' },
    { id: 'Fresh Produce', name: 'Fresh Produce' },
    { id: 'Dairy', name: 'Dairy' },
    { id: 'Meat', name: 'Meat' },
    { id: 'Bakery', name: 'Bakery' },
    { id: 'Pantry', name: 'Pantry' },
  ];

  const filteredProducts = useMemo(() => {
    let filtered = products;
    
    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }
    
    return filtered;
  }, [searchQuery, selectedCategory]);

  const getProductPrices = (productId: string) => {
    return prices.filter(price => price.productId === productId);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Search Header */}
      <div className="mb-6">
        <div className="relative mb-4">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t('search.placeholder')}
            className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl bg-white shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 placeholder-gray-500"
          />
          <div className="absolute inset-y-0 right-0 flex items-center space-x-2 pr-3">
            <button className="p-1 text-gray-400 hover:text-gray-600">
              <ScanLine className="h-5 w-5" />
            </button>
            <button className="p-1 text-gray-400 hover:text-gray-600">
              <Filter className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="bg-white rounded-lg p-3 text-center shadow-sm">
            <p className="text-2xl font-bold text-green-600">5</p>
            <p className="text-xs text-gray-600">Retailers</p>
          </div>
          <div className="bg-white rounded-lg p-3 text-center shadow-sm">
            <p className="text-2xl font-bold text-blue-600">2.3km</p>
            <p className="text-xs text-gray-600">Nearest Store</p>
          </div>
          <div className="bg-white rounded-lg p-3 text-center shadow-sm">
            <p className="text-2xl font-bold text-orange-600">15%</p>
            <p className="text-xs text-gray-600">Avg Savings</p>
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === category.id
                  ? 'bg-green-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Recent Searches */}
      {!searchQuery && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">{t('search.recent')}</h3>
          <div className="flex flex-wrap gap-2">
            {['Bread', 'Milk', 'Eggs', 'Rice'].map((term) => (
              <button
                key={term}
                onClick={() => onSearchChange(term)}
                className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors"
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            prices={getProductPrices(product.id)}
            onCompare={() => console.log('Compare', product.name)}
            onAddToList={() => console.log('Add to list', product.name)}
          />
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('search.no_results')}</h3>
          <p className="text-gray-600">Try adjusting your search terms or category filter</p>
        </div>
      )}
    </div>
  );
};