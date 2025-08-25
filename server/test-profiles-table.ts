// Test pour vérifier que la table profiles existe et est fonctionnelle
import { supabaseServer } from './supabase.js';

async function testProfilesTable() {
  console.log('🧪 Test de la table profiles...');
  
  try {
    // 1. Vérifier que la table profiles existe
    const { data: profiles, error: profilesError } = await supabaseServer
      .from('profiles')
      .select('*')
      .limit(5);
      
    if (profilesError) {
      console.error('❌ Table profiles non accessible:', profilesError);
      return;
    }
    
    console.log('✅ Table profiles accessible');
    console.log('📊 Profils existants:', profiles.length);
    
    profiles.forEach(profile => {
      console.log(`  - ${profile.id} - ${profile.account_type} - ${profile.phone || 'pas de tel'}`);
    });
    
    // 2. Vérifier les utilisateurs existants qui n'ont pas de profil
    const { data: users } = await supabaseServer
      .from('users')
      .select('id, email, name');
      
    console.log('👥 Utilisateurs dans users:', users?.length);
    
    // 3. Créer des profils pour les utilisateurs existants s'ils n'en ont pas
    if (users) {
      for (const user of users) {
        const existingProfile = profiles.find(p => p.id === user.id);
        if (!existingProfile) {
          console.log(`🔧 Création profil pour ${user.email}...`);
          
          const { error: createError } = await supabaseServer
            .from('profiles')
            .insert({
              id: user.id,
              account_type: 'individual',
              onboarding_completed: true // Utilisateurs existants considérés comme complétés
            });
            
          if (createError) {
            console.error(`❌ Erreur création profil ${user.email}:`, createError);
          } else {
            console.log(`✅ Profil créé pour ${user.email}`);
          }
        }
      }
    }
    
    console.log('');
    console.log('🎯 PROCHAINES ÉTAPES :');
    console.log('1. Configurer Google OAuth dans Supabase Dashboard');
    console.log('2. Tester création nouveau compte pour valider synchronisation automatique');
    console.log('3. Tester connexion Google OAuth');
    
  } catch (error) {
    console.error('❌ Erreur test profiles:', error);
  }
}

testProfilesTable();