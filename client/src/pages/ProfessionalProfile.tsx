import React, { useState, useEffect } from 'react';
import { useRoute } from 'wouter';
import { Building2, CheckCircle, Phone, Mail, MapPin, Calendar, Users, Star } from 'lucide-react';

interface ProfessionalAccount {
  id: number;
  userId: string;
  company_name: string;
  company_description?: string;
  company_address?: string;
  company_phone?: string;
  company_email?: string;
  website?: string;
  siret?: string;
  verification_status: string;
  is_verified: boolean;
  created_at: string;
}

interface ProfessionalUser {
  id: string;
  name: string;
  email: string;
  type: string;
}

const ProfessionalProfile: React.FC = () => {
  const [, params] = useRoute('/pro/:id');
  const [professionalAccount, setProfessionalAccount] = useState<ProfessionalAccount | null>(null);
  const [user, setUser] = useState<ProfessionalUser | null>(null);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfessionalProfile = async () => {
      if (!params?.id) return;

      try {
        setIsLoading(true);
        
        // Récupérer les infos du compte professionnel
        const accountResponse = await fetch(`/api/professional-accounts/${params.id}`);
        if (!accountResponse.ok) {
          throw new Error('Professionnel non trouvé');
        }
        
        const accountData = await accountResponse.json();
        setProfessionalAccount(accountData);

        // Récupérer les infos utilisateur
        const userResponse = await fetch(`/api/users/${accountData.userId}`);
        if (userResponse.ok) {
          const userData = await userResponse.json();
          setUser(userData);
        }

        // Récupérer les véhicules du professionnel
        const vehiclesResponse = await fetch(`/api/vehicles/user/${accountData.userId}`);
        if (vehiclesResponse.ok) {
          const vehiclesData = await vehiclesResponse.json();
          setVehicles(vehiclesData.filter((v: any) => v.isActive));
        }

      } catch (error) {
        console.error('Erreur chargement profil professionnel:', error);
        setError('Professionnel non trouvé ou erreur de chargement');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfessionalProfile();
  }, [params?.id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-primary-bolt-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (error || !professionalAccount) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Professionnel non trouvé</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.history.back()}
            className="bg-primary-bolt-500 text-white px-6 py-3 rounded-lg hover:bg-primary-bolt-600 transition-colors"
          >
            Retour
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* En-tête du profil */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex items-start space-x-8">
            <div className="w-24 h-24 bg-gradient-to-r from-primary-bolt-500 to-primary-bolt-600 rounded-full flex items-center justify-center shadow-lg">
              <Building2 className="h-12 w-12 text-white" />
            </div>
            
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{professionalAccount.company_name}</h1>
                {professionalAccount.is_verified && (
                  <div className="flex items-center space-x-1 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                    <CheckCircle className="h-4 w-4" />
                    <span>Vérifié</span>
                  </div>
                )}
              </div>
              
              <p className="text-xl text-gray-600 mb-4">{user?.name}</p>
              
              {professionalAccount.company_description && (
                <p className="text-gray-700 mb-6 max-w-2xl">{professionalAccount.company_description}</p>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {professionalAccount.company_phone && (
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Phone className="h-4 w-4" />
                    <span>{professionalAccount.company_phone}</span>
                  </div>
                )}
                
                {professionalAccount.company_email && (
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Mail className="h-4 w-4" />
                    <span>{professionalAccount.company_email}</span>
                  </div>
                )}
                
                {professionalAccount.company_address && (
                  <div className="flex items-center space-x-2 text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span>{professionalAccount.company_address}</span>
                  </div>
                )}
                
                <div className="flex items-center space-x-2 text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>Membre depuis {new Date(professionalAccount.created_at).toLocaleDateString('fr-FR')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6 text-center">
            <Users className="h-8 w-8 text-primary-bolt-500 mx-auto mb-3" />
            <div className="text-2xl font-bold text-gray-900">{vehicles.length}</div>
            <div className="text-gray-600">Annonces actives</div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6 text-center">
            <Star className="h-8 w-8 text-yellow-500 mx-auto mb-3" />
            <div className="text-2xl font-bold text-gray-900">4.8</div>
            <div className="text-gray-600">Note moyenne</div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6 text-center">
            <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-3" />
            <div className="text-2xl font-bold text-gray-900">100%</div>
            <div className="text-gray-600">Taux de réponse</div>
          </div>
        </div>

        {/* Annonces du professionnel */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Nos véhicules ({vehicles.length})
          </h2>
          
          {vehicles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {vehicles.map((vehicle) => (
                <div key={vehicle.id} className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="h-48 bg-gray-200">
                    {vehicle.images && vehicle.images.length > 0 ? (
                      <img
                        src={vehicle.images[0]}
                        alt={vehicle.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <Building2 className="h-16 w-16" />
                      </div>
                    )}
                  </div>
                  
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{vehicle.title}</h3>
                    <p className="text-primary-bolt-500 font-bold text-lg mb-2">
                      {new Intl.NumberFormat('fr-FR', {
                        style: 'currency',
                        currency: 'EUR',
                        minimumFractionDigits: 0,
                      }).format(vehicle.price)}
                    </p>
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>{vehicle.year}</span>
                      <span>{vehicle.location}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Building2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">Aucune annonce active pour le moment</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfessionalProfile;