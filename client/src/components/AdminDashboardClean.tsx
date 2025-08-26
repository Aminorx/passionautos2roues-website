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
  ArrowLeft,
  Building2,
  Download,
  Check,
  X,
  ExternalLink
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
  emailVerified?: boolean;
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

interface ProfessionalAccount {
  id: number;
  company_name: string;
  siret: string;
  company_address: string;
  phone: string;
  email: string;
  website?: string;
  is_verified: boolean;
  verification_status: 'pending' | 'approved' | 'rejected';
  verified_at?: string;
  rejected_reason?: string;
  created_at: string;
  updated_at: string;
  users?: {
    id: string;
    name: string;
    email: string;
  };
}

interface VerificationDocument {
  id: number;
  professional_account_id: number;
  document_type: 'kbis' | 'siret' | 'other';
  file_url: string;
  file_name: string;
  file_size: number;
  upload_date: string;
  verification_status: 'pending' | 'approved' | 'rejected';
  admin_notes?: string;
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
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'annonces' | 'performance' | 'reports' | 'pro-accounts'>('dashboard');
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
  const [professionalAccounts, setProfessionalAccounts] = useState<ProfessionalAccount[]>([]);
  const [selectedProAccount, setSelectedProAccount] = useState<ProfessionalAccount | null>(null);
  const [proAccountDocuments, setProAccountDocuments] = useState<VerificationDocument[]>([]);
  const [verificationAction, setVerificationAction] = useState<{accountId: number, action: 'approve' | 'reject', reason?: string} | null>(null);

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
      
      // Récupérer aussi les annonces supprimées depuis Supabase
      const deletedRes = await fetch('/api/admin/deleted-annonces');
      const deletedData = deletedRes.ok ? await deletedRes.json() : [];
      console.log('🗑️ Annonces supprimées récupérées:', deletedData.length);
      
      // Récupérer TOUS les utilisateurs depuis la base
      const usersRes = await fetch(`/api/admin/all-users?t=${Date.now()}`);
      const allUsers = usersRes.ok ? await usersRes.json() : [];
      console.log('👥 TOUS les utilisateurs récupérés:', allUsers.length);
      
      // Formater les utilisateurs
      const formattedUsers = allUsers.map((user: any) => ({
        id: user.id,
        name: user.name || 'Utilisateur',
        email: user.email || `${user.id}@auto2roues.com`,
        type: user.account_type || 'individual',
        verified: user.verified || false,
        emailVerified: user.email_verified || false,
        createdAt: user.created_at || new Date().toISOString()
      }));

      // Convertir les véhicules en format annonces
      const annoncesData = vehiclesData.map((vehicle: any) => ({
        id: vehicle.id,
        title: vehicle.title,
        user: vehicle.user,
        status: 'active',
        price: vehicle.price || 0,
        createdAt: vehicle.created_at || vehicle.createdAt || new Date().toISOString()
      }));
      
      // Ajouter les annonces supprimées
      const deletedAnnoncesData = deletedData.map((annonce: any) => ({
        id: annonce.id,
        title: annonce.title,
        user: annonce.users || { name: 'Utilisateur supprimé' },
        status: 'deleted',
        price: annonce.price || 0,
        createdAt: annonce.created_at,
        deletedAt: annonce.deleted_at,
        deletionReason: annonce.deletion_reason
      }));
      
      // Combiner toutes les annonces
      const allAnnonces = [...annoncesData, ...deletedAnnoncesData];

      console.log('👥 Utilisateurs totaux:', formattedUsers.length);
      console.log('📄 Annonces:', annoncesData.length);

      setUsers(formattedUsers);
      setAnnonces(allAnnonces);
      
      // Charger aussi les comptes professionnels si c'est l'onglet actif
      if (activeTab === 'pro-accounts') {
        loadProfessionalAccounts();
      }

