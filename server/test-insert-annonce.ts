import { supabaseServer } from './supabase';

async function testInsertAnnonce() {
  console.log('🧪 TEST INSERTION - Une annonce dans la table annonces');
  
  try {
    // Insérer une seule annonce pour test
    const testAnnonce = {
      user_id: 'test_user',
      title: 'BMW 320d - Test connexion',
      description: 'BMW 320d en excellent état pour tester la connexion à la base de données annonces.',
      category: 'voiture',
      brand: 'BMW',
      model: '320d',
      year: 2020,
      mileage: 45000,
      fuel_type: 'diesel',
      condition: 'used',
      price: 28500,
      location: 'Paris 75011',
      images: ['https://images.pexels.com/photos/100650/pexels-photo-100650.jpeg'],
      features: ['GPS', 'Climatisation', 'Jantes alliage'],
      is_premium: false,
      views: 0,
      favorites: 0,
      status: 'approved'
    };
    
    const { data, error } = await supabaseServer
      .from('annonces')
      .insert([testAnnonce])
      .select();
    
    if (error) {
      console.error('❌ Erreur insertion test:', error);
      return;
    }
    
    console.log('✅ TEST RÉUSSI - Annonce insérée:', data);
    
    // Vérifier la lecture
    const { data: readData, error: readError } = await supabaseServer
      .from('annonces')
      .select('*')
      .eq('title', 'BMW 320d - Test connexion');
    
    if (readError) {
      console.error('❌ Erreur lecture:', readError);
      return;
    }
    
    console.log('✅ LECTURE CONFIRMÉE - Annonce récupérée:', readData);
    console.log('🎉 CONNEXION TABLE ANNONCES FONCTIONNELLE !');
    
  } catch (error) {
    console.error('❌ Erreur globale:', error);
  }
}

testInsertAnnonce();