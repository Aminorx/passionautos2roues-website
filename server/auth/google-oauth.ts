// Configuration Google OAuth pour Supabase
export const googleOAuthConfig = {
  // Configuration sera ajoutée après setup Supabase Dashboard
  provider: 'google',
  redirectUrl: `${process.env.VITE_SUPABASE_URL}/auth/v1/callback`,
  scopes: ['email', 'profile'],
  
  // Configuration PKCE pour sécurité renforcée
  pkce: true,
  
  // Fonction helper pour extraire les données du profil Google
  extractUserData: (user: any) => ({
    id: user.id,
    email: user.email,
    name: user.user_metadata?.full_name || user.user_metadata?.name || extractNameFromEmail(user.email),
    avatarUrl: user.user_metadata?.avatar_url || user.user_metadata?.picture,
    emailVerified: user.email_confirmed_at ? true : false,
    provider: 'google'
  })
};

function extractNameFromEmail(email: string): string {
  return email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}