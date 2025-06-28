import React, { useState } from 'react';
import { Users, Save, Loader2 } from 'lucide-react';
import { z } from 'zod';

// Form validation schema
const familySchema = z.object({
  familyName: z.string().min(2, 'Family name must be at least 2 characters')
});

type FamilyFormData = z.infer<typeof familySchema>;

interface CreateFamilyFormProps {
  onSubmit: (familyName: string) => Promise<void>;
  onCancel: () => void;
}

export const CreateFamilyForm: React.FC<CreateFamilyFormProps> = ({
  onSubmit,
  onCancel
}) => {
  const [familyName, setFamilyName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const validateForm = (): boolean => {
    try {
      familySchema.parse({ familyName });
      setError(null);
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        setError(error.errors[0].message);
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
    
    try {
      await onSubmit(familyName);
    } catch (error) {
      console.error('Error creating family:', error);
      setError(error instanceof Error ? error.message : 'Failed to create family');
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="familyName" className="block text-sm font-medium text-gray-700 mb-1">
          Family Name *
        </label>
        <input
          id="familyName"
          type="text"
          value={familyName}
          onChange={(e) => setFamilyName(e.target.value)}
          className={`block w-full px-3 py-2 border ${
            error ? 'border-red-300' : 'border-gray-300'
          } rounded-lg shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500`}
          placeholder="e.g., Smith Family, The Johnsons"
          disabled={isSubmitting}
        />
        {error && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}
      </div>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">What you'll get:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• A central place to manage your family members</li>
          <li>• Ability to assign roles and permissions</li>
          <li>• Share information with your family</li>
          <li>• Collaborate on family activities</li>
        </ul>
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
          disabled={isSubmitting || !familyName.trim()}
          className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Creating...</span>
            </>
          ) : (
            <>
              <Users className="h-4 w-4" />
              <span>Create Family</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
};