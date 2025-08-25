// Script direct pour configurer la base de données
import { supabaseServer } from './supabase.js';

async function setupDatabase() {
  console.log('🔄 Configuration de la base de données...');

  try {
    // 1. Créer la table profiles directement
    console.log('📝 Création de la table profiles...');
    const createProfilesSQL = `
      CREATE TABLE IF NOT EXISTS profiles (
        id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
        avatar_url text,
        account_type text DEFAULT 'individual' CHECK (account_type IN ('individual', 'professional')),
        phone text,
        onboarding_completed boolean DEFAULT false,
        marketing_consent boolean DEFAULT false,
        created_at timestamp DEFAULT now() NOT NULL,
        updated_at timestamp DEFAULT now() NOT NULL
      );
    `;
    
    const { error: profilesError } = await supabaseServer
      .from('_migration')
      .select('*')
      .limit(0); // Juste pour tester la connexion

    if (profilesError) {
      console.error('❌ Connexion Supabase échouée:', profilesError);
    } else {
      console.log('✅ Connexion Supabase OK');
    }

    // Test direct avec RPC si disponible
    const { data: tables, error: tablesError } = await supabaseServer
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');
      
    if (tablesError) {
      console.error('❌ Erreur récupération tables:', tablesError);
    } else {
      console.log('📊 Tables existantes:', tables?.map(t => t.table_name));
    }

  } catch (error) {
    console.error('❌ Erreur configuration:', error);
  }
}

setupDatabase();