import React, { useState, useEffect } from 'react';
import { Filter, Grid, List, SortAsc, X } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { VehicleCard } from './VehicleCard';
import { SearchFilters } from './SearchFilters';
import { VehicleDetail } from './VehicleDetail';
import brandIcon from '@assets/Brand_1752260033631.png';

export const VehicleListings: React.FC = () => {
  const { filteredVehicles, searchFilters, setSearchFilters, selectedVehicle, setSelectedVehicle } = useApp();
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Scroll to top when component mounts or when filters change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [searchFilters]);

  const handleSortChange = (sortBy: string) => {
    setSearchFilters({ ...searchFilters, sortBy: sortBy as any });
  };

  // Fonction pour supprimer un filtre spécifique
  const removeFilter = (filterKey: string) => {
    const newFilters = { ...searchFilters };
    delete newFilters[filterKey as keyof typeof newFilters];
    setSearchFilters(newFilters);
  };

  // Fonction pour obtenir le label lisible d'un filtre
  const getFilterLabel = (key: string, value: any) => {
    const labels: { [key: string]: string } = {
      category: 'catégorie',
      subcategory: 'subcatégorie', 
      brand: 'marque',
      model: 'modèle',
      yearFrom: 'année min',
      yearTo: 'année max',
      priceFrom: 'prix min',
      priceTo: 'prix max',
      mileageFrom: 'km min',
      mileageTo: 'km max',
      fuelType: 'carburant',
      condition: 'état',
      location: 'localisation',
      sortBy: 'tri'
    };

    // Traduction des valeurs spéciales
    let displayValue = value;
    if (key === 'condition') {
      const conditionLabels: { [key: string]: string } = {
        'used': 'Occasion',
        'damaged': 'Accidenté'
      };
      displayValue = conditionLabels[value] || value;
    } else if (key === 'fuelType') {
      const fuelLabels: { [key: string]: string } = {
        'essence': 'Essence',
        'diesel': 'Diesel',
        'electric': 'Électrique',
        'hybrid': 'Hybride'
      };
      displayValue = fuelLabels[value] || value;
    } else if (key === 'sortBy') {
      const sortLabels: { [key: string]: string } = {
        'date': 'Plus récentes',
        'price_asc': 'Prix croissant',
        'price_desc': 'Prix décroissant',
        'mileage': 'Kilométrage'
      };
      displayValue = sortLabels[value] || value;
    }

    return `${labels[key] || key}: ${displayValue}`;
  };



  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-8">
          <div className="mb-4 lg:mb-0">
            <h1 className="text-3xl font-bold text-gray-900">Annonces disponibles</h1>
            <p className="text-gray-600 mt-2">
              {filteredVehicles.length} résultat{filteredVehicles.length !== 1 ? 's' : ''} trouvé{filteredVehicles.length !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Sort */}
            <select
              value={searchFilters.sortBy || 'date'}
              onChange={(e) => handleSortChange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-bolt-500 focus:border-primary-bolt-500 bg-white"
            >
              <option value="date">Plus récentes</option>
              <option value="price_asc">Prix croissant</option>
              <option value="price_desc">Prix décroissant</option>
              <option value="mileage">Kilométrage</option>
            </select>

            {/* View Mode */}
            <div className="flex bg-white border border-gray-300 rounded-xl">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-primary-bolt-50 text-primary-bolt-500' : 'text-gray-600'} hover:bg-gray-50 transition-colors`}
              >
                <Grid className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-primary-bolt-50 text-primary-bolt-500' : 'text-gray-600'} hover:bg-gray-50 transition-colors border-l border-gray-300`}
              >
                <List className="h-5 w-5" />
              </button>
            </div>

            {/* Filters Button */}
            <button
              onClick={() => setShowFilters(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-primary-bolt-500 text-white rounded-xl hover:bg-primary-bolt-600 transition-colors"
            >
              <Filter className="h-5 w-5" />
              <span>Filtres</span>
            </button>
          </div>
        </div>

        {/* Active Filters */}
        {Object.keys(searchFilters).filter(key => searchFilters[key as keyof typeof searchFilters] && key !== 'sortBy').length > 0 && (
          <div className="mb-6 p-4 bg-white rounded-xl border border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Filtres actifs:</h3>
            <div className="flex flex-wrap gap-2">
              {Object.entries(searchFilters).map(([key, value]) => {
                if (!value || key === 'sortBy') return null; // Exclure le tri des filtres actifs
                return (
                  <span
                    key={key}
                    className="inline-flex items-center px-3 py-1 bg-primary-bolt-100 text-primary-bolt-500 text-sm rounded-full"
                  >
                    {getFilterLabel(key, value)}
                    <button
                      onClick={() => removeFilter(key)}
                      className="ml-2 p-0.5 hover:bg-primary-bolt-200 rounded-full transition-colors"
                      title="Supprimer ce filtre"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                );
              })}
              <button
                onClick={() => setSearchFilters({})}
                className="text-sm text-red-600 hover:text-red-800 font-medium"
              >
                Effacer tous les filtres
              </button>
            </div>
          </div>
        )}

        {/* Vehicle Grid */}
        {filteredVehicles.length > 0 ? (
          <div className={
            viewMode === 'grid' 
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              : "space-y-6"
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
            <div className="mb-4 flex justify-center">
              <img 
                src={brandIcon} 
                alt="Brand icon" 
                className="w-16 h-16 opacity-40"
              />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Aucun résultat trouvé
            </h3>
            <p className="text-gray-600 mb-6">
              Essayez de modifier vos critères de recherche ou consultez toutes nos annonces.
            </p>
            <button
              onClick={() => setSearchFilters({})}
              className="px-6 py-3 bg-primary-bolt-500 text-white rounded-lg hover:bg-primary-bolt-600 transition-colors"
            >
              Voir toutes les annonces
            </button>
          </div>
        )}
      </div>

      {/* Search Filters Modal */}
      <SearchFilters isOpen={showFilters} onClose={() => setShowFilters(false)} />
    </div>
  );
};