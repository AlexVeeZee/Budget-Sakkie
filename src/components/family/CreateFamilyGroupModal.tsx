import React, { useState } from 'react';
import { X, Users, Save, Loader2, Mail, Crown, Shield, Trash2, Plus } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';

interface MemberInvite {
  email: string;
  role: 'admin' | 'member';
}

interface CreateFamilyGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const CreateFamilyGroupModal: React.FC<CreateFamilyGroupModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { user } = useAuthStore();
  const [groupName, setGroupName] = useState('');
  const [description, setDescription] = useState('');
  const [invites, setInvites] = useState<MemberInvite[]>([]);
  const [newInviteEmail, setNewInviteEmail] = useState('');
  const [newInviteRole, setNewInviteRole] = useState<'admin' | 'member'>('member');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{
    groupName?: string;
    description?: string;
    inviteEmail?: string;
    general?: string;
  }>({});

  // Reset form when modal opens/closes
  React.useEffect(() => {
    if (!isOpen) {
      setGroupName('');
      setDescription('');
      setInvites([]);
      setNewInviteEmail('');
      setNewInviteRole('member');
      setErrors({});
    }
  }, [isOpen]);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleAddInvite = () => {
    // Validate email
    if (!newInviteEmail.trim()) {
      setErrors(prev => ({ ...prev, inviteEmail: 'Email is required' }));
      return;
    }

    if (!validateEmail(newInviteEmail)) {
      setErrors(prev => ({ ...prev, inviteEmail: 'Please enter a valid email address' }));
      return;
    }

    // Check for duplicates
    if (invites.some(invite => invite.email.toLowerCase() === newInviteEmail.toLowerCase())) {
      setErrors(prev => ({ ...prev, inviteEmail: 'This email has already been invited' }));
      return;
    }

    // Add to invites
    setInvites(prev => [...prev, { email: newInviteEmail, role: newInviteRole }]);
    setNewInviteEmail('');
    setNewInviteRole('member');
    setErrors(prev => ({ ...prev, inviteEmail: undefined }));
  };

  const handleRemoveInvite = (email: string) => {
    setInvites(prev => prev.filter(invite => invite.email !== email));
  };

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    if (!groupName.trim()) {
      newErrors.groupName = 'Group name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    if (!user) {
      setErrors({ general: 'You must be logged in to create a family group' });
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      // 1. Create the family group
      const { data: familyData, error: familyError } = await supabase
        .from('families')
        .insert({
          name: groupName.trim(),
          description: description.trim() || null,
          created_by: user.id
        })
        .select()
        .single();

      if (familyError) {
        throw new Error(`Failed to create family group: ${familyError.message}`);
      }

      const familyId = familyData.id;

      // 2. Add current user as admin
      const { error: memberError } = await supabase
        .from('family_members')
        .insert({
          family_id: familyId,
          user_id: user.id,
          role: 'admin'
        });

      if (memberError) {
        throw new Error(`Failed to add you as admin: ${memberError.message}`);
      }

      // 3. Send invitations to other members
      for (const invite of invites) {
        const { error: inviteError } = await supabase
          .from('family_invitations')
          .insert({
            family_id: familyId,
            invited_email: invite.email,
            invited_by: user.id,
            role: invite.role,
            status: 'pending'
          });

        if (inviteError) {
          console.error(`Failed to invite ${invite.email}: ${inviteError.message}`);
          // Continue with other invites even if one fails
        }
      }

      // 4. Update user's profile with family_id
      const { error: profileError } = await supabase
        .from('user_profiles')
        .update({ family_id: familyId })
        .eq('id', user.id);

      if (profileError) {
        console.warn(`Failed to update profile: ${profileError.message}`);
        // Non-critical error, continue
      }

      // Success!
      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (error) {
      console.error('Error creating family group:', error);
      setErrors({
        general: error instanceof Error ? error.message : 'An unexpected error occurred'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-lg w-full shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-t-xl">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Create Family Group</h3>
              <p className="text-white/80 text-sm">Connect with your family members</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-2 hover:bg-black/10 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {errors.general && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700">{errors.general}</p>
            </div>
          )}

          <div className="space-y-6">
            {/* Group Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Family Group Name *
              </label>
              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                  errors.groupName ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="e.g., Smith Family, The Johnsons"
                disabled={isSubmitting}
              />
              {errors.groupName && (
                <p className="mt-1 text-sm text-red-600">{errors.groupName}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description (Optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                  errors.description ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Tell your family members what this group is for..."
                disabled={isSubmitting}
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description}</p>
              )}
            </div>

            {/* Member Invitations */}
            <div>
              <h4 className="font-medium text-gray-900 mb-4">Invite Family Members</h4>
              
              {/* Add New Member Form */}
              <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <div className="flex-1">
                  <input
                    type="email"
                    value={newInviteEmail}
                    onChange={(e) => {
                      setNewInviteEmail(e.target.value);
                      if (errors.inviteEmail) {
                        setErrors(prev => ({ ...prev, inviteEmail: undefined }));
                      }
                    }}
                    placeholder="Email address"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                      errors.inviteEmail ? 'border-red-300' : 'border-gray-300'
                    }`}
                    disabled={isSubmitting}
                  />
                  {errors.inviteEmail && (
                    <p className="mt-1 text-sm text-red-600">{errors.inviteEmail}</p>
                  )}
                </div>
                <select
                  value={newInviteRole}
                  onChange={(e) => setNewInviteRole(e.target.value as 'admin' | 'member')}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  disabled={isSubmitting}
                >
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                </select>
                <button
                  type="button"
                  onClick={handleAddInvite}
                  disabled={isSubmitting || !newInviteEmail.trim()}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors flex items-center justify-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add</span>
                </button>
              </div>

              {/* Invited Members List */}
              {invites.length > 0 ? (
                <div className="space-y-2 mb-4">
                  <h5 className="text-sm font-medium text-gray-700">Invited Members:</h5>
                  {invites.map((invite, index) => (
                    <div 
                      key={index} 
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-full">
                          <Mail className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{invite.email}</p>
                          <p className="text-sm text-gray-500 flex items-center">
                            {invite.role === 'admin' ? (
                              <>
                                <Crown className="h-3 w-3 text-yellow-600 mr-1" />
                                Admin
                              </>
                            ) : (
                              <>
                                <Shield className="h-3 w-3 text-blue-600 mr-1" />
                                Member
                              </>
                            )}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveInvite(invite.email)}
                        disabled={isSubmitting}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic mb-4">
                  No members invited yet. You'll be added automatically as an admin.
                </p>
              )}
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">What you'll get:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Share shopping lists with family members</li>
                <li>• Collaborate on budgets and savings goals</li>
                <li>• Track family shopping activity</li>
                <li>• Manage member permissions and roles</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end p-6 border-t border-gray-200">
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting || !groupName.trim()}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Create Family</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};