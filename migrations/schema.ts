import { pgTable, serial, text, json, timestamp, foreignKey, boolean, uuid, unique, integer, real } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const adminLogs = pgTable("admin_logs", {
	id: serial().primaryKey().notNull(),
	adminUserId: text("admin_user_id").notNull(),
	action: text().notNull(),
	targetType: text("target_type").notNull(),
	targetId: text("target_id"),
	details: json().default({}),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
});

export const admins = pgTable("admins", {
	id: text().primaryKey().notNull(),
	userId: text("user_id").notNull(),
	role: text().default('moderator').notNull(),
	permissions: json().default({}),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const messages = pgTable("messages", {
	id: text().primaryKey().notNull(),
	fromUserId: text("from_user_id").notNull(),
	toUserId: text("to_user_id").notNull(),
	vehicleId: text("vehicle_id").notNull(),
	content: text().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	read: boolean().default(false),
}, (table) => [
	foreignKey({
			columns: [table.fromUserId],
			foreignColumns: [users.id],
			name: "messages_from_user_id_users_id_fk"
		}),
	foreignKey({
			columns: [table.toUserId],
			foreignColumns: [users.id],
			name: "messages_to_user_id_users_id_fk"
		}),
]);

export const savedSearches = pgTable("saved_searches", {
	id: text().primaryKey().notNull(),
	userId: text("user_id").notNull(),
	name: text().notNull(),
	filters: json().notNull(),
	alertsEnabled: boolean("alerts_enabled").default(false),
	lastChecked: timestamp("last_checked", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "saved_searches_user_id_users_id_fk"
		}),
]);

export const profiles = pgTable("profiles", {
	id: uuid().primaryKey().notNull(),
	avatarUrl: text("avatar_url"),
	accountType: text("account_type").default('individual'),
	phone: text(),
	onboardingCompleted: boolean("onboarding_completed").default(false),
	marketingConsent: boolean("marketing_consent").default(false),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const reports = pgTable("reports", {
	id: serial().primaryKey().notNull(),
	annonceId: text("annonce_id"),
	reporterUserId: text("reporter_user_id"),
	reason: text().notNull(),
	description: text(),
	status: text().default('pending'),
	adminResponse: text("admin_response"),
	adminUserId: text("admin_user_id"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const wishlist = pgTable("wishlist", {
	id: text().primaryKey().notNull(),
	userId: text("user_id").notNull(),
	vehicleId: text("vehicle_id").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "wishlist_user_id_users_id_fk"
		}),
]);

export const users = pgTable("users", {
	id: text().primaryKey().notNull(),
	email: text().notNull(),
	name: text().notNull(),
	phone: text(),
	whatsapp: text(),
	type: text().notNull(),
	companyName: text("company_name"),
	companyLogo: text("company_logo"),
	address: text(),
	city: text(),
	postalCode: text("postal_code"),
	website: text(),
	siret: text(),
	bio: text(),
	avatar: text(),
	specialties: json(),
	verified: boolean().default(false),
	emailVerified: boolean("email_verified").default(false),
	contactPreferences: json("contact_preferences"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	lastLoginAt: timestamp("last_login_at", { mode: 'string' }),
}, (table) => [
	unique("users_email_unique").on(table.email),
]);

export const annonces = pgTable("annonces", {
	id: serial().primaryKey().notNull(),
	userId: text("user_id").notNull(),
	title: text().notNull(),
	description: text().notNull(),
	category: text().notNull(),
	brand: text().notNull(),
	model: text().notNull(),
	year: integer().notNull(),
	mileage: integer(),
	fuelType: text("fuel_type"),
	condition: text().notNull(),
	price: real().notNull(),
	location: text().notNull(),
	images: json().default([]),
	features: json().default([]),
	listingType: text("listing_type").default('sale').notNull(),
	isPremium: boolean("is_premium").default(false),
	premiumType: text("premium_type"),
	premiumExpiresAt: timestamp("premium_expires_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	views: integer().default(0),
	favorites: integer().default(0),
	status: text().default('approved'),
	isActive: boolean("is_active").default(true),
	deletedAt: timestamp("deleted_at", { mode: 'string' }),
	deletionReason: text("deletion_reason"),
	deletionComment: text("deletion_comment"),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "annonces_user_id_users_id_fk"
		}),
]);
