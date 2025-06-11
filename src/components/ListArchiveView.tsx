import React, { useState } from 'react';
import { Plus, Calendar, DollarSign, Users, ShoppingCart, Edit2, Trash2, Search, Filter, Star } from 'lucide-react';
import { ShoppingList } from '../types';
import { useCurrency } from '../hooks/useCurrency';

interface ListArchiveViewProps {
  lists: ShoppingList[];
  onSelectList: (list: ShoppingList) => void;
  onCreateNew: () => void;
  onDeleteList: (listId: string) => void;
}

export const ListArchiveView: React.FC<ListArchiveViewProps> = ({
  lists,
  onSelectList,
  onCreateNew,
  onDeleteList
}) => {
  const { formatCurrency } = useCurrency();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'name' | 'budget'>('recent');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  // Filter and sort lists
  const filteredAndSortedLists = lists
    .filter(list => 
      list.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      list.items.some(item => 
        item.product.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'budget':
          return (b.budget || 0) - (a.budget || 0);
        case 'recent':
        default:
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      }
    });

  const handleDeleteConfirm = (listId: string) => {
    onDeleteList(listId);
    setShowDeleteConfirm(null);
  };

  const getListPreviewItems = (list: ShoppingList) => {
    return list.items.slice(0, 3);
  };

  const getCompletionPercentage = (list: ShoppingList) => {
    if (list.items.length === 0) return 0;
    const completed = list.items.filter(item => item.completed).length;
    return Math.round((completed / list.items.length) * 100);
  };

  const getEstimatedTotal = (list: ShoppingList) => {
    return list.items.reduce((total, item) => total + (item.quantity * 20), 0);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Shopping Lists</h1>
          <p className="text-gray-600">Manage all your grocery lists in one place</p>
        </div>
        <button
          onClick={onCreateNew}
          className="mt-4 sm:mt-0 flex items-center space-x-2 py-2 px-3 rounded-lg font-medium transition-colors"
          style={{ 
            backgroundColor: 'rgb(240, 253, 244)',
            color: 'rgb(22, 163, 74)',
            fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif',
            fontSize: '16px'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgb(220, 252, 231)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgb(240, 253, 244)'}
        >
          <Plus className="h-5 w-5" />
          <span>Create New List</span>
        </button>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search lists or items..."
            className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl bg-white shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 placeholder-gray-500"
            style={{ 
              fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif',
              fontSize: '16px'
            }}
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <Filter className="h-5 w-5 text-gray-400" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'recent' | 'name' | 'budget')}
            className="px-4 py-3 border border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-green-500 focus:border-green-500"
            style={{ 
              fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif',
              fontSize: '16px'
            }}
          >
            <option value="recent">Most Recent</option>
            <option value="name">Name A-Z</option>
            <option value="budget">Highest Budget</option>
          </select>
        </div>
      </div>

      {/* Lists Grid */}
      {filteredAndSortedLists.length === 0 ? (
        <div className="text-center py-16">
          <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {searchQuery ? 'No lists match your search' : 'No shopping lists yet'}
          </h3>
          <p className="text-gray-600 mb-6">
            {searchQuery 
              ? 'Try adjusting your search terms' 
              : 'Create your first shopping list to get started with smart grocery shopping'
            }
          </p>
          {!searchQuery && (
            <button
              onClick={onCreateNew}
              className="inline-flex items-center space-x-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors"
            >
              <Plus className="h-5 w-5" />
              <span>Create Your First List</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedLists.map((list) => {
            const completionPercentage = getCompletionPercentage(list);
            const estimatedTotal = getEstimatedTotal(list);
            const previewItems = getListPreviewItems(list);
            
            return (
              <div
                key={list.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 overflow-hidden cursor-pointer"
                onClick={() => onSelectList(list)}
              >
                {/* Card Header */}
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-1" style={{ color: 'rgb(17, 24, 39)' }}>
                        {searchQuery ? (
                          <span dangerouslySetInnerHTML={{
                            __html: list.name.replace(
                              new RegExp(`(${searchQuery})`, 'gi'),
                              '<mark class="bg-yellow-200">$1</mark>'
                            )
                          }} />
                        ) : list.name}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(list.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <ShoppingCart className="h-4 w-4" />
                          <span>{list.items.length} items</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-1" onClick={(e) => e.stopPropagation()}>
                      <button
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit list"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(list.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete list"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                      <span>Progress</span>
                      <span>{completionPercentage}% complete</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${completionPercentage}%`,
                          backgroundColor: 'rgb(22, 163, 74)'
                        }}
                      />
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <DollarSign className="h-4 w-4 text-green-600" />
                      </div>
                      <p className="text-lg font-bold text-gray-900">{formatCurrency(list.budget || estimatedTotal)}</p>
                      <p className="text-xs text-gray-600">Budget</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <ShoppingCart className="h-4 w-4 text-blue-600" />
                      </div>
                      <p className="text-lg font-bold text-gray-900">{list.items.length}</p>
                      <p className="text-xs text-gray-600">Items</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <Users className="h-4 w-4 text-purple-600" />
                      </div>
                      <p className="text-lg font-bold text-gray-900">{list.sharedWith.length + 1}</p>
                      <p className="text-xs text-gray-600">Members</p>
                    </div>
                  </div>
                </div>

                {/* Item Preview */}
                <div className="p-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Preview Items</h4>
                  {previewItems.length === 0 ? (
                    <p className="text-sm text-gray-500 italic">No items added yet</p>
                  ) : (
                    <div className="space-y-2">
                      {previewItems.map((item) => (
                        <div key={item.id} className="flex items-center space-x-3">
                          <img 
                            src={item.product.image}
                            alt={item.product.name}
                            className="w-8 h-8 object-cover rounded"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {searchQuery ? (
                                <span dangerouslySetInnerHTML={{
                                  __html: item.product.name.replace(
                                    new RegExp(`(${searchQuery})`, 'gi'),
                                    '<mark class="bg-yellow-200">$1</mark>'
                                  )
                                }} />
                              ) : item.product.name}
                            </p>
                            <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                          </div>
                          {item.completed && (
                            <div className="w-4 h-4 bg-green-600 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs">✓</span>
                            </div>
                          )}
                        </div>
                      ))}
                      {list.items.length > 3 && (
                        <p className="text-xs text-gray-500 mt-2">
                          +{list.items.length - 3} more items
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Shared Members */}
                {list.sharedWith.length > 0 && (
                  <div className="px-6 pb-6">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Shared with</h4>
                    <div className="flex flex-wrap gap-1">
                      {list.sharedWith.slice(0, 2).map((member, index) => (
                        <span 
                          key={index}
                          className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full"
                        >
                          {member}
                        </span>
                      ))}
                      {list.sharedWith.length > 2 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                          +{list.sharedWith.length - 2} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Delete Shopping List</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this shopping list? This action cannot be undone and will remove all items and sharing permissions.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => handleDeleteConfirm(showDeleteConfirm)}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Delete
              </button>
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};