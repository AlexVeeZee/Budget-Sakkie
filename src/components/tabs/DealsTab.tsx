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
  BookmarkCheck,
  ChevronDown,
  ChevronUp,
  Grid,
  List
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
  const [viewMode, setViewMode] = useState<'grid' | 'compact'>('compact');
  const [expandedFilters, setExpandedFilters] = useState(false);

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

  const handleShareDeal = useCallback(async (deal: ExtendedDeal) => {
    try {
      const shareData = {
        title: `Great Deal: ${deal.product?.name || deal.description}`,
        text: `Check out this deal: ${deal.description}`,
        url: window.location.href
      };

      // Check if the browser supports the Web Share API and can share this data
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
        
        // Update share count on successful share
        setExtendedDeals(prev => prev.map(d => 
          d.id === deal.id 
            ? { ...d, shareCount: (d.shareCount || 0) + 1 }
            : d
        ));
      } else if (navigator.share) {
        // Try sharing with just title and URL if full data isn't supported
        try {
          await navigator.share({
            title: shareData.title,
            url: shareData.url
          });
          
          // Update share count on successful share
          setExtendedDeals(prev => prev.map(d => 
            d.id === deal.id 
              ? { ...d, shareCount: (d.shareCount || 0) + 1 }
              : d
          ));
        } catch (shareError) {
          // Fall back to clipboard if sharing fails
          await navigator.clipboard.writeText(`${shareData.title}\n${shareData.url}`);
          alert('Deal details copied to clipboard!');
          
          // Update share count even for clipboard fallback
          setExtendedDeals(prev => prev.map(d => 
            d.id === deal.id 
              ? { ...d, shareCount: (d.shareCount || 0) + 1 }
              : d
          ));
        }
      } else {
        // Fallback for browsers without Web Share API
        try {
          await navigator.clipboard.writeText(`${shareData.title}\n${shareData.url}`);
          alert('Deal link copied to clipboard!');
          
          // Update share count for clipboard fallback
          setExtendedDeals(prev => prev.map(d => 
            d.id === deal.id 
              ? { ...d, shareCount: (d.shareCount || 0) + 1 }
              : d
          ));
        } catch (clipboardError) {
          console.error('Failed to copy to clipboard:', clipboardError);
          alert('Unable to share deal. Please try again.');
        }
      }
    } catch (error) {
      console.error('Error sharing deal:', error);
      alert('Unable to share deal. Please try again.');
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
      {/* Compact Header Section */}
      <header className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">{t('deals.hot_deals')}</h1>
            <p className="text-sm text-gray-600">Discover the best savings across South African retailers</p>
          </div>
          
          <div className="flex items-center space-x-2 mt-3 sm:mt-0">
            {/* View Mode Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('compact')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'compact' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600'
                }`}
                aria-label="Compact view"
              >
                <List className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'grid' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600'
                }`}
                aria-label="Grid view"
              >
                <Grid className="h-4 w-4" />
              </button>
            </div>
            
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center space-x-2 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium rounded-lg transition-colors disabled:opacity-50"
              aria-label="Refresh deals"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline text-sm">Refresh</span>
            </button>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-3 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium rounded-lg transition-colors"
              aria-label="Toggle filters"
              aria-expanded={showFilters}
            >
              <Filter className="h-4 w-4" />
              <span className="text-sm">Filters</span>
              {Object.values(filters).some(v => v !== 'all' && v !== 0 && v !== 100 && v !== 'desc') && (
                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
              )}
            </button>
          </div>
        </div>

        {/* Compact Search Bar */}
        <div className="relative mb-4">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search deals, products, or retailers..."
            className="block w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg bg-white shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 placeholder-gray-500 text-sm"
            aria-label="Search deals"
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2" role="alert">
            <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
            <div>
              <p className="text-red-800 font-medium text-sm">Error</p>
              <p className="text-red-700 text-xs">{error}</p>
            </div>
          </div>
        )}
      </header>

      {/* Collapsible Filters Panel */}
      {showFilters && (
        <section className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6" aria-label="Deal filters">
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-semibold text-gray-900">Filter Deals</h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={clearFilters}
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                >
                  Clear All
                </button>
                <button
                  onClick={() => setExpandedFilters(!expandedFilters)}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  {expandedFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
              </div>
            </div>
            
            {/* Basic Filters - Always Visible */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="px-2 py-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
              >
                {filterOptions.categories.map(option => (
                  <option key={option.id} value={option.id}>{option.label}</option>
                ))}
              </select>

              <select
                value={filters.retailer}
                onChange={(e) => handleFilterChange('retailer', e.target.value)}
                className="px-2 py-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
              >
                {filterOptions.retailers.map(option => (
                  <option key={option.id} value={option.id}>{option.label}</option>
                ))}
              </select>

              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="px-2 py-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
              >
                {filterOptions.sortOptions.map(option => (
                  <option key={option.id} value={option.id}>{option.label}</option>
                ))}
              </select>

              <button
                onClick={() => handleFilterChange('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-2 py-1.5 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors text-sm flex items-center justify-center"
                aria-label={`Sort ${filters.sortOrder === 'asc' ? 'descending' : 'ascending'}`}
              >
                {filters.sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
              </button>
            </div>

            {/* Advanced Filters - Collapsible */}
            {expandedFilters && (
              <div className="space-y-3 pt-3 border-t border-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <select
                    value={filters.discountType}
                    onChange={(e) => handleFilterChange('discountType', e.target.value)}
                    className="px-2 py-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                  >
                    {filterOptions.discountTypes.map(option => (
                      <option key={option.id} value={option.id}>{option.label}</option>
                    ))}
                  </select>

                  <select
                    value={filters.expiryFilter}
                    onChange={(e) => handleFilterChange('expiryFilter', e.target.value)}
                    className="px-2 py-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                  >
                    {filterOptions.expiryFilters.map(option => (
                      <option key={option.id} value={option.id}>{option.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Discount Range: {filters.minDiscount}% - {filters.maxDiscount}%
                  </label>
                  <div className="flex items-center space-x-3">
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
              </div>
            )}
          </div>
        </section>
      )}

      {/* Compact Featured Deals Section */}
      <section className="mb-6" aria-label="Featured deals">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Featured Deals</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {featuredDeals.map((deal) => {
            const timeRemaining = getTimeRemaining(deal.validUntil);
            const isExpiring = isExpiringSoon(deal.validUntil);
            const expired = isExpired(deal.validUntil);
            
            return (
              <article
                key={deal.id}
                className={`relative overflow-hidden rounded-lg shadow-sm transition-all duration-300 hover:shadow-md ${
                  expired ? 'opacity-60 grayscale' : ''
                }`}
                onClick={() => handleDealView(deal.id)}
              >
                <div className="relative h-32 bg-gradient-to-br from-orange-500 to-red-600">
                  <img 
                    src={deal.image}
                    alt={deal.title}
                    className="absolute inset-0 w-full h-full object-cover mix-blend-overlay"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-30" />
                  
                  {/* Compact badges */}
                  <div className="absolute top-2 left-2 flex flex-col space-y-1">
                    <span className="bg-white bg-opacity-90 backdrop-blur-sm text-gray-900 px-2 py-0.5 rounded-full text-xs font-bold">
                      {deal.discount} OFF
                    </span>
                    {deal.isLimited && (
                      <span className="bg-red-500 text-white px-2 py-0.5 rounded-full text-xs font-bold">
                        LIMITED
                      </span>
                    )}
                  </div>

                  {/* Retailer logo */}
                  <div className="absolute top-2 right-2">
                    <img 
                      src={deal.retailer.logo}
                      alt={deal.retailer.name}
                      className="w-8 h-8 rounded-full border border-white shadow-sm"
                      loading="lazy"
                    />
                  </div>
                </div>
                
                <div className="p-3 bg-white">
                  <h3 className="text-sm font-bold text-gray-900 mb-1 line-clamp-1">{deal.title}</h3>
                  <p className="text-xs text-gray-600 mb-2 line-clamp-2">{deal.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1 text-xs">
                      <Clock className="h-3 w-3 text-gray-500" />
                      <span className={`${isExpiring ? 'text-orange-600 font-medium' : 'text-gray-600'}`}>
                        {expired ? 'Expired' : `${timeRemaining} left`}
                      </span>
                    </div>
                    
                    {!expired && deal.originalPrice && deal.salePrice && (
                      <div className="text-right">
                        <span className="text-sm font-bold text-green-600">
                          {formatCurrency(deal.salePrice)}
                        </span>
                        <span className="text-xs text-gray-500 line-through ml-1">
                          {formatCurrency(deal.originalPrice)}
                        </span>
                      </div>
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
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Product Deals</h2>
          <div className="text-sm text-gray-600">
            {filteredDeals.length} deal{filteredDeals.length !== 1 ? 's' : ''} found
          </div>
        </div>
        
        {filteredDeals.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <Tag className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchQuery || Object.values(filters).some(v => v !== 'all' && v !== 0 && v !== 100 && v !== 'desc')
                ? 'No deals match your criteria'
                : 'No deals available'
              }
            </h3>
            <p className="text-gray-600 mb-4 text-sm">
              {searchQuery || Object.values(filters).some(v => v !== 'all' && v !== 0 && v !== 100 && v !== 'desc')
                ? 'Try adjusting your search terms or filters'
                : 'Check back soon for new deals and savings opportunities'
              }
            </p>
            {(searchQuery || Object.values(filters).some(v => v !== 'all' && v !== 0 && v !== 100 && v !== 'desc')) && (
              <button
                onClick={clearFilters}
                className="bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-2 rounded-lg transition-colors text-sm"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className={viewMode === 'compact' ? 'space-y-2' : 'grid grid-cols-1 md:grid-cols-2 gap-4'}>
            {filteredDeals.map((deal) => {
              const product = deal.product;
              if (!product) return null;

              const timeRemaining = getTimeRemaining(deal.validUntil);
              const isExpiring = isExpiringSoon(deal.validUntil);
              const expired = isExpired(deal.validUntil);
              const isBookmarked = bookmarkedDeals.has(deal.id);
              const isViewed = viewedDeals.has(deal.id);

              if (viewMode === 'compact') {
                return (
                  <article
                    key={deal.id}
                    className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200 ${
                      expired ? 'opacity-60' : ''
                    } ${isViewed ? 'ring-1 ring-blue-100' : ''}`}
                    onClick={() => handleDealView(deal.id)}
                  >
                    <div className="flex items-center p-3">
                      {/* Compact Product Image */}
                      <div className="relative mr-3 flex-shrink-0">
                        <img 
                          src={product.image}
                          alt={product.name}
                          className="w-16 h-16 object-cover rounded-lg shadow-sm"
                          loading="lazy"
                        />
                        <div className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5">
                          <Tag className="h-2.5 w-2.5" />
                        </div>
                        {expired && (
                          <div className="absolute inset-0 bg-gray-900 bg-opacity-50 rounded-lg flex items-center justify-center">
                            <span className="text-white text-xs font-bold">EXPIRED</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Compact Deal Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 mr-3">
                            <div className="flex items-center space-x-2 mb-1">
                              <h3 className="font-bold text-gray-900 text-sm truncate">{product.name}</h3>
                              <span className="px-1.5 py-0.5 bg-gray-100 text-gray-700 text-xs font-medium rounded">
                                {product.category}
                              </span>
                              {isExpiring && !expired && (
                                <span className="px-1.5 py-0.5 bg-orange-100 text-orange-800 text-xs font-bold rounded animate-pulse">
                                  EXPIRING
                                </span>
                              )}
                            </div>
                            
                            <p className="text-gray-600 text-xs mb-1">{product.brand} • {product.unitSize}</p>
                            <p className="text-green-600 font-medium text-xs mb-2 line-clamp-1">{deal.description}</p>
                            
                            {/* Compact Stats */}
                            <div className="flex items-center space-x-3 text-xs text-gray-500">
                              <div className="flex items-center space-x-1">
                                <Eye className="h-3 w-3" />
                                <span>{deal.viewCount}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Clock className="h-3 w-3" />
                                <span className={`${isExpiring ? 'text-orange-600 font-medium' : 'text-gray-600'}`}>
                                  {expired ? 'Expired' : `${timeRemaining}`}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          {/* Compact Retailer and Actions */}
                          <div className="text-right flex-shrink-0">
                            <div className="flex items-center space-x-2 mb-2">
                              <img 
                                src={deal.retailer.logo}
                                alt={deal.retailer.name}
                                className="w-6 h-6 rounded-full object-cover shadow-sm"
                                loading="lazy"
                              />
                              <div className="text-right">
                                <p className="font-semibold text-gray-900 text-xs">{deal.retailer.name}</p>
                                <div className="flex items-center space-x-1 text-xs">
                                  <MapPin className="h-2.5 w-2.5 text-gray-500" />
                                  <span className="text-gray-500">2.3km</span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-end space-x-1 mb-2">
                              {deal.type === 'percentage' ? (
                                <div className="flex items-center space-x-1 bg-red-100 text-red-800 px-2 py-0.5 rounded-full">
                                  <Percent className="h-3 w-3" />
                                  <span className="font-bold text-xs">{deal.discount}%</span>
                                </div>
                              ) : (
                                <div className="flex items-center space-x-1 bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                                  <DollarSign className="h-3 w-3" />
                                  <span className="font-bold text-xs">{formatCurrency(Number(deal.discount))}</span>
                                </div>
                              )}
                            </div>
                            
                            {!expired && (
                              <div className="flex items-center space-x-1">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleBookmarkToggle(deal.id);
                                  }}
                                  className={`p-1 rounded transition-colors ${
                                    isBookmarked 
                                      ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200' 
                                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                  }`}
                                  aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark deal'}
                                >
                                  {isBookmarked ? <BookmarkCheck className="h-3 w-3" /> : <Bookmark className="h-3 w-3" />}
                                </button>
                                
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleShareDeal(deal);
                                  }}
                                  className="p-1 bg-blue-100 text-blue-600 hover:bg-blue-200 rounded transition-colors"
                                  aria-label="Share deal"
                                >
                                  <Share2 className="h-3 w-3" />
                                </button>
                                
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleAddToList(deal);
                                  }}
                                  className="bg-green-600 hover:bg-green-700 text-white font-medium px-2 py-1 rounded transition-colors flex items-center space-x-1"
                                >
                                  <ShoppingCart className="h-3 w-3" />
                                  <span className="text-xs">Add</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              } else {
                // Grid view (original card design but more compact)
                return (
                  <article
                    key={deal.id}
                    className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200 ${
                      expired ? 'opacity-60' : ''
                    } ${isViewed ? 'ring-1 ring-blue-100' : ''}`}
                    onClick={() => handleDealView(deal.id)}
                  >
                    <div className="flex items-center p-4">
                      {/* Product Image */}
                      <div className="relative mr-4 flex-shrink-0">
                        <img 
                          src={product.image}
                          alt={product.name}
                          className="w-20 h-20 object-cover rounded-lg shadow-sm"
                          loading="lazy"
                        />
                        <div className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1">
                          <Tag className="h-3 w-3" />
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
                            <div className="flex items-center space-x-2 mb-2">
                              <h3 className="font-bold text-gray-900 text-base truncate">{product.name}</h3>
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
              }
            })}
          </div>
        )}
      </section>

      {/* Load More / Pagination */}
      {filteredDeals.length > 0 && (
        <div className="mt-6 text-center">
          <button
            onClick={() => {
              // Simulate loading more deals
              console.log('Loading more deals...');
              alert('Loading more deals... (This would fetch additional deals in a real app)');
            }}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-6 py-3 rounded-lg transition-colors"
          >
            Load More Deals
          </button>
        </div>
      )}

      {/* Coming Soon Section */}
      <section className="mt-8 text-center py-8 bg-gradient-to-br from-green-50 to-blue-50 rounded-lg" aria-label="Coming soon">
        <Tag className="h-12 w-12 text-green-600 mx-auto mb-3" />
        <h3 className="text-xl font-bold text-gray-900 mb-2">More Deals Coming Soon!</h3>
        <p className="text-gray-600 mb-4 max-w-2xl mx-auto text-sm">
          We're working with more retailers to bring you even better savings. 
          Sign up for notifications to be the first to know about new deals.
        </p>
        <button 
          onClick={() => {
            // Simulate notification signup
            console.log('Signing up for notifications...');
            alert('Thank you! You\'ll be notified when new deals are available.');
          }}
          className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
        >
          Notify Me
        </button>
      </section>
    </div>
  );
};