#!/usr/bin/env tsx
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { users, vehicles, messages } from '../shared/schema';
import { mockUsers, mockVehicles } from '../client/src/utils/mockData';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

// Initialize database connection
const connectionString = process.env.DATABASE_URL;
const sql = postgres(connectionString);
const db = drizzle(sql);

async function migrateData() {
  console.log('🚀 Starting migration of demo data to Supabase...');

  try {
    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await db.delete(messages);
    await db.delete(vehicles);
    await db.delete(users);

    // Insert users
    console.log('👥 Inserting users...');
    const userInserts = mockUsers.map(user => ({
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      whatsapp: user.whatsapp,
      type: user.type,
      companyName: user.companyName,
      companyLogo: user.companyLogo,
      address: user.address,
      city: user.city,
      postalCode: user.postalCode,
      website: user.website,
      siret: user.siret,
      bio: user.bio,
      avatar: user.avatar,
      specialties: user.specialties || [],
      verified: user.verified,
      emailVerified: user.emailVerified || false,
      contactPreferences: user.contactPreferences || [],
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt,
    }));

    await db.insert(users).values(userInserts);
    console.log(`✅ Inserted ${userInserts.length} users`);

    // Insert vehicles (ensuring unique IDs)
    console.log('🚗 Inserting vehicles...');
    const vehicleInserts = mockVehicles.map((vehicle, index) => ({
      id: `vehicle_${index + 1}`, // Generate unique IDs
      userId: vehicle.userId,
      title: vehicle.title,
      description: vehicle.description,
      category: vehicle.category,
      brand: vehicle.brand,
      model: vehicle.model,
      year: vehicle.year,
      mileage: vehicle.mileage,
      fuelType: vehicle.fuelType,
      condition: vehicle.condition,
      price: vehicle.price,
      location: vehicle.location,
      images: vehicle.images,
      features: vehicle.features,
      isPremium: vehicle.isPremium,
      premiumType: vehicle.premiumType,
      premiumExpiresAt: vehicle.premiumExpiresAt,
      createdAt: vehicle.createdAt,
      updatedAt: vehicle.updatedAt,
      views: vehicle.views,
      favorites: vehicle.favorites,
      status: vehicle.status,
    }));

    await db.insert(vehicles).values(vehicleInserts);
    console.log(`✅ Inserted ${vehicleInserts.length} vehicles`);

    console.log('🎉 Migration completed successfully!');
    console.log(`
📊 Summary:
- Users: ${userInserts.length}
- Vehicles: ${vehicleInserts.length}
- Messages: 0 (none in mock data)
    `);

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await sql.end();
  }
}

// Run migration
migrateData().catch(console.error);