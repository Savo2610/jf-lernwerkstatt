#!/usr/bin/env node
// Baut alle Quellen zu einer einzigen, selbsttragenden HTML-Datei zusammen.
// Kein externer Request zur Laufzeit -> lauffaehig als Artifact und offline.
import { readFileSync, writeFileSync, existsSync, readdirSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(fileURLToPath(import.meta.url));
const r = (p) => readFileSync(join(ROOT, p), 'utf8');

// --- 1. three.js: ES-Modul in klassisches Skript umwandeln -------------------
function threeAsClassicScript() {
  let src = r('vendor/three.module.min.js');
  const m = src.match(/export\s*\{([^}]*)\}\s*;?\s*$/);
  if (!m) throw new Error('three.js: finale export-Anweisung nicht gefunden');
  const pairs = m[1].split(',').map(s => s.trim()).filter(Boolean).map(entry => {
    const as = entry.split(/\s+as\s+/);
    const local = as[0].trim();
    const exported = (as[1] || as[0]).trim();
    return `${JSON.stringify(exported)}:${local}`;
  });
  src = src.slice(0, m.index);
  // eigener Scope: die verkuerzten Bezeichner von three.js duerfen sich nicht
  // mit unseren eigenen Namen beissen (three belegt z. B. \`$\`)
  return `const THREE = (function(){\n${src}\nreturn Object.freeze({${pairs.join(',')}});\n})();\n`;
}

// --- 2. Quelldateien in fester Reihenfolge ----------------------------------
const ORDER = [
  'src/data/fwdv3.js',
  'src/util.js',
  'src/state.js',
  'src/audio.js',
  'src/ui.js',
  'src/three/stage.js',
  'src/three/figures.js',
  'src/three/vehicles.js',
  'src/three/fx.js',
  'src/three/scenery.js',
];

// Level werden automatisch eingesammelt (alphabetisch = Reihenfolge L0..L8)
function levelFiles() {
  const dir = join(ROOT, 'src/levels');
  if (!existsSync(dir)) return [];
  return readdirSync(dir).filter(f => f.endsWith('.js')).sort().map(f => 'src/levels/' + f);
}

const TAIL = ['src/beamer.js', 'src/main.js'];

function bundleApp() {
  const files = [...ORDER, ...levelFiles(), ...TAIL].filter(p => existsSync(join(ROOT, p)));
  return files.map(p => `\n/* ================= ${p} ================= */\n` + r(p)).join('\n');
}

// --- 3. HTML zusammensetzen -------------------------------------------------
const css = r('src/styles.css');
const body = r('src/body.html');
const app = bundleApp();
const three = threeAsClassicScript();

// charset und viewport muessen mit in die Datei: als Artifact bekommt sie
// beides vom Rahmen, beim eigenen Hosting (Cloudflare Worker) nicht – dort
// kaeme sonst Latin-1 statt UTF-8 an und Handys wuerden mit 980 px rendern.
const html = `<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>Einsatzbereit</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Archivo+Black&family=Outfit:wght@400;500;600;800;900&display=swap" rel="stylesheet">
<style>
${css}
</style>
${body}
<script>
(function(){
"use strict";
${three}
${app}
})();
</script>
`;

// dist/ steht in .gitignore – im frischen Klon (und beim Autodeploy) gibt es
// den Ordner also nicht.
mkdirSync(join(ROOT, 'dist'), { recursive: true });
writeFileSync(join(ROOT, 'dist/index.html'), html);
const kb = (html.length / 1024).toFixed(0);
console.log(`dist/index.html geschrieben – ${kb} KB`);
