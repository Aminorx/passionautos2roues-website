import React from 'react';
import { X, Building2, MapPin, Phone, Globe, FileText, Briefcase } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/lib/supabase';
// import { useToast } from '@/hooks/use-toast'; // Hook non disponible

// Schéma de validation pour le profil professionnel
const professionalProfileSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  phone: z.string().min(10, 'Le téléphone doit contenir au moins 10 chiffres').optional().or(z.literal('')),
  professionalPhone: z.string().min(10, 'Le téléphone professionnel est requis'),
  whatsapp: z.string().optional(),
  companyName: z.string().min(2, 'Le nom de l\'entreprise est requis'),
  siret: z.string().min(14, 'Le SIRET doit contenir 14 chiffres').optional().or(z.literal('')),
  website: z.string().url('URL non valide').optional().or(z.literal('')),
  address: z.string().min(5, 'L\'adresse est requise'),
  city: z.string().min(2, 'La ville est requise'),
  postalCode: z.string().min(5, 'Le code postal doit contenir 5 chiffres'),
  specialties: z.array(z.string()).min(1, 'Veuillez sélectionner au moins une spécialité'),
  bio: z.string().max(1000, 'La bio ne peut pas dépasser 1000 caractères').optional()
});

type ProfessionalProfileData = z.infer<typeof professionalProfileSchema>;

interface ProfessionalProfileFormProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  initialData?: {
    name?: string;
    email?: string;
  };
}

const SPECIALTIES_OPTIONS = [
  'Concessionnaire automobile',
  'Garage et réparation',
  'Vente de véhicules d\'occasion',
  'Pièces détachées',
  'Carrosserie et peinture',
  'Tuning et modifications',
  'Véhicules de collection',
  'Motos et scooters',
  'Véhicules utilitaires',
  'Location de véhicules',
  'Expertise automobile',
  'Assurance automobile'
];

