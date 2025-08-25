import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from '@/app/page';
import CreateListingPage from '@/app/create-listing/page';
import DashboardPage from '@/app/dashboard/page';
import { ProfessionalVerification } from './pages/ProfessionalVerification';
import { ClientLayout } from '@/components/ClientLayout';
import AuthCallback from './components/auth/AuthCallback';

export function AppRouter() {
  return (
    <Router>
      <ClientLayout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/create-listing" element={<CreateListingPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/professional-verification" element={<ProfessionalVerification />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </ClientLayout>
    </Router>
  );
}

export default AppRouter;
