import { Router } from 'express';
import { storage } from '../storage';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// Récupérer les recherches sauvegardées d'un utilisateur
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    console.log('🔄 Récupération recherches sauvegardées pour utilisateur:', userId);
    
    const searches = await storage.getUserSavedSearches(userId);

    console.log('✅ Recherches récupérées:', searches.length);
    res.json(searches);
    
  } catch (error) {
    console.error('❌ Erreur serveur recherches:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Sauvegarder une nouvelle recherche
router.post('/save', async (req, res) => {
  try {
    const { userId, name, filters, alertsEnabled } = req.body;
    
    console.log('🔄 Sauvegarde recherche:', { userId, name, alertsEnabled });
    
    if (!name || !filters) {
      return res.status(400).json({ error: 'Nom et filtres requis' });
    }

    const searchData = {
      id: uuidv4(),
      userId: userId,
      name,
      filters,
      alertsEnabled: alertsEnabled || false
    };

    const result = await storage.createSavedSearch(searchData);

    console.log('✅ Recherche sauvegardée:', result.id);
    res.json(result);
    
  } catch (error) {
    console.error('❌ Erreur serveur sauvegarde recherche:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Supprimer une recherche sauvegardée
router.delete('/:searchId', async (req, res) => {
  try {
    const { searchId } = req.params;
    
    console.log('🔄 Suppression recherche:', { searchId });
    
    const success = await storage.deleteSavedSearch(searchId);

    if (!success) {
      return res.status(404).json({ error: 'Recherche non trouvée' });
    }

    console.log('✅ Recherche supprimée');
    res.json({ success: true });
    
  } catch (error) {
    console.error('❌ Erreur serveur suppression recherche:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Activer/désactiver les alertes pour une recherche
router.patch('/:searchId/alerts', async (req, res) => {
  try {
    const { searchId } = req.params;
    const { alertsEnabled } = req.body;
    
    console.log('🔄 Mise à jour alertes:', { searchId, alertsEnabled });
    
    const result = await storage.updateSavedSearch(searchId, { 
      alertsEnabled: alertsEnabled
    });

    if (!result) {
      return res.status(404).json({ error: 'Recherche non trouvée' });
    }

    console.log('✅ Alertes mises à jour');
    res.json(result);
    
  } catch (error) {
    console.error('❌ Erreur serveur mise à jour alertes:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router;