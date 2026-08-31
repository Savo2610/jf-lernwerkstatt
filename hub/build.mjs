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
}
