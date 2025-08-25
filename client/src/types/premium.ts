export interface PremiumPack {
  id: string;
  name: string;
  duration: number; // en jours
  price: number; // en euros
  description: string;
  features: string[];
  mostPopular?: boolean;
}

export const PREMIUM_PACKS: PremiumPack[] = [
  {
    id: 'free',
    name: 'Publication gratuite',
    duration: 0,
    price: 0,
    description: 'Votre annonce sera visible dans les résultats de recherche',
    features: [
      'Publication gratuite',
      'Visible dans les résultats',
      'Durée illimitée'
    ]
  },
  {
    id: 'daily',
    name: 'Remontée quotidienne',
    duration: 1,
    price: 0.99,
    description: 'Votre annonce en tête de liste pendant 24h',
    features: [
      'Remontée en tête de liste',
      'Durée : 24 heures',
      'Visibilité maximale'
    ]
  },
  {
    id: 'weekly',
    name: 'Remontée hebdomadaire',
    duration: 7,
    price: 4.99,
    description: 'Votre annonce en tête de liste pendant 7 jours',
    features: [
      'Remontée en tête de liste',
      'Durée : 7 jours',
      'Économie de 28%',
      'Visibilité prolongée'
    ],
    mostPopular: true
  },
  {
    id: 'monthly',
    name: 'Remontée mensuelle',
    duration: 30,
    price: 19.90,
    description: 'Votre annonce en tête de liste pendant 30 jours',
    features: [
      'Remontée en tête de liste',
      'Durée : 30 jours',
      'Économie de 33%',
      'Visibilité maximale',
      'Meilleur rapport qualité/prix'
    ]
  }
];