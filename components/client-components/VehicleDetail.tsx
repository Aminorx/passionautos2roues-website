import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, Gauge, MapPin, Heart, MessageCircle, Share2, Crown, Eye, Phone, Mail, CheckCircle, X, Send } from 'lucide-react';
import { Vehicle } from '../types';
import { WhatsAppContact } from './WhatsAppContact';
import { VehicleCard } from './VehicleCard';
import { Breadcrumb } from './Breadcrumb';
import { useApp } from '../contexts/AppContext';
import { AuthModal } from './AuthModal';
import { Footer } from './Footer';
import brandIcon from '@assets/Brand_1752260033631.png';

interface VehicleDetailProps {
  vehicle: Vehicle;
  onBack: () => void;
  onVehicleSelect?: (vehicle: Vehicle) => void;
  onNavigate?: (path: string) => void;
  setCurrentView?: (view: string) => void;
}

export const VehicleDetail: React.FC<VehicleDetailProps> = ({ vehicle, onBack, onVehicleSelect, onNavigate, setCurrentView }) => {
  const { currentUser, setShowAuthModal: setGlobalAuthModal, vehicles } = useApp();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showContactInfo, setShowContactInfo] = useState(false);
  const [showMessageForm, setShowMessageForm] = useState(false);
  const [messageText, setMessageText] = useState('');

  // Function to handle navigation from footer links
  const handleFooterNavigation = (view: string) => {
    onBack(); // Close vehicle detail
    if (setCurrentView) {
      setCurrentView(view); // Navigate to requested view
      // Scroll to top after navigation
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
    }
  };

  // Scroll to top when vehicle changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [vehicle.id]);

  // Function to find similar vehicles
  const getSimilarVehicles = (currentVehicle: Vehicle, limit: number = 4): Vehicle[] => {
    // Get all vehicles in the same subcategory (excluding current)
    const sameSubcategoryVehicles = vehicles.filter(v => 
      v.id !== currentVehicle.id && 
      v.category === currentVehicle.category
    );

    // If no other vehicles in subcategory, return empty array
    if (sameSubcategoryVehicles.length === 0) {
      return [];
    }

    // Sort vehicles by multiple criteria with priority scoring
    const scoredVehicles = sameSubcategoryVehicles.map(v => {
      let score = 0;
      
      // Same brand gets highest priority (100 points)
      if (v.brand === currentVehicle.brand) {
        score += 100;
      }

      // Price similarity (0-50 points based on price difference)
      const priceDiff = Math.abs(v.price - currentVehicle.price);
      const maxPriceDiff = Math.max(currentVehicle.price, 10000); // Avoid division by 0
      const priceScore = Math.max(0, 50 - (priceDiff / maxPriceDiff) * 50);
      score += priceScore;

      // Same type gets bonus points (30 points)
      if (v.type === currentVehicle.type) {
        score += 30;
      }

      // Same condition gets bonus points (20 points)
      if (v.condition === currentVehicle.condition) {
        score += 20;
      }

      // Year similarity (0-20 points)
      if (v.year && currentVehicle.year) {
        const yearDiff = Math.abs(v.year - currentVehicle.year);
        const yearScore = Math.max(0, 20 - yearDiff);
        score += yearScore;
      }

      // Mileage similarity for used vehicles (0-15 points)
      if (v.mileage && currentVehicle.mileage && currentVehicle.condition === 'used') {
        const mileageDiff = Math.abs(v.mileage - currentVehicle.mileage);
        const maxMileageDiff = Math.max(currentVehicle.mileage, 50000);
        const mileageScore = Math.max(0, 15 - (mileageDiff / maxMileageDiff) * 15);
        score += mileageScore;
      }

      return { vehicle: v, score };
    });

    // Sort by score (highest first) and return top vehicles
    return scoredVehicles
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(item => item.vehicle);
  };

  const similarVehicles = getSimilarVehicles(vehicle);

  // Function to find compatible spare parts for damaged vehicles
  const getCompatibleSpareParts = (currentVehicle: Vehicle): Vehicle[] => {
    if (currentVehicle.condition !== 'damaged') return [];
    
    return vehicles.filter(v => 
      v.category === 'piece-voiture' && // Only spare parts
      v.brand === currentVehicle.brand && // Same brand
      (
        v.model.toLowerCase().includes(currentVehicle.model.toLowerCase()) || // Model matches
        v.description.toLowerCase().includes(currentVehicle.model.toLowerCase()) || // Description mentions model
        v.features?.some(feature => 
          feature.toLowerCase().includes(currentVehicle.model.toLowerCase())
        ) // Features mention model
      )
    );
  };

  const compatibleParts = getCompatibleSpareParts(vehicle);

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

  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === vehicle.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? vehicle.images.length - 1 : prev - 1
    );
  };

  const handleBreadcrumbNavigation = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    } else {
      onBack(); // Fallback to going back
    }
  };

  const handleMessageClick = () => {
    if (currentUser) {
      setShowMessageForm(true);
    } else {
      setGlobalAuthModal(true);
    }
  };

  const handleSendMessage = () => {
    if (!messageText.trim()) return;
    
    // Ici on enverrait le message via une API
    console.log('Message envoyé:', {
      from: currentUser?.id,
      to: vehicle.userId,
      vehicleId: vehicle.id,
      message: messageText
    });
    
    setMessageText('');
    setShowMessageForm(false);
    // Afficher une confirmation
    alert('Message envoyé avec succès !');
  };

  return (
    <div className="min-h-screen bg-gray-50 relative z-0">
      {/* Breadcrumb */}
      <Breadcrumb vehicle={vehicle} onNavigate={handleBreadcrumbNavigation} />
      
      {/* Back Button */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-600 hover:text-primary-bolt-500 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Retour aux annonces</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Images and Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            {vehicle.images.length > 0 && (
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="relative h-96 bg-gray-200">
                  <img
                    src={vehicle.images[currentImageIndex]}
                    alt={vehicle.title}
                    className="w-full h-full object-cover"
                  />
                  
                  {vehicle.images.length > 1 && (
                    <div>
                      <button
                        onClick={prevImage}
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
                      >
                        ←
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
                      >
                        →
                      </button>
                    </div>
                  )}

                  {/* Premium Badge */}
                  {vehicle.isPremium && (
                    <div className="absolute top-4 left-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center space-x-1">
                      <Crown className="h-4 w-4" />
                      <span>Premium</span>
                    </div>
                  )}

                  {/* Favoris et Partage Icons */}
                  <div className="absolute top-4 right-4 flex space-x-2">
                    <button className="bg-white bg-opacity-90 hover:bg-opacity-100 p-2 rounded-full shadow-lg transition-all">
                      <Heart className="h-5 w-5 text-gray-600 hover:text-red-500" />
                    </button>
                    <button className="bg-white bg-opacity-90 hover:bg-opacity-100 p-2 rounded-full shadow-lg transition-all">
                      <Share2 className="h-5 w-5 text-gray-600 hover:text-blue-500" />
                    </button>
                  </div>

                  {/* Image Counter */}
                  {vehicle.images.length > 1 && (
                    <div className="absolute bottom-4 right-4 bg-black bg-opacity-70 text-white px-3 py-1 rounded-full text-sm">
                      {currentImageIndex + 1} / {vehicle.images.length}
                    </div>
                  )}
                </div>

                {/* Image Thumbnails */}
                {vehicle.images.length > 1 && (
                  <div className="p-4 flex space-x-2 overflow-x-auto">
                    {vehicle.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                          currentImageIndex === index
                            ? 'border-[#0CBFDE]'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <img
                          src={image}
                          alt={`${vehicle.title} ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Vehicle Details */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">{vehicle.title}</h1>
                  <div className="flex items-center space-x-4 text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Eye className="h-4 w-4" />
                      <span>{vehicle.views} vues</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Heart className="h-4 w-4" />
                      <span>{vehicle.favorites} favoris</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-primary-bolt-500 mb-1">
                    {formatPrice(vehicle.price)}
                  </div>
                  {vehicle.user?.type === 'professional' && (
                    <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-sm font-medium">
                      Professionnel
                    </span>
                  )}
                </div>
              </div>

              {/* Key Information - Conditional based on category */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                {/* Localisation - toujours affichée */}
                <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                  <MapPin className="h-5 w-5 text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-600">Localisation</div>
                    <div className="font-semibold">{vehicle.location}</div>
                  </div>
                </div>

                {/* Année - seulement pour les véhicules, pas pour les services */}
                {vehicle.category !== 'services' && (
                  <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <div>
                      <div className="text-sm text-gray-600">Année</div>
                      <div className="font-semibold">{vehicle.year}</div>
                    </div>
                  </div>
                )}

                {/* Kilométrage - seulement pour les véhicules avec kilométrage */}
                {vehicle.category !== 'services' && vehicle.mileage && vehicle.mileage > 0 && (
                  <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                    <Gauge className="h-5 w-5 text-gray-400" />
                    <div>
                      <div className="text-sm text-gray-600">Kilométrage</div>
                      <div className="font-semibold">{formatMileage(vehicle.mileage)}</div>
                    </div>
                  </div>
                )}

                {/* Marque - seulement pour les véhicules, pas pour les services */}
                {vehicle.category !== 'services' && vehicle.brand !== 'Non spécifié' && (
                  <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                    <img 
                      src={brandIcon} 
                      alt="Brand icon" 
                      className="w-6 h-6 opacity-60"
                    />
                    <div>
                      <div className="text-sm text-gray-600">Marque</div>
                      <div className="font-semibold">{vehicle.brand}</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                  {vehicle.description}
                </p>
              </div>

              {/* Features */}
              {vehicle.features.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Équipements</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {vehicle.features.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-2 p-2 bg-cyan-50 text-[#0CBFDE] rounded-lg">
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-sm font-medium">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Contact and Actions */}
          <div className="space-y-6">
            {/* Contact Card */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-cyan-100 rounded-full flex items-center justify-center">
                  <span className="text-[#0CBFDE] font-semibold text-lg">
                    {vehicle.user?.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{vehicle.user?.name}</h3>
                  {vehicle.user?.type === 'professional' && vehicle.user?.companyName && (
                    <p className="text-sm text-gray-600">{vehicle.user.companyName}</p>
                  )}
                  <div className="flex items-center space-x-1 text-green-600 text-sm">
                    <CheckCircle className="h-4 w-4" />
                    <span>Compte vérifié</span>
                  </div>
                </div>
              </div>

              {/* Contact Actions */}
              <div className="space-y-3">
                <button
                  onClick={() => setShowContactInfo(!showContactInfo)}
                  className="w-full bg-primary-bolt-500 text-white py-3 px-4 rounded-xl hover:bg-primary-bolt-600 transition-colors font-semibold flex items-center justify-center space-x-2"
                >
                  <Phone className="h-5 w-5" />
                  <span>Voir le téléphone</span>
                </button>

                {showContactInfo && vehicle.user?.phone && (
                  <div className="p-3 bg-primary-bolt-50 rounded-xl text-center">
                    <a
                      href={`tel:${vehicle.user.phone}`}
                      className="text-lg font-semibold text-primary-bolt-500 hover:text-primary-bolt-600"
                    >
                      {vehicle.user.phone}
                    </a>
                  </div>
                )}

                {/* WhatsApp Button - Mobile Only */}
                {vehicle.user?.whatsapp && (
                  <button
                    onClick={() => {
                      const cleanNumber = vehicle.user!.whatsapp!.replace(/[\s\-\(\)]/g, '').replace(/^\+/, '');
                      const message = `Bonjour, je suis intéressé par votre annonce ${vehicle.title}.`;
                      const whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
                      window.open(whatsappUrl, '_blank');
                    }}
                    className="w-full bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-xl transition-colors font-semibold flex items-center justify-center space-x-2 md:hidden"
                  >
                    <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                    </svg>
                    <span>Contacter sur WhatsApp</span>
                  </button>
                )}

                <button 
                  onClick={handleMessageClick}
                  className="w-full bg-gray-600 text-white py-3 px-4 rounded-xl hover:bg-gray-700 transition-colors font-semibold flex items-center justify-center space-x-2"
                >
                  <MessageCircle className="h-5 w-5" />
                  <span>Envoyer un message</span>
                </button>


              </div>
            </div>

            {/* WhatsApp Contact Component - Desktop/Tablet Only */}
            {vehicle.user?.whatsapp && (
              <div className="hidden md:block">
                <WhatsAppContact
                  whatsappNumber={vehicle.user.whatsapp}
                  listingTitle={vehicle.title}
                  ownerName={vehicle.user.name}
                />
              </div>
            )}



            {/* Safety Tips */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
              <h3 className="font-semibold text-yellow-800 mb-3">🛡️ Conseils de sécurité</h3>
              <ul className="text-sm text-yellow-700 space-y-2">
                <li>• Rencontrez le vendeur en personne</li>
                <li>• Inspectez le véhicule avant l'achat</li>
                <li>• Vérifiez les papiers du véhicule</li>
                <li>• Méfiez-vous des prix trop attractifs</li>
                <li>• Préférez un paiement sécurisé</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Compatible Spare Parts Section - Only for damaged vehicles */}
        {compatibleParts.length > 0 && vehicle.condition === 'damaged' && (
          <div className="mt-12">
            <div className="flex items-center mb-6">
              <div className="bg-orange-100 p-3 rounded-full mr-4">
                <CheckCircle className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Pièces détachées compatibles proposées sur le site</h2>
                <p className="text-gray-600 mt-1">Pièces disponibles compatibles avec ce véhicule</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {compatibleParts.map((part) => (
                <div key={part.id} className="bg-white rounded-lg shadow-md border border-gray-200 p-4">
                  <h3 className="font-semibold text-base text-gray-900 mb-2">{part.title}</h3>
                  
                  <div className="text-xl font-bold text-primary-bolt-600 mb-2">
                    {formatPrice(part.price)}
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-500 mb-4">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>{part.location}</span>
                  </div>

                  <button
                    onClick={() => onVehicleSelect?.(part)}
                    className="w-full bg-primary-bolt-500 text-white px-4 py-2 rounded-lg hover:bg-primary-bolt-600 transition-colors text-sm font-medium"
                  >
                    Voir l'annonce
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Similar Products Section */}
        {similarVehicles.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Ces annonces peuvent vous intéresser</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {similarVehicles.map((similarVehicle) => (
                <VehicleCard
                  key={similarVehicle.id}
                  vehicle={similarVehicle}
                  onClick={() => onVehicleSelect?.(similarVehicle)}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Message Form Modal */}
      {showMessageForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Envoyer un message</h3>
              <button
                onClick={() => setShowMessageForm(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                Message à <span className="font-semibold">{vehicle.user?.name}</span> concernant :
              </p>
              <p className="text-sm font-medium text-gray-900 bg-gray-50 p-2 rounded">{vehicle.title}</p>
            </div>

            <div className="mb-4">
              <textarea
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Tapez votre message ici..."
                className="w-full h-32 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-primary-bolt-500 focus:border-transparent"
                maxLength={500}
              />
              <div className="text-right text-xs text-gray-500 mt-1">
                {messageText.length}/500 caractères
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowMessageForm(false)}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleSendMessage}
                disabled={!messageText.trim()}
                className="flex-1 px-4 py-2 bg-primary-bolt-500 text-white rounded-lg hover:bg-primary-bolt-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
              >
                <Send className="h-4 w-4" />
                <span>Envoyer</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer with custom navigation handler */}
      <Footer setCurrentView={handleFooterNavigation} />
    </div>
  );
};