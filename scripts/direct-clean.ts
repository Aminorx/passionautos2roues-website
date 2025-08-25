import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://nbjwbhvykpyogtccekag.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY requis');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function cleanMessages() {
  console.log('🧹 Nettoyage des messages avec préfixes...');
  
  try {
    // Récupérer les messages avec préfixes
    const { data: messages, error } = await supabase
      .from('messages')
      .select('id, content')
      .like('content', '%[Véhicule ID:%');
      
    if (error) {
      console.error('❌ Erreur:', error);
      return;
    }
    
    console.log(`📝 Messages trouvés: ${messages?.length || 0}`);
    
    if (messages && messages.length > 0) {
      for (const message of messages) {
        const cleanContent = message.content.replace(/^\[Véhicule ID: \d+\]\s*/, '');
        
        await supabase
          .from('messages')
          .update({ content: cleanContent })
          .eq('id', message.id);
          
        console.log(`✅ Nettoyé: "${message.content}" → "${cleanContent}"`);
      }
    }
    
    console.log('🎉 Nettoyage terminé!');
    
  } catch (err) {
    console.error('❌ Erreur:', err);
  }
}

cleanMessages();