export const ProfessionalProfileForm: React.FC<ProfessionalProfileFormProps> = ({
  isOpen,
  onClose,
  onComplete,
  initialData = {}
}) => {
  // const { toast } = useToast(); // Hook non disponible
  
  const form = useForm<ProfessionalProfileData>({
    resolver: zodResolver(professionalProfileSchema),
    defaultValues: {
      name: initialData.name || '',
      phone: '',
      professionalPhone: '',
      whatsapp: '',
      companyName: '',
      siret: '',
      website: '',
      address: '',
      city: '',
      postalCode: '',
      specialties: [],
      bio: ''
    }
  });

  const watchedSpecialties = form.watch('specialties');

  const handleSpecialtyChange = (specialty: string, checked: boolean) => {
    const currentSpecialties = watchedSpecialties || [];
    if (checked) {
      form.setValue('specialties', [...currentSpecialties, specialty]);
    } else {
      form.setValue('specialties', currentSpecialties.filter(s => s !== specialty));
    }
  };

  const onSubmit = async (data: ProfessionalProfileData) => {
    try {
      console.log('🔧 Soumission profil professionnel:', data);
      
      // Obtenir le token d'authentification depuis Supabase
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Session non disponible');
      }
      
      // Appeler l'API pour finaliser l'onboarding
      const response = await fetch('/api/profile/complete', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          ...data,
          type: 'professional'
        })
      });

      if (!response.ok) throw new Error('Erreur lors de la mise à jour');

      alert("✅ Profil professionnel complété !\nVotre compte professionnel est maintenant actif et prêt à l'emploi.");

      onComplete();
    } catch (error) {
      console.error('❌ Erreur:', error);
      alert("❌ Erreur\nUne erreur est survenue. Veuillez réessayer.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto relative animate-in fade-in-0 zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white rounded-t-xl">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Building2 className="h-6 w-6 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              Finaliser mon compte professionnel
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-8">
          <div className="text-center mb-6">
            <p className="text-gray-600">
              Configurons votre profil professionnel pour optimiser votre visibilité sur PassionAuto2Roues
            </p>
          </div>

          {/* Informations personnelles */}
          <section className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
              📋 Informations personnelles
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Nom */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Briefcase className="inline h-4 w-4 mr-2" />
                  Nom du responsable *
                </label>
                <input
                  {...form.register('name')}
                  type="text"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Votre nom et prénom"
                />
                {form.formState.errors.name && (
                  <p className="mt-1 text-sm text-red-600">{form.formState.errors.name.message}</p>
                )}
              </div>

              {/* Téléphone personnel */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Phone className="inline h-4 w-4 mr-2" />
                  Téléphone personnel
                </label>
                <input
                  {...form.register('phone')}
                  type="tel"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="06 12 34 56 78"
                />
                {form.formState.errors.phone && (
                  <p className="mt-1 text-sm text-red-600">{form.formState.errors.phone.message}</p>
                )}
              </div>

              {/* Téléphone professionnel */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Phone className="inline h-4 w-4 mr-2" />
                  Téléphone professionnel *
                </label>
                <input
                  {...form.register('professionalPhone')}
                  type="tel"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="01 23 45 67 89"
                />
                {form.formState.errors.professionalPhone && (
                  <p className="mt-1 text-sm text-red-600">{form.formState.errors.professionalPhone.message}</p>
                )}
              </div>

              {/* WhatsApp */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  WhatsApp Business (optionnel)
                </label>
                <input
                  {...form.register('whatsapp')}
                  type="tel"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Numéro WhatsApp pour les clients"
                />
              </div>
            </div>
          </section>

          {/* Informations entreprise */}
          <section className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
              🏢 Informations entreprise
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Nom de l'entreprise */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Building2 className="inline h-4 w-4 mr-2" />
                  Nom de l'entreprise *
                </label>
                <input
                  {...form.register('companyName')}
                  type="text"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Auto Passion SARL, Garage Martin..."
                />
                {form.formState.errors.companyName && (
                  <p className="mt-1 text-sm text-red-600">{form.formState.errors.companyName.message}</p>
                )}
              </div>

              {/* SIRET */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FileText className="inline h-4 w-4 mr-2" />
                  SIRET (optionnel)
                </label>
                <input
                  {...form.register('siret')}
                  type="text"
                  maxLength={14}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="12345678901234"
                />
                {form.formState.errors.siret && (
                  <p className="mt-1 text-sm text-red-600">{form.formState.errors.siret.message}</p>
                )}
              </div>

              {/* Site web */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Globe className="inline h-4 w-4 mr-2" />
                  Site web (optionnel)
                </label>
                <input
                  {...form.register('website')}
                  type="url"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="https://www.mongarage.fr"
                />
                {form.formState.errors.website && (
                  <p className="mt-1 text-sm text-red-600">{form.formState.errors.website.message}</p>
                )}
              </div>

              {/* Adresse */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="inline h-4 w-4 mr-2" />
                  Adresse complète *
                </label>
                <input
                  {...form.register('address')}
                  type="text"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="123 Avenue des Champs-Élysées"
                />
                {form.formState.errors.address && (
                  <p className="mt-1 text-sm text-red-600">{form.formState.errors.address.message}</p>
                )}
              </div>

              {/* Ville */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ville *
                </label>
                <input
                  {...form.register('city')}
                  type="text"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Paris, Lyon, Marseille..."
                />
                {form.formState.errors.city && (
                  <p className="mt-1 text-sm text-red-600">{form.formState.errors.city.message}</p>
                )}
              </div>

              {/* Code postal */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Code postal *
                </label>
                <input
                  {...form.register('postalCode')}
                  type="text"
                  maxLength={5}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="75001"
                />
                {form.formState.errors.postalCode && (
                  <p className="mt-1 text-sm text-red-600">{form.formState.errors.postalCode.message}</p>
                )}
              </div>
            </div>
          </section>

          {/* Spécialités */}
          <section className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
              ⚙️ Vos spécialités *
            </h3>
            <div className="grid md:grid-cols-3 gap-3">
              {SPECIALTIES_OPTIONS.map((specialty) => (
                <label key={specialty} className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={watchedSpecialties?.includes(specialty) || false}
                    onChange={(e) => handleSpecialtyChange(specialty, e.target.checked)}
                    className="mt-0.5 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">{specialty}</span>
                </label>
              ))}
            </div>
            {form.formState.errors.specialties && (
              <p className="text-sm text-red-600">{form.formState.errors.specialties.message}</p>
            )}
          </section>

          {/* Bio */}
          <section className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
              📝 Présentation de votre entreprise (optionnel)
            </h3>
            <div>
              <textarea
                {...form.register('bio')}
                rows={4}
                maxLength={1000}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                placeholder="Décrivez votre entreprise, votre expertise, vos services... Cela aidera les clients à mieux vous connaître."
              />
              <div className="text-right text-xs text-gray-500 mt-1">
                {form.watch('bio')?.length || 0}/1000 caractères
              </div>
              {form.formState.errors.bio && (
                <p className="mt-1 text-sm text-red-600">{form.formState.errors.bio.message}</p>
              )}
            </div>
          </section>

          {/* Footer */}
          <div className="flex justify-between items-center pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-gray-600 hover:text-gray-800 font-medium transition-colors"
            >
              Retour
            </button>
            
            <button
              type="submit"
              disabled={form.formState.isSubmitting}
              className="px-8 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {form.formState.isSubmitting ? 'Finalisation...' : 'Finaliser mon profil professionnel'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};