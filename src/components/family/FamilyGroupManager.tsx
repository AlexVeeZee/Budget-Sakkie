import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Plus, Loader2, RefreshCw, AlertTriangle, Home, Calendar, Crown, Shield, ChevronRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import { CreateFamilyGroupModal } from './CreateFamilyGroupModal';
import { FamilyMembersList } from './FamilyMembersList';

interface Family {
  family_id: string;
  family_name: string;
  family_description?: string;
  user_role: string;
  joined_at: string;
  member_count: number;
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
  const [families, setFamilies] = useState<Family[]>([]);
  const [selectedFamily, setSelectedFamily] = useState<Family | null>(null);
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loadingMembers, setLoadingMembers] = useState(false);

  const fetchFamilies = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Get user's families
      const { data, error: familiesError } = await supabase
        .rpc('get_user_families');
      
      if (familiesError) {
        throw new Error(`Failed to fetch families: ${familiesError.message}`);
      }
      
      setFamilies(data || []);
      
      // If there are families, select the first one by default
      if (data && data.length > 0) {
        setSelectedFamily(data[0]);
      } else {
        setSelectedFamily(null);
      }
    } catch (err) {
      console.error('Error fetching families:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const fetchFamilyMembers = async (familyId: string) => {
    if (!familyId) return;
    
    setLoadingMembers(true);
    
    try {
      // Get family members
      const { data: membersData, error: membersError } = await supabase
        .rpc('get_family_members', { p_family_id: familyId });
      
      if (membersError) {
        throw new Error(`Failed to fetch family members: ${membersError.message}`);
      }
      
      // Transform members data
      const transformedMembers: FamilyMember[] = membersData.map((member: any) => ({
        id: member.member_id,
        name: `${member.first_name || ''} ${member.last_name || ''}`.trim() || member.email || 'Unknown User',
        email: member.email || '',
        role: member.is_admin ? 'admin' : 'member',
        avatar: member.profile_image_url,
        status: member.status || 'active'
      }));
      
      setMembers(transformedMembers);
    } catch (err) {
      console.error('Error fetching family members:', err);
      // Don't set the main error state, just log it
    } finally {
      setLoadingMembers(false);
    }
  };

  useEffect(() => {
    fetchFamilies();
  }, [user]);

  useEffect(() => {
    if (selectedFamily) {
      fetchFamilyMembers(selectedFamily.family_id);
    } else {
      setMembers([]);
    }
  }, [selectedFamily]);

  const handleCreateFamily = () => {
    setShowCreateModal(true);
  };

  const handleFamilyCreated = () => {
    fetchFamilies();
  };

  const handleSelectFamily = (family: Family) => {
    setSelectedFamily(family);
  };

  const handleRefresh = () => {
    fetchFamilies();
    if (selectedFamily) {
      fetchFamilyMembers(selectedFamily.family_id);
    }
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
              onClick={handleRefresh}
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

  if (families.length === 0) {
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
      {/* Family List Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-900">Your Families</h3>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleRefresh}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              title="Refresh"
            >
              <RefreshCw className="h-5 w-5" />
            </button>
            <button
              onClick={handleCreateFamily}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Create New Family</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {families.map((family) => (
            <div 
              key={family.family_id}
              onClick={() => handleSelectFamily(family)}
              className={`p-5 rounded-xl border hover:shadow-md transition-all cursor-pointer ${
                selectedFamily?.family_id === family.family_id 
                  ? 'border-green-500 bg-green-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center text-white">
                  <Home className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">{family.family_name}</h4>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    {family.user_role === 'admin' ? (
                      <span className="flex items-center text-yellow-600">
                        <Crown className="h-3 w-3 mr-1" />
                        Admin
                      </span>
                    ) : (
                      <span className="flex items-center text-blue-600">
                        <Shield className="h-3 w-3 mr-1" />
                        Member
                      </span>
                    )}
                    <span>•</span>
                    <span className="flex items-center">
                      <Users className="h-3 w-3 mr-1" />
                      {family.member_count} {family.member_count === 1 ? 'member' : 'members'}
                    </span>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400 ml-auto" />
              </div>
              <div className="text-xs text-gray-500 flex items-center">
                <Calendar className="h-3 w-3 mr-1" />
                Joined {new Date(family.joined_at).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Family Members Section */}
      {selectedFamily && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {selectedFamily.family_name} - Members
            </h3>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
            >
              <UserPlus className="h-4 w-4" />
              <span>Invite Member</span>
            </button>
          </div>

          {loadingMembers ? (
            <div className="flex justify-center items-center h-32">
              <Loader2 className="h-8 w-8 animate-spin text-green-600" />
            </div>
          ) : (
            <FamilyMembersList 
              members={members}
              currentUserId={user?.id || ''}
              onUpdateRole={() => {}}
              onRemoveMember={() => {}}
            />
          )}
        </div>
      )}

      {/* Create/Edit Modal */}
      <CreateFamilyGroupModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleFamilyCreated}
      />
    </div>
  );
};