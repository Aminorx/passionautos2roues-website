// Routes pour synchronisation manuelle des utilisateurs
import { Router } from 'express';
import { supabaseServer } from '../supabase.js';

const router = Router();

// Endpoint pour synchroniser un utilisateur après inscription/connexion
router.post('/sync', async (req, res) => {
  try {
    const { userId, userData } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'userId required' });
    }
    
    console.log(`🔄 Synchronisation manuelle utilisateur: ${userId}`);
    
    // 1. Récupérer les données depuis auth.users
    const { data: authUser, error: authError } = await supabaseServer.auth.admin.getUserById(userId);
    
    if (authError || !authUser.user) {
      console.error('❌ Utilisateur auth introuvable:', authError);
      return res.status(404).json({ error: 'Auth user not found' });
    }
    
    const user = authUser.user;
    const metadata = user.user_metadata || {};
    
    // 2. Synchroniser dans public.users
    const { data: syncedUser, error: userError } = await supabaseServer
      .from('users')
      .upsert({
        id: user.id,
        email: user.email || '',
        name: metadata.name || metadata.full_name || user.email?.split('@')[0] || 'Utilisateur',
        type: metadata.type || 'individual',
        phone: metadata.phone || null,
        company_name: metadata.companyName || null,
        created_at: user.created_at,
        email_verified: user.email_confirmed_at ? true : false
      })
      .select()
      .single();
      
    if (userError) {
      console.error('❌ Erreur sync users:', userError);
      return res.status(500).json({ error: 'Failed to sync user' });
    }
    
    // 3. Synchroniser dans profiles
    const { data: profile, error: profileError } = await supabaseServer
      .from('profiles')
      .upsert({
        id: user.id,
        account_type: metadata.type || 'individual',
        phone: metadata.phone || null,
        onboarding_completed: false, // Nouveau utilisateur
        marketing_consent: metadata.acceptNewsletter || false,
        created_at: user.created_at
      })
      .select()
      .single();
      
    if (profileError) {
      console.error('❌ Erreur sync profiles:', profileError);
      return res.status(500).json({ error: 'Failed to sync profile' });
    }
    
    console.log(`✅ Utilisateur synchronisé: ${syncedUser.name}`);
    
    res.json({
      success: true,
      user: syncedUser,
      profile: profile
    });
    
  } catch (error) {
    console.error('❌ Erreur synchronisation:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Endpoint pour vérifier le statut de synchronisation
router.get('/status/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Vérifier dans public.users
    const { data: user } = await supabaseServer
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
      
    // Vérifier dans profiles
    const { data: profile } = await supabaseServer
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
      
    res.json({
      synced: !!user,
      hasProfile: !!profile,
      user,
      profile
    });
    
  } catch (error) {
    console.error('❌ Erreur status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;