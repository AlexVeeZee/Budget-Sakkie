import React, { useState } from 'react';
import { X, HelpCircle, MessageCircle, Book, Phone, Mail, Search, ChevronRight, ExternalLink, Star } from 'lucide-react';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  helpful: number;
}

interface ContactMethod {
  id: string;
  type: 'email' | 'phone' | 'chat';
  title: string;
  description: string;
  availability: string;
  icon: React.ComponentType<any>;
  action: () => void;
}

interface HelpSupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpSupportModal: React.FC<HelpSupportModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'faq' | 'contact' | 'guides'>('faq');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);

  const faqItems: FAQItem[] = [
    {
      id: '1',
      question: 'How do I add products to my shopping list?',
      answer: 'You can add products to your shopping list by searching for them in the Search tab, then clicking the "Add to List" button on any product card. You can also create custom items directly in the Lists tab.',
      category: 'lists',
      helpful: 45
    },
    {
      id: '2',
      question: 'How accurate are the price comparisons?',
      answer: 'Our price data is updated regularly from retailer websites and partner APIs. Prices are typically updated every 24-48 hours, but we recommend checking with the store before making a purchase as prices can change.',
      category: 'prices',
      helpful: 38
    },
    {
      id: '3',
      question: 'Can I share my shopping lists with family members?',
      answer: 'Yes! You can invite family members to join your Budget Sakkie family group. Once they join, you can share specific shopping lists with them and they can view, edit, and add items depending on their permissions.',
      category: 'sharing',
      helpful: 52
    },
    {
      id: '4',
      question: 'How do I change my home location?',
      answer: 'Go to Settings > Home Location to update your default address. You can also temporarily change your location for individual shopping sessions using the location selector in the header.',
      category: 'location',
      helpful: 29
    },
    {
      id: '5',
      question: 'What loyalty cards are supported?',
      answer: 'We support major South African retailers including Pick n Pay, Woolworths, Checkers, Shoprite, and SPAR. You can add your loyalty cards in the Loyalty Cards section to track points and get personalized deals.',
      category: 'loyalty',
      helpful: 33
    },
    {
      id: '6',
      question: 'How do I earn and redeem rewards points?',
      answer: 'You earn points by comparing prices, finding deals, completing achievements, and regular app usage. Points can be redeemed for discounts, free items, and exclusive offers in the Rewards section.',
      category: 'rewards',
      helpful: 41
    },
    {
      id: '7',
      question: 'Is my personal information secure?',
      answer: 'Yes, we take your privacy seriously. All personal data is encrypted and stored securely. We never share your information with third parties without your consent. You can review our privacy policy for more details.',
      category: 'privacy',
      helpful: 67
    },
    {
      id: '8',
      question: 'How do I report incorrect prices?',
      answer: 'If you find an incorrect price, you can report it by clicking the "Report Price" button on the product page. Our team will verify and update the information within 24 hours.',
      category: 'prices',
      helpful: 22
    }
  ];

  const categories = [
    { id: 'all', name: 'All Categories' },
    { id: 'lists', name: 'Shopping Lists' },
    { id: 'prices', name: 'Price Comparisons' },
    { id: 'sharing', name: 'Family Sharing' },
    { id: 'location', name: 'Location Settings' },
    { id: 'loyalty', name: 'Loyalty Cards' },
    { id: 'rewards', name: 'Rewards & Points' },
    { id: 'privacy', name: 'Privacy & Security' }
  ];

  const contactMethods: ContactMethod[] = [
    {
      id: 'email',
      type: 'email',
      title: 'Email Support',
      description: 'Get help via email. We typically respond within 24 hours.',
      availability: 'Available 24/7',
      icon: Mail,
      action: () => window.open('mailto:support@budgetsakkie.co.za')
    },
    {
      id: 'chat',
      type: 'chat',
      title: 'Live Chat',
      description: 'Chat with our support team in real-time.',
      availability: 'Mon-Fri: 8:00-18:00',
      icon: MessageCircle,
      action: () => alert('Live chat feature coming soon!')
    },
    {
      id: 'phone',
      type: 'phone',
      title: 'Phone Support',
      description: 'Speak directly with our support team.',
      availability: 'Mon-Fri: 9:00-17:00',
      icon: Phone,
      action: () => window.open('tel:+27123456789')
    }
  ];

  const guides = [
    {
      id: '1',
      title: 'Getting Started with Budget Sakkie',
      description: 'Learn the basics of using Budget Sakkie to save money on groceries.',
      duration: '5 min read',
      category: 'Beginner'
    },
    {
      id: '2',
      title: 'Advanced Price Comparison Tips',
      description: 'Maximize your savings with advanced features and strategies.',
      duration: '8 min read',
      category: 'Advanced'
    },
    {
      id: '3',
      title: 'Setting Up Family Sharing',
      description: 'Complete guide to sharing lists and budgets with family members.',
      duration: '6 min read',
      category: 'Family'
    },
    {
      id: '4',
      title: 'Loyalty Cards and Rewards',
      description: 'How to maximize points and rewards across different retailers.',
      duration: '4 min read',
      category: 'Rewards'
    }
  ];

  const filteredFAQs = faqItems.filter(item => {
    const matchesSearch = item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleFAQToggle = (faqId: string) => {
    setExpandedFAQ(expandedFAQ === faqId ? null : faqId);
  };

  const handleFAQHelpful = (faqId: string) => {
    // In a real app, this would update the helpful count
    alert('Thank you for your feedback!');
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
    >
      <div 
        className="rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden border border-gray-200"
        style={{ backgroundColor: '#ffffff' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-green-600 via-orange-500 to-blue-600 text-white">
          <div className="flex items-center space-x-3">
            <HelpCircle className="h-6 w-6" />
            <div>
              <h2 className="text-2xl font-bold">Help & Support</h2>
              <p className="text-white/80">We're here to help you save money!</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-black/10 rounded-lg transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Tabs */}
        <div 
          className="flex border-b border-gray-200"
          style={{ backgroundColor: '#ffffff' }}
        >
          <button
            onClick={() => setActiveTab('faq')}
            className={`flex-1 px-6 py-3 font-medium transition-colors ${
              activeTab === 'faq'
                ? 'text-green-600 border-b-2 border-green-600 bg-green-50'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Frequently Asked Questions
          </button>
          <button
            onClick={() => setActiveTab('contact')}
            className={`flex-1 px-6 py-3 font-medium transition-colors ${
              activeTab === 'contact'
                ? 'text-green-600 border-b-2 border-green-600 bg-green-50'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Contact Support
          </button>
          <button
            onClick={() => setActiveTab('guides')}
            className={`flex-1 px-6 py-3 font-medium transition-colors ${
              activeTab === 'guides'
                ? 'text-green-600 border-b-2 border-green-600 bg-green-50'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            User Guides
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {activeTab === 'faq' && (
            <div className="space-y-6">
              {/* Search and Filter */}
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search frequently asked questions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    style={{ backgroundColor: '#ffffff' }}
                  />
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                        selectedCategory === category.id
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* FAQ Items */}
              <div className="space-y-3">
                {filteredFAQs.map((faq) => (
                  <div 
                    key={faq.id}
                    className="border border-gray-200 rounded-lg overflow-hidden"
                    style={{ backgroundColor: '#ffffff' }}
                  >
                    <button
                      onClick={() => handleFAQToggle(faq.id)}
                      className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
                    >
                      <span className="font-medium text-gray-900">{faq.question}</span>
                      <ChevronRight 
                        className={`h-5 w-5 text-gray-400 transition-transform ${
                          expandedFAQ === faq.id ? 'rotate-90' : ''
                        }`} 
                      />
                    </button>
                    
                    {expandedFAQ === faq.id && (
                      <div className="px-4 pb-4 border-t border-gray-100">
                        <p className="text-gray-700 mb-4">{faq.answer}</p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-600">Was this helpful?</span>
                            <button
                              onClick={() => handleFAQHelpful(faq.id)}
                              className="flex items-center space-x-1 px-2 py-1 text-sm text-green-600 hover:bg-green-50 rounded transition-colors"
                            >
                              <Star className="h-3 w-3" />
                              <span>Yes</span>
                            </button>
                          </div>
                          
                          <span className="text-xs text-gray-500">
                            {faq.helpful} people found this helpful
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {filteredFAQs.length === 0 && (
                <div className="text-center py-12">
                  <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No results found</h3>
                  <p className="text-gray-600">Try adjusting your search terms or category filter.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'contact' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Get in Touch</h3>
                <p className="text-gray-600 mb-6">
                  Can't find what you're looking for? Our support team is here to help!
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {contactMethods.map((method) => (
                  <div 
                    key={method.id}
                    className="p-6 rounded-xl border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                    style={{ backgroundColor: '#ffffff' }}
                    onClick={method.action}
                  >
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="p-3 bg-green-100 rounded-lg">
                        <method.icon className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{method.title}</h4>
                        <p className="text-sm text-gray-600">{method.availability}</p>
                      </div>
                    </div>
                    
                    <p className="text-gray-700 mb-4">{method.description}</p>
                    
                    <div className="flex items-center text-green-600 font-medium">
                      <span>Contact Now</span>
                      <ExternalLink className="h-4 w-4 ml-2" />
                    </div>
                  </div>
                ))}
              </div>

              {/* Contact Form */}
              <div 
                className="p-6 rounded-lg border border-gray-200"
                style={{ backgroundColor: '#f9fafb' }}
              >
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Send us a Message</h4>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        style={{ backgroundColor: '#ffffff' }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <input
                        type="email"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        style={{ backgroundColor: '#ffffff' }}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      style={{ backgroundColor: '#ffffff' }}
                    >
                      <option>General Question</option>
                      <option>Technical Issue</option>
                      <option>Price Report</option>
                      <option>Feature Request</option>
                      <option>Account Problem</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                    <textarea
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      style={{ backgroundColor: '#ffffff' }}
                      placeholder="Please describe your question or issue in detail..."
                    />
                  </div>
                  
                  <button className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors">
                    Send Message
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'guides' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">User Guides & Tutorials</h3>
                <p className="text-gray-600 mb-6">
                  Step-by-step guides to help you get the most out of Budget Sakkie.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {guides.map((guide) => (
                  <div 
                    key={guide.id}
                    className="p-6 rounded-xl border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                    style={{ backgroundColor: '#ffffff' }}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <Book className="h-5 w-5 text-blue-600" />
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {guide.category}
                          </span>
                        </div>
                        <h4 className="font-semibold text-gray-900 mb-2">{guide.title}</h4>
                        <p className="text-gray-600 text-sm mb-3">{guide.description}</p>
                        <span className="text-xs text-gray-500">{guide.duration}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center text-blue-600 font-medium">
                      <span>Read Guide</span>
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </div>
                  </div>
                ))}
              </div>

              {/* Video Tutorials */}
              <div 
                className="p-6 rounded-lg border border-gray-200"
                style={{ backgroundColor: '#f9fafb' }}
              >
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Video Tutorials</h4>
                <p className="text-gray-600 mb-4">
                  Watch our video tutorials for a visual guide to using Budget Sakkie.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-2">
                        <span className="text-white text-xl">▶</span>
                      </div>
                      <p className="text-sm font-medium text-gray-700">Getting Started</p>
                    </div>
                  </div>
                  
                  <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-2">
                        <span className="text-white text-xl">▶</span>
                      </div>
                      <p className="text-sm font-medium text-gray-700">Price Comparison Tips</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            Still need help? Contact us at{' '}
            <a href="mailto:support@budgetsakkie.co.za" className="text-green-600 hover:underline">
              support@budgetsakkie.co.za
            </a>
          </div>
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