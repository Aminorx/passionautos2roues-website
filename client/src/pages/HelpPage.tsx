import React, { useState, useEffect } from 'react';
import { ArrowLeft, Search, HelpCircle, MessageCircle, Phone, Mail, ChevronDown, ChevronUp } from 'lucide-react';
import { BRAND } from '../config/legalConfig';

interface HelpPageProps {
  onBack: () => void;
  setCurrentView: (view: string) => void;
}

interface FAQItem {
  id: number;
  question: string;
  answer: string;
  category: string;
}

export const HelpPage: React.FC<HelpPageProps> = ({ onBack, setCurrentView }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const faqData: FAQItem[] = [
    {
      id: 1,
      question: `Comment publier une annonce sur ${BRAND.SITE_NAME} ?`,
      answer: "Pour publier une annonce, connectez-vous à votre compte, cliquez sur 'Déposer une annonce' et suivez les étapes guidées. Vous devrez renseigner le type d'annonce, la catégorie, les détails du véhicule, ajouter des photos et définir un prix.",
      category: "annonces"
    },
    {
      id: 2,
      question: "Combien coûte la publication d'une annonce ?",
      answer: "La publication d'une annonce de base est gratuite. Vous pouvez booster votre annonce avec nos packs premium : Daily (0,99€), Weekly (4,99€) ou Monthly (19,90€) pour une meilleure visibilité.",
      category: "tarifs"
    },
    {
      id: 3,
      question: "Comment modifier ou supprimer mon annonce ?",
      answer: "Rendez-vous dans votre espace personnel, section 'Mes annonces'. Cliquez sur l'annonce à modifier, puis sur 'Modifier' ou 'Supprimer'. Les modifications sont prises en compte immédiatement.",
      category: "annonces"
    },
    {
      id: 4,
      question: "Puis-je publier plusieurs photos pour mon véhicule ?",
      answer: "Oui, vous pouvez ajouter jusqu'à 4 photos par annonce. Des photos de qualité augmentent significativement vos chances de vente. Veillez à montrer l'extérieur, l'intérieur et les détails importants.",
      category: "annonces"
    },
    {
      id: 5,
      question: "Comment contacter un vendeur ?",
      answer: "Chaque annonce dispose d'un bouton 'Contacter le vendeur'. Vous pouvez l'appeler directement, lui envoyer un message via WhatsApp ou utiliser notre système de messagerie interne.",
      category: "achat"
    },
    {
      id: 6,
      question: "Comment fonctionne le système de premium ?",
      answer: "Les packs premium boostent la visibilité de votre annonce en la plaçant en tête des résultats de recherche. Trois formules sont disponibles : Daily (1 jour), Weekly (7 jours) ou Monthly (30 jours).",
      category: "tarifs"
    },
    {
      id: 7,
      question: "Comment créer un compte professionnel ?",
      answer: "Lors de l'inscription, sélectionnez 'Compte professionnel' et renseignez les informations de votre entreprise (nom, SIRET, adresse). Les comptes professionnels bénéficient d'avantages spécifiques.",
      category: "compte"
    },
    {
      id: 8,
      question: "Mes données personnelles sont-elles protégées ?",
      answer: `Absolument. ${BRAND.SITE_NAME} respecte le RGPD et protège vos données personnelles. Elles ne sont jamais vendues à des tiers et sont utilisées uniquement pour le fonctionnement de la plateforme.`,
      category: "securite"
    },
    {
      id: 9,
      question: "Comment signaler une annonce suspecte ?",
      answer: `Chaque annonce dispose d'un bouton 'Signaler' en bas de page. Vous pouvez également nous contacter directement à ${BRAND.CONTACT_EMAIL} pour signaler tout contenu inapproprié.`,
      category: "securite"
    },
    {
      id: 10,
      question: "Puis-je modifier mon mot de passe ?",
      answer: "Oui, rendez-vous dans votre espace personnel, section 'Paramètres du compte'. Vous pourrez modifier votre mot de passe, vos informations personnelles et vos préférences de communication.",
      category: "compte"
    }
  ];

  const categories = [
    { id: 'all', name: 'Toutes les catégories' },
    { id: 'annonces', name: 'Annonces' },
    { id: 'achat', name: 'Achat' },
    { id: 'tarifs', name: 'Tarifs' },
    { id: 'compte', name: 'Compte' },
    { id: 'securite', name: 'Sécurité' }
  ];

  const filteredFAQ = faqData.filter(item => {
    const matchesSearch = item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleFAQ = (id: number) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

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
            <h1 className="text-xl font-bold text-gray-900">Centre d'Aide</h1>
            <div className="w-20"></div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="bg-blue-500 text-white p-4 rounded-full">
              <HelpCircle className="h-12 w-12" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Comment pouvons-nous vous aider ?
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Trouvez rapidement les réponses à vos questions ou contactez notre équipe support.
          </p>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="relative">
            <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Rechercher dans l'aide..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-bolt-500 focus:border-primary-bolt-500 transition-all"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Categories */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Catégories</h3>
              <div className="space-y-2">
                {categories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      selectedCategory === category.id
                        ? 'bg-primary-bolt-500 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Contact Support */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Besoin d'aide ?</h3>
              <div className="space-y-3">
                <a
                  href={`mailto:${BRAND.CONTACT_EMAIL}`}
                  className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <Mail className="h-5 w-5 text-blue-500" />
                  <span className="text-blue-700">Email Support</span>
                </a>
                <a
                  href="tel:+33123456789"
                  className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                >
                  <Phone className="h-5 w-5 text-green-500" />
                  <span className="text-green-700">01 23 45 67 89</span>
                </a>
                <button className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors w-full">
                  <MessageCircle className="h-5 w-5 text-purple-500" />
                  <span className="text-purple-700">Chat en direct</span>
                </button>
              </div>
            </div>
          </div>

          {/* FAQ Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Questions Fréquentes
                <span className="text-lg font-normal text-gray-500 ml-2">
                  ({filteredFAQ.length} résultat{filteredFAQ.length > 1 ? 's' : ''})
                </span>
              </h2>
              
              {filteredFAQ.length === 0 ? (
                <div className="text-center py-12">
                  <HelpCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 text-lg">
                    Aucune question ne correspond à votre recherche.
                  </p>
                  <p className="text-gray-500 mt-2">
                    Essayez avec d'autres mots-clés ou contactez notre support.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredFAQ.map(item => (
                    <div key={item.id} className="border border-gray-200 rounded-lg overflow-hidden">
                      <button
                        onClick={() => toggleFAQ(item.id)}
                        className="w-full px-6 py-4 text-left bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between"
                      >
                        <span className="text-lg font-medium text-gray-900">{item.question}</span>
                        {expandedFAQ === item.id ? (
                          <ChevronUp className="h-5 w-5 text-gray-500" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-gray-500" />
                        )}
                      </button>
                      {expandedFAQ === item.id && (
                        <div className="px-6 py-4 bg-white border-t border-gray-200">
                          <p className="text-gray-700 leading-relaxed">{item.answer}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="h-8 w-8 text-blue-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Tutoriels Vidéo</h3>
            <p className="text-gray-600 mb-4">
              Apprenez à utiliser {BRAND.SITE_NAME} avec nos tutoriels vidéo détaillés
            </p>
            <button className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors">
              Voir les tutoriels
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <HelpCircle className="h-8 w-8 text-green-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Guide d'Utilisation</h3>
            <p className="text-gray-600 mb-4">
              Consultez notre guide complet pour maîtriser toutes les fonctionnalités
            </p>
            <button className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors">
              Lire le guide
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Phone className="h-8 w-8 text-purple-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Support Téléphonique</h3>
            <p className="text-gray-600 mb-4">
              Parlez directement à notre équipe support du lundi au vendredi
            </p>
            <button className="bg-purple-500 text-white px-6 py-2 rounded-lg hover:bg-purple-600 transition-colors">
              Nous appeler
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};