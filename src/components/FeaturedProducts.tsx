import React from 'react';
import { ChevronRight } from 'lucide-react';
import { ProductGrid } from './ProductGrid';
import { Product } from '../types';

interface FeaturedProductsProps {
  title: string;
  products: Product[];
  viewAllLink?: string;
  onProductSelect?: (productInfo: { id: string; name: string }) => void;
  onAddToList?: (product: Product) => void;
}

export const FeaturedProducts: React.FC<FeaturedProductsProps> = ({
  title,
  products,
  viewAllLink,
  onProductSelect,
  onAddToList
}) => {
  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">{title}</h2>
        {viewAllLink && (
          <a 
            href={viewAllLink} 
            className="flex items-center text-sm font-medium text-green-600 hover:text-green-700"
          >
            View All
            <ChevronRight className="h-4 w-4 ml-1" />
          </a>
        )}
      </div>
      
      <ProductGrid 
        products={products}
        onProductSelect={onProductSelect}
        onAddToList={onAddToList}
      />
    </section>
  );
};