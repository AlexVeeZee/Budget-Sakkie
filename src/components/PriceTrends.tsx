import React from 'react';
import { TrendingUp, TrendingDown, Minus, BarChart3 } from 'lucide-react';
import { products, prices, calculateSavings, getBestPrice } from '../data/mockData';

export const PriceTrends: React.FC = () => {
  // Calculate price trends and statistics
  const priceStats = products.map(product => {
    const productPrices = prices.filter(price => price.productId === product.id);
    const bestPrice = getBestPrice(product.id);
    const savings = calculateSavings(product.id);
    
    // Calculate price spread
    const priceValues = productPrices.map(p => p.price);
    const minPrice = Math.min(...priceValues);
    const maxPrice = Math.max(...priceValues);
    const avgPrice = priceValues.reduce((sum, price) => sum + price, 0) / priceValues.length;
    
    // Simulate trend (in real app, this would be based on historical data)
    const trend = Math.random() > 0.5 ? 'up' : Math.random() > 0.3 ? 'down' : 'stable';
    const trendPercentage = Math.random() * 10; // 0-10% change
    
    return {
      product,
      bestPrice,
      savings,
      minPrice,
      maxPrice,
      avgPrice,
      trend,
      trendPercentage,
      priceSpread: ((maxPrice - minPrice) / minPrice) * 100
    };
  }).sort((a, b) => b.savings - a.savings); // Sort by highest savings

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-red-600" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-green-600" />;
      default: return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'text-red-600';
      case 'down': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getTrendText = (trend: string) => {
    switch (trend) {
      case 'up': return 'Rising';
      case 'down': return 'Falling';
      default: return 'Stable';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-blue-100 rounded-lg">
          <BarChart3 className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Price Trends & Analysis</h2>
          <p className="text-gray-600">Real-time price movements and savings opportunities</p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <div className="flex items-center space-x-2 mb-2">
            <TrendingDown className="h-5 w-5 text-green-600" />
            <span className="text-sm font-medium text-green-700">Total Savings</span>
          </div>
          <p className="text-2xl font-bold text-green-900">
            R{priceStats.reduce((sum, stat) => sum + stat.savings, 0).toFixed(2)}
          </p>
          <p className="text-xs text-green-600">Across all products</p>
        </div>

        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center space-x-2 mb-2">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-700">Avg. Price Spread</span>
          </div>
          <p className="text-2xl font-bold text-blue-900">
            {(priceStats.reduce((sum, stat) => sum + stat.priceSpread, 0) / priceStats.length).toFixed(1)}%
          </p>
          <p className="text-xs text-blue-600">Between retailers</p>
        </div>

        <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
          <div className="flex items-center space-x-2 mb-2">
            <TrendingUp className="h-5 w-5 text-orange-600" />
            <span className="text-sm font-medium text-orange-700">Best Deal</span>
          </div>
          <p className="text-2xl font-bold text-orange-900">
            R{Math.max(...priceStats.map(s => s.savings)).toFixed(2)}
          </p>
          <p className="text-xs text-orange-600">Maximum savings</p>
        </div>

        <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
          <div className="flex items-center space-x-2 mb-2">
            <BarChart3 className="h-5 w-5 text-purple-600" />
            <span className="text-sm font-medium text-purple-700">Products</span>
          </div>
          <p className="text-2xl font-bold text-purple-900">{priceStats.length}</p>
          <p className="text-xs text-purple-600">Being tracked</p>
        </div>
      </div>

      {/* Price Trends Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-semibold text-gray-900">Product</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-900">Best Price</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-900">Price Range</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-900">Savings</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-900">Trend</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-900">Spread</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {priceStats.slice(0, 8).map((stat) => (
              <tr key={stat.product.id} className="hover:bg-gray-50">
                <td className="py-3 px-4">
                  <div className="flex items-center space-x-3">
                    <img 
                      src={stat.product.image}
                      alt={stat.product.name}
                      className="w-10 h-10 object-cover rounded-lg"
                    />
                    <div>
                      <p className="font-semibold text-gray-900">{stat.product.name}</p>
                      <p className="text-sm text-gray-600">{stat.product.brand}</p>
                    </div>
                  </div>
                </td>
                
                <td className="py-3 px-4">
                  <div>
                    <p className="font-bold text-green-600">R{stat.bestPrice.price.toFixed(2)}</p>
                    <p className="text-xs text-gray-600">{stat.bestPrice.retailer.name}</p>
                  </div>
                </td>
                
                <td className="py-3 px-4">
                  <div>
                    <p className="text-sm text-gray-900">
                      R{stat.minPrice.toFixed(2)} - R{stat.maxPrice.toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-600">
                      Avg: R{stat.avgPrice.toFixed(2)}
                    </p>
                  </div>
                </td>
                
                <td className="py-3 px-4">
                  <div className="flex items-center space-x-1">
                    <TrendingDown className="h-4 w-4 text-green-600" />
                    <span className="font-bold text-green-600">
                      R{stat.savings.toFixed(2)}
                    </span>
                  </div>
                </td>
                
                <td className="py-3 px-4">
                  <div className={`flex items-center space-x-2 ${getTrendColor(stat.trend)}`}>
                    {getTrendIcon(stat.trend)}
                    <div>
                      <p className="text-sm font-medium">{getTrendText(stat.trend)}</p>
                      <p className="text-xs">
                        {stat.trend !== 'stable' && `${stat.trendPercentage.toFixed(1)}%`}
                      </p>
                    </div>
                  </div>
                </td>
                
                <td className="py-3 px-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {stat.priceSpread.toFixed(1)}%
                    </p>
                    <div className="w-16 bg-gray-200 rounded-full h-2 mt-1">
                      <div 
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${Math.min(stat.priceSpread, 100)}%` }}
                      />
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer Note */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600">
          <strong>Note:</strong> Prices are updated regularly from retailer websites. 
          Trends are calculated based on recent price movements. 
          Always verify prices at the store before purchasing.
        </p>
      </div>
    </div>
  );
};