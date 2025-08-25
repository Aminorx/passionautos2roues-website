import { useEffect, useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { supabase, signIn as supabaseSignIn, signUp as supabaseSignUp, signInWithOAuth as supabaseSignInWithOAuth, signInWithMagicLink as supabaseSignInWithMagicLink, signOut as supabaseSignOut } from '@/lib/supabase';

type AuthCallback = () => void;

// Store for callbacks to execute after successful authentication
const callbackStorage = {
  onSuccess: null as AuthCallback | null,
  timestamp: 0
};

// Fonction pour déterminer l'URL de redirection appropriée pour OAuth
// en fonction de l'environnement (local, Replit, production)
const getRedirectUrl = (): string => {
  const origin = window.location.origin;
  
  // Déterminer l'environnement basé sur l'URL
  const isReplit = origin.includes('replit');
  const isDev = origin.includes('localhost') || origin.includes('127.0.0.1');
  
  if (isDev) {
    return `${origin}/auth/callback`;
  } else if (isReplit) {
    // Pour Replit, nous utilisons un chemin relatif
    return `/auth/callback`;
  } else {
    // Pour d'autres déploiements (production)
    return `${origin}/auth/callback`;
  }
};

/**
 * Service centralisé pour gérer l'authentification dans l'application
 */
export const useAuthService = () => {
  const { setShowAuthModal, setAuthMode } = useApp();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<any>(null);

  // Vérifier l'état de l'authentification au chargement
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const { data: { user } } = await supabase.auth.getUser();
        
        setIsAuthenticated(!!session);
        setUser(user);
      } catch (error) {
        console.error("Erreur de vérification d'authentification:", error);
      }
    };
    
    checkAuth();
    
    // S'abonner aux changements d'état d'authentification
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
      setUser(session?.user || null);
    });
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Logique pour stocker l'URL de redirection actuelle
  const saveRedirectUrl = () => {
    localStorage.setItem('authRedirectUrl', window.location.pathname);
  };

  /**
   * Ouvre la modal d'authentification avec un mode spécifique
   * @param mode - 'login' ou 'register'
   * @param onSuccess - Callback à exécuter après une connexion réussie
   * @param message - Message optionnel à afficher dans la modal
   */
  const openAuthModal = (mode: 'login' | 'register', onSuccess?: AuthCallback, message?: string) => {
    // Définir le mode d'authentification
    setAuthMode(mode);
    
    // Sauvegarder l'URL actuelle pour la redirection après authentification
    saveRedirectUrl();
    
    // Enregistrer le callback pour une utilisation ultérieure
    if (onSuccess) {
      callbackStorage.onSuccess = onSuccess;
      callbackStorage.timestamp = Date.now();
    }
    
    // Afficher la modal
    setShowAuthModal(true);
  };

  /**
   * À appeler après une authentification réussie
   * Exécute le callback enregistré s'il existe et est récent (moins de 5 minutes)
   */
  const handleAuthSuccess = () => {
    const currentTime = Date.now();
    const fiveMinutesInMs = 5 * 60 * 1000;
    
    // Vérifier si un callback existe et s'il est encore valide (moins de 5 minutes)
    if (callbackStorage.onSuccess && (currentTime - callbackStorage.timestamp < fiveMinutesInMs)) {
      const callback = callbackStorage.onSuccess;
      
      // Réinitialiser le stockage
      callbackStorage.onSuccess = null;
      callbackStorage.timestamp = 0;
      
      // Exécuter le callback
      callback();
      return true;
    }
    
    // Si pas de callback, rediriger vers l'URL sauvegardée
    const redirectUrl = localStorage.getItem('authRedirectUrl') || '/';
    localStorage.removeItem('authRedirectUrl');
    
    if (redirectUrl !== window.location.pathname) {
      window.location.href = redirectUrl;
    }
    
    return false;
  };

  // Wrapper pour la connexion
  const signIn = async (email: string, password: string) => {
    try {
      saveRedirectUrl();
      const { data, error } = await supabaseSignIn(email, password);
      
      if (error) {
        return { success: false, error: error.message };
      }
      
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Une erreur est survenue' };
    }
  };

  // Wrapper pour l'inscription
  const signUp = async (email: string, password: string, userData?: any) => {
    try {
      saveRedirectUrl();
      const { data, error } = await supabaseSignUp(email, password, userData);
      
      if (error) {
        return { success: false, error: error.message };
      }
      
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Une erreur est survenue' };
    }
  };

  // Wrapper pour l'authentification OAuth avec gestion des environnements
  const signInWithOAuth = async (provider: 'google' | 'github' | 'apple') => {
    saveRedirectUrl();
    
    const redirectUrl = getRedirectUrl();
    
    // Utiliser l'API Supabase directement avec notre URL de redirection personnalisée
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: redirectUrl
      }
    });
  };

  // Wrapper pour l'authentification par lien magique
  const signInWithMagicLink = async (email: string) => {
    try {
      saveRedirectUrl();
      const redirectUrl = getRedirectUrl();
      
      const { data, error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: redirectUrl
        }
      });
      
      if (error) {
        return { success: false, error: error.message };
      }
      
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Une erreur est survenue' };
    }
  };

  // Wrapper pour la déconnexion
  const signOut = async () => {
    await supabaseSignOut();
    window.location.href = '/';
  };

  return { 
    openAuthModal, 
    handleAuthSuccess,
    signIn,
    signUp,
    signInWithOAuth,
    signInWithMagicLink,
    signOut,
    isAuthenticated,
    user
  };
};
