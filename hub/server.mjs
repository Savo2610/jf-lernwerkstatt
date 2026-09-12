// Kleiner Dateiserver fuer hub/dist – zeigt lokal dieselbe Struktur wie der
// Worker: / ist die Startseite, darunter liegen die Spiele (/fwdv3/ und
// /brennen-loeschen/), alles Unbekannte landet wieder auf der Startseite.
import { createServer } from 'node:http';
import { readFileSync, statSync } from 'node:fs';
import { join, dirname, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIST = join(dirname(fileURLToPath(import.meta.url)), 'dist');
// Feste Nummer, damit Lesezeichen halten – aber PORT sticht, wenn 8413 schon
// belegt ist (zwei Sitzungen gleichzeitig).
const PORT = Number(process.env.PORT) || 8413;

const datei = (p) => { try { return statSync(p).isFile() ? readFileSync(p) : null; } catch { return null; } };

// Die Startseite und die Spiele sind je eine HTML-Datei – Loeschlos unter
// /loeschlos/ nicht: als PWA braucht es CSS, JS, Manifest und Symbole einzeln.
// Mit text/html fuer alles laedt der Browser das Stylesheet nicht und der
// Service Worker verweigert die Anmeldung. Im Netz macht das der Worker
// richtig, hier muss es dieser Server nachstellen.
const TYPEN = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
};
const typ = (p) => TYPEN[(p.match(/\.[^.\/]+$/) || [''])[0]] || 'application/octet-stream';

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
  const gefunden = datei(voll);
  // Nur fuer Seiten auf die Startseite zurueckfallen. Eine fehlende .js oder
  // .png als HTML auszuliefern verdeckt den Fehler, statt ihn zu zeigen.
  const ersatz = gefunden || (pfad.endsWith('.html') ? datei(join(DIST, 'index.html')) : null);
  res.writeHead(ersatz ? 200 : 404, {
    'Content-Type': gefunden ? typ(pfad) : 'text/html; charset=utf-8',
    'Cache-Control': 'no-store',
  });
  res.end(ersatz || 'nicht gefunden');
}).listen(PORT, () => console.log('läuft auf http://localhost:' + PORT));
