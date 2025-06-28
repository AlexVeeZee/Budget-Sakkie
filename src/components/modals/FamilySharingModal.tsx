import React, { useState, useEffect } from 'react';
import { X, Users, Plus, Mail, Crown, Shield, Trash2, UserPlus, Settings, Share2, Edit2, Loader2 } from 'lucide-react';
import { EditFamilyMemberModal } from './EditFamilyMemberModal';
import { DeleteFamilyMemberModal } from './DeleteFamilyMemberModal';
import { useFamily } from '../../hooks/useFamily';
import { FamilyMember } from '../../types/family';
import { AddFamilyMemberForm } from '../family/AddFamilyMemberForm';
import { FamilyMembersList } from '../family/FamilyMembersList';
import { FamilyInvitationsList } from '../family/FamilyInvitationsList';
import { FamilyService } from '../../services/familyService';
import { useAuthStore } from '../../store/authStore';

interface FamilySharingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FamilySharingModal: React.FC<FamilySharingModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuthStore();
  const { 
    currentFamily, 
    invitations, 
    loading, 
    error, 
    updateMemberRole, 
    removeMember 
  } = useFamily();
  
  const [activeTab, setActiveTab] = useState<'members' | 'invitations' | 'settings'>('members');
  const [showAddMemberForm, setShowAddMemberForm] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  const handleRefresh = async () => {
    setRefreshing(true);
    // In a real implementation, this would call a method to refresh the family data
    // For now, we'll just simulate a delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };
  
  const handleAcceptInvitation = async (invitationId: string) => {
    return await FamilyService.acceptInvitation(invitationId);
  };
  
  const handleDeclineInvitation = async (invitationId: string) => {
    return await FamilyService.declineInvitation(invitationId);
  };
  
  if (!isOpen) return null;
  
  const isLoading = loading || refreshing;
  
  return (
    <div 
      className="fixed inset-0 z-50 flex"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
    >
      <div 
        className="w-full max-w-5xl bg-white shadow-2xl overflow-hidden border-l border-gray-200 m-auto rounded-xl"
        style={{ maxHeight: '90vh' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-green-600 via-orange-500 to-blue-600 text-white">
          <div className="flex items-center space-x-3">
            <Users className="h-6 w-6" />
            <div>
              <h2 className="text-2xl font-bold">Family Sharing</h2>
              <p className="text-white/80">
                {currentFamily ? `${currentFamily.members.length} members` : 'Manage your family group'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-black/10 rounded-lg transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Tabs */}
        <div 
          className="flex border-b border-gray-200"
          style={{ backgroundColor: '#ffffff' }}
        >
          <button
            onClick={() => setActiveTab('members')}
            className={`flex-1 px-6 py-3 font-medium transition-colors ${
              activeTab === 'members'
                ? 'text-green-600 border-b-2 border-green-600 bg-green-50'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Family Members
          </button>
          <button
            onClick={() => setActiveTab('invitations')}
            className={`flex-1 px-6 py-3 font-medium transition-colors ${
              activeTab === 'invitations'
                ? 'text-green-600 border-b-2 border-green-600 bg-green-50'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Invitations
            {invitations.length > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                {invitations.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex-1 px-6 py-3 font-medium transition-colors ${
              activeTab === 'settings'
                ? 'text-green-600 border-b-2 border-green-600 bg-green-50'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Settings
          </button>
        </div>

        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 180px)' }}>
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-12 w-12 animate-spin text-green-600" />
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-red-800 mb-2">Error</h3>
              <p className="text-red-700">{error}</p>
              <button
                onClick={handleRefresh}
                className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : !currentFamily ? (
            <div className="text-center py-12">
              <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Family Group Yet</h3>
              <p className="text-gray-600 mb-6">
                Create a family group to start sharing shopping lists and budgets with your family members.
              </p>
              <button
                onClick={() => {/* Create family action */}}
                className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors"
              >
                <Plus className="h-5 w-5 inline-block mr-2" />
                Create Family Group
              </button>
            </div>
          ) : (
            <>
              {activeTab === 'members' && (
                <div className="space-y-6">
                  {/* Add Member Button */}
                  {!showAddMemberForm ? (
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Family Members</h3>
                      <button
                        onClick={() => setShowAddMemberForm(true)}
                        className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
                      >
                        <UserPlus className="h-4 w-4" />
                        <span>Invite Member</span>
                      </button>
                    </div>
                  ) : (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Invite Family Member</h3>
                      <AddFamilyMemberForm
                        familyId={currentFamily.id}
                        onSuccess={() => {
                          setShowAddMemberForm(false);
                          handleRefresh();
                        }}
                        onCancel={() => setShowAddMemberForm(false)}
                      />
                    </div>
                  )}

                  {/* Members List */}
                  {!showAddMemberForm && (
                    <FamilyMembersList
                      members={currentFamily.members}
                      currentUserId={user?.id || ''}
                      onUpdateRole={updateMemberRole}
                      onRemoveMember={removeMember}
                    />
                  )}
                </div>
              )}

              {activeTab === 'invitations' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Pending Invitations</h3>
                  <FamilyInvitationsList
                    invitations={invitations}
                    onAcceptInvitation={handleAcceptInvitation}
                    onDeclineInvitation={handleDeclineInvitation}
                  />
                </div>
              )}

              {activeTab === 'settings' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Family Settings</h3>
                  
                  <div className="space-y-4">
                    <div 
                      className="p-6 rounded-lg border border-gray-200"
                      style={{ backgroundColor: '#f9fafb' }}
                    >
                      <h4 className="font-semibold text-gray-900 mb-4">Family Information</h4>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Family Name</label>
                          <input
                            type="text"
                            value={currentFamily.name}
                            readOnly
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-700"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Created By</label>
                          <input
                            type="text"
                            value={currentFamily.members.find(m => m.id === currentFamily.createdBy)?.name || 'Unknown'}
                            readOnly
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-700"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Created On</label>
                          <input
                            type="text"
                            value={new Date(currentFamily.createdAt).toLocaleDateString()}
                            readOnly
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-700"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div 
                      className="p-6 rounded-lg border border-gray-200"
                      style={{ backgroundColor: '#f9fafb' }}
                    >
                      <h4 className="font-semibold text-gray-900 mb-4">Default Permissions for New Members</h4>
                      
                      <div className="space-y-3">
                        {[
                          { key: 'viewLists', label: 'View shopping lists' },
                          { key: 'editLists', label: 'Edit shopping lists' },
                          { key: 'createLists', label: 'Create new lists' },
                          { key: 'viewBudget', label: 'View family budget' },
                          { key: 'editBudget', label: 'Edit family budget' }
                        ].map((permission) => (
                          <div key={permission.key} className="flex items-center justify-between">
                            <span className="text-gray-700">{permission.label}</span>
                            <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-green-600">
                              <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div 
                      className="p-6 rounded-lg border border-red-200"
                      style={{ backgroundColor: '#fef2f2' }}
                    >
                      <h4 className="font-semibold text-red-900 mb-2">Danger Zone</h4>
                      <p className="text-sm text-red-700 mb-4">
                        These actions cannot be undone. Please be careful.
                      </p>
                      
                      <div className="space-y-3">
                        <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors">
                          Leave Family Group
                        </button>
                        {currentFamily.createdBy === user?.id && (
                          <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors">
                            Delete Family Group
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};