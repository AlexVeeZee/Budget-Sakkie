import React, { useState } from 'react';
import { X, ShoppingCart, Package, TrendingDown, Clock, MapPin, AlertCircle, CheckCircle, Plus, Minus, Star, Info } from 'lucide-react';
import { useCurrency } from '../../hooks/useCurrency';
import { AddToListModal } from './AddToListModal';

interface BundleItem {
  product: {
    id: string;
    name: string;
    brand: string;
    category: string;
    image: string;
    unit: string;
    unitSize: string;
  };
  quantity: number;
  originalPrice: number;
  discountedPrice: number;
}

interface BundleDeal {
  id: string;
  productId: string;
  retailer: {
    id: string;
    name: string;
    logo: string;
    color: string;
    locations: Array<{
      id: string;
      name: string;
      address: string;
      distance: number;
      coordinates: [number, number];
      openingHours: string;
    }>;
  };
  discount: number;
  type: 'percentage' | 'fixed';
  description: string;
  validUntil: string;
  conditions?: string;
  bundleItems: BundleItem[];
  totalOriginalPrice: number;
  totalDiscountedPrice: number;
  totalSavings: number;
  termsAndConditions: string[];
}

interface DealDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  deal: BundleDeal;
}

export const DealDetailModal: React.FC<DealDetailModalProps> = ({
  isOpen,
  onClose,
  deal
}) => {
  const { formatCurrency } = useCurrency();
  const [selectedItems, setSelectedItems] = useState<{[key: string]: number}>(() => {
    // Initialize with all bundle items
    const initial: {[key: string]: number} = {};
    deal.bundleItems.forEach(item => {
      initial[item.product.id] = item.quantity;
    });
    return initial;
  });
  const [showAddToListModal, setShowAddToListModal] = useState(false);

  if (!isOpen) return null;

  const isExpired = new Date(deal.validUntil) < new Date();
  const isExpiringSoon = () => {
    const now = new Date();
    const end = new Date(deal.validUntil);
    const diff = end.getTime() - now.getTime();
    const hoursRemaining = diff / (1000 * 60 * 60);
    return hoursRemaining <= 24 && hoursRemaining > 0;
  };

  const getTimeRemaining = () => {
    const now = new Date();
    const end = new Date(deal.validUntil);
    const diff = end.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expired';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h remaining`;
    if (hours > 0) return `${hours}h ${minutes}m remaining`;
    return `${minutes}m remaining`;
  };

  const updateItemQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity < 0) return;
    setSelectedItems(prev => ({
      ...prev,
      [productId]: newQuantity
    }));
  };

  const calculateCustomTotal = () => {
    let originalTotal = 0;
    let discountedTotal = 0;
    
    deal.bundleItems.forEach(item => {
      const selectedQty = selectedItems[item.product.id] || 0;
      const pricePerUnit = item.originalPrice / item.quantity;
      const discountedPricePerUnit = item.discountedPrice / item.quantity;
      
      originalTotal += pricePerUnit * selectedQty;
      discountedTotal += discountedPricePerUnit * selectedQty;
    });
    
    return {
      original: originalTotal,
      discounted: discountedTotal,
      savings: originalTotal - discountedTotal
    };
  };

  const customTotal = calculateCustomTotal();
  const hasSelectedItems = Object.values(selectedItems).some(qty => qty > 0);

  const handleAddToList = () => {
    if (!hasSelectedItems) {
      alert('Please select at least one item to add to your list.');
      return;
    }
    setShowAddToListModal(true);
  };

  const getSelectedItemsForList = () => {
    return deal.bundleItems
      .filter(item => selectedItems[item.product.id] > 0)
      .map(item => ({
        product: item.product,
        quantity: selectedItems[item.product.id]
      }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div 
          className="flex items-center justify-between p-6 border-b border-gray-200"
          style={{ 
            background: `linear-gradient(135deg, ${deal.retailer.color}15 0%, ${deal.retailer.color}05 100%)`
          }}
        >
          <div className="flex items-center space-x-4">
            <img 
              src={deal.retailer.logo}
              alt={deal.retailer.name}
              className="w-12 h-12 rounded-full border-2 border-white shadow-sm"
            />
            <div>
              <h2 className="text-xl font-bold text-gray-900">{deal.description}</h2>
              <p className="text-gray-600">{deal.retailer.name} • {deal.discount}% OFF</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Status Badge */}
            {isExpired ? (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                <AlertCircle className="h-4 w-4 mr-2" />
                Expired
              </span>
            ) : isExpiringSoon() ? (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800 animate-pulse">
                <Clock className="h-4 w-4 mr-2" />
                Expiring Soon
              </span>
            ) : (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                <CheckCircle className="h-4 w-4 mr-2" />
                Active
              </span>
            )}
            
            <button 
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-6 w-6 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row max-h-[calc(90vh-120px)]">
          {/* Left Side - Bundle Items */}
          <div className="lg:w-2/3 p-6 overflow-y-auto">
            <div className="mb-6">
              <div className="flex items-center space-x-2 mb-4">
                <Package className="h-5 w-5 text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-900">Bundle Contents</h3>
                <span className="text-sm text-gray-500">({deal.bundleItems.length} items)</span>
              </div>
              
              <div className="space-y-4">
                {deal.bundleItems.map((item, index) => {
                  const selectedQty = selectedItems[item.product.id] || 0;
                  const pricePerUnit = item.discountedPrice / item.quantity;
                  const originalPricePerUnit = item.originalPrice / item.quantity;
                  
                  return (
                    <div 
                      key={index}
                      className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                    >
                      <img 
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{item.product.name}</h4>
                        <p className="text-sm text-gray-600">{item.product.brand} • {item.product.unitSize}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-sm font-medium text-green-600">
                            {formatCurrency(pricePerUnit)} each
                          </span>
                          <span className="text-sm text-gray-500 line-through">
                            {formatCurrency(originalPricePerUnit)}
                          </span>
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                            {Math.round(((originalPricePerUnit - pricePerUnit) / originalPricePerUnit) * 100)}% off
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => updateItemQuantity(item.product.id, selectedQty - 1)}
                            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                            disabled={selectedQty <= 0}
                          >
                            <Minus className="h-4 w-4 text-gray-600" />
                          </button>
                          <span className="w-8 text-center font-medium">{selectedQty}</span>
                          <button
                            onClick={() => updateItemQuantity(item.product.id, selectedQty + 1)}
                            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <Plus className="h-4 w-4 text-gray-600" />
                          </button>
                        </div>
                        
                        <div className="text-right min-w-[80px]">
                          <p className="font-bold text-gray-900">
                            {formatCurrency(pricePerUnit * selectedQty)}
                          </p>
                          <p className="text-xs text-gray-500">
                            Bundle: {item.quantity}x
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-3">
                <Info className="h-4 w-4 text-gray-600" />
                <h4 className="font-medium text-gray-900">Terms & Conditions</h4>
              </div>
              <ul className="space-y-1 text-sm text-gray-600">
                {deal.termsAndConditions.map((term, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <span className="text-gray-400 mt-1">•</span>
                    <span>{term}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right Side - Summary & Actions */}
          <div className="lg:w-1/3 border-l border-gray-200 p-6 bg-gray-50">
            <div className="space-y-6">
              {/* Deal Info */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Deal Summary</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Discount:</span>
                    <span className="font-bold text-green-600">{deal.discount}% OFF</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Valid Until:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {new Date(deal.validUntil).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Time Remaining:</span>
                    <span className={`text-sm font-medium ${
                      isExpired ? 'text-red-600' : isExpiringSoon() ? 'text-orange-600' : 'text-green-600'
                    }`}>
                      {getTimeRemaining()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Store Info */}
              <div className="bg-white rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Store Information</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-gray-600" />
                    <span className="text-gray-900">{deal.retailer.locations[0]?.name}</span>
                  </div>
                  <p className="text-gray-600 ml-6">{deal.retailer.locations[0]?.address}</p>
                  <p className="text-gray-600 ml-6">{deal.retailer.locations[0]?.distance}km away</p>
                  <p className="text-gray-600 ml-6">{deal.retailer.locations[0]?.openingHours}</p>
                </div>
              </div>

              {/* Custom Total */}
              <div className="bg-white rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Your Selection</h4>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Original Price:</span>
                    <span className="text-sm text-gray-500 line-through">
                      {formatCurrency(customTotal.original)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Discounted Price:</span>
                    <span className="text-lg font-bold text-gray-900">
                      {formatCurrency(customTotal.discounted)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                    <span className="font-medium text-green-600">You Save:</span>
                    <span className="text-lg font-bold text-green-600">
                      {formatCurrency(customTotal.savings)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleAddToList}
                  disabled={!hasSelectedItems || isExpired}
                  className="w-full flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-colors"
                >
                  <ShoppingCart className="h-5 w-5" />
                  <span>
                    {isExpired ? 'Deal Expired' : hasSelectedItems ? 'Add to Shopping List' : 'Select Items First'}
                  </span>
                </button>
                
                <button
                  onClick={onClose}
                  className="w-full bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>

              {!hasSelectedItems && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-700">
                    <strong>Tip:</strong> Adjust quantities above to customize your bundle and see updated pricing.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add to List Modal */}
      {showAddToListModal && (
        <AddToListModal
          isOpen={showAddToListModal}
          onClose={() => setShowAddToListModal(false)}
          product={deal.bundleItems[0].product} // Use first product as representative
          quantity={1}
          onAddToList={(listId, quantity) => {
            console.log('Adding bundle to list:', listId, getSelectedItemsForList());
            alert(`Bundle items added to shopping list!`);
            setShowAddToListModal(false);
            onClose();
          }}
          onCreateNewList={() => {
            console.log('Creating new list with bundle items:', getSelectedItemsForList());
            alert('New list created with bundle items!');
            setShowAddToListModal(false);
            onClose();
          }}
        />
      )}
    </div>
  );
};