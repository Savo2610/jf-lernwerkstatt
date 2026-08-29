/* ---------- Die Lernseiten -------------------------------------------------
   Das hier ist die einzige Datei, die man anfassen muss, um ein Thema
   hinzuzufuegen: einen Eintrag ergaenzen, `kulisse` auf eine der Kulissen aus
   szene.js setzen, fertig. Die Strecke, der Streckenplan und die Scrolllaenge
   richten sich automatisch danach.

   status: 'start'  – die Feuerwache am Anfang. Kein Thema, keine Karte: hier
                     soll nichts zum Klicken einladen, hier soll gescrollt
                     werden.
           'offen'  – fertig, `ziel` wird verlinkt
           'bald'   – in Arbeit, Karte ohne Knopf
   -------------------------------------------------------------------------*/
const THEMEN = [
  {
    id: 'wache',
    kulisse: 'wache',
    status: 'start',
    kurz: 'Start',
  },
  {
    id: 'fwdv3',
    kulisse: 'uebungshof',
    status: 'offen',
    kurz: 'FwDV 3',
    ober: 'Thema 1',
    titel: 'Einsatzbereit',
    zeile: 'Die FwDV 3 als Lernspiel in 3D: Wer sitzt wo, wer macht was, und wie läuft ein Löschangriff wirklich ab?',
    punkte: [
      'Acht Aufgaben vom Einheiten-Aufbau bis zum Löschangriff',
      'Sitz- und Antreteordnung von unserem LF 19/43 und dem KLF 19/49',
      'Ränge, XP und elf Abzeichen',
      'Beamer-Modus mit Quiz-Duell und Memory für den Gruppenabend',
    ],
    // Absolut, aber auf dieselbe Domain: nur so teilen sich Startseite und
    // Spiel den Browserspeicher (und spaeter die Medaillen).
    ziel: 'https://jf.veerka.mp/fwdv3/',
    knopf: 'Losfahren',
  },
  {
    id: 'brennen',
    kulisse: 'brandhaus',
    status: 'bald',
    kurz: 'Brennen & Löschen',
    ober: 'Thema 2',
    titel: 'Brennen & Löschen',
    zeile: 'Warum brennt etwas überhaupt — und warum hört es auf? Verbrennungsdreieck, Löschmittel und Löschwirkungen.',
    punkte: [
      'Das Verbrennungsdreieck: Brennstoff, Sauerstoff, Zündtemperatur',
      'Brandklassen A bis F und das passende Löschmittel',
      'Die vier Löschwirkungen',
    ],
    knopf: 'Wird gerade gebaut',
  },
];
