import React from 'react';
import { X } from 'lucide-react';

interface ProfileSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileSetupModal: React.FC<ProfileSetupModalProps> = ({
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md relative animate-in fade-in-0 zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">
            🎯 Test Profile Setup
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="text-center">
            <div className="mb-4">
              <p className="text-gray-700 mb-2">
                ✅ <strong>Étape 1 réussie !</strong>
              </p>
              <p className="text-gray-600 text-sm">
                Ce popup s'affiche car votre <code>profile_completed = false</code>
              </p>
            </div>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <p className="text-green-700 text-sm">
                🔧 <strong>Test de déclenchement fonctionnel</strong><br/>
                Le popup apparaît bien quand l'utilisateur a un profil incomplet.
              </p>
            </div>

            <button
              onClick={onClose}
              className="w-full bg-[#0CBFDE] hover:bg-[#0CBFDE]/90 text-white font-medium py-3 px-4 rounded-lg transition-colors"
            >
              Fermer le test
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};