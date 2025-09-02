import React, { useEffect, useState } from 'react';
import { Check, AlertCircle, ArrowRight, CreditCard } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';

const StripeSuccess: React.FC = () => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [sessionDetails, setSessionDetails] = useState<any>(null);
  const { dbUser } = useAuth();
  
  useEffect(() => {
    const handleStripeSuccess = async () => {
      try {
        // Récupérer le session_id depuis l'URL
        const urlParams = new URLSearchParams(window.location.search);
        const sessionId = urlParams.get('session_id');
        
        if (!sessionId) {
          setStatus('error');
          return;
        }
        
        console.log('🔄 Traitement du succès Stripe, session:', sessionId);
        
        // Appeler l'API pour traiter le succès du paiement
        const response = await fetch('/api/subscriptions/handle-success', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ sessionId })
        });
        
        if (!response.ok) {
          console.error('❌ Erreur traitement succès:', response.status);
          setStatus('error');
          return;
        }
        
        const result = await response.json();
        setSessionDetails(result);
        setStatus('success');
        
        console.log('✅ Paiement traité avec succès:', result);
        
        // Les données utilisateur seront rafraîchies automatiquement lors de la navigation
        
      } catch (error) {
        console.error('❌ Erreur lors du traitement du succès:', error);
        setStatus('error');
      }
    };
    
    handleStripeSuccess();
  }, []);
  
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
          <h2 className="text-xl font-semibold text-gray-900">Traitement de votre paiement...</h2>
          <p className="text-gray-600">Veuillez patienter, nous finalisons votre abonnement.</p>
        </div>
      </div>
    );
  }
  
  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md mx-auto text-center space-y-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Problème de traitement</h2>
          <p className="text-gray-600">
            Une erreur est survenue lors du traitement de votre paiement. 
            Veuillez contacter le support si le problème persiste.
          </p>
          <button
            onClick={() => window.location.href = '/dashboard'}
            className="bg-red-600 text-white py-3 px-8 rounded-xl font-semibold hover:bg-red-700 transition-colors flex items-center space-x-2 mx-auto"
          >
            <span>Retour au tableau de bord</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
      <div className="max-w-lg mx-auto text-center space-y-8 p-8">
        {/* Icône de succès */}
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <Check className="h-10 w-10 text-green-600" />
        </div>
        
        {/* Titre principal */}
        <div className="space-y-3">
          <h1 className="text-3xl font-bold text-gray-900">
            🎉 Félicitations !
          </h1>
          <p className="text-xl text-gray-700">
            Votre compte professionnel est maintenant actif
          </p>
        </div>
        
        {/* Détails de l'abonnement */}
        {sessionDetails && (
          <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <CreditCard className="h-5 w-5 text-green-600" />
              <span className="font-medium text-gray-900">Détails de votre abonnement</span>
            </div>
            
            <div className="space-y-2 text-sm">
              {sessionDetails.planName && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Plan :</span>
                  <span className="font-medium text-gray-900">{sessionDetails.planName}</span>
                </div>
              )}
              {sessionDetails.amount && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Montant :</span>
                  <span className="font-medium text-gray-900">{sessionDetails.amount}€/mois</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Statut :</span>
                <span className="font-medium text-green-600">✅ Actif</span>
              </div>
            </div>
          </div>
        )}
        
        {/* Prochaines étapes */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-left">
          <h3 className="font-semibold text-blue-900 mb-3">🚀 Prochaines étapes :</h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex items-start space-x-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>Accédez à votre tableau de bord professionnel</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>Publiez vos premières annonces avec les options premium</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>Profitez de la visibilité prioritaire sur PassionAuto2Roues</span>
            </li>
          </ul>
        </div>
        
        {/* Bouton d'action */}
        <button
          onClick={() => window.location.href = '/dashboard'}
          className="w-full bg-green-600 text-white py-4 px-8 rounded-xl font-semibold hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
        >
          <span>Accéder à mon tableau de bord</span>
          <ArrowRight className="h-5 w-5" />
        </button>
        
        {/* Note de facturation */}
        <p className="text-xs text-gray-500">
          Un reçu de votre paiement vous a été envoyé par email. 
          Vous pouvez gérer votre abonnement depuis votre tableau de bord.
        </p>
      </div>
    </div>
  );
};

export default StripeSuccess;