import React, { useState, useEffect } from 'react';
import { MessageCircle, QrCode, Smartphone } from 'lucide-react';

interface WhatsAppContactProps {
  whatsappNumber: string;
  listingTitle: string;
  ownerName: string;
}

export const WhatsAppContact: React.FC<WhatsAppContactProps> = ({
  whatsappNumber,
  listingTitle,
  ownerName
}) => {
  const [isMobile, setIsMobile] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');

  // Nettoyer le numéro WhatsApp (enlever espaces, tirets, etc.)
  const cleanWhatsAppNumber = (number: string): string => {
    return number.replace(/[\s\-\(\)]/g, '').replace(/^\+/, '');
  };

  // Préparer le message WhatsApp
  const whatsappMessage = `Bonjour, je suis intéressé par votre annonce ${listingTitle}.`;
  const encodedMessage = encodeURIComponent(whatsappMessage);
  const cleanNumber = cleanWhatsAppNumber(whatsappNumber);
  
  // URL WhatsApp
  const whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodedMessage}`;

  // Détecter si l'utilisateur est sur mobile
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768); // Tablette = 768px et plus
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  // Générer l'URL du QR code
  useEffect(() => {
    if (!isMobile) {
      // Utiliser l'API QR Server pour générer le QR code (taille plus grande pour meilleure scanabilité : 150x150)
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&format=png&bgcolor=ffffff&color=000000&qzone=1&data=${encodeURIComponent(whatsappUrl)}`;
      setQrCodeUrl(qrUrl);
    }
  }, [whatsappUrl, isMobile]);

  const handleWhatsAppClick = () => {
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">

      {/* Version Desktop/Tablette - Bouton d'abord, puis QR Code */}
      {!isMobile && (
        <div className="text-center space-y-4">
          {/* Bouton WhatsApp Web en premier */}
          <div>
            <button
              onClick={handleWhatsAppClick}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-xl transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              <MessageCircle className="h-5 w-5" />
              <span>Contacter sur WhatsApp Web</span>
            </button>
          </div>

          {/* Sous-titre pour le QR Code */}
          <div className="pt-2">
            <h4 className="text-sm font-medium text-gray-600 mb-3">Ou scanner le QR Code depuis votre téléphone</h4>
          </div>

          {/* QR Code en second */}
          <div className="flex justify-center">
            <div className="bg-white p-3 rounded-2xl shadow-lg border border-gray-200">
              {qrCodeUrl ? (
                <img 
                  src={qrCodeUrl} 
                  alt="QR Code WhatsApp"
                  className="w-36 h-36 object-contain"
                  loading="lazy"
                />
              ) : (
                <div className="w-36 h-36 bg-gray-100 rounded-lg flex items-center justify-center">
                  <QrCode className="h-8 w-8 text-gray-400" />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Version Mobile - Bouton direct */}
      {isMobile && (
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <p className="text-sm text-gray-600 mb-2">Message qui sera envoyé :</p>
            <p className="text-sm text-gray-800 italic">"{whatsappMessage}"</p>
          </div>

          <button
            onClick={handleWhatsAppClick}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <div className="flex items-center space-x-2">
              <Smartphone className="h-6 w-6" />
              <MessageCircle className="h-6 w-6" />
            </div>
            <span className="text-lg">Contacter sur WhatsApp</span>
          </button>

          <p className="text-center text-xs text-gray-500 mt-2">
            Ouvrira WhatsApp avec le message prérempli
          </p>
        </div>
      )}


    </div>
  );
};