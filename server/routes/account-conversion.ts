import { Router } from 'express';
import { supabaseServer } from '../supabase';
import { z } from 'zod';
import { insertProfessionalAccountSchema, insertVerificationDocumentSchema } from '../../shared/schema';
import multer from 'multer';

// Configuration multer pour upload en mémoire
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Format de fichier non autorisé. Utilisez PDF, JPG ou PNG.'));
    }
  }
});

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
router.post('/submit', upload.single('kbisDocument'), async (req, res) => {
  console.log('🚀 API /submit appelée !');
  try {
    const userId = req.headers['x-user-id'] as string;
    if (!userId) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    // DEBUG: Voir exactement ce qui arrive
    console.log('🔍 DEBUG req.body reçu:', req.body);
    console.log('🔍 DEBUG req.file:', req.file ? 'FICHIER PRÉSENT' : 'AUCUN FICHIER');
    console.log('🔍 DEBUG Object.keys(req.body):', Object.keys(req.body));
    if (req.file) {
      console.log('📄 FICHIER DÉTECTÉ:', req.file.originalname, req.file.size);
    }
    
    // Valider les données (req.body contient maintenant les champs du FormData)
    const validation = convertAccountSchema.safeParse(req.body);
    if (!validation.success) {
      console.log('❌ VALIDATION FAILED:', validation.error.errors);
      return res.status(400).json({ 
        error: 'Données invalides',
        details: validation.error.errors 
      });
    }

    const data = validation.data;
    console.log('📋 Données de conversion reçues:', data);
    console.log('📎 Fichier reçu:', req.file ? req.file.originalname : 'Aucun fichier');

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

    // Upload du document KBIS si présent
    if (req.file) {
      console.log('📤 Upload document KBIS...');
      console.log('📄 Détails fichier:', {
        name: req.file.originalname,
        type: req.file.mimetype,
        size: req.file.size,
        bufferLength: req.file.buffer.length
      });
      
      // DEBUG: Liste des buckets disponibles
      try {
        const { data: buckets, error: bucketsError } = await supabaseServer.storage.listBuckets();
        console.log('🪣 Buckets disponibles:', buckets?.map(b => b.name) || 'Erreur');
        if (bucketsError) console.log('❌ Erreur liste buckets:', bucketsError);
      } catch (e) {
        console.log('❌ Exception liste buckets:', e);
      }
      
      try {
        const fileName = `kbis-${updatedAccount.id}-${Date.now()}.${req.file.originalname.split('.').pop()}`;
        console.log('📁 Nom fichier généré:', fileName);
        console.log('🪣 Tentative upload vers bucket: verifications-documents');
        
        const { data: uploadData, error: uploadError } = await supabaseServer
          .storage
          .from('verifications-documents')
          .upload(fileName, req.file.buffer, {
            contentType: req.file.mimetype,
            upsert: false
          });

        if (uploadError) {
          console.error('❌ Erreur upload Supabase Storage:', uploadError);
          console.error('❌ Détails erreur upload:', JSON.stringify(uploadError, null, 2));
        } else {
          console.log('✅ Fichier uploadé:', uploadData.path);
          
          // Enregistrer le document dans la table
          const { error: docError } = await supabaseServer
            .from('verification_documents')
            .insert({
              professional_account_id: updatedAccount.id,
              document_type: 'kbis',
              file_url: uploadData.path,
              file_name: req.file.originalname,
              file_size: req.file.size,
              upload_date: new Date().toISOString(),
              verification_status: 'pending'
            });

          if (docError) {
            console.error('❌ Erreur enregistrement document:', docError);
            console.error('❌ Détails erreur DB:', JSON.stringify(docError, null, 2));
          } else {
            console.log('✅ Document KBIS enregistré en base de données');
          }
        }
      } catch (uploadError) {
        console.error('❌ Erreur traitement document:', uploadError);
      }
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