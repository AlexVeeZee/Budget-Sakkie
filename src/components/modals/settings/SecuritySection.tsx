import React from 'react';
import { AlertTriangle, CheckCircle, Mail, Eye, EyeOff, Lock } from 'lucide-react';

interface SecuritySectionProps {
  profile: any;
  passwordReset: any;
  showNewPassword: boolean;
  showConfirmPassword: boolean;
  emailSent: boolean;
  verificationCode: string;
  isVerified: boolean;
  onPasswordResetChange: (field: string, value: string) => void;
  onSendVerificationEmail: () => void;
  onVerifyCode: () => void;
  onPasswordSubmit: () => void;
  setShowNewPassword: (show: boolean) => void;
  setShowConfirmPassword: (show: boolean) => void;
  setVerificationCode: (code: string) => void;
}

const SecuritySection: React.FC<SecuritySectionProps> = ({
  profile,
  passwordReset,
  showNewPassword,
  showConfirmPassword,
  emailSent,
  verificationCode,
  isVerified,
  onPasswordResetChange,
  onSendVerificationEmail,
  onVerifyCode,
  onPasswordSubmit,
  setShowNewPassword,
  setShowConfirmPassword,
  setVerificationCode
}) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Password Reset</h3>
        
        {/* Security Notice */}
        <div 
          className="border border-orange-200 rounded-lg p-4 mb-6"
          style={{ backgroundColor: '#fff7ed' }}
        >
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-orange-900">Security Notice</h4>
              <p className="text-sm text-orange-700 mt-1">
                For your security, we'll send a verification code to your registered email address. 
                This ensures only the original account holder can change the password.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {/* Step 1: Email Verification */}
          <div 
            className={`p-4 rounded-lg border ${isVerified ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'}`}
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-900 flex items-center space-x-2">
                <span>Step 1: Verify Your Identity</span>
                {isVerified && <CheckCircle className="h-5 w-5 text-green-600" />}
              </h4>
            </div>
            
            <div className="space-y-3">
              {/* Read-only email display */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Verification code will be sent to:
                </label>
                <div 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-700 font-mono min-h-[44px] flex items-center"
                >
                  {profile.email}
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  This email address cannot be changed during password reset for security reasons.
                </p>
              </div>

              {!emailSent ? (
                <button
                  onClick={onSendVerificationEmail}
                  className="flex items-center space-x-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors min-h-[44px]"
                >
                  <Mail className="h-4 w-4" />
                  <span>Send Verification Code</span>
                </button>
              ) : (
                <div className="space-y-3">
                  <div 
                    className="p-3 rounded-lg border border-green-200"
                    style={{ backgroundColor: '#f0fdf4' }}
                  >
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <p className="text-sm text-green-700 font-medium">
                        Verification code sent successfully!
                      </p>
                    </div>
                    <p className="text-sm text-green-600 mt-1">
                      Check your inbox at {profile.email}
                    </p>
                  </div>
                  
                  {!isVerified && (
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Enter verification code:
                      </label>
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          placeholder="Enter 6-digit code"
                          value={verificationCode}
                          onChange={(e) => setVerificationCode(e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 font-mono text-center min-h-[44px]"
                          style={{ backgroundColor: '#ffffff' }}
                          maxLength={6}
                        />
                        <button
                          onClick={onVerifyCode}
                          disabled={verificationCode.length !== 6}
                          className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors min-h-[44px]"
                        >
                          Verify
                        </button>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                        <p className="text-xs text-gray-600">
                          Demo: Use code "123456" to verify
                        </p>
                        <button
                          onClick={onSendVerificationEmail}
                          className="text-xs text-blue-600 hover:text-blue-700 underline min-h-[44px] sm:min-h-auto"
                        >
                          Resend code
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Step 2: New Password */}
          <div 
            className={`p-4 rounded-lg border ${
              isVerified ? 'border-gray-200 bg-white' : 'border-gray-200 bg-gray-50 opacity-60'
            }`}
          >
            <h4 className="font-medium text-gray-900 mb-3">Step 2: Set New Password</h4>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={passwordReset.newPassword}
                    onChange={(e) => onPasswordResetChange('newPassword', e.target.value)}
                    disabled={!isVerified}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100 min-h-[44px]"
                    style={{ backgroundColor: isVerified ? '#ffffff' : '#f3f4f6' }}
                    placeholder="Minimum 8 characters"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    disabled={!isVerified}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center min-h-[44px] min-w-[44px] justify-center"
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={passwordReset.confirmPassword}
                    onChange={(e) => onPasswordResetChange('confirmPassword', e.target.value)}
                    disabled={!isVerified}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100 min-h-[44px]"
                    style={{ backgroundColor: isVerified ? '#ffffff' : '#f3f4f6' }}
                    placeholder="Confirm your new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={!isVerified}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center min-h-[44px] min-w-[44px] justify-center"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
                  </button>
                </div>
              </div>

              {/* Password validation feedback */}
              {passwordReset.newPassword && (
                <div className="space-y-1">
                  <div className={`text-xs flex items-center space-x-1 ${
                    passwordReset.newPassword.length >= 8 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    <span>{passwordReset.newPassword.length >= 8 ? '✓' : '✗'}</span>
                    <span>At least 8 characters</span>
                  </div>
                  {passwordReset.confirmPassword && (
                    <div className={`text-xs flex items-center space-x-1 ${
                      passwordReset.newPassword === passwordReset.confirmPassword ? 'text-green-600' : 'text-red-600'
                    }`}>
                      <span>{passwordReset.newPassword === passwordReset.confirmPassword ? '✓' : '✗'}</span>
                      <span>Passwords match</span>
                    </div>
                  )}
                </div>
              )}

              <button
                onClick={onPasswordSubmit}
                disabled={
                  !isVerified || 
                  !passwordReset.newPassword || 
                  !passwordReset.confirmPassword || 
                  passwordReset.newPassword !== passwordReset.confirmPassword ||
                  passwordReset.newPassword.length < 8
                }
                className="flex items-center space-x-2 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors min-h-[44px]"
              >
                <Lock className="h-4 w-4" />
                <span>Update Password</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecuritySection;