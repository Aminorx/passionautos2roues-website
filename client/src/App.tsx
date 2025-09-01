import React, { useState, useCallback } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { AppProvider, useApp } from './contexts/AppContext';
import { Router, Route, useRoute, Switch, useLocation } from 'wouter';
import { AuthProvider } from './contexts/AuthContext';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { VehicleListings } from './components/VehicleListings';
import { VehicleDetail } from './components/VehicleDetail';
import { UnifiedAuthModal } from './components/UnifiedAuthModal';
import { Dashboard } from './components/Dashboard';
import { CreateListingForm } from './components/CreateListingForm';
import { DraggableModal } from './components/DraggableModal';
import { Conseils } from './components/Conseils';
import { SearchResults } from './components/SearchResults';
import { Footer } from './components/Footer';
import { AboutPage } from './pages/AboutPage';
import { TermsPage } from './pages/TermsPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { LegalPage } from './pages/LegalPage';
import { HelpPage } from './pages/HelpPage';
import { SafetyTipsPage } from './pages/SafetyTipsPage';
import { AdminDashboard } from './components/AdminDashboard';
import { AdminDashboardClean } from './components/AdminDashboardClean';
import { AdminLogin } from './components/AdminLogin';
import { AdminTest } from './components/AdminTest';
import { Messages } from './pages/Messages';
import { SearchPage } from './pages/SearchPage';
import ProShop from './pages/ProShop';
import ProCustomization from './pages/ProCustomization';
import SubscriptionPurchase from './pages/SubscriptionPurchase';
import { AuthCallback } from './pages/AuthCallback';
import { AccountConversion } from './pages/AccountConversion';
// import CreateProAccount from './pages/CreateProAccount';

