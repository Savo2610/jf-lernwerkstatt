import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';
// siehe hub/server.mjs: PORT sticht die feste Nummer
const PORT = Number(process.env.PORT) || 8412;
createServer((req, res) => {
  try {
    const html = readFileSync(new URL('./bau/fwdv3.html', import.meta.url));
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
    res.end(html);
  } catch (e) {
    res.writeHead(500); res.end(String(e));
  }
}).listen(PORT, () => console.log('läuft auf http://localhost:' + PORT));
