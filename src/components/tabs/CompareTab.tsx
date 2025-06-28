import React, { useState, useEffect, useMemo } from 'react';
import { BarChart3, TrendingDown, MapPin, Clock, Star, ChevronDown, ChevronUp, Filter, Search, Zap, Award, Eye, Share2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useProducts } from '../../hooks/useProducts';
import { useCurrency } from '../../hooks/useCurrency';
import { useLanguage } from '../../hooks/useLanguage';
import { ProductService, type ProductWithCategory } from '../../services/productService';

interface PriceComparisonData {
  retailer: string;
  price: number;
  color: string;
  onSale: boolean;
  availability: string;
  distance: number;
  openingHours: string;
}

interface PriceHistoryData {
  date: string;
  price: number;
  retailer: string;
}

interface CompareTabProps {
  selectedProductId?: string;
}

export const CompareTab: React.FC<CompareTabProps> = ({ selectedProductId }) => {
  const { t } = useLanguage();
  const { formatCurrency } = useCurrency();
  const { products, categories, loading, error } = useProducts();
  const [selectedProduct, setSelectedProduct] = useState<ProductWithCategory | null>(null);
  const [comparisonData, setComparisonData] = useState<PriceComparisonData[]>([]);
  const [priceHistory, setPriceHistory] = useState<PriceHistoryData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loadingComparison, setLoadingComparison] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    priceHistory: false,
    priceComparison: true,
    storeDetails: false,
    insights: false
  });
  const [viewMode, setViewMode] = useState<'compact' | 'detailed'>('compact');
  const [sortBy, setSortBy] = useState<'price' | 'distance' | 'availability'>('price');

  // Filter products based on search and category
  const filteredProducts = useMemo(() => {
    let filtered = products;

    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category_id === selectedCategory);
    }

    return filtered;
  }, [products, searchQuery, selectedCategory]);

  // Set initial selected product based on selectedProductId prop
  useEffect(() => {
    const findAndSetProduct = async () => {
      if (selectedProductId) {
        // Try to find the product in the current products list
        const foundProduct = products.find(p => p.id === selectedProductId);
        
        if (foundProduct) {
          setSelectedProduct(foundProduct);
        } else {
          // If not found in current list, try to fetch it directly
          try {
            const product = await ProductService.getProductById(selectedProductId);
            if (product) {
              setSelectedProduct(product);
            }
          } catch (error) {
            console.error('Error fetching selected product:', error);
          }
        }
      } else if (filteredProducts.length > 0 && !selectedProduct) {
        // Default behavior - select first product if none selected
        setSelectedProduct(filteredProducts[0]);
      }
    };
    
    findAndSetProduct();
  }, [selectedProductId, filteredProducts, products, selectedProduct]);

  // Generate price comparison data when product changes
  useEffect(() => {
    if (selectedProduct) {
      generateComparisonData(selectedProduct);
      generatePriceHistory(selectedProduct);
    }
  }, [selectedProduct]);

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

  const getStoreColor = (storeId: string) => {
    const storeColors: { [key: string]: string } = {
      'pick-n-pay': '#E31837',
      'shoprite': '#FF6B35',
      'checkers': '#00A651',
      'woolworths': '#00A86B',
      'spar': '#006B3F'
    };
    return storeColors[storeId] || '#6B7280';
  };

  const generateComparisonData = async (product: ProductWithCategory) => {
    setLoadingComparison(true);
    try {
      // Get products with similar names from different stores
      const similarProducts = await ProductService.getProductPriceComparison(product.name);
      
      // Create comparison data
      const comparison: PriceComparisonData[] = similarProducts.map(p => ({
        retailer: getStoreDisplayName(p.store_id),
        price: p.price,
        color: getStoreColor(p.store_id),
        onSale: Math.random() > 0.7, // Simulate sale status
        availability: (p.stock_quantity || 0) > 0 ? 'in-stock' : 'out-of-stock',
        distance: Math.round((Math.random() * 5 + 1) * 10) / 10, // Random distance 1-5km
        openingHours: 'Mon-Sun: 8:00-21:00'
      }));

      // If we don't have enough stores, generate some mock data for demonstration
      const allStores = ['pick-n-pay', 'shoprite', 'checkers', 'woolworths', 'spar'];
      const existingStores = new Set(similarProducts.map(p => p.store_id));
      
      allStores.forEach(storeId => {
        if (!existingStores.has(storeId)) {
          // Generate a price variation (±20% of original price)
          const priceVariation = 1 + (Math.random() - 0.5) * 0.4;
          const estimatedPrice = product.price * priceVariation;
          
          comparison.push({
            retailer: getStoreDisplayName(storeId),
            price: Math.round(estimatedPrice * 100) / 100,
            color: getStoreColor(storeId),
            onSale: Math.random() > 0.7,
            availability: Math.random() > 0.1 ? 'in-stock' : 'out-of-stock',
            distance: Math.round((Math.random() * 5 + 1) * 10) / 10,
            openingHours: 'Mon-Sun: 8:00-21:00'
          });
        }
      });

      // Sort by selected criteria
      comparison.sort((a, b) => {
        switch (sortBy) {
          case 'distance':
            return a.distance - b.distance;
          case 'availability':
            const availabilityOrder = { 'in-stock': 0, 'low-stock': 1, 'out-of-stock': 2 };
            return availabilityOrder[a.availability as keyof typeof availabilityOrder] - availabilityOrder[b.availability as keyof typeof availabilityOrder];
          default:
            return a.price - b.price;
        }
      });

      setComparisonData(comparison);
    } catch (error) {
      console.error('Error generating comparison data:', error);
      // Fallback to basic comparison with current product
      setComparisonData([{
        retailer: getStoreDisplayName(product.store_id),
        price: product.price,
        color: getStoreColor(product.store_id),
        onSale: false,
        availability: (product.stock_quantity || 0) > 0 ? 'in-stock' : 'out-of-stock',
        distance: 2.3,
        openingHours: 'Mon-Sun: 8:00-21:00'
      }]);
    } finally {
      setLoadingComparison(false);
    }
  };

  const generatePriceHistory = (product: ProductWithCategory) => {
    // Generate mock price history data (in a real app, this would come from historical data)
    const history: PriceHistoryData[] = [];
    const currentDate = new Date();
    
    for (let i = 7; i >= 0; i--) {
      const date = new Date(currentDate);
      date.setDate(date.getDate() - i);
      
      // Generate price variation (±10% of current price)
      const priceVariation = 1 + (Math.random() - 0.5) * 0.2;
      const historicalPrice = product.price * priceVariation;
      
      history.push({
        date: date.toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' }),
        price: Math.round(historicalPrice * 100) / 100,
        retailer: getStoreDisplayName(product.store_id)
      });
    }
    
    setPriceHistory(history);
  };

  const bestPrice = comparisonData.length > 0 ? Math.min(...comparisonData.map(d => d.price)) : 0;
  const worstPrice = comparisonData.length > 0 ? Math.max(...comparisonData.map(d => d.price)) : 0;
  const savings = worstPrice - bestPrice;

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'in-stock': return 'text-green-600 bg-green-50';
      case 'low-stock': return 'text-orange-600 bg-orange-50';
      case 'out-of-stock': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getAvailabilityText = (availability: string) => {
    switch (availability) {
      case 'in-stock': return 'In Stock';
      case 'low-stock': return 'Low Stock';
      case 'out-of-stock': return 'Out of Stock';
      default: return 'Unknown';
    }
  };

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
          <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Products</h3>
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
      {/* Mobile-Optimized Header */}
      <div className="sticky top-0 bg-white z-10 border-b border-gray-200 -mx-3 px-3 py-3 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-bold text-gray-900">{t('product.compare_prices')}</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode(viewMode === 'compact' ? 'detailed' : 'compact')}
              className="p-2 text-gray-600 hover:text-gray-900 rounded-lg transition-colors"
              title={viewMode === 'compact' ? 'Detailed view' : 'Compact view'}
            >
              <Eye className="h-4 w-4" />
            </button>
            <button className="p-2 text-gray-600 hover:text-gray-900 rounded-lg transition-colors">
              <Share2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col space-y-2 mb-3">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products to compare..."
              className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-white shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
            />
          </div>
          
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg bg-white shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
          >
            <option value="all">All Categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* Horizontal Product Selector */}
        <div className="flex space-x-2 overflow-x-auto pb-2 -mx-1 px-1">
          {filteredProducts.slice(0, 8).map((product) => (
            <button
              key={product.id}
              onClick={() => setSelectedProduct(product)}
              className={`flex-shrink-0 w-16 h-16 p-1 rounded-lg border-2 transition-all ${
                selectedProduct?.id === product.id
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <img 
                src={product.image_url || 'https://images.pexels.com/photos/264547/pexels-photo-264547.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop'}
                alt={product.name}
                className="w-full h-full object-cover rounded"
              />
            </button>
          ))}
        </div>
      </div>

      {selectedProduct && (
        <>
          {/* Hero Product Card */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-4 mb-4 border border-green-200">
            <div className="flex items-center space-x-3">
              <img 
                src={selectedProduct.image_url || 'https://images.pexels.com/photos/264547/pexels-photo-264547.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop'} 
                alt={selectedProduct.name}
                className="w-16 h-16 object-cover rounded-lg shadow-sm"
              />
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-gray-900 truncate">{selectedProduct.name}</h3>
                <p className="text-sm text-gray-600 truncate">{selectedProduct.description}</p>
                <div className="flex items-center space-x-3 mt-1">
                  <div className="flex items-center space-x-1">
                    <TrendingDown className="h-3 w-3 text-green-600" />
                    <span className="text-sm font-semibold text-green-600">
                      {formatCurrency(savings)} saved
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-3 w-3 text-blue-600" />
                    <span className="text-xs text-blue-600">
                      {comparisonData.length} stores
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-500">Best Price</div>
                <div className="text-xl font-bold text-green-600">
                  {formatCurrency(bestPrice)}
                </div>
                <div className="text-xs text-gray-600">
                  at {comparisonData.find(d => d.price === bestPrice)?.retailer || 'Store'}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats Bar */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-white rounded-lg p-3 text-center shadow-sm border border-gray-200">
              <div className="text-lg font-bold text-green-600">{formatCurrency(bestPrice)}</div>
              <div className="text-xs text-gray-600">Lowest</div>
            </div>
            <div className="bg-white rounded-lg p-3 text-center shadow-sm border border-gray-200">
              <div className="text-lg font-bold text-orange-600">{formatCurrency(savings)}</div>
              <div className="text-xs text-gray-600">You Save</div>
            </div>
            <div className="bg-white rounded-lg p-3 text-center shadow-sm border border-gray-200">
              <div className="text-lg font-bold text-blue-600">
                {comparisonData.find(d => d.price === bestPrice)?.distance || 0}km
              </div>
              <div className="text-xs text-gray-600">Nearest</div>
            </div>
          </div>

          {/* Sort Controls */}
          <div className="flex items-center justify-between mb-4 bg-white rounded-lg p-2 shadow-sm border border-gray-200">
            <span className="text-sm font-medium text-gray-700">Sort by:</span>
            <div className="flex space-x-1">
              {[
                { key: 'price', label: 'Price', icon: TrendingDown },
                { key: 'distance', label: 'Distance', icon: MapPin },
                { key: 'availability', label: 'Stock', icon: Award }
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setSortBy(key as typeof sortBy)}
                  className={`flex items-center space-x-1 px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                    sortBy === key
                      ? 'bg-green-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-3 w-3" />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Price Comparison Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-4 overflow-hidden">
            <button
              onClick={() => toggleSection('priceComparison')}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5 text-blue-600" />
                <span className="font-semibold text-gray-900">Price Comparison</span>
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                  {comparisonData.length} stores
                </span>
              </div>
              {expandedSections.priceComparison ? 
                <ChevronUp className="h-5 w-5 text-gray-400" /> : 
                <ChevronDown className="h-5 w-5 text-gray-400" />
              }
            </button>
            
            {expandedSections.priceComparison && (
              <div className="border-t border-gray-200">
                {loadingComparison ? (
                  <div className="p-6 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                    <p className="text-gray-600 mt-2">Loading comparison...</p>
                  </div>
                ) : viewMode === 'compact' ? (
                  /* Compact View */
                  <div className="divide-y divide-gray-100">
                    {comparisonData.map((data, index) => (
                      <div key={data.retailer} className="flex items-center justify-between p-3 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center space-x-3">
                          <div className="relative">
                            <div 
                              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                              style={{ backgroundColor: data.color }}
                            >
                              {data.retailer.charAt(0)}
                            </div>
                            {index === 0 && (
                              <div className="absolute -top-1 -right-1 bg-green-500 text-white rounded-full p-0.5">
                                <Star className="h-2 w-2" />
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 text-sm">
                              {data.retailer}
                            </div>
                            <div className="text-xs text-gray-500">
                              {data.distance}km
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="flex items-center space-x-2">
                            <span className="text-lg font-bold text-gray-900">
                              {formatCurrency(data.price)}
                            </span>
                            {data.onSale && (
                              <span className="bg-red-100 text-red-800 text-xs font-medium px-1.5 py-0.5 rounded">
                                Sale
                              </span>
                            )}
                          </div>
                          <div className={`text-xs px-2 py-0.5 rounded-full ${getAvailabilityColor(data.availability)}`}>
                            {getAvailabilityText(data.availability)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  /* Detailed View */
                  <div className="divide-y divide-gray-100">
                    {comparisonData.map((data, index) => (
                      <div key={data.retailer} className="p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center space-x-3">
                            <div className="relative">
                              <div 
                                className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold"
                                style={{ backgroundColor: data.color }}
                              >
                                {data.retailer.charAt(0)}
                              </div>
                              {index === 0 && (
                                <div className="absolute -top-1 -right-1 bg-green-500 text-white rounded-full p-1">
                                  <Star className="h-3 w-3" />
                                </div>
                              )}
                            </div>
                            <div>
                              <h5 className="font-semibold text-gray-900">{data.retailer}</h5>
                              <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <MapPin className="h-3 w-3" />
                                <span>{data.distance}km away</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="text-2xl font-bold text-gray-900">
                                {formatCurrency(data.price)}
                              </span>
                            </div>
                            <div className={`inline-block text-xs px-2 py-1 rounded-full ${getAvailabilityColor(data.availability)}`}>
                              {getAvailabilityText(data.availability)}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>{data.openingHours}</span>
                          </div>
                          {index === 0 && (
                            <span className="bg-green-100 text-green-800 font-medium px-2 py-1 rounded">
                              Best Price
                            </span>
                          )}
                          {index > 0 && (
                            <span className="text-red-600">
                              +{formatCurrency(data.price - bestPrice)} more
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Price History Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-4 overflow-hidden">
            <button
              onClick={() => toggleSection('priceHistory')}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-2">
                <TrendingDown className="h-5 w-5 text-green-600" />
                <span className="font-semibold text-gray-900">Price History</span>
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                  7 days
                </span>
              </div>
              {expandedSections.priceHistory ? 
                <ChevronUp className="h-5 w-5 text-gray-400" /> : 
                <ChevronDown className="h-5 w-5 text-gray-400" />
              }
            </button>
            
            {expandedSections.priceHistory && (
              <div className="border-t border-gray-200 p-4">
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={priceHistory}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis 
                        tick={{ fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                        width={40}
                      />
                      <Tooltip 
                        formatter={(value) => [`${formatCurrency(Number(value))}`, 'Price']}
                        labelFormatter={(label) => `Date: ${label}`}
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          fontSize: '12px'
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="price" 
                        stroke="#10B981" 
                        strokeWidth={2}
                        dot={{ fill: '#10B981', strokeWidth: 2, r: 3 }}
                        activeDot={{ r: 5, stroke: '#10B981', strokeWidth: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>

          {/* Smart Insights Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-4 overflow-hidden">
            <button
              onClick={() => toggleSection('insights')}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-2">
                <Zap className="h-5 w-5 text-purple-600" />
                <span className="font-semibold text-gray-900">Smart Insights</span>
                <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                  AI
                </span>
              </div>
              {expandedSections.insights ? 
                <ChevronUp className="h-5 w-5 text-gray-400" /> : 
                <ChevronDown className="h-5 w-5 text-gray-400" />
              }
            </button>
            
            {expandedSections.insights && (
              <div className="border-t border-gray-200 p-4 space-y-3">
                {savings > 0 && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-start space-x-2">
                      <TrendingDown className="h-4 w-4 text-green-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-green-900 text-sm">Maximum Savings</h4>
                        <p className="text-green-800 text-sm mt-1">
                          You can save <span className="font-bold">{formatCurrency(savings)}</span> by choosing 
                          {' '}{comparisonData.find(d => d.price === bestPrice)?.retailer} over the most expensive option.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-start space-x-2">
                    <MapPin className="h-4 w-4 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-900 text-sm">Distance Factor</h4>
                      <p className="text-blue-800 text-sm mt-1">
                        The nearest store is {comparisonData.find(d => d.price === bestPrice)?.distance || 0}km away. 
                        Consider fuel costs when comparing total value.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                  <div className="flex items-start space-x-2">
                    <Clock className="h-4 w-4 text-orange-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-orange-900 text-sm">Best Time to Shop</h4>
                      <p className="text-orange-800 text-sm mt-1">
                        Prices typically drop on weekends. Consider waiting for better deals.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Store Details Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
            <button
              onClick={() => toggleSection('storeDetails')}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-2">
                <MapPin className="h-5 w-5 text-blue-600" />
                <span className="font-semibold text-gray-900">Store Details</span>
              </div>
              {expandedSections.storeDetails ? 
                <ChevronUp className="h-5 w-5 text-gray-400" /> : 
                <ChevronDown className="h-5 w-5 text-gray-400" />
              }
            </button>
            
            {expandedSections.storeDetails && (
              <div className="border-t border-gray-200 divide-y divide-gray-100">
                {comparisonData.map((data) => (
                  <div key={data.retailer} className="p-4">
                    <div className="flex items-start space-x-3">
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                        style={{ backgroundColor: data.color }}
                      >
                        {data.retailer.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <h5 className="font-semibold text-gray-900">{data.retailer}</h5>
                        <p className="text-sm text-gray-600 mb-2">Store location details</p>
                        <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                          <div>
                            <span className="font-medium">Distance:</span> {data.distance}km
                          </div>
                          <div>
                            <span className="font-medium">Hours:</span> {data.openingHours}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-gray-900">
                          {formatCurrency(data.price)}
                        </div>
                        <div className={`text-xs px-2 py-1 rounded-full ${getAvailabilityColor(data.availability)}`}>
                          {getAvailabilityText(data.availability)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {filteredProducts.length === 0 && (
        <div className="text-center py-16">
          <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
          <p className="text-gray-600">Try adjusting your search terms or category filter</p>
        </div>
      )}
    </div>
  );
};