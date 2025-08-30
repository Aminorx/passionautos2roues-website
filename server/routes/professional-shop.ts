import { Router } from 'express';
import { supabaseServer } from '../supabase';
import { requireAuth } from '../middleware/auth';

const router = Router();

// GET /api/professional-accounts/:id - Récupérer les détails d'un compte professionnel par ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Récupérer le compte professionnel avec l'utilisateur associé
    const { data: professionalAccount, error } = await supabaseServer
      .from('professional_accounts')
      .select(`
        id,
        company_name,
        email,
        phone,
        website,
        company_address,
        siret,
        verification_status,
        created_at,
        updated_at,
        company_logo,
        banner_image,
        brand_colors,
        description,
        specialties,
        certifications,
        users:user_id (
          id,
          name,
          email,
          avatar
        )
      `)
      .eq('id', id)
      .eq('verification_status', 'approved') // Seuls les comptes approuvés sont visibles
      .single();

    if (error || !professionalAccount) {
      return res.status(404).json({ error: 'Compte professionnel non trouvé' });
    }

    res.json(professionalAccount);
  } catch (error) {
    console.error('❌ Erreur récupération compte professionnel:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/professional-accounts/vehicles/:professionalAccountId - Récupérer les annonces d'un professionnel
router.get('/vehicles/:professionalAccountId', async (req, res) => {
  try {
    const { professionalAccountId } = req.params;

    // D'abord récupérer l'utilisateur associé au compte professionnel
    console.log('🔍 Recherche du compte professionnel ID:', professionalAccountId);
    const { data: proAccount, error: proError } = await supabaseServer
      .from('professional_accounts')
      .select('user_id')
      .eq('id', professionalAccountId)
      .eq('verification_status', 'approved')
      .single();

    if (proError || !proAccount) {
      console.log('❌ Compte professionnel non trouvé:', { professionalAccountId, proError });
      return res.status(404).json({ error: 'Compte professionnel non trouvé' });
    }

    console.log('✅ Compte professionnel trouvé, user_id:', proAccount.user_id);

    // Récupérer toutes les annonces de cet utilisateur professionnel
    console.log('🔍 Recherche des annonces pour user_id:', proAccount.user_id);
    const { data: vehicles, error: vehiclesError } = await supabaseServer
      .from('annonces')
      .select(`
        id,
        title,
        price,
        images,
        category,
        brand,
        model,
        year,
        mileage,
        location,
        created_at,
        views,
        isPremium,
        status,
        isActive
      `)
      .eq('user_id', proAccount.user_id)
      .eq('status', 'approved')
      .eq('isActive', true)
      .is('deletedAt', null)
      .order('created_at', { ascending: false });

    if (vehiclesError) {
      console.error('❌ Erreur récupération véhicules professionnels:', vehiclesError);
      return res.status(500).json({ error: 'Erreur récupération des annonces' });
    }

    console.log('🎯 Annonces trouvées:', vehicles?.length || 0);
    if (vehicles?.length > 0) {
      console.log('📋 Première annonce:', vehicles[0].title, 'ID:', vehicles[0].id);
    }

    res.json(vehicles || []);
  } catch (error) {
    console.error('❌ Erreur récupération annonces professionnelles:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/professional-accounts/customization/:userId - Récupérer la personnalisation
router.get('/customization/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const { data: professionalAccount, error } = await supabaseServer
      .from('professional_accounts')
      .select(`
        company_logo,
        banner_image,
        brand_colors,
        description,
        specialties,
        certifications
      `)
      .eq('user_id', userId)
      .eq('verification_status', 'approved')
      .single();

    if (error) {
      return res.status(404).json({ error: 'Compte professionnel non trouvé' });
    }

    res.json(professionalAccount);
  } catch (error) {
    console.error('❌ Erreur récupération personnalisation:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// PUT /api/professional-accounts/customization - Mettre à jour la personnalisation
router.put('/customization', requireAuth, async (req, res) => {
  try {
    const userId = req.user!.id;

    const { 
      company_logo, 
      banner_image, 
      brand_colors, 
      description, 
      specialties, 
      certifications 
    } = req.body;

    const { error } = await supabaseServer
      .from('professional_accounts')
      .update({
        company_logo,
        banner_image,
        brand_colors,
        description,
        specialties,
        certifications,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (error) {
      console.error('❌ Erreur mise à jour personnalisation:', error);
      return res.status(500).json({ error: 'Erreur mise à jour' });
    }

    res.json({ message: 'Personnalisation mise à jour avec succès' });
  } catch (error) {
    console.error('❌ Erreur mise à jour personnalisation:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

export { router as professionalShopRouter };