import React from 'react';

interface NotificationsSectionProps {
  notifications: any;
  onToggle: (setting: string) => void;
}

const NotificationsSection: React.FC<NotificationsSectionProps> = ({ notifications, onToggle }) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Notification Preferences</h3>
        <div className="space-y-4">
          {Object.entries(notifications).map(([key, value]) => (
            <div 
              key={key} 
              className="flex items-center justify-between p-4 rounded-lg border border-gray-200"
              style={{ backgroundColor: '#f9fafb' }}
            >
              <div>
                <h4 className="font-medium text-gray-900">
                  {key === 'priceAlerts' && 'Price Alerts'}
                  {key === 'dealNotifications' && 'Deal Notifications'}
                  {key === 'listReminders' && 'Shopping List Reminders'}
                  {key === 'weeklyReports' && 'Weekly Savings Reports'}
                  {key === 'emailUpdates' && 'Email Updates'}
                  {key === 'smsAlerts' && 'SMS Alerts'}
                </h4>
                <p className="text-sm text-gray-600">
                  {key === 'priceAlerts' && 'Get notified when prices drop on your favorite items'}
                  {key === 'dealNotifications' && 'Receive alerts about special deals and promotions'}
                  {key === 'listReminders' && 'Reminders about incomplete shopping lists'}
                  {key === 'weeklyReports' && 'Weekly summary of your savings and shopping activity'}
                  {key === 'emailUpdates' && 'Product updates and news via email'}
                  {key === 'smsAlerts' && 'Urgent alerts via SMS'}
                </p>
              </div>
              <button
                onClick={() => onToggle(key)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors min-h-[44px] min-w-[44px] ${
                  value ? 'bg-green-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    value ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NotificationsSection;