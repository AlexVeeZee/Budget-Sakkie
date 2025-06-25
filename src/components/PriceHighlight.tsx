import React, { memo } from 'react';
import { TrendingDown, MapPin, HelpCircle } from 'lucide-react';
import { Price } from '../types';
import { useCurrency } from '../hooks/useCurrency';

interface PriceHighlightProps {
  bestPrice: Price;
  savings: number;
  className?: string;
}

export const PriceHighlight: React.FC<PriceHighlightProps> = memo(({ 
  bestPrice, 
  savings, 
  className = "" 
}) => {
  const { formatCurrency } = useCurrency();

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
            loading="lazy"
            className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
          />
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span className="text-sm font-medium text-gray-700">Best Price</span>
              {savings > 0 && (
                <div className="flex items-center space-x-1 text-green-600 group relative">
                  <TrendingDown className="h-3 w-3" />
                  <span className="text-xs font-semibold">{formatCurrency(savings)} saved</span>
                  <HelpCircle className="h-3 w-3 text-gray-400 ml-1" />
                  
                  {/* Savings explanation tooltip */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                    Compared to highest price found
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-xl font-bold text-gray-900">
                {formatCurrency(bestPrice.price)}
              </span>
              {bestPrice.originalPrice && (
                <span className="text-sm text-gray-500 line-through">
                  {formatCurrency(bestPrice.originalPrice)}
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
});

PriceHighlight.displayName = 'PriceHighlight';