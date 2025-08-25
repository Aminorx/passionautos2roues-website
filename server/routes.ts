import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import wishlistRoutes from "./routes/wishlist";
import savedSearchRoutes from "./routes/saved-searches";
import adminRoutes from "./routes/admin";
import messagingRoutes from "./routes/messaging";
import messagingSimpleRoutes from "./routes/messages-simple";
import conversationsRoutes from "./routes/conversations";
import profileRoutes from "./routes/profile";
import favoritesRoutes from "./routes/favorites";
import imagesRoutes from "./routes/images";
import authSyncRoutes from "./routes/auth-sync";
import { setupWishlistMigration } from "./routes/wishlist-migration.js";
import { setupWishlistDirect } from "./routes/wishlist-direct.js";
import { ensureUserExists, createUserFromAuth } from "./auth-hooks";
import { supabaseServer } from "./supabase";
import multer from 'multer';

// Configuration multer pour upload en mémoire
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Users API
  app.get("/api/users", async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  app.get("/api/users/:id", async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  app.get("/api/users/by-email/:email", async (req, res) => {
    try {
      const email = decodeURIComponent(req.params.email);
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      console.error("Error fetching user by email:", error);
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  // Test endpoint to see available user emails
  app.get("/api/users/emails", async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      const emails = users.map(user => ({
        email: user.email,
        name: user.name,
        type: user.type
      }));
      res.json(emails);
    } catch (error) {
      console.error("Error fetching user emails:", error);
      res.status(500).json({ error: "Failed to fetch user emails" });
    }
  });

  // Endpoint pour synchroniser un utilisateur Supabase Auth avec la table users
  app.post('/api/users/sync-auth', async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.status(401).json({ error: 'Authorization header required' });
      }

      // Vérifier le token Supabase Auth
      const token = authHeader.replace('Bearer ', '');
      const { data: { user }, error: authError } = await supabaseServer.auth.getUser(token);
      
      if (authError || !user) {
        return res.status(401).json({ error: 'Invalid token' });
      }

      // Utiliser le hook intelligent pour créer/synchroniser
      const syncedUser = await createUserFromAuth(user.id, user.email || '', user.user_metadata);
      res.status(200).json({ message: 'User synchronized successfully', user: syncedUser });
    } catch (error) {
      console.error("Error syncing user:", error);
      res.status(500).json({ error: "Failed to sync user" });
    }
  });

  // Vehicles API - only active vehicles for public site
  app.get("/api/vehicles", async (req, res) => {
    try {
      // Disable caching to always get fresh data
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      
      const vehicles = await storage.getAllVehicles();
      res.json(vehicles);
    } catch (error) {
      console.error("Error fetching vehicles:", error);
      res.status(500).json({ error: "Failed to fetch vehicles" });
    }
  });

  // Get vehicles by specific user (includes inactive for dashboard)
  app.get("/api/vehicles/user/:userId", async (req, res) => {
    try {
      const userVehicles = await storage.getVehiclesByUser(req.params.userId);
      res.json(userVehicles);
    } catch (error) {
      console.error("Error fetching user vehicles:", error);
      res.status(500).json({ error: "Failed to fetch user vehicles" });
    }
  });

  // Get deleted vehicles by specific user
  app.get("/api/vehicles/user/:userId/deleted", async (req, res) => {
    try {
      const deletedVehicles = await storage.getDeletedVehiclesByUser(req.params.userId);
      res.json(deletedVehicles);
    } catch (error) {
      console.error("Error fetching deleted user vehicles:", error);
      res.status(500).json({ error: "Failed to fetch deleted user vehicles" });
    }
  });

  app.get("/api/vehicles/:id", async (req, res) => {
    try {
      const vehicle = await storage.getVehicleWithUser(req.params.id);
      if (!vehicle) {
        return res.status(404).json({ error: "Vehicle not found" });
      }
      res.json(vehicle);
    } catch (error) {
      console.error("Error fetching vehicle:", error);
      res.status(500).json({ error: "Failed to fetch vehicle" });
    }
  });

  app.post("/api/vehicles/search", async (req, res) => {
    try {
      const filters = req.body;
      const vehicles = await storage.searchVehicles(filters);
      res.json(vehicles);
    } catch (error) {
      console.error("Error searching vehicles:", error);
      res.status(500).json({ error: "Failed to search vehicles" });
    }
  });

  // NOUVEAU : Synchronisation immédiate après inscription
  app.post("/api/users/sync-from-signup", async (req, res) => {
    try {
      const { authUserId, email, metadata } = req.body;

      if (!authUserId || !email) {
        return res.status(400).json({ error: "authUserId et email requis" });
      }

      console.log('🔄 Sync immédiate demandée pour:', email, '(ID:', authUserId, ')');

      // Vérifier si l'utilisateur existe déjà
      const existingUser = await storage.getUser(authUserId);
      if (existingUser) {
        console.log('✅ Utilisateur existant trouvé:', existingUser.name);
        return res.json({ user: existingUser, created: false });
      }

      // Créer l'utilisateur avec les métadonnées d'inscription
      const userData = {
        id: authUserId,
        email: email,
        name: metadata?.name || extractNameFromEmail(email),
        type: metadata?.type || 'individual',
        phone: metadata?.phone || null,
        whatsapp: metadata?.phone || null,
        companyName: metadata?.companyName || null,
        city: null,
        postal_code: null,
        email_verified: false, // Pas encore confirmé
      };

      const newUser = await storage.createUser(userData);
      console.log('✅ Utilisateur synchronisé immédiatement:', newUser.name, `(${newUser.type})`);

      res.json({ user: newUser, created: true });
    } catch (error) {
      console.error('❌ Erreur sync immédiate:', error);
      res.status(500).json({ error: "Erreur de synchronisation" });
    }
  });

  // Helper function pour extraire nom depuis email
  function extractNameFromEmail(email: string): string {
    const localPart = email.split('@')[0];
    return localPart
      .replace(/[._]/g, ' ')
      .split(' ')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join(' ') || 'Utilisateur';
  }

  app.post("/api/vehicles", async (req, res) => {
    try {
      const vehicleData = req.body;
      console.log("🔍 DONNÉES REÇUES PAR L'API:", JSON.stringify(vehicleData, null, 2));
      
      // Vérifier si l'utilisateur existe, sinon le créer automatiquement
      if (vehicleData.userId) {
        const userExists = await ensureUserExists(
          vehicleData.userId, 
          vehicleData.contact?.email || vehicleData.contact_email
        );
        
        if (!userExists) {
          // Tentative de création avec données de contact
          const contactEmail = vehicleData.contact?.email || vehicleData.contact_email || 'user@example.com';
          const contactPhone = vehicleData.contact?.phone || vehicleData.contact_phone || '';
          const city = vehicleData.location?.city || vehicleData.location || '';
          const postalCode = vehicleData.location?.postalCode || vehicleData.postal_code || null;
          
          await createUserFromAuth(vehicleData.userId, contactEmail, {
            phone: contactPhone,
            city: city,
            postal_code: postalCode
          });
        }
      }
      
      const vehicle = await storage.createVehicle(vehicleData);
      res.status(201).json(vehicle);
    } catch (error) {
      console.error("Error creating vehicle:", error);
      res.status(500).json({ error: "Failed to create vehicle" });
    }
  });

  app.put("/api/vehicles/:id", async (req, res) => {
    try {
      const updates = req.body;
      const vehicle = await storage.updateVehicle(req.params.id, updates);
      if (!vehicle) {
        return res.status(404).json({ error: "Vehicle not found" });
      }
      res.json(vehicle);
    } catch (error) {
      console.error("Error updating vehicle:", error);
      res.status(500).json({ error: "Failed to update vehicle" });
    }
  });

  // Toggle vehicle active status
  app.patch('/api/annonces/:id/toggle-active', async (req, res) => {
    try {
      const { id } = req.params;
      const { isActive } = req.body;
      
      const success = await storage.updateVehicleActiveStatus(id, isActive);
      
      if (!success) {
        return res.status(500).json({ error: 'Erreur lors du changement de statut' });
      }

      res.json({ success: true, isActive });
    } catch (error) {
      console.error('❌ Erreur changement statut:', error);
      res.status(500).json({ error: 'Erreur interne du serveur' });
    }
  });

  // Soft delete avec questionnaire
  app.post("/api/vehicles/:id/delete-with-reason", async (req, res) => {
    try {
      const { reason, comment } = req.body;
      
      if (!reason) {
        return res.status(400).json({ error: "Reason is required" });
      }

      // Valider les raisons acceptées
      const validReasons = ['sold_on_site', 'sold_elsewhere', 'no_longer_selling', 'other'];
      if (!validReasons.includes(reason)) {
        return res.status(400).json({ error: "Invalid deletion reason" });
      }

      const success = await storage.softDeleteVehicleWithReason(req.params.id, reason, comment);
      if (!success) {
        return res.status(404).json({ error: "Vehicle not found or could not be deleted" });
      }
      
      res.json({ 
        success: true, 
        message: "Vehicle soft deleted successfully",
        reason,
        deletedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error soft deleting vehicle:", error);
      res.status(500).json({ error: "Failed to soft delete vehicle" });
    }
  });

  app.delete("/api/vehicles/:id", async (req, res) => {
    try {
      const success = await storage.deleteVehicle(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Vehicle not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting vehicle:", error);
      res.status(500).json({ error: "Failed to delete vehicle" });
    }
  });

  // Get all vehicles for admin (includes inactive) - placed after specific routes
  app.get("/api/admin/vehicles", async (req, res) => {
    try {
      const vehicles = await storage.getAllVehiclesAdmin();
      res.json(vehicles);
    } catch (error) {
      console.error("Error fetching admin vehicles:", error);
      res.status(500).json({ error: "Failed to fetch admin vehicles" });
    }
  });

  // Messages API
  app.get("/api/vehicles/:vehicleId/messages", async (req, res) => {
    try {
      const messages = await storage.getMessagesByVehicle(req.params.vehicleId);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  app.get("/api/users/:userId/messages", async (req, res) => {
    try {
      const messages = await storage.getMessagesByUser(req.params.userId);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching user messages:", error);
      res.status(500).json({ error: "Failed to fetch user messages" });
    }
  });

  app.post("/api/messages", async (req, res) => {
    try {
      const messageData = req.body;
      console.log("📩 Tentative de création de message:", JSON.stringify(messageData, null, 2));
      
      // Validation basique mais flexible
      const hasFromId = messageData.from_user_id || messageData.fromUserId;
      const hasToId = messageData.to_user_id || messageData.toUserId;
      const hasVehicleId = messageData.annonce_id || messageData.vehicleId;
      
      if (!messageData.id || !hasFromId || !hasToId || !hasVehicleId || !messageData.content) {
        console.error("❌ Données de message incomplètes:", messageData);
        return res.status(400).json({ 
          error: "Message data incomplete", 
          details: "Champs requis manquants", 
          missingFields: {
            id: !messageData.id,
            fromId: !hasFromId,
            toId: !hasToId,
            vehicleId: !hasVehicleId,
            content: !messageData.content
          }
        });
      }
      
      try {
        // Vérifier si les IDs utilisateurs existent
        const fromUserCheck = await supabaseServer.from('users').select('id').eq('id', messageData.from_user_id || messageData.fromUserId).single();
        if (fromUserCheck.error) {
          console.error("❌ Utilisateur expéditeur non trouvé:", fromUserCheck.error);
          return res.status(400).json({ error: "L'utilisateur expéditeur n'existe pas", details: fromUserCheck.error.message });
        }
        
        const toUserCheck = await supabaseServer.from('users').select('id').eq('id', messageData.to_user_id || messageData.toUserId).single();
        if (toUserCheck.error) {
          console.error("❌ Utilisateur destinataire non trouvé:", toUserCheck.error);
          return res.status(400).json({ error: "L'utilisateur destinataire n'existe pas", details: toUserCheck.error.message });
        }
        
        // Vérifier si l'annonce existe
        const vehicleId = messageData.annonce_id || messageData.vehicleId;
        const vehicleCheck = await supabaseServer.from('annonces').select('id').eq('id', vehicleId).single();
        if (vehicleCheck.error) {
          console.error("❌ Annonce non trouvée:", vehicleCheck.error);
          return res.status(400).json({ error: "L'annonce n'existe pas", details: vehicleCheck.error.message });
        }
      } catch (checkError) {
        console.error("❌ Erreur lors de la vérification des références:", checkError);
      }
      
      const message = await storage.createMessage(messageData);
      console.log("✅ Message créé avec succès:", message.id);
      res.status(201).json(message);
    } catch (error: any) {
      console.error("❌ Error creating message:", error.message);
      console.error("Stack trace:", error.stack);
      
      if (error.message.includes('duplicate key')) {
        res.status(409).json({ error: "Duplicate message ID", message: error.message });
      } else if (error.message.includes('foreign key constraint')) {
        res.status(400).json({ error: "Référence invalide - une des clés étrangères n'existe pas", message: error.message });
      } else if (error.message.includes('column')) {
        res.status(400).json({ error: "Structure de la table incorrecte", message: error.message });
      } else {
        res.status(500).json({ error: "Failed to create message", message: error.message });
      }
    }
  });

  app.put("/api/messages/:id/read", async (req, res) => {
    try {
      const success = await storage.markMessageAsRead(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Message not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error marking message as read:", error);
      res.status(500).json({ error: "Failed to mark message as read" });
    }
  });

  // Routes professionnelles
  
  // Route pour créer un compte professionnel
  app.post('/api/professional-accounts', upload.single('kbisDocument'), async (req, res) => {
    try {
      console.log('🏢 Création compte professionnel...');
      console.log('📄 Données reçues:', req.body);
      console.log('📎 Fichier reçu:', req.file ? req.file.originalname : 'Aucun');
      
      const {
        companyName,
        siret,
        companyAddress,
        phone,
        email,
        website,
        description
      } = req.body;
      
      // Validation des champs obligatoires
      if (!companyName || !siret || !companyAddress || !phone || !email) {
        return res.status(400).json({ error: 'Champs obligatoires manquants' });
      }
      
      // Validation SIRET (14 chiffres)
      if (!/^\d{14}$/.test(siret)) {
        return res.status(400).json({ error: 'SIRET invalide (14 chiffres requis)' });
      }
      
      // Récupérer l'utilisateur actuel depuis Supabase Auth
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.status(401).json({ error: 'Token d\'authentification manquant' });
      }
      
      const token = authHeader.replace('Bearer ', '');
      const { data: { user }, error: authError } = await supabaseServer.auth.getUser(token);
      
      if (authError || !user) {
        return res.status(401).json({ error: 'Token invalide' });
      }
      
      // Vérifier si l'utilisateur a déjà un compte professionnel
      const { data: existingAccount } = await supabaseServer
        .from('professional_accounts')
        .select('id')
        .eq('user_id', user.id)
        .single();
      
      if (existingAccount) {
        return res.status(400).json({ error: 'Vous avez déjà un compte professionnel' });
      }
      
      // Vérifier l'unicité du SIRET
      const { data: existingSiret } = await supabaseServer
        .from('professional_accounts')
        .select('id')
        .eq('siret', siret)
        .single();
      
      if (existingSiret) {
        return res.status(400).json({ error: 'Ce numéro SIRET est déjà utilisé' });
      }
      
      // Créer le compte professionnel
      const { data: proAccount, error: proError } = await supabaseServer
        .from('professional_accounts')
        .insert({
          user_id: user.id,
          company_name: companyName,
          siret: siret,
          company_address: companyAddress,
          phone: phone,
          email: email,
          website: website || null,
          verification_status: 'pending',
          is_verified: false
        })
        .select()
        .single();
      
      if (proError) {
        console.error('❌ Erreur création compte pro:', proError);
        return res.status(500).json({ error: 'Erreur lors de la création du compte professionnel' });
      }
      
      console.log('✅ Compte professionnel créé:', proAccount.id);
      
      // Upload du document Kbis si présent
      if (req.file) {
        console.log('📤 Upload document Kbis...');
        
        const fileName = `kbis-${proAccount.id}-${Date.now()}.${req.file.originalname.split('.').pop()}`;
        
        // Upload vers Supabase Storage (bucket verifications-documents)
        const { data: uploadData, error: uploadError } = await supabaseServer.storage
          .from('verifications-documents')
          .upload(fileName, req.file.buffer, {
            contentType: req.file.mimetype,
            upsert: false
          });
        
        if (uploadError) {
          console.error('❌ Erreur upload:', uploadError);
        } else {
          // Créer l'enregistrement du document
          const { data: docData, error: docError } = await supabaseServer
            .from('verification_documents')
            .insert({
              professional_account_id: proAccount.id,
              document_type: 'kbis',
              file_url: uploadData.path,
              file_name: req.file.originalname,
              file_size: req.file.size,
              verification_status: 'pending'
            });
          
          if (docError) {
            console.error('❌ Erreur enregistrement document:', docError);
          } else {
            console.log('✅ Document Kbis enregistré');
          }
        }
      }
      
      // Créer le profil professionnel initial s'il y a une description
      if (description) {
        const { error: profileError } = await supabaseServer
          .from('professional_profiles')
          .insert({
            professional_account_id: proAccount.id,
            description: description
          });
        
        if (profileError) {
          console.error('❌ Erreur création profil:', profileError);
        }
      }
      
      res.json({
        success: true,
        professionalAccount: proAccount,
        message: 'Compte professionnel créé avec succès. En attente de vérification.'
      });
      
    } catch (error) {
      console.error('❌ Erreur création compte professionnel:', error);
      res.status(500).json({ error: 'Erreur serveur lors de la création du compte professionnel' });
    }
  });
  
  // Route pour récupérer les comptes professionnels en attente (admin)
  app.get('/api/admin/professional-accounts', async (req, res) => {
    try {
      console.log('🏢 Récupération comptes professionnels pour admin...');
      
      const { data: proAccounts, error } = await supabaseServer
        .from('professional_accounts')
        .select(`
          id,
          company_name,
          siret,
          company_address,
          phone,
          email,
          website,
          is_verified,
          verification_status,
          verified_at,
          rejected_reason,
          created_at,
          updated_at,
          users:user_id (
            id,
            name,
            email
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('❌ Erreur récupération comptes pro:', error);
        return res.status(500).json({ error: 'Erreur serveur' });
      }
      
      console.log(`✅ ${proAccounts?.length || 0} comptes professionnels récupérés`);
      res.json(proAccounts || []);
      
    } catch (error) {
      console.error('❌ Erreur récupération comptes pro:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  });
  
  // Route pour récupérer les documents de vérification d'un compte pro (admin)
  app.get('/api/admin/professional-accounts/:id/documents', async (req, res) => {
    try {
      const { id } = req.params;
      console.log(`📄 Récupération documents pour compte pro ${id}...`);
      
      const { data: documents, error } = await supabaseServer
        .from('verification_documents')
        .select('*')
        .eq('professional_account_id', id)
        .order('upload_date', { ascending: false });
      
      if (error) {
        console.error('❌ Erreur récupération documents:', error);
        return res.status(500).json({ error: 'Erreur serveur' });
      }
      
      console.log(`✅ ${documents?.length || 0} documents récupérés`);
      res.json(documents || []);
      
    } catch (error) {
      console.error('❌ Erreur récupération documents:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  });
  
  // Route pour approuver/rejeter un compte professionnel (admin)
  app.patch('/api/admin/professional-accounts/:id/verify', async (req, res) => {
    try {
      const { id } = req.params;
      const { action, reason } = req.body; // action: 'approve' | 'reject', reason: string pour rejection
      
      console.log(`🔍 Vérification compte pro ${id}: ${action}`);
      
      if (action === 'approve') {
        const { data: updatedAccount, error } = await supabaseServer
          .from('professional_accounts')
          .update({
            verification_status: 'approved',
            is_verified: true,
            verified_at: new Date().toISOString(),
            rejected_reason: null
          })
          .eq('id', id)
          .select()
          .single();
        
        if (error) {
          console.error('❌ Erreur approbation:', error);
          return res.status(500).json({ error: 'Erreur lors de l\'approbation' });
        }
        
        // Mettre à jour le statut des documents
        await supabaseServer
          .from('verification_documents')
          .update({ verification_status: 'approved' })
          .eq('professional_account_id', id);
        
        console.log('✅ Compte professionnel approuvé');
        res.json({ success: true, account: updatedAccount, message: 'Compte professionnel approuvé' });
        
      } else if (action === 'reject') {
        if (!reason) {
          return res.status(400).json({ error: 'Raison du rejet requise' });
        }
        
        const { data: updatedAccount, error } = await supabaseServer
          .from('professional_accounts')
          .update({
            verification_status: 'rejected',
            is_verified: false,
            rejected_reason: reason,
            verified_at: null
          })
          .eq('id', id)
          .select()
          .single();
        
        if (error) {
          console.error('❌ Erreur rejet:', error);
          return res.status(500).json({ error: 'Erreur lors du rejet' });
        }
        
        // Mettre à jour le statut des documents
        await supabaseServer
          .from('verification_documents')
          .update({ verification_status: 'rejected' })
          .eq('professional_account_id', id);
        
        console.log('✅ Compte professionnel rejeté');
        res.json({ success: true, account: updatedAccount, message: 'Compte professionnel rejeté' });
        
      } else {
        return res.status(400).json({ error: 'Action invalide' });
      }
      
    } catch (error) {
      console.error('❌ Erreur vérification compte pro:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  });
  
  // Route pour obtenir l'URL signée d'un document (admin)
  app.get('/api/admin/documents/:path/signed-url', async (req, res) => {
    try {
      const { path } = req.params;
      console.log(`🔗 Génération URL signée pour: ${path}`);
      
      const { data, error } = await supabaseServer.storage
        .from('verifications-documents')
        .createSignedUrl(path, 3600); // 1 heure d'expiration
      
      if (error) {
        console.error('❌ Erreur génération URL signée:', error);
        return res.status(500).json({ error: 'Erreur génération URL' });
      }
      
      console.log('✅ URL signée générée');
      res.json({ signedUrl: data.signedUrl });
      
    } catch (error) {
      console.error('❌ Erreur URL signée:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  });

  // Routes admin spécialisées (à placer avant les routes génériques)
  
  // Route pour récupérer les annonces supprimées (admin)
  app.get('/api/admin/deleted-annonces', async (req, res) => {
    try {
      console.log('🗑️ Récupération annonces supprimées...');
      
      const { data: deletedAnnonces, error } = await supabaseServer
        .from('annonces')
        .select(`
          id, 
          title, 
          price, 
          created_at, 
          deleted_at, 
          deletion_reason, 
          deletion_comment,
          users:user_id (
            id,
            name,
            email
          )
        `)
        .not('deleted_at', 'is', null)
        .order('deleted_at', { ascending: false });
      
      if (error) {
        console.error('❌ Erreur récupération annonces supprimées:', error);
        return res.status(500).json({ error: 'Erreur serveur' });
      }
      
      console.log(`✅ ${deletedAnnonces?.length || 0} annonces supprimées récupérées`);
      res.json(deletedAnnonces || []);
      
    } catch (error) {
      console.error('❌ Erreur récupération annonces supprimées:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  });

  // Route pour les statistiques de performance admin
  app.get('/api/admin/performance-stats', async (req, res) => {
    console.log('📈 Route performance-stats appelée');
    try {
      console.log('📈 Récupération statistiques de performance admin...');
      
      // Récupérer toutes les annonces supprimées avec leurs raisons
      const { data: deletedAnnonces, error } = await supabaseServer
        .from('annonces')
        .select('id, title, created_at, deleted_at, deletion_reason, deletion_comment')
        .not('deleted_at', 'is', null);
      
      if (error) {
        console.error('❌ Erreur récupération annonces supprimées:', error);
        return res.status(500).json({ error: 'Erreur serveur' });
      }
      
      const total = deletedAnnonces?.length || 0;
      
      // Compter les raisons de suppression
      const soldOnSite = deletedAnnonces?.filter(a => a.deletion_reason === 'sold_on_site').length || 0;
      const soldElsewhere = deletedAnnonces?.filter(a => a.deletion_reason === 'sold_elsewhere').length || 0;
      const noLongerSelling = deletedAnnonces?.filter(a => a.deletion_reason === 'no_longer_selling').length || 0;
      const other = deletedAnnonces?.filter(a => a.deletion_reason === 'other').length || 0;
      
      // Calculer les pourcentages
      const soldOnSitePercent = total > 0 ? Math.round((soldOnSite / total) * 100) : 0;
      const soldElsewherePercent = total > 0 ? Math.round((soldElsewhere / total) * 100) : 0;
      const noLongerSellingPercent = total > 0 ? Math.round((noLongerSelling / total) * 100) : 0;
      const otherPercent = total > 0 ? Math.round((other / total) * 100) : 0;
      
      // Calculer la durée moyenne avant suppression
      let averageDays = 0;
      if (deletedAnnonces && deletedAnnonces.length > 0) {
        const totalDays = deletedAnnonces.reduce((sum, annonce) => {
          if (annonce.created_at && annonce.deleted_at) {
            const created = new Date(annonce.created_at);
            const deleted = new Date(annonce.deleted_at);
            const diffDays = Math.floor((deleted.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
            return sum + Math.max(0, diffDays);
          }
          return sum;
        }, 0);
        averageDays = Math.round(totalDays / deletedAnnonces.length);
      }
      
      const stats = {
        soldOnSite,
        soldOnSitePercent,
        soldElsewhere, 
        soldElsewherePercent,
        noLongerSelling,
        noLongerSellingPercent,
        other,
        otherPercent,
        totalDeleted: total,
        averageDays
      };
      
      console.log('✨ Statistiques performance générées:', stats);
      res.json(stats);
      
    } catch (error) {
      console.error('❌ Erreur génération statistiques performance:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  });

  // Route pour désactiver une annonce (admin)
  app.patch('/api/admin/annonces/:id/deactivate', async (req, res) => {
    const { id } = req.params;
    
    try {
      console.log(`🔴 Désactivation annonce ${id} par admin...`);
      
      const { error } = await supabaseServer
        .from('annonces')
        .update({ 
          status: 'inactive',
          updated_at: new Date().toISOString()
        })
        .eq('id', id);
      
      if (error) {
        console.error('❌ Erreur désactivation annonce:', error);
        return res.status(500).json({ error: 'Erreur lors de la désactivation' });
      }
      
      console.log(`✅ Annonce ${id} désactivée avec succès`);
      res.json({ success: true, message: 'Annonce désactivée avec succès' });
      
    } catch (error) {
      console.error('❌ Erreur désactivation annonce:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  });

  // Mount new route handlers
  app.use("/api/wishlist", wishlistRoutes);
  app.use("/api/saved-searches", savedSearchRoutes);
  app.use("/api/admin", adminRoutes);
  app.use("/api", messagingRoutes);
  app.use("/api/messages-simple", messagingSimpleRoutes);
  app.use("/api/conversations", conversationsRoutes);
  app.use("/api/favorites", favoritesRoutes);
  app.use("/api/profile", profileRoutes);
  app.use("/api/images", imagesRoutes);
  app.use("/api/auth", authSyncRoutes);

  // Route pour vérifier le statut de vérification d'un utilisateur professionnel
  app.get('/api/professional-accounts/status/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      console.log(`📊 Vérification statut professionnel pour user ${userId}...`);
      
      const { data: proAccount, error } = await supabaseServer
        .from('professional_accounts')
        .select('id, verification_status, is_verified, rejected_reason, created_at')
        .eq('user_id', userId)
        .single();
      
      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
        console.error('❌ Erreur vérification statut:', error);
        return res.status(500).json({ error: 'Erreur serveur' });
      }
      
      if (!proAccount) {
        // Aucun compte professionnel trouvé
        console.log('ℹ️ Aucun compte professionnel trouvé pour cet utilisateur');
        return res.status(404).json({ error: 'Aucun compte professionnel trouvé' });
      }
      
      console.log(`✅ Statut professionnel récupéré: ${proAccount.verification_status}`);
      res.json(proAccount);
      
    } catch (error) {
      console.error('❌ Erreur vérification statut professionnel:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  });

  // Route pour récupérer TOUS les utilisateurs (y compris non-vérifiés) pour l'admin
  app.get('/api/admin/all-users', async (req, res) => {
    try {
      console.log('👥 Récupération de TOUS les utilisateurs depuis auth.users...');
      
      // Récupérer d'abord tous les utilisateurs auth
      const { data: authUsers, error: authError } = await supabaseServer.auth.admin.listUsers();
      
      if (authError) {
        console.error('❌ Erreur récupération auth users:', authError);
        return res.status(500).json({ error: 'Erreur auth' });
      }
      
      // Récupérer aussi les profils utilisateurs publics
      const { data: publicUsers, error: publicError } = await supabaseServer
        .from('users')
        .select('*');
      
      if (publicError) {
        console.error('❌ Erreur récupération users publics:', publicError);
        // Continuer même si erreur sur les profils publics
      }
      
      // OPTION A : Statut basé uniquement sur email_confirmed_at de Supabase Auth
      const allUsers = authUsers.users.map(authUser => {
        const publicProfile = publicUsers?.find(pu => pu.id === authUser.id);
        
        // Logique simplifiée :
        // - OAuth Gmail = email automatiquement confirmé = actif immédiatement
        // - Inscription email = email non confirmé = inactif jusqu'à validation admin
        const isEmailConfirmed = authUser.email_confirmed_at !== null;
        
        return {
          id: authUser.id,
          name: publicProfile?.name || authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'Utilisateur',
          email: authUser.email,
          account_type: publicProfile?.account_type || 'individual',
          verified: isEmailConfirmed, // Statut = email confirmé dans Supabase
          email_verified: isEmailConfirmed,
          created_at: authUser.created_at,
          last_sign_in_at: authUser.last_sign_in_at,
          phone: authUser.phone,
          // Debug info
          auth_confirmed_at: authUser.email_confirmed_at,
          provider: authUser.app_metadata?.provider // gmail, email, etc.
        };
      });
      
      console.log(`✅ ${allUsers.length} utilisateurs auth récupérés`);
      console.log('📧 Emails trouvés:', allUsers.map(u => u.email));
      res.json(allUsers);
      
    } catch (error) {
      console.error('❌ Erreur admin users:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  });

  // Route pour activer/vérifier manuellement un utilisateur (admin)
  app.patch('/api/admin/users/:userId/verify', async (req, res) => {
    try {
      const { userId } = req.params;
      const { action } = req.body; // 'verify_email' | 'activate' | 'suspend'
      
      console.log(`🔐 Admin action ${action} pour user ${userId}...`);
      
      // Mettre à jour le statut auth dans Supabase Auth
      if (action === 'verify_email' || action === 'activate') {
        console.log('📧 Confirmation de l\'email dans Supabase Auth...');
        
        // Récupérer d'abord l'utilisateur
        const { data: userData, error: getUserError } = await supabaseServer.auth.admin.getUserById(userId);
        if (getUserError) {
          console.error('❌ Erreur récupération user:', getUserError);
          return res.status(500).json({ error: 'Utilisateur non trouvé' });
        }
        
        console.log('👤 User avant confirmation:', {
          email: userData.user.email,
          email_confirmed_at: userData.user.email_confirmed_at
        });
        
        const { data: authData, error: authError } = await supabaseServer.auth.admin.updateUserById(userId, {
          email_confirm: true
        });
        
        if (authError) {
          console.error('❌ Erreur confirmation email auth:', authError);
          return res.status(500).json({ error: `Erreur confirmation: ${authError.message}` });
        } else {
          console.log('✅ Email confirmé dans Supabase Auth:', {
            email: authData.user.email,
            email_confirmed_at: authData.user.email_confirmed_at
          });
        }
      }
      
      // Mettre à jour le profil utilisateur public (s'il existe)
      let updateData: any = {};
      
      switch (action) {
        case 'verify_email':
          updateData = { 
            email_verified: true,
            verified: true
          };
          break;
        case 'activate':
          updateData = { 
            verified: true,
            email_verified: true
          };
          break;
        case 'suspend':
          // Pour suspendre, on révoque la confirmation email dans Supabase Auth
          const { error: suspendError } = await supabaseServer.auth.admin.updateUserById(userId, {
            email_confirm: false
          });
          
          if (suspendError) {
            console.error('❌ Erreur suspension auth:', suspendError);
            return res.status(500).json({ error: `Erreur suspension: ${suspendError.message}` });
          }
          
          updateData = { 
            verified: false,
            email_verified: false
          };
          break;
        default:
          return res.status(400).json({ error: 'Action invalide' });
      }
      
      // Vérifier si l'utilisateur existe dans la table publique
      const { data: existingUser } = await supabaseServer
        .from('users')
        .select('id')
        .eq('id', userId)
        .single();
      
      if (existingUser) {
        // Mettre à jour l'utilisateur existant
        const { error: updateError } = await supabaseServer
          .from('users')
          .update(updateData)
          .eq('id', userId);
        
        if (updateError) {
          console.error('❌ Erreur mise à jour utilisateur public:', updateError);
        } else {
          console.log('✅ Profil utilisateur public mis à jour');
        }
      } else {
        console.log('⚠️ Utilisateur n\'existe pas encore dans la table publique');
      }
      
      console.log(`✅ Utilisateur ${userId} ${action} avec succès`);
      res.json({ 
        success: true, 
        message: `Utilisateur ${action === 'verify_email' ? 'vérifié' : action === 'activate' ? 'activé' : 'suspendu'} avec succès` 
      });
      
    } catch (error) {
      console.error('❌ Erreur vérification utilisateur:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  });

  // Setup wishlist migration routes
  setupWishlistMigration(app);
  setupWishlistDirect(app);

  const httpServer = createServer(app);
  return httpServer;
}