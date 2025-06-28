import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { FamilyService } from '../../services/familyService';
import { Family, FamilyMember } from '../../types/family';
import { FamilyManagementPanel } from './FamilyManagementPanel';

export const FamilySharingComponent: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Family Management</h1>
        <p className="text-gray-600">
          Manage your family members, roles, and relationships.
        </p>
      </div>
      
      <FamilyManagementPanel />
    </div>
  );
};