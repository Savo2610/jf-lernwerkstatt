/* ============================================================================
   Feuer, Glut, Rauch, Dampf – die Hauptdarsteller dieser Seite.

   Vor hellem Himmel gelten andere Regeln als vor der Einsatznacht drueben:
   Additives Blenden, das nachts jede Flamme zum Leuchten bringt, bleicht
   tagsueber nur aus – aus Orange auf Hellblau wird Weiss. Deshalb hier
   durchweg deckende Flaechen mit kraeftigen, gesaettigten Farben. Das Feuer
   setzt sich ueber die Farbe ab, nicht ueber die Helligkeit.

   Alles ist Low-Poly und dreht sich: Ein paar ineinandergesteckte Kegel, die
   gegenlaeufig taumeln und atmen, lesen sich aus jeder Entfernung als Flamme –
   auch am Beamer in der letzten Reihe.
   ========================================================================== */

/* --- Farben, die im ganzen Spiel dieselben sind --------------------------- */
const FEUERFARBEN = {
  glut:    0xd62d06,
  tief:    0xf05513,
  mitte:   0xff8a15,
  hoch:    0xffc23d,
  spitze:  0xffe89a,
  // Weissglut: Magnesium und die anderen Metalle gluehen so hell, dass man
  // nicht hineinsehen darf – das Rotorange der Holzglut waere hier schlicht
  // falsch. Leicht ins Gelbe gezogen, damit es auf hellem Beton noch leuchtet
  // und nicht wie ein Loch im Bild aussieht.
  weissglut: 0xfff6d8,
  rauch:   0x8c8378,
  dampf:   0xf2f6f7,
  wasser:  0x1e9fc0,
};

/* --- Eine Flamme ----------------------------------------------------------
   opt: { hoehe, breite, zungen, licht }
   Rueckgabe ist eine Gruppe. Ihre Staerke steuert man ueber
   `feuerStaerke(f, 0..1)` – nicht ueber `visible`, denn ein Feuer geht nicht
   schlagartig aus, es faellt in sich zusammen. Genau das soll man sehen,
   wenn eine Voraussetzung wegfaellt.
   -------------------------------------------------------------------------*/
