import React, { useState } from 'react';
import { X, Save, DollarSign, Calendar, Target } from 'lucide-react';
import { useCurrency } from '../../hooks/useCurrency';

interface EditListModalProps {
  isOpen: boolean;
  onClose: () => void;
  listName: string;
  budget?: number;
  onSave: (name: string, budget: number) => void;
}

export const EditListModal: React.FC<EditListModalProps> = ({
  isOpen,
  onClose,
  listName,
  budget = 0,
  onSave
}) => {
  const { formatCurrency } = useCurrency();
  const [name, setName] = useState(listName);
  const [weeklyBudget, setWeeklyBudget] = useState(budget);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; budget?: string }>({});

  const validateForm = () => {
    const newErrors: { name?: string; budget?: string } = {};
    
    if (!name.trim()) {
      newErrors.name = 'List name is required';
    } else if (name.trim().length < 2) {
      newErrors.name = 'List name must be at least 2 characters';
    }
    
    if (weeklyBudget < 0) {
      newErrors.budget = 'Budget cannot be negative';
    } else if (weeklyBudget > 10000) {
      newErrors.budget = 'Budget seems too high, please check';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      onSave(name.trim(), weeklyBudget);
      onClose();
    } catch (error) {
      console.error('Error saving list:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setName(listName);
    setWeeklyBudget(budget);
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">Edit Shopping List</h3>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="space-y-6">
          {/* List Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              List Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                errors.name ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter list name"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          {/* Weekly Budget */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Weekly Budget
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <DollarSign className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="number"
                min="0"
                step="0.01"
                value={weeklyBudget}
                onChange={(e) => setWeeklyBudget(parseFloat(e.target.value) || 0)}
                className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                  errors.budget ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="0.00"
              />
            </div>
            {errors.budget && (
              <p className="mt-1 text-sm text-red-600">{errors.budget}</p>
            )}
            <p className="mt-1 text-sm text-gray-500">
              Set your target spending for this week
            </p>
          </div>

          {/* Budget Goal Preview */}
          {weeklyBudget > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Target className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">Budget Goal</span>
              </div>
              <p className="text-green-700">
                Weekly target: <span className="font-bold">{formatCurrency(weeklyBudget)}</span>
              </p>
              <p className="text-xs text-green-600 mt-1">
                We'll help you stay within this budget by finding the best deals
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3 mt-8">
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            <span>{isLoading ? 'Saving...' : 'Save Changes'}</span>
          </button>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="flex-1 bg-gray-300 hover:bg-gray-400 disabled:bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};