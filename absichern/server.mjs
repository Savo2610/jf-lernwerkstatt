// Kleiner Dateiserver für das rohe Spiel aus bau/ – nur zum Entwickeln.
import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';
const PORT = 8415;
createServer((req, res) => {
  try {
    const html = readFileSync(new URL('../bau/absichern.html', import.meta.url));
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
    res.end(html);
  } catch (e) {
    res.writeHead(500); res.end(String(e));
  }
}).listen(PORT, () => console.log('läuft auf http://localhost:' + PORT));
