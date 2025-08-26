import React, { useState, useEffect } from 'react';
import { Car, MessageCircle, User, BarChart3, Plus, Edit, Trash2, Eye, Heart, Crown, Settings, Calendar, MapPin, Euro, TrendingUp, Award, Bell, Search, Building2, Star, Power, PowerOff, Play, Pause, X } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../hooks/useAuth';
import { useUnreadMessages } from '../hooks/useUnreadMessages';
import { useFavorites } from '../hooks/useFavorites';
import { useSavedSearches } from '../hooks/useSavedSearches';
import { Vehicle } from '../types';
import brandIcon from '@assets/Brand_1752260033631.png';
import { DeletionQuestionnaireModal } from './DeletionQuestionnaireModal';
import { ProfessionalVerificationBanner } from './ProfessionalVerificationBanner';
import { ConversionBanner } from './ConversionBanner';
import { useQuery } from '@tanstack/react-query';

interface DashboardTab {
  id: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
}

const dashboardTabs: DashboardTab[] = [
  { id: 'overview', label: 'Vue d\'ensemble', icon: <BarChart3 className="h-5 w-5" /> },
  { id: 'listings', label: 'Mes annonces', icon: <Car className="h-5 w-5" /> },
  { id: 'deleted', label: 'Annonces supprimées', icon: <Trash2 className="h-5 w-5" /> },
  { id: 'favorites', label: 'Mes favoris', icon: <Heart className="h-5 w-5" /> },
  { id: 'messages', label: 'Messages', icon: <MessageCircle className="h-5 w-5" /> },
  { id: 'profile', label: 'Mon profil', icon: <User className="h-5 w-5" /> },
  { id: 'subscription', label: 'Abonnement Pro', icon: <Building2 className="h-5 w-5" /> },
  { id: 'premium', label: 'Premium', icon: <Crown className="h-5 w-5" /> },
];

