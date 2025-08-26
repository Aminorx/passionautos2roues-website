import React from 'react';
import { Building, ArrowRight, Star, Crown, TrendingUp } from 'lucide-react';

interface ConversionBannerProps {
  onConvert: () => void;
}

export const ConversionBanner: React.FC<ConversionBannerProps> = ({ onConvert }) => {
  return (
    <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-purple-700 rounded-2xl p-6 text-white shadow-xl border border-blue-200 mb-6">
      {/* Background decorations */}
      <div className="absolute inset-0 bg-black/10 rounded-2xl"></div>
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
      
      <div className="relative z-10">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-white/20 p-3 rounded-xl">
              <Building className="h-8 w-8 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-1">Passez en compte professionnel</h3>
              <p className="text-blue-100 text-sm font-medium">
                Accédez à des fonctionnalités exclusives pour développer votre activité
              </p>
            </div>
          </div>
          <button
            onClick={onConvert}
            className="bg-white text-blue-700 hover:bg-blue-50 px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <span>Commencer</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
        
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-3">
            <div className="bg-yellow-400/20 p-2 rounded-lg">
              <Crown className="h-5 w-5 text-yellow-300" />
            </div>
            <div>
              <p className="font-semibold text-sm">Annonces premium</p>
              <p className="text-blue-100 text-xs">Visibilité prioritaire</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="bg-green-400/20 p-2 rounded-lg">
              <TrendingUp className="h-5 w-5 text-green-300" />
            </div>
            <div>
              <p className="font-semibold text-sm">Boutique dédiée</p>
              <p className="text-blue-100 text-xs">Page professionelle</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="bg-purple-400/20 p-2 rounded-lg">
              <Star className="h-5 w-5 text-purple-300" />
            </div>
            <div>
              <p className="font-semibold text-sm">Badge vérifié</p>
              <p className="text-blue-100 text-xs">Crédibilité renforcée</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};