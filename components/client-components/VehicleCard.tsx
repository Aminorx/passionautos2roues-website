import React, { useState } from 'react';
import { Calendar, Gauge, MapPin, Eye, Heart, Crown, MessageCircle } from 'lucide-react';
import { Vehicle } from '../types';
import brandIcon from '@assets/Brand_1752260033631.png';
import { OptimizedImage } from './OptimizedImage';

interface VehicleCardProps {
  vehicle: Vehicle;
  onClick: () => void;
}

const VehicleCardComponent: React.FC<VehicleCardProps> = ({ vehicle, onClick }) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatMileage = (mileage: number) => {
    return new Intl.NumberFormat('fr-FR').format(mileage) + ' km';
  };

  const getCategoryIcon = (category: string) => {
    return (
      <img 
        src={brandIcon} 
        alt="Brand icon" 
        className="w-16 h-16 opacity-60"
      />
    );
  };

  return (
    <div 
      onClick={onClick}
      className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] cursor-pointer overflow-hidden border border-gray-100"
    >
      {/* Premium Badge */}
      {vehicle.isPremium && (
        <div className="relative">
          <div className="absolute top-3 left-3 z-10 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center space-x-1 shadow-lg">
            <Crown className="h-3 w-3" />
            <span>Premium</span>
          </div>
        </div>
      )}

      {/* Image */}
      <div className="relative h-48 bg-gray-200 overflow-hidden">
        {vehicle.images.length > 0 ? (
          <OptimizedImage
            src={vehicle.images[0]}
            alt={vehicle.title}
            className="w-full h-full object-cover transition-transform duration-200 hover:scale-105"
            fallbackIcon={getCategoryIcon(vehicle.category)}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl">
            {getCategoryIcon(vehicle.category)}
          </div>
        )}
        
        {/* Image count */}
        {vehicle.images.length > 1 && (
          <div className="absolute bottom-3 right-3 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs">
            +{vehicle.images.length - 1} photos
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Title and Price */}
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 flex-1 mr-4">
            {vehicle.title}
          </h3>
          <div className="text-right">
            <div className="text-xl font-bold text-primary-bolt-500">
              {formatPrice(vehicle.price)}
            </div>
            {vehicle.user?.type === 'professional' && (
              <div className="text-xs text-orange-600 font-medium">PRO</div>
            )}
          </div>
        </div>

        {/* Vehicle Details */}
        <div className="grid grid-cols-2 gap-3 mb-4 text-sm text-gray-600">
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-gray-400" />
            <span>{vehicle.year}</span>
          </div>
          
          {vehicle.mileage && (
            <div className="flex items-center space-x-2">
              <Gauge className="h-4 w-4 text-gray-400" />
              <span>{formatMileage(vehicle.mileage)}</span>
            </div>
          )}
          
          <div className="flex items-center space-x-2">
            <MapPin className="h-4 w-4 text-gray-400" />
            <span className="truncate">{vehicle.location}</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="px-2 py-1 bg-gray-100 rounded text-xs font-medium">
              {vehicle.brand}
            </span>
          </div>
        </div>

        {/* Features */}
        {vehicle.features.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-1">
              {vehicle.features.slice(0, 3).map((feature, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-primary-bolt-50 text-primary-bolt-500 text-xs rounded font-medium"
                >
                  {feature}
                </span>
              ))}
              {vehicle.features.length > 3 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded font-medium">
                  +{vehicle.features.length - 3}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Stats and Actions */}
        <div className="flex justify-between items-center pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-4 text-xs text-gray-500">
            <div className="flex items-center space-x-1">
              <Eye className="h-4 w-4" />
              <span>{vehicle.views}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Heart className="h-4 w-4" />
              <span>{vehicle.favorites}</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button 
              className="p-2 text-gray-400 hover:text-red-500 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                // Handle favorite
              }}
            >
              <Heart className="h-4 w-4" />
            </button>
            <button 
              className="p-2 text-gray-400 hover:text-primary-bolt-500 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                // Handle message
              }}
            >
              <MessageCircle className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const VehicleCard = React.memo(VehicleCardComponent);