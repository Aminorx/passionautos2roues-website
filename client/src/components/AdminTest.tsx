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

// Composant de test pour accéder directement au dashboard admin
export const AdminTest: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'annonces' | 'reports'>('dashboard');
  const [users, setUsers] = useState<any[]>([]);
  const [annonces, setAnnonces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTestData();
  }, []);

  const loadTestData = async () => {
    try {
      // Utilisation des routes de test
      const [usersRes, annoncesRes] = await Promise.all([
        fetch('/api/admin/test-users'),
        fetch('/api/admin/test-annonces')
      ]);

      const usersData = await usersRes.json();
      const annoncesData = await annoncesRes.json();

      setUsers(usersData);
      setAnnonces(annoncesData);
      setLoading(false);
    } catch (error) {
      console.error('Erreur chargement test:', error);
      setLoading(false);
    }
  };

  const stats = {
    totalUsers: users.length,
    totalAnnonces: annonces.length,
    pendingReports: 0,
    recentActivity: users.filter(u => 
      new Date(u.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    ).length,
    monthlyGrowth: 12
  };

  const tabItems = [
    { id: 'dashboard', label: 'Tableau de bord', icon: BarChart3 },
    { id: 'users', label: 'Utilisateurs', icon: Users },
    { id: 'annonces', label: 'Annonces', icon: FileText },
    { id: 'reports', label: 'Signalements', icon: AlertTriangle },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-bolt-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement du dashboard admin...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header de test */}
      <div className="bg-white shadow-sm border-b border-gray-200 p-4 mb-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900">
            🔧 Mode Test - Dashboard Administrateur
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Interface de test pour valider les fonctionnalités admin
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex bg-white rounded-lg shadow-sm border border-gray-200 min-h-[600px]">
          {/* Sidebar */}
          <nav className="w-64 border-r border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-8">
              <div className="p-2 bg-primary-bolt-100 rounded-lg">
                <Shield className="h-6 w-6 text-primary-bolt-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Admin</h2>
                <p className="text-sm text-gray-500">Dashboard</p>
              </div>
            </div>

            <div className="space-y-2">
              {tabItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as any)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
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

                {/* Recent Activity */}
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
                          <p className="text-sm font-medium text-gray-900">
                            Nouvelle inscription: {users[0]?.name || 'N/A'}
                          </p>
                          <p className="text-xs text-gray-500">Il y a 2 heures</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-full">
                          <FileText className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            Nouvelle annonce: {annonces[0]?.title || 'N/A'}
                          </p>
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
                <h2 className="text-2xl font-bold text-gray-900">Gestion des utilisateurs</h2>
                
                <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Utilisateur
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Type
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Inscription
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {users.slice(0, 10).map((user) => (
                          <tr key={user.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="h-10 w-10 bg-primary-bolt-100 rounded-full flex items-center justify-center">
                                  <span className="text-sm font-medium text-primary-bolt-700">
                                    {user.name?.charAt(0) || user.email?.charAt(0) || 'U'}
                                  </span>
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">{user.name || 'Sans nom'}</div>
                                  <div className="text-sm text-gray-500">{user.email}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                user.type === 'professional' 
                                  ? 'bg-blue-100 text-blue-800' 
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {user.type === 'professional' ? 'Professionnel' : 'Particulier'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                user.verified 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {user.verified ? 'Vérifié' : 'En attente'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(user.created_at).toLocaleDateString('fr-FR')}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                              <button className="text-blue-600 hover:text-blue-900">Voir</button>
                              <button className="text-yellow-600 hover:text-yellow-900">Suspendre</button>
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
                <h2 className="text-2xl font-bold text-gray-900">Gestion des annonces</h2>
                
                <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Annonce
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Auteur
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Prix
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {annonces.slice(0, 10).map((annonce) => (
                          <tr key={annonce.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4">
                              <div className="text-sm font-medium text-gray-900">{annonce.title}</div>
                              <div className="text-sm text-gray-500">{annonce.category}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{annonce.users?.name || 'Anonyme'}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {annonce.price ? `${annonce.price}€` : 'Prix non affiché'}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                Publié
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                              <button className="text-blue-600 hover:text-blue-900">Voir</button>
                              <button className="text-red-600 hover:text-red-900">Suspendre</button>
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
                <h2 className="text-2xl font-bold text-gray-900">Signalements</h2>
                
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
                  <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun signalement</h3>
                  <p className="text-gray-500">
                    Aucun signalement en attente de traitement pour le moment.
                  </p>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};