import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Plus, Settings, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { FamilyService } from '../../services/familyService';
import { Family, FamilyMember } from '../../types/family';
import { FamilyMembersList } from './FamilyMembersList';
import { AddFamilyMemberForm } from './AddFamilyMemberForm';
import { CreateFamilyForm } from './CreateFamilyForm';

export const FamilyManagementPanel: React.FC = () => {
  const [families, setFamilies] = useState<Family[]>([]);
  const [currentFamily, setCurrentFamily] = useState<Family | null>(null);
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddMemberForm, setShowAddMemberForm] = useState(false);
  const [showCreateFamilyForm, setShowCreateFamilyForm] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  // Load user's families on component mount
  useEffect(() => {
    loadFamilies();
  }, []);
  
  // Load family members when current family changes
  useEffect(() => {
    if (currentFamily) {
      loadFamilyMembers(currentFamily.family_id);
    }
  }, [currentFamily]);
  
  const loadFamilies = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { families, error } = await FamilyService.getUserFamilies();
      
      if (error) {
        setError(error);
        return;
      }
      
      setFamilies(families);
      
      // Set current family to the first one if available
      if (families.length > 0 && !currentFamily) {
        setCurrentFamily(families[0]);
      }
    } catch (err) {
      setError('Failed to load families');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const loadFamilyMembers = async (familyId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const { members, error } = await FamilyService.getFamilyMembers(familyId);
      
      if (error) {
        setError(error);
        return;
      }
      
      setMembers(members);
    } catch (err) {
      setError('Failed to load family members');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleCreateFamily = async (familyName: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const { family, error } = await FamilyService.createFamily(familyName);
      
      if (error) {
        setError(error);
        return;
      }
      
      if (family) {
        // Reload families
        await loadFamilies();
        setShowCreateFamilyForm(false);
      }
    } catch (err) {
      setError('Failed to create family');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleAddMember = async (
    firstName: string,
    lastName: string,
    email: string,
    role: 'parent' | 'child' | 'guardian' | 'spouse' | 'sibling' | 'other',
    isAdmin: boolean
  ) => {
    if (!currentFamily) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const { success, error } = await FamilyService.addFamilyMember(
        currentFamily.family_id,
        firstName,
        lastName,
        email,
        role,
        isAdmin
      );
      
      if (error) {
        setError(error);
        return;
      }
      
      if (success) {
        // Reload family members
        await loadFamilyMembers(currentFamily.family_id);
        setShowAddMemberForm(false);
      }
    } catch (err) {
      setError('Failed to add family member');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleUpdateMember = async (
    memberId: string,
    updates: {
      role?: 'parent' | 'child' | 'guardian' | 'spouse' | 'sibling' | 'other';
      isAdmin?: boolean;
      status?: 'active' | 'pending' | 'inactive';
    }
  ) => {
    if (!currentFamily) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const { success, error } = await FamilyService.updateFamilyMember(
        currentFamily.family_id,
        memberId,
        updates
      );
      
      if (error) {
        setError(error);
        return;
      }
      
      if (success) {
        // Reload family members
        await loadFamilyMembers(currentFamily.family_id);
      }
    } catch (err) {
      setError('Failed to update family member');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleRemoveMember = async (memberId: string) => {
    if (!currentFamily) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const { success, error } = await FamilyService.removeFamilyMember(
        currentFamily.family_id,
        memberId
      );
      
      if (error) {
        setError(error);
        return;
      }
      
      if (success) {
        // Reload family members
        await loadFamilyMembers(currentFamily.family_id);
      }
    } catch (err) {
      setError('Failed to remove family member');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleRefresh = async () => {
    setRefreshing(true);
    
    try {
      await loadFamilies();
      if (currentFamily) {
        await loadFamilyMembers(currentFamily.family_id);
      }
    } finally {
      setRefreshing(false);
    }
  };
  
  const handleFamilyChange = (familyId: string) => {
    const family = families.find(f => f.family_id === familyId);
    if (family) {
      setCurrentFamily(family);
    }
  };
  
  if (loading || refreshing) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-sm">
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-12 w-12 animate-spin text-green-600" />
          <span className="ml-3 text-lg text-gray-700">Loading family data...</span>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-sm">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-6 w-6 text-red-600 mt-0.5" />
            <div>
              <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Family Data</h3>
              <p className="text-red-700">{error}</p>
              <button
                onClick={handleRefresh}
                className="mt-4 flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Try Again</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (families.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-sm">
        {showCreateFamilyForm ? (
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Create a Family</h3>
            <CreateFamilyForm 
              onSubmit={handleCreateFamily}
              onCancel={() => setShowCreateFamilyForm(false)}
            />
          </div>
        ) : (
          <div className="text-center py-12">
            <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No Family Groups Yet</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Create a family group to start sharing shopping lists and budgets with your family members.
            </p>
            <button
              onClick={() => setShowCreateFamilyForm(true)}
              className="inline-flex items-center space-x-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors"
            >
              <Plus className="h-5 w-5" />
              <span>Create Family Group</span>
            </button>
          </div>
        )}
      </div>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">
            {currentFamily?.family_name || 'Family Management'}
          </h2>
          <div className="flex items-center space-x-4">
            {families.length > 1 && (
              <select
                value={currentFamily?.family_id || ''}
                onChange={(e) => handleFamilyChange(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                {families.map((family) => (
                  <option key={family.family_id} value={family.family_id}>
                    {family.family_name}
                  </option>
                ))}
              </select>
            )}
            <p className="text-gray-600">
              {members.length} member{members.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={handleRefresh}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            title="Refresh"
          >
            <RefreshCw className="h-5 w-5" />
          </button>
          <button
            onClick={() => {/* Family settings would go here */}}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            title="Family Settings"
          >
            <Settings className="h-5 w-5" />
          </button>
        </div>
      </div>
      
      {showAddMemberForm ? (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Family Member</h3>
          <AddFamilyMemberForm
            onSubmit={handleAddMember}
            onCancel={() => setShowAddMemberForm(false)}
          />
        </div>
      ) : (
        <div className="mb-8">
          <button
            onClick={() => setShowAddMemberForm(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
          >
            <UserPlus className="h-4 w-4" />
            <span>Add Family Member</span>
          </button>
        </div>
      )}
      
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Family Members</h3>
        <FamilyMembersList
          members={members}
          onUpdateMember={handleUpdateMember}
          onRemoveMember={handleRemoveMember}
        />
      </div>
    </div>
  );
};