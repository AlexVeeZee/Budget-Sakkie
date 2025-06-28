import React, { useState, useEffect } from 'react';
import { X, ShoppingCart, Search, Check, Clock, Users, Calendar } from 'lucide-react';
import { ShoppingList } from '../../types';
import { useCurrency } from '../../hooks/useCurrency';

interface CartItem {
  product: {
    id: string;
    name: string;
    brand: string;
    image: string;
    price?: number;
  };
  quantity: number;
}

interface AddToExistingListModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectList: (listId: string) => void;
  items: CartItem[];
}

export const AddToExistingListModal: React.FC<AddToExistingListModalProps> = ({
  isOpen,
  onClose,
  onSelectList,
  items
}) => {
  const { formatCurrency } = useCurrency();
  const [selectedListId, setSelectedListId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Mock shopping lists - in a real app, this would come from an API or context
  const [shoppingLists, setShoppingLists] = useState<ShoppingList[]>([
    {
      id: '1',
      name: 'Weekly Groceries',
      items: [],
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-15T12:00:00Z',
      sharedWith: ['Johan Van Der Merwe'],
      budget: 500
    },
    {
      id: '2',
      name: 'Party Supplies',
      items: [],
      createdAt: '2024-01-10T10:00:00Z',
      updatedAt: '2024-01-12T15:30:00Z',
      sharedWith: [],
      budget: 300
    },
    {
      id: '3',
      name: 'Monthly Bulk Shopping',
      items: [],
      createdAt: '2024-01-05T14:20:00Z',
      updatedAt: '2024-01-05T14:20:00Z',
      sharedWith: ['Emma Van Der Merwe'],
      budget: 800
    }
  ]);

  // Reset selection when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedListId('');
      setSearchQuery('');
    }
  }, [isOpen]);

  // Filter lists based on search query
  const filteredLists = searchQuery
    ? shoppingLists.filter(list => 
        list.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : shoppingLists;

  const handleAddToList = async () => {
    if (!selectedListId) return;
    
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      onSelectList(selectedListId);
    } catch (error) {
      console.error('Error adding to list:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate total price of items
  const totalPrice = items.reduce(
    (sum, item) => sum + (item.product.price || 0) * item.quantity, 
    0
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <ShoppingCart className="h-5 w-5 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Add to Existing List</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          {/* Items Summary */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Adding {items.length} {items.length === 1 ? 'item' : 'items'}</h4>
            <div className="flex flex-wrap gap-2 mb-3">
              {items.slice(0, 3).map((item) => (
                <div key={item.product.id} className="flex items-center space-x-2 bg-white p-2 rounded border border-gray-200">
                  <img 
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-8 h-8 object-cover rounded"
                  />
                  <span className="text-sm font-medium">{item.quantity}x</span>
                </div>
              ))}
              {items.length > 3 && (
                <div className="bg-white p-2 rounded border border-gray-200 text-sm text-gray-600">
                  +{items.length - 3} more
                </div>
              )}
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Total Estimated Price:</span>
              <span className="font-bold text-gray-900">{formatCurrency(totalPrice)}</span>
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Search your lists..."
            />
          </div>

          {/* List Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">Choose Shopping List</label>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {filteredLists.length > 0 ? (
                filteredLists.map((list) => (
                  <label
                    key={list.id}
                    className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                      selectedListId === list.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="shoppingList"
                      value={list.id}
                      checked={selectedListId === list.id}
                      onChange={(e) => setSelectedListId(e.target.value)}
                      className="sr-only"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium text-gray-900">{list.name}</h4>
                        <div className="flex items-center space-x-2">
                          {list.sharedWith.length > 0 && (
                            <div className="flex items-center space-x-1 text-xs text-blue-600">
                              <Users className="h-3 w-3" />
                              <span>{list.sharedWith.length + 1}</span>
                            </div>
                          )}
                          <span className="text-xs text-gray-500">
                            {list.items?.length || 0} items
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>Updated {new Date(list.updatedAt).toLocaleDateString()}</span>
                        </div>
                        {list.budget && (
                          <span>Budget: {formatCurrency(list.budget)}</span>
                        )}
                      </div>
                    </div>
                    {selectedListId === list.id && (
                      <div className="ml-3 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                        <Check className="h-3 w-3 text-white" />
                      </div>
                    )}
                  </label>
                ))
              ) : (
                <div className="text-center py-6">
                  <p className="text-gray-500">No lists found. Try a different search term or create a new list.</p>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleAddToList}
              disabled={!selectedListId || isLoading}
              className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Adding...</span>
                </>
              ) : (
                <>
                  <ShoppingCart className="h-4 w-4" />
                  <span>Add to List</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};