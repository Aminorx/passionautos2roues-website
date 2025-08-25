import { supabaseServer } from './supabase';

async function testVehicleWithUser() {
  console.log('🔍 TEST STRUCTURE DONNÉES VEHICLE + USER');
  
  try {
    // Test comment les données arrivent depuis le backend
    const { data: vehicles, error } = await supabaseServer
      .from('annonces')
      .select(`
        *,
        users(*)
      `)
      .limit(2);
    
    if (error) {
      console.error('❌ Erreur:', error);
      return;
    }
    
    console.log('📊 STRUCTURE DES DONNÉES REÇUES:');
    vehicles?.forEach((vehicle, index) => {
      console.log(`\n--- VÉHICULE ${index + 1} ---`);
      console.log('ID:', vehicle.id);
      console.log('Title:', vehicle.title);
      console.log('User ID:', vehicle.user_id);
      console.log('Users Object:', JSON.stringify(vehicle.users, null, 2));
      
      if (vehicle.users) {
        console.log('✅ User Name:', vehicle.users.name);
        console.log('✅ User Email:', vehicle.users.email);
        console.log('✅ User Phone:', vehicle.users.phone);
        console.log('✅ User WhatsApp:', vehicle.users.whatsapp);
        console.log('✅ User Type:', vehicle.users.type);
      } else {
        console.log('❌ PROBLÈME: Pas de données users');
      }
    });
    
  } catch (error) {
    console.error('❌ Erreur globale:', error);
  }
}

testVehicleWithUser();