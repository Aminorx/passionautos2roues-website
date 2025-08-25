import { Header } from "@/components/Header";
import { Dashboard } from "@/components/client-components/Dashboard";
import { Footer } from "@/components/client-components/Footer";
import { useState } from "react";

export default function DashboardPage() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dashboardTab, setDashboardTab] = useState('listings');

  return (
    <div className="min-h-screen bg-background">
      <Header 
        currentView={currentView}
        setCurrentView={setCurrentView}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        setDashboardTab={setDashboardTab}
      />
      <main className="container mx-auto px-4 py-8">
        <Dashboard activeTab={dashboardTab} setActiveTab={setDashboardTab} />
      </main>
      <Footer />
    </div>
  );
}