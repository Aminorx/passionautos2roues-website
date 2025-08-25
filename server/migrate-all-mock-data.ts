import { supabaseServer } from './supabase';

// Toutes les 49 annonces des données mock
const allMockVehicles = [
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
    images: ['https://images.pexels.com/photos/100650/pexels-photo-100650.jpeg', 'https://images.pexels.com/photos/1545743/pexels-photo-1545743.jpeg'],
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
  // Motos
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
  // Scooters
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
  // Utilitaires
  {
    user_id: 'user9',
    title: 'Volkswagen Crafter - Utilitaire récent',
    description: 'Volkswagen Crafter grand volume, parfait pour déménagements ou transport professionnel.',
    category: 'utilitaire',
    brand: 'Volkswagen',
    model: 'Crafter',
    year: 2019,
    mileage: 85000,
    fuel_type: 'diesel',
    condition: 'used',
    price: 28000,
    location: 'Lille 59000',
    images: ['https://images.pexels.com/photos/3729464/pexels-photo-3729464.jpeg'],
    features: ['Grand volume', 'GPS', 'Climatisation'],
    is_premium: false,
    views: 34,
    favorites: 2,
    status: 'approved'
  },
  {
    user_id: 'user10',
    title: 'Iveco Daily - Plateau benne',
    description: 'Iveco Daily plateau benne, parfait pour artisans. Moteur révisé récemment.',
    category: 'utilitaire',
    brand: 'Iveco',
    model: 'Daily',
    year: 2018,
    mileage: 120000,
    fuel_type: 'diesel',
    condition: 'used',
    price: 22000,
    location: 'Rennes 35000',
    images: ['https://images.pexels.com/photos/3729464/pexels-photo-3729464.jpeg'],
    features: ['Plateau benne', 'Crochet remorquage'],
    is_premium: false,
    views: 28,
    favorites: 1,
    status: 'approved'
  },
  // Loisirs nautiques
  {
    user_id: 'user11',
    title: 'Jet Ski Yamaha VX Cruiser - Loisirs nautiques',
    description: 'Jet Ski Yamaha VX Cruiser 3 places, entretien suivi. Idéal vacances en famille.',
    category: 'jetski',
    brand: 'Yamaha',
    model: 'VX Cruiser',
    year: 2020,
    mileage: 45,
    fuel_type: 'gasoline',
    condition: 'used',
    price: 12500,
    location: 'Cannes 06400',
    images: ['https://images.pexels.com/photos/100650/pexels-photo-100650.jpeg'],
    features: ['3 places', 'Coffre étanche', 'GPS marine'],
    is_premium: true,
    premium_type: 'weekly',
    views: 87,
    favorites: 9,
    status: 'approved'
  },
  {
    user_id: 'user12',
    title: 'Bateau Quicksilver 505 - Moteur Mercury',
    description: 'Bateau Quicksilver 505 avec moteur Mercury 90CV. Parfait pour sorties famille.',
    category: 'bateau',
    brand: 'Quicksilver',
    model: '505',
    year: 2019,
    mileage: 120,
    fuel_type: 'gasoline',
    condition: 'used',
    price: 18500,
    location: 'La Rochelle 17000',
    images: ['https://images.pexels.com/photos/100650/pexels-photo-100650.jpeg'],
    features: ['Moteur Mercury 90CV', 'Bimini', 'Sondeur'],
    is_premium: false,
    views: 45,
    favorites: 5,
    status: 'approved'
  },
  // Poids lourds
  {
    user_id: 'user13',
    title: 'Camion Renault Midlum - Transport professionnel',
    description: 'Camion Renault Midlum 12T, caisse fourgon. Entretien professionnel suivi.',
    category: 'poids-lourd',
    brand: 'Renault',
    model: 'Midlum',
    year: 2017,
    mileage: 180000,
    fuel_type: 'diesel',
    condition: 'used',
    price: 45000,
    location: 'Clermont-Ferrand 63000',
    images: ['https://images.pexels.com/photos/3729464/pexels-photo-3729464.jpeg'],
    features: ['Caisse fourgon', 'Hayon élévateur', 'GPS'],
    is_premium: false,
    views: 23,
    favorites: 1,
    status: 'approved'
  },
  // Caravanes
  {
    user_id: 'user14',
    title: 'Caravane Hobby De Luxe - Vacances familiales',
    description: 'Caravane Hobby De Luxe 560, 4 couchages. Équipement complet pour vacances.',
    category: 'caravane',
    brand: 'Hobby',
    model: 'De Luxe 560',
    year: 2018,
    mileage: null,
    fuel_type: null,
    condition: 'used',
    price: 16500,
    location: 'Angers 49000',
    images: ['https://images.pexels.com/photos/100650/pexels-photo-100650.jpeg'],
    features: ['4 couchages', 'Cuisine équipée', 'WC douche'],
    is_premium: false,
    views: 67,
    favorites: 8,
    status: 'approved'
  },
  // Pièces détachées
  {
    user_id: 'user15',
    title: 'Moteur BMW 320d N47 - Révisé',
    description: 'Moteur BMW 320d N47 entièrement révisé, garantie 6 mois. Distribution neuve.',
    category: 'pieces',
    brand: 'BMW',
    model: 'N47',
    year: 2015,
    mileage: 150000,
    fuel_type: 'diesel',
    condition: 'used',
    price: 3500,
    location: 'Grenoble 38000',
    images: ['https://images.pexels.com/photos/100650/pexels-photo-100650.jpeg'],
    features: ['Révisé', 'Distribution neuve', 'Garantie 6 mois'],
    is_premium: false,
    views: 34,
    favorites: 3,
    status: 'approved'
  },
  {
    user_id: 'user16',
    title: 'Jantes alliage 17" BMW - Parfait état',
    description: 'Jantes alliage BMW 17 pouces avec pneus Michelin neufs. Style 397.',
    category: 'pieces',
    brand: 'BMW',
    model: 'Style 397',
    year: 2020,
    mileage: null,
    fuel_type: null,
    condition: 'used',
    price: 800,
    location: 'Nancy 54000',
    images: ['https://images.pexels.com/photos/100650/pexels-photo-100650.jpeg'],
    features: ['Pneus neufs', '17 pouces', 'Style 397'],
    is_premium: false,
    views: 45,
    favorites: 5,
    status: 'approved'
  },
  // Services d'entretien
  {
    user_id: 'user17',
    title: 'Vidange + Révision - Garage Expert',
    description: 'Service complet vidange et révision toutes marques. Devis gratuit.',
    category: 'service',
    brand: 'Multimarques',
    model: 'Service',
    year: null,
    mileage: null,
    fuel_type: null,
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
    user_id: 'user18',
    title: 'Carrosserie - Réparation toutes marques',
    description: 'Atelier carrosserie, réparation chocs, peinture. Travail soigné, devis détaillé.',
    category: 'service',
    brand: 'Multimarques',
    model: 'Carrosserie',
    year: null,
    mileage: null,
    fuel_type: null,
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

async function migrateAllMockData() {
  console.log('🚀 MIGRATION COMPLÈTE - 49 ANNONCES MOCK → TABLE ANNONCES');
  console.log(`📊 Nombre total d'annonces à migrer: ${allMockVehicles.length}`);
  
  try {
    // Vider d'abord la table (supprimer l'annonce de test)
    const { error: deleteError } = await supabaseServer
      .from('annonces')
      .delete()
      .neq('id', 0); // Supprimer toutes les entrées
    
    if (deleteError) {
      console.log('⚠️ Erreur suppression données existantes:', deleteError);
    } else {
      console.log('🗑️ Table annonces vidée');
    }
    
    // Insérer par lots de 10 pour éviter les erreurs
    const batchSize = 10;
    let totalInserted = 0;
    
    for (let i = 0; i < allMockVehicles.length; i += batchSize) {
      const batch = allMockVehicles.slice(i, i + batchSize);
      
      console.log(`📦 Migration lot ${Math.floor(i/batchSize) + 1}/${Math.ceil(allMockVehicles.length/batchSize)} (${batch.length} annonces)`);
      
      const { data, error } = await supabaseServer
        .from('annonces')
        .insert(batch)
        .select('id, title');
      
      if (error) {
        console.error(`❌ Erreur lot ${Math.floor(i/batchSize) + 1}:`, error);
        continue;
      }
      
      totalInserted += data?.length || 0;
      console.log(`✅ Lot ${Math.floor(i/batchSize) + 1} inséré: ${data?.length} annonces`);
      
      // Pause courte entre les lots
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log(`🎉 MIGRATION TERMINÉE: ${totalInserted} annonces insérées`);
    
    // Vérification finale
    const { data: finalCount, error: countError } = await supabaseServer
      .from('annonces')
      .select('*', { count: 'exact' });
    
    if (!countError && finalCount) {
      console.log(`📊 TOTAL FINAL: ${finalCount.length} annonces dans la table`);
      
      // Statistiques par catégorie
      const categories = finalCount.reduce((acc: any, item: any) => {
        acc[item.category] = (acc[item.category] || 0) + 1;
        return acc;
      }, {});
      
      console.log('📈 RÉPARTITION PAR CATÉGORIE:');
      Object.entries(categories).forEach(([cat, count]) => {
        console.log(`   ${cat}: ${count} annonces`);
      });
    }
    
  } catch (error) {
    console.error('❌ Erreur globale:', error);
  }
}

migrateAllMockData();