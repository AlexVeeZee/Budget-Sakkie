import React from 'react';
import { ShoppingCart, TrendingDown, MapPin, Package } from 'lucide-react';
import { ProductWithCategory } from '../types/database';
import { useLanguage } from '../hooks/useLanguage';

interface ProductCardProps {
  product: ProductWithCategory;
  onCompare?: () => void;
  onAddToList?: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  onCompare, 
  onAddToList 
}) => {
  const { t } = useLanguage();

  const getStockStatus = (quantity: number | null) => {
    if (!quantity || quantity === 0) return { text: 'Out of Stock', color: 'text-red-600' };
    if (quantity < 10) return { text: 'Low Stock', color: 'text-orange-600' };
    return { text: 'In Stock', color: 'text-green-600' };
  };

  const stockStatus = getStockStatus(product.stock_quantity);

  const formatPrice = (price: number, currency: string = 'ZAR') => {
    return `R${price.toFixed(2)}`;
  };

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

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-gray-100">
      <div className="relative">
        <img 
          src={product.image_url || 'https://images.pexels.com/photos/264547/pexels-photo-264547.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop'} 
          alt={product.name}
          className="w-full h-48 object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = 'https://images.pexels.com/photos/264547/pexels-photo-264547.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop';
          }}
        />
        <div className="absolute top-3 right-3 bg-white bg-opacity-90 backdrop-blur-sm rounded-full px-2 py-1">
          <span className="text-xs font-medium text-gray-700">
            {getStoreDisplayName(product.store_id)}
          </span>
        </div>
      </div>
      
      <div className="p-4">
        <div className="mb-3">
          <h3 className="font-semibold text-gray-900 text-lg leading-tight">{product.name}</h3>
          <div className="flex items-center justify-between mt-1">
            <p className="text-gray-600 text-sm">
              {product.categories?.name || 'Uncategorized'}
            </p>
            <span className={`text-xs font-medium ${stockStatus.color}`}>
              {stockStatus.text}
            </span>
          </div>
          {product.description && (
            <p className="text-gray-500 text-sm mt-1 line-clamp-2">{product.description}</p>
          )}
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between bg-green-50 rounded-lg p-3">
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {formatPrice(product.price, product.currency)}
              </p>
              {product.sku && (
                <p className="text-xs text-gray-500">SKU: {product.sku}</p>
              )}
            </div>
            <div className="text-right">
              <div className="flex items-center space-x-1 text-sm text-gray-600">
                <Package className="h-4 w-4" />
                <span>{product.stock_quantity || 0} in stock</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onCompare}
            className="flex items-center justify-center space-x-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium py-2 px-3 rounded-lg transition-colors"
          >
            <TrendingDown className="h-4 w-4" />
            <span className="text-sm">{t('product.compare_prices')}</span>
          </button>
          
          <button
            onClick={onAddToList}
            disabled={!product.stock_quantity || product.stock_quantity === 0}
            className="flex items-center justify-center space-x-2 bg-green-50 hover:bg-green-100 text-green-700 font-medium py-2 px-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ShoppingCart className="h-4 w-4" />
            <span className="text-sm">{t('product.add_to_list')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};