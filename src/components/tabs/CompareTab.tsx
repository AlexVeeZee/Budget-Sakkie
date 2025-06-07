import React, { useState } from 'react';
import { BarChart3, TrendingDown, MapPin, Clock, Star } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { products, prices, priceHistory } from '../../data/mockData';
import { useLanguage } from '../../hooks/useLanguage';

export const CompareTab: React.FC = () => {
  const { t } = useLanguage();
  const [selectedProduct, setSelectedProduct] = useState(products[0]);

  const productPrices = prices.filter(price => price.productId === selectedProduct.id);
  const sortedPrices = [...productPrices].sort((a, b) => a.price - b.price);

  const chartData = priceHistory.map(item => ({
    date: new Date(item.date).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' }),
    price: item.price,
    retailer: item.retailer
  }));

  const barData = sortedPrices.map(price => ({
    retailer: price.retailer.name,
    price: price.price,
    color: price.retailer.color,
    onSale: price.onSale,
    availability: price.availability
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Product Selector */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('product.compare_prices')}</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {products.map((product) => (
            <button
              key={product.id}
              onClick={() => setSelectedProduct(product)}
              className={`p-3 rounded-lg border-2 transition-all ${
                selectedProduct.id === product.id
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <img 
                src={product.image} 
                alt={product.name}
                className="w-full h-16 object-cover rounded-md mb-2"
              />
              <p className="text-sm font-medium text-gray-900 leading-tight">{product.name}</p>
              <p className="text-xs text-gray-600">{product.brand}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Selected Product Overview */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex items-start space-x-4">
          <img 
            src={selectedProduct.image} 
            alt={selectedProduct.name}
            className="w-24 h-24 object-cover rounded-lg"
          />
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900">{selectedProduct.name}</h3>
            <p className="text-gray-600 mb-2">{selectedProduct.brand} • {selectedProduct.unitSize}</p>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <TrendingDown className="h-4 w-4 text-green-600" />
                <span className="text-green-600 font-semibold">
                  R{(sortedPrices[sortedPrices.length - 1]?.price - sortedPrices[0]?.price || 0).toFixed(2)} saved
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <MapPin className="h-4 w-4 text-blue-600" />
                <span className="text-blue-600 text-sm">
                  {sortedPrices.length} stores nearby
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
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [`R${value}`, 'Price']}
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
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="retailer" />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [`R${value}`, 'Price']}
                />
                <Bar dataKey="price" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Detailed Price Comparison */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h4 className="text-lg font-semibold text-gray-900">Detailed Price Comparison</h4>
        </div>
        <div className="divide-y divide-gray-200">
          {sortedPrices.map((price, index) => (
            <div key={price.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
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
                      <Clock className="h-3 w-3 ml-2" />
                      <span>{price.retailer.locations[0]?.openingHours}</span>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl font-bold text-gray-900">
                      R{price.price.toFixed(2)}
                    </span>
                    {price.onSale && price.originalPrice && (
                      <span className="text-sm text-gray-500 line-through">
                        R{price.originalPrice.toFixed(2)}
                      </span>
                    )}
                    {price.onSale && (
                      <span className="bg-red-100 text-red-800 text-xs font-semibold px-2 py-1 rounded">
                        Sale
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-end space-x-2 mt-1">
                    <span className={`text-sm font-medium ${
                      price.availability === 'in-stock' ? 'text-green-600' :
                      price.availability === 'low-stock' ? 'text-orange-600' : 'text-red-600'
                    }`}>
                      {price.availability === 'in-stock' ? 'In Stock' :
                       price.availability === 'low-stock' ? 'Low Stock' : 'Out of Stock'}
                    </span>
                    {index === 0 && (
                      <span className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded">
                        Best Price
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};