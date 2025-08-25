import React from 'react';
import { BookOpen, Lightbulb, Shield, Wrench, Car, Bike, AlertTriangle, CheckCircle } from 'lucide-react';

export const Conseils: React.FC = () => {
  const conseils = [
    {
      id: 1,
      category: 'Achat',
      title: 'Comment bien acheter un véhicule d\'occasion',
      description: 'Tous nos conseils pour éviter les pièges lors de l\'achat d\'un véhicule d\'occasion.',
      icon: Car,
      color: 'from-blue-500 to-blue-600',
      tips: [
        'Vérifiez les papiers du véhicule',
        'Inspectez l\'état général',
        'Testez tous les équipements',
        'Négociez le prix'
      ]
    },
    {
      id: 2,
      category: 'Vente',
      title: 'Optimiser la vente de votre véhicule',
      description: 'Maximisez vos chances de vendre rapidement et au meilleur prix.',
      icon: Lightbulb,
      color: 'from-green-500 to-green-600',
      tips: [
        'Prenez de belles photos',
        'Rédigez une description détaillée',
        'Fixez un prix juste',
        'Préparez votre véhicule'
      ]
    },
    {
      id: 3,
      category: 'Sécurité',
      title: 'Transactions sécurisées',
      description: 'Protégez-vous des arnaques et effectuez des transactions en toute sécurité.',
      icon: Shield,
      color: 'from-red-500 to-red-600',
      tips: [
        'Rencontrez en personne',
        'Vérifiez l\'identité',
        'Utilisez un paiement sécurisé',
        'Méfiez-vous des prix trop bas'
      ]
    },
    {
      id: 4,
      category: 'Entretien',
      title: 'Maintenir votre véhicule en bon état',
      description: 'Conseils d\'entretien pour prolonger la durée de vie de votre véhicule.',
      icon: Wrench,
      color: 'from-purple-500 to-purple-600',
      tips: [
        'Respectez les révisions',
        'Contrôlez régulièrement',
        'Changez les consommables',
        'Surveillez les témoins'
      ]
    },
    {
      id: 5,
      category: 'Moto',
      title: 'Spécificités des deux-roues',
      description: 'Conseils spécifiques pour l\'achat et la vente de motos et scooters.',
      icon: Bike,
      color: 'from-orange-500 to-orange-600',
      tips: [
        'Vérifiez l\'état des pneus',
        'Testez les freins',
        'Contrôlez la chaîne',
        'Vérifiez l\'éclairage'
      ]
    },
    {
      id: 6,
      category: 'Légal',
      title: 'Aspects juridiques et administratifs',
      description: 'Tout ce qu\'il faut savoir sur les démarches administratives.',
      icon: AlertTriangle,
      color: 'from-yellow-500 to-yellow-600',
      tips: [
        'Changement de propriétaire',
        'Contrôle technique',
        'Assurance obligatoire',
        'Certificat de cession'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-3 bg-primary-bolt-100 rounded-full px-6 py-3 mb-6">
            <BookOpen className="h-6 w-6 text-primary-bolt-500" />
            <span className="font-semibold text-primary-bolt-500">Centre d'aide</span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Conseils et guides pratiques
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Découvrez nos conseils d'experts pour acheter, vendre et entretenir vos véhicules en toute sérénité.
          </p>
        </div>

        {/* Conseils Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {conseils.map((conseil) => {
            const IconComponent = conseil.icon;
            return (
              <div
                key={conseil.id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden border border-gray-100"
              >
                {/* Header with gradient */}
                <div className={`bg-gradient-to-r ${conseil.color} p-6 text-white`}>
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
                      <IconComponent className="h-6 w-6" />
                    </div>
                    <span className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 text-sm font-medium">
                      {conseil.category}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold mb-2">{conseil.title}</h3>
                  <p className="text-white/90 text-sm">{conseil.description}</p>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Points clés</span>
                  </h4>
                  <ul className="space-y-3">
                    {conseil.tips.map((tip, index) => (
                      <li key={index} className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-primary-bolt-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-700 text-sm">{tip}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <button className="w-full mt-6 bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 px-4 rounded-xl font-semibold transition-colors">
                    Lire le guide complet
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Questions fréquentes</h2>
            <p className="text-gray-600">Les réponses aux questions les plus courantes</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="border-l-4 border-primary-bolt-500 pl-6">
                <h3 className="font-semibold text-gray-900 mb-2">Comment publier une annonce ?</h3>
                <p className="text-gray-600 text-sm">
                  Cliquez sur "Déposer une annonce", remplissez le formulaire étape par étape, 
                  ajoutez des photos et publiez gratuitement.
                </p>
              </div>

              <div className="border-l-4 border-green-500 pl-6">
                <h3 className="font-semibold text-gray-900 mb-2">Combien coûte une annonce ?</h3>
                <p className="text-gray-600 text-sm">
                  La publication d'annonces est entièrement gratuite. Seules les options premium 
                  de mise en avant sont payantes.
                </p>
              </div>

              <div className="border-l-4 border-blue-500 pl-6">
                <h3 className="font-semibold text-gray-900 mb-2">Comment contacter un vendeur ?</h3>
                <p className="text-gray-600 text-sm">
                  Utilisez le bouton "Voir le téléphone" ou "Envoyer un message" sur la page 
                  de l'annonce pour contacter directement le vendeur.
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="border-l-4 border-orange-500 pl-6">
                <h3 className="font-semibold text-gray-900 mb-2">Comment éviter les arnaques ?</h3>
                <p className="text-gray-600 text-sm">
                  Rencontrez toujours le vendeur en personne, vérifiez les papiers du véhicule 
                  et méfiez-vous des prix anormalement bas.
                </p>
              </div>

              <div className="border-l-4 border-purple-500 pl-6">
                <h3 className="font-semibold text-gray-900 mb-2">Puis-je modifier mon annonce ?</h3>
                <p className="text-gray-600 text-sm">
                  Oui, vous pouvez modifier votre annonce à tout moment depuis votre tableau 
                  de bord en cliquant sur l'icône de modification.
                </p>
              </div>

              <div className="border-l-4 border-red-500 pl-6">
                <h3 className="font-semibold text-gray-900 mb-2">Que faire en cas de problème ?</h3>
                <p className="text-gray-600 text-sm">
                  Contactez notre support client via le formulaire de contact ou par téléphone. 
                  Nous vous aiderons à résoudre votre problème.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Support */}
        <div className="bg-gradient-to-r from-primary-bolt-500 to-primary-bolt-600 rounded-2xl p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-4">Besoin d'aide supplémentaire ?</h2>
          <p className="text-primary-bolt-100 mb-6">
            Notre équipe support est là pour vous accompagner dans toutes vos démarches.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-primary-bolt-500 hover:bg-gray-50 px-8 py-3 rounded-xl font-semibold transition-colors">
              Contacter le support
            </button>
            <button className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-8 py-3 rounded-xl font-semibold transition-colors border border-white/20">
              Centre d'aide complet
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};