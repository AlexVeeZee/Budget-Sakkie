import React, { useState } from 'react';
import { Tag, Clock, MapPin, Filter, TrendingDown, Percent, Star } from 'lucide-react';
import { deals, products, retailers, getFeaturedDeals } from '../../data/mockData';
import { useLanguage } from '../../hooks/useLanguage';

export const DealsTab: React.FC = () => {
  const { t } = useLanguage();
  const [filter, setFilter] = useState('all');

  const filterOptions = [
    { id: 'all', label: 'All Deals' },
    { id: 'percentage', label: 'Percentage Off' },
    { id: 'fixed', label: 'Fixed Amount' },
    { id: 'expiring', label: 'Expiring Soon' },
    { id: 'highest-savings', label: 'Highest Savings' },
  ];

  // Get real deals from extracted data
  const realDeals = getFeaturedDeals();

  const featuredDeals = [
    {
      id: 'weekend-special',
      title: 'Weekend Grocery Special',
      description: 'Save up to R30 on selected items',
      retailer: retailers[1],
      discount: 'Up to R30',
      validUntil: '2024-01-21T23:59:59Z',
      image: 'https://images.pexels.com/photos/264547/pexels-photo-264547.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop',
      totalSavings: realDeals.reduce((sum, deal) => sum + deal.savings, 0)
    },
    {
      id: 'family-pack',
      title: 'Family Pack Savings',
      description: 'Best prices across all major retailers',
      retailer: retailers[0],
      discount: 'R' + Math.max(...realDeals.map(d => d.savings)).toFixed(2),
      validUntil: '2024-01-19T23:59:59Z',
      image: 'https://images.pexels.com/photos/3962285/pexels-photo-3962285.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop',
      totalSavings: realDeals.slice(0, 5).reduce((sum, deal) => sum + deal.savings, 0)
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
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{t('deals.hot_deals')}</h2>
          <p className="text-gray-600">Real savings from live price comparisons</p>
        </div>
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

      {/* Real Product Deals from Extracted Data */}
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Live Price Comparisons</h3>
        <div className="space-y-4">
          {realDeals.slice(0, 8).map((deal) => (
            <div key={deal.product.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              <div className="flex items-center p-6">
                <div className="relative mr-4">
                  <img 
                    src={deal.product.image}
                    alt={deal.product.name}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-1">
                    <Star className="h-4 w-4" />
                  </div>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-900 text-lg">{deal.product.name}</h4>
                      <p className="text-gray-600">{deal.product.brand} • {deal.product.unitSize}</p>
                      <div className="flex items-center space-x-2 mt-2">
                        <div className="flex items-center space-x-1 text-green-600">
                          <TrendingDown className="h-4 w-4" />
                          <span className="font-bold">Save R{deal.savings.toFixed(2)}</span>
                        </div>
                        <span className="text-gray-500">vs highest price</span>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="flex items-center space-x-3 mb-2">
                        <img 
                          src={deal.bestPrice.retailer.logo}
                          alt={deal.bestPrice.retailer.name}
                          className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
                        />
                        <div>
                          <p className="font-bold text-gray-900">{deal.bestPrice.retailer.name}</p>
                          <p className="text-sm text-gray-600">Best Price</p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-2xl font-bold text-green-600">
                          R{deal.bestPrice.price.toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-500">
                          vs R{Math.max(...deal.allPrices.map(p => p.price)).toFixed(2)} elsewhere
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-4 w-4" />
                        <span>{deal.bestPrice.retailer.locations[0]?.distance}km away</span>
                      </div>
                      <span className="text-gray-500">• Updated today</span>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button className="bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium px-3 py-1 rounded-lg transition-colors text-sm">
                        Compare All ({deal.allPrices.length})
                      </button>
                      <button className="bg-green-50 hover:bg-green-100 text-green-700 font-medium px-3 py-1 rounded-lg transition-colors text-sm">
                        Add to List
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Traditional Deals */}
      <div className="mt-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Store Promotions</h3>
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

      {/* Summary Stats */}
      <div className="mt-8 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border border-green-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-3xl font-bold text-green-600">
              R{realDeals.reduce((sum, deal) => sum + deal.savings, 0).toFixed(2)}
            </p>
            <p className="text-gray-600">Total Savings Available</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-blue-600">{realDeals.length}</p>
            <p className="text-gray-600">Products with Savings</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-orange-600">
              R{Math.max(...realDeals.map(d => d.savings)).toFixed(2)}
            </p>
            <p className="text-gray-600">Biggest Single Saving</p>
          </div>
        </div>
      </div>
    </div>
  );
};