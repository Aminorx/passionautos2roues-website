import React, { useState } from 'react';
import { Shield, Eye, EyeOff, AlertCircle } from 'lucide-react';

interface AdminLoginProps {
  onLoginSuccess: () => void;
  onBack: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess, onBack }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Vérification des identifiants admin
      if (email === 'admin@passionauto2roues.com' && password === 'Admin123456!') {
        // Stocker la session admin
        localStorage.setItem('admin_authenticated', 'true');
        localStorage.setItem('admin_email', email);
        localStorage.setItem('admin_login_time', new Date().toISOString());
        
        onLoginSuccess();
      } else {
        setError('Email ou mot de passe incorrect');
      }
    } catch (error) {
      setError('Erreur de connexion. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-purple-100 rounded-full">
                <Shield className="h-8 w-8 text-purple-600" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Administration</h2>
            <p className="text-gray-600 mt-2">Accès réservé aux administrateurs</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email administrateur
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="admin@passionauto2roues.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Connexion...' : 'Se connecter'}
              </button>

              <button
                type="button"
                onClick={onBack}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-medium transition-colors"
              >
                Retour à l'accueil
              </button>
            </div>
          </form>

          {/* Credentials info for demo */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600 text-center">
              <strong>Identifiants de test :</strong><br />
              Email : admin@auto2roues.com<br />
              Mot de passe : admin123
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};