import { createClient } from '@supabase/supabase-js'

// Utilisation des variables d'environnement Node.js côté serveur
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://qfcmwdbopwbymljjkdyb.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFmY213ZGJvcHdieW1samps2R5YiIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzUyMTI4NjEzLCJleHAiOjIwNjc3MDQ2MTN9.Rn7sGCVfv0W_SX4T_DfDXGhjAV_jjLo3EhOWzSUf3ZI'

if (!supabaseServiceKey) {
  console.error('SUPABASE_SERVICE_ROLE_KEY not found, using anon key for server operations')
} else {
  console.log('🔗 Connexion Supabase initialisée avec le client serveur')
}

export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})