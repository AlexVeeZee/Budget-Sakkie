import React, { memo } from 'react';
import { ShoppingCart, TrendingDown, TrendingUp, MapPin, Clock, HelpCircle } from 'lucide-react';
import { Product, Price } from '../types';
import { useLanguage } from '../hooks/useLanguage';
import { useCurrency } from '../hooks/useCurrency';

interface ProductCardProps {
  product: Product;
  prices: Price[];
  onCompare?: () => void;
  onAddToList?: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = memo(({ 
  product, 
  prices, 
  onCompare, 
  onAddToList 
}) => {
  const { t } = useLanguage();
  const { formatCurrency } = useCurrency();
  
  const sortedPrices = [...prices].sort((a, b) => a.price - b.price);
  const bestPrice = sortedPrices[0];
  const worstPrice = sortedPrices[sortedPrices.length - 1];
  const savings = worstPrice ? worstPrice.price - bestPrice.price : 0;

  const getStockColor = (availability: string) => {
    switch (availability) {
      case 'in-stock': return 'text-green-600';
      case 'low-stock': return 'text-orange-600';
      case 'out-of-stock': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStockText = (availability: string) => {
    switch (availability) {
      case 'in-stock': return 'In Stock';
      case 'low-stock': return 'Low Stock';
      case 'out-of-stock': return t('product.out_of_stock');
      default: return 'Unknown';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-gray-100">
      <div className="relative">
        <img 
          src={product.image} 
          alt={product.name}
          loading="lazy"
          className="w-full h-48 object-cover"
        />
        {bestPrice?.onSale && (
          <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
            {t('product.on_sale')}
          </div>
        )}
        {savings > 0 && (
          <div className="absolute top-3 right-3 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold">
            {t('product.save_amount')} {formatCurrency(savings)}
          </div>
        )}
      </div>
      
      <div className="p-4">
        <div className="mb-3">
          <h3 className="font-semibold text-gray-900 text-lg leading-tight">{product.name}</h3>
          <p className="text-gray-600 text-sm">{product.brand} • {product.unitSize}</p>
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">{t('product.best_price')}</span>
            <div className="flex items-center space-x-1 group relative">
              <TrendingDown className="h-4 w-4 text-green-600" />
              <span className="text-green-600 text-sm font-medium">{formatCurrency(savings)} saved</span>
              <HelpCircle className="h-3 w-3 text-gray-400 ml-1" />
              
              {/* Savings Calculation Tooltip */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                Difference between highest ({formatCurrency(worstPrice?.price || 0)}) and lowest price
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
              </div>
            </div>
          </div>
          
          {bestPrice && (
            <div className="flex items-center justify-between bg-green-50 rounded-lg p-3">
              <div className="flex items-center space-x-3">
                <img 
                  src={bestPrice.retailer.logo}
                  alt={bestPrice.retailer.name}
                  loading="lazy"
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div>
                  <p className="font-semibold text-gray-900">
                    {formatCurrency(bestPrice.price)}
                    {bestPrice.originalPrice && (
                      <span className="ml-2 text-sm text-gray-500 line-through">
                        {formatCurrency(bestPrice.originalPrice)}
                      </span>
                    )}
                  </p>
                  <p className="text-sm text-gray-600">{bestPrice.retailer.name}</p>
                </div>
              </div>
              <span className={`text-xs font-medium ${getStockColor(bestPrice.availability)}`}>
                {getStockText(bestPrice.availability)}
              </span>
            </div>
          )}
        </div>

        {/* Mobile-optimized buttons with minimum 44px touch targets */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <button
            onClick={onCompare}
            className="flex items-center justify-center space-x-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium py-3 px-3 rounded-lg transition-colors min-h-[44px]"
          >
            <TrendingUp className="h-4 w-4" />
            <span className="text-sm">{t('product.compare_prices')}</span>
          </button>
          
          <button
            onClick={onAddToList}
            className="flex items-center justify-center space-x-2 bg-green-50 hover:bg-green-100 text-green-700 font-medium py-3 px-3 rounded-lg transition-colors min-h-[44px]"
          >
            <ShoppingCart className="h-4 w-4" />
            <span className="text-sm">{t('product.add_to_list')}</span>
          </button>
        </div>

        {prices.length > 1 && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-500 mb-2">
              Price range: {formatCurrency(bestPrice.price)} - {formatCurrency(worstPrice.price)} across {prices.length} stores
            </p>
            <div className="flex space-x-1">
              {prices.slice(0, 5).map((price, index) => (
                <div 
                  key={price.id}
                  className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                  style={{ backgroundColor: price.retailer.color }}
                  title={`${price.retailer.name}: ${formatCurrency(price.price)}`}
                />
              ))}
              {prices.length > 5 && (
                <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-xs text-gray-600">
                  +{prices.length - 5}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

ProductCard.displayName = 'ProductCard';