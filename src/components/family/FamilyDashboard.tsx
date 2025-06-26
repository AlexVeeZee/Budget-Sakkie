import React, { useState } from 'react';
import { Users, Plus, Settings, Activity, Crown, Shield, Mail, Calendar, TrendingUp, ShoppingCart, Target } from 'lucide-react';
import { useFamily } from '../../hooks/useFamily';
import { useCurrency } from '../../hooks/useCurrency';
import { CreateFamilyModal } from './CreateFamilyModal';
import { InviteMemberModal } from './InviteMemberModal';
import { FamilyMemberCard } from './FamilyMemberCard';
import { FamilyActivityFeed } from './FamilyActivityFeed';
import { FamilyStatsCard } from './FamilyStatsCard';

export const FamilyDashboard: React.FC = () => {
  const { currentFamily, loading, error, createFamily, inviteMember } = useFamily();
  const { formatCurrency } = useCurrency();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Family Data</h3>
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  if (!currentFamily) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center py-16">
          <div className="w-24 h-24 bg-gradient-to-br from-green-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Users className="h-12 w-12 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Create Your Family Group</h2>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Start sharing shopping lists, budgets, and savings with your family members. 
            Collaborate on grocery shopping and save money together.
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            <Plus className="h-5 w-5" />
            <span>Create Family Group</span>
          </button>
        </div>

        <CreateFamilyModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onCreateFamily={createFamily}
        />
      </div>
    );
  }

  const activeMembers = currentFamily.members.filter(member => member.status === 'active');
  const pendingMembers = currentFamily.members.filter(member => member.status === 'pending');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{currentFamily.name}</h1>
            <p className="text-gray-600">{currentFamily.description}</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowInviteModal(true)}
              className="inline-flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              <Mail className="h-4 w-4" />
              <span>Invite Member</span>
            </button>
            <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
              <Settings className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Family Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <FamilyStatsCard
            title="Active Members"
            value={activeMembers.length.toString()}
            icon={Users}
            color="blue"
            subtitle={`${pendingMembers.length} pending`}
          />
          <FamilyStatsCard
            title="Shared Lists"
            value={currentFamily.stats.totalLists.toString()}
            icon={ShoppingCart}
            color="green"
            subtitle="This month"
          />
          <FamilyStatsCard
            title="Total Savings"
            value={formatCurrency(currentFamily.stats.totalSavings)}
            icon={TrendingUp}
            color="purple"
            subtitle="All time"
          />
          <FamilyStatsCard
            title="Family Budget"
            value={formatCurrency(2500)}
            icon={Target}
            color="orange"
            subtitle="Monthly target"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Family Members */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-green-50 to-blue-50">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                  <Users className="h-5 w-5 text-green-600" />
                  <span>Family Members ({activeMembers.length})</span>
                </h3>
                <button
                  onClick={() => setShowInviteModal(true)}
                  className="text-sm text-green-600 hover:text-green-700 font-medium flex items-center space-x-1"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Member</span>
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                {currentFamily.members.map((member) => (
                  <FamilyMemberCard key={member.id} member={member} />
                ))}
              </div>

              {pendingMembers.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span>Pending Invitations ({pendingMembers.length})</span>
                  </h4>
                  <div className="space-y-3">
                    {pendingMembers.map((member) => (
                      <div key={member.id} className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-yellow-200 rounded-full flex items-center justify-center">
                            <Mail className="h-4 w-4 text-yellow-700" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{member.email}</p>
                            <p className="text-sm text-gray-600">Invited as {member.role}</p>
                          </div>
                        </div>
                        <span className="text-xs text-yellow-700 bg-yellow-100 px-2 py-1 rounded-full">
                          Pending
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="lg:col-span-1">
          <FamilyActivityFeed familyId={currentFamily.id} />
        </div>
      </div>

      {/* Modals */}
      <InviteMemberModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        onInviteMember={inviteMember}
        familyName={currentFamily.name}
      />
    </div>
  );
};