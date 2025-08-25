import type { Express } from "express";
import { supabaseServer } from "../supabase.js";

export async function setupWishlistMigration(app: Express) {
  // Route pour créer la table wishlist
  app.post('/api/admin/create-wishlist-table', async (req, res) => {
    console.log('🔄 Création table wishlist via API...');
    
    const createTableSQL = `
      -- Table wishlist pour la gestion des favoris
      CREATE TABLE IF NOT EXISTS public.wishlist (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL,
        vehicle_id TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        CONSTRAINT wishlist_user_vehicle_unique UNIQUE (user_id, vehicle_id)
      );

      -- Index pour optimiser les performances
      CREATE INDEX IF NOT EXISTS idx_wishlist_user_id ON public.wishlist(user_id);
      CREATE INDEX IF NOT EXISTS idx_wishlist_vehicle_id ON public.wishlist(vehicle_id);
      CREATE INDEX IF NOT EXISTS idx_wishlist_created_at ON public.wishlist(created_at DESC);
    `;

    try {
      // Créer directement via une requête SQL simple
      const { error } = await supabaseServer
        .rpc('exec_sql', { sql: createTableSQL });
      
      if (error) {
        console.error('❌ Erreur création table wishlist:', error);
        return res.status(500).json({ error: 'Erreur création table' });
      }

      console.log('✅ Table wishlist créée avec succès');
      
      // Test de vérification
      const { data: testData, error: testError } = await supabaseServer
        .from('wishlist')
        .select('id')
        .limit(1);
        
      if (testError) {
        console.error('❌ Erreur test table:', testError);
        return res.status(500).json({ error: 'Table non accessible' });
      }

      res.json({ 
        success: true, 
        message: 'Table wishlist créée et vérifiée avec succès' 
      });
      
    } catch (error) {
      console.error('❌ Erreur complète:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  });

  // Route pour migrer les favoris existants
  app.post('/api/admin/migrate-favorites', async (req, res) => {
    console.log('🔄 Migration favoris bio → table wishlist...');
    
    try {
      // Récupérer tous les utilisateurs avec des favoris dans bio
      const { data: users, error: usersError } = await supabaseServer
        .from('users')
        .select('id, bio')
        .not('bio', 'is', null);

      if (usersError) {
        console.error('❌ Erreur récupération utilisateurs:', usersError);
        return res.status(500).json({ error: 'Erreur récupération utilisateurs' });
      }

      let migratedCount = 0;
      const results = [];
      
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
                vehicle_id: vehicleId.toString()
              }, {
                onConflict: 'user_id,vehicle_id'
              });
              
            if (insertError) {
              console.error(`❌ Erreur insertion favori ${vehicleId}:`, insertError);
            } else {
              migratedCount++;
            }
          }
          
          results.push({
            userId: user.id,
            favoritesCount: favorites.length,
            status: 'migrated'
          });
          
        } catch (e) {
          console.error(`❌ Erreur parsing bio utilisateur ${user.id}:`, e);
          results.push({
            userId: user.id,
            status: 'error',
            error: e.message
          });
        }
      }
      
      console.log(`✅ Migration terminée: ${migratedCount} favoris migrés`);
      
      res.json({ 
        success: true, 
        migratedCount,
        results,
        message: `${migratedCount} favoris migrés avec succès`
      });
      
    } catch (error) {
      console.error('❌ Erreur migration favoris:', error);
      res.status(500).json({ error: 'Erreur migration' });
    }
  });
}