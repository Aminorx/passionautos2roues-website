import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

type Message = {
  id: string;
  conversation_id: string;
  from_user_id: string;
  to_user_id: string;
  vehicle_id: string | null;
  content: string;
  read: boolean;
  created_at: string;
  from_user: {
    id: string;
    first_name: string | null;
    last_name: string | null;
  } | null;
};

export function useMessages(conversationId: string, userId: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    if (!conversationId || !userId) return;

    const fetchMessages = async () => {
      try {
        setLoading(true);
        
        const { data, error: messagesError } = await supabase
          .from('messages')
          .select(`
            *,
            from_user:users!messages_from_user_id_fkey(
              id, first_name, last_name
            )
          `)
          .eq('conversation_id', conversationId)
          .order('created_at', { ascending: false })
          .limit(50);

        if (messagesError) throw messagesError;

        setMessages(data?.reverse() || []);
        setHasMore((data?.length || 0) >= 50);

        // Marquer les messages comme lus
        await markMessagesAsRead();
      } catch (err) {
        console.error('Erreur lors du chargement des messages:', err);
        setError(err instanceof Error ? err.message : 'Erreur inconnue');
      } finally {
        setLoading(false);
      }
    };

    const markMessagesAsRead = async () => {
      try {
        await supabase
          .from('messages')
          .update({ read: true })
          .eq('conversation_id', conversationId)
          .eq('to_user_id', userId)
          .eq('read', false);
      } catch (err) {
        console.error('Erreur marquage messages lus:', err);
      }
    };

    fetchMessages();

    // Écouter les nouveaux messages en temps réel
    const channel = supabase
      .channel(`messages_${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          const newMessage = payload.new as Message;
          setMessages(prev => [...prev, newMessage]);
          
          // Marquer comme lu si c'est pour nous
          if (newMessage.to_user_id === userId) {
            markMessagesAsRead();
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [conversationId, userId]);

  const sendMessage = async (content: string, toUserId: string, vehicleId?: string) => {
    try {
      // Message optimiste
      const optimisticMessage: Message = {
        id: `temp_${Date.now()}`,
        conversation_id: conversationId,
        from_user_id: userId,
        to_user_id: toUserId,
        vehicle_id: vehicleId || null,
        content,
        read: false,
        created_at: new Date().toISOString(),
        from_user: null
      };

      setMessages(prev => [...prev, optimisticMessage]);

      const { error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          from_user_id: userId,
          to_user_id: toUserId,
          vehicle_id: vehicleId,
          content,
          read: false
        });

      if (error) throw error;

      // Le message réel arrivera via realtime
      setMessages(prev => prev.filter(msg => !msg.id.startsWith('temp_')));
      
      return true;
    } catch (err) {
      console.error('Erreur envoi message:', err);
      // Retirer le message optimiste en cas d'erreur
      setMessages(prev => prev.filter(msg => !msg.id.startsWith('temp_')));
      return false;
    }
  };

  return { 
    messages, 
    loading, 
    error, 
    hasMore,
    sendMessage
  };
}