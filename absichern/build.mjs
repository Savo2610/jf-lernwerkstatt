#!/usr/bin/env node
// Baut „Erst sichern!" zu einer einzigen HTML-Datei. Gleicher Bauweg wie bei
// den beiden 3D-Spielen; unterschiedlich sind die Dateiliste und ein Schalter:
// `three: false`. Diese Seite hat keine 3D-Bühne, sondern eine Draufsicht in
// SVG – Three.js wäre knapp ein Megabyte totes Gewicht.
import { spielBauen, ordnerDateien } from '../gemeinsam/bauen.mjs';

spielBauen({
  titel: 'Erst sichern!',
  beschreibung: 'Verkehrsabsicherung nach FwDV 1: Innerorts, Landstraße und Autobahn '
              + 'in der Draufsicht — das Lernspiel der Jugendfeuerwehr zur Jugendflamme Stufe 2.',
  themenfarbe: '#f59e0b',
  three: false,
  body: 'absichern/src/body.html',

  // farben.css setzt die Variablen, stil.css benutzt sie, stil-extra.css
  // ergänzt, was es nur hier gibt – in dieser Folge.
  stile: ['absichern/src/farben.css', 'gemeinsam/stil.css', 'absichern/src/stil-extra.css'],

  quellen: [
    // spiel.js zuerst: gemeinsam/state.js liest daraus den Speicherschlüssel
    'absichern/src/spiel.js',
    'absichern/src/data/absicherung.js',
    'gemeinsam/util.js',
    // nachweis.js vor state.js: der Spielstand stempelt Abzeichen mit dem Tag
    'gemeinsam/nachweis.js',
    'gemeinsam/state.js',
    'gemeinsam/audio.js',
    'gemeinsam/ui.js',
    // gemeinsam/stage.js fehlt hier mit Absicht: die Bühne ist 2D und steht
    // in buehne.js. Sie erfüllt denselben kleinen Vertrag (bildVersatz,
    // anmelden, abmelden, updates), den gemeinsam/ui.js an eine Bühne stellt.
    'absichern/src/buehne.js',
    'absichern/src/welt/plan.js',
    'absichern/src/welt/geraete.js',
    'absichern/src/bausteine.js',
    // Level alphabetisch = L1 bis L5
    ...ordnerDateien('absichern/src/levels'),
    'absichern/src/main.js',
  ],

  ziel: 'bau/absichern.html',
});
