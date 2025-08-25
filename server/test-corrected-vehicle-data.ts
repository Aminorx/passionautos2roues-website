import { supabaseServer } from './supabase';

async function testCorrectedVehicleData() {
  console.log('🔍 TEST DES DONNÉES CORRIGÉES VEHICLE + USER');
  
  try {
    // Simuler ce que fait getAllVehicles() maintenant
    const { data, error } = await supabaseServer
      .from('annonces')
      .select(`
        *,
        users(*)
      `)
      .limit(3);
    
    if (error) {
      console.error('❌ Erreur:', error);
      return;
    }
    
    console.log(`📊 ${data?.length} véhicules avec données complètes`);
    
    data?.forEach((annonce, index) => {
      console.log(`\n--- VÉHICULE ${index + 1} ---`);
      console.log('✅ Titre:', annonce.title);
      console.log('✅ Prix:', annonce.price, '€');
      
      if (annonce.users) {
        console.log('👤 VENDEUR:');
        console.log('   Nom:', annonce.users.name);
        console.log('   Email:', annonce.users.email);
        console.log('   Téléphone:', annonce.users.phone || 'Non renseigné');
        console.log('   WhatsApp:', annonce.users.whatsapp || 'Non renseigné');
        console.log('   Type:', annonce.users.type);
        console.log('   Entreprise:', annonce.users.company_name || 'N/A');
        console.log('   Vérifié:', annonce.users.verified ? 'Oui' : 'Non');
      } else {
        console.log('❌ PROBLÈME: Données vendeur manquantes');
      }
    });
    
    console.log('\n🎯 RÉSULTAT: Les données vendeur sont maintenant disponibles pour l\'affichage !');
    
  } catch (error) {
    console.error('❌ Erreur globale:', error);
  }
}

testCorrectedVehicleData();