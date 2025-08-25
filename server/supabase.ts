import dotenv from 'dotenv';
dotenv.config();
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl) {
  throw new Error('VITE_SUPABASE_URL environment variable is required')
}

if (!supabaseServiceKey) {
  console.warn('SUPABASE_SERVICE_ROLE_KEY not found, using anon key for server operations')
}

// Use service role key for server-side operations, fallback to anon key
const key = supabaseServiceKey || process.env.VITE_SUPABASE_ANON_KEY

if (!key) {
  throw new Error('Either SUPABASE_SERVICE_ROLE_KEY or VITE_SUPABASE_ANON_KEY is required')
}

export const supabaseServer = createClient(supabaseUrl, key, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})