import React, { useState, useEffect } from 'react';

interface CompanyNameDisplayProps {
  userId?: string;
  userType?: string;
  className?: string;
}

export const CompanyNameDisplay: React.FC<CompanyNameDisplayProps> = ({ 
  userId, 
  userType, 
  className = "text-cyan-600 text-lg font-medium" 
}) => {
  const [companyName, setCompanyName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCompanyName = async () => {
      console.log('🏢 CompanyNameDisplay Debug:', { userId, userType });
      
      if (!userId || userType !== 'professional') {
        console.log('❌ Pas un professionnel ou pas d\'userId');
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/professional-accounts/status/${userId}`);
        console.log('🔍 Réponse API société:', response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log('📊 Données société reçues:', data);
          setCompanyName(data.company_name);
        } else {
          console.log('❌ Réponse API non OK:', response.status);
        }
      } catch (error) {
        console.error('Erreur récupération nom société:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompanyName();
  }, [userId, userType]);

  // Ne pas afficher pour les particuliers
  if (userType !== 'professional' || isLoading) {
    return null;
  }

  // Afficher le nom de la société s'il existe
  if (companyName) {
    return (
      <p className={className}>
        🏢 {companyName}
      </p>
    );
  }

  return null;
};