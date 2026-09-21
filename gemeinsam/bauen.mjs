#!/usr/bin/env node
/* ---------- Der Bauweg, den sich alle Lernseiten teilen --------------------
   Ergebnis ist immer genau eine HTML-Datei: Stil, alle Quellen und – wo eine
   3D-Buehne dranhaengt – Three.js darin eingebettet. Zur Laufzeit wird nichts
   nachgeladen ausser der Schrift. So laeuft dieselbe Datei im Netz, offline
   und als Artifact.
   -------------------------------------------------------------------------*/
import { readFileSync, writeFileSync, existsSync, readdirSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HIER = dirname(fileURLToPath(import.meta.url));
const WURZEL = join(HIER, '..');

/* --- three.js: ES-Modul in klassisches Skript umwandeln --------------------
   Die beiden 3D-Spiele benutzen dieselbe Datei aus vendor/. Sie einmal
   umzuwandeln reicht – das dauert bei jedem Aufruf spuerbar.                */
let _three = null;
export function threeAlsSkript() {
  if (_three) return _three;
  let src = readFileSync(join(WURZEL, 'vendor/three.module.min.js'), 'utf8');
  const m = src.match(/export\s*\{([^}]*)\}\s*;?\s*$/);
  if (!m) throw new Error('three.js: finale export-Anweisung nicht gefunden');
  const paare = m[1].split(',').map(s => s.trim()).filter(Boolean).map(eintrag => {
    const as = eintrag.split(/\s+as\s+/);
    const lokal = as[0].trim();
    const ausgefuehrt = (as[1] || as[0]).trim();
    return `${JSON.stringify(ausgefuehrt)}:${lokal}`;
  });
  src = src.slice(0, m.index);
  // eigener Scope: die verkuerzten Bezeichner von three.js duerfen sich nicht
  // mit unseren eigenen Namen beissen (three belegt z. B. `$`)
  _three = `const THREE = (function(){\n${src}\nreturn Object.freeze({${paare.join(',')}});\n})();\n`;
  return _three;
}

/* Alle .js aus einem Ordner, alphabetisch. So bestimmt der Dateiname die
   Reihenfolge (L1_… vor L2_…) und ein neues Level braucht keinen Eintrag. */
export function ordnerDateien(pfad) {
  const voll = join(WURZEL, pfad);
  if (!existsSync(voll)) return [];
  return readdirSync(voll).filter(f => f.endsWith('.js')).sort().map(f => pfad + '/' + f);
}

/* --- Ein Spiel bauen -------------------------------------------------------
   opt: { titel, beschreibung, stile[], quellen[], ziel, alsArtifact, three }
   Pfade sind immer relativ zur Wurzel des Projekts.

   `three: false` laesst die Bibliothek weg. Das braucht „Erst sichern!":
   Die Seite zeichnet eine Draufsicht in SVG und hat gar keine 3D-Buehne –
   Three.js waere dort knapp ein Megabyte totes Gewicht in jeder Auslieferung.

   alsArtifact laesst doctype und Kopfangaben weg: dort liefert die Umgebung
   beides, und doppelte Angaben wuerden sich in die Quere kommen. Ohne
   doctype wiederum landet die eigene Seite im Quirks-Modus.                 */
export function spielBauen(opt) {
  const lies = (p) => readFileSync(join(WURZEL, p), 'utf8');
  const stil = opt.stile.map(p => `/* ===== ${p} ===== */\n` + lies(p)).join('\n');
  const app = opt.quellen
    .filter(p => existsSync(join(WURZEL, p)))
    .map(p => `\n/* ================= ${p} ================= */\n` + lies(p))
    .join('\n');

  // charset und viewport muessen mit in die Datei: als Artifact bekommt sie
  // beides vom Rahmen, beim eigenen Hosting (Cloudflare Worker) nicht – dort
  // kaeme sonst Latin-1 statt UTF-8 an und Handys wuerden mit 980 px rendern.
  const kopf = opt.alsArtifact ? '' : `<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
${opt.beschreibung ? `<meta name="description" content="${opt.beschreibung}">\n` : ''}${opt.themenfarbe ? `<meta name="theme-color" content="${opt.themenfarbe}">\n` : ''}`;

  const html = `${kopf}<title>${opt.titel}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Archivo+Black&family=Outfit:wght@400;500;600;800;900&display=swap" rel="stylesheet">
<style>
${stil}
</style>
${lies(opt.body)}
<script>
(function(){
"use strict";
${opt.three === false ? '' : threeAlsSkript()}
${app}
})();
</script>
`;

  // dist/ steht in .gitignore – im frischen Klon (und beim Autodeploy) gibt es
  // den Ordner also nicht.
  const ziel = join(WURZEL, opt.ziel);
  mkdirSync(dirname(ziel), { recursive: true });
  writeFileSync(ziel, html);
  console.log(`${opt.ziel} geschrieben – ${(html.length / 1024).toFixed(0)} KB`);
  return html;
}
