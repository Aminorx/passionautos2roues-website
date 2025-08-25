export interface ListingFormData {
  // Étape 1: Type d'annonce
  listingType: 'buy' | 'sell' | null;
  
  // Étape 2: Type de produit
  productType: 'car' | 'motorcycle' | 'scooter' | 'quad' | 'utility' | 'service' | 'parts' | null;
  
  // Étape 3: Titre
  title: string;
  
  // Étape 4: Immatriculation (conditionnelle)
  registrationNumber?: string;
  
  // Étape 5: Détails du produit (dynamique selon le type)
  productDetails: {
    // Commun
    brand: string;
    model: string;
    year: number;
    firstRegistrationDate?: string; // Date de première mise en circulation
    critAir?: '0' | '1' | '2' | '3' | '4' | '5' | 'non_classe'; // Vignette Crit'Air
    
    // Voiture
    mileage?: number;
    transmission?: 'manual' | 'automatic' | 'semi-automatic';
    fuelType?: 'gasoline' | 'diesel' | 'electric' | 'hybrid';
    color?: string;
    power?: number; // CV
    doors?: number;
    vehicleType?: 'citadine' | 'berline' | 'suv' | 'break' | 'coupe' | 'cabriolet' | 'monospace' | 'pickup';
    upholstery?: 'tissu' | 'cuir_partiel' | 'cuir' | 'velours' | 'alcantara';
    equipment?: string[]; // Liste des équipements
    emissionClass?: 'euro1' | 'euro2' | 'euro3' | 'euro4' | 'euro5' | 'euro6';
    
    // Moto
    displacement?: number; // Cylindrée
    motorcycleType?: 'sport' | 'touring' | 'urban' | 'trail' | 'custom' | 'roadster' | 'enduro' | 'cross';
    licenseType?: 'A' | 'A1' | 'A2' | 'AL' | 'sans_permis'; // Type de permis requis
    
    // Utilitaire
    utilityType?: 'van' | 'truck' | 'pickup' | 'trailer';
    gvw?: number; // PTAC
    volume?: number; // Volume utile
    
    // Pièce détachée
    partCategory?: string;
    partReference?: string;
    compatibility?: string;
    partCondition?: 'new' | 'used';
  };
  
  // Étape 6: État du bien (conditionnelle)
  condition?: 'like_new' | 'good' | 'average' | 'poor' | 'damaged';
  
  // Étape 7: Description
  description: string;
  
  // Étape 8: Photos
  photos: File[];
  
  // Étape 9: Prix
  price: number;
  
  // Étape 10: Localisation
  location: {
    city: string;
    postalCode: string;
    coordinates?: { lat: number; lng: number };
  };
  
  // Étape 11: Coordonnées
  contact: {
    phone: string;
    email?: string;
    hidePhone: boolean;
  };
}

export interface FormStep {
  id: number;
  title: string;
  isCompleted: boolean;
  isActive: boolean;
}