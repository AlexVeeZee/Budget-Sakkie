import React, { memo } from 'react';
import { ShoppingCart, TrendingDown, MapPin, Plus, Check } from 'lucide-react';
import { Product } from '../types';
import { useLanguage } from '../hooks/useLanguage';
import { useCurrency } from '../hooks/useCurrency';
import { useCart } from '../context/CartContext';

interface ProductCardProps {
  product: Product;
  onCompare?: () => void;
  onAddToList?: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = memo(({ 
  product, 
  onCompare, 
  onAddToList 
}) => {
  const { t } = useLanguage();
  const { formatCurrency } = useCurrency();
  const { addItem, isInCart } = useCart();
  
  const productInCart = isInCart(product.id);

  // Get store color based on brand or category
  const getStoreColor = (brand: string) => {
    const storeColors: { [key: string]: string } = {
      'Pick n Pay': '#E31837',
      'Shoprite': '#FF6B35',
      'Checkers': '#00A651',
      'Woolworths': '#00A86B',
      'SPAR': '#006B3F'
    };
    return storeColors[brand] || '#6B7280';
  };

  // Simulate if product is on sale (for demo purposes)
  const isOnSale = product.id.length % 2 === 0;
  const originalPrice = isOnSale ? product.price * 1.15 : undefined;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    addItem(product);
    
    if (onAddToList) {
      onAddToList();
    }
  };

  return (
    <div 
      className="group bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden cursor-pointer"
      onClick={onCompare}
    >
      {/* Product Image with Badges */}
      <div className="relative">
        <img 
          src={product.image} 
          alt={product.name}
          loading="lazy"
          className="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Store Badge - Top Left */}
        <div className="absolute top-2 left-2">
          <div 
            className="flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium text-white"
            style={{ backgroundColor: getStoreColor(product.brand) }}
          >
            <span>{product.brand.split(' ')[0]}</span>
          </div>
        </div>
        
        {/* Category Badge - Top Right */}
        <div className="absolute top-2 right-2">
          <span className="inline-block px-2 py-1 text-xs font-medium bg-white/80 backdrop-blur-sm text-gray-700 rounded-full">
            {product.category}
          </span>
        </div>
        
        {/* Sale Badge - Bottom Left (if on sale) */}
        {isOnSale && (
          <div className="absolute bottom-2 left-2">
            <span className="inline-block px-2 py-1 text-xs font-bold bg-red-500 text-white rounded-full">
              Sale
            </span>
          </div>
        )}
      </div>
      
      {/* Product Info */}
      <div className="p-3">
        {/* Price */}
        <div className="flex items-center space-x-2 mb-1">
          <span className="text-lg font-bold text-green-600">
            {formatCurrency(product.price || 0)}
          </span>
          {isOnSale && originalPrice && (
            <span className="text-sm text-gray-500 line-through">
              {formatCurrency(originalPrice)}
            </span>
          )}
        </div>
        
        {/* Product Name */}
        <h3 className="font-medium text-gray-900 text-sm line-clamp-2 min-h-[2.5rem] mb-2">
          {product.name}
        </h3>
        
        {/* Unit Size */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">
            {product.unitSize}
          </span>
          
          {/* Add to List Button */}
          <button
            onClick={handleAddToCart}
            className={`flex items-center justify-center w-8 h-8 rounded-full transition-colors ${
              productInCart 
                ? 'bg-green-600 text-white hover:bg-green-700' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            aria-label={productInCart ? 'Added to list' : 'Add to list'}
          >
            {productInCart ? (
              <Check className="h-4 w-4" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
});

ProductCard.displayName = 'ProductCard';