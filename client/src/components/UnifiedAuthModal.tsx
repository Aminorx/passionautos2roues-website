import React, { useState, useEffect } from 'react';
import { X, Mail, AlertCircle, CheckCircle, Lock, Eye, EyeOff } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { useAuthService } from '../services/AuthService';
import { signIn, signUp, resetPassword } from '../lib/supabase';

interface FormErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
}

export const UnifiedAuthModal: React.FC = () => {
  const { showAuthModal, setShowAuthModal, authMode, setAuthMode } = useApp();
  const { handleAuthSuccess } = useAuthService();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordReset, setIsPasswordReset] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [isSignUp, setIsSignUp] = useState(false); // false = connexion, true = inscription
  const [notification, setNotification] = useState<{
    title: string;
    description: string;
    variant: 'default' | 'destructive';
  } | null>(null);

  // Fonction de réinitialisation du formulaire
  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
    });
    setErrors({});
    setSuccessMessage('');
    setIsPasswordReset(false);
  };

  // Réinitialiser le formulaire quand le modal s'ouvre/ferme
  useEffect(() => {
    if (showAuthModal) {
      resetForm();
    }
  }, [showAuthModal]);

  if (!showAuthModal) return null;

  const showToast = (title: string, description: string, variant: 'default' | 'destructive' = 'default') => {
    setNotification({ title, description, variant });
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

    // Validation mot de passe (sauf pour reset)
    if (!isPasswordReset && !formData.password) {
      newErrors.password = 'Le mot de passe est requis';
    } else if (!isPasswordReset && formData.password && formData.password.length < 6) {
      newErrors.password = 'Le mot de passe doit contenir au moins 6 caractères';
    }

    // Validation confirmation mot de passe (uniquement pour inscription)
    if (isSignUp && !isPasswordReset) {
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Veuillez confirmer votre mot de passe';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Effacer l'erreur quand l'utilisateur tape
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      if (isPasswordReset) {
        // Reset de mot de passe
        console.log('🔄 Réinitialisation mot de passe pour:', formData.email);
        const { error } = await resetPassword(formData.email);
        
        if (error) {
          setErrors({ general: `Erreur : ${error.message}` });
          return;
        }

        setSuccessMessage('Un email de réinitialisation a été envoyé à votre adresse.');
        showToast('Email envoyé', 'Vérifiez votre boîte mail pour réinitialiser votre mot de passe.');
        setTimeout(() => {
          setIsPasswordReset(false);
          resetForm();
        }, 3000);
        return;
      }

      if (isSignUp) {
        // Inscription
        console.log('🔄 Inscription avec email:', formData.email);
        const { data, error } = await signUp(formData.email, formData.password);
        
        if (error) {
          if (error.message.includes('already registered')) {
            setErrors({ general: 'Cet email est déjà utilisé. Essayez de vous connecter.' });
            setIsSignUp(false);
          } else {
            setErrors({ general: `Erreur d'inscription : ${error.message}` });
          }
          return;
        }
        
        if (data.user) {
          console.log('✅ Inscription réussie:', data.user.email);
          setSuccessMessage('Compte créé avec succès ! Un email de confirmation a été envoyé à votre adresse.');
          showToast('Compte créé', 'Un email de confirmation a été envoyé. Vérifiez votre boîte mail !');
          // Attendre un peu avant de fermer pour que l'utilisateur voit le message
          setTimeout(() => {
            handleAuthSuccess();
            setShowAuthModal(false);
          }, 3000);
        }
        
      } else {
        // Connexion
        console.log('🔄 Connexion avec email:', formData.email);
        const { data, error } = await signIn(formData.email, formData.password);
        
        if (error) {
          if (error.message.includes('Invalid login credentials') || error.message.includes('Email not confirmed')) {
            setErrors({ general: 'Email ou mot de passe incorrect. Essayez de créer un compte si vous n\'en avez pas.' });
          } else {
            setErrors({ general: `Erreur de connexion : ${error.message}` });
          }
          return;
        }
        
        if (data.user) {
          console.log('✅ Connexion réussie:', data.user.email);
          await handleAuthSuccess();
          showToast('Connexion réussie', 'Bienvenue !');
          setShowAuthModal(false);
        }
      }

    } catch (error) {
      console.error('Erreur auth:', error);
      setErrors({ general: 'Une erreur est survenue. Veuillez réessayer.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md relative animate-in fade-in-0 zoom-in-95 duration-300">
        
        {/* Header avec bouton fermeture */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">
            {isPasswordReset ? 'Réinitialiser le mot de passe' : 
             isSignUp ? 'Créer un compte' : 'Se connecter'}
          </h2>
          <button
            onClick={() => setShowAuthModal(false)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Notification */}
        {notification && (
          <div className={`mx-6 mt-4 p-4 rounded-lg border-l-4 ${
            notification.variant === 'destructive' 
              ? 'bg-red-50 border-red-400 text-red-700' 
              : 'bg-green-50 border-green-400 text-green-700'
          }`}>
            <div className="flex">
              <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0" />
              <div>
                <h4 className="font-medium">{notification.title}</h4>
                <p className="text-sm">{notification.description}</p>
              </div>
            </div>
          </div>
        )}

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Message de succès */}
          {successMessage && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              <p className="text-green-700">{successMessage}</p>
            </div>
          )}

          {/* Erreur générale */}
          {errors.general && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <p className="text-red-700">{errors.general}</p>
            </div>
          )}

          {/* Champ Email */}
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
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.email}
              </p>
            )}
          </div>

          {/* Champ Mot de passe - seulement si pas en mode reset */}
          {!isPasswordReset && (
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Mot de passe {isSignUp && <span className="text-gray-500">(min. 6 caractères)</span>}
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
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
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
            </div>
          )}

          {/* Champ Confirmation mot de passe - seulement pour inscription */}
          {!isPasswordReset && isSignUp && (
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirmer le mot de passe
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                  <Lock size={18} />
                </span>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  className={`w-full pl-10 pr-3 py-3 rounded-lg border ${
                    errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                  } focus:ring-2 focus:ring-[#0CBFDE] focus:border-[#0CBFDE]`}
                />
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.confirmPassword}
                </p>
              )}
            </div>
          )}

          {/* Bouton principal */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#0CBFDE] hover:bg-[#0CBFDE]/90 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <>
                {isPasswordReset ? 'Envoyer l\'email' : 
                 isSignUp ? 'Créer le compte' : 'Se connecter'}
              </>
            )}
          </button>

          {/* Liens de navigation */}
          <div className="space-y-2 text-center text-sm">
            {!isPasswordReset && (
              <>
                <button
                  type="button"
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-[#0CBFDE] hover:underline"
                >
                  {isSignUp ? 'Déjà un compte ? Se connecter' : 'Pas de compte ? Créer un compte'}
                </button>
                
                <div className="border-t pt-2">
                  <button
                    type="button"
                    onClick={() => setIsPasswordReset(true)}
                    className="text-gray-600 hover:text-gray-800 hover:underline"
                  >
                    Mot de passe oublié ?
                  </button>
                </div>
              </>
            )}
            
            {isPasswordReset && (
              <button
                type="button"
                onClick={() => setIsPasswordReset(false)}
                className="text-[#0CBFDE] hover:underline"
              >
                ← Retour à la connexion
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};