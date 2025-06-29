import React, { useState, useEffect } from 'react';
import { X, Save, ShoppingCart, DollarSign, Users, UserPlus } from 'lucide-react';
import { useCurrency } from '../../hooks/useCurrency';
import { ShoppingList } from '../../types';
import { FamilyService } from '../../services/familyService';
import { useAuthStore } from '../../store/authStore';
import { Shield, Users, Plus, /* other existing imports */ } from 'lucide-react';

interface FamilyMember {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'member';
  avatar?: string;
  status: 'active' | 'pending' | 'inactive';
}

interface CreateListModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (list: Omit<ShoppingList, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

export const CreateListModal: React.FC<CreateListModalProps> = ({
  isOpen,
  onClose,
  onCreate
}) => {
  const { formatCurrency } = useCurrency();
  const { user } = useAuthStore();
  const [name, setName] = useState('');
  const [budget, setBudget] = useState(0);
  const [sharedWith, setSharedWith] = useState<string[]>([]);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; budget?: string; email?: string }>({});
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [familyId, setFamilyId] = useState<string | null>(null);

  // Load family members when modal opens
  useEffect(() => {
    if (isOpen) {
      loadFamilyMembers();
    }
  }, [isOpen]);

  const loadFamilyMembers = async () => {
    try {
      setLoadingMembers(true);
      const { family, error } = await FamilyService.getUserFamily();
      
      if (error) {
        console.error('Error loading family:', error);
        return;
      }

      if (family) {
        setFamilyId(family.id);
        setFamilyMembers(family.members.filter(member => member.id !== user?.id));
      }
    } catch (error) {
      console.error('Error loading family members:', error);
    } finally {
      setLoadingMembers(false);
    }
  };

  const validateForm = () => {
    const newErrors: { name?: string; budget?: string; email?: string } = {};
    
    if (!name.trim()) {
      newErrors.name = 'List name is required';
    } else if (name.trim().length < 2) {
      newErrors.name = 'List name must be at least 2 characters';
    }
    
    if (budget < 0) {
      newErrors.budget = 'Budget cannot be negative';
    } else if (budget > 10000) {
      newErrors.budget = 'Budget seems too high, please check';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreate = async () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newList: Omit<ShoppingList, 'id' | 'createdAt' | 'updatedAt'> = {
        name: name.trim(),
        items: [],
        sharedWith,
        budget: budget || undefined,
        familyId: sharedWith.length > 0 ? familyId : undefined
      };
      
      onCreate(newList);
      handleClose();
    } catch (error) {
      console.error('Error creating list:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setName('');
    setBudget(0);
    setSharedWith([]);
    setNewMemberEmail('');
    setErrors({});
    onClose();
  };

  const handleAddMember = (member: FamilyMember) => {
    if (!sharedWith.includes(member.name)) {
      setSharedWith(prev => [...prev, member.name]);
    }
  };

  const handleRemoveMember = (member: string) => {
    setSharedWith(prev => prev.filter(m => m !== member));
  };

  const handleAddByEmail = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!newMemberEmail.trim()) {
      setErrors(prev => ({ ...prev, email: 'Email is required' }));
      return;
    }
    
    if (!emailRegex.test(newMemberEmail)) {
      setErrors(prev => ({ ...prev, email: 'Please enter a valid email address' }));
      return;
    }
    
    if (sharedWith.includes(newMemberEmail)) {
      setErrors(prev => ({ ...prev, email: 'This person is already added' }));
      return;
    }
    
    setSharedWith(prev => [...prev, newMemberEmail]);
    setNewMemberEmail('');
    setErrors(prev => ({ ...prev, email: undefined }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-lg w-full mx-4 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <ShoppingCart className="h-5 w-5 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Create New Shopping List</h3>
          </div>
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
              List Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                errors.name ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="e.g., Weekly Groceries, Party Supplies"
              style={{ 
                fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif',
                fontSize: '16px'
              }}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          {/* Budget */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Budget (Optional)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <DollarSign className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="number"
                min="0"
                step="0.01"
                value={budget || ''}
                onChange={(e) => setBudget(parseFloat(e.target.value) || 0)}
                className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
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
              Set a spending target for this list
            </p>
          </div>

          {/* Family Sharing */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              <Users className="h-4 w-4 inline mr-2" />
              Share with Family Members
            </label>
            
            {!familyId ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <h4 className="font-medium text-yellow-800 mb-2">No Family Group</h4>
                <p className="text-sm text-yellow-700">
                  You need to create or join a family group before you can share lists.
                  Visit the Family tab to create or join a family.
                </p>
              </div>
            ) : loadingMembers ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              </div>
            ) : (
              <>
                {/* Available Family Members */}
                <div className="space-y-2 mb-4">
                  <p className="text-sm text-gray-600">Available family members:</p>
                  {familyMembers.length === 0 ? (
                    <div className="text-center py-4 bg-gray-50 rounded-lg">
                      <p className="text-gray-500 text-sm">No family members found</p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {familyMembers.map((member) => {
                        const isSelected = sharedWith.includes(member.name);
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
                                src={member.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=random`}
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
                              type="button"
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
                  )}
                </div>

                {/* Add by Email */}
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">Or add by email:</p>
                  <div className="flex space-x-2">
                    <input
                      type="email"
                      value={newMemberEmail}
                      onChange={(e) => setNewMemberEmail(e.target.value)}
                      className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                        errors.email ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="family.member@email.com"
                      style={{ 
                        fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif',
                        fontSize: '16px'
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleAddByEmail}
                      className="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors"
                    >
                      <UserPlus className="h-4 w-4" />
                    </button>
                  </div>
                  {errors.email && (
                    <p className="text-sm text-red-600">{errors.email}</p>
                  )}
                </div>

                {/* Selected Members */}
                {sharedWith.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      Sharing with ({sharedWith.length}):
                    </p>
                    <div className="space-y-2">
                      {sharedWith.map((member, index) => {
                        const memberDetails = familyMembers.find(m => m.name === member);
                        return (
                          <div 
                            key={index}
                            className="flex items-center justify-between p-2 bg-blue-50 rounded-lg border border-blue-200"
                          >
                            <div className="flex items-center space-x-2">
                              {memberDetails ? (
                                <img 
                                  src={memberDetails.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(member)}&background=random`}
                                  alt={member}
                                  className="w-6 h-6 rounded-full object-cover"
                                />
                              ) : (
                                <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center">
                                  <span className="text-xs font-medium text-blue-700">{member.charAt(0)}</span>
                                </div>
                              )}
                              <span className="text-sm font-medium text-blue-800">{member}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveMember(member)}
                              className="text-red-600 hover:text-red-700 text-sm p-1"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Preview */}
          {(name || budget > 0 || sharedWith.length > 0) && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-medium text-green-800 mb-2">List Preview</h4>
              <div className="space-y-1 text-sm text-green-700">
                <p><strong>Name:</strong> {name || 'Untitled List'}</p>
                {budget > 0 && <p><strong>Budget:</strong> {formatCurrency(budget)}</p>}
                <p><strong>Shared with:</strong> {sharedWith.length} member{sharedWith.length !== 1 ? 's' : ''}</p>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3 mt-8">
          <button
            type="button"
            onClick={handleCreate}
            disabled={isLoading || !name.trim()}
            className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            <span>{isLoading ? 'Creating...' : 'Create List'}</span>
          </button>
          <button
            type="button"
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