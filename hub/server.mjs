// Kleiner Dateiserver fuer hub/dist – zeigt lokal dieselbe Struktur wie der
// Worker: / ist die Startseite, darunter liegen die Spiele (/fwdv3/ und
// /brennen-loeschen/), alles Unbekannte landet wieder auf der Startseite.
import { createServer } from 'node:http';
import { readFileSync, statSync } from 'node:fs';
import { join, dirname, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIST = join(dirname(fileURLToPath(import.meta.url)), 'dist');
const PORT = 8413;

const datei = (p) => { try { return statSync(p).isFile() ? readFileSync(p) : null; } catch { return null; } };

createServer((req, res) => {
  const url = new URL(req.url, 'http://x');
  let pfad = normalize(decodeURIComponent(url.pathname));
  if (pfad.endsWith('/')) pfad += 'index.html';
  const voll = join(DIST, pfad);
  if (!voll.startsWith(DIST)) { res.writeHead(403); return res.end('nope'); }

  // Verzeichnis ohne Schraegstrich: umleiten, genau wie der Worker
  if (datei(join(voll, 'index.html')) && !pfad.endsWith('index.html')) {
    res.writeHead(301, { Location: url.pathname + '/' + url.search });
    return res.end();
  }
  const inhalt = datei(voll) || datei(join(DIST, 'index.html'));
  res.writeHead(inhalt ? 200 : 404, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(inhalt || 'nicht gefunden');
}).listen(PORT, () => console.log('läuft auf http://localhost:' + PORT));
