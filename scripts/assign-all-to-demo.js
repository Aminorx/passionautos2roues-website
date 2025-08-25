// Script pour affecter toutes les annonces à l'utilisateur demo@demo.com
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables Supabase manquantes');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function assignAllToDemoUser() {
  const demoUserId = '3e4ab448-8958-4290-bda8-39466c90c36a';
  const demoEmail = 'demo@demo.com';
  
  try {
    console.log('🔄 Vérification utilisateur demo...');
    
    // Vérifier si l'utilisateur demo existe
    const { data: demoUser, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', demoUserId)
      .single();
    
    if (userError || !demoUser) {
      console.log('🔧 Création utilisateur demo...');
      const { error: createError } = await supabase
        .from('users')
        .insert({
          id: demoUserId,
          email: demoEmail,
          name: 'DemoUser',
          type: 'individual',
          phone: '+33 1 23 45 67 89',
          whatsapp: '+33 1 23 45 67 89',
          city: 'Paris',
          postal_code: '75001',
          email_verified: true
        });
        
      if (createError) {
        console.error('❌ Erreur création demo user:', createError);
        return;
      }
      console.log('✅ Utilisateur demo créé');
    } else {
      console.log('✅ Utilisateur demo trouvé:', demoUser.name);
    }
    
    // Compter les annonces actuelles
    const { count, error: countError } = await supabase
      .from('annonces')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('❌ Erreur comptage:', countError);
      return;
    }
    
    console.log(`📊 ${count} annonces à réaffecter...`);
    
    // Affecter toutes les annonces à demo
    const { data, error: updateError } = await supabase
      .from('annonces')
      .update({ user_id: demoUserId })
      .neq('user_id', demoUserId); // Pour éviter les mises à jour inutiles
    
    if (updateError) {
      console.error('❌ Erreur réaffectation:', updateError);
      return;
    }
    
    // Vérification finale
    const { count: finalCount, error: finalError } = await supabase
      .from('annonces')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', demoUserId);
      
    if (finalError) {
      console.error('❌ Erreur vérification:', finalError);
      return;
    }
    
    console.log(`✅ ${finalCount} annonces maintenant affectées à demo@demo.com`);
    console.log('🎯 Réaffectation terminée avec succès !');
    
  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

assignAllToDemoUser();