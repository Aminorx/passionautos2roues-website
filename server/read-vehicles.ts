import { supabaseServer } from './supabase';

async function readVehiclesData() {
  console.log('📋 LECTURE DONNÉES TABLE ANNONCES');
  
  try {
    // Lire toutes les données de la table annonces
    const { data, error, count } = await supabaseServer
      .from('annonces')
      .select('*', { count: 'exact' });
    
    if (error) {
      console.error('❌ Erreur lecture table annonces:', error);
      return;
    }
    
    console.log(`📊 Nombre total de véhicules: ${count}`);
    
    if (!data || data.length === 0) {
      console.log('📭 Table annonces vide - aucune donnée');
      return;
    }
    
    console.log('✅ DONNÉES VEHICLES TROUVÉES:');
    data.forEach((vehicle, index) => {
      console.log(`\n${index + 1}. ${vehicle.title || 'Sans titre'}`);
      console.log(`   ID: ${vehicle.id}`);
      console.log(`   Catégorie: ${vehicle.category}`);
      console.log(`   Prix: ${vehicle.price}€`);
      console.log(`   Marque: ${vehicle.brand}`);
      console.log(`   Modèle: ${vehicle.model}`);
      console.log(`   Utilisateur: ${vehicle.userId}`);
    });
    
    // Statistiques
    const categories = [...new Set(data.map(v => v.category))];
    const brands = [...new Set(data.map(v => v.brand))];
    
    console.log('\n📈 STATISTIQUES:');
    console.log(`   Catégories: ${categories.join(', ')}`);
    console.log(`   Marques: ${brands.join(', ')}`);
    
  } catch (error) {
    console.error('❌ Erreur globale:', error);
  }
}

readVehiclesData();