function baueFeuer(opt) {
  const o = opt || {};
  const hoehe = o.hoehe == null ? 1.6 : o.hoehe;
  const breite = o.breite == null ? 0.62 : o.breite;
  const g = new THREE.Group();

  // Die Zungen sind ineinandergesteckte Kegel: aussen breit und rot, innen
  // schmal und fast weiss.
  //
  // Entscheidend ist, dass jeder innere Kegel HOEHER ist als der aeussere,
  // nicht kuerzer. Nachts, mit additivem Blenden, leuchtet ein kurzer Kern
  // durch die Huelle hindurch – hier nicht: deckende Flaechen verdecken alles,
  // was in ihnen steckt, und uebrig bleibt ein einfarbiger oranger Kegel.
  // Weil jede Schicht oben aus der darunterliegenden herausragt, entsteht der
  // Farbverlauf von unten rot nach oben fast weiss ganz von selbst – ohne
  // Textur, ohne Shader, ohne Transparenz.
  const schichten = [
    { f: FEUERFARBEN.tief,   h: 0.52, b: 1.00 },
    { f: FEUERFARBEN.mitte,  h: 0.72, b: 0.78 },
    { f: FEUERFARBEN.hoch,   h: 0.88, b: 0.52 },
    { f: FEUERFARBEN.spitze, h: 1.00, b: 0.28 },
  ];
  const kegel = [];
  schichten.forEach((s, i) => {
    // 6 Segmente: kantig genug, dass man die Drehung sieht
    const geo = new THREE.ConeGeometry(breite * s.b, hoehe * s.h, 6, 1);
    geo.translate(0, hoehe * s.h / 2, 0);
    // Deckend und mit Tiefenschreiben: Die Schichten sollen sich gegenseitig
    // sauber verdecken. Ausgehendes Feuer wird nicht ausgeblendet, es faellt
    // in sich zusammen – das macht die Skalierung in `feuerUpdate`.
    const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: s.f }));
    m.userData.phase = i * 1.7;
    g.add(m);
    kegel.push(m);
  });

  // aufsteigende Fetzen: kleine Tetraeder, die oben verschwinden
  const fetzen = [];
  const anzahl = o.zungen == null ? 5 : o.zungen;
  for (let i = 0; i < anzahl; i++) {
    const m = new THREE.Mesh(
      new THREE.TetrahedronGeometry(breite * rnd(.16, .26)),
      new THREE.MeshBasicMaterial({ color: FEUERFARBEN.hoch, transparent: true, opacity: .9 }));
    m.userData.t = Math.random();
    m.userData.tempo = rnd(.5, .9);
    m.userData.winkel = rnd(0, Math.PI * 2);
    m.userData.radius = breite * rnd(.15, .45);
    g.add(m);
    fetzen.push(m);
  }

  // Die Glutzone am Fuss: eine flache Scheibe, die immer da ist, solange es
  // brennt. Sie macht den Unterschied zwischen „Flamme" und „Flamme UND Glut"
  // sichtbar – und den braucht Level 2 fuer die Brandklassen.
  const glut = new THREE.Mesh(
    new THREE.CircleGeometry(breite * 1.15, 16),
    new THREE.MeshBasicMaterial({ color: FEUERFARBEN.glut, transparent: true, opacity: .85 }));
  glut.rotation.x = -Math.PI / 2;
  glut.position.y = 0.015;
  g.add(glut);

  // Der Kern der Weissglut: eine kleine, sehr helle Scheibe, die zur Kamera
  // schaut. Die flache Glutscheibe am Boden liegt aus der Spielperspektive
  // fast waagerecht und ist auf hellem Beton kaum zu sehen – der Kern steht
  // aufrecht im Hof des Scheins und macht daraus ein gluehendes Stueck Metall.
  const kern = new THREE.Sprite(new THREE.SpriteMaterial({
    map: wolkenTextur(), color: 0xffffff,
    transparent: true, opacity: 0, depthWrite: false,
  }));
  kern.position.y = breite * .42;
  kern.visible = false;
  g.add(kern);

  // Der Schein ueber der Glut. Aus bleibt er fast immer: Rotgluehendes Holz
  // leuchtet nicht in seine Umgebung, ein Metallbrand schon – und der ist der
  // einzige Fall, in dem man die Glut auch dann sieht, wenn gar keine Flamme
  // da ist. Wird mit `feuerGlutFarbe(f, farbe, staerke)` eingeschaltet.
  const schein = new THREE.Sprite(new THREE.SpriteMaterial({
    map: wolkenTextur(), color: FEUERFARBEN.weissglut,
    transparent: true, opacity: 0, depthWrite: false,
  }));
  schein.position.y = breite * .5;
  schein.scale.setScalar(breite * 3.4);
  schein.visible = false;
  g.add(schein);

  // Licht: nur wenn ausdruecklich gewuenscht. Bei Tageslicht faellt es kaum
  // auf und kostet Schattenrechnung – lieber sparsam.
  let licht = null;
  if (o.licht) {
    licht = new THREE.PointLight(0xff7a20, 3.2, hoehe * 6, 2);
    licht.position.y = hoehe * .55;
    g.add(licht);
  }

  g.userData.feuer = {
    kegel, fetzen, glut, schein, kern, licht, hoehe, breite,
    scheinStaerke: 0,
    staerke: 1, ziel: 1,
    // Wie stark die Glut gegenueber der Flamme ist. 1 = Glutbrand (Metall,
    // Holzkohle), 0 = reiner Flammenbrand (Gas, Fluessigkeit).
    glutAnteil: o.glutAnteil == null ? .5 : o.glutAnteil,
    flammenAnteil: o.flammenAnteil == null ? 1 : o.flammenAnteil,
  };
  feuerAnteileSetzen(g);
  return g;
}

/* Feuer hoch- oder runterfahren. Nicht sofort – `feuerUpdate` faehrt die
   Staerke weich nach, damit ein erloeschendes Feuer in sich zusammensinkt. */
function feuerStaerke(f, wert, sofort) {
  const d = f.userData.feuer;
  d.ziel = clamp(wert, 0, 1);
  if (sofort) d.staerke = d.ziel;
}

