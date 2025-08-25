import React, { useState } from 'react';
import { Search, Bell, Heart, MessageCircle, User, Menu, X, LogIn } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../hooks/useAuth';
import { AuthModal } from './auth/AuthModal';
import { UserMenu } from './auth/UserMenu';
import logoPath from '@assets/logo-transparent_1753108744744.png';
import accidentIcon from '@assets/accident_1753354197012.png';

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
    setActiveCategory(''); // Désactiver le soulignement des catégories principales
    setSelectedVehicle(null); // Fermer le détail du véhicule si ouvert
    setCurrentView(view);
    setMobileMenuOpen(false);
    setOpenDropdown(null); // Fermer le dropdown après clic
  };

  const handleDashboardNavClick = (tab: string) => {
    setActiveCategory(''); // Désactiver le soulignement des catégories principales
    setSelectedVehicle(null); // Fermer le détail du véhicule si ouvert
    if (setDashboardTab) {
      setDashboardTab(tab);
    }
    setCurrentView('dashboard');
    setMobileMenuOpen(false);
  };

  const handleCreateListingClick = () => {
    setActiveCategory(''); // Désactiver le soulignement des catégories principales
    setSelectedVehicle(null); // Fermer le détail du véhicule si ouvert
    if (isAuthenticated) {
      setCurrentView('create-listing');
    } else {
      // Utilisateur non connecté - afficher le modal de connexion
      setAuthMode('signin');
      setShowAuthModal(true);
    }
    setMobileMenuOpen(false);
  };

  const handleNavigate = (path: string) => {
    setActiveCategory('');
    setSelectedVehicle(null);
    setCurrentView(path.replace('/', ''));
    setMobileMenuOpen(false);
    setOpenDropdown(null);
  };

  const handleSearch = () => {
    setActiveCategory(''); // Désactiver le soulignement des catégories principales
    if (searchTerm.trim() && onSearch) {
      onSearch(searchTerm.trim());
      setSearchTerm('');
      setMobileMenuOpen(false);
    } else if (searchTerm.trim()) {
      // Fallback to old behavior if onSearch not provided
      setSearchFilters({ category: searchTerm });
      setCurrentView('listings');
      setSearchTerm('');
      setMobileMenuOpen(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Structure des catégories et sous-catégories
  const categoryStructure = {
    'voiture-utilitaire': {
      label: 'Voitures - Utilitaires',
      subcategories: [
        { id: 'voiture', label: 'Voitures' },
        { id: 'utilitaire', label: 'Utilitaires' },
        { id: 'caravane', label: 'Caravanes' },
        { id: 'remorque', label: 'Remorques' }
      ]
    },
    'moto-scooter-quad': {
      label: 'Motos, Scooters, Quads',
      subcategories: [
        { id: 'moto', label: 'Motos' },
        { id: 'scooter', label: 'Scooters' },
        { id: 'quad', label: 'Quads' }
      ]
    },
    'nautisme-sport-aerien': {
      label: 'Nautisme, Sport et Plein air',
      subcategories: [
        { id: 'bateau', label: 'Bateaux' },
        { id: 'jetski', label: 'Jet-skis' },
        { id: 'aerien', label: 'Aérien' }
      ]
    },
    'services': {
      label: 'Services',
      subcategories: [
        { id: 'reparation', label: 'Réparation' },
        { id: 'remorquage', label: 'Remorquage' },
        { id: 'entretien', label: 'Entretien' },
        { id: 'autre-service', label: 'Autres services' }
      ]
    },
    'pieces': {
      label: 'Pièces détachées',
      subcategories: [
        { id: 'piece-voiture', label: 'Pièces voiture' },
        { id: 'piece-moto', label: 'Pièces moto' },
        { id: 'autre-piece', label: 'Autres pièces' }
      ]
    }
  };

  const handleSubcategoryClick = (subcategoryId: string) => {
    setActiveCategory(''); // Désactiver le soulignement des catégories principales
    setSelectedVehicle(null); // Fermer le détail du véhicule si ouvert
    setSearchFilters({ category: subcategoryId });
    setCurrentView('listings');
    setMobileMenuOpen(false);
    setOpenDropdown(null); // Fermer le dropdown après clic
  };

  const handleDamagedVehiclesClick = () => {
    setActiveCategory(''); // Désactiver le soulignement des catégories principales
    setSelectedVehicle(null); // Fermer le détail du véhicule si ouvert
    setSearchFilters({ condition: 'damaged' });
    setCurrentView('listings');
    setMobileMenuOpen(false);
    setOpenDropdown(null); // Fermer le dropdown après clic
  };

  const handleCategoryClick = (category: string) => {
    setActiveCategory(category);
    setMobileMenuOpen(false);
    
    // Pour les catégories principales, on va vers la première sous-catégorie
    const categoryData = categoryStructure[category as keyof typeof categoryStructure];
    if (categoryData && categoryData.subcategories.length > 0) {
      handleSubcategoryClick(categoryData.subcategories[0].id);
    }
  };

  const categories = [
    { id: 'voiture-utilitaire', label: 'Voitures - Utilitaires' },
    { id: 'moto-scooter-quad', label: 'Motos, Scooters, Quads' },
    { id: 'nautisme-sport-aerien', label: 'Nautisme, Sport et Plein air' },
    { id: 'services', label: 'Services' },
    { id: 'pieces', label: 'Pièces détachées' },
  ];

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div 
            className="flex items-center cursor-pointer relative z-[105]"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleNavClick('home');
            }}
          >
            <img 
              src={logoPath} 
              alt="Passion Auto2Roues" 
              className="h-10 w-auto"
            />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-6 flex-1 max-w-4xl mx-8">
            {/* Deposit Button */}
            <button
              onClick={handleCreateListingClick}
              className="bg-gradient-to-r from-primary-bolt-500 to-primary-bolt-600 hover:from-primary-bolt-600 hover:to-primary-bolt-700 text-white px-6 py-2.5 rounded-xl font-medium transition-all duration-200 shadow-sm hover:shadow-md whitespace-nowrap"
            >
              Déposer une annonce
            </button>

            {/* Search Bar */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Rechercher sur PassionAuto2Roues.com ... "
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full pl-4 pr-12 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-bolt-500 focus:border-primary-bolt-500 transition-all text-gray-900 placeholder-gray-500"
                />
                <button 
                  onClick={handleSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-primary-bolt-500 transition-colors"
                >
                  <Search className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Right Icons */}
          <div className="hidden lg:flex items-center space-x-6">
            {isAuthenticated ? (
              <div className="flex items-center space-x-6">
                {/* Mes recherches */}
                <button 
                  onClick={() => handleDashboardNavClick('searches')}
                  className="flex flex-col items-center text-gray-600 hover:text-primary-bolt-500 transition-colors group"
                >
                  <Bell className="h-5 w-5 mb-1 group-hover:scale-110 transition-transform" />
                  <span className="text-xs">Mes recherches</span>
                </button>

                {/* Favoris */}
                <button 
                  onClick={() => handleDashboardNavClick('favorites')}
                  className="flex flex-col items-center text-gray-600 hover:text-primary-bolt-500 transition-colors group"
                >
                  <Heart className="h-5 w-5 mb-1 group-hover:scale-110 transition-transform" />
                  <span className="text-xs">Favoris</span>
                </button>

                {/* Messages */}
                <button 
                  onClick={() => handleDashboardNavClick('messages')}
                  className="flex flex-col items-center text-gray-600 hover:text-primary-bolt-500 transition-colors group relative"
                >
                  <MessageCircle className="h-5 w-5 mb-1 group-hover:scale-110 transition-transform" />
                  <span className="text-xs">Messages</span>
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                    3
                  </span>
                </button>

                {/* User Menu */}
                <UserMenu onNavigate={handleNavigate} onDashboardNavigate={handleDashboardNavClick} />
              </div>
            ) : (
              <button
                onClick={() => handleAuthClick('login')}
                className="flex flex-col items-center text-gray-600 hover:text-primary-bolt-500 transition-colors group"
              >
                <User className="h-5 w-5 mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-xs">Se connecter</span>
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-gray-600 hover:text-primary-bolt-500 hover:bg-gray-50 transition-all duration-200"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Categories Menu */}
      <div className="hidden lg:block border-t border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center space-x-8 py-3">
            {categories.map((category, index) => (
              <div key={category.id} className="flex items-center">
                {/* Catégories principales avec dropdown */}
                <div className="relative">
                  <div
                    className={`text-sm transition-all duration-200 relative py-2 cursor-pointer ${
                      activeCategory === category.id
                        ? 'text-primary-bolt-500'
                        : 'text-gray-700 hover:text-primary-bolt-500'
                    }`}
                    onMouseEnter={() => setOpenDropdown(category.id)}
                    onMouseLeave={() => setOpenDropdown(null)}
                  >
                    {category.label}
                    {activeCategory === category.id && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-bolt-500 rounded-full"></div>
                    )}
                  </div>
                  
                  {/* Dropdown Menu */}
                  {categoryStructure[category.id as keyof typeof categoryStructure] && (
                    <div 
                      className={`absolute left-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 transition-all duration-200 z-[110] ${
                        openDropdown === category.id ? 'opacity-100 visible' : 'opacity-0 invisible'
                      }`}
                      onMouseEnter={() => setOpenDropdown(category.id)}
                      onMouseLeave={() => setOpenDropdown(null)}
                    >
                      <div className="py-2">
                        {categoryStructure[category.id as keyof typeof categoryStructure].subcategories.map((subcategory) => (
                          <button
                            key={subcategory.id}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleSubcategoryClick(subcategory.id);
                            }}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-primary-bolt-50 hover:text-primary-bolt-600 transition-colors"
                          >
                            {subcategory.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                {index < categories.length - 1 && (
                  <span className="text-gray-300 text-sm ml-8">•</span>
                )}
              </div>
            ))}
            
            {/* Séparateur avant Accidentés */}
            <span className="text-gray-300 text-sm">•</span>
            
            {/* Bouton Véhicules Accidentés */}
            <button
              onClick={handleDamagedVehiclesClick}
              className="text-gray-800 font-bold text-sm hover:text-gray-900 transition-colors duration-200"
            >
              Accidentés
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-200 shadow-lg">
          <div className="px-4 py-4 space-y-4">
            {/* Mobile Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Rechercher sur Passion Auto2Roues"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full pl-4 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-bolt-500 focus:border-primary-bolt-500 transition-all"
              />
              <button 
                onClick={handleSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-primary-bolt-500 transition-colors"
              >
                <Search className="h-5 w-5" />
              </button>
            </div>

            {/* Mobile Deposit Button */}
            <button
              onClick={handleCreateListingClick}
              className="w-full bg-gradient-to-r from-primary-bolt-500 to-primary-bolt-600 hover:from-primary-bolt-600 hover:to-primary-bolt-700 text-white py-3 px-4 rounded-xl font-medium transition-all duration-200"
            >
              Déposer une annonce
            </button>

            {/* Mobile Categories */}
            <div className="border-t border-gray-200 pt-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Catégories</h3>
              <div className="grid grid-cols-1 gap-3">
                {categories.map((category) => (
                  <div key={category.id}>
                    {category.id === 'conseils' ? (
                      // Conseils reste un simple bouton
                      <button
                        onClick={() => handleCategoryClick(category.id)}
                        className={`w-full text-left py-2 px-3 rounded-xl text-sm transition-all duration-200 ${
                          activeCategory === category.id
                            ? 'bg-primary-bolt-50 text-primary-bolt-500'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {category.label}
                      </button>
                    ) : (
                      // Catégories avec sous-catégories
                      <div>
                        <div className="text-sm font-medium text-gray-900 py-2 px-3">
                          {category.label}
                        </div>
                        <div className="ml-4 space-y-1">
                          {categoryStructure[category.id as keyof typeof categoryStructure]?.subcategories.map((subcategory) => (
                            <button
                              key={subcategory.id}
                              onClick={() => handleSubcategoryClick(subcategory.id)}
                              className="block w-full text-left py-2 px-3 rounded-lg text-sm text-gray-600 hover:bg-primary-bolt-50 hover:text-primary-bolt-600 transition-colors"
                            >
                              {subcategory.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Mobile Bouton Véhicules Accidentés */}
            <div className="border-t border-gray-200 pt-4">
              <button
                onClick={handleDamagedVehiclesClick}
                className="w-full bg-black hover:bg-gray-800 text-orange-500 hover:text-orange-400 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200"
              >
                Accidentés
              </button>
            </div>

            {/* Mobile User Actions */}
            <div className="border-t border-gray-200 pt-4 space-y-2">
              {isAuthenticated ? (
                <div className="space-y-2">
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                    <div className="w-8 h-8 bg-gradient-to-r from-primary-bolt-500 to-primary-bolt-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">
                        {user?.user_metadata?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{user?.user_metadata?.name || 'Utilisateur'}</p>
                      <p className="text-sm text-gray-500">Utilisateur</p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleNavigate('profile')}
                    className="w-full text-left py-3 px-4 text-gray-700 hover:bg-gray-50 rounded-xl transition-colors"
                  >
                    Mon compte
                  </button>
                  
                  <button
                    onClick={() => handleNavigate('my-listings')}
                    className="w-full text-left py-3 px-4 text-gray-700 hover:bg-gray-50 rounded-xl transition-colors"
                  >
                    Mes annonces
                  </button>
                  
                  <button
                    onClick={() => handleDashboardNavClick('messages')}
                    className="w-full text-left py-3 px-4 text-gray-700 hover:bg-gray-50 rounded-xl transition-colors flex items-center justify-between"
                  >
                    <span>Messages</span>
                    <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      3
                    </span>
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <button
                    onClick={() => handleAuthClick('signin')}
                    className="w-full text-left py-3 px-4 text-gray-700 hover:bg-gray-50 rounded-xl transition-colors"
                  >
                    Se connecter
                  </button>
                  <button
                    onClick={() => handleAuthClick('signup')}
                    className="w-full text-left py-3 px-4 bg-primary-bolt-50 text-primary-bolt-500 hover:bg-primary-bolt-100 rounded-xl transition-colors"
                  >
                    S'inscrire
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        defaultTab={authMode}
      />
    </header>
  );
};