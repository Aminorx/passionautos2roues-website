import { supabaseServer } from './supabase';

// Données mock à migrer (reprises du fichier mockData.ts)
const mockVehiclesToMigrate = [
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
    images: [
      'https://images.pexels.com/photos/100650/pexels-photo-100650.jpeg',
      'https://images.pexels.com/photos/1545743/pexels-photo-1545743.jpeg'
    ],
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
  }
];

async function migrateDataToAnnonces() {
  console.log('🚀 MIGRATION DES DONNÉES MOCK VERS TABLE ANNONCES');
  console.log(`📊 Nombre d'annonces à migrer: ${mockVehiclesToMigrate.length}`);
  
  try {
    // Vérifier si la table annonces existe
    const { data: existingData, error: checkError } = await supabaseServer
      .from('annonces')
      .select('count(*)')
      .limit(1);
    
    if (checkError) {
      console.error('❌ Table annonces non trouvée. Assurez-vous qu\'elle est créée:', checkError);
      return;
    }
    
    console.log('✅ Table annonces trouvée');
    
    // Insérer toutes les données
    const { data, error } = await supabaseServer
      .from('annonces')
      .insert(mockVehiclesToMigrate)
      .select();
    
    if (error) {
      console.error('❌ Erreur migration:', error);
      return;
    }
    
    console.log('✅ MIGRATION RÉUSSIE !');
    console.log(`📋 ${data?.length || 0} annonces insérées`);
    
    // Vérification finale
    const { data: totalCount, error: countError } = await supabaseServer
      .from('annonces')
      .select('*', { count: 'exact' });
    
    if (!countError) {
      console.log(`📊 Total annonces dans la table: ${totalCount?.length || 0}`);
      
      if (totalCount && totalCount.length > 0) {
        console.log('\n📋 APERÇU DES ANNONCES MIGRÉES:');
        totalCount.slice(0, 3).forEach((annonce: any, index: number) => {
          console.log(`${index + 1}. ${annonce.title} - ${annonce.price}€ (${annonce.location})`);
        });
      }
    }
    
  } catch (error) {
    console.error('❌ Erreur globale:', error);
  }
}

migrateDataToAnnonces();