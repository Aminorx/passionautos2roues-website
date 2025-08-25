import React, { useState, useMemo } from 'react';
import { Search, MapPin, Filter, X, SlidersHorizontal, Grid, List, ChevronDown, Star, Bell } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { VehicleCard } from '../components/VehicleCard';
import { brandsByVehicleType, getBrandsBySubcategory } from '../utils/mockData';
import { useSavedSearches } from '../hooks/useSavedSearches';
import { useAuth } from '../hooks/useAuth';
import type { SearchFilters } from '../types';

export const SearchPage: React.FC = () => {
  const { vehicles, searchFilters, setSearchFilters, setSelectedVehicle } = useApp();
  const { saveSearch, loading: savingSearch } = useSavedSearches();
  const { dbUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState(searchFilters.searchTerm || '');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveSearchName, setSaveSearchName] = useState('');
  const [enableAlerts, setEnableAlerts] = useState(false);

  // Mapping des catégories principales vers sous-catégories avec filtres appropriés
  const categoryMapping = {
    'voiture-utilitaire': {
      label: 'Voitures - Utilitaires',
      subcategories: [
        { id: 'voiture', label: 'Voitures' },
        { id: 'utilitaire', label: 'Utilitaires' },
        { id: 'caravane', label: 'Caravanes' },
        { id: 'remorque', label: 'Remorques' }
      ],
      supportedFilters: ['brand', 'price', 'year', 'mileage', 'fuelType', 'condition', 'location']
    },
    'moto-scooter-quad': {
      label: 'Motos, Scooters, Quads',
      subcategories: [
        { id: 'moto', label: 'Motos' },
        { id: 'scooter', label: 'Scooters' },
        { id: 'quad', label: 'Quads' }
      ],
      supportedFilters: ['brand', 'price', 'year', 'mileage', 'condition', 'location']
    },
    'nautisme-sport-aerien': {
      label: 'Nautisme, Sport et Plein air',
      subcategories: [
        { id: 'bateau', label: 'Bateaux' },
        { id: 'jetski', label: 'Jet-skis' },
        { id: 'aerien', label: 'Aérien' }
      ],
      supportedFilters: ['brand', 'price', 'year', 'condition', 'location'] // Pas de kilométrage pour nautisme
    },
    'services': {
      label: 'Services',
      subcategories: [
        { id: 'reparation', label: 'Réparation' },
        { id: 'remorquage', label: 'Remorquage' },
        { id: 'entretien', label: 'Entretien' },
        { id: 'autre-service', label: 'Autres services' }
      ],
      supportedFilters: ['price', 'location'] // Services: juste prix et localisation
    },
    'pieces': {
      label: 'Pièces détachées',
      subcategories: [
        { id: 'piece-voiture', label: 'Pièces voiture' },
        { id: 'piece-moto', label: 'Pièces moto' },
        { id: 'autre-piece', label: 'Autres pièces' }
      ],
      supportedFilters: ['price', 'condition', 'location'] // Pièces: prix, état, localisation (pas de marque/année)
    }
  };

  // Détermine quels filtres afficher selon la catégorie sélectionnée
  const getVisibleFilters = () => {
    if (!searchFilters.category) {
      return ['brand', 'price', 'year', 'mileage', 'fuelType', 'condition', 'location']; // Tous les filtres par défaut
    }
    
    const categoryData = categoryMapping[searchFilters.category as keyof typeof categoryMapping];
    return categoryData ? categoryData.supportedFilters : [];
  };

  const visibleFilters = getVisibleFilters();

  // Obtenir les marques disponibles selon la catégorie (utilise les listes complètes du formulaire)
  const availableBrands = useMemo(() => {
    // Si une sous-catégorie spécifique est sélectionnée, utiliser ses marques
    if (searchFilters.subcategory) {
      return getBrandsBySubcategory(searchFilters.subcategory);
    }
    
    // Si une catégorie principale est sélectionnée, combiner toutes les marques de ses sous-catégories
    if (searchFilters.category && categoryMapping[searchFilters.category as keyof typeof categoryMapping]) {
      const subcategoryIds = categoryMapping[searchFilters.category as keyof typeof categoryMapping].subcategories.map(sub => sub.id);
      const allBrands = subcategoryIds.flatMap(subcatId => getBrandsBySubcategory(subcatId));
      return Array.from(new Set(allBrands)).sort();
    }
    
    // Si une catégorie directe (sous-catégorie) est sélectionnée
    if (searchFilters.category) {
      return getBrandsBySubcategory(searchFilters.category);
    }
    
    // Par défaut, utiliser toutes les marques de véhicules (exclure services)
    const allVehicleBrands = Object.entries(brandsByVehicleType)
      .filter(([key]) => !['reparation', 'remorquage', 'entretien', 'autre-service'].includes(key))
      .flatMap(([, brands]) => brands);
    
    return Array.from(new Set(allVehicleBrands)).sort();
  }, [searchFilters.category, searchFilters.subcategory]);

  // Filtrer les véhicules selon tous les critères
  const filteredVehicles = useMemo(() => {
    let filtered = vehicles;

    // Recherche textuelle
    if (searchTerm.trim()) {
      const query = searchTerm.toLowerCase().trim();
      const keywords = query.split(/\s+/);

      filtered = filtered.filter(vehicle => {
        const searchableText = [
          vehicle.title,
          vehicle.description,
          vehicle.brand,
          vehicle.model,
          vehicle.location,
          vehicle.features?.join(' ') || '',
          vehicle.category
        ].join(' ').toLowerCase();

        return keywords.every(keyword => searchableText.includes(keyword));
      });
    }

    // Filtres catégories
    if (searchFilters.category) {
      if (categoryMapping[searchFilters.category as keyof typeof categoryMapping]) {
        // Catégorie principale - inclure toutes ses sous-catégories
        const subcategories = categoryMapping[searchFilters.category as keyof typeof categoryMapping].subcategories.map(sub => sub.id);
        filtered = filtered.filter(vehicle => 
          subcategories.includes(vehicle.category)
        );
      } else {
        // Sous-catégorie spécifique
        filtered = filtered.filter(vehicle => 
          vehicle.category === searchFilters.category
        );
      }
    }

    if (searchFilters.subcategory) {
      filtered = filtered.filter(vehicle => 
        vehicle.category === searchFilters.subcategory
      );
    }

    // Autres filtres
    if (searchFilters.brand) {
      filtered = filtered.filter(vehicle => vehicle.brand === searchFilters.brand);
    }

    if (searchFilters.priceFrom) {
      filtered = filtered.filter(vehicle => vehicle.price >= searchFilters.priceFrom!);
    }

    if (searchFilters.priceTo) {
      filtered = filtered.filter(vehicle => vehicle.price <= searchFilters.priceTo!);
    }

    if (searchFilters.yearFrom) {
      filtered = filtered.filter(vehicle => vehicle.year >= searchFilters.yearFrom!);
    }

    if (searchFilters.yearTo) {
      filtered = filtered.filter(vehicle => vehicle.year <= searchFilters.yearTo!);
    }

    if (searchFilters.mileageFrom) {
      filtered = filtered.filter(vehicle => (vehicle.mileage || 0) >= searchFilters.mileageFrom!);
    }

    if (searchFilters.mileageTo) {
      filtered = filtered.filter(vehicle => (vehicle.mileage || 0) <= searchFilters.mileageTo!);
    }

    if (searchFilters.fuelType) {
      filtered = filtered.filter(vehicle => vehicle.fuelType === searchFilters.fuelType);
    }

    if (searchFilters.condition) {
      filtered = filtered.filter(vehicle => vehicle.condition === searchFilters.condition);
    }

    if (searchFilters.location) {
      filtered = filtered.filter(vehicle => 
        vehicle.location?.toLowerCase().includes(searchFilters.location!.toLowerCase())
      );
    }

    // Tri
    const sortBy = searchFilters.sortBy || 'date';
    switch (sortBy) {
      case 'price_asc':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'mileage':
        filtered.sort((a, b) => (a.mileage || 0) - (b.mileage || 0));
        break;

      default: // 'date'
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return filtered;
  }, [vehicles, searchTerm, searchFilters]);

  const handleSearch = () => {
    setSearchFilters({
      ...searchFilters,
      searchTerm: searchTerm.trim()
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const updateFilter = (key: string, value: any) => {
    setSearchFilters({
      ...searchFilters,
      [key]: value
    });
  };

  const clearFilter = (key: string) => {
    const newFilters = { ...searchFilters };
    delete newFilters[key as keyof SearchFilters];
    setSearchFilters(newFilters);
  };

  const clearAllFilters = () => {
    setSearchFilters({});
    setSearchTerm('');
  };

  const activeFiltersCount = Object.keys(searchFilters).filter(key => 
    searchFilters[key as keyof typeof searchFilters] && key !== 'sortBy'
  ).length;

  // Vérifier si il y a des filtres actifs à sauvegarder
  const hasActiveSearch = activeFiltersCount > 0 || searchTerm.trim() !== '';

  // Sauvegarder la recherche
  const handleSaveSearch = async () => {
    if (!saveSearchName.trim()) {
      alert('Veuillez donner un nom à votre recherche');
      return;
    }

    try {
      const filtersToSave = {
        ...searchFilters,
        searchTerm: searchTerm.trim() || undefined
      };

      await saveSearch(saveSearchName.trim(), filtersToSave, enableAlerts);
      setShowSaveModal(false);
      setSaveSearchName('');
      setEnableAlerts(false);
      alert('Recherche sauvegardée avec succès !');
    } catch (error) {
      alert('Erreur lors de la sauvegarde. Veuillez réessayer.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header de recherche */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="space-y-6">
            {/* Barre de recherche principale */}
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Rechercher un véhicule, une marque, un modèle..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="w-full pl-4 pr-12 py-4 text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-bolt-500 focus:border-primary-bolt-500 transition-all"
                  />
                  <button 
                    onClick={handleSearch}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 text-gray-400 hover:text-primary-bolt-500 transition-colors"
                  >
                    <Search className="h-6 w-6" />
                  </button>
                </div>
              </div>
              
              <div className="flex gap-3">
                {/* Bouton Sauvegarder la recherche */}
                {dbUser && hasActiveSearch && (
                  <button
                    onClick={() => setShowSaveModal(true)}
                    className="flex items-center space-x-2 px-4 py-4 bg-yellow-500 text-white rounded-xl hover:bg-yellow-600 transition-colors"
                    title="Sauvegarder cette recherche"
                  >
                    <Star className="h-5 w-5" />
                    <span className="hidden sm:inline">Sauvegarder</span>
                  </button>
                )}
                
                <button
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  className="flex items-center space-x-2 px-6 py-4 bg-primary-bolt-500 text-white rounded-xl hover:bg-primary-bolt-600 transition-colors"
                >
                  <SlidersHorizontal className="h-5 w-5" />
                  <span>Filtres avancés</span>
                  {activeFiltersCount > 0 && (
                    <span className="bg-white text-primary-bolt-500 rounded-full px-2 py-1 text-sm font-semibold">
                      {activeFiltersCount}
                    </span>
                  )}
                  <ChevronDown className={`h-4 w-4 transition-transform ${showAdvancedFilters ? 'rotate-180' : ''}`} />
                </button>
              </div>
            </div>

            {/* Filtres rapides */}
            <div className="flex flex-wrap gap-3">
              {Object.entries(categoryMapping).map(([key, cat]) => (
                <button
                  key={key}
                  onClick={() => updateFilter('category', searchFilters.category === key ? '' : key)}
                  className={`px-4 py-2 rounded-full border transition-colors ${
                    searchFilters.category === key
                      ? 'bg-primary-bolt-500 text-white border-primary-bolt-500'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-primary-bolt-300'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Filtres avancés */}
      {showAdvancedFilters && (
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {searchFilters.category && (
              <div className="mb-4 p-3 bg-primary-bolt-50 rounded-lg border border-primary-bolt-200">
                <p className="text-sm text-primary-bolt-700">
                  <span className="font-medium">Filtres adaptés pour:</span> {categoryMapping[searchFilters.category as keyof typeof categoryMapping]?.label}
                  <span className="text-gray-600 ml-2">
                    ({visibleFilters.length} filtre{visibleFilters.length > 1 ? 's' : ''} disponible{visibleFilters.length > 1 ? 's' : ''})
                  </span>
                </p>
              </div>
            )}
            <div className="space-y-8">
              {/* Section 1: Sélection type et marque */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Type et marque</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Sous-catégorie */}
                  {searchFilters.category && categoryMapping[searchFilters.category as keyof typeof categoryMapping] && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Type spécifique</label>
                      <select
                        value={searchFilters.subcategory || ''}
                        onChange={(e) => updateFilter('subcategory', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-bolt-500 focus:border-primary-bolt-500 bg-white"
                      >
                        <option value="">Tous les types</option>
                        {categoryMapping[searchFilters.category as keyof typeof categoryMapping].subcategories.map(sub => (
                          <option key={sub.id} value={sub.id}>{sub.label}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Marque - uniquement pour les véhicules physiques */}
                  {visibleFilters.includes('brand') && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Marque</label>
                      <select
                        value={searchFilters.brand || ''}
                        onChange={(e) => updateFilter('brand', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-bolt-500 focus:border-primary-bolt-500 bg-white"
                      >
                        <option value="">Toutes les marques</option>
                        {availableBrands.map((brand: string) => (
                          <option key={brand} value={brand}>{brand}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>

              {/* Section 2: Prix et caractéristiques */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Prix et caractéristiques</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Prix - présent pour toutes les catégories */}
                  {visibleFilters.includes('price') && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Prix (€)</label>
                      <div className="flex space-x-2">
                        <input
                          type="number"
                          placeholder="Min"
                          value={searchFilters.priceFrom || ''}
                          onChange={(e) => updateFilter('priceFrom', e.target.value ? Number(e.target.value) : undefined)}
                          className="w-1/2 px-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-bolt-500 focus:border-primary-bolt-500 bg-white text-sm"
                        />
                        <input
                          type="number"
                          placeholder="Max"
                          value={searchFilters.priceTo || ''}
                          onChange={(e) => updateFilter('priceTo', e.target.value ? Number(e.target.value) : undefined)}
                          className="w-1/2 px-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-bolt-500 focus:border-primary-bolt-500 bg-white text-sm"
                        />
                      </div>
                    </div>
                  )}

                  {/* Année - uniquement pour les véhicules */}
                  {visibleFilters.includes('year') && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Année</label>
                      <div className="flex space-x-2">
                        <input
                          type="number"
                          placeholder="De"
                          value={searchFilters.yearFrom || ''}
                          onChange={(e) => updateFilter('yearFrom', e.target.value ? Number(e.target.value) : undefined)}
                          className="w-1/2 px-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-bolt-500 focus:border-primary-bolt-500 bg-white text-sm"
                        />
                        <input
                          type="number"
                          placeholder="À"
                          value={searchFilters.yearTo || ''}
                          onChange={(e) => updateFilter('yearTo', e.target.value ? Number(e.target.value) : undefined)}
                          className="w-1/2 px-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-bolt-500 focus:border-primary-bolt-500 bg-white text-sm"
                        />
                      </div>
                    </div>
                  )}

                  {/* Kilométrage - uniquement pour voitures/motos */}
                  {visibleFilters.includes('mileage') && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Kilométrage (km)</label>
                      <div className="flex space-x-2">
                        <input
                          type="number"
                          placeholder="Min"
                          value={searchFilters.mileageFrom || ''}
                          onChange={(e) => updateFilter('mileageFrom', e.target.value ? Number(e.target.value) : undefined)}
                          className="w-1/2 px-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-bolt-500 focus:border-primary-bolt-500 bg-white text-sm"
                        />
                        <input
                          type="number"
                          placeholder="Max"
                          value={searchFilters.mileageTo || ''}
                          onChange={(e) => updateFilter('mileageTo', e.target.value ? Number(e.target.value) : undefined)}
                          className="w-1/2 px-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-bolt-500 focus:border-primary-bolt-500 bg-white text-sm"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Section 3: État et localisation */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">État et localisation</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Carburant - uniquement pour voitures/utilitaires */}
                  {visibleFilters.includes('fuelType') && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Carburant</label>
                      <select
                        value={searchFilters.fuelType || ''}
                        onChange={(e) => updateFilter('fuelType', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-bolt-500 focus:border-primary-bolt-500 bg-white"
                      >
                        <option value="">Tous</option>
                        <option value="essence">Essence</option>
                        <option value="diesel">Diesel</option>
                        <option value="electrique">Électrique</option>
                        <option value="hybride">Hybride</option>
                        <option value="gpl">GPL</option>
                      </select>
                    </div>
                  )}

                  {/* État - tous sauf services */}
                  {visibleFilters.includes('condition') && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">État</label>
                      <select
                        value={searchFilters.condition || ''}
                        onChange={(e) => updateFilter('condition', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-bolt-500 focus:border-primary-bolt-500 bg-white"
                      >
                        <option value="">Tous</option>
                        {/* Options dynamiques selon la catégorie */}
                        {(searchFilters.category?.includes('voiture') || searchFilters.category?.includes('moto') || searchFilters.category?.includes('scooter') || searchFilters.category?.includes('quad') || searchFilters.category?.includes('nautisme')) ? (
                          <>
                            <option value="used">Occasion</option>
                            <option value="damaged">Accidenté</option>
                          </>
                        ) : (
                          <>
                            <option value="new">Neuf</option>
                            <option value="used">Occasion</option>
                          </>
                        )}
                      </select>
                    </div>
                  )}

                  {/* Localisation - présent pour toutes les catégories */}
                  {visibleFilters.includes('location') && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Localisation</label>
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Ville, département..."
                          value={searchFilters.location || ''}
                          onChange={(e) => updateFilter('location', e.target.value)}
                          className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-bolt-500 focus:border-primary-bolt-500 bg-white"
                        />
                        <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Actions filtres */}
            {activeFiltersCount > 0 && (
              <div className="flex justify-center">
                <button
                  onClick={clearAllFilters}
                  className="flex items-center space-x-2 px-6 py-3 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 rounded-xl border border-red-200 transition-all duration-200 font-medium"
                >
                  <X className="h-4 w-4" />
                  <span>Effacer tous les filtres ({activeFiltersCount})</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Résultats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header résultats */}
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-8">
          <div className="mb-4 lg:mb-0">
            <h1 className="text-3xl font-bold text-gray-900">
              {searchTerm ? `Résultats pour "${searchTerm}"` : 'Recherche de véhicules'}
            </h1>
            <p className="text-gray-600 mt-2">
              {filteredVehicles.length} résultat{filteredVehicles.length !== 1 ? 's' : ''} trouvé{filteredVehicles.length !== 1 ? 's' : ''}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
            {/* Tri */}
            <div className="flex items-center space-x-3">
              <span className="text-sm font-medium text-gray-700">Trier par:</span>
              <select
                value={searchFilters.sortBy || 'date'}
                onChange={(e) => updateFilter('sortBy', e.target.value)}
                className="px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-bolt-500 focus:border-primary-bolt-500 bg-white text-sm font-medium"
              >
                <option value="date">Plus récentes</option>
                <option value="price_asc">Prix croissant</option>
                <option value="price_desc">Prix décroissant</option>
                <option value="mileage">Kilométrage</option>
              </select>
            </div>

            {/* Mode d'affichage */}
            <div className="flex items-center space-x-3">
              <span className="text-sm font-medium text-gray-700">Affichage:</span>
              <div className="flex bg-white border border-gray-300 rounded-xl overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2.5 ${viewMode === 'grid' ? 'bg-primary-bolt-500 text-white' : 'text-gray-600 hover:bg-gray-50'} transition-all duration-200`}
                  title="Vue grille"
                >
                  <Grid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2.5 ${viewMode === 'list' ? 'bg-primary-bolt-500 text-white' : 'text-gray-600 hover:bg-gray-50'} transition-all duration-200 border-l border-gray-300`}
                  title="Vue liste"
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Filtres actifs */}
        {activeFiltersCount > 0 && (
          <div className="mb-6 flex flex-wrap gap-2">
            {Object.entries(searchFilters).map(([key, value]) => {
              if (!value || key === 'sortBy') return null;
              
              let label = '';
              switch (key) {
                case 'category':
                  label = categoryMapping[value as keyof typeof categoryMapping]?.label || value;
                  break;
                case 'subcategory':
                  // Trouver le label de la sous-catégorie
                  for (const cat of Object.values(categoryMapping)) {
                    const sub = cat.subcategories.find(s => s.id === value);
                    if (sub) {
                      label = sub.label;
                      break;
                    }
                  }
                  break;
                case 'brand':
                  label = `Marque: ${value}`;
                  break;
                case 'priceFrom':
                  label = `Prix min: ${value}€`;
                  break;
                case 'priceTo':
                  label = `Prix max: ${value}€`;
                  break;
                case 'yearFrom':
                  label = `Année min: ${value}`;
                  break;
                case 'yearTo':
                  label = `Année max: ${value}`;
                  break;
                case 'mileageFrom':
                  label = `Km min: ${value}`;
                  break;
                case 'mileageTo':
                  label = `Km max: ${value}`;
                  break;
                case 'fuelType':
                  label = `Carburant: ${value}`;
                  break;
                case 'condition':
                  label = `État: ${value}`;
                  break;
                case 'location':
                  label = `Lieu: ${value}`;
                  break;
                case 'searchTerm':
                  label = `"${value}"`;
                  break;
                default:
                  label = `${key}: ${value}`;
              }

              return (
                <button
                  key={key}
                  onClick={() => clearFilter(key)}
                  className="flex items-center space-x-2 px-3 py-1 bg-primary-bolt-100 text-primary-bolt-700 rounded-full text-sm hover:bg-primary-bolt-200 transition-colors"
                >
                  <span>{label}</span>
                  <X className="h-3 w-3" />
                </button>
              );
            })}
          </div>
        )}

        {/* Liste des véhicules */}
        {filteredVehicles.length > 0 ? (
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
            : 'space-y-4'
          }>
            {filteredVehicles.map((vehicle) => (
              <VehicleCard 
                key={vehicle.id} 
                vehicle={vehicle}
                onClick={() => setSelectedVehicle(vehicle)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucun résultat trouvé</h3>
            <p className="text-gray-600 mb-6">
              Essayez de modifier vos critères de recherche ou supprimez certains filtres.
            </p>
            {activeFiltersCount > 0 && (
              <button
                onClick={clearAllFilters}
                className="bg-primary-bolt-500 text-white px-6 py-3 rounded-xl hover:bg-primary-bolt-600 transition-colors"
              >
                Effacer tous les filtres
              </button>
            )}
          </div>
        )}
      </div>

      {/* Modal de sauvegarde de recherche */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Sauvegarder cette recherche</h3>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="searchName" className="block text-sm font-medium text-gray-700 mb-2">
                  Nom de la recherche *
                </label>
                <input
                  id="searchName"
                  type="text"
                  value={saveSearchName}
                  onChange={(e) => setSaveSearchName(e.target.value)}
                  placeholder="Ex: Voitures BMW sous 20 000€"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-bolt-500 focus:border-primary-bolt-500"
                />
              </div>

              <div className="flex items-center space-x-3">
                <input
                  id="enableAlerts"
                  type="checkbox"
                  checked={enableAlerts}
                  onChange={(e) => setEnableAlerts(e.target.checked)}
                  className="w-4 h-4 text-primary-bolt-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-bolt-500"
                />
                <label htmlFor="enableAlerts" className="text-sm text-gray-700 flex items-center space-x-2">
                  <Bell className="h-4 w-4" />
                  <span>Recevoir des alertes pour de nouvelles annonces</span>
                </label>
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <h4 className="font-medium text-gray-900 mb-2">Critères à sauvegarder :</h4>
                <div className="space-y-1 text-sm text-gray-600">
                  {searchTerm.trim() && (
                    <div>• Mot-clé : "{searchTerm.trim()}"</div>
                  )}
                  {searchFilters.category && (
                    <div>• Catégorie : {categoryMapping[searchFilters.category as keyof typeof categoryMapping]?.label || searchFilters.category}</div>
                  )}
                  {searchFilters.brand && (
                    <div>• Marque : {searchFilters.brand}</div>
                  )}
                  {searchFilters.priceFrom && searchFilters.priceTo && (
                    <div>• Prix : {searchFilters.priceFrom}€ - {searchFilters.priceTo}€</div>
                  )}
                  {searchFilters.location && (
                    <div>• Localisation : {searchFilters.location}</div>
                  )}
                  {activeFiltersCount > 0 && (
                    <div className="text-primary-bolt-600 font-medium">
                      {activeFiltersCount} filtre{activeFiltersCount > 1 ? 's' : ''} au total
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowSaveModal(false);
                  setSaveSearchName('');
                  setEnableAlerts(false);
                }}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleSaveSearch}
                disabled={savingSearch || !saveSearchName.trim()}
                className="flex-1 px-4 py-3 bg-primary-bolt-500 text-white rounded-xl hover:bg-primary-bolt-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {savingSearch ? 'Sauvegarde...' : 'Sauvegarder'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};