#!/bin/bash

# Script pour mettre à jour DATABASE_URL vers Supabase
# Remplacez YOUR_SUPABASE_PASSWORD par le mot de passe de votre base Supabase

echo "🔄 Mise à jour de DATABASE_URL vers Supabase..."

# Format de l'URL Supabase pour connexion directe PostgreSQL
# postgresql://postgres.{project_id}:{password}@aws-0-{region}.pooler.supabase.com:6543/postgres

# IMPORTANT: Vous devez remplacer {PASSWORD} par votre mot de passe Supabase
SUPABASE_DATABASE_URL="postgresql://postgres.dhzcpxbzzkyvrmxqklye:{PASSWORD}@aws-0-eu-central-1.pooler.supabase.com:6543/postgres"

echo "ℹ️  Pour obtenir votre mot de passe Supabase :"
echo "   1. Allez dans votre projet Supabase"
echo "   2. Settings → Database"
echo "   3. Copiez la 'Connection string' et extrayez le mot de passe"
echo ""
echo "📝 URL Supabase format :"
echo "   $SUPABASE_DATABASE_URL"
echo ""
echo "⚠️  Remplacez {PASSWORD} par votre vrai mot de passe Supabase"
echo "   puis définissez DATABASE_URL dans les secrets Replit"