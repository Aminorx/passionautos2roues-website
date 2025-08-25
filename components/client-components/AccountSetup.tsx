import React, { useState } from 'react';
import { User, Building, MapPin, Camera, CheckCircle, ArrowRight } from 'lucide-react';
import { useApp } from '../contexts/AppContext';

interface AccountSetupProps {
  onComplete: () => void;
}

export const AccountSetup: React.FC<AccountSetupProps> = ({ onComplete }) => {
  const { currentUser, setCurrentUser } = useApp();
  const [step, setStep] = useState(1);
  const [profileData, setProfileData] = useState({
    avatar: '',
    bio: '',
    address: '',
    city: '',
    postalCode: '',
    website: '',
    siret: '',
    specialties: [] as string[],
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handleSpecialtyToggle = (specialty: string) => {
    const newSpecialties = profileData.specialties.includes(specialty)
      ? profileData.specialties.filter(s => s !== specialty)
      : [...profileData.specialties, specialty];
    setProfileData({ ...profileData, specialties: newSpecialties });
  };

  const handleComplete = () => {
    // Update user profile with additional data
    if (currentUser) {
      setCurrentUser({
        ...currentUser,
        ...profileData,
      });
    }
    onComplete();
  };

  const specialtyOptions = [
    'Voitures d\'occasion',
    'Véhicules de luxe',
    'Motos sportives',
    'Scooters urbains',
    'Véhicules utilitaires',
    'Pièces détachées',
    'Réparation',
    'Carrosserie',
    'Mécanique',
    'Électronique auto',
  ];

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-gray-600">Étape {step} sur 3</span>
          <span className="text-sm font-medium text-[#0CBFDE]">{Math.round((step / 3) * 100)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-primary-bolt-500 to-primary-bolt-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(step / 3) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Step 1: Basic Profile */}
      {step === 1 && (
        <div className="space-y-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Complétez votre profil
            </h2>
            <p className="text-gray-600">
              Ajoutez quelques informations pour personnaliser votre compte
            </p>
          </div>

          {/* Avatar Upload */}
          <div className="text-center">
            <div className="relative inline-block">
              <div className="w-24 h-24 bg-gradient-to-r from-primary-bolt-500 to-primary-bolt-600 rounded-full flex items-center justify-center mx-auto mb-4">
                {profileData.avatar ? (
                  <img src={profileData.avatar} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                ) : (
                  <User className="h-12 w-12 text-white" />
                )}
              </div>
              <button className="absolute bottom-0 right-0 bg-white border-2 border-gray-300 rounded-full p-2 hover:bg-gray-50 transition-colors">
                <Camera className="h-4 w-4 text-gray-600" />
              </button>
            </div>
            <p className="text-sm text-gray-600">Ajoutez une photo de profil</p>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Présentation
            </label>
            <textarea
              name="bio"
              value={profileData.bio}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-bolt-500 focus:border-primary-bolt-500 transition-all"
              placeholder={currentUser?.type === 'professional' 
                ? "Présentez votre entreprise et vos services..."
                : "Parlez-nous de vous..."
              }
            />
          </div>

          <button
            onClick={() => setStep(2)}
            className="w-full bg-gradient-to-r from-primary-bolt-500 to-primary-bolt-600 hover:from-primary-bolt-600 hover:to-primary-bolt-700 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center space-x-2"
          >
            <span>Continuer</span>
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* Step 2: Location */}
      {step === 2 && (
        <div className="space-y-6">
          <div className="text-center mb-8">
            <MapPin className="h-12 w-12 text-primary-bolt-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Votre localisation
            </h2>
            <p className="text-gray-600">
              Aidez les acheteurs à vous trouver facilement
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Adresse complète
            </label>
            <input
              type="text"
              name="address"
              value={profileData.address}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-bolt-500 focus:border-primary-bolt-500 transition-all"
              placeholder="123 Rue de la République"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Ville
              </label>
              <input
                type="text"
                name="city"
                value={profileData.city}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-bolt-500 focus:border-primary-bolt-500 transition-all"
                placeholder="Paris"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Code postal
              </label>
              <input
                type="text"
                name="postalCode"
                value={profileData.postalCode}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-bolt-500 focus:border-primary-bolt-500 transition-all"
                placeholder="75001"
              />
            </div>
          </div>

          {currentUser?.type === 'professional' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Site web
                </label>
                <input
                  type="url"
                  name="website"
                  value={profileData.website}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-bolt-500 focus:border-primary-bolt-500 transition-all"
                  placeholder="https://mongarage.com"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  SIRET (optionnel)
                </label>
                <input
                  type="text"
                  name="siret"
                  value={profileData.siret}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-bolt-500 focus:border-primary-bolt-500 transition-all"
                  placeholder="12345678901234"
                />
              </div>
            </div>
          )}

          <div className="flex space-x-4">
            <button
              onClick={() => setStep(1)}
              className="flex-1 py-3 px-6 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Retour
            </button>
            <button
              onClick={() => setStep(3)}
              className="flex-1 bg-gradient-to-r from-primary-bolt-500 to-primary-bolt-600 hover:from-primary-bolt-600 hover:to-primary-bolt-700 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center space-x-2"
            >
              <span>Continuer</span>
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Specialties (for professionals) */}
      {step === 3 && (
        <div className="space-y-6">
          <div className="text-center mb-8">
            <Building className="h-12 w-12 text-primary-bolt-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {currentUser?.type === 'professional' ? 'Vos spécialités' : 'Presque terminé !'}
            </h2>
            <p className="text-gray-600">
              {currentUser?.type === 'professional' 
                ? 'Sélectionnez vos domaines d\'expertise'
                : 'Votre compte est prêt à être utilisé'
              }
            </p>
          </div>

          {currentUser?.type === 'professional' ? (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-4">
                Sélectionnez vos spécialités
              </label>
              <div className="grid grid-cols-2 gap-3">
                {specialtyOptions.map((specialty) => (
                  <button
                    key={specialty}
                    onClick={() => handleSpecialtyToggle(specialty)}
                    className={`p-3 text-left border-2 rounded-xl transition-all ${
                      profileData.specialties.includes(specialty)
                        ? 'border-primary-bolt-500 bg-primary-bolt-50 text-primary-bolt-500'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{specialty}</span>
                      {profileData.specialties.includes(specialty) && (
                        <CheckCircle className="h-4 w-4" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Félicitations !
              </h3>
              <p className="text-gray-600">
                Votre compte est maintenant configuré et prêt à être utilisé.
              </p>
            </div>
          )}

          <div className="flex space-x-4">
            <button
              onClick={() => setStep(2)}
              className="flex-1 py-3 px-6 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Retour
            </button>
            <button
              onClick={handleComplete}
              className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center space-x-2"
            >
              <CheckCircle className="h-5 w-5" />
              <span>Terminer</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};