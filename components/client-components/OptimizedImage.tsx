import React, { useState, useCallback } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackIcon?: React.ReactNode;
  loading?: 'lazy' | 'eager';
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className = '',
  fallbackIcon,
  loading = 'lazy'
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
  }, []);

  const handleError = useCallback(() => {
    setHasError(true);
    setIsLoaded(true);
  }, []);

  // If there's an error or no src, show fallback
  if (hasError || !src) {
    return (
      <div className={`${className} bg-gray-200 flex items-center justify-center`}>
        {fallbackIcon || (
          <div className="text-gray-400 text-xs">Image non disponible</div>
        )}
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      {/* Loading placeholder */}
      {!isLoaded && (
        <div className={`absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center ${className}`}>
          <div className="w-8 h-8 rounded-full bg-gray-300 animate-pulse"></div>
        </div>
      )}
      
      {/* Main image */}
      <img
        src={src}
        alt={alt}
        loading={loading}
        onLoad={handleLoad}
        onError={handleError}
        className={`${className} transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          // Add DNS prefetch for external domains
          visibility: isLoaded ? 'visible' : 'hidden'
        }}
      />
    </div>
  );
};

export default OptimizedImage;