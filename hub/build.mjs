#!/usr/bin/env node
// Baut die Startseite zu einer einzigen HTML-Datei. Gleiche Bauweise wie beim
// Spiel: nichts wird zur Laufzeit nachgeladen ausser der Schrift.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = dirname(fileURLToPath(import.meta.url));
const r = (p) => readFileSync(join(ROOT, p), 'utf8');

const ORDER = ['src/themen.js', 'src/szene.js', 'src/welt.js', 'src/main.js'];
const app = ORDER.map(p => `\n/* ================= ${p} ================= */\n` + r(p)).join('\n');

// Zwei Ausgaben aus denselben Quellen:
//   node build.mjs            -> dist/index.html   (fuer den Cloudflare Worker)
//   node build.mjs --artifact -> vorschau/hub.html   (Vorschau als Artifact)
// Der Unterschied ist nur der Rahmen: als Artifact liefert die Umgebung
// doctype, head und body – dort waeren eigene Kopfangaben doppelt. Ohne
// Doctype wiederum landet die eigene Seite im Quirks-Modus, wo der body statt
// des Dokuments scrollt und position:sticky falsch sitzt.
const alsArtifact = process.argv.includes('--artifact');

const kopf = alsArtifact ? '' : `<!doctype html>
<html lang="de">
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="description" content="Lernseiten der Jugendfeuerwehr: FwDV 3 als 3D-Lernspiel, bald auch Brennen und Löschen.">
<meta name="theme-color" content="#d92d20">
`;

const html = `${kopf}<title>Lernwerkstatt der Jugendfeuerwehr</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Archivo+Black&family=Outfit:wght@400;500;600;800&display=swap" rel="stylesheet">
<style>
${r('src/styles.css')}
</style>
${r('src/body.html')}
<script>
(function(){
"use strict";
${app}
})();
</script>
${alsArtifact ? '' : '</html>'}
`;

// Die Vorschau liegt bewusst neben dist/ und nicht darin: was in dist/ liegt,
// laedt der Worker mit hoch – die Seite gaebe es dann zweimal im Netz.
const ziel = alsArtifact ? 'vorschau/hub.html' : 'dist/index.html';
mkdirSync(join(ROOT, dirname(ziel)), { recursive: true });
writeFileSync(join(ROOT, ziel), html);
console.log(`hub/${ziel} geschrieben – ${(html.length / 1024).toFixed(0)} KB`);

// --- Das Spiel gehoert mit in dieselbe Auslieferung -------------------------
// Startseite und Spiel liegen auf einer Domain (jf.veerka.mp und
// jf.veerka.mp/fwdv3/), damit sie sich den Browserspeicher teilen. Deshalb
// baut dieses Skript das Spiel gleich mit und legt es daneben – sonst wuerde
// man versehentlich einen alten Stand veroeffentlichen.
// Ein Spiel bauen und neben die Startseite legen. `quelle` ist das Bauskript,
// `roh` sein Ergebnis in bau/, `unter` der Ordner unter hub/dist/.
async function spielUebernehmen(quelle, roh, unter) {
  await import(pathToFileURL(join(ROOT, quelle)).href);
  const datei = join(ROOT, roh);
  if (!existsSync(datei)) throw new Error(`${roh} fehlt – Spiel nicht gebaut?`);
  mkdirSync(join(ROOT, 'dist', unter), { recursive: true });
  const inhalt = readFileSync(datei);
  writeFileSync(join(ROOT, 'dist', unter, 'index.html'), inhalt);
  console.log(`hub/dist/${unter}/index.html übernommen – ${(inhalt.length / 1024).toFixed(0)} KB`);
}

if (!alsArtifact) {
  await spielUebernehmen('../build.mjs', '../bau/fwdv3.html', 'fwdv3');
  await spielUebernehmen('../brennen/build.mjs', '../bau/brennen-loeschen.html', 'brennen-loeschen');
  nachweisseiteBauen();
}

// --- Nachweisseite fuer den Jugendwart -------------------------------------
// Liegt unter jf.veerka.mp/nachweis/ und ist bewusst nirgends verlinkt: Sie
// geht die Kinder nichts an. Versteckt ist sie damit nicht – das Geheimnis
// steckt ohnehin in jedem Spiel (siehe gemeinsam/nachweis.js), hier kommt also
// nichts dazu, was nicht schon draussen waere.

// Die Abzeichenschluessel stehen in den Datendateien der Spiele. Die Seite
// braucht genau denselben Satz wie das Spiel, sonst passt kein einziger Code.
// Deshalb hier lesen statt abschreiben – und laut scheitern, wenn sich die
// Schreibweise dort aendert, statt still falsche Urteile auszugeben.
function abzeichenSchluessel(datei) {
  const quelle = readFileSync(join(ROOT, datei), 'utf8');
  const block = /const ABZEICHEN = \{([\s\S]*?)\n\};/.exec(quelle);
  if (!block) throw new Error(`${datei}: ABZEICHEN nicht gefunden – Nachweisseite kann nicht bauen`);
  const keys = [...block[1].matchAll(/^\s*([A-Za-zÄÖÜäöü_$][\w$]*)\s*:/gm)].map(m => m[1]);
  if (keys.length < 5) throw new Error(`${datei}: nur ${keys.length} Abzeichen gelesen – das kann nicht stimmen`);
  return keys;
}

function nachweisseiteBauen() {
  const spiele = [
    { id: 'fwdv3', name: 'Einsatzbereit', abzeichen: abzeichenSchluessel('../src/data/fwdv3.js') },
    { id: 'brennen', name: 'Brennen & Löschen', abzeichen: abzeichenSchluessel('../brennen/src/data/brandlehre.js') },
  ];

  const seite = `<!doctype html>
<html lang="de">
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="robots" content="noindex">
<meta name="theme-color" content="#0f1420">
<title>Nachweis prüfen</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Archivo+Black&family=Outfit:wght@400;500;600;800&display=swap" rel="stylesheet">
<style>
${r('src/nachweis.css')}
</style>
${r('src/nachweis.html')}
<script>
(function(){
"use strict";
const SPIELE = ${JSON.stringify(spiele)};
${readFileSync(join(ROOT, '../gemeinsam/nachweis.js'), 'utf8')}
${r('src/nachweis.js')}
})();
</script>
</html>
`;
  mkdirSync(join(ROOT, 'dist/nachweis'), { recursive: true });
  writeFileSync(join(ROOT, 'dist/nachweis/index.html'), seite);
  console.log(`hub/dist/nachweis/index.html geschrieben – ${(seite.length / 1024).toFixed(0)} KB, `
    + spiele.map(s => `${s.id}: ${s.abzeichen.length} Abzeichen`).join(', '));
}
