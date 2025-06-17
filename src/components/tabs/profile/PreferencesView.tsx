import React, { useState } from 'react';
import { ArrowLeft, Globe, DollarSign, Bell, Moon, Sun, Smartphone } from 'lucide-react';
import { useLanguage } from '../../../hooks/useLanguage';
import { useCurrency, Currency } from '../../../hooks/useCurrency';

interface PreferencesViewProps {
  onBack: () => void;
}

export const PreferencesView: React.FC<PreferencesViewProps> = ({ onBack }) => {
  const { language, toggleLanguage } = useLanguage();
  const { currency, updateCurrency, availableCurrencies } = useCurrency();
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState({
    priceAlerts: true,
    dealNotifications: true,
    weeklyReports: false,
    marketingEmails: false
  });

  const handleCurrencyChange = (newCurrency: Currency) => {
    updateCurrency(newCurrency);
  };

  const handleNotificationToggle = (key: keyof typeof notifications) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
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
          <h1 className="text-2xl font-bold text-gray-900">Account Preferences</h1>
          <p className="text-gray-600">Customize your app experience and preferences</p>
        </div>
      </div>

      {/* Language & Region */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Language & Region</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-4">
              <Globe className="h-6 w-6 text-gray-600" />
              <div>
                <h4 className="font-medium text-gray-900">App Language</h4>
                <p className="text-sm text-gray-600">Choose your preferred language</p>
              </div>
            </div>
            <select
              value={language}
              onChange={(e) => e.target.value !== language && toggleLanguage()}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="en">English</option>
              <option value="af">Afrikaans</option>
            </select>
          </div>

          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-4">
              <DollarSign className="h-6 w-6 text-gray-600" />
              <div>
                <h4 className="font-medium text-gray-900">Currency</h4>
                <p className="text-sm text-gray-600">Display prices in your preferred currency</p>
              </div>
            </div>
            <select
              value={currency}
              onChange={(e) => handleCurrencyChange(e.target.value as Currency)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              {availableCurrencies.map((curr) => (
                <option key={curr.code} value={curr.code}>
                  {curr.name} ({curr.symbol})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Appearance */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Appearance</h3>
        
        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
          <div className="flex items-center space-x-4">
            {darkMode ? <Moon className="h-6 w-6 text-gray-600" /> : <Sun className="h-6 w-6 text-gray-600" />}
            <div>
              <h4 className="font-medium text-gray-900">Dark Mode</h4>
              <p className="text-sm text-gray-600">Switch between light and dark themes</p>
            </div>
          </div>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              darkMode ? 'bg-green-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                darkMode ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Preferences</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-4">
              <Bell className="h-6 w-6 text-gray-600" />
              <div>
                <h4 className="font-medium text-gray-900">Price Alerts</h4>
                <p className="text-sm text-gray-600">Get notified when prices drop on your favorite items</p>
              </div>
            </div>
            <button
              onClick={() => handleNotificationToggle('priceAlerts')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                notifications.priceAlerts ? 'bg-green-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  notifications.priceAlerts ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-4">
              <Bell className="h-6 w-6 text-gray-600" />
              <div>
                <h4 className="font-medium text-gray-900">Deal Notifications</h4>
                <p className="text-sm text-gray-600">Receive alerts about special deals and promotions</p>
              </div>
            </div>
            <button
              onClick={() => handleNotificationToggle('dealNotifications')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                notifications.dealNotifications ? 'bg-green-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  notifications.dealNotifications ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-4">
              <Bell className="h-6 w-6 text-gray-600" />
              <div>
                <h4 className="font-medium text-gray-900">Weekly Reports</h4>
                <p className="text-sm text-gray-600">Weekly summary of your savings and shopping activity</p>
              </div>
            </div>
            <button
              onClick={() => handleNotificationToggle('weeklyReports')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                notifications.weeklyReports ? 'bg-green-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  notifications.weeklyReports ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-4">
              <Bell className="h-6 w-6 text-gray-600" />
              <div>
                <h4 className="font-medium text-gray-900">Marketing Emails</h4>
                <p className="text-sm text-gray-600">Receive promotional emails and special offers</p>
              </div>
            </div>
            <button
              onClick={() => handleNotificationToggle('marketingEmails')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                notifications.marketingEmails ? 'bg-green-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  notifications.marketingEmails ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Privacy */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Privacy Settings</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">Location Services</h4>
              <p className="text-sm text-gray-600">Allow app to use your location for better store recommendations</p>
            </div>
            <button
              className="relative inline-flex h-6 w-11 items-center rounded-full bg-green-600"
            >
              <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-6" />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">Analytics & Performance</h4>
              <p className="text-sm text-gray-600">Help us improve the app by sharing anonymous usage data</p>
            </div>
            <button
              className="relative inline-flex h-6 w-11 items-center rounded-full bg-green-600"
            >
              <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Data Management */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Management</h3>
        
        <div className="space-y-4">
          <button className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="text-left">
              <h4 className="font-medium text-gray-900">Export My Data</h4>
              <p className="text-sm text-gray-600">Download a copy of your account data</p>
            </div>
            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <button className="w-full flex items-center justify-between p-4 border border-red-200 rounded-lg hover:bg-red-50 transition-colors">
            <div className="text-left">
              <h4 className="font-medium text-red-900">Delete Account</h4>
              <p className="text-sm text-red-600">Permanently delete your account and all data</p>
            </div>
            <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};