import React, { useState } from 'react';
import { ArrowLeft, HelpCircle, MessageCircle, Book, Phone, Mail, Search, ChevronRight, ExternalLink, Star } from 'lucide-react';

interface SupportViewProps {
  onBack: () => void;
}

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export const SupportView: React.FC<SupportViewProps> = ({ onBack }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);

  const faqItems: FAQItem[] = [
    {
      id: '1',
      question: 'How do I add products to my shopping list?',
      answer: 'You can add products to your shopping list by searching for them in the Search tab, then clicking the "Add to List" button on any product card. You can also create custom items directly in the Lists tab.',
      category: 'lists'
    },
    {
      id: '2',
      question: 'How accurate are the price comparisons?',
      answer: 'Our price data is updated regularly from retailer websites and partner APIs. Prices are typically updated every 24-48 hours, but we recommend checking with the store before making a purchase as prices can change.',
      category: 'prices'
    },
    {
      id: '3',
      question: 'Can I share my shopping lists with family members?',
      answer: 'Yes! You can invite family members to join your Budget Sakkie family group. Once they join, you can share specific shopping lists with them and they can view, edit, and add items depending on their permissions.',
      category: 'sharing'
    },
    {
      id: '4',
      question: 'How do I change my home location?',
      answer: 'Go to Profile > Account Preferences > Location to update your default address. You can also temporarily change your location for individual shopping sessions using the location selector in the header.',
      category: 'location'
    },
    {
      id: '5',
      question: 'What loyalty cards are supported?',
      answer: 'We support major South African retailers including Pick n Pay, Woolworths, Checkers, Shoprite, and SPAR. You can add your loyalty cards in the Profile section to track points and get personalized deals.',
      category: 'loyalty'
    }
  ];

  const categories = [
    { id: 'all', name: 'All Categories' },
    { id: 'lists', name: 'Shopping Lists' },
    { id: 'prices', name: 'Price Comparisons' },
    { id: 'sharing', name: 'Family Sharing' },
    { id: 'location', name: 'Location Settings' },
    { id: 'loyalty', name: 'Loyalty Cards' }
  ];

  const contactMethods = [
    {
      id: 'email',
      title: 'Email Support',
      description: 'Get help via email. We typically respond within 24 hours.',
      availability: 'Available 24/7',
      icon: Mail,
      action: () => window.open('mailto:support@budgetsakkie.co.za')
    },
    {
      id: 'chat',
      title: 'Live Chat',
      description: 'Chat with our support team in real-time.',
      availability: 'Mon-Fri: 8:00-18:00',
      icon: MessageCircle,
      action: () => alert('Live chat feature coming soon!')
    },
    {
      id: 'phone',
      title: 'Phone Support',
      description: 'Speak directly with our support team.',
      availability: 'Mon-Fri: 9:00-17:00',
      icon: Phone,
      action: () => window.open('tel:+27123456789')
    }
  ];

  const filteredFAQs = faqItems.filter(item => {
    const matchesSearch = searchQuery === '' || 
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleFAQToggle = (faqId: string) => {
    setExpandedFAQ(expandedFAQ === faqId ? null : faqId);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-6">
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Help & Support</h1>
          <p className="text-gray-600">Get help, find answers, and contact our support team</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {contactMethods.map((method) => (
          <button
            key={method.id}
            onClick={method.action}
            className="p-6 bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow text-left"
          >
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <method.icon className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{method.title}</h3>
                <p className="text-sm text-gray-600">{method.availability}</p>
              </div>
            </div>
            <p className="text-gray-700 mb-3">{method.description}</p>
            <div className="flex items-center text-green-600 font-medium">
              <span>Contact Now</span>
              <ExternalLink className="h-4 w-4 ml-2" />
            </div>
          </button>
        ))}
      </div>

      {/* FAQ Section */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Frequently Asked Questions</h3>
        
        {/* Search and Filter */}
        <div className="space-y-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search frequently asked questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
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
                  <p className="text-gray-700 mt-3">{faq.answer}</p>
                  
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">Was this helpful?</span>
                      <button className="flex items-center space-x-1 px-2 py-1 text-sm text-green-600 hover:bg-green-50 rounded transition-colors">
                        <Star className="h-3 w-3" />
                        <span>Yes</span>
                      </button>
                      <button className="flex items-center space-x-1 px-2 py-1 text-sm text-gray-600 hover:bg-gray-50 rounded transition-colors">
                        <span>No</span>
                      </button>
                    </div>
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

      {/* User Guides */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">User Guides & Tutorials</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              title: 'Getting Started with Budget Sakkie',
              description: 'Learn the basics of using Budget Sakkie to save money on groceries.',
              duration: '5 min read'
            },
            {
              title: 'Advanced Price Comparison Tips',
              description: 'Maximize your savings with advanced features and strategies.',
              duration: '8 min read'
            },
            {
              title: 'Setting Up Family Sharing',
              description: 'Complete guide to sharing lists and budgets with family members.',
              duration: '6 min read'
            },
            {
              title: 'Loyalty Cards and Rewards',
              description: 'How to maximize points and rewards across different retailers.',
              duration: '4 min read'
            }
          ].map((guide, index) => (
            <button
              key={index}
              className="p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow text-left"
            >
              <div className="flex items-start justify-between mb-2">
                <Book className="h-5 w-5 text-blue-600 mt-0.5" />
                <span className="text-xs text-gray-500">{guide.duration}</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">{guide.title}</h4>
              <p className="text-gray-600 text-sm mb-3">{guide.description}</p>
              <div className="flex items-center text-blue-600 font-medium">
                <span>Read Guide</span>
                <ChevronRight className="h-4 w-4 ml-2" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Contact Form */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Send us a Message</h3>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500">
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
              placeholder="Please describe your question or issue in detail..."
            />
          </div>
          
          <button className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors">
            Send Message
          </button>
        </div>
      </div>
    </div>
  );
};