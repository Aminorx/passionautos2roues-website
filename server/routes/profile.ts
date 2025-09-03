import { Router } from 'express';
import { supabaseServer } from '../supabase';
import { requireAuth } from '../middleware/auth';

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
        // verification_status et membership utilisent les valeurs par défaut du schéma
        // verification_status: 'not_verified' (par défaut)
        // membership: 'free' (par défaut)
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

export default router;