import { Router } from 'express';
import { supabaseServer } from '../supabase';
import { requireAuth } from '../middleware/auth';
import { z } from 'zod';
import multer from 'multer';

const router = Router();

// Mettre à jour le profil utilisateur
router.put('/update/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { 
      name,
      phone, 
      whatsapp, 
      postalCode, 
      city, 
      type, 
      contactPreferences, 
      companyName, 
      address,
      website,
      siret,
      bio,
      professionalPhone,
      specialties,
      profileCompleted
    } = req.body;
    
    // Construire l'objet de mise à jour (email exclu)
    const updateData: any = {};
    
    if (name !== undefined) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (whatsapp !== undefined) updateData.whatsapp = whatsapp;
    if (postalCode !== undefined) updateData.postal_code = postalCode || null;
    if (city !== undefined) updateData.city = city;
    if (type !== undefined) updateData.type = type;
    if (contactPreferences !== undefined) updateData.contact_preferences = contactPreferences;
    if (companyName !== undefined) updateData.company_name = companyName;
    if (address !== undefined) updateData.address = address;
    if (website !== undefined) updateData.website = website;
    if (siret !== undefined) updateData.siret = siret;
    if (bio !== undefined) updateData.bio = bio;
    // Note: professionalPhone ignoré - colonne n'existe pas dans la table users
    if (specialties !== undefined) updateData.specialties = specialties;
    if (profileCompleted !== undefined) updateData.profile_completed = profileCompleted;
    
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: 'Aucune donnée à mettre à jour' });
    }
    
    const { data, error } = await supabaseServer
      .from('users')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single();
    
    if (error) {
      console.error('❌ Erreur mise à jour profil:', error);
      return res.status(500).json({ error: 'Erreur mise à jour profil' });
    }
    
    res.json(data);
    
  } catch (error) {
    console.error('❌ Erreur serveur mise à jour profil:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Obtenir le profil complet d'un utilisateur
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const { data, error } = await supabaseServer
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('❌ Erreur récupération profil:', error);
      return res.status(500).json({ error: 'Erreur récupération profil' });
    }
    
    res.json(data);
    
  } catch (error) {
    console.error('❌ Erreur serveur récupération profil:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Finaliser l'onboarding utilisateur
router.post('/complete', requireAuth, async (req: any, res) => {
  try {
    const userId = req.user.id; // ID depuis l'authentification
    console.log('🔧 Finalisation profil pour user:', userId);
    
    const { 
      name,
      phone, 
      whatsapp, 
      postalCode, 
      city, 
      type, 
      companyName, 
      address,
      website,
      siret,
      bio,
      professionalPhone,
      specialties
    } = req.body;
    
    // Construire l'objet de mise à jour avec profile_completed = true
    const updateData: any = {
      profile_completed: true // Toujours marquer comme terminé
    };
    
    if (name !== undefined) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (whatsapp !== undefined) updateData.whatsapp = whatsapp;
    if (postalCode !== undefined) updateData.postal_code = postalCode || null;
    if (city !== undefined) updateData.city = city;
    if (type !== undefined) updateData.type = type;
    if (companyName !== undefined) updateData.company_name = companyName;
    if (address !== undefined) updateData.address = address;
    if (website !== undefined) updateData.website = website;
    if (siret !== undefined) updateData.siret = siret;
    if (bio !== undefined) updateData.bio = bio;
    // Note: professionalPhone ignoré - colonne n'existe pas dans la table users
    if (specialties !== undefined) updateData.specialties = specialties;
    
    console.log('🔧 Données de mise à jour:', updateData);
    
    const { data, error } = await supabaseServer
      .from('users')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single();
    
    if (error) {
      console.error('❌ Erreur finalisation profil:', error);
      return res.status(500).json({ error: 'Erreur finalisation profil' });
    }
    
    console.log('✅ Profil utilisateur finalisé pour:', data.email);
    
    // Si c'est un compte professionnel, créer/mettre à jour professional_accounts
    if (type === 'professional') {
      console.log('🏢 Création/mise à jour compte professionnel...');
      
      // Vérifier si le compte professionnel existe déjà
      const { data: existingProAccount } = await supabaseServer
        .from('professional_accounts')
        .select('id')
        .eq('user_id', userId)
        .single();
      
      const professionalData: any = {
        user_id: userId,
        company_name: companyName || '',
        siret: siret || '',
        company_address: address || '',
        phone: professionalPhone || phone || '',
        email: data.email,
        website: website || '',
        description: bio || '',
        specialties: specialties || [],
        verification_status: 'pending',
        updated_at: new Date().toISOString()
      };
      
      if (existingProAccount) {
        // Mettre à jour
        const { error: proError } = await supabaseServer
          .from('professional_accounts')
          .update(professionalData)
          .eq('user_id', userId);
          
        if (proError) {
          console.error('❌ Erreur mise à jour compte professionnel:', proError);
        } else {
          console.log('✅ Compte professionnel mis à jour');
        }
      } else {
        // Créer
        professionalData.created_at = new Date().toISOString();
        const { error: proError } = await supabaseServer
          .from('professional_accounts')
          .insert(professionalData);
          
        if (proError) {
          console.error('❌ Erreur création compte professionnel:', proError);
        } else {
          console.log('✅ Compte professionnel créé');
        }
      }
    }
    
    res.json({ success: true, user: data });
    
  } catch (error) {
    console.error('❌ Erreur serveur finalisation profil:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

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

// Schema de validation pour l'onboarding professionnel
const completeProfileSchema = z.object({
  avatar: z.string().optional(),
  bio: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  postalCode: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
  siret: z.string().optional(),
  specialties: z.string().optional(), // JSON string
});

// POST /api/profile/complete-profile - Finaliser le profil professionnel avec KBIS optionnel
router.post('/complete-profile', upload.single('kbisDocument'), async (req, res) => {
  console.log('🚀 API /complete-profile appelée');
  try {
    // Support double authentification : x-user-id OU Bearer token
    let userId = req.headers['x-user-id'] as string;
    
    // Si pas de x-user-id, essayer avec Bearer token (Supabase Auth)
    if (!userId) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        try {
          // Vérifier le token avec Supabase
          const { data: { user }, error } = await supabaseServer.auth.getUser(token);
          if (error || !user) {
            return res.status(401).json({ error: 'Token invalide' });
          }
          userId = user.id;
        } catch (e) {
          return res.status(401).json({ error: 'Erreur vérification token' });
        }
      }
    }
    
    if (!userId) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    // Debug des données reçues
    console.log('🔍 Données reçues:', req.body);
    console.log('🔍 Fichier KBIS:', req.file ? 'PRÉSENT' : 'ABSENT');

    // Valider les données
    const validation = completeProfileSchema.safeParse(req.body);
    if (!validation.success) {
      console.log('❌ Validation échouée:', validation.error.errors);
      return res.status(400).json({
        error: 'Données invalides',
        details: validation.error.errors
      });
    }

    const data = validation.data;

    // Récupérer l'utilisateur actuel
    const { data: currentUser, error: userError } = await supabaseServer
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (userError || !currentUser) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    // Préparer les données de mise à jour utilisateur
    const userUpdateData: any = {
      profile_completed: true,
      updated_at: new Date().toISOString()
    };

    // Ajouter les champs du profil s'ils existent
    if (data.bio) userUpdateData.bio = data.bio;
    if (data.address) userUpdateData.address = data.address;
    if (data.city) userUpdateData.city = data.city;
    if (data.postalCode) userUpdateData.postal_code = data.postalCode;
    if (data.website) userUpdateData.website = data.website;
    if (data.siret) userUpdateData.siret = data.siret;

    // Parser les spécialités si présentes
    let specialties = [];
    if (data.specialties) {
      try {
        specialties = JSON.parse(data.specialties);
      } catch (e) {
        console.log('⚠️ Erreur parsing specialties, utilisation valeur par défaut');
      }
    }
    userUpdateData.specialties = specialties;

    // Mettre à jour l'utilisateur
    const { data: updatedUser, error: updateError } = await supabaseServer
      .from('users')
      .update(userUpdateData)
      .eq('id', userId)
      .select()
      .single();

    if (updateError) {
      console.error('❌ Erreur mise à jour utilisateur:', updateError);
      return res.status(500).json({ error: 'Erreur mise à jour profil' });
    }

    let professionalAccount: any = null;

    // Si c'est un compte professionnel, gérer le compte professionnel et le KBIS
    if (currentUser.type === 'professional') {
      // Créer ou mettre à jour le compte professionnel
      const professionalData = {
        user_id: userId,
        company_name: currentUser.company_name || 'Entreprise',
        siret: data.siret || currentUser.siret || null,
        company_address: data.address || currentUser.address || null,
        phone: currentUser.phone || null,
        email: currentUser.email || null,
        website: data.website || currentUser.website || null,
        verification_status: req.file ? 'pending' : 'none', // 'pending' si KBIS, 'none' sinon
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Vérifier si un compte professionnel existe déjà
      const { data: existingPro } = await supabaseServer
        .from('professional_accounts')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (existingPro) {
        // Mettre à jour
        const { data: updatedPro, error: proUpdateError } = await supabaseServer
          .from('professional_accounts')
          .update({
            ...professionalData,
            created_at: existingPro.created_at // Garder la date de création originale
          })
          .eq('id', existingPro.id)
          .select()
          .single();

        if (proUpdateError) {
          console.error('❌ Erreur mise à jour compte professionnel:', proUpdateError);
        } else {
          professionalAccount = updatedPro;
          console.log('✅ Compte professionnel mis à jour');
        }
      } else {
        // Créer
        const { data: newPro, error: proCreateError } = await supabaseServer
          .from('professional_accounts')
          .insert(professionalData)
          .select()
          .single();

        if (proCreateError) {
          console.error('❌ Erreur création compte professionnel:', proCreateError);
        } else {
          professionalAccount = newPro;
          console.log('✅ Compte professionnel créé');
        }
      }

      // Upload du document KBIS si présent
      if (req.file && professionalAccount?.id) {
        console.log('📤 Upload document KBIS...');
        try {
          const proAccountId = professionalAccount.id; // TypeScript safety
          const fileName = `kbis-${proAccountId}-${Date.now()}.${req.file.originalname.split('.').pop()}`;
          console.log('📁 Nom fichier:', fileName);

          const { data: uploadData, error: uploadError } = await supabaseServer
            .storage
            .from('vehicle-images')
            .upload(`documents/${fileName}`, req.file.buffer, {
              contentType: req.file.mimetype,
              upsert: false
            });

          if (uploadError) {
            console.error('❌ Erreur upload Supabase Storage:', uploadError);
          } else {
            console.log('✅ Fichier uploadé:', uploadData.path);

            // Enregistrer le document dans la table
            const { error: docError } = await supabaseServer
              .from('verification_documents')
              .insert({
                professional_account_id: proAccountId,
                document_type: 'kbis',
                file_url: uploadData.path,
                file_name: req.file.originalname,
                file_size: req.file.size,
                upload_date: new Date().toISOString(),
                verification_status: 'pending'
              });

            if (docError) {
              console.error('❌ Erreur enregistrement document:', docError);
            } else {
              console.log('✅ Document KBIS enregistré');
            }
          }
        } catch (uploadError) {
          console.error('❌ Erreur traitement document:', uploadError);
        }
      }
    }

    console.log('✅ Profil complété avec succès');
    res.json({
      success: true,
      user: updatedUser,
      professionalAccount
    });

  } catch (error) {
    console.error('❌ Erreur completion profil:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router;