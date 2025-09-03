import React, { useState, useEffect } from 'react';
import { 
  Upload, X, Save, Eye, Settings, PaintBucket, 
  Image as ImageIcon, Camera, Palette, Building2,
  Check, AlertCircle, ArrowLeft, Lock, Phone,
  Mail, Globe, FileText, MapPin
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
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
  // Nouvelles données pour infos légales et contact
  company_name?: string;
  siret?: string;
  company_address?: string;
  email?: string;
  phone?: string;
  website?: string;
}

interface ProCustomizationProps {
  onBack: () => void;
}

export default function ProCustomization({ onBack }: ProCustomizationProps) {
  const { user, dbUser } = useAuth();
  
  // La personnalisation est gérée directement via professional_accounts

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
  const [isVerified, setIsVerified] = useState(false);

  // Charger les données existantes
  useEffect(() => {
    if (user?.id) {
      loadCustomizationData();
    }
  }, [user?.id]);

  const loadCustomizationData = async () => {
    try {
      // Charger la personnalisation
      const custResponse = await fetch(`/api/professional-accounts/customization/${user?.id}`);
      let custData: any = {};
      if (custResponse.ok) {
        custData = await custResponse.json();
      }
      
      // Charger les données du compte professionnel
      const accountsResponse = await fetch('/api/admin/professional-accounts');
      let accountData: any = {};
      if (accountsResponse.ok) {
        const allAccounts = await accountsResponse.json();
        const myAccount = allAccounts.find((acc: any) => acc.user_id === user?.id);
        if (myAccount) {
          accountData = myAccount;
          setIsVerified(myAccount.verification_status === 'approved');
        }
      }
      
      setCustomization({
        company_logo: custData.company_logo || '',
        banner_image: custData.banner_image || '',
        brand_colors: custData.brand_colors || { primary: '#3B82F6', secondary: '#1E40AF' },
        description: custData.description || '',
        specialties: custData.specialties || [],
        certifications: custData.certifications || [],
        company_name: accountData.company_name || '',
        siret: accountData.siret || '',
        company_address: accountData.company_address || '',
        email: accountData.email || '',
        phone: accountData.phone || '',
        website: accountData.website || ''
      });
    } catch (error) {
      console.error('Erreur chargement données:', error);
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
                <h1 className="text-2xl font-bold text-gray-900">Gestion de ma boutique</h1>
                <p className="text-gray-600">Gérez toutes les informations de votre boutique professionnelle</p>
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
                onClick={async () => {
                  try {
                    // Récupérer l'ID du compte professionnel
                    const accountsResponse = await fetch('/api/admin/professional-accounts');
                    if (accountsResponse.ok) {
                      const allAccounts = await accountsResponse.json();
                      const myAccount = allAccounts.find((acc: any) => acc.user_id === user?.id);
                      if (myAccount?.id) {
                        window.open(`/pro/${myAccount.id}`, '_blank');
                      } else {
                        alert('Aucun compte professionnel trouvé');
                      }
                    } else {
                      alert('Erreur lors de la récupération du compte');
                    }
                  } catch (error) {
                    console.error('Erreur:', error);
                    alert('Erreur lors de l\'ouverture de la boutique');
                  }
                }}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2 rounded-xl font-semibold transition-colors flex items-center space-x-2"
              >
                <Eye className="h-4 w-4" />
                <span>Voir ma boutique</span>
              </button>
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

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          
          {/* Section 1: Informations légales */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <FileText className="h-6 w-6 text-gray-700" />
                <h2 className="text-2xl font-bold text-gray-900">Informations légales</h2>
              </div>
              {isVerified && (
                <div className="flex items-center space-x-2 px-3 py-1 bg-orange-50 text-orange-700 rounded-full text-sm">
                  <Lock className="h-4 w-4" />
                  <span>Protégé (compte vérifié)</span>
                </div>
              )}
            </div>
            
            {isVerified && (
              <div className="mb-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
                <p className="text-blue-800 text-sm">
                  🔒 Ces informations sont protégées car votre compte a été vérifié. 
                  Contactez le support pour toute modification nécessaire.
                </p>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom de l'entreprise
                </label>
                <input
                  type="text"
                  value={customization.company_name || ''}
                  onChange={(e) => setCustomization(prev => ({ ...prev, company_name: e.target.value }))}
                  disabled={isVerified}
                  className={`w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-bolt-500 focus:border-primary-bolt-500 ${isVerified ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                  placeholder="Nom officiel de votre entreprise"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SIRET
                </label>
                <input
                  type="text"
                  value={customization.siret || ''}
                  onChange={(e) => setCustomization(prev => ({ ...prev, siret: e.target.value }))}
                  disabled={isVerified}
                  className={`w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-bolt-500 focus:border-primary-bolt-500 ${isVerified ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                  placeholder="Numéro SIRET"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Adresse de l'entreprise
                </label>
                <input
                  type="text"
                  value={customization.company_address || ''}
                  onChange={(e) => setCustomization(prev => ({ ...prev, company_address: e.target.value }))}
                  disabled={isVerified}
                  className={`w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-bolt-500 focus:border-primary-bolt-500 ${isVerified ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                  placeholder="Adresse complète de l'entreprise"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Informations de contact */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <Phone className="h-6 w-6 text-gray-700" />
              <h2 className="text-2xl font-bold text-gray-900">Informations de contact</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail className="h-4 w-4 inline mr-2" />
                  Email de contact
                </label>
                <input
                  type="email"
                  value={customization.email || ''}
                  onChange={(e) => setCustomization(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-bolt-500 focus:border-primary-bolt-500"
                  placeholder="contact@monentreprise.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Phone className="h-4 w-4 inline mr-2" />
                  Téléphone
                </label>
                <input
                  type="tel"
                  value={customization.phone || ''}
                  onChange={(e) => setCustomization(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-bolt-500 focus:border-primary-bolt-500"
                  placeholder="01 23 45 67 89"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Globe className="h-4 w-4 inline mr-2" />
                  Site web
                </label>
                <input
                  type="url"
                  value={customization.website || ''}
                  onChange={(e) => setCustomization(prev => ({ ...prev, website: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-bolt-500 focus:border-primary-bolt-500"
                  placeholder="https://www.monentreprise.com"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Image de marque */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <PaintBucket className="h-6 w-6 text-gray-700" />
              <h2 className="text-2xl font-bold text-gray-900">Image de marque</h2>
            </div>
            
            <div className="space-y-6">
              {/* Logo */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Logo de l'entreprise</h3>
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
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Image de bannière</h3>
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
                        <Upload className="h-4 w-4" />
                      )}
                      <span>{uploadingBanner ? 'Téléchargement...' : 'Télécharger une bannière'}</span>
                    </div>
                  </label>
                  <p className="text-sm text-gray-500">PNG, JPG jusqu'à 5MB - Recommandé: 1200x400px</p>
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Contenu et présentation */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <Building2 className="h-6 w-6 text-gray-700" />
              <h2 className="text-2xl font-bold text-gray-900">Contenu et présentation</h2>
            </div>
            
            <div className="space-y-6">
              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description de l'entreprise
                </label>
                <textarea
                  value={customization.description || ''}
                  onChange={(e) => setCustomization(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-bolt-500 focus:border-primary-bolt-500"
                  placeholder="Décrivez votre entreprise, vos services, votre expertise..."
                />
              </div>

              {/* Spécialités */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Spécialités
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {customization.specialties?.map((specialty, index) => (
                    <div
                      key={index}
                      className="bg-primary-bolt-50 text-primary-bolt-700 px-3 py-1 rounded-full text-sm flex items-center space-x-2"
                    >
                      <span>{specialty}</span>
                      <button
                        onClick={() => removeSpecialty(index)}
                        className="text-primary-bolt-500 hover:text-primary-bolt-700"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  {(!customization.specialties || customization.specialties.length === 0) && (
                    <p className="text-gray-500 text-sm">Aucune spécialité ajoutée</p>
                  )}
                </div>
                <button
                  onClick={addSpecialty}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl text-sm font-medium transition-colors"
                >
                  + Ajouter une spécialité
                </button>
              </div>

              {/* Certifications */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Certifications
                </label>
                <div className="space-y-2 mb-3">
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
                <button
                  onClick={addCertification}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl text-sm font-medium transition-colors"
                >
                  + Ajouter une certification
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