/* Verhaeltnis Flamme zu Glut setzen – siehe ERSCHEINUNGEN in brandlehre.js */
function feuerAnteileSetzen(f, flamme, glut) {
  const d = f.userData.feuer;
  if (flamme != null) d.flammenAnteil = clamp(flamme, 0, 1);
  if (glut != null) d.glutAnteil = clamp(glut, 0, 1);
  d.kegel.forEach(k => k.visible = d.flammenAnteil > .02);
  d.glut.visible = d.glutAnteil > .02;
}

/* Farbe der Glut umstellen – und mit ihr den Schein darueber.

   `farbe` leer setzt beides zurueck auf die gewoehnliche Rotglut, `staerke`
   (0..1) schaltet den Schein ein. Gebraucht wird das fuer die Brandklasse D:
   Magnesium brennt fast ohne Flamme und gluht dabei blendend hell. Ohne diesen
   Unterschied sieht ein Metallbrand aus wie ein mattes Lagerfeuer – dabei ist
   genau das grelle Weiss sein Erkennungszeichen.

   Der Schein ist absichtlich NICHT weiss, sondern warmgelb: Vor dem hellen
   Himmel und auf hellem Beton verschwindet weiss auf weiss. Ein weisser Kern
   in einem gelben Hof liest sich als „gluehend heiss" – die gleiche Luege, mit
   der Zeichner seit jeher Helligkeit malen, die es auf Papier nicht gibt. */
function feuerGlutFarbe(f, farbe, staerke, scheinFarbe) {
  const d = f.userData && f.userData.feuer;
  if (!d) return;
  d.glut.material.color.setHex(farbe == null ? FEUERFARBEN.glut : farbe);
  d.schein.material.color.setHex(scheinFarbe == null ? FEUERFARBEN.hoch : scheinFarbe);
  d.scheinStaerke = staerke == null ? 0 : clamp(staerke, 0, 1);
  d.schein.visible = d.scheinStaerke > .02;
  d.kern.visible = d.schein.visible;
  d.kern.material.color.setHex(farbe == null ? FEUERFARBEN.glut : farbe);
}

function feuerUpdate(f, dt, t) {
  const d = f.userData && f.userData.feuer;
  if (!d) return;
  // weich nachfahren: aufflammen geht schnell, ersticken dauert
  const tempo = d.ziel > d.staerke ? 3.2 : 1.5;
  d.staerke += (d.ziel - d.staerke) * Math.min(1, dt * tempo);
  const s = d.staerke;

  if (s < .01) { f.visible = false; return; }
  f.visible = true;

  d.kegel.forEach((k, i) => {
    // zwei ueberlagerte Wellen: die Flamme atmet unregelmaessig, nicht im Takt
    const p = k.userData.phase;
    const atem = 1 + Math.sin(t * 7.3 + p) * .13 + Math.sin(t * 12.7 + p * 2.1) * .07;
    const seit = 1 + Math.sin(t * 5.1 + p) * .09;
    k.scale.set(seit * s, atem * s * d.flammenAnteil, seit * s);
    // gegenlaeufiges Taumeln – dadurch wirkt die Flamme lebendig statt gedreht
    k.rotation.y = t * (i % 2 ? .9 : -1.25) + p;
    k.rotation.z = Math.sin(t * 3.4 + p) * .1;
  });

  d.fetzen.forEach(m => {
    const u = m.userData;
    u.t += dt * u.tempo * (.4 + s * .8);
    if (u.t > 1) { u.t -= 1; u.winkel = rnd(0, Math.PI * 2); u.radius = d.breite * rnd(.15, .45); }
    const p = u.t;
    // je hoeher, desto weiter aussen und desto durchsichtiger
    const r = u.radius * (1 + p * 1.4);
    m.position.set(Math.cos(u.winkel) * r, d.hoehe * s * (.55 + p * .85), Math.sin(u.winkel) * r);
    m.rotation.set(t * 2.1 + p * 6, t * 1.7, t * 2.6);
    m.scale.setScalar(clamp((1 - p) * s * d.flammenAnteil, .001, 2));
    m.material.opacity = clamp((1 - p) * .85, 0, 1);
  });

  if (d.glut.visible) {
    const puls = .72 + Math.sin(t * 3.1) * .1 + Math.sin(t * 5.9) * .06;
    d.glut.material.opacity = clamp(puls * s * d.glutAnteil, 0, 1);
    d.glut.scale.setScalar(clamp(.85 + s * .2, .1, 2));
  }

  if (d.schein.visible) {
    // schneller flackern als die Glut darunter: Ein Metallbrand zuckt, er
    // atmet nicht.
    const zucken = .8 + Math.sin(t * 9.7) * .12 + Math.sin(t * 17.3) * .08;
    d.schein.material.opacity = clamp(zucken * s * d.scheinStaerke, 0, 1);
    d.schein.scale.setScalar(d.breite * (3.6 + Math.sin(t * 6.1) * .3) * clamp(s, .2, 1));
    d.kern.material.opacity = clamp(zucken * s * d.scheinStaerke, 0, 1);
    d.kern.scale.setScalar(d.breite * (1.5 + Math.sin(t * 9.7) * .12) * clamp(s, .2, 1));
  }

  if (d.licht) {
    d.licht.intensity = (2.4 + Math.sin(t * 11) * .5 + Math.sin(t * 6.3) * .4) * s;
  }
}

