import React from 'react';
import { X, User, Building2 } from 'lucide-react';

interface ProfileSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPersonalAccount: () => void;
  onProfessionalAccount: () => void;
}

export const ProfileSetupModal: React.FC<ProfileSetupModalProps> = ({
  isOpen,
  onClose,
  onPersonalAccount,
  onProfessionalAccount
}) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={(e) => e.stopPropagation()} // DÉSACTIVER fermeture par clic extérieur
    >
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md relative animate-in fade-in-0 zoom-in-95 duration-300">
        
        {/* Header - SANS bouton fermer (obligation de compléter) */}
        <div className="flex items-center justify-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">
            Finaliser votre profil
          </h2>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="space-y-6">
            <p className="text-center text-gray-600">
              Pour commencer à utiliser PassionAuto2Roues, veuillez choisir le type de compte qui vous correspond :
            </p>
            
            <div className="space-y-4">
              {/* Compte Personnel */}
              <button
                onClick={onPersonalAccount}
                className="w-full p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 group"
              >
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-blue-100 rounded-full group-hover:bg-blue-200 transition-colors">
                    <User className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-lg">Compte Personnel</h3>
                    <p className="text-sm text-gray-600">
                      Pour vendre ou acheter occasionnellement des véhicules
                    </p>
                  </div>
                </div>
              </button>
              
              {/* Compte Professionnel */}
              <button
                onClick={onProfessionalAccount}
                className="w-full p-6 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all duration-200 group"
              >
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-green-100 rounded-full group-hover:bg-green-200 transition-colors">
                    <Building2 className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-lg">Compte Professionnel</h3>
                    <p className="text-sm text-gray-600">
                      Pour les concessionnaires, garages et professionnels de l'auto
                    </p>
                  </div>
                </div>
              </button>
            </div>
            
            <div className="text-center text-xs text-red-600 font-medium">
              ⚠️ Vous devez compléter votre profil pour accéder au site
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};