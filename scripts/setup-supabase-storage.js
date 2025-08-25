import { supabaseServer } from '../server/supabase.ts';

async function setupStorage() {
  try {
    console.log('🚀 Configuration du stockage Supabase...');
    
    // Créer le bucket pour les images de véhicules s'il n'existe pas
    const { data: buckets, error: listError } = await supabaseServer.storage.listBuckets();
    
    if (listError) {
      console.error('❌ Erreur lors de la récupération des buckets:', listError);
      return;
    }
    
    console.log('📦 Buckets existants:', buckets.map(b => b.name));
    
    const vehicleImagesBucket = buckets.find(bucket => bucket.name === 'vehicle-images');
    
    if (!vehicleImagesBucket) {
      console.log('🔨 Création du bucket "vehicle-images"...');
      
      const { data, error } = await supabaseServer.storage.createBucket('vehicle-images', {
        public: true,
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
        fileSizeLimit: 5 * 1024 * 1024, // 5MB
      });
      
      if (error) {
        console.error('❌ Erreur lors de la création du bucket:', error);
        return;
      }
      
      console.log('✅ Bucket "vehicle-images" créé avec succès:', data);
    } else {
      console.log('✅ Bucket "vehicle-images" existe déjà');
    }
    
    // Configurer les politiques RLS (Row Level Security)
    console.log('🔐 Configuration des politiques de sécurité...');
    
    // Note: Les politiques RLS doivent être configurées dans le dashboard Supabase
    // ou via SQL direct pour des raisons de sécurité
    console.log('ℹ️  Politiques de sécurité à configurer manuellement dans le dashboard Supabase:');
    console.log('   1. Permettre lecture publique (SELECT sur vehicle-images)');
    console.log('   2. Permettre upload authentifié (INSERT sur vehicle-images)');
    console.log('   3. Permettre suppression par propriétaire (DELETE sur vehicle-images)');
    
    console.log('🎉 Configuration du stockage terminée !');
    
  } catch (error) {
    console.error('❌ Erreur lors de la configuration du stockage:', error);
  }
}

// Exécuter si appelé directement
if (import.meta.url === `file://${process.argv[1]}`) {
  setupStorage();
}

export { setupStorage };