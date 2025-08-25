import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, ArrowRight, Upload, X, Check, Car, Bike, Wrench, Package, Camera, Search,
  Truck, Ship, Waves, Settings, Anchor, Sailboat, Mountain, CreditCard
} from 'lucide-react';
import { PremiumPackSelector } from './PremiumPackSelector';
import { PremiumPayment } from './PremiumPayment';
import { PublishSuccessModal } from './PublishSuccessModal';
import { AddressInput } from './AddressInput';
import { PREMIUM_PACKS } from '@/types/premium';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../hooks/useAuth';
import { getBrandsBySubcategory, fuelTypes } from '../utils/mockData';
// Nouvelles images des catégories principales
import voitureImage from '@assets/voiture-2_1752244968736.png';
import motosImage from '@assets/motos-scooters_1752244968742.png';
import piecesImage from '@assets/pieces-detachees_1752244968743.png';
import servicesImage from '@assets/services-entretien_1752244968744.png';

// Images des sous-catégories voitures-utilitaires
import voitureIcon from '@assets/voiture-_1752249166092.png';
import utilitaireIcon from '@assets/utilitaire_1752249166091.png';
import remorqueIcon from '@assets/remorque_1752249166090.png';
import caravaneIcon from '@assets/caravane_1752249166091.png';
// Images des sous-catégories motos-quad-marine
import motosIcon from '@assets/motos-scooters_1752244968742.png'; // Utiliser l'image de la catégorie principale
import scooterIcon from '@assets/scooter_1752088210843.png';
import quadIcon from '@assets/Quad_1752249742337.png';
import jetskiIcon from '@assets/Jetski_1752249742334.png';
import bateauIcon from '@assets/bateau_1752249742336.png';
import aerienIcon from '@assets/aerien_1753810777764.png';

// Images des sous-catégories services
import reparationIcon from '@assets/reparation_1752251142655.png';
import remorquageIcon from '@assets/remorquage_1752251142654.png';
import entretienIcon from '@assets/entretien_1752251142651.png';
import autreServiceIcon from '@assets/autre_1752251142652.png';

// Images pour les boutons "Je vends" et "Je cherche"
import vendreIcon from '@assets/vendre_1752258100618.png';
import chercherIcon from '@assets/chercher_1752258100621.png';

interface FormData {
  // Étape 1: Type d'annonce
  listingType: 'sale' | 'search' | '';
  
  // Étape 2: Famille principale
  category: string;
  
  // Étape 3: État du bien (seulement pour biens matériels - non services/pièces)
  condition?: 'neuf' | 'tres_bon_etat' | 'bon_etat' | 'etat_moyen' | 'pour_pieces';
  
  // Étape 4: Sous-famille
  subcategory: string;
  
  // Étape 5+: Suite habituelle
  title: string;
  registrationNumber?: string;
  specificDetails: Record<string, any>;
  description: string;
  photos: File[];
  price: number;
  location: {
    city: string;
    postalCode: string;
  };
  contact: {
    phone: string;
    email: string;
    hidePhone: boolean;
    whatsapp: string;
    sameAsPhone: boolean;
  };
  premiumPack: string;
}

const CATEGORIES = [
  {
    id: 'voiture-utilitaire',
    name: 'Voitures - Utilitaires',
    icon: Car,
    image: voitureImage,
    color: 'from-blue-500 to-blue-600',
    isMaterial: true, // Bien matériel
    subcategories: [
      { 
        id: 'voiture', 
        name: 'Voiture', 
        image: voitureIcon, 
        color: 'text-blue-500',
        bgColor: 'bg-blue-100'
      },
      { 
        id: 'utilitaire', 
        name: 'Utilitaire', 
        image: utilitaireIcon, 
        color: 'text-gray-600',
        bgColor: 'bg-gray-100'
      },
      { 
        id: 'caravane', 
        name: 'Caravane', 
        image: caravaneIcon, 
        color: 'text-green-600',
        bgColor: 'bg-green-100'
      },
      { 
        id: 'remorque', 
        name: 'Remorque', 
        image: remorqueIcon, 
        color: 'text-orange-600',
        bgColor: 'bg-orange-100'
      }
    ]
  },
  {
    id: 'moto-scooter-quad',
    name: 'Motos, Scooters, Quads',
    icon: Bike,
    image: motosImage,
    color: 'from-green-500 to-green-600',
    isMaterial: true, // Bien matériel
    subcategories: [
      { 
        id: 'moto', 
        name: 'Moto', 
        image: motosIcon, 
        color: 'text-red-500',
        bgColor: 'bg-red-100'
      },
      { 
        id: 'scooter', 
        name: 'Scooter', 
        image: scooterIcon, 
        color: 'text-purple-500',
        bgColor: 'bg-purple-100'
      },
      { 
        id: 'quad', 
        name: 'Quad', 
        image: quadIcon, 
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-100'
      }
    ]
  },
  {
    id: 'nautisme-sport-aerien',
    name: 'Nautisme, Sport et Plein air',
    icon: Anchor,
    image: bateauIcon,
    color: 'from-cyan-500 to-blue-600',
    isMaterial: true, // Bien matériel
    subcategories: [
      { 
        id: 'bateau', 
        name: 'Bateau', 
        image: bateauIcon, 
        color: 'text-blue-600',
        bgColor: 'bg-blue-100'
      },
      { 
        id: 'jetski', 
        name: 'Jet ski', 
        image: jetskiIcon, 
        color: 'text-cyan-500',
        bgColor: 'bg-cyan-100'
      },
      { 
        id: 'aerien', 
        name: 'Aérien', 
        image: aerienIcon,
        color: 'text-sky-600',
        bgColor: 'bg-sky-100'
      }
    ]
  },
  {
    id: 'services',
    name: 'Services',
    icon: Wrench,
    image: servicesImage,
    color: 'from-orange-500 to-orange-600',
    isMaterial: false, // Pas un bien matériel
    subcategories: [
      { 
        id: 'reparation', 
        name: 'Réparation', 
        image: reparationIcon,
        color: 'text-orange-500',
        bgColor: 'bg-orange-100'
      },
      { 
        id: 'remorquage', 
        name: 'Remorquage', 
        image: remorquageIcon,
        color: 'text-red-600',
        bgColor: 'bg-red-100'
      },
      { 
        id: 'entretien', 
        name: 'Entretien', 
        image: entretienIcon,
        color: 'text-green-500',
        bgColor: 'bg-green-100'
      },
      { 
        id: 'autre-service', 
        name: 'Autre', 
        image: autreServiceIcon,
        color: 'text-gray-500',
        bgColor: 'bg-gray-100'
      }
    ]
  },
  {
    id: 'pieces',
    name: 'Pièces détachées',
    icon: Package,
    image: piecesImage,
    color: 'from-purple-500 to-purple-600',
    isMaterial: false, // Pas un bien matériel (pièces détachées)
    subcategories: [
      { 
        id: 'piece-moto', 
        name: 'Pièces moto', 
        image: motosImage, // Utiliser l'image de la catégorie Motos, scooters
        color: 'text-purple-500',
        bgColor: 'bg-purple-100'
      },
      { 
        id: 'piece-voiture', 
        name: 'Pièces voiture', 
        image: voitureImage, // Utiliser l'image de la catégorie Voitures - utilitaires
        color: 'text-blue-500',
        bgColor: 'bg-blue-100'
      },
      { 
        id: 'autre-piece', 
        name: 'Autres pièces', 
        image: piecesImage, 
        color: 'text-purple-500',
        bgColor: 'bg-purple-100'
      }
    ]
  }
];

// Équipements prédéfinis pour les véhicules
const VEHICLE_EQUIPMENT = {
  car: [
    'Toit ouvrant / Toit panoramique',
    'Climatisation',
    'GPS',
    'Sièges chauffants',
    'Caméra de recul',
    'Radar de recul',
    'Jantes alliage',
    'Feux LED / Xénon',
    'Vitres électriques',
    'Airbags',
    'Sièges électriques',
    'Attelage',
    'Régulateur de vitesse',
    'Bluetooth',
    'Système audio premium',
    'Cuir'
  ],
  motorcycle: [
    'ABS',
    'Contrôle de traction',
    'Modes de conduite',
    'Éclairage LED',
    'Quickshifter',
    'Chauffage poignées',
    'Pare-brise',
    'Top case',
    'Sacoches',
    'Antivol',
    'Compteur digital',
    'USB'
  ],
  utility: [
    'Climatisation',
    'GPS',
    'Caméra de recul',
    'Radar de recul',
    'Attelage',
    'Cloison de séparation',
    'Hayon arrière',
    'Porte latérale',
    'Plancher bois',
    'Éclairage LED cargo',
    'Prise 12V',
    'Radio Bluetooth'
  ],
  caravan: [
    'Chauffage',
    'Eau courante',
    'WC',
    'Douche',
    'Frigo',
    'Plaques de cuisson',
    'Four',
    'TV',
    'Auvent',
    'Climatisation',
    'Panneaux solaires',
    'Antenne satellite'
  ],
  trailer: [
    'Bâche de protection',
    'Ridelles amovibles',
    'Rampes de chargement',
    'Sangles d\'arrimage',
    'Roue de secours',
    'Éclairage LED',
    'Plancher antidérapant',
    'Support vélo'
  ],
  scooter: [
    'ABS',
    'Coffre sous selle',
    'Éclairage LED',
    'Prise USB',
    'Pare-brise',
    'Top case',
    'Antivol',
    'Compteur digital'
  ],
  quad: [
    'Suspension sport',
    'Freins à disque',
    'Démarreur électrique',
    'Pneus tout-terrain',
    'Treuil',
    'Protection',
    'Éclairage LED',
    'Attelage'
  ],
  jetski: [
    'Système audio',
    'GPS',
    'Éclairage LED',
    'Compartiments étanches',
    'Échelle de remontée',
    'Remorque incluse',
    'Housse de protection'
  ],
  boat: [
    'GPS',
    'Sondeur',
    'Radio VHF',
    'Pilote automatique',
    'Éclairage LED',
    'Taud de soleil',
    'Échelle de bain',
    'Douche de pont',
    'WC',
    'Cuisine',
    'Couchettes'
  ],
  aircraft: [
    'Parachute de secours',
    'GPS',
    'Radio',
    'Variomètre',
    'Sac de portage',
    'Kit d\'entretien',
    'Housse de protection',
    'Manuel d\'utilisation'
  ]
};

// Options pour les différents types
const VEHICLE_TYPES = {
  car: [
    'Citadine',
    'Berline',
    'SUV',
    'Break',
    'Coupé',
    'Cabriolet',
    'Monospace',
    'Pickup'
  ],
  utility: [
    'Camionnette',
    'Fourgon',
    'Plateau',
    'Benne',
    'Frigorifique',
    'Hayon',
    'Autre'
  ],
  caravan: [
    'Caravane pliante',
    'Caravane rigide',
    'Camping-car',
    'Cellule amovible',
    'Autre'
  ],
  trailer: [
    'Remorque bagagère',
    'Remorque porte-voiture',
    'Remorque plateau',
    'Remorque benne',
    'Remorque fermée',
    'Autre'
  ],
  motorcycle: [
    'Sportive',
    'Routière',
    'Trail',
    'Custom',
    'Roadster',
    'Enduro',
    'Cross',
    'Autre'
  ],
  scooter: [
    'Scooter 50cc',
    'Scooter 125cc',
    'Scooter 250cc',
    'Maxi-scooter',
    'Scooter électrique',
    'Scooter vintage',
    'Autre'
  ],
  quad: [
    'Quad sport',
    'Quad utilitaire',
    'Quad enfant',
    'Side-by-side',
    'Autre'
  ],
  aircraft: [
    'ULM pendulaire',
    'ULM multiaxe',
    'Parapente',
    'Paramoteur',
    'Planeur',
    'Avion léger',
    'Hélicoptère',
    'Autre'
  ],
  boat: [
    'Bateau à moteur',
    'Voilier',
    'Semi-rigide',
    'Pneumatique',
    'Catamaran',
    'Pêche promenade',
    'Runabout',
    'Autre'
  ],
  jetski: [
    'Jet à bras',
    'Jet assis',
    'Jet 3 places',
    'Jet de course',
    'Autre'
  ]
};

const TRANSMISSION_TYPES = [
  { value: 'manual', label: 'Manuelle' },
  { value: 'automatic', label: 'Automatique' },
  { value: 'semi-automatic', label: 'Semi-automatique' }
];

