import React from 'react';
import { ShoppingCart, TrendingDown, Tag } from 'lucide-react';
import { FeaturedProducts } from './FeaturedProducts';
import { useProducts } from '../hooks/useProducts';
import { Product } from '../types';

interface LandingPageProps {
  onProductSelect?: (productInfo: { id: string; name: string }) => void;
  onAddToList?: (product: Product) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onProductSelect,
  onAddToList
}) => {
  const { products, loading, error } = useProducts();

  // Get featured products (first 10)
  const featuredProducts = products.slice(0, 10);
  
  // Get products on sale (simulated)
  const onSaleProducts = products
    .filter((_, index) => index % 3 === 0) // Every 3rd product is "on sale"
    .slice(0, 5);
  
  // Get popular products (simulated)
  const popularProducts = products
    .filter((_, index) => index % 2 === 0) // Every 2nd product is "popular"
    .slice(0, 5);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Products</h3>
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-600 via-orange-500 to-blue-600 rounded-2xl p-8 text-white mb-8">
        <div className="max-w-2xl">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Smart Grocery Shopping for South Africans</h1>
          <p className="text-lg mb-6">Compare prices across major retailers and save on your grocery shopping</p>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
              <ShoppingCart className="h-5 w-5 mr-2" />
              <span>Create shopping lists</span>
            </div>
            <div className="flex items-center bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
              <TrendingDown className="h-5 w-5 mr-2" />
              <span>Compare prices</span>
            </div>
            <div className="flex items-center bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
              <Tag className="h-5 w-5 mr-2" />
              <span>Find the best deals</span>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Products */}
      <FeaturedProducts
        title="Top Picks by our Shoppers"
        products={featuredProducts}
        viewAllLink="#"
        onProductSelect={onProductSelect}
        onAddToList={onAddToList}
      />

      {/* Products on Sale */}
      <FeaturedProducts
        title="Special Deals"
        products={onSaleProducts}
        viewAllLink="#"
        onProductSelect={onProductSelect}
        onAddToList={onAddToList}
      />

      {/* Popular Products */}
      <FeaturedProducts
        title="Popular Items"
        products={popularProducts}
        viewAllLink="#"
        onProductSelect={onProductSelect}
        onAddToList={onAddToList}
      />
    </div>
  );
};