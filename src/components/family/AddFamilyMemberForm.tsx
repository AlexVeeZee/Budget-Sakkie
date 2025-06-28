import React, { useState } from 'react';
import { Mail, User, UserPlus, Shield, Crown, Loader2, AlertCircle } from 'lucide-react';
import { z } from 'zod';

// Form validation schema
const memberSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  role: z.enum(['parent', 'child', 'guardian', 'spouse', 'sibling', 'other']),
  isAdmin: z.boolean()
});

type MemberFormData = z.infer<typeof memberSchema>;

interface AddFamilyMemberFormProps {
  onSubmit: (
    firstName: string,
    lastName: string,
    email: string,
    role: 'parent' | 'child' | 'guardian' | 'spouse' | 'sibling' | 'other',
    isAdmin: boolean
  ) => Promise<void>;
  onCancel: () => void;
}

export const AddFamilyMemberForm: React.FC<AddFamilyMemberFormProps> = ({
  onSubmit,
  onCancel
}) => {
  const [formData, setFormData] = useState<MemberFormData>({
    firstName: '',
    lastName: '',
    email: '',
    role: 'other',
    isAdmin: false
  });
  
  const [errors, setErrors] = useState<Partial<Record<keyof MemberFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);
  
  const roles = [
    { value: 'parent', label: 'Parent' },
    { value: 'child', label: 'Child' },
    { value: 'guardian', label: 'Guardian' },
    { value: 'spouse', label: 'Spouse' },
    { value: 'sibling', label: 'Sibling' },
    { value: 'other', label: 'Other' }
  ];
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value 
    }));
    
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
      await onSubmit(
        formData.firstName,
        formData.lastName,
        formData.email,
        formData.role,
        formData.isAdmin
      );
    } catch (error) {
      console.error('Error adding family member:', error);
      setGeneralError(error instanceof Error ? error.message : 'Failed to add family member');
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {generalError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
          <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
          <p className="text-red-700">{generalError}</p>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
            First Name *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="firstName"
              name="firstName"
              type="text"
              value={formData.firstName}
              onChange={handleInputChange}
              className={`block w-full pl-10 pr-3 py-2 border ${
                errors.firstName ? 'border-red-300' : 'border-gray-300'
              } rounded-lg shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500`}
              placeholder="Enter first name"
              disabled={isSubmitting}
            />
          </div>
          {errors.firstName && (
            <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
            Last Name *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="lastName"
              name="lastName"
              type="text"
              value={formData.lastName}
              onChange={handleInputChange}
              className={`block w-full pl-10 pr-3 py-2 border ${
                errors.lastName ? 'border-red-300' : 'border-gray-300'
              } rounded-lg shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500`}
              placeholder="Enter last name"
              disabled={isSubmitting}
            />
          </div>
          {errors.lastName && (
            <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
          )}
        </div>
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
        <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
          Relationship *
        </label>
        <select
          id="role"
          name="role"
          value={formData.role}
          onChange={handleInputChange}
          className={`block w-full pl-3 pr-10 py-2 border ${
            errors.role ? 'border-red-300' : 'border-gray-300'
          } rounded-lg shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500`}
          disabled={isSubmitting}
        >
          {roles.map(role => (
            <option key={role.value} value={role.value}>
              {role.label}
            </option>
          ))}
        </select>
        {errors.role && (
          <p className="mt-1 text-sm text-red-600">{errors.role}</p>
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
              name="isAdmin"
              checked={!formData.isAdmin}
              onChange={() => setFormData(prev => ({ ...prev, isAdmin: false }))}
              className="h-4 w-4 text-green-600 focus:ring-green-500"
              disabled={isSubmitting}
            />
            <Shield className="h-5 w-5 text-blue-600" />
            <div className="flex-1">
              <p className="font-medium text-gray-900">Member</p>
              <p className="text-sm text-gray-600">Can view shared family information with limited editing permissions</p>
            </div>
          </label>
          
          <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
            <input
              type="radio"
              name="isAdmin"
              checked={formData.isAdmin}
              onChange={() => setFormData(prev => ({ ...prev, isAdmin: true }))}
              className="h-4 w-4 text-green-600 focus:ring-green-500"
              disabled={isSubmitting}
            />
            <Crown className="h-5 w-5 text-yellow-600" />
            <div className="flex-1">
              <p className="font-medium text-gray-900">Admin</p>
              <p className="text-sm text-gray-600">Can manage family members and has full access to family settings</p>
            </div>
          </label>
        </div>
      </div>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-800 mb-2">What happens next?</h4>
        <p className="text-sm text-blue-700">
          An invitation email will be sent to {formData.email || 'the email address'}. Once they accept, they'll be able to access your family information according to their access level.
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
              <span>Adding...</span>
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