const COLORS = [
  'Blanc', 'Noir', 'Gris', 'Argent', 'Rouge', 'Bleu', 'Vert', 'Jaune', 'Orange', 'Violet', 'Marron', 'Beige', 'Autre'
];

const DOORS = [2, 3, 4, 5];

const UPHOLSTERY_TYPES = [
  { value: 'tissu', label: 'Tissu' },
  { value: 'cuir_partiel', label: 'Cuir partiel' },
  { value: 'cuir', label: 'Cuir' },
  { value: 'velours', label: 'Velours' },
  { value: 'alcantara', label: 'Alcantara' }
];

const EMISSION_CLASSES = [
  { value: 'euro1', label: 'Euro 1' },
  { value: 'euro2', label: 'Euro 2' },
  { value: 'euro3', label: 'Euro 3' },
  { value: 'euro4', label: 'Euro 4' },
  { value: 'euro5', label: 'Euro 5' },
  { value: 'euro6', label: 'Euro 6' }
];

const LICENSE_TYPES = [
  { value: 'A', label: 'Permis A' },
  { value: 'A1', label: 'Permis A1' },
  { value: 'A2', label: 'Permis A2' },
  { value: 'AL', label: 'Permis AL' },
  { value: 'sans_permis', label: 'Sans permis' }
];

const SERVICE_TYPES = [
  'Réparation mécanique',
  'Réparation carrosserie',
  'Entretien',
  'Révision',
  'Contrôle technique',
  'Remorquage',
  'Dépannage',
  'Autre'
];

const PART_CATEGORIES = [
  'Moteur',
  'Transmission',
  'Freinage',
  'Suspension',
  'Électronique',
  'Carrosserie',
  'Intérieur',
  'Éclairage',
  'Pneumatiques',
  'Autre'
];

const PART_CONDITIONS = [
  { value: 'new', label: 'Neuf' },
  { value: 'used', label: 'Occasion' }
];

const VEHICLE_CONDITIONS = [
  { value: 'en_circulation', label: 'Roulant', description: 'Véhicule en état de circulation' },
  { value: 'accidente', label: 'Accidenté', description: 'Véhicule accidenté, vendu en l\'état' }
];

interface CreateListingFormProps {
  onSuccess?: () => void;
}

