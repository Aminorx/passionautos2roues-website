import React, { useEffect } from 'react';
import { ArrowLeft, Lock, Eye, UserCheck, Database, Shield } from 'lucide-react';
import { LEGAL, BRAND } from '../config/legalConfig';

interface PrivacyPageProps {
  onBack: () => void;
  setCurrentView: (view: string) => void;
}

export const PrivacyPage: React.FC<PrivacyPageProps> = ({ onBack, setCurrentView }) => {
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);
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
            <h1 className="text-xl font-bold text-gray-900">Politique de Confidentialité</h1>
            <div className="w-20"></div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="bg-green-500 text-white p-4 rounded-full">
              <Lock className="h-12 w-12" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Politique de Confidentialité
          </h1>
          <p className="text-lg text-gray-600">
            Dernière mise à jour : {LEGAL.LAST_UPDATED}
          </p>
        </div>

        {/* RGPD Compliance */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
          <div className="flex items-start">
            <Shield className="h-6 w-6 text-green-500 mr-3 mt-0.5" />
            <div>
              <h3 className="text-lg font-semibold text-green-900 mb-2">Conformité RGPD</h3>
              <p className="text-green-800">
                {BRAND.SITE_NAME} est entièrement conforme au Règlement Général sur la Protection 
                des Données (RGPD) et s'engage à protéger vos données personnelles.
              </p>
            </div>
          </div>
        </div>

        {/* Content Sections */}
        <div className="space-y-8">
          {/* Section 1 */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <Eye className="h-7 w-7 text-primary-bolt-500 mr-3" />
              1. Données Collectées
            </h2>
            <div className="space-y-4 text-gray-700">
              <p>
                Nous collectons les données suivantes pour assurer le fonctionnement de notre service :
              </p>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Données d'inscription :</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li>Nom et prénom</li>
                  <li>Adresse email</li>
                  <li>Numéro de téléphone</li>
                  <li>Type de compte (particulier/professionnel)</li>
                  <li>Informations de localisation (code postal, ville)</li>
                </ul>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Données d'utilisation :</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li>Annonces publiées</li>
                  <li>Messages échangés</li>
                  <li>Historique de navigation</li>
                  <li>Adresse IP et données de connexion</li>
                  <li>Cookies et technologies similaires</li>
                </ul>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Données de paiement :</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li>Informations de carte bancaire (traitées par Stripe)</li>
                  <li>Historique des transactions</li>
                  <li>Factures et reçus</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Section 2 */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <Database className="h-7 w-7 text-blue-500 mr-3" />
              2. Finalités du Traitement
            </h2>
            <div className="space-y-4 text-gray-700">
              <p>Vos données sont utilisées pour :</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border-l-4 border-primary-bolt-500 pl-4">
                  <h4 className="font-semibold text-gray-900">Fonctionnement du service</h4>
                  <p className="text-sm text-gray-600">
                    Création et gestion des comptes, publication d'annonces, mise en relation
                  </p>
                </div>
                <div className="border-l-4 border-green-500 pl-4">
                  <h4 className="font-semibold text-gray-900">Communication</h4>
                  <p className="text-sm text-gray-600">
                    Notifications, support client, informations importantes
                  </p>
                </div>
                <div className="border-l-4 border-blue-500 pl-4">
                  <h4 className="font-semibold text-gray-900">Amélioration du service</h4>
                  <p className="text-sm text-gray-600">
                    Analyse d'usage, développement de nouvelles fonctionnalités
                  </p>
                </div>
                <div className="border-l-4 border-purple-500 pl-4">
                  <h4 className="font-semibold text-gray-900">Sécurité</h4>
                  <p className="text-sm text-gray-600">
                    Prévention de la fraude, détection d'activités suspectes
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3 */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">3. Base Légale du Traitement</h2>
            <div className="space-y-4 text-gray-700">
              <p>Le traitement de vos données repose sur :</p>
              <ul className="list-disc list-inside space-y-2">
                <li><strong>Exécution du contrat :</strong> Pour fournir nos services</li>
                <li><strong>Consentement :</strong> Pour les communications marketing (optionnel)</li>
                <li><strong>Intérêt légitime :</strong> Pour la sécurité et l'amélioration du service</li>
                <li><strong>Obligations légales :</strong> Pour respecter la réglementation</li>
              </ul>
            </div>
          </div>

          {/* Section 4 */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">4. Partage des Données</h2>
            <div className="space-y-4 text-gray-700">
              <p>Nous ne vendons jamais vos données personnelles. Elles peuvent être partagées uniquement dans les cas suivants :</p>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-semibold text-yellow-900 mb-2">Prestataires de services</h4>
                <p className="text-yellow-800">
                  Hébergement ({LEGAL.HOSTING.map(h => h.name).join(', ')}), paiement (Stripe), support client - sous contrat de confidentialité
                </p>
              </div>
              
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="font-semibold text-red-900 mb-2">Obligations légales</h4>
                <p className="text-red-800">
                  Autorités judiciaires ou administratives dans le cadre d'enquêtes légales
                </p>
              </div>
            </div>
          </div>

          {/* Section 5 */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <UserCheck className="h-7 w-7 text-green-500 mr-3" />
              5. Vos Droits
            </h2>
            <div className="space-y-4 text-gray-700">
              <p>Conformément au RGPD, vous disposez des droits suivants :</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Droit d'accès</h4>
                  <p className="text-sm text-gray-600">
                    Demander l'accès à vos données personnelles
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Droit de rectification</h4>
                  <p className="text-sm text-gray-600">
                    Corriger des données inexactes ou incomplètes
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Droit d'effacement</h4>
                  <p className="text-sm text-gray-600">
                    Supprimer vos données sous certaines conditions
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Droit à la portabilité</h4>
                  <p className="text-sm text-gray-600">
                    Récupérer vos données dans un format structuré
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Section 6 */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">6. Durée de Conservation</h2>
            <div className="space-y-4 text-gray-700">
              <p>Nous conservons vos données uniquement le temps nécessaire :</p>
              <ul className="list-disc list-inside space-y-2">
                <li><strong>Données de compte :</strong> Jusqu'à suppression du compte + 3 ans</li>
                <li><strong>Données d'annonces :</strong> 2 ans après expiration</li>
                <li><strong>Données de paiement :</strong> 10 ans (obligations comptables)</li>
                <li><strong>Logs de connexion :</strong> 1 an maximum</li>
              </ul>
            </div>
          </div>

          {/* Section 7 */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">7. Sécurité des Données</h2>
            <div className="space-y-4 text-gray-700">
              <p>Nous mettons en œuvre des mesures de sécurité robustes :</p>
              <ul className="list-disc list-inside space-y-2">
                <li>Chiffrement des données en transit et au repos</li>
                <li>Authentification à deux facteurs</li>
                <li>Audits de sécurité réguliers</li>
                <li>Accès restreint aux données personnelles</li>
                <li>Sauvegarde et plan de continuité d'activité</li>
              </ul>
            </div>
          </div>

          {/* Section 8 */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">8. Cookies et Technologies Similaires</h2>
            <div className="space-y-4 text-gray-700">
              <p>Nous utilisons des cookies pour :</p>
              <ul className="list-disc list-inside space-y-2">
                <li>Assurer le fonctionnement du site</li>
                <li>Mémoriser vos préférences</li>
                <li>Analyser l'audience (Google Analytics)</li>
                <li>Améliorer votre expérience utilisateur</li>
              </ul>
              <p>
                Vous pouvez gérer les cookies via les paramètres de votre navigateur. 
                Certains cookies sont nécessaires au fonctionnement du site.
              </p>
            </div>
          </div>

          {/* Section 9 */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">9. Transferts Internationaux</h2>
            <div className="space-y-4 text-gray-700">
              <p>
                Vos données sont hébergées en France. Certains prestataires peuvent être situés 
                dans l'Union Européenne ou dans des pays offrant un niveau de protection adéquat.
              </p>
              <p>
                Tout transfert vers un pays tiers fait l'objet de garanties appropriées 
                (clauses contractuelles types, etc.).
              </p>
            </div>
          </div>

          {/* Contact */}
          <div className="bg-gray-50 rounded-xl border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Contact et Réclamations</h2>
            <div className="space-y-4 text-gray-700">
              <p>
                <strong>Responsable du traitement :</strong> {LEGAL.COMPANY_NAME}, {LEGAL.COMPANY_ADDRESS}
              </p>
              <p>
                <strong>Contact :</strong> 
                <span className="text-primary-bolt-500 font-semibold"> {LEGAL.CONTACT_EMAIL}</span>
              </p>
              <p>
                <strong>Autorité de contrôle :</strong> En cas de litige, vous pouvez saisir la 
                <span className="font-semibold"> Commission Nationale de l'Informatique et des Libertés (CNIL)</span>
              </p>
              <p>
                <strong>Adresse CNIL :</strong> 3 Place de Fontenoy, 75007 Paris - www.cnil.fr
              </p>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
                <p className="text-green-800 font-medium">
                  Conformément au RGPD, vous pouvez exercer vos droits en écrivant à {BRAND.CONTACT_EMAIL}.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};