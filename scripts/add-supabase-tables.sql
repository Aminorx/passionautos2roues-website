-- =====================================================
-- AJOUT DES TABLES MANQUANTES À SUPABASE
-- =====================================================
-- À exécuter dans votre SQL Editor Supabase

-- Table wishlist pour les favoris
CREATE TABLE IF NOT EXISTS public.wishlist (
  id text PRIMARY KEY DEFAULT ('wish_' || extract(epoch from now())::bigint || '_' || floor(random() * 1000)::text),
  user_id text REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  vehicle_id text REFERENCES public.vehicles(id) ON DELETE CASCADE NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  UNIQUE(user_id, vehicle_id)
);

-- Table saved_searches pour les recherches sauvegardées
CREATE TABLE IF NOT EXISTS public.saved_searches (
  id text PRIMARY KEY DEFAULT ('search_' || extract(epoch from now())::bigint || '_' || floor(random() * 1000)::text),
  user_id text REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  filters jsonb NOT NULL,
  alerts_enabled boolean DEFAULT false,
  last_checked timestamp with time zone,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_wishlist_user_id ON public.wishlist(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_vehicle_id ON public.wishlist(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_saved_searches_user_id ON public.saved_searches(user_id);

-- Activer RLS (Row Level Security)
ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_searches ENABLE ROW LEVEL SECURITY;

-- Politiques de sécurité pour wishlist
CREATE POLICY "Users can view their own wishlist" ON public.wishlist
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can manage their own wishlist" ON public.wishlist
  FOR ALL USING (auth.uid()::text = user_id);

-- Politiques de sécurité pour saved_searches
CREATE POLICY "Users can view their own saved searches" ON public.saved_searches
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can manage their own saved searches" ON public.saved_searches
  FOR ALL USING (auth.uid()::text = user_id);

-- Trigger pour updated_at sur saved_searches
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS trigger AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language plpgsql;

CREATE TRIGGER update_saved_searches_updated_at
    BEFORE UPDATE ON public.saved_searches
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

SELECT 'Tables wishlist et saved_searches ajoutées avec succès!' as status;