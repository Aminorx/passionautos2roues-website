import { supabaseServer } from './supabase';

export async function testSupabaseConnection() {
  console.log('🔗 TEST CONNEXION SUPABASE - PREUVE DEMANDÉE');
  
  try {
    // Test 1: Vérifier la connexion
    console.log('1️⃣ Test connexion...');
    const { data: testData, error: testError } = await supabaseServer
      .from('information_schema.tables')
      .select('table_name')
      .limit(1);
    
    if (testError) {
      console.error('❌ Échec connexion:', testError);
      return false;
    }
    
    console.log('✅ Connexion Supabase confirmée');
    
    // Test 2: Créer table exemple (via raw SQL si possible)
    console.log('2️⃣ Tentative création table exemple...');
    
    // Test 3: Insérer données directement via upsert
    console.log('3️⃣ Insertion des données de test...');
    const { data: insertData, error: insertError } = await supabaseServer
      .from('exemple')
      .upsert([
        {
          id: 1,
          nom: 'ennoury',
          prenom: 'amine',
          telephone: '0522708175'
        }
      ], { onConflict: 'id' })
      .select();
    
    if (insertError) {
      console.log('⚠️  Table exemple n\'existe pas encore. Erreur:', insertError.message);
      
      // Vérifier les tables existantes
      const { data: tables, error: tablesError } = await supabaseServer
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public');
        
      if (!tablesError && tables) {
        console.log('📋 Tables existantes dans votre base:', tables.map(t => t.table_name));
      }
      
      return false;
    }
    
    console.log('✅ PREUVE CONNEXION SUPABASE - DONNÉES INSÉRÉES:', insertData);
    
    // Test 4: Lire les données pour confirmation
    const { data: readData, error: readError } = await supabaseServer
      .from('exemple')
      .select('*')
      .eq('id', 1);
    
    if (readError) {
      console.error('❌ Erreur lecture:', readError);
      return false;
    }
    
    console.log('🎉 PREUVE FINALE - Données lues depuis Supabase:', readData);
    return true;
    
  } catch (error) {
    console.error('❌ ERREUR GLOBALE:', error);
    return false;
  }
}

testSupabaseConnection();