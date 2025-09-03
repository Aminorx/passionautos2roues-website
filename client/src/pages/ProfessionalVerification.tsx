import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  FileText, 
  Upload, 
  AlertCircle, 
  CheckCircle, 
  ArrowLeft,
  Phone,
  Mail,
  Globe,
  MapPin,
  Loader
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useLocation } from 'wouter';

interface FormData {
  company_name: string;
  siret: string;
  company_address: string;
}

interface FormErrors {
  [key: string]: string;
}

export const ProfessionalVerification: React.FC = () => {
  const { user, session } = useAuth();
  const [, setLocation] = useLocation();
  const [formData, setFormData] = useState<FormData>({
    company_name: '',
    siret: '',
    company_address: ''
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);

  // Formulaire simplifié - pas besoin de charger des données existantes

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.company_name.trim()) {
      newErrors.company_name = 'Le nom de l\'entreprise est requis';
    }

    if (!formData.siret.trim()) {
      newErrors.siret = 'Le numéro SIRET est requis';
    } else if (!/^\d{14}$/.test(formData.siret.replace(/\s/g, ''))) {
      newErrors.siret = 'Le SIRET doit contenir exactement 14 chiffres';
    }

    if (!formData.company_address.trim()) {
      newErrors.company_address = 'L\'adresse de l\'entreprise est requise';
    }

    if (!uploadedFile) {
      newErrors.file = 'Un document K-bis ou SIRET est requis';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Nettoyer l'erreur si elle existe
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }

    // Formatage automatique du SIRET
    if (name === 'siret') {
      const formatted = value.replace(/\D/g, '').slice(0, 14);
      setFormData(prev => ({ ...prev, siret: formatted }));
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleFileSelect = (file: File) => {
    // Vérifier le type de fichier
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      setErrors(prev => ({ ...prev, file: 'Format de fichier non supporté. Utilisez PDF, JPG ou PNG.' }));
      return;
    }

    // Vérifier la taille (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, file: 'Le fichier ne doit pas dépasser 5 MB.' }));
      return;
    }

    setUploadedFile(file);
    setErrors(prev => ({ ...prev, file: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const formDataToSend = new FormData();
      
      // Ajouter les données du formulaire
      Object.entries(formData).forEach(([key, value]) => {
        formDataToSend.append(key, value);
      });

      // Ajouter le fichier
      if (uploadedFile) {
        formDataToSend.append('kbis_document', uploadedFile);
      }

      const response = await fetch('/api/professional-accounts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: formDataToSend
      });

      if (response.ok) {
        const result = await response.json();
        alert('✅ Demande de vérification envoyée avec succès ! Vous recevrez une confirmation par email une fois votre compte validé.');
        setLocation('/dashboard');
      } else {
        const errorData = await response.json();
        alert(`❌ Erreur : ${errorData.error || 'Une erreur est survenue'}`);
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi:', error);
      alert('❌ Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Retour au tableau de bord
          </button>
          
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-blue-100 rounded-full">
                <Building2 className="h-12 w-12 text-blue-600" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Vérification de compte professionnel
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Complétez votre profil professionnel pour accéder aux fonctionnalités avancées et 
              augmenter la confiance de vos clients avec un badge de vérification.
            </p>
          </div>
        </div>

        {/* Avantages */}
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            🎯 Avantages du compte professionnel vérifié
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
              <span className="text-sm text-gray-700">Badge de confiance affiché</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
              <span className="text-sm text-gray-700">Priorité dans les recherches</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
              <span className="text-sm text-gray-700">Page boutique dédiée</span>
            </div>
          </div>
        </div>

        {/* Formulaire */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Informations de l'entreprise */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Informations de l'entreprise
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom de l'entreprise *
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      name="company_name"
                      value={formData.company_name}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                        errors.company_name ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Auto Garage Dupont"
                    />
                  </div>
                  {errors.company_name && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.company_name}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Numéro SIRET *
                  </label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      name="siret"
                      value={formData.siret}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-mono ${
                        errors.siret ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="12345678901234"
                      maxLength={14}
                    />
                  </div>
                  {errors.siret && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.siret}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Adresse de l'entreprise *
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <textarea
                    name="company_address"
                    value={formData.company_address}
                    onChange={handleInputChange}
                    rows={3}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none ${
                      errors.company_address ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="123 Rue de la Paix, 75001 Paris"
                  />
                </div>
                {errors.company_address && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.company_address}
                  </p>
                )}
              </div>
            </div>

            {/* Informations de contact */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Informations de contact
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Téléphone *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                        errors.phone ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="+33 1 23 45 67 89"
                    />
                  </div>
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.phone}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email professionnel *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                        errors.email ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="contact@mongarage.com"
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.email}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Site web (optionnel)
                </label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                      errors.website ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="https://www.mongarage.com"
                  />
                </div>
                {errors.website && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.website}
                  </p>
                )}
              </div>
            </div>

            {/* Upload de document */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Document de vérification
              </h3>
              
              <div
                className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all ${
                  dragActive 
                    ? 'border-blue-400 bg-blue-50' 
                    : errors.file 
                    ? 'border-red-300 bg-red-50' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  id="file-upload"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileInput}
                />
                
                {uploadedFile ? (
                  <div className="space-y-2">
                    <CheckCircle className="h-12 w-12 text-green-600 mx-auto" />
                    <p className="text-sm font-medium text-gray-900">{uploadedFile.name}</p>
                    <p className="text-xs text-gray-500">
                      {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    <button
                      type="button"
                      onClick={() => setUploadedFile(null)}
                      className="text-sm text-red-600 hover:text-red-800"
                    >
                      Supprimer
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                    <p className="text-sm font-medium text-gray-900">
                      Glissez votre document K-bis ou SIRET ici
                    </p>
                    <p className="text-xs text-gray-500">
                      ou cliquez pour sélectionner un fichier
                    </p>
                    <p className="text-xs text-gray-400">
                      PDF, JPG ou PNG • Max 5 MB
                    </p>
                  </div>
                )}
              </div>
              
              {errors.file && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.file}
                </p>
              )}
            </div>

            {/* Informations importantes */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Informations importantes :</p>
                  <ul className="space-y-1 text-xs">
                    <li>• Votre demande sera examinée sous 2-3 jours ouvrés</li>
                    <li>• Vous recevrez un email de confirmation une fois votre compte validé</li>
                    <li>• Les documents fournis doivent être récents et lisibles</li>
                    <li>• Vos données sont sécurisées et utilisées uniquement pour la vérification</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Boutons */}
            <div className="flex space-x-4 pt-6">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <Loader className="h-5 w-5 mr-2 animate-spin" />
                    Envoi en cours...
                  </>
                ) : (
                  'Envoyer la demande'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};