import { supabaseServer } from './supabase';

async function checkDatabaseRelations() {
  console.log('🔍 VÉRIFICATION DES RELATIONS DE BASE DE DONNÉES');
  
  try {
    // 1. Vérifier les annonces avec préfixe [BD]
    const { data: annonces, error: annoncesError } = await supabaseServer
      .from('annonces')
      .select('id, title, user_id')
      .order('id')
      .limit(5);
    
    if (annoncesError) {
      console.error('❌ Erreur lecture annonces:', annoncesError);
      return;
    }
    
    console.log('📋 Premières annonces avec [BD]:');
    annonces?.forEach(a => {
      console.log(`   ID: ${a.id} | ${a.title} | User: ${a.user_id}`);
    });
    
    // 2. Vérifier les user_ids uniques
    const { data: userIds, error: userIdsError } = await supabaseServer
      .from('annonces')
      .select('user_id');
    
    if (!userIdsError && userIds) {
      const uniqueUserIds = [...new Set(userIds.map(u => u.user_id))];
      console.log('👥 User IDs uniques trouvés:', uniqueUserIds);
      
      // 3. Vérifier si ces users existent
      const { data: existingUsers, error: usersError } = await supabaseServer
        .from('users')
        .select('id, name')
        .in('id', uniqueUserIds);
      
      if (!usersError) {
        console.log('✅ Users existants dans table users:');
        existingUsers?.forEach(u => console.log(`   ${u.id}: ${u.name}`));
        
        const existingIds = existingUsers?.map(u => u.id) || [];
        const missingIds = uniqueUserIds.filter(id => !existingIds.includes(id));
        
        if (missingIds.length > 0) {
          console.log('⚠️  Users manquants:', missingIds);
        } else {
          console.log('✅ Toutes les relations users sont OK');
        }
      }
    }
    
    // 4. Test de jointure annonces-users
    const { data: joinTest, error: joinError } = await supabaseServer
      .from('annonces')
      .select(`
        id,
        title,
        user_id,
        users!inner(name, email)
      `)
      .limit(3);
    
    if (joinError) {
      console.log('⚠️  Erreur jointure (normal si users manquants):', joinError.message);
    } else {
      console.log('✅ Test jointure réussi:', joinTest?.length || 0, 'annonces avec users');
    }
    
    // 5. Statistiques générales
    const { data: stats } = await supabaseServer
      .from('annonces')
      .select('category', { count: 'exact' });
    
    if (stats) {
      const categoryStats = stats.reduce((acc: any, item: any) => {
        acc[item.category] = (acc[item.category] || 0) + 1;
        return acc;
      }, {});
      
      console.log('📊 Répartition par catégorie:');
      Object.entries(categoryStats).forEach(([cat, count]) => {
        console.log(`   ${cat}: ${count}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Erreur globale:', error);
  }
}

checkDatabaseRelations();