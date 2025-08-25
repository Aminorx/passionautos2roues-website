import React, { useState } from 'react';
import { Search, Bell, Heart, MessageCircle, User, Menu, X, LogIn } from 'lucide-react';
// Commenté car nous n'utilisons plus next/navigation ou react-router-dom
// import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/hooks/useAuth';
import { AuthModal } from './client-components/auth/AuthModal';
import { UserMenu } from './client-components/auth/UserMenu';

interface HeaderProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  setDashboardTab?: (tab: string) => void;
  onSearch?: (query: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  currentView, 
  setCurrentView, 
  mobileMenuOpen, 
  setMobileMenuOpen,
  setDashboardTab,
  onSearch 
}) => {
  // const navigate = useNavigate();
  const { setSearchFilters, setSelectedVehicle } = useApp();
  const { user, dbUser, isAuthenticated, isLoading } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('vehicles');
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');

  const handleAuthClick = (mode: 'signin' | 'signup') => {
    setAuthMode(mode);
    setShowAuthModal(true);
    setMobileMenuOpen(false);
  };

  const handleNavClick = (view: string) => {
    setActiveCategory('');
    setSelectedVehicle?.(null);
    setCurrentView(view);
    setMobileMenuOpen(false);
    setOpenDropdown(null);
  };

  const handleCreateListingClick = () => {
    setActiveCategory('');
    setSelectedVehicle?.(null);
    if (isAuthenticated) {
      // Utiliser le mode de navigation de votre application
      // Par exemple avec setCurrentView si c'est ainsi que vous naviguez
      setCurrentView('create-listing');
    } else {
      setAuthMode('signin');
      setShowAuthModal(true);
    }
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-gradient-to-r from-teal-600 to-teal-700 shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div 
            className="flex items-center cursor-pointer transition-transform hover:scale-105"
            onClick={() => handleNavClick('home')}
          >
            <img
              src="/logo-transparent_1753108744744.png"
              alt="Passion Auto2Roues"
              className="h-10 w-auto"
              loading="eager"
            />
          </div>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-2xl mx-8">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Rechercher un véhicule, une marque..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 pr-12 rounded-full border-2 border-white/20 bg-white/10 text-white placeholder-white/70 focus:outline-none focus:border-white/40 focus:bg-white/20 transition-all"
              />
              <button 
                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 text-white/70 hover:text-white transition-colors"
                onClick={() => onSearch?.(searchTerm)}
              >
                <Search size={20} />
              </button>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-6">
            <button
              onClick={handleCreateListingClick}
              className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-full font-semibold transition-colors shadow-lg"
            >
              Déposer une annonce
            </button>

            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <button className="text-white/80 hover:text-white transition-colors">
                  <Bell size={20} />
                </button>
                <button className="text-white/80 hover:text-white transition-colors">
                  <Heart size={20} />
                </button>
                <button className="text-white/80 hover:text-white transition-colors">
                  <MessageCircle size={20} />
                </button>
                <UserMenu 
                  onNavigate={(path) => handleNavClick(path)}
                  onDashboardNavigate={(tab) => setDashboardTab?.(tab)}
                />
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => handleAuthClick('signin')}
                  className="text-white/80 hover:text-white transition-colors font-medium"
                >
                  Se connecter
                </button>
                <button
                  onClick={() => handleAuthClick('signup')}
                  className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-full font-medium transition-all"
                >
                  S'inscrire
                </button>
              </div>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden text-white p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          defaultTab={authMode}
        />
      )}
    </header>
  );
};
