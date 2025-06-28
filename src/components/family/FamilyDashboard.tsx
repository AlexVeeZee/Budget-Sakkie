import React, { useState, useEffect } from 'react';
import { Users, Plus, ShoppingCart, DollarSign, Calendar, Crown, Shield, UserPlus, Settings, TrendingUp, Target, Clock, CheckCircle } from 'lucide-react';
import { FamilyService, type FamilyWithMembers, type SharedListWithItems, type FamilyBudgetWithExpenses } from '../../services/familyService';
import { useCurrency } from '../../hooks/useCurrency';
import { CreateFamilyModal } from './CreateFamilyModal';
import { InviteMemberModal } from './InviteMemberModal';
import { CreateSharedListModal } from './CreateSharedListModal';
import { SharedListView } from './SharedListView';
import { FamilyBudgetView } from './FamilyBudgetView';

export const FamilyDashboard: React.FC = () => {
  const { formatCurrency } = useCurrency();
  const [family, setFamily] = useState<FamilyWithMembers | null>(null);
  const [sharedLists, setSharedLists] = useState<SharedListWithItems[]>([]);
  const [budgets, setBudgets] = useState<FamilyBudgetWithExpenses[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'overview' | 'lists' | 'budgets' | 'members'>('overview');
  const [selectedList, setSelectedList] = useState<SharedListWithItems | null>(null);
  
  // Modal states
  const [showCreateFamily, setShowCreateFamily] = useState(false);
  const [showInviteMember, setShowInviteMember] = useState(false);
  const [showCreateList, setShowCreateList] = useState(false);

  useEffect(() => {
    loadFamilyData();
  }, []);

  const loadFamilyData = async () => {
    try {
      setLoading(true);
      setError(null);

      const { family: familyData, error: familyError } = await FamilyService.getUserFamily();
      
      if (familyError) {
        setError(familyError);
        return;
      }

      if (!familyData) {
        setFamily(null);
        return;
      }

      setFamily(familyData);

      // Load shared lists
      const { lists, error: listsError } = await FamilyService.getFamilyShoppingLists(familyData.id);
      if (listsError) {
        console.error('Error loading shared lists:', listsError);
      } else {
        setSharedLists(lists);
      }

      // Load budgets
      const { budgets: budgetData, error: budgetsError } = await FamilyService.getFamilyBudgets(familyData.id);
      if (budgetsError) {
        console.error('Error loading budgets:', budgetsError);
      } else {
        setBudgets(budgetData);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFamily = async (name: string) => {
    const { family: newFamily, error } = await FamilyService.createFamily(name);
    if (error) {
      setError(error);
    } else {
      await loadFamilyData();
      setShowCreateFamily(false);
    }
  };

  const handleInviteMember = async (email: string, role: 'admin' | 'member') => {
    if (!family) return;
    
    const { success, error } = await FamilyService.inviteToFamily(family.id, email, role);
    if (error) {
      setError(error);
    } else {
      setShowInviteMember(false);
      // Show success message
      alert(`Invitation sent to ${email}!`);
    }
  };

  const handleCreateSharedList = async (name: string, description?: string, budget?: number) => {
    if (!family) return;
    
    const { list, error } = await FamilyService.createSharedList(family.id, name, description, budget);
    if (error) {
      setError(error);
    } else {
      await loadFamilyData();
      setShowCreateList(false);
    }
  };

  const calculateFamilyStats = () => {
    const totalLists = sharedLists.length;
    const completedLists = sharedLists.filter(list => list.status === 'completed').length;
    const totalBudget = budgets.reduce((sum, budget) => sum + budget.total_amount, 0);
    const totalSpent = budgets.reduce((sum, budget) => sum + (budget.spent_amount || 0), 0);
    const totalItems = sharedLists.reduce((sum, list) => sum + list.shared_list_items.length, 0);
    const completedItems = sharedLists.reduce((sum, list) => 
      sum + list.shared_list_items.filter(item => item.completed).length, 0
    );

    return {
      totalLists,
      completedLists,
      totalBudget,
      totalSpent,
      totalItems,
      completedItems,
      savings: totalBudget - totalSpent
    };
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-red-800 mb-2">Error</h3>
          <p className="text-red-700">{error}</p>
          <button
            onClick={loadFamilyData}
            className="mt-4 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!family) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-16">
          <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Users className="h-12 w-12 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Welcome to Family Sharing</h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Create a family group to share shopping lists, track budgets together, and coordinate your grocery shopping with family members.
          </p>
          <button
            onClick={() => setShowCreateFamily(true)}
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            <Plus className="h-5 w-5" />
            <span>Create Your Family Group</span>
          </button>
        </div>

        <CreateFamilyModal
          isOpen={showCreateFamily}
          onClose={() => setShowCreateFamily(false)}
          onCreateFamily={handleCreateFamily}
        />
      </div>
    );
  }

  if (selectedList) {
    return (
      <SharedListView
        list={selectedList}
        onBack={() => setSelectedList(null)}
        onUpdate={loadFamilyData}
      />
    );
  }

  const stats = calculateFamilyStats();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 via-orange-500 to-blue-600 rounded-2xl p-8 text-white mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">{family.name}</h1>
            <p className="text-white/90">
              {family.family_members.length} member{family.family_members.length !== 1 ? 's' : ''} • 
              Created {new Date(family.created_at || '').toLocaleDateString()}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowInviteMember(true)}
              className="bg-white/20

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

I'll avoid generic templates and instead create interfaces that feel thoughtfully crafted, with attention to visual hierarchy, user flow, and delightful interactions. Each design will be production-ready with proper accessibility, performance considerations, and maintainable code structure.

What would you like me to design or improve first? I'm ready to create something beautiful and functional!

Previous Message #2:

I need to add a family sharing feature to the app. This should allow users to create family groups, invite family members, and share shopping lists with specific family members. The feature should include:

1. Family group management (create, edit, delete family groups)
2. Member invitation system (send invites via email)
3. Role-based permissions (admin vs member)
4. Shared shopping list management
5. Family member profiles and activity tracking

Please implement this as a comprehensive family sharing system with a beautiful, intuitive interface.

(Assistant response below)

I'll create a comprehensive family sharing system with a beautiful, intuitive interface. This will include family group management, member invitations, role-based permissions, and shared shopping list functionality.

<boltArtifact id="family-sharing-system" title="Comprehensive Family Sharing System">
  )
}