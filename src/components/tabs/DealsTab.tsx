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
  ExternalLink,
  ChevronRight,
  Heart,
  HeartOff,
  Bell,
  BellOff,
  X,
  Check,
  Info,
  Zap,
  Flame,
  Gift
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
  isLiked?: boolean;
  likeCount?: number;
  originalPrice?: number;
  salePrice?: number;
  savingsAmount?: number;
  isLimitedTime?: boolean;
  stockLevel?: 'high' | 'medium' | 'low' | 'out';
  dealScore?: number; // 1-10 rating
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
  dealUrl?: string;
  termsAndConditions?: string;
  minimumSpend?: number;
}

interface DealDetailModalProps {
  deal: ExtendedDeal | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToList: (deal: ExtendedDeal) => void;
  onBookmark: (dealId: string) => void;
  onShare: (deal: ExtendedDeal) => void;
  onLike: (dealId: string) => void;
}

const DealDetailModal: React.FC<DealDetailModalProps> = ({
  deal,
  isOpen,
  onClose,
  onAddToList,
  onBookmark,
  onShare,
  onLike
}) => {
  const { formatCurrency } = useCurrency();
  const [showTerms, setShowTerms] = useState(false);

  if (!isOpen || !deal) return null;

  const timeRemaining = getTimeRemaining(deal.validUntil);
  const isExpiring = isExpiringSoon(deal.validUntil);
  const expired = isExpired(deal.validUntil);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="relative">
          <img 
            src={deal.product?.image || 'https://images.pexels.com/photos/264547/pexels-photo-264547.jpeg?auto=compress&cs=tinysrgb&w=600&h=300&fit=crop'}
            alt={deal.product?.name}
            className="w-full h-48 object-cover rounded-t-xl"
          />
          <div className="absolute top-4 right-4">
            <button
              onClick={onClose}
              className="p-2 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100 transition-all"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          {/* Deal badges */}
          <div className="absolute top-4 left-4 flex flex-col space-y-2">
            <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
              {deal.type === 'percentage' ? `${deal.discount}% OFF` : `${formatCurrency(Number(deal.discount))} OFF`}
            </span>
            {deal.isLimitedTime && (
              <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold animate-pulse">
                LIMITED TIME
              </span>
            )}
            {isExpiring && !expired && (
              <span className="bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                EXPIRING SOON
              </span>
            )}
          </div>

          {/* Deal score */}
          {deal.dealScore && (
            <div className="absolute bottom-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center space-x-1">
              <Star className="h-4 w-4 fill-current" />
              <span>{deal.dealScore}/10</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Product Info */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{deal.product?.name}</h2>
              <p className="text-gray-600 mb-2">{deal.product?.brand} • {deal.product?.unitSize}</p>
              <p className="text-green-600 font-medium">{deal.description}</p>
            </div>
            
            <div className="flex items-center space-x-2 ml-4">
              <img 
                src={deal.retailer.logo}
                alt={deal.retailer.name}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <p className="font-semibold text-gray-900">{deal.retailer.name}</p>
                <div className="flex items-center space-x-1 text-sm text-gray-600">
                  <MapPin className="h-3 w-3" />
                  <span>2.3km away</span>
                </div>
              </div>
            </div>
          </div>

          {/* Price Information */}
          {deal.originalPrice && deal.salePrice && (
            <div className="bg-green-50 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Sale Price</p>
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(deal.salePrice)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Regular Price</p>
                  <p className="text-lg text-gray-500 line-through">{formatCurrency(deal.originalPrice)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">You Save</p>
                  <p className="text-xl font-bold text-red-600">{formatCurrency(deal.originalPrice - deal.salePrice)}</p>
                </div>
              </div>
            </div>
          )}

          {/* Deal Stats */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <Eye className="h-5 w-5 mx-auto mb-1 text-blue-600" />
              <p className="text-sm font-semibold">{deal.viewCount}</p>
              <p className="text-xs text-gray-600">Views</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <Heart className="h-5 w-5 mx-auto mb-1 text-red-600" />
              <p className="text-sm font-semibold">{deal.likeCount}</p>
              <p className="text-xs text-gray-600">Likes</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <Share2 className="h-5 w-5 mx-auto mb-1 text-green-600" />
              <p className="text-sm font-semibold">{deal.shareCount}</p>
              <p className="text-xs text-gray-600">Shares</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <Clock className="h-5 w-5 mx-auto mb-1 text-orange-600" />
              <p className="text-sm font-semibold">{timeRemaining}</p>
              <p className="text-xs text-gray-600">Left</p>
            </div>
          </div>

          {/* Stock Level */}
          {deal.stockLevel && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Stock Level</span>
                <span className={`text-sm font-semibold ${
                  deal.stockLevel === 'high' ? 'text-green-600' :
                  deal.stockLevel === 'medium' ? 'text-yellow-600' :
                  deal.stockLevel === 'low' ? 'text-orange-600' : 'text-red-600'
                }`}>
                  {deal.stockLevel === 'high' ? 'In Stock' :
                   deal.stockLevel === 'medium' ? 'Medium Stock' :
                   deal.stockLevel === 'low' ? 'Low Stock' : 'Out of Stock'}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${
                    deal.stockLevel === 'high' ? 'bg-green-500' :
                    deal.stockLevel === 'medium' ? 'bg-yellow-500' :
                    deal.stockLevel === 'low' ? 'bg-orange-500' : 'bg-red-500'
                  }`}
                  style={{ 
                    width: deal.stockLevel === 'high' ? '80%' :
                           deal.stockLevel === 'medium' ? '50%' :
                           deal.stockLevel === 'low' ? '20%' : '0%'
                  }}
                />
              </div>
            </div>
          )}

          {/* Terms and Conditions */}
          <div className="mb-6">
            <button
              onClick={() => setShowTerms(!showTerms)}
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium"
            >
              <Info className="h-4 w-4" />
              <span>Terms & Conditions</span>
              <ChevronRight className={`h-4 w-4 transition-transform ${showTerms ? 'rotate-90' : ''}`} />
            </button>
            
            {showTerms && (
              <div className="mt-3 p-4 bg-blue-50 rounded-lg text-sm text-blue-800">
                <ul className="space-y-1">
                  <li>• Valid until {new Date(deal.validUntil).toLocaleDateString()}</li>
                  <li>• Available at participating stores only</li>
                  <li>• Cannot be combined with other offers</li>
                  <li>• While stocks last</li>
                  {deal.conditions && <li>• {deal.conditions}</li>}
                </ul>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={() => onAddToList(deal)}
              disabled={expired || deal.stockLevel === 'out'}
              className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              <ShoppingCart className="h-5 w-5" />
              <span>Add to Shopping List</span>
            </button>
            
            <button
              onClick={() => onBookmark(deal.id)}
              className={`p-3 rounded-lg transition-colors ${
                deal.isBookmarked 
                  ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {deal.isBookmarked ? <BookmarkCheck className="h-5 w-5" /> : <Bookmark className="h-5 w-5" />}
            </button>
            
            <button
              onClick={() => onLike(deal.id)}
              className={`p-3 rounded-lg transition-colors ${
                deal.isLiked 
                  ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {deal.isLiked ? <Heart className="h-5 w-5 fill-current" /> : <HeartOff className="h-5 w-5" />}
            </button>
            
            <button
              onClick={() => onShare(deal)}
              className="p-3 bg-blue-100 text-blue-600 hover:bg-blue-200 rounded-lg transition-colors"
            >
              <Share2 className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper functions
const getTimeRemaining = (validUntil: string) => {
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
};

const isExpiringSoon = (validUntil: string) => {
  const now = new Date();
  const end = new Date(validUntil);
  const diff = end.getTime() - now.getTime();
  const hoursRemaining = diff / (1000 * 60 * 60);
  return hoursRemaining <= 24 && hoursRemaining > 0;
};

const isExpired = (validUntil: string) => {
  const now = new Date();
  const end = new Date(validUntil);
  return end.getTime() <= now.getTime();
};

export const DealsTab: React.FC = () => {
  const { t } = useLanguage();
  const { formatCurrency } = useCurrency();
  
  // State management
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [bookmarkedDeals, setBookmarkedDeals] = useState<Set<string>>(new Set());
  const [likedDeals, setLikedDeals] = useState<Set<string>>(new Set());
  const [viewedDeals, setViewedDeals] = useState<Set<string>>(new Set());
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<ExtendedDeal | null>(null);
  const [showDealModal, setShowDealModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [notificationEmail, setNotificationEmail] = useState('');
  const [showNotificationForm, setShowNotificationForm] = useState(false);
  const [notificationSuccess, setNotificationSuccess] = useState(false);

  const ITEMS_PER_PAGE = 6;

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

  // Real deals data with actual South African retailers and products
  const realDeals: ExtendedDeal[] = [
    {
      id: 'pnp-bread-special',
      productId: '1',
      retailer: retailers[0], // Pick n Pay
      discount: 25,
      type: 'percentage',
      description: 'Weekend Special: 25% off Albany Superior White Bread',
      validUntil: '2024-01-21T23:59:59Z',
      conditions: 'Valid at participating Pick n Pay stores. Limit 4 per customer.',
      product: products[0], // White Bread
      isBookmarked: false,
      viewCount: 1247,
      shareCount: 89,
      isLiked: false,
      likeCount: 156,
      originalPrice: 15.99,
      salePrice: 11.99,
      savingsAmount: 4.00,
      isLimitedTime: true,
      stockLevel: 'high',
      dealScore: 8.5
    },
    {
      id: 'shoprite-milk-deal',
      productId: '2',
      retailer: retailers[1], // Shoprite
      discount: 3.00,
      type: 'fixed',
      description: 'Save R3 on Clover Full Cream Milk 1L',
      validUntil: '2024-01-25T23:59:59Z',
      conditions: 'Available while stocks last. Valid nationwide.',
      product: products[1], // Milk
      isBookmarked: true,
      viewCount: 892,
      shareCount: 67,
      isLiked: true,
      likeCount: 203,
      originalPrice: 22.99,
      salePrice: 19.99,
      savingsAmount: 3.00,
      isLimitedTime: false,
      stockLevel: 'medium',
      dealScore: 7.2
    },
    {
      id: 'checkers-eggs-promo',
      productId: '3',
      retailer: retailers[2], // Checkers
      discount: 30,
      type: 'percentage',
      description: 'Fresh Eggs Special: 30% off Nulaid Large Eggs',
      validUntil: '2024-01-19T18:00:00Z',
      conditions: 'Fresh produce special. Subject to availability.',
      product: products[2], // Eggs
      isBookmarked: false,
      viewCount: 1456,
      shareCount: 124,
      isLiked: false,
      likeCount: 287,
      originalPrice: 34.99,
      salePrice: 24.49,
      savingsAmount: 10.50,
      isLimitedTime: true,
      stockLevel: 'low',
      dealScore: 9.1
    },
    {
      id: 'woolworths-rice-offer',
      productId: '4',
      retailer: retailers[3], // Woolworths
      discount: 15,
      type: 'percentage',
      description: 'Premium Basmati Rice - 15% off Tastic 2kg',
      validUntil: '2024-01-28T23:59:59Z',
      conditions: 'Premium quality guarantee. Woolworths members get extra 5% off.',
      product: products[3], // Rice
      isBookmarked: true,
      viewCount: 634,
      shareCount: 45,
      isLiked: false,
      likeCount: 98,
      originalPrice: 45.99,
      salePrice: 39.09,
      savingsAmount: 6.90,
      isLimitedTime: false,
      stockLevel: 'high',
      dealScore: 6.8
    },
    {
      id: 'spar-chicken-special',
      productId: '5',
      retailer: retailers[4], // SPAR
      discount: 20,
      type: 'percentage',
      description: 'Fresh Chicken Breasts - 20% off per kg',
      validUntil: '2024-01-22T20:00:00Z',
      conditions: 'Fresh meat special. Available at SPAR butchery counters.',
      product: products[4], // Chicken
      isBookmarked: false,
      viewCount: 2103,
      shareCount: 178,
      isLiked: true,
      likeCount: 445,
      originalPrice: 89.99,
      salePrice: 71.99,
      savingsAmount: 18.00,
      isLimitedTime: true,
      stockLevel: 'medium',
      dealScore: 8.7
    },
    {
      id: 'pnp-bananas-bulk',
      productId: '6',
      retailer: retailers[0], // Pick n Pay
      discount: 5.00,
      type: 'fixed',
      description: 'Bulk Buy Special: R5 off when you buy 2kg+ bananas',
      validUntil: '2024-01-24T23:59:59Z',
      conditions: 'Minimum 2kg purchase required. Fresh produce section only.',
      product: products[5], // Bananas
      isBookmarked: false,
      viewCount: 567,
      shareCount: 34,
      isLiked: false,
      likeCount: 67,
      originalPrice: 19.99,
      salePrice: 14.99,
      savingsAmount: 5.00,
      isLimitedTime: false,
      stockLevel: 'high',
      dealScore: 7.5
    }
  ];

  // Enhanced deals data with additional properties
  const [extendedDeals, setExtendedDeals] = useState<ExtendedDeal[]>(realDeals);

  // Featured deals with real South African context
  const featuredDeals: FeaturedDeal[] = [
    {
      id: 'weekend-grocery-special',
      title: 'Weekend Grocery Bonanza',
      description: 'Save up to 30% on fresh produce, dairy, and bakery items this weekend only',
      retailer: retailers[0], // Pick n Pay
      discount: '30%',
      validUntil: '2024-01-21T23:59:59Z',
      image: 'https://images.pexels.com/photos/264547/pexels-photo-264547.jpeg?auto=compress&cs=tinysrgb&w=600&h=300&fit=crop',
      category: 'Fresh Produce',
      isLimited: true,
      originalPrice: 200,
      salePrice: 140,
      dealUrl: 'https://www.pnp.co.za/specials',
      termsAndConditions: 'Valid at participating stores. Cannot be combined with other offers.',
      minimumSpend: 100
    },
    {
      id: 'family-essentials-deal',
      title: 'Family Essentials Bundle',
      description: 'Buy any 3 household essentials and get the 4th item free',
      retailer: retailers[1], // Shoprite
      discount: '25%',
      validUntil: '2024-01-26T23:59:59Z',
      image: 'https://images.pexels.com/photos/3985062/pexels-photo-3985062.jpeg?auto=compress&cs=tinysrgb&w=600&h=300&fit=crop',
      category: 'Household',
      isLimited: false,
      originalPrice: 150,
      salePrice: 112.50,
      dealUrl: 'https://www.shoprite.co.za/specials',
      termsAndConditions: 'Mix and match from selected household items.',
      minimumSpend: 0
    },
    {
      id: 'premium-meat-special',
      title: 'Premium Meat Selection',
      description: 'Premium cuts at everyday prices - save on quality beef, lamb, and chicken',
      retailer: retailers[3], // Woolworths
      discount: '20%',
      validUntil: '2024-01-23T20:00:00Z',
      image: 'https://images.pexels.com/photos/616354/pexels-photo-616354.jpeg?auto=compress&cs=tinysrgb&w=600&h=300&fit=crop',
      category: 'Meat',
      isLimited: true,
      originalPrice: 300,
      salePrice: 240,
      dealUrl: 'https://www.woolworths.co.za/specials',
      termsAndConditions: 'Available at Woolworths Food stores with butchery.',
      minimumSpend: 150
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
    const enhanced = realDeals.map(deal => ({
      ...deal,
      isBookmarked: bookmarkedDeals.has(deal.id),
      isLiked: likedDeals.has(deal.id)
    }));
    setExtendedDeals(enhanced);
  }, [bookmarkedDeals, likedDeals]);

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
          const aSavings = a.savingsAmount || 0;
          const bSavings = b.savingsAmount || 0;
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

  // Pagination
  const paginatedDeals = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredDeals.slice(0, startIndex + ITEMS_PER_PAGE);
  }, [filteredDeals, currentPage]);

  const hasMoreDeals = filteredDeals.length > paginatedDeals.length;

  // Event handlers
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
    setError(null);
  }, []);

  const handleFilterChange = useCallback((key: keyof FilterState, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
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

  const handleLikeToggle = useCallback((dealId: string) => {
    setLikedDeals(prev => {
      const newSet = new Set(prev);
      if (newSet.has(dealId)) {
        newSet.delete(dealId);
      } else {
        newSet.add(dealId);
      }
      return newSet;
    });

    // Update like count in deals
    setExtendedDeals(prev => prev.map(deal => {
      if (deal.id === dealId) {
        const isLiked = !likedDeals.has(dealId);
        return {
          ...deal,
          isLiked,
          likeCount: (deal.likeCount || 0) + (isLiked ? 1 : -1)
        };
      }
      return deal;
    }));
  }, [likedDeals]);

  const handleDealView = useCallback((deal: ExtendedDeal) => {
    setViewedDeals(prev => new Set([...prev, deal.id]));
    setSelectedDeal(deal);
    setShowDealModal(true);

    // Update view count
    setExtendedDeals(prev => prev.map(d => 
      d.id === deal.id 
        ? { ...d, viewCount: (d.viewCount || 0) + 1 }
        : d
    ));
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
    console.log('Adding deal to shopping list:', deal);
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
      navigator.clipboard.writeText(window.location.href);
      alert('Deal link copied to clipboard!');
    }

    // Update share count
    setExtendedDeals(prev => prev.map(d => 
      d.id === deal.id 
        ? { ...d, shareCount: (d.shareCount || 0) + 1 }
        : d
    ));
  }, []);

  const handleLoadMore = useCallback(() => {
    setCurrentPage(prev => prev + 1);
  }, []);

  const handleNotifyMe = useCallback(async () => {
    if (!notificationEmail.trim()) {
      alert('Please enter your email address.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(notificationEmail)) {
      alert('Please enter a valid email address.');
      return;
    }

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setNotificationSuccess(true);
      setNotificationEmail('');
      setShowNotificationForm(false);
      
      setTimeout(() => setNotificationSuccess(false), 3000);
      
    } catch (error) {
      alert('Failed to sign up for notifications. Please try again.');
    }
  }, [notificationEmail]);

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
    setCurrentPage(1);
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center space-x-2">
              <Flame className="h-8 w-8 text-orange-500" />
              <span>{t('deals.hot_deals')}</span>
            </h1>
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

        {/* Success notification */}
        {notificationSuccess && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-3">
            <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
            <div>
              <p className="text-green-800 font-medium">Success!</p>
              <p className="text-green-700 text-sm">You'll be notified when new deals are available.</p>
            </div>
          </div>
        )}

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
        <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center space-x-2">
          <Zap className="h-6 w-6 text-yellow-500" />
          <span>Featured Deals</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredDeals.map((deal) => {
            const timeRemaining = getTimeRemaining(deal.validUntil);
            const isExpiring = isExpiringSoon(deal.validUntil);
            const expired = isExpired(deal.validUntil);
            
            return (
              <article
                key={deal.id}
                className={`relative overflow-hidden rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl cursor-pointer ${
                  expired ? 'opacity-60 grayscale' : ''
                }`}
                onClick={() => window.open(deal.dealUrl, '_blank')}
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

                  {/* External link indicator */}
                  <div className="absolute bottom-4 right-4">
                    <ExternalLink className="h-5 w-5 text-white" />
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
                      <span className="bg-gradient-to-r from-green-600 to-blue-600 text-white font-semibold px-4 py-2 rounded-lg text-sm">
                        View Deal
                      </span>
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
          <h2 className="text-2xl font-semibold text-gray-900 flex items-center space-x-2">
            <Gift className="h-6 w-6 text-purple-500" />
            <span>Product Deals</span>
          </h2>
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
            {paginatedDeals.map((deal) => {
              const product = deal.product;
              if (!product) return null;

              const timeRemaining = getTimeRemaining(deal.validUntil);
              const isExpiring = isExpiringSoon(deal.validUntil);
              const expired = isExpired(deal.validUntil);
              const isBookmarked = bookmarkedDeals.has(deal.id);
              const isLiked = likedDeals.has(deal.id);
              const isViewed = viewedDeals.has(deal.id);

              return (
                <article
                  key={deal.id}
                  className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200 cursor-pointer ${
                    expired ? 'opacity-60' : ''
                  } ${isViewed ? 'ring-2 ring-blue-100' : ''}`}
                  onClick={() => handleDealView(deal)}
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
                      {deal.dealScore && deal.dealScore >= 8 && (
                        <div className="absolute -bottom-2 -left-2 bg-yellow-500 text-white rounded-full p-1">
                          <Star className="h-3 w-3 fill-current" />
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
                            {deal.isLimitedTime && (
                              <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-bold rounded-full">
                                LIMITED TIME
                              </span>
                            )}
                          </div>
                          
                          <p className="text-gray-600 mb-1">{product.brand} • {product.unitSize}</p>
                          <p className="text-green-600 font-medium mb-3">{deal.description}</p>
                          
                          {/* Price Display */}
                          {deal.originalPrice && deal.salePrice && (
                            <div className="flex items-center space-x-2 mb-3">
                              <span className="text-xl font-bold text-green-600">
                                {formatCurrency(deal.salePrice)}
                              </span>
                              <span className="text-sm text-gray-500 line-through">
                                {formatCurrency(deal.originalPrice)}
                              </span>
                              <span className="text-sm font-medium text-red-600">
                                Save {formatCurrency(deal.savingsAmount || 0)}
                              </span>
                            </div>
                          )}
                          
                          {/* Deal Stats */}
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center space-x-1">
                              <Eye className="h-4 w-4" />
                              <span>{deal.viewCount} views</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Heart className={`h-4 w-4 ${isLiked ? 'fill-current text-red-500' : ''}`} />
                              <span>{deal.likeCount} likes</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Share2 className="h-4 w-4" />
                              <span>{deal.shareCount} shares</span>
                            </div>
                            {deal.dealScore && (
                              <div className="flex items-center space-x-1">
                                <Star className="h-4 w-4 text-yellow-500" />
                                <span>{deal.dealScore}/10</span>
                              </div>
                            )}
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

                          {/* Stock Level Indicator */}
                          {deal.stockLevel && (
                            <div className="mb-2">
                              <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                                deal.stockLevel === 'high' ? 'bg-green-100 text-green-800' :
                                deal.stockLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                deal.stockLevel === 'low' ? 'bg-orange-100 text-orange-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {deal.stockLevel === 'high' ? 'In Stock' :
                                 deal.stockLevel === 'medium' ? 'Medium Stock' :
                                 deal.stockLevel === 'low' ? 'Low Stock' : 'Out of Stock'}
                              </span>
                            </div>
                          )}
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
                                handleLikeToggle(deal.id);
                              }}
                              className={`p-2 rounded-lg transition-colors ${
                                isLiked 
                                  ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                              }`}
                              aria-label={isLiked ? 'Unlike deal' : 'Like deal'}
                            >
                              {isLiked ? <Heart className="h-4 w-4 fill-current" /> : <HeartOff className="h-4 w-4" />}
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
                              disabled={deal.stockLevel === 'out'}
                              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
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

      {/* Load More Button */}
      {hasMoreDeals && (
        <div className="mt-8 text-center">
          <button
            onClick={handleLoadMore}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-8 py-3 rounded-lg transition-colors flex items-center space-x-2 mx-auto"
          >
            <span>Load More Deals</span>
            <ChevronRight className="h-4 w-4" />
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
        
        {!showNotificationForm ? (
          <button 
            onClick={() => setShowNotificationForm(true)}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors flex items-center space-x-2 mx-auto"
          >
            <Bell className="h-5 w-5" />
            <span>Notify Me</span>
          </button>
        ) : (
          <div className="max-w-md mx-auto">
            <div className="flex space-x-3">
              <input
                type="email"
                value={notificationEmail}
                onChange={(e) => setNotificationEmail(e.target.value)}
                placeholder="Enter your email address"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
              <button
                onClick={handleNotifyMe}
                className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
              >
                Subscribe
              </button>
            </div>
            <button
              onClick={() => setShowNotificationForm(false)}
              className="mt-2 text-sm text-gray-600 hover:text-gray-700"
            >
              Cancel
            </button>
          </div>
        )}
      </section>

      {/* Deal Detail Modal */}
      <DealDetailModal
        deal={selectedDeal}
        isOpen={showDealModal}
        onClose={() => setShowDealModal(false)}
        onAddToList={handleAddToList}
        onBookmark={handleBookmarkToggle}
        onShare={handleShareDeal}
        onLike={handleLikeToggle}
      />
    </div>
  );
};