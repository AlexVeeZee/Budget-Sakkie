import React, { useState, useMemo } from 'react';
import { Plus, ShoppingCart, Users, DollarSign, Clock, Edit2, Trash2, Search, Check, X, Star, Package, Calendar, Share2 } from 'lucide-react';
import { sampleShoppingList, products } from '../../data/mockData';
import { useLanguage } from '../../hooks/useLanguage';
import { useCurrency } from '../../hooks/useCurrency';
import { Product, ShoppingListItem, ShoppingList } from '../../types';
import { EditListModal } from '../modals/EditListModal';
import { DeleteListModal } from '../modals/DeleteListModal';
import { CreateListModal } from '../modals/CreateListModal';
import { ListArchiveView } from '../ListArchiveView';

interface EditingItem {
  id: string;
  name: string;
  quantity: number;
  priority: 'high' | 'medium' | 'low';
  notes: string;
}

export const ListsTab: React.FC = () => {
  const { t } = useLanguage();
  const { formatCurrency } = useCurrency();
  const [viewMode, setViewMode] = useState<'archive' | 'detail'>('archive');
  const [activeList, setActiveList] = useState<ShoppingList | null>(null);
  const [allLists, setAllLists] = useState<ShoppingList[]>([
    sampleShoppingList,
    {
      id: '2',
      name: 'Party Supplies',
      items: [
        {
          id: '1',
          productId: '1',
          product: products[0],
          quantity: 3,
          priority: 'high',
          completed: false
        },
        {
          id: '2',
          productId: '2',
          product: products[1],
          quantity: 2,
          priority: 'medium',
          completed: true
        }
      ],
      createdAt: '2024-01-10T10:00:00Z',
      updatedAt: '2024-01-12T15:30:00Z',
      sharedWith: ['Johan Van Der Merwe'],
      budget: 300
    },
    {
      id: '3',
      name: 'Monthly Bulk Shopping',
      items: [
        {
          id: '1',
          productId: '3',
          product: products[2],
          quantity: 5,
          priority: 'medium',
          completed: false
        }
      ],
      createdAt: '2024-01-05T14:20:00Z',
      updatedAt: '2024-01-05T14:20:00Z',
      sharedWith: [],
      budget: 800
    }
  ]);
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingItem, setEditingItem] = useState<EditingItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [addedItemFeedback, setAddedItemFeedback] = useState<string | null>(null);
  const [showEditListModal, setShowEditListModal] = useState(false);
  const [showDeleteListModal, setShowDeleteListModal] = useState(false);
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);

  // Quick add items - common grocery items
  const quickAddItems = [
    { name: 'Bread', category: 'Bakery', estimatedPrice: 15.99 },
    { name: 'Milk', category: 'Dairy', estimatedPrice: 22.99 },
    { name: 'Eggs', category: 'Dairy', estimatedPrice: 34.99 },
    { name: 'Rice', category: 'Pantry', estimatedPrice: 45.99 },
    { name: 'Chicken', category: 'Meat', estimatedPrice: 89.99 },
    { name: 'Bananas', category: 'Fresh Produce', estimatedPrice: 19.99 },
    { name: 'Apples', category: 'Fresh Produce', estimatedPrice: 24.99 },
    { name: 'Pasta', category: 'Pantry', estimatedPrice: 18.99 },
    { name: 'Tomatoes', category: 'Fresh Produce', estimatedPrice: 28.99 },
    { name: 'Cheese', category: 'Dairy', estimatedPrice: 45.99 },
    { name: 'Onions', category: 'Fresh Produce', estimatedPrice: 16.99 },
    { name: 'Potatoes', category: 'Fresh Produce', estimatedPrice: 12.99 }
  ];

  // Filter items based on search query - moved to top level before any conditional returns
  const filteredItems = useMemo(() => {
    if (!activeList || !searchQuery) return activeList?.items || [];
    
    const query = searchQuery.toLowerCase();
    return activeList.items.filter(item =>
      item.product.name.toLowerCase().includes(query) ||
      item.product.brand.toLowerCase().includes(query) ||
      item.product.category.toLowerCase().includes(query) ||
      (item.notes && item.notes.toLowerCase().includes(query))
    );
  }, [activeList?.items, searchQuery]);

  // Filter quick add items based on search - moved to top level before any conditional returns
  const filteredQuickAdd = useMemo(() => {
    if (!searchQuery) return quickAddItems;
    
    const query = searchQuery.toLowerCase();
    return quickAddItems.filter(item =>
      item.name.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query)
    );
  }, [quickAddItems, searchQuery]);

  const handleSelectList = (list: ShoppingList) => {
    setActiveList(list);
    setViewMode('detail');
  };

  const handleBackToArchive = () => {
    setViewMode('archive');
    setActiveList(null);
    setSearchQuery('');
    setEditingItem(null);
  };

  const handleCreateList = (newList: Omit<ShoppingList, 'id' | 'createdAt' | 'updatedAt'>) => {
    const list: ShoppingList = {
      ...newList,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    setAllLists(prev => [list, ...prev]);
    
    // If we're in archive view, navigate to the new list
    if (viewMode === 'archive') {
      setActiveList(list);
      setViewMode('detail');
    }
  };

  const handleSaveList = (name: string, budget: number) => {
    if (!activeList) return;
    
    const updatedList = {
      ...activeList,
      name,
      budget,
      updatedAt: new Date().toISOString()
    };
    
    setActiveList(updatedList);
    setAllLists(prev => prev.map(list => 
      list.id === activeList.id ? updatedList : list
    ));
  };

  const handleDeleteList = () => {
    if (!activeList) return;
    
    setAllLists(prev => prev.filter(list => list.id !== activeList.id));
    handleBackToArchive();
  };

  const handleDeleteListFromArchive = (listId: string) => {
    setAllLists(prev => prev.filter(list => list.id !== listId));
  };

  // If in archive view, show the archive component
  if (viewMode === 'archive') {
    return (
      <>
        <ListArchiveView
          lists={allLists}
          onSelectList={handleSelectList}
          onCreateNew={() => setShowCreateModal(true)}
          onDeleteList={handleDeleteListFromArchive}
        />
        
        {/* Create List Modal - Available in Archive View */}
        <CreateListModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateList}
        />
      </>
    );
  }

  // Rest of the existing detail view code...
  if (!activeList) return null;

  const completedItems = activeList.items.filter(item => item.completed).length;
  const totalItems = activeList.items.length;
  const progress = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

  const estimatedTotal = activeList.items.reduce((total, item) => {
    return total + (item.quantity * 20); // Simplified calculation
  }, 0);

  const optimizedSavings = estimatedTotal * 0.15; // 15% estimated savings

  const handleEditStart = (item: ShoppingListItem) => {
    setEditingItem({
      id: item.id,
      name: item.product.name,
      quantity: item.quantity,
      priority: item.priority,
      notes: item.notes || ''
    });
  };

  const handleEditSave = () => {
    if (!editingItem) return;

    const updatedList = {
      ...activeList,
      items: activeList.items.map(item => {
        if (item.id === editingItem.id) {
          return {
            ...item,
            product: {
              ...item.product,
              name: editingItem.name
            },
            quantity: editingItem.quantity,
            priority: editingItem.priority,
            notes: editingItem.notes
          };
        }
        return item;
      }),
      updatedAt: new Date().toISOString()
    };

    setActiveList(updatedList);
    setAllLists(prev => prev.map(list => 
      list.id === activeList.id ? updatedList : list
    ));
    setEditingItem(null);
  };

  const handleEditCancel = () => {
    setEditingItem(null);
  };

  const handleDeleteConfirm = async (itemId: string) => {
    setDeletingItemId(itemId);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const updatedList = {
        ...activeList,
        items: activeList.items.filter(item => item.id !== itemId),
        updatedAt: new Date().toISOString()
      };
      
      setActiveList(updatedList);
      setAllLists(prev => prev.map(list => 
        list.id === activeList.id ? updatedList : list
      ));
      
      // Show success feedback
      setAddedItemFeedback('Item removed successfully!');
      setTimeout(() => setAddedItemFeedback(null), 2000);
      
    } catch (error) {
      console.error('Error deleting item:', error);
    } finally {
      setDeletingItemId(null);
      setShowDeleteConfirm(null);
    }
  };

  const handleQuickAdd = (quickItem: typeof quickAddItems[0]) => {
    // Check if item already exists
    const existingItem = activeList.items.find(item => 
      item.product.name.toLowerCase() === quickItem.name.toLowerCase()
    );

    if (existingItem) {
      // Increase quantity if item exists
      const updatedList = {
        ...activeList,
        items: activeList.items.map(item => 
          item.id === existingItem.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ),
        updatedAt: new Date().toISOString()
      };
      setActiveList(updatedList);
      setAllLists(prev => prev.map(list => 
        list.id === activeList.id ? updatedList : list
      ));
    } else {
      // Add new item
      const newItem: ShoppingListItem = {
        id: Date.now().toString(),
        productId: Date.now().toString(),
        product: {
          id: Date.now().toString(),
          name: quickItem.name,
          brand: 'Generic',
          category: quickItem.category,
          image: getDefaultImage(quickItem.category),
          unit: 'each',
          unitSize: 'each'
        },
        quantity: 1,
        priority: 'medium',
        completed: false,
        notes: ''
      };

      const updatedList = {
        ...activeList,
        items: [...activeList.items, newItem],
        updatedAt: new Date().toISOString()
      };
      
      setActiveList(updatedList);
      setAllLists(prev => prev.map(list => 
        list.id === activeList.id ? updatedList : list
      ));
    }

    // Show feedback
    setAddedItemFeedback(quickItem.name);
    setTimeout(() => setAddedItemFeedback(null), 2000);
  };

  const handleToggleComplete = (itemId: string) => {
    const updatedList = {
      ...activeList,
      items: activeList.items.map(item =>
        item.id === itemId ? { ...item, completed: !item.completed } : item
      ),
      updatedAt: new Date().toISOString()
    };
    
    setActiveList(updatedList);
    setAllLists(prev => prev.map(list => 
      list.id === activeList.id ? updatedList : list
    ));
  };

  const getDefaultImage = (category: string): string => {
    const categoryImages = {
      'Fresh Produce': 'https://images.pexels.com/photos/61127/pexels-photo-61127.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop',
      'Dairy': 'https://images.pexels.com/photos/416978/pexels-photo-416978.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop',
      'Meat': 'https://images.pexels.com/photos/616354/pexels-photo-616354.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop',
      'Bakery': 'https://images.pexels.com/photos/209206/pexels-photo-209206.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop',
      'Pantry': 'https://images.pexels.com/photos/315755/pexels-photo-315755.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop'
    };
    return categoryImages[category as keyof typeof categoryImages] || categoryImages['Pantry'];
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header with Back Button */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={handleBackToArchive}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <span className="text-lg">←</span>
            <span>Back to Lists</span>
          </button>
          <h2 className="text-2xl font-bold text-gray-900">{activeList.name}</h2>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center space-x-2 transition-colors"
          style={{ color: 'rgb(255, 255, 255)', backgroundColor: 'rgb(22, 163, 74)' }}
        >
          <Plus className="h-5 w-5" />
          <span>{t('lists.create_new')}</span>
        </button>
      </div>

      {/* Shopping List Overview */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900" style={{ color: 'rgb(17, 24, 39)' }}>
              {activeList.name}
            </h3>
            <p className="text-gray-600">
              {totalItems} {t('lists.total_items')} • Created {new Date(activeList.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div className="flex space-x-2">
            <button 
              onClick={() => setShowEditListModal(true)}
              className="p-2 text-gray-600 hover:text-gray-900 rounded-lg transition-colors"
              style={{ backgroundColor: 'transparent' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgb(243, 244, 246)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <Edit2 className="h-4 w-4" />
            </button>
            <button 
              onClick={() => setShowDeleteListModal(true)}
              className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span>Progress</span>
            <span>{completedItems}/{totalItems} completed</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="h-2 rounded-full transition-all duration-300"
              style={{ 
                width: `${progress}%`,
                backgroundColor: 'rgb(22, 163, 74)'
              }}
            />
          </div>
        </div>

        {/* Cost Summary */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <DollarSign className="h-6 w-6 mx-auto mb-1" style={{ color: 'rgb(22, 163, 74)' }} />
            <p className="text-lg font-bold" style={{ color: 'rgb(17, 24, 39)' }}>
              {formatCurrency(estimatedTotal)}
            </p>
            <p className="text-xs text-gray-600">{t('lists.estimated_total')}</p>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <DollarSign className="h-6 w-6 mx-auto mb-1" style={{ color: 'rgb(22, 163, 74)' }} />
            <p className="text-lg font-bold" style={{ color: 'rgb(22, 163, 74)' }}>
              -{formatCurrency(optimizedSavings)}
            </p>
            <p className="text-xs text-gray-600">{t('lists.optimized_savings')}</p>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <Users className="h-6 w-6 text-blue-600 mx-auto mb-1" />
            <p className="text-lg font-bold text-blue-600">{activeList.sharedWith.length + 1}</p>
            <p className="text-xs text-gray-600">Family Members</p>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search items in your list or quick add items..."
            className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl bg-white shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 placeholder-gray-500"
            style={{ 
              fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif',
              fontSize: '16px'
            }}
          />
        </div>
      </div>

      {/* Added Item Feedback */}
      {addedItemFeedback && (
        <div className="mb-4 p-3 bg-green-100 border border-green-200 rounded-lg flex items-center space-x-2">
          <Check className="h-5 w-5 text-green-600" />
          <span className="text-green-800 font-medium">
            {addedItemFeedback.includes('removed') ? addedItemFeedback : `${addedItemFeedback} added to your list!`}
          </span>
        </div>
      )}

      {/* Shopping List Items */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h4 className="text-lg font-semibold text-gray-900">Shopping Items</h4>
        </div>
        <div className="divide-y divide-gray-200">
          {filteredItems.length === 0 ? (
            <div className="px-6 py-8 text-center">
              <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {searchQuery ? 'No items match your search' : 'Your list is empty'}
              </h3>
              <p className="text-gray-600">
                {searchQuery ? 'Try adjusting your search terms' : 'Add items using the quick add section below'}
              </p>
            </div>
          ) : (
            filteredItems.map((item) => (
              <div key={item.id} className={`px-6 py-4 transition-colors ${
                item.completed ? 'opacity-60' : ''
              }`}
              style={{ 
                fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif',
                fontSize: '16px',
                backgroundColor: 'rgb(243, 244, 246)'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgb(229, 231, 235)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgb(243, 244, 246)'}
              >
                {editingItem && editingItem.id === item.id ? (
                  /* Edit Mode */
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
                        <input
                          type="text"
                          value={editingItem.name}
                          onChange={(e) => setEditingItem(prev => prev ? { ...prev, name: e.target.value } : null)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          style={{ 
                            fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif',
                            fontSize: '16px'
                          }}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                        <input
                          type="number"
                          min="1"
                          value={editingItem.quantity}
                          onChange={(e) => setEditingItem(prev => prev ? { ...prev, quantity: parseInt(e.target.value) || 1 } : null)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          style={{ 
                            fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif',
                            fontSize: '16px'
                          }}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                        <select
                          value={editingItem.priority}
                          onChange={(e) => setEditingItem(prev => prev ? { ...prev, priority: e.target.value as 'high' | 'medium' | 'low' } : null)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          style={{ 
                            fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif',
                            fontSize: '16px'
                          }}
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                      <input
                        type="text"
                        value={editingItem.notes}
                        onChange={(e) => setEditingItem(prev => prev ? { ...prev, notes: e.target.value } : null)}
                        placeholder="Add any notes or specifications..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        style={{ 
                          fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif',
                          fontSize: '16px'
                        }}
                      />
                    </div>
                    <div className="flex space-x-3">
                      <button
                        onClick={handleEditSave}
                        className="flex items-center space-x-2 px-4 py-2 text-white font-medium rounded-lg transition-colors"
                        style={{ backgroundColor: 'rgb(22, 163, 74)' }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgb(21, 128, 61)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgb(22, 163, 74)'}
                      >
                        <Check className="h-4 w-4" />
                        <span>Save</span>
                      </button>
                      <button
                        onClick={handleEditCancel}
                        className="flex items-center space-x-2 px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium rounded-lg transition-colors"
                      >
                        <X className="h-4 w-4" />
                        <span>Cancel</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Display Mode */
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => handleToggleComplete(item.id)}
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                        item.completed 
                          ? 'border-green-600 text-white' 
                          : 'border-gray-300 hover:border-green-600'
                      }`}
                      style={item.completed ? { backgroundColor: 'rgb(22, 163, 74)', borderColor: 'rgb(22, 163, 74)' } : {}}
                    >
                      {item.completed && <span className="text-xs">✓</span>}
                    </button>
                    
                    <img 
                      src={item.product.image} 
                      alt={item.product.name}
                      className="w-12 h-12 object-cover rounded-lg"
                    />
                    
                    <div className="flex-1">
                      <h5 className={`font-semibold ${item.completed ? 'line-through text-gray-500' : ''}`}
                          style={!item.completed ? { color: 'rgb(17, 24, 39)' } : {}}>
                        {searchQuery && (
                          <span dangerouslySetInnerHTML={{
                            __html: item.product.name.replace(
                              new RegExp(`(${searchQuery})`, 'gi'),
                              '<mark class="bg-yellow-200">$1</mark>'
                            )
                          }} />
                        ) || item.product.name}
                      </h5>
                      <p className="text-sm text-gray-600">
                        {item.product.brand} • {item.product.unitSize} • Qty: {item.quantity}
                      </p>
                      {item.notes && (
                        <p className="text-sm text-blue-600 mt-1">Note: {item.notes}</p>
                      )}
                    </div>
                    
                    <div className="text-right">
                      <p className="font-semibold" style={{ color: 'rgb(17, 24, 39)' }}>
                        {formatCurrency(item.quantity * 20)}
                      </p>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(item.priority)}`}>
                        {item.priority}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEditStart(item)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit item"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(item.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete item"
                        disabled={deletingItemId === item.id}
                      >
                        {deletingItemId === item.id ? (
                          <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Quick Add Section */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
          <Package className="h-5 w-5" />
          <span>Quick Add Items</span>
        </h4>
        
        {filteredQuickAdd.length === 0 ? (
          <div className="text-center py-8">
            <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No quick add items match your search</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {filteredQuickAdd.map((item, index) => (
              <button
                key={index}
                onClick={() => handleQuickAdd(item)}
                className="p-3 border border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all text-left group"
              >
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-green-100 transition-colors">
                    <Plus className="h-4 w-4 text-gray-600 group-hover:text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate" style={{ color: 'rgb(17, 24, 39)' }}>
                      {searchQuery ? (
                        <span dangerouslySetInnerHTML={{
                          __html: item.name.replace(
                            new RegExp(`(${searchQuery})`, 'gi'),
                            '<mark class="bg-yellow-200">$1</mark>'
                          )
                        }} />
                      ) : item.name}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-gray-600">{item.category}</p>
                <p className="text-xs font-medium" style={{ color: 'rgb(22, 163, 74)' }}>
                  ~{formatCurrency(item.estimatedPrice)}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirm Deletion</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to remove this item from your shopping list? This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => handleDeleteConfirm(showDeleteConfirm)}
                disabled={deletingItemId === showDeleteConfirm}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
              >
                {deletingItemId === showDeleteConfirm ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Delete</span>
                )}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(null)}
                disabled={deletingItemId === showDeleteConfirm}
                className="flex-1 bg-gray-300 hover:bg-gray-400 disabled:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create List Modal - Available in Detail View */}
      <CreateListModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreateList}
      />

      {/* Edit List Modal */}
      <EditListModal
        isOpen={showEditListModal}
        onClose={() => setShowEditListModal(false)}
        listName={activeList.name}
        budget={activeList.budget}
        onSave={handleSaveList}
      />

      {/* Delete List Modal */}
      <DeleteListModal
        isOpen={showDeleteListModal}
        onClose={() => setShowDeleteListModal(false)}
        listName={activeList.name}
        itemCount={activeList.items.length}
        onConfirm={handleDeleteList}
      />
    </div>
  );
};