import { Header } from "@/components/Header";
import { CreateListingForm } from "@/components/client-components/CreateListingForm";
import { Footer } from "@/components/client-components/Footer";
import { useState } from "react";

export default function CreateListingPage() {
  const [currentView, setCurrentView] = useState('create-listing');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Header 
        currentView={currentView}
        setCurrentView={setCurrentView}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />
      <main className="container mx-auto px-4 py-8">
        <CreateListingForm />
      </main>
      <Footer />
    </div>
  );
}