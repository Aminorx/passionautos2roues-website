// Test de l'API de synchronisation manuelle
import { supabaseServer } from './supabase.js';

async function testSyncAPI() {
  console.log('🧪 Test de l\'API de synchronisation...');
  
  try {
    // 1. Créer un utilisateur test dans auth.users
    const testEmail = `test-manual-sync-${Date.now()}@example.com`;
    const { data: newUser, error: createError } = await supabaseServer.auth.admin.createUser({
      email: testEmail,
      password: 'TestPassword123!',
      email_confirm: true,
      user_metadata: {
        name: 'Test Manual Sync',
        type: 'professional',
        phone: '+33 6 12 34 56 78',
        companyName: 'Test Company'
      }
    });
    
    if (createError || !newUser.user) {
      console.error('❌ Erreur création utilisateur:', createError);
      return;
    }
    
    console.log('✅ Utilisateur créé dans auth.users:', newUser.user.id);
    
    // 2. Tester l'API de synchronisation
    const syncResponse = await fetch('http://localhost:5000/api/auth/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: newUser.user.id,
        userData: {
          name: 'Test Manual Sync',
          type: 'professional',
          phone: '+33 6 12 34 56 78',
          companyName: 'Test Company'
        }
      })
    });
    
    if (syncResponse.ok) {
      const syncData = await syncResponse.json();
      console.log('✅ Synchronisation API réussie:', syncData.user.name);
      console.log('📊 Profil créé:', syncData.profile.account_type);
    } else {
      console.error('❌ Erreur API sync:', await syncResponse.text());
    }
    
    // 3. Vérifier le statut de synchronisation
    const statusResponse = await fetch(`http://localhost:5000/api/auth/status/${newUser.user.id}`);
    if (statusResponse.ok) {
      const statusData = await statusResponse.json();
      console.log('📋 Statut synchronisation:', statusData);
    }
    
    // 4. Nettoyer
    await supabaseServer.auth.admin.deleteUser(newUser.user.id);
    console.log('🧹 Utilisateur test supprimé');
    
  } catch (error) {
    console.error('❌ Erreur test:', error);
  }
}

testSyncAPI();