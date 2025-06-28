import React, { useState, useEffect, useRef } from 'react';
import { ShoppingCart, X, ChevronUp, ChevronDown, Plus, Minus, Trash2, MoreVertical, List, ListPlus } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../hooks/useCurrency';
import { AddToExistingListModal } from './modals/AddToExistingListModal';
import { CreateListModal } from './modals/CreateListModal';
import { ShoppingList } from '../types';

export const TemporaryItemsBar: React.FC = () => {
  const { items, itemCount, removeItem, updateQuantity, clearItems } = useCart();
  const { formatCurrency } = useCurrency();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAddToExistingModal, setShowAddToExistingModal] = useState(false);
  const [showCreateListModal, setShowCreateListModal] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState<string | null>(null);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const optionsMenuRef = useRef<HTMLDivElement>(null);

  // Calculate total price
  const totalPrice = items.reduce(
    (sum, item) => sum + (item.product.price || 0) * item.quantity, 
    0
  );

  // Control visibility based on items
  useEffect(() => {
    if (itemCount > 0) {
      setIsVisible(true);
    } else {
      // Small delay before hiding to allow for animation
      const timer = setTimeout(() => {
        setIsVisible(false);
        setIsExpanded(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [itemCount]);

  // Close options menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (optionsMenuRef.current && !optionsMenuRef.current.contains(event.target as Node)) {
        setShowOptionsMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle creating a new list with selected items
  const handleCreateList = (list: Omit<ShoppingList, 'id' | 'createdAt' | 'updatedAt'>) => {
    // In a real app, this would create the list with the API
    const newList: ShoppingList = {
      ...list,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      items: items.map(item => ({
        id: Date.now() + '-' + item.product.id,
        productId: item.product.id,
        product: item.product,
        quantity: item.quantity,
        priority: 'medium',
        completed: false
      }))
    };

    // Show success message
    setShowSuccessMessage(`Created "${newList.name}" with ${itemCount} items`);
    setTimeout(() => setShowSuccessMessage(null), 3000);

    // Clear items
    clearItems();
    setShowCreateListModal(false);
    setShowOptionsMenu(false);
  };

  // Handle adding to existing list
  const handleAddToExistingList = (listId: string) => {
    // In a real app, this would update the list with the API
    
    // Show success message
    setShowSuccessMessage(`Added ${itemCount} items to list`);
    setTimeout(() => setShowSuccessMessage(null), 3000);

    // Clear items
    clearItems();
    setShowAddToExistingModal(false);
    setShowOptionsMenu(false);
  };

  // Determine if we should show mobile view
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;

  if (!isVisible) return null;

  return (
    <>
      <div 
        className="fixed bottom-16 left-0 right-0 z-30"
        style={{ 
          transform: isVisible ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform 0.3s ease'
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white border-t border-gray-200 shadow-lg rounded-t-lg">
            {/* Collapsed View */}
            <div className="custom-bottom-padding py-4 px-4 flex items-center justify-between">
              <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center space-x-2 text-gray-700"
              >
                <div className="relative">
                  <ShoppingCart className="h-5 w-5" />
                  <span className="absolute -top-1 -right-1 bg-green-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                    {itemCount}
                  </span>
                </div>
                <span className="font-medium">{itemCount} {itemCount === 1 ? 'item' : 'items'} selected</span>
                {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
              </button>
              
              {/* Desktop buttons */}
              <div className="hidden sm:flex items-center space-x-2">
                <button
                  onClick={() => setShowCreateListModal(true)}
                  className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  Create New List
                </button>
                <button
                  onClick={() => setShowAddToExistingModal(true)}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  Add to Existing
                </button>
                <button
                  onClick={clearItems}
                  className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  aria-label="Clear all items"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              {/* Mobile more options button */}
              <div className="sm:hidden relative" ref={optionsMenuRef}>
                <button
                  onClick={() => setShowOptionsMenu(!showOptionsMenu)}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <MoreVertical className="h-5 w-5" />
                </button>
                
                {/* Options dropdown menu */}
                {showOptionsMenu && (
                  <div className="absolute right-0 bottom-full mb-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-50">
                    <div className="py-1">
                      <button
                        onClick={() => {
                          setShowCreateListModal(true);
                          setShowOptionsMenu(false);
                        }}
                        className="w-full flex items-center space-x-3 px-4 py-3 text-left text-gray-700 hover:bg-gray-100"
                      >
                        <ListPlus className="h-4 w-4 text-green-600" />
                        <span>Create New List</span>
                      </button>
                      <button
                        onClick={() => {
                          setShowAddToExistingModal(true);
                          setShowOptionsMenu(false);
                        }}
                        className="w-full flex items-center space-x-3 px-4 py-3 text-left text-gray-700 hover:bg-gray-100"
                      >
                        <List className="h-4 w-4 text-blue-600" />
                        <span>Add to Existing List</span>
                      </button>
                      <button
                        onClick={() => {
                          clearItems();
                          setShowOptionsMenu(false);
                        }}
                        className="w-full flex items-center space-x-3 px-4 py-3 text-left text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span>Clear All Items</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Expanded View */}
            {isExpanded && (
              <div 
                className="px-4 pb-4 divide-y divide-gray-100"
                style={{
                  maxHeight: '40vh',
                  overflowY: 'auto'
                }}
              >
                <div className="py-2 flex items-center justify-between text-sm text-gray-600">
                  <span>Total Estimated Price:</span>
                  <span className="font-bold text-gray-900">{formatCurrency(totalPrice)}</span>
                </div>
                
                {items.map((item) => (
                  <div key={item.product.id} className="py-3 flex items-center space-x-3">
                    <img 
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-12 h-12 object-cover rounded-lg"
                    />
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 truncate">{item.product.name}</h4>
                      <p className="text-sm text-gray-600 truncate">
                        {item.product.brand} • {formatCurrency(item.product.price || 0)} each
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center border border-gray-300 rounded-lg">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          className="px-2 py-1 text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="px-2 py-1 font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          className="px-2 py-1 text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                      
                      <button
                        onClick={() => removeItem(item.product.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Success Message */}
      {showSuccessMessage && (
        <div className="fixed bottom-32 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-fade-in-up">
          <div className="flex items-center space-x-2">
            <ShoppingCart className="h-4 w-4" />
            <span>{showSuccessMessage}</span>
          </div>
        </div>
      )}

      {/* Modals */}
      <AddToExistingListModal
        isOpen={showAddToExistingModal}
        onClose={() => setShowAddToExistingModal(false)}
        onSelectList={handleAddToExistingList}
        items={items}
      />

      <CreateListModal
        isOpen={showCreateListModal}
        onClose={() => setShowCreateListModal(false)}
        onCreate={handleCreateList}
      />

      {/* Add animation styles */}
      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translate(-50%, 20px);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.3s ease-out forwards;
        }
        .custom-bottom-padding {
          padding-bottom: 1.45rem;
        }
      `}</style>
    </>
  );
};