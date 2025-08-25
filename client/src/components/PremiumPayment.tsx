import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Check, CreditCard, Lock } from 'lucide-react';
import { PREMIUM_PACKS } from '@/types/premium';

// Chargement de Stripe (sera disponible quand les clés seront fournies)
const stripePromise = import.meta.env.VITE_STRIPE_PUBLIC_KEY 
  ? loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY)
  : null;

interface PremiumPaymentProps {
  selectedPack: string;
  onPaymentSuccess: () => void;
  onBack: () => void;
}

const PaymentForm: React.FC<{ onPaymentSuccess: () => void }> = ({ onPaymentSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setErrorMessage('');

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.origin,
        },
      });

      if (error) {
        setErrorMessage(error.message || 'Une erreur est survenue lors du paiement');
      } else {
        onPaymentSuccess();
      }
    } catch (err) {
      setErrorMessage('Une erreur inattendue est survenue');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <PaymentElement />
      </div>
      
      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full bg-primary-bolt-500 text-white py-4 px-6 rounded-xl font-semibold hover:bg-primary-bolt-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
      >
        {isProcessing ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>Traitement en cours...</span>
          </>
        ) : (
          <>
            <Lock className="h-5 w-5" />
            <span>Payer maintenant</span>
          </>
        )}
      </button>

      {errorMessage && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-red-800 text-sm">{errorMessage}</p>
        </div>
      )}
    </form>
  );
};

export const PremiumPayment: React.FC<PremiumPaymentProps> = ({
  selectedPack,
  onPaymentSuccess,
  onBack,
}) => {
  const [clientSecret, setClientSecret] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const selectedPackData = PREMIUM_PACKS.find(pack => pack.id === selectedPack);

  useEffect(() => {
    if (selectedPackData && selectedPackData.price > 0) {
      createPaymentIntent();
    }
  }, [selectedPackData]);

  const createPaymentIntent = async () => {
    if (!selectedPackData) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: selectedPackData.price,
          packId: selectedPackData.id,
          description: `Pack ${selectedPackData.name}`,
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la création du paiement');
      }

      const { clientSecret } = await response.json();
      setClientSecret(clientSecret);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Pack gratuit - pas de paiement nécessaire
  if (!selectedPackData || selectedPackData.price === 0) {
    return (
      <div className="text-center space-y-6">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <Check className="h-8 w-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Publication gratuite</h2>
        <p className="text-gray-600">
          Votre annonce sera publiée gratuitement et sera visible dans les résultats de recherche.
        </p>
        <button
          onClick={onPaymentSuccess}
          className="bg-green-600 text-white py-3 px-8 rounded-xl font-semibold hover:bg-green-700 transition-colors"
        >
          Continuer
        </button>
      </div>
    );
  }

  // Pas de clés Stripe configurées
  if (!stripePromise) {
    return (
      <div className="text-center space-y-6">
        <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto">
          <CreditCard className="h-8 w-8 text-yellow-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Paiement temporairement indisponible</h2>
        <p className="text-gray-600">
          Le système de paiement n'est pas encore configuré. Vous pouvez publier votre annonce gratuitement en attendant.
        </p>
        <div className="flex space-x-4 justify-center">
          <button
            onClick={onBack}
            className="bg-gray-500 text-white py-3 px-6 rounded-xl font-semibold hover:bg-gray-600 transition-colors"
          >
            Retour
          </button>
          <button
            onClick={onPaymentSuccess}
            className="bg-primary-bolt-500 text-white py-3 px-6 rounded-xl font-semibold hover:bg-primary-bolt-600 transition-colors"
          >
            Publier gratuitement
          </button>
        </div>
      </div>
    );
  }

  // Chargement du paiement
  if (isLoading || !clientSecret) {
    return (
      <div className="text-center space-y-6">
        <div className="w-16 h-16 border-4 border-primary-bolt-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <h2 className="text-2xl font-bold text-gray-900">Préparation du paiement...</h2>
        <p className="text-gray-600">Veuillez patienter</p>
      </div>
    );
  }

  // Interface de paiement
  return (
    <div className="space-y-8">
      {/* Récapitulatif du pack */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Récapitulatif de votre commande</h3>
        <div className="flex justify-between items-center">
          <div>
            <p className="font-medium text-gray-900">{selectedPackData.name}</p>
            <p className="text-sm text-gray-600">{selectedPackData.description}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-gray-900">{selectedPackData.price}€</p>
            <p className="text-sm text-gray-600">
              {selectedPackData.duration} jour{selectedPackData.duration > 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </div>

      {/* Informations de sécurité */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-center space-x-3">
          <Lock className="h-6 w-6 text-blue-600" />
          <div>
            <p className="font-medium text-blue-900">Paiement sécurisé</p>
            <p className="text-sm text-blue-800">
              Vos informations de paiement sont protégées par le chiffrement SSL et traitées par Stripe.
            </p>
          </div>
        </div>
      </div>

      {/* Formulaire de paiement */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations de paiement</h3>
        <Elements 
          stripe={stripePromise} 
          options={{ 
            clientSecret,
            appearance: {
              theme: 'stripe',
              variables: {
                colorPrimary: '#059669',
              },
            },
          }}
        >
          <PaymentForm onPaymentSuccess={onPaymentSuccess} />
        </Elements>
      </div>

      <button
        onClick={onBack}
        className="w-full bg-gray-500 text-white py-3 px-6 rounded-xl font-semibold hover:bg-gray-600 transition-colors"
      >
        Retour à la sélection des packs
      </button>
    </div>
  );
};