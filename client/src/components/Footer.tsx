import React from 'react';
import { useApp } from '../contexts/AppContext';

interface FooterProps {
  setCurrentView: (view: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ setCurrentView }) => {
  const { currentUser, setAuthMode, setShowAuthModal } = useApp();

  const handleCreateListing = () => {
    if (!currentUser) {
      setAuthMode('login');
      setShowAuthModal(true);
    } else {
      setCurrentView('create-listing');
    }
  };

  const handleMyAccountClick = () => {
    if (!currentUser) {
      setAuthMode('login');
      setShowAuthModal(true);
    } else {
      setCurrentView('dashboard');
    }
  };

  return (
    <footer className="bg-gray-900 text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Company Info */}
          <div>
            <div className="flex items-center space-x-3 mb-6">
              <div>
                <h3 className="text-xl font-bold">PassionAuto2Roues</h3>
              </div>
            </div>
            <p className="text-gray-400 mb-6">
              La marketplace de référence pour l'achat et la vente de véhicules d'occasion, accidentés et les pièces détachées.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Liens rapides</h4>
            <ul className="space-y-3">
              <li><button onClick={() => setCurrentView('listings')} className="text-gray-400 hover:text-white transition-colors">Rechercher</button></li>
              <li><button onClick={handleCreateListing} className="text-gray-400 hover:text-white transition-colors">Déposer une annonce</button></li>
              <li><button onClick={handleMyAccountClick} className="text-gray-400 hover:text-white transition-colors">Espace Pro</button></li>
              <li><button onClick={handleMyAccountClick} className="text-gray-400 hover:text-white transition-colors">Mon compte</button></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Support</h4>
            <ul className="space-y-3">
              <li><button onClick={() => setCurrentView('help')} className="text-gray-400 hover:text-white transition-colors">Centre d'aide</button></li>
              <li><button onClick={() => setCurrentView('conseils')} className="text-gray-400 hover:text-white transition-colors">Conseils</button></li>
              <li><button onClick={() => setCurrentView('help')} className="text-gray-400 hover:text-white transition-colors">Contact</button></li>
              <li><button onClick={() => setCurrentView('help')} className="text-gray-400 hover:text-white transition-colors">Signaler un problème</button></li>
              <li><button onClick={() => setCurrentView('safety')} className="text-gray-400 hover:text-white transition-colors">Conseils sécurité</button></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Légal</h4>
            <ul className="space-y-3">
              <li><button onClick={() => setCurrentView('about')} className="text-gray-400 hover:text-white transition-colors">À propos</button></li>
              <li><button onClick={() => setCurrentView('terms')} className="text-gray-400 hover:text-white transition-colors">CGU</button></li>
              <li><button onClick={() => setCurrentView('legal')} className="text-gray-400 hover:text-white transition-colors">Mentions légales</button></li>
              <li><button onClick={() => setCurrentView('privacy')} className="text-gray-400 hover:text-white transition-colors">Confidentialité</button></li>
              <li><button onClick={() => setCurrentView('admin-login')} className="text-gray-500 hover:text-gray-300 transition-colors text-xs">Administration</button></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 mb-4 md:mb-0">
              © 2025 PassionAuto2Roues.com. Tous droits réservés. Design By Happy Agency
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};