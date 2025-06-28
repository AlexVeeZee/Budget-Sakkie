import React, { useState, useMemo, lazy, Suspense, useEffect } from 'react';
import { Search, Filter, ScanLine, MapPin } from 'lucide-react';
import { useProducts } from '../../hooks/useProducts';
import { useLanguage } from '../../hooks/useLanguage';
import { useCurrency } from '../../hooks/useCurrency';
import { useCart } from '../../context/CartContext';
import { ProductGrid } from '../ProductGrid';
import type { ProductWithCategory } from '../../services/productService';

// Lazy load heavy components
const FilterModal = lazy(() => import('../modals/FilterModal'));

interface SearchTabProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onProductSelect?: (productInfo: { id: string; name: string }) => void;
}

export const SearchTab: React.FC<SearchTabProps> = ({ 
  searchQuery, 
  onSearchChange,
  onProductSelect 
}) => {
  const { t } = useLanguage();
  const { formatCurrency } = useCurrency();
  const { products, categories, loading, error, searchProducts, getProductsByCategory, getProductsByStore, refreshProducts } = useProducts();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStore, setSelectedStore] = useState('all');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);

  // Use the cart context
  const { addItem } = useCart();

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (localSearchQuery !== searchQuery) {
        onSearchChange(localSearchQuery);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [localSearchQuery, searchQuery, onSearchChange]);

  // Handle search when searchQuery changes
  useEffect(() => {
    if (searchQuery.trim()) {
      searchProducts(searchQuery);
    } else if (selectedCategory !== 'all') {
      getProductsByCategory(selectedCategory);
    } else if (selectedStore !== 'all') {
      getProductsByStore(selectedStore);
    } else {
      refreshProducts();
    }
  }, [searchQuery, selectedCategory, selectedStore, searchProducts, getProductsByCategory, getProductsByStore, refreshProducts]);

  // Get unique stores from products
  const uniqueStores = useMemo(() => {
    const stores = Array.from(new Set(products.map(product => product.store_id)));
    return stores.map(storeId => ({
      id: storeId,
      name: getStoreDisplayName(storeId)
    }));
  }, [products]);

  // Filter products based on current selections
  const filteredProducts = useMemo(() => {
    let filtered = products;
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category_id === selectedCategory);
    }
    
    if (selectedStore !== 'all') {
      filtered = filtered.filter(product => product.store_id === selectedStore);
    }
    
    return filtered;
  }, [products, selectedCategory, selectedStore]);

  // Calculate stats
  const stats = useMemo(() => {
    const totalProducts = filteredProducts.length;
    const inStockProducts = filteredProducts.filter(p => (p.stock_quantity || 0) > 0).length;
    const avgPrice = totalProducts > 0 
      ? filteredProducts.reduce((sum, p) => sum + p.price, 0) / totalProducts 
      : 0;
    const uniqueStoresCount = new Set(filteredProducts.map(p => p.store_id)).size;

    return {
      totalProducts,
      inStockProducts,
      avgPrice,
      uniqueStoresCount
    };
  }, [filteredProducts]);

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    if (categoryId !== 'all') {
      getProductsByCategory(categoryId);
    } else {
      refreshProducts();
    }
  };

  const handleStoreChange = (storeId: string) => {
    setSelectedStore(storeId);
    if (storeId !== 'all') {
      getProductsByStore(storeId);
    } else {
      refreshProducts();
    }
  };

  const handleAddToList = (product: ProductWithCategory) => {
    addItem({
      id: product.id,
      name: product.name,
      brand: getStoreDisplayName(product.store_id),
      category: product.category?.name || 'General',
      image: product.image_url || 'https://images.pexels.com/photos/264547/pexels-photo-264547.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop',
      unit: 'each',
      unitSize: getUnitSize(product),
      price: product.price
    });
  };

  // Helper function to get store display name
  function getStoreDisplayName(storeId: string) {
    const storeNames: { [key: string]: string } = {
      'pick-n-pay': 'Pick n Pay',
      'shoprite': 'Shoprite',
      'checkers': 'Checkers',
      'woolworths': 'Woolworths',
      'spar': 'SPAR'
    };
    return storeNames[storeId] || storeId;
  }

  // Helper function to determine unit size based on product data
  function getUnitSize(product: ProductWithCategory): string {
    if (product.sku?.includes('kg')) return 'per kg';
    if (product.sku?.includes('g')) return product.sku.match(/\d+g/) ? product.sku.match(/\d+g/)?.[0] || 'pack' : 'pack';
    if (product.sku?.includes('L') || product.sku?.includes('l')) return product.sku.match(/\d+[Ll]/) ? product.sku.match(/\d+[Ll]/)?.[0] || 'bottle' : 'bottle';
    if (product.category?.name === 'Dairy & Eggs') return 'pack';
    if (product.category?.name === 'Fresh Produce') return 'per kg';
    if (product.category?.name === 'Meat & Poultry') return 'per kg';
    if (product.category?.name === 'Bakery') return 'loaf';
    return 'each';
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Products</h3>
          <p className="text-red-700 mb-4">{error}</p>
          <button
            onClick={refreshProducts}
            className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-32">
      {/* Search Header */}
      <div className="mb-6">
        <div className="relative mb-4">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={localSearchQuery}
            onChange={(e) => setLocalSearchQuery(e.target.value)}
            placeholder="Search products by name, description, or store..."
            className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl bg-white shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 placeholder-gray-500"
          />
          <div className="absolute inset-y-0 right-0 flex items-center space-x-2 pr-3">
            <button 
              className="p-2 text-gray-400 hover:text-gray-600 min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Scan barcode"
            >
              <ScanLine className="h-5 w-5" />
            </button>
            <button 
              onClick={() => setShowFilterModal(true)}
              className="p-2 text-gray-400 hover:text-gray-600 min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Open filters"
            >
              <Filter className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="bg-white rounded-lg p-3 text-center shadow-sm">
            <p className="text-2xl font-bold text-green-600">{stats.totalProducts}</p>
            <p className="text-xs text-gray-600">Products Found</p>
          </div>
          <div className="bg-white rounded-lg p-3 text-center shadow-sm">
            <p className="text-2xl font-bold text-blue-600">{stats.inStockProducts}</p>
            <p className="text-xs text-gray-600">In Stock</p>
          </div>
          <div className="bg-white rounded-lg p-3 text-center shadow-sm">
            <p className="text-2xl font-bold text-orange-600">{formatCurrency(stats.avgPrice)}</p>
            <p className="text-xs text-gray-600">Avg Price</p>
          </div>
          <div className="bg-white rounded-lg p-3 text-center shadow-sm">
            <p className="text-2xl font-bold text-purple-600">{stats.uniqueStoresCount}</p>
            <p className="text-xs text-gray-600">Stores</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="all">All Categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Store Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Store</label>
              <select
                value={selectedStore}
                onChange={(e) => handleStoreChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="all">All Stores</option>
                {uniqueStores.map((store) => (
                  <option key={store.id} value={store.id}>
                    {store.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      )}

      {/* Products Grid */}
      {!loading && (
        <>
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {searchQuery ? 'No products found' : 'No products available'}
              </h3>
              <p className="text-gray-600">
                {searchQuery 
                  ? 'Try adjusting your search terms or filters' 
                  : 'Check back later for new products'
                }
              </p>
              {(selectedCategory !== 'all' || selectedStore !== 'all') && (
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setSelectedStore('all');
                    refreshProducts();
                  }}
                  className="mt-4 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <ProductGrid
              products={filteredProducts.map(product => ({
                id: product.id,
                name: product.name,
                brand: getStoreDisplayName(product.store_id),
                category: product.category?.name || 'General',
                image: product.image_url || 'https://images.pexels.com/photos/264547/pexels-photo-264547.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop',
                unit: 'each',
                unitSize: getUnitSize(product),
                price: product.price
              }))}
              onProductSelect={onProductSelect}
              onAddToList={(product) => handleAddToList(
                filteredProducts.find(p => p.id === product.id) as ProductWithCategory
              )}
            />
          )}
        </>
      )}

      {/* Lazy loaded Filter Modal */}
      <Suspense fallback={<div>Loading...</div>}>
        {showFilterModal && (
          <FilterModal
            isOpen={showFilterModal}
            onClose={() => setShowFilterModal(false)}
          />
        )}
      </Suspense>
    </div>
  );
};