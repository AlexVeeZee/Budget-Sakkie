import React, { useState } from 'react';
import { X, Save, Edit2, Users, UserPlus, Trash2, Crown, Shield, Target, Calendar } from 'lucide-react';
import { useCurrency } from '../../hooks/useCurrency';

interface FamilyMember {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'member';
  avatar: string;
}

interface EditListModalProps {
  isOpen: boolean;
  onClose: () => void;
  listName: string;
  budget?: number;
  sharedWith?: string[];
  onSave: (name: string, budget: number, sharedWith: string[]) => void;
}

export const EditListModal: React.FC<EditListModalProps> = ({
  isOpen,
  onClose,
  listName,
  budget = 0,
  sharedWith = [],
  onSave
}) => {
  const { formatCurrency } = useCurrency();
  const [name, setName] = useState(listName);
  const [weeklyBudget, setWeeklyBudget] = useState(budget);
  const [activeTab, setActiveTab] = useState<'details' | 'sharing'>('details');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; budget?: string }>({});
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<string[]>(sharedWith);

  // Sample family members for demonstration
  const availableFamilyMembers: FamilyMember[] = [
    {
      id: '1',
      name: 'Johan Van Der Merwe',
      email: 'johan.vandermerwe@email.com',
      role: 'admin',
      avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop'
    },
    {
      id: '2',
      name: 'Emma Van Der Merwe',
      email: 'emma.vandermerwe@email.com',
      role: 'member',
      avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop'
    },
    {
      id: '3',
      name: 'Pieter Van Der Merwe

I understand! I'll create beautiful, production-worthy designs that stand out from typical templates. I'll focus on:

- **Unique, polished aesthetics** with thoughtful design details
- **Premium user experiences** with smooth interactions and micro-animations
- **Professional layouts** that feel custom-built, not template-based
- **Cohesive design systems** with intentional color palettes, typography, and spacing
- **Modern UI patterns** that users expect from high-quality applications

I'll leverage the existing tech stack:
- **React + TypeScript** for robust component architecture
- **Tailwind CSS** for utility-first styling with custom design touches
- **Lucide React** for consistent, beautiful iconography
- **Responsive design** that works seamlessly across all devices

I'll avoid generic Bootstrap-style components and instead craft custom interfaces that feel intentional and premium. Each design will have personality while maintaining excellent usability and accessibility.

The current Budget Sakkie project already shows this approach with its gradient headers, thoughtful spacing, and cohesive color scheme. I'll continue building in this direction, creating interfaces that users will genuinely enjoy using.

What would you like me to design or improve first?

Previous Message #2:

I want to add a family sharing feature to the app. This should allow users to create a family group, invite other users to join, and share shopping lists with family members. The feature should include:

1. Family group creation and management
2. User invitation system (by email)
3. Shared shopping lists with real-time collaboration
4. Family member roles (admin, member)
5. Family budget tracking and shared expenses

Please implement this feature with a beautiful, intuitive interface.

I understand you'll need to create database tables for this. Please create the necessary Supabase migrations and update the application accordingly.

Looking at the database schema you provided, I can see there are already some family-related tables (`families`, `family_members`, `user_profiles`) that we can build upon. Let me implement a comprehensive family sharing feature with a beautiful interface.

First, let me create the necessary database migrations to ensure we have all the required functionality:

<boltArtifact id="family-sharing-feature" title="Family Sharing Feature Implementation">