import { useState } from 'react'
import { User, LogOut, Settings, Heart, Plus } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { signOut } from '@/lib/supabase'

interface UserMenuProps {
  onNavigate?: (path: string) => void
  onDashboardNavigate?: (tab: string) => void
}

export function UserMenu({ onNavigate, onDashboardNavigate }: UserMenuProps) {
  const { user, dbUser } = useAuth()
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  const handleSignOut = async () => {
    setIsSigningOut(true)
    try {
      const { error } = await signOut()
      if (error) {
        console.log("❌ Erreur:", error.message)
      } else {
        console.log("✅ Déconnexion réussie: À bientôt !")
      }
    } catch (error) {
      console.log("❌ Erreur: Une erreur est survenue lors de la déconnexion")
    } finally {
      setIsSigningOut(false)
    }
  }

  if (!user) return null

  const displayName = dbUser?.name || user?.user_metadata?.name || 'Utilisateur'
  const userInitial = displayName.charAt(0)?.toUpperCase() || 'U'

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex flex-col items-center text-gray-600 hover:text-primary-bolt-500 transition-colors"
      >
        <div className="w-8 h-8 bg-primary-bolt-100 text-primary-bolt-700 rounded-full flex items-center justify-center">
          {userInitial}
        </div>
        <span className="text-xs mt-1">{displayName}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 z-50">
          <div className="p-3 border-b border-gray-100">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">
                {displayName}
              </p>
              {dbUser && (
                <p className="text-xs leading-none text-blue-600 font-medium">
                  {dbUser.type === 'professional' ? 'Professionnel' : 'Particulier'}
                </p>
              )}
              <p className="text-xs leading-none text-gray-500">
                {user.email}
              </p>
            </div>
          </div>
          
          <div className="py-2">
            <button
              onClick={() => {
                onDashboardNavigate?.('profile')
                setIsOpen(false)
              }}
              className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              <User className="mr-2 h-4 w-4" />
              <span>Mon profil</span>
            </button>
            
            <button
              onClick={() => {
                onDashboardNavigate?.('listings')
                setIsOpen(false)
              }}
              className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              <Settings className="mr-2 h-4 w-4" />
              <span>Mes annonces</span>
            </button>
            
            <button
              onClick={() => {
                onDashboardNavigate?.('favorites')
                setIsOpen(false)
              }}
              className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              <Heart className="mr-2 h-4 w-4" />
              <span>Mes favoris</span>
            </button>
            
            <div className="border-t border-gray-100 my-1"></div>
            
            <button
              onClick={() => {
                onNavigate?.('create-listing')
                setIsOpen(false)
              }}
              className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              <Plus className="mr-2 h-4 w-4" />
              <span>Créer une annonce</span>
            </button>
            
            <div className="border-t border-gray-100 my-1"></div>
            
            <button
              onClick={() => {
                handleSignOut()
                setIsOpen(false)
              }}
              disabled={isSigningOut}
              className="flex items-center w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>{isSigningOut ? 'Déconnexion...' : 'Se déconnecter'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}