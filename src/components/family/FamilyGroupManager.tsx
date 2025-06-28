import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Plus, Loader2, RefreshCw, AlertTriangle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import { CreateFamilyGroupModal } from './CreateFamilyGroupModal';
import { FamilyMembersList } from './FamilyMembersList';

interface FamilyGroup {
  id: string;
  name: string;
  description?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  members?: FamilyMember[];
}

interface FamilyMember {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'member';
  avatar?: string;
  status: 'active' | 'pending' | 'inactive';
}

export const FamilyGroupManager: React.FC = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [familyGroup, setFamilyGroup] = useState<FamilyGroup | null>(null);
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const fetchFamilyData = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Get user's family
      const { data: familyData, error: familyError } = await supabase
        .rpc('get_user_families');
      
      if (familyError) {
        throw new Error(`Failed to fetch family data: ${familyError.message}`);
      }
      
      if (familyData && familyData.length > 0) {
        const family = familyData[0];
        setFamilyGroup(family);
        
        // Get family members
        const { data: membersData, error: membersError } = await supabase
          .rpc('get_family_members', { p_family_id: family.id });
        
        if (membersError) {
          throw new Error(`Failed to fetch family members: ${membersError.message}`);
        }
        
        // Transform members data
        const transformedMembers: FamilyMember[] = membersData.map((member: any) => ({
          id: member.member_id,
          name: `${member.first_name} ${member.last_name}`,
          email: member.email,
          role: member.is_admin ? 'admin' : 'member',
          avatar: member.profile_image_url,
          status: member.status
        }));
        
        setMembers(transformedMembers);
      } else {
        setFamilyGroup(null);
        setMembers([]);
      }
    } catch (err) {
      console.error('Error fetching family data:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFamilyData();
  }, [user]);

  const handleCreateFamily = () => {
    setShowCreateModal(true);
  };

  const handleFamilyCreated = () => {
    fetchFamilyData();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="h-6 w-6 text-red-600 mt-0.5" />
          <div>
            <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Family Data</h3>
            <p className="text-red-700">{error}</p>
            <button
              onClick={fetchFamilyData}
              className="mt-4 flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Try Again</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!familyGroup) {
    return (
      <div className="text-center py-12">
        <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-4">No Family Group Yet</h2>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          Create a family group to start sharing shopping lists and budgets with your family members.
        </p>
        <button
          onClick={handleCreateFamily}
          className="inline-flex items-center space-x-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors"
        >
          <Plus className="h-5 w-5" />
          <span>Create Family Group</span>
        </button>
        
        <CreateFamilyGroupModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleFamilyCreated}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">{familyGroup.name}</h2>
          <p className="text-gray-600">
            {members.length} member{members.length !== 1 ? 's' : ''}
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={fetchFamilyData}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            title="Refresh"
          >
            <RefreshCw className="h-5 w-5" />
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
          >
            <UserPlus className="h-4 w-4" />
            <span>Invite Member</span>
          </button>
        </div>
      </div>

      {/* Family Members List */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Family Members</h3>
        <FamilyMembersList 
          members={members}
          currentUserId={user?.id || ''}
          onUpdateRole={() => {}}
          onRemoveMember={() => {}}
        />
      </div>

      {/* Create/Edit Modal */}
      <CreateFamilyGroupModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleFamilyCreated}
      />
    </div>
  );
};