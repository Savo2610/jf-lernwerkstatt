/* ============================================================================
   Inhalte von „Erst sichern!"

   Das hier ist Inhalt, kein Code. Jede Zahl steht so in der FwDV 1, Kapitel 19
   „Sichern von Einsatzstellen gegen fließenden Verkehr" (Ausgabe Januar 2006),
   oder in der Lernunterlage der Hessischen Landesfeuerwehrschule
   „Verhalten bei Gefahr", Abschnitt 2.4. Beide liegen im Volltext in
   referenz/verkehrsabsicherung/.

   Wer hier etwas ändert, ändert, was Kinder lernen. Gegen die Quelle prüfen,
   nicht raten.
   ========================================================================== */

/* --- Die drei Straßen ------------------------------------------------------
   `abstand` ist der Beginn der Absicherung vor der Einsatzstelle. Innerorts
   100 m, außerorts 200 m, auf der Autobahn ohne Geschwindigkeitsbegrenzung
   800 m mit Wiederholung alle 200 m.

   `beidseitig` sagt, ob nach beiden Seiten gesichert wird. Das hängt nicht an
   der Ortstafel, sondern am Gegenverkehr: Eine Straße mit Gegenverkehr muss
   stets nach beiden Seiten gesichert werden, eine Richtungsfahrbahn nur
   entgegen der Fahrtrichtung.                                               */
const STRASSEN = {
  innerorts: {
    id: 'innerorts', name: 'Innerorts', icon: '🏘️',
    abstand: 100, beidseitig: true, tempo: '50',
    kurz: 'Geschlossene Ortschaft, Gegenverkehr',
    /* Die 100 Meter stehen nicht im Fließtext der FwDV 1, sondern in der
       Zeichnung „Absicherung auf gerader Straße" – der Text nennt nur die
       200 Meter für außerorts. Deshalb wird hier die Zeichnung zitiert und
       nicht ein Satz, der etwas anderes sagt. */
    zitat: 'Absicherung auf gerader Straße — innerorts: 100 m, außerorts: 200 m '
         + '(Zeichnung in Kapitel 19).',
  },
  landstrasse: {
    id: 'landstrasse', name: 'Landstraße', icon: '🌾',
    abstand: 200, beidseitig: true, tempo: '100',
    kurz: 'Außerhalb geschlossener Ortschaften, Gegenverkehr',
    zitat: 'Bei unübersichtlicher Straßenführung (Kurven, Kuppen, sonstige Sichtbehinderungen) '
         + 'sind gegebenenfalls größere Sicherheitsabstände zu wählen.',
  },
  autobahn: {
    id: 'autobahn', name: 'Autobahn', icon: '🛣️',
    abstand: 800, wiederholung: 200, beidseitig: false, tempo: 'frei',
    kurz: 'Richtungsfahrbahnen, kein Gegenverkehr',
    zitat: 'In Streckenbereichen ohne Geschwindigkeitsbegrenzung hat der Beginn der Absicherung '
         + '800 Meter entgegen der Fahrtrichtung vor der Einsatzstelle zu erfolgen. '
         + 'Die Zeichen sollen nach 200 Metern in Fahrtrichtung wiederholt werden.',
  },
};

/* Die Leitpfosten sind das Maßband der Einsatzstelle. Niemand schreitet
   200 Meter ab – man zählt Pfosten. Steht als Hinweis in der FwDV 1.        */
const LEITPFOSTEN_ABSTAND = 50;

/* --- Das Gerät -------------------------------------------------------------
   Die Hilfsmittel, die die FwDV 1 nennt. `aufBefehl` heißt: Der Trupp nimmt
   es nur mit, wenn der Einheitsführer es befiehlt – Warndreieck und
   Warnleuchte nimmt er immer.                                               */
