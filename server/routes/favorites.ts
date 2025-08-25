import { Router } from 'express';
import { storage } from '../storage';

const router = Router();

// Récupérer les favoris d'un utilisateur
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    console.log('🔄 Récupération favoris pour utilisateur:', userId);
    
    // Utiliser la nouvelle méthode getUserFavorites qui fait le JOIN
    const favorites = await storage.getUserFavorites(userId);

    console.log('✅ Favoris récupérés:', favorites.length);
    res.json(favorites);
    
  } catch (error) {
    console.error('❌ Erreur serveur favoris:', error);
    console.error('❌ Stack trace:', error.stack);
    console.error('❌ Message détaillé:', error.message);
    res.status(500).json({ error: 'Erreur serveur', details: error.message });
  }
});

// Ajouter un véhicule aux favoris
router.post('/add', async (req, res) => {
  try {
    const { userId, vehicleId } = req.body;
    
    console.log('🔄 Ajout favori:', { userId, vehicleId });
    
    const wishlistItem = {
      userId,
      vehicleId
    };
    const result = await storage.addToWishlist(wishlistItem);

    console.log('✅ Favori ajouté');
    res.json({ success: true, id: result.id });
    
  } catch (error) {
    console.error('❌ Erreur serveur ajout favori:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Supprimer un véhicule des favoris
router.delete('/remove', async (req, res) => {
  try {
    const { userId, vehicleId } = req.body;
    
    console.log('🔄 Suppression favori:', { userId, vehicleId });
    
    await storage.removeFromWishlist(userId, vehicleId);

    console.log('✅ Favori supprimé');
    res.json({ success: true });
    
  } catch (error) {
    console.error('❌ Erreur serveur suppression favori:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router;