import React, { useState, useEffect } from 'react';
import { 
  Crown, Check, Star, TrendingUp, Award, Calendar, 
  Euro, CreditCard, ArrowLeft, Shield, Building2,
  MessageCircle, BarChart3, Zap
} from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';

if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  period: 'monthly' | 'yearly';
  maxListings: number;
  features: string[];
  popular?: boolean;
  color: {
    primary: string;
    secondary: string;
    bg: string;
  };
}

const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'starter-monthly',
    name: 'Starter Pro',
    price: 19.90,
    period: 'monthly',
    maxListings: 20,
    features: [
      'Jusqu\'à 20 annonces simultanées',
      'Page boutique personnalisée',
      'Badge professionnel vérifié',
      'Support par email',
      'Statistiques de base',
      'Remontée hebdomadaire'
    ],
    color: {
      primary: 'text-blue-600',
      secondary: 'text-blue-700',
      bg: 'bg-blue-50'
    }
  },
  {
    id: 'business-monthly',
    name: 'Business Pro',
    price: 39.90,
    period: 'monthly',
    maxListings: 50,
    popular: true,
    features: [
      'Jusqu\'à 50 annonces simultanées',
      'Remontée automatique quotidienne',
      'Statistiques détaillées',
      'Support téléphonique prioritaire',
      'Customisation avancée boutique',
      'Gestion multi-utilisateurs'
    ],
    color: {
      primary: 'text-orange-600',
      secondary: 'text-orange-700',
      bg: 'bg-orange-50'
    }
  },
  {
    id: 'premium-monthly',
    name: 'Premium Pro',
    price: 79.90,
    period: 'monthly',
    maxListings: -1, // illimité
    features: [
      'Annonces illimitées',
      'Remontée quotidienne automatique',
      'Analytics avancés',
      'Gestionnaire de compte dédié',
      'API d\'intégration',
      'Solutions sur mesure'
    ],
    color: {
      primary: 'text-purple-600',
      secondary: 'text-purple-700',
      bg: 'bg-purple-50'
    }
  }
];

interface PaymentFormProps {
  selectedPlan: SubscriptionPlan;
  onSuccess: () => void;
  onCancel: () => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ selectedPlan, onSuccess, onCancel }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!stripe || !elements || !user) return;
    
    setLoading(true);
    setError(null);

    try {
      // Récupérer le token d'authentification depuis Supabase
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('Token d\'authentification manquant');
      }

      // Créer la subscription
      const response = await fetch('/api/subscriptions/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          planId: selectedPlan.id
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Erreur de création d\'abonnement');
      }

      const { clientSecret } = data;

      // Confirmer le paiement avec PaymentElement
      const { error: stripeError } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.origin + '/subscription-success'
        },
        redirect: 'if_required'
      });

      if (stripeError) {
        setError(stripeError.message || 'Erreur de paiement');
      } else {
        onSuccess();
      }
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la souscription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Paiement sécurisé</h2>
        <button
          onClick={onCancel}
          className="text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="h-6 w-6" />
        </button>
      </div>

      {/* Récapitulatif */}
      <div className={`${selectedPlan.color.bg} rounded-xl p-4 mb-6`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className={`text-lg font-bold ${selectedPlan.color.primary}`}>
              {selectedPlan.name}
            </h3>
            <p className="text-gray-600">
              {selectedPlan.maxListings === -1 ? 'Annonces illimitées' : `${selectedPlan.maxListings} annonces max`}
            </p>
          </div>
          <div className={`text-3xl font-bold ${selectedPlan.color.primary}`}>
            {selectedPlan.price.toFixed(2)}€/mois
          </div>
        </div>
      </div>

      {/* Formulaire de paiement */}
      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Informations de paiement
          </label>
          <div className="p-4 border border-gray-300 rounded-xl">
            <PaymentElement
              options={{
                layout: 'tabs'
              }}
            />
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={!stripe || loading}
          className={`w-full py-4 px-6 rounded-xl font-bold text-white transition-colors ${
            loading
              ? 'bg-gray-400 cursor-not-allowed'
              : `${selectedPlan.color.primary.replace('text-', 'bg-')} hover:opacity-90`
          }`}
        >
          {loading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
              <span>Traitement...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>S'abonner pour {selectedPlan.price.toFixed(2)}€/mois</span>
            </div>
          )}
        </button>
      </form>

      {/* Sécurité */}
      <div className="mt-6 text-center text-sm text-gray-500">
        <div className="flex items-center justify-center space-x-2">
          <Shield className="h-4 w-4" />
          <span>Paiement sécurisé par Stripe</span>
        </div>
        <p className="mt-2">Vos informations sont protégées par un chiffrement SSL</p>
      </div>
    </div>
  );
};

