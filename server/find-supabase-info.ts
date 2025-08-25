// Script pour afficher les informations Supabase nécessaires
console.log('🔍 INFORMATIONS SUPABASE POUR OAUTH :');
console.log('');

// 1. URL du projet Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL;
if (supabaseUrl) {
  const projectId = supabaseUrl.replace('https://', '').replace('.supabase.co', '');
  console.log('📊 PROJET SUPABASE :');
  console.log(`   URL complète : ${supabaseUrl}`);
  console.log(`   Project ID : ${projectId}`);
  console.log('');
  
  console.log('🔗 URLs À CONFIGURER DANS GOOGLE CLOUD :');
  console.log('');
  console.log('Origines JavaScript autorisées :');
  console.log(`   ${supabaseUrl}`);
  console.log(`   https://[ton-repl-name].[username].replit.app`);
  console.log('');
  console.log('URI de redirection autorisés :');
  console.log(`   ${supabaseUrl}/auth/v1/callback`);
  console.log(`   https://[ton-repl-name].[username].replit.app/auth/callback`);
  
} else {
  console.log('❌ VITE_SUPABASE_URL non trouvée');
}

console.log('');
console.log('🎯 ÉTAPES SUIVANTES :');
console.log('1. Aller sur https://console.cloud.google.com/');
console.log('2. Créer OAuth 2.0 Client ID');
console.log('3. Copier les URLs ci-dessus');
console.log('4. Récupérer Client ID + Secret');
console.log('5. Les coller dans Supabase Dashboard → Auth → Providers → Google');