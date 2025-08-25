import { Router } from 'express';
import { supabaseServer } from '../supabase';

const router = Router();

// Middleware pour récupérer l'utilisateur actuel (temporaire)
const getCurrentUser = (req: any, res: any, next: any) => {
  const userId = req.headers['x-user-id'] || 'demo';
  req.currentUserId = userId;
  next();
};

// GET /api/conversations - Récupérer les conversations de l'utilisateur
router.get('/', getCurrentUser, async (req: any, res) => {
  try {
    const userId = req.currentUserId;

    // Récupérer les messages de l'utilisateur (structure simplifiée)
    const { data: messages, error } = await supabaseServer
      .from('messages')
      .select(`
        *,
        from_users:users!from_user_id(id, name, email),
        to_users:users!to_user_id(id, name, email)
      `)
      .or(`from_user_id.eq.${userId},to_user_id.eq.${userId}`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erreur récupération messages:', error);
      return res.status(500).json({ error: 'Erreur récupération conversations' });
    }

    // Grouper les messages par autre utilisateur
    const conversationMap = new Map();
    
    messages?.forEach((message) => {
      const otherUser = message.from_user_id === userId ? message.to_users : message.from_users;
      const key = otherUser.id;
      
      // Extraire vehicleId du contenu si présent
      const vehicleMatch = message.content.match(/\[Véhicule ID: (\d+)\]/);
      const vehicleId = vehicleMatch ? vehicleMatch[1] : null;
      const cleanContent = message.content.replace(/\[Véhicule ID: \d+\]\s*/, '');
      
      if (!conversationMap.has(key)) {
        conversationMap.set(key, {
          id: key,
          vehicle_id: vehicleId,
          vehicle_title: vehicleId ? `Véhicule #${vehicleId}` : 'Discussion générale',
          other_user: {
            id: otherUser.id,
            name: otherUser.name,
            email: otherUser.email
          },
          last_message_at: message.created_at,
          unread_count: 0,
          last_message: cleanContent.substring(0, 50) + (cleanContent.length > 50 ? '...' : '')
        });
      }
    });

    const conversations = Array.from(conversationMap.values());
    res.json(conversations);

  } catch (error) {
    console.error('Erreur API conversations:', error);
    res.status(500).json({ error: 'Erreur interne' });
  }
});

// GET /api/conversations/:id/messages - Récupérer les messages d'une conversation
router.get('/:conversationId/messages', getCurrentUser, async (req: any, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.currentUserId;
    
    // Extraire vehicle_id et other_user_id du conversationId
    const [vehicleId, otherUserId] = conversationId.split('_');

    const { data: messages, error } = await supabaseServer
      .from('messages')
      .select(`
        *,
        from_users:users!from_user_id(name)
      `)
      .eq('vehicle_id', vehicleId)
      .or(`and(from_user_id.eq.${userId},to_user_id.eq.${otherUserId}),and(from_user_id.eq.${otherUserId},to_user_id.eq.${userId})`)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Erreur récupération messages:', error);
      return res.status(500).json({ error: 'Erreur récupération messages' });
    }

    const formattedMessages = messages?.map((message) => ({
      id: message.id,
      content: message.content,
      sender_id: message.from_user_id,
      sender_name: message.from_users?.name || 'Utilisateur',
      created_at: message.created_at
    })) || [];

    res.json(formattedMessages);

  } catch (error) {
    console.error('Erreur API messages:', error);
    res.status(500).json({ error: 'Erreur interne' });
  }
});

// POST /api/conversations/:id/messages - Envoyer un message
router.post('/:conversationId/messages', getCurrentUser, async (req: any, res) => {
  try {
    const { conversationId } = req.params;
    const { content } = req.body;
    const userId = req.currentUserId;

    if (!content?.trim()) {
      return res.status(400).json({ error: 'Le contenu du message est requis' });
    }

    // Extraire vehicle_id et other_user_id du conversationId
    const [vehicleId, otherUserId] = conversationId.split('_');

    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const { data: message, error } = await supabaseServer
      .from('messages')
      .insert({
        id: messageId,
        from_user_id: userId,
        to_user_id: otherUserId,
        vehicle_id: vehicleId,
        content: content.trim(),
        created_at: new Date().toISOString()
      })
      .select('id')
      .single();

    if (error) {
      console.error('Erreur envoi message:', error);
      return res.status(500).json({ error: 'Erreur envoi message' });
    }

    res.json({ id: message.id, success: true });

  } catch (error) {
    console.error('Erreur API envoi message:', error);
    res.status(500).json({ error: 'Erreur interne' });
  }
});

export default router;