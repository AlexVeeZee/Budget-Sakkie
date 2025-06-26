import React, { useState, useEffect } from 'react';
import { X, Users, Plus, Crown, Shield, Mail, UserPlus, Settings, Activity, Trash2, Edit2, Send, Check, Clock, AlertTriangle } from 'lucide-react';

interface FamilyMember {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'member';
  avatar: string;
  joinedDate: string;
  status: 'active' | 'pending' | 'inactive';
  lastActivity: string;
  permissions: {
    inviteMembers: boolean;
    manageMembers: boolean;
    createLists: boolean;
    shareLists: boolean;
    viewActivity: boolean;
  };
}

interface FamilyInvitation {
  id: string;
  email: string;
  role: 'admin' | 'member';
  invitedBy: string;
  sentDate: string;
  expiresDate: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
}

interface FamilyActivity {
  id: string;
  type: 'member_joined' | 'member_left' | 'member_invited' | 'list_shared' | 'list_created';
  user: string;
  description: string;
  timestamp: string;
  data?: any;
}

interface Family {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  createdBy: string;
  createdAt: string;
  settings: {
    allowMemberInvites: boolean;
    requireApprovalForSharing: boolean;
    defaultListPermissions: {
      view: boolean;
      edit: boolean;
      delete: boolean;
    };
  };
}

interface FamilyManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  family?: Family;
  onFamilyUpdate?: (family: Family) => void;
}

