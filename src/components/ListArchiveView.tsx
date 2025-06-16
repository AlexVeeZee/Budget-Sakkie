import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Plus, Calendar, DollarSign, Users, ShoppingCart, Edit2, Trash2, Search, Filter, Star, SortAsc, SortDesc, CheckSquare, X, ArrowUp, Crown, Shield, ChevronDown } from 'lucide-react';
import { ShoppingList } from '../types';
import { useCurrency } from '../hooks/useCurrency';

interface ListArchiveViewProps {
  lists: ShoppingList[];
  onSelectList: (list: ShoppingList) => void;
  onCreateNew: () => void;
  onDeleteList: (listId: string) => void;
  onUpdateList?: (updatedList: ShoppingList) => void;
}

type SortOption = 'recent' | 'name' | 'budget' | 'items' | 'completion' | 'members';
type SortDirection = 'asc' | 'desc';

interface FilterOptions {
  showCompleted: boolean;
  showShared: boolean;
  minBudget: number;
  maxBudget: number;
  categories: string[];
  minMembers: number;
  maxMembers: number;
}

interface FamilyMember {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'member';
  avatar: string;
}

// Sample family members data - in a real app this would come from a context or API
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
    name: 'Pieter Van Der Merwe',
    email: 'pieter.vandermerwe@email.com',
    role: 'member',
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop'
  }
];

