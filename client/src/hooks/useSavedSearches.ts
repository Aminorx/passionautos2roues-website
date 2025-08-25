import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

export interface SavedSearch {
  id: string;
  name: string;
  filters: any;
  alerts_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export function useSavedSearches() {
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [loading, setLoading] = useState(false);
  const { dbUser } = useAuth();

  // Charger les recherches sauvegardées
  const loadSavedSearches = async () => {
    if (!dbUser?.id) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/saved-searches/user/${dbUser.id}`);
      if (response.ok) {
        const data = await response.json();
        setSavedSearches(data);
      }
    } catch (error) {
      console.error('Erreur chargement recherches sauvegardées:', error);
    } finally {
      setLoading(false);
    }
  };

  // Sauvegarder une nouvelle recherche
  const saveSearch = async (name: string, filters: any, alertsEnabled: boolean = false) => {
    if (!dbUser?.id) return false;
    
    try {
      const response = await fetch('/api/saved-searches/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: dbUser.id,
          name,
          filters,
          alertsEnabled
        })
      });
      
      if (response.ok) {
        await loadSavedSearches(); // Recharger la liste
        return true;
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Erreur inconnue');
      }
    } catch (error) {
      console.error('Erreur sauvegarde recherche:', error);
      throw error;
    }
  };

  // Supprimer une recherche sauvegardée
  const deleteSearch = async (searchId: string) => {
    if (!dbUser?.id) return false;
    
    try {
      const response = await fetch(`/api/saved-searches/${searchId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: dbUser.id })
      });
      
      if (response.ok) {
        setSavedSearches(prev => prev.filter(search => search.id !== searchId));
        return true;
      }
    } catch (error) {
      console.error('Erreur suppression recherche:', error);
    }
    return false;
  };

  // Activer/désactiver les alertes pour une recherche
  const toggleAlerts = async (searchId: string, alertsEnabled: boolean) => {
    if (!dbUser?.id) return false;
    
    try {
      const response = await fetch(`/api/saved-searches/${searchId}/alerts`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: dbUser.id,
          alertsEnabled
        })
      });
      
      if (response.ok) {
        setSavedSearches(prev => 
          prev.map(search => 
            search.id === searchId 
              ? { ...search, alerts_enabled: alertsEnabled }
              : search
          )
        );
        return true;
      }
    } catch (error) {
      console.error('Erreur mise à jour alertes:', error);
    }
    return false;
  };

  useEffect(() => {
    if (dbUser?.id) {
      loadSavedSearches();
    }
  }, [dbUser?.id]);

  return {
    savedSearches,
    loading,
    saveSearch,
    deleteSearch,
    toggleAlerts,
    refreshSavedSearches: loadSavedSearches
  };
}