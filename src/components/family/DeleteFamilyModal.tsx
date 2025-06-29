import React, { useState } from 'react';
import { X, Trash2, AlertTriangle } from 'lucide-react';

interface DeleteFamilyModalProps {
  isOpen: boolean;
  onClose: () => void;
  familyName: string;
  memberCount: number;
  onConfirm: () => Promise<void>;
}

export const DeleteFamilyModal: React.FC<DeleteFamilyModalProps> = ({
  isOpen,
  onClose,
  familyName,
  memberCount,
  onConfirm
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmText, setConfirmText] = useState('');

  const handleDelete = async () => {
    setIsDeleting(true);
    
    try {
      await onConfirm();
      onClose();
    } catch (error) {
      console.error('Error deleting family:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const isConfirmValid = confirmText.toLowerCase() === 'delete';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-red-50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Delete Family Group</h3>
          </div>
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h4 className="font-semibold text-red-800 mb-2">⚠️ This action cannot be undone</h4>
            <p className="text-red-700 text-sm">
              You are about to permanently delete the "<strong>{familyName}</strong>" family group with{' '}
              <strong>{memberCount} {memberCount === 1 ? 'member' : 'members'}</strong>.
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-gray-700">
              Deleting this family group will:
            </p>
            <ul className="text-sm text-gray-600 space-y-1 ml-4">
              <li>• Remove all members from the family</li>
              <li>• Delete all shared shopping lists</li>
              <li>• Remove all family budget information</li>
              <li>• Cancel any pending invitations</li>
              <li>• This action cannot be reversed</li>
            </ul>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type "delete" to confirm:
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              placeholder="Type 'delete' to confirm"
              disabled={isDeleting}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={handleDelete}
            disabled={!isConfirmValid || isDeleting}
            className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-300 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
          >
            {isDeleting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4" />
                <span>Delete Family</span>
              </>
            )}
          </button>
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 bg-gray-300 hover:bg-gray-400 disabled:bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};