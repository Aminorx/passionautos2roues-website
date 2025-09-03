import React, { useState, useEffect } from 'react';

interface VerifiedBadgeProps {
  userId: string;
  userType?: string;
  className?: string;
}

export const VerifiedBadge: React.FC<VerifiedBadgeProps> = ({ userId, userType, className = "" }) => {
  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkVerificationStatus = async () => {
      if (userType !== 'professional') {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/professional-accounts/status/${userId}`);
        if (response.ok) {
          const data = await response.json();
          setIsVerified(data.verification_status === 'approved' && data.is_verified);
        }
      } catch (error) {
        console.error('Erreur vérification statut badge:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkVerificationStatus();
  }, [userId, userType]);

  // Ne pas afficher si pas professionnel ou en cours de chargement
  if (userType !== 'professional' || isLoading) {
    return null;
  }

  // Afficher le badge vérifié si approuvé
  if (isVerified) {
    return (
      <div className={`text-xs text-green-600 font-medium flex items-center space-x-1 ${className}`}>
        <span>✅</span>
        <span>Vérifié</span>
      </div>
    );
  }

  return null;
};