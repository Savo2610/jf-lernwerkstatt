/* ---------- Die Lernseiten -------------------------------------------------
   Das hier ist die einzige Datei, die man anfassen muss, um ein Thema
   hinzuzufuegen: einen Eintrag ergaenzen, `kulisse` auf eine der Kulissen aus
   szene.js setzen, fertig. Die Strecke, der Streckenplan und die Scrolllaenge
   richten sich automatisch danach.

   status: 'start'  – die Feuerwache am Anfang. Kein Thema, keine Karte: hier
                     soll nichts zum Klicken einladen, hier soll gescrollt
                     werden.
           'offen'  – fertig, `ziel` wird verlinkt
           'bald'   – in Arbeit, Karte mit stillem Knopf statt Link

   chip     steht klein ueber der Ueberschrift und sagt, woran man ist.
   nachsatz haengt im Fuss an die Zeile an – dort gibt es keinen Knopf, also
            muss der Satz selbst sagen, dass es die Seite noch nicht gibt.
   mit      ergaenzt einen zweiten, stillen Knopf neben dem ersten. Bislang
            nur an der Baustelle: der Weg ins Repo, fuer alle, die mitbauen
            wollen.
   fuss:false laesst den Eintrag aus der Liste „Alle Themen" heraus. Die
            Baustelle steht auf der Strecke, ist aber kein Thema.

   uebergang beschreibt die Blende, die beim Ausruecken zugeht: Grundton,
            Schriftfarbe und ein kleines Zeichen. Der Grundton ist die Farbe,
            mit der das Ziel anfaengt – „Einsatzbereit" beginnt in der Nacht,
            „Brennen & Loeschen" am hellen Vormittag. Trifft er, sieht man
            keinen Schnitt, sondern eine Fahrt. Ein Thema ohne Ziel braucht
            keinen.
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
    chip: '3D · 8 Aufgaben',
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
    chip: '3D · 8 Aufgaben',
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
  {
    id: 'loeschlos',
    kulisse: 'losrad',
    status: 'offen',
    kurz: 'Löschlos',
    // Kein „Thema": Loeschlos lehrt nichts, es nimmt dem Gruppenabend eine
    // Entscheidung ab. Deshalb steht hier Werkzeug – und deshalb ist „Erst
    // sichern!" dahinter Thema 3 und nicht Thema 4.
    ober: 'Werkzeug',
    chip: 'Für den Gruppenabend',
    titel: 'Löschlos',
    zeile: 'Wer ist heute da, und wer macht was? Anwesenheit abhaken, Plätze wählen, auslosen — und keiner diskutiert mehr über den Melder.',
    punkte: [
      'Alle neun Plätze der Gruppe mit ihren taktischen Zeichen',
      'Besetzungsvorschlag je nach Kopfzahl, zweites Fahrzeug ab acht',
      'Faires Mischen: andere Position, anderer Trupppartner als letztes Mal',
      'Läuft offline und lässt sich aufs Handy legen',
    ],
    ziel: 'https://jf.veerka.mp/loeschlos/',
    knopf: 'Auslosen',
    // Loeschlos macht in Nachtfarben auf, fast wie „Einsatzbereit" – nur eine
    // Spur kuehler. Das Zeichen sind die drei Trupprauten aus der App.
    uebergang: {
      grund: '#0b0e14', schrift: '#eef2fa',
      zeichen: '<svg viewBox="0 0 32 32" aria-hidden="true">' +
        '<path d="M16 3 L23.5 10.5 L16 18 L8.5 10.5 Z" fill="#ff4433"/>' +
        '<path d="M9.5 16 L16 22.5 L9.5 29 L3 22.5 Z" fill="#3b8cff"/>' +
        '<path d="M22.5 16 L29 22.5 L22.5 29 L16 22.5 Z" fill="#22c55e"/></svg>',
    },
  },
  {
    id: 'absichern',
    kulisse: 'absicherung',
    status: 'offen',
    kurz: 'Erst sichern!',
    ober: 'Thema 3',
    chip: '2D · 5 Aufgaben',
    titel: 'Erst sichern!',
    zeile: 'Die Einsatzstelle gegen den fließenden Verkehr sichern — von oben, mit Fahrzeug, Kegeln und den Abständen, die wirklich gelten.',
    punkte: [
      'Innerorts 100 m, Landstraße 200 m, Autobahn 800 m',
      'Anfahren, hinstellen, absitzen, antreten — in der Draufsicht',
      'Warndreieck, Warnleuchte, Leitkegel, Blitzleuchten: was wohin gehört',
      'Wenn das Material eines Fahrzeugs nicht reicht: das zweite',
      'Vorbereitung auf die Jugendflamme Stufe 2',
    ],
    ziel: 'https://jf.veerka.mp/absichern/',
    knopf: 'Losfahren',
    // Heller Tag an der Straße, Asphaltgrau mit Warnorange. Die Schrift muss
    // deshalb dunkel sein, nicht hell.
    uebergang: {
      grund: '#eef0f2', schrift: '#1d2329',
      zeichen: '<svg viewBox="0 0 32 32" aria-hidden="true">' +
        '<path d="M4 27 h24 l-4 -5 h-16 Z" fill="#c74a10"/>' +
        '<path d="M11 22 L14.4 5 h3.2 L21 22 Z" fill="#ef5b12"/>' +
        '<path d="M12.6 13.5 h6.8 l-.8 -4 h-5.2 Z" fill="#f7f4ef"/></svg>',
    },
  },
  {
    id: 'baustelle',
    kulisse: 'baustelle',
    status: 'bald',
    kurz: 'Baustelle',
    ober: 'Thema 4',
    chip: 'Baustelle',
    titel: 'Hier ist noch Platz',
    zeile: 'Was hinter dem Bauzaun entsteht, steht noch nicht fest. Gerätekunde? Knoten und Stiche? Erste Hilfe? Wer eine Idee hat, sagt sie am besten direkt im Gruppenabend — oder gleich im Repo.',
    punkte: [
      'Themenwünsche und Fehler gehören in die Issues',
      'Alles liegt offen: Aufgaben, Kulissen, Texte',
      'Mitbauen geht auch ohne Feuerwehrhelm',
    ],
    knopf: 'Wird gerade gebaut',
    mit: { text: 'Hilf mit beim Bauen', ziel: 'https://github.com/Savo2610/jf-lernwerkstatt' },
    fuss: false,
  },
];
