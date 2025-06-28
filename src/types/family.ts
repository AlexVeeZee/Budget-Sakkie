export interface FamilyGroup {
  id: string;
  name: string;
  description?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  members?: FamilyMember[];
}

export interface FamilyMember {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'member';
  relationship?: string;
  avatar?: string;
  joinedDate: string;
  status: 'active' | 'pending' | 'inactive';
  lastActive?: string;
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

export interface FamilyInvitation {
  id: string;
  familyId: string;
  familyName: string;
  invitedByName: string;
  email: string;
  role: 'admin' | 'member';
  status: 'pending' | 'accepted' | 'declined';
  expiresAt: string;
  message?: string;
}

export interface FamilyRelationship {
  id: string;
  familyId: string;
  memberId: string;
  role: 'parent' | 'child' | 'guardian' | 'spouse' | 'sibling' | 'other';
  isAdmin: boolean;
  status: 'active' | 'pending' | 'inactive';
  createdAt: string;
  updatedAt: string;
}