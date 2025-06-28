export interface FamilyMember {
  member_id: string;
  first_name: string;
  last_name: string;
  email: string;
  profile_image_url: string | null;
  role: 'parent' | 'child' | 'guardian' | 'spouse' | 'sibling' | 'other';
  is_admin: boolean;
  status: 'active' | 'pending' | 'inactive';
  date_of_birth?: string;
}

export interface Family {
  family_id: string;
  family_name: string;
  created_at: string;
  updated_at: string;
  members?: FamilyMember[];
}

export interface FamilyRelationship {
  relationship_id: string;
  family_id: string;
  member_id: string;
  role: 'parent' | 'child' | 'guardian' | 'spouse' | 'sibling' | 'other';
  is_admin: boolean;
  status: 'active' | 'pending' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface FamilyInvitation {
  invitation_id: string;
  family_id: string;
  email: string;
  role: 'parent' | 'child' | 'guardian' | 'spouse' | 'sibling' | 'other';
  is_admin: boolean;
  expires_at: string;
  created_at: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
}