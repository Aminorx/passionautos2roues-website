// Script pour trouver le domaine Replit actuel
console.log('🌐 DOMAINE REPLIT ACTUEL :');
console.log('');

// Vérifier les variables d'environnement Replit
const replitDomains = process.env.REPLIT_DOMAINS;
const replId = process.env.REPL_ID;
const replOwner = process.env.REPL_OWNER;
const replSlug = process.env.REPL_SLUG;

if (replitDomains) {
  console.log(`📱 Domaines Replit : ${replitDomains}`);
} else {
  console.log('⚠️ REPLIT_DOMAINS non trouvée');
}

if (replId && replOwner && replSlug) {
  console.log(`🔗 URL probable : https://${replSlug}.${replOwner}.replit.app`);
} else {
  console.log('📋 Variables Replit :');
  console.log(`   REPL_ID: ${replId || 'non trouvée'}`);
  console.log(`   REPL_OWNER: ${replOwner || 'non trouvée'}`);
  console.log(`   REPL_SLUG: ${replSlug || 'non trouvée'}`);
}

console.log('');
console.log('💡 POUR TROUVER TON DOMAINE REPLIT :');
console.log('   Regarde l\'URL de ton navigateur quand tu utilises l\'app');
console.log('   Exemple: https://passion-auto2roues.johndoe.replit.app');