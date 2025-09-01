import { supabaseServer } from './supabase';
import { type User, type Vehicle, type Message, type Wishlist, type SavedSearch, type InsertUser, type InsertVehicle, type InsertMessage, type InsertWishlist, type InsertSavedSearch } from "../shared/schema";

console.log('🔗 Connexion Supabase initialisée avec le client officiel');

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  updateUserIdToUuid(oldId: string, newUuid: string): Promise<User>;
  
  // Vehicles
  getVehicle(id: string): Promise<Vehicle | undefined>;
  getVehicleWithUser(id: string): Promise<Vehicle | undefined>;
  getAllVehicles(): Promise<Vehicle[]>; // Seulement les annonces actives (site public)
  getAllVehiclesAdmin(): Promise<Vehicle[]>; // Toutes les annonces (admin/propriétaires)
  getVehiclesByUser(userId: string): Promise<Vehicle[]>;
  getDeletedVehiclesByUser(userId: string): Promise<Vehicle[]>;
  createVehicle(vehicle: InsertVehicle): Promise<Vehicle>;
  updateVehicle(id: string, updates: Partial<InsertVehicle>): Promise<Vehicle | undefined>;
  deleteVehicle(id: string): Promise<boolean>;
  softDeleteVehicleWithReason(id: string, reason: string, comment?: string): Promise<boolean>;
  searchVehicles(filters: any): Promise<Vehicle[]>;
  updateVehicleActiveStatus(id: string, isActive: boolean): Promise<boolean>;
  
  // Messages
  getMessage(id: string): Promise<Message | undefined>;
  getMessagesByVehicle(vehicleId: string): Promise<Message[]>;
  getMessagesByUser(userId: string): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  markMessageAsRead(id: string): Promise<boolean>;
  
  // Wishlist / Favorites
  getUserWishlist(userId: string): Promise<Wishlist[]>;
  getUserFavorites(userId: string): Promise<Vehicle[]>;
  addToWishlist(item: InsertWishlist): Promise<Wishlist>;
  removeFromWishlist(userId: string, vehicleId: string): Promise<boolean>;
  isInWishlist(userId: string, vehicleId: string): Promise<boolean>;
  
  // Saved Searches
  getUserSavedSearches(userId: string): Promise<SavedSearch[]>;
  createSavedSearch(search: InsertSavedSearch): Promise<SavedSearch>;
  updateSavedSearch(id: string, updates: Partial<InsertSavedSearch>): Promise<SavedSearch | undefined>;
  deleteSavedSearch(id: string): Promise<boolean>;
}

