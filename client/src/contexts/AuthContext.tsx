import React, { createContext, useContext, useEffect, useState } from 'react'
import { User as SupabaseUser, Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { User } from '../types'

interface AuthContextType {
  user: SupabaseUser | null
  profile: User | null
  session: Session | null
  loading: boolean
  signUp: (email: string, password: string, userData?: any) => Promise<{ error: any }>
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signInWithOAuth: (provider: 'google' | 'apple' | 'github') => Promise<{ error: any }>
  signInWithMagicLink: (email: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<User>) => Promise<{ error: any }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [profile, setProfile] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        console.error('Error getting session:', error)
      } else {
        setSession(session)
        setUser(session?.user ?? null)
        
        if (session?.user) {
          await fetchProfile(session.user.id)
        }
      }
      
      setLoading(false)
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id)
        
        setSession(session)
        setUser(session?.user ?? null)
        
        if (session?.user) {
          await fetchProfile(session.user.id)
        } else {
          setProfile(null)
        }
        
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const fetchProfile = async (userId: string) => {
    try {
      const response = await fetch(`/api/users/${userId}`)
      if (response.ok) {
        const userProfile = await response.json()
        setProfile(userProfile)
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    }
  }

  const signUp = async (email: string, password: string, userData?: any) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    })

    if (!error && data.user) {
      // Create user profile
      const profileData = {
        id: data.user.id,
        email: data.user.email!,
        name: userData?.name || data.user.email!.split('@')[0],
        type: userData?.type || 'individual',
        verified: false,
        emailVerified: false,
      }

      try {
        await fetch('/api/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(profileData),
        })
      } catch (profileError) {
        console.error('Error creating profile:', profileError)
      }
    }

    return { error }
  }

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { error }
  }

  const signInWithOAuth = async (provider: 'google' | 'apple' | 'github') => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })
    return { error }
  }

  const signInWithMagicLink = async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    })
    return { error }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setProfile(null)
  }

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) return { error: 'No user logged in' }

    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      })

      if (response.ok) {
        const updatedProfile = await response.json()
        setProfile(updatedProfile)
        return { error: null }
      } else {
        return { error: 'Failed to update profile' }
      }
    } catch (error) {
      return { error: 'Failed to update profile' }
    }
  }

  const value = {
    user,
    profile,
    session,
    loading,
    signUp,
    signIn,
    signInWithOAuth,
    signInWithMagicLink,
    signOut,
    updateProfile
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}