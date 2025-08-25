import { supabaseServer } from './supabase';

async function createSimpleUsers() {
  console.log('👥 CRÉATION DES 6 USERS MANQUANTS - VERSION SIMPLIFIÉE');
  
  // Users basés sur les user_ids trouvés dans les annonces [BD]
  const usersToCreate = [
    {
      id: 'demo',
      email: 'demo@passion-auto2roues.com',
      name: 'Compte Démo',
      type: 'individual'
    },
    {
      id: '1',
      email: 'marie.dubois@email.com',
      name: 'Marie Dubois',
      type: 'individual'
    },
    {
      id: '2',
      email: 'pierre.martin@email.com',
      name: 'Pierre Martin',
      type: 'individual'
    },
    {
      id: '3',
      email: 'sophie.dubois@email.com',
      name: 'Sophie Dubois',
      type: 'professional'
    },
    {
      id: '4',
      email: 'jean.martin@email.com',
      name: 'Jean Martin',
      type: 'professional'
    },
    {
      id: '5',
      email: 'david.rousseau@email.com',
      name: 'David Rousseau',
      type: 'professional'
    }
  ];
  
  console.log('📋 DÉTAIL DES 6 USERS À CRÉER:');
  usersToCreate.forEach(user => {
    console.log(`   ID: ${user.id} | Email: ${user.email} | Nom: ${user.name} | Type: ${user.type}`);
  });
  
  try {
    // Créer les users avec les champs de base uniquement
    const { data: createdUsers, error: createError } = await supabaseServer
      .from('users')
      .insert(usersToCreate)
      .select('id, email, name, type');
    
    if (createError) {
      console.error('❌ Erreur création users:', createError);
      console.log('\n💡 SOLUTION: Vérifiez que la table users existe avec les bons champs.');
      return;
    }
    
    console.log('\n✅ USERS CRÉÉS AVEC SUCCÈS:');
    createdUsers?.forEach(user => {
      console.log(`   ✓ ${user.id}: ${user.name} (${user.email}) - ${user.type}`);
    });
    
    console.log(`\n📊 TOTAL: ${createdUsers?.length} users créés`);
    
  } catch (error) {
    console.error('❌ Erreur globale:', error);
  }
}

createSimpleUsers();