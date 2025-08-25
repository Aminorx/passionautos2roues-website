import { useState, useEffect, useRef } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
// import { User as DbUser } from '@shared/schema'
interface DbUser {
  id: string;
  email: string;
  name: string;
  type: string;
  created_at?: string;
}

export interface AuthState {
  user: User | null
  session: Session | null
  dbUser: DbUser | null
  isLoading: boolean
  isAuthenticated: boolean
  refreshDbUser: () => Promise<void>
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signUp: (email: string, password: string, metadata?: any) => Promise<{ success: boolean; error?: string }>
  signInWithGoogle: () => Promise<{ success: boolean; error?: string }>
  signOut: () => Promise<void>
}

export function useAuth(): AuthState {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [dbUser, setDbUser] = useState<DbUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  // Cache pour éviter les requêtes répétées
  const userCacheRef = useRef<Map<string, DbUser | null>>(new Map())
  const lastFetchTimeRef = useRef<Map<string, number>>(new Map())

  // Function to fetch database user info by email with auto-sync
  const fetchDbUser = async (authUser: User) => {
    if (!authUser.email) return
    
    const email = authUser.email
    const now = Date.now()
    const lastFetch = lastFetchTimeRef.current.get(email)
    const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes cache
    
    // Vérifier le cache (5 minutes)
    if (lastFetch && now - lastFetch < CACHE_DURATION) {
      const cachedUser = userCacheRef.current.get(email)
      if (cachedUser !== undefined) {
        setDbUser(cachedUser)
        console.log('📋 Utilisateur récupéré du cache:', email)
        return
      }
    }
    
    try {
      const response = await fetch(`/api/users/by-email/${encodeURIComponent(email)}`)
      if (response.ok) {
        const userData = await response.json()
        setDbUser(userData)
        // Mettre en cache
        userCacheRef.current.set(email, userData)
        lastFetchTimeRef.current.set(email, now)
        console.log('✅ Utilisateur trouvé dans BD (et mis en cache):', userData.name, `(${userData.type})`)
      } else if (response.status === 404) {
        console.log('🔄 Utilisateur inexistant, synchronisation automatique...')
        
        // Tenter de synchroniser automatiquement l'utilisateur
        try {
          const session = await supabase.auth.getSession()
          if (session.data.session?.access_token) {
            const syncResponse = await fetch('/api/users/sync-auth', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${session.data.session.access_token}`,
                'Content-Type': 'application/json'
              }
            })
            
            if (syncResponse.ok) {
              const syncData = await syncResponse.json()
              setDbUser(syncData.user)
              userCacheRef.current.set(email, syncData.user)
              lastFetchTimeRef.current.set(email, now)
              console.log('✅ Profil synchronisé automatiquement:', syncData.user.name)
              return
            } else {
              console.log('❌ Échec synchronisation:', await syncResponse.text())
            }
          }
        } catch (syncError) {
          console.error('❌ Erreur synchronisation auto:', syncError)
        }
        
        console.log('ℹ️ Aucun utilisateur BD trouvé pour:', email)
        setDbUser(null)
        // Mettre en cache l'absence
        userCacheRef.current.set(email, null)
        lastFetchTimeRef.current.set(email, now)
      }
    } catch (error) {
      console.error('Erreur récupération utilisateur BD:', error)
      setDbUser(null)
    }
  }

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      
      if (session?.user) {
        await fetchDbUser(session.user)
      }
      
      setIsLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      
      if (session?.user) {
        await fetchDbUser(session.user)
      } else {
        setDbUser(null)
      }
      
      setIsLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Function to force refresh database user (ignore cache)
  const refreshDbUser = async () => {
    if (!user?.email) return
    
    const email = user.email
    try {
      const response = await fetch(`/api/users/by-email/${encodeURIComponent(email)}`)
      if (response.ok) {
        const userData = await response.json()
        setDbUser(userData)
        // Update cache with fresh data
        userCacheRef.current.set(email, userData)
        lastFetchTimeRef.current.set(email, Date.now())
        console.log('🔄 Utilisateur rafraîchi depuis BD:', userData.name)
      } else {
        console.log('ℹ️ Aucun utilisateur BD trouvé lors du rafraîchissement:', email)
        setDbUser(null)
      }
    } catch (error) {
      console.error('Erreur rafraîchissement utilisateur BD:', error)
    }
  }

  // Authentication functions
  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error('SignIn error:', error)
        return { success: false, error: error.message }
      }

      console.log('✅ Connexion Supabase réussie:', email)
      return { success: true }
    } catch (error: any) {
      console.error('SignIn exception:', error)
      return { success: false, error: 'Erreur de connexion' }
    }
  }

  const signUp = async (email: string, password: string, metadata: any = {}) => {
    try {
      console.log('🔄 Création compte Supabase Auth:', email)
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: metadata.name,
            type: metadata.type || 'individual',
            phone: metadata.phone,
            companyName: metadata.companyName,
          }
        }
      })

      if (error) {
        console.error('SignUp error:', error)
        return { success: false, error: error.message }
      }

      if (!data.user) {
        return { success: false, error: 'Erreur lors de la création du compte' }
      }

      console.log('✅ Compte Supabase Auth créé:', email, 'ID:', data.user.id)
      
      // Synchroniser immédiatement vers la table users (même sans confirmation email)
      try {
        console.log('🔄 Synchronisation immédiate vers table users...');
        const syncResponse = await fetch('/api/users/sync-from-signup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            authUserId: data.user.id,
            email: email,
            metadata: metadata
          })
        });

        if (syncResponse.ok) {
          const syncData = await syncResponse.json();
          console.log('✅ Utilisateur synchronisé immédiatement:', syncData.user.name);
        } else {
          console.log('⚠️ Sync immédiate échouée, sync via onAuthStateChange plus tard');
        }
      } catch (syncError) {
        console.error('⚠️ Erreur sync immédiate:', syncError);
      }
      
      return { success: true }
    } catch (error: any) {
      console.error('SignUp exception:', error)
      return { success: false, error: 'Erreur de création de compte' }
    }
  }

  // Connexion Google OAuth
  const signInWithGoogle = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        }
      })
      
      if (error) {
        console.error('Erreur OAuth Google:', error.message)
        return { success: false, error: error.message }
      }
      
      // OAuth redirect, pas de retour immédiat
      return { success: true }
    } catch (error) {
      console.error('Erreur connexion Google:', error)
      return { success: false, error: 'Erreur lors de la connexion Google' }
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('SignOut error:', error)
        return
      }
      
      // Clear cache
      userCacheRef.current.clear()
      lastFetchTimeRef.current.clear()
      
      console.log('✅ Déconnexion réussie')
    } catch (error) {
      console.error('SignOut exception:', error)
    }
  }

  return {
    user,
    session,
    dbUser,
    isLoading,
    isAuthenticated: !!user,
    refreshDbUser,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
  }
}