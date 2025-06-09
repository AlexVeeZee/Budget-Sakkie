import React from 'react';
import { TrendingDown, Star, Clock, ArrowRight } from 'lucide-react';
import { getFeaturedDeals } from '../data/mockData';
import { PriceHighlight } from './PriceHighlight';

export const FeaturedDeals: React.FC = () => {
  const featuredDeals = getFeaturedDeals();

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-orange-100 rounded-lg">
            <Star className="h-6 w-6 text-orange-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Featured Deals</h2>
            <p className="text-gray-600">Best savings available right now</p>
          </div>
        </div>
        <button className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium">
          <span>View All</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {featuredDeals.slice(0, 6).map((deal) => (
          <div 
            key={deal.product.id}
            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start space-x-3 mb-3">
              <img 
                src={deal.product.image}
                alt={deal.product.name}
                className="w-16 h-16 object-cover rounded-lg"
              />
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 text-sm leading-tight">
                  {deal.product.name}
                </h3>
                <p className="text-xs text-gray-600 mt-1">
                  {deal.product.brand} • {deal.product.unitSize}
                </p>
                <div className="flex items-center space-x-2 mt-2">
                  <div className="flex items-center space-x-1 text-green-600">
                    <TrendingDown className="h-3 w-3" />
                    <span className="text-xs font-semibold">
                      Save R{deal.savings.toFixed(2)}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    vs highest price
                  </span>
                </div>
              </div>
            </div>

            <PriceHighlight 
              bestPrice={deal.bestPrice}
              savings={deal.savings}
              className="mb-3"
            />

            <div className="flex items-center justify-between text-xs text-gray-600">
              <div className="flex items-center space-x-1">
                <Clock className="h-3 w-3" />
                <span>Updated today</span>
              </div>
              <span>{deal.allPrices.length} stores compared</span>
            </div>
          </div>
        ))}
      </div>

      {featuredDeals.length === 0 && (
        <div className="text-center py-8">
          <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No deals available</h3>
          <p className="text-gray-600">Check back later for the latest savings opportunities.</p>
        </div>
      )}
    </div>
  );
};