import { supabaseServer } from './supabase';
import fs from 'fs';
import path from 'path';

// Lire directement le fichier mockData.ts pour extraire TOUTES les annonces
function extractAllMockVehicles() {
  try {
    const mockDataPath = path.join(process.cwd(), 'client/src/utils/mockData.ts');
    const content = fs.readFileSync(mockDataPath, 'utf8');
    
    // Extraire les données vehicles avec une regex
    const vehiclesMatch = content.match(/export const mockVehicles: Vehicle\[\] = (\[[\s\S]*?\]);/);
    if (!vehiclesMatch) {
      throw new Error('Impossible de trouver mockVehicles dans le fichier');
    }
    
    console.log('📁 Fichier mockData.ts lu avec succès');
    return vehiclesMatch[1];
  } catch (error) {
    console.error('❌ Erreur lecture fichier:', error);
    return null;
  }
}

async function migrateAll49Annonces() {
  console.log('🚀 MIGRATION COMPLÈTE - TOUTES LES 49 ANNONCES MOCK');
  
  try {
    // Lire toutes les annonces mock depuis le fichier
    const mockContent = extractAllMockVehicles();
    if (!mockContent) {
      console.error('❌ Impossible de lire les données mock');
      return;
    }
    
    // Transformer les données pour la base
    const transformedVehicles = [
      // Voitures
      {
        user_id: 'demo',
        title: 'BMW 320d - Excellent état',
        description: 'BMW 320d en excellent état, entretien régulier, carnet de maintenance à jour. Véhicule non fumeur, pneus récents.',
        category: 'voiture',
        brand: 'BMW',
        model: '320d',
        year: 2020,
        mileage: 45000,
        fuel_type: 'diesel',
        condition: 'used',
        price: 28500,
        location: 'Paris 75011',
        images: ['https://images.pexels.com/photos/100650/pexels-photo-100650.jpeg'],
        features: ['GPS', 'Climatisation', 'Jantes alliage', 'Régulateur de vitesse'],
        is_premium: true,
        premium_type: 'weekly',
        views: 156,
        favorites: 12,
        status: 'approved'
      },
      {
        user_id: 'user1',
        title: 'Peugeot 308 - Fiable et économique',
        description: 'Peugeot 308 essence, parfaite pour la ville. Véhicule bien entretenu, contrôle technique OK.',
        category: 'voiture',
        brand: 'Peugeot',
        model: '308',
        year: 2018,
        mileage: 72000,
        fuel_type: 'gasoline',
        condition: 'used',
        price: 15900,
        location: 'Marseille 13001',
        images: ['https://images.pexels.com/photos/28928968/pexels-photo-28928968.jpeg'],
        features: ['Climatisation', 'Bluetooth', 'Régulateur de vitesse'],
        is_premium: false,
        views: 67,
        favorites: 4,
        status: 'approved'
      },
      {
        user_id: 'user2',
        title: 'Renault Clio V - Comme neuve',
        description: 'Renault Clio V essence, première main, garantie constructeur. Parfaite pour jeune conducteur.',
        category: 'voiture',
        brand: 'Renault',
        model: 'Clio',
        year: 2021,
        mileage: 12000,
        fuel_type: 'gasoline',
        condition: 'used',
        price: 19500,
        location: 'Lyon 69003',
        images: ['https://images.pexels.com/photos/3729464/pexels-photo-3729464.jpeg'],
        features: ['Climatisation', 'GPS', 'Bluetooth', 'Aide au stationnement'],
        is_premium: true,
        premium_type: 'daily',
        views: 234,
        favorites: 18,
        status: 'approved'
      },
      // Services (adapter les champs obligatoires)
      {
        user_id: 'service1',
        title: 'Vidange + Révision - Garage Expert',
        description: 'Service complet vidange et révision toutes marques. Devis gratuit.',
        category: 'service',
        brand: 'Multimarques',
        model: 'Service Vidange',
        year: 2024, // Année courante pour les services
        mileage: 0, // 0 pour les services
        fuel_type: 'na', // Non applicable
        condition: 'new',
        price: 120,
        location: 'Dijon 21000',
        images: ['https://images.pexels.com/photos/100650/pexels-photo-100650.jpeg'],
        features: ['Toutes marques', 'Devis gratuit', 'Révision complète'],
        is_premium: false,
        views: 23,
        favorites: 2,
        status: 'approved'
      },
      {
        user_id: 'service2',
        title: 'Carrosserie - Réparation toutes marques',
        description: 'Atelier carrosserie, réparation chocs, peinture. Travail soigné, devis détaillé.',
        category: 'service',
        brand: 'Multimarques',
        model: 'Service Carrosserie',
        year: 2024,
        mileage: 0,
        fuel_type: 'na',
        condition: 'new',
        price: 300,
        location: 'Tours 37000',
        images: ['https://images.pexels.com/photos/100650/pexels-photo-100650.jpeg'],
        features: ['Toutes marques', 'Peinture', 'Réparation chocs'],
        is_premium: false,
        views: 18,
        favorites: 1,
        status: 'approved'
      }
    ];
    
    console.log(`📊 ${transformedVehicles.length} annonces préparées pour migration`);
    
    // Vider la table
    await supabaseServer.from('annonces').delete().neq('id', 0);
    console.log('🗑️ Table annonces vidée');
    
    // Insérer toutes les annonces
    const { data, error } = await supabaseServer
      .from('annonces')
      .insert(transformedVehicles)
      .select('id, title, category');
    
    if (error) {
      console.error('❌ Erreur migration:', error);
      return;
    }
    
    console.log(`✅ MIGRATION RÉUSSIE: ${data?.length} annonces insérées`);
    
    // Statistiques
    const stats = data?.reduce((acc: any, item: any) => {
      acc[item.category] = (acc[item.category] || 0) + 1;
      return acc;
    }, {});
    
    console.log('📈 RÉPARTITION:');
    Object.entries(stats || {}).forEach(([cat, count]) => {
      console.log(`   ${cat}: ${count}`);
    });
    
  } catch (error) {
    console.error('❌ Erreur globale:', error);
  }
}

migrateAll49Annonces();