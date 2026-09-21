/* ---------- Die Bühne: eine Draufsicht in SVG ------------------------------
   Gegenstück zu gemeinsam/stage.js, nur in zwei Dimensionen. Die beiden
   anderen Seiten stellen eine 3D-Welt auf; hier schaut man von oben auf eine
   Straße, und das ist kein Kompromiss, sondern die richtige Darstellung:
   Abstände liest man von oben ab, nicht aus der Froschperspektive.

   Dieselbe Datei erfüllt den kleinen Vertrag, den gemeinsam/ui.js an die
   Bühne stellt – `bildVersatz`, `anmelden`, `abmelden`, `updates`. Deshalb
   laufen Bildschirme, Ergebnisse und das Ziehen & Ablegen hier unverändert.

   Koordinaten
   -----------
   x wächst nach rechts, y nach unten (SVG-üblich). Der Nullpunkt liegt in der
   Mitte der Fahrbahn an der Einsatzstelle. Wie viele Einheiten ein Meter sind,
   entscheidet der Plan (welt/plan.js) und ist längs und quer absichtlich
   verschieden – siehe die Erklärung dort.
   -------------------------------------------------------------------------*/
const NS = 'http://www.w3.org/2000/svg';

const Stage = {
  svg: null, welt: null, updates: [], laeuft: false,

  /* Weltfenster: So viel muss mindestens zu sehen sein. Was darüber hinaus
     ins Bild passt, ist Zugabe – bei einem hohen Handybildschirm ist das
     viel Wiese über und unter der Straße. */
  mitteX: 0, mitteY: 0, breite: 1000, hoehe: 400,
  sicht: { x: -500, y: -200, w: 1000, h: 400 },

  init() {
    this.svg = $('#stage');
    this.welt = document.createElementNS(NS, 'g');
    this.svg.appendChild(this.welt);
    this._t = 0; this._letzte = 0;
    this.groesseAnpassen();
    window.addEventListener('resize', () => this.groesseAnpassen());
    window.addEventListener('orientationchange', () => setTimeout(() => this.groesseAnpassen(), 120));
    this.start();
  },

  /* --- Bildausschnitt -----------------------------------------------------
     `oben` schiebt den Inhalt nach oben, wenn unten ein Bedienfeld liegt,
     `rechts` nach links, wenn rechts eines steht. Beide dürfen negativ sein.
     Gleiche Bedeutung wie drüben in der 3D-Bühne – gemeinsam/ui.js ruft das
     von sich aus auf.                                                       */
  versatz: 0, versatzX: 0,
  /* Anteil der Fensterhöhe, der für den Plan übrig bleibt. Liegt unten ein
     hohes Bedienfeld, ist das deutlich weniger als 1 – und dann muss der Plan
     kleiner werden, nicht nur höher rutschen. Sonst schiebt man ihn genau so
     weit nach oben, wie er unten verdeckt wird, und oben fällt er heraus.

     Nach unten gedeckelt, und das ist die eigentliche Entscheidung: Wenn
     unten eine lange Auflösung mit Zitat steht, bleiben von der Fensterhöhe
     noch zwanzig Prozent — der Plan schrumpfte dann auf Briefmarkengröße.
     Lieber die untere Kante der Zeichnung hinter dem Bedienfeld verschwinden
     lassen. Wer gerade eine Auflösung liest, schaut ohnehin nicht auf die
     Straße, und die Straße selbst bleibt oben sichtbar.                    */
  frei: 1,

  /* Der Ausschnitt wird **nicht hart gesetzt, sondern nachgezogen.** Das ist
     die Antwort auf ein Flackern, das man sonst bei jedem „Weiter" sieht:

     Beim Bildschirmwechsel bleibt der alte Bildschirm 260 ms lang im Baum,
     während er ausblendet. In dieser Zeit misst sich das neue Bedienfeld
     schon, das alte misst weiter, und beide melden ihr Maß. Innerhalb eines
     einzigen Bildes kamen so drei verschiedene Werte an — einmal das halb
     aufgebaute neue Feld, einmal das alte, einmal das fertige neue. Der Plan
     sprang dabei auf mehr als das Doppelte und wieder zurück.

     Zwei Dinge halten dagegen: Das Bedienfeld meldet die alte Wache ab, sobald
     eine neue entsteht (siehe bausteine.js), und der Rest wird hier geglättet.
     Ein Zwischenwert, der nur ein Bild lang gilt, bewegt das Bild dann kaum
     noch. */
  versatzZiel: 0, freiZiel: 1,
  bildVersatz(oben, rechts, frei) {
    this.versatzZiel = oben || 0;
    this.versatzX = rechts || 0;
    if (frei != null) this.freiZiel = clamp(frei, .42, 1);
    // Wer Bewegung abbestellt hat, bekommt den Sprung – aber nur einen.
    if (RUHIG) this.ausschnittSetzen();
    this.groesseAnpassen();
  },
  ausschnittSetzen() { this.versatz = this.versatzZiel; this.frei = this.freiZiel; },
  /* Exponentiell nachziehen: nach gut einer Drittelsekunde ist der Rest nicht
     mehr zu sehen. Unabhängig von der Bildrate, weil dt in den Exponenten
     geht und nicht in einen festen Anteil. */
  ausschnittZiehen(dt) {
    const dv = this.versatzZiel - this.versatz, df = this.freiZiel - this.frei;
    if (Math.abs(dv) < 1e-4 && Math.abs(df) < 1e-4) {
      if (dv || df) { this.ausschnittSetzen(); this.groesseAnpassen(); }
      return;
    }
    const k = 1 - Math.pow(.0016, dt);
    this.versatz += dv * k;
    this.frei += df * k;
    this.groesseAnpassen();
  },

  /* Was zu sehen sein soll: Mittelpunkt und Mindestausschnitt in Welteinheiten. */
  blick(x, y, breite, hoehe) {
    this.mitteX = x; this.mitteY = y;
    this.breite = breite; this.hoehe = hoehe == null ? breite * .4 : hoehe;
    this.groesseAnpassen();
  },

  /* Weich dorthin fahren statt springen. Dieselbe Bewegung wie alles andere,
     damit ein „prefers-reduced-motion" sie an einer Stelle abschalten kann. */
  blickFahren(x, y, breite, hoehe, dauer) {
    const von = { x: this.mitteX, y: this.mitteY, b: this.breite, h: this.hoehe };
    const zielH = hoehe == null ? breite * .4 : hoehe;
    if (RUHIG) return this.blick(x, y, breite, zielH);
    return Bewegung.neu(dauer == null ? 1.1 : dauer, (p) => {
      this.blick(lerp(von.x, x, p), lerp(von.y, y, p),
                 lerp(von.b, breite, p), lerp(von.h, zielH, p));
    });
  },

  groesseAnpassen() {
    const r = this.svg.getBoundingClientRect();
    const asp = (r.width || innerWidth) / (r.height || innerHeight);
    // Erst quer einpassen, dann prüfen, ob längs noch genug übrig ist.
    let w = this.breite, h = w / asp;
    // So viel Welthöhe braucht das Fenster, damit `hoehe` in die freie
    // Fläche passt und nicht in die ganze Fensterhöhe.
    const noetig = this.hoehe / this.frei;
    if (h < noetig) { h = noetig; w = h * asp; }
    const x = this.mitteX - w / 2 + this.versatzX * w;
    const y = this.mitteY - h / 2 + this.versatz * h;
    this.sicht = { x, y, w, h };
    this.svg.setAttribute('viewBox', `${x} ${y} ${w} ${h}`);
  },

  /* Weltpunkt -> Punkt im Fenster. Geht so einfach, weil das SVG genau über
     dem Fenster liegt und sein viewBox dasselbe Seitenverhältnis hat. */
  nachBildschirm(x, y) {
    const r = this.svg.getBoundingClientRect();
    return {
      x: r.left + (x - this.sicht.x) / this.sicht.w * r.width,
      y: r.top + (y - this.sicht.y) / this.sicht.h * r.height,
    };
  },

  /* --- Inhalt ------------------------------------------------------------ */
  /* Nur die Kulisse wegräumen – Ausschnitt und Wachen bleiben stehen. Das
     braucht, wer **mitten in einer Aufgabe** die Kulisse austauscht: Aufgabe 4
     tauscht die gerade Landstraße gegen dieselbe mit Kurve. Ein volles
     `leeren()` nähme dem laufenden Bildschirm die Wache seines Bedienfelds
     mit, und der Plan spränge einmal auf die volle Fensterhöhe. */
  inhaltLeeren() {
    while (this.welt.firstChild) this.welt.removeChild(this.welt.firstChild);
  },

  leeren() {
    this.updates.length = 0;
    this.bildVersatz(0, 0, 1);
    this.ausschnittSetzen();      // Levelwechsel: hier ist ein Sprung richtig
    this.inhaltLeeren();
  },

  /* SVG aus einer Zeichenkette anhängen und die Gruppe zurückgeben. Kulissen
     schreibt man als Text (übersichtlicher), bewegen muss man Elemente. */
  hinzu(markup) {
    const g = document.createElementNS(NS, 'g');
    g.innerHTML = markup;
    this.welt.appendChild(g);
    return g;
  },

  anmelden(fn) { this.updates.push(fn); return fn; },
  abmelden(fn) { const i = this.updates.indexOf(fn); if (i >= 0) this.updates.splice(i, 1); },

  start() {
    if (this.laeuft) return;
    this.laeuft = true;
    const schleife = (jetzt) => {
      if (!this.laeuft) return;
      requestAnimationFrame(schleife);
      const dt = this._letzte ? Math.min((jetzt - this._letzte) / 1000, .05) : 0;
      this._letzte = jetzt;
      this._t += dt;
      this.ausschnittZiehen(dt);
      for (let i = this.updates.length - 1; i >= 0; i--) {
        try { this.updates[i](dt, this._t); }
        catch (e) { this.updates.splice(i, 1); console.warn(e); }
      }
    };
    requestAnimationFrame(schleife);
  },
};

