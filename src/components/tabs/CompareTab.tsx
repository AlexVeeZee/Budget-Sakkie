import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingDown, MapPin, Clock, Star, Search, Filter } from 'lucide-react';
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

export const CompareTab: React.FC = () => {
  const { t } = useLanguage();
  const { formatCurrency } = useCurrency();
  const { products, categories, loading, error } = useProducts();
  const [selectedProduct, setSelectedProduct] = useState<ProductWithCategory | null>(null);
  const [comparisonData, setComparisonData] = useState<PriceComparisonData[]>([]);
  const [priceHistory, setPriceHistory] = useState<PriceHistoryData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loadingComparison, setLoadingComparison] = useState(false);

  // Filter products based on search and category
  const filteredProducts = React.useMemo(() => {
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

  // Set initial selected product
  useEffect(() => {
    if (filteredProducts.length > 0 && !selectedProduct) {
      setSelectedProduct(filteredProducts[0]);
    }
  }, [filteredProducts, selectedProduct]);

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

      // Sort by price
      comparison.sort((a, b) => a.price - b.price);
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

  const bestPrice = comparisonData.length > 0 ? Math.min(...comparisonData.map(d => d.price)) : 0;
  const worstPrice = comparisonData.length > 0 ? Math.max(...comparisonData.map(d => d.price)) : 0;
  const savings = worstPrice - bestPrice;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">{t('product.compare_prices')}</h2>
        <p className="text-gray-600">Compare prices across different stores and find the best deals</p>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products to compare..."
              className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl bg-white shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>
          
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-xl bg-white shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
          >
            <option value="all">All Categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Product Selector */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Product to Compare</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {filteredProducts.slice(0, 12).map((product) => (
            <button
              key={product.id}
              onClick={() => setSelectedProduct(product)}
              className={`p-3 rounded-lg border-2 transition-all ${
                selectedProduct?.id === product.id
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <img 
                src={product.image_url || 'https://images.pexels.com/photos/264547/pexels-photo-264547.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop'}
                alt={product.name}
                className="w-full h-16 object-cover rounded-md mb-2"
              />
              <p className="text-sm font-medium text-gray-900 leading-tight">{product.name}</p>
              <p className="text-xs text-gray-600">{getStoreDisplayName(product.store_id)}</p>
              <p className="text-xs font-semibold text-green-600">{formatCurrency(product.price)}</p>
            </button>
          ))}
        </div>
      </div>

      {selectedProduct && (
        <>
          {/* Selected Product Overview */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="flex items-start space-x-4">
              <img 
                src={selectedProduct.image_url || 'https://images.pexels.com/photos/264547/pexels-photo-264547.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop'}
                alt={selectedProduct.name}
                className="w-24 h-24 object-cover rounded-lg"
              />
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900">{selectedProduct.name}</h3>
                <p className="text-gray-600 mb-2">{selectedProduct.description}</p>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <TrendingDown className="h-4 w-4 text-green-600" />
                    <span className="text-green-600 font-semibold">
                      {formatCurrency(savings)} potential savings
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-4 w-4 text-blue-600" />
                    <span className="text-blue-600 text-sm">
                      {comparisonData.length} stores compared
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Price History Chart */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">{t('product.view_history')}</h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={priceHistory}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value) => [`${formatCurrency(Number(value))}`, 'Price']}
                      labelFormatter={(label) => `Date: ${label}`}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="price" 
                      stroke="#10B981" 
                      strokeWidth={3}
                      dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Price Comparison Bar Chart */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Current Prices</h4>
              {loadingComparison ? (
                <div className="h-64 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                </div>
              ) : (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={comparisonData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="retailer" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value) => [`${formatCurrency(Number(value))}`, 'Price']}
                      />
                      <Bar dataKey="price" fill="#3B82F6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>

          {/* Detailed Price Comparison */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h4 className="text-lg font-semibold text-gray-900">Detailed Price Comparison</h4>
            </div>
            {loadingComparison ? (
              <div className="p-6 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                <p className="text-gray-600 mt-2">Loading price comparison...</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {comparisonData.map((data, index) => (
                  <div key={data.retailer} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
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
                            <Clock className="h-3 w-3 ml-2" />
                            <span>{data.openingHours}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="flex items-center space-x-2">
                          <span className="text-2xl font-bold text-gray-900">
                            {formatCurrency(data.price)}
                          </span>
                          {data.onSale && (
                            <span className="bg-red-100 text-red-800 text-xs font-semibold px-2 py-1 rounded">
                              Sale
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-end space-x-2 mt-1">
                          <span className={`text-sm font-medium ${
                            data.availability === 'in-stock' ? 'text-green-600' :
                            data.availability === 'low-stock' ? 'text-orange-600' : 'text-red-600'
                          }`}>
                            {data.availability === 'in-stock' ? 'In Stock' :
                             data.availability === 'low-stock' ? 'Low Stock' : 'Out of Stock'}
                          </span>
                          {index === 0 && (
                            <span className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded">
                              Best Price
                            </span>
                          )}
                        </div>
                        {index > 0 && (
                          <div className="text-xs text-red-600 mt-1">
                            +{formatCurrency(data.price - bestPrice)} more
                          </div>
                        )}
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