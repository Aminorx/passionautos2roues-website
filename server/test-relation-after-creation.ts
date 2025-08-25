import { supabaseServer } from './supabase';

async function testRelationAfterCreation() {
  console.log('🔗 TEST DE LA RELATION APRÈS CRÉATION');
  
  try {
    // Test simple de jointure
    const { data: joinTest, error: joinError } = await supabaseServer
      .from('annonces')
      .select(`
        id,
        title,
        user_id,
        price,
        users(id, name, email, type)
      `)
      .limit(5);
    
    if (joinError) {
      console.error('❌ Relation non fonctionnelle:', joinError.message);
      console.log('💡 Exécutez le fichier create-foreign-key-relation.sql dans Supabase');
      return;
    }
    
    console.log('✅ RELATION FONCTIONNELLE !');
    console.log(`📊 ${joinTest?.length} annonces avec users liés`);
    
    joinTest?.forEach(annonce => {
      console.log(`\n   Annonce ${annonce.id}: ${annonce.title}`);
      console.log(`   Prix: ${annonce.price}€`);
      console.log(`   User: ${annonce.users?.name} (${annonce.users?.email})`);
      console.log(`   Type: ${annonce.users?.type}`);
    });
    
    // Statistiques
    const total = joinTest?.length || 0;
    const individuals = joinTest?.filter(a => a.users?.type === 'individual').length || 0;
    const professionals = joinTest?.filter(a => a.users?.type === 'professional').length || 0;
    
    console.log('\n📈 STATISTIQUES:');
    console.log(`   Total: ${total} annonces testées`);
    console.log(`   Particuliers: ${individuals}`);
    console.log(`   Professionnels: ${professionals}`);
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

// Attendre 2 secondes puis tester (laisser le temps de créer la relation)
setTimeout(testRelationAfterCreation, 2000);