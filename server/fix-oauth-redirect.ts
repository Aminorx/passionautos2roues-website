// Analyser le token OAuth reçu et corriger la redirection
console.log('🔍 ANALYSE DU PROBLÈME OAUTH GOOGLE :');
console.log('');

console.log('❌ PROBLÈME IDENTIFIÉ :');
console.log('   Redirection vers localhost:3000 au lieu du domaine Replit');
console.log('');

console.log('🎯 CAUSE :');
console.log('   1. Dans Google Cloud Console, une des URLs contient localhost:3000');
console.log('   2. Ou Supabase redirectTo n\'est pas correctement configuré');
console.log('');

console.log('🔧 SOLUTIONS :');
console.log('');

console.log('1. VÉRIFIER GOOGLE CLOUD CONSOLE :');
console.log('   - Aller sur https://console.cloud.google.com/');
console.log('   - APIs & Services → Credentials');
console.log('   - Cliquer sur ton OAuth Client ID');
console.log('   - SUPPRIMER toute URL contenant localhost:3000');
console.log('   - GARDER SEULEMENT :');
console.log('     * https://workspace.amineennoury.replit.app/auth/callback');
console.log('');

console.log('2. VÉRIFIER SUPABASE DASHBOARD :');
console.log('   - Authentication → URL Configuration');
console.log('   - Site URL : https://workspace.amineennoury.replit.app');
console.log('   - Redirect URLs : https://workspace.amineennoury.replit.app/**');
console.log('');

console.log('3. TOKEN REÇU EST VALIDE :');
console.log('   - L\'utilisateur est bien authentifié');
console.log('   - Email : amine.ennoury@gmail.com');
console.log('   - ID : 530429f5-3766-4907-ba51-862d61710112');
console.log('   - Le problème est juste la redirection');
console.log('');

console.log('🚀 APRÈS CORRECTION :');
console.log('   L\'utilisateur sera redirigé vers workspace.amineennoury.replit.app');
console.log('   Et synchronisé automatiquement dans les tables users + profiles');