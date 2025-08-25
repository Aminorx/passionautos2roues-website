// Ajouter ces lignes au début du fichier
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Obtenir le chemin du répertoire actuel
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Charger les variables d'environnement depuis le fichier .env (à la racine du projet)
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Le reste de ton code reste inchangé
// Script pour créer la table profiles et configurer la synchronisation automatique
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables d\'environnement manquantes');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupDatabase() {
  console.log('🔄 Configuration de la base de données...');

  // 0. Désactiver l'ancien trigger pour éviter les erreurs
  const disableTrigger = `
    DROP TRIGGER IF EXISTS create_user_profile_trigger ON auth.users;
  `;

  // 1. Créer la table profiles complète (qui remplacera les données de users)
  const createProfilesTable = `
    CREATE TABLE IF NOT EXISTS profiles (
      id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
      email text,
      name text,
      type text DEFAULT 'individual' CHECK (type IN ('individual', 'professional', 'admin')),
      phone text,
      whatsapp text,
      company_name text,
      company_logo text,
      address text,
      city text,
      postal_code text,
      website text,
      siret text,
      bio text,
      avatar_url text,
      specialties jsonb,
      verified boolean DEFAULT false,
      email_verified boolean DEFAULT false,
      contact_preferences jsonb,
      onboarding_completed boolean DEFAULT false,
      marketing_consent boolean DEFAULT false,
      last_login_at timestamp,
      created_at timestamp DEFAULT now() NOT NULL,
      updated_at timestamp DEFAULT now() NOT NULL
    );
  `;

  // 2. Migrer les données existantes de users vers profiles (si nécessaire)
  const migrateData = `
    -- Migrer les données de users vers profiles (s'il y en a)
    DO $$
    BEGIN
      IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users' AND table_schema = 'public') THEN
        INSERT INTO profiles (
          id, email, name, type, phone, whatsapp, company_name, company_logo,
          address, city, postal_code, website, siret, bio, avatar_url, specialties,
          verified, email_verified, contact_preferences, created_at
        )
        SELECT 
          u.id::uuid, u.email, u.name, u.type, u.phone, u.whatsapp, 
          u.company_name, u.company_logo, u.address, u.city, 
          u.postal_code::text, u.website, u.siret, u.bio, 
          u.avatar, u.specialties, u.verified, u.email_verified, 
          u.contact_preferences, now()
        FROM public.users u
        LEFT JOIN public.profiles p ON u.id::uuid = p.id
        WHERE p.id IS NULL;
      END IF;
    END $$;
  `;

  // 3. Créer la fonction de synchronisation pour la nouvelle structure
  const createSyncFunction = `
    CREATE OR REPLACE FUNCTION create_user_profile()
    RETURNS TRIGGER AS $$
    BEGIN
      -- Créer/mettre à jour directement dans profiles
      INSERT INTO public.profiles (
        id, email, name, type, phone,
        created_at, updated_at
      )
      SELECT 
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'type', 'individual'),
        NEW.raw_user_meta_data->>'phone',
        now(),
        now()
      ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        name = EXCLUDED.name,
        type = EXCLUDED.type,
        phone = EXCLUDED.phone,
        updated_at = now();
      
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;
  `;

  // 4. Créer le déclencheur
  const createTrigger = `
    DROP TRIGGER IF EXISTS create_user_profile_trigger ON auth.users;
    CREATE TRIGGER create_user_profile_trigger
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION create_user_profile();
  `;
  
  // 5. Créer les politiques RLS pour profiles
  const createPolicies = `
    -- Activer RLS sur la table profiles
    ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
    
    -- Politique pour permettre aux utilisateurs de voir leur propre profil
    DROP POLICY IF EXISTS "Les utilisateurs peuvent voir leur propre profil" ON profiles;
    CREATE POLICY "Les utilisateurs peuvent voir leur propre profil" 
      ON profiles FOR SELECT USING (auth.uid() = id);
      
    -- Politique pour permettre aux utilisateurs de modifier leur propre profil  
    DROP POLICY IF EXISTS "Les utilisateurs peuvent modifier leur propre profil" ON profiles;
    CREATE POLICY "Les utilisateurs peuvent modifier leur propre profil" 
      ON profiles FOR UPDATE USING (auth.uid() = id);
  `;

  // Fonction utilitaire pour exécuter les commandes SQL
  async function executeSQL(description, sql) {
    console.log(`� ${description}...`);
    try {
      // Essayer avec exec_sql
      const { error: execError } = await supabase.rpc('exec_sql', { sql });
      if (!execError) return true;
      
      // Si ça échoue, essayer avec execute_sql
      console.log(`⚠️ exec_sql a échoué, essai avec execute_sql...`);
      const { error: executeError } = await supabase.rpc('execute_sql', { query: sql });
      if (!executeError) return true;
      
      // Si les deux échouent, afficher l'erreur et le SQL à exécuter manuellement
      console.error(`❌ Erreur d'exécution SQL:`, execError || executeError);
      console.log(`\n------------------- EXÉCUTE CE CODE MANUELLEMENT -------------------`);
      console.log(sql);
      console.log(`------------------------------------------------------------------\n`);
      return false;
    } catch (error) {
      console.error(`❌ Exception lors de l'exécution SQL:`, error);
      return false;
    }
  }

  try {
    // 0. Désactiver l'ancien trigger en premier pour éviter les problèmes
    await executeSQL('Désactivation de l\'ancien trigger', disableTrigger);

    // 1. Créer la table profiles
    console.log('� Création de la table profiles...');
    if (!await executeSQL('Création de la table profiles', createProfilesTable)) {
      console.log('⚠️ Échec possible de la création de la table, continuation...');
    }

    // 2. Migrer les données
    console.log('📤 Migration des données si nécessaire...');
    if (!await executeSQL('Migration des données', migrateData)) {
      console.log('⚠️ Migration des données non exécutée, à faire manuellement si nécessaire');
    }

    // 3. Créer la fonction de synchronisation
    console.log('🔧 Création de la fonction de synchronisation...');
    if (!await executeSQL('Création de la fonction', createSyncFunction)) {
      console.log('⚠️ Échec de la création de la fonction, continuer avec les autres étapes...');
    }

    // 4. Configurer les politiques RLS
    console.log('🔒 Configuration des politiques d\'accès...');
    if (!await executeSQL('Configuration des politiques', createPolicies)) {
      console.log('⚠️ Échec de la configuration des politiques');
    }

    // 5. Créer le déclencheur (commenté par défaut pour être sûr que tout fonctionne d'abord)
    console.log('⚡ Création du déclencheur...');
    console.log('⚠️ Le déclencheur est désactivé par défaut. Une fois que tout fonctionne, décommentez la ligne dans le script.');
    // Si vous voulez activer le trigger immédiatement, décommentez la ligne suivante:
    // await executeSQL('Création du déclencheur', createTrigger);

    console.log('✅ Base de données partiellement configurée !');
    console.log('⚠️ Vérifiez que les utilisateurs peuvent se connecter avant d\'activer le trigger.');
    
    // Vérifier les tables
    const { data: tables } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', ['users', 'profiles']);
      
    console.log('📊 Tables disponibles:', tables?.map(t => t.table_name));

  } catch (error) {
    console.error('❌ Erreur configuration base de données:', error);
  }
}

setupDatabase().then(() => process.exit(0));