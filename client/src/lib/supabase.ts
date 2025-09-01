import { createClient } from '@supabase/supabase-js'

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder'

if (!supabaseUrl || supabaseUrl === 'https://placeholder.supabase.co') {
  console.warn('VITE_SUPABASE_URL not configured. Please add your Supabase URL.')
}

if (!supabaseAnonKey || supabaseAnonKey === 'placeholder') {
  console.warn('VITE_SUPABASE_ANON_KEY not configured. Please add your Supabase anon key.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Auth helper functions
export const signUp = async (email: string, password: string, userData?: any) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: userData
    }
  })
  return { data, error }
}

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  return { data, error }
}

export const signInWithOAuth = async (provider: 'google' | 'apple' | 'github') => {
  // Utiliser l'URL de développement Replit si on est en développement
  const isDevelopment = import.meta.env.DEV || window.location.hostname.includes('replit.dev');
  const redirectUrl = isDevelopment 
    ? window.location.origin + '/auth/callback'
    : `${window.location.origin}/auth/callback`;
    
  console.log('🔗 OAuth redirect URL:', redirectUrl);
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: redirectUrl
    }
  })
  return { data, error }
}

export const signInWithMagicLink = async (email: string) => {
  // Utiliser l'URL de développement Replit si on est en développement
  const isDevelopment = import.meta.env.DEV || window.location.hostname.includes('replit.dev');
  const redirectUrl = isDevelopment 
    ? window.location.origin + '/auth/callback'
    : `${window.location.origin}/auth/callback`;
    
  console.log('🔗 Magic link redirect URL:', redirectUrl);
  
  const { data, error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: redirectUrl
    }
  })
  return { data, error }
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  return { error }
}

export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser()
  return { user, error }
}

export const getCurrentSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession()
  return { session, error }
}

// Reset password function
export const resetPassword = async (email: string) => {
  // Utiliser l'URL de développement Replit si on est en développement
  const isDevelopment = import.meta.env.DEV || window.location.hostname.includes('replit.dev');
  const redirectUrl = isDevelopment 
    ? window.location.origin + '/auth/callback?type=recovery'
    : `${window.location.origin}/auth/callback?type=recovery`;
    
  console.log('🔗 Password reset redirect URL:', redirectUrl);
  
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: redirectUrl
  })
  return { data, error }
}