import React from 'react';
import { X, User, MapPin, Phone, MessageCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/lib/supabase';
// import { useToast } from '@/hooks/use-toast'; // Hook non disponible

// Schéma de validation pour le profil personnel
const personalProfileSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  phone: z.string().min(10, 'Le téléphone doit contenir au moins 10 chiffres').optional().or(z.literal('')),
  whatsapp: z.string().optional(),
  city: z.string().min(2, 'La ville est requise'),
  postalCode: z.string().min(5, 'Le code postal doit contenir 5 chiffres'),
  bio: z.string().max(500, 'La bio ne peut pas dépasser 500 caractères').optional()
});

type PersonalProfileData = z.infer<typeof personalProfileSchema>;

interface PersonalProfileFormProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  initialData?: {
    name?: string;
    email?: string;
  };
}

export const PersonalProfileForm: React.FC<PersonalProfileFormProps> = ({
  isOpen,
  onClose,
  onComplete,
  initialData = {}
}) => {
  // const { toast } = useToast(); // Hook non disponible
  
  const form = useForm<PersonalProfileData>({
    resolver: zodResolver(personalProfileSchema),
    defaultValues: {
      name: initialData.name || '',
      phone: '',
      whatsapp: '',
      city: '',
      postalCode: '',
      bio: ''
    }
  });

  const onSubmit = async (data: PersonalProfileData) => {
    try {
      console.log('🔧 Soumission profil personnel:', data);
      
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
          type: 'individual'
        })
      });

      if (!response.ok) throw new Error('Erreur lors de la mise à jour');

      alert("✅ Profil complété !\nVotre compte personnel est maintenant prêt à l'emploi.");

      onComplete();
    } catch (error) {
      console.error('❌ Erreur:', error);
      alert("❌ Erreur\nUne erreur est survenue. Veuillez réessayer.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative animate-in fade-in-0 zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white rounded-t-xl">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <User className="h-6 w-6 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              Finaliser mon compte personnel
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
        <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-6">
          <div className="text-center mb-6">
            <p className="text-gray-600">
              Quelques informations pour personnaliser votre expérience sur PassionAuto2Roues
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Nom */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="inline h-4 w-4 mr-2" />
                Nom complet *
              </label>
              <input
                {...form.register('name')}
                type="text"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Votre nom et prénom"
              />
              {form.formState.errors.name && (
                <p className="mt-1 text-sm text-red-600">{form.formState.errors.name.message}</p>
              )}
            </div>

            {/* Téléphone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Phone className="inline h-4 w-4 mr-2" />
                Téléphone
              </label>
              <input
                {...form.register('phone')}
                type="tel"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="06 12 34 56 78"
              />
              {form.formState.errors.phone && (
                <p className="mt-1 text-sm text-red-600">{form.formState.errors.phone.message}</p>
              )}
            </div>

            {/* WhatsApp */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MessageCircle className="inline h-4 w-4 mr-2" />
                WhatsApp (optionnel)
              </label>
              <input
                {...form.register('whatsapp')}
                type="tel"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Même numéro ou différent"
              />
            </div>

            {/* Ville */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="inline h-4 w-4 mr-2" />
                Ville *
              </label>
              <input
                {...form.register('city')}
                type="text"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="75001"
              />
              {form.formState.errors.postalCode && (
                <p className="mt-1 text-sm text-red-600">{form.formState.errors.postalCode.message}</p>
              )}
            </div>

            {/* Bio */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                À propos de vous (optionnel)
              </label>
              <textarea
                {...form.register('bio')}
                rows={3}
                maxLength={500}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Parlez-nous de votre passion pour l'automobile, vos préférences..."
              />
              <div className="text-right text-xs text-gray-500 mt-1">
                {form.watch('bio')?.length || 0}/500 caractères
              </div>
              {form.formState.errors.bio && (
                <p className="mt-1 text-sm text-red-600">{form.formState.errors.bio.message}</p>
              )}
            </div>
          </div>

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
              className="px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {form.formState.isSubmitting ? 'Finalisation...' : 'Finaliser mon profil'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};