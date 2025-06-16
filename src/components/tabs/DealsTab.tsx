import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Tag, 
  Clock, 
  MapPin, 
  Filter, 
  TrendingDown, 
  Percent, 
  Search,
  Star,
  ShoppingCart,
  AlertCircle,
  RefreshCw,
  SortAsc,
  SortDesc,
  Calendar,
  DollarSign,
  Eye,
  Share2,
  Bookmark,
  BookmarkCheck
} from 'lucide-react';
import { deals, products, retailers } from '../../data/mockData';
import { useLanguage } from '../../hooks/useLanguage';
import { useCurrency } from '../../hooks/useCurrency';
import { Deal, Product, Retailer } from '../../types';

interface ExtendedDeal extends Deal {
  product?: Product;
  isBookmarked?: boolean;
  viewCount?: number;
  shareCount?: number;
}

interface FilterState {
  category: string;
  retailer: string;
  discountType: string;
  minDiscount: number;
  maxDiscount: number;
  expiryFilter: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

interface FeaturedDeal {
  id: string;
  title: string;
  description: string;
  retailer: Retailer;
  discount: string;
  validUntil: string;
  image: string;
  category: string;
  isLimited?: boolean;
  originalPrice?: number;
  salePrice?: number;
}

export const DealsTab: React.FC = () => {
  const { t } = useLanguage();
  const { formatCurrency } = useCurrency();
  
  // State management
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [bookmarkedDeals, setBookmarkedDeals] = useState<Set<string>>(new Set());
  const [viewedDeals, setViewedDeals] = useState<Set<string>>(new Set());
  const [refreshing, setRefreshing] = useState(false);

  const [filters, setFilters] = useState<FilterState>({
    category: 'all',
    retailer: 'all',
    discountType: 'all',
    minDiscount: 0,
    maxDiscount: 100,
    expiryFilter: 'all',
    sortBy: 'savings',
    sortOrder: 'desc'
  });

  // Enhanced deals data with additional properties
  const [extendedDeals, setExtendedDeals] = useState<ExtendedDeal[]>([]);

  // Featured deals with more comprehensive data
  const featuredDeals: FeaturedDeal[] = [
    {
      id: 'weekend-special',
      title: 'Weekend Grocery Special',
      description: 'Save up to 25% on selected fresh produce and dairy items',
      retailer: retailers[1],
      discount: '25%',
      validUntil: '2024-01-21T23:59:59Z',
      image: 'https://images.pexels.com/photos/264547/pexels-photo-264547.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop',
      category: 'Fresh Produce',
      isLimited: true,
      originalPrice: 150,
      salePrice: 112.50
    },
    {
      id: 'family-pack',
      title: 'Family Pack Savings',
      description: 'Buy 2 get 1 free on family essentials and household items',
      retailer: retailers[0],
      discount: '33%',
      validUntil: '2024-01-19T23:59:59Z',
      image: 'https://images.pexels.com/photos/3962285/pexels-photo-3962285.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop',
      category: 'Household',
      isLimited: false,
      originalPrice: 200,
      salePrice: 134
    },
    {
      id: 'bulk-discount',
      title: 'Bulk Shopping Bonanza',
      description: 'Extra 15% off when you spend R500 or more',
      retailer: retailers[2],
      discount: '15%',
      validUntil: '2024-01-25T23:59:59Z',
      image: 'https://images.pexels.com/photos/4481259/pexels-photo-4481259.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop',
      category: 'Bulk',
      isLimited: true,
      originalPrice: 500,
      salePrice: 425
    }
  ];

  // Filter options
  const filterOptions = {
    categories: [
      { id: 'all', label: 'All Categories' },
      { id: 'Fresh Produce', label: 'Fresh Produce' },
      { id: 'Dairy', label: 'Dairy & Eggs' },
      { id: 'Meat', label: 'Meat & Poultry' },
      { id: 'Bakery', label: 'Bakery' },
      { id: 'Pantry', label: 'Pantry Essentials' },
      { id: 'Household', label: 'Household Items' },
      { id: 'Beverages', label: 'Beverages' }
    ],
    retailers: [
      { id: 'all', label: 'All Retailers' },
      ...retailers.map(r => ({ id: r.id, label: r.name }))
    ],
    discountTypes: [
      { id: 'all', label: 'All Discounts' },
      { id: 'percentage', label: 'Percentage Off' },
      { id: 'fixed', label: 'Fixed Amount' },
      { id: 'bogo', label: 'Buy One Get One' },
      { id: 'bulk', label: 'Bulk Discounts' }
    ],
    expiryFilters: [
      { id: 'all', label: 'All Deals' },
      { id: 'today', label: 'Expiring Today' },
      { id: 'week', label: 'This Week' },
      { id: 'month', label: 'This Month' }
    ],
    sortOptions: [
      { id: 'savings', label: 'Highest Savings' },
      { id: 'discount', label: 'Discount Amount' },
      { id: 'expiry', label: 'Expiry Date' },
      { id: 'popularity', label: 'Most Popular' },
      { id: 'recent', label: 'Recently Added' }
    ]
  };

  // Initialize extended deals data
  useEffect(() => {
    const initializeDeals = () => {
      const enhanced = deals.map(deal => {
        const product = products.find(p => p.id === deal.productId);
        return {
          ...deal,
          product,
          isBookmarked: bookmarkedDeals.has(deal.id),
          viewCount: Math.floor(Math.random() * 1000) + 50,
          shareCount: Math.floor(Math.random() * 100) + 10
        };
      });
      setExtendedDeals(enhanced);
    };

    initializeDeals();
  }, [bookmarkedDeals]);

  // Time calculation utilities
  const getTimeRemaining = useCallback((validUntil: string) => {
    const now = new Date();
    const end = new Date(validUntil);
    const diff = end.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expired';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  }, []);

  const isExpiringSoon = useCallback((validUntil: string) => {
    const now = new Date();
    const end = new Date(validUntil);
    const diff = end.getTime() - now.getTime();
    const hoursRemaining = diff / (1000 * 60 * 60);
    return hoursRemaining <= 24 && hoursRemaining > 0;
  }, []);

  const isExpired = useCallback((validUntil: string) => {
    const now = new Date();
    const end = new Date(validUntil);
    return end.getTime() <= now.getTime();
  }, []);

  // Filter and search logic
  const filteredDeals = useMemo(() => {
    let filtered = extendedDeals;

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(deal => 
        deal.description.toLowerCase().includes(query) ||
        deal.product?.name.toLowerCase().includes(query) ||
        deal.product?.brand.toLowerCase().includes(query) ||
        deal.retailer.name.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (filters.category !== 'all') {
      filtered = filtered.filter(deal => 
        deal.product?.category === filters.category
      );
    }

    // Retailer filter
    if (filters.retailer !== 'all') {
      filtered = filtered.filter(deal => 
        deal.retailer.id === filters.retailer
      );
    }

    // Discount type filter
    if (filters.discountType !== 'all') {
      filtered = filtered.filter(deal => 
        deal.type === filters.discountType
      );
    }

    // Discount amount filter
    filtered = filtered.filter(deal => {
      const discountValue = typeof deal.discount === 'number' ? deal.discount : parseFloat(deal.discount.toString());
      return discountValue >= filters.minDiscount && discountValue <= filters.maxDiscount;
    });

    // Expiry filter
    if (filters.expiryFilter !== 'all') {
      const now = new Date();
      filtered = filtered.filter(deal => {
        const expiryDate = new Date(deal.validUntil);
        const diffHours = (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60);
        
        switch (filters.expiryFilter) {
          case 'today':
            return diffHours <= 24 && diffHours > 0;
          case 'week':
            return diffHours <= 168 && diffHours > 0; // 7 days
          case 'month':
            return diffHours <= 720 && diffHours > 0; // 30 days
          default:
            return true;
        }
      });
    }

    // Sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (filters.sortBy) {
        case 'savings':
          const aSavings = typeof a.discount === 'number' ? a.discount : parseFloat(a.discount.toString());
          const bSavings = typeof b.discount === 'number' ? b.discount : parseFloat(b.discount.toString());
          comparison = aSavings - bSavings;
          break;
        case 'expiry':
          comparison = new Date(a.validUntil).getTime() - new Date(b.validUntil).getTime();
          break;
        case 'popularity':
          comparison = (a.viewCount || 0) - (b.viewCount || 0);
          break;
        case 'recent':
          comparison = new Date(a.validUntil).getTime() - new Date(b.validUntil).getTime();
          break;
        default:
          comparison = 0;
      }
      
      return filters.sortOrder === 'desc' ? -comparison : comparison;
    });

    return filtered;
  }, [extendedDeals, searchQuery, filters]);

  // Event handlers
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setError(null);
  }, []);

  const handleFilterChange = useCallback((key: keyof FilterState, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleBookmarkToggle = useCallback((dealId: string) => {
    setBookmarkedDeals(prev => {
      const newSet = new Set(prev);
      if (newSet.has(dealId)) {
        newSet.delete(dealId);
      } else {
        newSet.add(dealId);
      }
      return newSet;
    });
  }, []);

  const handleDealView = useCallback((dealId: string) => {
    setViewedDeals(prev => new Set([...prev, dealId]));
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In a real app, this would fetch fresh data
      console.log('Refreshing deals data...');
      
    } catch (err) {
      setError('Failed to refresh deals. Please try again.');
    } finally {
      setRefreshing(false);
    }
  }, []);

  const handleAddToList = useCallback((deal: ExtendedDeal) => {
    // Simulate adding to shopping list
    console.log('Adding deal to shopping list:', deal);
    // Show success feedback
    alert(`Added "${deal.product?.name || deal.description}" to your shopping list!`);
  }, []);

  const handleShareDeal = useCallback((deal: ExtendedDeal) => {
    if (navigator.share) {
      navigator.share({
        title: `Great Deal: ${deal.product?.name || deal.description}`,
        text: `Check out this deal: ${deal.description}`,
        url: window.location.href
      });
    } else {
      // Fallback for browsers without Web Share API
      navigator.clipboard.writeText(window.location.href);
      alert('Deal link copied to clipboard!');
    }
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      category: 'all',
      retailer: 'all',
      discountType: 'all',
      minDiscount: 0,
      maxDiscount: 100,
      expiryFilter: 'all',
      sortBy: 'savings',
      sortOrder: 'desc'
    });
    setSearchQuery('');
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          <span className="ml-3 text-lg text-gray-600">Loading amazing deals...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header Section */}
      <header className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('deals.hot_deals')}</h1>
            <p className="text-gray-600">Discover the best savings across South African retailers</p>
          </div>
          
          <div className="flex items-center space-x-3 mt-4 sm:mt-0">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium rounded-lg transition-colors disabled:opacity-50"
              aria-label="Refresh deals"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium rounded-lg transition-colors"
              aria-label="Toggle filters"
              aria-expanded={showFilters}
            >
              <Filter className="h-4 w-4" />
              <span>Filters</span>
              {Object.values(filters).some(v => v !== 'all' && v !== 0 && v !== 100 && v !== 'desc') && (
                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
              )}
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search deals, products, or retailers..."
            className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl bg-white shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 placeholder-gray-500"
            aria-label="Search deals"
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-3" role="alert">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
            <div>
              <p className="text-red-800 font-medium">Error</p>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </div>
        )}
      </header>

      {/* Filters Panel */}
      {showFilters && (
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8" aria-label="Deal filters">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Filter Deals</h3>
            <button
              onClick={clearFilters}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Clear All
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Category Filter */}
            <div>
              <label htmlFor="category-filter" className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                id="category-filter"
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                {filterOptions.categories.map(option => (
                  <option key={option.id} value={option.id}>{option.label}</option>
                ))}
              </select>
            </div>

            {/* Retailer Filter */}
            <div>
              <label htmlFor="retailer-filter" className="block text-sm font-medium text-gray-700 mb-2">
                Retailer
              </label>
              <select
                id="retailer-filter"
                value={filters.retailer}
                onChange={(e) => handleFilterChange('retailer', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                {filterOptions.retailers.map(option => (
                  <option key={option.id} value={option.id}>{option.label}</option>
                ))}
              </select>
            </div>

            {/* Discount Type Filter */}
            <div>
              <label htmlFor="discount-type-filter" className="block text-sm font-medium text-gray-700 mb-2">
                Discount Type
              </label>
              <select
                id="discount-type-filter"
                value={filters.discountType}
                onChange={(e) => handleFilterChange('discountType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                {filterOptions.discountTypes.map(option => (
                  <option key={option.id} value={option.id}>{option.label}</option>
                ))}
              </select>
            </div>

            {/* Sort Options */}
            <div>
              <label htmlFor="sort-filter" className="block text-sm font-medium text-gray-700 mb-2">
                Sort By
              </label>
              <div className="flex space-x-2">
                <select
                  id="sort-filter"
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  {filterOptions.sortOptions.map(option => (
                    <option key={option.id} value={option.id}>{option.label}</option>
                  ))}
                </select>
                <button
                  onClick={() => handleFilterChange('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  aria-label={`Sort ${filters.sortOrder === 'asc' ? 'descending' : 'ascending'}`}
                >
                  {filters.sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Discount Range Filter */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Discount Range: {filters.minDiscount}% - {filters.maxDiscount}%
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="range"
                min="0"
                max="100"
                value={filters.minDiscount}
                onChange={(e) => handleFilterChange('minDiscount', parseInt(e.target.value))}
                className="flex-1"
                aria-label="Minimum discount percentage"
              />
              <input
                type="range"
                min="0"
                max="100"
                value={filters.maxDiscount}
                onChange={(e) => handleFilterChange('maxDiscount', parseInt(e.target.value))}
                className="flex-1"
                aria-label="Maximum discount percentage"
              />
            </div>
          </div>
        </section>
      )}

      {/* Featured Deals Section */}
      <section className="mb-8" aria-label="Featured deals">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Featured Deals</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredDeals.map((deal) => {
            const timeRemaining = getTimeRemaining(deal.validUntil);
            const isExpiring = isExpiringSoon(deal.validUntil);
            const expired = isExpired(deal.validUntil);
            
            return (
              <article
                key={deal.id}
                className={`relative overflow-hidden rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl ${
                  expired ? 'opacity-60 grayscale' : ''
                }`}
                onClick={() => handleDealView(deal.id)}
              >
                <div className="relative h-48 bg-gradient-to-br from-orange-500 to-red-600">
                  <img 
                    src={deal.image}
                    alt={deal.title}
                    className="absolute inset-0 w-full h-full object-cover mix-blend-overlay"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-30" />
                  
                  {/* Deal badges */}
                  <div className="absolute top-4 left-4 flex flex-col space-y-2">
                    <span className="bg-white bg-opacity-90 backdrop-blur-sm text-gray-900 px-3 py-1 rounded-full text-sm font-bold">
                      {deal.discount} OFF
                    </span>
                    {deal.isLimited && (
                      <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                        LIMITED TIME
                      </span>
                    )}
                    {isExpiring && !expired && (
                      <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold animate-pulse">
                        EXPIRING SOON
                      </span>
                    )}
                    {expired && (
                      <span className="bg-gray-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                        EXPIRED
                      </span>
                    )}
                  </div>

                  {/* Retailer logo */}
                  <div className="absolute top-4 right-4">
                    <img 
                      src={deal.retailer.logo}
                      alt={deal.retailer.name}
                      className="w-12 h-12 rounded-full border-2 border-white shadow-lg"
                      loading="lazy"
                    />
                  </div>
                </div>
                
                <div className="p-6 bg-white">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-1">{deal.title}</h3>
                      <p className="text-gray-600 text-sm mb-2">{deal.description}</p>
                      <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                        {deal.category}
                      </span>
                    </div>
                  </div>
                  
                  {/* Price information */}
                  {deal.originalPrice && deal.salePrice && (
                    <div className="flex items-center space-x-2 mb-4">
                      <span className="text-lg font-bold text-green-600">
                        {formatCurrency(deal.salePrice)}
                      </span>
                      <span className="text-sm text-gray-500 line-through">
                        {formatCurrency(deal.originalPrice)}
                      </span>
                      <span className="text-sm font-medium text-green-600">
                        Save {formatCurrency(deal.originalPrice - deal.salePrice)}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1 text-sm">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span className={`${isExpiring ? 'text-orange-600 font-medium' : 'text-gray-600'}`}>
                        {expired ? 'Expired' : `${timeRemaining} left`}
                      </span>
                    </div>
                    
                    {!expired && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          console.log('View deal:', deal.id);
                        }}
                        className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-semibold px-4 py-2 rounded-lg transition-all duration-200 transform hover:scale-105"
                      >
                        View Deal
                      </button>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Product Deals Section */}
      <section aria-label="Product deals">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">Product Deals</h2>
          <div className="text-sm text-gray-600">
            {filteredDeals.length} deal{filteredDeals.length !== 1 ? 's' : ''} found
          </div>
        </div>
        
        {filteredDeals.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm">
            <Tag className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchQuery || Object.values(filters).some(v => v !== 'all' && v !== 0 && v !== 100 && v !== 'desc')
                ? 'No deals match your criteria'
                : 'No deals available'
              }
            </h3>
            <p className="text-gray-600 mb-6">
              {searchQuery || Object.values(filters).some(v => v !== 'all' && v !== 0 && v !== 100 && v !== 'desc')
                ? 'Try adjusting your search terms or filters'
                : 'Check back soon for new deals and savings opportunities'
              }
            </p>
            {(searchQuery || Object.values(filters).some(v => v !== 'all' && v !== 0 && v !== 100 && v !== 'desc')) && (
              <button
                onClick={clearFilters}
                className="bg-green-600 hover:bg-green-700 text-white font-medium px-6 py-3 rounded-lg transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredDeals.map((deal) => {
              const product = deal.product;
              if (!product) return null;

              const timeRemaining = getTimeRemaining(deal.validUntil);
              const isExpiring = isExpiringSoon(deal.validUntil);
              const expired = isExpired(deal.validUntil);
              const isBookmarked = bookmarkedDeals.has(deal.id);
              const isViewed = viewedDeals.has(deal.id);

              return (
                <article
                  key={deal.id}
                  className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200 ${
                    expired ? 'opacity-60' : ''
                  } ${isViewed ? 'ring-2 ring-blue-100' : ''}`}
                  onClick={() => handleDealView(deal.id)}
                >
                  <div className="flex items-center p-6">
                    {/* Product Image */}
                    <div className="relative mr-6 flex-shrink-0">
                      <img 
                        src={product.image}
                        alt={product.name}
                        className="w-24 h-24 object-cover rounded-lg shadow-sm"
                        loading="lazy"
                      />
                      <div className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1">
                        <Tag className="h-4 w-4" />
                      </div>
                      {expired && (
                        <div className="absolute inset-0 bg-gray-900 bg-opacity-50 rounded-lg flex items-center justify-center">
                          <span className="text-white text-xs font-bold">EXPIRED</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Deal Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 mr-4">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="font-bold text-gray-900 text-lg truncate">{product.name}</h3>
                            <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                              {product.category}
                            </span>
                            {isExpiring && !expired && (
                              <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs font-bold rounded-full animate-pulse">
                                EXPIRING SOON
                              </span>
                            )}
                          </div>
                          
                          <p className="text-gray-600 mb-1">{product.brand} • {product.unitSize}</p>
                          <p className="text-green-600 font-medium mb-3">{deal.description}</p>
                          
                          {/* Deal Stats */}
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center space-x-1">
                              <Eye className="h-4 w-4" />
                              <span>{deal.viewCount} views</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Share2 className="h-4 w-4" />
                              <span>{deal.shareCount} shares</span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Retailer and Discount Info */}
                        <div className="text-right flex-shrink-0">
                          <div className="flex items-center space-x-3 mb-3">
                            <img 
                              src={deal.retailer.logo}
                              alt={deal.retailer.name}
                              className="w-10 h-10 rounded-full object-cover shadow-sm"
                              loading="lazy"
                            />
                            <div>
                              <p className="font-semibold text-gray-900">{deal.retailer.name}</p>
                              <div className="flex items-center space-x-1">
                                <MapPin className="h-3 w-3 text-gray-500" />
                                <span className="text-xs text-gray-500">2.3km away</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-end space-x-2 mb-3">
                            {deal.type === 'percentage' ? (
                              <div className="flex items-center space-x-1 bg-red-100 text-red-800 px-3 py-1 rounded-full">
                                <Percent className="h-4 w-4" />
                                <span className="font-bold">{deal.discount}% OFF</span>
                              </div>
                            ) : (
                              <div className="flex items-center space-x-1 bg-green-100 text-green-800 px-3 py-1 rounded-full">
                                <DollarSign className="h-4 w-4" />
                                <span className="font-bold">{formatCurrency(Number(deal.discount))} OFF</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Action Bar */}
                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                        <div className="flex items-center space-x-4 text-sm">
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4 text-gray-500" />
                            <span className={`${isExpiring ? 'text-orange-600 font-medium' : 'text-gray-600'}`}>
                              {expired ? 'Expired' : `${timeRemaining} left`}
                            </span>
                          </div>
                          {deal.conditions && (
                            <span className="text-gray-500">• {deal.conditions}</span>
                          )}
                        </div>
                        
                        {!expired && (
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleBookmarkToggle(deal.id);
                              }}
                              className={`p-2 rounded-lg transition-colors ${
                                isBookmarked 
                                  ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200' 
                                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                              }`}
                              aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark deal'}
                            >
                              {isBookmarked ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
                            </button>
                            
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleShareDeal(deal);
                              }}
                              className="p-2 bg-blue-100 text-blue-600 hover:bg-blue-200 rounded-lg transition-colors"
                              aria-label="Share deal"
                            >
                              <Share2 className="h-4 w-4" />
                            </button>
                            
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAddToList(deal);
                              }}
                              className="bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
                            >
                              <ShoppingCart className="h-4 w-4" />
                              <span>Add to List</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* Load More / Pagination */}
      {filteredDeals.length > 0 && (
        <div className="mt-8 text-center">
          <button
            onClick={() => console.log('Load more deals')}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-6 py-3 rounded-lg transition-colors"
          >
            Load More Deals
          </button>
        </div>
      )}

      {/* Coming Soon Section */}
      <section className="mt-12 text-center py-12 bg-gradient-to-br from-green-50 to-blue-50 rounded-xl" aria-label="Coming soon">
        <Tag className="h-16 w-16 text-green-600 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-gray-900 mb-2">More Deals Coming Soon!</h3>
        <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
          We're working with more retailers to bring you even better savings. 
          Sign up for notifications to be the first to know about new deals.
        </p>
        <button className="bg-green-600 hover:bg-green-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors">
          Notify Me
        </button>
      </section>
    </div>
  );
};