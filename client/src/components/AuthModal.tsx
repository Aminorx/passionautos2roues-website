import React, { useState } from 'react';
import { X, Mail, Lock, User, Building, Phone, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../hooks/useAuth';
import { mockUsers } from '../utils/mockData';

interface FormErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
  name?: string;
  phone?: string;
  companyName?: string;
  terms?: string;
}

export const AuthModal: React.FC = () => {
  const { showAuthModal, setShowAuthModal, authMode, setAuthMode, setCurrentUser } = useApp();
  const auth = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    phone: '',
    type: 'individual' as 'individual' | 'professional',
    companyName: '',
    acceptTerms: false,
    acceptNewsletter: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1); // For multi-step registration

  if (!showAuthModal) return null;

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = 'L\'email est requis';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Format d\'email invalide';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Le mot de passe est requis';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Le mot de passe doit contenir au moins 8 caractères';
    }

    // Registration-specific validations
    if (authMode === 'register') {
      if (!formData.name) {
        newErrors.name = 'Le nom est requis';
      }

      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Confirmez votre mot de passe';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
      }

      if (formData.type === 'professional' && !formData.companyName) {
        newErrors.companyName = 'Le nom de l\'entreprise est requis';
      }

      if (!formData.acceptTerms) {
        newErrors.terms = 'Vous devez accepter les conditions d\'utilisation';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const result = await auth.signInWithGoogle();
      if (result.success) {
        // Google OAuth redirige automatiquement, mais on peut quand même fermer la modal
        console.log('🔄 Redirection Google OAuth...');
        setShowAuthModal(false); // Fermer la modal après connexion réussie
      } else {
        setErrors({ email: result.error || 'Erreur de connexion Google' });
        setIsLoading(false);
      }
    } catch (error) {
      setErrors({ email: 'Erreur de connexion Google' });
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      if (authMode === 'login') {
        // Connexion via Supabase Auth
        const result = await auth.signIn(formData.email, formData.password);
        
        if (result.success) {
          resetForm();
          setShowAuthModal(false); // Fermer la modal après connexion réussie
          // Importer et utiliser useAuthService quand cette fonctionnalité sera implémentée
          // const authService = useAuthService();
          // authService.handleAuthSuccess();
        } else {
          setErrors({ email: result.error || 'Email ou mot de passe incorrect' });
        }
      } else {
        // Inscription via Supabase Auth
        console.log('🔄 Début inscription pour:', formData.email);
        
        const result = await auth.signUp(formData.email, formData.password, {
          name: formData.name,
          type: formData.type,
          phone: formData.phone,
          companyName: formData.type === 'professional' ? formData.companyName : undefined,
        });

        if (result.success) {
          setShowAuthModal(false);
          resetForm();
          alert('Compte créé avec succès ! Un email de vérification a été envoyé.');
        } else {
          console.error('❌ Erreur inscription:', result.error);
          setErrors({ email: result.error || 'Erreur lors de la création du compte' });
        }
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      setErrors({ 
        email: error.message || 'Une erreur est survenue. Veuillez réessayer.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      name: '',
      phone: '',
      type: 'individual',
      companyName: '',
      acceptTerms: false,
      acceptNewsletter: false,
    });
    setErrors({});
    setStep(1);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData({ 
      ...formData, 
      [name]: type === 'checkbox' ? checked : value 
    });
    
    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors({ ...errors, [name]: undefined });
    }
  };

  const handleClose = () => {
    setShowAuthModal(false);
    resetForm();
  };

  const switchMode = () => {
    setAuthMode(authMode === 'login' ? 'register' : 'login');
    resetForm();
  };

  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const passwordStrength = getPasswordStrength(formData.password);
  const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500'];
  const strengthLabels = ['Très faible', 'Faible', 'Moyen', 'Fort', 'Très fort'];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {authMode === 'login' ? 'Connexion' : 'Créer un compte'}
            </h2>
            <p className="text-gray-600 text-sm mt-1">
              {authMode === 'login' 
                ? 'Connectez-vous à votre compte' 
                : 'Rejoignez la communauté Passion Auto2Roues'
              }
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* OAuth Section */}
        <div className="p-6 pb-0">
          <button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full flex items-center justify-center space-x-3 bg-white border-2 border-gray-200 hover:border-gray-300 text-gray-700 py-4 px-6 rounded-xl font-semibold transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span>
              {authMode === 'login' ? 'Se connecter avec Google' : 'S\'inscrire avec Google'}
            </span>
          </button>
          
          <div className="flex items-center my-6">
            <div className="flex-1 border-t border-gray-200"></div>
            <span className="px-4 text-sm text-gray-500 bg-white">ou</span>
            <div className="flex-1 border-t border-gray-200"></div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-5">
          {authMode === 'register' && (
            <div>
              {/* Account Type */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Type de compte
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className={`relative flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    formData.type === 'individual' 
                      ? 'border-[#0CBFDE] bg-cyan-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    <input
                      type="radio"
                      name="type"
                      value="individual"
                      checked={formData.type === 'individual'}
                      onChange={handleInputChange}
                      className="sr-only"
                    />
                    <div className="flex flex-col items-center text-center">
                      <User className="h-6 w-6 mb-2 text-gray-600" />
                      <span className="text-sm font-medium">Particulier</span>
                    </div>
                    {formData.type === 'individual' && (
                      <CheckCircle className="absolute top-2 right-2 h-5 w-5 text-[#0CBFDE]" />
                    )}
                  </label>
                  
                  <label className={`relative flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    formData.type === 'professional' 
                      ? 'border-[#0CBFDE] bg-cyan-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    <input
                      type="radio"
                      name="type"
                      value="professional"
                      checked={formData.type === 'professional'}
                      onChange={handleInputChange}
                      className="sr-only"
                    />
                    <div className="flex flex-col items-center text-center">
                      <Building className="h-6 w-6 mb-2 text-gray-600" />
                      <span className="text-sm font-medium">Professionnel</span>
                    </div>
                    {formData.type === 'professional' && (
                      <CheckCircle className="absolute top-2 right-2 h-5 w-5 text-[#0CBFDE]" />
                    )}
                  </label>
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {formData.type === 'professional' ? 'Nom du responsable' : 'Nom complet'}
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-bolt-500 focus:border-primary-bolt-500 transition-all ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Votre nom complet"
                  />
                </div>
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Company Name for Professionals */}
              {formData.type === 'professional' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nom de l'entreprise
                  </label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-bolt-500 focus:border-primary-bolt-500 transition-all ${
                        errors.companyName ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Nom de votre entreprise"
                    />
                  </div>
                  {errors.companyName && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.companyName}
                    </p>
                  )}
                </div>
              )}

              {/* Phone */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Téléphone
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-bolt-500 focus:border-primary-bolt-500 transition-all"
                    placeholder="+33 6 12 34 56 78"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Adresse email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-bolt-500 focus:border-primary-bolt-500 transition-all ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="votre@email.com"
                required
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.email}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Mot de passe
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className={`w-full pl-10 pr-12 py-3 border rounded-xl focus:ring-2 focus:ring-primary-bolt-500 focus:border-primary-bolt-500 transition-all ${
                  errors.password ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Votre mot de passe"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.password}
              </p>
            )}
            
            {/* Password Strength Indicator */}
            {authMode === 'register' && formData.password && (
              <div className="mt-2">
                <div className="flex space-x-1 mb-1">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded ${
                        i < passwordStrength ? strengthColors[passwordStrength - 1] : 'bg-gray-200'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-xs text-gray-600">
                  Force du mot de passe: {strengthLabels[passwordStrength - 1] || 'Très faible'}
                </p>
              </div>
            )}
          </div>

          {/* Confirm Password for Registration */}
          {authMode === 'register' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Confirmer le mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-12 py-3 border rounded-xl focus:ring-2 focus:ring-primary-bolt-500 focus:border-primary-bolt-500 transition-all ${
                    errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Confirmez votre mot de passe"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.confirmPassword}
                </p>
              )}
            </div>
          )}

          {/* Terms and Newsletter for Registration */}
          {authMode === 'register' && (
            <div className="space-y-3">
              <label className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  name="acceptTerms"
                  checked={formData.acceptTerms}
                  onChange={handleInputChange}
                  className="mt-1 h-4 w-4 text-primary-bolt-500 focus:ring-primary-bolt-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">
                  J'accepte les{' '}
                  <a href="#" className="text-primary-bolt-500 hover:text-primary-bolt-600 font-medium">
                    conditions d'utilisation
                  </a>{' '}
                  et la{' '}
                  <a href="#" className="text-primary-bolt-500 hover:text-primary-bolt-600 font-medium">
                    politique de confidentialité
                  </a>
                </span>
              </label>
              {errors.terms && (
                <p className="text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.terms}
                </p>
              )}

              <label className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  name="acceptNewsletter"
                  checked={formData.acceptNewsletter}
                  onChange={handleInputChange}
                  className="mt-1 h-4 w-4 text-primary-bolt-500 focus:ring-primary-bolt-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">
                  Je souhaite recevoir les offres et actualités d'Auto2Roues par email
                </span>
              </label>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-primary-bolt-500 to-primary-bolt-600 hover:from-primary-bolt-600 hover:to-primary-bolt-700 text-white py-4 px-6 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>{authMode === 'login' ? 'Connexion...' : 'Création du compte...'}</span>
              </div>
            ) : (
              authMode === 'login' ? 'Se connecter' : 'Créer mon compte'
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
          <div className="text-center">
            <p className="text-gray-600 mb-3">
              {authMode === 'login' ? "Pas encore de compte ?" : "Déjà un compte ?"}
            </p>
            <button
              onClick={switchMode}
              className="text-primary-bolt-500 hover:text-primary-bolt-600 font-semibold transition-colors"
            >
              {authMode === 'login' ? "Créer un compte" : "Se connecter"}
            </button>
          </div>
          
          {authMode === 'login' && (
            <div className="mt-4 text-center">
              <a
                href="#"
                className="text-sm text-gray-600 hover:text-primary-bolt-500 transition-colors"
              >
                Mot de passe oublié ?
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};