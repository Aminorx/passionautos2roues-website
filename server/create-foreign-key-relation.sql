-- ÉTAPE 1: Ajouter la contrainte de clé étrangère
-- Exécutez cette requête dans Supabase SQL Editor

ALTER TABLE annonces 
ADD CONSTRAINT fk_annonces_user_id 
FOREIGN KEY (user_id) REFERENCES users(id);

-- ÉTAPE 2: Vérifier que la relation a été créée
SELECT 
    constraint_name,
    table_name,
    column_name,
    foreign_table_name,
    foreign_column_name
FROM information_schema.key_column_usage kcu
JOIN information_schema.table_constraints tc 
    ON kcu.constraint_name = tc.constraint_name
JOIN information_schema.constraint_column_usage ccu 
    ON kcu.constraint_name = ccu.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND kcu.table_name = 'annonces';

-- ÉTAPE 3: Test de la jointure après création de la relation
SELECT 
    a.id,
    a.title,
    a.user_id,
    u.name as user_name,
    u.email as user_email
FROM annonces a
JOIN users u ON a.user_id = u.id
LIMIT 5;