export const ListArchiveView: React.FC<ListArchiveViewProps> = ({
  lists,
  onSelectList,
  onCreateNew,
  onDeleteList,
  onUpdateList
}) => {
  const { formatCurrency } = useCurrency();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [selectedLists, setSelectedLists] = useState<Set<string>>(new Set());
  const [showBatchActions, setShowBatchActions] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const sortDropdownRef = useRef<HTMLDivElement>(null);
  
  const [filters, setFilters] = useState<FilterOptions>({
    showCompleted: true,
    showShared: true,
    minBudget: 0,
    maxBudget: 10000,
    categories: [],
    minMembers: 0,
    maxMembers: 10
  });

  // Scroll detection for floating button
  useEffect(() => {
    const handleScroll = () => {
      if (scrollContainerRef.current) {
        const scrollTop = scrollContainerRef.current.scrollTop;
        setShowScrollTop(scrollTop > 300);
      }
    };

    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target as Node)) {
        setShowSortDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Close dropdown on escape key
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowSortDropdown(false);
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, []);

  // Helper function to get family member details
  const getFamilyMemberDetails = (memberName: string): FamilyMember | null => {
    return availableFamilyMembers.find(member => member.name === memberName) || null;
  };

  // Helper function to get family member count including owner
  const getFamilyMemberCount = (list: ShoppingList): number => {
    return list.sharedWith.length + 1; // +1 for the list owner
  };

  // Enhanced filtering and sorting logic with family member support
  const filteredAndSortedLists = useMemo(() => {
    let filtered = lists.filter(list => {
      // Text search
      const matchesSearch = searchQuery === '' || 
        list.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        list.items.some(item => 
          item.product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.product.category.toLowerCase().includes(searchQuery.toLowerCase())
        ) ||
        list.sharedWith.some(member => 
          member.toLowerCase().includes(searchQuery.toLowerCase())
        );

      // Completion filter
      const completionRate = list.items.length > 0 ? 
        (list.items.filter(item => item.completed).length / list.items.length) : 0;
      const isCompleted = completionRate >= 0.8; // 80% or more completed
      
      if (!filters.showCompleted && isCompleted) return false;

      // Shared filter
      if (!filters.showShared && list.sharedWith.length > 0) return false;

      // Budget filter
      const budget = list.budget || 0;
      if (budget < filters.minBudget || budget > filters.maxBudget) return false;

      // Family member count filter
      const memberCount = getFamilyMemberCount(list);
      if (memberCount < filters.minMembers || memberCount > filters.maxMembers) return false;

      // Category filter (based on items in the list)
      if (filters.categories.length > 0) {
        const listCategories = [...new Set(list.items.map(item => item.product.category))];
        const hasMatchingCategory = filters.categories.some(cat => listCategories.includes(cat));
        if (!hasMatchingCategory) return false;
      }

      return matchesSearch;
    });

    // Sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'budget':
          comparison = (a.budget || 0) - (b.budget || 0);
          break;
        case 'items':
          comparison = a.items.length - b.items.length;
          break;
        case 'members':
          comparison = getFamilyMemberCount(a) - getFamilyMemberCount(b);
          break;
        case 'completion':
          const aCompletion = a.items.length > 0 ? 
            (a.items.filter(item => item.completed).length / a.items.length) : 0;
          const bCompletion = b.items.length > 0 ? 
            (b.items.filter(item => item.completed).length / b.items.length) : 0;
          comparison = aCompletion - bCompletion;
          break;
        case 'recent':
        default:
          comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
          break;
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [lists, searchQuery, sortBy, sortDirection, filters]);

  // Get unique categories from all lists
  const availableCategories = useMemo(() => {
    const categories = new Set<string>();
    lists.forEach(list => {
      list.items.forEach(item => {
        categories.add(item.product.category);
      });
    });
    return Array.from(categories).sort();
  }, [lists]);

  const sortOptions = [
    { key: 'recent', label: 'Recent' },
    { key: 'name', label: 'Name' },
    { key: 'budget', label: 'Budget' },
    { key: 'items', label: 'Items' },
    { key: 'members', label: 'Members' },
    { key: 'completion', label: 'Progress' }
  ];

  const handleSortChange = (newSortBy: SortOption) => {
    if (sortBy === newSortBy) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortDirection('desc');
    }
    setShowSortDropdown(false);
  };

  const getCurrentSortLabel = () => {
    const option = sortOptions.find(opt => opt.key === sortBy);
    return option ? option.label : 'Recent';
  };

  const handleDeleteConfirm = (listId: string) => {
    onDeleteList(listId);
    setShowDeleteConfirm(null);
    setSelectedLists(prev => {
      const newSet = new Set(prev);
      newSet.delete(listId);
      return newSet;
    });
  };

  // Individual checkbox click handler
  const handleCheckboxClick = (event: React.MouseEvent, listId: string) => {
    // Prevent the card click event from triggering
    event.preventDefault();
    event.stopPropagation();
    
    setSelectedLists(prev => {
      const newSet = new Set(prev);
      if (newSet.has(listId)) {
        newSet.delete(listId);
      } else {
        newSet.add(listId);
      }
      
      // Update batch actions visibility
      setShowBatchActions(newSet.size > 0);
      
      return newSet;
    });
  };

  // Header checkbox click handler (select/deselect all)
  const handleSelectAll = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    if (selectedLists.size === filteredAndSortedLists.length) {
      // Deselect all
      setSelectedLists(new Set());
      setShowBatchActions(false);
    } else {
      // Select all visible lists
      const allVisibleIds = new Set(filteredAndSortedLists.map(list => list.id));
      setSelectedLists(allVisibleIds);
      setShowBatchActions(true);
    }
  };

  // Card click handler (excludes checkbox area)
  const handleCardClick = (list: ShoppingList) => {
    onSelectList(list);
  };

  const handleBatchDelete = () => {
    if (confirm(`Are you sure you want to delete ${selectedLists.size} selected lists?`)) {
      selectedLists.forEach(listId => onDeleteList(listId));
      setSelectedLists(new Set());
      setShowBatchActions(false);
    }
  };

  const scrollToTop = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const getCompletionPercentage = (list: ShoppingList) => {
    if (list.items.length === 0) return 0;
    const completed = list.items.filter(item => item.completed).length;
    return Math.round((completed / list.items.length) * 100);
  };

  const getEstimatedTotal = (list: ShoppingList) => {
    return list.items.reduce((total, item) => total + (item.quantity * 20), 0);
  };

  const getListPreviewItems = (list: ShoppingList) => {
    return list.items.slice(0, 3);
  };

  // Real-time family member statistics
  const familyMemberStats = useMemo(() => {
    const totalMembers = new Set<string>();
    const sharedLists = lists.filter(list => list.sharedWith.length > 0);
    
    lists.forEach(list => {
      list.sharedWith.forEach(member => totalMembers.add(member));
    });

    return {
      totalUniqueMembers: totalMembers.size,
      totalSharedLists: sharedLists.length,
      averageMembersPerList: lists.length > 0 ? 
        lists.reduce((sum, list) => sum + getFamilyMemberCount(list), 0) / lists.length : 0
    };
  }, [lists]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" ref={scrollContainerRef}>
      {/* Enhanced Header with Family Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Shopping Lists</h1>
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
            <span>{lists.length} total lists</span>
            <span>•</span>
            <span>{filteredAndSortedLists.length} showing</span>
            <span>•</span>
            <span className="flex items-center space-x-1">
              <Users className="h-4 w-4" />
              <span>{familyMemberStats.totalUniqueMembers} family members</span>
            </span>
            <span>•</span>
            <span>{familyMemberStats.totalSharedLists} shared lists</span>
            {selectedLists.size > 0 && (
              <>
                <span>•</span>
                <span className="text-blue-600 font-medium">{selectedLists.size} selected</span>
              </>
            )}
          </div>
        </div>
        
        <div className="mt-4 sm:mt-0">
          <button
            onClick={onCreateNew}
            className="flex items-center space-x-2 py-2 px-4 rounded-lg font-medium transition-colors"
            style={{ 
              backgroundColor: 'rgb(240, 253, 244)',
              color: 'rgb(22, 163, 74)',
              fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif',
              fontSize: '16px'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgb(220, 252, 231)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgb(240, 253, 244)'}
          >
            <Plus className="h-5 w-5" />
            <span>Create New List</span>
          </button>
        </div>
      </div>

      {/* Enhanced Search, Filter, and Sort Bar */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search lists, items, categories, or family members..."
              className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl bg-white shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 placeholder-gray-500"
              style={{ 
                fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif',
                fontSize: '16px'
              }}
            />
          </div>
          
          {/* Sort Dropdown */}
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700 whitespace-nowrap">Sort by:</span>
            <div className="relative" ref={sortDropdownRef}>
              <button
                onClick={() => setShowSortDropdown(!showSortDropdown)}
                className="flex items-center justify-between space-x-2 px-4 py-3 bg-white border border-gray-300 rounded-xl shadow-sm hover:bg-gray-50 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors min-w-[140px]"
                style={{ 
                  fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif',
                  fontSize: '16px',
                  color: 'rgb(0, 0, 0)',
                  backgroundColor: 'transparent'
                }}
                aria-label="Sort options"
                aria-expanded={showSortDropdown}
                aria-haspopup="listbox"
              >
                <div className="flex items-center space-x-2">
                  <span className="font-medium">{getCurrentSortLabel()}</span>
                  {sortDirection === 'asc' ? <SortAsc className="h-3 w-3" /> : <SortDesc className="h-3 w-3" />}
                </div>
                <ChevronDown 
                  className={`h-4 w-4 transition-transform duration-200 ${showSortDropdown ? 'rotate-180' : ''}`} 
                />
              </button>

              {/* Dropdown Menu */}
              {showSortDropdown && (
                <div 
                  className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden"
                  style={{
                    animation: 'fadeIn 0.15s ease-out',
                    transformOrigin: 'top'
                  }}
                  role="listbox"
                  aria-label="Sort options"
                >
                  {sortOptions.map((option) => (
                    <button
                      key={option.key}
                      onClick={() => handleSortChange(option.key as SortOption)}
                      className={`w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                        sortBy === option.key ? 'bg-green-50 text-green-800' : 'text-gray-700'
                      }`}
                      style={{ 
                        fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif',
                        fontSize: '16px',
                        color: sortBy === option.key ? 'rgb(22, 101, 52)' : 'rgb(0, 0, 0)',
                        backgroundColor: sortBy === option.key ? 'rgb(240, 253, 244)' : 'transparent'
                      }}
                      role="option"
                      aria-selected={sortBy === option.key}
                    >
                      <span className="font-medium">{option.label}</span>
                      {sortBy === option.key && (
                        <div className="flex items-center space-x-1">
                          {sortDirection === 'asc' ? <SortAsc className="h-3 w-3" /> : <SortDesc className="h-3 w-3" />}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              showFilters ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Filter className="h-4 w-4" />
            <span>Filters</span>
          </button>
        </div>

        {/* Advanced Filters with Family Member Options */}
        {showFilters && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Show/Hide Options */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Display Options</label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.showCompleted}
                      onChange={(e) => setFilters(prev => ({ ...prev, showCompleted: e.target.checked }))}
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Show completed lists</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.showShared}
                      onChange={(e) => setFilters(prev => ({ ...prev, showShared: e.target.checked }))}
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Show shared lists</span>
                  </label>
                </div>
              </div>

              {/* Budget Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Budget Range</label>
                <div className="space-y-2">
                  <input
                    type="range"
                    min="0"
                    max="10000"
                    step="100"
                    value={filters.maxBudget}
                    onChange={(e) => setFilters(prev => ({ ...prev, maxBudget: parseInt(e.target.value) }))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>{formatCurrency(filters.minBudget)}</span>
                    <span>{formatCurrency(filters.maxBudget)}</span>
                  </div>
                </div>
              </div>

              {/* Family Member Count Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Family Members</label>
                <div className="space-y-2">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    step="1"
                    value={filters.maxMembers}
                    onChange={(e) => setFilters(prev => ({ ...prev, maxMembers: parseInt(e.target.value) }))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>{filters.minMembers} member{filters.minMembers !== 1 ? 's' : ''}</span>
                    <span>{filters.maxMembers} member{filters.maxMembers !== 1 ? 's' : ''}</span>
                  </div>
                </div>
              </div>

              {/* Categories */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Categories</label>
                <div className="max-h-24 overflow-y-auto space-y-1">
                  {availableCategories.map((category) => (
                    <label key={category} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.categories.includes(category)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFilters(prev => ({ ...prev, categories: [...prev.categories, category] }));
                          } else {
                            setFilters(prev => ({ ...prev, categories: prev.categories.filter(c => c !== category) }));
                          }
                        }}
                        className="h-3 w-3 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-xs text-gray-700">{category}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Reset Filters */}
              <div className="flex items-end">
                <button
                  onClick={() => setFilters({
                    showCompleted: true,
                    showShared: true,
                    minBudget: 0,
                    maxBudget: 10000,
                    categories: [],
                    minMembers: 0,
                    maxMembers: 10
                  })}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-sm"
                >
                  Reset Filters
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Batch Actions Bar */}
      {selectedLists.size > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleSelectAll}
                className="flex items-center space-x-2 text-blue-700 hover:text-blue-800"
              >
                <CheckSquare className="h-4 w-4" />
                <span className="text-sm font-medium">
                  {selectedLists.size === filteredAndSortedLists.length ? 'Deselect All' : 'Select All'}
                </span>
              </button>
              <span className="text-sm text-blue-700">
                {selectedLists.size} list{selectedLists.size !== 1 ? 's' : ''} selected
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={handleBatchDelete}
                className="flex items-center space-x-2 px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors text-sm"
              >
                <Trash2 className="h-4 w-4" />
                <span>Delete Selected</span>
              </button>
              <button
                onClick={() => setSelectedLists(new Set())}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lists Grid with Enhanced Family Member Display */}
      {filteredAndSortedLists.length === 0 ? (
        <div className="text-center py-16">
          <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {searchQuery || showFilters ? 'No lists match your criteria' : 'No shopping lists yet'}
          </h3>
          <p className="text-gray-600 mb-6">
            {searchQuery || showFilters
              ? 'Try adjusting your search terms or filters' 
              : 'Create your first shopping list to get started with smart grocery shopping'
            }
          </p>
          {!searchQuery && !showFilters && (
            <button
              onClick={onCreateNew}
              className="inline-flex items-center space-x-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors"
            >
              <Plus className="h-5 w-5" />
              <span>Create Your First List</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedLists.map((list) => {
            const completionPercentage = getCompletionPercentage(list);
            const estimatedTotal = getEstimatedTotal(list);
            const previewItems = getListPreviewItems(list);
            const isSelected = selectedLists.has(list.id);
            const memberCount = getFamilyMemberCount(list);
            
            return (
              <div
                key={list.id}
                className={`bg-white rounded-xl shadow-sm border hover:shadow-md transition-all duration-200 overflow-hidden cursor-pointer ${
                  isSelected ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'
                }`}
                onClick={() => handleCardClick(list)}
              >
                {/* Card Header */}
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => handleCheckboxClick(e, list.id)}
                          onClick={(e) => handleCheckboxClick(e, list.id)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <h3 className="text-xl font-bold text-gray-900 flex-1" style={{ color: 'rgb(17, 24, 39)' }}>
                          {searchQuery ? (
                            <span dangerouslySetInnerHTML={{
                              __html: list.name.replace(
                                new RegExp(`(${searchQuery})`, 'gi'),
                                '<mark class="bg-yellow-200">$1</mark>'
                              )
                            }} />
                          ) : list.name}
                        </h3>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(list.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <ShoppingCart className="h-4 w-4" />
                          <span>{list.items.length} items</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-1" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => onSelectList(list)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit list"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(list.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete list"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                      <span>Progress</span>
                      <span>{completionPercentage}% complete</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${completionPercentage}%`,
                          backgroundColor: 'rgb(22, 163, 74)'
                        }}
                      />
                    </div>
                  </div>

                  {/* Enhanced Stats with Family Members */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <DollarSign className="h-4 w-4 text-green-600" />
                      </div>
                      <p className="text-lg font-bold text-gray-900">{formatCurrency(list.budget || estimatedTotal)}</p>
                      <p className="text-xs text-gray-600">Budget</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <ShoppingCart className="h-4 w-4 text-blue-600" />
                      </div>
                      <p className="text-lg font-bold text-gray-900">{list.items.length}</p>
                      <p className="text-xs text-gray-600">Items</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <Users className="h-4 w-4 text-purple-600" />
                      </div>
                      <p className="text-lg font-bold text-gray-900">{memberCount}</p>
                      <p className="text-xs text-gray-600">Members</p>
                    </div>
                  </div>
                </div>

                {/* Item Preview */}
                <div className="p-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Preview Items</h4>
                  {previewItems.length === 0 ? (
                    <p className="text-sm text-gray-500 italic">No items added yet</p>
                  ) : (
                    <div className="space-y-2">
                      {previewItems.map((item) => (
                        <div key={item.id} className="flex items-center space-x-3">
                          <img 
                            src={item.product.image}
                            alt={item.product.name}
                            className="w-8 h-8 object-cover rounded"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {searchQuery ? (
                                <span dangerouslySetInnerHTML={{
                                  __html: item.product.name.replace(
                                    new RegExp(`(${searchQuery})`, 'gi'),
                                    '<mark class="bg-yellow-200">$1</mark>'
                                  )
                                }} />
                              ) : item.product.name}
                            </p>
                            <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                          </div>
                          {item.completed && (
                            <div className="w-4 h-4 bg-green-600 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs">✓</span>
                            </div>
                          )}
                        </div>
                      ))}
                      {list.items.length > 3 && (
                        <p className="text-xs text-gray-500 mt-2">
                          +{list.items.length - 3} more items
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Enhanced Family Members Section */}
                {list.sharedWith.length > 0 && (
                  <div className="px-6 pb-6">
                    <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center space-x-2">
                      <Users className="h-4 w-4" />
                      <span>Shared with {list.sharedWith.length} member{list.sharedWith.length !== 1 ? 's' : ''}</span>
                    </h4>
                    <div className="space-y-2">
                      {list.sharedWith.slice(0, 3).map((memberName, index) => {
                        const memberDetails = getFamilyMemberDetails(memberName);
                        return (
                          <div key={index} className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg">
                            {memberDetails ? (
                              <>
                                <img 
                                  src={memberDetails.avatar}
                                  alt={memberDetails.name}
                                  className="w-6 h-6 rounded-full object-cover"
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center space-x-2">
                                    <span className="text-sm font-medium text-gray-900 truncate">
                                      {searchQuery ? (
                                        <span dangerouslySetInnerHTML={{
                                          __html: memberDetails.name.replace(
                                            new RegExp(`(${searchQuery})`, 'gi'),
                                            '<mark class="bg-yellow-200">$1</mark>'
                                          )
                                        }} />
                                      ) : memberDetails.name}
                                    </span>
                                    {memberDetails.role === 'admin' ? (
                                      <Crown className="h-3 w-3 text-yellow-600" />
                                    ) : (
                                      <Shield className="h-3 w-3 text-blue-600" />
                                    )}
                                  </div>
                                </div>
                              </>
                            ) : (
                              <>
                                <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                                  <span className="text-xs font-medium text-gray-600">
                                    {memberName.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                                <span className="text-sm font-medium text-gray-900 truncate">
                                  {searchQuery ? (
                                    <span dangerouslySetInnerHTML={{
                                      __html: memberName.replace(
                                        new RegExp(`(${searchQuery})`, 'gi'),
                                        '<mark class="bg-yellow-200">$1</mark>'
                                      )
                                    }} />
                                  ) : memberName}
                                </span>
                              </>
                            )}
                          </div>
                        );
                      })}
                      {list.sharedWith.length > 3 && (
                        <div className="text-xs text-gray-500 text-center py-1">
                          +{list.sharedWith.length - 3} more member{list.sharedWith.length - 3 !== 1 ? 's' : ''}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Floating Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-24 right-6 w-12 h-12 bg-green-600 hover:bg-green-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300 z-40"
          style={{ backgroundColor: 'rgb(22, 163, 74)' }}
        >
          <ArrowUp className="h-5 w-5" />
        </button>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Delete Shopping List</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this shopping list? This action cannot be undone and will remove all items and sharing permissions.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => handleDeleteConfirm(showDeleteConfirm)}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Delete
              </button>
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CSS for dropdown animation */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-8px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
};