export const CreateListingForm: React.FC<CreateListingFormProps> = ({ onSuccess }) => {
  const { user, dbUser } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [autoAdvanceEnabled, setAutoAdvanceEnabled] = useState(true);
  const [showPayment, setShowPayment] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  // Configuration des pays supportés
  const COUNTRY_CODES = [
    { code: '+33', name: 'France', length: 9, format: (num: string) => num.replace(/(\d{1})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5') },
    { code: '+1', name: 'États-Unis/Canada', length: 10, format: (num: string) => num.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3') },
    { code: '+44', name: 'Royaume-Uni', length: 10, format: (num: string) => num.replace(/(\d{4})(\d{3})(\d{3})/, '$1 $2 $3') },
    { code: '+49', name: 'Allemagne', length: 10, format: (num: string) => num.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3') },
    { code: '+34', name: 'Espagne', length: 9, format: (num: string) => num.replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3') },
    { code: '+39', name: 'Italie', length: 10, format: (num: string) => num.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3') },
    { code: '+32', name: 'Belgique', length: 9, format: (num: string) => num.replace(/(\d{3})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4') },
    { code: '+41', name: 'Suisse', length: 9, format: (num: string) => num.replace(/(\d{2})(\d{3})(\d{2})(\d{2})/, '$1 $2 $3 $4') },
    { code: '+212', name: 'Maroc', length: 9, format: (num: string) => num.replace(/(\d{1})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5') },
    { code: '+213', name: 'Algérie', length: 9, format: (num: string) => num.replace(/(\d{1})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5') }
  ];

  // Fonction pour détecter et formater le numéro de téléphone international
  const formatPhoneNumber = (phone: string): string => {
    // Supprimer tous les caractères non numériques sauf le +
    const cleaned = phone.replace(/[^\d+]/g, '');
    
    // Si le numéro commence déjà par +, essayer de le formater selon le pays
    if (cleaned.startsWith('+')) {
      for (const country of COUNTRY_CODES) {
        if (cleaned.startsWith(country.code)) {
          const withoutPrefix = cleaned.slice(country.code.length);
          if (withoutPrefix.length >= country.length - 1 && withoutPrefix.length <= country.length + 1) {
            const paddedNumber = withoutPrefix.padEnd(country.length, '');
            return `${country.code} ${country.format(paddedNumber.slice(0, country.length))}`;
          }
        }
      }
      return cleaned; // Retourner tel quel si format non reconnu
    }
    
    // Pour les numéros français sans indicatif
    if (cleaned.startsWith('0') && cleaned.length === 10) {
      const withoutZero = cleaned.slice(1);
      return `+33 ${withoutZero.replace(/(\d{1})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5')}`;
    }
    
    // Si le numéro fait 9 chiffres (français sans 0), ajouter +33
    if (cleaned.length === 9 && !cleaned.startsWith('0')) {
      return `+33 ${cleaned.replace(/(\d{1})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5')}`;
    }
    
    // Si pas de format reconnu, ajouter +33 par défaut pour la France
    if (cleaned.length > 0 && !cleaned.startsWith('+')) {
      return `+33 ${cleaned}`;
    }
    
    return cleaned;
  };

  // Initialiser formData avec les fonctions de formatage
  const initializeFormData = (): FormData => ({
    listingType: '',
    category: '',
    subcategory: '',
    title: '',
    registrationNumber: '',
    specificDetails: {},
    description: '',
    photos: [],
    price: 0,
    location: { city: '', postalCode: '' },
    contact: { 
      phone: '', 
      email: '', 
      hidePhone: false,
      whatsapp: '',
      sameAsPhone: false
    },
    premiumPack: 'free'
  });

  const [formData, setFormData] = useState<FormData>(initializeFormData());

  const [vehicleDataLoading, setVehicleDataLoading] = useState(false);
  const [vehicleDataMessage, setVehicleDataMessage] = useState('');

  const totalSteps = 13; // Ajout d'une étape pack premium

  // Réinitialiser la sous-catégorie quand la catégorie change
  useEffect(() => {
    if (formData.category) {
      setFormData(prev => ({ ...prev, subcategory: '', specificDetails: {} }));
    }
  }, [formData.category]);

  // Pré-remplir avec les données utilisateur à l'initialisation
  useEffect(() => {
    if ((user || dbUser) && !formData.contact.phone && !formData.contact.email) {
      setFormData(prev => ({
        ...prev,
        contact: {
          ...prev.contact,
          phone: dbUser?.phone ? formatPhoneNumber(dbUser.phone) : '',
          email: user?.email || dbUser?.email || ''
        }
      }));
    }
  }, [user, dbUser]);

  // Avancement automatique des étapes - seulement si l'auto-avancement est activé
  useEffect(() => {
    if (autoAdvanceEnabled && currentStep === 1 && formData.listingType) {
      setTimeout(() => setCurrentStep(2), 300);
    }
  }, [formData.listingType, currentStep, autoAdvanceEnabled]);

  useEffect(() => {
    if (autoAdvanceEnabled && currentStep === 2 && formData.category) {
      // Depuis famille principale, aller toujours à sous-famille (étape 3)
      setTimeout(() => setCurrentStep(3), 300);
    }
  }, [formData.category, currentStep, autoAdvanceEnabled]);

  useEffect(() => {
    if (autoAdvanceEnabled && currentStep === 3 && formData.subcategory) {
      // Depuis sous-famille : si bien matériel nécessitant état -> étape 4, sinon -> étape 5 (titre)
      const nextStep = needsConditionStep() ? 4 : 5;
      setTimeout(() => setCurrentStep(nextStep), 300);
    }
  }, [formData.subcategory, currentStep, autoAdvanceEnabled]);

  useEffect(() => {
    if (autoAdvanceEnabled && currentStep === 4 && formData.condition && needsConditionStep()) {
      // Depuis état du bien, aller au titre (étape 5)
      setTimeout(() => setCurrentStep(5), 300);
    }
  }, [formData.subcategory, currentStep, autoAdvanceEnabled]);

  const updateFormData = (field: string, value: any) => {
    console.log('updateFormData called:', field, value);
    
    // Validation spéciale pour le titre
    if (field === 'title') {
      // Limiter à 50 caractères et ne garder que lettres, chiffres, espaces et caractères accentués
      const cleanedValue = value
        .replace(/[^a-zA-Z0-9\sÀ-ÿ]/g, '') // Garde uniquement lettres, chiffres, espaces et caractères accentués
        .substring(0, 50); // Limite à 50 caractères
      
      setFormData(prev => {
        const newData = { ...prev, [field]: cleanedValue };
        console.log('New form data (title filtered):', newData);
        return newData;
      });
    } else if (field === 'description') {
      // Validation spéciale pour la description - ne garder que lettres, chiffres, espaces et caractères accentués
      const cleanedValue = value
        .replace(/[^a-zA-Z0-9\sÀ-ÿ.,!?;:()\-]/g, '') // Garde uniquement lettres, chiffres, espaces, caractères accentués et ponctuation de base
        .substring(0, 300); // Limite à 300 caractères
      
      setFormData(prev => {
        const newData = { ...prev, [field]: cleanedValue };
        console.log('New form data (description filtered):', newData);
        return newData;
      });
    } else {
      setFormData(prev => {
        const newData = { ...prev, [field]: value };
        console.log('New form data:', newData);
        return newData;
      });
    }
    
    // Réactiver l'auto-avancement quand l'utilisateur fait un nouveau choix
    if (!autoAdvanceEnabled) {
      setAutoAdvanceEnabled(true);
    }
    
    // Auto-avancement immédiat pour l'état du bien
    if (field === 'condition' && value && currentStep === 4) {
      setTimeout(() => setCurrentStep(5), 300);
    }
  };

  const updateSpecificDetails = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      specificDetails: { ...prev.specificDetails, [field]: value }
    }));
  };

  // Validation du format d'immatriculation française
  const validateRegistrationNumber = (regNumber: string): { isValid: boolean; message: string } => {
    if (!regNumber) return { isValid: true, message: '' };
    
    // Nettoyer la chaîne (supprimer espaces et tirets)
    const cleaned = regNumber.replace(/[\s-]/g, '').toUpperCase();
    
    // Format SIV actuel (depuis 2009): AA-123-AA
    const sivPattern = /^[A-Z]{2}[0-9]{3}[A-Z]{2}$/;
    
    // Format FNI ancien (avant 2009): 1234 AB 56
    const fniPattern = /^[0-9]{1,4}[A-Z]{1,3}[0-9]{1,3}$/;
    
    if (sivPattern.test(cleaned)) {
      return { isValid: true, message: 'Format SIV valide (AA-123-AA)' };
    } else if (fniPattern.test(cleaned)) {
      return { isValid: true, message: 'Format FNI valide (1234 AB 56)' };
    } else {
      return { 
        isValid: false, 
        message: 'Format invalide. Utilisez le format SIV (AA-123-AA) ou FNI (1234 AB 56)' 
      };
    }
  };

  // Formater automatiquement l'immatriculation
  const formatRegistrationNumber = (value: string): string => {
    if (!value) return '';
    
    // Nettoyer la chaîne
    const cleaned = value.replace(/[\s-]/g, '').toUpperCase();
    
    // Tentative de formatage SIV (AA123AA -> AA-123-AA)
    if (cleaned.length >= 5) {
      const sivPattern = /^([A-Z]{2})([0-9]{3})([A-Z]{0,2}).*$/;
      const match = cleaned.match(sivPattern);
      if (match) {
        const [, letters1, numbers, letters2] = match;
        if (letters2.length === 2) {
          return `${letters1}-${numbers}-${letters2}`;
        } else if (letters2.length === 1) {
          return `${letters1}-${numbers}-${letters2}`;
        } else {
          return `${letters1}-${numbers}`;
        }
      }
    }
    
    // Tentative de formatage FNI (1234AB56 -> 1234 AB 56)
    if (cleaned.length >= 6) {
      const fniPattern = /^([0-9]{1,4})([A-Z]{1,3})([0-9]{1,3}).*$/;
      const match = cleaned.match(fniPattern);
      if (match) {
        const [, numbers1, letters, numbers2] = match;
        return `${numbers1} ${letters} ${numbers2}`;
      }
    }
    
    return cleaned;
  };

  // Validation du numéro de téléphone international
  const validatePhoneNumber = (phone: string): { isValid: boolean; message: string } => {
    if (!phone) return { isValid: false, message: 'Le numéro de téléphone est requis' };
    
    // Vérifier si le numéro commence par +
    if (!phone.startsWith('+')) {
      return { isValid: false, message: 'Le numéro doit commencer par un indicatif international (+33, +1, +44, etc.)' };
    }
    
    const cleaned = phone.replace(/[^\d]/g, '');
    
    // Vérifier pour chaque pays supporté
    for (const country of COUNTRY_CODES) {
      const countryCode = country.code.replace('+', '');
      if (cleaned.startsWith(countryCode)) {
        const withoutPrefix = cleaned.slice(countryCode.length);
        
        // Validation spécifique pour la France
        if (country.code === '+33') {
          if (withoutPrefix.length === 9) {
            const firstDigit = withoutPrefix.charAt(0);
            const validPrefixes = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
            if (validPrefixes.includes(firstDigit)) {
              return { isValid: true, message: `Numéro valide (${country.name})` };
            }
          }
        } else {
          // Validation générique pour les autres pays
          if (withoutPrefix.length >= country.length - 1 && withoutPrefix.length <= country.length + 1) {
            return { isValid: true, message: `Numéro valide (${country.name})` };
          }
        }
      }
    }
    
    // Si aucun pays reconnu, vérifier si c'est un format international valide générique
    if (cleaned.length >= 8 && cleaned.length <= 15) {
      return { isValid: true, message: 'Format international valide' };
    }
    
    return { 
      isValid: false, 
      message: 'Format invalide. Utilisez un indicatif international (ex: +33 6 12 34 56 78)' 
    };
  };

  // Fonction pour récupérer les données véhicule via API
  const fetchVehicleData = async (registrationNumber: string) => {
    if (!registrationNumber || !validateRegistrationNumber(registrationNumber).isValid) {
      return;
    }

    setVehicleDataLoading(true);
    setVehicleDataMessage('');

    try {
      const response = await fetch('/api/vehicle-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ registrationNumber }),
      });

      const result = await response.json();

      if (result.success && result.data) {
        // Pré-remplir automatiquement les détails spécifiques
        const apiData = result.data;
        const newSpecificDetails = {
          ...formData.specificDetails,
          brand: apiData.brand || formData.specificDetails.brand,
          model: apiData.model || formData.specificDetails.model,
          year: apiData.year || formData.specificDetails.year,
          fuelType: apiData.fuelType || formData.specificDetails.fuelType,
          power: apiData.power || formData.specificDetails.power,
          displacement: apiData.displacement || formData.specificDetails.displacement,
          transmission: apiData.transmission || formData.specificDetails.transmission,
          doors: apiData.doors || formData.specificDetails.doors,
          color: apiData.color || formData.specificDetails.color,
          vehicleType: apiData.vehicleType || formData.specificDetails.vehicleType,
          emissionClass: apiData.emissionClass || formData.specificDetails.emissionClass,
          critAir: apiData.critAir || formData.specificDetails.critAir,
          firstRegistrationDate: apiData.firstRegistrationDate || formData.specificDetails.firstRegistrationDate,
        };

        setFormData(prev => ({
          ...prev,
          specificDetails: newSpecificDetails
        }));

        const source = result.source === 'cache' ? 'cache' : 'API officielle';
        setVehicleDataMessage(`✅ Données récupérées depuis ${source} et pré-remplies automatiquement`);
      } else {
        setVehicleDataMessage(`⚠️ ${result.error || 'Véhicule non trouvé dans la base de données'}`);
      }
    } catch (error) {
      console.error('Erreur récupération données:', error);
      setVehicleDataMessage('❌ Erreur de connexion au service de données véhicule');
    } finally {
      setVehicleDataLoading(false);
    }
  };

  const toggleEquipment = (equipment: string) => {
    const currentEquipment = formData.specificDetails.equipment || [];
    const updatedEquipment = currentEquipment.includes(equipment)
      ? currentEquipment.filter((item: string) => item !== equipment)
      : [...currentEquipment, equipment];
    
    updateSpecificDetails('equipment', updatedEquipment);
  };

  const nextStepHandler = () => {
    const selectedCategory = getSelectedCategory();
    let nextStepNumber = currentStep + 1;
    
    // Nouvelle logique conditionnelle : Type → Famille → Sous-famille → État (si matériel) → Titre
    if (currentStep === 2) {
      // Depuis famille principale -> sous-famille (3)
      nextStepNumber = 3;
    } else if (currentStep === 3) {
      // Depuis sous-famille : si bien matériel nécessitant état -> état du bien (4), sinon -> titre (5)
      nextStepNumber = needsConditionStep() ? 4 : 5;
    } else if (currentStep === 4) {
      // Depuis état du bien -> titre (5)
      nextStepNumber = 5;
    } else {
      // Logique existante pour les étapes suivantes (réajustées pour le nouveau schéma)
      if (isSearchForParts()) {
        if (currentStep === 5) {
          // Après le titre (étape 5), aller directement à la description (étape 7)
          nextStepNumber = 7;
        } else if (currentStep === 7) {
          // Après la description (étape 7), aller aux photos (étape 8)
          nextStepNumber = 8;
        } else if (currentStep === 8) {
          // Après les photos (étape 8), aller directement aux contacts (étape 11)
          nextStepNumber = 11;
        }
      } else if (isServiceCategory()) {
        // Pour les services, ignorer l'étape 6 (Détails spécifiques)
        if (currentStep === 5) {
          // Après le titre (étape 5), aller directement à la description (étape 7)
          nextStepNumber = 7;
        }
      } else if (isSearchListing()) {
        // Pour les annonces de recherche, ignorer l'étape prix (étape 9)
        if (currentStep === 8) {
          // Après les photos (étape 8), aller directement à la localisation (étape 10)
          nextStepNumber = 10;
        }
      }
      // Autres logiques selon les besoins
    }
    
    if (nextStepNumber <= totalSteps) {
      setCurrentStep(nextStepNumber);
    }
  };

  const prevStepHandler = () => {
    // Désactiver l'auto-avancement temporairement
    setAutoAdvanceEnabled(false);
    
    // Effacer seulement les données de navigation (pas les contenus saisis par l'utilisateur)
    switch (currentStep) {
      case 2:
        // En revenant de l'étape famille principale, on efface le type d'annonce
        setFormData(prev => ({ ...prev, listingType: '' }));
        break;
      case 3:
        // En revenant de l'étape sous-famille, on efface la famille principale
        setFormData(prev => ({ ...prev, category: '' }));
        break;
      case 4:
        // En revenant de l'étape état du bien, on efface la sous-famille
        setFormData(prev => ({ ...prev, subcategory: '', condition: undefined }));
        break;
      case 5:
        // En revenant du titre, on efface l'état du bien ou la sous-famille selon le cas
        if (needsConditionStep()) {
          setFormData(prev => ({ ...prev, condition: undefined }));
        } else {
          setFormData(prev => ({ ...prev, subcategory: '' }));
        }
        break;
      // Pour les étapes 6 et suivantes, on ne supprime rien - on préserve tout le contenu utilisateur
    }
    
    const selectedCategory = getSelectedCategory();
    
    let previousStepNumber = currentStep - 1;
    
    // Nouvelle logique de navigation arrière selon le nouveau schéma
    const category = getSelectedCategory();
    
    if (currentStep === 4 && !needsConditionStep()) {
      // Si on revient de l'étape titre et qu'il n'y a pas d'étape état du bien, retourner à sous-famille (étape 3)
      previousStepNumber = 3;
    } else if (currentStep === 5) {
      // Depuis titre, revenir à état du bien (étape 4) ou à sous-famille (étape 3) selon le cas
      previousStepNumber = needsConditionStep() ? 4 : 3;
    } else {
      // Logique existante pour les étapes suivantes
      if (isSearchForParts()) {
        if (currentStep === 11) {
          // Depuis les contacts (étape 11), revenir aux photos (étape 8)
          previousStepNumber = 8;
        } else if (currentStep === 8) {
          // Depuis les photos (étape 8), revenir à la description (étape 7)
          previousStepNumber = 7;
        } else if (currentStep === 7) {
          // Depuis la description (étape 7), revenir au titre (étape 5)
          previousStepNumber = 5;
        }
      } else if (isServiceCategory()) {
        // Pour les services, gérer la navigation en arrière en sautant l'étape 6
        if (currentStep === 7) {
          // Depuis la description (étape 7), revenir au titre (étape 5)
          previousStepNumber = 5;
        }
      } else if (isSearchListing()) {
        // Pour les annonces de recherche, gérer la navigation en arrière en sautant l'étape 9
        if (currentStep === 10) {
          // Depuis la localisation (étape 10), revenir aux photos (étape 8)
          previousStepNumber = 8;
        }
      }
    }
    
    if (previousStepNumber >= 1) {
      setCurrentStep(previousStepNumber);
    }
    
    // Réactiver l'auto-avancement après un délai
    setTimeout(() => {
      setAutoAdvanceEnabled(true);
    }, 500);
  };

  const canProceed = () => {
    const result = (() => {
      switch (currentStep) {
        case 1:
          return formData.listingType !== '';
        case 2:
          return formData.category !== '';
        case 3:
          return formData.subcategory !== '';
        case 4:
          // Étape état du bien (seulement pour biens matériels)
          if (needsConditionStep()) {
            return formData.condition !== undefined;
          }
          return true; // Si pas besoin d'état, toujours valide
        case 5:
          return formData.title.trim() !== '';
        case 6:
          // Détails spécifiques - ignorer pour les recherches de pièces détachées ET les services
          if (isSearchForParts() || isServiceCategory()) {
            return true;
          }
          // Validation spécifique pour les pièces détachées
          if (formData.subcategory === 'piece-moto' || formData.subcategory === 'piece-voiture' || formData.subcategory === 'autre-piece') {
            return !!(formData.specificDetails.partCategory && formData.specificDetails.partCondition);
          }
          // Validation pour les services
          if (formData.subcategory === 'reparation' || formData.subcategory === 'remorquage' || formData.subcategory === 'entretien' || formData.subcategory === 'autre-service') {
            return !!(formData.specificDetails.serviceType && formData.specificDetails.serviceArea);
          }
          // Validation spécifique pour les voitures
          if (formData.subcategory === 'voiture') {
            return !!(formData.specificDetails.brand && 
                   formData.specificDetails.model && 
                   formData.specificDetails.year && 
                   formData.specificDetails.mileage && 
                   formData.specificDetails.fuelType &&
                   formData.specificDetails.vehicleType &&
                   formData.specificDetails.transmission);
          }
          // Validation pour les utilitaires
          if (formData.subcategory === 'utilitaire') {
            return !!(formData.specificDetails.brand && 
                   formData.specificDetails.model && 
                   formData.specificDetails.year && 
                   formData.specificDetails.mileage && 
                   formData.specificDetails.fuelType &&
                   formData.specificDetails.utilityType &&
                   formData.specificDetails.transmission);
          }
          // Validation pour les motos et scooters
          if (formData.subcategory === 'moto' || formData.subcategory === 'scooter') {
            return !!(formData.specificDetails.brand && 
                   formData.specificDetails.model && 
                   formData.specificDetails.year && 
                   formData.specificDetails.mileage &&
                   formData.specificDetails.motorcycleType);
          }
          // Validation pour les caravanes
          if (formData.subcategory === 'caravane') {
            return !!(formData.specificDetails.brand && 
                   formData.specificDetails.model && 
                   formData.specificDetails.year &&
                   formData.specificDetails.caravanType &&
                   formData.specificDetails.sleeps);
          }
          // Validation pour les remorques
          if (formData.subcategory === 'remorque') {
            return !!(formData.specificDetails.trailerType);
          }
          // Validation pour les bateaux
          if (formData.subcategory === 'bateau') {
            return !!(formData.specificDetails.brand && 
                   formData.specificDetails.model && 
                   formData.specificDetails.year &&
                   formData.specificDetails.boatType &&
                   formData.specificDetails.length);
          }
          // Validation pour les autres sous-catégories
          return !!(formData.specificDetails.brand && 
                 formData.specificDetails.model && 
                 formData.specificDetails.year);
        case 7:
          return formData.description.trim().length >= 50;
        case 8:
          return true; // Photos optionnelles - toujours permettre de passer
        case 9:
          // Ignorer cette étape pour les recherches de pièces détachées ET les annonces de recherche
          if (isSearchForParts() || isSearchListing()) {
            return true;
          }
          return formData.price > 0;
        case 10:
          // Ignorer cette étape pour les recherches de pièces détachées
          if (isSearchForParts()) {
            return true;
          }
          const locationValid = formData.location.city !== '' && formData.location.postalCode !== '';
          console.log('Step 10 validation:', {
            city: formData.location.city,
            postalCode: formData.location.postalCode,
            locationValid
          });
          return locationValid;
        case 11:
          return formData.contact.phone !== '' && validatePhoneNumber(formData.contact.phone).isValid;
        case 12:
          return true; // Étape de récapitulatif
        case 13:
          return formData.premiumPack !== '' && formData.premiumPack !== 'free'; // Sélection pack premium payant
        default:
          return false;
      }
    })();
    
    // Debug log pour identifier le problème
    console.log(`Step ${currentStep}: canProceed = ${result}`, {
      listingType: formData.listingType,
      category: formData.category,
      subcategory: formData.subcategory,
      title: formData.title,
      description: formData.description,
      price: formData.price,
      photosCount: formData.photos.length,
      needsCondition: needsConditionStep(),
      condition: formData.condition
    });
    
    return result;
  };

  const getSelectedCategory = () => {
    return CATEGORIES.find(cat => cat.id === formData.category);
  };

  const getSelectedSubcategory = () => {
    const category = getSelectedCategory();
    return category?.subcategories.find(sub => sub.id === formData.subcategory);
  };

  // Vérifier si la sous-catégorie nécessite un numéro d'immatriculation
  const needsRegistrationNumber = () => {
    const vehicleSubcategories = ['voiture', 'utilitaire', 'caravane', 'remorque', 'moto', 'scooter', 'quad', 'bateau', 'jetski', 'aerien'];
    return vehicleSubcategories.includes(formData.subcategory);
  };

  // Vérifier si la catégorie nécessite une étape d'état du bien (biens matériels uniquement)
  const needsConditionStep = () => {
    const category = getSelectedCategory();
    // Seulement pour les biens matériels, excluant services et pièces détachées
    return category?.isMaterial && category?.id !== 'services' && category?.id !== 'pieces';
  };

  // Vérifier si on est dans le cas d'une recherche de pièces détachées
  const isSearchForParts = () => {
    return formData.listingType === 'search' && formData.category === 'spare-parts';
  };

  const isServiceCategory = () => {
    return formData.category === 'services';
  };

  const isSearchListing = () => {
    return formData.listingType === 'search';
  };

  // Vérifier si on est dans le cas d'une recherche de véhicules moto/quad/marine qui n'ont pas besoin d'étape condition
  const isSearchForMotorizedVehicles = () => {
    return formData.listingType === 'search' && 
           ['motorcycle', 'scooter', 'quad', 'jetski', 'boat'].includes(formData.subcategory);
  };

  // Fonction pour publier l'annonce
  const publishListing = async () => {
    try {
      console.log('Publier l\'annonce:', formData);
      
      // Transformer les données pour l'API avec validation adaptée au type d'annonce
      const isService = formData.category === 'services';
      const isSearch = formData.listingType === 'search';
      
      const vehicleData = {
        userId: dbUser?.id || user?.id,
        title: formData.title || '',
        description: formData.description || '',
        category: formData.category || '',
        subcategory: formData.subcategory || '',
        // Tous les champs avec valeurs par défaut pour respecter les contraintes DB
        brand: (formData as any).brand || 'Non spécifié',
        model: (formData as any).model || 'Non spécifié',
        year: (formData as any).year ? parseInt((formData as any).year.toString()) : new Date().getFullYear(),
        mileage: (formData as any).mileage || 0,
        fuelType: (formData as any).fuelType || 'Non spécifié',
        condition: (formData as any).condition || 'good',
        price: formData.price || 0,
        location: formData.location || '',
        images: formData.photos?.map(photo => URL.createObjectURL(photo)) || [], 
        features: (formData as any).features || [],
        isPremium: false,
        status: 'approved',
        listingType: formData.listingType || 'sale'
      };

      console.log('🔍 FRONTEND - vehicleData avant envoi:', JSON.stringify(vehicleData, null, 2));

      const response = await fetch('/api/vehicles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(vehicleData),
      });

      if (response.ok) {
        const newVehicle = await response.json();
        console.log('Annonce créée avec succès:', newVehicle);
        
        // SOLUTION: Forcer le rechargement de la page pour actualiser le cache
        setShowSuccessModal(true);
        
        // Programmer le rechargement après l'affichage du modal de succès
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        throw new Error('Erreur lors de la création de l\'annonce');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la publication de l\'annonce. Veuillez réessayer.');
    }
  };

  // Fonction pour naviguer vers l'espace personnel
  const navigateToDashboard = () => {
    setShowSuccessModal(false);
    if (onSuccess) {
      onSuccess();
    }
    // TODO: Naviguer vers l'espace personnel/dashboard
    // navigate('/dashboard');
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setFormData(prev => {
      // Limiter à 4 photos maximum
      const remainingSlots = 4 - prev.photos.length;
      const filesToAdd = files.slice(0, remainingSlots);
      
      return {
        ...prev,
        photos: [...prev.photos, ...filesToAdd]
      };
    });
    
    // Réinitialiser l'input pour permettre de choisir d'autres fichiers
    e.target.value = '';
  };

  const removePhoto = (index: number) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }));
  };

  const renderSpecificDetailsFields = () => {
    const subcategory = getSelectedSubcategory();
    if (!subcategory) return null;

    const brands = getBrandsBySubcategory(subcategory.id);
    // Mapper les sous-catégories aux clés d'équipement
    const equipmentKey = (() => {
      switch (subcategory.id) {
        case 'voiture': return 'car';
        case 'utilitaire': return 'utility';
        case 'caravane': return 'caravan';
        case 'remorque': return 'trailer';
        case 'moto': return 'motorcycle';
        case 'scooter': return 'scooter';
        case 'quad': return 'quad';
        case 'jetski': return 'jetski';
        case 'bateau': return 'boat';
        case 'aerien': return 'aircraft';
        default: return null;
      }
    })();
    
    const equipment = equipmentKey ? VEHICLE_EQUIPMENT[equipmentKey as keyof typeof VEHICLE_EQUIPMENT] || [] : [];
    const selectedEquipment = formData.specificDetails.equipment || [];

    // Champs communs pour la plupart des véhicules
    const renderCommonVehicleFields = () => (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Marque *
          </label>
          <select
            value={formData.specificDetails.brand || ''}
            onChange={(e) => updateSpecificDetails('brand', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-bolt-500 focus:border-primary-bolt-500 transition-all"
          >
            <option value="">Sélectionnez une marque</option>
            {brands.map((brand) => (
              <option key={brand} value={brand}>
                {brand}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Modèle *
          </label>
          <input
            type="text"
            value={formData.specificDetails.model || ''}
            onChange={(e) => updateSpecificDetails('model', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-bolt-500 focus:border-primary-bolt-500 transition-all"
            placeholder="Ex: 320d"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Année *
          </label>
          <input
            type="number"
            value={formData.specificDetails.year || ''}
            onChange={(e) => updateSpecificDetails('year', parseInt(e.target.value) || '')}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-bolt-500 focus:border-primary-bolt-500 transition-all"
            placeholder="2020"
            min="1990"
            max={new Date().getFullYear() + 1}
          />
        </div>
      </div>
    );

    // Équipements
    const renderEquipment = () => (
      equipment.length > 0 && (
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-4">
            Équipements (optionnel)
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {equipment.map((item) => (
              <label
                key={item}
                className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  checked={selectedEquipment.includes(item)}
                  onChange={() => toggleEquipment(item)}
                  className="h-4 w-4 text-primary-bolt-500 focus:ring-primary-bolt-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">{item}</span>
              </label>
            ))}
          </div>
          {selectedEquipment.length > 0 && (
            <p className="text-sm text-gray-500 mt-2">
              {selectedEquipment.length} équipement{selectedEquipment.length > 1 ? 's' : ''} sélectionné{selectedEquipment.length > 1 ? 's' : ''}
            </p>
          )}
        </div>
      )
    );

    switch (subcategory.id) {
      case 'voiture':
        return (
          <div className="space-y-6">
            {renderCommonVehicleFields()}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Type de véhicule *
                </label>
                <select
                  value={formData.specificDetails.vehicleType || ''}
                  onChange={(e) => updateSpecificDetails('vehicleType', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-bolt-500 focus:border-primary-bolt-500 transition-all"
                >
                  <option value="">Sélectionnez un type</option>
                  {VEHICLE_TYPES.car?.map((type: string) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Kilométrage *
                </label>
                <input
                  type="number"
                  value={formData.specificDetails.mileage || ''}
                  onChange={(e) => updateSpecificDetails('mileage', parseInt(e.target.value) || '')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-bolt-500 focus:border-primary-bolt-500 transition-all"
                  placeholder="50000"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Boîte de vitesses *
                </label>
                <select
                  value={formData.specificDetails.transmission || ''}
                  onChange={(e) => updateSpecificDetails('transmission', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-bolt-500 focus:border-primary-bolt-500 transition-all"
                >
                  <option value="">Sélectionnez</option>
                  {TRANSMISSION_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Carburant *
                </label>
                <select
                  value={formData.specificDetails.fuelType || ''}
                  onChange={(e) => updateSpecificDetails('fuelType', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-bolt-500 focus:border-primary-bolt-500 transition-all"
                >
                  <option value="">Sélectionnez un carburant</option>
                  {fuelTypes.map((fuel) => (
                    <option key={fuel.value} value={fuel.value}>{fuel.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Couleur <span className="text-gray-500 font-normal">(optionnel)</span>
                </label>
                <select
                  value={formData.specificDetails.color || ''}
                  onChange={(e) => updateSpecificDetails('color', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-bolt-500 focus:border-primary-bolt-500 transition-all"
                >
                  <option value="">Sélectionnez une couleur</option>
                  {COLORS.map((color) => (
                    <option key={color} value={color}>{color}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Puissance (CV)
                </label>
                <input
                  type="number"
                  value={formData.specificDetails.power || ''}
                  onChange={(e) => updateSpecificDetails('power', parseInt(e.target.value) || '')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-bolt-500 focus:border-primary-bolt-500 transition-all"
                  placeholder="150"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nombre de portes <span className="text-gray-500 font-normal">(optionnel)</span>
                </label>
                <select
                  value={formData.specificDetails.doors || ''}
                  onChange={(e) => updateSpecificDetails('doors', parseInt(e.target.value) || '')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-bolt-500 focus:border-primary-bolt-500 transition-all"
                >
                  <option value="">Sélectionnez</option>
                  {DOORS.map((door) => (
                    <option key={door} value={door}>{door} portes</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Puissance fiscale (CV) <span className="text-gray-500 font-normal">(optionnel)</span>
                </label>
                <input
                  type="number"
                  value={formData.specificDetails.fiscalPower || ''}
                  onChange={(e) => updateSpecificDetails('fiscalPower', parseInt(e.target.value) || '')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-bolt-500 focus:border-primary-bolt-500 transition-all"
                  placeholder="7"
                  min="1"
                  max="50"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Sellerie
                </label>
                <select
                  value={formData.specificDetails.upholstery || ''}
                  onChange={(e) => updateSpecificDetails('upholstery', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-bolt-500 focus:border-primary-bolt-500 transition-all"
                >
                  <option value="">Sélectionnez</option>
                  {UPHOLSTERY_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Classe d'émissions <span className="text-gray-500 font-normal">(optionnel)</span>
                </label>
                <select
                  value={formData.specificDetails.emissionClass || ''}
                  onChange={(e) => updateSpecificDetails('emissionClass', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-bolt-500 focus:border-primary-bolt-500 transition-all"
                >
                  <option value="">Sélectionnez</option>
                  {EMISSION_CLASSES.map((cls) => (
                    <option key={cls.value} value={cls.value}>{cls.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {renderEquipment()}
          </div>
        );

      case 'utilitaire':
        return (
          <div className="space-y-6">
            {renderCommonVehicleFields()}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Type d'utilitaire *
                </label>
                <select
                  value={formData.specificDetails.utilityType || ''}
                  onChange={(e) => updateSpecificDetails('utilityType', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-bolt-500 focus:border-primary-bolt-500 transition-all"
                >
                  <option value="">Sélectionnez un type</option>
                  {VEHICLE_TYPES.utility?.map((type: string) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Kilométrage *
                </label>
                <input
                  type="number"
                  value={formData.specificDetails.mileage || ''}
                  onChange={(e) => updateSpecificDetails('mileage', parseInt(e.target.value) || '')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-bolt-500 focus:border-primary-bolt-500 transition-all"
                  placeholder="50000"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Boîte de vitesses *
                </label>
                <select
                  value={formData.specificDetails.transmission || ''}
                  onChange={(e) => updateSpecificDetails('transmission', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-bolt-500 focus:border-primary-bolt-500 transition-all"
                >
                  <option value="">Sélectionnez</option>
                  {TRANSMISSION_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Carburant *
                </label>
                <select
                  value={formData.specificDetails.fuelType || ''}
                  onChange={(e) => updateSpecificDetails('fuelType', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-bolt-500 focus:border-primary-bolt-500 transition-all"
                >
                  <option value="">Sélectionnez un carburant</option>
                  {fuelTypes.map((fuel) => (
                    <option key={fuel.value} value={fuel.value}>{fuel.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Charge utile (kg)
                </label>
                <input
                  type="number"
                  value={formData.specificDetails.payload || ''}
                  onChange={(e) => updateSpecificDetails('payload', parseInt(e.target.value) || '')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-bolt-500 focus:border-primary-bolt-500 transition-all"
                  placeholder="1000"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Volume utile (m³)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.specificDetails.volume || ''}
                  onChange={(e) => updateSpecificDetails('volume', parseFloat(e.target.value) || '')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-bolt-500 focus:border-primary-bolt-500 transition-all"
                  placeholder="8.5"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nombre de places
                </label>
                <select
                  value={formData.specificDetails.seats || ''}
                  onChange={(e) => updateSpecificDetails('seats', parseInt(e.target.value) || '')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-bolt-500 focus:border-primary-bolt-500 transition-all"
                >
                  <option value="">Sélectionnez</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((seat) => (
                    <option key={seat} value={seat}>{seat} place{seat > 1 ? 's' : ''}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Couleur
                </label>
                <select
                  value={formData.specificDetails.color || ''}
                  onChange={(e) => updateSpecificDetails('color', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-bolt-500 focus:border-primary-bolt-500 transition-all"
                >
                  <option value="">Sélectionnez une couleur</option>
                  {COLORS.map((color) => (
                    <option key={color} value={color}>{color}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Classe d'émissions
                </label>
                <select
                  value={formData.specificDetails.emissionClass || ''}
                  onChange={(e) => updateSpecificDetails('emissionClass', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-bolt-500 focus:border-primary-bolt-500 transition-all"
                >
                  <option value="">Sélectionnez</option>
                  {EMISSION_CLASSES.map((cls) => (
                    <option key={cls.value} value={cls.value}>{cls.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {renderEquipment()}
          </div>
        );

      case 'caravane':
        return (
          <div className="space-y-6">
            {renderCommonVehicleFields()}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Type de caravane *
                </label>
                <select
                  value={formData.specificDetails.caravanType || ''}
                  onChange={(e) => updateSpecificDetails('caravanType', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-bolt-500 focus:border-primary-bolt-500 transition-all"
                >
                  <option value="">Sélectionnez un type</option>
                  {VEHICLE_TYPES.caravan.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nombre de couchages *
                </label>
                <select
                  value={formData.specificDetails.sleeps || ''}
                  onChange={(e) => updateSpecificDetails('sleeps', parseInt(e.target.value) || '')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-bolt-500 focus:border-primary-bolt-500 transition-all"
                >
                  <option value="">Sélectionnez</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((sleep) => (
                    <option key={sleep} value={sleep}>{sleep} couchage{sleep > 1 ? 's' : ''}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Longueur (m)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.specificDetails.length || ''}
                  onChange={(e) => updateSpecificDetails('length', parseFloat(e.target.value) || '')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-bolt-500 focus:border-primary-bolt-500 transition-all"
                  placeholder="6.5"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Poids (kg)
                </label>
                <input
                  type="number"
                  value={formData.specificDetails.weight || ''}
                  onChange={(e) => updateSpecificDetails('weight', parseInt(e.target.value) || '')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-bolt-500 focus:border-primary-bolt-500 transition-all"
                  placeholder="1200"
                  min="0"
                />
              </div>
            </div>

            {renderEquipment()}
          </div>
        );

      case 'remorque':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Type de remorque *
                </label>
                <select
                  value={formData.specificDetails.trailerType || ''}
                  onChange={(e) => updateSpecificDetails('trailerType', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-bolt-500 focus:border-primary-bolt-500 transition-all"
                >
                  <option value="">Sélectionnez un type</option>
                  {VEHICLE_TYPES.trailer.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Année
                </label>
                <input
                  type="number"
                  value={formData.specificDetails.year || ''}
                  onChange={(e) => updateSpecificDetails('year', parseInt(e.target.value) || '')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-bolt-500 focus:border-primary-bolt-500 transition-all"
                  placeholder="2020"
                  min="1990"
                  max={new Date().getFullYear() + 1}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Dimensions utiles (L x l)
                </label>
                <input
                  type="text"
                  value={formData.specificDetails.dimensions || ''}
                  onChange={(e) => updateSpecificDetails('dimensions', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-bolt-500 focus:border-primary-bolt-500 transition-all"
                  placeholder="Ex: 3.0 x 1.5"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Poids à vide (kg)
                </label>
                <input
                  type="number"
                  value={formData.specificDetails.emptyWeight || ''}
                  onChange={(e) => updateSpecificDetails('emptyWeight', parseInt(e.target.value) || '')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-bolt-500 focus:border-primary-bolt-500 transition-all"
                  placeholder="300"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Poids max (PTAC) (kg)
                </label>
                <input
                  type="number"
                  value={formData.specificDetails.maxWeight || ''}
                  onChange={(e) => updateSpecificDetails('maxWeight', parseInt(e.target.value) || '')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-bolt-500 focus:border-primary-bolt-500 transition-all"
                  placeholder="750"
                  min="0"
                />
              </div>
            </div>

            {renderEquipment()}
          </div>
        );

      case 'moto':
      case 'scooter':
        return (
          <div className="space-y-6">
            {renderCommonVehicleFields()}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Type {subcategory.id === 'moto' ? 'de moto' : 'de scooter'} *
                </label>
                <select
                  value={formData.specificDetails.motorcycleType || ''}
                  onChange={(e) => updateSpecificDetails('motorcycleType', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-bolt-500 focus:border-primary-bolt-500 transition-all"
                >
                  <option value="">Sélectionnez un type</option>
                  {subcategory.id === 'moto' && VEHICLE_TYPES.motorcycle?.map((type: string) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                  {subcategory.id === 'scooter' && VEHICLE_TYPES.scooter?.map((type: string) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Kilométrage *
                </label>
                <input
                  type="number"
                  value={formData.specificDetails.mileage || ''}
                  onChange={(e) => updateSpecificDetails('mileage', parseInt(e.target.value) || '')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-bolt-500 focus:border-primary-bolt-500 transition-all"
                  placeholder="15000"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Cylindrée (cm³) *
                </label>
                <input
                  type="number"
                  value={formData.specificDetails.displacement || ''}
                  onChange={(e) => updateSpecificDetails('displacement', parseInt(e.target.value) || '')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-bolt-500 focus:border-primary-bolt-500 transition-all"
                  placeholder="600"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Couleur
                </label>
                <select
                  value={formData.specificDetails.color || ''}
                  onChange={(e) => updateSpecificDetails('color', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-bolt-500 focus:border-primary-bolt-500 transition-all"
                >
                  <option value="">Sélectionnez une couleur</option>
                  {COLORS.map((color) => (
                    <option key={color} value={color}>{color}</option>
                  ))}
                </select>
              </div>

              {subcategory.id === 'moto' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Type de permis requis
                  </label>
                  <select
                    value={formData.specificDetails.licenseType || ''}
                    onChange={(e) => updateSpecificDetails('licenseType', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-bolt-500 focus:border-primary-bolt-500 transition-all"
                  >
                    <option value="">Sélectionnez</option>
                    {LICENSE_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {renderEquipment()}
          </div>
        );

      case 'quad':
        return (
          <div className="space-y-6">
            {renderCommonVehicleFields()}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Type de quad *
                </label>
                <select
                  value={formData.specificDetails.quadType || ''}
                  onChange={(e) => updateSpecificDetails('quadType', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-bolt-500 focus:border-primary-bolt-500 transition-all"
                >
                  <option value="">Sélectionnez un type</option>
                  {VEHICLE_TYPES.quad?.map((type: string) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Kilométrage *
                </label>
                <input
                  type="number"
                  value={formData.specificDetails.mileage || ''}
                  onChange={(e) => updateSpecificDetails('mileage', parseInt(e.target.value) || '')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-bolt-500 focus:border-primary-bolt-500 transition-all"
                  placeholder="5000"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Cylindrée (cm³) *
                </label>
                <input
                  type="number"
                  value={formData.specificDetails.displacement || ''}
                  onChange={(e) => updateSpecificDetails('displacement', parseInt(e.target.value) || '')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-bolt-500 focus:border-primary-bolt-500 transition-all"
                  placeholder="450"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Couleur
                </label>
                <select
                  value={formData.specificDetails.color || ''}
                  onChange={(e) => updateSpecificDetails('color', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-bolt-500 focus:border-primary-bolt-500 transition-all"
                >
                  <option value="">Sélectionnez une couleur</option>
                  {COLORS.map((color) => (
                    <option key={color} value={color}>{color}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Transmission
                </label>
                <select
                  value={formData.specificDetails.transmission || ''}
                  onChange={(e) => updateSpecificDetails('transmission', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-bolt-500 focus:border-primary-bolt-500 transition-all"
                >
                  <option value="">Sélectionnez</option>
                  <option value="manual">Manuelle</option>
                  <option value="automatic">Automatique</option>
                </select>
              </div>
            </div>

            {renderEquipment()}
          </div>
        );

      case 'jetski':
        return (
          <div className="space-y-6">
            {renderCommonVehicleFields()}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Type de jetski *
                </label>
                <select
                  value={formData.specificDetails.jetskiType || ''}
                  onChange={(e) => updateSpecificDetails('jetskiType', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-bolt-500 focus:border-primary-bolt-500 transition-all"
                >
                  <option value="">Sélectionnez un type</option>
                  {VEHICLE_TYPES.jetski?.map((type: string) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Heures d'utilisation
                </label>
                <input
                  type="number"
                  value={formData.specificDetails.hours || ''}
                  onChange={(e) => updateSpecificDetails('hours', parseInt(e.target.value) || '')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-bolt-500 focus:border-primary-bolt-500 transition-all"
                  placeholder="50"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Puissance (CV)
                </label>
                <input
                  type="number"
                  value={formData.specificDetails.power || ''}
                  onChange={(e) => updateSpecificDetails('power', parseInt(e.target.value) || '')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-bolt-500 focus:border-primary-bolt-500 transition-all"
                  placeholder="130"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nombre de places
                </label>
                <select
                  value={formData.specificDetails.seats || ''}
                  onChange={(e) => updateSpecificDetails('seats', parseInt(e.target.value) || '')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-bolt-500 focus:border-primary-bolt-500 transition-all"
                >
                  <option value="">Sélectionnez</option>
                  {[1, 2, 3, 4].map((seat) => (
                    <option key={seat} value={seat}>{seat} place{seat > 1 ? 's' : ''}</option>
                  ))}
                </select>
              </div>
            </div>

            {renderEquipment()}
          </div>
        );

      case 'aerien':
        return (
          <div className="space-y-6">
            {renderCommonVehicleFields()}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Type d'aéronef *
                </label>
                <select
                  value={formData.specificDetails.aircraftType || ''}
                  onChange={(e) => updateSpecificDetails('aircraftType', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-bolt-500 focus:border-primary-bolt-500 transition-all"
                >
                  <option value="">Sélectionnez un type</option>
                  {VEHICLE_TYPES.aircraft?.map((type: string) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Heures de vol
                </label>
                <input
                  type="number"
                  value={formData.specificDetails.flightHours || ''}
                  onChange={(e) => updateSpecificDetails('flightHours', parseInt(e.target.value) || '')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-bolt-500 focus:border-primary-bolt-500 transition-all"
                  placeholder="200"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nombre de places
                </label>
                <select
                  value={formData.specificDetails.seats || ''}
                  onChange={(e) => updateSpecificDetails('seats', parseInt(e.target.value) || '')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-bolt-500 focus:border-primary-bolt-500 transition-all"
                >
                  <option value="">Sélectionnez</option>
                  {[1, 2, 3, 4].map((seat) => (
                    <option key={seat} value={seat}>{seat} place{seat > 1 ? 's' : ''}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Couleur
                </label>
                <select
                  value={formData.specificDetails.color || ''}
                  onChange={(e) => updateSpecificDetails('color', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-bolt-500 focus:border-primary-bolt-500 transition-all"
                >
                  <option value="">Sélectionnez une couleur</option>
                  {COLORS.map((color) => (
                    <option key={color} value={color}>{color}</option>
                  ))}
                </select>
              </div>
            </div>

            {renderEquipment()}
          </div>
        );

      case 'bateau':
        return (
          <div className="space-y-6">
            {renderCommonVehicleFields()}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Type de bateau *
                </label>
                <select
                  value={formData.specificDetails.boatType || ''}
                  onChange={(e) => updateSpecificDetails('boatType', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-bolt-500 focus:border-primary-bolt-500 transition-all"
                >
                  <option value="">Sélectionnez un type</option>
                  {VEHICLE_TYPES.boat?.map((type: string) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Longueur (m) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.specificDetails.length || ''}
                  onChange={(e) => updateSpecificDetails('length', parseFloat(e.target.value) || '')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-bolt-500 focus:border-primary-bolt-500 transition-all"
                  placeholder="6.5"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Type de moteur
                </label>
                <input
                  type="text"
                  value={formData.specificDetails.engineType || ''}
                  onChange={(e) => updateSpecificDetails('engineType', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-bolt-500 focus:border-primary-bolt-500 transition-all"
                  placeholder="Ex: Hors-bord, In-board"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Puissance moteur (CV)
                </label>
                <input
                  type="number"
                  value={formData.specificDetails.enginePower || ''}
                  onChange={(e) => updateSpecificDetails('enginePower', parseInt(e.target.value) || '')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-bolt-500 focus:border-primary-bolt-500 transition-all"
                  placeholder="115"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nombre de couchages
                </label>
                <select
                  value={formData.specificDetails.sleeps || ''}
                  onChange={(e) => updateSpecificDetails('sleeps', parseInt(e.target.value) || '')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-bolt-500 focus:border-primary-bolt-500 transition-all"
                >
                  <option value="">Sélectionnez</option>
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((sleep) => (
                    <option key={sleep} value={sleep}>
                      {sleep === 0 ? 'Aucun couchage' : `${sleep} couchage${sleep > 1 ? 's' : ''}`}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {renderEquipment()}
          </div>
        );

      case 'reparation':
      case 'remorquage':
      case 'entretien':
      case 'autre-service':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Type de service *
                </label>
                <select
                  value={formData.specificDetails.serviceType || ''}
                  onChange={(e) => updateSpecificDetails('serviceType', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-bolt-500 focus:border-primary-bolt-500 transition-all"
                >
                  <option value="">Sélectionnez un type</option>
                  {SERVICE_TYPES.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Zone d'intervention *
                </label>
                <input
                  type="text"
                  value={formData.specificDetails.serviceArea || ''}
                  onChange={(e) => updateSpecificDetails('serviceArea', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-bolt-500 focus:border-primary-bolt-500 transition-all"
                  placeholder="Ex: Paris et région parisienne"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Certificat / Agrément (optionnel)
              </label>
              <input
                type="text"
                value={formData.specificDetails.certification || ''}
                onChange={(e) => updateSpecificDetails('certification', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-bolt-500 focus:border-primary-bolt-500 transition-all"
                placeholder="Ex: Agréé assurances, Certifié ISO"
              />
            </div>
          </div>
        );

      case 'piece-moto':
      case 'piece-voiture':
      case 'autre-piece':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Type de pièce *
                </label>
                <select
                  value={formData.specificDetails.partCategory || ''}
                  onChange={(e) => updateSpecificDetails('partCategory', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-bolt-500 focus:border-primary-bolt-500 transition-all"
                >
                  <option value="">Sélectionnez un type</option>
                  {PART_CATEGORIES.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  État *
                </label>
                <select
                  value={formData.specificDetails.partCondition || ''}
                  onChange={(e) => updateSpecificDetails('partCondition', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-bolt-500 focus:border-primary-bolt-500 transition-all"
                >
                  <option value="">Sélectionnez l'état</option>
                  {PART_CONDITIONS.map((condition) => (
                    <option key={condition.value} value={condition.value}>{condition.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Référence (si disponible)
                </label>
                <input
                  type="text"
                  value={formData.specificDetails.partReference || ''}
                  onChange={(e) => updateSpecificDetails('partReference', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-bolt-500 focus:border-primary-bolt-500 transition-all"
                  placeholder="Ex: 11427788458"
                />
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Détails spécifiques pour {subcategory.name}
              </label>
              <textarea
                value={formData.specificDetails.details || ''}
                onChange={(e) => updateSpecificDetails('details', e.target.value)}
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-bolt-500 focus:border-primary-bolt-500 transition-all"
                placeholder="Renseignez les détails spécifiques..."
              />
              <p className="text-sm text-gray-500 mt-2">
                Renseignez les informations importantes pour votre {subcategory.name.toLowerCase()}.
              </p>
            </div>
          </div>
        );
    }
  };

  const renderStepContent = () => {
    const selectedCategory = getSelectedCategory();
    
    // Pour les recherches de pièces détachées, rediriger automatiquement les étapes ignorées
    if (isSearchForParts()) {
      if (currentStep === 5) {
        // Rediriger l'étape 5 vers l'étape 6 ou 7
        setCurrentStep(needsConditionStep() ? 6 : 7);
        return null;
      }
      if (currentStep === 9) {
        // Rediriger l'étape 9 vers l'étape 8 (photos) ou 11 (contacts)
        setCurrentStep(8);
        return null;
      }
      if (currentStep === 10) {
        // Rediriger l'étape 10 vers l'étape 11 (contacts)
        setCurrentStep(11);
        return null;
      }
      if (currentStep === 13) {
        // Rediriger l'étape 13 (récapitulatif) vers l'étape 12 (pack premium)
        setCurrentStep(12);
        return null;
      }
    }
    
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Type d'annonce
              </h2>
              <p className="text-gray-600">
                Que souhaitez-vous faire ?
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
              <button
                onClick={() => updateFormData('listingType', 'sale')}
                className={`relative p-8 rounded-2xl border-2 transition-all duration-200 text-center ${
                  formData.listingType === 'sale'
                    ? 'border-primary-bolt-500 bg-primary-bolt-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="mb-4">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto">
                    <img 
                      src={vendreIcon} 
                      alt="Je vends" 
                      className="w-18 h-18"
                    />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Je vends
                </h3>
                <p className="text-sm text-gray-600">
                  Déposer une annonce pour vendre un véhicule, une pièce détachée ou proposer un service
                </p>
                
                {formData.listingType === 'sale' && (
                  <div className="absolute top-4 right-4">
                    <div className="w-6 h-6 bg-primary-bolt-500 rounded-full flex items-center justify-center">
                      <Check className="h-4 w-4 text-white" />
                    </div>
                  </div>
                )}
              </button>

              <button
                onClick={() => updateFormData('listingType', 'search')}
                className={`relative p-8 rounded-2xl border-2 transition-all duration-200 text-center ${
                  formData.listingType === 'search'
                    ? 'border-primary-bolt-500 bg-primary-bolt-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="mb-4">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto">
                    <img 
                      src={chercherIcon} 
                      alt="Je cherche" 
                      className="w-18 h-18"
                    />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Je cherche
                </h3>
                <p className="text-sm text-gray-600">
                  Publier une demande de recherche pour trouver un véhicule, une pièce ou un service spécifique
                </p>
                
                {formData.listingType === 'search' && (
                  <div className="absolute top-4 right-4">
                    <div className="w-6 h-6 bg-primary-bolt-500 rounded-full flex items-center justify-center">
                      <Check className="h-4 w-4 text-white" />
                    </div>
                  </div>
                )}
              </button>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Choisissez une catégorie
              </h2>
              <p className="text-gray-600">
                Sélectionnez la catégorie qui correspond le mieux à votre {formData.listingType === 'sale' ? 'annonce' : 'recherche'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {CATEGORIES.map((category) => {
                const IconComponent = category.icon;
                return (
                  <button
                    key={category.id}
                    onClick={() => updateFormData('category', category.id)}
                    className={`relative p-6 rounded-2xl border-2 transition-all duration-200 text-left ${
                      formData.category === category.id
                        ? 'border-primary-bolt-500 bg-primary-bolt-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start space-x-4">
                      <div className="p-3 flex items-center justify-center">
                        {category.image ? (
                          <img 
                            src={category.image} 
                            alt={category.name}
                            className="h-12 w-12 object-contain"
                          />
                        ) : (
                          <div className={`p-3 rounded-xl bg-gradient-to-r ${category.color} shadow-lg flex items-center justify-center`}>
                            <IconComponent className="h-6 w-6 text-white" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {category.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {category.subcategories.map(sub => sub.name).join(', ')}
                        </p>
                      </div>
                    </div>
                    
                    {formData.category === category.id && (
                      <div className="absolute top-4 right-4">
                        <div className="w-6 h-6 bg-primary-bolt-500 rounded-full flex items-center justify-center">
                          <Check className="h-4 w-4 text-white" />
                        </div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        );

      case 3:
        // Étape sous-catégorie 
        if (!selectedCategory) return null;

        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Choisissez une sous-famille
              </h2>
              <p className="text-gray-600">
                Précisez le type de {selectedCategory.name.toLowerCase()}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {selectedCategory.subcategories.map((subcategory) => {
                return (
                  <button
                    key={subcategory.id}
                    onClick={() => updateFormData('subcategory', subcategory.id)}
                    className={`relative p-4 rounded-xl border-2 transition-all duration-200 text-center ${
                      formData.subcategory === subcategory.id
                        ? 'border-primary-bolt-500 bg-primary-bolt-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {/* Icône ou image */}
                    <div className="w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-3">
                      {subcategory.image ? (
                        <img 
                          src={subcategory.image} 
                          alt={subcategory.name}
                          className="h-14 w-14 object-contain"
                        />
                      ) : (
                        <div className={`w-12 h-12 ${subcategory.bgColor} rounded-xl flex items-center justify-center`}>
                          {/* Icône de substitution si pas d'image */}
                          <div className={`h-6 w-6 ${subcategory.color}`}>
                            ⚪
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <h3 className="font-semibold text-gray-900">
                      {subcategory.name}
                    </h3>
                    
                    {formData.subcategory === subcategory.id && (
                      <div className="absolute top-2 right-2">
                        <div className="w-6 h-6 bg-primary-bolt-500 rounded-full flex items-center justify-center">
                          <Check className="h-4 w-4 text-white" />
                        </div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        );

      case 4:
        // Étape état du bien (seulement pour biens matériels)
        if (!needsConditionStep()) {
          // Si pas besoin d'état du bien, aller directement au titre
          return null;
        }

        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                État du bien
              </h2>
              <p className="text-gray-600">
                Précisez l'état général de votre {selectedCategory?.name.toLowerCase()}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
              {[
                {
                  id: 'occasion',
                  name: 'Occasion',
                  description: 'Véhicule d\'occasion en état de marche',
                  bgColor: 'bg-blue-50',
                  borderColor: 'border-blue-500',
                  icon: '🚗'
                },
                {
                  id: 'accidente',
                  name: 'Accidenté',
                  description: 'Véhicule accidenté ou endommagé',
                  bgColor: 'bg-orange-50',
                  borderColor: 'border-orange-500',
                  icon: '⚠️'
                }
              ].map((condition) => (
                <button
                  key={condition.id}
                  onClick={() => updateFormData('condition', condition.id)}
                  className={`relative p-6 rounded-xl border-2 transition-all duration-200 text-center ${
                    formData.condition === condition.id
                      ? `${condition.borderColor} ${condition.bgColor}`
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="text-4xl mb-3">
                    {condition.icon}
                  </div>
                  
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {condition.name}
                  </h3>
                  
                  <p className="text-sm text-gray-600">
                    {condition.description}
                  </p>
                  
                  {formData.condition === condition.id && (
                    <div className="absolute top-3 right-3">
                      <div className="w-6 h-6 bg-primary-bolt-500 rounded-full flex items-center justify-center">
                        <Check className="h-4 w-4 text-white" />
                      </div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        );

      case 5:
        // Ancienne étape 4 déplacée en étape 5 : Titre
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Titre de votre {formData.listingType === 'sale' ? 'annonce' : 'recherche'}
              </h2>
              <p className="text-gray-600">
                Rédigez un titre accrocheur et descriptif
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Titre *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => updateFormData('title', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-bolt-500 focus:border-primary-bolt-500 transition-all text-lg"
                  placeholder={formData.listingType === 'sale' 
                    ? "Ex: BMW 320d excellent état" 
                    : "Ex: Recherche BMW 320d"
                  }
                  maxLength={50}
                />
                <div className="flex justify-between items-center mt-2">
                  <p className="text-sm text-gray-500">
                    Un bon titre augmente vos chances de {formData.listingType === 'sale' ? 'vente' : 'trouver ce que vous cherchez'}
                  </p>
                  <span className={`text-sm ${formData.title.length > 40 ? 'text-orange-500' : 'text-gray-400'}`}>
                    {formData.title.length}/50
                  </span>
                </div>
              </div>

              {/* Champ d'immatriculation conditionnel */}
              {needsRegistrationNumber() && formData.listingType === 'sale' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Numéro d'immatriculation (optionnel)
                  </label>
                  <input
                    type="text"
                    value={formData.registrationNumber || ''}
                    onChange={(e) => {
                      const formatted = formatRegistrationNumber(e.target.value);
                      updateFormData('registrationNumber', formatted);
                    }}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-bolt-500 focus:border-primary-bolt-500 transition-all ${
                      formData.registrationNumber && !validateRegistrationNumber(formData.registrationNumber).isValid
                        ? 'border-red-300 bg-red-50'
                        : 'border-gray-300'
                    }`}
                    placeholder="Ex: AB-123-CD ou 1234 AB 56"
                    maxLength={20}
                  />
                  <div className="mt-2 space-y-2">
                    {formData.registrationNumber && (
                      <p className={`text-sm ${
                        validateRegistrationNumber(formData.registrationNumber).isValid 
                          ? 'text-green-600' 
                          : 'text-red-600'
                      }`}>
                        {validateRegistrationNumber(formData.registrationNumber).message}
                      </p>
                    )}
                    
                    {/* Bouton pour récupérer les données automatiquement */}
                    {formData.registrationNumber && validateRegistrationNumber(formData.registrationNumber).isValid && (
                      <div className="flex items-center space-x-3">
                        <button
                          type="button"
                          onClick={() => fetchVehicleData(formData.registrationNumber!)}
                          disabled={vehicleDataLoading}
                          className="flex items-center px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {vehicleDataLoading ? (
                            <>
                              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                              Récupération...
                            </>
                          ) : (
                            <>
                              <Search className="h-4 w-4 mr-2" />
                              Pré-remplir automatiquement
                            </>
                          )}
                        </button>
                      </div>
                    )}
                    
                    {/* Message de retour */}
                    {vehicleDataMessage && (
                      <div className={`text-sm p-3 rounded-lg ${
                        vehicleDataMessage.startsWith('✅') 
                          ? 'bg-green-50 text-green-700 border border-green-200' 
                          : vehicleDataMessage.startsWith('⚠️')
                          ? 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                          : 'bg-red-50 text-red-700 border border-red-200'
                      }`}>
                        {vehicleDataMessage}
                      </div>
                    )}
                    
                    <p className="text-sm text-gray-500">
                      Formats acceptés : SIV (AA-123-AA) depuis 2009 ou FNI (1234 AB 56) avant 2009
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 6:
        // Étape 6 : Détails spécifiques (ancienne étape 5)
        // Ignorer cette étape pour les services - ne pas afficher
        if (isServiceCategory()) {
          return null;
        }
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Détails spécifiques
              </h2>
              <p className="text-gray-600">
                Renseignez les caractéristiques importantes de votre {getSelectedSubcategory()?.name.toLowerCase()}
              </p>
            </div>

            {renderSpecificDetailsFields()}
          </div>
        );

      case 7:
        // Étape 7 : Description (ancienne étape 7 reste la même)
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Description détaillée
              </h2>
              <p className="text-gray-600">
                Décrivez votre {getSelectedSubcategory()?.name.toLowerCase()} en détail
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Description * <span className="text-gray-500 font-normal">(50-300 caractères)</span>
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => updateFormData('description', e.target.value)}
                rows={8}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-bolt-500 focus:border-primary-bolt-500 transition-all ${
                  formData.description.length > 0 && formData.description.length < 50 
                    ? 'border-red-300 bg-red-50' 
                    : 'border-gray-300'
                }`}
                placeholder="Décrivez l'état, l'historique, les équipements, les points forts, etc. Soyez précis et détaillé pour attirer les acheteurs."
                minLength={50}
                maxLength={300}
              />
              <div className="flex justify-between items-center mt-2">
                <p className="text-sm text-gray-500">
                  Plus votre description est détaillée, plus vous avez de chances d'attirer des acheteurs sérieux.
                </p>
                <div className="flex flex-col text-right">
                  <span className={`text-sm font-medium ${
                    formData.description.length < 50 
                      ? 'text-red-500' 
                      : formData.description.length > 280 
                      ? 'text-orange-500'
                      : 'text-green-600'
                  }`}>
                    {formData.description.length}/300 caractères
                  </span>
                  {formData.description.length < 50 && (
                    <span className="text-xs text-red-500">
                      (minimum 50 caractères)
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      case 8:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Photos de votre {getSelectedSubcategory()?.name.toLowerCase()}
              </h2>
              <p className="text-gray-600">
                Ajoutez des photos de qualité pour attirer plus d'acheteurs (maximum 4 photos)
              </p>
            </div>

            <div className="space-y-6">
              {/* Zone de upload */}
              {formData.photos.length < 4 ? (
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-primary-bolt-500 transition-colors">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                    id="photo-upload"
                  />
                  <label htmlFor="photo-upload" className="cursor-pointer">
                    <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Glissez vos photos ici
                    </h3>
                    <p className="text-gray-600 mb-4">
                      ou cliquez pour sélectionner des fichiers
                    </p>
                    <div className="bg-primary-bolt-500 text-white px-6 py-2 rounded-lg hover:bg-primary-bolt-600 transition-colors inline-block">
                      Choisir des photos
                    </div>
                  </label>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center bg-gray-50">
                  <Camera className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-500 mb-2">
                    Limite de 4 photos atteinte
                  </h3>
                  <p className="text-gray-400 mb-4">
                    Supprimez une photo pour en ajouter d'autres
                  </p>
                </div>
              )}

              {/* Aperçu des photos */}
              {formData.photos.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Photos sélectionnées ({formData.photos.length})
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {formData.photos.map((photo, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={URL.createObjectURL(photo)}
                          alt={`Photo ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <button
                          onClick={() => removePhoto(index)}
                          className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 9:
        // Masquer cette étape pour les annonces de recherche
        if (isSearchListing()) {
          return null;
        }
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Prix de {formData.listingType === 'sale' ? 'vente' : 'budget maximum'}
              </h2>
              <p className="text-gray-600">
                {formData.listingType === 'sale' 
                  ? `Fixez un prix attractif pour votre ${getSelectedSubcategory()?.name.toLowerCase()}`
                  : `Indiquez votre budget maximum pour votre recherche`
                }
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {formData.listingType === 'sale' ? 'Prix (€) *' : 'Budget maximum (€) *'}
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={formData.price || ''}
                  onChange={(e) => updateFormData('price', parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-bolt-500 focus:border-primary-bolt-500 transition-all text-lg"
                  placeholder="0"
                  min="0"
                />
                <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                  €
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                {formData.listingType === 'sale' 
                  ? 'Consultez des annonces similaires pour fixer un prix compétitif'
                  : 'Indiquez le budget maximum que vous êtes prêt à dépenser'
                }
              </p>
            </div>
          </div>
        );

      case 10:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Localisation
              </h2>
              <p className="text-gray-600">
                Où se trouve votre {getSelectedSubcategory()?.name.toLowerCase()} ?
              </p>
            </div>

            <AddressInput
              postalCode={formData.location.postalCode}
              city={formData.location.city}
              onPostalCodeChange={(postalCode) => {
                console.log('Form updating postal code:', postalCode);
                setFormData(prev => {
                  const newLocation = { ...prev.location, postalCode };
                  const newData = { ...prev, location: newLocation };
                  console.log('Direct form update - new location:', newLocation);
                  console.log('Direct form update - complete data:', newData);
                  return newData;
                });
              }}
              onCityChange={(city) => {
                console.log('Form updating city:', city);
                setFormData(prev => {
                  const newLocation = { ...prev.location, city };
                  const newData = { ...prev, location: newLocation };
                  console.log('Direct form update - new location:', newLocation);
                  console.log('Direct form update - complete data:', newData);
                  return newData;
                });
              }}
            />
          </div>
        );

      case 11:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Informations de contact
              </h2>
              <p className="text-gray-600">
                Comment les {formData.listingType === 'sale' ? 'acheteurs' : 'vendeurs'} peuvent-ils vous contacter ?
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Téléphone * (avec indicatif international)
                </label>
                <div className="text-xs text-gray-500 mb-2">
                  Exemples : +33 (France), +1 (USA/Canada), +44 (UK), +49 (Allemagne), +34 (Espagne)
                </div>
                <input
                  type="tel"
                  value={formData.contact.phone}
                  onChange={(e) => {
                    const formatted = formatPhoneNumber(e.target.value);
                    const updatedContact = { ...formData.contact, phone: formatted };
                    
                    // Si "même numéro WhatsApp" est coché, copier automatiquement
                    if (formData.contact.sameAsPhone) {
                      updatedContact.whatsapp = formatted;
                    }
                    
                    updateFormData('contact', updatedContact);
                  }}
                  onBlur={(e) => {
                    // Validation lors de la perte de focus
                    const validation = validatePhoneNumber(e.target.value);
                    if (!validation.isValid) {
                      console.log('Erreur de validation téléphone:', validation.message);
                    }
                  }}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-bolt-500 focus:border-primary-bolt-500 transition-all ${
                    formData.contact.phone && !validatePhoneNumber(formData.contact.phone).isValid
                      ? 'border-red-300 bg-red-50'
                      : 'border-gray-300'
                  }`}
                  placeholder="+33 6 12 34 56 78 (France par défaut)"
                  maxLength={25}
                />
                {formData.contact.phone && (
                  <p className={`text-sm mt-1 ${
                    validatePhoneNumber(formData.contact.phone).isValid
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}>
                    {validatePhoneNumber(formData.contact.phone).message}
                  </p>
                )}
                
                {/* Checkbox pour masquer le téléphone - déplacée ici */}
                <div className="flex items-center mt-3">
                  <input
                    type="checkbox"
                    id="hidePhone"
                    checked={formData.contact.hidePhone}
                    onChange={(e) => updateFormData('contact', {
                      ...formData.contact,
                      hidePhone: e.target.checked
                    })}
                    className="h-4 w-4 text-primary-bolt-600 focus:ring-primary-bolt-500 border-gray-300 rounded"
                  />
                  <label htmlFor="hidePhone" className="ml-2 text-sm text-gray-700">
                    Masquer mon numéro de téléphone dans l'annonce
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  WhatsApp
                </label>
                
                <div className="mb-3">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.contact.sameAsPhone}
                      onChange={(e) => {
                        const sameAsPhone = e.target.checked;
                        updateFormData('contact', { 
                          ...formData.contact, 
                          sameAsPhone,
                          whatsapp: sameAsPhone ? formData.contact.phone : ''
                        });
                      }}
                      className="w-4 h-4 text-primary-bolt-600 border-gray-300 rounded focus:ring-primary-bolt-500"
                    />
                    <span className="text-sm text-gray-700">
                      Mon numéro WhatsApp est le même que mon numéro de téléphone
                    </span>
                  </label>
                </div>

                {!formData.contact.sameAsPhone && (
                  <div>
                    <input
                      type="tel"
                      value={formData.contact.whatsapp}
                      onChange={(e) => {
                        const formatted = formatPhoneNumber(e.target.value);
                        updateFormData('contact', { ...formData.contact, whatsapp: formatted });
                      }}
                      onBlur={(e) => {
                        const validation = validatePhoneNumber(e.target.value);
                        if (!validation.isValid && e.target.value) {
                          console.log('Erreur de validation WhatsApp:', validation.message);
                        }
                      }}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-bolt-500 focus:border-primary-bolt-500 transition-all ${
                        formData.contact.whatsapp && !validatePhoneNumber(formData.contact.whatsapp).isValid
                          ? 'border-red-300 bg-red-50'
                          : 'border-gray-300'
                      }`}
                      placeholder="+33 6 12 34 56 78 (WhatsApp)"
                      maxLength={25}
                    />
                    {formData.contact.whatsapp && (
                      <p className={`text-sm mt-1 ${
                        validatePhoneNumber(formData.contact.whatsapp).isValid
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}>
                        {validatePhoneNumber(formData.contact.whatsapp).message}
                      </p>
                    )}
                  </div>
                )}

                {formData.contact.sameAsPhone && formData.contact.phone && (
                  <div className="bg-gray-50 p-3 rounded-xl">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">WhatsApp :</span> {formData.contact.phone}
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email (optionnel)
                </label>
                <input
                  type="email"
                  value={formData.contact.email}
                  onChange={(e) => updateFormData('contact', { ...formData.contact, email: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-bolt-500 focus:border-primary-bolt-500 transition-all"
                  placeholder="votre@email.com"
                />
              </div>


            </div>
          </div>
        );

      case 12:
        return (
          <div className="space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Récapitulatif de votre {formData.listingType === 'sale' ? 'annonce' : 'recherche'}
              </h2>
              <p className="text-gray-600">
                Vérifiez les informations avant de publier votre {formData.listingType === 'sale' ? 'annonce' : 'recherche'}
              </p>
            </div>

            {/* Affichage du récapitulatif */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations générales</h3>
                  <dl className="space-y-3">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Type</dt>
                      <dd className="text-sm text-gray-900">
                        {formData.listingType === 'sale' ? 'Vendre' : 'Rechercher'}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Catégorie</dt>
                      <dd className="text-sm text-gray-900">{formData.category}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Titre</dt>
                      <dd className="text-sm text-gray-900">{formData.title}</dd>
                    </div>
                    {formData.price > 0 && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Prix</dt>
                        <dd className="text-sm text-gray-900">{formData.price}€</dd>
                      </div>
                    )}
                  </dl>
                </div>

                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact</h3>
                  <dl className="space-y-3">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Téléphone</dt>
                      <dd className="text-sm text-gray-900">{formData.contact.phone}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">WhatsApp</dt>
                      <dd className="text-sm text-gray-900">
                        {formData.contact.sameAsPhone 
                          ? `${formData.contact.phone} (même que téléphone)`
                          : formData.contact.whatsapp || 'Non renseigné'
                        }
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Localisation</dt>
                      <dd className="text-sm text-gray-900">
                        {formData.location.postalCode} {formData.location.city}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Description</h3>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {formData.description}
                  </p>
                </div>

                {/* Section équipements sélectionnés */}
                {formData.specificDetails.equipment && formData.specificDetails.equipment.length > 0 && (
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Équipements</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {formData.specificDetails.equipment.map((equipment: string, index: number) => (
                        <div key={index} className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-sm text-gray-700">{equipment}</span>
                        </div>
                      ))}
                    </div>
                    <p className="text-sm text-gray-500 mt-3">
                      {formData.specificDetails.equipment.length} équipement{formData.specificDetails.equipment.length > 1 ? 's' : ''} sélectionné{formData.specificDetails.equipment.length > 1 ? 's' : ''}
                    </p>
                  </div>
                )}

                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Photos</h3>
                  {formData.photos.length > 0 ? (
                    <div className="space-y-3">
                      <p className="text-sm text-gray-600">
                        {formData.photos.length} photo{formData.photos.length !== 1 ? 's' : ''} ajoutée{formData.photos.length !== 1 ? 's' : ''}
                      </p>
                      <div className="grid grid-cols-3 gap-2">
                        {formData.photos.map((photo, index) => (
                          <div key={index} className="relative aspect-square">
                            <img
                              src={URL.createObjectURL(photo)}
                              alt={`Photo ${index + 1}`}
                              className="w-full h-full object-cover rounded-lg border border-gray-200"
                            />
                            {index === 0 && (
                              <div className="absolute top-1 left-1 bg-primary-bolt-500 text-white text-xs px-2 py-1 rounded">
                                Principal
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-600">
                      Aucune photo ajoutée
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      case 13:
        if (showPayment) {
          return (
            <PremiumPayment
              selectedPack={formData.premiumPack}
              onPaymentSuccess={() => {
                setShowPayment(false);
                // Publier l'annonce après paiement réussi
                console.log('Publier l\'annonce avec pack premium:', formData);
                setShowPayment(false);
                publishListing();
              }}
              onBack={() => setShowPayment(false)}
            />
          );
        }
        return (
          <PremiumPackSelector
            selectedPack={formData.premiumPack}
            onSelectPack={(packId) => updateFormData('premiumPack', packId)}
          />
        );

      case 14:
        return (
          <div className="space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Récapitulatif final
              </h2>
              <p className="text-gray-600">
                Vérifiez les informations avant de publier votre {formData.listingType === 'sale' ? 'annonce' : 'recherche'}
              </p>
            </div>

            <div className="space-y-6">
              {/* Catégorie et sous-catégorie */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Catégorie</h3>
                <div className="flex items-center space-x-3">
                  <span className="px-3 py-1 bg-primary-bolt-100 text-primary-bolt-500 rounded-full text-sm font-medium">
                    {selectedCategory?.name}
                  </span>
                  <span className="text-gray-400">→</span>
                  <span className="px-3 py-1 bg-primary-bolt-100 text-primary-bolt-500 rounded-full text-sm font-medium">
                    {getSelectedSubcategory()?.name}
                  </span>
                </div>
              </div>

              {/* Titre et prix */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Titre et prix</h3>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="text-xl font-bold text-gray-900 mb-2">{formData.title || 'Titre non renseigné'}</h4>
                    {formData.registrationNumber && (
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Immatriculation:</span> {formData.registrationNumber}
                      </p>
                    )}
                  </div>
                  
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary-bolt-500">
                      {formData.price.toLocaleString('fr-FR')} €
                    </div>
                  </div>
                </div>
              </div>

              {/* Détails spécifiques */}
              {Object.keys(formData.specificDetails).length > 0 && (
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Détails spécifiques</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(formData.specificDetails).map(([key, value]) => {
                      if (key === 'equipment' && Array.isArray(value)) {
                        return (
                          <div key={key} className="md:col-span-2">
                            <span className="font-medium text-gray-900">Équipements:</span>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {value.map((equipment: string, index: number) => (
                                <span key={index} className="px-2 py-1 bg-primary-bolt-100 text-primary-bolt-700 rounded-md text-sm">
                                  {equipment}
                                </span>
                              ))}
                            </div>
                          </div>
                        );
                      }
                      
                      if (value && value !== '') {
                        const displayKey = (() => {
                          switch(key) {
                            case 'brand': return 'Marque';
                            case 'model': return 'Modèle';
                            case 'year': return 'Année';
                            case 'mileage': return 'Kilométrage';
                            case 'fuelType': return 'Carburant';
                            case 'transmission': return 'Transmission';
                            case 'color': return 'Couleur';
                            case 'doors': return 'Portes';
                            case 'power': return 'Puissance (CV)';
                            case 'displacement': return 'Cylindrée (cm³)';
                            case 'motorcycleType': return 'Type de moto';
                            case 'licenseType': return 'Permis requis';
                            case 'length': return 'Longueur (m)';
                            case 'engineType': return 'Type de moteur';
                            case 'enginePower': return 'Puissance moteur (CV)';
                            case 'boatType': return 'Type de bateau';
                            case 'utilityType': return 'Type d\'utilitaire';
                            case 'gvw': return 'PTAC (kg)';
                            case 'volume': return 'Volume utile (m³)';
                            default: return key;
                          }
                        })();
                        
                        const displayValue = (() => {
                          if (key === 'fuelType') {
                            const fuelLabels: Record<string, string> = {
                              gasoline: 'Essence',
                              diesel: 'Diesel',
                              electric: 'Électrique',
                              hybrid: 'Hybride'
                            };
                            return fuelLabels[value as string] || value;
                          }
                          if (key === 'transmission') {
                            const transmissionLabels: Record<string, string> = {
                              manual: 'Manuelle',
                              automatic: 'Automatique',
                              'semi-automatic': 'Semi-automatique'
                            };
                            return transmissionLabels[value as string] || value;
                          }
                          return value;
                        })();
                        
                        return (
                          <div key={key}>
                            <span className="font-medium text-gray-900">{displayKey}:</span>
                            <span className="text-gray-700 ml-2">{displayValue}</span>
                          </div>
                        );
                      }
                      return null;
                    })}
                  </div>
                </div>
              )}

              {/* État général */}
              {formData.condition && needsConditionStep() && (
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">État général</h3>
                  <div className="flex items-center space-x-3">
                    <span className="px-3 py-1 bg-primary-bolt-100 text-primary-bolt-500 rounded-full text-sm font-medium">
                      {VEHICLE_CONDITIONS.find(c => c.value === formData.condition)?.label}
                    </span>
                  </div>
                </div>
              )}

              {/* Description */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Description</h3>
                <p className="text-gray-700 whitespace-pre-line">{formData.description}</p>
              </div>

              {/* Photos */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Photos ({formData.photos.length})</h3>
                {formData.photos.length > 0 ? (
                  <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
                    {formData.photos.map((photo, index) => (
                      <div key={index} className="aspect-square">
                        <img
                          src={URL.createObjectURL(photo)}
                          alt={`Photo ${index + 1}`}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">Aucune photo ajoutée</p>
                )}
              </div>

              {/* Localisation et contact */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Localisation</h3>
                  <p className="text-gray-700">
                    {formData.location.postalCode} {formData.location.city}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact</h3>
                  <div className="space-y-2">
                    <p className="text-gray-700">
                      <span className="font-medium">Téléphone:</span> {formData.contact.hidePhone ? 'Masqué' : formData.contact.phone}
                    </p>
                    <p className="text-gray-700">
                      <span className="font-medium">WhatsApp:</span> {
                        formData.contact.sameAsPhone 
                          ? `${formData.contact.phone} (même que téléphone)`
                          : formData.contact.whatsapp || 'Non renseigné'
                      }
                    </p>
                    {formData.contact.email && (
                      <p className="text-gray-700">
                        <span className="font-medium">Email:</span> {formData.contact.email}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (!user && !dbUser) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center bg-gray-50 p-8 rounded-xl border border-gray-200">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🔒</span>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Connexion requise</h3>
          <p className="text-gray-600">Vous devez être connecté pour déposer une annonce.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white">
      <div className="max-w-full mx-auto px-6 py-6">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">
              {formData.listingType === 'sale' ? 'Vente' : formData.listingType === 'search' ? 'Recherche' : 'Déposer une annonce'}
              {formData.listingType && ' - Déposer une annonce'}
            </h1>
            <span className="text-sm font-medium text-gray-600">
              Étape {currentStep} sur {totalSteps}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-primary-bolt-500 to-primary-bolt-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          {renderStepContent()}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => {
              if (currentStep === 13 && showPayment) {
                // Retour depuis le paiement vers la sélection des packs
                setShowPayment(false);
              } else {
                prevStepHandler();
              }
            }}
            disabled={currentStep === 1}
            className="flex items-center space-x-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Précédent</span>
          </button>

          {currentStep === 12 ? (
            // Étape récapitulatif - afficher les deux options
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => {
                  // Publication gratuite directe
                  publishListing();
                }}
                className="flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <Check className="h-4 w-4" />
                <span>Publier gratuitement</span>
              </button>
              
              <button
                onClick={() => {
                  setCurrentStep(13);
                }}
                className="flex items-center justify-center space-x-2 bg-gradient-to-r from-primary-bolt-500 to-primary-bolt-600 hover:from-primary-bolt-600 hover:to-primary-bolt-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <CreditCard className="h-4 w-4" />
                <span>Booster l'annonce</span>
              </button>
            </div>
          ) : currentStep === 13 && !showPayment ? (
            // Étape sélection pack premium
            <button
              onClick={() => {
                const selectedPackData = PREMIUM_PACKS.find(pack => pack.id === formData.premiumPack);
                if (selectedPackData && selectedPackData.price > 0) {
                  setShowPayment(true);
                }
              }}
              disabled={!formData.premiumPack || formData.premiumPack === 'free'}
              className="flex items-center space-x-2 bg-gradient-to-r from-primary-bolt-500 to-primary-bolt-600 hover:from-primary-bolt-600 hover:to-primary-bolt-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              <CreditCard className="h-4 w-4" />
              <span>Procéder au paiement</span>
            </button>
          ) : currentStep < totalSteps ? (
            <button
              onClick={nextStepHandler}
              disabled={!canProceed()}
              className="flex items-center space-x-2 bg-gradient-to-r from-primary-bolt-500 to-primary-bolt-600 hover:from-primary-bolt-600 hover:to-primary-bolt-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              <span>Suivant</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={() => {
                // Publication directe
                publishListing();
              }}
              disabled={!canProceed()}
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              Publier l'annonce
            </button>
          )}
        </div>
      </div>

      {/* Modal de succès */}
      <PublishSuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        onNavigateToDashboard={navigateToDashboard}
        listingType={formData.listingType as 'sale' | 'search'}
      />
    </div>
  );
};