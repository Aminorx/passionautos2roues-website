import { useState, useEffect } from 'react';
import { MessageCircle, Send, User, ArrowLeft, Clock } from 'lucide-react';
import { useMessaging } from '../hooks/useMessaging';

interface Conversation {
  id: string;
  vehicle_id: string;
  vehicle_title: string;
  other_user: {
    id: string;
    name: string;
    email: string;
  };
  last_message_at: string;
  last_message: string;
  unread_count: number;
  messages?: Message[];
}

interface Message {
  id: string;
  content: string;
  sender_id: string;
  sender_name: string;
  created_at: string;
}

export function Messages() {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const { sendMessage } = useMessaging();
  const currentUserId = '100'; // User Amine Noury connecté

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation);
    }
  }, [selectedConversation]);

  const loadConversations = async () => {
    try {
      console.log('📬 Chargement conversations pour utilisateur:', currentUserId);
      
      const response = await fetch(`/api/messages-simple/user/${currentUserId}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Conversations reçues:', data.conversations?.length || 0);
        setConversations(data.conversations || []);
      } else {
        console.error('❌ Erreur réponse conversations:', response.status);
      }
    } catch (error) {
      console.error('❌ Erreur chargement conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      console.log('💬 Chargement messages pour conversation:', conversationId);
      
      // Utiliser les messages déjà chargés dans les conversations
      const conversation = conversations.find(c => c.id === conversationId);
      if (conversation && conversation.messages) {
        console.log('✅ Messages trouvés dans conversation:', conversation.messages.length);
        
        // Convertir les messages au bon format
        const formattedMessages = conversation.messages.map(msg => ({
          id: msg.id,
          content: msg.content,
          sender_id: msg.sender_id,
          sender_name: msg.is_from_current_user ? 'Vous' : conversation.other_user.name,
          created_at: msg.created_at || new Date().toISOString()
        }));
        
        setMessages(formattedMessages);
        console.log('✅ Messages formatés chargés:', formattedMessages.length);
      } else {
        console.log('❌ Aucun message trouvé pour la conversation:', conversationId);
        setMessages([]);
      }
    } catch (error) {
      console.error('Erreur chargement messages:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    const messageId = await sendMessage(selectedConversation, newMessage);
    
    if (messageId) {
      setNewMessage('');
      loadMessages(selectedConversation);
      loadConversations(); // Mettre à jour la liste des conversations
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffHours = Math.abs(now.getTime() - date.getTime()) / 36e5;
    
    if (diffHours < 24) {
      return date.toLocaleTimeString('fr-FR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else {
      return date.toLocaleDateString('fr-FR', { 
        day: '2-digit', 
        month: '2-digit' 
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <MessageCircle className="h-12 w-12 text-teal-600 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600 dark:text-gray-400">Chargement des messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto py-8 px-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          <div className="flex h-[600px]">
            {/* Liste des conversations */}
            <div className={`w-1/3 border-r border-gray-200 dark:border-gray-700 ${selectedConversation ? 'hidden md:block' : ''}`}>
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-teal-600" />
                  Messages
                </h2>
              </div>
              
              <div className="overflow-y-auto h-full">
                {conversations.length === 0 ? (
                  <div className="p-6 text-center">
                    <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">
                      Aucune conversation
                    </p>
                    <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                      Contactez un vendeur pour commencer une conversation
                    </p>
                  </div>
                ) : (
                  conversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      onClick={() => setSelectedConversation(conversation.id)}
                      className={`p-4 border-b border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 ${
                        selectedConversation === conversation.id ? 'bg-teal-50 dark:bg-teal-900/20' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="font-medium text-sm truncate">
                              {conversation.other_user.name}
                            </p>
                            <span className="text-xs text-gray-500">
                              {formatDate(conversation.last_message_at)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                            {conversation.vehicle_title}
                          </p>
                          {conversation.unread_count > 0 && (
                            <span className="inline-block mt-1 px-2 py-1 text-xs bg-teal-600 text-white rounded-full">
                              {conversation.unread_count}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Zone de messages */}
            <div className={`flex-1 flex flex-col ${!selectedConversation ? 'hidden md:flex' : ''}`}>
              {selectedConversation ? (
                <>
                  {/* En-tête de la conversation */}
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setSelectedConversation(null)}
                        className="md:hidden p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                      >
                        <ArrowLeft className="h-5 w-5" />
                      </button>
                      <div className="w-10 h-10 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                      </div>
                      <div>
                        <p className="font-medium">
                          {conversations.find(c => c.id === selectedConversation)?.other_user.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {conversations.find(c => c.id === selectedConversation)?.vehicle_title}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.sender_id === currentUserId ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            message.sender_id === currentUserId
                              ? 'bg-teal-600 text-white'
                              : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Clock className="h-3 w-3 opacity-70" />
                            <span className="text-xs opacity-70">
                              {formatDate(message.created_at)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Zone d'envoi */}
                  <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="Tapez votre message..."
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      />
                      <button
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim()}
                        className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        <Send className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                  <div className="text-center">
                    <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                      Sélectionnez une conversation
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      Choisissez une conversation dans la liste pour commencer à échanger
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}