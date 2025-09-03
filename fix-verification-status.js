// Script pour corriger les verification_status des comptes existants
// Exécuter avec: node fix-verification-status.js

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixVerificationStatus() {
  console.log('🔧 Correction des verification_status...');
  
  try {
    // Récupérer tous les comptes pro avec verification_status = 'pending'
    // qui n'ont PAS de documents uploadés
    const { data: accountsToFix, error: fetchError } = await supabase
      .from('professional_accounts')
      .select(`
        id, 
        user_id, 
        company_name,
        verification_status,
        verification_documents!left (id, document_type)
      `)
      .eq('verification_status', 'pending');
    
    if (fetchError) {
      console.error('❌ Erreur récupération comptes:', fetchError);
      return;
    }
    
    console.log(`📊 ${accountsToFix.length} comptes avec status 'pending' trouvés`);
    
    // Filtrer ceux qui n'ont PAS de documents
    const accountsWithoutDocs = accountsToFix.filter(
      account => !account.verification_documents || account.verification_documents.length === 0
    );
    
    console.log(`🎯 ${accountsWithoutDocs.length} comptes sans documents à corriger`);
    
    if (accountsWithoutDocs.length === 0) {
      console.log('✅ Aucun compte à corriger');
      return;
    }
    
    // Corriger chaque compte
    for (const account of accountsWithoutDocs) {
      console.log(`🔄 Correction compte: ${account.company_name} (${account.user_id})`);
      
      const { error: updateError } = await supabase
        .from('professional_accounts')
        .update({ 
          verification_status: 'not_verified',
          updated_at: new Date().toISOString()
        })
        .eq('id', account.id);
      
      if (updateError) {
        console.error(`❌ Erreur mise à jour ${account.id}:`, updateError);
      } else {
        console.log(`✅ Compte ${account.company_name} corrigé`);
      }
    }
    
    console.log('🎉 Correction terminée !');
    
  } catch (error) {
    console.error('❌ Erreur globale:', error);
  }
}

fixVerificationStatus();