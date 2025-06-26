import React, { useState } from 'react';
import { Crown, Shield, MoreVertical, Edit2, Trash2, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { FamilyMember } from '../../types/family';

interface FamilyMemberCardProps {
  member: FamilyMember;
  onUpdateRole?: (memberId: string, newRole: 'admin' | 'member') => void;
  onRemoveMember?: (memberId: string) => void;
}

export const FamilyMemberCard: React.FC<FamilyMemberCardProps> = ({
  member,
  onUpdateRole,
  onRemoveMember
}) => {
  const [showActions, setShowActions] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow

I understand! I'll create beautiful, production-worthy designs that stand out from typical templates. I'll focus on:

- **Unique, polished aesthetics** with thoughtful design details
- **Premium user experiences** with smooth interactions and micro-animations
- **Professional layouts** that feel custom-built, not template-based
- **Cohesive design systems** with intentional color palettes, typography, and spacing
- **Modern UI patterns** that enhance usability while looking sophisticated

I'll leverage the existing tech stack:
- **Tailwind CSS** for styling with custom design approaches
- **Lucide React** for clean, consistent iconography
- **React hooks** for smooth state management and interactions
- **Responsive design** that works beautifully across all devices

I'll avoid generic templates and instead create interfaces that feel premium and purpose-built. Each component will have attention to detail in hover states, transitions, visual hierarchy, and overall polish.

What would you like me to design or improve first? I'm ready to create something exceptional!

Previous Message #2:

I need to add a family sharing feature to the app. This should allow users to create family groups, invite family members, and share shopping lists with specific family members. The feature should include:

1. Family group management (create, edit, delete family groups)
2. Member invitation system (send invites via email)
3. Role-based permissions (admin vs member)
4. Shared shopping list management
5. Family member profiles and activity tracking

Please implement this as a comprehensive family sharing system with a beautiful, intuitive interface.

I understand you'll need to create database migrations for this feature. Please create the necessary Supabase migrations to support family sharing functionality.

Looking at the current database schema, I can see there are already some family-related tables (`families`, `family_members`, `user_profiles`). Please build upon this existing structure and enhance it as needed for the full family sharing feature.

(Assistant response below)

I'll create a comprehensive family sharing system that builds upon your existing database structure. Let me implement this with beautiful, intuitive interfaces and the necessary database enhancements.

<boltArtifact id="family-sharing-system" title="Comprehensive Family Sharing System">