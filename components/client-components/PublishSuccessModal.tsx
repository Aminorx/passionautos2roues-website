import React, { useEffect, useState } from 'react';
import { CheckCircle, Clock, ArrowRight } from 'lucide-react';

interface PublishSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToDashboard: () => void;
  listingType: 'sell' | 'search';
}

export const PublishSuccessModal: React.FC<PublishSuccessModalProps> = ({
  isOpen,
  onClose,
  onNavigateToDashboard,
  listingType
}) => {
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (isOpen && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      // Redirection automatique après 5 secondes
      onNavigateToDashboard();
    }
  }, [isOpen, countdown, onNavigateToDashboard]);

  useEffect(() => {
    if (isOpen) {
      setCountdown(5); // Réinitialiser le compteur quand la modal s'ouvre
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isSearch = listingType === 'search';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-8 text-center transform animate-in fade-in zoom-in duration-300">
        {/* Icône de succès */}
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <CheckCircle className="w-8 h-8 text-green-500" />
        </div>

        {/* Titre */}
        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          {isSearch ? 'Recherche publiée !' : 'Annonce publiée !'}
        </h2>

        {/* Message principal */}
        <p className="text-gray-600 mb-6 leading-relaxed">
          Votre {isSearch ? 'recherche' : 'annonce'} a été reçue avec succès et sera validée dans quelques instants.
        </p>

        {/* Informations supplémentaires */}
        <div className="bg-blue-50 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-center text-blue-600 mb-2">
            <Clock className="w-5 h-5 mr-2" />
            <span className="font-medium">Validation en cours</span>
          </div>
          <p className="text-sm text-blue-700">
            Notre équipe vérifie votre {isSearch ? 'recherche' : 'annonce'} pour s'assurer qu'elle respecte nos conditions.
            Vous recevrez une notification dès qu'elle sera en ligne.
          </p>
        </div>

        {/* Boutons d'action */}
        <div className="space-y-3">
          <button
            onClick={onNavigateToDashboard}
            className="w-full bg-primary-bolt-500 hover:bg-primary-bolt-600 text-white font-semibold py-3 px-6 rounded-xl transition-colors flex items-center justify-center"
          >
            <span>Voir mes annonces</span>
            <ArrowRight className="w-5 h-5 ml-2" />
          </button>
          
          <button
            onClick={onClose}
            className="w-full text-gray-500 hover:text-gray-700 font-medium py-2 transition-colors"
          >
            Continuer à naviguer
          </button>
        </div>

        {/* Compteur de redirection */}
        <p className="text-xs text-gray-400 mt-4">
          Redirection automatique dans {countdown} seconde{countdown !== 1 ? 's' : ''}
        </p>
      </div>
    </div>
  );
};