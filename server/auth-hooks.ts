import { supabaseServer } from './supabase';
import { storage } from './storage';

/**
 * Hook automatique pour créer un utilisateur dans la table users
 * dès l'inscription dans Supabase Auth
 */
export async function setupAuthHooks() {
  console.log('🔧 Configuration des hooks d\'authentification...');
  
  // Cette fonction sera appelée par un webhook Supabase ou un trigger
  // Pour l'instant, on l'appelle manuellement via l'API
}

/**
 * Crée automatiquement un utilisateur minimal dans la table users
 * basé sur les données d'authentification Supabase
 */
export async function createUserFromAuth(authUserId: string, email: string, metadata?: any) {
  try {
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await storage.getUser(authUserId);
    if (existingUser) {
      console.log(`✅ Utilisateur ${email} existe déjà`);
      return existingUser;
    }

    // Créer un utilisateur minimal avec des données par défaut intelligentes
    const newUser = {
      id: authUserId,
      email: email,
      name: extractNameFromEmail(email, metadata),
      type: 'individual' as const, // TOUS les comptes démarrent en particulier
      phone: metadata?.phone || null,
      whatsapp: metadata?.phone || null,
      city: metadata?.city || null,
      postal_code: metadata?.postal_code || null,
      email_verified: true, // Car vient de Supabase Auth (nom correct colonne DB)
      avatar: metadata?.avatar_url || metadata?.picture || null,
    };

    const createdUser = await storage.createUser(newUser);
    console.log(`✅ Utilisateur auto-créé: ${email}`);
    return createdUser;

  } catch (error) {
    console.error('❌ Erreur création utilisateur auto:', error);
    throw error;
  }
}

/**
 * Extrait un nom intelligent depuis l'email et les métadonnées
 */
function extractNameFromEmail(email: string, metadata?: any): string {
  // Priorité aux métadonnées
  if (metadata?.full_name) return metadata.full_name;
  if (metadata?.first_name && metadata?.last_name) {
    return `${metadata.first_name} ${metadata.last_name}`;
  }
  if (metadata?.first_name) return metadata.first_name;

  // Extraction depuis l'email
  const localPart = email.split('@')[0];
  
  // Remplacer les points et underscores par des espaces et capitaliser
  return localPart
    .replace(/[._]/g, ' ')
    .split(' ')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ') || 'Utilisateur';
}

/**
 * Assure qu'un utilisateur existe, le crée sinon
 */
export async function ensureUserExists(authUserId: string, fallbackEmail?: string): Promise<boolean> {
  try {
    const existingUser = await storage.getUser(authUserId);
    if (existingUser) return true;

    // Tenter de récupérer les données depuis Supabase Auth
    if (fallbackEmail) {
      console.log(`🔄 Création utilisateur manquant: ${authUserId}`);
      await createUserFromAuth(authUserId, fallbackEmail);
      return true;
    }

    return false;
  } catch (error) {
    console.error('❌ Erreur vérification utilisateur:', error);
    return false;
  }
}