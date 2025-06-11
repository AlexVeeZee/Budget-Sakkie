import React, { useState } from 'react';
import { X, Users, Plus, Mail, Crown, Shield, Trash2, UserPlus, Settings, Share2, Edit2 } from 'lucide-react';
import { EditFamilyMemberModal } from './EditFamilyMemberModal';
import { DeleteFamilyMemberModal } from './DeleteFamilyMemberModal';

interface FamilyMember {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'member';
  avatar: string;
  joinedDate: string;
  status: 'active' | 'pending' | 'inactive';
  permissions: {
    viewLists: boolean;
    editLists: boolean;
    createLists: boolean;
    viewBudget: boolean;
    editBudget: boolean;
  };
}

interface SharedList {
  id: string;
  name: string;
  createdBy: string;
  sharedWith: string[];
  itemCount: number;
  lastUpdated: string;
}

interface FamilySharingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FamilySharingModal: React.FC<FamilySharingModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'members' | 'lists' | 'settings'>('members');
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'member'>('member');
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null);
  const [deletingMember, setDeletingMember] = useState<FamilyMember | null>(null);

  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([
    {
      id: '1',
      name: 'Sarah Van Der Merwe',
      email: 'sarah.vandermerwe@email.com',
      role: 'admin',
      avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
      joinedDate: '2024-01-01',
      status: 'active',
      permissions: {
        viewLists: true,
        editLists: true,
        createLists: true,
        viewBudget: true,
        editBudget: true
      }
    },
    {
      id: '2',
      name: 'Johan Van Der Merwe',
      email: 'johan.vandermerwe@email.com',
      role: 'member',
      avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
      joinedDate: '2024-01-02',
      status: 'active',
      permissions: {
        viewLists: true,
        editLists: true,
        createLists: true,
        viewBudget: true,
        editBudget: false
      }
    },
    {
      id: '3',
      name: 'Emma Van Der Merwe',
      email: 'emma.vandermerwe@email.com',
      role: 'member',
      avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
      joinedDate: '2024-01-05',
      status: 'pending',
      permissions: {
        viewLists: true,
        editLists: false,
        createLists: false,
        viewBudget: false,
        editBudget: false
      }
    }
  ]);

  const sharedLists: SharedList[] = [
    {
      id: '1',
      name: 'Weekly Groceries',
      createdBy: 'Sarah Van Der Merwe',
      sharedWith: ['Johan Van Der Merwe', 'Emma Van Der Merwe'],
      itemCount: 15,
      lastUpdated: '2024-01-15T10:30:00Z'
    },
    {
      id: '2',
      name: 'Party Supplies',
      createdBy: 'Johan Van Der Merwe',
      sharedWith: ['Sarah Van Der Merwe'],
      itemCount: 8,
      lastUpdated: '2024-01-14T16:45:00Z'
    },
    {
      id: '3',
      name: 'School Lunch Items',
      createdBy: 'Sarah Van Der Merwe',
      sharedWith: ['Emma Van Der Merwe'],
      itemCount: 12,
      lastUpdated: '2024-01-13T08:15:00Z'
    }
  ];

  const handleInviteMember = () => {
    if (!inviteEmail) {
      alert('Please enter an email address.');
      return;
    }

    const newMember: FamilyMember = {
      id: Date.now().toString(),
      name: inviteEmail.split('@')[0],
      email: inviteEmail,
      role: inviteRole,
      avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
      joinedDate: new Date().toISOString(),
      status: 'pending',
      permissions: {
        viewLists: true,
        editLists: inviteRole === 'admin',
        createLists: inviteRole === 'admin',
        viewBudget: inviteRole === 'admin',
        editBudget: inviteRole === 'admin'
      }
    };

    setFamilyMembers(prev => [...prev, newMember]);
    setInviteEmail('');
    setShowInviteForm(false);
    alert(`Invitation sent to ${inviteEmail}!`);
  };

  const handleEditMember = (member: FamilyMember) => {
    setEditingMember(member);
  };

  const handleSaveMember = (updatedMember: FamilyMember) => {
    setFamilyMembers(prev => 
      prev.map(member => 
        member.id === updatedMember.id ? updatedMember : member
      )
    );
    setEditingMember(null);
  };

  const handleDeleteMember = (member: FamilyMember) => {
    setDeletingMember(member);
  };

  const handleConfirmDelete = () => {
    if (deletingMember) {
      setFamilyMembers(prev => prev.filter(m => m.id !== deletingMember.id));
      setDeletingMember(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleIcon = (role: string) => {
    return role === 'admin' ? <Crown className="h-4 w-4 text-yellow-600" /> : <Shield className="h-4 w-4 text-blue-600" />;
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed top-0 bottom-0 right-0 z-50 flex"
      style={{ 
        left: '320px', // Start right after sidebar
        backgroundColor: 'rgba(0, 0, 0, 0.5)'
      }}
    >
      <div 
        className="w-full max-w-5xl bg-white shadow-2xl overflow-hidden border-l border-gray-200"
        style={{ backgroundColor: '#ffffff' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-green-600 via-orange-500 to-blue-600 text-white">
          <div className="flex items-center space-x-3">
            <Users className="h-6 w-6" />
            <div>
              <h2 className="text-2xl font-bold">Family Sharing</h2>
              <p className="text-white/80">{familyMembers.filter(m => m.status === 'active').length} active members</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-black/10 rounded-lg transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Tabs */}
        <div 
          className="flex border-b border-gray-200"
          style={{ backgroundColor: '#ffffff' }}
        >
          <button
            onClick={() => setActiveTab('members')}
            className={`flex-1 px-6 py-3 font-medium transition-colors ${
              activeTab === 'members'
                ? 'text-green-600 border-b-2 border-green-600 bg-green-50'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Family Members
          </button>
          <button
            onClick={() => setActiveTab('lists')}
            className={`flex-1 px-6 py-3 font-medium transition-colors ${
              activeTab === 'lists'
                ? 'text-green-600 border-b-2 border-green-600 bg-green-50'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Shared Lists
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex-1 px-6 py-3 font-medium transition-colors ${
              activeTab === 'settings'
                ? 'text-green-600 border-b-2 border-green-600 bg-green-50'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Settings
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(100vh-200px)]">
          {activeTab === 'members' && (
            <div className="space-y-6">
              {/* Add Member Button */}
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Family Members</h3>
                <button
                  onClick={() => setShowInviteForm(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
                >
                  <UserPlus className="h-4 w-4" />
                  <span>Invite Member</span>
                </button>
              </div>

              {/* Invite Form */}
              {showInviteForm && (
                <div 
                  className="p-6 rounded-lg border border-gray-200"
                  style={{ backgroundColor: '#f9fafb' }}
                >
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Invite Family Member</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                      <input
                        type="email"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        style={{ backgroundColor: '#ffffff' }}
                        placeholder="family.member@email.com"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                      <select
                        value={inviteRole}
                        onChange={(e) => setInviteRole(e.target.value as 'admin' | 'member')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        style={{ backgroundColor: '#ffffff' }}
                      >
                        <option value="member">Member</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="flex space-x-3">
                    <button
                      onClick={handleInviteMember}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
                    >
                      Send Invitation
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
                {familyMembers.map((member) => (
                  <div 
                    key={member.id}
                    className="p-6 rounded-xl border border-gray-200 hover:shadow-sm transition-shadow"
                    style={{ backgroundColor: '#ffffff' }}
                  >
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
                          
                          <p className="text-gray-600 mb-2">{member.email}</p>
                          <p className="text-sm text-gray-500">
                            Joined: {new Date(member.joinedDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => handleEditMember(member)}
                          className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        {member.role !== 'admin' && (
                          <button 
                            onClick={() => handleDeleteMember(member)}
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

          {activeTab === 'lists' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Shared Shopping Lists</h3>
              
              <div className="space-y-4">
                {sharedLists.map((list) => (
                  <div 
                    key={list.id}
                    className="p-6 rounded-xl border border-gray-200 hover:shadow-sm transition-shadow"
                    style={{ backgroundColor: '#ffffff' }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="text-lg font-bold text-gray-900">{list.name}</h4>
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {list.itemCount} items
                          </span>
                        </div>
                        
                        <p className="text-gray-600 mb-2">Created by: {list.createdBy}</p>
                        <p className="text-sm text-gray-500">
                          Last updated: {new Date(list.lastUpdated).toLocaleDateString()}
                        </p>
                        
                        <div className="mt-3">
                          <p className="text-sm text-gray-600 mb-1">Shared with:</p>
                          <div className="flex flex-wrap gap-2">
                            {list.sharedWith.map((memberName, index) => (
                              <span 
                                key={index}
                                className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700"
                              >
                                {memberName}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                          <Share2 className="h-4 w-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-green-600 transition-colors">
                          <Settings className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {sharedLists.length === 0 && (
                <div className="text-center py-12">
                  <Share2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Shared Lists Yet</h3>
                  <p className="text-gray-600">Create a shopping list and share it with your family members.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Family Sharing Settings</h3>
              
              <div className="space-y-4">
                <div 
                  className="p-6 rounded-lg border border-gray-200"
                  style={{ backgroundColor: '#f9fafb' }}
                >
                  <h4 className="font-semibold text-gray-900 mb-4">Default Permissions for New Members</h4>
                  
                  <div className="space-y-3">
                    {[
                      { key: 'viewLists', label: 'View shopping lists' },
                      { key: 'editLists', label: 'Edit shopping lists' },
                      { key: 'createLists', label: 'Create new lists' },
                      { key: 'viewBudget', label: 'View family budget' },
                      { key: 'editBudget', label: 'Edit family budget' }
                    ].map((permission) => (
                      <div key={permission.key} className="flex items-center justify-between">
                        <span className="text-gray-700">{permission.label}</span>
                        <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-green-600">
                          <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div 
                  className="p-6 rounded-lg border border-gray-200"
                  style={{ backgroundColor: '#f9fafb' }}
                >
                  <h4 className="font-semibold text-gray-900 mb-4">Notification Settings</h4>
                  
                  <div className="space-y-3">
                    {[
                      'Notify when someone adds items to shared lists',
                      'Notify when someone completes shopping',
                      'Weekly family spending summary',
                      'New member join notifications'
                    ].map((setting, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-gray-700">{setting}</span>
                        <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-green-600">
                          <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div 
                  className="p-6 rounded-lg border border-red-200"
                  style={{ backgroundColor: '#fef2f2' }}
                >
                  <h4 className="font-semibold text-red-900 mb-2">Danger Zone</h4>
                  <p className="text-sm text-red-700 mb-4">
                    These actions cannot be undone. Please be careful.
                  </p>
                  
                  <div className="space-y-3">
                    <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors">
                      Leave Family Group
                    </button>
                    <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors">
                      Delete Family Group
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>

      {/* Edit Family Member Modal */}
      {editingMember && (
        <EditFamilyMemberModal
          isOpen={!!editingMember}
          onClose={() => setEditingMember(null)}
          member={editingMember}
          onSave={handleSaveMember}
        />
      )}

      {/* Delete Family Member Modal */}
      {deletingMember && (
        <DeleteFamilyMemberModal
          isOpen={!!deletingMember}
          onClose={() => setDeletingMember(null)}
          member={deletingMember}
          onConfirm={handleConfirmDelete}
        />
      )}
    </div>
  );
};