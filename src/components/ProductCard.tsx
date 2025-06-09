import React from 'react';
import { ShoppingCart, TrendingDown, TrendingUp, MapPin, Clock } from 'lucide-react';
import { Product, Price } from '../types';
import { useLanguage } from '../hooks/useLanguage';

interface ProductCardProps {
  product: Product;
  prices: Price[];
  onCompare?: () => void;
  onAddToList?: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  prices, 
  onCompare, 
  onAddToList 
}) => {
  const { t } = useLanguage();
  
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
          className="w-full h-48 object-cover"
        />
        {bestPrice?.onSale && (
          <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
            {t('product.on_sale')}
          </div>
        )}
        {savings > 0 && (
          <div className="absolute top-3 right-3 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold">
            {t('product.save_amount')} R{savings.toFixed(2)}
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
            <div className="flex items-center space-x-1">
              <TrendingDown className="h-4 w-4 text-green-600" />
              <span className="text-green-600 text-sm font-medium">R{savings.toFixed(2)} saved</span>
            </div>
          </div>
          
          {bestPrice && (
            <div className="flex items-center justify-between bg-green-50 rounded-lg p-3">
              <div className="flex items-center space-x-3">
                <img 
                  src={bestPrice.retailer.logo}
                  alt={bestPrice.retailer.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div>
                  <p className="font-semibold text-gray-900">
                    R{bestPrice.price.toFixed(2)}
                    {bestPrice.originalPrice && (
                      <span className="ml-2 text-sm text-gray-500 line-through">
                        R{bestPrice.originalPrice.toFixed(2)}
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

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onCompare}
            className="flex items-center justify-center space-x-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium py-2 px-3 rounded-lg transition-colors"
          >
            <TrendingUp className="h-4 w-4" />
            <span className="text-sm">{t('product.compare_prices')}</span>
          </button>
          
          <button
            onClick={onAddToList}
            className="flex items-center justify-center space-x-2 bg-green-50 hover:bg-green-100 text-green-700 font-medium py-2 px-3 rounded-lg transition-colors"
          >
            <ShoppingCart className="h-4 w-4" />
            <span className="text-sm">{t('product.add_to_list')}</span>
          </button>
        </div>

        {prices.length > 1 && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
              <span>Price range: R{bestPrice.price.toFixed(2)} - R{worstPrice.price.toFixed(2)}</span>
              <span>{prices.length} stores compared</span>
            </div>
            <div className="flex space-x-1">
              {prices.slice(0, 5).map((price, index) => (
                <div 
                  key={price.id}
                  className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                  style={{ backgroundColor: price.retailer.color }}
                  title={`${price.retailer.name}: R${price.price.toFixed(2)}`}
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
};