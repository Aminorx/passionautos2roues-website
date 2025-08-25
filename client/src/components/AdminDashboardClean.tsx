import React, { useState, useEffect } from 'react';
import { 
  Users, 
  FileText, 
  AlertTriangle, 
  TrendingUp,
  Settings,
  BarChart3,
  Shield,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  ArrowLeft
} from 'lucide-react';

interface AdminStats {
  totalUsers: number;
  totalAnnonces: number;
  pendingReports: number;
  recentActivity: number;
  monthlyGrowth: number;
}

interface User {
  id: string;
  name: string;
  email: string;
  type: string;
  verified: boolean;
  createdAt: string;
}

interface Annonce {
  id: string;
  title: string;
  user?: {
    name: string;
  };
  status: string;
  price: number;
  createdAt: string;
}

interface AdminDashboardProps {
  onBack?: () => void;
}

export const AdminDashboardClean: React.FC<AdminDashboardProps> = ({ onBack }) => {
  // Vérifier l'authentification admin
  const isAdminAuthenticated = () => {
    const authenticated = localStorage.getItem('admin_authenticated');
    const loginTime = localStorage.getItem('admin_login_time');
    
    if (!authenticated || !loginTime) return false;
    
    // Vérifier si la session n'a pas expiré (24h)
    const loginDate = new Date(loginTime);
    const now = new Date();
    const diffHours = (now.getTime() - loginDate.getTime()) / (1000 * 60 * 60);
    
    return diffHours < 24;
  };

  // Déconnexion admin
  const handleLogout = () => {
    localStorage.removeItem('admin_authenticated');
    localStorage.removeItem('admin_email');
    localStorage.removeItem('admin_login_time');
    if (onBack) onBack();
  };

  // Rediriger si pas authentifié
  if (!isAdminAuthenticated()) {
    if (onBack) onBack();
    return null;
  }
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'annonces' | 'performance' | 'reports'>('dashboard');
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalAnnonces: 0,
    pendingReports: 0,
    recentActivity: 0,
    monthlyGrowth: 0
  });
  const [users, setUsers] = useState<User[]>([]);
  const [annonces, setAnnonces] = useState<Annonce[]>([]);
  const [loading, setLoading] = useState(true);
  const [performanceData, setPerformanceData] = useState<any>(null);

  useEffect(() => {
    loadDashboardData();
    if (activeTab === 'performance') {
      loadPerformanceData();
    }
  }, [activeTab]);

  const loadDashboardData = async () => {
    try {
      console.log('🔄 Chargement des données admin...');
      const vehiclesRes = await fetch('/api/vehicles');
      const vehiclesData = await vehiclesRes.json();
      console.log('📊 Données véhicules reçues:', vehiclesData.length);
      
      // Extraire les utilisateurs uniques des véhicules
      const uniqueUsers = vehiclesData.reduce((acc: User[], vehicle: any) => {
        if (vehicle.user && !acc.find(u => u.id === vehicle.user.id)) {
          acc.push({
            id: vehicle.user.id,
            name: vehicle.user.name || 'Utilisateur',
            email: vehicle.user.email || `${vehicle.user.id}@auto2roues.com`,
            type: vehicle.user.type || 'individual',
            verified: true,
            createdAt: vehicle.user.createdAt || vehicle.created_at || new Date().toISOString()
          });
        }
        return acc;
      }, []);

      // Convertir les véhicules en format annonces
      const annoncesData = vehiclesData.map((vehicle: any) => ({
        id: vehicle.id,
        title: vehicle.title,
        user: vehicle.user,
        status: 'active',
        price: vehicle.price || 0,
        createdAt: vehicle.created_at || vehicle.createdAt || new Date().toISOString()
      }));

      console.log('👥 Utilisateurs uniques:', uniqueUsers.length);
      console.log('📄 Annonces:', annoncesData.length);

      setUsers(uniqueUsers);
      setAnnonces(annoncesData);

      setStats({
        totalUsers: uniqueUsers.length,
        totalAnnonces: annoncesData.length,
        pendingReports: 0,
        recentActivity: 2,
        monthlyGrowth: 15
      });

      setLoading(false);
    } catch (error) {
      console.error('❌ Erreur chargement admin:', error);
      setLoading(false);
    }
  };

  const loadPerformanceData = async () => {
    try {
      const response = await fetch('/api/admin/performance-stats');
      if (response.ok) {
        const data = await response.json();
        setPerformanceData(data);
      }
    } catch (error) {
      console.error('Erreur chargement performance:', error);
    }
  };

  const handleAnnonceView = (annonceId: string) => {
    window.open(`/vehicle/${annonceId}`, '_blank');
  };

  const handleAnnonceDeactivate = async (annonceId: string) => {
    try {
      const response = await fetch(`/api/admin/annonces/${annonceId}/deactivate`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' }
      });
      if (response.ok) {
        loadDashboardData();
      }
    } catch (error) {
      console.error('Erreur désactivation:', error);
    }
  };

  const handleUserAction = async (userId: string, action: 'activate' | 'suspend') => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });
      if (response.ok) {
        loadDashboardData();
      }
    } catch (error) {
      console.error('Erreur action utilisateur:', error);
    }
  };

  const handleAnnonceAction = async (annonceId: string, action: 'approve' | 'reject' | 'suspend') => {
    try {
      const response = await fetch(`/api/admin/annonces/${annonceId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });
      if (response.ok) {
        loadDashboardData();
      }
    } catch (error) {
      console.error('Erreur action annonce:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement du tableau de bord administrateur...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Admin - SANS le header normal */}
      <header className="bg-white shadow-sm border-b">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {onBack && (
                <button
                  onClick={onBack}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
              )}
              <div className="flex items-center space-x-2">
                <Shield className="h-8 w-8 text-purple-500" />
                <h1 className="text-2xl font-bold text-gray-900">Administration Passion Auto2Roues</h1>
              </div>
              <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                Super Admin
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Connecté en tant que : {localStorage.getItem('admin_email')}
              </span>
              <button 
                onClick={handleLogout}
                className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200 transition-colors"
              >
                Déconnexion
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <Settings className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <nav className="w-64 bg-white shadow-sm h-screen">
          <div className="p-6">
            <div className="space-y-2">
              {[
                { id: 'dashboard', label: 'Tableau de bord', icon: BarChart3 },
                { id: 'users', label: 'Utilisateurs', icon: Users },
                { id: 'annonces', label: 'Annonces', icon: FileText },
                { id: 'performance', label: 'Performance', icon: TrendingUp },
                { id: 'reports', label: 'Signalements', icon: AlertTriangle },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    activeTab === item.id
                      ? 'bg-purple-50 text-purple-700 border-purple-200'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {activeTab === 'dashboard' && (
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Tableau de bord</h2>
                <p className="text-gray-600">Vue d'ensemble de la plateforme</p>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Utilisateurs</p>
                      <p className="text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
                    </div>
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Annonces</p>
                      <p className="text-3xl font-bold text-gray-900">{stats.totalAnnonces}</p>
                    </div>
                    <div className="p-3 bg-green-100 rounded-lg">
                      <FileText className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Signalements</p>
                      <p className="text-3xl font-bold text-gray-900">{stats.pendingReports}</p>
                    </div>
                    <div className="p-3 bg-red-100 rounded-lg">
                      <AlertTriangle className="h-6 w-6 text-red-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Croissance</p>
                      <p className="text-3xl font-bold text-gray-900">+{stats.monthlyGrowth}%</p>
                    </div>
                    <div className="p-3 bg-purple-100 rounded-lg">
                      <TrendingUp className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Activité récente */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="p-6 border-b border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900">Activité récente</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-start space-x-4">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Users className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Nouvelle inscription: User Démo</p>
                        <p className="text-xs text-gray-500">Il y a 2 heures</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-4">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <FileText className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Nouvelle annonce publiée</p>
                        <p className="text-xs text-gray-500">Il y a 4 heures</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Gestion des utilisateurs</h2>
                <div className="text-sm text-gray-600">
                  {users.length} utilisateur(s) au total
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left py-3 px-6 font-medium text-gray-600">Utilisateur</th>
                        <th className="text-left py-3 px-6 font-medium text-gray-600">Type</th>
                        <th className="text-left py-3 px-6 font-medium text-gray-600">Statut</th>
                        <th className="text-left py-3 px-6 font-medium text-gray-600">Inscription</th>
                        <th className="text-left py-3 px-6 font-medium text-gray-600">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {users.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="py-4 px-6">
                            <div>
                              <div className="font-medium text-gray-900">{user.name}</div>
                              <div className="text-sm text-gray-500">{user.email}</div>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              user.type === 'professional' 
                                ? 'bg-orange-100 text-orange-700' 
                                : 'bg-blue-100 text-blue-700'
                            }`}>
                              {user.type === 'professional' ? 'Pro' : 'Particulier'}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              user.verified 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-yellow-100 text-yellow-700'
                            }`}>
                              {user.verified ? 'Vérifié' : 'En attente'}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-sm text-gray-600">
                            {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleUserAction(user.id, 'activate')}
                                className="p-1 text-green-600 hover:text-green-700 transition-colors"
                                title="Activer"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleUserAction(user.id, 'suspend')}
                                className="p-1 text-red-600 hover:text-red-700 transition-colors"
                                title="Suspendre"
                              >
                                <XCircle className="h-4 w-4" />
                              </button>
                              <button
                                className="p-1 text-blue-600 hover:text-blue-700 transition-colors"
                                title="Voir détails"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'annonces' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Gestion des annonces</h2>
                <div className="text-sm text-gray-600">
                  {annonces.length} annonce(s) au total
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left py-3 px-6 font-medium text-gray-600">Annonce</th>
                        <th className="text-left py-3 px-6 font-medium text-gray-600">Vendeur</th>
                        <th className="text-left py-3 px-6 font-medium text-gray-600">Prix</th>
                        <th className="text-left py-3 px-6 font-medium text-gray-600">Statut</th>
                        <th className="text-left py-3 px-6 font-medium text-gray-600">Date</th>
                        <th className="text-left py-3 px-6 font-medium text-gray-600">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {annonces.map((annonce) => (
                        <tr key={annonce.id} className="hover:bg-gray-50">
                          <td className="py-4 px-6">
                            <div className="font-medium text-gray-900">{annonce.title}</div>
                          </td>
                          <td className="py-4 px-6 text-sm text-gray-600">
                            {annonce.user?.name || 'N/A'}
                          </td>
                          <td className="py-4 px-6 text-sm font-medium text-gray-900">
                            {annonce.price ? `${annonce.price.toLocaleString('fr-FR')} €` : 'N/A'}
                          </td>
                          <td className="py-4 px-6">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              annonce.status === 'active' 
                                ? 'bg-green-100 text-green-700' 
                                : annonce.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-red-100 text-red-700'
                            }`}>
                              {annonce.status === 'active' ? 'Active' : 
                               annonce.status === 'pending' ? 'En attente' : 'Suspendue'}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-sm text-gray-600">
                            {new Date(annonce.createdAt).toLocaleDateString('fr-FR')}
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleAnnonceAction(annonce.id, 'approve')}
                                className="p-1 text-green-600 hover:text-green-700 transition-colors"
                                title="Approuver"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleAnnonceDeactivate(annonce.id)}
                                className="p-1 text-red-600 hover:text-red-700 transition-colors"
                                title="Désactiver"
                              >
                                <XCircle className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleAnnonceView(annonce.id)}
                                className="p-1 text-blue-600 hover:text-blue-700 transition-colors"
                                title="Voir annonce"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'performance' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Performance des annonces</h2>
                <div className="text-sm text-gray-600">
                  Statistiques basées sur le questionnaire de suppression
                </div>
              </div>

              {performanceData ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Vendues sur le site</p>
                        <p className="text-3xl font-bold text-green-600">{performanceData.soldOnSite || 0}</p>
                        <p className="text-sm text-gray-500">{performanceData.soldOnSitePercent || 0}% du total</p>
                      </div>
                      <div className="p-3 bg-green-100 rounded-lg">
                        <TrendingUp className="h-6 w-6 text-green-600" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Vendues ailleurs</p>
                        <p className="text-3xl font-bold text-orange-600">{performanceData.soldElsewhere || 0}</p>
                        <p className="text-sm text-gray-500">{performanceData.soldElsewherePercent || 0}% du total</p>
                      </div>
                      <div className="p-3 bg-orange-100 rounded-lg">
                        <AlertTriangle className="h-6 w-6 text-orange-600" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Ne souhaite plus vendre</p>
                        <p className="text-3xl font-bold text-blue-600">{performanceData.noLongerSelling || 0}</p>
                        <p className="text-sm text-gray-500">{performanceData.noLongerSellingPercent || 0}% du total</p>
                      </div>
                      <div className="p-3 bg-blue-100 rounded-lg">
                        <XCircle className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Autres raisons</p>
                        <p className="text-3xl font-bold text-purple-600">{performanceData.other || 0}</p>
                        <p className="text-sm text-gray-500">{performanceData.otherPercent || 0}% du total</p>
                      </div>
                      <div className="p-3 bg-purple-100 rounded-lg">
                        <FileText className="h-6 w-6 text-purple-600" />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
                  <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Chargement des données...</h3>
                  <p className="text-gray-600">Veuillez patienter</p>
                </div>
              )}

              {performanceData && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                    <div className="p-6 border-b border-gray-100">
                      <h3 className="text-lg font-semibold text-gray-900">Durée moyenne avant suppression</h3>
                    </div>
                    <div className="p-6">
                      <div className="text-center">
                        <p className="text-4xl font-bold text-indigo-600 mb-2">{performanceData.averageDays || 0}</p>
                        <p className="text-gray-600">jours en moyenne</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                    <div className="p-6 border-b border-gray-100">
                      <h3 className="text-lg font-semibold text-gray-900">Total suppressions</h3>
                    </div>
                    <div className="p-6">
                      <div className="text-center">
                        <p className="text-4xl font-bold text-gray-900 mb-2">{performanceData.totalDeleted || 0}</p>
                        <p className="text-gray-600">annonces supprimées</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Signalements</h2>
                <div className="text-sm text-gray-600">
                  0 signalement(s) en attente
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                <AlertTriangle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucun signalement</h3>
                <p className="text-gray-600">Tous les signalements ont été traités</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};