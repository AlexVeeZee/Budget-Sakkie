import React, { useState } from 'react';
import { Gift, Star, Trophy, Target, Clock, CheckCircle, ArrowRight } from 'lucide-react';

interface Reward {
  id: string;
  title: string;
  description: string;
  pointsRequired: number;
  category: 'discount' | 'freebie' | 'cashback' | 'exclusive';
  retailer?: string;
  expiryDate?: string;
  claimed: boolean;
  image: string;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  progress: number;
  target: number;
  completed: boolean;
  reward: string;
  icon: string;
}

export const RewardsSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'rewards' | 'achievements'>('rewards');
  const [userPoints] = useState(3450);

  const availableRewards: Reward[] = [
    {
      id: '1',
      title: 'R50 Pick n Pay Voucher',
      description: 'Get R50 off your next shopping at Pick n Pay',
      pointsRequired: 2500,
      category: 'discount',
      retailer: 'Pick n Pay',
      expiryDate: '2024-03-31',
      claimed: false,
      image: 'https://images.pexels.com/photos/264547/pexels-photo-264547.jpeg?auto=compress&cs=tinysrgb&w=200&h=150&fit=crop'
    },
    {
      id: '2',
      title: 'Free Coffee at Woolworths Café',
      description: 'Enjoy a complimentary coffee at any Woolworths Café',
      pointsRequired: 1000,
      category: 'freebie',
      retailer: 'Woolworths',
      expiryDate: '2024-02-29',
      claimed: true,
      image: 'https://images.pexels.com/photos/312418/pexels-photo-312418.jpeg?auto=compress&cs=tinysrgb&w=200&h=150&fit=crop'
    },
    {
      id: '3',
      title: '10% Cashback on Groceries',
      description: 'Get 10% cashback on your next grocery purchase',
      pointsRequired: 3000,
      category: 'cashback',
      expiryDate: '2024-04-15',
      claimed: false,
      image: 'https://images.pexels.com/photos/259200/pexels-photo-259200.jpeg?auto=compress&cs=tinysrgb&w=200&h=150&fit=crop'
    },
    {
      id: '4',
      title: 'Early Access to Black Friday Deals',
      description: 'Get 24-hour early access to Black Friday promotions',
      pointsRequired: 5000,
      category: 'exclusive',
      expiryDate: '2024-11-29',
      claimed: false,
      image: 'https://images.pexels.com/photos/5632402/pexels-photo-5632402.jpeg?auto=compress&cs=tinysrgb&w=200&h=150&fit=crop'
    }
  ];

  const achievements: Achievement[] = [
    {
      id: '1',
      title: 'Smart Shopper',
      description: 'Compare prices for 50 different products',
      progress: 42,
      target: 50,
      completed: false,
      reward: '500 points',
      icon: '🛒'
    },
    {
      id: '2',
      title: 'Deal Hunter',
      description: 'Find and use 10 special deals',
      progress: 10,
      target: 10,
      completed: true,
      reward: '750 points',
      icon: '🎯'
    },
    {
      id: '3',
      title: 'Budget Master',
      description: 'Stay within budget for 5 consecutive weeks',
      progress: 3,
      target: 5,
      completed: false,
      reward: '1000 points',
      icon: '💰'
    },
    {
      id: '4',
      title: 'List Maker',
      description: 'Create 25 shopping lists',
      progress: 18,
      target: 25,
      completed: false,
      reward: '300 points',
      icon: '📝'
    },
    {
      id: '5',
      title: 'Savings Champion',
      description: 'Save R1000 in total through price comparisons',
      progress: 847,
      target: 1000,
      completed: false,
      reward: '2000 points',
      icon: '🏆'
    }
  ];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'discount': return 'bg-blue-100 text-blue-800';
      case 'freebie': return 'bg-green-100 text-green-800';
      case 'cashback': return 'bg-purple-100 text-purple-800';
      case 'exclusive': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'discount': return '💸';
      case 'freebie': return '🎁';
      case 'cashback': return '💰';
      case 'exclusive': return '⭐';
      default: return '🎯';
    }
  };

  const handleClaimReward = (rewardId: string) => {
    const reward = availableRewards.find(r => r.id === rewardId);
    if (reward && userPoints >= reward.pointsRequired) {
      alert(`Congratulations! You've claimed: ${reward.title}`);
      // In a real app, this would update the user's points and mark the reward as claimed
    } else {
      alert('You don\'t have enough points for this reward.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Points Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div 
          className="p-4 rounded-lg border border-green-200"
          style={{ backgroundColor: '#f0fdf4' }}
        >
          <div className="flex items-center space-x-3">
            <Star className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-2xl font-bold text-green-900">{userPoints.toLocaleString()}</p>
              <p className="text-sm text-green-700">Available Points</p>
            </div>
          </div>
        </div>
        
        <div 
          className="p-4 rounded-lg border border-blue-200"
          style={{ backgroundColor: '#eff6ff' }}
        >
          <div className="flex items-center space-x-3">
            <Gift className="h-8 w-8 text-blue-600" />
            <div>
              <p className="text-2xl font-bold text-blue-900">
                {availableRewards.filter(r => !r.claimed && userPoints >= r.pointsRequired).length}
              </p>
              <p className="text-sm text-blue-700">Available Rewards</p>
            </div>
          </div>
        </div>
        
        <div 
          className="p-4 rounded-lg border border-purple-200"
          style={{ backgroundColor: '#faf5ff' }}
        >
          <div className="flex items-center space-x-3">
            <Trophy className="h-8 w-8 text-purple-600" />
            <div>
              <p className="text-2xl font-bold text-purple-900">
                {achievements.filter(a => a.completed).length}
              </p>
              <p className="text-sm text-purple-700">Achievements</p>
            </div>
          </div>
        </div>
        
        <div 
          className="p-4 rounded-lg border border-orange-200"
          style={{ backgroundColor: '#fff7ed' }}
        >
          <div className="flex items-center space-x-3">
            <Target className="h-8 w-8 text-orange-600" />
            <div>
              <p className="text-2xl font-bold text-orange-900">R847</p>
              <p className="text-sm text-orange-700">Total Saved</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('rewards')}
          className={`flex-1 px-6 py-3 font-medium transition-colors ${
            activeTab === 'rewards'
              ? 'text-green-600 border-b-2 border-green-600 bg-green-50'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Available Rewards
        </button>
        <button
          onClick={() => setActiveTab('achievements')}
          className={`flex-1 px-6 py-3 font-medium transition-colors ${
            activeTab === 'achievements'
              ? 'text-green-600 border-b-2 border-green-600 bg-green-50'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Achievements
        </button>
      </div>

      {activeTab === 'rewards' && (
        <div className="space-y-4">
          {availableRewards.map((reward) => (
            <div 
              key={reward.id}
              className={`p-6 rounded-xl border transition-all ${
                reward.claimed 
                  ? 'border-gray-200 bg-gray-50 opacity-60' 
                  : userPoints >= reward.pointsRequired
                    ? 'border-green-200 bg-green-50 hover:shadow-md'
                    : 'border-gray-200 bg-white hover:shadow-sm'
              }`}
            >
              <div className="flex items-start space-x-4">
                <img 
                  src={reward.image}
                  alt={reward.title}
                  className="w-20 h-20 object-cover rounded-lg"
                />
                
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center space-x-3 mb-1">
                        <h3 className="text-lg font-bold text-gray-900">{reward.title}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(reward.category)}`}>
                          {getCategoryIcon(reward.category)} {reward.category}
                        </span>
                        {reward.claimed && (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                            <CheckCircle className="h-3 w-3 inline mr-1" />
                            Claimed
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 mb-2">{reward.description}</p>
                      {reward.retailer && (
                        <p className="text-sm text-blue-600 font-medium">{reward.retailer}</p>
                      )}
                    </div>
                    
                    <div className="text-right">
                      <div className="flex items-center space-x-2 mb-2">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span className="font-bold text-gray-900">{reward.pointsRequired.toLocaleString()}</span>
                      </div>
                      {!reward.claimed && (
                        <button
                          onClick={() => handleClaimReward(reward.id)}
                          disabled={userPoints < reward.pointsRequired}
                          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                            userPoints >= reward.pointsRequired
                              ? 'bg-green-600 hover:bg-green-700 text-white'
                              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          }`}
                        >
                          {userPoints >= reward.pointsRequired ? 'Claim Now' : 'Not Enough Points'}
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {reward.expiryDate && (
                    <div className="flex items-center space-x-1 text-sm text-gray-500">
                      <Clock className="h-4 w-4" />
                      <span>Expires: {new Date(reward.expiryDate).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'achievements' && (
        <div className="space-y-4">
          {achievements.map((achievement) => (
            <div 
              key={achievement.id}
              className={`p-6 rounded-xl border transition-all ${
                achievement.completed 
                  ? 'border-green-200 bg-green-50' 
                  : 'border-gray-200 bg-white hover:shadow-sm'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <div className="text-3xl">{achievement.icon}</div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-bold text-gray-900">{achievement.title}</h3>
                      {achievement.completed && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 inline mr-1" />
                          Completed
                        </span>
                      )}
                    </div>
                    
                    <p className="text-gray-600 mb-3">{achievement.description}</p>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Progress</span>
                        <span className="font-medium">
                          {achievement.progress} / {achievement.target}
                        </span>
                      </div>
                      
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${
                            achievement.completed ? 'bg-green-600' : 'bg-blue-600'
                          }`}
                          style={{ width: `${Math.min(100, (achievement.progress / achievement.target) * 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="text-right ml-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Gift className="h-4 w-4 text-purple-600" />
                    <span className="font-bold text-purple-600">{achievement.reward}</span>
                  </div>
                  
                  {achievement.completed && (
                    <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors">
                      Claim Reward
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RewardsSection;