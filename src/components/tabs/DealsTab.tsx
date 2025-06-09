import React, { useState } from 'react';
import { Tag, Clock, MapPin, Filter, TrendingDown, Percent } from 'lucide-react';
import { deals, products, retailers } from '../../data/mockData';
import { useLanguage } from '../../hooks/useLanguage';

export const DealsTab: React.FC = () => {
  const { t } = useLanguage();
  const [filter, setFilter] = useState('all');

  const filterOptions = [
    { id: 'all', label: 'All Deals' },
    { id: 'percentage', label: 'Percentage Off' },
    { id: 'fixed', label: 'Fixed Amount' },
    { id: 'expiring', label: 'Expiring Soon' },
  ];

  const featuredDeals = [
    {
      id: 'weekend-special',
      title: 'Weekend Grocery Special',
      description: 'Save up to 25% on selected items',
      retailer: retailers[1],
      discount: '25%',
      validUntil: '2024-01-21T23:59:59Z',
      image: 'https://images.pexels.com/photos/264547/pexels-photo-264547.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop'
    },
    {
      id: 'family-pack',
      title: 'Family Pack Savings',
      description: 'Buy 2 get 1 free on family essentials',
      retailer: retailers[0],
      discount: '33%',
      validUntil: '2024-01-19T23:59:59Z',
      image: 'https://images.pexels.com/photos/3962285/pexels-photo-3962285.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop'
    }
  ];

  const getTimeRemaining = (validUntil: string) => {
    const now = new Date();
    const end = new Date(validUntil);
    const diff = end.getTime() - now.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    return `${hours}h`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">{t('deals.hot_deals')}</h2>
        <button className="flex items-center space-x-2 text-gray-600 hover:text-gray-900">
          <Filter className="h-5 w-5" />
          <span>Filter</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-2 mb-6 overflow-x-auto">
        {filterOptions.map((option) => (
          <button
            key={option.id}
            onClick={() => setFilter(option.id)}
            className={`whitespace-nowrap px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === option.id
                ? 'bg-green-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* Featured Deals */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Featured Deals</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {featuredDeals.map((deal) => (
            <div key={deal.id} className="bg-gradient-to-r from-orange-500 to-red-600 rounded-xl overflow-hidden text-white relative">
              <div className="absolute inset-0 bg-black bg-opacity-20" />
              <img 
                src={deal.image}
                alt={deal.title}
                className="absolute inset-0 w-full h-full object-cover mix-blend-overlay"
              />
              <div className="relative p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <img 
                      src={deal.retailer.logo}
                      alt={deal.retailer.name}
                      className="w-8 h-8 rounded-full border-2 border-white"
                    />
                    <span className="font-semibold">{deal.retailer.name}</span>
                  </div>
                  <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-full px-3 py-1">
                    <span className="font-bold">{deal.discount} OFF</span>
                  </div>
                </div>
                <h4 className="text-xl font-bold mb-2">{deal.title}</h4>
                <p className="text-white text-opacity-90 mb-4">{deal.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1 text-sm">
                    <Clock className="h-4 w-4" />
                    <span>{t('deals.expires_in')} {getTimeRemaining(deal.validUntil)}</span>
                  </div>
                  <button className="bg-white text-gray-900 font-semibold px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors">
                    View Deal
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Product Deals */}
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Product Deals</h3>
        <div className="space-y-4">
          {deals.map((deal) => {
            const product = products.find(p => p.id === deal.productId);
            if (!product) return null;

            return (
              <div key={deal.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                <div className="flex items-center p-4">
                  <div className="relative mr-4">
                    <img 
                      src={product.image}
                      alt={product.name}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    <div className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1">
                      <Tag className="h-4 w-4" />
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold text-gray-900 text-lg">{product.name}</h4>
                        <p className="text-gray-600">{product.brand} • {product.unitSize}</p>
                        <p className="text-green-600 font-medium mt-1">{deal.description}</p>
                      </div>
                      
                      <div className="text-right">
                        <div className="flex items-center space-x-2 mb-2">
                          <img 
                            src={deal.retailer.logo}
                            alt={deal.retailer.name}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                          <span className="font-semibold text-gray-900">{deal.retailer.name}</span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {deal.type === 'percentage' ? (
                            <div className="flex items-center space-x-1 bg-red-100 text-red-800 px-2 py-1 rounded-full">
                              <Percent className="h-4 w-4" />
                              <span className="font-bold">{deal.discount}% OFF</span>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-1 bg-green-100 text-green-800 px-2 py-1 rounded-full">
                              <TrendingDown className="h-4 w-4" />
                              <span className="font-bold">R{deal.discount} OFF</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>{t('deals.expires_in')} {getTimeRemaining(deal.validUntil)}</span>
                        </div>
                        {deal.conditions && (
                          <span className="text-gray-500">• {deal.conditions}</span>
                        )}
                      </div>
                      
                      <div className="flex space-x-2">
                        <button className="bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium px-3 py-1 rounded-lg transition-colors text-sm">
                          View Store
                        </button>
                        <button className="bg-green-50 hover:bg-green-100 text-green-700 font-medium px-3 py-1 rounded-lg transition-colors text-sm">
                          Add to List
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* More Deals Coming Soon */}
      <div className="mt-8 text-center py-8 bg-gray-50 rounded-xl">
        <Tag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">More Deals Coming Soon!</h3>
        <p className="text-gray-600">We're working with retailers to bring you even more savings.</p>
      </div>
    </div>
  );
};