import React, { useState, useEffect } from 'react';
import { Target, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Info, Lightbulb, Bell, Mail, Smartphone, Calendar, DollarSign, PieChart, BarChart3, HelpCircle } from 'lucide-react';
import { useCurrency } from '../hooks/useCurrency';

interface BudgetTrackerProps {
  currentSpending: number;
  budget: number;
  onBudgetUpdate: (newBudget: number) => void;
  spendingHistory?: Array<{ date: string; amount: number; category: string }>;
  className?: string;
}

interface BudgetInsight {
  type: 'recommendation' | 'warning' | 'tip';
  title: string;
  message: string;
  action?: string;
}

export const BudgetTracker: React.FC<BudgetTrackerProps> = ({
  currentSpending,
  budget,
  onBudgetUpdate,
  spendingHistory = [],
  className = ""
}) => {
  const { formatCurrency } = useCurrency();
  const [showNotificationSettings, setShowNotificationSettings] = useState(false);
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    sms: false
  });
  const [showTooltip, setShowTooltip] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  // Calculate budget metrics
  const remainingBudget = budget - currentSpending;
  const percentageUsed = budget > 0 ? (currentSpending / budget) * 100 : 0;
  const isOverBudget = currentSpending > budget;
  const isApproachingLimit = percentageUsed >= 80 && percentageUsed < 100;

  // Calculate historical average for recommendations
  const historicalAverage = spendingHistory.length > 0 
    ? spendingHistory.reduce((sum, entry) => sum + entry.amount, 0) / spendingHistory.length
    : currentSpending;

  const recommendedBudget = Math.ceil(historicalAverage * 1.1); // 10% buffer

  // Get progress bar color
  const getProgressColor = () => {
    if (isOverBudget) return 'bg-red-500';
    if (isApproachingLimit) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  // Get status icon and color
  const getStatusIcon = () => {
    if (isOverBudget) return { icon: AlertTriangle, color: 'text-red-600' };
    if (isApproachingLimit) return { icon: AlertTriangle, color: 'text-yellow-600' };
    return { icon: CheckCircle, color: 'text-green-600' };
  };

  // Generate smart insights
  const getInsights = (): BudgetInsight[] => {
    const insights: BudgetInsight[] = [];

    // Budget recommendation
    if (Math.abs(budget - recommendedBudget) > 50) {
      insights.push({
        type: 'recommendation',
        title: 'Budget Recommendation',
        message: `Based on your spending history, we recommend a monthly budget of ${formatCurrency(recommendedBudget)}`,
        action: 'Update Budget'
      });
    }

    // Overspending warning
    if (isOverBudget) {
      insights.push({
        type: 'warning',
        title: 'Budget Exceeded',
        message: `You've exceeded your budget by ${formatCurrency(currentSpending - budget)}. Consider reviewing your recent purchases.`,
        action: 'View Spending'
      });
    }

    // Approaching limit warning
    if (isApproachingLimit) {
      insights.push({
        type: 'warning',
        title: 'Approaching Budget Limit',
        message: `You've used ${percentageUsed.toFixed(0)}% of your budget. ${formatCurrency(remainingBudget)} remaining.`,
        action: 'Track Spending'
      });
    }

    // Saving tips
    if (percentageUsed > 50) {
      insights.push({
        type: 'tip',
        title: 'Money-Saving Tip',
        message: 'Try shopping at multiple stores to find the best deals, or consider generic brands for 15-30% savings.',
        action: 'Find Deals'
      });
    }

    return insights;
  };

  const insights = getInsights();
  const StatusIcon = getStatusIcon().icon;

  // Show success message when budget is updated
  const handleBudgetUpdate = (newBudget: number) => {
    onBudgetUpdate(newBudget);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  // Tooltip component
  const Tooltip: React.FC<{ id: string; title: string; content: string; children: React.ReactNode }> = ({ 
    id, title, content, children 
  }) => (
    <div className="relative">
      <div
        onMouseEnter={() => setShowTooltip(id)}
        onMouseLeave={() => setShowTooltip(null)}
        className="cursor-help"
      >
        {children}
      </div>
      {showTooltip === id && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10 max-w-xs">
          <div className="font-semibold mb-1">{title}</div>
          <div className="text-xs">{content}</div>
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
        </div>
      )}
    </div>
  );

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden ${className}`}>
      {/* Success Message */}
      {showSuccess && (
        <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-4">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-400 mr-3" />
            <div>
              <p className="text-sm font-medium text-green-800">Budget Updated Successfully!</p>
              <p className="text-sm text-green-700">Your new budget has been saved and tracking has been updated.</p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-green-50 to-blue-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <Target className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Budget Tracker</h3>
              <p className="text-sm text-gray-600">Monitor your spending goals</p>
            </div>
          </div>
          
          <Tooltip
            id="budget-help"
            title="How Budget Tracking Works"
            content="We track your spending against your set budget and provide insights to help you save money and stay on track."
          >
            <HelpCircle className="h-5 w-5 text-gray-400 hover:text-gray-600" />
          </Tooltip>
        </div>
      </div>

      {/* Main Budget Display */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Current Spending */}
          <div className="text-center">
            <Tooltip
              id="current-spending"
              title="Current Spending"
              content="Total amount spent so far this period based on your shopping lists and purchases."
            >
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-blue-600 font-bold">R</span>
              </div>
            </Tooltip>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(currentSpending)}</p>
            <p className="text-sm text-gray-600">Current Spending</p>
          </div>

          {/* Budget */}
          <div className="text-center">
            <Tooltip
              id="budget-amount"
              title="Budget Goal"
              content="Your target spending limit for this period. You can adjust this based on your financial goals."
            >
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Target className="h-6 w-6 text-green-600" />
              </div>
            </Tooltip>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(budget)}</p>
            <p className="text-sm text-gray-600">Budget Goal</p>
          </div>

          {/* Remaining */}
          <div className="text-center">
            <Tooltip
              id="remaining-budget"
              title="Remaining Budget"
              content="Amount left to spend before reaching your budget limit. Negative values indicate overspending."
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 ${
                remainingBudget >= 0 ? 'bg-green-100' : 'bg-red-100'
              }`}>
                {remainingBudget >= 0 ? (
                  <TrendingUp className="h-6 w-6 text-green-600" />
                ) : (
                  <TrendingDown className="h-6 w-6 text-red-600" />
                )}
              </div>
            </Tooltip>
            <p className={`text-2xl font-bold ${remainingBudget >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(Math.abs(remainingBudget))}
            </p>
            <p className="text-sm text-gray-600">
              {remainingBudget >= 0 ? 'Remaining' : 'Over Budget'}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <StatusIcon className={`h-5 w-5 ${getStatusIcon().color}`} />
              <span className="text-sm font-medium text-gray-700">
                Budget Progress
              </span>
            </div>
            <span className="text-sm font-semibold text-gray-900">
              {percentageUsed.toFixed(1)}% used
            </span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div 
              className={`h-3 rounded-full transition-all duration-500 ${getProgressColor()}`}
              style={{ width: `${Math.min(percentageUsed, 100)}%` }}
            />
            {/* Overflow indicator */}
            {isOverBudget && (
              <div 
                className="h-3 bg-red-300 bg-opacity-50 rounded-full"
                style={{ width: `${Math.min(percentageUsed - 100, 100)}%` }}
              />
            )}
          </div>
          
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>R0</span>
            <span>{formatCurrency(budget)}</span>
          </div>
        </div>

        {/* Quick Budget Adjustment */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Quick Budget Adjustment</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {[
              { amount: 300, label: 'Basic' },
              { amount: 500, label: 'Standard' },
              { amount: 800, label: 'Family' },
              { amount: recommendedBudget, label: 'Recommended' }
            ].map((option) => (
              <button
                key={option.amount}
                onClick={() => handleBudgetUpdate(option.amount)}
                className={`p-3 rounded-lg border-2 transition-all text-center ${
                  budget === option.amount
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }`}
              >
                <div className="font-bold">{formatCurrency(option.amount)}</div>
                <div className="text-xs text-gray-500">{option.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Insights and Recommendations */}
        {insights.length > 0 && (
          <div className="space-y-3 mb-6">
            <h4 className="text-sm font-medium text-gray-900 flex items-center space-x-2">
              <Lightbulb className="h-4 w-4 text-yellow-500" />
              <span>Smart Insights</span>
            </h4>
            
            {insights.map((insight, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border-l-4 ${
                  insight.type === 'warning' 
                    ? 'bg-yellow-50 border-yellow-400' 
                    : insight.type === 'recommendation'
                    ? 'bg-blue-50 border-blue-400'
                    : 'bg-green-50 border-green-400'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h5 className={`font-medium text-sm ${
                      insight.type === 'warning' 
                        ? 'text-yellow-800' 
                        : insight.type === 'recommendation'
                        ? 'text-blue-800'
                        : 'text-green-800'
                    }`}>
                      {insight.title}
                    </h5>
                    <p className={`text-sm mt-1 ${
                      insight.type === 'warning' 
                        ? 'text-yellow-700' 
                        : insight.type === 'recommendation'
                        ? 'text-blue-700'
                        : 'text-green-700'
                    }`}>
                      {insight.message}
                    </p>
                  </div>
                  {insight.action && (
                    <button className={`ml-4 px-3 py-1 rounded text-xs font-medium ${
                      insight.type === 'warning' 
                        ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' 
                        : insight.type === 'recommendation'
                        ? 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                        : 'bg-green-100 text-green-800 hover:bg-green-200'
                    }`}>
                      {insight.action}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Notification Settings */}
        <div className="border-t border-gray-200 pt-4">
          <button
            onClick={() => setShowNotificationSettings(!showNotificationSettings)}
            className="flex items-center justify-between w-full text-left"
          >
            <div className="flex items-center space-x-2">
              <Bell className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-900">Budget Alerts</span>
            </div>
            <span className="text-xs text-gray-500">
              {Object.values(notifications).some(Boolean) ? 'Enabled' : 'Disabled'}
            </span>
          </button>
          
          {showNotificationSettings && (
            <div className="mt-3 space-y-3 pl-6">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={notifications.email}
                  onChange={(e) => setNotifications(prev => ({ ...prev, email: e.target.checked }))}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <Mail className="h-4 w-4 text-gray-600" />
                <span className="text-sm text-gray-700">Email notifications</span>
              </label>
              
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={notifications.push}
                  onChange={(e) => setNotifications(prev => ({ ...prev, push: e.target.checked }))}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <Bell className="h-4 w-4 text-gray-600" />
                <span className="text-sm text-gray-700">Push notifications</span>
              </label>
              
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={notifications.sms}
                  onChange={(e) => setNotifications(prev => ({ ...prev, sms: e.target.checked }))}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <Smartphone className="h-4 w-4 text-gray-600" />
                <span className="text-sm text-gray-700">SMS alerts</span>
              </label>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};