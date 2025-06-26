export interface FamilyMember {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'member';
  avatar: string;
  joinedDate: string;
  status: 'active' | 'pending' | 'inactive';
  lastActive: string;
  permissions: {
    viewLists: boolean;
    editLists: boolean;
    createLists: boolean;
    viewBudget: boolean;
    editBudget: boolean;
    inviteMembers: boolean;
    manageMembers: boolean;
  };
}

export interface FamilyGroup {
  id: string;
  name: string;
  description?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  members: FamilyMember[];
  settings: {
    allowMemberInvites: boolean;
    requireApprovalForNewMembers: boolean;
    defaultMemberPermissions: Partial<FamilyMember['permissions']>;
  };
  stats: {
    totalLists: number;
    totalSavings: number;
    activeMembers: number;
  };
}

export interface FamilyInvitation {
  id: string;
  familyId: string;
  familyName: string;
  invitedBy: string;
  invitedByName: string;
  email: string;
  role: 'admin' | 'member';
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  createdAt: string;
  expiresAt: string;
  message?: string;
}

export interface FamilyActivity {
  id: string;
  familyId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  type: 'list_created' | 'list_updated' | 'list_shared' | 'member_joined' | 'member_left' | 'item_added' | 'item_completed';
  description: string;
  metadata?: Record<string, any>;
  timestamp: string;
}