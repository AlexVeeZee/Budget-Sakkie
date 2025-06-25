import React, { useState, useEffect } from 'react';
import { 
  X, 
  ShoppingCart, 
  Share2, 
  Bookmark, 
  BookmarkCheck, 
  MapPin, 
  Clock, 
  Star, 
  TrendingDown, 
  Percent, 
  DollarSign,
  Eye,
  Heart,
  Info,
  Tag,
  Store,
  Calendar,
  AlertCircle,
  CheckCircle,
  Package,
  Truck
} from 'lucide-react';
import { Product, Deal, Price } from '../../types';
import { useCurrency } from '../../hooks/useCurrency';
import { prices } from '../../data/mockData';

interface ProductDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  deal: Deal;
  isBookmarked: boolean;
  onBookmarkToggle: () => void;
  onAddToList: () => void;
  onShare: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  isOpen,
  onClose,
  product,
  deal,
  isBookmarked,
  onBookmarkToggle,
  onAddToList,
  onShare
}) => {
  const { formatCurrency } = useCurrency();
  const [selectedTab, setSelectedTab] = useState<'overview' | 'prices' | 'details'>('overview');
  const [quantity, setQuantity] = useState(1);

  // Get all prices for this product
  const productPrices = prices.filter(price => price.productId === product.id);
  const sortedPrices = [...productPrices].sort((a, b) => a.price - b.price);
  const bestPrice = sortedPrices[0];
  const worstPrice = sortedPrices[sortedPrices.length - 1];
  const savings = worstPrice ? worstPrice.price - bestPrice.price : 0;

  // Calculate time remaining for deal
  const getTimeRemaining = (validUntil: string) => {
    const now = new Date();
    const end = new Date(validUntil);
    const diff = end.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expired';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const isExpiringSoon = (validUntil: string) => {
    const now = new Date();
    const end = new Date(validUntil);
    const diff = end.getTime() - now.getTime();
    const hoursRemaining = diff / (1000 * 60 * 60);
    return hoursRemaining <= 24 && hoursRemaining > 0;
  };

  const timeRemaining = getTimeRemaining(deal.validUntil);
  const expiringSoon = isExpiringSoon(deal.validUntil);
  const expired = timeRemaining === 'Expired';

  // Reset tab when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedTab('overview');
      setQuantity(1);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-green-600 via-orange-500 to-blue-600 text-white">
          <div className="flex items-center space-x-4">
            <img 
              src={deal.retailer.logo}
              alt={deal.retailer.name}
              className="w-12 h-12 rounded-full border-2 border-white shadow-sm"
            />
            <div>
              <h2 className="text-xl font-bold">{product.name}</h2>
              <p className="text-white/80">{deal.retailer.name} • {product.brand}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={onBookmarkToggle}
              className={`p-2 rounded-lg transition-colors ${
                isBookmarked 
                  ? 'bg-yellow-500 text-white hover:bg-yellow-600' 
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              {isBookmarked ? <BookmarkCheck className="h-5 w-5" /> : <Bookmark className="h-5 w-5" />}
            </button>
            
            <button
              onClick={onShare}
              className="p-2 bg-white/20 text-white hover:bg-white/30 rounded-lg transition-colors"
            >
              <Share2 className="h-5 w-5" />
            </button>
            
            <button 
              onClick={onClose}
              className="p-2 bg-white/20 text-white hover:bg-white/30 rounded-lg transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row">
          {/* Left Side - Product Image and Quick Info */}
          <div className="lg:w-1/2 p-6 border-r border-gray-200">
            <div className="relative mb-6">
              <img 
                src={product.image}
                alt={product.name}
                className="w-full h-64 object-cover rounded-xl shadow-lg"
              />
              
              {/* Deal Badge */}
              <div className="absolute top-4 left-4">
                {deal.type === 'percentage' ? (
                  <div className="flex items-center space-x-1 bg-red-500 text-white px-3 py-2 rounded-full shadow-lg">
                    <Percent className="h-4 w-4" />
                    <span className="font-bold">{deal.discount}% OFF</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-1 bg-green-500 text-white px-3 py-2 rounded-full shadow-lg">
                    <DollarSign className="h-4 w-4" />
                    <span className="font-bold">{formatCurrency(Number(deal.discount))} OFF</span>
                  </div>
                )}
              </div>

              {/* Expiry Warning */}
              {expiringSoon && !expired && (
                <div className="absolute top-4 right-4 bg-orange-500 text-white px-3 py-2 rounded-full shadow-lg animate-pulse">
                  <span className="font-bold text-sm">EXPIRING SOON</span>
                </div>
              )}

              {expired && (
                <div className="absolute inset-0 bg-gray-900 bg-opacity-75 rounded-xl flex items-center justify-center">
                  <div className="text-center text-white">
                    <AlertCircle className="h-12 w-12 mx-auto mb-2" />
                    <span className="text-xl font-bold">EXPIRED</span>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Product Info */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Product Details</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Brand:</span>
                    <span className="ml-2 font-medium">{product.brand}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Category:</span>
                    <span className="ml-2 font-medium">{product.category}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Size:</span>
                    <span className="ml-2 font-medium">{product.unitSize}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Unit:</span>
                    <span className="ml-2 font-medium">{product.unit}</span>
                  </div>
                </div>
              </div>

              {/* Deal Information */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-900 mb-2 flex items-center">
                  <Tag className="h-4 w-4 mr-2" />
                  Deal Information
                </h4>
                <p className="text-green-800 text-sm mb-2">{deal.description}</p>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4 text-green-600" />
                    <span className={`${expiringSoon ? 'text-orange-600 font-medium' : 'text-green-600'}`}>
                      {expired ? 'Expired' : `${timeRemaining} remaining`}
                    </span>
                  </div>
                  {deal.conditions && (
                    <span className="text-green-700">{deal.conditions}</span>
                  )}
                </div>
              </div>

              {/* Store Information */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2 flex items-center">
                  <Store className="h-4 w-4 mr-2" />
                  Store Information
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-blue-800">Location:</span>
                    <span className="text-blue-900 font-medium">{deal.retailer.locations[0]?.name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-blue-800">Distance:</span>
                    <span className="text-blue-900 font-medium">{deal.retailer.locations[0]?.distance}km away</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-blue-800">Hours:</span>
                    <span className="text-blue-900 font-medium">{deal.retailer.locations[0]?.openingHours}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Tabs and Details */}
          <div className="lg:w-1/2 flex flex-col">
            {/* Tabs */}
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setSelectedTab('overview')}
                className={`flex-1 px-6 py-3 font-medium transition-colors ${
                  selectedTab === 'overview'
                    ? 'text-green-600 border-b-2 border-green-600 bg-green-50'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setSelectedTab('prices')}
                className={`flex-1 px-6 py-3 font-medium transition-colors ${
                  selectedTab === 'prices'
                    ? 'text-green-600 border-b-2 border-green-600 bg-green-50'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Price Comparison
              </button>
              <button
                onClick={() => setSelectedTab('details')}
                className={`flex-1 px-6 py-3 font-medium transition-colors ${
                  selectedTab === 'details'
                    ? 'text-green-600 border-b-2 border-green-600 bg-green-50'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Details
              </button>
            </div>

            {/* Tab Content */}
            <div className="flex-1 p-6 overflow-y-auto">
              {selectedTab === 'overview' && (
                <div className="space-y-6">
                  {/* Price Summary */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Price Summary</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-gray-600">Deal Price at {deal.retailer.name}:</span>
                        <span className="text-2xl font-bold text-green-600">
                          {formatCurrency(bestPrice?.price || 0)}
                        </span>
                      </div>
                      
                      {savings > 0 && (
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-gray-600">You save vs highest price:</span>
                          <span className="text-lg font-semibold text-green-600">
                            {formatCurrency(savings)}
                          </span>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>Price range across {productPrices.length} stores:</span>
                        <span>{formatCurrency(bestPrice?.price || 0)} - {formatCurrency(worstPrice?.price || 0)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Quantity Selector */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Quantity</h3>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center border border-gray-300 rounded-lg">
                        <button
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          className="px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                        >
                          -
                        </button>
                        <span className="px-4 py-2 font-medium">{quantity}</span>
                        <button
                          onClick={() => setQuantity(quantity + 1)}
                          className="px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                        >
                          +
                        </button>
                      </div>
                      <span className="text-gray-600">× {product.unitSize}</span>
                    </div>
                    
                    <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-blue-800">Total for {quantity} {quantity === 1 ? 'item' : 'items'}:</span>
                        <span className="text-xl font-bold text-blue-900">
                          {formatCurrency((bestPrice?.price || 0) * quantity)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Availability */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Availability</h3>
                    <div className="space-y-2">
                      {productPrices.map((price) => (
                        <div key={price.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <img 
                              src={price.retailer.logo}
                              alt={price.retailer.name}
                              className="w-8 h-8 rounded-full"
                            />
                            <span className="font-medium">{price.retailer.name}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              price.availability === 'in-stock' ? 'bg-green-100 text-green-800' :
                              price.availability === 'low-stock' ? 'bg-orange-100 text-orange-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {price.availability === 'in-stock' ? 'In Stock' :
                               price.availability === 'low-stock' ? 'Low Stock' : 'Out of Stock'}
                            </span>
                            <span className="font-medium">{formatCurrency(price.price)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {selectedTab === 'prices' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900">Price Comparison Across Stores</h3>
                  
                  <div className="space-y-3">
                    {sortedPrices.map((price, index) => (
                      <div 
                        key={price.id}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          index === 0 
                            ? 'border-green-500 bg-green-50' 
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="relative">
                              <img 
                                src={price.retailer.logo}
                                alt={price.retailer.name}
                                className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                              />
                              {index === 0 && (
                                <div className="absolute -top-1 -right-1 bg-green-500 text-white rounded-full p-1">
                                  <Star className="h-3 w-3" />
                                </div>
                              )}
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900">{price.retailer.name}</h4>
                              <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <MapPin className="h-3 w-3" />
                                <span>{price.retailer.locations[0]?.distance}km away</span>
                                <Clock className="h-3 w-3 ml-2" />
                                <span>{price.retailer.locations[0]?.openingHours}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <div className="flex items-center space-x-2">
                              <span className="text-2xl font-bold text-gray-900">
                                {formatCurrency(price.price)}
                              </span>
                              {price.onSale && price.originalPrice && (
                                <span className="text-sm text-gray-500 line-through">
                                  {formatCurrency(price.originalPrice)}
                                </span>
                              )}
                              {price.onSale && (
                                <span className="bg-red-100 text-red-800 text-xs font-semibold px-2 py-1 rounded">
                                  Sale
                                </span>
                              )}
                            </div>
                            <div className="flex items-center justify-end space-x-2 mt-1">
                              <span className={`text-sm font-medium ${
                                price.availability === 'in-stock' ? 'text-green-600' :
                                price.availability === 'low-stock' ? 'text-orange-600' : 'text-red-600'
                              }`}>
                                {price.availability === 'in-stock' ? 'In Stock' :
                                 price.availability === 'low-stock' ? 'Low Stock' : 'Out of Stock'}
                              </span>
                              {index === 0 && (
                                <span className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded">
                                  Best Price
                                </span>
                              )}
                            </div>
                            {index > 0 && (
                              <div className="text-xs text-red-600 mt-1">
                                +{formatCurrency(price.price - bestPrice.price)} more
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {savings > 0 && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <TrendingDown className="h-5 w-5 text-green-600" />
                        <span className="font-semibold text-green-900">Maximum Savings</span>
                      </div>
                      <p className="text-green-800">
                        You can save up to <span className="font-bold">{formatCurrency(savings)}</span> by choosing 
                        {' '}{bestPrice.retailer.name} over the most expensive option.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {selectedTab === 'details' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Information</h3>
                    <div className="grid grid-cols-1 gap-4">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-2">Basic Details</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Product Name:</span>
                            <span className="font-medium">{product.name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Brand:</span>
                            <span className="font-medium">{product.brand}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Category:</span>
                            <span className="font-medium">{product.category}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Unit Size:</span>
                            <span className="font-medium">{product.unitSize}</span>
                          </div>
                          {product.barcode && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Barcode:</span>
                              <span className="font-medium font-mono">{product.barcode}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-2">Deal Details</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Discount Type:</span>
                            <span className="font-medium capitalize">{deal.type}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Discount Amount:</span>
                            <span className="font-medium">
                              {deal.type === 'percentage' ? `${deal.discount}%` : formatCurrency(Number(deal.discount))}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Valid Until:</span>
                            <span className="font-medium">
                              {new Date(deal.validUntil).toLocaleDateString()} at {new Date(deal.validUntil).toLocaleTimeString()}
                            </span>
                          </div>
                          {deal.conditions && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Conditions:</span>
                              <span className="font-medium">{deal.conditions}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-2">Store Information</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Retailer:</span>
                            <span className="font-medium">{deal.retailer.name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Store:</span>
                            <span className="font-medium">{deal.retailer.locations[0]?.name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Address:</span>
                            <span className="font-medium">{deal.retailer.locations[0]?.address}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Distance:</span>
                            <span className="font-medium">{deal.retailer.locations[0]?.distance}km away</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Opening Hours:</span>
                            <span className="font-medium">{deal.retailer.locations[0]?.openingHours}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            {!expired && (
              <div className="p-6 border-t border-gray-200 bg-gray-50">
                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      onAddToList();
                      // Show success message
                      alert(`Added ${quantity} × ${product.name} to your shopping list!`);
                    }}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                  >
                    <ShoppingCart className="h-5 w-5" />
                    <span>Add {quantity > 1 ? `${quantity} ` : ''}to List</span>
                  </button>
                  
                  <button
                    onClick={onShare}
                    className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center"
                  >
                    <Share2 className="h-5 w-5" />
                  </button>
                </div>
                
                <div className="mt-3 text-center">
                  <p className="text-sm text-gray-600">
                    Total: <span className="font-bold text-gray-900">{formatCurrency((bestPrice?.price || 0) * quantity)}</span>
                    {quantity > 1 && (
                      <span className="text-gray-500"> ({formatCurrency(bestPrice?.price || 0)} each)</span>
                    )}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};