import { Router } from 'express';
import { supabase } from '../lib/supabase.js';

const router = Router();

// Interface pour les réponses
interface ConversationResponse {
  id: string;
  vehicle_id: string;
  vehicle_title?: string;
  participants: {
    id: string;
    name: string;
    email: string;
  }[];
  last_message_at: string;
  unread_count: number;
}

interface MessageResponse {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_name?: string;
  content: string;
  message_type: string;
  file_url?: string;
  created_at: string;
}

// Middleware pour vérifier l'authentification
const requireAuth = (req: any, res: any, next: any) => {
  // Pour l'instant on simule avec un userId en query/header
  // Plus tard on utilisera Supabase Auth
  const userId = req.headers['x-user-id'] || req.query.userId || 'demo';
  if (!userId) {
    return res.status(401).json({ error: 'Authentification requise' });
  }
  req.userId = userId;
  next();
};

// POST /api/conversations - Créer ou récupérer une conversation
router.post('/conversations', requireAuth, async (req: any, res) => {
  try {
    const { vehicle_id, seller_id } = req.body;
    const buyer_id = req.userId;

    if (!vehicle_id || !seller_id) {
      return res.status(400).json({ error: 'vehicle_id et seller_id sont requis' });
    }

    // Utiliser la fonction PostgreSQL pour créer/récupérer la conversation
    const { data, error } = await supabase.rpc('create_conversation_if_not_exists', {
      p_vehicle_id: vehicle_id,
      p_buyer_id: buyer_id,
      p_seller_id: seller_id
    });

    if (error) {
      console.error('Erreur création conversation:', error);
      return res.status(500).json({ error: 'Erreur lors de la création de la conversation' });
    }

    // Récupérer les détails de la conversation créée
    const { data: conversation, error: fetchError } = await supabase
      .from('conversations')
      .select(`
        id,
        vehicle_id,
        last_message_at,
        vehicles!inner(title),
        conversation_participants!inner(
          user_id,
          users!inner(id, email, firstName, lastName)
        )
      `)
      .eq('id', data)
      .single();

    if (fetchError) {
      console.error('Erreur récupération conversation:', fetchError);
      return res.status(500).json({ error: 'Erreur lors de la récupération de la conversation' });
    }

    res.json({
      id: conversation.id,
      vehicle_id: conversation.vehicle_id,
      vehicle_title: conversation.vehicles.title,
      participants: conversation.conversation_participants.map((p: any) => ({
        id: p.users.id,
        name: `${p.users.firstName || ''} ${p.users.lastName || ''}`.trim() || p.users.email,
        email: p.users.email
      })),
      last_message_at: conversation.last_message_at
    });

  } catch (error) {
    console.error('Erreur API conversations:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/conversations - Liste des conversations de l'utilisateur
router.get('/conversations', requireAuth, async (req: any, res) => {
  try {
    const userId = req.userId;

    const { data: conversations, error } = await supabase
      .from('conversations')
      .select(`
        id,
        vehicle_id,
        last_message_at,
        vehicles!inner(title, images),
        conversation_participants!inner(
          user_id,
          last_read_message_id,
          users!inner(id, email, firstName, lastName)
        )
      `)
      .eq('conversation_participants.user_id', userId)
      .order('last_message_at', { ascending: false });

    if (error) {
      console.error('Erreur récupération conversations:', error);
      return res.status(500).json({ error: 'Erreur lors de la récupération des conversations' });
    }

    // Calculer les messages non lus pour chaque conversation
    const conversationsWithUnread = await Promise.all(
      conversations.map(async (conv: any) => {
        // Compter les messages non lus
        const userParticipant = conv.conversation_participants.find((p: any) => p.user_id === userId);
        const lastReadMessageId = userParticipant?.last_read_message_id;

        let unreadCount = 0;
        if (lastReadMessageId) {
          const { count } = await supabase
            .from('messages')
            .select('id', { count: 'exact' })
            .eq('vehicle_id', conv.vehicle_id)
            .gt('created_at', 
              await supabase
                .from('messages')
                .select('created_at')
                .eq('id', lastReadMessageId)
                .single()
                .then(r => r.data?.created_at || '1970-01-01')
            );
          unreadCount = count || 0;
        } else {
          // Si pas de message lu, tous sont non lus
          const { count } = await supabase
            .from('messages')
            .select('id', { count: 'exact' })
            .eq('vehicle_id', conv.vehicle_id);
          unreadCount = count || 0;
        }

        return {
          id: conv.id,
          vehicle_id: conv.vehicle_id,
          vehicle_title: conv.vehicles.title,
          vehicle_image: conv.vehicles.images?.[0] || null,
          participants: conv.conversation_participants
            .filter((p: any) => p.user_id !== userId)
            .map((p: any) => ({
              id: p.users.id,
              name: `${p.users.firstName || ''} ${p.users.lastName || ''}`.trim() || p.users.email,
              email: p.users.email
            })),
          last_message_at: conv.last_message_at,
          unread_count: unreadCount
        };
      })
    );

    res.json(conversationsWithUnread);

  } catch (error) {
    console.error('Erreur API liste conversations:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/conversations/:id/messages - Messages d'une conversation avec pagination
router.get('/conversations/:id/messages', requireAuth, async (req: any, res) => {
  try {
    const conversationId = req.params.id;
    const userId = req.userId;
    const limit = parseInt(req.query.limit) || 50;
    const cursor = req.query.cursor; // Pour pagination keyset

    // Vérifier que l'utilisateur fait partie de la conversation
    const { data: participant, error: authError } = await supabase
      .from('conversation_participants')
      .select('id')
      .eq('conversation_id', conversationId)
      .eq('user_id', userId)
      .single();

    if (authError || !participant) {
      return res.status(403).json({ error: 'Accès interdit à cette conversation' });
    }

    // Construire la requête avec pagination keyset
    let query = supabase
      .from('messages')
      .select(`
        id,
        from_user_id,
        to_user_id,
        content,
        created_at,
        users!messages_from_user_id_fkey(firstName, lastName, email)
      `)
      .eq('vehicle_id', conversationId) // Note: besoin d'adapter selon la structure
      .order('created_at', { ascending: false })
      .limit(limit);

    // Pagination keyset
    if (cursor) {
      query = query.lt('created_at', cursor);
    }

    const { data: messages, error } = await query;

    if (error) {
      console.error('Erreur récupération messages:', error);
      return res.status(500).json({ error: 'Erreur lors de la récupération des messages' });
    }

    const messagesWithSender = messages.map((msg: any) => ({
      id: msg.id,
      sender_id: msg.from_user_id,
      sender_name: `${msg.users.firstName || ''} ${msg.users.lastName || ''}`.trim() || msg.users.email,
      content: msg.content,
      created_at: msg.created_at,
      is_own: msg.from_user_id === userId
    }));

    // Marquer les messages comme lus
    await supabase
      .from('conversation_participants')
      .update({ last_read_message_id: messages[0]?.id })
      .eq('conversation_id', conversationId)
      .eq('user_id', userId);

    res.json({
      messages: messagesWithSender,
      has_more: messages.length === limit,
      next_cursor: messages.length > 0 ? messages[messages.length - 1].created_at : null
    });

  } catch (error) {
    console.error('Erreur API messages:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST /api/messages - Envoyer un message
router.post('/messages', requireAuth, async (req: any, res) => {
  try {
    const { vehicle_id, to_user_id, content, message_type = 'text', file_url } = req.body;
    const from_user_id = req.userId;

    if (!vehicle_id || !to_user_id || !content) {
      return res.status(400).json({ error: 'vehicle_id, to_user_id et content sont requis' });
    }

    // Validation anti-abus
    if (content.length > 1000) {
      return res.status(400).json({ error: 'Message trop long (max 1000 caractères)' });
    }

    // Vérifier que l'utilisateur peut envoyer des messages pour ce véhicule
    // (il doit faire partie d'une conversation existante ou être autorisé à en créer une)
    
    const { data: message, error } = await supabase
      .from('messages')
      .insert({
        from_user_id,
        to_user_id,
        vehicle_id,
        content,
        created_at: new Date().toISOString()
      })
      .select(`
        id,
        from_user_id,
        to_user_id,
        content,
        created_at,
        users!messages_from_user_id_fkey(firstName, lastName, email)
      `)
      .single();

    if (error) {
      console.error('Erreur envoi message:', error);
      return res.status(500).json({ error: 'Erreur lors de l\'envoi du message' });
    }

    res.status(201).json({
      id: message.id,
      sender_id: message.from_user_id,
      sender_name: `${message.users.firstName || ''} ${message.users.lastName || ''}`.trim() || message.users.email,
      content: message.content,
      created_at: message.created_at
    });

  } catch (error) {
    console.error('Erreur API envoi message:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router;