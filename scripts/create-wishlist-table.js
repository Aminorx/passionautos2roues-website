import { createClient } from '@supabase/supabase-js';

// Configuration Supabase
const supabaseUrl = 'https://kfnvjkvhyfaghmvvhjls.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY non disponible');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createWishlistTable() {
  console.log('🔄 Création de la nouvelle table wishlist...');
  
  try {
    // Créer la table wishlist avec structure optimisée
    const createTableQuery = `
      -- Table wishlist pour la gestion des favoris
      CREATE TABLE public.wishlist (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL,
        vehicle_id INTEGER NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        CONSTRAINT wishlist_user_vehicle_unique UNIQUE (user_id, vehicle_id),
        CONSTRAINT fk_wishlist_user FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE
      );

      -- Index pour optimiser les performances
      CREATE INDEX idx_wishlist_user_id ON public.wishlist(user_id);
      CREATE INDEX idx_wishlist_vehicle_id ON public.wishlist(vehicle_id);
      CREATE INDEX idx_wishlist_created_at ON public.wishlist(created_at DESC);

      -- RLS (Row Level Security) pour sécuriser l'accès
      ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;

      -- Politique RLS : les utilisateurs ne peuvent accéder qu'à leurs propres favoris
      CREATE POLICY "Users can manage their own wishlist" ON public.wishlist
        FOR ALL USING (auth.uid()::text = user_id::text);

      -- Donner les permissions nécessaires
      GRANT ALL ON public.wishlist TO authenticated;
      GRANT ALL ON public.wishlist TO service_role;

      -- Fonction trigger pour mettre à jour updated_at
      CREATE OR REPLACE FUNCTION update_wishlist_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      -- Trigger pour auto-update de updated_at
      CREATE TRIGGER trigger_update_wishlist_updated_at
        BEFORE UPDATE ON public.wishlist
        FOR EACH ROW
        EXECUTE FUNCTION update_wishlist_updated_at();
    `;

    // Exécuter via requête SQL directe
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: createTableQuery
    });

    if (error) {
      console.error('❌ Erreur création table:', error);
      
      // Essayer méthode alternative si rpc échoue
      console.log('🔄 Tentative alternative...');
      const { error: altError } = await supabase
        .from('_sql')
        .insert({ query: createTableQuery });
        
      if (altError) {
        console.error('❌ Erreur méthode alternative:', altError);
      }
    } else {
      console.log('✅ Table wishlist créée avec succès');
    }

    // Vérifier que la table existe et est accessible
    console.log('🔍 Vérification de la table...');
    const { data: testData, error: testError } = await supabase
      .from('wishlist')
      .select('id')
      .limit(1);
      
    if (testError) {
      console.error('❌ Table non accessible:', testError);
    } else {
      console.log('✅ Table wishlist vérifiée et accessible');
      console.log('📊 Structure prête pour production');
    }

    // Test d'insertion pour valider la structure
    console.log('🧪 Test d\'insertion...');
    const testUserId = '2158eafa-0e52-44f3-b894-1abb82a39d77';
    const testVehicleId = 999; // ID test qui n'existe pas pour éviter conflits
    
    const { data: insertData, error: insertError } = await supabase
      .from('wishlist')
      .insert({
        user_id: testUserId,
        vehicle_id: testVehicleId
      })
      .select()
      .single();
      
    if (insertError) {
      console.error('❌ Erreur test insertion:', insertError);
    } else {
      console.log('✅ Test insertion réussi:', insertData);
      
      // Nettoyer le test
      await supabase
        .from('wishlist')
        .delete()
        .eq('id', insertData.id);
      console.log('🧹 Test nettoyé');
    }

  } catch (error) {
    console.error('❌ Erreur complète:', error);
  }
}

createWishlistTable();