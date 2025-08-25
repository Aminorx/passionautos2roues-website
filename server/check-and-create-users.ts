import { supabaseServer } from './supabase';

async function checkAndCreateUsers() {
  console.log('👥 VÉRIFICATION ET CRÉATION DES USERS MANQUANTS');
  
  const requiredUsers = [
    { id: 'demo', email: 'demo@passion-auto2roues.com', name: 'Compte Démo', type: 'individual' },
    { id: '1', email: 'marie.dubois@email.com', name: 'Marie Dubois', type: 'individual' },
    { id: '2', email: 'pierre.martin@email.com', name: 'Pierre Martin', type: 'individual' },
    { id: '3', email: 'sophie.dubois@email.com', name: 'Sophie Dubois', type: 'professional' },
    { id: '4', email: 'jean.martin@email.com', name: 'Jean Martin', type: 'professional' },
    { id: '5', email: 'david.rousseau@email.com', name: 'David Rousseau', type: 'professional' }
  ];
  
  try {
    // Vérifier quels users existent déjà
    const { data: existingUsers, error: checkError } = await supabaseServer
      .from('users')
      .select('id, name, email');
    
    if (checkError) {
      console.error('❌ Erreur vérification users:', checkError);
      return;
    }
    
    console.log('✅ Users existants:', existingUsers?.length || 0);
    existingUsers?.forEach(user => {
      console.log(`   ${user.id}: ${user.name} (${user.email})`);
    });
    
    const existingIds = existingUsers?.map(u => u.id) || [];
    const usersToCreate = requiredUsers.filter(user => !existingIds.includes(user.id));
    
    console.log('\n➕ Users à créer:', usersToCreate.length);
    
    if (usersToCreate.length > 0) {
      usersToCreate.forEach(user => {
        console.log(`   ${user.id}: ${user.name} (${user.email})`);
      });
      
      // Créer les users manquants
      const { data: createdUsers, error: createError } = await supabaseServer
        .from('users')
        .insert(usersToCreate)
        .select('id, name, email');
      
      if (createError) {
        console.error('❌ Erreur création:', createError);
        return;
      }
      
      console.log('\n✅ USERS CRÉÉS:', createdUsers?.length);
      createdUsers?.forEach(user => {
        console.log(`   ✓ ${user.id}: ${user.name}`);
      });
    } else {
      console.log('✅ Tous les users existent déjà !');
    }
    
    // Test final des relations
    console.log('\n🔗 TEST RELATIONS ANNONCES ↔ USERS');
    const { data: joinTest, error: joinError } = await supabaseServer
      .from('annonces')
      .select(`
        id,
        title,
        user_id,
        users!inner(name, type)
      `)
      .limit(5);
    
    if (joinError) {
      console.error('❌ Erreur jointure:', joinError);
    } else {
      console.log('✅ RELATIONS FONCTIONNELLES !');
      console.log(`📊 ${joinTest?.length} annonces testées avec succès`);
      joinTest?.forEach(annonce => {
        console.log(`   ${annonce.id}: ${annonce.title} → ${annonce.users.name}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Erreur globale:', error);
  }
}

checkAndCreateUsers();