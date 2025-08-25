-- 1. Créer la table profiles manquante
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

-- 2. Créer une fonction pour synchroniser automatiquement les utilisateurs
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  -- Créer dans la table users (existante)
  INSERT INTO public.users (id, email, name, type, phone, company_name, created_at)
  SELECT 
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'type', 'individual'),
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'companyName',
    NEW.created_at
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = EXCLUDED.name,
    type = EXCLUDED.type,
    phone = EXCLUDED.phone,
    company_name = EXCLUDED.company_name;
  
  -- Créer le profil correspondant
  INSERT INTO public.profiles (id, account_type, phone, created_at)
  SELECT 
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'type', 'individual'),
    NEW.raw_user_meta_data->>'phone',
    NEW.created_at
  ON CONFLICT (id) DO UPDATE SET
    account_type = EXCLUDED.account_type,
    phone = EXCLUDED.phone;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Créer le déclencheur sur auth.users
DROP TRIGGER IF EXISTS create_user_profile_trigger ON auth.users;
CREATE TRIGGER create_user_profile_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION create_user_profile();

-- 4. Vérifier les tables
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;