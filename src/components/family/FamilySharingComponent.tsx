import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { FamilyMember } from '../../types/family';
import { familySharingHandler } from '../../utils/familySharingHandler';
import { FamilyMembersList } from './FamilyMembersList';
import { AddFamilyMemberForm } from './AddFamilyMemberForm';
import { useAuthStore } from '../../store/authStore';

export const FamilySharingComponent: React.FC = () => {
  const { user } = useAuthStore();
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEmpty, setIsEmpty] = useState(false);
  const [showAddMemberForm, setShowAddMemberForm] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  // Initial load to check if family_members is empty and fetch members if not
  useEffect(() => {
    const initializeFamilySharing = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // First check if the family_members table is empty for this user
        const { isEmpty: emptyCheck, error: emptyError } = await familySharingHandler.checkFamilyMembersEmpty();
        
        if (emptyError) {
          setError(emptyError);
          setLoading(false);
          return;
        }
        
        setIsEmpty(emptyCheck);
        
        // If not empty, fetch the family members
        if (!emptyCheck) {
          const { members: familyMembers, error: membersError } = await familySharingHandler.fetchFamilyMembers();
          
          if (membersError) {
            setError(membersError);
          } else {
            setMembers(familyMembers);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };
    
    initializeFamilySharing();
  }, []);
  
  // Function to refresh the family members list
  const handleRefresh = async () => {
    setRefreshing(true);
    setError(null);
    
    try {
      const { members: refreshedMembers, error: refreshError } = await familySharingHandler.refreshFamilyMembers();
      
      if (refreshError) {
        setError(refreshError);
      } else {
        setMembers(refreshedMembers);
        setIsEmpty(refreshedMembers.length === 0);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred while refreshing');
    } finally {
      setRefreshing(false);
    }
  };
  
  // Function to handle adding a new family member
  const handleAddMember = async (email: string, fullName: string, relationship: string, role: 'admin' | 'member') => {
    setError(null);
    
    try {
      const { success, error: addError } = await familySharingHandler.addFamilyMember(
        email,
        fullName,
        relationship,
        role
      );
      
      if (!success) {
        setError(addError);
        return { success, error: addError };
      }
      
      // Refresh the members list after adding
      await handleRefresh();
      return { success: true, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };
  
  // Function to handle updating a member's role
  const handleUpdateRole = async (memberId: string, newRole: 'admin' | 'member') => {
    setError(null);
    
    try {
      const { success, error: updateError } = await familySharingHandler.updateFamilyMemberRole(
        memberId,
        newRole
      );
      
      if (!success) {
        setError(updateError);
        return { success, error: updateError };
      }
      
      // Refresh the members list after updating
      await handleRefresh();
      return { success: true, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };
  
  // Function to handle removing a member
  const handleRemoveMember = async (memberId: string) => {
    setError(null);
    
    try {
      const { success, error: removeError } = await familySharingHandler.removeFamilyMember(memberId);
      
      if (!success) {
        setError(removeError);
        return { success, error: removeError };
      }
      
      // Refresh the members list after removing
      await handleRefresh();
      return { success: true, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };
  
  // Function to handle creating a new family
  const handleCreateFamily = async (familyName: string) => {
    setError(null);
    setLoading(true);
    
    try {
      const { success, familyId, error: createError } = await familySharingHandler.createFamily(familyName);
      
      if (!success) {
        setError(createError);
        setLoading(false);
        return { success, error: createError };
      }
      
      // Refresh the members list after creating
      await handleRefresh();
      return { success: true, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      setLoading(false);
      return { success: false, error: errorMessage };
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-12 w-12 animate-spin text-green-600" />
      </div>
    );
  }
  
  if (error) {
    return (
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
    );
  }
  
  if (isEmpty) {
    return (
      <div className="text-center py-12">
        <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-4">No Family Group Yet</h2>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          Create a family group to start sharing shopping lists and budgets with your family members.
        </p>
        
        {showAddMemberForm ? (
          <div className="max-w-md mx-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Create Your Family</h3>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Family Name
                </label>
                <input
                  type="text"
                  id="familyName"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="e.g., Smith Family"
                  onChange={(e) => {/* State would be managed here */}}
                />
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => handleCreateFamily("Smith Family")}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                  Create Family
                </button>
                <button
                  onClick={() => setShowAddMemberForm(false)}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowAddMemberForm(true)}
            className="inline-flex items-center space-x-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors"
          >
            <UserPlus className="h-5 w-5" />
            <span>Create Family Group</span>
          </button>
        )}
      </div>
    );
  }
  
  return (
    <div>
      {showAddMemberForm ? (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Family Member</h3>
          <AddFamilyMemberForm
            onSubmit={async (data) => {
              const result = await handleAddMember(
                data.email,
                data.fullName,
                data.relationship,
                data.accessLevel === 'editor' ? 'admin' : 'member'
              );
              
              if (result.success) {
                setShowAddMemberForm(false);
              }
              
              return result;
            }}
            onCancel={() => setShowAddMemberForm(false)}
          />
        </div>
      ) : (
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Family Members</h3>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleRefresh}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                title="Refresh"
                disabled={refreshing}
              >
                {refreshing ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <RefreshCw className="h-5 w-5" />
                )}
              </button>
              <button
                onClick={() => setShowAddMemberForm(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
              >
                <UserPlus className="h-4 w-4" />
                <span>Add Family Member</span>
              </button>
            </div>
          </div>
        </div>
      )}
      
      <FamilyMembersList
        members={members}
        currentUserId={user?.id || ''}
        onUpdateRole={handleUpdateRole}
        onRemoveMember={handleRemoveMember}
        isLoading={refreshing}
      />
    </div>
  );
};