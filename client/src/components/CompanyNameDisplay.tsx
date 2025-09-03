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
      if (!userId || userType !== 'professional') {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/professional-accounts/status/${userId}`);
        if (response.ok) {
          const data = await response.json();
          setCompanyName(data.company_name);
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