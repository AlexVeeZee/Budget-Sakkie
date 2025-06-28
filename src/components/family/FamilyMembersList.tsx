import React, { useState } from 'react';
import { Crown, Shield, MoreVertical, Edit2, Trash2, Clock, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { FamilyMember } from '../../types/family';
import { EditMemberModal } from './EditMemberModal';
import { DeleteMemberModal } from './DeleteMemberModal';

interface FamilyMembersListProps {
  members: FamilyMember[];
  onUpdateMember: (
    memberId: string,
    updates: {
      role?: 'parent' | 'child' | 'guardian' | 'spouse' | 'sibling' | 'other';
      isAdmin?: boolean;
      status?: 'active' | 'pending' | 'inactive';
    }
  ) => Promise<void>;
  onRemoveMember: (memberId: string) => Promise<void>;
  isLoading?: boolean;
}

export const FamilyMembersList: React.FC<FamilyMembersListProps> = ({
  members,
  onUpdateMember,
  onRemoveMember,
  isLoading = false
}) => {
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null);
  const [deletingMember, setDeletingMember] = useState<FamilyMember | null>(null);
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

  const getRoleIcon = (role: string, isAdmin: boolean) => {
    return isAdmin ? <Crown className="h-4 w-4 text-yellow-600" /> : <Shield className="h-4 w-4 text-blue-600" />;
  };

  const handleRoleChange = async (memberId: string, isAdmin: boolean) => {
    setProcessingAction(memberId);
    setActionError(null);
    
    try {
      await onUpdateMember(memberId, { isAdmin });
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
      await onRemoveMember(memberId);
    } catch (error) {
      setActionError('An unexpected error occurred');
      console.error('Error removing member:', error);
    } finally {
      setProcessingAction(null);
    }
  };

  const handleEditSave = async (member: FamilyMember, updates: any) => {
    setProcessingAction(member.member_id);
    setActionError(null);
    
    try {
      await onUpdateMember(member.member_id, updates);
      setEditingMember(null);
    } catch (error) {
      setActionError('An unexpected error occurred');
      console.error('Error updating member:', error);
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
          key={member.member_id}
          className="p-4 rounded-xl border border-gray-200 hover:shadow-sm transition-shadow"
          style={{ backgroundColor: '#ffffff' }}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                {member.profile_image_url ? (
                  <img 
                    src={member.profile_image_url}
                    alt={`${member.first_name} ${member.last_name}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-lg font-semibold text-gray-600">
                    {member.first_name.charAt(0)}{member.last_name.charAt(0)}
                  </span>
                )}
              </div>
              
              <div>
                <div className="flex items-center space-x-3 mb-1">
                  <h4 className="text-lg font-bold text-gray-900">{member.first_name} {member.last_name}</h4>
                  <div className="flex items-center space-x-1">
                    {getRoleIcon(member.role, member.is_admin)}
                    <span className="text-sm font-medium text-gray-600 capitalize">
                      {member.is_admin ? 'Admin' : member.role}
                    </span>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(member.status)}`}>
                    {member.status}
                  </span>
                </div>
                
                <p className="text-gray-600 mb-1">{member.email}</p>
              </div>
            </div>
            
            <div className="relative">
              <button 
                onClick={() => setShowActionsFor(showActionsFor === member.member_id ? null : member.member_id)}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                disabled={!!processingAction}
              >
                {processingAction === member.member_id ? (
                  <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                ) : (
                  <MoreVertical className="h-5 w-5" />
                )}
              </button>
              
              {showActionsFor === member.member_id && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200">
                  <button
                    onClick={() => setEditingMember(member)}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                  >
                    <Edit2 className="h-4 w-4" />
                    <span>Edit Member</span>
                  </button>
                  
                  {member.is_admin ? (
                    <button
                      onClick={() => handleRoleChange(member.member_id, false)}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                    >
                      <Shield className="h-4 w-4 text-blue-600" />
                      <span>Remove Admin Rights</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleRoleChange(member.member_id, true)}
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
          </div>
        </div>
      ))}
      
      {/* Edit Member Modal */}
      {editingMember && (
        <EditMemberModal
          isOpen={!!editingMember}
          onClose={() => setEditingMember(null)}
          member={editingMember}
          onSave={handleEditSave}
        />
      )}
      
      {/* Delete Member Modal */}
      {deletingMember && (
        <DeleteMemberModal
          isOpen={!!deletingMember}
          onClose={() => setDeletingMember(null)}
          member={deletingMember}
          onConfirm={() => handleRemoveMember(deletingMember.member_id)}
        />
      )}
    </div>
  );
};