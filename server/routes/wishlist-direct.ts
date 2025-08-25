import type { Express } from "express";
import { supabaseServer } from "../supabase.js";

export async function setupWishlistDirect(app: Express) {
  // Route pour créer et tester la table wishlist directement
  app.post('/api/admin/setup-wishlist', async (req, res) => {
    console.log('🔄 Configuration complète de la table wishlist...');
    
    try {
      // 1. Vérifier si la table existe déjà
      console.log('🔍 Vérification existence table wishlist...');
      const { data: existingTable, error: checkError } = await supabaseServer
        .from('wishlist')
        .select('id')
        .limit(1);
        
      if (!checkError) {
        console.log('✅ Table wishlist existe déjà');
        res.json({ 
          success: true, 
          message: 'Table wishlist existe déjà et est accessible',
          tableExists: true
        });
        return;
      }
      
      console.log('ℹ️ Table wishlist n\'existe pas encore, message:', checkError.message);
      
      // 2. Si la table n'existe pas, on ne peut pas la créer via l'API Supabase client
      // Informer l'utilisateur qu'il faut la créer via l'interface Supabase
      res.json({
        success: false,
        message: 'La table wishlist doit être créée manuellement dans Supabase',
        error: checkError.message,
        instructions: {
          step1: 'Aller sur https://supabase.com/dashboard',
          step2: 'Ouvrir l\'éditeur SQL',
          step3: 'Exécuter le script SQL fourni',
          sql: `
-- Table wishlist pour la gestion des favoris
CREATE TABLE public.wishlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  vehicle_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT wishlist_user_vehicle_unique UNIQUE (user_id, vehicle_id)
);

-- Index pour optimiser les performances
CREATE INDEX idx_wishlist_user_id ON public.wishlist(user_id);
CREATE INDEX idx_wishlist_vehicle_id ON public.wishlist(vehicle_id);
CREATE INDEX idx_wishlist_created_at ON public.wishlist(created_at DESC);

-- Donner les permissions nécessaires
GRANT ALL ON public.wishlist TO postgres;
GRANT ALL ON public.wishlist TO authenticated;
GRANT ALL ON public.wishlist TO service_role;
          `
        }
      });
      
    } catch (error) {
      console.error('❌ Erreur configuration wishlist:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  });

  // Route pour migrer les favoris existants (uniquement si table existe)
  app.post('/api/admin/migrate-favorites-safe', async (req, res) => {
    console.log('🔄 Migration sécurisée favoris → table wishlist...');
    
    try {
      // 1. Vérifier que la table wishlist existe
      const { data: testWishlist, error: wishlistError } = await supabaseServer
        .from('wishlist')
        .select('id')
        .limit(1);
        
      if (wishlistError) {
        return res.status(400).json({ 
          error: 'Table wishlist n\'existe pas',
          message: 'Créez d\'abord la table wishlist avec /api/admin/setup-wishlist'
        });
      }
      
      console.log('✅ Table wishlist confirmée, début migration...');
      
      // 2. Récupérer tous les utilisateurs avec des favoris dans bio
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
          
          // 3. Insérer les favoris dans la table wishlist un par un avec gestion d'erreur
          for (const vehicleId of favorites) {
            try {
              const { data: insertData, error: insertError } = await supabaseServer
                .from('wishlist')
                .insert({
                  user_id: user.id,
                  vehicle_id: vehicleId.toString()
                })
                .select()
                .single();
                
              if (insertError) {
                // Si erreur de contrainte unique, c'est normal (déjà existant)
                if (insertError.code === '23505') {
                  console.log(`ℹ️ Favori ${vehicleId} déjà existant pour utilisateur ${user.id}`);
                } else {
                  console.error(`❌ Erreur insertion favori ${vehicleId}:`, insertError);
                }
              } else {
                migratedCount++;
                console.log(`✅ Favori ${vehicleId} migré avec succès`);
              }
            } catch (e) {
              console.error(`❌ Exception insertion favori ${vehicleId}:`, e);
            }
          }
          
          results.push({
            userId: user.id,
            favoritesCount: favorites.length,
            status: 'processed'
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

  // Route pour tester la table wishlist
  app.get('/api/admin/test-wishlist', async (req, res) => {
    console.log('🧪 Test de la table wishlist...');
    
    try {
      // Test lecture
      const { data: wishlistData, error: readError } = await supabaseServer
        .from('wishlist')
        .select('*')
        .limit(5);
        
      if (readError) {
        return res.status(400).json({ 
          error: 'Erreur lecture table wishlist',
          details: readError
        });
      }
      
      // Test écriture avec données de test
      const testUserId = '2158eafa-0e52-44f3-b894-1abb82a39d77';
      const testVehicleId = 'test-999';
      
      const { data: insertData, error: insertError } = await supabaseServer
        .from('wishlist')
        .insert({
          user_id: testUserId,
          vehicle_id: testVehicleId
        })
        .select()
        .single();
        
      if (insertError && insertError.code !== '23505') {
        return res.status(400).json({ 
          error: 'Erreur écriture table wishlist',
          details: insertError
        });
      }
      
      // Nettoyer le test
      if (insertData) {
        await supabaseServer
          .from('wishlist')
          .delete()
          .eq('id', insertData.id);
      }
      
      res.json({
        success: true,
        message: 'Table wishlist fonctionne parfaitement',
        currentRecords: wishlistData?.length || 0,
        sampleData: wishlistData?.slice(0, 3)
      });
      
    } catch (error) {
      console.error('❌ Erreur test wishlist:', error);
      res.status(500).json({ error: 'Erreur test' });
    }
  });
}