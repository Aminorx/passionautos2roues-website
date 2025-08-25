// Script pour corriger l'authentification admin
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixAdminAuth() {
  console.log('🔧 Correction authentification admin...');
  
  try {
    // 1. Supprimer l'ancien admin de Supabase Auth
    console.log('🗑️ Suppression ancien admin...');
    const { data: oldAdminAuth } = await supabase.auth.admin.listUsers();
    const oldAdmin = oldAdminAuth.users.find(u => u.email === 'admin@auto2roues.com');
    
    if (oldAdmin) {
      await supabase.auth.admin.deleteUser(oldAdmin.id);
      console.log('✅ Ancien admin supprimé de Auth');
    }
    
    // 2. Vérifier si le nouveau admin existe dans Auth
    const { data: newAdminAuth } = await supabase.auth.admin.listUsers();
    const newAdmin = newAdminAuth.users.find(u => u.email === 'admin@passionauto2roues.com');
    
    if (!newAdmin) {
      console.log('🔄 Création nouveau admin dans Auth...');
      const { data: createdAdmin, error: createError } = await supabase.auth.admin.createUser({
        email: 'admin@passionauto2roues.com',
        password: 'Admin123456!',
        email_confirm: true,
        user_metadata: {
          full_name: 'Admin PassionAuto2Roues',
          phone: '+33 1 98 76 54 32'
        }
      });
      
      if (createError) {
        console.error('❌ Erreur création admin Auth:', createError);
        return;
      }
      
      console.log('✅ Nouveau admin créé dans Auth');
      
      // Mettre à jour le profil avec le bon ID
      if (createdAdmin?.user) {
        const { error: updateError } = await supabase
          .from('users')
          .update({ id: createdAdmin.user.id })
          .eq('email', 'admin@passionauto2roues.com');
          
        if (updateError) {
          console.error('❌ Erreur mise à jour profil admin:', updateError);
        } else {
          console.log('✅ Profil admin mis à jour');
        }
      }
    } else {
      console.log('✅ Nouveau admin existe déjà dans Auth');
    }
    
    // 3. Vérification finale
    const { data: finalUsers } = await supabase.auth.admin.listUsers();
    const admins = finalUsers.users.filter(u => u.email?.includes('admin'));
    
    console.log('📊 Admins dans Auth:');
    admins.forEach(admin => {
      console.log(`   • ${admin.email} (${admin.id})`);
    });
    
    // Vérifier table users
    const { data: dbAdmins } = await supabase
      .from('users')
      .select('email, name, type')
      .eq('type', 'professional');
      
    console.log('📊 Admins dans DB:');
    dbAdmins?.forEach(admin => {
      console.log(`   • ${admin.email} (${admin.name})`);
    });
    
    console.log('🎯 Correction admin terminée!');
    console.log('📋 Credentials admin:');
    console.log('   Email: admin@passionauto2roues.com');
    console.log('   Password: Admin123456!');
    
  } catch (error) {
    console.error('❌ Erreur correction admin:', error);
  }
}

fixAdminAuth();