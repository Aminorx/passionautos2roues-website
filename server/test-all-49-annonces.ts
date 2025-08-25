import { supabaseServer } from './supabase';

async function testAll49Annonces() {
  console.log('📊 TEST COMPLET DES 49 ANNONCES [BD]');
  
  try {
    // Récupérer TOUTES les annonces avec leurs users
    const { data: allAnnonces, error: joinError } = await supabaseServer
      .from('annonces')
      .select(`
        id,
        title,
        user_id,
        price,
        category,
        users(id, name, email, type)
      `)
      .order('id');
    
    if (joinError) {
      console.error('❌ Erreur:', joinError);
      return;
    }
    
    console.log(`✅ ${allAnnonces?.length} annonces récupérées avec users`);
    
    // Statistiques détaillées
    const categories = new Map();
    const userTypes = new Map();
    const priceRanges = new Map();
    
    allAnnonces?.forEach(annonce => {
      // Par catégorie
      const cat = annonce.category;
      categories.set(cat, (categories.get(cat) || 0) + 1);
      
      // Par type d'utilisateur
      const userType = annonce.users?.type || 'unknown';
      userTypes.set(userType, (userTypes.get(userType) || 0) + 1);
      
      // Par gamme de prix
      const price = annonce.price;
      let range = '';
      if (price < 1000) range = '< 1000€';
      else if (price < 5000) range = '1000-5000€';
      else if (price < 15000) range = '5000-15000€';
      else if (price < 30000) range = '15000-30000€';
      else range = '> 30000€';
      
      priceRanges.set(range, (priceRanges.get(range) || 0) + 1);
    });
    
    console.log('\n📈 STATISTIQUES COMPLÈTES:');
    
    console.log('\n🚗 Par catégorie:');
    [...categories.entries()].sort((a, b) => b[1] - a[1]).forEach(([cat, count]) => {
      console.log(`   ${cat}: ${count} annonces`);
    });
    
    console.log('\n👥 Par type d\'utilisateur:');
    [...userTypes.entries()].forEach(([type, count]) => {
      console.log(`   ${type}: ${count} annonces`);
    });
    
    console.log('\n💰 Par gamme de prix:');
    [...priceRanges.entries()].forEach(([range, count]) => {
      console.log(`   ${range}: ${count} annonces`);
    });
    
    // Exemples d'annonces par type d'utilisateur
    console.log('\n🔍 EXEMPLES PAR TYPE:');
    
    const professionals = allAnnonces?.filter(a => a.users?.type === 'professional').slice(0, 3);
    console.log('\nProfessionnels:');
    professionals?.forEach(a => {
      console.log(`   ${a.id}: ${a.title} - ${a.price}€ (${a.users.name})`);
    });
    
    const individuals = allAnnonces?.filter(a => a.users?.type === 'individual').slice(0, 3);
    console.log('\nParticuliers:');
    individuals?.forEach(a => {
      console.log(`   ${a.id}: ${a.title} - ${a.price}€ (${a.users.name})`);
    });
    
  } catch (error) {
    console.error('❌ Erreur globale:', error);
  }
}

testAll49Annonces();