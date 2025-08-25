import { useState, useEffect, useRef } from 'react';
import { useAuth } from './useAuth';
import { Vehicle } from '../types';

export function useFavorites() {
  const [favorites, setFavorites] = useState<Vehicle[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const lastLoadTimeRef = useRef<number>(0);
  const { dbUser } = useAuth();

  // Charger les favoris de l'utilisateur avec cache
  const loadFavorites = async (forceReload = false) => {
    if (!dbUser?.id) return;
    
    const now = Date.now();
    const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes cache
    
    // Éviter les recharges trop fréquentes sauf si forcé
    if (!forceReload && now - lastLoadTimeRef.current < CACHE_DURATION) {
      console.log('📋 Favoris récents, pas de rechargement nécessaire');
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch(`/api/favorites/user/${dbUser.id}`);
      if (response.ok) {
        const data = await response.json();
        setFavorites(data);
        setFavoriteIds(new Set(data.map((fav: Vehicle) => fav.id)));
        lastLoadTimeRef.current = now;
        console.log('✅ Favoris rechargés:', data.length);
      }
    } catch (error) {
      console.error('Erreur chargement favoris:', error);
    } finally {
      setLoading(false);
    }
  };

  // Ajouter aux favoris avec mise à jour immédiate
  const addToFavorites = async (vehicleId: string) => {
    if (!dbUser?.id) {
      console.warn('❌ Pas d\'utilisateur connecté pour ajouter favori');
      return false;
    }
    
    console.log('🔄 Ajout favori API call:', { userId: dbUser.id, vehicleId });
    
    // Mise à jour optimiste immédiate de l'interface
    setFavoriteIds(prev => {
      const newSet = new Set([...prev, vehicleId]);
      console.log('⚡ Mise à jour optimiste favoriteIds:', Array.from(newSet));
      return newSet;
    });
    
    try {
      const response = await fetch('/api/favorites/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: dbUser.id,
          vehicleId: vehicleId
        })
      });
      
      const result = await response.json();
      console.log('📥 Réponse API ajout favori:', result);
      
      if (response.ok) {
        console.log('✅ Favori ajouté avec succès - UI déjà mise à jour');
        return true;
      } else {
        // Annuler la mise à jour optimiste en cas d'erreur
        console.error('❌ Erreur API ajout favori, annulation UI:', result);
        setFavoriteIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(vehicleId);
          return newSet;
        });
      }
    } catch (error) {
      console.error('❌ Erreur réseau ajout favori, annulation UI:', error);
      // Annuler la mise à jour optimiste en cas d'erreur
      setFavoriteIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(vehicleId);
        return newSet;
      });
    }
    return false;
  };

  // Supprimer des favoris avec mise à jour immédiate  
  const removeFromFavorites = async (vehicleId: string) => {
    if (!dbUser?.id) {
      console.warn('❌ Pas d\'utilisateur connecté pour supprimer favori');
      return false;
    }
    
    console.log('🔄 Suppression favori API call:', { userId: dbUser.id, vehicleId });
    
    // Sauvegarde pour annulation potentielle
    const previousIds = new Set(favoriteIds);
    const previousFavorites = [...favorites];
    
    // Mise à jour optimiste immédiate de l'interface
    setFavoriteIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(vehicleId);
      console.log('⚡ Mise à jour optimiste suppression favoriteIds:', Array.from(newSet));
      return newSet;
    });
    setFavorites(prev => prev.filter(fav => fav.id !== vehicleId));
    
    try {
      const response = await fetch('/api/favorites/remove', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: dbUser.id,
          vehicleId: vehicleId
        })
      });
      
      const result = await response.json();
      console.log('📥 Réponse API suppression favori:', result);
      
      if (response.ok) {
        console.log('✅ Favori supprimé avec succès - UI déjà mise à jour');
        return true;
      } else {
        // Annuler la mise à jour optimiste en cas d'erreur
        console.error('❌ Erreur API suppression favori, restauration UI:', result);
        setFavoriteIds(previousIds);
        setFavorites(previousFavorites);
      }
    } catch (error) {
      console.error('❌ Erreur réseau suppression favori, restauration UI:', error);
      // Annuler la mise à jour optimiste en cas d'erreur
      setFavoriteIds(previousIds);
      setFavorites(previousFavorites);
    }
    return false;
  };

  // Basculer favori
  const toggleFavorite = async (vehicleId: string) => {
    const isCurrentlyFavorite = favoriteIds.has(vehicleId);
    console.log('🔄 Toggle favori - état actuel:', isCurrentlyFavorite);
    
    if (isCurrentlyFavorite) {
      console.log('➖ Suppression du favori...');
      return await removeFromFavorites(vehicleId);
    } else {
      console.log('➕ Ajout du favori...');
      return await addToFavorites(vehicleId);
    }
  };

  // Vérifier si un véhicule est en favori
  const isFavorite = (vehicleId: string) => {
    const isInFavorites = favoriteIds.has(vehicleId);
    console.log('🔍 isFavorite check pour', vehicleId, ':', isInFavorites, 'dans', Array.from(favoriteIds));
    return isInFavorites;
  };

  useEffect(() => {
    if (dbUser?.id) {
      // Délai pour éviter les appels trop rapides lors du changement d'état
      const timer = setTimeout(() => {
        loadFavorites();
      }, 100);
      
      return () => clearTimeout(timer);
    } else {
      // Réinitialiser l'état si aucun utilisateur connecté
      setFavorites([]);
      setFavoriteIds(new Set());
      console.log('🔄 Réinitialisation favoris - aucun utilisateur');
    }
  }, [dbUser?.id]);

  return {
    favorites,
    favoriteIds,
    loading,
    addToFavorites,
    removeFromFavorites,
    toggleFavorite,
    isFavorite,
    refreshFavorites: loadFavorites
  };
}