import React, { useState, useEffect } from 'react';
import { 
  Upload, X, Save, Eye, Settings, PaintBucket, 
  Image as ImageIcon, Camera, Palette, Building2,
  Check, AlertCircle, ArrowLeft
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';

interface CustomizationData {
  company_logo?: string;
  banner_image?: string;
  brand_colors?: {
    primary?: string;
    secondary?: string;
  };
  description?: string;
  specialties?: string[];
  certifications?: string[];
}

interface ProCustomizationProps {
  onBack: () => void;
}

export default function ProCustomization({ onBack }: ProCustomizationProps) {
  const { user } = useAuth();
  const [customization, setCustomization] = useState<CustomizationData>({
    brand_colors: {
      primary: '#3B82F6',
      secondary: '#1E40AF'
    },
    specialties: [],
    certifications: []
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [uploadMessage, setUploadMessage] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [savedMessage, setSavedMessage] = useState('');
  const [activeTab, setActiveTab] = useState('branding');

  // Charger les données existantes
  useEffect(() => {
    if (user?.id) {
      loadCustomizationData();
    }
  }, [user?.id]);

  const loadCustomizationData = async () => {
    try {
      const response = await fetch(`/api/professional-accounts/customization/${user?.id}`);
      if (response.ok) {
        const data = await response.json();
        setCustomization({
          company_logo: data.company_logo,
          banner_image: data.banner_image,
          brand_colors: data.brand_colors || { primary: '#3B82F6', secondary: '#1E40AF' },
          description: data.description,
          specialties: data.specialties || [],
          certifications: data.certifications || []
        });
      }
    } catch (error) {
      console.error('Erreur chargement personnalisation:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (file: File, type: 'logo' | 'banner') => {
    if (!user?.id) {
      setUploadError('Utilisateur non connecté');
      return;
    }

    // Clear previous messages
    setUploadMessage('');
    setUploadError('');
    
    // Set loading state
    if (type === 'logo') {
      setUploadingLogo(true);
    } else {
      setUploadingBanner(true);
    }

    const formData = new FormData();
    formData.append('image', file);
    formData.append('type', type);

    try {
      const response = await fetch('/api/professional-accounts/upload-image', {
        method: 'POST',
        body: formData,
        headers: {
          'X-User-ID': user?.id || ''
        }
      });

      if (response.ok) {
        const { imageUrl } = await response.json();
        setCustomization(prev => ({
          ...prev,
          [type === 'logo' ? 'company_logo' : 'banner_image']: imageUrl
        }));
        setUploadMessage(`${type === 'logo' ? 'Logo' : 'Bannière'} uploadé(e) avec succès !`);
        setTimeout(() => setUploadMessage(''), 3000);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de l\'upload');
      }
    } catch (error) {
      console.error('Erreur upload image:', error);
      setUploadError(error instanceof Error ? error.message : 'Erreur lors de l\'upload de l\'image');
      setTimeout(() => setUploadError(''), 5000);
    } finally {
      if (type === 'logo') {
        setUploadingLogo(false);
      } else {
        setUploadingBanner(false);
      }
    }
  };

  const handleSave = async () => {
    console.log('🎨 DÉMARRAGE SAUVEGARDE - handleSave appelé');
    console.log('📋 DONNÉES À SAUVEGARDER:', customization);
    
    setSaving(true);
    try {
      // Récupérer le token d'authentification Supabase
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      console.log('🔑 TOKEN RÉCUPÉRÉ:', token ? 'Présent' : 'Manquant');

      if (!token) {
        console.error('❌ Token d\'authentification manquant');
        return;
      }

      console.log('📡 ENVOI REQUÊTE VERS API...');
      const response = await fetch('/api/professional-accounts/customization', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-User-ID': user?.id || ''
        },
        body: JSON.stringify({
          ...customization,
          user_id: user?.id
        })
      });

      console.log('📥 RÉPONSE REÇUE:', response.status, response.statusText);

      if (response.ok) {
        console.log('✅ SAUVEGARDE RÉUSSIE');
        setSavedMessage('Modifications sauvegardées avec succès !');
        setTimeout(() => setSavedMessage(''), 3000);
      } else {
        const errorData = await response.json();
        console.error('❌ ERREUR SAUVEGARDE:', errorData);
      }
    } catch (error) {
      console.error('❌ ERREUR EXCEPTION:', error);
    } finally {
      setSaving(false);
    }
  };

  const addSpecialty = () => {
    const specialty = prompt('Ajouter une spécialité:');
    if (specialty && specialty.trim()) {
      setCustomization(prev => ({
        ...prev,
        specialties: [...(prev.specialties || []), specialty.trim()]
      }));
    }
  };

  const removeSpecialty = (index: number) => {
    setCustomization(prev => ({
      ...prev,
      specialties: prev.specialties?.filter((_, i) => i !== index) || []
    }));
  };

  const addCertification = () => {
    const certification = prompt('Ajouter une certification:');
    if (certification && certification.trim()) {
      setCustomization(prev => ({
        ...prev,
        certifications: [...(prev.certifications || []), certification.trim()]
      }));
    }
  };

  const removeCertification = (index: number) => {
    setCustomization(prev => ({
      ...prev,
      certifications: prev.certifications?.filter((_, i) => i !== index) || []
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary-bolt-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Retour</span>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Personnalisation de la boutique</h1>
                <p className="text-gray-600">Configurez l'apparence de votre page professionnelle</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {uploadMessage && (
                <div className="flex items-center space-x-2 text-green-600">
                  <Check className="h-5 w-5" />
                  <span>{uploadMessage}</span>
                </div>
              )}
              {uploadError && (
                <div className="flex items-center space-x-2 text-red-600">
                  <AlertCircle className="h-5 w-5" />
                  <span>{uploadError}</span>
                </div>
              )}
              {savedMessage && (
                <div className="flex items-center space-x-2 text-green-600">
                  <Check className="h-5 w-5" />
                  <span>{savedMessage}</span>
                </div>
              )}
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-primary-bolt-500 hover:bg-primary-bolt-600 disabled:opacity-50 text-white px-6 py-2 rounded-xl font-semibold transition-colors flex items-center space-x-2"
              >
                <Save className="h-4 w-4" />
                <span>{saving ? 'Sauvegarde...' : 'Sauvegarder'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Configuration</h2>
              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab('branding')}
                  className={`w-full text-left px-4 py-3 rounded-xl transition-all ${
                    activeTab === 'branding' 
                      ? 'bg-primary-bolt-50 text-primary-bolt-700 border border-primary-bolt-200' 
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <PaintBucket className="h-5 w-5" />
                    <span>Image de marque</span>
                  </div>
                </button>
                
                <button
                  onClick={() => setActiveTab('content')}
                  className={`w-full text-left px-4 py-3 rounded-xl transition-all ${
                    activeTab === 'content' 
                      ? 'bg-primary-bolt-50 text-primary-bolt-700 border border-primary-bolt-200' 
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Building2 className="h-5 w-5" />
                    <span>Contenu</span>
                  </div>
                </button>
                
                <button
                  onClick={() => setActiveTab('preview')}
                  className={`w-full text-left px-4 py-3 rounded-xl transition-all ${
                    activeTab === 'preview' 
                      ? 'bg-primary-bolt-50 text-primary-bolt-700 border border-primary-bolt-200' 
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Eye className="h-5 w-5" />
                    <span>Aperçu</span>
                  </div>
                </button>
              </nav>
            </div>
          </div>

          {/* Contenu principal */}
          <div className="lg:col-span-3">
            {activeTab === 'branding' && (
              <div className="space-y-6">
                {/* Logo */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Logo de l'entreprise</h3>
                  <div className="flex items-center space-x-6">
                    <div className="w-32 h-32 bg-gray-100 rounded-2xl flex items-center justify-center overflow-hidden">
                      {customization.company_logo ? (
                        <img 
                          src={customization.company_logo} 
                          alt="Logo"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Building2 className="h-16 w-16 text-gray-400" />
                      )}
                    </div>
                    <div>
                      <label className="block">
                        <span className="sr-only">Choisir un logo</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            if (e.target.files?.[0]) {
                              handleImageUpload(e.target.files[0], 'logo');
                            }
                          }}
                          className="hidden"
                        />
                        <div className={`${uploadingLogo ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary-bolt-500 hover:bg-primary-bolt-600 cursor-pointer'} text-white px-4 py-2 rounded-xl inline-flex items-center space-x-2 transition-colors`}>
                          {uploadingLogo ? (
                            <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                          ) : (
                            <Upload className="h-4 w-4" />
                          )}
                          <span>{uploadingLogo ? 'Téléchargement...' : 'Télécharger un logo'}</span>
                        </div>
                      </label>
                      <p className="text-sm text-gray-500 mt-2">PNG, JPG jusqu'à 2MB</p>
                    </div>
                  </div>
                </div>

                {/* Bannière */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Image de bannière</h3>
                  <div className="space-y-4">
                    <div className="h-48 bg-gray-100 rounded-2xl overflow-hidden">
                      {customization.banner_image ? (
                        <img 
                          src={customization.banner_image} 
                          alt="Bannière"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon className="h-16 w-16 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <label className="block">
                      <span className="sr-only">Choisir une bannière</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files?.[0]) {
                            handleImageUpload(e.target.files[0], 'banner');
                          }
                        }}
                        className="hidden"
                      />
                      <div className={`${uploadingBanner ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary-bolt-500 hover:bg-primary-bolt-600 cursor-pointer'} text-white px-4 py-2 rounded-xl inline-flex items-center space-x-2 transition-colors`}>
                        {uploadingBanner ? (
                          <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                        ) : (
                          <Camera className="h-4 w-4" />
                        )}
                        <span>{uploadingBanner ? 'Téléchargement...' : 'Télécharger une bannière'}</span>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Couleurs */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Couleurs de marque</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Couleur principale
                      </label>
                      <div className="flex items-center space-x-3">
                        <input
                          type="color"
                          value={customization.brand_colors?.primary || '#3B82F6'}
                          onChange={(e) => setCustomization(prev => ({
                            ...prev,
                            brand_colors: {
                              ...prev.brand_colors,
                              primary: e.target.value
                            }
                          }))}
                          className="w-16 h-12 rounded-lg border border-gray-300 cursor-pointer"
                        />
                        <input
                          type="text"
                          value={customization.brand_colors?.primary || '#3B82F6'}
                          onChange={(e) => setCustomization(prev => ({
                            ...prev,
                            brand_colors: {
                              ...prev.brand_colors,
                              primary: e.target.value
                            }
                          }))}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Couleur secondaire
                      </label>
                      <div className="flex items-center space-x-3">
                        <input
                          type="color"
                          value={customization.brand_colors?.secondary || '#1E40AF'}
                          onChange={(e) => setCustomization(prev => ({
                            ...prev,
                            brand_colors: {
                              ...prev.brand_colors,
                              secondary: e.target.value
                            }
                          }))}
                          className="w-16 h-12 rounded-lg border border-gray-300 cursor-pointer"
                        />
                        <input
                          type="text"
                          value={customization.brand_colors?.secondary || '#1E40AF'}
                          onChange={(e) => setCustomization(prev => ({
                            ...prev,
                            brand_colors: {
                              ...prev.brand_colors,
                              secondary: e.target.value
                            }
                          }))}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'content' && (
              <div className="space-y-6">
                {/* Description */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Description de l'entreprise</h3>
                  <textarea
                    value={customization.description || ''}
                    onChange={(e) => setCustomization(prev => ({
                      ...prev,
                      description: e.target.value
                    }))}
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-bolt-500 focus:border-primary-bolt-500"
                    placeholder="Décrivez votre entreprise, vos services, votre expertise..."
                  />
                </div>

                {/* Spécialités */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-900">Spécialités</h3>
                    <button
                      onClick={addSpecialty}
                      className="bg-primary-bolt-500 hover:bg-primary-bolt-600 text-white px-4 py-2 rounded-xl font-semibold transition-colors"
                    >
                      Ajouter
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {customization.specialties?.map((specialty, index) => (
                      <div
                        key={index}
                        className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm flex items-center space-x-2"
                      >
                        <span>{specialty}</span>
                        <button
                          onClick={() => removeSpecialty(index)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                    {(!customization.specialties || customization.specialties.length === 0) && (
                      <p className="text-gray-500 text-sm">Aucune spécialité ajoutée</p>
                    )}
                  </div>
                </div>

                {/* Certifications */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-900">Certifications</h3>
                    <button
                      onClick={addCertification}
                      className="bg-primary-bolt-500 hover:bg-primary-bolt-600 text-white px-4 py-2 rounded-xl font-semibold transition-colors"
                    >
                      Ajouter
                    </button>
                  </div>
                  <div className="space-y-2">
                    {customization.certifications?.map((certification, index) => (
                      <div
                        key={index}
                        className="bg-gray-50 p-3 rounded-xl flex items-center justify-between"
                      >
                        <span className="text-gray-700">{certification}</span>
                        <button
                          onClick={() => removeCertification(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                    {(!customization.certifications || customization.certifications.length === 0) && (
                      <p className="text-gray-500 text-sm">Aucune certification ajoutée</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'preview' && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Aperçu de votre boutique</h3>
                <div className="bg-gray-100 p-4 rounded-xl">
                  <p className="text-gray-600 text-center">
                    <Eye className="h-8 w-8 mx-auto mb-2" />
                    L'aperçu de la boutique sera disponible prochainement
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}