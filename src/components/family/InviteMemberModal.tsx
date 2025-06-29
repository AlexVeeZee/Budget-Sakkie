import React, { useState } from 'react';
import { X, Mail, Send, Loader2, Crown, Shield } from 'lucide-react';
import { FamilyInvitation } from '../../types/family';

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInviteMember: (email: string, role: 'admin' | 'member', message?: string) => Promise<{ success: boolean; invitation?: FamilyInvitation; error?: string }>;
  familyName: string;
}

export const InviteMemberModal: React.FC<InviteMemberModalProps> = ({
  isOpen,
  onClose,
  onInviteMember,
  familyName
}) => {
  const [formData, setFormData] = useState({
    email: '',
    role: 'member' as 'admin' | 'member',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; message?: string }>({});
  const [emailSendingStatus, setEmailSendingStatus] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const validateForm = () => {
    const newErrors: { email?: string; message?: string } = {};
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setEmailSendingStatus(null);
    
    try {
      const result = await onInviteMember(
        formData.email.trim(),
        formData.role,
        formData.message.trim() || undefined
      );
      
      if (result.success) {
        setEmailSendingStatus({
          success: true,
          message: `Invitation sent to ${formData.email} successfully!`
        });
        
        // Close after showing success message
        setTimeout(() => {
          handleClose();
        }, 2000);
      } else {
        setErrors({ email: result.error || 'Failed to send invitation' });
        setEmailSendingStatus({
          success: false,
          message: result.error || 'Failed to send invitation email'
        });
      }
    } catch (error) {
      setErrors({ email: 'An unexpected error occurred' });
      setEmailSendingStatus({
        success: false,
        message: 'An unexpected error occurred while sending the invitation'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({ email: '', role: 'member', message: '' });
    setErrors({});
    setEmailSendingStatus(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-xl">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Invite Member to {familyName}</h3>
              <p className="text-white/80 text-sm">Send an invitation to join your family group</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={loading}
            className="p-2 hover:bg-black/10 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Email Status Message */}
          {emailSendingStatus && (
            <div className={`p-4 ${emailSendingStatus.success ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'} rounded-lg`}>
              <p className={emailSendingStatus.success ? 'text-green-700' : 'text-yellow-700'}>
                {emailSendingStatus.message}
              </p>
            </div>
          )}

          {/* Email Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                errors.email ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="family.member@email.com"
              disabled={loading}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          {/* Role Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Role & Permissions
            </label>
            <div className="space-y-3">
              <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                <input
                  type="radio"
                  name="role"
                  value="member"
                  checked={formData.role === 'member'}
                  onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value as 'member' }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                  disabled={loading}
                />
                <Shield className="h-5 w-5 text-blue-600" />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Member</p>
                  <p className="text-sm text-gray-600">Can view and edit shared lists, limited admin access</p>
                </div>
              </label>
              
              <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                <input
                  type="radio"
                  name="role"
                  value="admin"
                  checked={formData.role === 'admin'}
                  onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value as 'admin' }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                  disabled={loading}
                />
                <Crown className="h-5 w-5 text-yellow-600" />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Admin</p>
                  <p className="text-sm text-gray-600">Full access to all family features and settings</p>
                </div>
              </label>
            </div>
          </div>

          {/* Personal Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Personal Message (Optional)
            </label>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="Add a personal message to your invitation..."
              disabled={loading}
            />
          </div>

          {/* Preview */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Invitation Preview:</h4>
            <p className="text-sm text-blue-800">
              "{formData.email || 'family.member@email.com'}" will receive an email invitation to join {familyName} as a {formData.role}.
              {formData.message && (
                <span className="block mt-2 italic">"{formData.message}"</span>
              )}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !formData.email.trim()}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              <span>{loading ? 'Sending...' : 'Send Invitation'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};