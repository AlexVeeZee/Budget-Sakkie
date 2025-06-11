import React from 'react';

interface PrivacySectionProps {
  privacy: any;
  onToggle: (setting: string) => void;
}

const PrivacySection: React.FC<PrivacySectionProps> = ({ privacy, onToggle }) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Privacy Settings</h3>
        <div className="space-y-4">
          {Object.entries(privacy).map(([key, value]) => (
            <div 
              key={key} 
              className="flex items-center justify-between p-4 rounded-lg border border-gray-200"
              style={{ backgroundColor: '#f9fafb' }}
            >
              <div>
                <h4 className="font-medium text-gray-900">
                  {key === 'shareLocation' && 'Share Location'}
                  {key === 'shareShoppingLists' && 'Share Shopping Lists'}
                  {key === 'allowAnalytics' && 'Analytics & Performance'}
                  {key === 'marketingEmails' && 'Marketing Communications'}
                </h4>
                <p className="text-sm text-gray-600">
                  {key === 'shareLocation' && 'Allow us to use your location for better store recommendations'}
                  {key === 'shareShoppingLists' && 'Allow family members to view and edit your shopping lists'}
                  {key === 'allowAnalytics' && 'Help us improve the app by sharing anonymous usage data'}
                  {key === 'marketingEmails' && 'Receive promotional emails and special offers'}
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

export default PrivacySection;