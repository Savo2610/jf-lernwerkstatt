#!/usr/bin/env node
// Baut „Brennen & Löschen" zu einer einzigen HTML-Datei. Gleicher Bauweg wie
// beim FwDV-3-Spiel; unterschiedlich ist nur die Liste der Dateien.
import { spielBauen, ordnerDateien } from '../gemeinsam/bauen.mjs';

spielBauen({
  titel: 'Brennen & Löschen',
  beschreibung: 'Warum brennt etwas – und warum hört es auf? Das Verbrennungsdreieck, die Brandklassen und die Löschmittel als Lernspiel der Jugendfeuerwehr.',
  themenfarbe: '#d93a12',
  body: 'brennen/src/body.html',

  // farben.css setzt die Variablen, stil.css benutzt sie, stil-extra.css
  // ergänzt, was es nur hier gibt – in dieser Folge.
  stile: ['brennen/src/farben.css', 'gemeinsam/stil.css', 'brennen/src/stil-extra.css'],

  quellen: [
    'brennen/src/spiel.js',
    'brennen/src/data/brandlehre.js',
    'gemeinsam/util.js',
    'gemeinsam/state.js',
    'gemeinsam/audio.js',
    'gemeinsam/ui.js',
    'gemeinsam/stage.js',
    'brennen/src/welt/platz.js',
    'brennen/src/welt/feuer.js',
    'brennen/src/welt/labor.js',
    'brennen/src/welt/loeschen.js',
    'brennen/src/bausteine.js',
    ...ordnerDateien('brennen/src/levels'),
    'brennen/src/beamer.js',
    'brennen/src/main.js',
  ],

  ziel: 'bau/brennen-loeschen.html',
});
