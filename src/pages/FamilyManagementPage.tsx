import React, { useState } from 'react';
import { Users, Mail, Clock, Plus } from 'lucide-react';
import { FamilyManagementPanel } from '../components/family/FamilyManagementPanel';
import { FamilyInvitationsList } from '../components/family/FamilyInvitationsList';
import { useFamily } from '../hooks/useFamily';
import { FamilyService } from '../services/familyService';

export const FamilyManagementPage: React.FC = () => {
  const { invitations, loading } = useFamily();
  const [activeTab, setActiveTab] = useState<'members' | 'invitations'>('members');
  
  const handleAcceptInvitation = async (invitationId: string) => {
    return await FamilyService.acceptInvitation(invitationId);
  };
  
  const handleDeclineInvitation = async (invitationId: string) => {
    return await FamilyService.declineInvitation(invitationId);
  };
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Family Management</h1>
      </div>
      
      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab('members')}
          className={`flex items-center space-x-2 px-6 py-3 font-medium transition-colors ${
            activeTab === 'members'
              ? 'text-green-600 border-b-2 border-green-600 bg-green-50'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Users className="h-5 w-5" />
          <span>Family Members</span>
        </button>
        
        <button
          onClick={() => setActiveTab('invitations')}
          className={`flex items-center space-x-2 px-6 py-3 font-medium transition-colors ${
            activeTab === 'invitations'
              ? 'text-green-600 border-b-2 border-green-600 bg-green-50'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Mail className="h-5 w-5" />
          <span>Invitations</span>
          {invitations.length > 0 && (
            <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-800 text-xs font-medium rounded-full">
              {invitations.length}
            </span>
          )}
        </button>
      </div>
      
      {/* Content */}
      {activeTab === 'members' ? (
        <FamilyManagementPanel />
      ) : (
        <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Pending Invitations</h2>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Clock className="h-4 w-4" />
              <span>Invitations expire after 7 days</span>
            </div>
          </div>
          
          <FamilyInvitationsList
            invitations={invitations}
            onAcceptInvitation={handleAcceptInvitation}
            onDeclineInvitation={handleDeclineInvitation}
            isLoading={loading}
          />
        </div>
      )}
    </div>
  );
};

export default FamilyManagementPage;