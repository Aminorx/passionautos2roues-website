// Importer le client Supabase configuré
import { supabase } from '../lib/supabase';

async function addContactColumns() {
  console.log('🔧 Ajout des colonnes de contact à la table annonces...');
  
  try {
    // D'abord, vérifier la structure actuelle de la table
    console.log('🔍 Vérification de la structure actuelle...');
    
    const { data: tableData, error: tableError } = await supabase
      .from('annonces')
      .select('*')
      .limit(1);
    
    if (tableError) {
      console.error('❌ Erreur accès table:', tableError);
      return;
    }
    
    if (tableData && tableData.length > 0) {
      console.log('📊 Colonnes actuelles:', Object.keys(tableData[0]));
      
      // Vérifier si les colonnes existent déjà
      const currentColumns = Object.keys(tableData[0]);
      const missingColumns = [];
      
      if (!currentColumns.includes('contact_phone')) missingColumns.push('contact_phone');
      if (!currentColumns.includes('contact_email')) missingColumns.push('contact_email');
      if (!currentColumns.includes('contact_whatsapp')) missingColumns.push('contact_whatsapp');
      if (!currentColumns.includes('hide_phone')) missingColumns.push('hide_phone');
      
      if (missingColumns.length === 0) {
        console.log('✅ Toutes les colonnes de contact existent déjà !');
        return;
      }
      
      console.log('⚠️ Colonnes manquantes:', missingColumns);
      console.log('🔧 Note: Les colonnes doivent être ajoutées manuellement via l\'interface Supabase');
      console.log('📝 SQL à exécuter dans Supabase SQL Editor:');
      console.log(`
ALTER TABLE annonces 
ADD COLUMN contact_phone text,
ADD COLUMN contact_email text,
ADD COLUMN contact_whatsapp text,
ADD COLUMN hide_phone boolean DEFAULT false;
      `);
    }
    
  } catch (err) {
    console.error('❌ Erreur générale:', err);
  }
}

addContactColumns();