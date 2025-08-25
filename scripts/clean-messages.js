import http from 'http';

const data = JSON.stringify({});

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/messages-simple/clean-prefixes',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  
  let responseData = '';
  res.on('data', (chunk) => {
    responseData += chunk;
  });
  
  res.on('end', () => {
    try {
      const result = JSON.parse(responseData);
      console.log('✅ Nettoyage terminé:', result);
    } catch (e) {
      console.log('Response:', responseData);
    }
  });
});

req.on('error', (e) => {
  console.error('❌ Erreur:', e.message);
});

req.write(data);
req.end();