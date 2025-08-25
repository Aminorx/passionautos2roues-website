import { useState } from 'react';
import { Send, MessageCircle, Phone, X } from 'lucide-react';
import { useMessaging } from '../hooks/useMessaging';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface ContactSellerModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle: {
    id: string;
    title: string;
    price: number;
    user_id: string;
  };
  currentUserId?: string;
}

export function ContactSellerModal({ 
  isOpen, 
  onClose, 
  vehicle, 
  currentUserId 
}: ContactSellerModalProps) {
  const { user } = useAuth();
  const actualUserId = currentUserId || user?.id;
  const [message, setMessage] = useState(
    `Bonjour, je suis intéressé(e) par votre annonce "${vehicle.title}". Pourriez-vous me donner plus d'informations ?`
  );
  const { startConversation, loading, error } = useMessaging();
  // Simple toast alternative
  const showToast = (message: string, isError: boolean = false) => {
    const toastDiv = document.createElement('div');
    toastDiv.className = `fixed top-4 right-4 z-50 p-4 rounded-lg text-white ${isError ? 'bg-red-500' : 'bg-green-500'} shadow-lg`;
    toastDiv.textContent = message;
    document.body.appendChild(toastDiv);
    setTimeout(() => document.body.removeChild(toastDiv), 3000);
  };

  const handleSendMessage = async () => {
    if (!actualUserId) {
      showToast("Vous devez être connecté pour envoyer un message", true);
      return;
    }

    if (!message.trim()) {
      showToast("Veuillez saisir un message", true);
      return;
    }

    try {
      console.log('📤 Tentative envoi message:', {
        from: actualUserId,
        to: vehicle.user_id,
        vehicle: vehicle.id,
        message: message.substring(0, 50) + '...'
      });

      // Obtenir le token d'accès depuis la session Supabase
      const { data: { session } } = await supabase.auth.getSession();
      if (!session || !session.access_token) {
        console.error('❌ Pas de session active');
        showToast("Erreur d'authentification. Veuillez vous reconnecter.", true);
        return;
      }
      
      // Synchroniser l'utilisateur avec Supabase Auth
      const syncResponse = await fetch('/api/users/sync-auth', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          supabaseId: actualUserId,
          email: user?.email || 'utilisateur@example.com',
          name: user?.user_metadata?.name || user?.email?.split('@')[0] || 'Utilisateur'
        })
      });
      
      if (!syncResponse.ok) {
        console.error('❌ Impossible de synchroniser l\'utilisateur');
        showToast("Erreur d'authentification. Veuillez vous reconnecter.", true);
        return;
      }
      
      const syncedUser = await syncResponse.json();
      console.log('✅ Utilisateur synchronisé:', syncedUser.user?.name || syncedUser.name);

      // Envoi réel du message via l'API
      console.log('📍 ID de l\'annonce:', vehicle.id);
      
      // Vérifier que l'ID de l'annonce est un nombre valide
      // Gérer différents formats possibles (nombre, string numérique, ou UUID)
      let annonceId;
      if (typeof vehicle.id === 'number') {
        annonceId = vehicle.id;
      } else if (/^\d+$/.test(vehicle.id)) {
        // Si c'est une chaîne qui contient uniquement des chiffres
        annonceId = parseInt(vehicle.id);
      } else {
        console.error('❌ ID d\'annonce invalide (doit être un nombre):', vehicle.id);
        showToast("Format d'annonce invalide", true);
        return;
      }
      
      // Générer un ID unique pour le message
      const messageId = crypto.randomUUID();
      
      // Essayer d'obtenir des informations sur la structure exacte de la table
      console.log("🔍 Tentative d'inspection de la structure de la table messages");
      
      // Utiliser le format attendu par /api/messages-simple/send
      const messagePayload = {
        fromUserId: actualUserId,
        toUserId: vehicle.user_id,
        vehicleId: String(annonceId),
        content: message
      };
      
      console.log("🔍 Payload du message:", messagePayload);
      
      const response = await fetch('/api/messages-simple/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messagePayload),
      });
      
      console.log(`📡 Réponse API: ${response.status} ${response.statusText}`);

      if (response.ok) {
        showToast("Message envoyé ! Le vendeur va recevoir votre message");
        onClose();
      } else {
        const errorText = await response.text();
        console.error('❌ Erreur API brute:', errorText);
        
        let errorData = {};
        try {
          errorData = JSON.parse(errorText);
          console.error('❌ Erreur API (parsée):', errorData);
        } catch (e) {
          console.error('❌ Erreur de parsing JSON:', e);
        }
        
        showToast((errorData as any).error || `Erreur lors de l'envoi du message: ${errorText.substring(0, 100)}`, true);
      }
    } catch (err) {
      console.error('❌ Erreur réseau:', err);
      showToast("Erreur de connexion", true);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full m-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-teal-600" />
              <h2 className="text-lg font-semibold">Contacter le vendeur</h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        
        <div className="space-y-4">
          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h4 className="font-semibold text-sm">{vehicle.title}</h4>
            <p className="text-teal-600 font-bold">
              {vehicle.price.toLocaleString()} €
            </p>
          </div>

          <div className="space-y-3">
            <div>
              <label htmlFor="message" className="block text-sm font-medium mb-1">Votre message</label>
              <textarea
                id="message"
                value={message}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setMessage(e.target.value)}
                placeholder="Tapez votre message ici..."
                rows={4}
                className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>


          </div>

          <div className="flex gap-2 pt-4">
            <button
              onClick={onClose}
              className="flex-1 py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleSendMessage}
              disabled={loading}
              className="flex-1 py-2 px-4 bg-teal-600 hover:bg-teal-700 text-white rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              {loading ? (
                "Envoi..."
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Envoyer
                </>
              )}
            </button>
          </div>

          {error && (
            <div className="text-red-600 text-sm p-2 bg-red-50 dark:bg-red-900/20 rounded mt-2">
              {error}
            </div>
          )}

          <div className="text-center pt-2">
            <p className="text-xs text-gray-500">
              <Phone className="inline h-3 w-3 mr-1" />
              Vous pouvez aussi appeler directement le vendeur
            </p>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}