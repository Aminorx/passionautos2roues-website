// Script pour configurer un système d'authentification propre
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupCleanAuth() {
  console.log('🚀 PHASE 2 : Configuration système d\'authentification propre');
  
  try {
    // Créer 2 utilisateurs de test dans Supabase Auth
    console.log('👤 Création utilisateurs de test...');
    
    // Utilisateur normal
    const testUser = {
      email: 'test@passionauto2roues.com',
      password: 'Test123456!',
      email_confirm: true
    };
    
    // Utilisateur admin  
    const adminUser = {
      email: 'admin@passionauto2roues.com',
      password: 'Admin123456!',
      email_confirm: true
    };
    
    // Créer dans Supabase Auth
    const { data: testAuthUser, error: testAuthError } = await supabase.auth.admin.createUser({
      email: testUser.email,
      password: testUser.password,
      email_confirm: true,
      user_metadata: {
        full_name: 'Utilisateur Test',
        phone: '+33 1 23 45 67 89'
      }
    });
    
    const { data: adminAuthUser, error: adminAuthError } = await supabase.auth.admin.createUser({
      email: adminUser.email,
      password: adminUser.password,
      email_confirm: true,
      user_metadata: {
        full_name: 'Admin PassionAuto2Roues',
        phone: '+33 1 98 76 54 32'
      }
    });
    
    console.log('✅ Utilisateurs Auth créés');
    
    // Créer les profils correspondants dans la table users
    if (testAuthUser?.user) {
      const { error: testUserError } = await supabase
        .from('users')
        .insert({
          id: testAuthUser.user.id,
          email: testUser.email,
          name: 'Utilisateur Test',
          type: 'individual',
          phone: '+33 1 23 45 67 89',
          whatsapp: '+33 1 23 45 67 89',
          city: 'Lyon',
          postal_code: '69001',
          email_verified: true
        });
        
      if (testUserError) {
        console.error('❌ Erreur création profil test:', testUserError);
      } else {
        console.log('✅ Profil utilisateur test créé');
      }
    }
    
    if (adminAuthUser?.user) {
      const { error: adminUserError } = await supabase
        .from('users')
        .insert({
          id: adminAuthUser.user.id,
          email: adminUser.email,
          name: 'Admin PassionAuto2Roues',
          type: 'professional',
          phone: '+33 1 98 76 54 32',
          whatsapp: '+33 1 98 76 54 32',
          city: 'Paris',
          postal_code: '75001',
          email_verified: true,
          company_name: 'PassionAuto2Roues Admin',
          verified: true
        });
        
      if (adminUserError) {
        console.error('❌ Erreur création profil admin:', adminUserError);
      } else {
        console.log('✅ Profil admin créé');
      }
    }
    
    // Statistiques finales
    const { count: usersCount } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });
    
    const { data: allUsers } = await supabase
      .from('users')
      .select('email, name, type');
    
    console.log('📊 SYSTÈME CONFIGURÉ :');
    console.log(`   👤 Total utilisateurs: ${usersCount}`);
    console.log('   📋 Utilisateurs disponibles:');
    allUsers?.forEach(user => {
      console.log(`      • ${user.email} (${user.name}) - ${user.type}`);
    });
    
    console.log('\n🔐 CREDENTIALS DE TEST :');
    console.log('   👤 Utilisateur normal:');
    console.log('      Email: test@passionauto2roues.com');
    console.log('      Password: Test123456!');
    console.log('   🛡️ Admin:');
    console.log('      Email: admin@passionauto2roues.com');
    console.log('      Password: Admin123456!');
    console.log('   🧪 Demo existant:');
    console.log('      Email: demo@demo.com');
    
    console.log('\n🎯 Configuration terminée avec succès !');
    
  } catch (error) {
    console.error('❌ Erreur configuration:', error);
  }
}

setupCleanAuth();