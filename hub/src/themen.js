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

   `uebergang` beschreibt die Blende, die beim Ausruecken zugeht: Grundton,
   Schriftfarbe und ein kleines Zeichen. Der Grundton ist die Farbe, mit der
   das Ziel anfaengt – „Einsatzbereit" beginnt in der Nacht, „Brennen &
   Loeschen" am hellen Vormittag. Trifft er, sieht man keinen Schnitt,
   sondern eine Fahrt.
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
    // Nachthimmel: Drueben ist Einsatznacht. Der Helm ist derselbe wie im Spiel.
    uebergang: {
      grund: '#080b14', schrift: '#eaf0ff',
      zeichen: '<svg viewBox="0 0 32 32" aria-hidden="true">' +
        '<path d="M4 22c0-7.2 5.4-13 12-13s12 5.8 12 13z" fill="#d92d20"/>' +
        '<path d="M14 9.3V4.6h4v4.7z" fill="#f5b301"/>' +
        '<rect x="2" y="21" width="28" height="4.4" rx="2.2" fill="#96150c"/></svg>',
    },
  },
  {
    id: 'brennen',
    kulisse: 'brandhaus',
    status: 'offen',
    kurz: 'Brennen & Löschen',
    ober: 'Thema 2',
    titel: 'Brennen & Löschen',
    zeile: 'Warum brennt etwas überhaupt — und warum hört es auf? Verbrennungsdreieck, Brandklassen und Löschmittel.',
    // Dreieck mit vier Voraussetzungen ist kein Versehen: Drei stehen an den
    // Ecken, das richtige Mengenverhaeltnis steht in der Mitte — es ist ja das
    // Verhaeltnis zwischen zweien der Ecken und kann deshalb keine eigene Ecke
    // haben. Genau so zeigt es das Spiel in Aufgabe 1, und die Startseite darf
    // nichts anderes versprechen.
    punkte: [
      'Das Verbrennungsdreieck — und was in seiner Mitte steht',
      'Brandklassen A bis F — und die, die es gar nicht gibt',
      'Sauerstoff, Mischung, Zündenergie: ab wann brennt es?',
      'Fünf Löschverfahren — und wo jedes davon angreift',
      'Wasser, Schaum, Pulver, CO₂ — und wann welches knallt',
      'Acht Aufgaben, sechzehn Abzeichen, Beamer-Modus mit Feuerwand',
    ],
    ziel: 'https://jf.veerka.mp/brennen-loeschen/',
    knopf: 'Losfahren',
    // Heller Vormittagshimmel: Das Spiel steht auf dem Uebungsplatz in der
    // Sonne. Die Schrift muss deshalb dunkel sein, nicht hell.
    uebergang: {
      grund: '#8ec4e2', schrift: '#0d2233',
      // enger gefasste viewBox als beim Helm: Eine Flamme ist schmal und
      // wuerde in einem quadratischen Feld halb so gross wirken.
      zeichen: '<svg viewBox="7 2 18 28" aria-hidden="true">' +
        '<path d="M16 3c1.6 4.6-3.4 6.2-3.4 10.2 0 1.7 1 3 2.3 3.6-.6-2.6.7-4.4 2.2-5.6' +
        '-.3 3 2.9 3.8 3.8 7 1 3.6-1.6 7.4-4.9 7.4-3.4 0-6.2-2.6-6.2-6.4 0-1.3.3-2.4.8-3.4' +
        '-1.5 1-2.6 2.9-2.6 5.4C8 27 11.7 30 16 30s8-3.4 8-8.4C24 13.6 16.9 12.2 16 3z" fill="#e8621f"/>' +
        '<path d="M16 30c-2.6 0-4.6-2-4.6-4.6 0-3 3.2-3.8 3.8-7.4 1.9 1.6 5.4 4 5.4 7.4' +
        'C20.6 28 18.6 30 16 30z" fill="#f5b301"/></svg>',
    },
  },
];
