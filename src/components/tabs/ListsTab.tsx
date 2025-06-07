import React, { useState } from 'react';
import { Plus, ShoppingCart, Users, DollarSign, Clock, Edit2, Trash2 } from 'lucide-react';
import { sampleShoppingList } from '../../data/mockData';
import { useLanguage } from '../../hooks/useLanguage';

export const ListsTab: React.FC = () => {
  const { t } = useLanguage();
  const [activeList, setActiveList] = useState(sampleShoppingList);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const completedItems = activeList.items.filter(item => item.completed).length;
  const totalItems = activeList.items.length;
  const progress = (completedItems / totalItems) * 100;

  const estimatedTotal = activeList.items.reduce((total, item) => {
    // Simplified calculation - in real app, would use actual best prices
    return total + (item.quantity * 20); // Assuming R20 average per item
  }, 0);

  const optimizedSavings = estimatedTotal * 0.15; // 15% estimated savings

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">{t('lists.my_lists')}</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <Plus className="h-5 w-5" />
          <span>{t('lists.create_new')}</span>
        </button>
      </div>

      {/* Shopping List Overview */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900">{activeList.name}</h3>
            <p className="text-gray-600">
              {totalItems} {t('lists.total_items')} • Created {new Date(activeList.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div className="flex space-x-2">
            <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
              <Edit2 className="h-4 w-4" />
            </button>
            <button className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
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
              className="bg-green-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Cost Summary */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <DollarSign className="h-6 w-6 text-green-600 mx-auto mb-1" />
            <p className="text-lg font-bold text-gray-900">R{estimatedTotal.toFixed(2)}</p>
            <p className="text-xs text-gray-600">{t('lists.estimated_total')}</p>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <DollarSign className="h-6 w-6 text-green-600 mx-auto mb-1" />
            <p className="text-lg font-bold text-green-600">-R{optimizedSavings.toFixed(2)}</p>
            <p className="text-xs text-gray-600">{t('lists.optimized_savings')}</p>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <Users className="h-6 w-6 text-blue-600 mx-auto mb-1" />
            <p className="text-lg font-bold text-blue-600">{activeList.sharedWith.length + 1}</p>
            <p className="text-xs text-gray-600">Family Members</p>
          </div>
        </div>
      </div>

      {/* Shopping List Items */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h4 className="text-lg font-semibold text-gray-900">Shopping Items</h4>
        </div>
        <div className="divide-y divide-gray-200">
          {activeList.items.map((item) => (
            <div key={item.id} className={`px-6 py-4 hover:bg-gray-50 transition-colors ${
              item.completed ? 'opacity-60' : ''
            }`}>
              <div className="flex items-center space-x-4">
                <button
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                    item.completed 
                      ? 'bg-green-600 border-green-600 text-white' 
                      : 'border-gray-300 hover:border-green-600'
                  }`}
                >
                  {item.completed && <span className="text-xs">✓</span>}
                </button>
                
                <img 
                  src={item.product.image} 
                  alt={item.product.name}
                  className="w-12 h-12 object-cover rounded-lg"
                />
                
                <div className="flex-1">
                  <h5 className={`font-semibold ${item.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                    {item.product.name}
                  </h5>
                  <p className="text-sm text-gray-600">
                    {item.product.brand} • {item.product.unitSize} • Qty: {item.quantity}
                  </p>
                </div>
                
                <div className="text-right">
                  <p className="font-semibold text-gray-900">R{(item.quantity * 20).toFixed(2)}</p>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                    item.priority === 'high' ? 'bg-red-100 text-red-800' :
                    item.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {item.priority}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Add Section */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Quick Add Items</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {['Bread', 'Milk', 'Eggs', 'Rice', 'Chicken', 'Bananas', 'Apples', 'Pasta'].map((item) => (
            <button
              key={item}
              className="p-3 border border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors text-left"
            >
              <p className="font-medium text-gray-900">{item}</p>
              <p className="text-xs text-gray-600">Tap to add</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};