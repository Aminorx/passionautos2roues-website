import React, { useState, useEffect } from 'react';
import { 
  Users, 
  FileText, 
  AlertTriangle, 
  TrendingUp,
  Settings,
  BarChart3,
  Shield,
  MessageSquare,
  Eye,
  CheckCircle,
  XCircle,
  Clock
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

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'annonces' | 'reports'>('dashboard');
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

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Pour le moment, utiliser les données publiques disponibles
      // TODO: Implémenter l'authentification admin complète
      const vehiclesRes = await fetch('/api/vehicles');
      const vehiclesData = await vehiclesRes.json();
      
      // Extraire les utilisateurs uniques des véhicules
      const uniqueUsers = vehiclesData.reduce((acc: any[], vehicle: any) => {
        if (vehicle.user && !acc.find(u => u.id === vehicle.user.id)) {
          acc.push({
            id: vehicle.user.id,
            name: vehicle.user.name,
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

      setUsers(uniqueUsers);
      setAnnonces(annoncesData);

      // Calculer les statistiques
      setStats({
        totalUsers: uniqueUsers.length,
        totalAnnonces: annoncesData.length,
        pendingReports: 0, // À implémenter
        recentActivity: uniqueUsers.filter((u: User) => 
          new Date(u.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        ).length,
        monthlyGrowth: 12 // Placeholder
      });

      setLoading(false);
    } catch (error) {
      console.error('Erreur chargement admin:', error);
      setLoading(false);
    }
  };

  const handleUserAction = async (userId: string, action: 'activate' | 'suspend') => {
    try {
      await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });
      
      loadDashboardData(); // Recharger les données
    } catch (error) {
      console.error('Erreur action utilisateur:', error);
    }
  };

  const handleAnnonceAction = async (annonceId: string, action: 'approve' | 'reject' | 'suspend') => {
    try {
      await fetch(`/api/admin/annonces/${annonceId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });
      
      loadDashboardData(); // Recharger les données
    } catch (error) {
      console.error('Erreur action annonce:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-bolt-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement du tableau de bord...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Admin */}
      <header className="bg-white shadow-sm border-b">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Shield className="h-8 w-8 text-primary-bolt-500" />
                <h1 className="text-2xl font-bold text-gray-900">Administration</h1>
              </div>
              <span className="px-3 py-1 bg-primary-bolt-100 text-primary-bolt-700 rounded-full text-sm font-medium">
                Super Admin
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Dernière connexion: Aujourd'hui</span>
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
                { id: 'reports', label: 'Signalements', icon: AlertTriangle },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as any)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${
                      activeTab === item.id
                        ? 'bg-primary-bolt-50 text-primary-bolt-700 border border-primary-bolt-200'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Tableau de bord</h2>
              
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Utilisateurs</p>
                      <p className="text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
                    </div>
                    <div className="p-3 bg-blue-100 rounded-full">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Annonces</p>
                      <p className="text-3xl font-bold text-gray-900">{stats.totalAnnonces}</p>
                    </div>
                    <div className="p-3 bg-green-100 rounded-full">
                      <FileText className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Signalements</p>
                      <p className="text-3xl font-bold text-gray-900">{stats.pendingReports}</p>
                    </div>
                    <div className="p-3 bg-red-100 rounded-full">
                      <AlertTriangle className="h-6 w-6 text-red-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Croissance</p>
                      <p className="text-3xl font-bold text-gray-900">+{stats.monthlyGrowth}%</p>
                    </div>
                    <div className="p-3 bg-purple-100 rounded-full">
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
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-green-100 rounded-full">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Nouvelle inscription: {users[0]?.name || 'N/A'}</p>
                        <p className="text-xs text-gray-500">Il y a 2 heures</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 rounded-full">
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
                              <button className="p-1 text-blue-600 hover:text-blue-700 transition-colors" title="Voir détails">
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
                            {annonce.price.toLocaleString('fr-FR')} €
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
                                onClick={() => handleAnnonceAction(annonce.id, 'suspend')}
                                className="p-1 text-red-600 hover:text-red-700 transition-colors"
                                title="Suspendre"
                              >
                                <XCircle className="h-4 w-4" />
                              </button>
                              <button className="p-1 text-blue-600 hover:text-blue-700 transition-colors" title="Voir détails">
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

          {activeTab === 'reports' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Signalements</h2>
                <div className="text-sm text-gray-600">
                  0 signalement(s) en attente
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                <AlertTriangle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun signalement</h3>
                <p className="text-gray-500">Les signalements d'utilisateurs apparaîtront ici.</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};