/* --- Rauch, Dampf, Pulverwolke --------------------------------------------
   Ein Wolkenwerfer. Dieselbe Mechanik fuer drei Dinge, die sich nur in Farbe,
   Tempo und Wachstum unterscheiden – Rauch steigt langsam und wird grau,
   Wasserdampf schiesst hoch und wird weiss, Pulver bleibt tief und breit.
   -------------------------------------------------------------------------*/
const WOLKENART = {
  rauch: { farbe: FEUERFARBEN.rauch, hoch: 2.2, breit: 3.0, dauer: 3.0, deckung: .44, start: .6 },
  dampf: { farbe: FEUERFARBEN.dampf, hoch: 3.2, breit: 3.4, dauer: 1.5, deckung: .72, start: .35 },
  pulver:{ farbe: 0xd8d2c4,          hoch: 0.5, breit: 3.8, dauer: 2.2, deckung: .80, start: .30 },
};

let _wolkeTextur = null;
function wolkenTextur() {
  // weicher Fleck, einmal gebaut und von allen Wolken geteilt
  if (!_wolkeTextur) _wolkeTextur = fleckTextur('rgba(255,255,255,1)', .38);
  return _wolkeTextur;
}

function baueWolken(art, anzahl) {
  const a = WOLKENART[art] || WOLKENART.rauch;
  const g = new THREE.Group();
  const teile = [];
  const n = anzahl || 14;
  for (let i = 0; i < n; i++) {
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({
      map: wolkenTextur(), color: a.farbe, transparent: true,
      opacity: 0, depthWrite: false,
    }));
    sp.userData.t = i / n;          // gleichmaessig verteilt starten
    sp.userData.seite = rnd(-1, 1);
    sp.userData.dreh = rnd(-1, 1);
    g.add(sp);
    teile.push(sp);
  }
  g.userData.wolken = { art: a, teile, staerke: 0, ziel: 0 };
  return g;
}

function wolkenStaerke(w, wert, sofort) {
  const d = w.userData.wolken;
  d.ziel = clamp(wert, 0, 1);
  if (sofort) d.staerke = d.ziel;
}

function wolkenUpdate(w, dt) {
  const d = w.userData && w.userData.wolken;
  if (!d) return;
  d.staerke += (d.ziel - d.staerke) * Math.min(1, dt * 2.2);
  const a = d.art;
  w.visible = d.staerke > .01;
  if (!w.visible) return;
  d.teile.forEach(sp => {
    const u = sp.userData;
    u.t += dt / a.dauer;
    if (u.t > 1) { u.t -= 1; u.seite = rnd(-1, 1); u.dreh = rnd(-1, 1); }
    const p = u.t;
    sp.position.set(u.seite * a.breit * p * .5, a.hoch * p, u.dreh * a.breit * p * .5);
    const gr = a.start + p * (a.breit - a.start);
    sp.scale.set(gr, gr, 1);
    // vorne einblenden, hinten ausblenden – nie hart erscheinen lassen
    const huelle = Math.min(1, p * 5) * (1 - p);
    sp.material.opacity = huelle * a.deckung * d.staerke;
  });
}

/* --- Funken ---------------------------------------------------------------
   Kurzer Schauer, der einmal laeuft und dann verschwindet. Fuer den Moment,
   in dem eine Zuendquelle zuendet – oder wenn etwas schiefgeht.
   -------------------------------------------------------------------------*/
