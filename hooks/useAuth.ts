import { useState, useEffect } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { User as DbUser } from '@shared/schema'

export interface AuthState {
  user: User | null
  session: Session | null
  dbUser: DbUser | null
  isLoading: boolean
  isAuthenticated: boolean
}

export function useAuth(): AuthState {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [dbUser, setDbUser] = useState<DbUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Function to fetch database user info by email
  const fetchDbUser = async (authUser: User) => {
    if (!authUser.email) return
    
    try {
      const response = await fetch(`/api/users/by-email/${encodeURIComponent(authUser.email)}`)
      if (response.ok) {
        const userData = await response.json()
        setDbUser(userData)
        console.log('✅ Utilisateur trouvé dans BD:', userData.name, `(${userData.type})`)
      } else {
        console.log('ℹ️ Aucun utilisateur BD trouvé pour:', authUser.email)
        setDbUser(null)
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

  return {
    user,
    session,
    dbUser,
    isLoading,
    isAuthenticated: !!user,
  }
}