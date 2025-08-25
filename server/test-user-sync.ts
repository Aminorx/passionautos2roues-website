// Test de synchronisation des utilisateurs
import { supabaseServer } from './supabase.js';

async function testUserSync() {
  console.log('🧪 Test de synchronisation des utilisateurs...');
  
  try {
    // 1. Tester les utilisateurs auth existants
    const { data: authUsers, error: authError } = await supabaseServer.auth.admin.listUsers();
    
    if (authError) {
      console.error('❌ Erreur récupération utilisateurs auth:', authError);
      return;
    }
    
    console.log('👥 Utilisateurs auth.users:', authUsers.users.length);
    authUsers.users.forEach(user => {
      console.log(`  - ${user.email} (${user.id})`);
      console.log(`    Métadonnées:`, user.user_metadata);
    });
    
    // 2. Tester les utilisateurs dans public.users
    const { data: publicUsers, error: publicError } = await supabaseServer
      .from('users')
      .select('*');
      
    if (publicError) {
      console.error('❌ Erreur récupération public.users:', publicError);
    } else {
      console.log('📊 Utilisateurs public.users:', publicUsers.length);
      publicUsers.forEach(user => {
        console.log(`  - ${user.email} (${user.id}) - ${user.name}`);
      });
    }
    
    // 3. Vérifier correspondance
    const authEmails = authUsers.users.map(u => u.email);
    const publicEmails = publicUsers?.map(u => u.email) || [];
    
    const missingInPublic = authEmails.filter(email => !publicEmails.includes(email));
    
    if (missingInPublic.length > 0) {
      console.log('⚠️ Utilisateurs manquants dans public.users:', missingInPublic);
    } else {
      console.log('✅ Tous les utilisateurs auth sont synchronisés');
    }
    
  } catch (error) {
    console.error('❌ Erreur test:', error);
  }
}

testUserSync();