interface DashboardProps {
  initialTab?: string;
  onCreateListing?: () => void;
  onRedirectHome?: () => void;
  onRedirectToSearch?: () => void;
  setSearchFilters?: (filters: any) => void;
  setCurrentView?: (view: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ initialTab = 'overview', onCreateListing, onRedirectHome, onRedirectToSearch, setSearchFilters, setCurrentView }) => {
  const { vehicles, setVehicles, setSelectedVehicle, setSearchFilters: contextSetSearchFilters } = useApp();
  const { user, dbUser, isLoading, refreshDbUser } = useAuth();

  // Récupérer le statut de conversion seulement pour l'utilisateur connecté
  const { data: conversionStatus } = useQuery({
    queryKey: ['/api/account/conversion/status', user?.id],
    enabled: !!user?.id && !!dbUser?.id,
    retry: 1,
    queryFn: async () => {
      console.log('🔍 Récupération statut conversion pour utilisateur:', user?.id);
      const response = await fetch('/api/account/conversion/status', {
        headers: {
          'x-user-id': user?.id || '',
        },
      });
      if (!response.ok) {
        console.error('❌ Erreur API statut conversion:', response.status);
        throw new Error('Erreur lors de la récupération du statut');
      }
      const result = await response.json();
      console.log('✅ Statut conversion récupéré:', result);
      return result;
    },
  });
  const [userVehiclesWithInactive, setUserVehiclesWithInactive] = useState<Vehicle[]>([]);
  const [deletedVehicles, setDeletedVehicles] = useState<Vehicle[]>([]);
  const [vehicleToDelete, setVehicleToDelete] = useState<{id: string; title: string} | null>(null);
  const [isDeletionModalOpen, setIsDeletionModalOpen] = useState(false);
  const { unreadCount, refreshUnreadCount } = useUnreadMessages();
  const { favorites, loading: favoritesLoading, toggleFavorite, isFavorite } = useFavorites();
  const { savedSearches, loading: savedSearchesLoading, saveSearch, deleteSearch, toggleAlerts } = useSavedSearches();
  const [activeTab, setActiveTab] = useState(initialTab);
  const [editingProfile, setEditingProfile] = useState(false);
  const [favoritesSubTab, setFavoritesSubTab] = useState('listings');
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [dashboardConversations, setDashboardConversations] = useState<any[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: '',
    phone: '',
    whatsapp: '',
    postalCode: '',
    city: '',
    companyName: '',
    address: ''
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [conversionBannerDismissed, setConversionBannerDismissed] = useState(false);
  
  // Ces états sont déjà définis plus haut, pas besoin de les redéfinir

  // Hook pour la redirection - DOIT être appelé avant tout return conditionnel
  useEffect(() => {
    if (!user && !dbUser && !isLoading && onRedirectHome) {
      onRedirectHome();
    }
  }, [user, dbUser, isLoading, onRedirectHome]);

  // Récupérer les véhicules de l'utilisateur (y compris inactifs) pour le Dashboard
  useEffect(() => {
    const fetchUserVehicles = async () => {
      if (!dbUser?.id) return;
      
      try {
        const response = await fetch(`/api/vehicles/user/${dbUser.id}`, {
          cache: 'no-cache',
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });
        
        if (response.ok) {
          const userVehicles = await response.json();
          console.log('✅ Véhicules utilisateur récupérés (avec inactifs):', userVehicles.length);
          setUserVehiclesWithInactive(userVehicles);
        } else {
          console.error('❌ Erreur récupération véhicules utilisateur:', response.status);
          // Fallback vers le filtre classique
          setUserVehiclesWithInactive(vehicles.filter(v => v.userId === dbUser.id));
        }
      } catch (error) {
        console.error('❌ Erreur réseau véhicules utilisateur:', error);
        // Fallback vers le filtre classique
        setUserVehiclesWithInactive(vehicles.filter(v => v.userId === dbUser.id));
      }
    };

    fetchUserVehicles();
  }, [dbUser?.id, vehicles]);

  // Récupérer les véhicules supprimés de l'utilisateur
  useEffect(() => {
    const fetchDeletedVehicles = async () => {
      if (!dbUser?.id || activeTab !== 'deleted') return;
      
      try {
        const response = await fetch(`/api/vehicles/user/${dbUser.id}/deleted`, {
          cache: 'no-cache',
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });
        
        if (response.ok) {
          const deletedData = await response.json();
          console.log('✅ Véhicules supprimés récupérés:', deletedData.length);
          setDeletedVehicles(deletedData);
        } else {
          console.error('❌ Erreur récupération véhicules supprimés:', response.status);
        }
      } catch (error) {
        console.error('❌ Erreur lors du chargement des véhicules supprimés:', error);
      }
    };

    fetchDeletedVehicles();
  }, [dbUser?.id, activeTab]);

  // Initialiser le formulaire profil avec les données existantes
  useEffect(() => {
    if (dbUser) {
      setProfileForm({
        name: dbUser.name || '',
        phone: dbUser.phone || '',
        whatsapp: dbUser.whatsapp || '',
        postalCode: (dbUser as any).postal_code || '',
        city: dbUser.city || '',
        companyName: (dbUser as any).company_name || '',
        address: dbUser.address || ''
      });
    }
  }, [dbUser]);

  // Mettre à jour l'onglet actif quand initialTab change
  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  // Charger les messages pour le dashboard
  useEffect(() => {
    const loadDashboardMessages = async () => {
      if (!dbUser) return;
      
      try {
        const response = await fetch(`/api/messages-simple/user/${dbUser.id}`);
        if (response.ok) {
          const data = await response.json();
          setDashboardConversations(data.conversations || []);
        }
      } catch (error) {
        console.error('Erreur chargement messages dashboard:', error);
      } finally {
        setLoadingMessages(false);
      }
    };
    
    loadDashboardMessages();
  }, [dbUser]);

  // Marquer les messages comme lus quand l'utilisateur sélectionne une conversation
  useEffect(() => {
    const markMessagesAsRead = async () => {
      if (!selectedConversation || !dbUser) return;
      
      // Récupérer les IDs des messages non lus reçus par l'utilisateur actuel
      const unreadMessageIds = selectedConversation.messages
        ?.filter((msg: any) => !msg.isOwn && !msg.read)
        ?.map((msg: any) => msg.id) || [];
      
      if (unreadMessageIds.length > 0) {
        try {
          await fetch('/api/messages-simple/mark-read', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              messageIds: unreadMessageIds,
              userId: dbUser.id
            })
          });
          
          console.log('✅ Messages marqués comme lus:', unreadMessageIds.length);
          
          // Actualiser le compteur de messages non lus
          refreshUnreadCount();
        } catch (error) {
          console.error('❌ Erreur marquage messages lus:', error);
        }
      }
    };
    
    markMessagesAsRead();
  }, [selectedConversation, dbUser, refreshUnreadCount]);

  // Fonction pour sauvegarder le profil
  const handleSaveProfile = async () => {
    if (!dbUser?.id || savingProfile) return;
    
    setSavingProfile(true);
    try {
      const response = await fetch(`/api/profile/update/${dbUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileForm)
      });
      
      if (response.ok) {
        const updatedData = await response.json();
        console.log('✅ Profil sauvegardé avec succès:', updatedData);
        setEditingProfile(false);
        setProfileSuccess(true);
        // Masquer le message de succès après 3 secondes
        setTimeout(() => setProfileSuccess(false), 3000);
        // Rafraîchir les données utilisateur pour refléter les changements
        await refreshDbUser();
        // Important: Mettre à jour le formulaire local avec les nouvelles données
        setProfileForm({
          name: updatedData.name || '',
          phone: updatedData.phone || '',
          whatsapp: updatedData.whatsapp || '',
          postalCode: updatedData.postal_code || '',
          city: updatedData.city || '',
          companyName: updatedData.company_name || '',
          address: updatedData.address || ''
        });
      } else {
        const errorData = await response.json();
        console.error('❌ Erreur lors de la sauvegarde du profil:', errorData);
        alert(`Erreur lors de la sauvegarde: ${errorData.error || 'Erreur inconnue'}`);
      }
    } catch (error) {
      console.error('❌ Erreur réseau sauvegarde profil:', error);
      alert('Erreur de connexion. Veuillez réessayer.');
    } finally {
      setSavingProfile(false);
    }
  };

  // Fonction pour envoyer un message
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !dbUser || sendingMessage) return;
    
    // Utiliser la conversation sélectionnée ou la première disponible
    const activeConv = selectedConversation || (dashboardConversations[0] ? {
      id: dashboardConversations[0].id,
      other_user: dashboardConversations[0].other_user,
      vehicle_id: dashboardConversations[0].vehicle_id
    } : null);
    
    if (!activeConv) {
      console.error('❌ Aucune conversation sélectionnée');
      return;
    }
    
    console.log('📤 Envoi message:', {
      from: dbUser.id,
      to: activeConv.otherUserId || activeConv.other_user?.id,
      vehicle: activeConv.vehicleId || activeConv.vehicle_id,
      content: newMessage
    });

    setSendingMessage(true);
    try {
      const response = await fetch('/api/messages-simple/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fromUserId: dbUser.id,
          toUserId: activeConv.otherUserId || activeConv.other_user?.id,
          content: newMessage,
          vehicleId: activeConv.vehicleId || activeConv.vehicle_id
        }),
      });

      if (response.ok) {
        console.log('✅ Message envoyé avec succès');
        setNewMessage('');
        
        // Recharger immédiatement les conversations
        const refreshResponse = await fetch(`/api/messages-simple/user/${dbUser.id}`);
        if (refreshResponse.ok) {
          const data = await refreshResponse.json();
          setDashboardConversations(data.conversations || []);
          
          // Mettre à jour la conversation sélectionnée avec les nouveaux messages
          const activeConvId = selectedConversation?.id || dashboardConversations[0]?.id;
          const updatedConv = data.conversations?.find((conv: any) => conv.id === activeConvId);
          if (updatedConv) {
            // Mapper correctement les messages pour l'affichage
            const mappedConv = {
              id: updatedConv.id,
              fromUser: updatedConv.other_user.name,
              vehicleTitle: updatedConv.vehicle_title,
              vehicleId: updatedConv.vehicle_id,
              otherUserId: updatedConv.other_user.id,
              messages: updatedConv.messages?.map((msg: any) => ({
                id: msg.id,
                sender: msg.is_from_current_user ? 'Vous' : updatedConv.other_user.name,
                isOwn: msg.is_from_current_user,
                content: msg.content,
                timestamp: new Date(msg.created_at || new Date())
              })) || []
            };
            setSelectedConversation(mappedConv);
          }
          
          console.log('✅ Conversations rechargées et interface mise à jour');
        }
      } else {
        const errorText = await response.text();
        console.error('❌ Erreur envoi message:', response.status, errorText);
      }
    } catch (error) {
      console.error('Erreur envoi message:', error);
    } finally {
      setSendingMessage(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center bg-white p-12 rounded-2xl shadow-xl border border-gray-100">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <div className="animate-spin w-8 h-8 border-4 border-primary-bolt-500 border-t-transparent rounded-full"></div>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Chargement...</h2>
          <p className="text-gray-600">Accès à votre tableau de bord</p>
        </div>
      </div>
    );
  }

  if (!user && !dbUser && !isLoading) {
    return null; // Ne rien afficher pendant la redirection
  }

  // Utiliser les véhicules avec inactifs pour le Dashboard, ou fallback vers le filtre classique
  const userVehicles = userVehiclesWithInactive.length > 0 
    ? userVehiclesWithInactive 
    : vehicles.filter(v => v.userId === dbUser?.id);
  const totalViews = userVehicles.reduce((sum, v) => sum + v.views, 0);
  const totalFavorites = userVehicles.reduce((sum, v) => sum + v.favorites, 0);
  const premiumListings = userVehicles.filter(v => v.isPremium).length;

  // Fonction pour ouvrir le questionnaire de suppression
  const openDeletionModal = (vehicleId: string, vehicleTitle: string) => {
    setVehicleToDelete({ id: vehicleId, title: vehicleTitle });
    setIsDeletionModalOpen(true);
  };

  // Fonction appelée après confirmation du questionnaire
  const handleDeleteConfirmed = () => {
    if (vehicleToDelete) {
      // Supprimer de l'état local immédiatement (le soft delete a déjà été fait côté serveur)
      setVehicles(vehicles.filter(v => v.id !== vehicleToDelete.id));
      setUserVehiclesWithInactive(userVehiclesWithInactive.filter(v => v.id !== vehicleToDelete.id));
      console.log(`✅ Annonce ${vehicleToDelete.id} supprimée avec succès`);
      
      // Réinitialiser l'état
      setVehicleToDelete(null);
      setIsDeletionModalOpen(false);
    }
  };

  const handleDeleteListing = async (vehicleId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette annonce ? Cette action est irréversible.')) {
      try {
        const response = await fetch(`/api/vehicles/${vehicleId}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          // Suppression réussie, mettre à jour l'état local
          setVehicles(vehicles.filter(v => v.id !== vehicleId));
          setUserVehiclesWithInactive(userVehiclesWithInactive.filter(v => v.id !== vehicleId));
          console.log(`✅ Annonce ${vehicleId} supprimée avec succès`);
        } else {
          const errorData = await response.json();
          console.error('❌ Erreur suppression API:', errorData);
          alert('Erreur lors de la suppression de l\'annonce. Veuillez réessayer.');
        }
      } catch (error) {
        console.error('❌ Erreur lors de la suppression:', error);
        alert('Erreur de connexion. Veuillez réessayer.');
      }
    }
  };

  const handleToggleActiveListing = async (vehicleId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/annonces/${vehicleId}/toggle-active`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isActive: !currentStatus })
      });

      if (response.ok) {
        // Mettre à jour localement
        setVehicles(vehicles.map(v => 
          v.id === vehicleId 
            ? { ...v, isActive: !currentStatus }
            : v
        ));
        
        // Afficher un message de confirmation
        console.log(`Annonce ${vehicleId} ${!currentStatus ? 'activée' : 'désactivée'} avec succès`);
      } else {
        const errorData = await response.json();
        console.error('Erreur API:', errorData);
        
        // Pour l'instant, simuler le changement en attendant la correction de la DB
        setVehicles(vehicles.map(v => 
          v.id === vehicleId 
            ? { ...v, isActive: !currentStatus }
            : v
        ));
        console.log(`Changement de statut simulé pour l'annonce ${vehicleId}`);
      }
    } catch (error) {
      console.error('Erreur lors du changement de statut:', error);
      
      // Fallback: mettre à jour localement même en cas d'erreur API
      setVehicles(vehicles.map(v => 
        v.id === vehicleId 
          ? { ...v, isActive: !currentStatus }
          : v
      ));
      console.log(`Changement de statut local pour l'annonce ${vehicleId}`);
    }
  };

  const handleCreateListing = () => {
    if (onCreateListing) {
      onCreateListing();
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleConversionClick = () => {
    if (setCurrentView) {
      setCurrentView('account-conversion');
    }
  };

  const renderOverview = () => (
    <div className="space-y-8">
      {/* Conversion Banner - Affiché uniquement pour les utilisateurs individuels sans demande */}
      {conversionStatus && conversionStatus.currentType === 'individual' && 
       !conversionStatus.conversionInProgress && 
       !conversionStatus.conversionRejected && 
       !conversionStatus.professionalAccount && 
       !conversionBannerDismissed && (
        <ConversionBanner 
          onConvert={handleConversionClick} 
          conversionStatus={conversionStatus}
          onDismiss={() => setConversionBannerDismissed(true)}
        />
      )}
      
      {/* Welcome Section */}
      <div className="relative bg-gradient-to-r from-primary-bolt-500 via-primary-bolt-600 to-primary-bolt-700 rounded-2xl p-8 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24"></div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold mb-2">
                Bonjour, {dbUser?.name || user?.email?.split('@')[0]} ! 👋
              </h1>
              <p className="text-cyan-100 text-lg font-medium">
                {dbUser?.type === 'professional' 
                  ? 'Gérez votre activité professionnelle depuis votre tableau de bord'
                  : 'Bienvenue sur votre espace personnel'
                }
              </p>
            </div>
            <div className="hidden md:block">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                <Award className="h-12 w-12 text-white/80" />
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
              <span className="text-sm font-medium">Membre depuis</span>
              <p className="text-lg font-bold">
                {dbUser?.created_at ? new Date(dbUser.created_at).toLocaleDateString('fr-FR', { 
                  month: 'long', 
                  year: 'numeric' 
                }) : 'Récemment'}
              </p>
            </div>
            {(dbUser as any)?.verified && (
              <div className="bg-green-500/20 backdrop-blur-sm rounded-lg px-4 py-2 border border-green-400/30">
                <span className="text-sm font-medium text-green-100">✓ Compte vérifié</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Professional Verification Banner */}
      <ProfessionalVerificationBanner />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-gradient-to-r from-primary-bolt-500 to-primary-bolt-600 p-3 rounded-xl shadow-lg">
              <Car className="h-6 w-6 text-white" />
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-gray-900">{userVehicles.length}</p>
              <p className="text-sm text-gray-600 font-medium">Mes annonces</p>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-green-600 font-semibold text-sm bg-green-50 px-2 py-1 rounded-full">
              {userVehicles.filter(v => v.status === 'approved').length} actives
            </span>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-gradient-to-r from-green-500 to-green-600 p-3 rounded-xl shadow-lg">
              <Eye className="h-6 w-6 text-white" />
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-gray-900">{totalViews.toLocaleString()}</p>
              <p className="text-sm text-gray-600 font-medium">Vues totales</p>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600 text-sm bg-gray-50 px-2 py-1 rounded-full">
              Moy: {userVehicles.length > 0 ? Math.round(totalViews / userVehicles.length) : 0}/annonce
            </span>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-gradient-to-r from-red-500 to-pink-600 p-3 rounded-xl shadow-lg">
              <Heart className="h-6 w-6 text-white" />
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-gray-900">{totalFavorites}</p>
              <p className="text-sm text-gray-600 font-medium">Favoris</p>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-pink-600 text-sm bg-pink-50 px-2 py-1 rounded-full font-medium">
              Intérêt généré
            </span>
            <Heart className="h-4 w-4 text-pink-500" />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-3 rounded-xl shadow-lg">
              <Crown className="h-6 w-6 text-white" />
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-orange-600">{premiumListings}</p>
              <p className="text-sm text-gray-600 font-medium">Premium</p>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-orange-600 font-semibold text-sm bg-orange-50 px-2 py-1 rounded-full">
              Mises en avant
            </span>
            <Crown className="h-4 w-4 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <button 
          onClick={onCreateListing}
          className="bg-gradient-to-r from-primary-bolt-500 to-primary-bolt-600 hover:from-primary-bolt-600 hover:to-primary-bolt-700 text-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
        >
          <Plus className="h-8 w-8 mb-3" />
          <h3 className="text-lg font-semibold mb-2">Nouvelle annonce</h3>
          <p className="text-primary-bolt-100 text-sm">Publiez votre véhicule en quelques clics</p>
        </button>

        <button className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <MessageCircle className="h-8 w-8 mb-3" />
          <h3 className="text-lg font-semibold mb-2">Messages</h3>
          <p className="text-green-100 text-sm">1 nouvelle conversation</p>
        </button>

        <button className="bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <Crown className="h-8 w-8 mb-3" />
          <h3 className="text-lg font-semibold mb-2">Booster mes annonces</h3>
          <p className="text-orange-100 text-sm">Augmentez votre visibilité</p>
        </button>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Activité récente</h2>
            <button className="text-primary-bolt-500 hover:text-primary-bolt-600 font-medium text-sm">
              Voir tout
            </button>
          </div>
        </div>
        <div className="p-6">
          {userVehicles.length > 0 ? (
            <div className="space-y-4">
              {userVehicles.slice(0, 5).map((vehicle) => (
                <div key={vehicle.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-xl hover:from-primary-bolt-50 hover:to-primary-bolt-100/50 transition-all duration-200">
                  <div className="flex items-center space-x-4">
                    <div className="w-14 h-14 bg-gradient-to-r from-primary-bolt-500 to-primary-bolt-600 rounded-xl flex items-center justify-center shadow-lg">
                      <Car className="h-7 w-7 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-lg">{vehicle.title}</h3>
                      <p className="text-sm text-gray-500">
                        Créée le {new Date(vehicle.createdAt).toLocaleDateString('fr-FR')}
                      </p>
                      <div className="flex items-center space-x-3 mt-1">
                        <span className="text-xs bg-primary-bolt-100 text-primary-bolt-500 px-2 py-1 rounded-full font-medium">
                          {vehicle.views} vues
                        </span>
                        <span className="text-xs bg-pink-100 text-pink-800 px-2 py-1 rounded-full font-medium">
                          {vehicle.favorites} ❤️
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-primary-bolt-500">{formatPrice(vehicle.price)}</p>
                    {vehicle.isPremium && (
                      <span className="inline-flex items-center space-x-1 text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full font-medium">
                        <Crown className="h-3 w-3" />
                        <span>Premium</span>
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Car className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucune annonce</h3>
              <p className="text-gray-600 mb-6">Vous n'avez pas encore publié d'annonce.</p>
              <button className="bg-gradient-to-r from-primary-bolt-500 to-primary-bolt-600 hover:from-primary-bolt-600 hover:to-primary-bolt-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                Publier ma première annonce
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderListings = () => (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mes annonces</h1>
          <p className="text-gray-600 mt-2 text-lg">{userVehicles.length} annonce{userVehicles.length !== 1 ? 's' : ''} publiée{userVehicles.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex items-center space-x-4">
          <button 
            onClick={onCreateListing}
            className="bg-gradient-to-r from-primary-bolt-500 to-primary-bolt-600 hover:from-primary-bolt-600 hover:to-primary-bolt-700 text-white px-6 py-3 rounded-xl font-semibold flex items-center space-x-2 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1"
          >
            <Plus className="h-5 w-5" />
            <span>Nouvelle annonce</span>
          </button>
        </div>
      </div>

      {userVehicles.length > 0 ? (
        <div className="grid gap-8">
          {userVehicles.map((vehicle) => (
            <div key={vehicle.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300">
              <div className="md:flex">
                <div className="md:w-80 h-64 bg-gradient-to-br from-gray-200 to-gray-300 relative overflow-hidden">
                  {vehicle.images.length > 0 ? (
                    <img
                      src={vehicle.images[0]}
                      alt={vehicle.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <img 
                        src={brandIcon} 
                        alt="Brand icon" 
                        className="w-20 h-20 opacity-60"
                      />
                    </div>
                  )}
                  {vehicle.isPremium && (
                    <div className="absolute top-4 left-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center space-x-1 shadow-lg">
                      <Crown className="h-4 w-4" />
                      <span>Premium</span>
                    </div>
                  )}
                </div>
                
                <div className="flex-1 p-8">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">{vehicle.title}</h3>
                      <p className="text-3xl font-bold text-primary-bolt-500 mb-4">{formatPrice(vehicle.price)}</p>
                      <div className="flex items-center space-x-6 text-gray-600 mb-4">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-5 w-5" />
                          <span className="font-medium">{vehicle.year}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-5 w-5" />
                          <span className="font-medium">{vehicle.location}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end space-y-2">
                      <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                        vehicle.status === 'approved' 
                          ? 'bg-green-100 text-green-800 border border-green-200'
                          : vehicle.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                          : 'bg-red-100 text-red-800 border border-red-200'
                      }`}>
                        {vehicle.status === 'approved' ? '✓ Approuvée' : 
                         vehicle.status === 'pending' ? '⏳ En attente' : '❌ Rejetée'}
                      </span>
                      <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                        (vehicle as any).deletedAt
                          ? 'bg-gray-100 text-gray-800 border border-gray-200'
                          : vehicle.isActive !== false
                          ? 'bg-green-100 text-green-800 border border-green-200'
                          : 'bg-red-100 text-red-800 border border-red-200'
                      }`}>
                        {(vehicle as any).deletedAt ? '🗑️ Supprimée' : vehicle.isActive !== false ? '✅ Active' : '❌ Inactive'}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-8">
                      <div className="flex items-center space-x-2 text-gray-600">
                        <Eye className="h-5 w-5" />
                        <span className="font-semibold">{vehicle.views}</span>
                        <span className="text-sm">vues</span>
                      </div>
                      <div className="flex items-center space-x-2 text-gray-600">
                        <Heart className="h-5 w-5" />
                        <span className="font-semibold">{vehicle.favorites}</span>
                        <span className="text-sm">favoris</span>
                      </div>
                      <div className="flex items-center space-x-2 text-gray-600">
                        <MessageCircle className="h-5 w-5" />
                        <span className="font-semibold">3</span>
                        <span className="text-sm">messages</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      {/* Afficher les boutons seulement si l'annonce n'est pas supprimée */}
                      {!(vehicle as any).deletedAt && (
                        <>
                          {!vehicle.isPremium && (
                            <button className="px-6 py-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl font-semibold transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl">
                              <Crown className="h-4 w-4" />
                              <span>Promouvoir</span>
                            </button>
                          )}
                          <button 
                            onClick={() => openDeletionModal(vehicle.id, vehicle.title)}
                            className="p-3 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-16 text-center">
          <div className="w-24 h-24 bg-gradient-to-r from-primary-bolt-100 to-primary-bolt-200 rounded-full flex items-center justify-center mx-auto mb-8">
            <Car className="h-12 w-12 text-primary-bolt-500" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Aucune annonce publiée</h3>
          <p className="text-gray-600 mb-8 text-lg">Commencez dès maintenant à vendre vos véhicules ou pièces détachées.</p>
          <button 
            onClick={onCreateListing}
            className="bg-gradient-to-r from-primary-bolt-500 to-primary-bolt-600 hover:from-primary-bolt-600 hover:to-primary-bolt-700 text-white px-10 py-4 rounded-xl font-semibold flex items-center space-x-3 mx-auto shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1"
          >
            <Plus className="h-6 w-6" />
            <span>Publier une annonce</span>
          </button>
        </div>
      )}
    </div>
  );

  const renderMessages = () => {
    if (loadingMessages) {
      return (
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <MessageCircle className="h-12 w-12 text-teal-600 mx-auto mb-4 animate-pulse" />
            <p className="text-gray-600">Chargement des messages...</p>
          </div>
        </div>
      );
    }

    const messages = dashboardConversations.map((conv: any) => ({
      id: conv.id,
      fromUser: conv.other_user.name,
      vehicleTitle: conv.vehicle_title,
      vehicleId: conv.vehicle_id,
      otherUserId: conv.other_user.id,
      lastMessage: conv.last_message,
      timestamp: new Date(conv.last_message_at || new Date()),
      unread: conv.unread_count > 0,
      avatar: conv.other_user.name.split(' ').map((n: string) => n[0]).join(''),
      messages: conv.messages?.map((msg: any) => ({
        id: msg.id,
        sender: msg.is_from_current_user ? 'Vous' : conv.other_user.name,
        isOwn: msg.is_from_current_user,
        content: msg.content,
        timestamp: new Date(msg.created_at || new Date())
      })) || []
    }));

    const currentConversation = dashboardConversations[0] ? {
      id: dashboardConversations[0].id,
      fromUser: dashboardConversations[0].other_user.name,
      vehicleTitle: dashboardConversations[0].vehicle_title,
      vehicleId: dashboardConversations[0].vehicle_id,
      otherUserId: dashboardConversations[0].other_user.id,
      messages: dashboardConversations[0].messages?.map((msg: any) => ({
        id: msg.id,
        sender: msg.is_from_current_user ? 'Vous' : dashboardConversations[0].other_user.name,
        isOwn: msg.is_from_current_user,
        content: msg.content,
        timestamp: new Date(msg.created_at || new Date())
      })) || []
    } : null;

    const activeConversation = selectedConversation || currentConversation;

    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
          <p className="text-gray-600 mt-2 text-lg">Gérez vos conversations avec les acheteurs</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 min-h-[500px] max-h-[calc(100vh-300px)] mb-8">
          {/* Liste des conversations */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Conversations</h2>
            </div>
            <div className="overflow-y-auto">
              {messages.length === 0 ? (
                <div className="p-6 text-center">
                  <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Aucune conversation</p>
                  <p className="text-sm text-gray-400 mt-2">
                    Les messages des acheteurs apparaîtront ici
                  </p>
                </div>
              ) : (
                messages.map((message) => (
                <div 
                  key={message.id}
                  onClick={() => {
                    console.log('🔄 Sélection conversation:', message.id);
                    setSelectedConversation(message);
                  }}
                  className={`p-6 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                    activeConversation?.id === message.id ? 'bg-primary-bolt-50 border-r-4 border-r-primary-bolt-500' : ''
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-primary-bolt-500 to-primary-bolt-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {message.avatar}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-gray-900">{message.fromUser}</h3>
                        {message.unread && (
                          <div className="w-3 h-3 bg-primary-bolt-500 rounded-full"></div>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-1">{message.vehicleTitle}</p>
                      <p className="text-sm text-gray-500 truncate">{message.lastMessage}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {message.timestamp.toLocaleDateString('fr-FR')} à {message.timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                </div>
                ))
              )}
            </div>
          </div>

          {/* Zone de conversation */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg border border-gray-100 flex flex-col">
            {activeConversation ? (
              <div className="flex flex-col h-full">
                {/* Header de la conversation */}
                <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-primary-bolt-50 to-primary-bolt-100">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-primary-bolt-500 to-primary-bolt-600 rounded-full flex items-center justify-center text-white font-semibold">
                      PM
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{activeConversation.fromUser}</h3>
                      <p className="text-sm text-gray-600">{activeConversation.vehicleTitle}</p>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 p-6 overflow-y-auto space-y-4 max-h-[calc(100vh-400px)]">
                  {activeConversation.messages.map((msg: any) => (
                    <div 
                      key={msg.id}
                      className={`flex ${msg.isOwn ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-sm px-4 py-3 rounded-2xl ${
                        msg.isOwn 
                          ? 'bg-primary-bolt-500 text-white' 
                          : 'bg-gray-100 text-gray-900'
                      }`}>
                        {/* Nom de l'expéditeur */}
                        <p className={`text-xs font-semibold mb-1 ${
                          msg.isOwn ? 'text-primary-bolt-100' : 'text-gray-600'
                        }`}>
                          {msg.isOwn ? 'Vous' : activeConversation.fromUser}
                        </p>
                        
                        <p className="text-sm">{msg.content}</p>
                        <p className={`text-xs mt-2 ${
                          msg.isOwn ? 'text-primary-bolt-100' : 'text-gray-500'
                        }`}>
                          {msg.timestamp ? msg.timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : ''}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Zone de saisie */}
                <div className="p-6 border-t border-gray-200">
                  <div className="flex items-center space-x-4">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && !sendingMessage && handleSendMessage()}
                      placeholder="Tapez votre message..."
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-bolt-500 focus:border-primary-bolt-500"
                      disabled={sendingMessage}
                    />
                    <button 
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim() || sendingMessage}
                      className="bg-primary-bolt-500 hover:bg-primary-bolt-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-semibold transition-colors"
                    >
                      {sendingMessage ? 'Envoi...' : 'Envoyer'}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <MessageCircle className="h-10 w-10 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Sélectionnez une conversation</h3>
                  <p className="text-gray-600">Choisissez une conversation pour commencer à échanger.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderProfile = () => (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mon profil</h1>
          <p className="text-gray-600 mt-2 text-lg">Gérez vos informations personnelles</p>
        </div>
        <button
          onClick={() => setEditingProfile(!editingProfile)}
          className="bg-gradient-to-r from-primary-bolt-500 to-primary-bolt-600 hover:from-primary-bolt-600 hover:to-primary-bolt-700 text-white px-6 py-3 rounded-xl font-semibold flex items-center space-x-2 shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <Edit className="h-4 w-4" />
          <span>{editingProfile ? 'Annuler' : 'Modifier'}</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
        {/* Message de succès */}
        {profileSuccess && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center space-x-3">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-green-800 font-medium">Profil mis à jour avec succès !</p>
          </div>
        )}
        
        <div className="flex items-center space-x-8 mb-10">
          <div className="w-24 h-24 bg-gradient-to-r from-primary-bolt-500 to-primary-bolt-600 rounded-full flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-3xl">
              {(dbUser?.name || user?.email || 'U').charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900">{dbUser?.name || user?.email?.split('@')[0] || 'Utilisateur'}</h2>
            <p className="text-gray-600 text-lg mt-1">{user?.email || dbUser?.email}</p>
            <div className="flex items-center space-x-3 mt-4">
              <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                (dbUser as any)?.verified
                  ? 'bg-green-100 text-green-800 border border-green-200'
                  : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
              }`}>
                {(dbUser as any)?.verified ? '✓ Compte vérifié' : '⏳ En attente de vérification'}
              </span>
              <span className="px-4 py-2 bg-primary-bolt-100 text-primary-bolt-500 rounded-full text-sm font-semibold border border-primary-bolt-200">
                {dbUser?.type === 'professional' ? '🏢 Professionnel' : '👤 Particulier'}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Nom complet</label>
            <input
              type="text"
              value={editingProfile ? profileForm.name : (dbUser?.name || user?.email?.split('@')[0] || '')}
              onChange={(e) => setProfileForm({...profileForm, name: e.target.value})}
              disabled={!editingProfile}
              className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-bolt-500 focus:border-primary-bolt-500 disabled:bg-gray-50 text-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Email</label>
            <input
              type="email"
              value={user?.email || dbUser?.email || ''}
              disabled={true}
              className="w-full px-4 py-4 border border-gray-300 rounded-xl bg-gray-100 text-gray-600 text-lg cursor-not-allowed"
              title="L'email ne peut pas être modifié"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Téléphone</label>
            <input
              type="tel"
              value={editingProfile ? profileForm.phone : ((dbUser as any)?.phone || '')}
              onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})}
              disabled={!editingProfile}
              className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-bolt-500 focus:border-primary-bolt-500 disabled:bg-gray-50 text-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">WhatsApp</label>
            <input
              type="tel"
              value={editingProfile ? profileForm.whatsapp : ((dbUser as any)?.whatsapp || '')}
              onChange={(e) => setProfileForm({...profileForm, whatsapp: e.target.value})}
              disabled={!editingProfile}
              className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-bolt-500 focus:border-primary-bolt-500 disabled:bg-gray-50 text-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Code postal</label>
            <input
              type="text"
              value={editingProfile ? profileForm.postalCode : ((dbUser as any)?.postal_code || '')}
              onChange={(e) => setProfileForm({...profileForm, postalCode: e.target.value})}
              disabled={!editingProfile}
              className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-bolt-500 focus:border-primary-bolt-500 disabled:bg-gray-50 text-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Ville</label>
            <input
              type="text"
              value={editingProfile ? profileForm.city : ((dbUser as any)?.city || '')}
              onChange={(e) => setProfileForm({...profileForm, city: e.target.value})}
              disabled={!editingProfile}
              className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-bolt-500 focus:border-primary-bolt-500 disabled:bg-gray-50 text-lg"
            />
          </div>



          {dbUser?.type === 'professional' && (
            <div className="md:col-span-2 space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
                <h3 className="text-lg font-semibold text-blue-800 mb-3">🏢 Informations professionnelles</h3>
                <p className="text-blue-700 text-sm">Ces informations sont issues de votre demande de conversion professionnelle et ne sont pas modifiables depuis cette page.</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Nom de l'entreprise</label>
                  <input
                    type="text"
                    value={(conversionStatus as any)?.professionalAccount?.company_name || ''}
                    disabled={true}
                    className="w-full px-4 py-4 border border-gray-300 rounded-xl bg-gray-100 text-gray-700 text-lg cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Email professionnel</label>
                  <input
                    type="email"
                    value={(conversionStatus as any)?.professionalAccount?.email || ''}
                    disabled={true}
                    className="w-full px-4 py-4 border border-gray-300 rounded-xl bg-gray-100 text-gray-700 text-lg cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Téléphone professionnel</label>
                  <input
                    type="tel"
                    value={(conversionStatus as any)?.professionalAccount?.phone || ''}
                    disabled={true}
                    className="w-full px-4 py-4 border border-gray-300 rounded-xl bg-gray-100 text-gray-700 text-lg cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Site web</label>
                  <input
                    type="url"
                    value={(conversionStatus as any)?.professionalAccount?.website || ''}
                    disabled={true}
                    className="w-full px-4 py-4 border border-gray-300 rounded-xl bg-gray-100 text-gray-700 text-lg cursor-not-allowed"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Adresse de l'entreprise</label>
                  <textarea
                    value={(conversionStatus as any)?.professionalAccount?.company_address || ''}
                    disabled={true}
                    rows={3}
                    className="w-full px-4 py-4 border border-gray-300 rounded-xl bg-gray-100 text-gray-700 text-lg cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">SIRET</label>
                  <input
                    type="text"
                    value={(conversionStatus as any)?.professionalAccount?.siret || ''}
                    disabled={true}
                    className="w-full px-4 py-4 border border-gray-300 rounded-xl bg-gray-100 text-gray-700 text-lg cursor-not-allowed"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {editingProfile && (
          <div className="mt-10 flex justify-end space-x-4">
            <button
              onClick={() => {
                setEditingProfile(false);
                // Réinitialiser le formulaire avec les données originales
                setProfileForm({
                  name: dbUser?.name || '',
                  phone: dbUser?.phone || '',
                  whatsapp: dbUser?.whatsapp || '',
                  postalCode: (dbUser as any)?.postal_code || '',
                  city: dbUser?.city || '',
                  companyName: (dbUser as any)?.company_name || '',
                  address: dbUser?.address || ''
                });
              }}
              className="px-8 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-semibold"
            >
              Annuler
            </button>
            <button 
              onClick={handleSaveProfile}
              disabled={savingProfile}
              className="px-8 py-3 bg-gradient-to-r from-primary-bolt-500 to-primary-bolt-600 hover:from-primary-bolt-600 hover:to-primary-bolt-700 disabled:bg-gray-400 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {savingProfile ? 'Sauvegarde...' : 'Sauvegarder'}
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const renderSubscription = () => (
    <div className="space-y-8">
      <div className="text-center mb-12">
        <div className="w-24 h-24 bg-gradient-to-r from-blue-600 to-purple-700 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
          <Building2 className="h-12 w-12 text-white" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Abonnement Professionnel</h1>
        <p className="text-gray-600 mt-2 text-lg">Gérez votre abonnement et découvrez tous les avantages</p>
        
        {/* Boutons d'actions professionnelles */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8 max-w-4xl mx-auto">
          <button
            onClick={() => {
              if (setCurrentView) setCurrentView('pro-customization');
            }}
            className="flex items-center justify-center space-x-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1"
          >
            <Settings className="h-5 w-5" />
            <span>Personnaliser ma boutique</span>
          </button>
          
          <button
            onClick={() => {
              // Récupérer l'ID du compte professionnel pour rediriger vers la boutique publique
              if (conversionStatus?.professionalAccount?.id) {
                // Utiliser window.location pour naviguer vers la route Wouter
                window.location.href = `/pro/${conversionStatus.professionalAccount.id}`;
              }
            }}
            className="flex items-center justify-center space-x-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1"
          >
            <Eye className="h-5 w-5" />
            <span>Voir ma boutique publique</span>
          </button>
          
          <button
            onClick={() => {
              if (setCurrentView) setCurrentView('subscription-purchase');
            }}
            className="flex items-center justify-center space-x-3 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white px-6 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1"
          >
            <Crown className="h-5 w-5" />
            <span>Gérer mon abonnement</span>
          </button>
        </div>
      </div>

      {/* Avantages de l'abonnement Pro */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl border border-blue-200 p-8 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
          <Crown className="h-6 w-6 text-yellow-500 mr-3" />
          Vos avantages Pro actuels
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center mb-4">
              <div className="bg-green-100 p-2 rounded-lg">
                <Star className="h-5 w-5 text-green-600" />
              </div>
              <h3 className="ml-3 font-semibold text-gray-900">Boutique personnalisée</h3>
            </div>
            <p className="text-gray-600">Votre propre page boutique avec tous vos véhicules</p>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center mb-4">
              <div className="bg-blue-100 p-2 rounded-lg">
                <TrendingUp className="h-5 w-5 text-blue-600" />
              </div>
              <h3 className="ml-3 font-semibold text-gray-900">Visibilité premium</h3>
            </div>
            <p className="text-gray-600">Vos annonces remontent automatiquement dans les résultats</p>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center mb-4">
              <div className="bg-purple-100 p-2 rounded-lg">
                <Award className="h-5 w-5 text-purple-600" />
              </div>
              <h3 className="ml-3 font-semibold text-gray-900">Badge vérifié</h3>
            </div>
            <p className="text-gray-600">Affichez votre statut de professionnel vérifié</p>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center mb-4">
              <div className="bg-orange-100 p-2 rounded-lg">
                <Calendar className="h-5 w-5 text-orange-600" />
              </div>
              <h3 className="ml-3 font-semibold text-gray-900">Annonces illimitées</h3>
            </div>
            <p className="text-gray-600">Publiez autant d'annonces que vous le souhaitez</p>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center mb-4">
              <div className="bg-red-100 p-2 rounded-lg">
                <MessageCircle className="h-5 w-5 text-red-600" />
              </div>
              <h3 className="ml-3 font-semibold text-gray-900">Support prioritaire</h3>
            </div>
            <p className="text-gray-600">Assistance dédiée pour les professionnels</p>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center mb-4">
              <div className="bg-yellow-100 p-2 rounded-lg">
                <Euro className="h-5 w-5 text-yellow-600" />
              </div>
              <h3 className="ml-3 font-semibold text-gray-900">Tarifs préférentiels</h3>
            </div>
            <p className="text-gray-600">Réductions sur les options premium</p>
          </div>
        </div>
      </div>

      {/* Plans d'abonnement disponibles */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Choisissez votre plan d'abonnement</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Starter Pro */}
          <div className="bg-white rounded-2xl border border-gray-200 p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Starter Pro</h3>
              <div className="text-4xl font-bold text-blue-600 mb-2">19,90€</div>
              <p className="text-gray-600">par mois</p>
            </div>
            <ul className="space-y-4 mb-8">
              <li className="flex items-center space-x-3">
                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
                <span>Jusqu'à 20 annonces simultanées</span>
              </li>
              <li className="flex items-center space-x-3">
                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
                <span>Page boutique personnalisée</span>
              </li>
              <li className="flex items-center space-x-3">
                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
                <span>Badge professionnel vérifié</span>
              </li>
              <li className="flex items-center space-x-3">
                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
                <span>Support par email</span>
              </li>
            </ul>
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 px-6 rounded-xl font-semibold transition-colors">
              Choisir ce plan
            </button>
          </div>

          {/* Business Pro */}
          <div className="bg-white rounded-2xl border-2 border-orange-300 p-8 relative hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span className="bg-orange-500 text-white px-4 py-2 rounded-full text-sm font-semibold">Plus populaire</span>
            </div>
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Business Pro</h3>
              <div className="text-4xl font-bold text-orange-600 mb-2">39,90€</div>
              <p className="text-gray-600">par mois</p>
            </div>
            <ul className="space-y-4 mb-8">
              <li className="flex items-center space-x-3">
                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
                <span>Jusqu'à 50 annonces simultanées</span>
              </li>
              <li className="flex items-center space-x-3">
                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
                <span>Remontée automatique hebdomadaire</span>
              </li>
              <li className="flex items-center space-x-3">
                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
                <span>Statistiques détaillées</span>
              </li>
              <li className="flex items-center space-x-3">
                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
                <span>Support téléphonique</span>
              </li>
            </ul>
            <button className="w-full bg-orange-600 hover:bg-orange-700 text-white py-4 px-6 rounded-xl font-semibold transition-colors">
              Choisir ce plan
            </button>
          </div>

          {/* Premium Pro */}
          <div className="bg-white rounded-2xl border border-gray-200 p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Premium Pro</h3>
              <div className="text-4xl font-bold text-purple-600 mb-2">79,90€</div>
              <p className="text-gray-600">par mois</p>
            </div>
            <ul className="space-y-4 mb-8">
              <li className="flex items-center space-x-3">
                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
                <span>Annonces illimitées</span>
              </li>
              <li className="flex items-center space-x-3">
                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
                <span>Remontée quotidienne automatique</span>
              </li>
              <li className="flex items-center space-x-3">
                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
                <span>Analytics avancés</span>
              </li>
              <li className="flex items-center space-x-3">
                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
                <span>Gestionnaire de compte dédié</span>
              </li>
            </ul>
            <button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-4 px-6 rounded-xl font-semibold transition-colors">
              Choisir ce plan
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPremium = () => (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Options Premium</h1>
        <p className="text-gray-600 mt-2 text-lg">Boostez la visibilité de vos annonces</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Daily Boost */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="text-center mb-8">
            <div className="bg-gradient-to-r from-primary-bolt-500 to-primary-bolt-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Crown className="h-10 w-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Remontée quotidienne</h3>
            <div className="text-4xl font-bold text-primary-bolt-500 mb-3">2€</div>
            <p className="text-gray-600">Remontée automatique pendant 24h</p>
          </div>
          <ul className="space-y-4 mb-8">
            <li className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-primary-bolt-500 rounded-full"></div>
              <span className="font-medium">Remontée en tête de liste</span>
            </li>
            <li className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-primary-bolt-500 rounded-full"></div>
              <span className="font-medium">Badge "Urgent"</span>
            </li>
            <li className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-primary-bolt-500 rounded-full"></div>
              <span className="font-medium">Visibilité accrue</span>
            </li>
          </ul>
          <button className="w-full bg-gradient-to-r from-primary-bolt-500 to-primary-bolt-600 hover:from-primary-bolt-600 hover:to-primary-bolt-700 text-white py-4 px-6 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl">
            Choisir
          </button>
        </div>

        {/* Weekly Premium */}
        <div className="bg-white rounded-2xl shadow-lg border-2 border-orange-200 p-8 relative hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
            <span className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg">
              ⭐ Populaire
            </span>
          </div>
          <div className="text-center mb-8 mt-4">
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Crown className="h-10 w-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Pack Hebdomadaire</h3>
            <div className="text-4xl font-bold text-orange-600 mb-3">4,99€</div>
            <p className="text-gray-600">Mise en avant pendant 7 jours</p>
          </div>
          <ul className="space-y-4 mb-8">
            <li className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-orange-600 rounded-full"></div>
              <span className="font-medium">Mise en avant 7 jours</span>
            </li>
            <li className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-orange-600 rounded-full"></div>
              <span className="font-medium">Badge "Premium"</span>
            </li>
            <li className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-orange-600 rounded-full"></div>
              <span className="font-medium">Statistiques détaillées</span>
            </li>
          </ul>
          <button className="w-full bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white py-4 px-6 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl">
            Choisir
          </button>
        </div>

        {/* Monthly Pro */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="text-center mb-8">
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Crown className="h-10 w-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Pack Pro Mensuel</h3>
            <div className="text-4xl font-bold text-purple-600 mb-3">19,99€</div>
            <p className="text-gray-600">Solution complète pour pros</p>
          </div>
          <ul className="space-y-4 mb-8">
            <li className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-purple-600 rounded-full"></div>
              <span className="font-medium">10 annonces en avant</span>
            </li>
            <li className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-purple-600 rounded-full"></div>
              <span className="font-medium">Statistiques avancées</span>
            </li>
            <li className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-purple-600 rounded-full"></div>
              <span className="font-medium">Support prioritaire</span>
            </li>
          </ul>
          <button className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white py-4 px-6 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl">
            Choisir
          </button>
        </div>
      </div>

      {/* Current Premium Status */}
      {premiumListings > 0 && (
        <div className="bg-gradient-to-r from-orange-50 to-orange-100 border-2 border-orange-200 rounded-2xl p-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-4 rounded-full shadow-lg">
                <Crown className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-orange-900">
                  Statut Premium Actif
                </h3>
                <p className="text-orange-700 text-lg">
                  Vous avez {premiumListings} annonce{premiumListings > 1 ? 's' : ''} premium active{premiumListings > 1 ? 's' : ''}
                </p>
              </div>
            </div>
            <button className="bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200">
              Gérer
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const renderFavoriteListings = () => (
      <div className="space-y-6">
        {favorites.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucune annonce favorite</h3>
            <p className="text-gray-600">Ajoutez des annonces à vos favoris pour les retrouver facilement ici.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {favorites.map((listing) => (
              <div key={listing.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="relative">
                  {listing.images && listing.images.length > 0 ? (
                    <img
                      src={listing.images[0]}
                      alt={listing.title}
                      className="w-full h-48 object-cover"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                      <img 
                        src={brandIcon} 
                        alt="Brand icon" 
                        className="w-20 h-20 opacity-60"
                      />
                    </div>
                  )}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(listing.id);
                    }}
                    className="absolute top-3 right-3 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow-lg transition-colors"
                  >
                    <Heart className="h-4 w-4 fill-current" />
                  </button>
                </div>
                <div className="p-6">
                  <h3 className="font-bold text-lg text-gray-900 mb-2">{listing.title}</h3>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-primary-bolt-600">{formatPrice(listing.price)}</span>
                      <span className="text-sm text-gray-500">{listing.year}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>{listing.mileage ? `${listing.mileage.toLocaleString()} km` : 'N/A'}</span>
                      <span className="flex items-center">
                        <MapPin className="h-3 w-3 mr-1" />
                        {listing.location}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      Ajouté le {new Date(listing.createdAt).toLocaleDateString('fr-FR')}
                    </span>
                    <button 
                      onClick={() => {
                        // Trouver le véhicule complet dans la liste
                        const fullVehicle = vehicles.find(v => v.id === listing.id);
                        if (fullVehicle) {
                          setSelectedVehicle(fullVehicle);
                        }
                      }}
                      className="bg-primary-bolt-500 hover:bg-primary-bolt-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                    >
                      Voir l'annonce
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );

  const renderSavedSearches = () => {
    if (savedSearchesLoading) {
      return (
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <Search className="h-12 w-12 text-primary-bolt-600 mx-auto mb-4 animate-pulse" />
            <p className="text-gray-600">Chargement des recherches sauvegardées...</p>
          </div>
        </div>
      );
    }

    const handleExecuteSearch = (searchId: string) => {
      const search = savedSearches.find(s => s.id === searchId);
      if (search) {
        // Appliquer les filtres de recherche sauvegardée
        const searchFunction = setSearchFilters || contextSetSearchFilters;
        if (searchFunction) {
          console.log('🔍 Application des filtres de recherche sauvegardée:', search.filters);
          searchFunction(search.filters);
        }
        // Rediriger vers la page de recherche (pas la page d'accueil)
        if (onRedirectToSearch) {
          onRedirectToSearch();
        } else if (onRedirectHome) {
          // Fallback vers la page d'accueil si onRedirectToSearch n'est pas disponible
          onRedirectHome();
        }
      }
    };



    const handleDeleteSavedSearch = async (searchId: string) => {
      if (window.confirm('Êtes-vous sûr de vouloir supprimer cette recherche sauvegardée ?')) {
        try {
          await deleteSearch(searchId);
        } catch (error) {
          console.error('Erreur lors de la suppression:', error);
        }
      }
    };

    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Recherches sauvegardées</h1>
          <p className="text-gray-600 mt-2 text-lg">
            {savedSearches.length} recherche{savedSearches.length !== 1 ? 's' : ''} sauvegardée{savedSearches.length !== 1 ? 's' : ''}
          </p>
        </div>

        {savedSearches.length > 0 ? (
          <div className="grid gap-6">
            {savedSearches.map((search) => (
              <div key={search.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{search.name}</h3>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {search.filters.category && (
                        <span className="px-3 py-1 bg-primary-bolt-100 text-primary-bolt-700 rounded-full text-sm font-medium">
                          📂 {search.filters.category}
                        </span>
                      )}
                      {search.filters.subcategory && (
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                          🔖 {search.filters.subcategory}
                        </span>
                      )}
                      {search.filters.brand && (
                        <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                          🏷️ {search.filters.brand}
                        </span>
                      )}
                      {search.filters.model && (
                        <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
                          🚗 {search.filters.model}
                        </span>
                      )}
                      {(search.filters.priceFrom || search.filters.priceTo) && (
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                          💰 {search.filters.priceFrom ? formatPrice(search.filters.priceFrom) : '0'} - {search.filters.priceTo ? formatPrice(search.filters.priceTo) : '∞'}
                        </span>
                      )}
                      {(search.filters.yearFrom || search.filters.yearTo) && (
                        <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
                          📅 {search.filters.yearFrom || '1900'} - {search.filters.yearTo || new Date().getFullYear()}
                        </span>
                      )}
                      {(search.filters.mileageFrom || search.filters.mileageTo) && (
                        <span className="px-3 py-1 bg-cyan-100 text-cyan-700 rounded-full text-sm font-medium">
                          🛣️ {search.filters.mileageFrom || '0'} - {search.filters.mileageTo || '∞'} km
                        </span>
                      )}
                      {search.filters.fuelType && (
                        <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
                          ⛽ {search.filters.fuelType}
                        </span>
                      )}
                      {search.filters.condition && (
                        <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                          🔧 {search.filters.condition}
                        </span>
                      )}
                      {search.filters.location && (
                        <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                          📍 {search.filters.location}
                        </span>
                      )}
                      {search.filters.searchTerm && (
                        <span className="px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-sm font-medium">
                          🔍 "{search.filters.searchTerm}"
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">
                      Créée le {new Date(search.created_at).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => toggleAlerts(search.id, !search.alerts_enabled)}
                      className={`p-2 rounded-lg transition-all duration-200 ${
                        search.alerts_enabled
                          ? 'bg-primary-bolt-100 text-primary-bolt-600 hover:bg-primary-bolt-200'
                          : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                      }`}
                      title={search.alerts_enabled ? 'Désactiver les alertes' : 'Activer les alertes'}
                    >
                      <Bell className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      search.alerts_enabled
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {search.alerts_enabled ? '🔔 Alertes actives' : '🔕 Alertes désactivées'}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleExecuteSearch(search.id)}
                      className="px-4 py-2 bg-primary-bolt-500 hover:bg-primary-bolt-600 text-white rounded-lg font-medium transition-all duration-200 flex items-center space-x-2"
                    >
                      <Play className="h-4 w-4" />
                      <span>Exécuter</span>
                    </button>
                    <button
                      onClick={() => handleDeleteSavedSearch(search.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-16 text-center">
            <div className="w-24 h-24 bg-gradient-to-r from-primary-bolt-100 to-primary-bolt-200 rounded-full flex items-center justify-center mx-auto mb-8">
              <Search className="h-12 w-12 text-primary-bolt-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Aucune recherche sauvegardée</h3>
            <p className="text-gray-600 mb-8 text-lg">Sauvegardez vos recherches pour être alerté des nouvelles annonces.</p>
            <button 
              onClick={onRedirectHome}
              className="bg-gradient-to-r from-primary-bolt-500 to-primary-bolt-600 hover:from-primary-bolt-600 hover:to-primary-bolt-700 text-white px-10 py-4 rounded-xl font-semibold flex items-center space-x-3 mx-auto shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1"
            >
              <Search className="h-6 w-6" />
              <span>Faire une recherche</span>
            </button>
          </div>
        )}
      </div>
    );
  };

    const renderFavoriteSearches = () => (
      <div className="space-y-6">
        {savedSearches.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucune recherche favorite</h3>
            <p className="text-gray-600">Sauvegardez vos recherches pour recevoir des alertes automatiques.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {savedSearches.map((search) => (
              <div key={search.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <h3 className="font-bold text-lg text-gray-900">{search.name}</h3>
                      {search.alerts_enabled && (
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-semibold">
                          Alertes actives
                        </span>
                      )}
                    </div>
                    <div className="space-y-2 mb-4">
                      <div className="flex flex-wrap gap-2">
                        {search.filters && typeof search.filters === 'object' && Object.entries(search.filters).map(([key, value]) => (
                          <span key={key} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                            {key === 'priceMax' && `< ${formatPrice(value as number)}`}
                            {key === 'yearMin' && `À partir de ${value}`}
                            {key !== 'priceMax' && key !== 'yearMin' && String(value)}
                          </span>
                        ))}
                      </div>
                      <p className="text-sm text-gray-500">
                        Créée le {new Date(search.created_at).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => toggleAlerts(search.id, !search.alerts_enabled)}
                      className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                        search.alerts_enabled 
                          ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <Bell className="h-4 w-4 mr-1 inline" />
                      {search.alerts_enabled ? 'Alertes ON' : 'Alertes OFF'}
                    </button>
                    <button className="bg-primary-bolt-500 hover:bg-primary-bolt-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
                      Rechercher
                    </button>
                    <button 
                      onClick={() => deleteSearch(search.id)}
                      className="text-red-500 hover:text-red-600 p-2 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );

  const renderDeletedListings = () => (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Annonces supprimées ({deletedVehicles.length})
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Historique de vos annonces supprimées avec les raisons de suppression
          </p>
        </div>
      </div>
      
      {deletedVehicles.length === 0 ? (
        <div className="text-center py-12">
          <Trash2 className="h-16 w-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Aucune annonce supprimée
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Vous n'avez encore supprimé aucune annonce.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {deletedVehicles.map((vehicle) => (
            <div key={vehicle.id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm opacity-75">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                    {vehicle.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {vehicle.brand} {vehicle.model} • {vehicle.year}
                  </p>
                </div>
                <span className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 px-2 py-1 rounded-full text-xs font-medium">
                  Supprimée
                </span>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Prix :</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {vehicle.price.toLocaleString()} €
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Supprimée le :</span>
                  <span className="text-sm text-gray-900 dark:text-white">
                    {(vehicle as any).deletedAt ? new Date((vehicle as any).deletedAt).toLocaleDateString('fr-FR') : 'N/A'}
                  </span>
                </div>
              </div>
              
              {vehicle.deletionReason && (
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Raison de suppression :
                  </p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {vehicle.deletionReason}
                  </p>
                  {vehicle.deletionComment && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      "{vehicle.deletionComment}"
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderFavorites = () => {
    return (
      <div className="space-y-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          <div className="flex items-center space-x-4 mb-6">
            <div className="bg-gradient-to-r from-red-500 to-pink-600 p-4 rounded-full shadow-lg">
              <Heart className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Mes favoris</h1>
              <p className="text-gray-600 text-lg">Retrouvez tous vos contenus favoris</p>
            </div>
          </div>

          {/* Sub-tabs horizontaux */}
          <div className="flex space-x-1 bg-gray-100 rounded-xl p-1">
            <button
              onClick={() => setFavoritesSubTab('listings')}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-all duration-200 flex-1 justify-center ${
                favoritesSubTab === 'listings'
                  ? 'bg-white text-primary-bolt-600 shadow-md'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Heart className="h-4 w-4" />
              <span>Annonces favorites</span>
            </button>
            <button
              onClick={() => setFavoritesSubTab('searches')}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-all duration-200 flex-1 justify-center ${
                favoritesSubTab === 'searches'
                  ? 'bg-white text-primary-bolt-600 shadow-md'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Search className="h-4 w-4" />
              <span>Recherches sauvegardées</span>
            </button>
          </div>
        </div>

        {/* Content based on active sub-tab */}
        {favoritesSubTab === 'listings' && renderFavoriteListings()}
        {favoritesSubTab === 'searches' && renderSavedSearches()}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:w-80 flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden sticky top-24">
              <div className="p-8 border-b border-gray-200 bg-gradient-to-r from-primary-bolt-50 to-primary-bolt-100">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-primary-bolt-500 to-primary-bolt-600 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-xl">
                      {(dbUser?.name || user?.email || 'U').charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{dbUser?.name || user?.email?.split('@')[0] || 'Utilisateur'}</h3>
                    <p className="text-sm text-gray-600 font-medium">
                      {dbUser?.type === 'professional' ? '🏢 Professionnel' : '👤 Particulier'}
                    </p>
                  </div>
                </div>
              </div>
              
              <nav className="p-4">
                {dashboardTabs
                  .filter(tab => {
                    // Masquer l'onglet "Abonnement Pro" pour les utilisateurs individuels
                    if (tab.id === 'subscription' && dbUser?.type !== 'professional') {
                      return false;
                    }
                    return true;
                  })
                  .map((tab) => {
                  const badgeCount = tab.id === 'messages' ? unreadCount : (tab.badge || 0);
                  
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center justify-between px-6 py-4 rounded-xl text-left transition-all duration-200 mb-2 ${
                        activeTab === tab.id
                          ? 'bg-gradient-to-r from-primary-bolt-500 to-primary-bolt-600 text-white shadow-lg transform scale-105'
                          : 'text-gray-700 hover:bg-gray-50 hover:text-primary-bolt-500'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        {tab.icon}
                        <span className="font-semibold">{tab.label}</span>
                      </div>
                      {badgeCount > 0 && (
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                          activeTab === tab.id 
                            ? 'bg-white/20 text-white' 
                            : 'bg-red-500 text-white'
                        }`}>
                          {badgeCount}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {activeTab === 'overview' && renderOverview()}
            {activeTab === 'listings' && renderListings()}
            {activeTab === 'deleted' && renderDeletedListings()}
            {activeTab === 'favorites' && renderFavorites()}
            {activeTab === 'messages' && renderMessages()}
            {activeTab === 'profile' && renderProfile()}
            {activeTab === 'subscription' && renderSubscription()}
            {activeTab === 'premium' && (
              <div className="space-y-8">
                {/* Header Section */}
                <div className="text-center mb-12">
                  <div className="w-24 h-24 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <Crown className="h-12 w-12 text-white" />
                  </div>
                  <h1 className="text-4xl font-bold text-gray-900 mb-4">Options Premium</h1>
                  <p className="text-gray-600 mt-2 text-lg">Boostez la visibilité de vos annonces</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {/* Daily Boost */}
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="text-center mb-8">
                      <div className="bg-gradient-to-r from-primary-bolt-500 to-primary-bolt-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                        <Crown className="h-10 w-10 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-3">Remontée quotidienne</h3>
                      <div className="text-4xl font-bold text-primary-bolt-500 mb-3">0,99€</div>
                      <p className="text-gray-600">Remontée automatique pendant 24h</p>
                    </div>
                    <ul className="space-y-4 mb-8">
                      <li className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-primary-bolt-500 rounded-full"></div>
                        <span className="font-medium">Remontée en tête de liste</span>
                      </li>
                      <li className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-primary-bolt-500 rounded-full"></div>
                        <span className="font-medium">Badge "Urgent"</span>
                      </li>
                      <li className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-primary-bolt-500 rounded-full"></div>
                        <span className="font-medium">+300% de visibilité</span>
                      </li>
                    </ul>
                    <button className="w-full bg-gradient-to-r from-primary-bolt-500 to-primary-bolt-600 hover:from-primary-bolt-600 hover:to-primary-bolt-700 text-white py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl">
                      Choisir
                    </button>
                  </div>

                  {/* Weekly Premium */}
                  <div className="bg-white rounded-2xl shadow-lg border-2 border-orange-200 p-8 relative hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <span className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                        ⭐ Populaire
                      </span>
                    </div>
                    <div className="text-center mb-8 mt-4">
                      <div className="bg-gradient-to-r from-orange-500 to-orange-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                        <Crown className="h-10 w-10 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-3">Pack Hebdomadaire</h3>
                      <div className="text-4xl font-bold text-orange-600 mb-3">4,99€</div>
                      <p className="text-gray-600">Mise en avant pendant 7 jours</p>
                    </div>
                    <ul className="space-y-4 mb-8">
                      <li className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-orange-600 rounded-full"></div>
                        <span className="font-medium">Mise en avant 7 jours</span>
                      </li>
                      <li className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-orange-600 rounded-full"></div>
                        <span className="font-medium">Badge "Premium"</span>
                      </li>
                      <li className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-orange-600 rounded-full"></div>
                        <span className="font-medium">+500% de visibilité</span>
                      </li>
                      <li className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-orange-600 rounded-full"></div>
                        <span className="font-medium">Priorité dans les recherches</span>
                      </li>
                    </ul>
                    <button className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl">
                      Choisir
                    </button>
                  </div>

                  {/* Monthly VIP */}
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="text-center mb-8">
                      <div className="bg-gradient-to-r from-purple-500 to-purple-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                        <Crown className="h-10 w-10 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-3">VIP Mensuel</h3>
                      <div className="text-4xl font-bold text-purple-600 mb-3">19,90€</div>
                      <p className="text-gray-600">Visibilité maximale pendant 30 jours</p>
                    </div>
                    <ul className="space-y-4 mb-8">
                      <li className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-purple-600 rounded-full"></div>
                        <span className="font-medium">Mise en avant 30 jours</span>
                      </li>
                      <li className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-purple-600 rounded-full"></div>
                        <span className="font-medium">Badge "VIP"</span>
                      </li>
                      <li className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-purple-600 rounded-full"></div>
                        <span className="font-medium">+800% de visibilité</span>
                      </li>
                      <li className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-purple-600 rounded-full"></div>
                        <span className="font-medium">Priorité Listes et recherches</span>
                      </li>
                    </ul>
                    <button className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl">
                      Choisir
                    </button>
                  </div>
                </div>

                {/* Current Premium Status */}
                {premiumListings > 0 && (
                  <div className="bg-gradient-to-r from-orange-50 to-orange-100 border-2 border-orange-200 rounded-2xl p-8">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-6">
                        <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-4 rounded-full shadow-lg">
                          <Crown className="h-8 w-8 text-white" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-orange-900">
                            Statut Premium Actif
                          </h3>
                          <p className="text-orange-700 text-lg">
                            Vous avez {premiumListings} annonce{premiumListings > 1 ? 's' : ''} premium active{premiumListings > 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                      <button className="bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200">
                        Gérer mes options
                      </button>
                    </div>
                  </div>
                )}

                {/* Benefits Section */}
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Pourquoi choisir Premium ?</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="text-center">
                      <div className="bg-gradient-to-r from-primary-bolt-500 to-primary-bolt-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <TrendingUp className="h-8 w-8 text-white" />
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-2">Plus de visibilité</h4>
                      <p className="text-sm text-gray-600">Vos annonces apparaissent en premier dans les résultats</p>
                    </div>
                    <div className="text-center">
                      <div className="bg-gradient-to-r from-orange-500 to-orange-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Award className="h-8 w-8 text-white" />
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-2">Badge distinctif</h4>
                      <p className="text-sm text-gray-600">Un badge Premium qui attire l'attention des acheteurs</p>
                    </div>
                    <div className="text-center">
                      <div className="bg-gradient-to-r from-purple-500 to-purple-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <BarChart3 className="h-8 w-8 text-white" />
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-2">Statistiques avancées</h4>
                      <p className="text-sm text-gray-600">Suivez les performances de vos annonces en détail</p>
                    </div>
                    <div className="text-center">
                      <div className="bg-gradient-to-r from-green-500 to-green-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Bell className="h-8 w-8 text-white" />
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-2">Notifications prioritaires</h4>
                      <p className="text-sm text-gray-600">Soyez alerté en premier des nouveaux contacts</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Modal de questionnaire de suppression */}
      {vehicleToDelete && (
        <DeletionQuestionnaireModal
          isOpen={isDeletionModalOpen}
          onClose={() => {
            setIsDeletionModalOpen(false);
            setVehicleToDelete(null);
          }}
          vehicleTitle={vehicleToDelete.title}
          vehicleId={vehicleToDelete.id}
          onDeleteConfirmed={handleDeleteConfirmed}
        />
      )}
    </div>
  );
};