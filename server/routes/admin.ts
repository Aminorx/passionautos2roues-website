import { Router } from 'express';
import { supabase } from '../lib/supabase';

const router = Router();

// Middleware pour vérifier les droits admin
const requireAdmin = async (req: any, res: any, next: any) => {
  const userEmail = req.headers['x-user-email'];
  
  if (!userEmail) {
    return res.status(401).json({ error: 'Non authentifié' });
  }

  try {
    // Vérifier si l'utilisateur est admin
    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('email', userEmail)
      .single();

    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    const { data: admin } = await supabase
      .from('admins')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (!admin) {
      return res.status(403).json({ error: 'Accès refusé - Droits administrateur requis' });
    }

    (req as any).admin = admin;
    (req as any).userId = user.id;
    next();
  } catch (error) {
    console.error('Erreur vérification admin:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// GET /api/admin/users - Récupérer tous les utilisateurs
router.get('/users', requireAdmin, async (req, res) => {
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json(users);
  } catch (error) {
    console.error('Erreur récupération utilisateurs:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des utilisateurs' });
  }
});

// GET /api/admin/annonces - Récupérer toutes les annonces
router.get('/annonces', requireAdmin, async (req, res) => {
  try {
    const { data: annonces, error } = await supabase
      .from('annonces')
      .select(`
        *,
        users:user_id (
          id,
          name,
          email
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Transformer pour correspondre au format attendu
    const formattedAnnonces = annonces.map(annonce => ({
      id: annonce.id,
      title: annonce.title,
      price: annonce.price,
      status: annonce.status || 'active',
      createdAt: annonce.created_at,
      user: Array.isArray(annonce.users) ? annonce.users[0] : annonce.users
    }));

    res.json(formattedAnnonces);
  } catch (error) {
    console.error('Erreur récupération annonces:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des annonces' });
  }
});

// PATCH /api/admin/users/:id - Actions sur les utilisateurs
router.patch('/users/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { action } = req.body;

  try {
    let updateData: any = {};

    switch (action) {
      case 'activate':
        updateData = { verified: true };
        break;
      case 'suspend':
        updateData = { verified: false };
        break;
      default:
        return res.status(400).json({ error: 'Action non reconnue' });
    }

    const { error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', id);

    if (error) throw error;

    // Log de l'action admin
    await supabase
      .from('admin_logs')
      .insert({
        admin_user_id: (req as any).userId,
        action: `user_${action}`,
        target_type: 'user',
        target_id: id,
        details: { action, timestamp: new Date().toISOString() }
      });

    res.json({ success: true, message: `Utilisateur ${action === 'activate' ? 'activé' : 'suspendu'}` });
  } catch (error) {
    console.error('Erreur action utilisateur:', error);
    res.status(500).json({ error: 'Erreur lors de l\'action sur l\'utilisateur' });
  }
});

// PATCH /api/admin/annonces/:id - Actions sur les annonces
router.patch('/annonces/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { action } = req.body;

  try {
    let updateData: any = {};

    switch (action) {
      case 'approve':
        updateData = { status: 'active' };
        break;
      case 'reject':
      case 'suspend':
        updateData = { status: 'suspended' };
        break;
      default:
        return res.status(400).json({ error: 'Action non reconnue' });
    }

    const { error } = await supabase
      .from('annonces')
      .update(updateData)
      .eq('id', id);

    if (error) throw error;

    // Log de l'action admin
    await supabase
      .from('admin_logs')
      .insert({
        admin_user_id: (req as any).userId,
        action: `annonce_${action}`,
        target_type: 'annonce',
        target_id: id,
        details: { action, timestamp: new Date().toISOString() }
      });

    res.json({ success: true, message: `Annonce ${action === 'approve' ? 'approuvée' : 'suspendue'}` });
  } catch (error) {
    console.error('Erreur action annonce:', error);
    res.status(500).json({ error: 'Erreur lors de l\'action sur l\'annonce' });
  }
});

// GET /api/admin/stats - Statistiques pour le dashboard
router.get('/stats', requireAdmin, async (req, res) => {
  try {
    const [
      { count: totalUsers },
      { count: totalAnnonces },
      { count: pendingReports }
    ] = await Promise.all([
      supabase.from('users').select('*', { count: 'exact', head: true }),
      supabase.from('annonces').select('*', { count: 'exact', head: true }),
      supabase.from('reports').select('*', { count: 'exact', head: true }).eq('status', 'pending')
    ]);

    res.json({
      totalUsers: totalUsers || 0,
      totalAnnonces: totalAnnonces || 0,
      pendingReports: pendingReports || 0,
      monthlyGrowth: 12 // Placeholder - calculer réellement
    });
  } catch (error) {
    console.error('Erreur récupération stats:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des statistiques' });
  }
});

export default router;