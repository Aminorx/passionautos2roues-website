import { Heart } from 'lucide-react';
import { useFavorites } from '../hooks/useFavorites';

function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

interface FavoriteButtonProps {
  vehicleId: string;
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
  size?: 'sm' | 'md' | 'lg';
}

export function FavoriteButton({ 
  vehicleId, 
  className, 
  onClick, 
  size = 'md' 
}: FavoriteButtonProps) {
  const { isFavorite, toggleFavorite } = useFavorites();

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onClick) onClick(e);
    
    console.log('🔴 Clic favori pour véhicule:', vehicleId);
    console.log('🔍 Statut actuel favori:', isFav);
    
    try {
      const success = await toggleFavorite(vehicleId);
      console.log('✅ Résultat toggle favori:', success);
      
      if (success) {
        console.log('🎉 Favori basculé avec succès');
      } else {
        console.error('❌ Échec du basculement favori');
      }
    } catch (error) {
      console.error('❌ Erreur lors du clic favori:', error);
    }
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  };

  const isFav = isFavorite(vehicleId);
  
  console.log('🔍 Rendu FavoriteButton - véhicule:', vehicleId, 'isFav:', isFav);

  return (
    <button 
      type="button"
      className={cn(
        "transition-all duration-200 focus:outline-none select-none",
        isFav 
          ? "text-red-500 hover:text-red-600" 
          : "text-gray-400 hover:text-red-500",
        className
      )}
      onClick={handleClick}
      onMouseDown={(e) => e.preventDefault()} // Éviter focus problems
      title={isFav ? "Retirer des favoris" : "Ajouter aux favoris"}
    >
      <Heart 
        className={cn(
          iconSizes[size], 
          "transition-all duration-200",
          isFav ? "fill-current text-red-500" : "text-gray-400"
        )} 
      />
    </button>
  );
}