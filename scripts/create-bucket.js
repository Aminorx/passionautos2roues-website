import { supabaseServer } from '../server/supabase.js';

async function createBucket() {
  console.log('🚀 Création du bucket vehicle-images...');
  
  try {
    // Vérifier si le bucket existe déjà
    const { data: buckets, error: listError } = await supabaseServer.storage.listBuckets();
    
    if (listError) {
      console.error('❌ Erreur lors de la récupération des buckets:', listError);
      return;
    }
    
    console.log('📦 Buckets existants:', buckets?.map(b => b.name) || []);
    
    const vehicleImagesBucket = buckets?.find(bucket => bucket.name === 'vehicle-images');
    
    if (vehicleImagesBucket) {
      console.log('✅ Le bucket "vehicle-images" existe déjà');
      return;
    }
    
    // Créer le bucket
    const { data, error } = await supabaseServer.storage.createBucket('vehicle-images', {
      public: true,
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
      fileSizeLimit: 5 * 1024 * 1024, // 5MB
    });
    
    if (error) {
      console.error('❌ Erreur lors de la création du bucket:', error);
      return;
    }
    
    console.log('✅ Bucket "vehicle-images" créé avec succès');
    console.log('📋 Détails:', data);
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

createBucket().then(() => process.exit(0)).catch(err => {
  console.error(err);
  process.exit(1);
});