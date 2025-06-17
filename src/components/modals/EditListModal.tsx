import React, { useState } from 'react';
import { X, Save, Edit2, Users, UserPlus, Trash2, Crown, Shield, Target, Calendar } from 'lucide-react';
import { useCurrency } from '../../hooks/useCurrency';

interface FamilyMember {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'member';
  avatar: string;
}

interface EditListModalProps {
  isOpen: boolean;
  onClose: () => void;
  listName: string;
  budget?: number;
  sharedWith?: string[];
  onSave: (name: string, budget: number, sharedWith: string[]) => void;
}

export const EditListModal: React.FC<EditListModalProps> = ({
  isOpen,
  onClose,
  listName,
  budget = 0,
  sharedWith = [],
  onSave
}) => {
  const { formatCurrency } = useCurrency();
  const [name, setName] = useState(listName);
  const [weeklyBudget, setWeeklyBudget] = useState(budget);
  const [activeTab, setActiveTab] = useState<'details' | 'sharing'>('details');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; budget?: string }>({});
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<string[]>(sharedWith);

  // Sample family members for demonstration
  const availableFamilyMembers: FamilyMember[] = [
    {
      id: '1',
      name: 'Johan Van Der Merwe',
      email: 'johan.vandermerwe@email.com',
      role: 'admin',
      avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop'
    },
    {
      id: '2',
      name: 'Emma Van Der Merwe',
      email: 'emma.vandermerwe@email.com',
      role: 'member',
      avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop'
    },
    {
      id: '3',
      name: 'Pieter Van Der Merwe',
      email: 'pieter.vandermerwe@email.com',
      role: 'member',
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop'
    }
  ];

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
      onSave(name.trim(), weeklyBudget, selectedMembers);
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
    setSelectedMembers(sharedWith);
    setNewMemberEmail('');
    setErrors({});
    setActiveTab('details');
    onClose();
  };

  const handleToggleMember = (memberName: string) => {
    setSelectedMembers(prev => 
      prev.includes(memberName)
        ? prev.filter(name => name !== memberName)
        : [...prev, memberName]
    );
  };

  const handleAddByEmail = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!newMemberEmail.trim()) {
      return;
    }
    
    if (!emailRegex.test(newMemberEmail)) {
      return;
    }
    
    if (selectedMembers.includes(newMemberEmail)) {
      return;
    }
    
    setSelectedMembers(prev => [...prev, newMemberEmail]);
    setNewMemberEmail('');
  };

  const handleRemoveMember = (memberName: string) => {
    setSelectedMembers(prev => prev.filter(name => name !== memberName));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full mx-4 shadow-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-green-600 via-orange-500 to-blue-600 text-white">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <Edit2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Edit Shopping List</h3>
              <p className="text-white/80">Manage list details and family sharing</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-black/10 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('details')}
            className={`flex-1 px-6 py-3 font-medium transition-colors ${
              activeTab === 'details'
                ? 'text-green-600 border-b-2 border-green-600 bg-green-50'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            List Details
          </button>
          <button
            onClick={() => setActiveTab('sharing')}
            className={`flex-1 px-6 py-3 font-medium transition-colors ${
              activeTab === 'sharing'
                ? 'text-green-600 border-b-2 border-green-600 bg-green-50'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Family Sharing
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {activeTab === 'details' && (
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
                  style={{ 
                    fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif',
                    fontSize: '16px'
                  }}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              {/* Weekly Budget with R icon */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="w-5 h-5 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                      R
                    </span>
                    <span>Weekly Budget Goal</span>
                  </div>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 font-medium">R</span>
                  </div>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={weeklyBudget || ''}
                    onChange={(e) => setWeeklyBudget(parseFloat(e.target.value) || 0)}
                    className={`w-full pl-8 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                      errors.budget ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="0.00"
                    style={{ 
                      fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif',
                      fontSize: '16px'
                    }}
                  />
                </div>
                {errors.budget && (
                  <p className="mt-1 text-sm text-red-600">{errors.budget}</p>
                )}
                <p className="mt-1 text-sm text-gray-500">
                  Set your target spending for this week's shopping
                </p>
              </div>

              {/* Budget Goal Preview */}
              {weeklyBudget > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Target className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800">Weekly Budget Goal</span>
                  </div>
                  <div className="space-y-2">
                    <p className="text-green-700">
                      Target spending: <span className="font-bold">{formatCurrency(weeklyBudget)}</span>
                    </p>
                    <p className="text-xs text-green-600">
                      We'll help you stay within budget by finding the best deals and suggesting alternatives
                    </p>
                  </div>
                </div>
              )}

              {/* Quick Budget Suggestions */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Quick Budget Suggestions
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {[200, 500, 800, 1200].map((amount) => (
                    <button
                      key={amount}
                      onClick={() => setWeeklyBudget(amount)}
                      className={`p-3 rounded-lg border-2 transition-all text-center ${
                        weeklyBudget === amount
                          ? 'border-green-500 bg-green-50 text-green-700'
                          : 'border-gray-200 hover:border-gray-300 text-gray-700'
                      }`}
                    >
                      <div className="font-bold">{formatCurrency(amount)}</div>
                      <div className="text-xs text-gray-500">
                        {amount <= 300 ? 'Basic' : amount <= 600 ? 'Standard' : amount <= 900 ? 'Family' : 'Premium'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'sharing' && (
            <div className="space-y-6">
              {/* Family Members List */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>Family Members</span>
                </h4>
                
                <div className="space-y-3">
                  {availableFamilyMembers.map((member) => (
                    <div 
                      key={member.id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <img 
                          src={member.avatar}
                          alt={member.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div>
                          <div className="flex items-center space-x-2">
                            <p className="font-medium text-gray-900">{member.name}</p>
                            {member.role === 'admin' ? (
                              <Crown className="h-4 w-4 text-yellow-600" />
                            ) : (
                              <Shield className="h-4 w-4 text-blue-600" />
                            )}
                          </div>
                          <p className="text-sm text-gray-600">{member.email}</p>
                        </div>
                      </div>
                      
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedMembers.includes(member.name)}
                          onChange={() => handleToggleMember(member.name)}
                          className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                        />
                        <span className="text-sm text-gray-700">
                          {selectedMembers.includes(member.name) ? 'Shared' : 'Share'}
                        </span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add by Email */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Add by Email</h4>
                <div className="flex space-x-2">
                  <input
                    type="email"
                    value={newMemberEmail}
                    onChange={(e) => setNewMemberEmail(e.target.value)}
                    placeholder="family.member@email.com"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    style={{ 
                      fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif',
                      fontSize: '16px'
                    }}
                  />
                  <button
                    onClick={handleAddByEmail}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center space-x-2"
                  >
                    <UserPlus className="h-4 w-4" />
                    <span>Add</span>
                  </button>
                </div>
              </div>

              {/* Currently Shared With */}
              {selectedMembers.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">
                    Currently Shared With ({selectedMembers.length})
                  </h4>
                  <div className="space-y-2">
                    {selectedMembers.map((memberName, index) => (
                      <div 
                        key={index}
                        className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                            {memberName.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium text-blue-900">{memberName}</span>
                        </div>
                        <button
                          onClick={() => handleRemoveMember(memberName)}
                          className="p-1 text-blue-600 hover:text-red-600 transition-colors"
                          title="Remove access"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sharing Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <Users className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900">About Family Sharing</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      Family members you share this list with can view, add, and check off items. 
                      They'll receive notifications when the list is updated.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-600">
            {activeTab === 'sharing' && selectedMembers.length > 0 && (
              <span>Sharing with {selectedMembers.length} family member{selectedMembers.length !== 1 ? 's' : ''}</span>
            )}
            {activeTab === 'details' && weeklyBudget > 0 && (
              <span>Weekly budget: {formatCurrency(weeklyBudget)}</span>
            )}
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={handleClose}
              disabled={isLoading}
              className="px-4 py-2 bg-gray-300 hover:bg-gray-400 disabled:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="flex items-center space-x-2 px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold rounded-lg transition-colors"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              <span>{isLoading ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};