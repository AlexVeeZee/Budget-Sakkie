import React, { useState, useMemo } from 'react';
import { BarChart3, TrendingDown, MapPin, Clock, Star, ChevronDown, ChevronUp, Filter, Search, Zap, Award, Eye, Share2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { products, prices, priceHistory } from '../../data/mockData';
import { useLanguage } from '../../hooks/useLanguage';
import { useCurrency } from '../../hooks/useCurrency';

export const CompareTab: React.FC = () => {
  const { t } = useLanguage();
  const { formatCurrency } = useCurrency();
  const [selectedProduct, setSelectedProduct] = useState(products[0]);
  const [expandedSections, setExpandedSections] = useState({
    priceHistory: false,
    priceComparison: true,
    storeDetails: false,
    insights: false
  });
  const [viewMode, setViewMode] = useState<'compact' | 'detailed'>('compact');
  const [sortBy, setSortBy] = useState<'price' | 'distance' | 'availability'>('price');

  const productPrices = prices.filter(price => price.productId === selectedProduct.id);
  const sortedPrices = [...productPrices].sort((a, b) => {
    switch (sortBy) {
      case 'distance':
        return a.retailer.locations[0]?.distance - b.retailer.locations[0]?.distance;
      case 'availability':
        const availabilityOrder = { 'in-stock': 0, 'low-stock': 1, 'out-of-stock': 2 };
        return availabilityOrder[a.availability] - availabilityOrder[b.availability];
      default:
        return a.price - b.price;
    }
  });

  const bestPrice = sortedPrices[0];
  const worstPrice = sortedPrices[sortedPrices.length - 1];
  const savings = worstPrice ? worstPrice.price - bestPrice.price : 0;

  const chartData = priceHistory.map(item => ({
    date: new Date(item.date).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' }),
    price: item.price,
    retailer: item.retailer
  }));

  const barData = sortedPrices.map(price => ({
    retailer: price.retailer.name.split(' ')[0], // Shortened for mobile
    price: price.price,
    color: price.retailer.color,
    onSale: price.onSale,
    availability: price.availability
  }));

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

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
      {/* Mobile-Optimized Header - 56px height */}
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

        {/* Horizontal Product Selector - 48px height */}
        <div className="flex space-x-2 overflow-x-auto pb-2 -mx-1 px-1">
          {products.map((product) => (
            <button
              key={product.id}
              onClick={() => setSelectedProduct(product)}
              className={`flex-shrink-0 w-16 h-16 p-1 rounded-lg border-2 transition-all ${
                selectedProduct.id === product.id
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <img 
                src={product.image} 
                alt={product.name}
                className="w-full h-full object-cover rounded"
              />
            </button>
          ))}
        </div>
      </div>

      {/* Hero Product Card - Compact 120px height */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-4 mb-4 border border-green-200">
        <div className="flex items-center space-x-3">
          <img 
            src={selectedProduct.image} 
            alt={selectedProduct.name}
            className="w-16 h-16 object-cover rounded-lg shadow-sm"
          />
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-gray-900 truncate">{selectedProduct.name}</h3>
            <p className="text-sm text-gray-600 truncate">{selectedProduct.brand} • {selectedProduct.unitSize}</p>
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
                  {sortedPrices.length} stores
                </span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-500">Best Price</div>
            <div className="text-xl font-bold text-green-600">
              {formatCurrency(bestPrice?.price || 0)}
            </div>
            <div className="text-xs text-gray-600">
              at {bestPrice?.retailer.name.split(' ')[0]}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats Bar - 60px height */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-white rounded-lg p-3 text-center shadow-sm border border-gray-200">
          <div className="text-lg font-bold text-green-600">{formatCurrency(bestPrice?.price || 0)}</div>
          <div className="text-xs text-gray-600">Lowest</div>
        </div>
        <div className="bg-white rounded-lg p-3 text-center shadow-sm border border-gray-200">
          <div className="text-lg font-bold text-orange-600">{formatCurrency(savings)}</div>
          <div className="text-xs text-gray-600">You Save</div>
        </div>
        <div className="bg-white rounded-lg p-3 text-center shadow-sm border border-gray-200">
          <div className="text-lg font-bold text-blue-600">{bestPrice?.retailer.locations[0]?.distance}km</div>
          <div className="text-xs text-gray-600">Nearest</div>
        </div>
      </div>

      {/* Sort Controls - 44px height */}
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

      {/* Collapsible Sections */}
      
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
              {sortedPrices.length} stores
            </span>
          </div>
          {expandedSections.priceComparison ? 
            <ChevronUp className="h-5 w-5 text-gray-400" /> : 
            <ChevronDown className="h-5 w-5 text-gray-400" />
          }
        </button>
        
        {expandedSections.priceComparison && (
          <div className="border-t border-gray-200">
            {viewMode === 'compact' ? (
              /* Compact View - 60px per item */
              <div className="divide-y divide-gray-100">
                {sortedPrices.map((price, index) => (
                  <div key={price.id} className="flex items-center justify-between p-3 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <img 
                          src={price.retailer.logo}
                          alt={price.retailer.name}
                          className="w-8 h-8 rounded-full object-cover border border-gray-200"
                        />
                        {index === 0 && (
                          <div className="absolute -top-1 -right-1 bg-green-500 text-white rounded-full p-0.5">
                            <Star className="h-2 w-2" />
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 text-sm">
                          {price.retailer.name.split(' ')[0]}
                        </div>
                        <div className="text-xs text-gray-500">
                          {price.retailer.locations[0]?.distance}km
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg font-bold text-gray-900">
                          {formatCurrency(price.price)}
                        </span>
                        {price.onSale && (
                          <span className="bg-red-100 text-red-800 text-xs font-medium px-1.5 py-0.5 rounded">
                            Sale
                          </span>
                        )}
                      </div>
                      <div className={`text-xs px-2 py-0.5 rounded-full ${getAvailabilityColor(price.availability)}`}>
                        {getAvailabilityText(price.availability)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Detailed View - 100px per item */
              <div className="divide-y divide-gray-100">
                {sortedPrices.map((price, index) => (
                  <div key={price.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <img 
                            src={price.retailer.logo}
                            alt={price.retailer.name}
                            className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                          />
                          {index === 0 && (
                            <div className="absolute -top-1 -right-1 bg-green-500 text-white rounded-full p-1">
                              <Star className="h-3 w-3" />
                            </div>
                          )}
                        </div>
                        <div>
                          <h5 className="font-semibold text-gray-900">{price.retailer.name}</h5>
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <MapPin className="h-3 w-3" />
                            <span>{price.retailer.locations[0]?.distance}km away</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-2xl font-bold text-gray-900">
                            {formatCurrency(price.price)}
                          </span>
                          {price.onSale && price.originalPrice && (
                            <span className="text-sm text-gray-500 line-through">
                              {formatCurrency(price.originalPrice)}
                            </span>
                          )}
                        </div>
                        <div className={`inline-block text-xs px-2 py-1 rounded-full ${getAvailabilityColor(price.availability)}`}>
                          {getAvailabilityText(price.availability)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>{price.retailer.locations[0]?.openingHours}</span>
                      </div>
                      {index === 0 && (
                        <span className="bg-green-100 text-green-800 font-medium px-2 py-1 rounded">
                          Best Price
                        </span>
                      )}
                      {index > 0 && (
                        <span className="text-red-600">
                          +{formatCurrency(price.price - bestPrice.price)} more
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
                <LineChart data={chartData}>
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
                      {' '}{bestPrice.retailer.name} over the most expensive option.
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
                    The nearest store is {bestPrice?.retailer.locations[0]?.distance}km away. 
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
            {sortedPrices.map((price) => (
              <div key={price.id} className="p-4">
                <div className="flex items-start space-x-3">
                  <img 
                    src={price.retailer.logo}
                    alt={price.retailer.name}
                    className="w-10 h-10 rounded-full object-cover border border-gray-200"
                  />
                  <div className="flex-1">
                    <h5 className="font-semibold text-gray-900">{price.retailer.name}</h5>
                    <p className="text-sm text-gray-600 mb-2">{price.retailer.locations[0]?.address}</p>
                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                      <div>
                        <span className="font-medium">Distance:</span> {price.retailer.locations[0]?.distance}km
                      </div>
                      <div>
                        <span className="font-medium">Hours:</span> {price.retailer.locations[0]?.openingHours}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900">
                      {formatCurrency(price.price)}
                    </div>
                    <div className={`text-xs px-2 py-1 rounded-full ${getAvailabilityColor(price.availability)}`}>
                      {getAvailabilityText(price.availability)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};