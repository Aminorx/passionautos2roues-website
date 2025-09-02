import React, { useEffect } from 'react';
import { ArrowLeft, Building, Mail, Phone, Globe, FileText } from 'lucide-react';
import { LEGAL, BRAND } from '../config/legalConfig';

interface LegalPageProps {
  onBack: () => void;
  setCurrentView: (view: string) => void;
}

export const LegalPage: React.FC<LegalPageProps> = ({ onBack, setCurrentView }) => {
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
            <h1 className="text-xl font-bold text-gray-900">Mentions Légales</h1>
            <div className="w-20"></div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="bg-purple-500 text-white p-4 rounded-full">
              <FileText className="h-12 w-12" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Mentions Légales
          </h1>
          <p className="text-lg text-gray-600">
            Informations légales concernant {BRAND.SITE_NAME}
          </p>
        </div>

        {/* Content Sections */}
        <div className="space-y-8">
          {/* Section 1 */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <Building className="h-7 w-7 text-primary-bolt-500 mr-3" />
              1. Informations sur l'Éditeur
            </h2>
            <div className="space-y-4 text-gray-700">
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{LEGAL.COMPANY_NAME}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p><strong>Forme juridique :</strong> {LEGAL.COMPANY_LEGAL_FORM}</p>
                    <p><strong>Capital social :</strong> {LEGAL.COMPANY_CAPITAL}</p>
                    <p><strong>RCS :</strong> {LEGAL.COMPANY_RCS}</p>
                  </div>
                  <div>
                    <p><strong>Siège social :</strong> {LEGAL.COMPANY_ADDRESS}</p>
                    <p><strong>Représentant légal :</strong> {LEGAL.PUBLISHER} ({LEGAL.PUBLISHER_TITLE})</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2 */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">2. Siège Social</h2>
            <div className="space-y-4 text-gray-700">
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex items-start space-x-3">
                  <Building className="h-6 w-6 text-gray-500 mt-1" />
                  <div>
                    <p className="font-semibold text-gray-900">Adresse du siège social :</p>
                    <p>{LEGAL.COMPANY_ADDRESS.split(', ')[0]}</p>
                    <p>{LEGAL.COMPANY_ADDRESS.split(', ')[1]}</p>
                    <p>France</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3 */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">3. Contact</h2>
            <div className="space-y-4 text-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="flex items-start space-x-3">
                    <Mail className="h-6 w-6 text-blue-500 mt-1" />
                    <div>
                      <p className="font-semibold text-gray-900 mb-2">Email</p>
                      <p>{LEGAL.CONTACT_EMAIL}</p>
                      <p className="text-sm text-gray-600">Support technique et commercial</p>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="flex items-start space-x-3">
                    <Phone className="h-6 w-6 text-green-500 mt-1" />
                    <div>
                      <p className="font-semibold text-gray-900 mb-2">Téléphone</p>
                      <p>+33 1 23 45 67 89</p>
                      <p className="text-sm text-gray-600">Lundi à Vendredi : 9h-18h</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 4 */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">4. Directeur de la Publication</h2>
            <div className="space-y-4 text-gray-700">
              <div className="bg-gray-50 rounded-lg p-6">
                <p><strong>Nom :</strong> {LEGAL.PUBLISHER}</p>
                <p><strong>Fonction :</strong> {LEGAL.PUBLISHER_TITLE} de {LEGAL.COMPANY_NAME}</p>
                <p><strong>Email :</strong> {LEGAL.CONTACT_EMAIL}</p>
              </div>
            </div>
          </div>

          {/* Section 5 */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <Globe className="h-7 w-7 text-blue-500 mr-3" />
              5. Hébergement
            </h2>
            <div className="space-y-4 text-gray-700">
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Hébergement du site</h3>
                <p className="mb-4">Le site {BRAND.SITE_DOMAIN} est hébergé et opéré via plusieurs prestataires :</p>
                <div className="space-y-2">
                  {LEGAL.HOSTING.map((host, index) => (
                    <p key={index}><strong>• {host.name}</strong> – {host.role} ({host.url})</p>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Section 6 */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">6. Propriété Intellectuelle</h2>
            <div className="space-y-4 text-gray-700">
              <p>
                {BRAND.SITE_NAME} et l'ensemble de ses contenus (textes, images, logos) sont la propriété de {LEGAL.COMPANY_NAME}.
              </p>
              <p>
                Toute reproduction, représentation, modification, publication, adaptation de tout 
                ou partie des éléments du site, quel que soit le moyen ou le procédé utilisé, 
                est interdite, sauf autorisation écrite préalable de {LEGAL.COMPANY_NAME}.
              </p>
              <p>
                Les marques {BRAND.SITE_NAME} et les logos figurant sur le site sont des marques 
                de {LEGAL.COMPANY_NAME}. Toute reproduction totale ou partielle de ces marques ou logos 
                effectuée à partir des éléments du site sans l'autorisation expresse de {LEGAL.COMPANY_NAME} 
                est donc prohibée.
              </p>
            </div>
          </div>

          {/* Section 7 */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">7. Cookies</h2>
            <div className="space-y-4 text-gray-700">
              <p>
                Le site {BRAND.SITE_NAME} utilise des cookies pour améliorer l'expérience utilisateur 
                et analyser le trafic. Les cookies sont des petits fichiers texte déposés sur 
                votre ordinateur lors de votre visite.
              </p>
              <p>
                Vous pouvez configurer votre navigateur pour refuser les cookies, mais cela 
                peut limiter certaines fonctionnalités du site.
              </p>
              <p>
                Pour plus d'informations, consultez notre 
                <span className="text-primary-bolt-500 font-semibold"> Politique de Confidentialité</span>.
              </p>
            </div>
          </div>

          {/* Section 8 */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">8. Responsabilité</h2>
            <div className="space-y-4 text-gray-700">
              <p>
                {LEGAL.COMPANY_NAME} s'efforce de fournir des informations aussi précises que possible. 
                Toutefois, elle ne pourra être tenue responsable des omissions, des inexactitudes 
                et des carences dans la mise à jour, qu'elles soient de son fait ou du fait des 
                tiers partenaires qui lui fournissent ces informations.
              </p>
              <p>
                Tous les informations indiquées sur le site {BRAND.SITE_NAME} sont données à titre 
                indicatif, et sont susceptibles d'évoluer. Par ailleurs, les renseignements 
                figurant sur le site ne sont pas exhaustifs.
              </p>
              <p>
                {LEGAL.COMPANY_NAME} ne peut être tenue responsable des transactions effectuées entre 
                utilisateurs via la plateforme.
              </p>
            </div>
          </div>

          {/* Section 9 */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">9. Droit Applicable</h2>
            <div className="space-y-4 text-gray-700">
              <p>
                Tout litige en relation avec l'utilisation du site {BRAND.SITE_NAME} est soumis au 
                droit français. En cas de litige, les tribunaux français seront seuls compétents.
              </p>
              <p>
                Les présentes mentions légales peuvent être modifiées à tout moment sans préavis. 
                Il est recommandé de les consulter régulièrement.
              </p>
            </div>
          </div>

          {/* Section 10 */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">10. Médiation</h2>
            <div className="space-y-4 text-gray-700">
              <p>
                Conformément aux dispositions du Code de la consommation concernant le règlement 
                amiable des litiges, {LEGAL.COMPANY_NAME} adhère au Service du Médiateur du e-commerce 
                de la FEVAD (Fédération du e-commerce et de la vente à distance).
              </p>
              <p>
                En cas de litige, vous pouvez déposer votre réclamation sur leur site : 
                <span className="text-primary-bolt-500 font-semibold"> www.mediateurfevad.fr</span>
              </p>
            </div>
          </div>

          {/* Contact */}
          <div className="bg-gray-50 rounded-xl border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Contact Légal</h2>
            <p className="text-gray-700">
              Pour toute question concernant ces mentions légales, contactez-nous à : 
              <span className="text-primary-bolt-500 font-semibold"> {LEGAL.CONTACT_EMAIL}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};