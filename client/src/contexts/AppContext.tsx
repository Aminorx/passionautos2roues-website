import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Vehicle, Message, SearchFilters } from '../types';

interface AppContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  vehicles: Vehicle[];
  setVehicles: (vehicles: Vehicle[]) => void;
  selectedVehicle: Vehicle | null;
  setSelectedVehicle: (vehicle: Vehicle | null) => void;
  searchFilters: SearchFilters;
  setSearchFilters: (filters: SearchFilters) => void;
  filteredVehicles: Vehicle[];
  messages: Message[];
  setMessages: (messages: Message[]) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  showAuthModal: boolean;
  setShowAuthModal: (show: boolean) => void;
  authMode: 'login' | 'register';
  setAuthMode: (mode: 'login' | 'register') => void;
  refreshVehicles: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

interface AppProviderProps {
  children: ReactNode;
}

// Fetch vehicles from API
const fetchVehicles = async (): Promise<Vehicle[]> => {
  try {
    console.log('🔄 Chargement des données depuis Supabase...');
    // Add timestamp to prevent caching
    const timestamp = new Date().getTime();
    const response = await fetch(`/api/vehicles?t=${timestamp}`, {
      cache: 'no-cache',
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const vehicles = await response.json();
    console.log('✅ CONFIRMATION SUPABASE: Données chargées:', vehicles.length, 'véhicules');
    console.log('📊 PREUVE SUPABASE - Premiers véhicules:', vehicles.slice(0, 5).map((v: Vehicle) => ({ id: v.id, title: v.title })));
    
    // Test spécifique pour vérifier les modifications
    const modifiedVehicles = vehicles.filter((v: Vehicle) => v.title.includes('[SUPABASE]') || v.title.includes('[MODIFIÉ]'));
    console.log('🔍 VÉHICULES MODIFIÉS TROUVÉS:', modifiedVehicles.map((v: Vehicle) => ({ id: v.id, title: v.title })));
    return vehicles;
  } catch (error) {
    console.error('❌ ERREUR CRITIQUE - Échec du chargement Supabase:', error);
    console.error('❌ ATTENTION: Utilisation des données mock en fallback');
    // Import dynamically to avoid circular dependency
    const { mockVehicles } = await import('../utils/mockData');
    console.error('❌ MOCK DATA LOADED - NOT FROM SUPABASE!');
    return mockVehicles;
  }
};

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({});
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  // Commentaire pour expliquer le changement
  // Les modals d'authentification utilisent maintenant un service centralisé

  // Charge l'utilisateur connecté au démarrage
  React.useEffect(() => {
    const loadCurrentUser = async () => {
      try {
        // Vérifier s'il y a un utilisateur dans localStorage
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
          const userData = JSON.parse(savedUser);
          console.log('🔄 Chargement utilisateur depuis localStorage:', userData.email);
          
          // Vérifier si l'utilisateur existe toujours côté serveur
          const response = await fetch(`/api/users/by-email/${encodeURIComponent(userData.email)}`);
          if (response.ok) {
            const user = await response.json();
            setCurrentUser(user);
            console.log('✅ Utilisateur connecté:', user.email);
          } else {
            // Nettoyer localStorage si l'utilisateur n'existe plus
            localStorage.removeItem('currentUser');
            console.log('❌ Utilisateur non trouvé, localStorage nettoyé');
          }
        } else {
          // Tentative de connexion automatique avec l'utilisateur actif
          // (Basé sur les logs API qui montrent happyagency2017@gmail.com)
          try {
            const response = await fetch('/api/users/by-email/happyagency2017%40gmail.com');
            if (response.ok) {
              const user = await response.json();
              setCurrentUser(user);
              console.log('🔄 Connexion automatique réussie:', user.email);
            }
          } catch (error) {
            console.log('ℹ️ Aucune connexion automatique disponible');
          }
        }
      } catch (error) {
        console.error('❌ Erreur chargement utilisateur:', error);
        localStorage.removeItem('currentUser');
      }
    };

    loadCurrentUser();
  }, []);

  // Sauvegarder l'utilisateur dans localStorage quand il change
  React.useEffect(() => {
    if (currentUser) {
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
      console.log('💾 Utilisateur sauvegardé:', currentUser.email);
    } else {
      localStorage.removeItem('currentUser');
      console.log('🗑️ Utilisateur supprimé du localStorage');
    }
  }, [currentUser]);

  // Load vehicles on component mount
  useEffect(() => {
    const loadVehicles = async () => {
      setIsLoading(true);
      try {
        const vehiclesData = await fetchVehicles();
        setVehicles(vehiclesData);
      } catch (error) {
        console.error('❌ Impossible de charger les données Supabase');
      } finally {
        setIsLoading(false);
      }
    };

    loadVehicles();
  }, []);

  // Function to manually refresh vehicles
  const refreshVehicles = async () => {
    setIsLoading(true);
    try {
      const vehiclesData = await fetchVehicles();
      setVehicles(vehiclesData);
    } catch (error) {
      console.error('❌ Impossible de charger les données Supabase');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter vehicles based on search criteria
  const filteredVehicles = vehicles.filter(vehicle => {
    // Handle category filtering with main categories and subcategories mapping
    if (searchFilters.category) {
      const categoryMap: { [key: string]: string[] } = {
        'voiture-utilitaire': ['voiture', 'utilitaire', 'caravane', 'remorque'],
        'moto-scooter-quad': ['moto', 'scooter', 'quad'],
        'nautisme-sport-aerien': ['bateau', 'jetski', 'aerien'],
        'services': ['reparation', 'remorquage', 'entretien', 'autre-service'],
        'pieces': ['piece-voiture', 'piece-moto', 'autre-piece']
      };
      
      // Check if it's a main category
      if (categoryMap[searchFilters.category]) {
        // Filter by subcategories
        if (!categoryMap[searchFilters.category].includes(vehicle.category)) return false;
      } else {
        // Direct subcategory match
        if (vehicle.category !== searchFilters.category) return false;
      }
    }
    
    // Handle subcategory filtering (refines the main category)
    if (searchFilters.subcategory && vehicle.category !== searchFilters.subcategory) return false;
    if (searchFilters.brand && vehicle.brand !== searchFilters.brand) return false;
    if (searchFilters.model && vehicle.model.toLowerCase().includes(searchFilters.model.toLowerCase()) === false) return false;
    if (searchFilters.yearFrom && vehicle.year < searchFilters.yearFrom) return false;
    if (searchFilters.yearTo && vehicle.year > searchFilters.yearTo) return false;
    if (searchFilters.mileageFrom && vehicle.mileage && vehicle.mileage < searchFilters.mileageFrom) return false;
    if (searchFilters.mileageTo && vehicle.mileage && vehicle.mileage > searchFilters.mileageTo) return false;
    if (searchFilters.priceFrom && vehicle.price < searchFilters.priceFrom) return false;
    if (searchFilters.priceTo && vehicle.price > searchFilters.priceTo) return false;
    if (searchFilters.fuelType && vehicle.fuelType !== searchFilters.fuelType) return false;
    if (searchFilters.condition && vehicle.condition !== searchFilters.condition) return false;
    if (searchFilters.location && vehicle.location.toLowerCase().includes(searchFilters.location.toLowerCase()) === false) return false;
    if (searchFilters.searchTerm && vehicle.title.toLowerCase().includes(searchFilters.searchTerm.toLowerCase()) === false) return false;
    return true;
  }).sort((a, b) => {
    // Premium listings first
    if (a.isPremium && !b.isPremium) return -1;
    if (!a.isPremium && b.isPremium) return 1;
    
    // Then sort by criteria
    switch (searchFilters.sortBy) {
      case 'price_asc':
        return a.price - b.price;
      case 'price_desc':
        return b.price - a.price;
      case 'mileage':
        return (a.mileage || 0) - (b.mileage || 0);
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  return (
    <AppContext.Provider value={{
      currentUser,
      setCurrentUser,
      vehicles,
      setVehicles,
      selectedVehicle,
      setSelectedVehicle,
      searchFilters,
      setSearchFilters,
      filteredVehicles,
      messages,
      setMessages,
      isLoading,
      setIsLoading,
      showAuthModal,
      setShowAuthModal,
      authMode,
      setAuthMode,
      refreshVehicles,
    }}>
      {children}
    </AppContext.Provider>
  );
};