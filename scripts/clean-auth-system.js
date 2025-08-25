// Script de nettoyage complet du système d'authentification
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function cleanAuthSystem() {
  console.log('🧹 PHASE 1 : Nettoyage complet du système d\'authentification');
  
  try {
    // 1. Nettoyer tous les utilisateurs sauf demo
    console.log('🔄 Suppression utilisateurs non-demo...');
    const { error: deleteUsersError } = await supabase
      .from('users')
      .delete()
      .neq('email', 'demo@demo.com');
    
    if (deleteUsersError) {
      console.error('❌ Erreur suppression users:', deleteUsersError);
    } else {
      console.log('✅ Utilisateurs non-demo supprimés');
    }
    
    // 2. Vérifier l'utilisateur demo
    const { data: demoUser, error: demoError } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'demo@demo.com')
      .single();
    
    if (demoError || !demoUser) {
      console.log('🔧 Recréation utilisateur demo...');
      const { error: createError } = await supabase
        .from('users')
        .insert({
          id: '3e4ab448-8958-4290-bda8-39466c90c36a',
          email: 'demo@demo.com',
          name: 'DemoUser',
          type: 'individual',
          phone: '+33 1 23 45 67 89',
          whatsapp: '+33 1 23 45 67 89',
          city: 'Paris',
          postal_code: '75001',
          email_verified: true
        });
        
      if (createError) {
        console.error('❌ Erreur création demo:', createError);
      } else {
        console.log('✅ Utilisateur demo recréé');
      }
    } else {
      console.log('✅ Utilisateur demo OK:', demoUser.name);
    }
    
    // 3. Nettoyer les tables liées
    console.log('🔄 Nettoyage tables liées...');
    
    // Nettoyer wishlist
    const { error: wishlistError } = await supabase
      .from('wishlist')
      .delete()
      .neq('user_id', '3e4ab448-8958-4290-bda8-39466c90c36a');
    
    // Nettoyer saved_searches
    const { error: savedSearchesError } = await supabase
      .from('saved_searches')
      .delete()
      .neq('user_id', '3e4ab448-8958-4290-bda8-39466c90c36a');
    
    // Nettoyer messages (supprimer tous pour simplicité)
    const { error: messagesError } = await supabase
      .from('messages')
      .delete()
      .gte('id', '0'); // Supprimer tous les messages
    
    console.log('✅ Tables liées nettoyées');
    
    // 4. Statistiques finales
    const { count: usersCount } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });
    
    const { count: annoncesCount } = await supabase
      .from('annonces')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', '3e4ab448-8958-4290-bda8-39466c90c36a');
    
    console.log('📊 ÉTAT FINAL :');
    console.log(`   👤 Utilisateurs: ${usersCount} (demo uniquement)`);
    console.log(`   📝 Annonces demo: ${annoncesCount}`);
    console.log('🎯 Nettoyage terminé avec succès !');
    
  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

cleanAuthSystem();