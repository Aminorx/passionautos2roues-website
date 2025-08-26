import { Router } from 'express';
import { supabaseServer } from '../supabase';
import { z } from 'zod';
import { insertProfessionalAccountSchema, insertVerificationDocumentSchema } from '../../shared/schema';

const router = Router();

// Validation schema pour les données de conversion
const convertAccountSchema = z.object({
  companyName: z.string().min(2, 'Le nom de l\'entreprise doit faire au moins 2 caractères'),
  siret: z.string().regex(/^\d{14}$/, 'Le SIRET doit contenir exactement 14 chiffres'),
  companyAddress: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  website: z.string().url().optional().or(z.literal('')),
});

// GET /api/account/conversion/status - Obtenir le statut de conversion
router.get('/status', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    if (!userId) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    // Récupérer l'utilisateur
    const { data: user, error: userError } = await supabaseServer
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    // Récupérer le compte professionnel s'il existe
    const { data: professionalAccount, error: proError } = await supabaseServer
      .from('professional_accounts')
      .select('*')
      .eq('user_id', userId)
      .single();

    const status = {
      currentType: user.type,
      canConvert: user.type === 'individual',
      professionalAccount: professionalAccount || null,
      conversionInProgress: !!professionalAccount && professionalAccount.verification_status === 'pending',
      conversionApproved: !!professionalAccount && professionalAccount.verification_status === 'approved',
      conversionRejected: !!professionalAccount && professionalAccount.verification_status === 'rejected',
      rejectionReason: professionalAccount?.rejected_reason || null,
    };

    res.json(status);

  } catch (error) {
    console.error('❌ Erreur récupération statut conversion:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST /api/account/conversion/start - Démarrer ou continuer une conversion
router.post('/start', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    if (!userId) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    // Vérifier que l'utilisateur est de type 'individual'
    const { data: user, error: userError } = await supabaseServer
      .from('users')
      .select('type')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    if (user.type !== 'individual') {
      return res.status(400).json({ error: 'Conversion non autorisée pour ce type de compte' });
    }

    // Vérifier s'il existe déjà un compte professionnel
    const { data: existingAccount, error: existingError } = await supabaseServer
      .from('professional_accounts')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (existingAccount) {
      // Retourner le compte existant
      return res.json({ professionalAccount: existingAccount, message: 'Conversion déjà initiée' });
    }

    // Créer un nouveau compte professionnel en mode brouillon
    const newAccount = {
      user_id: userId,
      company_name: '',
      verification_status: 'pending' as const,
      is_verified: false,
    };

    const { data: professionalAccount, error: createError } = await supabaseServer
      .from('professional_accounts')
      .insert(newAccount)
      .select()
      .single();

    if (createError) {
      console.error('❌ Erreur création compte professionnel:', createError);
      return res.status(500).json({ error: 'Erreur création compte professionnel' });
    }

    res.json({ professionalAccount, message: 'Conversion initiée avec succès' });

  } catch (error) {
    console.error('❌ Erreur démarrage conversion:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST /api/account/conversion/submit - Soumettre les données de conversion
router.post('/submit', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    if (!userId) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    // Valider les données
    const validation = convertAccountSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ 
        error: 'Données invalides',
        details: validation.error.errors 
      });
    }

    const data = validation.data;

    // Récupérer le compte professionnel existant
    const { data: existingAccount, error: fetchError } = await supabaseServer
      .from('professional_accounts')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (fetchError || !existingAccount) {
      return res.status(404).json({ error: 'Aucune conversion en cours. Veuillez démarrer la conversion d\'abord.' });
    }

    if (existingAccount.verification_status === 'approved') {
      return res.status(400).json({ error: 'Compte déjà vérifié et approuvé' });
    }

    // Mettre à jour le compte professionnel
    const { data: updatedAccount, error: updateError } = await supabaseServer
      .from('professional_accounts')
      .update({
        company_name: data.companyName,
        siret: data.siret,
        company_address: data.companyAddress,
        phone: data.phone,
        email: data.email,
        website: data.website,
        verification_status: 'pending',
        updated_at: new Date().toISOString(),
      })
      .eq('id', existingAccount.id)
      .select()
      .single();

    if (updateError) {
      console.error('❌ Erreur mise à jour compte professionnel:', updateError);
      return res.status(500).json({ error: 'Erreur mise à jour compte professionnel' });
    }

    res.json({ 
      professionalAccount: updatedAccount, 
      message: 'Demande de conversion soumise avec succès. Elle sera examinée par notre équipe.' 
    });

  } catch (error) {
    console.error('❌ Erreur soumission conversion:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Validation SIRET côté serveur
function validateSiret(siret: string): boolean {
  // Vérifier le format (14 chiffres)
  if (!/^\d{14}$/.test(siret)) {
    return false;
  }

  // Validation Luhn adaptée pour SIRET
  const siren = siret.substring(0, 9);
  const nic = siret.substring(9, 14);
  
  // Validation SIREN (algorithme Luhn)
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    let digit = parseInt(siren[i]);
    if (i % 2 === 1) { // Positions paires (en commençant par 0)
      digit *= 2;
      if (digit > 9) {
        digit = Math.floor(digit / 10) + (digit % 10);
      }
    }
    sum += digit;
  }
  
  return sum % 10 === 0;
}

export default router;