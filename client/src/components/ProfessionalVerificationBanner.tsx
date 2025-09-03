import React, { useState, useEffect } from 'react';
import { Building2, CheckCircle, Clock, X, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface ProfessionalAccount {
  id: number;
  verification_status: 'pending' | 'approved' | 'not_verified' | 'not_started';
  is_verified: boolean;
  rejected_reason?: string;
  created_at: string;
}

export const ProfessionalVerificationBanner: React.FC = () => {
  const { profile, user } = useAuth();
  const [professionalAccount, setProfessionalAccount] = useState<ProfessionalAccount | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDismissed, setIsDismissed] = useState(false);

  // Vérifier si l'utilisateur est un professionnel et charger son statut de vérification
  useEffect(() => {
    const checkProfessionalStatus = async () => {
      if (!user || !profile || profile.type !== 'professional') {
        setIsLoading(false);
        return;
      }

      // Vérifier si le banner a été fermé dans cette session
      const dismissed = sessionStorage.getItem('pro-banner-dismissed');
      if (dismissed) {
        setIsDismissed(true);
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/professional-accounts/status/${user.id}`);
        if (response.ok) {
          const data = await response.json();
          setProfessionalAccount(data);
        }
      } catch (error) {
        console.error('Erreur lors de la vérification du statut professionnel:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkProfessionalStatus();
  }, [user, profile]);

  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem('pro-banner-dismissed', 'true');
  };

  const handleStartVerification = () => {
    window.location.href = '/professional-verification';
  };

  // Ne pas afficher le banner si :
  // - Pas un utilisateur professionnel
  // - En cours de chargement
  // - Banner fermé
  if (!profile || 
      profile.type !== 'professional' || 
      isLoading || 
      isDismissed) {
    return null;
  }

  // Bannière pour professionnel non encore vérifié (pas de demande ou statut not_started)
  if (!professionalAccount || professionalAccount.verification_status === 'not_started') {
    return (
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <Building2 className="h-6 w-6 text-blue-600 mt-1" />
          </div>
          <div className="flex-1 ml-3">
            <h3 className="text-sm font-semibold text-blue-900">
              🎯 Faites vérifier votre compte professionnel
            </h3>
            <p className="text-sm text-blue-800 mt-1">
              Obtenez un badge de confiance et augmentez votre visibilité. Les comptes vérifiés 
              sont priorisés dans les recherches et inspirent plus confiance aux acheteurs.
            </p>
            <div className="flex items-center mt-3 space-x-3">
              <button
                onClick={handleStartVerification}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Commencer la vérification
                <ArrowRight className="h-4 w-4 ml-2" />
              </button>
              <button
                onClick={handleDismiss}
                className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
              >
                Plus tard
              </button>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 ml-4 text-blue-400 hover:text-blue-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    );
  }

  // Bannière pour demande en cours de traitement
  if (professionalAccount.verification_status === 'pending') {
    const daysSinceSubmission = Math.floor(
      (new Date().getTime() - new Date(professionalAccount.created_at).getTime()) / (1000 * 60 * 60 * 24)
    );

    return (
      <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-lg p-4 mb-6">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <Clock className="h-6 w-6 text-orange-600 mt-1" />
          </div>
          <div className="flex-1 ml-3">
            <h3 className="text-sm font-semibold text-orange-900">
              ⏳ Vérification en cours...
            </h3>
            <p className="text-sm text-orange-800 mt-1">
              Votre demande de vérification a bien été envoyée. 
              Nos équipes l'examinent dans les 24-48 heures.
            </p>
            <p className="text-xs text-orange-700 mt-2">
              📧 Vous recevrez ensuite un badge "compte vérifié".
            </p>
          </div>
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 ml-4 text-orange-400 hover:text-orange-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    );
  }

  // Bannière pour compte vérifié et approuvé (félicitations)
  if (professionalAccount?.verification_status === 'approved' && professionalAccount?.is_verified) {
    return (
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4 mb-6">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <CheckCircle className="h-6 w-6 text-green-600 mt-1" />
          </div>
          <div className="flex-1 ml-3">
            <h3 className="text-sm font-semibold text-green-900">
              🎉 Compte professionnel vérifié !
            </h3>
            <p className="text-sm text-green-800 mt-1">
              Félicitations ! Votre compte professionnel a été vérifié avec succès. 
              Votre badge "Vérifié" est maintenant visible sur votre profil et vos annonces.
            </p>
            <div className="flex items-center mt-2 text-xs text-green-700">
              <CheckCircle className="h-4 w-4 mr-2" />
              Priorité dans les résultats de recherche
            </div>
            <div className="flex items-center mt-1 text-xs text-green-700">
              <CheckCircle className="h-4 w-4 mr-2" />
              Badge de confiance visible
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 ml-4 text-green-400 hover:text-green-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    );
  }

  // Bannière pour demande rejetée
  if (professionalAccount.verification_status === 'not_verified') {
    return (
      <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-lg p-4 mb-6">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <X className="h-6 w-6 text-red-600 mt-1" />
          </div>
          <div className="flex-1 ml-3">
            <h3 className="text-sm font-semibold text-red-900">
              ❌ Demande de vérification refusée
            </h3>
            <p className="text-sm text-red-800 mt-1">
              Votre demande de vérification n'a pas pu être approuvée.
            </p>
            {professionalAccount.rejected_reason && (
              <div className="mt-2 p-2 bg-red-100 rounded border border-red-200">
                <p className="text-xs text-red-700">
                  <strong>Raison :</strong> {professionalAccount.rejected_reason}
                </p>
              </div>
            )}
            <div className="flex items-center mt-3 space-x-3">
              <button
                onClick={handleStartVerification}
                className="inline-flex items-center px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
              >
                Nouvelle demande
                <ArrowRight className="h-4 w-4 ml-2" />
              </button>
              <button
                onClick={handleDismiss}
                className="text-sm text-red-600 hover:text-red-800 transition-colors"
              >
                Plus tard
              </button>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 ml-4 text-red-400 hover:text-red-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    );
  }

  return null;
};