import React, { useState, useRef, useEffect, ReactNode } from 'react';
import { X, Move } from 'lucide-react';

interface DraggableModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  className?: string;
}

export const DraggableModal: React.FC<DraggableModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  className = ''
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const modalRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  // Reset position when modal opens
  useEffect(() => {
    if (isOpen) {
      setPosition({ x: 0, y: 0 });
    }
  }, [isOpen]);

  // Ensure modal stays within viewport bounds
  const constrainPosition = (x: number, y: number) => {
    if (!modalRef.current) return { x, y };

    const modal = modalRef.current;
    const rect = modal.getBoundingClientRect();
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight
    };

    // Keep modal within bounds
    const constrainedX = Math.max(
      -rect.width / 2, 
      Math.min(x, viewport.width - rect.width / 2)
    );
    const constrainedY = Math.max(
      -rect.height / 2,
      Math.min(y, viewport.height - rect.height / 2)
    );

    return { x: constrainedX, y: constrainedY };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (headerRef.current?.contains(e.target as Node)) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    
    const newPosition = constrainPosition(
      e.clientX - dragStart.x,
      e.clientY - dragStart.y
    );
    setPosition(newPosition);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'grabbing';
      document.body.style.userSelect = 'none';
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDragging, dragStart, position.x, position.y]);

  // Handle escape key - Désactivé pour éviter la fermeture accidentelle
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        // Optionnel : Afficher une confirmation avant fermeture
        // Pour l'instant, on désactive la fermeture par Escape
        e.preventDefault();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop - Clic désactivé pour éviter la fermeture accidentelle */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={(e) => e.preventDefault()}
      />
      
      {/* Modal */}
      <div
        ref={modalRef}
        className={`
          absolute top-1/2 left-1/2 
          w-[95vw] max-w-4xl 
          max-h-[90vh] 
          bg-white rounded-xl shadow-2xl 
          transform -translate-x-1/2 -translate-y-1/2
          ${className}
        `}
        style={{
          transform: `translate(${position.x - 50}%, ${position.y - 50}%)`,
          transition: isDragging ? 'none' : 'transform 0.1s ease-out'
        }}
        onMouseDown={handleMouseDown}
      >
        {/* Header with drag handle */}
        <div
          ref={headerRef}
          className={`
            flex items-center justify-between p-4 border-b border-gray-200 rounded-t-xl
            bg-gradient-to-r from-primary-bolt-500 to-primary-bolt-600 text-white
            ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}
          `}
        >
          <div className="flex items-center space-x-2">
            <Move className="h-5 w-5 opacity-70" />
            <h2 className="text-lg font-semibold">{title}</h2>
          </div>
          
          <button
            onClick={(e) => {
              e.stopPropagation(); // Empêcher l'événement de remonter au modal
              onClose();
            }}
            onMouseDown={(e) => {
              e.stopPropagation(); // Empêcher le drag de s'activer
            }}
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
            type="button"
            title="Fermer (les données seront perdues)"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-64px)]">
          {children}
        </div>
      </div>
    </div>
  );
};

export default DraggableModal;