      setStats({
        totalUsers: formattedUsers.length,
        totalAnnonces: allAnnonces.length,
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
      console.log('🔄 Chargement données performance...');
      const response = await fetch('/api/admin/performance-stats');
      if (response.ok) {
        const data = await response.json();
        console.log('📊 Données performance reçues:', data);
        setPerformanceData(data);
      } else {
        console.error('❌ Erreur HTTP:', response.status);
        // Mettre des données par défaut
        setPerformanceData({
          soldOnSite: 0,
          soldOnSitePercent: 0,
          soldElsewhere: 0, 
          soldElsewherePercent: 0,
          noLongerSelling: 0,
          noLongerSellingPercent: 0,
          other: 0,
          otherPercent: 0,
          totalDeleted: 0,
          averageDays: 0
        });
      }
    } catch (error) {
      console.error('Erreur chargement performance:', error);
      // Mettre des données par défaut même en cas d'erreur
      setPerformanceData({
        soldOnSite: 0,
        soldOnSitePercent: 0,
        soldElsewhere: 0, 
        soldElsewherePercent: 0,
        noLongerSelling: 0,
        noLongerSellingPercent: 0,
        other: 0,
        otherPercent: 0,
        totalDeleted: 0,
        averageDays: 0
      });
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



  const handleUserAction = async (userId: string, action: 'verify_email' | 'activate' | 'suspend') => {
    try {
      console.log(`🔐 Action ${action} pour utilisateur ${userId}...`);
      const response = await fetch(`/api/admin/users/${userId}/verify`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action }),
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ Action réussie:', result.message);
        alert(`✅ ${result.message}`);
        // Attendre un peu puis recharger pour voir les changements
        setTimeout(() => {
          loadDashboardData();
        }, 1000);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Erreur action utilisateur:', errorData);
        alert(`❌ Erreur: ${errorData.error || 'Erreur lors de l\'action'}`);
      }
    } catch (error) {
      console.error('Erreur action utilisateur:', error);
      alert('❌ Erreur lors de l\'action');
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

  const loadProfessionalAccounts = async () => {
    try {
      console.log('🏢 Chargement comptes professionnels...');
      const response = await fetch('/api/admin/professional-accounts');
      if (response.ok) {
        const data = await response.json();
        console.log(`📊 ${data.length} comptes professionnels reçus`);
        setProfessionalAccounts(data);
      }
    } catch (error) {
      console.error('Erreur chargement comptes pro:', error);
    }
  };

  const loadProAccountDocuments = async (accountId: number) => {
    try {
      console.log(`📄 Chargement documents pour compte ${accountId}...`);
      const response = await fetch(`/api/admin/professional-accounts/${accountId}/documents`);
      if (response.ok) {
        const data = await response.json();
        console.log(`📄 ${data.length} documents reçus`);
        setProAccountDocuments(data);
      }
    } catch (error) {
      console.error('Erreur chargement documents:', error);
    }
  };

  const handleVerifyProAccount = async (accountId: number, action: 'approve' | 'reject', reason?: string) => {
    try {
      console.log(`🔍 ${action} compte pro ${accountId}...`);
      const response = await fetch(`/api/admin/professional-accounts/${accountId}/verify`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action, reason }),
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ Vérification réussie:', result.message);
        alert(`✅ ${result.message}`);
        loadProfessionalAccounts(); // Recharger la liste
        setVerificationAction(null);
        if (selectedProAccount?.id === accountId) {
          setSelectedProAccount(null); // Fermer le détail
        }
      } else {
        console.error('❌ Erreur vérification');
        alert('❌ Erreur lors de la vérification');
      }
    } catch (error) {
      console.error('Erreur vérification:', error);
      alert('❌ Erreur lors de la vérification');
    }
  };



