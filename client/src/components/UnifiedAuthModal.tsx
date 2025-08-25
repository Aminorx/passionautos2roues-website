import React, { useState, useEffect } from 'react';
import { X, Mail, Lock, User, Building, Phone, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { useAuthService } from '../services/AuthService';

interface FormErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
  name?: string;
  phone?: string;
  companyName?: string;
  terms?: string;
}

export const UnifiedAuthModal: React.FC = () => {
  const { showAuthModal, setShowAuthModal, authMode, setAuthMode } = useApp();
  const { signIn, signUp, signInWithOAuth, handleAuthSuccess } = useAuthService();
  
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
  const [step, setStep] = useState(1); // Pour inscription multi-étapes
  const [notification, setNotification] = useState<{
    title: string;
    description: string;
    variant: 'default' | 'destructive';
  } | null>(null);

  // Fonction de réinitialisation du formulaire - déclarée avant utilisation
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

    // Validation mot de passe
    if (!formData.password) {
      newErrors.password = 'Le mot de passe est requis';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Le mot de passe doit contenir au moins 8 caractères';
    }

    // Validations spécifiques à l'inscription
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

    try {
      if (authMode === 'login') {
        // Connexion
        const result = await signIn(formData.email, formData.password);
        
        if (result.success) {
          resetForm();
          handleAuthSuccess();
          setShowAuthModal(false);
        } else {
          showToast("Erreur de connexion", result.error || 'Email ou mot de passe incorrect', "destructive");
        }
      } else {
        // Inscription
        const userData = {
          name: formData.name,
          type: formData.type,
          phone: formData.phone,
          companyName: formData.type === 'professional' ? formData.companyName : undefined,
          newsletter: formData.acceptNewsletter
        };
        
        const result = await signUp(formData.email, formData.password, userData);

        if (result.success) {
          resetForm();
          showToast("Compte créé", "Un email de vérification a été envoyé", "default");
          setTimeout(() => {
            setShowAuthModal(false);
          }, 2000);
        } else {
          showToast("Erreur d'inscription", result.error || 'Erreur lors de la création du compte', "destructive");
        }
      }
    } catch (error: any) {
      showToast("Erreur", error.message || 'Une erreur est survenue', "destructive");
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

  const switchMode = () => {
    setAuthMode(authMode === 'login' ? 'register' : 'login');
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

  // Render password strength indicator
  const renderPasswordStrength = () => {
    if (!formData.password) return null;
    
    const labels = ["Très faible", "Faible", "Moyen", "Fort", "Très fort"];
    const colors = ["bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-lime-500", "bg-green-500"];
    
    return (
      <div className="mt-1">
        <div className="flex gap-1 h-1 mb-1">
          {[1, 2, 3, 4, 5].map((level) => (
            <div
              key={level}
              className={`h-full flex-1 rounded-full ${
                level <= passwordStrength ? colors[passwordStrength - 1] : "bg-gray-200"
              }`}
            />
          ))}
        </div>
        <p className="text-xs text-gray-600">
          Force: {labels[passwordStrength - 1] || "Trop court"}
        </p>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b">
          <h2 className="text-xl font-semibold text-gray-800">
            {authMode === 'login' ? 'Connexion' : 'Créer un compte'}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Fermer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5">
          {/* Google Sign In Button */}
          <button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 rounded-lg p-2.5 mb-4 hover:bg-gray-50 transition-colors"
          >
            {/* Logo Google SVG intégré directement */}
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 48 48">
              <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
              <path fill="#FF3D00" d="m6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z" />
              <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
              <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" />
            </svg>
            <span>{authMode === 'login' ? 'Se connecter avec Google' : 'S\'inscrire avec Google'}</span>
          </button>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">ou</span>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Login Form */}
            {authMode === 'login' ? (
              <>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email
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
                        className={`w-full pl-10 pr-3 py-2.5 rounded-lg border ${
                          errors.email ? 'border-red-500' : 'border-gray-300'
                        } focus:ring-2 focus:ring-primary-500 focus:border-primary-500`}
                        required
                      />
                    </div>
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                    )}
                  </div>

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
                        className={`w-full pl-10 pr-10 py-2.5 rounded-lg border ${
                          errors.password ? 'border-red-500' : 'border-gray-300'
                        } focus:ring-2 focus:ring-primary-500 focus:border-primary-500`}
                        required
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
                      <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <input
                        id="remember"
                        name="remember"
                        type="checkbox"
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <label htmlFor="remember" className="ml-2 block text-sm text-gray-700">
                        Se souvenir de moi
                      </label>
                    </div>
                    <a href="#" className="text-sm font-medium text-primary-600 hover:text-primary-500">
                      Mot de passe oublié?
                    </a>
                  </div>
                </div>
              </>
            ) : (
              // Registration Form
              <>
                {step === 1 ? (
                  <div className="space-y-4">
                    {/* Account Type Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Type de compte
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, type: 'individual' })}
                          className={`flex flex-col items-center justify-center p-3 border rounded-lg ${
                            formData.type === 'individual'
                              ? 'bg-primary-50 border-primary-500 text-primary-700'
                              : 'border-gray-300 text-gray-700'
                          }`}
                        >
                          <User size={24} className="mb-1" />
                          <span className="text-sm font-medium">Particulier</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, type: 'professional' })}
                          className={`flex flex-col items-center justify-center p-3 border rounded-lg ${
                            formData.type === 'professional'
                              ? 'bg-primary-50 border-primary-500 text-primary-700'
                              : 'border-gray-300 text-gray-700'
                          }`}
                        >
                          <Building size={24} className="mb-1" />
                          <span className="text-sm font-medium">Professionnel</span>
                        </button>
                      </div>
                    </div>

                    {/* Personal Info */}
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                        Nom complet
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                          <User size={18} />
                        </span>
                        <input
                          id="name"
                          name="name"
                          type="text"
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder="Votre nom"
                          className={`w-full pl-10 pr-3 py-2.5 rounded-lg border ${
                            errors.name ? 'border-red-500' : 'border-gray-300'
                          } focus:ring-2 focus:ring-primary-500 focus:border-primary-500`}
                          required
                        />
                      </div>
                      {errors.name && (
                        <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                      )}
                    </div>

                    {formData.type === 'professional' && (
                      <div>
                        <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-1">
                          Nom de l'entreprise
                        </label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                            <Building size={18} />
                          </span>
                          <input
                            id="companyName"
                            name="companyName"
                            type="text"
                            value={formData.companyName}
                            onChange={handleInputChange}
                            placeholder="Nom de votre entreprise"
                            className={`w-full pl-10 pr-3 py-2.5 rounded-lg border ${
                              errors.companyName ? 'border-red-500' : 'border-gray-300'
                            } focus:ring-2 focus:ring-primary-500 focus:border-primary-500`}
                          />
                        </div>
                        {errors.companyName && (
                          <p className="mt-1 text-sm text-red-600">{errors.companyName}</p>
                        )}
                      </div>
                    )}

                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                        Téléphone
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
                          placeholder="Votre numéro de téléphone"
                          className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="w-full py-2.5 px-4 bg-primary-bolt-500 hover:bg-primary-bolt-600 text-white font-medium rounded-lg transition-colors"
                    >
                      Continuer
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email
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
                          className={`w-full pl-10 pr-3 py-2.5 rounded-lg border ${
                            errors.email ? 'border-red-500' : 'border-gray-300'
                          } focus:ring-2 focus:ring-primary-500 focus:border-primary-500`}
                          required
                        />
                      </div>
                      {errors.email && (
                        <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                      )}
                    </div>

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
                          className={`w-full pl-10 pr-10 py-2.5 rounded-lg border ${
                            errors.password ? 'border-red-500' : 'border-gray-300'
                          } focus:ring-2 focus:ring-primary-500 focus:border-primary-500`}
                          required
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                      {renderPasswordStrength()}
                      {errors.password && (
                        <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                      )}
                    </div>

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
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          placeholder="••••••••"
                          className={`w-full pl-10 pr-10 py-2.5 rounded-lg border ${
                            errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                          } focus:ring-2 focus:ring-primary-500 focus:border-primary-500`}
                          required
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                      {errors.confirmPassword && (
                        <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-start">
                        <div className="flex items-center h-5">
                          <input
                            id="acceptTerms"
                            name="acceptTerms"
                            type="checkbox"
                            checked={formData.acceptTerms}
                            onChange={handleInputChange}
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                          />
                        </div>
                        <div className="ml-3">
                          <label htmlFor="acceptTerms" className="text-sm text-gray-700">
                            J'accepte les{' '}
                            <a href="#" className="font-medium text-primary-600 hover:text-primary-500">
                              conditions d'utilisation
                            </a>
                          </label>
                          {errors.terms && (
                            <p className="mt-1 text-xs text-red-600">{errors.terms}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-start">
                        <div className="flex items-center h-5">
                          <input
                            id="acceptNewsletter"
                            name="acceptNewsletter"
                            type="checkbox"
                            checked={formData.acceptNewsletter}
                            onChange={handleInputChange}
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                          />
                        </div>
                        <div className="ml-3">
                          <label htmlFor="acceptNewsletter" className="text-sm text-gray-700">
                            Je souhaite recevoir des actualités et offres par email
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="flex-1 py-2.5 px-4 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Retour
                      </button>
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="flex-1 py-2.5 px-4 bg-primary-bolt-500 hover:bg-primary-bolt-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
                      >
                        {isLoading ? "Création en cours..." : "Créer mon compte"}
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Submit button for login */}
            {authMode === 'login' && (
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 mt-4 px-4 bg-primary-bolt-500 hover:bg-primary-bolt-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                {isLoading ? "Connexion..." : "Se connecter"}
              </button>
            )}
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              {authMode === 'login' ? "Pas encore de compte ?" : "Déjà un compte ?"}
              <button
                type="button"
                onClick={switchMode}
                className="ml-1 font-medium text-primary-600 hover:text-primary-500"
              >
                {authMode === 'login' ? "Créer un compte" : "Se connecter"}
              </button>
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
