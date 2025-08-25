// Script pour créer la table wishlist
const { supabaseServer } = require('./supabase');

async function createWishlistTable() {
  console.log('🔧 Création de la table wishlist...');
  
  const sqlQuery = `
    -- Créer la table wishlist si elle n'existe pas
    CREATE TABLE IF NOT EXISTS wishlist (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id TEXT NOT NULL REFERENCES users(id),
      vehicle_id TEXT NOT NULL REFERENCES annonces(id),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      UNIQUE(user_id, vehicle_id)
    );

    -- Créer des index pour les performances
    CREATE INDEX IF NOT EXISTS idx_wishlist_user_id ON wishlist(user_id);
    CREATE INDEX IF NOT EXISTS idx_wishlist_vehicle_id ON wishlist(vehicle_id);
  `;

  try {
    const { data, error } = await supabaseServer.rpc('exec_sql', { query: sqlQuery });
    
    if (error) {
      console.error('❌ Erreur création table:', error);
    } else {
      console.log('✅ Table wishlist créée avec succès');
    }
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

createWishlistTable();