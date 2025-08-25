import { Router } from 'express';
import { supabase } from '../lib/supabase.js';

const router = Router();

// Middleware simple pour l'authentification
const requireAuth = (req: any, res: any, next: any) => {
  const userId = req.headers['x-user-id'] || req.query.userId;
  if (!userId) {
    return res.status(401).json({ error: 'Authentification requise' });
  }
  req.userId = userId;
  next();
};

// POST /api/messages/send - Envoyer un message simple
router.post('/messages/send', requireAuth, async (req: any, res) => {
  try {
    const { vehicle_id, to_user_id, content } = req.body;
    const from_user_id = req.userId;

    if (!vehicle_id || !to_user_id || !content) {
      return res.status(400).json({ error: 'vehicle_id, to_user_id et content sont requis' });
    }

    // Validation anti-abus
    if (content.length > 1000) {
      return res.status(400).json({ error: 'Message trop long (max 1000 caractères)' });
    }

    // Vérifier que les utilisateurs existent
    const { data: fromUser } = await supabase
      .from('users')
      .select('id, name, email')
      .eq('id', from_user_id)
      .single();

    const { data: toUser } = await supabase
      .from('users') 
      .select('id, name, email')
      .eq('id', to_user_id)
      .single();

    const { data: vehicle } = await supabase
      .from('annonces')
      .select('id, title')
      .eq('id', vehicle_id)
      .single();

    if (!fromUser || !toUser || !vehicle) {
      return res.status(404).json({ error: 'Utilisateur ou véhicule non trouvé' });
    }

    // Insérer le message dans l'ancienne table messages
    const { data: message, error } = await supabase
      .from('messages')
      .insert({
        from_user_id,
        to_user_id,
        vehicle_id,
        content,
        read: false,
        created_at: new Date().toISOString()
      })
      .select('*')
      .single();

    if (error) {
      console.error('Erreur insertion message:', error);
      return res.status(500).json({ error: 'Erreur lors de l\'envoi du message' });
    }

    res.status(201).json({
      id: message.id,
      from_user: {
        id: fromUser.id,
        name: fromUser.name,
        email: fromUser.email
      },
      to_user: {
        id: toUser.id,
        name: toUser.name,
        email: toUser.email
      },
      vehicle: {
        id: vehicle.id,
        title: vehicle.title
      },
      content: message.content,
      created_at: message.created_at,
      read: message.read
    });

  } catch (error) {
    console.error('Erreur API envoi message:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/messages/conversations/:userId - Liste des conversations d'un utilisateur
router.get('/messages/conversations/:userId', requireAuth, async (req: any, res) => {
  try {
    const userId = req.params.userId;
    const currentUserId = req.userId;

    // Vérifier que l'utilisateur peut accéder à ces conversations
    if (userId !== currentUserId) {
      return res.status(403).json({ error: 'Accès interdit' });
    }

    // Récupérer toutes les conversations (messages groupés par véhicule et utilisateur)
    const { data: messages, error } = await supabase
      .from('messages')
      .select(`
        id,
        from_user_id,
        to_user_id, 
        vehicle_id,
        content,
        created_at,
        read,
        vehicles!inner(title, images),
        from_user:users!messages_from_user_id_fkey(id, name, email),
        to_user:users!messages_to_user_id_fkey(id, name, email)
      `)
      .or(`from_user_id.eq.${userId},to_user_id.eq.${userId}`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erreur récupération conversations:', error);
      return res.status(500).json({ error: 'Erreur lors de la récupération des conversations' });
    }

    // Grouper par véhicule et par interlocuteur
    const conversationsMap = new Map();

    messages.forEach((msg: any) => {
      const otherUserId = msg.from_user_id === userId ? msg.to_user_id : msg.from_user_id;
      const conversationKey = `${msg.vehicle_id}-${otherUserId}`;
      
      if (!conversationsMap.has(conversationKey) || 
          new Date(msg.created_at) > new Date(conversationsMap.get(conversationKey).last_message_at)) {
        
        const otherUser = msg.from_user_id === userId ? msg.to_user : msg.from_user;
        
        conversationsMap.set(conversationKey, {
          vehicle_id: msg.vehicle_id,
          vehicle_title: msg.vehicles.title,
          vehicle_image: msg.vehicles.images?.[0] || null,
          other_user: {
            id: otherUser.id,
            name: otherUser.name,
            email: otherUser.email
          },
          last_message: msg.content,
          last_message_at: msg.created_at,
          unread_count: 0 // À calculer
        });
      }
    });

    // Calculer les messages non lus pour chaque conversation
    const conversations = Array.from(conversationsMap.values());
    
    for (const conv of conversations) {
      const { count } = await supabase
        .from('messages')
        .select('id', { count: 'exact' })
        .eq('vehicle_id', conv.vehicle_id)
        .eq('from_user_id', conv.other_user.id)
        .eq('to_user_id', userId)
        .eq('read', false);
      
      conv.unread_count = count || 0;
    }

    res.json(conversations);

  } catch (error) {
    console.error('Erreur API conversations:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/messages/conversation/:vehicleId/:otherUserId - Messages d'une conversation
router.get('/messages/conversation/:vehicleId/:otherUserId', requireAuth, async (req: any, res) => {
  try {
    const { vehicleId, otherUserId } = req.params;
    const userId = req.userId;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    // Récupérer les messages entre ces deux utilisateurs pour ce véhicule
    const { data: messages, error } = await supabase
      .from('messages')
      .select(`
        id,
        from_user_id,
        to_user_id,
        content,
        created_at,
        read,
        from_user:users!messages_from_user_id_fkey(id, name, email)
      `)
      .eq('vehicle_id', vehicleId)
      .or(`and(from_user_id.eq.${userId},to_user_id.eq.${otherUserId}),and(from_user_id.eq.${otherUserId},to_user_id.eq.${userId})`)
      .order('created_at', { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Erreur récupération messages:', error);
      return res.status(500).json({ error: 'Erreur lors de la récupération des messages' });
    }

    // Marquer comme lus les messages reçus
    await supabase
      .from('messages')
      .update({ read: true })
      .eq('vehicle_id', vehicleId)
      .eq('from_user_id', otherUserId)
      .eq('to_user_id', userId)
      .eq('read', false);

    const formattedMessages = messages.map((msg: any) => ({
      id: msg.id,
      sender: {
        id: msg.from_user.id,
        name: msg.from_user.name,
        email: msg.from_user.email
      },
      content: msg.content,
      created_at: msg.created_at,
      is_own: msg.from_user_id === userId,
      read: msg.read
    }));

    res.json({
      messages: formattedMessages,
      has_more: messages.length === limit
    });

  } catch (error) {
    console.error('Erreur API messages conversation:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/messages/unread-count/:userId - Nombre total de messages non lus
router.get('/messages/unread-count/:userId', requireAuth, async (req: any, res) => {
  try {
    const userId = req.params.userId;
    const currentUserId = req.userId;

    if (userId !== currentUserId) {
      return res.status(403).json({ error: 'Accès interdit' });
    }

    const { count, error } = await supabase
      .from('messages')
      .select('id', { count: 'exact' })
      .eq('to_user_id', userId)
      .eq('read', false);

    if (error) {
      console.error('Erreur comptage messages non lus:', error);
      return res.status(500).json({ error: 'Erreur lors du comptage des messages non lus' });
    }

    res.json({ unread_count: count || 0 });

  } catch (error) {
    console.error('Erreur API comptage messages:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router;