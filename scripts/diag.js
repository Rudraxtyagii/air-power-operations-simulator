const http = require('http');

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
}

async function checkConsole() {
  const version = await fetchJson('http://127.0.0.1:9222/json/version').catch(() => null);
  if (!version) {
    console.log('Chrome debugging not running right now.');
    return;
  }
}

checkConsole();