const GERAETE = {
  warndreieck: {
    id: 'warndreieck', name: 'Warndreieck', icon: '⚠️',
    kurz: 'Das Grundgerät. Steht nie allein.',
    lang: 'Jeder der beiden aus dem Sicherungstrupp nimmt eines mit. Allein ist es zu leise — '
        + 'daneben gehört eine Warnleuchte.',
  },
  warnleuchte: {
    id: 'warnleuchte', name: 'Warnleuchte', icon: '🔶',
    kurz: 'Gehört neben jedes Warndreieck.',
    lang: 'Zur besseren Erkennbarkeit soll neben dem Warndreieck zusätzlich eine Warnleuchte '
        + 'aufgestellt werden. Bei Dunkelheit sieht man von beiden nur sie.',
  },
  leitkegel: {
    id: 'leitkegel', name: 'Verkehrsleitkegel', icon: '🚧',
    kurz: '500 oder 750 mm hoch. Leitet, sperrt aber nicht.',
    lang: 'Mit Leitkegeln wird die Fahrspur verengt oder gesperrt. Sie stehen in einer '
        + 'Verjüngung, die den Verkehr schräg herüberzieht — nicht als Mauer quer über die Fahrbahn.',
  },
  blitzleuchte: {
    id: 'blitzleuchte', name: 'Verkehrswarngerät', icon: '💡',
    kurz: 'Blitzleuchten. Gehören zu den Kegeln.',
    lang: 'Zum Sperren einer Fahrspur gehören Leitkegel und Blitzleuchten zusammen: '
        + 'fünf Kegel und mindestens zwei Blitzleuchten für eine Spur.',
  },
  warnflagge: {
    id: 'warnflagge', name: 'Warnflagge', icon: '🚩',
    kurz: 'In der Hand eines Sicherungspostens.',
    lang: 'Ein Sicherungsposten kommt dazu, wenn ein Hindernis sonst nicht ausreichend '
        + 'kenntlich gemacht werden kann. Er steht, er warnt — er trägt nichts.',
  },
  winkerkelle: {
    id: 'winkerkelle', name: 'Stabwinker', icon: '🪧',
    kurz: 'Winkerkelle — nur der Truppführer.',
    lang: 'Warnflagge oder Stabwinker (Winkerkelle) bekommt der Truppführer, und auch nur '
        + 'auf Befehl des Einheitsführers.',
  },
  warnweste: {
    id: 'warnweste', name: 'Warnkleidung', icon: '🦺',
    kurz: 'Kommt vor allem anderen.',
    lang: 'Warnweste nach DIN EN 471 oder entsprechende Einsatzkleidung — angelegt wird sie '
        + 'schon auf der Anfahrt, nicht erst an der Einsatzstelle.',
  },
  faltsignal: {
    id: 'faltsignal', name: 'Faltsignal', icon: '🔺',
    kurz: 'Verkehrszeichen zum Aufklappen.',
    lang: 'Auf der Autobahn sind Warndreieck und Warnleuchte nicht auffällig genug. '
        + 'Dort gehören zusätzlich mitgeführte Verkehrszeichen oder Faltsignale dazu.',
  },
};

/* --- Wer was trägt ---------------------------------------------------------
   Aus der FwDV 1, Abschnitt „Trupp mit sichernden Aufgaben": Ausrüstung auf
   den Befehl „… zum Sichern gegen den fließenden Straßenverkehr … vor!"

   Beleuchtungsgerät und Handsprechfunkgerät trägt der Truppführer bei jedem
   Auftrag — die stehen deshalb hier mit drin, gehören aber nicht zur
   Absicherung im engeren Sinn.                                              */
const AUSRUESTUNG = {
  truppfuehrer: {
    name: 'Truppführer', kurz: 'WTrF',
    immer: ['warndreieck', 'warnleuchte'],
    aufBefehl: ['warnflagge', 'winkerkelle'],
    dazu: 'Beleuchtungsgerät, ggf. Handsprechfunkgerät',
  },
  truppmann: {
    name: 'Truppmann', kurz: 'WTrM',
    immer: ['warndreieck', 'warnleuchte'],
    aufBefehl: ['warnflagge', 'leitkegel', 'blitzleuchte'],
    dazu: null,
  },
};

/* Der Befehl, mit dem alles anfängt. Wortlaut aus der FwDV 1. */
const SICHERUNGSBEFEHL = 'Wassertrupp – zum Sichern gegen den fließenden Straßenverkehr – vor!';

/* --- Was ein Löschfahrzeug an Sicherungsgerät dabei hat ---------------------
   Die FwDV 1 schreibt keine Stückzahl vor, die Beladenormen der Fahrzeuge tun
   das. Diese Zahlen sind die eines gewöhnlichen LF und bewusst knapp: Auf der
   Autobahn reicht das Material eines Fahrzeugs nicht, und genau das soll
   Aufgabe 5 zeigen. Wer sie großzügiger macht, nimmt der Aufgabe ihren Kern.
   -------------------------------------------------------------------------*/
const BELADUNG = { warndreieck: 2, warnleuchte: 2, leitkegel: 6, blitzleuchte: 2, faltsignal: 0 };

/* --- Sicherheitsregeln -----------------------------------------------------
   Wörtlich sinngemäß aus den „Hinweisen zur Sicherheit" der FwDV 1 und aus
   Abschnitt 2.4 der Lernunterlage. `gilt` sagt, ob der Satz richtig ist —
   die Aufgaben mischen richtige und falsche Sätze.                          */
const REGELN = [
  { id: 'abgewandt', gilt: true,
    text: 'Absitzen nur auf der der Fahrbahn abgewandten Seite, antreten vor dem Fahrzeug.' },
  { id: 'warnkleidung', gilt: true,
    text: 'Warnkleidung wird schon auf der Anfahrt angelegt.' },
  { id: 'lichter', gilt: true,
    text: 'Blaues Blinklicht, Warnblinkanlage und Fahrlicht bleiben eingeschaltet.' },
  { id: 'leitplanke', gilt: true,
    text: 'Ist eine Leitplanke da, wird beim Auf- und Abbauen dahinter gelaufen.' },
  { id: 'leerFahrzeug', gilt: true,
    text: 'In einem Fahrzeug, das nur zur Sicherung steht, sitzt niemand.' },
  { id: 'sichererPlatz', gilt: true,
    text: 'Wer gerade nicht gebraucht wird, steht an einem sicheren Platz — zum Beispiel hinter der Leitplanke.' },
  { id: 'gleichmaessig', gilt: true,
    text: 'Der Abstand der einzelnen Warngeräte soll gleichmäßig sein.' },
  { id: 'einmuendungen', gilt: true,
    text: 'Einmündungen und Kreuzungen innerhalb des Absperrbereichs werden mitgedacht.' },
  { id: 'erstVerletzte', gilt: false,
    text: 'Sind Verletzte zu sehen, wird erst versorgt und danach abgesichert.' },
  { id: 'stvo100', gilt: false,
    text: 'Die 100 Meter aus § 15 StVO reichen für eine Einsatzstelle der Feuerwehr aus.' },
  { id: 'nurNachts', gilt: false,
    text: 'Eine Warnleuchte braucht man nur bei Dunkelheit.' },
  { id: 'quer', gilt: false,
    text: 'Leitkegel stellt man quer über die Fahrbahn, damit niemand durchkommt.' },
];

