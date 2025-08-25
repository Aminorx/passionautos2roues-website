import { supabaseServer } from './supabase';

async function insertTestData() {
  console.log('📝 INSERTION DONNÉES TEST DANS TABLE EXEMPLE');
  
  try {
    // Insérer les données demandées par l'utilisateur
    const { data, error } = await supabaseServer
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
    
    if (error) {
      console.error('❌ Erreur insertion:', error);
      console.log('💡 Créez d\'abord la table avec le SQL Editor de Supabase');
      return;
    }
    
    console.log('✅ PREUVE CONNEXION SUPABASE - Données insérées:', data);
    
    // Vérifier les données
    const { data: verifyData, error: verifyError } = await supabaseServer
      .from('exemple')
      .select('*');
    
    if (verifyData) {
      console.log('🎉 CONFIRMATION - Toutes les données dans la table exemple:', verifyData);
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

insertTestData();