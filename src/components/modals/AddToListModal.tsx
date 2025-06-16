import React, { useState } from 'react';
import { X, Plus, Check, ShoppingCart, Users, Calendar } from 'lucide-react';
import { ShoppingList, Product } from '../../types';
import { useCurrency } from '../../hooks/useCurrency';

interface AddToListModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  quantity: number;
  onAddToList: (listId: string, quantity: number) => void;
  onCreateNewList: () => void;
}

export const AddToListModal: React.FC<AddToListModalProps> = ({
  isOpen,
  onClose,
  product,
  quantity: initialQuantity,
  onAddToList,
  onCreateNewList
}) => {
  const { formatCurrency } = useCurrency();
  const [quantity, setQuantity] = useState(initialQuantity);
  const [selectedListId, setSelectedListId] = useState<string>('');
  const [isAdding, setIsAdding] = useState(false);

  // Mock shopping lists - in real app, this would come from props or context
  const shoppingLists: ShoppingList[] = [
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
  ];

  const handleAddToList = async () => {
    if (!selectedListId) return;
    
    setIsAdding(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      onAddToList(selectedListId, quantity);
      onClose();
    } catch (error) {
      console.error('Error adding to list:', error);
    } finally {
      setIsAdding(false);
    }
  };

  const handleCreateNew = () => {
    onCreateNewList();
    onClose();
  };

  if (!isOpen) return null;

  const estimatedPrice = 25.99; // Mock price - in real app would come from props

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <ShoppingCart className="h-5 w-5 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Add to Shopping List</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          {/* Product Summary */}
          <div className="flex items-center space-x-4 mb-6 p-4 bg-gray-50 rounded-lg">
            <img 
              src={product.image}
              alt={product.name}
              className="w-16 h-16 object-cover rounded-lg"
            />
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900">{product.name}</h4>
              <p className="text-sm text-gray-600">{product.brand} • {product.unitSize}</p>
              <p className="text-sm font-medium text-green-600">~{formatCurrency(estimatedPrice)} each</p>
            </div>
          </div>

          {/* Quantity Selector */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
            <div className="flex items-center space-x-4">
              <div className="flex items-center border border-gray-300 rounded-lg">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-l-lg"
                >
                  -
                </button>
                <span className="px-4 py-2 font-medium min-w-[3rem] text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-r-lg"
                >
                  +
                </button>
              </div>
              <span className="text-sm text-gray-600">
                Total: {formatCurrency(estimatedPrice * quantity)}
              </span>
            </div>
          </div>

          {/* List Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">Choose Shopping List</label>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {shoppingLists.map((list) => (
                <label
                  key={list.id}
                  className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                    selectedListId === list.id
                      ? 'border-green-500 bg-green-50'
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
                    <div className="ml-3 w-5 h-5 bg-green-600 rounded-full flex items-center justify-center">
                      <Check className="h-3 w-3 text-white" />
                    </div>
                  )}
                </label>
              ))}
            </div>
          </div>

          {/* Create New List Option */}
          <button
            onClick={handleCreateNew}
            className="w-full flex items-center justify-center space-x-2 p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-green-500 hover:text-green-600 transition-colors mb-6"
          >
            <Plus className="h-4 w-4" />
            <span>Create New Shopping List</span>
          </button>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              disabled={isAdding}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleAddToList}
              disabled={!selectedListId || isAdding}
              className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              {isAdding ? (
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