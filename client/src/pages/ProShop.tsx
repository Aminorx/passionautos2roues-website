import React, { useState, useEffect } from 'react';
import { useRoute, Link } from 'wouter';
import { useApp } from '../contexts/AppContext';
import { 
  Building2, Globe, Phone, Mail, MapPin, Star, 
  Eye, Heart, Calendar, Filter, Grid, List,
  ChevronDown, Award, Shield, Verified,
  Image as ImageIcon, PaintBucket, Settings
} from 'lucide-react';

interface ProAccount {
  id: string;
  company_name: string;
  email: string;
  phone?: string;
  website?: string;
  company_address?: string;
  siret: string;
  verification_status: string;
  created_at: string;
  users?: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  // Champs de personnalisation
  company_logo?: string;
  banner_image?: string;
  brand_colors?: {
    primary: string;
    secondary: string;
  };
  description?: string;
  specialties?: string[];
  certifications?: string[];
}

interface Vehicle {
  id: string;
  title: string;
  price: number;
  images: string[];
  category: string;
  brand: string;
  model: string;
  year: number;
  mileage?: number;
  location: string;
  created_at: string;
  views: number;
  is_premium: boolean;
  status: string;
  is_active: boolean;
}

export default function ProShop() {
  const [match, params] = useRoute('/pro/:shopId');
  const { setSelectedVehicle } = useApp();
  const [proAccount, setProAccount] = useState<ProAccount | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('date_desc');
  const [filterCategory, setFilterCategory] = useState('all');

  // Charger les données de la boutique
  useEffect(() => {
    if (params?.shopId) {
      loadProShopData(params.shopId);
    }
  }, [params?.shopId]);

  const loadProShopData = async (shopId: string) => {
    try {
      setLoading(true);
      
      // Récupérer les informations du compte professionnel
      const proResponse = await fetch(`/api/professional-accounts/${shopId}`);
      if (!proResponse.ok) {
        throw new Error('Compte professionnel non trouvé');
      }
      const proData = await proResponse.json();
      setProAccount(proData);

      // Récupérer les annonces du professionnel
      const vehiclesResponse = await fetch(`/api/professional-accounts/vehicles/${shopId}`);
      if (vehiclesResponse.ok) {
        const vehiclesData = await vehiclesResponse.json();
        setVehicles(vehiclesData.filter((v: any) => v.is_active && v.status === 'approved'));
      }

      setLoading(false);
    } catch (error) {
      console.error('Erreur chargement boutique pro:', error);
      setLoading(false);
    }
  };

  const filteredAndSortedVehicles = vehicles
    .filter(vehicle => {
      if (filterCategory === 'all') return true;
      return vehicle.category === filterCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price_asc':
          return a.price - b.price;
        case 'price_desc':
          return b.price - a.price;
        case 'date_asc':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'date_desc':
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

  const categories = [...new Set(vehicles.map(v => v.category))];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary-bolt-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!proAccount) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Building2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Boutique non trouvée</h1>
          <p className="text-gray-600 mb-8">Cette boutique professionnelle n'existe pas ou a été supprimée.</p>
          <Link href="/" className="bg-primary-bolt-500 hover:bg-primary-bolt-600 text-white px-6 py-3 rounded-xl font-semibold transition-colors">
            Retour à l'accueil
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Bannière de l'entreprise */}
      <div className="relative">
        {proAccount.banner_image ? (
          <div 
            className="h-64 bg-cover bg-center"
            style={{ backgroundImage: `url(${proAccount.banner_image})` }}
          >
            <div className="absolute inset-0 bg-black bg-opacity-40"></div>
          </div>
        ) : (
          <div className="h-64 bg-gradient-to-r from-primary-bolt-500 to-primary-bolt-600">
            <div className="absolute inset-0 bg-black bg-opacity-20"></div>
          </div>
        )}
        
        {/* Informations de l'entreprise */}
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-end space-x-6">
              {/* Logo de l'entreprise */}
              <div className="w-32 h-32 bg-white rounded-2xl shadow-lg border-4 border-white flex items-center justify-center overflow-hidden">
                {proAccount.company_logo ? (
                  <img 
                    src={proAccount.company_logo} 
                    alt={proAccount.company_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Building2 className="h-16 w-16 text-gray-400" />
                )}
              </div>
              
              {/* Informations */}
              <div className="flex-1 pb-4">
                <div className="flex items-center space-x-3 mb-2">
                  <h1 className="text-4xl font-bold text-white">{proAccount.company_name}</h1>
                  {proAccount.verification_status === 'approved' && (
                    <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1">
                      <Verified className="h-4 w-4" />
                      <span>Vérifié</span>
                    </div>
                  )}
                </div>
                
                {proAccount.description && (
                  <p className="text-white text-lg mb-4 max-w-2xl">{proAccount.description}</p>
                )}
                
                <div className="flex flex-wrap items-center space-x-6 text-white">
                  {proAccount.company_address && (
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-5 w-5" />
                      <span>{proAccount.company_address}</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5" />
                    <span>Membre depuis {new Date(proAccount.created_at).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Eye className="h-5 w-5" />
                    <span>{vehicles.length} annonce{vehicles.length > 1 ? 's' : ''}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Informations et contact */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Contact</h2>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-700">{proAccount.email}</span>
                </div>
                {proAccount.phone && (
                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-700">{proAccount.phone}</span>
                  </div>
                )}
                {proAccount.website && (
                  <div className="flex items-center space-x-3">
                    <Globe className="h-5 w-5 text-gray-400" />
                    <a 
                      href={proAccount.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-bolt-500 hover:text-primary-bolt-600"
                    >
                      Site web
                    </a>
                  </div>
                )}
              </div>
              
              <button className="w-full mt-6 bg-primary-bolt-500 hover:bg-primary-bolt-600 text-white py-3 px-4 rounded-xl font-semibold transition-colors">
                Contacter le vendeur
              </button>
            </div>

            {/* Spécialités */}
            {proAccount.specialties && proAccount.specialties.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Spécialités</h2>
                <div className="flex flex-wrap gap-2">
                  {proAccount.specialties.map((specialty, index) => (
                    <span
                      key={index}
                      className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                    >
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Certifications */}
            {proAccount.certifications && proAccount.certifications.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Certifications</h2>
                <div className="space-y-3">
                  {proAccount.certifications.map((cert, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Award className="h-4 w-4 text-green-500" />
                      <span className="text-gray-700 text-sm">{cert}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Contenu principal - Annonces */}
          <div className="lg:col-span-3">
            {/* Barre d'outils */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                <div className="flex items-center space-x-4">
                  <h2 className="text-xl font-bold text-gray-900">
                    {filteredAndSortedVehicles.length} annonce{filteredAndSortedVehicles.length > 1 ? 's' : ''}
                  </h2>
                  
                  {/* Filtre par catégorie */}
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-bolt-500 focus:border-primary-bolt-500"
                  >
                    <option value="all">Toutes les catégories</option>
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center space-x-4">
                  {/* Tri */}
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-bolt-500 focus:border-primary-bolt-500"
                  >
                    <option value="date_desc">Plus récentes</option>
                    <option value="date_asc">Plus anciennes</option>
                    <option value="price_asc">Prix croissant</option>
                    <option value="price_desc">Prix décroissant</option>
                  </select>

                  {/* Mode d'affichage */}
                  <div className="flex rounded-lg border border-gray-300 overflow-hidden">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 ${viewMode === 'grid' ? 'bg-primary-bolt-500 text-white' : 'bg-white text-gray-400 hover:text-gray-600'}`}
                    >
                      <Grid className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 ${viewMode === 'list' ? 'bg-primary-bolt-500 text-white' : 'bg-white text-gray-400 hover:text-gray-600'}`}
                    >
                      <List className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Liste des annonces */}
            {filteredAndSortedVehicles.length > 0 ? (
              <div className={viewMode === 'grid' 
                ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" 
                : "space-y-6"
              }>
                {filteredAndSortedVehicles.map((vehicle) => (
                  <div
                    key={vehicle.id}
                    onClick={() => setSelectedVehicle(vehicle)}
                    className={`bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-200 cursor-pointer ${
                      viewMode === 'list' ? 'flex' : 'block'
                    }`}
                  >
                    {/* Image */}
                    <div className={viewMode === 'list' ? 'w-80 flex-shrink-0' : 'aspect-[4/3]'}>
                      {vehicle.images.length > 0 ? (
                        <img
                          src={vehicle.images[0]}
                          alt={vehicle.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                          <ImageIcon className="h-16 w-16 text-gray-400" />
                        </div>
                      )}
                      {vehicle.isPremium && (
                        <div className="absolute top-3 left-3">
                          <span className="bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center space-x-1">
                            <Star className="h-3 w-3" />
                            <span>Premium</span>
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Contenu */}
                    <div className="p-6 flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                        {vehicle.title}
                      </h3>
                      
                      <div className="text-2xl font-bold text-primary-bolt-600 mb-3">
                        {vehicle.price.toLocaleString('fr-FR')} €
                      </div>

                      <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                        <span>{vehicle.brand} {vehicle.model}</span>
                        <span>{vehicle.year}</span>
                      </div>

                      {vehicle.mileage && (
                        <div className="text-sm text-gray-600 mb-3">
                          {vehicle.mileage.toLocaleString('fr-FR')} km
                        </div>
                      )}

                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span className="flex items-center space-x-1">
                          <MapPin className="h-4 w-4" />
                          <span>{vehicle.location}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Eye className="h-4 w-4" />
                          <span>{vehicle.views}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                <Building2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">Aucune annonce</h3>
                <p className="text-gray-600">
                  Ce professionnel n'a pas encore publié d'annonces.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}