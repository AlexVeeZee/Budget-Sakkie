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
      name: 'Pieter Van Der Merwe'
    }
  ]
}
<boltArtifact id="family-sharing-feature" title="Family Sharing Feature Implementation">