export const FamilyManagementModal: React.FC<FamilyManagementModalProps> = ({
  isOpen,
  onClose,
  family,
  onFamilyUpdate
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'members' | 'invitations' | 'activity' | 'settings'>('overview');
  const [loading, setLoading] = useState(false);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'member'>('member');
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null);

  // Mock data - in production, this would come from Supabase
  const [familyData, setFamilyData] = useState<Family>({
    id: 'family-1',
    name: 'Van Der Merwe Family',
    description: 'Our family shopping group for coordinating grocery trips and meal planning.',
    memberCount: 4,
    createdBy: 'sarah-1',
    createdAt: '2024-01-01T00:00:00Z',
    settings: {
      allowMemberInvites: true,
      requireApprovalForSharing: false,
      defaultListPermissions: {
        view: true,
        edit: true,
        delete: false
      }
    }
  });

  const [members, setMembers] = useState<FamilyMember[]>([
    {
      id: 'sarah-1',
      name: 'Sarah Van Der Merwe',
      email: 'sarah.vandermerwe@email.com',
      role: 'admin',
      avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
      joinedDate: '2024-01-01T00:00:00Z',
      status: 'active',
      lastActivity: '2024-01-15T10:30:00Z',
      permissions: {
        inviteMembers: true,
        manageMembers: true,
        createLists: true,
        shareLists: true,
        viewActivity: true
      }
    },
    {
      id: 'johan-1',
      name: 'Johan Van Der Merwe',
      email: 'johan.vandermerwe@email.com',
      role: 'member',
      avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
      joinedDate: '2024-01-02T00:00:00Z',
      status: 'active',
      lastActivity: '2024-01-15T08:15:00Z',
      permissions: {
        inviteMembers: false,
        manageMembers: false,
        createLists: true,
        shareLists: true,
        viewActivity: true
      }
    },
    {
      id: 'emma-1',
      name: 'Emma Van Der Merwe',
      email: 'emma.vandermerwe@email.com',
      role: 'member',
      avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
      joinedDate: '2024-01-05T00:00:00Z',
      status: 'active',
      lastActivity: '2024-01-14T19:45:00Z',
      permissions: {
        inviteMembers: false,
        manageMembers: false,
        createLists: true,
        shareLists: false,
        viewActivity: true
      }
    },
    {
      id: 'pieter-1',
      name: 'Pieter Van Der Merwe',
      email: 'pieter.vandermerwe@email.com',
      role: 'member',
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
      joinedDate: '2024-01-10T00:00:00Z',
      status: 'pending',
      lastActivity: '2024-01-10T00:00:00Z',
      permissions: {
        inviteMembers: false,
        manageMembers: false,
        createLists: false,
        shareLists: false,
        viewActivity: false
      }
    }
  ]);

  const [invitations, setInvitations] = useState<FamilyInvitation[]>([
    {
      id: 'inv-1',
      email: 'pieter.vandermerwe@email.com',
      role: 'member',
      invitedBy: 'Sarah Van Der Merwe',
      sentDate: '2024-01-10T00:00:00Z',
      expiresDate: '2024-01-17T00:00:00Z',
      status: 'pending'
    },
    {
      id: 'inv-2',
      email: 'grandma@email.com',
      role: 'member',
      invitedBy: 'Sarah Van Der Merwe',
      sentDate: '2024-01-08T00:00:00Z',
      expiresDate: '2024-01-15T00:00:00Z',
      status: 'expired'
    }
  ]);

  const [activities, setActivities] = useState<FamilyActivity[]>([
    {
      id: 'act-1',
      type: 'member_joined',
      user: 'Emma Van Der Merwe',
      description: 'joined the family',
      timestamp: '2024-01-05T00:00:00Z'
    },
    {
      id: 'act-2',
      type: 'list_shared',
      user: 'Johan Van Der Merwe',
      description: 'shared "Weekly Groceries" list',
      timestamp: '2024-01-04T00:00:00Z'
    },
    {
      id: 'act-3',
      type: 'member_invited',
      user: 'Sarah Van Der Merwe',
      description: 'invited pieter.vandermerwe@email.com',
      timestamp: '2024-01-10T00:00:00Z'
    }
  ]);

  const handleSendInvitation = async () => {
    if (!inviteEmail.trim()) return;

    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const newInvitation: FamilyInvitation = {
        id: `inv-${Date.now()}`,
        email: inviteEmail,
        role: inviteRole,
        invitedBy: 'Sarah Van Der Merwe',
        sentDate: new Date().toISOString(),
        expiresDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'pending'
      };

      setInvitations(prev => [newInvitation, ...prev]);
      setInviteEmail('');
      setShowInviteForm(false);

      // Add activity
      const newActivity: FamilyActivity = {
        id: `act-${Date.now()}`,
        type: 'member_invited',
        user: 'Sarah Van Der Merwe',
        description: `invited ${inviteEmail}`,
        timestamp: new Date().toISOString()
      };
      setActivities(prev => [newActivity, ...prev]);

    } catch (error) {
      console.error('Error sending invitation:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('Are you sure you want to remove this member from the family?')) return;

    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setMembers(prev => prev.filter(m => m.id !== memberId));
      setFamilyData(prev => ({ ...prev, memberCount: prev.memberCount - 1 }));
    } catch (error) {
      console.error('Error removing member:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateMemberRole = async (memberId: string, newRole: 'admin' | 'member') => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setMembers(prev => prev.map(m => 
        m.id === memberId ? { ...m, role: newRole } : m
      ));
    } catch (error) {
      console.error('Error updating member role:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'expired': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleIcon = (role: string) => {
    return role === 'admin' ? <Crown className="h-4 w-4 text-yellow-600" /> : <Shield className="h-4 w-4 text-blue-600" />;
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'member_joined': return <UserPlus className="h-4 w-4 text-green-600" />;
      case 'member_left': return <UserPlus className="h-4 w-4 text-red-600" />;
      case 'member_invited': return <Mail className="h-4 w-4 text-blue-600" />;
      case 'list_shared': return <Users className="h-4 w-4 text-purple-600" />;
      case 'list_created': return <Plus className="h-4 w-4 text-green-600" />;
      default: return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{familyData.name}</h2>
                <p className="text-white/80">{familyData.memberCount} members • Created {new Date(familyData.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 bg-gray-50">
          {[
            { id: 'overview', label: 'Overview', icon: Users },
            { id: 'members', label: 'Members', icon: Users },
            { id: 'invitations', label: 'Invitations', icon: Mail },
            { id: 'activity', label: 'Activity', icon: Activity },
            { id: 'settings', label: 'Settings', icon: Settings }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-6 py-4 font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Family Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                  <div className="flex items-center space-x-3">
                    <Users className="h-8 w-8 text-blue-600" />
                    <div>
                      <p className="text-2xl font-bold text-blue-900">{familyData.memberCount}</p>
                      <p className="text-sm text-blue-700">Total Members</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
                  <div className="flex items-center space-x-3">
                    <Check className="h-8 w-8 text-green-600" />
                    <div>
                      <p className="text-2xl font-bold text-green-900">{members.filter(m => m.status === 'active').length}</p>
                      <p className="text-sm text-green-700">Active Members</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-6 border border-yellow-200">
                  <div className="flex items-center space-x-3">
                    <Clock className="h-8 w-8 text-yellow-600" />
                    <div>
                      <p className="text-2xl font-bold text-yellow-900">{invitations.filter(i => i.status === 'pending').length}</p>
                      <p className="text-sm text-yellow-700">Pending Invites</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
                  <div className="flex items-center space-x-3">
                    <Crown className="h-8 w-8 text-purple-600" />
                    <div>
                      <p className="text-2xl font-bold text-purple-900">{members.filter(m => m.role === 'admin').length}</p>
                      <p className="text-sm text-purple-700">Administrators</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Family Description */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">About This Family</h3>
                <p className="text-gray-700">{familyData.description}</p>
              </div>

              {/* Recent Activity Preview */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
                  <button
                    onClick={() => setActiveTab('activity')}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    View All
                  </button>
                </div>
                <div className="space-y-3">
                  {activities.slice(0, 3).map((activity) => (
                    <div key={activity.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      {getActivityIcon(activity.type)}
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">
                          <span className="font-medium">{activity.user}</span> {activity.description}
                        </p>
                        <p className="text-xs text-gray-500">{new Date(activity.timestamp).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'members' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">Family Members</h3>
                <button
                  onClick={() => setShowInviteForm(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                >
                  <UserPlus className="h-4 w-4" />
                  <span>Invite Member</span>
                </button>
              </div>

              {/* Invite Form */}
              {showInviteForm && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                  <h4 className="text-lg font-semibold text-blue-900 mb-4">Invite New Member</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-blue-800 mb-2">Email Address</label>
                      <input
                        type="email"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="family.member@email.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-blue-800 mb-2">Role</label>
                      <select
                        value={inviteRole}
                        onChange={(e) => setInviteRole(e.target.value as 'admin' | 'member')}
                        className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="member">Member</option>
                        <option value="admin">Administrator</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex space-x-3 mt-4">
                    <button
                      onClick={handleSendInvitation}
                      disabled={loading || !inviteEmail.trim()}
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors"
                    >
                      {loading ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                      <span>{loading ? 'Sending...' : 'Send Invitation'}</span>
                    </button>
                    <button
                      onClick={() => setShowInviteForm(false)}
                      className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Members List */}
              <div className="space-y-4">
                {members.map((member) => (
                  <div key={member.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-4">
                        <img 
                          src={member.avatar}
                          alt={member.name}
                          className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm"
                        />
                        <div>
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="text-lg font-bold text-gray-900">{member.name}</h4>
                            <div className="flex items-center space-x-1">
                              {getRoleIcon(member.role)}
                              <span className="text-sm font-medium text-gray-600 capitalize">{member.role}</span>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(member.status)}`}>
                              {member.status}
                            </span>
                          </div>
                          <p className="text-gray-600 mb-1">{member.email}</p>
                          <p className="text-sm text-gray-500">
                            Joined: {new Date(member.joinedDate).toLocaleDateString()} • 
                            Last active: {new Date(member.lastActivity).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => setEditingMember(member)}
                          className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        {member.role !== 'admin' && (
                          <button 
                            onClick={() => handleRemoveMember(member.id)}
                            className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                    
                    {/* Permissions */}
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Permissions</h5>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                        {Object.entries(member.permissions).map(([permission, allowed]) => (
                          <div 
                            key={permission}
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              allowed ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {permission.replace(/([A-Z])/g, ' $1').toLowerCase()}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'invitations' && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-900">Pending Invitations</h3>
              
              {invitations.length === 0 ? (
                <div className="text-center py-12">
                  <Mail className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Invitations</h3>
                  <p className="text-gray-600">No pending invitations at the moment.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {invitations.map((invitation) => (
                    <div key={invitation.id} className="bg-white rounded-xl border border-gray-200 p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                            <Mail className="h-6 w-6 text-gray-600" />
                          </div

I understand! I'll create beautiful, production-worthy designs that stand out from typical templates. I'll focus on:

- **Unique, polished aesthetics** with thoughtful design details
- **Premium user experiences** with smooth interactions and micro-animations
- **Professional layouts** that feel custom-built, not template-based
- **Cohesive design systems** with intentional color palettes, typography, and spacing
- **Modern UI patterns** that enhance usability while looking sophisticated

I'll leverage the existing tech stack:
- **Tailwind CSS** for styling with custom design approaches
- **Lucide React** for clean, consistent iconography
- **React hooks** for smooth interactions and state management
- **Production-ready code** that's maintainable and performant

I'll avoid generic templates and instead create interfaces that feel premium and purpose-built. Each design will have personality while maintaining excellent usability.

What would you like me to design or improve first? I'm ready to create something beautiful and functional for your project!

Previous Message #2:

I need to add a family sharing feature to the database schema. Users should be able to create families, invite other users to join their family, and share shopping lists with family members. Each family member should have different permission levels (admin, member). Please create the necessary database migrations for this feature.

(Assistant response below)

Looking at your existing database schema, I can see you already have the foundation for family sharing with the `families`, `family_members`, and `user_profiles` tables. Let me create a comprehensive migration to enhance this system with proper permissions and relationships.

<boltArtifact id="family-sharing-migration" title="Enhanced Family Sharing Database Migration">