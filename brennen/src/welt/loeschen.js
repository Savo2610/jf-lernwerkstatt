/* ============================================================================
   Was zum Loeschen gebraucht wird.

   `platz.js` ist der Uebungsplatz, `labor.js` das Versuchsgeraet – hier steht,
   womit geloescht wird und was dabei entsteht: die Wanne mit brennender
   Fluessigkeit, die Schaumdecke, der Feuerloescher, die Gasfackel.

   Der Wasserstrahl selbst steht nicht hier, sondern bei der Flamme in
   `feuer.js`: Er ist dort schon gebaut, und ein Strahl gehoert zum selben
   Bewegungsbild wie das Feuer, das er trifft.
   ========================================================================== */

const LOESCHEN = {
  wanne:   0x4a4f57,
  benzin:  0x2f3a44,
  schaum:  0xf4f6f2,
  schaum2: 0xdfe6e2,
  loescher:0xc8241a,
  stahl:   0x9aa2ac,
};

/* --- Wanne mit brennbarer Fluessigkeit -------------------------------------
   Flach und breit, damit der Spiegel gross im Bild liegt: Auf ihm spielt
   sich alles ab, was mit Fluessigkeitsbraenden zu tun hat – die Daempfe, die
   Schaumdecke, der Spruehstrahl.

   `userData.wanne.spiegel` ist die Fluessigkeitsflaeche, `oberkante` ihre
   Hoehe. Von dort steigt die Flamme auf – nicht vom Wannenboden: Es brennt
   ja nicht die Fluessigkeit, sondern der Dampf darueber.
   -------------------------------------------------------------------------*/
function baueWanne(opt) {
  const o = opt || {};
  const b = o.breite || 2.2;
  const t = o.tiefe || 1.5;
  const h = o.hoehe || .34;
  const g = new THREE.Group();

  const kasten = new THREE.Mesh(new THREE.BoxGeometry(b, h, t), Mat.glanz(LOESCHEN.wanne, .45, .6));
  kasten.position.y = h / 2;
  kasten.castShadow = true; kasten.receiveShadow = true;
  g.add(kasten);

  // Rand: erst dadurch liest man „Wanne" und nicht „Kiste"
  const rand = new THREE.Mesh(new THREE.BoxGeometry(b + .1, .06, t + .1), Mat.glanz(LOESCHEN.stahl, .38, .7));
  rand.position.y = h;
  rand.castShadow = true;
  g.add(rand);

  const spiegel = new THREE.Mesh(new THREE.PlaneGeometry(b - .12, t - .12),
    Mat.glanz(o.farbe == null ? LOESCHEN.benzin : o.farbe, .12, .35));
  spiegel.rotation.x = -Math.PI / 2;
  spiegel.position.y = h - .04;
  g.add(spiegel);

  g.userData.wanne = { spiegel, oberkante: h - .02, breite: b, tiefe: t };
  return g;
}

/* --- Schaumdecke -----------------------------------------------------------
   Ein Haufen flachgedrueckter Kugeln, der von der Mitte nach aussen waechst.
   Genau darum geht es beim Trennen: Es ist keine Wolke, die irgendwo
   hinzieht, sondern eine Decke, die sich zwischen Stoff und Luft schiebt und
   liegen bleibt.

   Jede Kugel merkt sich, wie weit aussen sie sitzt (`userData.r`, 0 bis 1).
   Beim Fuellen waechst nur, was innerhalb der Front liegt – so laeuft ein
   sichtbarer Rand nach aussen, statt dass die ganze Decke gleichmaessig
   aufgeht.

   `schaumFuellen(g, 0..1)` setzt das Ziel, `schaumUpdate(g, dt)` fuehrt nach.
   -------------------------------------------------------------------------*/
function baueSchaumdecke(opt) {
  const o = opt || {};
  const radius = o.radius || 1.2;
  const g = new THREE.Group();
  const kugeln = [];
  const geo = new THREE.SphereGeometry(.26, 8, 6);

  // Ringweise setzen statt zufaellig: Zufall laesst Loecher stehen, und eine
  // Schaumdecke mit Loechern ist keine.
  for (let ring = 0; ring <= 4; ring++) {
    const rr = ring / 4;
    const n = ring === 0 ? 1 : Math.round(5 + ring * 4);
    for (let i = 0; i < n; i++) {
      const w = (i / n) * Math.PI * 2 + ring * .4;
      const m = new THREE.Mesh(geo, Mat.matt(ring % 2 ? LOESCHEN.schaum2 : LOESCHEN.schaum, .82));
      m.position.set(Math.cos(w) * rr * radius, 0, Math.sin(w) * rr * radius * (o.tiefeAnteil || 1));
      m.scale.set(1, .42, 1);       // flachgedrueckt: eine Decke, kein Berg
      m.userData.r = rr;
      m.castShadow = true;
      g.add(m);
      kugeln.push(m);
    }
  }
  g.userData.schaum = { kugeln, wert: 0, ziel: 0 };
  g.visible = false;
  return g;
}

function schaumFuellen(s, wert, sofort) {
  const d = s.userData.schaum;
  d.ziel = clamp(wert, 0, 1);
  if (sofort) d.wert = d.ziel;
}

