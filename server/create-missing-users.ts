import { supabaseServer } from './supabase';

async function createMissingUsers() {
  console.log('👥 CRÉATION DES USERS MANQUANTS POUR LES ANNONCES [BD]');
  
  // Users à créer basés sur les user_ids trouvés
  const usersToCreate = [
    {
      id: 'demo',
      email: 'demo@passion-auto2roues.com',
      name: 'Compte Démo',
      type: 'individual',
      verified: true
    },
    {
      id: '1',
      email: 'marie.dubois@email.com',
      name: 'Marie Dubois',
      phone: '+33 6 12 34 56 78',
      type: 'individual',
      city: 'Paris',
      postalCode: '75011',
      verified: true
    },
    {
      id: '2',
      email: 'pierre.martin@email.com',
      name: 'Pierre Martin',
      phone: '+33 6 23 45 67 89',
      type: 'individual',
      city: 'Lyon',
      postalCode: '69003',
      verified: true
    },
    {
      id: '3',
      email: 'sophie.dubois@email.com',
      name: 'Sophie Dubois',
      phone: '+33 6 34 56 78 90',
      type: 'professional',
      companyName: 'Auto Prestige Lyon',
      city: 'Lyon',
      postalCode: '69007',
      verified: true
    },
    {
      id: '4',
      email: 'jean.martin@email.com',
      name: 'Jean Martin',
      phone: '+33 6 45 67 89 01',
      type: 'professional',
      companyName: 'Garage Martin & Fils',
      city: 'Toulouse',
      postalCode: '31000',
      verified: true
    },
    {
      id: '5',
      email: 'david.rousseau@email.com',
      name: 'David Rousseau',
      phone: '+33 6 77 88 99 00',
      type: 'professional',
      companyName: 'Pièces Auto Rousseau',
      city: 'Toulouse',
      postalCode: '31200',
      verified: true
    }
  ];
  
  try {
    // Créer tous les users
    const { data: createdUsers, error: createError } = await supabaseServer
      .from('users')
      .insert(usersToCreate)
      .select();
    
    if (createError) {
      console.error('❌ Erreur création users:', createError);
      return;
    }
    
    console.log('✅ USERS CRÉÉS:', createdUsers?.length);
    createdUsers?.forEach(user => {
      console.log(`   ${user.id}: ${user.name} (${user.type})`);
    });
    
    // Test de la relation maintenant
    console.log('\n🔗 TEST RELATION ANNONCES ↔ USERS');
    const { data: relationTest, error: relationError } = await supabaseServer
      .from('annonces')
      .select(`
        id,
        title,
        user_id,
        users!inner(name, email, type)
      `)
      .limit(5);
    
    if (relationError) {
      console.error('❌ Erreur relation:', relationError);
    } else {
      console.log('✅ RELATION FONCTIONNELLE !');
      relationTest?.forEach(annonce => {
        console.log(`   ${annonce.id}: ${annonce.title} → ${annonce.users.name}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Erreur globale:', error);
  }
}

createMissingUsers();