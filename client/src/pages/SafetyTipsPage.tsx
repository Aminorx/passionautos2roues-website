import React, { useEffect } from 'react';
import { ArrowLeft, Shield, AlertTriangle, CheckCircle, Eye, Lock, Phone, CreditCard } from 'lucide-react';
import { BRAND } from '../config/legalConfig';

interface SafetyTipsPageProps {
  onBack: () => void;
  setCurrentView: (view: string) => void;
}

export const SafetyTipsPage: React.FC<SafetyTipsPageProps> = ({ onBack, setCurrentView }) => {
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);
  const safetyTips = [
    {
      icon: <Eye className="h-8 w-8 text-blue-500" />,
      title: "Inspectez le véhicule",
      description: "Examinez toujours le véhicule en personne avant l'achat. Vérifiez l'état général, les documents et l'historique.",
      tips: [
        "Demandez à voir la carte grise et le contrôle technique",
        "Vérifiez la correspondance du numéro de série",
        "Faites un essai routier dans différentes conditions",
        "Inspectez les signes d'usure anormale ou d'accident"
      ]
    },
    {
      icon: <Shield className="h-8 w-8 text-green-500" />,
      title: "Rencontrez en lieu sûr",
      description: "Privilégiez les lieux publics et bien éclairés pour vos rendez-vous d'achat ou de vente.",
      tips: [
        "Rendez-vous dans des parkings publics surveillés",
        "Évitez les rendez-vous tardifs ou dans des lieux isolés",
        "Informez un proche de votre rendez-vous",
        "Amenez quelqu'un avec vous si possible"
      ]
    },
    {
      icon: <CreditCard className="h-8 w-8 text-purple-500" />,
      title: "Paiements sécurisés",
      description: "Utilisez des méthodes de paiement sécurisées et traçables pour vos transactions.",
      tips: [
        "Privilégiez les virements bancaires ou chèques de banque",
        "Évitez les paiements en espèces pour les gros montants",
        "Ne payez jamais avant d'avoir vu le véhicule",
        "Méfiez-vous des demandes de paiement urgent"
      ]
    },
    {
      icon: <Phone className="h-8 w-8 text-orange-500" />,
      title: "Communication prudente",
      description: "Soyez vigilant dans vos communications et ne partagez pas d'informations sensibles.",
      tips: [
        `Utilisez la messagerie ${BRAND.SITE_NAME} pour les premiers contacts`,
        "Ne communiquez jamais vos données bancaires par message",
        "Méfiez-vous des offres trop alléchantes",
        "Vérifiez l'identité de votre interlocuteur"
      ]
    }
  ];

  const redFlags = [
    "Prix anormalement bas par rapport au marché",
    "Vendeur pressé ou qui refuse la visite",
    "Demande de paiement avant la visite",
    "Photos floues ou en nombre insuffisant",
    "Vendeur qui ne peut pas présenter les documents",
    "Véhicule situé à l'étranger ou très loin",
    "Communication uniquement par email ou SMS",
    "Demande de virement vers un compte étranger"
  ];

  const documents = [
    {
      name: "Carte grise",
      description: "Vérifiez qu'elle est au nom du vendeur et sans opposition"
    },
    {
      name: "Contrôle technique",
      description: "Doit être valide et sans contre-visite en cours"
    },
    {
      name: "Factures d'entretien",
      description: "Prouvent l'historique et l'entretien du véhicule"
    },
    {
      name: "Rapport d'expertise",
      description: "En cas d'accident, demandez le rapport d'expertise"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={onBack}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Retour</span>
            </button>
            <h1 className="text-xl font-bold text-gray-900">Conseils de Sécurité</h1>
            <div className="w-20"></div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="bg-red-500 text-white p-4 rounded-full">
              <Shield className="h-12 w-12" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Conseils de Sécurité
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Protégez-vous lors de vos achats et ventes de véhicules. Suivez nos conseils 
            pour des transactions sûres et sereines.
          </p>
        </div>

        {/* Safety Tips Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {safetyTips.map((tip, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg p-8">
              <div className="flex items-center mb-6">
                {tip.icon}
                <h3 className="text-xl font-bold text-gray-900 ml-3">{tip.title}</h3>
              </div>
              <p className="text-gray-600 mb-6">{tip.description}</p>
              <ul className="space-y-2">
                {tip.tips.map((item, tipIndex) => (
                  <li key={tipIndex} className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Red Flags Section */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-12">
          <div className="flex items-center mb-6">
            <AlertTriangle className="h-8 w-8 text-red-500 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900">Signaux d'Alarme</h2>
          </div>
          <p className="text-gray-600 mb-6">
            Méfiez-vous si vous rencontrez l'un de ces signaux d'alarme lors d'une transaction :
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {redFlags.map((flag, index) => (
              <div key={index} className="flex items-start p-4 bg-red-50 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-red-800">{flag}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Documents Section */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-12">
          <div className="flex items-center mb-6">
            <Lock className="h-8 w-8 text-blue-500 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900">Documents Essentiels</h2>
          </div>
          <p className="text-gray-600 mb-6">
            Ces documents sont indispensables pour une transaction sécurisée :
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {documents.map((doc, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{doc.name}</h3>
                <p className="text-gray-600">{doc.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* For Sellers Section */}
        <div className="bg-gradient-to-r from-primary-bolt-500 to-primary-bolt-600 rounded-xl shadow-lg p-8 text-white mb-12">
          <h2 className="text-2xl font-bold mb-6">Conseils pour les Vendeurs</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">Préparez votre véhicule</h3>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-primary-bolt-200 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Nettoyez intérieur et extérieur</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-primary-bolt-200 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Rassemblez tous les documents</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-primary-bolt-200 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Prenez des photos de qualité</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-3">Soyez transparent</h3>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-primary-bolt-200 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Mentionnez tous les défauts</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-primary-bolt-200 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Proposez un prix réaliste</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-primary-bolt-200 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Répondez rapidement aux questions</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* For Buyers Section */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Conseils pour les Acheteurs</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Eye className="h-8 w-8 text-blue-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Recherchez</h3>
              <p className="text-gray-600">
                Étudiez le marché et comparez les prix avant d'acheter
              </p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Vérifiez</h3>
              <p className="text-gray-600">
                Inspectez le véhicule et tous les documents attentivement
              </p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-purple-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Négociez</h3>
              <p className="text-gray-600">
                Négociez le prix en vous basant sur l'état réel du véhicule
              </p>
            </div>
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-red-900 mb-4">En cas de problème</h2>
          <p className="text-red-800 mb-6">
            Si vous rencontrez une situation suspecte ou dangereuse, n'hésitez pas à nous contacter immédiatement.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={`mailto:${BRAND.CONTACT_EMAIL}`}
              className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition-colors"
            >
              Signaler un problème
            </a>
            <a
              href="tel:+33123456789"
              className="bg-white text-red-500 border border-red-500 px-6 py-3 rounded-lg hover:bg-red-50 transition-colors"
            >
              Appeler le support
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};