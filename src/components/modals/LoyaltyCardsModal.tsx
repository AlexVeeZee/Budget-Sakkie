import React, { useState } from 'react';
import { X, Star, Plus, Edit2, Trash2, CreditCard, Scan, Eye, EyeOff } from 'lucide-react';

interface LoyaltyCard {
  id: string;
  retailer: string;
  cardNumber: string;
  pointsBalance: number;
  tier: string;
  expiryDate?: string;
  logo: string;
  color: string;
}

interface LoyaltyCardsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoyaltyCardsModal: React.FC<LoyaltyCardsModalProps> = ({ isOpen, onClose }) => {
  const [showAddCard, setShowAddCard] = useState(false);
  const [showCardNumbers, setShowCardNumbers] = useState<{ [key: string]: boolean }>({});
  
  const [loyaltyCards, setLoyaltyCards] = useState<LoyaltyCard[]>([
    {
      id: '1',
      retailer: 'Pick n Pay',
      cardNumber: '1234567890123456',
      pointsBalance: 2450,
      tier: 'Gold',
      expiryDate: '2025-12-31',
      logo: 'https://images.pexels.com/photos/264547/pexels-photo-264547.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
      color: '#E31837'
    },
    {
      id: '2',
      retailer: 'Woolworths',
      cardNumber: '9876543210987654',
      pointsBalance: 1850,
      tier: 'Platinum',
      expiryDate: '2026-06-30',
      logo: 'https://images.pexels.com/photos/4386370/pexels-photo-4386370.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
      color: '#00A86B'
    },
    {
      id: '3',
      retailer: 'Checkers',
      cardNumber: '5555444433332222',
      pointsBalance: 890,
      tier: 'Silver',
      logo: 'https://images.pexels.com/photos/3962285/pexels-photo-3962285.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
      color: '#00A651'
    }
  ]);

  const [newCard, setNewCard] = useState({
    retailer: '',
    cardNumber: '',
    tier: 'Bronze'
  });

  const retailers = [
    'Pick n Pay', 'Woolworths', 'Checkers', 'Shoprite', 'SPAR', 'Game', 'Makro', 'Other'
  ];

  const tiers = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond'];

  const handleAddCard = () => {
    if (!newCard.retailer || !newCard.cardNumber) {
      alert('Please fill in all required fields.');
      return;
    }

    const card: LoyaltyCard = {
      id: Date.now().toString(),
      retailer: newCard.retailer,
      cardNumber: newCard.cardNumber,
      pointsBalance: 0,
      tier: newCard.tier,
      logo: 'https://images.pexels.com/photos/264547/pexels-photo-264547.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
      color: '#6B7280'
    };

    setLoyaltyCards(prev => [...prev, card]);
    setNewCard({ retailer: '', cardNumber: '', tier: 'Bronze' });
    setShowAddCard(false);
  };

  const handleDeleteCard = (cardId: string) => {
    if (confirm('Are you sure you want to delete this loyalty card?')) {
      setLoyaltyCards(prev => prev.filter(card => card.id !== cardId));
    }
  };

  const toggleCardNumberVisibility = (cardId: string) => {
    setShowCardNumbers(prev => ({
      ...prev,
      [cardId]: !prev[cardId]
    }));
  };

  const maskCardNumber = (cardNumber: string) => {
    return cardNumber.replace(/\d(?=\d{4})/g, '*');
  };

