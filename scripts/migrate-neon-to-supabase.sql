-- =====================================================
-- MIGRATION DONNÉES NEON VERS SUPABASE
-- =====================================================
-- Script pour copier vos données existantes

-- 1. COPIER LES UTILISATEURS
-- Remplacez 'your_neon_connection' par votre connexion Neon
-- Cette partie nécessite l'extension postgres_fdw ou un export/import manuel

-- Option A: Export manuel (recommandé)
-- 1. Exportez vos données Neon en CSV ou SQL
-- 2. Importez-les dans Supabase via l'interface

-- Option B: Si vous avez accès aux deux bases simultanément
/*
-- Copier les utilisateurs (adaptez selon votre structure)
INSERT INTO public.users (id, email, name, phone, type, created_at)
SELECT id, email, name, phone, type, created_at
FROM old_users
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  name = EXCLUDED.name,
  phone = EXCLUDED.phone;

-- Copier les véhicules
INSERT INTO public.vehicles (
  id, user_id, title, description, category, brand, model, year,
  mileage, fuel_type, condition, price, location, images, features,
  is_premium, created_at, updated_at, views, favorites, status
)
SELECT 
  id, user_id, title, description, category, brand, model, year,
  mileage, fuel_type, condition, price, location, images, features,
  is_premium, created_at, updated_at, views, favorites, status
FROM old_vehicles
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  updated_at = now();

-- Copier les messages
INSERT INTO public.messages (id, from_user_id, to_user_id, vehicle_id, content, created_at, read)
SELECT id, from_user_id, to_user_id, vehicle_id, content, created_at, read
FROM old_messages
ON CONFLICT (id) DO NOTHING;
*/

-- VÉRIFICATION APRÈS MIGRATION
SELECT 'users' as table_name, count(*) as count FROM public.users
UNION ALL
SELECT 'vehicles' as table_name, count(*) as count FROM public.vehicles
UNION ALL
SELECT 'messages' as table_name, count(*) as count FROM public.messages;

SELECT 'Migration terminée! Vérifiez les comptes ci-dessus.' as status;