import { supabaseServer } from '../server/supabase.js';

async function cleanPrefixes() {
  console.log('🧹 Nettoyage des préfixes [Véhicule ID:] ...');
  
  try {
    // Récupérer tous les messages avec préfixes
    const { data: messages, error: fetchError } = await supabaseServer
      .from('messages')
      .select('id, content')
      .like('content', '[Véhicule ID:%');
      
    if (fetchError) {
      console.error('❌ Erreur récupération messages:', fetchError);
      return;
    }
    
    console.log(`📝 Messages trouvés avec préfixes: ${messages?.length || 0}`);
    
    if (!messages || messages.length === 0) {
      console.log('✅ Aucun message à nettoyer');
      return;
    }
    
    // Nettoyer chaque message
    for (const message of messages) {
      const cleanContent = message.content.replace(/^\[Véhicule ID: \d+\]\s*/, '');
      console.log(`🔄 Nettoyage message ${message.id}:`);
      console.log(`  Avant: "${message.content}"`);
      console.log(`  Après: "${cleanContent}"`);
      
      const { error: updateError } = await supabaseServer
        .from('messages')
        .update({ content: cleanContent })
        .eq('id', message.id);
        
      if (updateError) {
        console.error('❌ Erreur mise à jour message:', updateError);
      } else {
        console.log('✅ Message mis à jour');
      }
    }
    
    console.log('🎉 Nettoyage terminé avec succès!');
    
  } catch (error) {
    console.error('❌ Erreur nettoyage:', error);
  }
}

cleanPrefixes();