interface SubscriptionPurchaseProps {
  onBack: () => void;
}

export default function SubscriptionPurchase({ onBack }: SubscriptionPurchaseProps) {
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSelectPlan = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setShowPayment(true);
  };

  const handlePaymentSuccess = () => {
    setShowPayment(false);
    setSuccess(true);
  };

  const handlePaymentCancel = () => {
    setShowPayment(false);
    setSelectedPlan(null);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-12 text-center max-w-md">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Abonnement activé !
          </h1>
          <p className="text-gray-600 mb-8">
            Votre compte professionnel {selectedPlan?.name} est maintenant actif. 
            Vous pouvez commencer à profiter de tous les avantages.
          </p>
          <button
            onClick={onBack}
            className="bg-primary-bolt-500 hover:bg-primary-bolt-600 text-white px-8 py-3 rounded-xl font-semibold transition-colors"
          >
            Retour au dashboard
          </button>
        </div>
      </div>
    );
  }

  if (showPayment && selectedPlan) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <Elements stripe={stripePromise}>
            <PaymentForm
              selectedPlan={selectedPlan}
              onSuccess={handlePaymentSuccess}
              onCancel={handlePaymentCancel}
            />
          </Elements>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <button
              onClick={onBack}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Retour</span>
            </button>
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900">Choisissez votre abonnement</h1>
              <p className="text-gray-600 mt-2">Sélectionnez le plan qui correspond à vos besoins</p>
            </div>
            <div></div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Avantages généraux */}
        <div className="text-center mb-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Building2 className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Boutique dédiée</h3>
              <p className="text-gray-600 text-sm">Votre propre page boutique personnalisée</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Visibilité premium</h3>
              <p className="text-gray-600 text-sm">Vos annonces remontent automatiquement</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Award className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Badge vérifié</h3>
              <p className="text-gray-600 text-sm">Statut professionnel certifié</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Statistiques</h3>
              <p className="text-gray-600 text-sm">Suivez les performances de vos annonces</p>
            </div>
          </div>
        </div>

        {/* Plans d'abonnement */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {SUBSCRIPTION_PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`bg-white rounded-2xl shadow-lg border-2 p-8 relative transform hover:scale-105 transition-all duration-300 ${
                plan.popular 
                  ? 'border-orange-300 scale-105' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-orange-500 text-white px-4 py-2 rounded-full text-sm font-bold flex items-center space-x-1">
                    <Star className="h-4 w-4" />
                    <span>Plus populaire</span>
                  </span>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className={`text-2xl font-bold mb-2 ${plan.color.primary}`}>
                  {plan.name}
                </h3>
                <div className={`text-5xl font-bold mb-2 ${plan.color.primary}`}>
                  {plan.price.toFixed(2)}€
                </div>
                <p className="text-gray-600">par mois</p>
                <p className={`text-sm font-medium ${plan.color.secondary} mt-2`}>
                  {plan.maxListings === -1 ? 'Annonces illimitées' : `${plan.maxListings} annonces max`}
                </p>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <Check className={`h-5 w-5 ${plan.color.primary} flex-shrink-0 mt-0.5`} />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSelectPlan(plan)}
                className={`w-full py-4 px-6 rounded-xl font-bold text-white transition-colors ${
                  plan.popular
                    ? 'bg-orange-500 hover:bg-orange-600'
                    : plan.color.primary.replace('text-', 'bg-') + ' hover:opacity-90'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <CreditCard className="h-5 w-5" />
                  <span>Choisir ce plan</span>
                </div>
              </button>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div className="mt-16 bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Questions fréquentes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-bold text-gray-900 mb-2">Puis-je changer de plan à tout moment ?</h3>
              <p className="text-gray-600 text-sm">
                Oui, vous pouvez upgrader ou downgrader votre abonnement à tout moment. 
                Les changements prennent effet immédiatement.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-2">Que se passe-t-il si j'annule ?</h3>
              <p className="text-gray-600 text-sm">
                Vous gardez l'accès aux fonctionnalités pro jusqu'à la fin de votre période payée, 
                puis votre compte redevient particulier.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-2">Y a-t-il des frais cachés ?</h3>
              <p className="text-gray-600 text-sm">
                Non, le prix affiché est le prix final. Aucun frais d'installation ou 
                de configuration supplémentaire.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-2">Support client inclus ?</h3>
              <p className="text-gray-600 text-sm">
                Oui, tous les plans incluent le support par email. Les plans Business et Premium 
                incluent aussi le support téléphonique.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}