function AppContent() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showCreateListingModal, setShowCreateListingModal] = useState(false);
  const [dashboardTab, setDashboardTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const { selectedVehicle, setSelectedVehicle, setSearchFilters } = useApp();
  
  // Utiliser useLocation pour obtenir et modifier l'URL actuelle
  const [location, setLocation] = useLocation();
  
  // Fonction pour convertir l'URL en format "currentView" pour la compatibilité
  const getCurrentView = useCallback(() => {
    if (location === '/') return 'home';
    if (location.startsWith('/pro/')) return 'pro-shop';
    return location.slice(1); // Enlever le "/" au début
  }, [location]);
  
  // Fonction pour convertir "currentView" en URL
  const setCurrentView = useCallback((view: string) => {
    setLocation(view === 'home' ? '/' : `/${view}`);
  }, [setLocation]);
  
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setLocation('/search');
  }, [setLocation]);

  // Auto-sélection d'un véhicule depuis les paramètres URL (pour l'admin)
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const vehicleId = urlParams.get('vehicle');
    
    if (vehicleId && !selectedVehicle) {
      // Rechercher le véhicule par ID et le sélectionner
      fetch('/api/vehicles')
        .then(res => res.json())
        .then(vehicles => {
          const vehicle = vehicles.find((v: any) => v.id === vehicleId);
          if (vehicle) {
            setSelectedVehicle(vehicle);
            console.log(`🎯 Véhicule auto-sélectionné depuis URL:`, vehicle.title);
          }
        })
        .catch(err => console.error('❌ Erreur auto-sélection véhicule:', err));
    }
  }, [location, selectedVehicle, setSelectedVehicle]);

  // Scroll to top when location changes
  React.useEffect(() => {
    if (!selectedVehicle) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [location, selectedVehicle]);

  const handleBack = useCallback(() => {
    setSelectedVehicle(null);
  }, [setSelectedVehicle]);

  const handleBreadcrumbNavigation = useCallback((path: string) => {
    setSelectedVehicle(null); // Fermer le détail du véhicule
    
    // Navigation basée sur le chemin du breadcrumb
    if (path === 'home') {
      setLocation('/');
    } else if (path.includes('/')) {
      // Navigation vers une marque spécifique (ex: "car/bmw")
      const [category, brand] = path.split('/');
      setSearchFilters({ category, brand });
      setLocation('/listings');
    } else {
      // Navigation vers une catégorie
      const categoryMap: { [key: string]: string } = {
        'car-utility': 'car',
        'moto-quad': 'motorcycle',
        'nautisme-sport': 'boat',
        'services': 'services',
        'spare-parts': 'parts',
        'motorcycle': 'motorcycle',
        'scooter': 'scooter',
        'quad': 'quad',
        'boat': 'boat',
        'jetski': 'jetski',
        'aircraft': 'aircraft'
      };
      
      const filterCategory = categoryMap[path];
      if (filterCategory) {
        setSearchFilters({ category: filterCategory });
        setLocation('/listings');
      } else {
        setLocation('/');
      }
    }
  }, [setSelectedVehicle, setLocation, setSearchFilters]);

  // Nous n'utilisons plus renderContent(), car nous utilisons un système de routes
  const handleCreateListing = useCallback(() => {
    setShowCreateListingModal(true);
  }, []);

  // Vérifier si on est sur une route admin
  const isAdminRoute = location.startsWith('/admin');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Masquer Header pour les routes admin */}
      {!isAdminRoute && (
        <Header
          currentView={getCurrentView()}
          setCurrentView={setCurrentView}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
          setDashboardTab={setDashboardTab}
          onSearch={handleSearch}
        />
      )}
      
      {selectedVehicle ? (
        <VehicleDetail
          vehicle={selectedVehicle}
          onBack={handleBack}
          onVehicleSelect={setSelectedVehicle}
          onNavigate={handleBreadcrumbNavigation}
          setCurrentView={setCurrentView}
        />
      ) : (
        <>
          {/* Utiliser des routes au lieu d'un switch sur currentView */}
          <Switch>
            <Route path="/pro/:shopId">
              {(params) => <ProShop />}
            </Route>
            <Route path="/listings">
              <VehicleListings />
            </Route>
            <Route path="/dashboard">
              <Dashboard 
                initialTab={dashboardTab} 
                onCreateListing={() => setShowCreateListingModal(true)}
                onRedirectHome={() => setLocation('/')}
                onRedirectToSearch={() => setLocation('/search')}
                setSearchFilters={setSearchFilters}
                setCurrentView={setCurrentView}
              />
            </Route>
            <Route path="/create-listing">
              {() => {
                setShowCreateListingModal(true);
                return <Hero setCurrentView={setCurrentView} />;
              }}
            </Route>
            <Route path="/conseils">
              <Conseils />
            </Route>
            <Route path="/about">
              <AboutPage 
                onBack={() => setLocation('/')} 
                setCurrentView={setCurrentView}
              />
            </Route>
            <Route path="/terms">
              <TermsPage 
                onBack={() => setLocation('/')} 
                setCurrentView={setCurrentView}
              />
            </Route>
            <Route path="/privacy">
              <PrivacyPage 
                onBack={() => setLocation('/')} 
                setCurrentView={setCurrentView}
              />
            </Route>
            <Route path="/legal">
              <LegalPage 
                onBack={() => setLocation('/')} 
                setCurrentView={setCurrentView}
              />
            </Route>
            <Route path="/help">
              <HelpPage 
                onBack={() => setLocation('/')} 
                setCurrentView={setCurrentView}
              />
            </Route>
            <Route path="/safety">
              <SafetyTipsPage 
                onBack={() => setLocation('/')} 
                setCurrentView={setCurrentView}
              />
            </Route>
            <Route path="/search">
              <SearchPage />
            </Route>
            <Route path="/search-old">
              <SearchResults 
                searchQuery={searchQuery} 
                onBack={() => setLocation('/')} 
                onVehicleSelect={setSelectedVehicle}
              />
            </Route>
            <Route path="/messages">
              <Messages />
            </Route>
            <Route path="/admin">
              {() => {
                const isAdminAuth = localStorage.getItem('admin_authenticated') === 'true';
                return isAdminAuth ? 
                  <AdminDashboardClean onBack={() => setLocation('/')} /> : 
                  <AdminLogin onLoginSuccess={() => setLocation('/admin')} onBack={() => setLocation('/')} />;
              }}
            </Route>
            <Route path="/admin-login">
              <AdminLogin 
                onLoginSuccess={() => setLocation('/admin')} 
                onBack={() => setLocation('/')} 
              />
            </Route>
            <Route path="/admin-test">
              <AdminTest />
            </Route>
            <Route path="/create-pro-account">
              <div className="p-8 text-center">
                <h2 className="text-2xl font-bold">Compte Professionnel</h2>
                <p className="mt-4">Page de création de compte professionnel en développement...</p>
              </div>
            </Route>
            <Route path="/auth-callback">
              <AuthCallback />
            </Route>
            <Route path="/account-conversion">
              <AccountConversion onBack={() => setLocation('/dashboard')} />
            </Route>
            <Route path="/pro-customization">
              <ProCustomization onBack={() => setLocation('/dashboard')} />
            </Route>
            <Route path="/subscription-purchase">
              <SubscriptionPurchase onBack={() => setLocation('/dashboard')} />
            </Route>
            <Route path="/">
              <Hero setCurrentView={setCurrentView} />
            </Route>
          </Switch>
          {/* Masquer Footer pour les routes admin */}
          {!isAdminRoute && <Footer setCurrentView={setCurrentView} />}
        </>
      )}
      <UnifiedAuthModal />
      
      {/* Modal de création d'annonce déplaçable */}
      <DraggableModal
        isOpen={showCreateListingModal}
        onClose={() => setShowCreateListingModal(false)}
        title="Déposer une annonce"
      >
        <CreateListingForm 
          onSuccess={() => {
            setShowCreateListingModal(false);
            setLocation('/dashboard');
            setDashboardTab('listings');
          }}
        />
      </DraggableModal>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppProvider>
          <Router>
            {/* Suppression de la route spécifique /pro/:shopId qui cause la duplication */}
            {/* Ne garder qu'une seule route qui englobe tout */}
            <Route component={AppContent} />
          </Router>
        </AppProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;