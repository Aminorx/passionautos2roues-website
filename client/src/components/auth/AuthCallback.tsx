import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

/**
 * Composant pour gérer les redirections après authentification OAuth ou Magic Link
 * Ce composant devrait être placé à l'URL /auth/callback
 */
export default function AuthCallback() {
  const [message, setMessage] = useState('Redirection en cours...');

  useEffect(() => {
    // Vérification du hash URL pour l'authentification
    const handleAuthRedirect = async () => {
      try {
        // Récupère les paramètres de l'URL après une authentification OAuth
        const { error } = await supabase.auth.getSession();

        if (error) {
          console.error('Erreur de redirection auth:', error);
          setMessage('Une erreur est survenue lors de la connexion.');
          return;
        }

        // Si l'authentification a réussi, redirigez vers la page d'accueil ou une autre page
        const returnUrl = localStorage.getItem('authRedirectUrl') || '/';
        localStorage.removeItem('authRedirectUrl'); // Nettoyer après utilisation
        
        // Attendre un peu avant de rediriger
        setTimeout(() => {
          window.location.href = returnUrl;
        }, 1000);
        
      } catch (error) {
        console.error('Erreur lors du traitement de la redirection:', error);
        setMessage("Une erreur est survenue. Veuillez réessayer.");
      }
    };

    handleAuthRedirect();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="p-6 max-w-sm w-full bg-white shadow-md rounded-lg">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">
          {message}
        </h2>
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-bolt-500"></div>
        </div>
      </div>
    </div>
  );
}
