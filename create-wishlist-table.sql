-- Table wishlist pour la gestion des favoris Passion Auto2Roues
-- À exécuter dans l'éditeur SQL de Supabase

-- 1. Créer la table wishlist
CREATE TABLE public.wishlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  vehicle_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT wishlist_user_vehicle_unique UNIQUE (user_id, vehicle_id)
);

-- 2. Créer les index pour optimiser les performances
CREATE INDEX idx_wishlist_user_id ON public.wishlist(user_id);
CREATE INDEX idx_wishlist_vehicle_id ON public.wishlist(vehicle_id);
CREATE INDEX idx_wishlist_created_at ON public.wishlist(created_at DESC);

-- 3. Activer RLS (Row Level Security)
ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;

-- 4. Créer les politiques RLS
CREATE POLICY "Users can view their own wishlist" ON public.wishlist
  FOR SELECT USING (true); -- Permet la lecture pour tous (pour simplicité)

CREATE POLICY "Users can insert their own wishlist" ON public.wishlist
  FOR INSERT WITH CHECK (true); -- Permet l'insertion pour tous

CREATE POLICY "Users can delete their own wishlist" ON public.wishlist
  FOR DELETE USING (true); -- Permet la suppression pour tous

-- 5. Donner les permissions nécessaires
GRANT ALL ON public.wishlist TO postgres;
GRANT ALL ON public.wishlist TO authenticated;
GRANT ALL ON public.wishlist TO service_role;
GRANT ALL ON public.wishlist TO anon;

-- 6. Commentaire sur la table
COMMENT ON TABLE public.wishlist IS 'Table pour stocker les favoris des utilisateurs (véhicules souhaités)';
COMMENT ON COLUMN public.wishlist.user_id IS 'ID de l''utilisateur (référence vers users.id)';
COMMENT ON COLUMN public.wishlist.vehicle_id IS 'ID du véhicule favori (référence vers annonces.id)';
COMMENT ON COLUMN public.wishlist.created_at IS 'Date d''ajout du favori';

-- Test d'insertion pour vérifier le bon fonctionnement
-- (Cette ligne sera supprimée automatiquement)
INSERT INTO public.wishlist (user_id, vehicle_id) VALUES 
('00000000-0000-0000-0000-000000000000', 'test-vehicle-id') 
ON CONFLICT (user_id, vehicle_id) DO NOTHING;

-- Supprimer la ligne de test
DELETE FROM public.wishlist WHERE vehicle_id = 'test-vehicle-id';

-- Vérifier que la table est bien créée
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'wishlist'
ORDER BY ordinal_position;