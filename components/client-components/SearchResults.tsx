import { useApp } from '../contexts/AppContext';
import { Vehicle } from '../types';
import { VehicleCard } from './VehicleCard';
import { ArrowLeft, Search } from 'lucide-react';
import { useMemo } from 'react';

interface SearchResultsProps {
  searchQuery: string;
  onBack: () => void;
  onVehicleSelect: (vehicle: Vehicle) => void;
}

export const SearchResults = ({ searchQuery, onBack, onVehicleSelect }: SearchResultsProps) => {
  const { vehicles } = useApp();

  // Fonction de recherche avancée
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];

    const query = searchQuery.toLowerCase().trim();
    const keywords = query.split(/\s+/);

    return vehicles.filter(vehicle => {
      const searchableText = [
        vehicle.title,
        vehicle.description,
        vehicle.brand,
        vehicle.model,
        vehicle.location,
        vehicle.features?.join(' ') || '',
        vehicle.category
      ].join(' ').toLowerCase();

      // Vérifier si tous les mots-clés sont présents
      return keywords.every(keyword => 
        searchableText.includes(keyword)
      );
    }).sort((a, b) => {
      // Trier par pertinence : les titres qui contiennent la recherche en premier
      const aTitle = a.title.toLowerCase();
      const bTitle = b.title.toLowerCase();
      
      if (aTitle.includes(query) && !bTitle.includes(query)) return -1;
      if (!aTitle.includes(query) && bTitle.includes(query)) return 1;
      
      // Puis par date de création (plus récent en premier)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [vehicles, searchQuery]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Retour</span>
            </button>
            <div className="flex items-center gap-3">
              <Search className="w-5 h-5 text-gray-400" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Résultats de recherche
                </h1>
                <p className="text-gray-600">
                  pour "<span className="font-medium text-gray-900">{searchQuery}</span>"
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Statistiques de recherche */}
        <div className="mb-6">
          <p className="text-gray-600">
            {searchResults.length > 0 ? (
              <>
                <span className="font-semibold text-gray-900">{searchResults.length}</span>
                {' '}résultat{searchResults.length > 1 ? 's' : ''} trouvé{searchResults.length > 1 ? 's' : ''}
              </>
            ) : (
              'Aucun résultat trouvé'
            )}
          </p>
        </div>

        {/* Résultats */}
        {searchResults.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {searchResults.map((vehicle) => (
              <div key={vehicle.id} onClick={() => onVehicleSelect(vehicle)} className="cursor-pointer">
                <VehicleCard
                  vehicle={vehicle}
                />
              </div>
            ))}
          </div>
        ) : (
          /* État vide */
          <div className="text-center py-16">
            <div className="mb-6">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Aucun résultat trouvé
              </h3>
              <p className="text-gray-600 max-w-md mx-auto mb-8">
                Nous n'avons trouvé aucun véhicule correspondant à votre recherche "{searchQuery}".
                Essayez avec des mots-clés différents ou vérifiez l'orthographe.
              </p>
            </div>
            
            {/* Suggestions */}
            <div className="bg-white rounded-lg p-6 max-w-lg mx-auto border">
              <h4 className="font-semibold text-gray-900 mb-4">Suggestions pour améliorer votre recherche :</h4>
              <ul className="text-left text-gray-600 space-y-2">
                <li>• Vérifiez l'orthographe des mots-clés</li>
                <li>• Utilisez des termes plus généraux (ex: "BMW" au lieu de "BMW Serie 3")</li>
                <li>• Essayez différentes combinaisons de mots</li>
                <li>• Recherchez par marque, modèle ou type de véhicule</li>
              </ul>
              <button
                onClick={onBack}
                className="mt-6 px-6 py-3 bg-primary-bolt-500 text-white rounded-lg hover:bg-primary-bolt-600 transition-colors"
              >
                Nouvelle recherche
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};