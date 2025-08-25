import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export function useMessaging() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Créer ou récupérer une conversation pour un véhicule
  const getOrCreateConversation = async (
    vehicleId: string, 
    sellerId: string, 
    buyerId: string
  ) => {
    try {
      setLoading(true);
      setError(null);

      // Vérifier si une conversation existe déjà
      const { data: existingConversation } = await supabase
        .from('conversations')
        .select('id')
        .eq('vehicle_id', vehicleId)
        .eq('type', 'listing')
        .single();

      if (existingConversation) {
        return existingConversation.id;
      }

      // Créer nouvelle conversation
      const { data: newConversation, error: convError } = await supabase
        .from('conversations')
        .insert({
          vehicle_id: vehicleId,
          type: 'listing',
          last_message_at: new Date().toISOString()
        })
        .select('id')
        .single();

      if (convError) throw convError;

      // Ajouter les participants
      const { error: participantsError } = await supabase
        .from('conversation_participants')
        .insert([
          {
            conversation_id: newConversation.id,
            user_id: sellerId,
            role: 'seller',
            joined_at: new Date().toISOString()
          },
          {
            conversation_id: newConversation.id,
            user_id: buyerId,
            role: 'buyer',
            joined_at: new Date().toISOString()
          }
        ]);

      if (participantsError) throw participantsError;

      return newConversation.id;
    } catch (err) {
      console.error('Erreur création conversation:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Envoyer le premier message d'une conversation
  const startConversation = async (
    vehicleId: string,
    sellerId: string,
    buyerId: string,
    messageContent: string
  ) => {
    try {
      setLoading(true);
      setError(null);

      console.log('🚀 Début startConversation:', { vehicleId, sellerId, buyerId, messageContent });

      // Utiliser l'API simplifiée pour l'envoi de messages
      const response = await fetch('/api/messages-simple/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fromUserId: buyerId,
          toUserId: sellerId,
          content: messageContent,
          vehicleId: vehicleId
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('❌ Erreur API:', result);
        throw new Error(result.error || 'Erreur envoi message');
      }

      console.log('✅ Message envoyé:', result.messageId);
      return result.messageId;
    } catch (err) {
      console.error('❌ Erreur envoi message:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Envoyer un message dans une conversation existante
  const sendMessage = async (conversationId: string, content: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: messageError } = await supabase
        .from('messages')
        .insert({
          id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          from_user_id: 'demo', // TODO: Récupérer l'utilisateur connecté
          to_user_id: 'demo', // TODO: Déterminer le destinataire
          vehicle_id: '1', // TODO: Associer au véhicule
          content,
          created_at: new Date().toISOString()
        })
        .select('id')
        .single();

      if (messageError) throw messageError;
      return data.id;
    } catch (err) {
      console.error('Erreur envoi message:', err);
      setError(err instanceof Error ? err.message : 'Erreur envoi message');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    getOrCreateConversation,
    startConversation,
    sendMessage
  };
}