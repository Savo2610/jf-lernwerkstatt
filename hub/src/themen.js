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
  },
  {
    id: 'brennen',
    kulisse: 'brandhaus',
    status: 'bald',
    kurz: 'Brennen & Löschen',
    ober: 'Thema 2',
    chip: 'Fast fertig',
    titel: 'Brennen & Löschen',
    zeile: 'Warum brennt etwas überhaupt — und warum hört es auf? Verbrennungsdreieck, Löschmittel und Löschwirkungen.',
    punkte: [
      'Das Verbrennungsdreieck: Brennstoff, Sauerstoff, Zündtemperatur',
      'Brandklassen A bis F und das passende Löschmittel',
      'Die vier Löschwirkungen',
    ],
    knopf: 'Kommt in Kürze',
    nachsatz: 'Steht kurz vor der Fertigstellung.',
  },
  {
    id: 'baustelle',
    kulisse: 'baustelle',
    status: 'bald',
    kurz: 'Baustelle',
    ober: 'Thema 3',
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