function funkenSchauer(welt, pos, opt) {
  const o = opt || {};
  const n = o.anzahl || 22;
  const g = new THREE.Group();
  g.position.copy(pos);
  welt.add(g);
  const teile = [];
  const geo = new THREE.SphereGeometry(o.groesse || .035, 5, 4);
  for (let i = 0; i < n; i++) {
    const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({
      color: i % 3 === 0 ? FEUERFARBEN.spitze : FEUERFARBEN.mitte, transparent: true }));
    const winkel = rnd(0, Math.PI * 2), steil = rnd(.35, 1.25);
    m.userData.v = new THREE.Vector3(
      Math.cos(winkel) * Math.cos(steil), Math.sin(steil), Math.sin(winkel) * Math.cos(steil))
      .multiplyScalar(rnd(1.6, 4.2) * (o.wucht || 1));
    g.add(m); teile.push(m);
  }
  const dauer = o.dauer || 1.1;
  Bewegung.neu(dauer, (p) => {
    teile.forEach(m => {
      const v = m.userData.v;
      // Schwerkraft: die Funken beschreiben eine Wurfparabel, sonst sieht es
      // aus wie ein Igel
      m.position.set(v.x * p, v.y * p - 9.2 * p * p * .5, v.z * p);
      m.material.opacity = 1 - p * p;
      m.scale.setScalar(1 - p * .5);
    });
  }, () => {
    g.traverse(x => { if (x.material) x.material.dispose(); });
    welt.remove(g);
  }, false);
  return g;
}

/* --- Wasserstrahl ---------------------------------------------------------
   Eine Kette von Tropfen auf einer Wurfparabel. Bewusst als einzelne Kugeln
   und nicht als Roehre: Man soll sehen, dass Wasser aus Tropfen besteht –
   und beim Sprühstrahl, dass es sehr viel mehr und sehr viel kleinere sind.
   `fein` schaltet zwischen Vollstrahl und Spruehstrahl um.
   opt: { fein, farbe, weite, hoch }
   -------------------------------------------------------------------------*/
function baueStrahl(opt) {
  const o = opt || {};
  const fein = !!o.fein;
  const n = fein ? 90 : 34;
  const g = new THREE.Group();
  const geo = new THREE.SphereGeometry(fein ? .035 : .075, 6, 5);
  // Eigene Farbe je Strahl: Schaum ist weiss, Wasser blau. Das Material
  // gehoert deshalb diesem einen Strahl und kommt nicht aus `Mat` – dort
  // teilen es sich alle, und der naechste Strahl faerbte den vorigen um.
  const mat = new THREE.MeshStandardMaterial({
    color: o.farbe == null ? FEUERFARBEN.wasser : o.farbe, roughness: .18, metalness: .0,
    transparent: true, opacity: fein ? .55 : .82,
  });
  const teile = [];
  for (let i = 0; i < n; i++) {
    const m = new THREE.Mesh(geo, mat);
    m.userData.t = i / n;
    m.userData.streu = fein
      ? [rnd(-1, 1), rnd(-1, 1)]      // Spruehstrahl faechert auf
      : [rnd(-.12, .12), rnd(-.12, .12)];
    g.add(m); teile.push(m);
  }
  g.userData.strahl = { teile, fein, an: 0, ziel: 0, weite: o.weite || 6, hoch: o.hoch || 1.6 };
  return g;
}

function strahlAn(s, wert) { s.userData.strahl.ziel = clamp(wert, 0, 1); }

function strahlUpdate(s, dt) {
  const d = s.userData && s.userData.strahl;
  if (!d) return;
  d.an += (d.ziel - d.an) * Math.min(1, dt * 4);
  s.visible = d.an > .02;
  if (!s.visible) return;
  d.teile.forEach(m => {
    const u = m.userData;
    u.t += dt * (d.fein ? .9 : 1.5);
    if (u.t > 1) u.t -= 1;
    const p = u.t;
    // Wurfparabel nach vorn (z) mit Fall nach unten
    const streuung = d.fein ? p * p * 1.5 : p * .25;
    m.position.set(
      u.streu[0] * streuung,
      d.hoch + p * 1.1 - 2.6 * p * p,
      p * d.weite + u.streu[1] * streuung * .4);
    m.scale.setScalar(d.an * (d.fein ? 1 + p * .8 : 1));
  });
}
