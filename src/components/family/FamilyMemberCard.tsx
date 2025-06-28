import React, { useState } from 'react';
import { Crown, Shield, MoreVertical, Edit2, Trash2, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { FamilyMember } from '../../types/family';

interface FamilyMemberCardProps {
  member: FamilyMember;
  currentUserId: string;
  onEdit?: (member: FamilyMember) => void;
  onRemove?: (memberId: string) => void;
  onUpdateRole?: (memberId: string, newRole: 'admin' | 'member') => void;
}

export const FamilyMemberCard: React.FC<FamilyMemberCardProps> = ({
  member,
  currentUserId,
  onEdit,
  onRemove,
  onUpdateRole
}) => {
  const [showActions, setShowActions] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const handleRoleChange = async (newRole: 'admin' | 'member') => {
    if (!onUpdateRole) return;
    
    setProcessing(true);
    setError(null);
    
    try {
      await onUpdateRole(member.id, newRole);
      setShowActions(false);
    } catch (error) {
      setError('Failed to update role');
      console.error('Error updating role:', error);
    } finally {
      setProcessing(false);
    }
  };

  const handleRemove = () => {
    if (!onRemove) return;
    
    if (window.confirm(`Are you sure you want to remove ${member.name} from the family?`)) {
      onRemove(member.id);
    }
  };

  // Don't show actions for current user
  const canShowActions = member.id !== currentUserId && (onEdit || onRemove || onUpdateRole);

  return (
    <div className="p-4 rounded-xl border border-gray-200 hover:shadow-sm transition-shadow bg-white">
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
            {member.relationship && (
              <p className="text-sm text-blue-600 mt-1">
                Relationship: {member.relationship}
              </p>
            )}
          </div>
        </div>
        
        {canShowActions && (
          <div className="relative">
            <button 
              onClick={() => setShowActions(!showActions)}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              disabled={processing}
            >
              {processing ? (
                <div className="h-5 w-5 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
              ) : (
                <MoreVertical className="h-5 w-5" />
              )}
            </button>
            
            {showActions && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200">
                {onEdit && (
                  <button
                    onClick={() => {
                      setShowActions(false);
                      onEdit(member);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                  >
                    <Edit2 className="h-4 w-4" />
                    <span>Edit Member</span>
                  </button>
                )}
                
                {onUpdateRole && member.role === 'admin' && (
                  <button
                    onClick={() => handleRoleChange('member')}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                  >
                    <Shield className="h-4 w-4 text-blue-600" />
                    <span>Change to Member</span>
                  </button>
                )}
                
                {onUpdateRole && member.role === 'member' && (
                  <button
                    onClick={() => handleRoleChange('admin')}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                  >
                    <Crown className="h-4 w-4 text-yellow-600" />
                    <span>Make Admin</span>
                  </button>
                )}
                
                {onRemove && (
                  <button
                    onClick={handleRemove}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Remove Member</span>
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
      
      {error && (
        <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
      
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
  );
};