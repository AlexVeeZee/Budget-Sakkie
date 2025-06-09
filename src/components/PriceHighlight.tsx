import React from 'react';
import { TrendingDown, MapPin } from 'lucide-react';
import { Price } from '../types';

interface PriceHighlightProps {
  bestPrice: Price;
  savings: number;
  className?: string;
}

export const PriceHighlight: React.FC<PriceHighlightProps> = ({ 
  bestPrice, 
  savings, 
  className = "" 
}) => {
  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'in-stock': return 'text-green-600';
      case 'low-stock': return 'text-orange-600';
      case 'out-of-stock': return 'text-red-600';
      default: return 'text-gray-600';
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
    <div className={`bg-green-50 rounded-lg p-4 border border-green-200 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <img 
            src={bestPrice.retailer.logo}
            alt={bestPrice.retailer.name}
            className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
          />
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span className="text-sm font-medium text-gray-700">Best Price</span>
              {savings > 0 && (
                <div className="flex items-center space-x-1 text-green-600">
                  <TrendingDown className="h-3 w-3" />
                  <span className="text-xs font-semibold">R{savings.toFixed(2)} saved</span>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-xl font-bold text-gray-900">
                R{bestPrice.price.toFixed(2)}
              </span>
              {bestPrice.originalPrice && (
                <span className="text-sm text-gray-500 line-through">
                  R{bestPrice.originalPrice.toFixed(2)}
                </span>
              )}
              <span className="text-sm font-semibold text-gray-900">
                {bestPrice.retailer.name}
              </span>
              <span className={`text-xs font-medium ${getAvailabilityColor(bestPrice.availability)}`}>
                {getAvailabilityText(bestPrice.availability)}
              </span>
            </div>
          </div>
        </div>
        
        <div className="text-right">
          <div className="flex items-center space-x-1 text-xs text-gray-600 mb-1">
            <MapPin className="h-3 w-3" />
            <span>{bestPrice.retailer.locations[0]?.distance}km away</span>
          </div>
          <div className="text-xs text-gray-500">
            Updated: {new Date(bestPrice.lastUpdated).toLocaleDateString()}
          </div>
        </div>
      </div>
    </div>
  );
};