/* Wer Bewegung abbestellt hat, bekommt sie nicht. Steht hier und nicht in
   jeder Animation einzeln – jede Bewegung dieser Seite hat damit denselben
   Ersatzweg: Sie springt ans Ziel, statt auszufallen. */
const RUHIG = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- Marken: Knöpfe, die an einem Punkt der Karte kleben ------------
   Das Gegenstück zu `HotSpots` aus gemeinsam/ui.js, nur für die Draufsicht.

   Warum überhaupt HTML-Knöpfe über einer SVG-Karte? Weil ein Ziel in
   Welteinheiten auf einem Handy winzig wird. Eine Marke hängt mit ihrem
   *Anker* an der Welt und hat ihre *Größe* in Bildschirmpixeln – damit ist
   sie am Beamer wie am Handy gleich gut zu treffen.

   Und dieselbe Falle wie drüben: Was an einer Weltposition klebt, darf sein
   eigenes `transform` nicht anfassen. Es wird jedes Bild neu geschrieben.
   -------------------------------------------------------------------------*/
const Marken = {
  liste: [], schicht: null, fn: null,

  starten(screen) {
    this.beenden();
    this.schicht = el('div', { style: { position: 'fixed', inset: '0', pointerEvents: 'none', zIndex: '6' } });
    screen.appendChild(this.schicht);
    this.fn = Stage.anmelden(() => {
      if (!this.liste.length || !this.schicht) return;
      // Der Bildschirm hat während seiner Einblendanimation ein transform;
      // „fixed" ist dann an ihm ausgerichtet und nicht am Fenster. Deshalb
      // den Ursprung jedes Bild neu messen.
      const u = this.schicht.getBoundingClientRect();
      for (const m of this.liste) {
        const p = Stage.nachBildschirm(m.x, m.y);
        m.node.style.transform = `translate(-50%,-50%) translate(${p.x - u.left}px,${p.y - u.top}px)`;
      }
    });
    return this.schicht;
  },

  hinzu(x, y, node) {
    node.style.position = 'fixed';
    node.style.left = '0'; node.style.top = '0';
    node.style.pointerEvents = 'auto';
    node.style.transition = 'background .16s, border-color .16s, opacity .2s, box-shadow .16s';
    this.schicht.appendChild(node);
    const m = { x, y, node };
    this.liste.push(m);
    // gleich setzen und nicht erst im nächsten Bild: sonst blitzt jede neue
    // Marke einmal in der linken oberen Ecke auf.
    const u = this.schicht.getBoundingClientRect();
    const p = Stage.nachBildschirm(x, y);
    node.style.transform = `translate(-50%,-50%) translate(${p.x - u.left}px,${p.y - u.top}px)`;
    return m;
  },

  beenden() {
    if (this.fn) { Stage.abmelden(this.fn); this.fn = null; }
    if (this.schicht) this.schicht.remove();
    this.schicht = null;
    this.liste.length = 0;
  },
};
