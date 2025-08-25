import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

type Conversation = {
  id: string;
  vehicle_id: string | null;
  type: string;
  last_message_at: string | null;
  created_at: string;
  participant_users: Array<{
    id: string;
    email: string | null;
    first_name: string | null;
    last_name: string | null;
  }>;
  vehicles: {
    id: string;
    title: string;
    images: string[] | null;
  } | null;
  last_message: {
    content: string;
    created_at: string;
    from_user_id: string;
  } | null;
  unread_count: number;
};

export function useConversations(userId: string) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;

    const fetchConversations = async () => {
      try {
        setLoading(true);
        
        // Récupérer les conversations avec participants, véhicules et derniers messages
        const { data, error: conversationsError } = await supabase
          .from('conversations')
          .select(`
            *,
            conversation_participants!inner(
              user_id,
              users!inner(id, email, first_name, last_name)
            ),
            vehicles(id, title, images),
            messages(
              content, 
              created_at, 
              from_user_id,
              read
            )
          `)
          .eq('conversation_participants.user_id', userId)
          .order('last_message_at', { ascending: false });

        if (conversationsError) throw conversationsError;

        // Transformer les données et calculer unread_count
        const transformedConversations = data?.map(conv => {
          const participants = conv.conversation_participants
            .map((p: any) => p.users)
            .filter((u: any) => u.id !== userId);
          
          const messages = conv.messages || [];
          const lastMessage = messages
            .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0] || null;
          
          const unreadCount = messages
            .filter((msg: any) => msg.from_user_id !== userId && !msg.read)
            .length;

          return {
            ...conv,
            participant_users: participants,
            last_message: lastMessage,
            unread_count: unreadCount
          };
        }) || [];

        setConversations(transformedConversations);
      } catch (err) {
        console.error('Erreur lors du chargement des conversations:', err);
        setError(err instanceof Error ? err.message : 'Erreur inconnue');
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();

    // Écouter les nouveaux messages en temps réel
    const channel = supabase
      .channel('conversations_realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        },
        () => {
          fetchConversations(); // Recharger les conversations
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [userId]);

  return { conversations, loading, error, refetch: () => setLoading(true) };
}