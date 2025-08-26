// Synchroniser manuellement l'utilisateur Google OAuth qui vient de se connecter
import { supabaseServer } from './supabase.js';

async function syncGoogleUser() {
  console.log('🔄 Synchronisation manuelle utilisateur Google OAuth...');
  
  const userId = '530429f5-3766-4907-ba51-862d61710112';
  const email = 'amine.ennoury@gmail.com';
  
  try {
    // 1. Récupérer les données depuis auth.users
    const { data: authUser, error: authError } = await supabaseServer.auth.admin.getUserById(userId);
    
    if (authError || !authUser.user) {
      console.error('❌ Utilisateur auth introuvable:', authError);
      return;
    }
    
    const user = authUser.user;
    const metadata = user.user_metadata || {};
    
    console.log('📊 Données utilisateur Google :');
    console.log('   Email:', user.email);
    console.log('   Nom:', metadata.full_name || metadata.name);
    console.log('   Avatar:', metadata.avatar_url);
    console.log('   Provider:', metadata.provider);
    
    // 2. Synchroniser dans public.users (table unifiée)
    const { data: syncedUser, error: userError } = await supabaseServer
      .from('users')
      .upsert({
        id: user.id,
        email: user.email || '',
        name: metadata.full_name || metadata.name || user.email?.split('@')[0] || 'Utilisateur Google',
        type: 'individual', // Par défaut pour Google OAuth - tous les comptes démarrent en particulier
        phone: null,
        companyName: null,
        avatar: metadata.avatar_url || metadata.picture || null,
        emailVerified: user.email_confirmed_at ? true : false,
        onboardingCompleted: true, // Google OAuth considéré comme onboarding complet
        marketingConsent: false,
        createdAt: user.created_at,
      })
      .select()
      .single();
      
    if (userError) {
      console.error('❌ Erreur sync users:', userError);
      return;
    }
    
    console.log('✅ Utilisateur Google synchronisé dans table users unifiée:');
    console.log('👤 Utilisateur:', syncedUser.name);
    console.log('📧 Email:', syncedUser.email);
    console.log('🔗 Type:', syncedUser.type);
    
  } catch (error) {
    console.error('❌ Erreur synchronisation:', error);
  }
}

// syncGoogleUser();