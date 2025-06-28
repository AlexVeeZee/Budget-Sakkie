import React, { useState } from 'react';
import { X, Save, User, Mail, Crown, Shield } from 'lucide-react';
import { FamilyMember } from '../../types/family';

interface EditMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: FamilyMember;
  onSave: (member: FamilyMember, updates: any) => Promise<void>;
}

export const EditMemberModal: React.FC<EditMemberModalProps> = ({
  isOpen,
  onClose,
  member,
  onSave
}) => {
  const [role, setRole] = useState(member.role);
  const [isAdmin, setIsAdmin] = useState(member.is_admin);
  const [status, setStatus] = useState(member.status);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const roles = [
    { value: 'parent', label: 'Parent' },
    { value: 'child', label: 'Child' },
    { value: 'guardian', label: 'Guardian' },
    { value: 'spouse', label: 'Spouse' },
    { value: 'sibling', label: 'Sibling' },
    { value: 'other', label: 'Other' }
  ];

  const statuses = [
    { value: 'active', label: 'Active' },
    { value: 'pending', label: 'Pending' },
    { value: 'inactive', label: 'Inactive' }
  ];

  const handleSave = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const updates = {
        role: role as 'parent' | 'child' | 'guardian' | 'spouse' | 'sibling' | 'other',
        isAdmin,
        status: status as 'active' | 'pending' | 'inactive'
      };
      
      await onSave(member, updates);
      onClose();
    } catch (error) {
      console.error('Error updating member:', error);
      setError(error instanceof Error ? error.message : 'Failed to update member');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">Edit Family Member</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Member Info (Read-only) */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center space-x-4 mb-4">
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
                <h4 className="font-semibold text-gray-900">{member.first_name} {member.last_name}</h4>
                <p className="text-sm text-gray-600">{member.email}</p>
              </div>
            </div>
          </div>

          {/* Role Selection */}
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
              Relationship
            </label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              {roles.map(r => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>

          {/* Admin Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Access Level
            </label>
            <div className="space-y-3">
              <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="radio"
                  checked={!isAdmin}
                  onChange={() => setIsAdmin(false)}
                  className="h-4 w-4 text-green-600 focus:ring-green-500"
                />
                <Shield className="h-5 w-5 text-blue-600" />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Member</p>
                  <p className="text-sm text-gray-600">Limited access to family settings</p>
                </div>
              </label>
              
              <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="radio"
                  checked={isAdmin}
                  onChange={() => setIsAdmin(true)}
                  className="h-4 w-4 text-green-600 focus:ring-green-500"
                />
                <Crown className="h-5 w-5 text-yellow-600" />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Admin</p>
                  <p className="text-sm text-gray-600">Full access to family settings</p>
                </div>
              </label>
            </div>
          </div>

          {/* Member Status */}
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              {statuses.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3 mt-8">
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            <span>{isLoading ? 'Saving...' : 'Save Changes'}</span>
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