/* --- Truppfarben -----------------------------------------------------------
   Dieselbe Zuordnung wie in „Einsatzbereit" und in Löschlos: rot der
   Angriffstrupp, blau der Wassertrupp, grün der Schlauchtrupp, Gold der
   Einheitsführer, Stahl der Maschinist. Wer drei Seiten der Lernwerkstatt
   kennt, soll den Wassertrupp überall an derselben Farbe erkennen.

   Die Töne sind dunkler als drüben, und das ist kein Versehen: Dort liegen
   sie auf einer Nachtszene, hier auf hellem Asphalt. Das Hellblau von
   „Einsatzbereit" (#35c8ff) verschwindet auf Hellgrau, und ein Name in dieser
   Farbe ist nicht mehr zu lesen.

   Die Truppfarbe ist die **Fläche** der Figur, nicht ein Ring darum. Von der
   Warnweste bleibt ein schmaler Reflexstreifen über den Schultern. Umgekehrt
   – gelbe Weste groß, Truppfarbe als Ring – sah jede Figur aus wie in einem
   gelben Rahmen und war auf dem Plan lauter als alles, worum es geht.
   -------------------------------------------------------------------------*/
const TRUPPFARBEN = {
  ef:       { name: 'Einheitsführer', farbe: '#b8860b' },
  ma:       { name: 'Maschinist',     farbe: '#5e6c7d' },
  me:       { name: 'Melder',         farbe: '#7a4fd0' },
  angriff:  { name: 'Angriffstrupp',  farbe: '#d92d20' },
  wasser:   { name: 'Wassertrupp',    farbe: '#1467b3' },
  schlauch: { name: 'Schlauchtrupp',  farbe: '#1f8f52' },
};

/* --- Ränge ---------------------------------------------------------------- */
const RAENGE = [
  { xp: 0,    name: 'Fußgänger',      icon: '🚶' },
  { xp: 100,  name: 'Westenträger',   icon: '🦺' },
  { xp: 260,  name: 'Kegelsteller',   icon: '🚧' },
  { xp: 460,  name: 'Dreiecksleger',  icon: '⚠️' },
  { xp: 700,  name: 'Sicherungsmann', icon: '🔶' },
  { xp: 1000, name: 'Truppführer',    icon: '📻' },
  { xp: 1400, name: 'Absperrmeister', icon: '🎓' },
];

/* --- Abzeichen ------------------------------------------------------------ */
const ABZEICHEN = {
  schutzschild: { icon: '🛡️', name: 'Schutzschild',    text: 'Das Fahrzeug auf Anhieb als Schutz vor die Einsatzstelle gestellt' },
  abgewandt:    { icon: '🚪', name: 'Richtige Seite',  text: 'Auf der richtigen Seite abgesessen und vor dem Fahrzeug angetreten' },
  ausgeruestet: { icon: '🧰', name: 'Ausgerüstet',     text: 'Den Sicherungstrupp ohne Fehler ausgerüstet' },
  hundert:      { icon: '🏘️', name: 'Hundert Meter',   text: 'Innerorts ohne Umweg auf 100 Meter gekommen' },
  zweihundert:  { icon: '🌾', name: 'Zweihundert',     text: 'Die Landstraße mit 200 Metern und beiden Richtungen gesichert' },
  sichthindernis:{ icon: '⛰️', name: 'Weitblick',      text: 'Kurve und Kuppe erkannt – und das Warngerät davor gestellt' },
  vonInnen:     { icon: '↩️', name: 'Von innen nach außen', text: 'Die Verjüngung entgegen der Fahrtrichtung aufgebaut' },
  achthundert:  { icon: '🛣️', name: 'Achthundert',     text: 'Die Autobahn mit allen vier Marken abgesichert' },
  zweitesFahrzeug:{ icon: '🚒', name: 'Nachgefordert', text: 'Gemerkt, dass ein Fahrzeug nicht reicht' },
  vorsichtig:   { icon: '👀', name: 'Vorsichtig',      text: 'Keinen einzigen Schritt auf die freie Fahrbahn gemacht' },
  meister:      { icon: '🎖️', name: 'Absperrmeister',  text: 'Drei Sterne in jeder einzelnen Aufgabe' },
};
