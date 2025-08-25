import React from 'react';
import { Heart, ChevronRight, ChevronLeft, MapPin, Calendar } from 'lucide-react';
import { Vehicle } from '../types';
import brandIcon from '@assets/Brand_1752260033631.png';

interface CategorySectionProps {
  title: string;
  vehicles: Vehicle[];
  onViewAll: () => void;
  onVehicleClick: (vehicle: Vehicle) => void;
}

const CategorySectionComponent: React.FC<CategorySectionProps> = ({
  title,
  vehicles,
  onViewAll,
  onVehicleClick
}) => {
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (date: string | Date) => {
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      if (!dateObj || isNaN(dateObj.getTime())) {
        return 'Date inconnue';
      }
      
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - dateObj.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) return "aujourd'hui";
      if (diffDays === 2) return "hier";
      return `il y a ${diffDays} jours`;
    } catch (error) {
      return 'Date inconnue';
    }
  };

  const getCategoryIcon = (category: string) => {
    return (
      <img 
        src={brandIcon} 
        alt="Brand icon" 
        className="w-12 h-12 opacity-60"
      />
    );
  };

  if (vehicles.length === 0) return null;

  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Container with background and padding */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-primary-bolt-500">{title}</h2>
            <button
              onClick={onViewAll}
              className="flex items-center space-x-1 text-primary-bolt-500 hover:text-primary-bolt-600 font-medium transition-colors"
            >
              <span>Voir plus d'annonces</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Listings Grid - Wider cards with better spacing */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {vehicles.slice(0, 4).map((vehicle, index) => (
              <div
                key={vehicle.id}
                onClick={() => onVehicleClick(vehicle)}
                className="bg-gray-50 rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-200 cursor-pointer group overflow-hidden hover:scale-105 transform"
              >
                {/* Image */}
                <div className="relative h-48 bg-gray-100 overflow-hidden">
                  {vehicle.images.length > 0 ? (
                    <img
                      src={vehicle.images[0]}
                      alt={vehicle.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl">
                      {getCategoryIcon(vehicle.category)}
                    </div>
                  )}
                  
                  {/* Favorite Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      // Handle favorite
                    }}
                    className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-sm hover:shadow-md transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Heart className="h-4 w-4 text-gray-600 hover:text-red-500 transition-colors" />
                  </button>

                  {/* Pro Badge */}
                  {vehicle.user?.type === 'professional' && (
                    <div className="absolute top-3 left-3 bg-primary-bolt-500 text-white px-2 py-1 rounded text-xs font-medium">
                      Pro
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-6">
                  {/* Title */}
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 line-clamp-2 leading-tight">
                    {vehicle.title}
                  </h3>

                  {/* Price */}
                  <div className="text-xl font-bold text-primary-bolt-500 mb-4">
                    {formatPrice(vehicle.price)}
                  </div>

                  {/* Location and Date */}
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span className="truncate">{vehicle.location}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span>{formatDate(vehicle.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export const CategorySection = React.memo(CategorySectionComponent);