import React, { useState, useEffect } from 'react';
import { Tag, TrendingDown, Clock, MapPin, Star, Filter, Search, Percent, DollarSign } from 'lucide-react';
import { useProducts } from '../../hooks/useProducts';
import { useCurrency } from '../../hooks/useCurrency';
import { useLanguage } from '../../hooks/useLanguage';
import type { ProductWithCategory } from '../../services/productService';

interface Deal {
  id: string;
  product: ProductWithCategory;
  originalPrice: number;
  discountedPrice: number;
  discountPercentage: number;
  savings: number;
  store: string;
  validUntil: string;
  isLimitedTime: boolean;
}

export const DealsTab: React.FC = () => {
  const { t } = useLanguage();
  const { formatCurrency } = useCurrency();
  const { products, loading, error } = useProducts();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [filteredDeals, setFilteredDeals] = useState<Deal[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStore, setSelectedStore] = useState('all');
  const [sortBy, setSortBy] = useState<'savings' | 'percentage' | 'expiry'>('savings');

  // Generate deals from products
  useEffect(() => {
    if (products.length > 0) {
      const generatedDeals: Deal[] = products.map((product, index) => {
        // Generate realistic discount percentages (10-40%)
        const discountPercentage = Math.floor(Math.random() * 30) + 10;
        const originalPrice = product.price;
        const discountedPrice = originalPrice * (1 - discountPercentage / 100);
        const savings = originalPrice - discountedPrice;
        
        // Generate expiry dates (1-7 days from now)
        const daysUntilExpiry = Math.floor(Math.random() * 7) + 1;
        const validUntil = new Date();
        validUntil.setDate(validUntil.getDate() + daysUntilExpiry);
        
        return {
          id: `deal-${product.id}`,
          product,
          originalPrice,
          discountedPrice,
          discountPercentage,
          savings,
          store: product.store_id,
          validUntil: validUntil.toISOString(),
          isLimitedTime: daysUntilExpiry <= 2
        };
      });

      setDeals(generatedDeals);
    }
  }, [products]);

  // Filter and sort deals
  useEffect(() => {
    let filtered = deals;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(deal =>
        deal.product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        deal.product.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        deal.store.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by store
    if (selectedStore !== 'all') {
      filtered = filtered.filter(deal => deal.store === selectedStore);
    }

    // Sort deals
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'savings':
          return b.savings - a.savings;
        case 'percentage':
          return b.discountPercentage - a.discountPercentage;
        case 'expiry':
          return new Date(a.validUntil).getTime() - new Date(b.validUntil).getTime();
        default:
          return b.savings - a.savings;
      }
    });

    setFilteredDeals(filtered);
  }, [deals, searchQuery, selectedStore, sortBy]);

  const getTimeRemaining = (validUntil: string) => {
    const now = new Date();
    const expiry = new Date(validUntil);
    const diff = expiry.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expired';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    return `${hours}h`;
  };

  const getStoreDisplayName = (storeId: string) => {
    const storeNames: { [key: string]: string } = {
      'pick-n-pay': 'Pick n Pay',
      'shoprite': 'Shoprite',
      'checkers': 'Checkers',
      'woolworths': 'Woolworths',
      'spar': 'SPAR'
    };
    return storeNames[storeId] || storeId;
  };

  const uniqueStores = Array.from(new Set(deals.map(deal => deal.store)));

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Deals</h3>
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">{t('deals.hot_deals')}</h2>
        <p className="text-gray-600">Discover the best deals and save money on your grocery shopping</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100">Total Deals</p>
              <p className="text-3xl font-bold">{deals.length}</p>
            </div>
            <Tag className="h-8 w-8 text-green-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">Avg Savings</p>
              <p className="text-3xl font-bold">
                {deals.length > 0 ? Math.round(deals.reduce((sum, deal) => sum + deal.discountPercentage, 0) / deals.length) : 0}%
              </p>
            </div>
            <TrendingDown className="h-8 w-8 text-blue-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100">Expiring Soon</p>
              <p className="text-3xl font-bold">
                {deals.filter(deal => deal.isLimitedTime).length}
              </p>
            </div>
            <Clock className="h-8 w-8 text-orange-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100">Stores</p>
              <p className="text-3xl font-bold">{uniqueStores.length}</p>
            </div>
            <MapPin className="h-8 w-8 text-purple-200" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search deals..."
              className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl bg-white shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>
          
          {/* Store Filter */}
          <select
            value={selectedStore}
            onChange={(e) => setSelectedStore(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-xl bg-white shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
          >
            <option value="all">All Stores</option>
            {uniqueStores.map(store => (
              <option key={store} value={store}>{getStoreDisplayName(store)}</option>
            ))}
          </select>
          
          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'savings' | 'percentage' | 'expiry')}
            className="px-4 py-3 border border-gray-300 rounded-xl bg-white shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
          >
            <option value="savings">Highest Savings</option>
            <option value="percentage">Best Percentage</option>
            <option value="expiry">Expiring Soon</option>
          </select>
        </div>
      </div>

      {/* Deals Grid */}
      {filteredDeals.length === 0 ? (
        <div className="text-center py-16">
          <Tag className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No deals found</h3>
          <p className="text-gray-600">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDeals.map((deal) => (
            <div key={deal.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-gray-100">
              <div className="relative">
                <img 
                  src={deal.product.image_url || 'https://images.pexels.com/photos/264547/pexels-photo-264547.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop'}
                  alt={deal.product.name}
                  className="w-full h-48 object-cover"
                />
                
                {/* Discount Badge */}
                <div className="absolute top-3 left-3 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                  {deal.discountPercentage}% OFF
                </div>
                
                {/* Limited Time Badge */}
                {deal.isLimitedTime && (
                  <div className="absolute top-3 right-3 bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold animate-pulse">
                    LIMITED TIME
                  </div>
                )}
              </div>
              
              <div className="p-6">
                <div className="mb-4">
                  <h3 className="font-bold text-lg text-gray-900 mb-1">{deal.product.name}</h3>
                  <p className="text-gray-600 text-sm">{deal.product.description}</p>
                  <p className="text-blue-600 text-sm font-medium mt-1">{getStoreDisplayName(deal.store)}</p>
                </div>

                {/* Price Section */}
                <div className="mb-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-2xl font-bold text-green-600">
                      {formatCurrency(deal.discountedPrice)}
                    </span>
                    <span className="text-lg text-gray-500 line-through">
                      {formatCurrency(deal.originalPrice)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center space-x-1 text-green-600">
                      <TrendingDown className="h-4 w-4" />
                      <span className="font-semibold">{formatCurrency(deal.savings)} saved</span>
                    </div>
                    <div className="flex items-center space-x-1 text-red-600">
                      <Percent className="h-4 w-4" />
                      <span className="font-semibold">{deal.discountPercentage}% off</span>
                    </div>
                  </div>
                </div>

                {/* Expiry Info */}
                <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>{getTimeRemaining(deal.validUntil)} remaining</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-4 w-4" />
                    <span>2.3km away</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <button className="flex items-center justify-center space-x-2 bg-green-50 hover:bg-green-100 text-green-700 font-medium py-3 px-4 rounded-lg transition-colors">
                    <Star className="h-4 w-4" />
                    <span>Save Deal</span>
                  </button>
                  <button className="flex items-center justify-center space-x-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium py-3 px-4 rounded-lg transition-colors">
                    <MapPin className="h-4 w-4" />
                    <span>View Store</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};