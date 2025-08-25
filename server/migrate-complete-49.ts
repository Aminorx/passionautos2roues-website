import { supabaseServer } from './supabase';

// TOUTES LES 49 ANNONCES EXTRAITES DU MOCK DATA
const complete49Annonces = [
  // Voitures (ID 1-5)
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
  {
    user_id: 'user3',
    title: 'Volkswagen Golf VII - Très bon état',
    description: 'Volkswagen Golf VII diesel, entretien suivi en concession. Véhicule familial spacieux et économique.',
    category: 'voiture',
    brand: 'Volkswagen',
    model: 'Golf',
    year: 2019,
    mileage: 58000,
    fuel_type: 'diesel',
    condition: 'used',
    price: 22000,
    location: 'Toulouse 31000',
    images: ['https://images.pexels.com/photos/120049/pexels-photo-120049.jpeg'],
    features: ['GPS', 'Climatisation', 'Régulateur de vitesse', 'Bluetooth'],
    is_premium: false,
    views: 89,
    favorites: 7,
    status: 'approved'
  },
  {
    user_id: 'user4',
    title: 'Mercedes Classe C 220 d - Berline premium',
    description: 'Mercedes Classe C 220d, équipement complet, cuir, navigation. Entretien Mercedes, véhicule de direction.',
    category: 'voiture',
    brand: 'Mercedes',
    model: 'Classe C',
    year: 2020,
    mileage: 35000,
    fuel_type: 'diesel',
    condition: 'used',
    price: 32000,
    location: 'Nantes 44000',
    images: ['https://images.pexels.com/photos/3729464/pexels-photo-3729464.jpeg'],
    features: ['Cuir', 'GPS', 'Climatisation', 'Toit ouvrant', 'Jantes 18"'],
    is_premium: true,
    premium_type: 'monthly',
    views: 298,
    favorites: 25,
    status: 'approved'
  },
  // Motos/Scooters (ID 6-11)
  {
    user_id: 'user5',
    title: 'Kawasaki Z900 - Puissance et style',
    description: 'Kawasaki Z900 en excellent état, peu de kilomètres. Moto sportive pour passionnés.',
    category: 'moto',
    brand: 'Kawasaki',
    model: 'Z900',
    year: 2021,
    mileage: 8500,
    fuel_type: 'gasoline',
    condition: 'used',
    price: 8900,
    location: 'Nice 06000',
    images: ['https://images.pexels.com/photos/2116475/pexels-photo-2116475.jpeg'],
    features: ['ABS', 'Éclairage LED', 'Tableau de bord digital'],
    is_premium: true,
    premium_type: 'monthly',
    views: 145,
    favorites: 15,
    status: 'approved'
  },
  {
    user_id: 'user6',
    title: 'Yamaha MT-07 - Moto polyvalente',
    description: 'Yamaha MT-07, parfaite pour débuter ou se faire plaisir. Entretien à jour, pneus neufs.',
    category: 'moto',
    brand: 'Yamaha',
    model: 'MT-07',
    year: 2020,
    mileage: 15000,
    fuel_type: 'gasoline',
    condition: 'used',
    price: 6200,
    location: 'Bordeaux 33000',
    images: ['https://images.pexels.com/photos/2116475/pexels-photo-2116475.jpeg'],
    features: ['ABS', 'Compteur digital'],
    is_premium: false,
    views: 76,
    favorites: 8,
    status: 'approved'
  },
  {
    user_id: 'user7',
    title: 'Yamaha XMAX 300 - Scooter GT',
    description: 'Yamaha XMAX 300, confort et performance. Parfait pour trajets quotidiens.',
    category: 'scooter',
    brand: 'Yamaha',
    model: 'XMAX',
    year: 2019,
    mileage: 22000,
    fuel_type: 'gasoline',
    condition: 'used',
    price: 4800,
    location: 'Strasbourg 67000',
    images: ['https://images.pexels.com/photos/2116475/pexels-photo-2116475.jpeg'],
    features: ['ABS', 'Grand coffre', 'Pare-brise'],
    is_premium: false,
    views: 45,
    favorites: 3,
    status: 'approved'
  },
  {
    user_id: 'user8',
    title: 'Honda PCX 125 - Économique et fiable',
    description: 'Honda PCX 125, scooter urbain économique. Entretien Honda, très fiable.',
    category: 'scooter',
    brand: 'Honda',
    model: 'PCX',
    year: 2020,
    mileage: 18000,
    fuel_type: 'gasoline',
    condition: 'used',
    price: 2900,
    location: 'Montpellier 34000',
    images: ['https://images.pexels.com/photos/2116475/pexels-photo-2116475.jpeg'],
    features: ['Coffre', 'Éclairage LED', 'Économique'],
    is_premium: false,
    views: 89,
    favorites: 12,
    status: 'approved'
  },
  // Pièces détachées (ID 12-19)
  {
    user_id: 'user9',
    title: 'Moteur BMW 320d N47 - Révisé',
    description: 'Moteur BMW 320d N47 entièrement révisé, garantie 6 mois. Distribution changée, joint de culasse neuf.',
    category: 'piece-voiture',
    brand: 'BMW',
    model: 'Moteur N47',
    year: 2015,
    mileage: 150000,
    fuel_type: 'diesel',
    condition: 'used',
    price: 2500,
    location: 'Paris 75020',
    images: ['https://images.pexels.com/photos/190574/pexels-photo-190574.jpeg'],
    features: ['Révisé', 'Garantie 6 mois', 'Distribution neuve', 'Joint culasse neuf'],
    is_premium: false,
    views: 89,
    favorites: 7,
    status: 'approved'
  },
  {
    user_id: 'user10',
    title: 'Jantes alliage 17" BMW - Parfait état',
    description: 'Set de 4 jantes alliage BMW 17 pouces en parfait état, style 394. Avec pneus Michelin récents.',
    category: 'piece-voiture',
    brand: 'BMW',
    model: 'Jantes Style 394',
    year: 2020,
    mileage: 0,
    fuel_type: 'na',
    condition: 'used',
    price: 800,
    location: 'Lyon 69007',
    images: ['https://images.pexels.com/photos/9182360/pexels-photo-9182360.jpeg'],
    features: ['Set de 4', 'Pneus inclus', 'Parfait état', 'Style 394'],
    is_premium: true,
    premium_type: 'weekly',
    views: 156,
    favorites: 12,
    status: 'approved'
  },
  // Services (ID 20-23)
  {
    user_id: 'service1',
    title: 'Vidange + Révision - Garage Expert',
    description: 'Service complet vidange et révision toutes marques. Devis gratuit.',
    category: 'service',
    brand: 'Multimarques',
    model: 'Service Vidange',
    year: 2024,
    mileage: 0,
    fuel_type: 'na',
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

async function migrateComplete49() {
  console.log('🚀 MIGRATION COMPLÈTE DES 49 ANNONCES');
  console.log(`📊 Préparation de ${complete49Annonces.length} annonces...`);
  
  try {
    // Vider la table
    await supabaseServer.from('annonces').delete().neq('id', 0);
    console.log('🗑️ Table annonces vidée');
    
    // Insérer par lots de 5
    const batchSize = 5;
    let totalInserted = 0;
    
    for (let i = 0; i < complete49Annonces.length; i += batchSize) {
      const batch = complete49Annonces.slice(i, i + batchSize);
      
      console.log(`📦 Lot ${Math.floor(i/batchSize) + 1}/${Math.ceil(complete49Annonces.length/batchSize)}`);
      
      const { data, error } = await supabaseServer
        .from('annonces')
        .insert(batch)
        .select('id, title, category');
      
      if (error) {
        console.error(`❌ Erreur lot ${Math.floor(i/batchSize) + 1}:`, error);
        continue;
      }
      
      totalInserted += data?.length || 0;
      console.log(`✅ ${data?.length} annonces insérées`);
      
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    console.log(`🎉 MIGRATION TERMINÉE: ${totalInserted} annonces`);
    
    // Vérification finale
    const { data: finalData, error: finalError } = await supabaseServer
      .from('annonces')
      .select('category', { count: 'exact' });
    
    if (!finalError && finalData) {
      const stats = finalData.reduce((acc: any, item: any) => {
        acc[item.category] = (acc[item.category] || 0) + 1;
        return acc;
      }, {});
      
      console.log('📈 RÉPARTITION FINALE:');
      Object.entries(stats).forEach(([cat, count]) => {
        console.log(`   ${cat}: ${count} annonces`);
      });
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

migrateComplete49();