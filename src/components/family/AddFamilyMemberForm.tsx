import React, { useState } from 'react';
import { Mail, User, UserPlus, Shield, Crown, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { z } from 'zod';

// Form validation schema
const memberSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  relationship: z.string().min(1, 'Please select a relationship'),
  accessLevel: z.enum(['viewer', 'editor']),
});

type MemberFormData = z.infer<typeof memberSchema>;

interface AddFamilyMemberFormProps {
  onSubmit: (data: MemberFormData) => Promise<{ success: boolean; error: string | null }>;
  onCancel: () => void;
}

export const AddFamilyMemberForm: React.FC<AddFamilyMemberFormProps> = ({
  onSubmit,
  onCancel
}) => {
  const [formData, setFormData] = useState<MemberFormData>({
    fullName: '',
    email: '',
    relationship: '',
    accessLevel: 'viewer',
  });
  
  const [errors, setErrors] = useState<Partial<Record<keyof MemberFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const relationships = [
    { value: 'spouse', label: 'Spouse' },
    { value: 'parent', label: 'Parent' },
    { value: 'child', label: 'Child' },
    { value: 'sibling', label: 'Sibling' },
    { value: 'grandparent', label: 'Grandparent' },
    { value: 'other', label: 'Other Family Member' },
    { value: 'friend', label: 'Friend' },
  ];
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field
    if (errors[name as keyof MemberFormData]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name as keyof MemberFormData];
        return newErrors;
      });
    }
    
    // Clear general error when user makes changes
    if (generalError) {
      setGeneralError(null);
    }
  };
  
  const validateForm = (): boolean => {
    try {
      memberSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Partial<Record<keyof MemberFormData, string>> = {};
        error.errors.forEach(err => {
          const path = err.path[0] as keyof MemberFormData;
          newErrors[path] = err.message;
        });
        setErrors(newErrors);
      }
      return false;
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    setGeneralError(null);
    
    try {
      const { success, error } = await onSubmit(formData);
      
      if (!success) {
        setGeneralError(error);
        setIsSubmitting(false);
        return;
      }
      
      // Show success message
      setSuccess(true);
      
      // Reset form after a delay
      setTimeout(() => {
        setFormData({
          fullName: '',
          email: '',
          relationship: '',
          accessLevel: 'viewer',
        });
        setSuccess(false);
        onCancel();
      }, 2000);
      
    } catch (error) {
      console.error('Error adding family member:', error);
      setGeneralError(error instanceof Error ? error.message : 'Failed to add family member');
      setIsSubmitting(false);
    }
  };
  
  if (success) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
        <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-green-800 mb-2">Invitation Sent Successfully</h3>
        <p className="text-green-700 mb-4">
          An invitation has been sent to {formData.email}. They'll receive instructions on how to join your family group.
        </p>
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
        >
          Continue
        </button>
      </div>
    );
  }
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {generalError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
          <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
          <p className="text-red-700">{generalError}</p>
        </div>
      )}
      
      <div>
        <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
          Full Name *
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <User className="h-5 w-5 text-gray-400" />
          </div>
          <input
            id="fullName"
            name="fullName"
            type="text"
            value={formData.fullName}
            onChange={handleInputChange}
            className={`block w-full pl-10 pr-3 py-2 border ${
              errors.fullName ? 'border-red-300' : 'border-gray-300'
            } rounded-lg shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500`}
            placeholder="Enter full name"
            disabled={isSubmitting}
          />
        </div>
        {errors.fullName && (
          <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>
        )}
      </div>
      
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email Address *
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Mail className="h-5 w-5 text-gray-400" />
          </div>
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            className={`block w-full pl-10 pr-3 py-2 border ${
              errors.email ? 'border-red-300' : 'border-gray-300'
            } rounded-lg shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500`}
            placeholder="family.member@example.com"
            disabled={isSubmitting}
          />
        </div>
        {errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email}</p>
        )}
      </div>
      
      <div>
        <label htmlFor="relationship" className="block text-sm font-medium text-gray-700 mb-1">
          Relationship to You *
        </label>
        <select
          id="relationship"
          name="relationship"
          value={formData.relationship}
          onChange={handleInputChange}
          className={`block w-full pl-3 pr-10 py-2 border ${
            errors.relationship ? 'border-red-300' : 'border-gray-300'
          } rounded-lg shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500`}
          disabled={isSubmitting}
        >
          <option value="">Select relationship</option>
          {relationships.map(relationship => (
            <option key={relationship.value} value={relationship.value}>
              {relationship.label}
            </option>
          ))}
        </select>
        {errors.relationship && (
          <p className="mt-1 text-sm text-red-600">{errors.relationship}</p>
        )}
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Access Level *
        </label>
        <div className="space-y-3">
          <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
            <input
              type="radio"
              name="accessLevel"
              value="viewer"
              checked={formData.accessLevel === 'viewer'}
              onChange={handleInputChange}
              className="h-4 w-4 text-green-600 focus:ring-green-500"
              disabled={isSubmitting}
            />
            <Shield className="h-5 w-5 text-blue-600" />
            <div className="flex-1">
              <p className="font-medium text-gray-900">Viewer</p>
              <p className="text-sm text-gray-600">Can view shared lists and budgets, but cannot edit them</p>
            </div>
          </label>
          
          <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
            <input
              type="radio"
              name="accessLevel"
              value="editor"
              checked={formData.accessLevel === 'editor'}
              onChange={handleInputChange}
              className="h-4 w-4 text-green-600 focus:ring-green-500"
              disabled={isSubmitting}
            />
            <Crown className="h-5 w-5 text-yellow-600" />
            <div className="flex-1">
              <p className="font-medium text-gray-900">Editor</p>
              <p className="text-sm text-gray-600">Can create, view, and edit shared lists and budgets</p>
            </div>
          </label>
        </div>
      </div>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-800 mb-2">What happens next?</h4>
        <p className="text-sm text-blue-700">
          An invitation email will be sent to {formData.email || 'the email address'}. Once they accept, they'll be able to access your shared shopping lists and budgets according to their access level.
        </p>
      </div>
      
      <div className="flex space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Sending...</span>
            </>
          ) : (
            <>
              <UserPlus className="h-4 w-4" />
              <span>Add Family Member</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
};