import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

// Page de callback pour OAuth (Google, Apple, Facebook)
export const AuthCallback: React.FC = () => {
  const [status, setStatus] = useState('processing');

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        console.log('🔄 Traitement callback OAuth...');
        
        // Échanger le code OAuth contre une session Supabase
        const { data, error } = await supabase.auth.exchangeCodeForSession(window.location.href);
        
        if (error) {
          console.error('❌ Erreur échange code:', error);
          setStatus('error');
          setTimeout(() => {
            window.location.href = '/?auth=error';
          }, 2000);
          return;
        }
        
        if (data.user) {
          console.log('✅ Session créée pour:', data.user.email);
          
          // Synchroniser l'utilisateur dans nos tables
          try {
            const syncResponse = await fetch('/api/auth/sync', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ 
                userId: data.user.id,
                userData: data.user.user_metadata || {}
              })
            });
            
            if (syncResponse.ok) {
              console.log('✅ Utilisateur synchronisé');
            } else {
              console.log('⚠️ Sync échouée, mais session créée');
            }
          } catch (syncError) {
            console.error('⚠️ Erreur sync:', syncError);
          }
          
          setStatus('success');
          
          // Nettoyer l'URL et rediriger
          window.history.replaceState({}, document.title, '/');
          setTimeout(() => {
            window.location.href = '/';
          }, 1000);
        } else {
          setStatus('error');
          setTimeout(() => {
            window.location.href = '/?auth=error';
          }, 2000);
        }
        
      } catch (error) {
        console.error('❌ Erreur callback OAuth:', error);
        setStatus('error');
        setTimeout(() => {
          window.location.href = '/?auth=error';
        }, 2000);
      }
    };

    handleOAuthCallback();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0CBFDE] mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-700 mb-2">
          {status === 'processing' && 'Connexion en cours...'}
          {status === 'success' && 'Connexion réussie !'}
          {status === 'error' && 'Erreur de connexion'}
        </h2>
        <p className="text-gray-500">
          {status === 'processing' && 'Nous finalisons votre connexion, veuillez patienter.'}
          {status === 'success' && 'Redirection vers votre tableau de bord...'}
          {status === 'error' && 'Une erreur est survenue, redirection...'}
        </p>
      </div>
    </div>
  );
};