import { supabaseServer } from './supabase';

async function fixUsersReferences() {
  console.log('🔧 CORRECTION DES RÉFÉRENCES UTILISATEURS');
  
  try {
    // 1. Récupérer tous les user_id uniques des annonces
    const { data: annonces, error: annoncesError } = await supabaseServer
      .from('annonces')
      .select('user_id');
    
    if (annoncesError) {
      console.error('❌ Erreur lecture annonces:', annoncesError);
      return;
    }
    
    const uniqueUserIds = [...new Set(annonces?.map(a => a.user_id) || [])];
    console.log('👥 User IDs trouvés dans annonces:', uniqueUserIds);
    
    // 2. Vérifier quels users existent déjà
    const { data: existingUsers, error: usersError } = await supabaseServer
      .from('users')
      .select('id');
    
    if (usersError) {
      console.error('❌ Erreur lecture users:', usersError);
      return;
    }
    
    const existingUserIds = existingUsers?.map(u => u.id) || [];
    console.log('✅ Users existants:', existingUserIds);
    
    // 3. Créer les users manquants
    const missingUserIds = uniqueUserIds.filter(id => !existingUserIds.includes(id));
    console.log('➕ Users à créer:', missingUserIds);
    
    if (missingUserIds.length > 0) {
      const newUsers = missingUserIds.map(userId => ({
        id: userId,
        email: `${userId}@example.com`,
        name: `Utilisateur ${userId}`,
        type: 'individual',
        verified: true
      }));
      
      const { data: createdUsers, error: createError } = await supabaseServer
        .from('users')
        .insert(newUsers)
        .select();
      
      if (createError) {
        console.error('❌ Erreur création users:', createError);
        return;
      }
      
      console.log('✅ Users créés:', createdUsers?.length);
    }
    
    // 4. Vérification finale
    const { data: finalCheck } = await supabaseServer
      .from('annonces')
      .select(`
        id,
        title,
        user_id,
        users!inner(name)
      `)
      .limit(5);
    
    console.log('🎉 VÉRIFICATION - Annonces avec users:', finalCheck);
    
  } catch (error) {
    console.error('❌ Erreur globale:', error);
  }
}

fixUsersReferences();