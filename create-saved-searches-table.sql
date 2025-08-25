-- Créer la table saved_searches pour les recherches sauvegardées et alertes
-- À exécuter dans Supabase SQL Editor

CREATE TABLE IF NOT EXISTS saved_searches (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL REFERENCES users(id),
  name TEXT NOT NULL,
  filters JSONB NOT NULL,
  alerts_enabled BOOLEAN DEFAULT false,
  last_checked TIMESTAMP,
  created_at TIMESTAMP DEFAULT now() NOT NULL,
  updated_at TIMESTAMP DEFAULT now() NOT NULL
);

-- Créer les index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS saved_searches_user_id_idx ON saved_searches(user_id);
CREATE INDEX IF NOT EXISTS saved_searches_created_at_idx ON saved_searches(created_at);
CREATE INDEX IF NOT EXISTS saved_searches_alerts_enabled_idx ON saved_searches(alerts_enabled);

-- Vérifier que la table a été créée
SELECT 
  table_name, 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'saved_searches' 
ORDER BY ordinal_position;