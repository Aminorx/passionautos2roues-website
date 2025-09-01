import React, { useState, useEffect } from 'react';
import { X, Mail, Phone, AlertCircle, CheckCircle, Lock, Eye, EyeOff } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { useAuthService } from '../services/AuthService';
import { signInWithMagicLink, signIn, resetPassword } from '../lib/supabase';

interface FormErrors {
  email?: string;
  phone?: string;
  password?: string;
  general?: string;
}

export const UnifiedAuthModal: React.FC = () => {
  const { showAuthModal, setShowAuthModal, authMode, setAuthMode } = useApp();
  const { signInWithOAuth, handleAuthSuccess } = useAuthService();
  
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    password: '',
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordReset, setIsPasswordReset] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [loginMode, setLoginMode] = useState<'new' | 'existing'>('new'); // new = signup, existing = login
  const [notification, setNotification] = useState<{
    title: string;
    description: string;
    variant: 'default' | 'destructive';
  } | null>(null);

  // Fonction de réinitialisation du formulaire - déclarée avant utilisation
  const resetForm = () => {
    setFormData({
      email: '',
      phone: '',
      password: '',
    });
    setErrors({});
    setSuccessMessage('');
    setIsPasswordReset(false);
  };

  // Réinitialiser le formulaire quand le mode change
  useEffect(() => {
    resetForm();
  }, [authMode]);

  if (!showAuthModal) return null;

  const showToast = (title: string, description: string, variant: 'default' | 'destructive' = 'default') => {
    setNotification({ title, description, variant });
    // Auto-masquage de la notification après 4 secondes
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Validation email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = 'L\'email est requis';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Format d\'email invalide';
    }

    // Validation téléphone (optionnel mais si fourni, doit être valide)
    if (formData.phone && formData.phone.length < 10) {
      newErrors.phone = 'Numéro de téléphone invalide';
    }

    // Validation mot de passe pour mode connexion existante
    if (loginMode === 'existing' && !isPasswordReset && !formData.password) {
      newErrors.password = 'Le mot de passe est requis';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await signInWithOAuth('google');
      // Google OAuth redirige automatiquement, pas besoin de fermer la modal ici
    } catch (error: any) {
      showToast("Erreur", "Problème de connexion avec Google", "destructive");
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});
    setSuccessMessage('');

    try {
      if (isPasswordReset) {
        // Reset password
        const { error } = await resetPassword(formData.email);
        
        if (!error) {
          setSuccessMessage('Un lien de récupération a été envoyé à votre email !');
        } else {
          setErrors({ general: error.message || 'Erreur lors de l\'envoi du lien' });
        }
      } else if (loginMode === 'existing') {
        // Connexion avec mot de passe (anciens comptes)
        const { data, error } = await signIn(formData.email, formData.password);
        
        if (!error && data.user) {
          handleAuthSuccess();
          setShowAuthModal(false);
        } else {
          setErrors({ general: error?.message || 'Email ou mot de passe incorrect' });
        }
      } else {
        // Nouveau compte avec magic link
        const { error } = await signInWithMagicLink(formData.email);
        
        if (!error) {
          setSuccessMessage('Un lien de connexion a été envoyé à votre email !');
        } else {
          setErrors({ general: error.message || 'Erreur lors de l\'envoi du lien' });
        }
      }
    } catch (error: any) {
      setErrors({ general: error.message || 'Une erreur est survenue. Veuillez réessayer.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData({ 
      ...formData, 
      [name]: type === 'checkbox' ? checked : value 
    });
    
    // Effacer l'erreur quand l'utilisateur commence à taper
    if (errors[name as keyof FormErrors]) {
      setErrors({ ...errors, [name]: undefined });
    }
  };

  const handleClose = () => {
    setShowAuthModal(false);
    resetForm();
  };

  // Mode simplifié - pas de switch entre login/register
  // Tout passe par magic link ou Google

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b">
          <h2 className="text-xl font-semibold text-gray-800">
            {loginMode === 'existing' ? 'Connexion' : 'Rejoignez Passion Auto2Roues'}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Fermer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="p-5 bg-green-50 border border-green-200 rounded-xl mx-5 mb-4">
            <p className="text-green-700 text-center font-medium">{successMessage}</p>
          </div>
        )}
        
        {/* Body */}
        <div className="p-5">
          {/* Mode Toggle */}
          <div className="mb-6">
            <div className="flex bg-gray-100 p-1 rounded-lg">
              <button
                type="button"
                onClick={() => {
                  setLoginMode('new');
                  setIsPasswordReset(false);
                  setErrors({});
                }}
                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                  loginMode === 'new'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Nouveau compte
              </button>
              <button
                type="button"
                onClick={() => {
                  setLoginMode('existing');
                  setIsPasswordReset(false);
                  setErrors({});
                }}
                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                  loginMode === 'existing'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Compte existant
              </button>
            </div>
          </div>
          
          {/* Google Sign In Button */}
          <button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-300 hover:border-gray-400 text-gray-700 rounded-lg p-3 mb-4 hover:bg-gray-50 transition-colors font-medium"
          >
            {/* Logo Google SVG intégré directement */}
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 48 48">
              <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
              <path fill="#FF3D00" d="m6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z" />
              <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
              <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" />
            </svg>
            <span>Continuer avec Google</span>
          </button>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">ou</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Téléphone - seulement pour nouveaux comptes */}
            {loginMode === 'new' && (
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Téléphone (optionnel)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                    <Phone size={18} />
                  </span>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+33 6 12 34 56 78"
                    className={`w-full pl-10 pr-3 py-3 rounded-lg border ${
                      errors.phone ? 'border-red-500' : 'border-gray-300'
                    } focus:ring-2 focus:ring-[#0CBFDE] focus:border-[#0CBFDE]`}
                  />
                </div>
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.phone}
                  </p>
                )}
              </div>
            )}
            
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Adresse email
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                  <Mail size={18} />
                </span>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="votre@email.com"
                  className={`w-full pl-10 pr-3 py-3 rounded-lg border ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  } focus:ring-2 focus:ring-[#0CBFDE] focus:border-[#0CBFDE]`}
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
            
            {/* Mot de passe - seulement pour comptes existants */}
            {loginMode === 'existing' && (
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Mot de passe
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                    <Lock size={18} />
                  </span>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                    className={`w-full pl-10 pr-10 py-3 rounded-lg border ${
                      errors.password ? 'border-red-500' : 'border-gray-300'
                    } focus:ring-2 focus:ring-[#0CBFDE] focus:border-[#0CBFDE]`}
                    required={!isPasswordReset}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.password}
                  </p>
                )}
                
                {/* Lien mot de passe oublié */}
                <div className="mt-2 text-right">
                  <button
                    type="button"
                    onClick={() => {
                      setIsPasswordReset(true);
                      setErrors({});
                    }}
                    className="text-sm text-[#0CBFDE] hover:text-[#0CBFDE]/80 font-medium"
                  >
                    Mot de passe oublié ?
                  </button>
                </div>
              </div>
            )}
            
            {/* General Error */}
            {errors.general && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                <p className="text-red-700 text-sm flex items-center">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  {errors.general}
                </p>
              </div>
            )}

            
            {/* Submit Button */}
            {!successMessage && (
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-[#0CBFDE] to-[#0CBFDE] hover:from-[#0CBFDE]/90 hover:to-[#0CBFDE]/90 text-white py-3 px-6 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>
                      {isPasswordReset ? 'Envoi du lien...' : loginMode === 'existing' ? 'Connexion...' : 'Envoi du lien...'}
                    </span>
                  </div>
                ) : isPasswordReset ? (
                  'Réinitialiser le mot de passe'
                ) : loginMode === 'existing' ? (
                  'Se connecter'
                ) : (
                  'Recevoir un lien de connexion'
                )}
              </button>
            )}
            
            {/* Retour depuis reset password */}
            {isPasswordReset && (
              <button
                type="button"
                onClick={() => {
                  setIsPasswordReset(false);
                  setErrors({});
                }}
                className="w-full mt-2 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Retour à la connexion
              </button>
            )}
          </form>
          
          {/* Footer with simple text */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              En continuant, vous acceptez nos conditions d'utilisation et notre politique de confidentialité
            </p>
          </div>
        </div>

        {/* Notification Toast */}
        {notification && (
          <div
            className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg max-w-sm z-50 ${
              notification.variant === 'destructive'
                ? 'bg-red-50 border border-red-200 text-red-800'
                : 'bg-green-50 border border-green-200 text-green-800'
            }`}
          >
            <div className="flex">
              <div className="flex-shrink-0">
                {notification.variant === 'destructive' ? (
                  <AlertCircle className="h-5 w-5 text-red-400" />
                ) : (
                  <CheckCircle className="h-5 w-5 text-green-400" />
                )}
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium">{notification.title}</h3>
                <div className="mt-1 text-sm text-gray-600">
                  {notification.description}
                </div>
              </div>
              <div className="ml-auto pl-3">
                <button
                  onClick={() => setNotification(null)}
                  className="inline-flex text-gray-400 hover:text-gray-500"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
