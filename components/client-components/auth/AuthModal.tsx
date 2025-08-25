import { useState, useEffect } from 'react'
import { signIn, signUp, signInWithOAuth } from '@/lib/supabase'
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react'
// Import du service d'authentification centralisé (à décommenter quand il sera implémenté)
// import { useAuthService } from '../../../client/src/services/AuthService'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  defaultTab?: 'signin' | 'signup'
}

export function AuthModal({ isOpen, onClose, defaultTab = 'signin' }: AuthModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [activeTab, setActiveTab] = useState(defaultTab)
  
  // Toast notification state
  const [notification, setNotification] = useState<{
    title: string
    description: string
    variant: 'default' | 'destructive'
  } | null>(null)

  const showToast = (title: string, description: string, variant: 'default' | 'destructive' = 'default') => {
    console.log(`${variant === 'destructive' ? '❌' : '✅'} ${title}: ${description}`)
    setNotification({ title, description, variant })
    // Auto hide notification after 4 seconds
    setTimeout(() => {
      setNotification(null)
    }, 4000)
  }

  const [signinForm, setSigninForm] = useState({
    email: '',
    password: ''
  })

  const [signupForm, setSignupForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: ''
  })

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { data, error } = await signIn(signinForm.email, signinForm.password)
      
      if (error) {
        showToast("Erreur de connexion", error.message, "destructive")
        setIsLoading(false)
        return
      }

      if (data.user) {
        // Utilisation du service d'authentification centralisé (à décommenter quand il sera implémenté)
        // const authService = useAuthService();
        // authService.handleAuthSuccess();
        
        showToast("Connexion réussie", "Vous êtes maintenant connecté")
        // Attendre un peu avant de fermer pour laisser le temps de voir le message
        setTimeout(() => {
          onClose()
        }, 1000)
      }
    } catch (error: any) {
      showToast("Erreur", "Une erreur est survenue lors de la connexion", "destructive")
      setIsLoading(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (signupForm.password !== signupForm.confirmPassword) {
      showToast("Erreur", "Les mots de passe ne correspondent pas", "destructive")
      return
    }

    if (signupForm.password.length < 6) {
      showToast("Erreur", "Le mot de passe doit contenir au moins 6 caractères", "destructive")
      return
    }

    setIsLoading(true)

    try {
      const { data, error } = await signUp(
        signupForm.email, 
        signupForm.password,
        { name: signupForm.name }
      )
      
      if (error) {
        showToast("Erreur d'inscription", error.message, "destructive")
        setIsLoading(false)
        return
      }

      if (data.user) {
        showToast("Inscription réussie", "Vérifiez votre email pour confirmer votre compte")
        // Attendre un peu avant de fermer pour laisser le temps de voir le message
        setTimeout(() => {
          onClose()
        }, 1500)
      }
    } catch (error: any) {
      showToast("Erreur", "Une erreur est survenue lors de l'inscription", "destructive")
      setIsLoading(false)
    }
  }

  const handleOAuthSignIn = async (provider: 'google' | 'github') => {
    setIsLoading(true)
    try {
      // Utiliser le service d'auth centralisé quand il sera implémenté
      // const authService = useAuthService();
      // await authService.signInWithOAuth(provider);

      const { error } = await signInWithOAuth(provider)
      if (error) {
        showToast("Erreur", error.message, "destructive")
      }
    } catch (error: any) {
      showToast("Erreur", "Une erreur est survenue", "destructive")
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Accédez à votre compte</h2>
          <p className="text-gray-600 text-sm">
            Connectez-vous pour gérer vos annonces et accéder à toutes les fonctionnalités
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('signin')}
              className={`flex-1 py-2 px-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'signin'
                  ? 'border-primary-bolt-500 text-primary-bolt-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Se connecter
            </button>
            <button
              onClick={() => setActiveTab('signup')}
              className={`flex-1 py-2 px-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'signup'
                  ? 'border-primary-bolt-500 text-primary-bolt-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              S'inscrire
            </button>
          </div>
        </div>

        {/* Sign In Tab */}
        {activeTab === 'signin' && (
          <div className="space-y-4">
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="signin-email" className="block text-sm font-medium text-gray-700">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    id="signin-email"
                    type="email"
                    placeholder="votre@email.com"
                    value={signinForm.email}
                    onChange={(e) => setSigninForm(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-bolt-500 focus:border-primary-bolt-500"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="signin-password" className="block text-sm font-medium text-gray-700">Mot de passe</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    id="signin-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={signinForm.password}
                    onChange={(e) => setSigninForm(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-bolt-500 focus:border-primary-bolt-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button 
                type="submit" 
                className="w-full bg-primary-bolt-500 hover:bg-primary-bolt-600 text-white py-2 px-4 rounded-md transition-colors disabled:opacity-50"
                disabled={isLoading}
              >
                {isLoading ? "Connexion..." : "Se connecter"}
              </button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">ou continuer avec</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleOAuthSignIn('google')}
                disabled={isLoading}
                className="w-full border border-gray-300 hover:bg-gray-50 py-2 px-4 rounded-md transition-colors disabled:opacity-50"
              >
                Google
              </button>
              <button
                onClick={() => handleOAuthSignIn('github')}
                disabled={isLoading}
                className="w-full border border-gray-300 hover:bg-gray-50 py-2 px-4 rounded-md transition-colors disabled:opacity-50"
              >
                GitHub
              </button>
            </div>
          </div>
        )}

        {/* Sign Up Tab */}
        {activeTab === 'signup' && (
          <div className="space-y-4">
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="signup-name" className="block text-sm font-medium text-gray-700">Nom complet</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    id="signup-name"
                    type="text"
                    placeholder="Votre nom"
                    value={signupForm.name}
                    onChange={(e) => setSignupForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-bolt-500 focus:border-primary-bolt-500"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="signup-email" className="block text-sm font-medium text-gray-700">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    id="signup-email"
                    type="email"
                    placeholder="votre@email.com"
                    value={signupForm.email}
                    onChange={(e) => setSignupForm(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-bolt-500 focus:border-primary-bolt-500"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="signup-password" className="block text-sm font-medium text-gray-700">Mot de passe</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    id="signup-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={signupForm.password}
                    onChange={(e) => setSignupForm(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-bolt-500 focus:border-primary-bolt-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="signup-confirm-password" className="block text-sm font-medium text-gray-700">Confirmer le mot de passe</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    id="signup-confirm-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={signupForm.confirmPassword}
                    onChange={(e) => setSignupForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-bolt-500 focus:border-primary-bolt-500"
                    required
                  />
                </div>
              </div>

              <button 
                type="submit" 
                className="w-full bg-primary-bolt-500 hover:bg-primary-bolt-600 text-white py-2 px-4 rounded-md transition-colors disabled:opacity-50"
                disabled={isLoading}
              >
                {isLoading ? "Inscription..." : "S'inscrire"}
              </button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">ou continuer avec</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleOAuthSignIn('google')}
                disabled={isLoading}
                className="w-full border border-gray-300 hover:bg-gray-50 py-2 px-4 rounded-md transition-colors disabled:opacity-50"
              >
                Google
              </button>
              <button
                onClick={() => handleOAuthSignIn('github')}
                disabled={isLoading}
                className="w-full border border-gray-300 hover:bg-gray-50 py-2 px-4 rounded-md transition-colors disabled:opacity-50"
              >
                GitHub
              </button>
            </div>
          </div>
        )}

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>

        {/* Notification Toast */}
        {notification && (
          <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg border max-w-sm z-[60] ${
            notification.variant === 'destructive' 
              ? 'bg-red-50 border-red-200 text-red-800' 
              : 'bg-green-50 border-green-200 text-green-800'
          }`}>
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-semibold text-sm">{notification.title}</h4>
                <p className="text-sm mt-1">{notification.description}</p>
              </div>
              <button
                onClick={() => setNotification(null)}
                className="ml-4 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}