import React, { useState, useMemo } from 'react';
import { Search, Filter, ScanLine, Loader2, AlertCircle } from 'lucide-react';
import { ProductCard } from '../ProductCard';
import { useProducts, useCategories } from '../../hooks/useProducts';
import { useLanguage } from '../../hooks/useLanguage';

interface SearchTabProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const SearchTab: React.FC<SearchTabProps> = ({ searchQuery, onSearchChange }) => {
  const { t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStore, setSelectedStore] = useState('all');

  const { categories, loading: categoriesLoading } = useCategories();
  
  const productFilters = useMemo(() => ({
    searchQuery: searchQuery || undefined,
    categoryId: selectedCategory !== 'all' ? selectedCategory : undefined,
    storeId: selectedStore !== 'all' ? selectedStore : undefined,
    inStockOnly: true
  }), [searchQuery, selectedCategory, selectedStore]);

  const { products, loading: productsLoading, error } = useProducts(productFilters);

  const stores = [
    { id: 'all', name: 'All Stores' },
    { id: 'pick-n-pay', name: 'Pick n Pay' },
    { id: 'shoprite', name: 'Shoprite' },
    { id: 'checkers', name: 'Checkers' },
    { id: 'woolworths', name: 'Woolworths' },
    { id: 'spar', name: 'SPAR' },
  ];

  const categoryOptions = [
    { id: 'all', name: 'All Categories' },
    ...categories.map(cat => ({ id: cat.id, name: cat.name }))
  ];

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Products</h3>
            <p className="text-gray-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

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
            <p className="text-2xl font-bold text-green-600">{stores.length - 1}</p>
            <p className="text-xs text-gray-600">Retailers</p>
          </div>
          <div className="bg-white rounded-lg p-3 text-center shadow-sm">
            <p className="text-2xl font-bold text-blue-600">{products.length}</p>
            <p className="text-xs text-gray-600">Products</p>
          </div>
          <div className="bg-white rounded-lg p-3 text-center shadow-sm">
            <p className="text-2xl font-bold text-orange-600">{categories.length}</p>
            <p className="text-xs text-gray-600">Categories</p>
          </div>
        </div>

        {/* Filters */}
        <div className="space-y-3">
          {/* Category Filter */}
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {categoryOptions.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                disabled={categoriesLoading}
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

          {/* Store Filter */}
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {stores.map((store) => (
              <button
                key={store.id}
                onClick={() => setSelectedStore(store.id)}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedStore === store.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {store.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Loading State */}
      {productsLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-green-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading products...</p>
          </div>
        </div>
      )}

      {/* Products Grid */}
      {!productsLoading && (
        <>
          {products.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onCompare={() => console.log('Compare', product.name)}
                  onAddToList={() => console.log('Add to list', product.name)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('search.no_results')}</h3>
              <p className="text-gray-600">Try adjusting your search terms or filters</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};