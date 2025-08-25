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

  // Setup wishlist migration routes
  setupWishlistMigration(app);
  setupWishlistDirect(app);

  const httpServer = createServer(app);
  return httpServer;
}