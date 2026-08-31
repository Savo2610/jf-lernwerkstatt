/* ---------- Spielstand ----------------------------------------------------
   Solo-Modus speichert Fortschritt lokal im Browser. Beamer-Modus haelt nur
   die Teampunkte des aktuellen Abends.

   Gemeinsame Grundlage beider Seiten. Was sich von Spiel zu Spiel
   unterscheidet, steht in SPIEL (spiel.js) – vor allem der Speicherschluessel:
   Startseite und Spiele liegen auf einer Domain und teilen sich damit den
   Browserspeicher. Zwei Spiele mit demselben Schluessel wuerden sich
   gegenseitig den Fortschritt ueberschreiben.
   -------------------------------------------------------------------------*/
const SAVE_KEY = SPIEL.speicher;

const State = {
  modus: null,              // 'solo' | 'beamer'
  name: '',
  helmfarbe: '#ffd23f',
  xp: 0,
  levelStatus: {},          // { levelId: { best: 0..1, gespielt: n } }
  abzeichen: {},            // { key: tagNummer } – siehe abzeichenGeben
  ton: true,
  sprache: true,            // Sprachausgabe der Kommandos

  laden() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return false;
      const d = JSON.parse(raw);
      Object.assign(this, {
        name: d.name || '', helmfarbe: d.helmfarbe || '#ffd23f',
        xp: d.xp || 0, levelStatus: d.levelStatus || {},
        abzeichen: d.abzeichen || {},
        ton: d.ton !== false, sprache: d.sprache !== false,
      });
      return true;
    } catch (e) { return false; }
  },

  sichern() {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify({
        name: this.name, helmfarbe: this.helmfarbe, xp: this.xp,
        levelStatus: this.levelStatus, abzeichen: this.abzeichen,
        ton: this.ton, sprache: this.sprache,
      }));
    } catch (e) { /* privater Modus o.ae. – dann eben ohne Speichern */ }
  },

  zuruecksetzen() {
    this.xp = 0; this.levelStatus = {}; this.abzeichen = {};
    this.sichern();
  },

  /* --- Fortschritt ------------------------------------------------------- */
  rang() {
    let r = RAENGE[0];
    for (const x of RAENGE) if (this.xp >= x.xp) r = x;
    return r;
  },
  naechsterRang() {
    for (const x of RAENGE) if (this.xp < x.xp) return x;
    return null;
  },
  rangFortschritt() {
    const jetzt = this.rang(), next = this.naechsterRang();
    if (!next) return 1;
    return clamp((this.xp - jetzt.xp) / (next.xp - jetzt.xp), 0, 1);
  },

  xpGeben(n) {
    if (this.modus !== 'solo') return { aufstieg: null };
    const vorher = this.rang();
    this.xp += n;
    const nachher = this.rang();
    this.sichern();
    return { aufstieg: vorher.name !== nachher.name ? nachher : null };
  },

  levelFertig(id, guete) {
    const s = this.levelStatus[id] || { best: 0, gespielt: 0 };
    s.best = Math.max(s.best, guete);
    s.gespielt++;
    this.levelStatus[id] = s;
    this.sichern();
  },

  levelBest(id) { return (this.levelStatus[id] || {}).best || 0; },
  levelGespielt(id) { return (this.levelStatus[id] || {}).gespielt || 0; },

  /* --- XP gibt es je Aufgabe nur einmal ----------------------------------
     Gutgeschrieben wird immer nur die Differenz nach oben: Wer beim zweiten
     Anlauf besser wird, bekommt den Nachschlag. Wer seine Bestleistung nur
     wiederholt, bekommt eine kleine Anerkennung statt der vollen Punktzahl.
     Sonst koennte man Aufgabe 1 endlos wiederholen und waere Brandmeister. */
  xpVerbucht(id) { return (this.levelStatus[id] || {}).xp || 0; },

  xpFuerLevel(id, xp) {
    const voll = Math.max(0, Math.round(xp || 0));
    if (this.modus !== 'solo') return { gegeben: 0, voll, offen: 0, wiederholung: false, aufstieg: null };
    const schon = this.xpVerbucht(id);
    const offen = Math.max(0, voll - schon);
    const gegeben = offen > 0 ? offen : clamp(Math.round(voll * .1), 1, 8);
    const s = this.levelStatus[id] || { best: 0, gespielt: 0, xp: 0 };
    s.xp = Math.max(schon, voll);
    this.levelStatus[id] = s;
    const r = this.xpGeben(gegeben);
    return { gegeben, voll, offen, wiederholung: offen <= 0, aufstieg: r.aufstieg };
  },

  /* Sterne: 3 ab 95 %, 2 ab 70 %, 1 ab 40 % – gleiche Schwellen wie im
     Ergebnisbildschirm. Der Boss-Level wird darueber freigeschaltet.      */
  sterne(id) { const b = this.levelBest(id); return b >= .95 ? 3 : b >= .7 ? 2 : b >= .4 ? 1 : 0; },
  sterneGesamt() {
    return LEVELS.filter(l => !l.boss).reduce((a, l) => a + this.sterne(l.id), 0);
  },
  /* Sterne ueber alle Aufgaben – inklusive Boss. Danach richtet sich das
     Meisterabzeichen und die Anzeige im Levelmenue. */
  sterneAlle() { return LEVELS.reduce((a, l) => a + this.sterne(l.id), 0); },
  sterneMoeglich() { return LEVELS.length * 3; },
  alleDreiSterne() { return LEVELS.length > 0 && LEVELS.every(l => this.sterne(l.id) === 3); },

  /* Gespeichert wird der Tag, an dem das Abzeichen fiel – er steht in der
     Abzeichentafel und macht sichtbar, ob sich das Spiel ueber Wochen gezogen
     hat oder an einem Abend durchgepeitscht wurde. Alte Spielstaende haben
     hier `true` stehen; das bleibt gueltig und heisst „Tag unbekannt".     */
  abzeichenGeben(key) {
    if (this.modus !== 'solo' || this.abzeichen[key]) return false;
    this.abzeichen[key] = NACHWEIS.tagVon();
    this.sichern();
    return true;
  },
  abzeichenAnzahl() { return Object.keys(this.abzeichen).length; },
  abzeichenTag(key) {
    const v = this.abzeichen[key];
    return typeof v === 'number' ? v : null;
  },

  /* --- Der Name gehoert ab dem ersten Abzeichen dazu ----------------------
     Sonst koennte ein fertiges Kind der ganzen Gruppe Nachweise ausstellen:
     Name auf „Tom" aendern, Code abschreiben, Name zurueckstellen. Ab dem
     ersten Abzeichen geht das nur noch ueber „Fortschritt zuruecksetzen" –
     und dann ist der Fortschritt eben auch weg.                            */
  nameGesperrt() { return this.abzeichenAnzahl() > 0; },
};

/* ---------- Beamer-Modus: Teams ------------------------------------------ */
const Teams = {
  liste: [],   // [{ name, punkte, farbe }]
  aktiv: 0,

  anlegen(namen) {
    const farben = ['#ff4d3d', '#35c8ff', '#3ddc84', '#ffd23f'];
    this.liste = namen.map((n, i) => ({ name: n, punkte: 0, farbe: farben[i % farben.length] }));
    this.aktiv = 0;
  },
  punkten(idx, n) { if (this.liste[idx]) this.liste[idx].punkte += n; },
  rangliste() { return this.liste.map((t, i) => ({ ...t, idx: i })).sort((a, b) => b.punkte - a.punkte); },
  zuruecksetzen() { this.liste.forEach(t => t.punkte = 0); },
};