export class SupabaseStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const { data, error } = await supabaseServer
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching user:', error);
      return undefined;
    }
    return data as User;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const { data, error } = await supabaseServer
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    
    if (error) {
      console.error('Error fetching user by email:', error);
      return undefined;
    }
    return data as User;
  }

  async createUser(user: InsertUser): Promise<User> {
    const { data, error } = await supabaseServer
      .from('users')
      .insert(user)
      .select()
      .single();
    
    if (error) {
      throw new Error(`Error creating user: ${error.message}`);
    }
    return data as User;
  }

  async updateUserIdToUuid(oldId: string, newUuid: string): Promise<User> {
    console.log(`🔄 Migration ID utilisateur: ${oldId} → ${newUuid}`);
    
    try {
      // 1. Récupérer l'utilisateur existant
      const { data: existingUser, error: fetchError } = await supabaseServer
        .from('users')
        .select('*')
        .eq('id', oldId)
        .single();
        
      if (fetchError || !existingUser) {
        throw new Error(`Utilisateur ${oldId} introuvable`);
      }
      
      // 2. Créer un nouvel utilisateur avec l'UUID
      const { data: newUser, error: insertError } = await supabaseServer
        .from('users')
        .insert({
          ...existingUser,
          id: newUuid,
          createdAt: existingUser.createdAt,
        })
        .select()
        .single();
        
      if (insertError) {
        throw new Error(`Erreur création nouveau user: ${insertError.message}`);
      }
      
      // 3. Mettre à jour les annonces
      const { error: annoncesError } = await supabaseServer
        .from('annonces')
        .update({ user_id: newUuid })
        .eq('user_id', oldId);
        
      if (annoncesError) {
        console.error('⚠️ Erreur mise à jour annonces:', annoncesError);
      }
      
      // 4. Mettre à jour les messages
      const { error: messagesFromError } = await supabaseServer
        .from('messages')
        .update({ from_user_id: newUuid })
        .eq('from_user_id', oldId);
        
      const { error: messagesToError } = await supabaseServer
        .from('messages')
        .update({ to_user_id: newUuid })
        .eq('to_user_id', oldId);
        
      if (messagesFromError || messagesToError) {
        console.error('⚠️ Erreur mise à jour messages:', messagesFromError, messagesToError);
      }
      
      // 5. Supprimer l'ancien utilisateur
      const { error: deleteError } = await supabaseServer
        .from('users')
        .delete()
        .eq('id', oldId);
        
      if (deleteError) {
        console.error('⚠️ Erreur suppression ancien user:', deleteError);
      }
      
      console.log(`✅ Migration réussie: ${oldId} → ${newUuid}`);
      return newUser as User;
      
    } catch (error) {
      console.error(`❌ Erreur migration ID:`, error);
      throw error;
    }
  }

  async getAllUsers(): Promise<User[]> {
    const { data, error } = await supabaseServer
      .from('users')
      .select('*');
    
    if (error) {
      console.error('Error fetching users:', error);
      return [];
    }
    return data as User[];
  }

  // Vehicles
  async getVehicle(id: string): Promise<Vehicle | undefined> {
    const { data, error } = await supabaseServer
      .from('annonces')
      .select(`
        *,
        users(*,
          professional_accounts(*)
        )
      `)
      .eq('id', id)
      .is('deleted_at', null)
      .single();
    
    if (error) {
      console.error('Error fetching vehicle:', error);
      return undefined;
    }
    
    // Transformer la donnée unique vers le format Vehicle avec user
    const annonce = data;
    const transformedData = {
      id: annonce.id.toString(),
      userId: annonce.user_id,
      user: annonce.users ? {
        id: annonce.users.id,
        email: annonce.users.email,
        name: annonce.users.name,
        phone: annonce.users.phone,
        whatsapp: annonce.users.whatsapp,
        type: annonce.users.type,
        companyName: annonce.users.company_name,
        companyLogo: annonce.users.company_logo,
        address: annonce.users.address,
        city: annonce.users.city,
        postalCode: annonce.users.postal_code,
        website: annonce.users.website,
        siret: annonce.users.siret,
        bio: annonce.users.bio,
        avatar: annonce.users.avatar,
        specialties: annonce.users.specialties ? JSON.parse(annonce.users.specialties) : [],
        verified: annonce.users.verified,
        emailVerified: annonce.users.email_verified,
        contactPreferences: annonce.users.contact_preferences ? JSON.parse(annonce.users.contact_preferences) : [],
        createdAt: new Date(annonce.users.created_at),
        lastLoginAt: annonce.users.last_login_at ? new Date(annonce.users.last_login_at) : undefined,
        // Données professionnelles si disponibles
        professionalAccount: annonce.users.professional_accounts?.[0] ? {
          companyName: annonce.users.professional_accounts[0].company_name,
          phone: annonce.users.professional_accounts[0].phone,
          email: annonce.users.professional_accounts[0].email,
          website: annonce.users.professional_accounts[0].website,
          description: annonce.users.professional_accounts[0].description,
          isVerified: annonce.users.professional_accounts[0].is_verified,
          verificationStatus: annonce.users.professional_accounts[0].verification_status,
          companyLogo: annonce.users.professional_accounts[0].company_logo,
          bannerImage: annonce.users.professional_accounts[0].banner_image
        } : undefined
      } : undefined,
      title: annonce.title,
      description: annonce.description,
      category: annonce.category,
      brand: annonce.brand,
      model: annonce.model,
      year: annonce.year,
      mileage: annonce.mileage,
      fuelType: annonce.fuel_type,
      condition: annonce.condition,
      price: annonce.price,
      location: annonce.location,
      images: annonce.images || [],
      features: annonce.features || [],
      listingType: annonce.listing_type || 'sale', // Nouveau champ listing_type
      // Informations de contact spécifiques à l'annonce
      contactPhone: annonce.contact_phone || null,
      contactEmail: annonce.contact_email || null,
      contactWhatsapp: annonce.contact_whatsapp || null,
      hidePhone: annonce.hide_phone || false,
      isPremium: annonce.is_premium,
      premiumType: annonce.premium_type,
      premiumExpiresAt: annonce.premium_expires_at ? new Date(annonce.premium_expires_at) : undefined,
      createdAt: new Date(annonce.created_at),
      updatedAt: new Date(annonce.updated_at),
      views: annonce.views,
      favorites: annonce.favorites,
      status: annonce.status,
      isActive: annonce.is_active !== false
    };
    
    return transformedData as Vehicle;
  }

  async getVehicleWithUser(id: string): Promise<Vehicle | undefined> {
    // Rediriger vers getVehicle car il inclut déjà les users
    return this.getVehicle(id);
  }

  async getAllVehicles(): Promise<Vehicle[]> {
    console.log('🔄 Récupération des annonces ACTIVES avec users depuis Supabase...');
    
    try {
      // Requête directe avec JOIN pour récupérer annonces et utilisateurs
      // FILTRE IMPORTANT: Seulement les annonces approuvées, actives et non supprimées pour le site public
      let { data, error } = await supabaseServer
        .from('annonces')
        .select(`
          *,
          users (*)
        `)
        .eq('status', 'approved')
        .neq('is_active', false)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('❌ Erreur Supabase:', error.message);
        console.log('❌ Rechute vers requête directe...');
        
        // Fallback: récupérer séparément les véhicules et utilisateurs
        const { data: vehiclesData, error: vehiclesError } = await supabaseServer
          .from('annonces')
          .select('*')
          .eq('status', 'approved')
          .neq('is_active', false)
          .order('created_at', { ascending: false });
          
        if (vehiclesError) {
          throw new Error(`Error fetching vehicles: ${vehiclesError.message}`);
        }
        
        const { data: usersData, error: usersError } = await supabaseServer
          .from('users')
          .select('*');
          
        if (usersError) {
          throw new Error(`Error fetching users: ${usersError.message}`);
        }
        
        // Associer manuellement les données
        data = vehiclesData.map((vehicle: any) => {
          const user = usersData.find((u: any) => u.id === vehicle.user_id);
          return { ...vehicle, users: user };
        });
      }
      
      console.log('✅ Annonces ACTIVES avec users récupérées depuis Supabase:', data?.length || 0);
      
      if (data && data.length > 0) {
        console.log('📊 Première annonce Supabase:', data[0].title);
        console.log('👤 Premier user associé:', data[0].users?.name);
        
        // Transformer les données de la table annonces vers le format Vehicle avec user inclus
        const transformedData = data.map((vehicle: any) => ({
          id: vehicle.id.toString(),
          userId: vehicle.user_id,
          user: vehicle.users ? {
            id: vehicle.users.id,
            email: vehicle.users.email,
            name: vehicle.users.name,
            phone: vehicle.users.phone,
            whatsapp: vehicle.users.whatsapp,
            type: vehicle.users.type,
            companyName: vehicle.users.company_name,
            companyLogo: vehicle.users.company_logo,
            address: vehicle.users.address,
            city: vehicle.users.city,
            postalCode: vehicle.users.postal_code,
            website: vehicle.users.website,
            siret: vehicle.users.siret,
            bio: vehicle.users.bio,
            avatar: vehicle.users.avatar,
            specialties: vehicle.users.specialties ? JSON.parse(vehicle.users.specialties) : [],
            verified: vehicle.users.verified,
            emailVerified: vehicle.users.email_verified,
            contactPreferences: vehicle.users.contact_preferences ? JSON.parse(vehicle.users.contact_preferences) : [],
            createdAt: new Date(vehicle.users.created_at),
            lastLoginAt: vehicle.users.last_login_at ? new Date(vehicle.users.last_login_at) : undefined
          } : undefined,
          title: vehicle.title,
          description: vehicle.description,
          category: vehicle.category,
          brand: vehicle.brand,
          model: vehicle.model,
          year: vehicle.year,
          mileage: vehicle.mileage,
          fuelType: vehicle.fuel_type,
          condition: vehicle.condition,
          price: vehicle.price,
          location: vehicle.location,
          images: vehicle.images || [],
          features: vehicle.features || [],
          listingType: vehicle.listing_type || 'sale', // Nouveau champ listing_type
          // Informations de contact spécifiques à l'annonce
          contactPhone: vehicle.contact_phone || null,
          contactEmail: vehicle.contact_email || null,
          contactWhatsapp: vehicle.contact_whatsapp || null,
          hidePhone: vehicle.hide_phone || false,
          isPremium: vehicle.is_premium,
          premiumType: vehicle.premium_type,
          premiumExpiresAt: vehicle.premium_expires_at ? new Date(vehicle.premium_expires_at) : undefined,
          createdAt: new Date(vehicle.created_at),
          updatedAt: new Date(vehicle.updated_at),
          views: vehicle.views,
          favorites: vehicle.favorites,
          status: vehicle.status,
          isActive: vehicle.is_active !== false,
          deletedAt: vehicle.deleted_at ? new Date(vehicle.deleted_at) : null,
          deletionReason: vehicle.deletion_reason,
          deletionComment: vehicle.deletion_comment
        }));
        return transformedData as Vehicle[];
      } else {
        console.log('⚠️  Table annonces vide dans Supabase, utilisation des données mock');
        throw new Error('Empty annonces table');
      }
      
    } catch (error) {
      console.error('❌ Rechute vers données mock');
      throw error;
    }
  }

  async getVehiclesByUser(userId: string): Promise<Vehicle[]> {
    const { data, error } = await supabaseServer
      .from('annonces')
      .select(`
        *,
        users (*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching user vehicles:', error);
      return [];
    }

    // Transformer les données pour inclure le statut isActive
    const transformedData = (data || []).map((vehicle: any) => ({
      id: vehicle.id.toString(),
      userId: vehicle.user_id,
      user: vehicle.users ? {
        id: vehicle.users.id,
        email: vehicle.users.email,
        name: vehicle.users.name,
        phone: vehicle.users.phone,
        whatsapp: vehicle.users.whatsapp,
        type: vehicle.users.type,
        companyName: vehicle.users.company_name,
        companyLogo: vehicle.users.company_logo,
        address: vehicle.users.address,
        city: vehicle.users.city,
        postalCode: vehicle.users.postal_code,
        website: vehicle.users.website,
        siret: vehicle.users.siret,
        bio: vehicle.users.bio,
        avatar: vehicle.users.avatar,
        specialties: vehicle.users.specialties ? JSON.parse(vehicle.users.specialties) : [],
        verified: vehicle.users.verified,
        emailVerified: vehicle.users.email_verified,
        contactPreferences: vehicle.users.contact_preferences ? JSON.parse(vehicle.users.contact_preferences) : [],
        createdAt: new Date(vehicle.users.created_at),
        lastLoginAt: vehicle.users.last_login_at ? new Date(vehicle.users.last_login_at) : undefined
      } : undefined,
      title: vehicle.title,
      description: vehicle.description,
      category: vehicle.category,
      brand: vehicle.brand,
      model: vehicle.model,
      year: vehicle.year,
      mileage: vehicle.mileage,
      fuelType: vehicle.fuel_type,
      condition: vehicle.condition,
      price: vehicle.price,
      location: vehicle.location,
      images: vehicle.images || [],
      features: vehicle.features || [],
      listingType: vehicle.listing_type || 'sale',
      contactPhone: vehicle.contact_phone || null,
      contactEmail: vehicle.contact_email || null,
      contactWhatsapp: vehicle.contact_whatsapp || null,
      hidePhone: vehicle.hide_phone || false,
      isPremium: vehicle.is_premium,
      premiumType: vehicle.premium_type,
      premiumExpiresAt: vehicle.premium_expires_at ? new Date(vehicle.premium_expires_at) : undefined,
      createdAt: new Date(vehicle.created_at),
      updatedAt: new Date(vehicle.updated_at),
      views: vehicle.views,
      favorites: vehicle.favorites,
      status: vehicle.status,
      isActive: vehicle.is_active !== false,
      deletedAt: vehicle.deleted_at ? new Date(vehicle.deleted_at) : null,
      deletionReason: vehicle.deletion_reason,
      deletionComment: vehicle.deletion_comment
    }));

    return transformedData as Vehicle[];
  }

  async getDeletedVehiclesByUser(userId: string): Promise<Vehicle[]> {
    const { data, error } = await supabaseServer
      .from('annonces')
      .select(`
        *,
        users (*)
      `)
      .eq('user_id', userId)
      .not('deleted_at', 'is', null)
      .order('deleted_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching deleted user vehicles:', error);
      return [];
    }

    // Transformer les données pour inclure les informations de suppression
    const transformedData = data.map(annonce => ({
      id: annonce.id.toString(),
      userId: annonce.user_id,
      user: annonce.users ? {
        id: annonce.users.id,
        email: annonce.users.email,
        name: annonce.users.name,
        phone: annonce.users.phone,
        whatsapp: annonce.users.whatsapp,
        type: annonce.users.type,
        companyName: annonce.users.company_name,
        companyLogo: annonce.users.company_logo,
        address: annonce.users.address,
        city: annonce.users.city,
        postalCode: annonce.users.postal_code,
        website: annonce.users.website,
        siret: annonce.users.siret,
        bio: annonce.users.bio,
        avatar: annonce.users.avatar,
        specialties: annonce.users.specialties ? JSON.parse(annonce.users.specialties) : [],
        verified: annonce.users.verified,
        emailVerified: annonce.users.email_verified,
        contactPreferences: annonce.users.contact_preferences ? JSON.parse(annonce.users.contact_preferences) : [],
        createdAt: new Date(annonce.users.created_at),
        lastLoginAt: annonce.users.last_login_at ? new Date(annonce.users.last_login_at) : undefined
      } : undefined,
      title: annonce.title,
      description: annonce.description,
      category: annonce.category,
      brand: annonce.brand,
      model: annonce.model,
      year: annonce.year,
      mileage: annonce.mileage,
      fuelType: annonce.fuel_type,
      condition: annonce.condition,
      price: annonce.price,
      location: annonce.location,
      images: annonce.images || [],
      features: annonce.features || [],
      listingType: annonce.listing_type || 'sale',
      contactPhone: annonce.contact_phone || null,
      contactEmail: annonce.contact_email || null,
      contactWhatsapp: annonce.contact_whatsapp || null,
      hidePhone: annonce.hide_phone || false,
      isPremium: annonce.is_premium,
      premiumType: annonce.premium_type,
      premiumExpiresAt: annonce.premium_expires_at ? new Date(annonce.premium_expires_at) : undefined,
      createdAt: new Date(annonce.created_at),
      updatedAt: new Date(annonce.updated_at),
      views: annonce.views,
      favorites: annonce.favorites,
      status: annonce.status,
      isActive: annonce.is_active !== false,
      // Informations de suppression
      deletedAt: annonce.deleted_at ? new Date(annonce.deleted_at) : undefined,
      deletionReason: annonce.deletion_reason,
      deletionComment: annonce.deletion_comment
    }));

    return transformedData as Vehicle[];
  }

  async createVehicle(vehicle: InsertVehicle): Promise<Vehicle> {
    console.log("🔍 DONNÉES AVANT TRANSFORMATION:", JSON.stringify(vehicle, null, 2));
    
    // FORCER LA SUPPRESSION de tout champ id qui pourrait être caché
    const cleanVehicle = { ...vehicle };
    delete (cleanVehicle as any).id;
    
    // Transformer les données du format Vehicle vers le format table annonces
    // L'ID sera auto-généré par Supabase (auto-increment)
    const annonceData: any = {
      user_id: cleanVehicle.userId,
      title: cleanVehicle.title,
      description: cleanVehicle.description,
      category: cleanVehicle.category,
      price: cleanVehicle.price || 0,
      // FIX LOCALISATION : Convertir l'objet location en string
      location: typeof cleanVehicle.location === 'object' 
        ? `${(cleanVehicle.location as any).city} (${(cleanVehicle.location as any).postalCode})`
        : cleanVehicle.location,
      images: cleanVehicle.images || [],
      features: cleanVehicle.features || [],
      is_premium: cleanVehicle.isPremium || false,
      views: cleanVehicle.views || 0,
      favorites: cleanVehicle.favorites || 0,
      status: cleanVehicle.status || 'approved',
      listing_type: (cleanVehicle as any).listingType || 'sale'
    };

    // Ajouter les champs avec valeurs par défaut pour respecter les contraintes Supabase
    annonceData.brand = cleanVehicle.brand || 'Non spécifié';
    annonceData.model = cleanVehicle.model || 'Non spécifié';
    annonceData.year = cleanVehicle.year || new Date().getFullYear();
    annonceData.mileage = cleanVehicle.mileage || 0;
    annonceData.fuel_type = cleanVehicle.fuelType || 'Non spécifié';
    annonceData.condition = cleanVehicle.condition || 'good';
    
    // Informations de contact spécifiques à l'annonce
    if ((cleanVehicle as any).contactPhone) annonceData.contact_phone = (cleanVehicle as any).contactPhone;
    if ((cleanVehicle as any).contactEmail) annonceData.contact_email = (cleanVehicle as any).contactEmail;
    if ((cleanVehicle as any).contactWhatsapp) annonceData.contact_whatsapp = (cleanVehicle as any).contactWhatsapp;
    if ((cleanVehicle as any).hidePhone !== undefined) annonceData.hide_phone = (cleanVehicle as any).hidePhone;
    
    if (cleanVehicle.premiumType) annonceData.premium_type = cleanVehicle.premiumType;
    if (cleanVehicle.premiumExpiresAt) annonceData.premium_expires_at = cleanVehicle.premiumExpiresAt;

    // DOUBLE VÉRIFICATION : supprimer tout id qui pourrait s'être glissé
    delete annonceData.id;

    console.log("🔍 DONNÉES ENVOYÉES À SUPABASE:", JSON.stringify(annonceData, null, 2));
    
    // SOLUTION TEMPORAIRE : Récupérer le MAX ID et forcer la séquence
    const { data: maxIdData } = await supabaseServer
      .from('annonces')
      .select('id')
      .order('id', { ascending: false })
      .limit(1);
    
    if (maxIdData && maxIdData.length > 0) {
      const nextId = maxIdData[0].id + 1;
      console.log(`🔧 FORÇAGE ID: ${nextId} (MAX actuel: ${maxIdData[0].id})`);
      annonceData.id = nextId;
    }
    
    const { data, error } = await supabaseServer
      .from('annonces')
      .insert(annonceData)
      .select()
      .single();
    
    if (error) {
      throw new Error(`Error creating vehicle: ${error.message}`);
    }
    
    // Transformer la réponse vers le format Vehicle
    const transformedData = {
      id: data.id.toString(), // Convertir l'integer en string pour compatibilité
      userId: data.user_id,
      title: data.title,
      description: data.description,
      category: data.category,
      brand: data.brand,
      model: data.model,
      year: data.year,
      mileage: data.mileage,
      fuelType: data.fuel_type,
      condition: data.condition,
      price: data.price,
      location: data.location,
      images: data.images || [],
      features: data.features || [],
      listingType: data.listing_type || 'sale', // Nouveau champ listing_type
      // Informations de contact spécifiques à l'annonce
      contactPhone: data.contact_phone || null,
      contactEmail: data.contact_email || null,
      contactWhatsapp: data.contact_whatsapp || null,
      hidePhone: data.hide_phone || false,
      isPremium: data.is_premium,
      premiumType: data.premium_type,
      premiumExpiresAt: data.premium_expires_at ? new Date(data.premium_expires_at) : undefined,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      views: data.views,
      favorites: data.favorites,
      status: data.status,
      isActive: data.is_active !== false
    };
    
    return transformedData as Vehicle;
  }

  async updateVehicle(id: string, updates: Partial<InsertVehicle>): Promise<Vehicle | undefined> {
    const updateData = { 
      ...updates, 
      updated_at: new Date().toISOString()
    };
    
    const { data, error } = await supabaseServer
      .from('annonces')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating vehicle:', error);
      return undefined;
    }
    return data as Vehicle;
  }

  async deleteVehicle(id: string): Promise<boolean> {
    const { error } = await supabaseServer
      .from('annonces')
      .delete()
      .eq('id', id);
    
    return !error;
  }

  async softDeleteVehicleWithReason(id: string, reason: string, comment?: string): Promise<boolean> {
    try {
      // Utiliser une requête SQL directe pour contourner le problème de cache Supabase
      const { error } = await supabaseServer.rpc('soft_delete_vehicle', {
        vehicle_id: parseInt(id),
        delete_reason: reason,
        delete_comment: comment || null
      });
      
      if (error) {
        console.error('Error with RPC soft delete:', error);
        // Fallback : essayer une requête SQL directe
        const { error: sqlError } = await supabaseServer
          .from('annonces')
          .update({
            deleted_at: new Date().toISOString(),
            deletion_reason: reason,
            deletion_comment: comment || null,
            is_active: false
          })
          .eq('id', parseInt(id));
        
        if (sqlError) {
          console.error('Error soft deleting vehicle:', sqlError);
          return false;
        }
      }
      
      console.log(`✅ Annonce ${id} supprimée avec raison: ${reason}`);
      return true;
    } catch (error) {
      console.error('Unexpected error soft deleting vehicle:', error);
      return false;
    }
  }

  async searchVehicles(filters: any): Promise<Vehicle[]> {
    let query = supabaseServer
      .from('annonces')
      .select(`
        *,
        users (*)
      `);

    // FILTRE IMPORTANT: Seulement les annonces approuvées, actives et non supprimées pour les recherches publiques
    query = query.eq('status', 'approved')
                 .neq('is_active', false)
                 .is('deleted_at', null);

    // Apply filters
    if (filters.category) {
      query = query.eq('category', filters.category);
    }
    if (filters.brand) {
      query = query.eq('brand', filters.brand);
    }
    if (filters.condition) {
      query = query.eq('condition', filters.condition);
    }
    if (filters.yearFrom) {
      query = query.gte('year', filters.yearFrom);
    }
    if (filters.yearTo) {
      query = query.lte('year', filters.yearTo);
    }
    if (filters.priceFrom) {
      query = query.gte('price', filters.priceFrom);
    }
    if (filters.priceTo) {
      query = query.lte('price', filters.priceTo);
    }
    if (filters.searchTerm) {
      query = query.ilike('title', `%${filters.searchTerm}%`);
    }

    // Order by premium first, then by created date
    query = query.order('is_premium', { ascending: false })
                 .order('created_at', { ascending: false });

    const { data, error } = await query;
    
    if (error) {
      console.error('Error searching vehicles:', error);
      return [];
    }
    
    return data as Vehicle[];
  }

  // Messages
  async getMessage(id: string): Promise<Message | undefined> {
    const { data, error } = await supabaseServer
      .from('messages')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching message:', error);
      return undefined;
    }
    return data as Message;
  }

  async getMessagesByVehicle(vehicleId: string): Promise<Message[]> {
    const { data, error } = await supabaseServer
      .from('messages')
      .select('*')
      .eq('vehicle_id', vehicleId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching vehicle messages:', error);
      return [];
    }
    return data as Message[];
  }

  async getMessagesByUser(userId: string): Promise<Message[]> {
    const { data, error } = await supabaseServer
      .from('messages')
      .select('*')
      .or(`from_user_id.eq.${userId},to_user_id.eq.${userId}`)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching user messages:', error);
      return [];
    }
    return data as Message[];
  }

  async createMessage(message: any): Promise<Message> {
    console.log("🔍 createMessage appelé avec:", JSON.stringify(message, null, 2));
    
    // Vérification des champs nécessaires
    if (!message.id) throw new Error("Message ID is required");
    if (!message.from_user_id && !message.fromUserId) throw new Error("from_user_id is required");
    if (!message.to_user_id && !message.toUserId) throw new Error("to_user_id is required");
    if (!message.annonce_id && !message.vehicleId) throw new Error("vehicle_id/annonce_id is required");
    if (!message.content) throw new Error("content is required");
    
    // Adapter les noms de champs pour qu'ils correspondent à la DB réelle
    const adaptedMessage = {
      id: message.id,
      from_user_id: message.from_user_id || message.fromUserId,
      to_user_id: message.to_user_id || message.toUserId,
      // Adapter selon ce qui existe réellement dans la DB
      ...(message.annonce_id ? { annonce_id: message.annonce_id } : {}),
      ...(message.vehicleId ? { vehicle_id: message.vehicleId } : {}),
      content: message.content,
      created_at: message.created_at || message.createdAt || new Date().toISOString(),
      read: message.read !== undefined ? message.read : false
    };
    
    console.log("📦 Message adapté pour Supabase:", JSON.stringify(adaptedMessage, null, 2));
    
    try {
      const { data, error } = await supabaseServer
        .from('messages')
        .insert(adaptedMessage)
        .select()
        .single();
      
      if (error) {
        console.error("❌ Erreur Supabase détaillée:", error);
        throw new Error(`Error creating message: ${error.message}`);
      }
      
      if (!data) {
        throw new Error("No data returned after creating message");
      }
      
      console.log("✅ Message créé dans la BD:", data.id);
      return data as Message;
    } catch (err) {
      console.error("❌ Exception complète:", err);
      throw err;
    }
  }

  async markMessageAsRead(id: string): Promise<boolean> {
    const { error } = await supabaseServer
      .from('messages')
      .update({ read: true })
      .eq('id', id);
    
    return !error;
  }

  // Wishlist methods
  async getUserWishlist(userId: string): Promise<Wishlist[]> {
    const { data, error } = await supabaseServer
      .from('wishlist')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching wishlist:', error);
      return [];
    }
    return data as Wishlist[];
  }

  async getUserFavorites(userId: string): Promise<Vehicle[]> {
    console.log('🔄 Récupération favoris avec table wishlist dédiée pour:', userId);
    
    try {
      // Essayer d'abord la table wishlist dédiée
      const { data: wishlistData, error: wishlistError } = await supabaseServer
        .from('wishlist')
        .select('vehicle_id')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      let favoriteIds = [];

      if (wishlistError) {
        console.log('❌ Table wishlist non disponible, utilisation bio:', wishlistError);
        // Fallback vers le système bio
        const user = await this.getUser(userId);
        if (!user) return [];

        try {
          if (user.bio && user.bio.trim() !== '') {
            const bioData = JSON.parse(user.bio);
            favoriteIds = bioData.favorites || [];
          }
        } catch (e) {
          return [];
        }
      } else {
        // Utiliser la table wishlist dédiée
        favoriteIds = (wishlistData || []).map(item => item.vehicle_id);
        console.log('✅ Favoris récupérés depuis table dédiée:', favoriteIds);
      }

      if (favoriteIds.length === 0) {
        console.log('✅ Aucun favori trouvé');
        return [];
      }

      // Convertir les IDs en nombres pour la requête Supabase
      const numericIds = favoriteIds.map(id => parseInt(id.toString())).filter(id => !isNaN(id));
      
      if (numericIds.length === 0) {
        console.log('✅ Aucun ID valide trouvé');
        return [];
      }

      console.log('🔍 IDs numériques pour requête optimisée:', numericIds);

      // Requête optimisée : récupérer tous les véhicules favoris en une fois
      const { data: annonceData, error: annonceError } = await supabaseServer
        .from('annonces')
        .select(`
          *,
          users!annonces_user_id_fkey (
            id, email, name, phone, whatsapp, type, company_name, 
            company_logo, address, city, postal_code, website, 
            siret, bio, avatar, specialties, verified, email_verified, 
            contact_preferences, created_at, last_login_at
          )
        `)
        .in('id', numericIds)
        .eq('status', 'approved');

      if (annonceError) {
        console.error('❌ Erreur récupération favoris optimisée:', annonceError);
        return [];
      }

      // Transformer les données en format Vehicle
      const favorites = (annonceData || []).map(annonce => ({
        id: annonce.id.toString(),
        userId: annonce.user_id,
        user: annonce.users ? {
          id: annonce.users.id,
          email: annonce.users.email,
          name: annonce.users.name,
          phone: annonce.users.phone,
          whatsapp: annonce.users.whatsapp,
          type: annonce.users.type,
          companyName: annonce.users.company_name,
          companyLogo: annonce.users.company_logo,
          address: annonce.users.address,
          city: annonce.users.city,
          postalCode: annonce.users.postal_code,
          website: annonce.users.website,
          siret: annonce.users.siret,
          bio: annonce.users.bio,
          avatar: annonce.users.avatar,
          specialties: annonce.users.specialties || [],
          verified: annonce.users.verified,
          emailVerified: annonce.users.email_verified,
          contactPreferences: annonce.users.contact_preferences || [],
          createdAt: annonce.users.created_at,
        } : null,
        title: annonce.title,
        description: annonce.description,
        category: annonce.category,
        brand: annonce.brand,
        model: annonce.model,
        year: annonce.year,
        mileage: annonce.mileage,
        fuelType: annonce.fuel_type,
        condition: annonce.condition,
        price: annonce.price,
        location: annonce.location,
        images: annonce.images || [],
        features: annonce.features || [],
        listingType: annonce.listing_type || 'sale',
        contactPhone: null,
        contactEmail: null,
        contactWhatsapp: null,
        hidePhone: false,
        isPremium: annonce.is_premium || false,
        premiumType: annonce.premium_type,
        createdAt: annonce.created_at,
        updatedAt: annonce.updated_at,
        views: annonce.views || 0,
        favorites: annonce.favorites || 0,
        status: annonce.status || 'approved',
        isActive: annonce.is_active !== false
      }));

      console.log('✅ Favoris récupérés avec détails (optimisé):', favorites.length);
      return favorites;
    } catch (error) {
      console.error('❌ Erreur dans getUserFavorites:', error);
      return [];
    }
  }

  async addToWishlist(item: InsertWishlist): Promise<Wishlist> {
    console.log('🔄 Migration vers table wishlist dédiée:', item);
    
    try {
      // Essayer d'abord d'insérer dans la table wishlist dédiée
      const wishlistId = crypto.randomUUID();
      
      const { data: wishlistData, error: wishlistError } = await supabaseServer
        .from('wishlist')
        .upsert({
          id: wishlistId,
          user_id: item.userId,
          vehicle_id: item.vehicleId.toString(), // TEXT type, pas INTEGER
          created_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,vehicle_id'
        })
        .select()
        .single();

      if (wishlistError) {
        console.log('❌ Table wishlist non disponible, utilisation bio:', wishlistError);
        // Fallback vers le système bio
        return await this.addToWishlistBio(item);
      }

      const result = {
        id: wishlistData.id,
        userId: wishlistData.user_id,
        vehicleId: wishlistData.vehicle_id, // Déjà en TEXT
        createdAt: new Date(wishlistData.created_at)
      };
      
      console.log('✅ Favori ajouté table wishlist dédiée:', result);
      return result as Wishlist;
    } catch (error) {
      console.error('❌ Erreur table wishlist, fallback bio:', error);
      return await this.addToWishlistBio(item);
    }
  }

  // Méthode fallback utilisant le bio
  async addToWishlistBio(item: InsertWishlist): Promise<Wishlist> {
    const user = await this.getUser(item.userId);
    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }

    let favorites = [];
    try {
      if (user.bio && user.bio.trim() !== '') {
        const bioData = JSON.parse(user.bio);
        favorites = bioData.favorites || [];
      }
    } catch (e) {
      favorites = [];
    }

    if (!favorites.includes(item.vehicleId)) {
      favorites.push(item.vehicleId);
      
      const bioData = { favorites };
      const bioJson = JSON.stringify(bioData);
      
      const { error } = await supabaseServer
        .from('users')
        .update({ bio: bioJson })
        .eq('id', item.userId);
        
      if (error) {
        throw new Error(`Erreur sauvegarde favoris: ${error.message}`);
      }
    }

    return {
      id: crypto.randomUUID(),
      userId: item.userId,
      vehicleId: item.vehicleId,
      createdAt: new Date()
    } as Wishlist;
  }

  async removeFromWishlist(userId: string, vehicleId: string): Promise<boolean> {
    console.log('🔄 Suppression favori table wishlist:', { userId, vehicleId });
    
    try {
      // Essayer d'abord la table wishlist dédiée
      const { error: wishlistError } = await supabaseServer
        .from('wishlist')
        .delete()
        .eq('user_id', userId)
        .eq('vehicle_id', vehicleId.toString()); // TEXT type, pas INTEGER
      
      if (wishlistError) {
        console.log('❌ Table wishlist non disponible, utilisation bio:', wishlistError);
        return await this.removeFromWishlistBio(userId, vehicleId);
      }
      
      console.log('✅ Favori supprimé table wishlist dédiée');
      return true;
    } catch (error) {
      console.error('❌ Erreur table wishlist, fallback bio:', error);
      return await this.removeFromWishlistBio(userId, vehicleId);
    }
  }

  async removeFromWishlistBio(userId: string, vehicleId: string): Promise<boolean> {
    const user = await this.getUser(userId);
    if (!user) return false;

    let favorites = [];
    try {
      if (user.bio) {
        const bioData = JSON.parse(user.bio);
        favorites = bioData.favorites || [];
      }
    } catch (e) {
      favorites = [];
    }

    favorites = favorites.filter((fav: string) => fav !== vehicleId);
    
    const bioData = { favorites };
    await supabaseServer
      .from('users')
      .update({ bio: JSON.stringify(bioData) })
      .eq('id', userId);
    
    return true;
  }

  async isInWishlist(userId: string, vehicleId: string): Promise<boolean> {
    console.log('🔄 Vérification favori table wishlist:', { userId, vehicleId });
    
    try {
      // Essayer d'abord la table wishlist dédiée
      const { data: wishlistData, error: wishlistError } = await supabaseServer
        .from('wishlist')
        .select('id')
        .eq('user_id', userId)
        .eq('vehicle_id', parseInt(vehicleId))
        .limit(1);
      
      if (wishlistError) {
        console.log('❌ Table wishlist non disponible, utilisation bio:', wishlistError);
        return await this.isInWishlistBio(userId, vehicleId);
      }
      
      const isInWishlist = wishlistData && wishlistData.length > 0;
      console.log('✅ Véhicule en favori (table dédiée):', isInWishlist);
      return isInWishlist;
    } catch (error) {
      console.error('❌ Erreur table wishlist, fallback bio:', error);
      return await this.isInWishlistBio(userId, vehicleId);
    }
  }

  async isInWishlistBio(userId: string, vehicleId: string): Promise<boolean> {
    const user = await this.getUser(userId);
    if (!user || !user.bio) return false;

    try {
      const bioData = JSON.parse(user.bio);
      const favorites = bioData.favorites || [];
      return favorites.includes(vehicleId);
    } catch (e) {
      return false;
    }
  }



  // Saved Searches methods
  async getUserSavedSearches(userId: string): Promise<SavedSearch[]> {
    const { data, error } = await supabaseServer
      .from('saved_searches')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching saved searches:', error);
      return [];
    }
    return data as SavedSearch[];
  }

  async createSavedSearch(search: InsertSavedSearch): Promise<SavedSearch> {
    // Mapper les champs vers les colonnes de la base de données
    const dbData = {
      id: search.id,
      user_id: search.userId,
      name: search.name,
      filters: search.filters,
      alerts_enabled: search.alertsEnabled || false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabaseServer
      .from('saved_searches')
      .insert(dbData)
      .select()
      .single();
    
    if (error) {
      throw new Error(`Error creating saved search: ${error.message}`);
    }
    return data as SavedSearch;
  }

  async updateSavedSearch(id: string, updates: Partial<InsertSavedSearch>): Promise<SavedSearch | undefined> {
    // Mapper les champs vers les colonnes de la base de données
    const dbUpdates: any = {
      updated_at: new Date().toISOString()
    };

    if (updates.alertsEnabled !== undefined) {
      dbUpdates.alerts_enabled = updates.alertsEnabled;
    }
    if (updates.name !== undefined) {
      dbUpdates.name = updates.name;
    }
    if (updates.filters !== undefined) {
      dbUpdates.filters = updates.filters;
    }
    
    const { data, error } = await supabaseServer
      .from('saved_searches')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating saved search:', error);
      return undefined;
    }
    return data as SavedSearch;
  }

  async deleteSavedSearch(id: string): Promise<boolean> {
    const { error } = await supabaseServer
      .from('saved_searches')
      .delete()
      .eq('id', id);
    
    return !error;
  }

  async getAllVehiclesAdmin(): Promise<Vehicle[]> {
    console.log('🔄 Récupération de TOUTES les annonces (admin) avec users depuis Supabase...');
    
    try {
      // Requête directe avec JOIN pour récupérer toutes les annonces (y compris inactives)
      let { data, error } = await supabaseServer
        .from('annonces')
        .select(`
          *,
          users (*)
        `)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('❌ Erreur Supabase:', error.message);
        console.log('❌ Rechute vers requête directe...');
        
        // Fallback: récupérer séparément les véhicules et utilisateurs
        const { data: vehiclesData, error: vehiclesError } = await supabaseServer
          .from('annonces')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (vehiclesError) {
          throw new Error(`Error fetching vehicles: ${vehiclesError.message}`);
        }
        
        const { data: usersData, error: usersError } = await supabaseServer
          .from('users')
          .select('*');
          
        if (usersError) {
          throw new Error(`Error fetching users: ${usersError.message}`);
        }
        
        // Associer manuellement les données
        data = vehiclesData.map((vehicle: any) => {
          const user = usersData.find((u: any) => u.id === vehicle.user_id);
          return { ...vehicle, users: user };
        });
      }
      
      console.log('✅ TOUTES les annonces avec users récupérées depuis Supabase:', data?.length || 0);
      
      if (data && data.length > 0) {
        // Transformer les données de la table annonces vers le format Vehicle avec user inclus
        const transformedData = data.map((vehicle: any) => ({
          id: vehicle.id.toString(),
          userId: vehicle.user_id,
          user: vehicle.users ? {
            id: vehicle.users.id,
            email: vehicle.users.email,
            name: vehicle.users.name,
            phone: vehicle.users.phone,
            whatsapp: vehicle.users.whatsapp,
            type: vehicle.users.type,
            companyName: vehicle.users.company_name,
            companyLogo: vehicle.users.company_logo,
            address: vehicle.users.address,
            city: vehicle.users.city,
            postalCode: vehicle.users.postal_code,
            website: vehicle.users.website,
            siret: vehicle.users.siret,
            bio: vehicle.users.bio,
            avatar: vehicle.users.avatar,
            specialties: vehicle.users.specialties ? JSON.parse(vehicle.users.specialties) : [],
            verified: vehicle.users.verified,
            emailVerified: vehicle.users.email_verified,
            contactPreferences: vehicle.users.contact_preferences ? JSON.parse(vehicle.users.contact_preferences) : [],
            createdAt: new Date(vehicle.users.created_at),
            lastLoginAt: vehicle.users.last_login_at ? new Date(vehicle.users.last_login_at) : undefined
          } : undefined,
          title: vehicle.title,
          description: vehicle.description,
          category: vehicle.category,
          brand: vehicle.brand,
          model: vehicle.model,
          year: vehicle.year,
          mileage: vehicle.mileage,
          fuelType: vehicle.fuel_type,
          condition: vehicle.condition,
          price: vehicle.price,
          location: vehicle.location,
          images: vehicle.images || [],
          features: vehicle.features || [],
          listingType: vehicle.listing_type || 'sale',
          contactPhone: vehicle.contact_phone || null,
          contactEmail: vehicle.contact_email || null,
          contactWhatsapp: vehicle.contact_whatsapp || null,
          hidePhone: vehicle.hide_phone || false,
          isPremium: vehicle.is_premium,
          premiumType: vehicle.premium_type,
          premiumExpiresAt: vehicle.premium_expires_at ? new Date(vehicle.premium_expires_at) : undefined,
          createdAt: new Date(vehicle.created_at),
          updatedAt: new Date(vehicle.updated_at),
          views: vehicle.views,
          favorites: vehicle.favorites,
          status: vehicle.status,
          isActive: vehicle.is_active !== false,
          deletedAt: vehicle.deleted_at ? new Date(vehicle.deleted_at) : null,
          deletionReason: vehicle.deletion_reason,
          deletionComment: vehicle.deletion_comment
        }));
        
        return transformedData as Vehicle[];
      }
    } catch (error) {
      console.error('❌ Erreur dans getAllVehiclesAdmin:', error);
      return [];
    }
    
    return [];
  }

  async updateVehicleActiveStatus(id: string, isActive: boolean): Promise<boolean> {
    try {
      const { error } = await supabaseServer
        .from('annonces')
        .update({ is_active: isActive })
        .eq('id', parseInt(id));

      if (error) {
        console.error('❌ Erreur changement statut actif:', error);
        // Si la colonne n'existe pas encore, le signaler
        if (error.message.includes('column') && error.message.includes('is_active')) {
          console.log('⚠️  La colonne is_active doit être ajoutée à la table annonces dans Supabase');
          console.log('⚠️  Commande SQL: ALTER TABLE annonces ADD COLUMN is_active BOOLEAN DEFAULT true;');
        }
        return false;
      }

      console.log(`✅ Statut annonce ${id} changé: ${isActive ? 'active' : 'désactivée'}`);
      return true;
    } catch (error) {
      console.error('❌ Erreur inattendue changement statut:', error);
      return false;
    }
  }
}

export const storage = new SupabaseStorage();
