-- ========================================
-- CRÉATION TABLE ANNONCES - ÉTAPE 1
-- ========================================
-- Copiez cette requête dans Supabase SQL Editor

CREATE TABLE annonces (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER NOT NULL,
  mileage INTEGER,
  fuel_type TEXT, -- 'gasoline', 'diesel', 'electric', 'hybrid'
  condition TEXT NOT NULL, -- 'new', 'used', 'damaged'
  price DECIMAL(10,2) NOT NULL,
  location TEXT NOT NULL,
  images JSONB DEFAULT '[]',
  features JSONB DEFAULT '[]',
  is_premium BOOLEAN DEFAULT FALSE,
  premium_type TEXT, -- 'daily', 'weekly', 'monthly'
  premium_expires_at TIMESTAMP,
  views INTEGER DEFAULT 0,
  favorites INTEGER DEFAULT 0,
  status TEXT DEFAULT 'approved', -- 'pending', 'approved', 'rejected'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Activer Row Level Security
ALTER TABLE annonces ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre la lecture à tous
CREATE POLICY "Allow public read access" ON annonces
  FOR SELECT USING (true);

-- Politique pour permettre l'insertion à tous (temporaire pour test)
CREATE POLICY "Allow public insert" ON annonces
  FOR INSERT WITH CHECK (true);

-- Politique pour permettre la mise à jour à tous (temporaire pour test)
CREATE POLICY "Allow public update" ON annonces
  FOR UPDATE USING (true);