import React, { memo } from 'react';
import { ShoppingCart, Plus, Check } from 'lucide-react';
import { Product } from '../types';
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
  const { formatCurrency } = useCurrency();
  const { addItem, isInCart } = useCart();
  
  const productInCart = isInCart(product.id);

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
      className="group bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden cursor-pointer"
      onClick={onCompare}
    >
      {/* Product Image */}
      <div className="relative overflow-hidden">
        <img 
          src={product.image} 
          alt={product.name}
          loading="lazy"
          className="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Category Badge */}
        <div className="absolute top-3 left-3">
          <span className="inline-block px-2 py-1 text-xs font-medium bg-white/80 backdrop-blur-sm text-gray-700 rounded-full">
            {product.category}
          </span>
        </div>
      </div>
      
      {/* Product Info */}
      <div className="p-4">
        <h3 className="font-medium text-gray-900 text-base mb-1 line-clamp-2 group-hover:text-green-600 transition-colors">
          {product.name}
        </h3>
        
        <div className="flex items-center justify-between mt-2">
          <span className="text-lg font-bold text-green-600">
            {formatCurrency(product.price || 0)}
          </span>
          
          <button
            onClick={handleAddToCart}
            className={`flex items-center justify-center w-10 h-10 rounded-full transition-colors ${
              productInCart 
                ? 'bg-green-600 text-white hover:bg-green-700' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            aria-label={productInCart ? 'Added to list' : 'Add to list'}
          >
            {productInCart ? (
              <Check className="h-5 w-5" />
            ) : (
              <Plus className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
});

ProductCard.displayName = 'ProductCard';