function schaumUpdate(s, dt) {
  const d = s.userData && s.userData.schaum;
  if (!d) return;
  d.wert += (d.ziel - d.wert) * Math.min(1, dt * 2.4);
  s.visible = d.wert > .01;
  if (!s.visible) return;
  d.kugeln.forEach(m => {
    // Die Front ist .18 breit – schmaler wirkt es wie ein Schalter, breiter
    // sieht man das Wachsen nicht mehr.
    const auf = clamp((d.wert * 1.18 - m.userData.r) / .18, 0, 1);
    m.scale.set(auf, auf * .42, auf);
    m.visible = auf > .02;
  });
}

/* --- Tragbarer Feuerloescher ----------------------------------------------
   Steht als Kulisse herum und wird in Level 6 zur Wahl gestellt. Bewusst
   knapp: Rot, Flasche, Schlauch, Schild. Wer hier Manometer und Sicherungs-
   splint modelliert, macht ein Bild, in dem man den Loescher nicht mehr von
   der Gasflasche unterscheidet.
   -------------------------------------------------------------------------*/
function baueLoescher(opt) {
  const o = opt || {};
  const g = new THREE.Group();
  const hoehe = o.hoehe || .62;
  const farbe = new THREE.Color(o.farbe || LOESCHEN.loescher).getHex();

  const koerper = new THREE.Mesh(new THREE.CylinderGeometry(.16, .16, hoehe, 14), Mat.glanz(farbe, .38, .35));
  koerper.position.y = hoehe / 2 + .02;
  koerper.castShadow = true;
  g.add(koerper);

  const boden = new THREE.Mesh(new THREE.CylinderGeometry(.17, .17, .04, 14), Mat.matt(0x2a2622, .8));
  boden.position.y = .02;
  g.add(boden);

  const kuppel = new THREE.Mesh(new THREE.SphereGeometry(.16, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), Mat.glanz(farbe, .38, .35));
  kuppel.position.y = hoehe + .02;
  g.add(kuppel);

  const ventil = new THREE.Mesh(new THREE.CylinderGeometry(.05, .05, .12, 8), Mat.glanz(LOESCHEN.stahl, .3, .8));
  ventil.position.y = hoehe + .2;
  g.add(ventil);

  const griff = new THREE.Mesh(new THREE.BoxGeometry(.22, .04, .06), Mat.glanz(LOESCHEN.stahl, .3, .8));
  griff.position.set(.04, hoehe + .28, 0);
  g.add(griff);

  // Der Schlauch als Bogen an der Seite – zwei Torusstuecke reichen dafuer
  const schlauch = new THREE.Mesh(new THREE.TorusGeometry(.18, .022, 5, 12, Math.PI * 1.1), Mat.matt(0x24211e, .85));
  schlauch.rotation.y = Math.PI / 2;
  schlauch.position.set(-.16, hoehe * .6, 0);
  g.add(schlauch);

  if (o.schild) {
    const s = textSchild(o.schild, { gross: 64, bg: 'rgba(255,253,249,.96)', farbe: '#2a2018', skala: .58 });
    s.position.set(0, hoehe * .58, .17);
    g.add(s);
  }
  g.userData.loescher = { duese: new THREE.Vector3(-.34, hoehe * .6, 0) };
  return g;
}

/* --- Gasfackel -------------------------------------------------------------
   Eine Propanflasche mit offenem Ventil. Die Flamme steht nicht auf der
   Flasche, sondern schraeg ueber dem Ventil – sie schiesst heraus, sie
   brennt nicht gemuetlich obenauf. Genau daran erkennt man einen Gasbrand.
   -------------------------------------------------------------------------*/
function baueGasfackel(opt) {
  const o = opt || {};
  const g = new THREE.Group();
  const flasche = baueBrandgut('gasflasche');
  g.add(flasche);

  // Das Handrad, das man in Level 6 zudreht. Reifen und Speiche stecken in
  // einer eigenen Gruppe: Sie muessen sich zusammen drehen, und die Gruppe
  // liegt schon flach – dann ist das Drehen eine einzige Achse und nicht eine
  // Rechnerei mit zwei uebereinandergelegten Eulerwinkeln.
  const rad = new THREE.Group();
  rad.rotation.x = Math.PI / 2;
  rad.position.y = 1.12;
  const reifen = new THREE.Mesh(new THREE.TorusGeometry(.09, .022, 6, 14), Mat.glanz(0xc8241a, .4, .5));
  rad.add(reifen);
  const speiche = new THREE.Mesh(new THREE.BoxGeometry(.16, .02, .02), Mat.glanz(0xc8241a, .4, .5));
  rad.add(speiche);
  g.add(rad);

  g.userData.fackel = {
    rad, austritt: new THREE.Vector3(0, 1.05, 0),
    zu: false,
  };
  if (o.mitFlamme !== false) {
    const flamme = baueFeuer({ hoehe: 1.6, breite: .3, zungen: 5, glutAnteil: 0, licht: true });
    flamme.position.set(0, 1.1, 0);
    g.add(flamme);
    g.userData.fackel.flamme = flamme;
  }
  return g;
}

/* Das Ventil zudrehen: Das Rad dreht sich, die Fackel faellt zusammen. */
function fackelAbsperren(f, danach) {
  const d = f.userData.fackel;
  if (d.zu) return;
  d.zu = true;
  Bewegung.neu(.9, (p) => { d.rad.rotation.z = p * Math.PI * 2.5; }, () => {
    if (d.flamme) feuerStaerke(d.flamme, 0);
    if (danach) setTimeout(danach, 500);
  });
}
