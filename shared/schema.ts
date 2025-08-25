import { pgTable, text, serial, integer, boolean, timestamp, real, json, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Table profiles minimaliste selon les specs utilisateur
export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey(), // References auth.users(id)
  avatarUrl: text("avatar_url"),
  accountType: text("account_type").$type<'individual' | 'professional'>().default('individual'),
  phone: text("phone"),
  onboardingCompleted: boolean("onboarding_completed").default(false),
  marketingConsent: boolean("marketing_consent").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Table users existante (à migrer progressivement vers profiles)
export const users = pgTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  phone: text("phone"),
  whatsapp: text("whatsapp"),
  type: text("type").notNull(), // 'individual' | 'professional'
  companyName: text("company_name"),
  companyLogo: text("company_logo"),
  address: text("address"),
  city: text("city"),
  postalCode: text("postal_code"),
  website: text("website"),
  siret: text("siret"),
  bio: text("bio"),
  avatar: text("avatar"),
  specialties: json("specialties").$type<string[]>(),
  verified: boolean("verified").default(false),
  emailVerified: boolean("email_verified").default(false),
  contactPreferences: json("contact_preferences").$type<string[]>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastLoginAt: timestamp("last_login_at"),
});

export const annonces = pgTable("annonces", {
  id: serial("id").primaryKey(),
  userId: text("user_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  brand: text("brand").notNull(),
  model: text("model").notNull(),
  year: integer("year").notNull(),
  mileage: integer("mileage"),
  fuelType: text("fuel_type"), // 'gasoline' | 'diesel' | 'electric' | 'hybrid'
  condition: text("condition").notNull(), // 'new' | 'used' | 'damaged'
  price: real("price").notNull(),
  location: text("location").notNull(),
  images: json("images").$type<string[]>().default([]),
  features: json("features").$type<string[]>().default([]),
  listingType: text("listing_type").notNull().default("sale"), // 'sale' | 'search'
  isPremium: boolean("is_premium").default(false),
  premiumType: text("premium_type"), // 'daily' | 'weekly' | 'monthly'
  premiumExpiresAt: timestamp("premium_expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  views: integer("views").default(0),
  favorites: integer("favorites").default(0),
  status: text("status").default("approved"), // 'pending' | 'approved' | 'rejected'
  isActive: boolean("is_active").default(true), // Allow users to activate/deactivate their listings
  // Soft delete et questionnaire de suppression
  deletedAt: timestamp("deleted_at"),
  deletionReason: text("deletion_reason"), // 'sold_on_site' | 'sold_elsewhere' | 'no_longer_selling' | 'other'
  deletionComment: text("deletion_comment"), // Commentaire facultatif pour "Autre"
});

export const messages = pgTable("messages", {
  id: text("id").primaryKey(),
  fromUserId: text("from_user_id").references(() => users.id).notNull(),
  toUserId: text("to_user_id").references(() => users.id).notNull(),
  vehicleId: text("vehicle_id").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  read: boolean("read").default(false),
});

// Wishlist table for favorite vehicles
export const wishlist = pgTable("wishlist", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => users.id).notNull(),
  vehicleId: text("vehicle_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Admin tables
export const admins = pgTable("admins", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  role: text("role").notNull().default("moderator"), // 'super_admin' | 'admin' | 'moderator'
  permissions: json("permissions").$type<Record<string, boolean>>().default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Types pour la nouvelle table profiles
export type Profile = typeof profiles.$inferSelect;
export type InsertProfile = typeof profiles.$inferInsert;

// Schémas Zod pour profiles
export const insertProfileSchema = createInsertSchema(profiles);
export const updateProfileSchema = insertProfileSchema.partial();

export const reports = pgTable("reports", {
  id: serial("id").primaryKey(),
  annonceId: text("annonce_id"),
  reporterUserId: text("reporter_user_id"),
  reason: text("reason").notNull(),
  description: text("description"),
  status: text("status").default("pending"), // 'pending' | 'reviewed' | 'resolved' | 'dismissed'
  adminResponse: text("admin_response"),
  adminUserId: text("admin_user_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const adminLogs = pgTable("admin_logs", {
  id: serial("id").primaryKey(),
  adminUserId: text("admin_user_id").notNull(),
  action: text("action").notNull(),
  targetType: text("target_type").notNull(),
  targetId: text("target_id"),
  details: json("details").$type<Record<string, any>>().default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Saved searches table for alerts
export const savedSearches = pgTable("saved_searches", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => users.id).notNull(),
  name: text("name").notNull(), // User-given name for the search
  filters: json("filters").$type<{
    category?: string;
    subcategory?: string;
    brand?: string;
    model?: string;
    yearFrom?: number;
    yearTo?: number;
    mileageFrom?: number;
    mileageTo?: number;
    priceFrom?: number;
    priceTo?: number;
    fuelType?: string;
    condition?: string;
    location?: string;
    searchTerm?: string;
  }>().notNull(),
  alertsEnabled: boolean("alerts_enabled").default(false),
  lastChecked: timestamp("last_checked"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users);
export const insertVehicleSchema = createInsertSchema(annonces).omit({ id: true });
export const insertMessageSchema = createInsertSchema(messages);
export const insertWishlistSchema = createInsertSchema(wishlist);
export const insertSavedSearchSchema = createInsertSchema(savedSearches);

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertVehicle = z.infer<typeof insertVehicleSchema>;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type InsertWishlist = z.infer<typeof insertWishlistSchema>;
export type InsertSavedSearch = z.infer<typeof insertSavedSearchSchema>;

export type User = typeof users.$inferSelect;
export type Vehicle = typeof annonces.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type Wishlist = typeof wishlist.$inferSelect;
export type SavedSearch = typeof savedSearches.$inferSelect;
