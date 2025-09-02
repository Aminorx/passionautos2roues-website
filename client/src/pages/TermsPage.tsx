import React, { useEffect } from 'react';
import { ArrowLeft, Scale, FileText, Shield, AlertCircle } from 'lucide-react';
import { LEGAL, BRAND } from '../config/legalConfig';

interface TermsPageProps {
  onBack: () => void;
  setCurrentView: (view: string) => void;
}

export const TermsPage: React.FC<TermsPageProps> = ({ onBack, setCurrentView }) => {
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
            <h1 className="text-xl font-bold text-gray-900">Conditions Générales d'Utilisation</h1>
            <div className="w-20"></div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="bg-blue-500 text-white p-4 rounded-full">
              <Scale className="h-12 w-12" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Conditions Générales d'Utilisation
          </h1>
          <p className="text-lg text-gray-600">
            Dernière mise à jour : {LEGAL.LAST_UPDATED}
          </p>
        </div>

        {/* Alert Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <div className="flex items-start">
            <AlertCircle className="h-6 w-6 text-blue-500 mr-3 mt-0.5" />
            <div>
              <h3 className="text-lg font-semibold text-blue-900 mb-2">Important</h3>
              <p className="text-blue-800">
                En utilisant {BRAND.SITE_NAME}, vous acceptez les présentes conditions générales d'utilisation. 
                Nous vous recommandons de les lire attentivement.
              </p>
            </div>
          </div>
        </div>

        {/* Content Sections */}
        <div className="space-y-8">
          {/* Section 1 */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <FileText className="h-7 w-7 text-primary-bolt-500 mr-3" />
              1. Objet et Acceptation
            </h2>
            <div className="space-y-4 text-gray-700">
              <p>
                Les présentes Conditions Générales d'Utilisation (CGU) régissent l'accès et l'utilisation 
                de la plateforme {BRAND.SITE_NAME}, éditée par {LEGAL.COMPANY_NAME}.
              </p>
              <p>
                {BRAND.SITE_NAME} est une plateforme de mise en relation entre particuliers et professionnels 
                pour l'achat, la vente et la recherche de véhicules automobiles, motos, scooters, 
                pièces détachées et services.
              </p>
              <p>
                L'accès et l'utilisation de la plateforme impliquent l'acceptation pleine et entière 
                des présentes CGU par l'utilisateur.
              </p>
            </div>
          </div>

          {/* Section 2 */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">2. Inscription et Compte Utilisateur</h2>
            <div className="space-y-4 text-gray-700">
              <p>
                <strong>2.1 Inscription :</strong> L'inscription sur {BRAND.SITE_NAME} est gratuite. 
                Elle nécessite de fournir des informations exactes et à jour.
              </p>
              <p>
                <strong>2.2 Vérification :</strong> {BRAND.SITE_NAME} se réserve le droit de vérifier 
                l'identité des utilisateurs et de suspendre les comptes en cas d'informations 
                incorrectes ou frauduleuses.
              </p>
              <p>
                <strong>2.3 Responsabilité :</strong> L'utilisateur est responsable de la 
                confidentialité de ses identifiants et de toutes les activités effectuées 
                sous son compte.
              </p>
            </div>
          </div>

          {/* Section 3 */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">3. Utilisation de la Plateforme</h2>
            <div className="space-y-4 text-gray-700">
              <p>
                <strong>3.1 Annonces :</strong> Les utilisateurs peuvent publier des annonces 
                pour vendre ou rechercher des véhicules, pièces détachées ou services.
              </p>
              <p>
                <strong>3.2 Contenu :</strong> Les utilisateurs sont responsables du contenu 
                qu'ils publient et garantissent qu'il est légal, véridique et ne porte pas 
                atteinte aux droits de tiers.
              </p>
              <p>
                <strong>3.3 Interdictions :</strong> Il est interdit de :
              </p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Publier des annonces frauduleuses ou trompeuses</li>
                <li>Utiliser la plateforme à des fins illégales</li>
                <li>Harceler ou menacer d'autres utilisateurs</li>
                <li>Contourner les systèmes de sécurité</li>
                <li>Publier du contenu offensant ou inapproprié</li>
              </ul>
            </div>
          </div>

          {/* Section 4 */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">4. Transactions et Paiements</h2>
            <div className="space-y-4 text-gray-700">
              <p>
                <strong>4.1 Rôle de {BRAND.SITE_NAME} :</strong> {BRAND.SITE_NAME} est un intermédiaire 
                technique qui facilite la mise en relation. Les transactions se déroulent 
                directement entre acheteurs et vendeurs.
              </p>
              <p>
                <strong>4.2 Packs Premium :</strong> Les services premium sont facturés 
                selon les tarifs en vigueur. Les paiements sont sécurisés par Stripe.
              </p>
              <p>
                <strong>4.3 Remboursement :</strong> Les packs premium ne sont pas remboursables 
                sauf en cas de dysfonctionnement technique imputable à {BRAND.SITE_NAME}.
              </p>
            </div>
          </div>

          {/* Section 5 */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <Shield className="h-7 w-7 text-green-500 mr-3" />
              5. Protection des Données
            </h2>
            <div className="space-y-4 text-gray-700">
              <p>
                {BRAND.SITE_NAME} s'engage à protéger la vie privée de ses utilisateurs conformément 
                au Règlement Général sur la Protection des Données (RGPD).
              </p>
              <p>
                Les données personnelles collectées sont utilisées uniquement pour le 
                fonctionnement de la plateforme et ne sont pas vendues à des tiers.
              </p>
              <p>
                Pour plus d'informations, consultez notre 
                <span className="text-primary-bolt-500 font-semibold"> Politique de Confidentialité</span>.
              </p>
            </div>
          </div>

          {/* Section 6 */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">6. Propriété Intellectuelle</h2>
            <div className="space-y-4 text-gray-700">
              <p>
                {BRAND.SITE_NAME} et l'ensemble de ses contenus (textes, images, logos) 
                sont protégés par les droits de propriété intellectuelle.
              </p>
              <p>
                Les utilisateurs accordent à {LEGAL.COMPANY_NAME} une licence d'utilisation du contenu 
                qu'ils publient pour les besoins du fonctionnement de la plateforme.
              </p>
            </div>
          </div>

          {/* Section 7 */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">7. Responsabilité</h2>
            <div className="space-y-4 text-gray-700">
              <p>
                {BRAND.SITE_NAME} ne peut être tenu responsable des transactions effectuées entre 
                utilisateurs, de la qualité des biens ou services proposés, ou des litiges 
                pouvant survenir.
              </p>
              <p>
                Les utilisateurs utilisent la plateforme à leurs risques et périls et sont 
                encouragés à faire preuve de prudence lors des transactions.
              </p>
            </div>
          </div>

          {/* Section 8 */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">8. Modification et Résiliation</h2>
            <div className="space-y-4 text-gray-700">
              <p>
                {BRAND.SITE_NAME} se réserve le droit de modifier les présentes CGU à tout moment. 
                Les utilisateurs seront informés des modifications importantes.
              </p>
              <p>
                Les comptes utilisateurs peuvent être suspendus ou fermés en cas de violation 
                des présentes CGU.
              </p>
            </div>
          </div>

          {/* Section 9 */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">9. Droit Applicable et Juridiction</h2>
            <div className="space-y-4 text-gray-700">
              <p>
                Les présentes CGU sont régies par le droit français. En cas de litige, 
                les tribunaux français seront seuls compétents.
              </p>
            </div>
          </div>

          {/* Contact */}
          <div className="bg-gray-50 rounded-xl border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Contact</h2>
            <p className="text-gray-700">
              Pour toute question concernant ces conditions générales d'utilisation, 
              contactez-nous à : <span className="text-primary-bolt-500 font-semibold">{BRAND.CONTACT_EMAIL}</span> ou au {BRAND.PHONE_NUMBER}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};