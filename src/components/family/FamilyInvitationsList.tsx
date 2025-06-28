import React, { useState } from 'react';
import { Mail, Clock, CheckCircle, XCircle, Loader2, AlertCircle } from 'lucide-react';
import { FamilyInvitation } from '../../types/family';

interface FamilyInvitationsListProps {
  invitations: FamilyInvitation[];
  onAcceptInvitation: (invitationId: string) => Promise<{ success: boolean; error?: string }>;
  onDeclineInvitation: (invitationId: string) => Promise<{ success: boolean; error?: string }>;
  isLoading?: boolean;
}

export const FamilyInvitationsList: React.FC<FamilyInvitationsListProps> = ({
  invitations,
  onAcceptInvitation,
  onDeclineInvitation,
  isLoading = false
}) => {
  const [processingInvitation, setProcessingInvitation] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const handleAcceptInvitation = async (invitationId: string) => {
    setProcessingInvitation(invitationId);
    setError(null);
    
    try {
      const { success, error } = await onAcceptInvitation(invitationId);
      
      if (!success) {
        setError(error || 'Failed to accept invitation');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error('Error accepting invitation:', err);
    } finally {
      setProcessingInvitation(null);
    }
  };
  
  const handleDeclineInvitation = async (invitationId: string) => {
    setProcessingInvitation(invitationId);
    setError(null);
    
    try {
      const { success, error } = await onDeclineInvitation(invitationId);
      
      if (!success) {
        setError(error || 'Failed to decline invitation');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error('Error declining invitation:', err);
    } finally {
      setProcessingInvitation(null);
    }
  };
  
  const isExpired = (expiresAt: string): boolean => {
    return new Date(expiresAt) < new Date();
  };
  
  const getTimeRemaining = (expiresAt: string): string => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diffMs = expiry.getTime() - now.getTime();
    
    if (diffMs <= 0) return 'Expired';
    
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (diffDays > 0) {
      return `${diffDays}d ${diffHours}h remaining`;
    }
    
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    if (diffHours > 0) {
      return `${diffHours}h ${diffMinutes}m remaining`;
    }
    
    return `${diffMinutes}m remaining`;
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    );
  }
  
  if (invitations.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
        <Mail className="h-12 w-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-600">No pending invitations</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 flex items-start space-x-3">
          <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
          <p className="text-red-700">{error}</p>
        </div>
      )}
      
      {invitations.map((invitation) => {
        const expired = isExpired(invitation.expiresAt);
        const timeRemaining = getTimeRemaining(invitation.expiresAt);
        const isProcessing = processingInvitation === invitation.id;
        
        return (
          <div 
            key={invitation.id}
            className={`p-4 rounded-xl border ${
              expired ? 'border-gray-200 bg-gray-50' : 'border-blue-200 bg-blue-50'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  expired ? 'bg-gray-200' : 'bg-blue-200'
                }`}>
                  <Mail className={`h-5 w-5 ${expired ? 'text-gray-600' : 'text-blue-600'}`} />
                </div>
                
                <div>
                  <h4 className={`font-semibold ${expired ? 'text-gray-700' : 'text-blue-800'}`}>
                    Invitation to join {invitation.familyName}
                  </h4>
                  <p className={`text-sm ${expired ? 'text-gray-600' : 'text-blue-700'}`}>
                    From: {invitation.invitedByName}
                  </p>
                  <div className="flex items-center space-x-2 mt-1">
                    <Clock className={`h-3 w-3 ${expired ? 'text-gray-500' : 'text-blue-600'}`} />
                    <span className={`text-xs ${
                      expired ? 'text-gray-500' : 'text-blue-600'
                    }`}>
                      {timeRemaining}
                    </span>
                  </div>
                </div>
              </div>
              
              {!expired && !isProcessing && (
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleAcceptInvitation(invitation.id)}
                    className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleDeclineInvitation(invitation.id)}
                    className="px-3 py-1 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-medium rounded-lg transition-colors"
                  >
                    Decline
                  </button>
                </div>
              )}
              
              {isProcessing && (
                <div className="flex items-center space-x-2 px-3 py-1">
                  <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                  <span className="text-sm text-blue-600">Processing...</span>
                </div>
              )}
              
              {expired && (
                <div className="px-3 py-1 bg-gray-200 text-gray-700 text-sm font-medium rounded-lg">
                  Expired
                </div>
              )}
            </div>
            
            {invitation.message && (
              <div className="mt-3 pl-14">
                <p className={`text-sm italic ${expired ? 'text-gray-600' : 'text-blue-700'}`}>
                  "{invitation.message}"
                </p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};