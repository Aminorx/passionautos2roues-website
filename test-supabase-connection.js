import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log('🔗 Test connexion Supabase...');
console.log('URL:', supabaseUrl);
console.log('Key:', supabaseKey ? supabaseKey.substring(0, 20) + '...' : 'NON DÉFINIE');

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    // 1. Créer la table exemple
    console.log('📋 Création de la table exemple...');
    const { data: createData, error: createError } = await supabase.rpc('exec_sql', {
      query: `
        CREATE TABLE IF NOT EXISTS exemple (
          id SERIAL PRIMARY KEY,
          nom VARCHAR(50),
          prenom VARCHAR(50),
          telephone VARCHAR(20)
        );
      `
    });
    
    if (createError) {
      console.log('⚠️  Tentative alternative de création...');
      
      // Tentative avec requête directe
      const { data: tables, error: tableError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_name', 'exemple')
        .limit(1);
        
      if (tableError) {
        console.error('❌ Erreur vérification table:', tableError);
      } else {
        console.log('✅ Tables existantes vérifiées');
      }
    }

    // 2. Insérer les données demandées
    console.log('📝 Insertion des données de test...');
    const { data: insertData, error: insertError } = await supabase
      .from('exemple')
      .insert([
        {
          id: 1,
          nom: 'ennoury',
          prenom: 'amine', 
          telephone: '0522708175'
        }
      ])
      .select();

    if (insertError) {
      console.error('❌ Erreur insertion:', insertError);
    } else {
      console.log('✅ DONNÉES INSÉRÉES AVEC SUCCÈS:', insertData);
    }

    // 3. Vérifier les données
    console.log('🔍 Vérification des données...');
    const { data: selectData, error: selectError } = await supabase
      .from('exemple')
      .select('*')
      .eq('id', 1);

    if (selectError) {
      console.error('❌ Erreur lecture:', selectError);
    } else {
      console.log('✅ PREUVE CONNEXION SUPABASE - Données récupérées:', selectData);
    }

  } catch (error) {
    console.error('❌ ERREUR CONNEXION SUPABASE:', error);
  }
}

testConnection();