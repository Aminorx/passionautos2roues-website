import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Check, AlertCircle, Loader } from 'lucide-react';

interface City {
  nom: string;
  code: string;
  codePostal: string;
  codeDepartement: string;
  population: number;
}

interface AddressInputProps {
  postalCode: string;
  city: string;
  onPostalCodeChange: (postalCode: string) => void;
  onCityChange: (city: string) => void;
  className?: string;
}

export const AddressInput: React.FC<AddressInputProps> = ({
  postalCode,
  city,
  onPostalCodeChange,
  onCityChange,
  className = ''
}) => {
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Valider le format du code postal français
  const isValidPostalCodeFormat = (code: string): boolean => {
    return /^\d{5}$/.test(code);
  };

  // Rechercher les villes par code postal
  const searchCitiesByPostalCode = async (code: string) => {
    if (!isValidPostalCodeFormat(code)) {
      setError('Le code postal doit contenir 5 chiffres');
      setCities([]);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`https://geo.api.gouv.fr/communes?codePostal=${code}&fields=nom,code,codesPostaux,codeDepartement,population&format=json&geometry=centre`);
      
      if (!response.ok) {
        throw new Error('Erreur lors de la recherche');
      }

      const data: City[] = await response.json();
      
      if (data.length === 0) {
        setError('Code postal non trouvé');
        setCities([]);
      } else {
        setCities(data);
        setError('');
        
        // Si une seule ville correspond, la sélectionner automatiquement
        if (data.length === 1) {
          console.log('Auto-selecting city:', data[0].nom);
          onCityChange(data[0].nom);
          setShowDropdown(false);
        } else {
          // Plusieurs villes, afficher le dropdown
          setShowDropdown(true);
        }
      }
    } catch (err) {
      setError('Erreur lors de la recherche des villes');
      setCities([]);
    } finally {
      setLoading(false);
    }
  };

  // État local pour l'input du code postal pour éviter les conflits de controlled input
  const [localPostalCode, setLocalPostalCode] = useState(postalCode);

  // Synchroniser avec la prop postalCode seulement si elle change de l'extérieur
  useEffect(() => {
    if (postalCode !== localPostalCode) {
      setLocalPostalCode(postalCode);
    }
  }, [postalCode]);

  // Gérer le changement du code postal
  const handlePostalCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    console.log('Input event value:', value, 'length:', value.length);
    
    // Permettre uniquement les chiffres et limiter à EXACTEMENT 5 caractères
    const numericValue = value.replace(/\D/g, '').substring(0, 5);
    console.log('Processed numeric value:', numericValue, 'length:', numericValue.length);
    
    // Mettre à jour l'état local immédiatement pour l'affichage
    setLocalPostalCode(numericValue);
    
    // Mettre à jour le parent IMMÉDIATEMENT
    onPostalCodeChange(numericValue);
    
    // Réinitialiser la ville si le code postal change
    if (numericValue !== localPostalCode) {
      onCityChange('');
      setCities([]);
      setShowDropdown(false);
      setError('');
    }

    // Rechercher automatiquement si EXACTEMENT 5 chiffres saisis
    if (numericValue.length === 5) {
      console.log('Searching for postal code:', numericValue);
      searchCitiesByPostalCode(numericValue);
    }
  };

  // Sélectionner une ville
  const selectCity = (selectedCity: City) => {
    console.log('Sending to parent - city:', selectedCity.nom);
    onCityChange(selectedCity.nom);
    setShowDropdown(false);
  };

  // Fermer le dropdown si on clique à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getStatusIcon = () => {
    if (loading) {
      return <Loader className="h-4 w-4 text-blue-500 animate-spin" />;
    }
    if (error) {
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
    if (city && postalCode.length === 5) {
      return <Check className="h-4 w-4 text-green-500" />;
    }
    return <MapPin className="h-4 w-4 text-gray-400" />;
  };

  return (
    <div className={`space-y-4 ${className}`}>

      
      {/* Code Postal */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Code postal *
        </label>
        <div className="relative">
          <input
            type="text"
            value={localPostalCode}
            onChange={handlePostalCodeChange}
            className={`w-full px-4 py-3 pr-10 border rounded-xl focus:ring-2 focus:ring-primary-bolt-500 focus:border-primary-bolt-500 transition-all ${
              error ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
            placeholder="Tapez votre code postal (ex: 75001)"
            maxLength={5}
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            {getStatusIcon()}
          </div>
        </div>
        
        {error && (
          <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </p>
        )}
      </div>

      {/* Ville */}
      <div className="relative" ref={dropdownRef}>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Ville *
        </label>
        <input
          type="text"
          value={city}
          onChange={(e) => onCityChange(e.target.value)}
          className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-bolt-500 focus:border-primary-bolt-500 transition-all ${
            (!postalCode || postalCode.length !== 5) ? 'bg-gray-50 text-gray-500' : ''
          }`}
          placeholder="Saisissez d'abord le code postal"
          disabled={!postalCode || postalCode.length !== 5}
        />

        {/* Dropdown des villes multiples */}
        {showDropdown && cities.length > 1 && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-xl shadow-lg max-h-60 overflow-auto">
            <div className="p-2 text-xs text-gray-500 border-b border-gray-100">
              Plusieurs villes trouvées pour ce code postal :
            </div>
            {cities.map((cityOption, index) => (
              <button
                key={`${cityOption.code}-${index}`}
                onClick={() => selectCity(cityOption)}
                className="w-full text-left px-4 py-3 hover:bg-primary-bolt-50 focus:bg-primary-bolt-50 focus:outline-none transition-colors"
              >
                <div className="font-medium text-gray-900">{cityOption.nom}</div>
                <div className="text-sm text-gray-500">
                  {cityOption.population.toLocaleString()} habitants
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Informations sur la ville sélectionnée */}
      {city && cities.length > 0 && !showDropdown && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-xl">
          <div className="flex items-center space-x-2 text-green-800">
            <Check className="h-4 w-4" />
            <span className="text-sm font-medium">Adresse validée</span>
          </div>
          <div className="mt-1 text-sm text-green-700">
            {city} ({postalCode})
            {cities[0]?.population && (
              <span className="ml-2">• {cities[0].population.toLocaleString()} habitants</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};