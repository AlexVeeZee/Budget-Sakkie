import React from 'react';
import { ShoppingCart, TrendingDown, ArrowRight } from 'lucide-react';
import { products, prices, getBestPrice, calculateSavings } from '../data/mockData';

export const CategoryShowcase: React.FC = () => {
  // Group products by category
  const categories = products.reduce((acc, product) => {
    if (!acc[product.category]) {
      acc[product.category] = [];
    }
    acc[product.category].push(product);
    return acc;
  }, {} as Record<string, typeof products>);

  const getCategoryIcon = (category: string) => {
    const icons = {
      'Fresh Produce': '🥕',
      'Dairy': '🥛',
      'Meat': '🥩',
      'Bakery': '🍞',
      'Pantry': '🥫',
      'Beverages': '☕',
      'Household': '🧻'
    };
    return icons[category as keyof typeof icons] || '🛒';
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      'Fresh Produce': 'from-green-500 to-emerald-600',
      'Dairy': 'from-blue-500 to-cyan-600',
      'Meat': 'from-red-500 to-rose-600',
      'Bakery': 'from-orange-500 to-amber-600',
      'Pantry': 'from-purple-500 to-violet-600',
      'Beverages': 'from-brown-500 to-yellow-600',
      'Household': 'from-gray-500 to-slate-600'
    };
    return colors[category as keyof typeof colors] || 'from-gray-500 to-gray-600';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Shop by Category</h2>
          <p className="text-gray-600">Compare prices across all your favorite products</p>
        </div>
        <button className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium">
          <span>View All Categories</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Object.entries(categories).map(([categoryName, categoryProducts]) => {
          // Calculate category statistics
          const totalSavings = categoryProducts.reduce((sum, product) => {
            return sum + calculateSavings(product.id);
          }, 0);
          
          const avgSavings = totalSavings / categoryProducts.length;
          
          // Get best deal in category
          const bestDeal = categoryProducts.reduce((best, product) => {
            const savings = calculateSavings(product.id);
            return savings > calculateSavings(best.id) ? product : best;
          });

          const bestPrice = getBestPrice(bestDeal.id);

          return (
            <div 
              key={categoryName}
              className="relative overflow-hidden rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-300 cursor-pointer group"
            >
              {/* Background Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${getCategoryColor(categoryName)} opacity-10 group-hover:opacity-20 transition-opacity`} />
              
              <div className="relative p-6">
                {/* Category Header */}
                <div className="flex items-center space-x-3 mb-4">
                  <div className="text-3xl">{getCategoryIcon(categoryName)}</div>
                  <div>
                    <h3 className="font-bold text-gray-900">{categoryName}</h3>
                    <p className="text-sm text-gray-600">{categoryProducts.length} products</p>
                  </div>
                </div>

                {/* Best Deal Preview */}
                <div className="mb-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <img 
                      src={bestDeal.image}
                      alt={bestDeal.name}
                      className="w-12 h-12 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 text-sm leading-tight">
                        {bestDeal.name}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-sm font-bold text-green-600">
                          R{bestPrice.price.toFixed(2)}
                        </span>
                        <span className="text-xs text-gray-500">
                          at {bestPrice.retailer.name}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Category Stats */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Avg. Savings:</span>
                    <div className="flex items-center space-x-1 text-green-600">
                      <TrendingDown className="h-3 w-3" />
                      <span className="font-semibold">R{avgSavings.toFixed(2)}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Best Saving:</span>
                    <span className="font-semibold text-orange-600">
                      R{calculateSavings(bestDeal.id).toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Action Button */}
                <button className="w-full mt-4 flex items-center justify-center space-x-2 bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors group-hover:bg-blue-50 group-hover:text-blue-700">
                  <ShoppingCart className="h-4 w-4" />
                  <span>Browse {categoryName}</span>
                </button>
              </div>

              {/* Hover Effect */}
              <div className="absolute inset-0 border-2 border-transparent group-hover:border-blue-200 rounded-xl transition-colors" />
            </div>
          );
        })}
      </div>
    </div>
  );
};