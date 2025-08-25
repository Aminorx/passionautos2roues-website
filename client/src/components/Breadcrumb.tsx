import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { Vehicle } from '../types';

interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface BreadcrumbProps {
  vehicle: Vehicle;
  onNavigate?: (path: string) => void;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ vehicle, onNavigate }) => {
  // Mapping des catégories vers leurs structures hiérarchiques
  const getCategoryHierarchy = (category: string): BreadcrumbItem[] => {
    const hierarchies: { [key: string]: BreadcrumbItem[] } = {
      'voiture': [
        { label: 'Voitures - Utilitaires', path: 'voiture-utilitaire' }
      ],
      'utilitaire': [
        { label: 'Voitures - Utilitaires', path: 'voiture-utilitaire' }
      ],
      'caravane': [
        { label: 'Voitures - Utilitaires', path: 'voiture-utilitaire' }
      ],
      'remorque': [
        { label: 'Voitures - Utilitaires', path: 'voiture-utilitaire' }
      ],
      'moto': [
        { label: 'Motos, Scooters, Quads', path: 'moto-scooter-quad' },
        { label: 'Motos', path: 'moto' }
      ],
      'scooter': [
        { label: 'Motos, Scooters, Quads', path: 'moto-scooter-quad' },
        { label: 'Scooters', path: 'scooter' }
      ],
      'quad': [
        { label: 'Motos, Scooters, Quads', path: 'moto-scooter-quad' },
        { label: 'Quads', path: 'quad' }
      ],
      'bateau': [
        { label: 'Nautisme, Sport et Plein air', path: 'nautisme-sport-aerien' },
        { label: 'Bateaux', path: 'bateau' }
      ],
      'jetski': [
        { label: 'Nautisme, Sport et Plein air', path: 'nautisme-sport-aerien' },
        { label: 'Jet-ski', path: 'jetski' }
      ],
      'aerien': [
        { label: 'Nautisme, Sport et Plein air', path: 'nautisme-sport-aerien' },
        { label: 'Aérien', path: 'aerien' }
      ],
      'reparation': [
        { label: 'Services', path: 'services' },
        { label: 'Réparation', path: 'reparation' }
      ],
      'remorquage': [
        { label: 'Services', path: 'services' },
        { label: 'Remorquage', path: 'remorquage' }
      ],
      'entretien': [
        { label: 'Services', path: 'services' },
        { label: 'Entretien', path: 'entretien' }
      ],
      'autre-service': [
        { label: 'Services', path: 'services' },
        { label: 'Autre service', path: 'autre-service' }
      ],
      'piece-voiture': [
        { label: 'Pièces détachées', path: 'pieces' },
        { label: 'Pièces voiture', path: 'piece-voiture' }
      ],
      'piece-moto': [
        { label: 'Pièces détachées', path: 'pieces' },
        { label: 'Pièces moto', path: 'piece-moto' }
      ],
      'autre-piece': [
        { label: 'Pièces détachées', path: 'pieces' },
        { label: 'Autre pièce', path: 'autre-piece' }
      ]
    };

    return hierarchies[category] || [{ label: 'Autres', path: 'other' }];
  };

  // Construction du fil d'ariane
  const buildBreadcrumb = (): BreadcrumbItem[] => {
    const breadcrumbItems: BreadcrumbItem[] = [
      { label: 'Accueil', path: 'home' }
    ];

    // Ajouter la hiérarchie de catégories
    const categoryHierarchy = getCategoryHierarchy(vehicle.category);
    breadcrumbItems.push(...categoryHierarchy);

    // Ajouter la marque si disponible
    if (vehicle.brand) {
      breadcrumbItems.push({
        label: vehicle.brand,
        path: `${vehicle.category}/${vehicle.brand.toLowerCase()}`
      });
    }

    // Ajouter le titre du véhicule (sans lien car c'est la page actuelle)
    breadcrumbItems.push({
      label: vehicle.title
    });

    return breadcrumbItems;
  };

  const breadcrumbItems = buildBreadcrumb();

  const handleClick = (path?: string) => {
    if (path && onNavigate) {
      onNavigate(path);
    }
  };

  return (
    <nav className="bg-white border-b border-gray-200 py-3">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ol className="flex items-center space-x-2 text-sm">
          {breadcrumbItems.map((item, index) => (
            <li key={index} className="flex items-center">
              {index === 0 && (
                <Home className="h-4 w-4 mr-1 text-gray-400" />
              )}
              
              {item.path ? (
                <button
                  onClick={() => handleClick(item.path)}
                  className="text-primary-bolt-500 hover:text-primary-bolt-600 hover:underline transition-colors font-medium"
                >
                  {item.label}
                </button>
              ) : (
                <span className="text-gray-900 font-medium">{item.label}</span>
              )}
              
              {index < breadcrumbItems.length - 1 && (
                <ChevronRight className="h-4 w-4 mx-2 text-gray-400" />
              )}
            </li>
          ))}
        </ol>
      </div>
    </nav>
  );
};