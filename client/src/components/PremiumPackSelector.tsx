import React from 'react';
import { Check, Crown, Zap, Star } from 'lucide-react';
import { PREMIUM_PACKS, PremiumPack } from '@/types/premium';

interface PremiumPackSelectorProps {
  selectedPack: string;
  onSelectPack: (packId: string) => void;
}

export const PremiumPackSelector: React.FC<PremiumPackSelectorProps> = ({
  selectedPack,
  onSelectPack,
}) => {
  const getPackIcon = (packId: string) => {
    switch (packId) {
      case 'daily':
        return <Zap className="h-6 w-6 text-white" />;
      case 'weekly':
        return <Star className="h-6 w-6 text-white" />;
      case 'monthly':
        return <Crown className="h-6 w-6 text-white" />;
      default:
        return <Check className="h-6 w-6 text-white" />;
    }
  };

  const getPackColor = (packId: string) => {
    switch (packId) {
      case 'daily':
        return 'from-blue-500 to-blue-600';
      case 'weekly':
        return 'from-purple-500 to-purple-600';
      case 'monthly':
        return 'from-yellow-500 to-yellow-600';
      default:
        return 'from-green-500 to-green-600';
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Options de visibilité
        </h2>
        <p className="text-gray-600">
          Choisissez votre pack premium pour augmenter la visibilité de votre annonce
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        {PREMIUM_PACKS.filter(pack => pack.id !== 'free').map((pack) => (
          <div
            key={pack.id}
            className={`relative rounded-2xl border-2 transition-all duration-200 cursor-pointer ${
              selectedPack === pack.id
                ? 'border-primary-bolt-500 bg-primary-bolt-50 shadow-lg'
                : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
            } ${pack.mostPopular ? 'ring-2 ring-purple-500 ring-opacity-50 mt-6' : ''}`}
            onClick={() => onSelectPack(pack.id)}
          >
            {pack.mostPopular && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                <span className="bg-purple-500 text-white text-xs font-semibold px-4 py-1.5 rounded-full whitespace-nowrap shadow-lg">
                  LE PLUS POPULAIRE
                </span>
              </div>
            )}

            <div className="p-6">
              {/* Icône */}
              <div className={`w-12 h-12 bg-gradient-to-r ${getPackColor(pack.id)} rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                {getPackIcon(pack.id)}
              </div>

              {/* Nom du pack */}
              <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
                {pack.name}
              </h3>

              {/* Prix */}
              <div className="text-center mb-4">
                {pack.price === 0 ? (
                  <span className="text-2xl font-bold text-green-600">Gratuit</span>
                ) : (
                  <div>
                    <span className="text-3xl font-bold text-gray-900">{pack.price}€</span>
                    {pack.duration > 1 && (
                      <span className="text-sm text-gray-500 ml-1">
                        / {pack.duration} jour{pack.duration > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Description */}
              <p className="text-sm text-gray-600 text-center mb-4">
                {pack.description}
              </p>

              {/* Fonctionnalités */}
              <ul className="space-y-2">
                {pack.features.map((feature, index) => (
                  <li key={index} className="flex items-center text-sm text-gray-700">
                    <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              {/* Économies */}
              {pack.id === 'weekly' && (
                <div className="mt-4 text-center">
                  <span className="text-xs text-green-600 font-semibold bg-green-100 px-2 py-1 rounded-full">
                    Économie de 28% vs quotidien
                  </span>
                </div>
              )}
              {pack.id === 'monthly' && (
                <div className="mt-4 text-center">
                  <span className="text-xs text-green-600 font-semibold bg-green-100 px-2 py-1 rounded-full">
                    Économie de 33% vs quotidien
                  </span>
                </div>
              )}
            </div>

            {/* Indicateur de sélection */}
            {selectedPack === pack.id && (
              <div className="absolute top-4 right-4">
                <div className="w-6 h-6 bg-primary-bolt-500 rounded-full flex items-center justify-center">
                  <Check className="h-4 w-4 text-white" />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Information additionnelle */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mt-6">
        <div className="flex items-start space-x-3">
          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <Check className="h-4 w-4 text-white" />
          </div>
          <div>
            <h4 className="font-semibold text-blue-900 mb-1">
              Comment fonctionne la remontée ?
            </h4>
            <p className="text-sm text-blue-800">
              Les annonces avec remontée apparaissent en premier dans les résultats de recherche, 
              augmentant significativement leur visibilité et les chances de contact.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};