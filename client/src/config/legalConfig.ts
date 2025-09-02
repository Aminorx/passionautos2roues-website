// client/src/config/legalConfig.ts
export const LEGAL = {
  COMPANY_NAME: "SOS MON GARAGE",
  COMPANY_LEGAL_FORM: "Société par actions simplifiée (Société à associé unique)",
  COMPANY_CAPITAL: "1 000,00 €",
  COMPANY_RCS: "940 510 381 RCS Paris",
  COMPANY_ADDRESS: "229 rue Saint-Honoré, 75001 Paris",
  PUBLISHER: "Belmeskine Said",
  PUBLISHER_TITLE: "Président",
  CONTACT_EMAIL: "contact@passionauto2roues.com",
  HOSTING: [
    { name: "Netlify", role: "hébergement du front-end", url: "https://www.netlify.com" },
    { name: "Render", role: "hébergement du back-end", url: "https://render.com" },
    { name: "Supabase", role: "hébergement et gestion de la base de données", url: "https://supabase.com" },
  ] as const,
  LAST_UPDATED: "2 septembre 2025",
} as const;

export const BRAND = {
  SITE_NAME: "Passion Auto2Roues",
  SITE_DOMAIN: "passionauto2roues.com",
  CONTACT_EMAIL: "contact@passionauto2roues.com",
  PHONE_NUMBER: "+33 1 23 45 67 89",
} as const;