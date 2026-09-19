#!/usr/bin/env node
// Baut „Einsatzbereit" (FwDV 3) zu einer einzigen, selbsttragenden HTML-Datei.
// Der eigentliche Bauweg steht in gemeinsam/bauen.mjs und wird von beiden
// Spielen benutzt; hier steht nur, aus welchen Dateien dieses Spiel besteht.
import { spielBauen, ordnerDateien } from './gemeinsam/bauen.mjs';

spielBauen({
  titel: 'Einsatzbereit',
  body: 'src/body.html',

  // farben.css setzt die Variablen, stil.css benutzt sie – in dieser Folge.
  stile: ['src/farben.css', 'gemeinsam/stil.css'],

  quellen: [
    // spiel.js zuerst: gemeinsam/state.js liest daraus den Speicherschluessel
    'src/spiel.js',
    'src/data/fwdv3.js',
    'gemeinsam/util.js',
    // nachweis.js vor state.js: der Spielstand stempelt Abzeichen mit dem Tag
    'gemeinsam/nachweis.js',
    'gemeinsam/state.js',
    'gemeinsam/audio.js',
    'gemeinsam/ui.js',
    'gemeinsam/stage.js',
    'src/three/figures.js',
    'src/three/vehicles.js',
    'src/three/fx.js',
    'src/three/scenery.js',
    'src/bausteine.js',
    // Level alphabetisch = L1 bis L8
    ...ordnerDateien('src/levels'),
    'src/beamer.js',
    'src/main.js',
  ],

  ziel: 'bau/fwdv3.html',
});
