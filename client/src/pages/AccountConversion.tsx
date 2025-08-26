import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Building, FileCheck, CheckCircle, Clock, XCircle, ArrowLeft, ArrowRight } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// import { useToast } from '../hooks/use-toast';

interface ConversionStatus {
  currentType: 'individual' | 'professional';
  canConvert: boolean;
  professionalAccount: any | null;
  conversionInProgress: boolean;
  conversionApproved: boolean;
  conversionRejected: boolean;
  rejectionReason: string | null;
}

interface ConversionData {
  companyName: string;
  siret: string;
  companyAddress: string;
  phone: string;
  email: string;
  website: string;
}

export const AccountConversion: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { user, isAuthenticated } = useAuth();
  // const { toast } = useToast();
  const toast = (options: any) => {
    console.log('Toast:', options.title, options.description);
    // Placeholder pour les toasts - sera remplacé par le vrai système
  };
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<ConversionData>({
    companyName: '',
    siret: '',
    companyAddress: '',
    phone: '',
    email: '',
    website: '',
  });

  // Récupérer le statut de conversion
  const { data: conversionStatus = {}, isLoading } = useQuery({
    queryKey: ['/api/account/conversion/status'],
    enabled: !!user?.id,
    retry: 1,
  });

  // Mutation pour démarrer la conversion
  const startConversionMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/account/conversion/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id || '',
        },
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erreur lors du démarrage de la conversion');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/account/conversion/status'] });
      toast({
        title: 'Conversion initiée',
        description: 'Votre demande de conversion a été initiée avec succès.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Mutation pour soumettre les données
  const submitConversionMutation = useMutation({
    mutationFn: async (data: ConversionData) => {
      const response = await fetch('/api/account/conversion/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id || '',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erreur lors de la soumission');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/account/conversion/status'] });
      toast({
        title: 'Demande soumise',
        description: 'Votre demande de conversion a été soumise avec succès. Elle sera examinée par notre équipe.',
      });
      setStep(3); // Aller à l'étape de confirmation
    },
    onError: (error: Error) => {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitConversionMutation.mutate(formData);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Accès non autorisé</h2>
          <p className="text-gray-600">Vous devez être connecté pour accéder à cette page.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-bolt-600"></div>
      </div>
    );
  }

  if ((conversionStatus as ConversionStatus)?.currentType === 'professional') {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Compte professionnel actif</h2>
            <p className="text-gray-600 mb-6">
              Votre compte professionnel est déjà actif et vérifié.
            </p>
            <button
              onClick={onBack}
              className="bg-primary-bolt-600 hover:bg-primary-bolt-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Retour au tableau de bord
            </button>
          </div>
        </div>
      </div>
    );
  }

  if ((conversionStatus as ConversionStatus)?.conversionInProgress) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <Clock className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Conversion en cours</h2>
            <p className="text-gray-600 mb-6">
              Votre demande de conversion en compte professionnel est en cours d'examen par notre équipe.
              Vous recevrez une notification dès que votre compte sera vérifié.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-blue-900 mb-2">Informations soumises :</h3>
              <div className="text-left text-blue-800">
                <p><strong>Entreprise :</strong> {(conversionStatus as ConversionStatus).professionalAccount?.company_name}</p>
                <p><strong>SIRET :</strong> {(conversionStatus as ConversionStatus).professionalAccount?.siret}</p>
                {(conversionStatus as ConversionStatus).professionalAccount?.website && (
                  <p><strong>Site web :</strong> {(conversionStatus as ConversionStatus).professionalAccount.website}</p>
                )}
              </div>
            </div>
            <button
              onClick={onBack}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Retour au tableau de bord
            </button>
          </div>
        </div>
      </div>
    );
  }

  if ((conversionStatus as ConversionStatus)?.conversionRejected) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Demande rejetée</h2>
            <p className="text-gray-600 mb-6">
              Votre demande de conversion en compte professionnel a été rejetée.
            </p>
            {(conversionStatus as ConversionStatus).rejectionReason && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-red-900 mb-2">Raison du rejet :</h3>
                <p className="text-red-800">{(conversionStatus as ConversionStatus).rejectionReason}</p>
              </div>
            )}
            <div className="space-y-4">
              <button
                onClick={() => {
                  startConversionMutation.mutate();
                  setStep(1);
                }}
                className="w-full bg-primary-bolt-600 hover:bg-primary-bolt-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Soumettre une nouvelle demande
              </button>
              <button
                onClick={onBack}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Retour au tableau de bord
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-bolt-600 to-primary-bolt-700 text-white p-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <ArrowLeft className="h-6 w-6" />
              </button>
              <div>
                <h1 className="text-2xl font-bold">Passer en compte professionnel</h1>
                <p className="text-primary-bolt-100">
                  Accédez à des fonctionnalités exclusives pour les professionnels
                </p>
              </div>
            </div>
          </div>

          {/* Progress */}
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center justify-between">
              {[1, 2, 3].map((stepNumber) => (
                <div key={stepNumber} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                      stepNumber <= step
                        ? 'bg-primary-bolt-600 text-white'
                        : 'bg-gray-300 text-gray-600'
                    }`}
                  >
                    {stepNumber}
                  </div>
                  {stepNumber < 3 && (
                    <div
                      className={`w-16 h-1 ${
                        stepNumber < step ? 'bg-primary-bolt-600' : 'bg-gray-300'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2 text-sm">
              <span className={step >= 1 ? 'text-primary-bolt-600 font-semibold' : 'text-gray-500'}>
                Informations
              </span>
              <span className={step >= 2 ? 'text-primary-bolt-600 font-semibold' : 'text-gray-500'}>
                Vérification
              </span>
              <span className={step >= 3 ? 'text-primary-bolt-600 font-semibold' : 'text-gray-500'}>
                Confirmation
              </span>
            </div>
          </div>

          <div className="p-6">
            {step === 1 && (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Informations de votre entreprise
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Fournissez les informations légales de votre entreprise pour la vérification.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nom de l'entreprise *
                  </label>
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-bolt-500 focus:border-primary-bolt-500"
                    placeholder="SARL Garage Dupont"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Numéro SIRET *
                  </label>
                  <input
                    type="text"
                    name="siret"
                    value={formData.siret}
                    onChange={handleInputChange}
                    required
                    pattern="[0-9]{14}"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-bolt-500 focus:border-primary-bolt-500"
                    placeholder="12345678901234"
                    maxLength={14}
                  />
                  <p className="text-sm text-gray-500 mt-1">14 chiffres, sans espaces</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Adresse de l'entreprise
                  </label>
                  <input
                    type="text"
                    name="companyAddress"
                    value={formData.companyAddress}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-bolt-500 focus:border-primary-bolt-500"
                    placeholder="123 Rue des Garages, 75001 Paris"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Téléphone professionnel
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-bolt-500 focus:border-primary-bolt-500"
                      placeholder="01 23 45 67 89"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email professionnel
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-bolt-500 focus:border-primary-bolt-500"
                      placeholder="contact@mongarage.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Site web (optionnel)
                  </label>
                  <input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-bolt-500 focus:border-primary-bolt-500"
                    placeholder="https://www.mongarage.com"
                  />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <FileCheck className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-blue-900">Documents requis</h3>
                      <p className="text-blue-800 text-sm mt-1">
                        Après avoir soumis ces informations, notre équipe vérifiera votre SIRET
                        et pourra vous demander des documents complémentaires (KBIS, etc.).
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between pt-6">
                  <button
                    type="button"
                    onClick={onBack}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={!formData.companyName || !formData.siret || submitConversionMutation.isPending}
                    className="bg-primary-bolt-600 hover:bg-primary-bolt-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center space-x-2"
                  >
                    {submitConversionMutation.isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Envoi en cours...</span>
                      </>
                    ) : (
                      <>
                        <span>Soumettre la demande</span>
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {step === 3 && (
              <div className="text-center">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Demande envoyée !</h2>
                <p className="text-gray-600 mb-8">
                  Votre demande de conversion en compte professionnel a été soumise avec succès.
                  Notre équipe l'examinera dans les plus brefs délais.
                </p>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                  <h3 className="font-semibold text-yellow-900 mb-2">Prochaines étapes :</h3>
                  <ul className="text-left text-yellow-800 space-y-1">
                    <li>• Vérification de votre SIRET</li>
                    <li>• Contrôle des informations fournies</li>
                    <li>• Activation de votre compte professionnel</li>
                  </ul>
                </div>
                <button
                  onClick={onBack}
                  className="bg-primary-bolt-600 hover:bg-primary-bolt-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
                >
                  Retour au tableau de bord
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};