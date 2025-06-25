import React, { useState, useMemo, useCallback, lazy, Suspense } from 'react';
import { Tag, Clock, TrendingDown, MapPin, Filter, ToggleLeft, ToggleRight, Star, Package, AlertCircle, CheckCircle, Eye, ShoppingCart } from 'lucide-react';
import { Deal, Product, Price, Retailer } from '../../types';
import { useLanguage } from '../../hooks/useLanguage';
import { useCurrency } from '../../hooks/useCurrency';
import { retailers, products, prices } from '../../data/mockData';

// Lazy load the deal detail modal
const DealDetailModal = lazy(() => import('../modals/DealDetailModal').then(module => ({ default: module.DealDetailModal })));

interface BundleDeal extends Deal {
  bundleItems: Array<{
    product: Product;
    quantity: number;
    originalPrice: number;
    discountedPrice: number;
  }>;
  totalOriginalPrice: number;
  totalDiscountedPrice: number;
  totalSavings: number;
  termsAndConditions: string[];
}

interface DealCache {
  [storeId: string]: BundleDeal[];
}

export const DealsTab: React.FC = () => {
  const { t } = useLanguage();
  const { formatCurrency } = useCurrency();
  
  // State management
  const [showExpiredDeals, setShowExpiredDeals] = useState(false);
  const [selectedStore, setSelectedStore] = useState<string>('all');
  const [selectedDeal, setSelectedDeal] = useState<BundleDeal | null>(null);
  const [showDealModal, setShowDealModal] = useState(false);
  const [dealCache] = useState<DealCache>({});

  // Generate comprehensive bundle deals data
  const bundleDeals: BundleDeal[] = useMemo(() => [
    {
      id: '1',
      productId: 'bundle-1',
      retailer: retailers[0], // Pick n Pay
      discount: 25,
      type: 'percentage',
      description: 'Family Breakfast Bundle - Everything you need for a perfect family breakfast',
      validUntil: '2024-01-25T23:59:59Z',
      conditions: 'Valid until Sunday, while stocks last',
      bundleItems: [
        {
          product: products[0], // Bread
          quantity: 2,
          originalPrice: 15.99,
          discountedPrice: 11.99
        },
        {
          product: products[1], // Milk
          quantity: 2,
          originalPrice: 22.99,
          discountedPrice: 17.24
        },
        {
          product: products[2], // Eggs
          quantity: 1,
          originalPrice: 34.99,
          discountedPrice: 26.24
        }
      ],
      totalOriginalPrice: 112.96,
      totalDiscountedPrice: 84.72,
      totalSavings: 28.24,
      termsAndConditions: [
        'Valid until January 25, 2024',
        'While stocks last',
        'Cannot be combined with other offers',
        'Limit 2 bundles per customer',
        'Valid at participating stores only'
      ]
    },
    {
      id: '2',
      productId: 'bundle-2',
      retailer: retailers[1], // Shoprite
      discount: 30,
      type: 'percentage',
      description: 'Weekend BBQ Special - Perfect for your weekend braai',
      validUntil: '2024-01-21T23:59:59Z',
      conditions: 'Weekend special offer',
      bundleItems: [
        {
          product: products[4], // Chicken
          quantity: 2,
          originalPrice: 89.99,
          discountedPrice: 62.99
        },
        {
          product: products[3], // Rice
          quantity: 1,
          originalPrice: 45.99,
          discountedPrice: 32.19
        }
      ],
      totalOriginalPrice: 225.97,
      totalDiscountedPrice: 158.17,
      totalSavings: 67.80,
      termsAndConditions: [
        'Valid until January 21, 2024',
        'Weekend special - Friday to Sunday only',
        'Fresh meat products only',
        'Subject to availability',
        'Cannot be reserved'
      ]
    },
    {
      id: '3',
      productId: 'bundle-3',
      retailer: retailers[2], // Checkers
      discount: 20,
      type: 'percentage',
      description: 'Healthy Living Bundle - Fresh and nutritious essentials',
      validUntil: '2024-01-30T23:59:59Z',
      conditions: 'Health month special',
      bundleItems: [
        {
          product: products[5], // Bananas
          quantity: 3,
          originalPrice: 19.99,
          discountedPrice: 15.99
        },
        {
          product: products[1], // Milk
          quantity: 1,
          originalPrice: 22.99,
          discountedPrice: 18.39
        },
        {
          product: products[2], // Eggs
          quantity: 1,
          originalPrice: 34.99,
          discountedPrice: 27.99
        }
      ],
      totalOriginalPrice: 97.96,
      totalDiscountedPrice: 78.37,
      totalSavings: 19.59,
      termsAndConditions: [
        'Valid until January 30, 2024',
        'Health month promotion',
        'Fresh produce subject to seasonal availability',
        'Quality guarantee on all fresh items',
        'Nutritionist approved selection'
      ]
    },
    {
      id: '4',
      productId: 'bundle-4',
      retailer: retailers[3], // Woolworths
      discount: 15,
      type: 'percentage',
      description: 'Premium Pantry Essentials - Quality ingredients for your kitchen',
      validUntil: '2024-01-15T23:59:59Z', // Expired
      conditions: 'Premium quality guarantee',
      bundleItems: [
        {
          product: products[3], // Rice
          quantity: 2,
          originalPrice: 45.99,
          discountedPrice: 39.09
        },
        {
          product: products[0], // Bread
          quantity: 1,
          originalPrice: 15.99,
          discountedPrice: 13.59
        }
      ],
      totalOriginalPrice: 107.97,
      totalDiscountedPrice: 91.77,
      totalSavings: 16.20,
      termsAndConditions: [
        'Premium quality products only',
        'Organic and sustainable sourcing',
        'Money-back quality guarantee',
        'Valid at Woolworths stores nationwide',
        'Offer has expired'
      ]
    },
    {
      id: '5',
      productId: 'bundle-5',
      retailer: retailers[4], // SPAR
      discount: 35,
      type: 'percentage',
      description: 'Student Special - Budget-friendly essentials for students',
      validUntil: '2024-01-28T23:59:59Z',
      conditions: 'Student ID required',
      bundleItems: [
        {
          product: products[0], // Bread
          quantity: 3,
          originalPrice: 15.99,
          discountedPrice: 10.39
        },
        {
          product: products[1], // Milk
          quantity: 2,
          originalPrice: 22.99,
          discountedPrice: 14.94
        },
        {
          product: products[3], // Rice
          quantity: 1,
          originalPrice: 45.99,
          discountedPrice: 29.89
        }
      ],
      totalOriginalPrice: 122.95,
      totalDiscountedPrice: 79.92,
      totalSavings: 43.03,
      termsAndConditions: [
        'Valid student ID required',
        'Valid until January 28, 2024',
        'Limit one bundle per student per week',
        'Cannot be combined with loyalty discounts',
        'Available at campus stores only'
      ]
    }
  ], []);

  // Utility functions
  const isExpired = useCallback((validUntil: string): boolean => {
    return new Date(validUntil) < new Date();
  }, []);

  const getTimeRemaining = useCallback((validUntil: string): string => {
    const now = new Date();
    const end = new Date(validUntil);
    const diff = end.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expired';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h left`;
    if (hours > 0) return `${hours}h left`;
    return 'Expires soon';
  }, []);

  const isExpiringSoon = useCallback((validUntil: string): boolean => {
    const now = new Date();
    const end = new Date(validUntil);
    const diff = end.getTime() - now.getTime();
    const hoursRemaining = diff / (1000 * 60 * 60);
    return hoursRemaining <= 24 && hoursRemaining > 0;
  }, []);

  // Filtered deals with client-side caching
  const filteredDeals = useMemo(() => {
    let filtered = bundleDeals;

    // Filter by store
    if (selectedStore !== 'all') {
      filtered = filtered.filter(deal => deal.retailer.id === selectedStore);
    }
  }, [products]);

    // Filter by expiry status
    if (!showExpiredDeals) {
      filtered = filtered.filter(deal => !isExpired(deal.validUntil));
    }

    // Sort by savings (highest first) and then by expiry
    return filtered.sort((a, b) => {
      const aExpired = isExpired(a.validUntil);
      const bExpired = isExpired(b.validUntil);
      
      if (aExpired !== bExpired) {
        return aExpired ? 1 : -1; // Non-expired first
      }
      
      return b.totalSavings - a.totalSavings; // Higher savings first
    });
  }, [bundleDeals, selectedStore, showExpiredDeals, isExpired];

  // Event handlers
  const handleDealClick = useCallback((deal: BundleDeal) => {
    setSelectedDeal(deal);
    setShowDealModal(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setShowDealModal(false);
    setSelectedDeal(null);
  }, []);

  const handleToggleExpired = useCallback(() => {
    setShowExpiredDeals(prev => !prev);
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('deals.hot_deals')}</h2>
        <p className="text-gray-600">Discover amazing bundle deals and save more on your grocery shopping</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg p-4 text-center shadow-sm border border-gray-200">
          <div className="flex items-center justify-center mb-2">
            <Tag className="h-6 w-6 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{filteredDeals.length}</p>
          <p className="text-xs text-gray-600">Active Deals</p>
        </div>
        <div className="bg-white rounded-lg p-4 text-center shadow-sm border border-gray-200">
          <div className="flex items-center justify-center mb-2">
            <TrendingDown className="h-6 w-6 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(filteredDeals.reduce((sum, deal) => sum + deal.totalSavings, 0))}
          </p>
          <p className="text-xs text-gray-600">Total Savings</p>
        </div>
        <div className="bg-white rounded-lg p-4 text-center shadow-sm border border-gray-200">
          <div className="flex items-center justify-center mb-2">
            <Clock className="h-6 w-6 text-orange-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {filteredDeals.filter(deal => isExpiringSoon(deal.validUntil)).length}
          </p>
          <p className="text-xs text-gray-600">Expiring Soon</p>
        </div>
        <div className="bg-white rounded-lg p-4 text-center shadow-sm border border-gray-200">
          <div className="flex items-center justify-center mb-2">
            <Star className="h-6 w-6 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {Math.round(filteredDeals.reduce((sum, deal) => sum + deal.discount, 0) / filteredDeals.length || 0)}%
          </p>
          <p className="text-xs text-gray-600">Avg Discount</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <Filter className="h-5 w-5 text-gray-600" />
            <span className="font-medium text-gray-900">Filters</span>
          </div>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
            {/* Store Filter */}
            <div className="flex items-center space-x-3">
              <label className="text-sm font-medium text-gray-700">Store:</label>
              <select
                value={selectedStore}
                onChange={(e) => setSelectedStore(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
              >
                <option value="all">All Stores</option>
                {retailers.map((retailer) => (
                  <option key={retailer.id} value={retailer.id}>
                    {retailer.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Show Expired Toggle */}
            <div className="flex items-center space-x-3">
              <label className="text-sm font-medium text-gray-700">Show Expired Deals:</label>
              <button
                onClick={handleToggleExpired}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
                  showExpiredDeals ? 'bg-green-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    showExpiredDeals ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Deals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDeals.map((deal) => {
          const expired = isExpired(deal.validUntil);
          const expiringSoon = isExpiringSoon(deal.validUntil);
          const timeRemaining = getTimeRemaining(deal.validUntil);

          return (
            <div
              key={deal.id}
              onClick={() => handleDealClick(deal)}
              className={`bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border cursor-pointer group ${
                expired 
                  ? 'border-gray-200 opacity-60' 
                  : expiringSoon 
                    ? 'border-orange-200 hover:border-orange-300' 
                    : 'border-gray-200 hover:border-green-300'
              }`}
            >
              {/* Deal Header */}
              <div className={`relative p-4 ${
                expired 
                  ? 'bg-gray-50' 
                  : expiringSoon 
                    ? 'bg-orange-50' 
                    : 'bg-green-50'
              }`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <img 
                      src={deal.retailer.logo}
                      alt={deal.retailer.name}
                      className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
                    />
                    <div>
                      <h3 className="font-semibold text-gray-900">{deal.retailer.name}</h3>
                      <p className="text-sm text-gray-600">{deal.retailer.locations[0]?.distance}km away</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold ${
                      expired 
                        ? 'bg-gray-200 text-gray-700' 
                        : expiringSoon 
                          ? 'bg-orange-200 text-orange-800' 
                          : 'bg-green-200 text-green-800'
                    }`}>
                      {deal.discount}% OFF
                    </div>
                  </div>
                </div>

                {/* Status Badges */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {expired && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Expired
                      </span>
                    )}
                    {!expired && expiringSoon && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 animate-pulse">
                        <Clock className="h-3 w-3 mr-1" />
                        Expiring Soon
                      </span>
                    )}
                    {!expired && !expiringSoon && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Active
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-1 text-xs text-gray-600">
                    <Clock className="h-3 w-3" />
                    <span>{timeRemaining}</span>
                  </div>
                </div>
              </div>

              {/* Deal Content */}
              <div className="p-4">
                <h4 className="font-bold text-gray-900 mb-2 group-hover:text-green-600 transition-colors">
                  {deal.description}
                </h4>
                
                <p className="text-sm text-gray-600 mb-4">{deal.conditions}</p>

                {/* Bundle Preview */}
                <div className="mb-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Package className="h-4 w-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">
                      Bundle includes {deal.bundleItems.length} items:
                    </span>
                  </div>
                  <div className="space-y-1">
                    {deal.bundleItems.slice(0, 2).map((item, index) => (
                      <div key={index} className="flex items-center justify-between text-xs">
                        <span className="text-gray-600">
                          {item.quantity}x {item.product.name}
                        </span>
                        <span className="font-medium text-gray-900">
                          {formatCurrency(item.discountedPrice)}
                        </span>
                      </div>
                    ))}
                    {deal.bundleItems.length > 2 && (
                      <div className="text-xs text-gray-500">
                        +{deal.bundleItems.length - 2} more items
                      </div>
                    )}
                  </div>
                </div>

                {/* Savings Summary */}
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Original Price:</span>
                    <span className="text-sm text-gray-500 line-through">
                      {formatCurrency(deal.totalOriginalPrice)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Bundle Price:</span>
                    <span className="text-lg font-bold text-gray-900">
                      {formatCurrency(deal.totalDiscountedPrice)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-green-600">You Save:</span>
                    <span className="text-lg font-bold text-green-600">
                      {formatCurrency(deal.totalSavings)}
                    </span>
                  </div>
                </div>

                {/* Action Hint */}
                <div className="mt-4 flex items-center justify-center text-sm text-gray-500 group-hover:text-green-600 transition-colors">
                  <Eye className="h-4 w-4 mr-2" />
                  Click to view details and add to list
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredDeals.length === 0 && (
        <div className="text-center py-12">
          <Tag className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No deals found</h3>
          <p className="text-gray-600 mb-4">
            {selectedStore !== 'all' 
              ? `No deals available for ${retailers.find(r => r.id === selectedStore)?.name || 'selected store'}`
              : showExpiredDeals 
                ? 'No deals match your current filters'
                : 'Try enabling "Show Expired Deals" to see more options'
            }
          </p>
          {selectedStore !== 'all' && (
            <button
              onClick={() => setSelectedStore('all')}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
            >
              Show All Stores
            </button>
          )}
        </div>
      )}

      {/* Deal Detail Modal */}
      <Suspense fallback={
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      }>
        {showDealModal && selectedDeal && (
          <DealDetailModal
            isOpen={showDealModal}
            onClose={handleCloseModal}
            deal={selectedDeal}
          />
        )}
      </Suspense>
    </div>
  );
};