import { relations } from "drizzle-orm/relations";
import { users, messages, savedSearches, wishlist, annonces } from "./schema";

export const messagesRelations = relations(messages, ({one}) => ({
	user_fromUserId: one(users, {
		fields: [messages.fromUserId],
		references: [users.id],
		relationName: "messages_fromUserId_users_id"
	}),
	user_toUserId: one(users, {
		fields: [messages.toUserId],
		references: [users.id],
		relationName: "messages_toUserId_users_id"
	}),
}));

export const usersRelations = relations(users, ({many}) => ({
	messages_fromUserId: many(messages, {
		relationName: "messages_fromUserId_users_id"
	}),
	messages_toUserId: many(messages, {
		relationName: "messages_toUserId_users_id"
	}),
	savedSearches: many(savedSearches),
	wishlists: many(wishlist),
	annonces: many(annonces),
}));

export const savedSearchesRelations = relations(savedSearches, ({one}) => ({
	user: one(users, {
		fields: [savedSearches.userId],
		references: [users.id]
	}),
}));

export const wishlistRelations = relations(wishlist, ({one}) => ({
	user: one(users, {
		fields: [wishlist.userId],
		references: [users.id]
	}),
}));

export const annoncesRelations = relations(annonces, ({one}) => ({
	user: one(users, {
		fields: [annonces.userId],
		references: [users.id]
	}),
}));