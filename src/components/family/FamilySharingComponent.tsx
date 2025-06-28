import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { useFamily } from '../../hooks/useFamily';
import { FamilyMembersList } from './FamilyMembersList';
import { AddFamilyMemberForm } from './AddFamilyMemberForm';
import { CreateFamilyForm } from './CreateFamilyForm';

export const FamilySharingComponent: React.FC = () => {
  const { 
    currentFamily, 
    members, 
    loading, 
    error, 
    createFamily, 
    updateMemberRole, 
    removeMember 
  } = useFamily();
  
  const [showAddMemberForm, setShowAddMemberForm] = useState(false);
  const [showCreateFamilyForm, setShowCreateFamilyForm] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  const handleRefresh = async () => {
    setRefreshing(true);
    // In a real implementation, this would call a method to refresh the family data
    // For now, we'll just simulate a delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };
  
  const handleAddMember = async (
    firstName: string,
    lastName: string,
    email: string,
    role: 'parent' | 'child' | 'guardian' | 'spouse' | 'sibling' | 'other',
    isAdmin: boolean
  ) => {
    if (!currentFamily) return;
    
    try {
      // In a real implementation, this would call the FamilyService.addFamilyMember method
      // For now, we'll just simulate a delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      setShowAddMemberForm(false);
    } catch (error) {
      console.error('Error adding family member:', error);
    }
  };
  
  const handleCreateFamilySubmit = async (familyName: string) => {
    try {
      await createFamily(familyName);
      setShowCreateFamilyForm(false);
    } catch (error) {
      console.error('Error creating family:', error);
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
  
  if (!currentFamily) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-sm">
        {showCreateFamilyForm ? (
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Create a Family</h3>
            <CreateFamilyForm 
              onSubmit={handleCreateFamilySubmit}
              onCancel={() => setShowCreateFamilyForm(false)}
            />
          </div>
        ) : (
          <div className="text-center py-12">
            <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No Family Group Yet</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Create a family group to start sharing shopping lists and budgets with your family members.
            </p>
            <button
              onClick={() => setShowCreateFamilyForm(true)}
              className="inline-flex items-center space-x-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors"
            >
              <Users className="h-5 w-5" />
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
          <h2 className="text-2xl font-bold text-gray-900 mb-1">{currentFamily.family_name}</h2>
          <p className="text-gray-600">
            {members.length} member{members.length !== 1 ? 's' : ''}
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={handleRefresh}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            title="Refresh"
          >
            <RefreshCw className="h-5 w-5" />
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
          onUpdateMember={updateMemberRole}
          onRemoveMember={removeMember}
        />
      </div>
    </div>
  );
};