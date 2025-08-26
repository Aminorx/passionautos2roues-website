import React, { useState, useCallback } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { AppProvider, useApp } from './contexts/AppContext';
import { Router, Route, useRoute } from 'wouter';
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
  const [currentView, setCurrentView] = useState('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showCreateListingModal, setShowCreateListingModal] = useState(false);
  const [dashboardTab, setDashboardTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const { selectedVehicle, setSelectedVehicle, setSearchFilters } = useApp();
  
  // Check if we're on a pro shop route
  const [match] = useRoute('/pro/:shopId');
  if (match) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <Header
          currentView="pro-shop"
          setCurrentView={setCurrentView}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
          setDashboardTab={setDashboardTab}
          onSearch={handleSearch}
        />
        <ProShop />
      </div>
    );
  }

  // Scroll to top when view changes
  React.useEffect(() => {
    if (!selectedVehicle) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentView, selectedVehicle]);

  const handleBack = useCallback(() => {
    setSelectedVehicle(null);
  }, [setSelectedVehicle]);

  const handleBreadcrumbNavigation = useCallback((path: string) => {
    setSelectedVehicle(null); // Fermer le détail du véhicule
    
    // Navigation basée sur le chemin du breadcrumb
    if (path === 'home') {
      setCurrentView('home');
    } else if (path.includes('/')) {
      // Navigation vers une marque spécifique (ex: "car/bmw")
      const [category, brand] = path.split('/');
      setSearchFilters({ category, brand });
      setCurrentView('listings');
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
        setCurrentView('listings');
      } else {
        setCurrentView('home');
      }
    }
  }, [setSelectedVehicle, setCurrentView, setSearchFilters]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setCurrentView('search');
  }, []);

  const renderContent = () => {
    switch (currentView) {
      case 'listings':
        return <VehicleListings />;
      case 'dashboard':
        return <Dashboard 
          initialTab={dashboardTab} 
          onCreateListing={() => setShowCreateListingModal(true)}
          onRedirectHome={() => setCurrentView('home')}
          onRedirectToSearch={() => setCurrentView('search')}
          setSearchFilters={setSearchFilters}
          setCurrentView={setCurrentView}
        />;
      case 'create-listing':
        setShowCreateListingModal(true);
        setCurrentView('home');
        return <Hero setCurrentView={setCurrentView} />;
      case 'conseils':
        return <Conseils />;
      case 'about':
        return <AboutPage onBack={() => setCurrentView('home')} setCurrentView={setCurrentView} />;
      case 'terms':
        return <TermsPage onBack={() => setCurrentView('home')} setCurrentView={setCurrentView} />;
      case 'privacy':
        return <PrivacyPage onBack={() => setCurrentView('home')} setCurrentView={setCurrentView} />;
      case 'legal':
        return <LegalPage onBack={() => setCurrentView('home')} setCurrentView={setCurrentView} />;
      case 'help':
        return <HelpPage onBack={() => setCurrentView('home')} setCurrentView={setCurrentView} />;
      case 'safety':
        return <SafetyTipsPage onBack={() => setCurrentView('home')} setCurrentView={setCurrentView} />;
      case 'search':
        return <SearchPage />;
      case 'search-old':
        return <SearchResults 
          searchQuery={searchQuery} 
          onBack={() => setCurrentView('home')} 
          onVehicleSelect={setSelectedVehicle}
        />;
      case 'messages':
        return <Messages />;
      case 'admin':
        // Vérifier si l'admin est authentifié
        const isAdminAuth = localStorage.getItem('admin_authenticated') === 'true';
        if (isAdminAuth) {
          return <AdminDashboardClean onBack={() => setCurrentView('home')} />;
        } else {
          return <AdminLogin 
            onLoginSuccess={() => setCurrentView('admin')} 
            onBack={() => setCurrentView('home')} 
          />;
        }
      case 'admin-login':
        return <AdminLogin 
          onLoginSuccess={() => setCurrentView('admin')} 
          onBack={() => setCurrentView('home')} 
        />;
      case 'admin-test':
        return <AdminTest />;
      case 'create-pro-account':
        return <div className="p-8 text-center">
          <h2 className="text-2xl font-bold">Compte Professionnel</h2>
          <p className="mt-4">Page de création de compte professionnel en développement...</p>
        </div>;
      case 'auth-callback':
        return <AuthCallback />;
      case 'account-conversion':
        return <AccountConversion onBack={() => setCurrentView('dashboard')} />;
      case 'pro-shop':
        return <ProShop />;
      case 'pro-customization':
        return <ProCustomization onBack={() => setCurrentView('dashboard')} />;
      case 'subscription-purchase':
        return <SubscriptionPurchase onBack={() => setCurrentView('dashboard')} />;
      default:
        return <Hero setCurrentView={setCurrentView} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <Header
        currentView={currentView}
        setCurrentView={setCurrentView}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        setDashboardTab={setDashboardTab}
        onSearch={handleSearch}
      />
      
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
          {renderContent()}
          <Footer setCurrentView={setCurrentView} />
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
            setCurrentView('dashboard');
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
            <Route path="/pro/:shopId" component={AppContent} />
            <Route component={AppContent} />
          </Router>
        </AppProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;