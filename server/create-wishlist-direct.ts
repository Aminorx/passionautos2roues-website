// Création de la table wishlist directement via notre serveur
import { supabaseServer } from './db.js';

export async function createWishlistTable() {
  console.log('🔄 Création table wishlist via serveur Node.js...');
  
  const createTableSQL = `
    -- Table wishlist pour la gestion des favoris
    CREATE TABLE IF NOT EXISTS public.wishlist (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL,
      vehicle_id INTEGER NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      CONSTRAINT wishlist_user_vehicle_unique UNIQUE (user_id, vehicle_id)
    );

    -- Ajouter la référence après coup pour éviter les problèmes
    DO $$ 
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_wishlist_user'
      ) THEN
        ALTER TABLE public.wishlist 
        ADD CONSTRAINT fk_wishlist_user 
        FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
      END IF;
    END $$;

    -- Index pour optimiser les performances
    CREATE INDEX IF NOT EXISTS idx_wishlist_user_id ON public.wishlist(user_id);
    CREATE INDEX IF NOT EXISTS idx_wishlist_vehicle_id ON public.wishlist(vehicle_id);
    CREATE INDEX IF NOT EXISTS idx_wishlist_created_at ON public.wishlist(created_at DESC);

    -- Donner les permissions nécessaires
    GRANT ALL ON public.wishlist TO postgres;
    GRANT ALL ON public.wishlist TO service_role;
  `;

  try {
    // Exécuter la création via notre client Supabase serveur
    const { data, error } = await supabaseServer.rpc('exec_sql', {
      sql: createTableSQL
    });

    if (error) {
      console.error('❌ Erreur création table wishlist:', error);
      return false;
    }

    console.log('✅ Table wishlist créée avec succès');
    
    // Test de vérification
    const { data: testData, error: testError } = await supabaseServer
      .from('wishlist')
      .select('id')
      .limit(1);
      
    if (testError) {
      console.error('❌ Erreur test table:', testError);
      return false;
    }

    console.log('✅ Table wishlist vérifiée et accessible');
    return true;
    
  } catch (error) {
    console.error('❌ Erreur complète création wishlist:', error);
    return false;
  }
}

// Migrer les favoris existants du bio vers la table wishlist
export async function migrateFavoritesFromBio() {
  console.log('🔄 Migration favoris bio → table wishlist...');
  
  try {
    // Récupérer tous les utilisateurs avec des favoris dans bio
    const { data: users, error: usersError } = await supabaseServer
      .from('users')
      .select('id, bio')
      .not('bio', 'is', null);

    if (usersError) {
      console.error('❌ Erreur récupération utilisateurs:', usersError);
      return false;
    }

    let migratedCount = 0;
    
    for (const user of users || []) {
      try {
        if (!user.bio) continue;
        
        const bioData = JSON.parse(user.bio);
        const favorites = bioData.favorites || [];
        
        if (favorites.length === 0) continue;
        
        console.log(`🔄 Migration ${favorites.length} favoris pour utilisateur ${user.id}`);
        
        // Insérer les favoris dans la table wishlist
        for (const vehicleId of favorites) {
          const { error: insertError } = await supabaseServer
            .from('wishlist')
            .upsert({
              user_id: user.id,
              vehicle_id: parseInt(vehicleId)
            }, {
              onConflict: 'user_id,vehicle_id'
            });
            
          if (insertError) {
            console.error(`❌ Erreur insertion favori ${vehicleId}:`, insertError);
          } else {
            migratedCount++;
          }
        }
        
      } catch (e) {
        console.error(`❌ Erreur parsing bio utilisateur ${user.id}:`, e);
      }
    }
    
    console.log(`✅ Migration terminée: ${migratedCount} favoris migrés`);
    return true;
    
  } catch (error) {
    console.error('❌ Erreur migration favoris:', error);
    return false;
  }
}