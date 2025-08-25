import './globals.css';
import { ClientLayout } from '@/components/ClientLayout';

// Les métadonnées peuvent être gérées avec un système autre que Next.js
// Par exemple avec react-helmet ou dans le HTML directement
const pageTitle = 'Passion Auto2Roues - Marketplace Automobile';
const pageDescription = 'Plateforme de vente et achat de véhicules - voitures, motos, scooters et plus';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="keywords" content="voiture, moto, scooter, véhicule, occasion, vente, achat" />
      </head>
      <body className="font-sans">
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}