  const formatCardNumber = (cardNumber: string) => {
    return cardNumber.replace(/(.{4})/g, '$1 ').trim();
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
    >
      <div 
        className="rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-gray-200"
        style={{ backgroundColor: '#ffffff' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-green-600 via-orange-500 to-blue-600 text-white">
          <div className="flex items-center space-x-3">
            <Star className="h-6 w-6" />
            <h2 className="text-2xl font-bold">Loyalty Cards</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-black/10 rounded-lg transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div 
              className="p-4 rounded-lg border border-green-200"
              style={{ backgroundColor: '#f0fdf4' }}
            >
              <div className="flex items-center space-x-3">
                <CreditCard className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-2xl font-bold text-green-900">{loyaltyCards.length}</p>
                  <p className="text-sm text-green-700">Active Cards</p>
                </div>
              </div>
            </div>
            
            <div 
              className="p-4 rounded-lg border border-blue-200"
              style={{ backgroundColor: '#eff6ff' }}
            >
              <div className="flex items-center space-x-3">
                <Star className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold text-blue-900">
                    {loyaltyCards.reduce((sum, card) => sum + card.pointsBalance, 0).toLocaleString()}
                  </p>
                  <p className="text-sm text-blue-700">Total Points</p>
                </div>
              </div>
            </div>
            
            <div 
              className="p-4 rounded-lg border border-purple-200"
              style={{ backgroundColor: '#faf5ff' }}
            >
              <div className="flex items-center space-x-3">
                <Star className="h-8 w-8 text-purple-600" />
                <div>
                  <p className="text-2xl font-bold text-purple-900">
                    {loyaltyCards.filter(card => card.tier === 'Gold' || card.tier === 'Platinum').length}
                  </p>
                  <p className="text-sm text-purple-700">Premium Tiers</p>
                </div>
              </div>
            </div>
          </div>

          {/* Add New Card Button */}
          <div className="mb-6">
            <button
              onClick={() => setShowAddCard(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Add New Loyalty Card</span>
            </button>
          </div>

          {/* Add Card Form */}
          {showAddCard && (
            <div 
              className="mb-6 p-6 rounded-lg border border-gray-200"
              style={{ backgroundColor: '#f9fafb' }}
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Loyalty Card</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Retailer</label>
                  <select
                    value={newCard.retailer}
                    onChange={(e) => setNewCard(prev => ({ ...prev, retailer: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    style={{ backgroundColor: '#ffffff' }}
                  >
                    <option value="">Select Retailer</option>
                    {retailers.map((retailer) => (
                      <option key={retailer} value={retailer}>{retailer}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Membership Tier</label>
                  <select
                    value={newCard.tier}
                    onChange={(e) => setNewCard(prev => ({ ...prev, tier: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    style={{ backgroundColor: '#ffffff' }}
                  >
                    {tiers.map((tier) => (
                      <option key={tier} value={tier}>{tier}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Card Number</label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newCard.cardNumber}
                    onChange={(e) => setNewCard(prev => ({ ...prev, cardNumber: e.target.value }))}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    style={{ backgroundColor: '#ffffff' }}
                    placeholder="Enter card number"
                  />
                  <button className="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors">
                    <Scan className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={handleAddCard}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
                >
                  Add Card
                </button>
                <button
                  onClick={() => setShowAddCard(false)}
                  className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Loyalty Cards List */}
          <div className="space-y-4">
            {loyaltyCards.map((card) => (
              <div 
                key={card.id}
                className="p-6 rounded-xl border border-gray-200 hover:shadow-md transition-shadow"
                style={{ 
                  backgroundColor: '#ffffff',
                  background: `linear-gradient(135deg, ${card.color}15 0%, ${card.color}05 100%)`
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-4">
                    <img 
                      src={card.logo}
                      alt={card.retailer}
                      className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm"
                    />
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-900">{card.retailer}</h3>
                        <span 
                          className="px-3 py-1 rounded-full text-xs font-bold text-white"
                          style={{ backgroundColor: card.color }}
                        >
                          {card.tier}
                        </span>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600">Card Number:</span>
                          <span className="font-mono text-sm text-gray-900">
                            {showCardNumbers[card.id] 
                              ? formatCardNumber(card.cardNumber)
                              : formatCardNumber(maskCardNumber(card.cardNumber))
                            }
                          </span>
                          <button
                            onClick={() => toggleCardNumberVisibility(card.id)}
                            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            {showCardNumbers[card.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <Star className="h-4 w-4 text-yellow-500" />
                            <span className="text-sm font-semibold text-gray-900">
                              {card.pointsBalance.toLocaleString()} points
                            </span>
                          </div>
                          
                          {card.expiryDate && (
                            <div className="text-sm text-gray-600">
                              Expires: {new Date(card.expiryDate).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => handleDeleteCard(card.id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                {/* Points Progress Bar */}
                <div className="mt-4">
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                    <span>Progress to next reward</span>
                    <span>{Math.min(100, Math.floor((card.pointsBalance % 1000) / 10))}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full transition-all duration-300"
                      style={{ 
                        backgroundColor: card.color,
                        width: `${Math.min(100, Math.floor((card.pointsBalance % 1000) / 10))}%`
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {loyaltyCards.length === 0 && (
            <div className="text-center py-12">
              <CreditCard className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Loyalty Cards Yet</h3>
              <p className="text-gray-600 mb-4">Add your loyalty cards to track points and get personalized deals.</p>
              <button
                onClick={() => setShowAddCard(true)}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
              >
                Add Your First Card
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};