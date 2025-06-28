import React from 'react';
import { ProductCard } from './ProductCard';
import { Product } from '../types';

interface ProductGridProps {
  products: Product[];
  onProductSelect?: (productInfo: { id: string; name: string }) => void;
  onAddToList?: (product: Product) => void;
  emptyMessage?: string;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  onProductSelect,
  onAddToList,
  emptyMessage = 'No products found'
}) => {
  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onCompare={() => onProductSelect?.({ id: product.id, name: product.name })}
          onAddToList={() => onAddToList?.(product)}
        />
      ))}
    </div>
  );
};