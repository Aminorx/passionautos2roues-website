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
    
    // 2. Synchroniser dans public.users
    const { data: syncedUser, error: userError } = await supabaseServer
      .from('users')
      .upsert({
        id: user.id,
        email: user.email || '',
        name: metadata.full_name || metadata.name || user.email?.split('@')[0] || 'Utilisateur Google',
        type: 'individual', // Par défaut pour Google OAuth
        phone: null,
        company_name: null,
        created_at: user.created_at,
        email_verified: user.email_confirmed_at ? true : false,
        // avatar_url: metadata.avatar_url || metadata.picture || null // Colonne n'existe pas
      })
      .select()
      .single();
      
    if (userError) {
      console.error('❌ Erreur sync users:', userError);
      return;
    }
    
    // 3. Synchroniser dans profiles
    const { data: profile, error: profileError } = await supabaseServer
      .from('profiles')
      .upsert({
        id: user.id,
        account_type: 'individual',
        phone: null,
        onboarding_completed: true, // Google OAuth considéré comme onboarding complet
        marketing_consent: false,
        created_at: user.created_at,
        // oauth_provider: 'google' // Colonne n'existe pas encore
      })
      .select()
      .single();
      
    if (profileError) {
      console.error('❌ Erreur sync profiles:', profileError);
      return;
    }
    
    console.log('✅ Utilisateur Google synchronisé avec succès !');
    console.log('👤 Utilisateur:', syncedUser.name);
    console.log('📧 Email:', syncedUser.email);
    console.log('🔗 Profil:', profile.account_type);
    
  } catch (error) {
    console.error('❌ Erreur synchronisation:', error);
  }
}

syncGoogleUser();