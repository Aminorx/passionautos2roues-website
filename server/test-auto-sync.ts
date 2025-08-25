// Test de la synchronisation automatique en créant un utilisateur test
import { supabaseServer } from './supabase.js';

async function testAutoSync() {
  console.log('🧪 Test de la synchronisation automatique...');
  
  try {
    // Créer un utilisateur test via l'Admin API
    const testEmail = `test-sync-${Date.now()}@example.com`;
    const testPassword = 'TestPassword123!';
    
    console.log(`📝 Création utilisateur test: ${testEmail}`);
    
    const { data: newUser, error: createError } = await supabaseServer.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: true,
      user_metadata: {
        name: 'Test Sync User',
        type: 'individual',
        phone: '+33 1 23 45 67 89'
      }
    });
    
    if (createError) {
      console.error('❌ Erreur création utilisateur:', createError);
      return;
    }
    
    console.log('✅ Utilisateur créé dans auth.users');
    console.log('🔍 ID utilisateur:', newUser.user.id);
    
    // Attendre un peu pour que le trigger s'exécute
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Vérifier que l'utilisateur a été créé dans public.users
    const { data: publicUser, error: publicError } = await supabaseServer
      .from('users')
      .select('*')
      .eq('id', newUser.user.id)
      .single();
      
    if (publicError) {
      console.error('❌ Utilisateur pas trouvé dans public.users:', publicError);
    } else {
      console.log('✅ Utilisateur trouvé dans public.users:', publicUser.name);
    }
    
    // Vérifier que le profil a été créé
    const { data: profile, error: profileError } = await supabaseServer
      .from('profiles')
      .select('*')
      .eq('id', newUser.user.id)
      .single();
      
    if (profileError) {
      console.error('❌ Profil pas trouvé:', profileError);
    } else {
      console.log('✅ Profil créé:', profile.account_type, profile.phone);
    }
    
    // Nettoyer en supprimant l'utilisateur test
    console.log('🧹 Suppression utilisateur test...');
    await supabaseServer.auth.admin.deleteUser(newUser.user.id);
    console.log('✅ Utilisateur test supprimé');
    
  } catch (error) {
    console.error('❌ Erreur test:', error);
  }
}

testAutoSync();