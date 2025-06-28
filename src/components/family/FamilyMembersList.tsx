import React, { useState } from 'react';
import { Crown, Shield, MoreVertical, Edit2, Trash2, Clock, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { FamilyMember } from '../../types/family';
import { DeleteFamilyMemberModal } from '../modals/DeleteFamilyMemberModal';
import { EditFamilyMemberModal } from '../modals/EditFamilyMemberModal';

interface FamilyMembersListProps {
  members: FamilyMember[];
  currentUserId: string;
  onUpdateRole: (memberId: string, newRole: 'admin' | 'member') => Promise<{ success: boolean; error?: string }>;
  onRemoveMember: (memberId: string) => Promise<{ success: boolean; error?: string }>;
  isLoading?: boolean;
}

export const FamilyMembersList: React.FC<FamilyMembersListProps> = ({
  members,
  currentUserId,
  onUpdateRole,
  onRemoveMember,
  isLoading = false
}) => {
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null);
  const [deletingMember, setDeletingMember] = useState<FamilyMember | null>(null);
  const [actionMemberId, setActionMemberId] = useState<string | null>(null);
  const [showActionsFor, setShowActionsFor] = useState<string | null>(null);
  const [processingAction, setProcessingAction] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'inactive': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getRoleIcon = (role: string) => {
    return role === 'admin' ? <Crown className="h-4 w-4 text-yellow-600" /> : <Shield className="h-4 w-4 text-blue-600" />;
  };

  const handleRoleChange = async (memberId: string, newRole: 'admin' | 'member') => {
    setProcessingAction(memberId);
    setActionError(null);
    
    try {
      const { success, error } = await onUpdateRole(memberId, newRole);
      
      if (!success) {
        setActionError(error || 'Failed to update role');
      }
    } catch (error) {
      setActionError('An unexpected error occurred');
      console.error('Error updating role:', error);
    } finally {
      setProcessingAction(null);
      setShowActionsFor(null);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    setDeletingMember(null);
    setProcessingAction(memberId);
    setActionError(null);
    
    try {
      const { success, error } = await onRemoveMember(memberId);
      
      if (!success) {
        setActionError(error || 'Failed to remove member');
      }
    } catch (error) {
      setActionError('An unexpected error occurred');
      console.error('Error removing member:', error);
    } finally {
      setProcessingAction(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    );
  }

  if (members.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-gray-600">No family members found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {actionError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 flex items-start space-x-3">
          <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
          <p className="text-red-700">{actionError}</p>
        </div>
      )}
      
      {members.map((member) => (
        <div 
          key={member.id}
          className="p-4 rounded-xl border border-gray-200 hover:shadow-sm transition-shadow"
          style={{ backgroundColor: '#ffffff' }}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <img 
                src={member.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=random`}
                alt={member.name}
                className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
              />
              
              <div>
                <div className="flex items-center space-x-3 mb-1">
                  <h4 className="text-lg font-bold text-gray-900">{member.name}</h4>
                  <div className="flex items-center space-x-1">
                    {getRoleIcon(member.role)}
                    <span className="text-sm font-medium text-gray-600 capitalize">{member.role}</span>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(member.status)}`}>
                    {member.status}
                  </span>
                </div>
                
                <p className="text-gray-600 mb-1">{member.email}</p>
                <p className="text-sm text-gray-500">
                  Joined: {new Date(member.joinedDate).toLocaleDateString()}
                </p>
              </div>
            </div>
            
            {/* Only show actions for other members, not current user */}
            {member.id !== currentUserId && (
              <div className="relative">
                <button 
                  onClick={() => setShowActionsFor(showActionsFor === member.id ? null : member.id)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  disabled={!!processingAction}
                >
                  {processingAction === member.id ? (
                    <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                  ) : (
                    <MoreVertical className="h-5 w-5" />
                  )}
                </button>
                
                {showActionsFor === member.id && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200">
                    <button
                      onClick={() => setEditingMember(member)}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                    >
                      <Edit2 className="h-4 w-4" />
                      <span>Edit Member</span>
                    </button>
                    
                    {member.role === 'admin' ? (
                      <button
                        onClick={() => handleRoleChange(member.id, 'member')}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                      >
                        <Shield className="h-4 w-4 text-blue-600" />
                        <span>Change to Member</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleRoleChange(member.id, 'admin')}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                      >
                        <Crown className="h-4 w-4 text-yellow-600" />
                        <span>Make Admin</span>
                      </button>
                    )}
                    
                    <button
                      onClick={() => setDeletingMember(member)}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Remove Member</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Permissions */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <h5 className="text-sm font-medium text-gray-700 mb-2">Permissions</h5>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {Object.entries(member.permissions).map(([permission, allowed]) => (
                <div 
                  key={permission}
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    allowed ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {permission.replace(/([A-Z])/g, ' $1').toLowerCase()}
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
      
      {/* Edit Member Modal */}
      {editingMember && (
        <EditFamilyMemberModal
          isOpen={!!editingMember}
          onClose={() => setEditingMember(null)}
          member={editingMember}
          onSave={(updatedMember) => {
            // This would be handled by the parent component through a callback
            // that refreshes the member list from the database
            setEditingMember(null);
          }}
        />
      )}
      
      {/* Delete Member Modal */}
      {deletingMember && (
        <DeleteFamilyMemberModal
          isOpen={!!deletingMember}
          onClose={() => setDeletingMember(null)}
          member={deletingMember}
          onConfirm={() => handleRemoveMember(deletingMember.id)}
        />
      )}
    </div>
  );
};