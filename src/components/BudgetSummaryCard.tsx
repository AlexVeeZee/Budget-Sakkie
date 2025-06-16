import React, { useState } from 'react';
import { Target, TrendingUp, TrendingDown, ChevronDown, ChevronUp, AlertTriangle, CheckCircle, Users, DollarSign } from 'lucide-react';
import { useCurrency } from '../hooks/useCurrency';

interface BudgetSummaryCardProps {
  currentSpending: number;
  budget: number;
  estimatedTotal: number;
  optimizedSavings: number;
  familyMemberCount: number;
  onBudgetUpdate: (newBudget: number) => void;
  spendingHistory?: Array<{ date: string; amount: number; category: string }>;
}

export const BudgetSummaryCard: React.FC<BudgetSummaryCardProps> = ({
  currentSpending,
  budget,
  estimatedTotal,
  optimizedSavings,
  familyMemberCount,
  onBudgetUpdate,
  spendingHistory = []
}) => {
  const { formatCurrency } = useCurrency();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showBudgetEdit, setShowBudgetEdit] = useState(false);
  const [tempBudget, setTempBudget] = useState(budget);

  // Calculate budget metrics
  const remainingBudget = budget - currentSpending;
  const percentageUsed = budget > 0 ? (currentSpending / budget) * 100 : 0;
  const isOverBudget = currentSpending > budget;
  const isApproachingLimit = percentageUsed >= 80 && percentageUsed < 100;

  // Get progress bar color
  const getProgressColor = () => {
    if (isOverBudget) return 'bg-red-500';
    if (isApproachingLimit) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  // Get status icon and color
  const getStatusIcon = () => {
    if (isOverBudget) return { icon: AlertTriangle, color: 'text-red-600', bgColor: 'bg-red-100' };
    if (isApproachingLimit) return { icon: AlertTriangle, color: 'text-yellow-600', bgColor: 'bg-yellow-100' };
    return { icon: CheckCircle, color: 'text-green-600', bgColor: 'bg-green-100' };
  };

  const StatusIcon = getStatusIcon().icon;

  const handleBudgetSave = () => {
    onBudgetUpdate(tempBudget);
    setShowBudgetEdit(false);
  };

  const handleBudgetCancel = () => {
    setTempBudget(budget);
    setShowBudgetEdit(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
      {/* Compact Summary View */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            <Target className="h-5 w-5 text-green-600" />
            <span>Shopping Summary</span>
          </h3>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            <span>{isExpanded ? 'Less' : 'Budget Tracker'}</span>
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>

        {/* Compact 4-column grid */}
        <div className="grid grid-cols-4 gap-3">
          {/* Estimated Total */}
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold mx-auto mb-1">
              R
            </span>
            <p className="text-lg font-bold text-gray-900">{formatCurrency(estimatedTotal)}</p>
            <p className="text-xs text-gray-600">Estimated</p>
          </div>

          {/* Budget Status */}
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center mx-auto mb-1 ${getStatusIcon().bgColor}`}>
              <StatusIcon className={`h-4 w-4 ${getStatusIcon().color}`} />
            </div>
            <p className="text-lg font-bold text-gray-900">{formatCurrency(budget)}</p>
            <p className="text-xs text-gray-600">Budget</p>
          </div>

          {/* Optimized Savings */}
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <span className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold mx-auto mb-1">
              R
            </span>
            <p className="text-lg font-bold text-green-600">{formatCurrency(optimizedSavings)}</p>
            <p className="text-xs text-gray-600">Savings</p>
          </div>

          {/* Family Members */}
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <Users className="h-6 w-6 text-blue-600 mx-auto mb-1" />
            <p className="text-lg font-bold text-blue-600">{familyMemberCount}</p>
            <p className="text-xs text-gray-600">Members</p>
          </div>
        </div>

        {/* Compact Progress Bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm text-gray-600">Budget Progress</span>
            <span className="text-sm font-medium text-gray-900">
              {percentageUsed.toFixed(0)}% used
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${getProgressColor()}`}
              style={{ width: `${Math.min(percentageUsed, 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>{formatCurrency(currentSpending)} spent</span>
            <span className={remainingBudget >= 0 ? 'text-green-600' : 'text-red-600'}>
              {remainingBudget >= 0 ? formatCurrency(remainingBudget) + ' left' : formatCurrency(Math.abs(remainingBudget)) + ' over'}
            </span>
          </div>
        </div>
      </div>

      {/* Expanded Budget Tracker */}
      {isExpanded && (
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <div className="space-y-4">
            {/* Budget Management */}
            <div className="bg-white rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900">Budget Management</h4>
                {!showBudgetEdit && (
                  <button
                    onClick={() => setShowBudgetEdit(true)}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Edit Budget
                  </button>
                )}
              </div>

              {showBudgetEdit ? (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Weekly Budget
                    </label>
                    <div className="flex items-center space-x-2">
                      <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">R</span>
                        <input
                          type="number"
                          value={tempBudget}
                          onChange={(e) => setTempBudget(parseFloat(e.target.value) || 0)}
                          className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          placeholder="0.00"
                        />
                      </div>
                      <button
                        onClick={handleBudgetSave}
                        className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg"
                      >
                        Save
                      </button>
                      <button
                        onClick={handleBudgetCancel}
                        className="px-3 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 text-sm font-medium rounded-lg"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>

                  {/* Quick Budget Presets */}
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Quick presets:</p>
                    <div className="grid grid-cols-4 gap-2">
                      {[300, 500, 800, 1200].map((amount) => (
                        <button
                          key={amount}
                          onClick={() => setTempBudget(amount)}
                          className={`p-2 text-sm rounded border ${
                            tempBudget === amount
                              ? 'border-green-500 bg-green-50 text-green-700'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          {formatCurrency(amount)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(currentSpending)}</p>
                    <p className="text-sm text-gray-600">Current Spending</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(budget)}</p>
                    <p className="text-sm text-gray-600">Budget Goal</p>
                  </div>
                  <div className="text-center">
                    <p className={`text-2xl font-bold ${remainingBudget >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(Math.abs(remainingBudget))}
                    </p>
                    <p className="text-sm text-gray-600">
                      {remainingBudget >= 0 ? 'Remaining' : 'Over Budget'}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Smart Insights */}
            {(isOverBudget || isApproachingLimit) && (
              <div className={`p-4 rounded-lg border-l-4 ${
                isOverBudget ? 'bg-red-50 border-red-400' : 'bg-yellow-50 border-yellow-400'
              }`}>
                <div className="flex items-start space-x-3">
                  <AlertTriangle className={`h-5 w-5 mt-0.5 ${
                    isOverBudget ? 'text-red-600' : 'text-yellow-600'
                  }`} />
                  <div>
                    <h5 className={`font-medium text-sm ${
                      isOverBudget ? 'text-red-800' : 'text-yellow-800'
                    }`}>
                      {isOverBudget ? 'Budget Exceeded' : 'Approaching Budget Limit'}
                    </h5>
                    <p className={`text-sm mt-1 ${
                      isOverBudget ? 'text-red-700' : 'text-yellow-700'
                    }`}>
                      {isOverBudget 
                        ? `You've exceeded your budget by ${formatCurrency(currentSpending - budget)}. Consider reviewing your recent purchases.`
                        : `You've used ${percentageUsed.toFixed(0)}% of your budget. ${formatCurrency(remainingBudget)} remaining.`
                      }
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Money-Saving Tip */}
            <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-lg">
              <div className="flex items-start space-x-3">
                <TrendingUp className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <h5 className="font-medium text-sm text-green-800">Money-Saving Tip</h5>
                  <p className="text-sm text-green-700 mt-1">
                    Try shopping at multiple stores to find the best deals, or consider generic brands for 15-30% savings.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};