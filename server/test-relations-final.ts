import { supabaseServer } from './supabase';

async function testRelationsFinal() {
  console.log('🔗 TEST FINAL DES RELATIONS ANNONCES ↔ USERS');
  
  try {
    // Test de jointure annonces avec users
    const { data: annoncesWith Users, error: joinError } = await supabaseServer
      .from('annonces')
      .select(`
        id,
        title,
        user_id,
        price,
        category,
        users!inner(id, name, email, type)
      `)
      .limit(10);
    
    if (joinError) {
      console.error('❌ Erreur jointure:', joinError);
      return;
    }
    
    console.log('✅ RELATIONS FONCTIONNELLES !');
    console.log(`📊 ${annoncesWith Users?.length} annonces avec users liés`);
    
    annoncesWith Users?.forEach(annonce => {
      console.log(`   ${annonce.id}: ${annonce.title}`);
      console.log(`      → User: ${annonce.users.name} (${annonce.users.email})`);
      console.log(`      → Prix: ${annonce.price}€ | Catégorie: ${annonce.category}\n`);
    });
    
    // Statistiques par type d'utilisateur
    const individualCount = annoncesWith Users?.filter(a => a.users.type === 'individual').length || 0;
    const professionalCount = annoncesWith Users?.filter(a => a.users.type === 'professional').length || 0;
    
    console.log('📈 RÉPARTITION PAR TYPE:');
    console.log(`   Particuliers: ${individualCount} annonces`);
    console.log(`   Professionnels: ${professionalCount} annonces`);
    
  } catch (error) {
    console.error('❌ Erreur globale:', error);
  }
}

testRelationsFinal();