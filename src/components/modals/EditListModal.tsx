import React, { useState, useEffect } from 'react';
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

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setName(listName);
      setWeeklyBudget(budget || 0);
      setSelectedMembers(sharedWith || []);
      setActiveTab('details');
      setErrors({});
    }
  }, [isOpen, listName, budget, sharedWith]);

  const validateForm = () => {
    const newErrors: { name?: string; budget?: string } = {};
    
    if (!name.trim()) {
      newErrors.name = 'List name is required';
    }
    
    if (weeklyBudget < 0) {
      newErrors.budget = 'Budget cannot be negative';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      onSave(name, weeklyBudget, selectedMembers);
    } catch (error) {
      console.error('Error saving list:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddMember = (member: FamilyMember) => {
    if (!selectedMembers.includes(member.name)) {
      setSelectedMembers(prev => [...prev, member.name]);
    }
  };

  const handleRemoveMember = (memberName: string) => {
    setSelectedMembers(prev => prev.filter(name => name !== memberName));
  };

  const handleAddByEmail = () => {
    if (!newMemberEmail.trim()) return;
    
    // Check if email is already in the list
    const existingMember = availableFamilyMembers.find(
      m => m.email.toLowerCase() === newMemberEmail.toLowerCase()
    );
    
    if (existingMember) {
      if (!selectedMembers.includes(existingMember.name)) {
        setSelectedMembers(prev => [...prev, existingMember.name]);
      }
    } else {
      // Add by email directly
      const newName = newMemberEmail.split('@')[0];
      if (!selectedMembers.includes(newName)) {
        setSelectedMembers(prev => [...prev, newName]);
      }
    }
    
    setNewMemberEmail('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-lg w-full mx-4 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Edit2 className="h-5 w-5 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Edit Shopping List</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab('details')}
            className={`flex-1 px-4 py-2 font-medium transition-colors ${
              activeTab === 'details'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            List Details
          </button>
          <button
            onClick={() => setActiveTab('sharing')}
            className={`flex-1 px-4 py-2 font-medium transition-colors ${
              activeTab === 'sharing'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Sharing
          </button>
        </div>

        {activeTab === 'details' && (
          <div className="space-y-6">
            {/* List Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                List Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.name ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="e.g., Weekly Groceries, Party Supplies"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            {/* Budget */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Budget
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Target className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={weeklyBudget || ''}
                  onChange={(e) => setWeeklyBudget(parseFloat(e.target.value) || 0)}
                  className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.budget ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="0.00"
                />
              </div>
              {errors.budget && (
                <p className="mt-1 text-sm text-red-600">{errors.budget}</p>
              )}
              <p className="mt-1 text-sm text-gray-500">
                Set a spending target for this list
              </p>
            </div>

            {/* Budget Presets */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Budget Presets
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[300, 500, 800, 1200].map((amount) => (
                  <button
                    key={amount}
                    onClick={() => setWeeklyBudget(amount)}
                    className={`p-2 text-sm rounded border ${
                      weeklyBudget === amount
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {formatCurrency(amount)}
                  </button>
                ))}
              </div>
            </div>

            {/* List Statistics */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">List Statistics</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Created:</span>
                  <span className="ml-2 font-medium">Today</span>
                </div>
                <div>
                  <span className="text-gray-600">Items:</span>
                  <span className="ml-2 font-medium">0</span>
                </div>
                <div>
                  <span className="text-gray-600">Shared with:</span>
                  <span className="ml-2 font-medium">{selectedMembers.length} members</span>
                </div>
                <div>
                  <span className="text-gray-600">Status:</span>
                  <span className="ml-2 font-medium">Active</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'sharing' && (
          <div className="space-y-6">
            <h4 className="font-medium text-gray-900 mb-4">Share with Family Members</h4>
            
            {/* Available Family Members */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Available Family Members
              </label>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {availableFamilyMembers.map((member) => {
                  const isSelected = selectedMembers.includes(member.name);
                  return (
                    <div 
                      key={member.id}
                      className={`flex items-center justify-between p-3 rounded-lg border ${
                        isSelected 
                          ? 'border-green-200 bg-green-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <img 
                          src={member.avatar}
                          alt={member.name}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                        <div>
                          <p className="font-medium text-gray-900">{member.name}</p>
                          <div className="flex items-center text-xs text-gray-500">
                            {member.role === 'admin' ? (
                              <span className="flex items-center">
                                <Crown className="h-3 w-3 text-yellow-600 mr-1" />
                                Admin
                              </span>
                            ) : (
                              <span className="flex items-center">
                                <Shield className="h-3 w-3 text-blue-600 mr-1" />
                                Member
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => isSelected ? handleRemoveMember(member.name) : handleAddMember(member)}
                        className={`px-3 py-1 rounded text-xs font-medium ${
                          isSelected
                            ? 'bg-red-100 text-red-700 hover:bg-red-200'
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                      >
                        {isSelected ? 'Remove' : 'Add'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Add by Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Add by Email
              </label>
              <div className="flex space-x-2">
                <input
                  type="email"
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                  placeholder="family.member@email.com"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  onClick={handleAddByEmail}
                  disabled={!newMemberEmail.trim()}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors"
                >
                  <UserPlus className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            {/* Selected Members */}
            {selectedMembers.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Currently Shared With ({selectedMembers.length})
                </label>
                <div className="space-y-2">
                  {selectedMembers.map((name, index) => {
                    const memberDetails = availableFamilyMembers.find(m => m.name === name);
                    return (
                      <div 
                        key={index}
                        className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          {memberDetails ? (
                            <img 
                              src={memberDetails.avatar}
                              alt={name}
                              className="w-6 h-6 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center">
                              <span className="text-xs font-medium text-blue-700">{name.charAt(0)}</span>
                            </div>
                          )}
                          <span className="font-medium text-blue-800">{name}</span>
                        </div>
                        <button
                          onClick={() => handleRemoveMember(name)}
                          className="p-1 text-blue-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            
            {/* Sharing Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h5 className="font-medium text-blue-900 mb-2">Sharing Information</h5>
              <p className="text-sm text-blue-700">
                Shared members will be able to view and edit this shopping list. They will receive notifications when items are added or completed.
              </p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-3 mt-8">
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>Save Changes</span>
              </>
            )}
          </button>
          <button
            onClick={onClose}
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