  const handleViewDocument = async (document: VerificationDocument) => {
    try {
      console.log(`🔗 Génération URL signée pour: ${document.file_url}`);
      const response = await fetch(`/api/admin/documents/${encodeURIComponent(document.file_url)}/signed-url`);
      if (response.ok) {
        const data = await response.json();
        window.open(data.signedUrl, '_blank');
      } else {
        alert('❌ Impossible d\'ouvrir le document');
      }
    } catch (error) {
      console.error('Erreur ouverture document:', error);
      alert('❌ Erreur lors de l\'ouverture du document');
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
                { id: 'pro-accounts', label: 'Comptes Pro', icon: Building2 },
                { id: 'reports', label: 'Signalements', icon: AlertTriangle },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id as any);
                    if (item.id === 'pro-accounts') {
                      loadProfessionalAccounts();
                    }
                  }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    activeTab === item.id
                      ? 'bg-purple-50 text-purple-700 border-purple-200'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                  {item.id === 'pro-accounts' && professionalAccounts.filter(acc => acc.verification_status === 'pending').length > 0 && (
                    <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 ml-auto">
                      {professionalAccounts.filter(acc => acc.verification_status === 'pending').length}
                    </span>
                  )}
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
                            <div className="flex flex-col gap-1">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                user.verified 
                                  ? 'bg-green-100 text-green-700' 
                                  : 'bg-red-100 text-red-700'
                              }`}>
                                {user.verified ? '✅ Actif' : '❌ Inactif'}
                              </span>
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                {(user as any).provider === 'google' ? '🌐 OAuth' : '📧 Email'}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-6 text-sm text-gray-600">
                            {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex flex-wrap gap-1">
                              {!user.verified && (
                                <button
                                  onClick={() => handleUserAction(user.id, 'activate')}
                                  className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium hover:bg-green-200 transition-colors"
                                  title="Confirmer l'email et activer le compte"
                                >
                                  ✅ Activer
                                </button>
                              )}
                              {user.verified && (
                                <button
                                  onClick={() => handleUserAction(user.id, 'suspend')}
                                  className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium hover:bg-red-200 transition-colors"
                                  title="Suspendre le compte (email non confirmé)"
                                >
                                  ❌ Suspendre
                                </button>
                              )}
                              <button
                                className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium hover:bg-gray-200 transition-colors"
                                title="Voir détails"
                              >
                                👁️ Détails
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
                                : annonce.status === 'deleted'
                                ? 'bg-gray-100 text-gray-700'
                                : annonce.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-red-100 text-red-700'
                            }`}>
                              {annonce.status === 'active' ? 'Active' : 
                               annonce.status === 'deleted' ? '🗑️ Supprimée' :
                               annonce.status === 'pending' ? 'En attente' : 'Suspendue'}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-sm text-gray-600">
                            {new Date(annonce.createdAt).toLocaleDateString('fr-FR')}
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex space-x-2">
                              {annonce.status === 'deleted' ? (
                                // Annonces supprimées : seulement voir
                                <button
                                  onClick={() => handleAnnonceView(annonce.id)}
                                  className="p-1 text-blue-600 hover:text-blue-700 transition-colors"
                                  title="Voir annonce"
                                >
                                  <Eye className="h-4 w-4" />
                                </button>
                              ) : (
                                // Annonces actives : toutes les actions
                                <>
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
                                </>
                              )}
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

          {activeTab === 'pro-accounts' && (
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">Comptes Professionnels</h2>
                  <p className="text-gray-600">Gestion et validation des comptes professionnels</p>
                </div>
                <div className="text-sm text-gray-500">
                  {professionalAccounts.length} comptes • {professionalAccounts.filter(acc => acc.verification_status === 'pending').length} en attente
                </div>
              </div>

              {/* Statistiques */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">En attente</p>
                      <p className="text-3xl font-bold text-orange-600">
                        {professionalAccounts.filter(acc => acc.verification_status === 'pending').length}
                      </p>
                    </div>
                    <div className="p-3 bg-orange-100 rounded-lg">
                      <Clock className="h-6 w-6 text-orange-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Approuvés</p>
                      <p className="text-3xl font-bold text-green-600">
                        {professionalAccounts.filter(acc => acc.verification_status === 'approved').length}
                      </p>
                    </div>
                    <div className="p-3 bg-green-100 rounded-lg">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Rejetés</p>
                      <p className="text-3xl font-bold text-red-600">
                        {professionalAccounts.filter(acc => acc.verification_status === 'rejected').length}
                      </p>
                    </div>
                    <div className="p-3 bg-red-100 rounded-lg">
                      <XCircle className="h-6 w-6 text-red-600" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Liste des comptes */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="p-6 border-b border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900">Demandes de comptes professionnels</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Compte
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Entreprise
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          SIRET
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Contact
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Statut
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {professionalAccounts.map((account) => (
                        <tr key={account.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              {account.users && (
                                <>
                                  <div className="text-sm font-medium text-gray-900">{account.users.email}</div>
                                  <div className="text-xs text-gray-400">👤 {account.users.name}</div>
                                </>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{account.company_name}</div>
                              <div className="text-sm text-gray-500 truncate max-w-xs">{account.company_address}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 font-mono">{account.siret}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm text-gray-900">{account.email}</div>
                              <div className="text-sm text-gray-500">{account.phone}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              account.verification_status === 'pending'
                                ? 'bg-orange-100 text-orange-800'
                                : account.verification_status === 'approved'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {account.verification_status === 'pending' && '⏳ En attente'}
                              {account.verification_status === 'approved' && '✅ Approuvé'}
                              {account.verification_status === 'rejected' && '❌ Rejeté'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(account.created_at).toLocaleDateString('fr-FR')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                            <button
                              onClick={() => {
                                setSelectedProAccount(account);
                                loadProAccountDocuments(account.id);
                              }}
                              className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Voir
                            </button>
                            {account.verification_status === 'pending' && (
                              <div className="inline-flex space-x-1">
                                <button
                                  onClick={() => handleVerifyProAccount(account.id, 'approve')}
                                  className="inline-flex items-center px-3 py-1 border border-green-300 rounded-md text-sm text-green-700 bg-green-50 hover:bg-green-100 transition-colors"
                                >
                                  <Check className="h-4 w-4 mr-1" />
                                  Approuver
                                </button>
                                <button
                                  onClick={() => setVerificationAction({ accountId: account.id, action: 'reject' })}
                                  className="inline-flex items-center px-3 py-1 border border-red-300 rounded-md text-sm text-red-700 bg-red-50 hover:bg-red-100 transition-colors"
                                >
                                  <X className="h-4 w-4 mr-1" />
                                  Rejeter
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {professionalAccounts.length === 0 && (
                    <div className="text-center py-12">
                      <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">Aucun compte professionnel pour le moment</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Modal de détail de compte */}
              {selectedProAccount && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-semibold text-gray-900">
                        Détails du compte professionnel
                      </h3>
                      <button
                        onClick={() => {
                          setSelectedProAccount(null);
                          setProAccountDocuments([]);
                        }}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X className="h-6 w-6" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div className="space-y-4">
                        <h4 className="text-lg font-medium text-gray-900">Informations de l'entreprise</h4>
                        <div>
                          <label className="text-sm text-gray-600">Nom de l'entreprise</label>
                          <p className="font-medium">{selectedProAccount.company_name}</p>
                        </div>
                        <div>
                          <label className="text-sm text-gray-600">SIRET</label>
                          <p className="font-mono">{selectedProAccount.siret}</p>
                        </div>
                        <div>
                          <label className="text-sm text-gray-600">Adresse</label>
                          <p>{selectedProAccount.company_address}</p>
                        </div>
                        <div>
                          <label className="text-sm text-gray-600">Site web</label>
                          <p>{selectedProAccount.website || 'Non renseigné'}</p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h4 className="text-lg font-medium text-gray-900">Contact</h4>
                        <div>
                          <label className="text-sm text-gray-600">Email</label>
                          <p>{selectedProAccount.email}</p>
                        </div>
                        <div>
                          <label className="text-sm text-gray-600">Téléphone</label>
                          <p>{selectedProAccount.phone}</p>
                        </div>
                        <div>
                          <label className="text-sm text-gray-600">Utilisateur associé</label>
                          <p>{selectedProAccount.users?.name || 'Non trouvé'}</p>
                        </div>
                        <div>
                          <label className="text-sm text-gray-600">Statut</label>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            selectedProAccount.verification_status === 'pending'
                              ? 'bg-orange-100 text-orange-800'
                              : selectedProAccount.verification_status === 'approved'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {selectedProAccount.verification_status === 'pending' && '⏳ En attente'}
                            {selectedProAccount.verification_status === 'approved' && '✅ Approuvé'}
                            {selectedProAccount.verification_status === 'rejected' && '❌ Rejeté'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Documents de vérification */}
                    <div className="mb-6">
                      <h4 className="text-lg font-medium text-gray-900 mb-4">Documents de vérification</h4>
                      {proAccountDocuments.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {proAccountDocuments.map((doc) => (
                            <div key={doc.id} className="border border-gray-200 rounded-lg p-4">
                              <div className="flex items-center justify-between mb-2">
                                <h5 className="font-medium text-gray-900">
                                  {doc.document_type === 'kbis' ? 'K-bis' : 
                                   doc.document_type === 'siret' ? 'SIRET' : 'Autre'}
                                </h5>
                                <button
                                  onClick={() => handleViewDocument(doc)}
                                  className="inline-flex items-center px-2 py-1 text-sm text-blue-600 hover:text-blue-800"
                                >
                                  <ExternalLink className="h-4 w-4 mr-1" />
                                  Ouvrir
                                </button>
                              </div>
                              <p className="text-sm text-gray-600 mb-1">{doc.file_name}</p>
                              <p className="text-xs text-gray-500">
                                {(doc.file_size / 1024 / 1024).toFixed(2)} MB • 
                                {new Date(doc.upload_date).toLocaleDateString('fr-FR')}
                              </p>
                              <span className={`inline-flex px-2 py-1 text-xs rounded-full mt-2 ${
                                doc.verification_status === 'pending'
                                  ? 'bg-orange-100 text-orange-800'
                                  : doc.verification_status === 'approved'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {doc.verification_status}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500">Aucun document trouvé</p>
                      )}
                    </div>

                    {/* Actions pour compte en attente */}
                    {selectedProAccount.verification_status === 'pending' && (
                      <div className="flex space-x-4 pt-4 border-t border-gray-200">
                        <button
                          onClick={() => handleVerifyProAccount(selectedProAccount.id, 'approve')}
                          className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                        >
                          ✅ Approuver le compte
                        </button>
                        <button
                          onClick={() => setVerificationAction({ accountId: selectedProAccount.id, action: 'reject' })}
                          className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                        >
                          ❌ Rejeter le compte
                        </button>
                      </div>
                    )}

                    {/* Détails du rejet si rejeté */}
                    {selectedProAccount.verification_status === 'rejected' && selectedProAccount.rejected_reason && (
                      <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <h5 className="font-medium text-red-800 mb-2">Raison du rejet</h5>
                        <p className="text-red-700">{selectedProAccount.rejected_reason}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Modal de rejet */}
              {verificationAction?.action === 'reject' && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-lg p-6 max-w-md w-full">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Rejeter le compte professionnel
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Veuillez indiquer la raison du rejet :
                    </p>
                    <textarea
                      className="w-full p-3 border border-gray-300 rounded-lg resize-none"
                      rows={4}
                      placeholder="Raison du rejet..."
                      onChange={(e) => setVerificationAction({
                        ...verificationAction,
                        reason: e.target.value
                      })}
                    />
                    <div className="flex space-x-4 mt-4">
                      <button
                        onClick={() => setVerificationAction(null)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        Annuler
                      </button>
                      <button
                        onClick={() => {
                          if (verificationAction.reason?.trim()) {
                            handleVerifyProAccount(verificationAction.accountId, 'reject', verificationAction.reason);
                          } else {
                            alert('Veuillez indiquer une raison');
                          }
                        }}
                        className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        Confirmer le rejet
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};