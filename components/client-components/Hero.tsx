import React, { useState, useEffect, useMemo } from 'react';
import { Search, MapPin, Filter, Car, Bike, Truck, Wrench, Star, Crown, Eye, Heart, ChevronRight, Smartphone, Store, Users, TrendingUp, Plus, MoreHorizontal, ChevronLeft } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { CategorySection } from './CategorySection';
import voituresImage from '@assets/voiture-2_1752056602701.png';
import motosImage from '@assets/motos-scooters_1752057126122.png';
import entretienImage from '@assets/services-entretien_1752056958533.png';
import piecesImage from '@assets/pieces-detachees_1752056832597.png';
import bateauImage from '@assets/bateau_1752249742336.png';
import appMobileImage from '@assets/mockups-mobile_1752062665109.webp';
import appStoreIcon from '@assets/AppStore_1752058292770.png';
import googlePlayIcon from '@assets/googlePlay_1752058332269.png';
import brandIcon from '@assets/Brand_1752260033631.png';

interface HeroProps {
  setCurrentView: (view: string) => void;
}

export const Hero: React.FC<HeroProps> = ({ setCurrentView }) => {
  const { setSearchFilters, currentUser, setSelectedVehicle, setShowAuthModal, setAuthMode, vehicles } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [location, setLocation] = useState('');
  const [currentAdIndex, setCurrentAdIndex] = useState(0);

  const handleCategoryClick = (category: string) => {
    setSearchFilters({ category });
    setCurrentView('listings');
  };

  const handleViewAllCategory = (category: string) => {
    setSearchFilters({ category });
    setCurrentView('listings');
  };

  const handleViewDamagedVehicles = () => {
    setSearchFilters({ condition: 'damaged' });
    setCurrentView('listings');
  };

  const handleViewSearchListings = () => {
    setSearchFilters({ listing_type: 'search' });
    setCurrentView('listings');
  };

  const handleVehicleClick = (vehicle: any) => {
    setSelectedVehicle(vehicle);
  };

  const handleCreateListing = () => {
    if (!currentUser) {
      setAuthMode('login');
      setShowAuthModal(true);
    } else {
      setCurrentView('create-listing');
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  // Memoized category mapping to avoid recreating on each render
  const categoryMap = useMemo(() => ({
    'voiture-utilitaire': ['voiture', 'utilitaire', 'caravane', 'remorque'],
    'moto-scooter-quad': ['moto', 'scooter', 'quad'],
    'nautisme-sport-aerien': ['bateau', 'jetski', 'aerien'],
    'services': ['reparation', 'remorquage', 'entretien', 'autre-service'],
    'pieces': ['piece-voiture', 'piece-moto', 'autre-piece']
  }), []);

  // Get vehicles by category (using main categories) - memoized with limit
  const getVehiclesByCategory = useMemo(() => {
    return (mainCategory: string) => {
      const subcategories = categoryMap[mainCategory as keyof typeof categoryMap] || [];
      return vehicles
        .filter(vehicle => subcategories.includes(vehicle.category))
        .slice(0, 6); // Limit to 6 per category for faster loading
    };
  }, [categoryMap, vehicles]);

  const mainCategories = [
    {
      id: 'voiture-utilitaire',
      name: 'Voitures - Utilitaires',
      description: 'Berlines, SUV, citadines, sportives, Fourgons, camions, véhicules pro',
      image: voituresImage,
      color: 'from-[#0CBFDE] to-[#0AA5C7]'
    },
    {
      id: 'moto-scooter-quad',
      name: 'Motos, Scooters, Quads',
      description: 'Tous types de motos, scooters et quads',
      image: motosImage,
      color: 'from-[#0CBFDE] to-[#0AA5C7]'
    },
    {
      id: 'nautisme-sport-aerien',
      name: 'Nautisme, Sport et Plein air',
      description: 'Bateaux, jetskis et équipements de sport',
      image: bateauImage,
      color: 'from-[#0CBFDE] to-[#0AA5C7]'
    },
    {
      id: 'pieces',
      name: 'Pièces détachées',
      description: 'Pièces auto, moto et accessoires',
      image: piecesImage,
      color: 'from-[#0CBFDE] to-[#0AA5C7]'
    },
  ];

  // Memoized vehicle listings with reduced counts for faster loading - NOW USING SUPABASE DATA
  const latestCarListings = useMemo(() => {
    return vehicles
      .filter(vehicle => ['voiture', 'utilitaire', 'caravane', 'remorque'].includes(vehicle.category) && vehicle.condition === 'used')
      .sort((a, b) => {
        const dateA = new Date(a.createdAt || a.created_at || 0);
        const dateB = new Date(b.createdAt || b.created_at || 0);
        return dateB.getTime() - dateA.getTime();
      })
      .slice(0, 6); // Reduced from 8 to 6 for faster loading
  }, [vehicles]);

  const latestMotorcycleListings = useMemo(() => {
    return vehicles
      .filter(vehicle => ['moto', 'scooter', 'quad'].includes(vehicle.category) && vehicle.condition === 'used')
      .sort((a, b) => {
        const dateA = new Date(a.createdAt || a.created_at || 0);
        const dateB = new Date(b.createdAt || b.created_at || 0);
        return dateB.getTime() - dateA.getTime();
      })
      .slice(0, 6); // Reduced from 8 to 6 for faster loading
  }, [vehicles]);

  const latestDamagedVehicles = useMemo(() => {
    return vehicles
      .filter(vehicle => vehicle.condition === 'damaged')
      .sort((a, b) => {
        const dateA = new Date(a.createdAt || a.created_at || 0);
        const dateB = new Date(b.createdAt || b.created_at || 0);
        return dateB.getTime() - dateA.getTime();
      })
      .slice(0, 4); // Reduced from 8 to 4 for faster loading
  }, [vehicles]);

  /*
  const latestSearchRequests = useMemo(() => {
    return vehicles
      .filter(vehicle => vehicle.title.startsWith('RECHERCHE') || vehicle.title.includes('RECHERCHE'))
      .sort((a, b) => {
        const dateA = new Date(a.createdAt || a.created_at || 0);
        const dateB = new Date(b.createdAt || b.created_at || 0);
        return dateB.getTime() - dateA.getTime();
      })
      .slice(0, 4); // Reduced from 8 to 4 for faster loading
  }, [vehicles]);
  */

  const latestSearchRequests = useMemo(() => {
    return vehicles
      .filter(vehicle => vehicle.listing_type === 'search' || vehicle.listingType === 'search')
      .sort((a, b) => {
        const dateA = new Date(a.createdAt || a.created_at || 0);
        const dateB = new Date(b.createdAt || b.created_at || 0);
        return dateB.getTime() - dateA.getTime();
      })
      .slice(0, 4); // Toujours limité à 4
  }, [vehicles]);

  const latestNautismeListings = useMemo(() => {
    return vehicles
      .filter(vehicle => ['bateau', 'jetski', 'aerien'].includes(vehicle.category) && vehicle.condition === 'used')
      .sort((a, b) => {
        const dateA = new Date(a.createdAt || a.created_at || 0);
        const dateB = new Date(b.createdAt || b.created_at || 0);
        return dateB.getTime() - dateA.getTime();
      })
      .slice(0, 4); // Reduced from 8 to 4 for faster loading
  }, [vehicles]);

  // Category sections configuration - memoized
  const categorySections = useMemo(() => [
    {
      id: 'voiture-utilitaire',
      title: 'Voitures et Utilitaires d\'occasion',
      vehicles: getVehiclesByCategory('voiture-utilitaire')
    },
    {
      id: 'moto-scooter-quad',
      title: 'Motos, Scooters et Quads',
      vehicles: latestMotorcycleListings
    },
    {
      id: 'nautisme-sport-aerien',
      title: 'Nautisme, Sport et Plein air',
      vehicles: latestNautismeListings
    },
    {
      id: 'pieces',
      title: 'Pièces détachées',
      vehicles: getVehiclesByCategory('pieces')
    }
  ], [getVehiclesByCategory, latestMotorcycleListings, latestNautismeListings]);

  // Advertising banners data
  const advertisingBanners = [
    {
      id: 1,
      type: 'garage',
      title: 'GARAGE MARTIN',
      subtitle: 'Depuis 1985 • Paris 11ème',
      mainOffer: '29€/mois',
      offerTitle: 'FORFAIT VIDANGE',
      features: [
        '✓ Huile moteur premium',
        '✓ Filtre à huile neuf',
        '✓ Contrôle 20 points',
        '✓ Sans engagement'
      ],
      phone: '01 43 55 67 89',
      address: '123 Avenue de la République, 75011 Paris • Métro République',
      rating: '4.9/5 (2,847 avis)',
      ctaText: '📞 RÉSERVER MAINTENANT',
      promoText: 'PROMO LIMITÉE',
      tickerItems: [
        'SPÉCIALISTE TOUTES MARQUES',
        '⚡ INTERVENTION RAPIDE',
        '🛡️ GARANTIE PIÈCES & MAIN D\'ŒUVRE',
        '💳 PAIEMENT EN 3X SANS FRAIS',
        '🏆 GARAGE AGRÉÉ PRÉFECTURE'
      ],
      gradient: 'from-red-600 via-red-700 to-red-800',
      icon: Wrench,
      iconColor: 'text-red-600'
    },
    {
      id: 2,
      type: 'tire',
      title: 'PNEUS EXPRESS',
      subtitle: 'Expert pneumatiques • Toute la France',
      mainOffer: '2+2',
      offerTitle: 'PNEUS OFFERTS',
      offerSubtitle: '2 achetés = 2 offerts',
      features: [
        '✓ Montage gratuit inclus',
        '✓ Équilibrage offert',
        '✓ Garantie 2 ans',
        '✓ Livraison 24h'
      ],
      phone: '0800 123 456',
      address: 'Plus de 500 centres en France • Trouvez le vôtre',
      rating: '4.8/5 (15,234 avis)',
      ctaText: '🔍 TROUVER MON CENTRE',
      promoText: 'OFFRE LIMITÉE',
      tickerItems: [
        '🏁 TOUTES MARQUES DISPONIBLES',
        '⚡ MONTAGE EN 30 MINUTES',
        '🛡️ GARANTIE CONSTRUCTEUR',
        '💳 PAIEMENT 4X SANS FRAIS',
        '🚚 LIVRAISON GRATUITE',
        '🏆 N°1 DU PNEU EN FRANCE'
      ],
      gradient: 'from-slate-600 via-slate-700 to-slate-800',
      icon: Car,
      iconColor: 'text-slate-600'
    }
  ];

  // Auto-rotate carousel every 8 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentAdIndex((prev) => (prev + 1) % advertisingBanners.length);
    }, 8000);

    return () => clearInterval(interval);
  }, [advertisingBanners.length]);

  const nextAd = () => {
    setCurrentAdIndex((prev) => (prev + 1) % advertisingBanners.length);
  };

  const prevAd = () => {
    setCurrentAdIndex((prev) => (prev - 1 + advertisingBanners.length) % advertisingBanners.length);
  };

  const currentBanner = advertisingBanners[currentAdIndex];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section - Now Boxed */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-primary-bolt-500 to-primary-bolt-600 rounded-3xl p-8 lg:p-12 relative overflow-hidden shadow-2xl">
            {/* Background decorative elements */}
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24"></div>
            
            <div className="relative z-10">
              <div className="text-center text-white mb-12">
                <h1 className="text-4xl lg:text-5xl font-bold mb-6">
                  Vendre avec Passion Auto2Roues
                </h1>
                <p className="text-xl mb-8 max-w-3xl mx-auto">
                  Publiez votre annonce gratuitement et vendez rapidement grâce à notre audience de plus de 45,000 acheteurs qualifiés.
                </p>
                
                <button
                  onClick={handleCreateListing}
                  className="bg-white text-primary-bolt-500 hover:bg-gray-50 px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-2 mx-auto mb-12"
                >
                  <Plus className="h-5 w-5" />
                  <span>Déposer une annonce</span>
                </button>
                
                {/* Three feature boxes */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                    <div className="text-4xl mb-4">🚀</div>
                    <h3 className="text-lg font-bold mb-2">Publication gratuite</h3>
                    <p className="text-sm text-cyan-100">Publiez vos annonces sans frais et atteignez des milliers d'acheteurs</p>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                    <div className="text-4xl mb-4">⚡</div>
                    <h3 className="text-lg font-bold mb-2">Vente rapide</h3>
                    <p className="text-sm text-cyan-100">85% de nos annonces trouvent un acheteur en moins de 30 jours</p>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                    <div className="text-4xl mb-4">🔒</div>
                    <h3 className="text-lg font-bold mb-2">Sécurisé</h3>
                    <p className="text-sm text-cyan-100">Transactions sécurisées et support client dédié</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Véhicules Section - Redesigned to match the image */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {mainCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryClick(category.id)}
                className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden p-8 text-center hover:scale-105 transform relative"
              >
                {/* Category Image - White background without shadow */}
                <div className="w-24 h-24 mx-auto mb-6 flex items-center justify-center relative bg-white rounded-2xl">
                  <img 
                    src={category.image} 
                    alt={category.name}
                    className="w-16 h-16 object-contain group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                
                {/* Category Title */}
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary-bolt-500 transition-colors">
                  {category.name}
                </h3>
                
                {/* Category Description */}
                <p className="text-sm text-gray-600 leading-relaxed">
                  {category.description}
                </p>
                
                {/* Hover Effect Border */}
                <div className="absolute inset-0 border-2 border-transparent group-hover:border-primary-bolt-500 rounded-2xl transition-all duration-300"></div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Advertising Carousel */}
      <section className="py-8 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative">
            {/* Carousel Container */}
            <div className={`relative bg-gradient-to-r ${currentBanner.gradient} rounded-2xl overflow-hidden shadow-2xl transition-all duration-500`}>
              {/* Animated background elements */}
              <div className="absolute inset-0 bg-black/20"></div>
              <div className="absolute top-0 left-0 w-full h-full">
                <div className="absolute top-4 left-4 w-8 h-8 bg-yellow-400 rounded-full animate-pulse"></div>
                <div className="absolute top-8 right-8 w-6 h-6 bg-white/30 rounded-full animate-bounce"></div>
                <div className="absolute bottom-6 left-12 w-4 h-4 bg-yellow-300 rounded-full animate-ping"></div>
                <div className="absolute bottom-4 right-16 w-5 h-5 bg-white/40 rounded-full animate-pulse delay-300"></div>
              </div>
              
              {/* Sliding banner */}
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-yellow-400 via-white to-yellow-400 animate-pulse"></div>
              
              <div className="relative z-10 p-8 lg:p-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
                  {/* Logo and Brand */}
                  <div className="text-center lg:text-left">
                    <div className="inline-flex items-center space-x-3 mb-4">
                      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg">
                        <currentBanner.icon className={`h-8 w-8 ${currentBanner.iconColor}`} />
                      </div>
                      <div className="text-white">
                        <h3 className="text-2xl font-bold">{currentBanner.title}</h3>
                        <p className={`${currentBanner.type === 'garage' ? 'text-red-200' : 'text-slate-200'} text-sm`}>
                          {currentBanner.subtitle}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-center lg:justify-start space-x-1 text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-current" />
                      ))}
                      <span className="text-white text-sm ml-2">{currentBanner.rating}</span>
                    </div>
                  </div>

                  {/* Main Offer */}
                  <div className="text-center">
                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 relative">
                      {/* Pulsing effect */}
                      <div className="absolute inset-0 bg-yellow-400/20 rounded-2xl animate-pulse"></div>
                      
                      <div className="relative z-10">
                        <div className="text-yellow-400 text-sm font-bold mb-2 uppercase tracking-wide">
                          🔥 Offre Spéciale 🔥
                        </div>
                        
                        {currentBanner.type === 'garage' ? (
                          <div>
                            <h2 className="text-4xl lg:text-5xl font-black text-white mb-2">
                              {currentBanner.mainOffer}<span className="text-xl">/mois</span>
                            </h2>
                            <div className="text-xl font-bold text-yellow-300 mb-3">
                              {currentBanner.offerTitle}
                            </div>
                          </div>
                        ) : (
                          <div>
                            <h2 className="text-4xl lg:text-5xl font-black text-white mb-2">
                              {currentBanner.mainOffer}
                            </h2>
                            <div className="text-xl font-bold text-yellow-300 mb-1">
                              {currentBanner.offerTitle}
                            </div>
                            <div className="text-lg font-semibold text-white mb-3">
                              {currentBanner.offerSubtitle}
                            </div>
                          </div>
                        )}
                        
                        <div className="text-white text-sm">
                          {currentBanner.features.map((feature, index) => (
                            <div key={index}>{feature}</div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Call to Action */}
                  <div className="text-center lg:text-right">
                    <div className="space-y-4">
                      <button className="w-full lg:w-auto bg-yellow-400 hover:bg-yellow-300 text-gray-800 font-black py-4 px-8 rounded-xl text-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 animate-bounce">
                        {currentBanner.ctaText}
                      </button>
                      
                      <div className="text-white">
                        <div className="text-2xl font-bold">{currentBanner.phone}</div>
                        <div className={`${currentBanner.type === 'garage' ? 'text-red-200' : 'text-slate-200'} text-sm`}>
                          {currentBanner.type === 'garage' ? 'Ouvert 7j/7 • 8h-19h' : 'Service client 24h/7j'}
                        </div>
                      </div>
                      
                      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                        <div className="text-yellow-300 text-xs font-bold mb-1">{currentBanner.promoText}</div>
                        <div className="text-white text-sm">
                          📍 {currentBanner.address}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Bottom ticker */}
                <div className="mt-8 pt-6 border-t border-white/20">
                  <div className="overflow-hidden">
                    <div className="animate-marquee whitespace-nowrap text-white text-sm">
                      {currentBanner.tickerItems.map((item, index) => (
                        <span key={index} className="mx-8">{item}</span>
                      ))}
                      {/* Duplicate for seamless loop */}
                      {currentBanner.tickerItems.map((item, index) => (
                        <span key={`dup-${index}`} className="mx-8">{item}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Carousel Navigation */}
            <button
              onClick={prevAd}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white p-3 rounded-full transition-all duration-200 z-20"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            
            <button
              onClick={nextAd}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white p-3 rounded-full transition-all duration-200 z-20"
            >
              <ChevronRight className="h-6 w-6" />
            </button>

            {/* Carousel Indicators */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
              {advertisingBanners.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentAdIndex(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-200 ${
                    index === currentAdIndex 
                      ? 'bg-white' 
                      : 'bg-white/50 hover:bg-white/70'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Category Sections */}
      <div className="bg-gray-50">
        {categorySections.map((section) => (
          <CategorySection
            key={section.id}
            title={section.title}
            vehicles={section.vehicles}
            onViewAll={() => handleViewAllCategory(section.id)}
            onVehicleClick={handleVehicleClick}
          />
        ))}
      </div>

      {/* Professional Space CTA - Now Boxed */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-primary-bolt-500 to-primary-bolt-600 rounded-3xl p-8 lg:p-12 relative overflow-hidden shadow-2xl">
            {/* Background decorative elements */}
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24"></div>
            
            <div className="relative z-10">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center text-white">
                <div>
                  <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
                    <Store className="h-5 w-5" />
                    <span className="font-semibold">Espace Professionnel</span>
                  </div>
                  <h2 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight">
                    Développez votre activité avec Passion Auto2Roues
                  </h2>
                  <p className="text-xl mb-8 leading-relaxed">
                    Rejoignez plus de 2,500 professionnels qui font confiance à notre plateforme 
                    pour développer leur business automobile.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="flex items-center space-x-3">
                      <div className="bg-white/20 p-2 rounded-xl">
                        <TrendingUp className="h-6 w-6" />
                      </div>
                      <div>
                        <div className="font-bold text-lg">Visibilité maximale</div>
                        <div className="text-cyan-200 text-sm">Annonces illimitées</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="bg-white/20 p-2 rounded-xl">
                        <Users className="h-6 w-6" />
                      </div>
                      <div>
                        <div className="font-bold text-lg">45,000+ clients</div>
                        <div className="text-cyan-200 text-sm">Audience qualifiée</div>
                      </div>
                    </div>
                  </div>

                  <button className="bg-white text-primary-bolt-500 hover:bg-gray-50 px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-200">
                    Ouvrir ma boutique pro
                  </button>
                </div>

                <div className="relative">
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                    <h3 className="text-2xl font-bold mb-6">Avantages Pro</h3>
                    <ul className="space-y-4 text-primary-bolt-100">
                      <li className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                        <span>Annonces illimitées et mises en avant</span>
                      </li>
                      <li className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                        <span>Statistiques détaillées et analytics</span>
                      </li>
                      <li className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                        <span>Badge "Professionnel vérifié"</span>
                      </li>
                      <li className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                        <span>Support client prioritaire</span>
                      </li>
                      <li className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                        <span>Outils de gestion avancés</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Damaged Vehicles Section */}
      <div className="bg-gray-50">
        <CategorySection
          key="damaged"
          title="Véhicules accidentés"
          vehicles={latestDamagedVehicles}
          onViewAll={handleViewDamagedVehicles}
          onVehicleClick={handleVehicleClick}
        />
      </div>

      {/* Latest Search Requests Section */}
      <div className="bg-gray-50">
        <CategorySection
          key="latest-searches"
          title="Annonces de recherches"
          vehicles={latestSearchRequests}
          onViewAll={handleViewSearchListings}
          onVehicleClick={handleVehicleClick}
        />
      </div>

      {/* Mobile App Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center space-x-2 bg-green-100 rounded-full px-4 py-2 mb-6">
                <Smartphone className="h-5 w-5 text-green-700" />
                <span className="font-semibold text-green-700">Disponible maintenant</span>
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
                L'application mobile Passion Auto2Roues
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Achetez et vendez vos véhicules directement depuis votre smartphone. 
                Téléchargez l'application dès maintenant !
              </p>

              {/* App Store Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="bg-black text-white px-6 py-3 rounded-xl flex items-center space-x-3 hover:bg-gray-800 transition-colors">
                  <img src={appStoreIcon} alt="App Store" className="w-6 h-6" />
                  <div className="text-left">
                    <div className="text-xs">Télécharger sur</div>
                    <div className="text-lg font-semibold">App Store</div>
                  </div>
                </button>
                
                <button className="bg-black text-white px-6 py-3 rounded-xl flex items-center space-x-3 hover:bg-gray-800 transition-colors">
                  <img src={googlePlayIcon} alt="Google Play" className="w-6 h-6" />
                  <div className="text-left">
                    <div className="text-xs">Disponible sur</div>
                    <div className="text-lg font-semibold">Google Play</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Mobile App Image */}
            <div className="text-center">
              <div className="relative mx-auto max-w-lg">
                <img 
                  src={appMobileImage} 
                  alt="Application mobile Passion Auto2Roues"
                  className="w-full h-auto object-contain mx-auto"
                  style={{ backgroundColor: 'transparent' }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>


    </div>
  );
};