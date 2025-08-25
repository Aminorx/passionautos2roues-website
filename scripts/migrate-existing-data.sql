-- =====================================================
-- MIGRATION SCRIPT - EXISTING DATA TO SUPABASE
-- =====================================================
-- Ce script aide à migrer les données existantes vers la nouvelle structure Supabase

-- IMPORTANT: À exécuter APRÈS avoir configuré la structure de base avec supabase-setup.sql

-- =====================================================
-- 1. MIGRATION DES UTILISATEURS EXISTANTS
-- =====================================================

-- Si vous avez des utilisateurs existants dans votre ancienne base, 
-- vous devrez les inviter à se reconnecter via Supabase Auth
-- Les profils seront créés automatiquement grâce au trigger handle_new_user()

-- =====================================================
-- 2. MIGRATION DES VÉHICULES EXISTANTS
-- =====================================================

-- Supposons que vous ayez une table "vehicles" existante à migrer
-- Remplacez 'old_vehicles' par le nom de votre table actuelle

-- Étape 1: Créer des utilisateurs temporaires pour les véhicules orphelins
INSERT INTO public.users (id, email, name, type, verified)
SELECT 
  gen_random_uuid(),
  'temp_user_' || user_id || '@temp.com',
  'Utilisateur Temporaire ' || user_id,
  'individual',
  false
FROM (
  SELECT DISTINCT user_id 
  FROM vehicles 
  WHERE user_id NOT IN (SELECT id::text FROM public.users)
) distinct_users
ON CONFLICT (email) DO NOTHING;

-- Étape 2: Mettre à jour les user_id pour correspondre aux UUID Supabase
-- (Cette étape nécessite une correspondance manuelle ou une logique métier spécifique)

-- =====================================================
-- 3. VÉRIFICATION DE LA MIGRATION
-- =====================================================

-- Vérifier le nombre de véhicules
SELECT 
  'vehicles' as table_name,
  count(*) as total_count,
  count(case when status = 'approved' then 1 end) as approved_count,
  count(case when is_premium then 1 end) as premium_count
FROM public.vehicles;

-- Vérifier le nombre d'utilisateurs
SELECT 
  'users' as table_name,
  count(*) as total_count,
  count(case when type = 'professional' then 1 end) as professional_count,
  count(case when verified then 1 end) as verified_count
FROM public.users;

-- Vérifier les véhicules sans utilisateur (erreurs de migration)
SELECT 
  'orphan_vehicles' as issue_type,
  count(*) as count
FROM public.vehicles v
LEFT JOIN public.users u ON v.user_id = u.id
WHERE u.id IS NULL;

-- =====================================================
-- 4. NETTOYAGE POST-MIGRATION (Optionnel)
-- =====================================================

-- Supprimer les utilisateurs temporaires une fois la migration terminée
-- ATTENTION: N'exécutez ceci qu'après avoir vérifié que tous les véhicules ont des propriétaires valides

/*
DELETE FROM public.users 
WHERE email LIKE 'temp_user_%@temp.com'
AND id NOT IN (
  SELECT DISTINCT user_id::uuid 
  FROM public.vehicles 
  WHERE user_id IS NOT NULL
);
*/

-- =====================================================
-- 5. MISE À JOUR DES COMPTEURS
-- =====================================================

-- Recalculer les compteurs de favoris et vues
UPDATE public.vehicles 
SET 
  favorites = COALESCE((
    SELECT count(*) 
    FROM public.wishlist 
    WHERE vehicle_id = vehicles.id
  ), 0),
  views = COALESCE(views, 0);

-- =====================================================
-- INSTRUCTIONS D'UTILISATION
-- =====================================================

/*
ÉTAPES DE MIGRATION COMPLÈTE:

1. Sauvegarder votre base actuelle
2. Exécuter supabase-setup.sql dans Supabase
3. Configurer OAuth dans Supabase Auth settings
4. Exporter vos données existantes
5. Adapter et exécuter ce script de migration
6. Tester l'authentification et les fonctionnalités
7. Mettre à jour les variables d'environnement
8. Déployer la nouvelle version

APRÈS MIGRATION:
- Les utilisateurs devront se reconnecter
- Les données véhicules seront préservées
- Les nouvelles fonctionnalités (wishlist, recherches sauvegardées) seront disponibles
*/

SELECT 'Migration script ready! Follow the instructions above.' as status;