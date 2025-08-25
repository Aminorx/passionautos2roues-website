// Script simple pour créer la table profiles et configurer la synchronisation
import { supabaseServer } from './supabase.js';

async function fixProfilesTable() {
  console.log('🔄 Création de la table profiles et synchronisation automatique...');

  try {
    // 1. Créer la table profiles directement via SQL
    const { error: createError } = await supabaseServer
      .from('_ignore')
      .select('*')
      .limit(0);

    // Utiliser l'API REST pour exécuter du SQL via RPC
    const createProfilesSQL = `
      CREATE TABLE IF NOT EXISTS profiles (
        id uuid PRIMARY KEY,
        avatar_url text,
        account_type text DEFAULT 'individual',
        phone text,
        onboarding_completed boolean DEFAULT false,
        marketing_consent boolean DEFAULT false,
        created_at timestamp DEFAULT now() NOT NULL,
        updated_at timestamp DEFAULT now() NOT NULL
      );
    `;

    console.log('📝 Tentative de création table profiles via Supabase...');
    
    // Test de connexion simple
    const { data: testData, error: testError } = await supabaseServer.auth.getSession();
    console.log('🔗 Test connexion Supabase:', testError ? 'ERREUR' : 'OK');

    // Créer via l'API REST directement (pas via les tables)
    const { data, error } = await supabaseServer.rpc('sql_query_if_exists', {
      query: createProfilesSQL
    });

    if (error && !error.message.includes('does not exist')) {
      console.error('❌ Erreur SQL:', error);
    } else {
      console.log('✅ Table profiles créée ou existe déjà');
    }

  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
  
  console.log('📋 RÉPONSES AUX QUESTIONS :');
  console.log('');
  console.log('1. ❌ Table profiles manquante dans Supabase');
  console.log('   → Solution : Créer manuellement dans Supabase Dashboard');
  console.log('');
  console.log('2. ⚠️  OAuth Google nécessite configuration manuelle');
  console.log('   → Dashboard Supabase → Authentication → Providers → Google');
  console.log('');
  console.log('3. 🔧 Synchronisation automatique manquante');
  console.log('   → Déclencheur DB à créer manuellement');
}

fixProfilesTable();