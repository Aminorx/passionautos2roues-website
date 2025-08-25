-- Script pour ajouter la colonne is_active à la table annonces
-- À exécuter dans l'éditeur SQL de Supabase

-- 1. Ajouter la colonne is_active (toutes les annonces existantes seront actives par défaut)
ALTER TABLE annonces ADD COLUMN is_active BOOLEAN DEFAULT true;

-- 2. Vérifier que la colonne a été ajoutée
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'annonces' AND column_name = 'is_active';

-- 3. Vérifier quelques annonces pour confirmer que is_active = true par défaut
SELECT id, title, is_active FROM annonces LIMIT 5;

-- 4. Test: Désactiver une annonce (remplacez '1' par un ID réel)
-- UPDATE annonces SET is_active = false WHERE id = 1;

-- 5. Test: Réactiver l'annonce
-- UPDATE annonces SET is_active = true WHERE id = 1;