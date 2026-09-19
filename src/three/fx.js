/* ---------- Effekte und Einsatzgeraet -------------------------------------- */

/* ===== Feuer =============================================================== */
function baueFeuer(opt) {
  const o = opt || {};
  const anzahl = o.anzahl || 46;
  const breite = o.breite || 1.1;
  const hoehe = o.hoehe || 2.4;
  const g = new THREE.Group();
  const texF = fleckTextur('rgba(255,190,80,1)', .18);
  const texR = fleckTextur('rgba(150,150,160,.85)', .1);

  const flammen = [], rauch = [];
  for (let i = 0; i < anzahl; i++) {
    const m = new THREE.SpriteMaterial({ map: texF, transparent: true, depthWrite: false,
      blending: THREE.AdditiveBlending, color: new THREE.Color().setHSL(rnd(.02, .11), 1, rnd(.5, .68)) });
    const s = new THREE.Sprite(m);
    s.userData = { t: Math.random(), v: rnd(.55, 1.25), x: rnd(-breite, breite) * .5, z: rnd(-breite, breite) * .5, gr: rnd(.5, 1.15) };
    g.add(s); flammen.push(s);
  }
  for (let i = 0; i < Math.round(anzahl * .55); i++) {
    const m = new THREE.SpriteMaterial({ map: texR, transparent: true, depthWrite: false, opacity: .3, color: 0x6b7080 });
    const s = new THREE.Sprite(m);
    s.userData = { t: Math.random(), v: rnd(.3, .6), x: rnd(-breite, breite) * .6, z: rnd(-breite, breite) * .6, gr: rnd(1.1, 2.4) };
    g.add(s); rauch.push(s);
  }

  const licht = new THREE.PointLight(0xff7a24, 9, 16, 2);
  licht.position.y = 1;
  g.add(licht);

  g.userData = {
    flammen, rauch, licht, breite, hoehe,
    staerke: 1,             // 1 = volles Feuer, 0 = aus
    update(dt, t) {
      const st = this.staerke;
      this.flammen.forEach(s => {
        const u = s.userData;
        u.t += dt * u.v * (.5 + st * .7);
        if (u.t > 1) { u.t -= 1; u.x = rnd(-breite, breite) * .5; u.z = rnd(-breite, breite) * .5; }
        const p = u.t;
        s.position.set(u.x * (1 - p * .5), p * hoehe * (.35 + st * .75), u.z * (1 - p * .5));
        const gr = u.gr * (1 - p * .55) * (.35 + st * .8);
        s.scale.set(gr, gr * 1.35, 1);
        s.material.opacity = (1 - p) * (.25 + st * .75) * st;
        s.visible = st > .02;
      });
      this.rauch.forEach(s => {
        const u = s.userData;
        u.t += dt * u.v * .5;
        if (u.t > 1) { u.t -= 1; u.x = rnd(-breite, breite) * .6; u.z = rnd(-breite, breite) * .6; }
        const p = u.t;
        s.position.set(u.x + p * .5, hoehe * .5 + p * hoehe * 1.6, u.z);
        const gr = u.gr * (.6 + p * 2.2);
        s.scale.set(gr, gr, 1);
        s.material.opacity = (1 - p) * .28 * Math.max(st, .18);
      });
      this.licht.intensity = (7 + Math.sin(t * 14) * 2 + Math.sin(t * 23.3) * 1.4) * st;
      this.licht.color.setHSL(.055 + Math.sin(t * 9) * .012, 1, .5);
    },
  };
  return g;
}

/* ===== Wasserstrahl ======================================================== */
function baueWasserstrahl() {
  const g = new THREE.Group();
  const tex = fleckTextur('rgba(190,235,255,1)', .3);
  const tropfen = [];
  for (let i = 0; i < 90; i++) {
    const m = new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, opacity: .55, color: 0xbfeaff });
    const s = new THREE.Sprite(m);
    s.userData = { t: i / 90, seit: rnd(-.06, .06), hoch: rnd(-.05, .05) };
    g.add(s); tropfen.push(s);
  }
  g.visible = false;
  g.userData = {
    tropfen, von: new THREE.Vector3(), nach: new THREE.Vector3(), an: false,
    setzen(von, nach) { this.von.copy(von); this.nach.copy(nach); },
    update(dt, t) {
      if (!this.an) return;
      const d = new THREE.Vector3().subVectors(this.nach, this.von);
      const laenge = d.length();
      this.tropfen.forEach(s => {
        const u = s.userData;
        u.t += dt * 1.5;
        if (u.t > 1) u.t -= 1;
        const p = u.t;
        // leichter Bogen nach oben
        const bogen = Math.sin(p * Math.PI) * laenge * .085;
        s.position.copy(this.von).addScaledVector(d, p);
        s.position.y += bogen;
        s.position.x += u.seit * p * 6;
        s.position.z += u.hoch * p * 6;
        const gr = .09 + p * .5;
        s.scale.set(gr, gr, 1);
        s.material.opacity = (1 - p * .75) * .6;
      });
    },
  };
  return g;
}

/* ===== Schlauchleitung ===================================================== */
/* art: 'B' (Fahrzeug -> Verteiler, dick) oder 'C' (Verteiler -> Rohr, duenn) */
function baueSchlauch(punkte, art) {
  const dick = art === 'B' ? .058 : .036;
  const farbe = art === 'B' ? 0xe8ecf2 : 0xd6392c;
  const kurve = new THREE.CatmullRomCurve3(punkte.map(p => new THREE.Vector3(p[0], p[1], p[2])));
  const geo = new THREE.TubeGeometry(kurve, Math.max(24, punkte.length * 8), dick, 8, false);
  const mesh = new THREE.Mesh(geo, Mat.matt(farbe, .78));
  mesh.castShadow = true;
  // Kupplungen an den Stossstellen
  const gruppe = new THREE.Group();
  gruppe.add(mesh);
  const n = Math.max(2, Math.round(kurve.getLength() / (art === 'B' ? 4 : 3)));
  for (let i = 1; i < n; i++) {
    const p = kurve.getPointAt(i / n);
    const k = new THREE.Mesh(new THREE.CylinderGeometry(dick * 1.5, dick * 1.5, .09, 10), Mat.glanz(0xa9b2c0, .35, .8));
    const tan = kurve.getTangentAt(i / n);
    k.position.copy(p);
    k.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), tan.normalize());
    gruppe.add(k);
  }
  gruppe.userData = { kurve, art };
  return gruppe;
}

/* Schlauch waechst animiert – gibt eine Funktion zurueck, die 0..1 setzt */
function wachsenderSchlauch(elternteil, punkte, art) {
  const dick = art === 'B' ? .058 : .036;
  const farbe = art === 'B' ? 0xe8ecf2 : 0xd6392c;
  const kurve = new THREE.CatmullRomCurve3(punkte.map(p => new THREE.Vector3(p[0], p[1], p[2])));
  const mat = Mat.matt(farbe, .78);
  let mesh = null;
  const setzen = (p) => {
    if (mesh) { elternteil.remove(mesh); mesh.geometry.dispose(); mesh = null; }
    if (p <= .01) return;
    const n = Math.max(2, Math.round(28 * p));
    const teil = new THREE.CatmullRomCurve3(
      Array.from({ length: n + 1 }, (_, i) => kurve.getPointAt((i / n) * p)));
    mesh = new THREE.Mesh(new THREE.TubeGeometry(teil, Math.max(12, n * 3), dick, 8, false), mat);
    mesh.castShadow = true;
    elternteil.add(mesh);
  };
  return { setzen, kurve };
}

/* ===== Verteiler ==========================================================
   Bauart wie bei uns ueblich: B-Eingang hinten, davor drei Abgaenge –
   links C, in der Mitte B, rechts C. Nach der Regel geht das erste Rohr
   auf den linken, das zweite auf den rechten Abgang; der B-Abgang in der
   Mitte bleibt fuer eine weiterfuehrende B-Leitung frei.                */
/* Links und rechts sind aus der Sicht dessen gemeint, der hinter dem
   Verteiler steht und zum Brand schaut – also aus Richtung des B-Eingangs.
   In Gruppenkoordinaten liegt seine linke Hand bei +x.                    */
const VERTEILER_ABGANG = [
  { id:'links',  name:'linker C-Abgang',    x: .19, art:'C' },
  { id:'mitte',  name:'mittlerer B-Abgang', x: 0,   art:'B' },
  { id:'rechts', name:'rechter C-Abgang',   x:-.19, art:'C' },
];

function baueVerteiler() {
  const g = new THREE.Group();
  const stahl = Mat.glanz(0xb0b8c6, .38, .82);
  const stahl2 = Mat.glanz(0x9aa3b2, .38, .8);
  const hoehe = .3;

  const koerper = new THREE.Mesh(new THREE.BoxGeometry(.56, .17, .17), stahl);
  koerper.position.y = hoehe; koerper.castShadow = true;
  g.add(koerper);

  // Eingang B – hinten, dort kommt die B-Leitung vom Fahrzeug an
  const ein = new THREE.Mesh(new THREE.CylinderGeometry(.078, .078, .2, 12), stahl2);
  ein.rotation.x = Math.PI / 2; ein.position.set(0, hoehe, -.16);
  g.add(ein);
  const einRing = new THREE.Mesh(new THREE.TorusGeometry(.082, .018, 6, 14), stahl2);
  einRing.position.set(0, hoehe, -.25);
  g.add(einRing);

  // drei Abgaenge nach vorn, die aeusseren leicht nach aussen gedreht
  const hebel = [], muendung = [];
  VERTEILER_ABGANG.forEach((a, i) => {
    const r = a.art === 'B' ? .072 : .05;
    const arm = new THREE.Group();
    arm.position.set(a.x, hoehe, .09);
    arm.rotation.y = a.x * 2;      // aeussere Abgaenge zeigen leicht nach aussen
    const rohr = new THREE.Mesh(new THREE.CylinderGeometry(r, r, .2, 12), stahl2);
    rohr.rotation.x = Math.PI / 2; rohr.position.z = .1;
    arm.add(rohr);
    const kupplung = new THREE.Mesh(new THREE.TorusGeometry(r + .015, .017, 6, 14), stahl2);
    kupplung.position.z = .2;
    arm.add(kupplung);
    g.add(arm);
    // Muendung in Gruppenkoordinaten merken – daran haengen die Beschriftungen
    const m = new THREE.Vector3(0, 0, .21);
    arm.localToWorld(m);            // Gruppe steht noch im Ursprung
    muendung.push(m);

    const h = new THREE.Mesh(new THREE.BoxGeometry(.045, .19, .045), Mat.matt(0xd6392c, .5));
    h.position.set(a.x, hoehe + .16, .02); h.rotation.x = -.55;
    g.add(h); hebel.push(h);
  });

  // Standfuesse
  for (const x of [-.2, .2]) {
    const f = new THREE.Mesh(new THREE.BoxGeometry(.06, hoehe - .06, .2), Mat.matt(0x2b323f, .8));
    f.position.set(x, (hoehe - .06) / 2, 0);
    g.add(f);
  }

  g.userData = {
    hebel, muendung,
    abgang(i) { return muendung[i] ? muendung[i].clone() : new THREE.Vector3(); },
    /* Wo die B-Leitung ankuppelt: mittig hinten, in Kupplungshoehe. Wer den
       Schlauch stattdessen irgendwo an die Seite legt, hat einen Verteiler,
       der an nichts haengt – und genau das ist im Bild sofort zu sehen.  */
    eingang() { return new THREE.Vector3(0, hoehe, -.27); },
    oeffnen(i) { if (hebel[i]) hebel[i].rotation.x = .9; },
    schliessen(i) { if (hebel[i]) hebel[i].rotation.x = -.55; },
  };
  return g;
}

/* ===== Unterflurhydrant ====================================================
   „Unterflur" heisst: Der Hydrant liegt im Boden, zu sehen ist nur die
   Strassenkappe. Anschliessen kann man daran gar nichts – erst wenn der
   Wassertrupp den Deckel aufklappt und ein Standrohr einschraubt, ragen zwei
   B-Anschluesse aus der Strasse.

   Genau das war vorher falsch zu sehen: Das Standrohr stand von Anfang an da,
   und der Unterflurhydrant sah aus wie ein Ueberflurhydrant. Deshalb baut
   diese Funktion beides getrennt, und das Level schaltet es in dem Moment
   frei, in dem der Wassertrupp dort ankommt:

     h.userData.deckelOeffnen(true)      Kappe auf
     h.userData.standrohrSetzen(true)    Standrohr waechst aus dem Schacht
     h.userData.anschluss()              Punkt, an dem die B-Leitung ankuppelt
   -------------------------------------------------------------------------*/
function baueHydrant() {
  const g = new THREE.Group();
  const stahl = Mat.glanz(0xb0b8c6, .35, .8);

  // Strassenkappe: Rahmen im Pflaster, darin der dunkle Schacht
  const rahmen = new THREE.Mesh(new THREE.BoxGeometry(.66, .05, .54), Mat.matt(0x4b525e, .9));
  rahmen.position.y = .025; rahmen.receiveShadow = true;
  g.add(rahmen);
  const schacht = new THREE.Mesh(new THREE.BoxGeometry(.46, .04, .34), Mat.matt(0x0e1219, .95));
  schacht.position.y = .048;
  g.add(schacht);

  // Der Deckel klappt zur Seite auf. Scharnier an der linken Kante, deshalb
  // sitzt die Platte im Drehpunkt um ihre halbe Breite versetzt.
  const deckelDreh = new THREE.Group();
  deckelDreh.position.set(-.23, .055, 0);
  const deckel = new THREE.Mesh(new THREE.BoxGeometry(.46, .035, .38), Mat.glanz(0x5b6472, .55, .7));
  deckel.position.x = .23; deckel.castShadow = true;
  deckelDreh.add(deckel);
  g.add(deckelDreh);

  // Das Standrohr bringt der Wassertrupp mit – bis dahin ist es nicht da.
  const standrohr = new THREE.Group();
  const rohr = new THREE.Mesh(new THREE.CylinderGeometry(.07, .085, 1.0, 12), stahl);
  rohr.position.y = .5; rohr.castShadow = true;
  standrohr.add(rohr);
  const kopf = new THREE.Mesh(new THREE.CylinderGeometry(.13, .13, .14, 12), Mat.glanz(0xa9b2c0, .38, .8));
  kopf.position.y = 1.02;
  standrohr.add(kopf);
  // zwei B-Abgaenge mit Niederschraubventil – daran haengt spaeter der Schlauch
  for (const x of [-1, 1]) {
    const abgang = new THREE.Mesh(new THREE.CylinderGeometry(.052, .052, .22, 10), stahl);
    abgang.rotation.z = Math.PI / 2;
    abgang.position.set(x * .17, 1.0, 0);
    standrohr.add(abgang);
    const rad = new THREE.Mesh(new THREE.TorusGeometry(.055, .014, 6, 12), Mat.matt(0xd6392c, .5));
    rad.rotation.x = Math.PI / 2;
    rad.position.set(x * .12, 1.2, 0);
    standrohr.add(rad);
  }
  standrohr.visible = false;
  g.add(standrohr);

  g.userData = {
    standrohr,
    deckelOeffnen(an) { deckelDreh.rotation.z = an ? 2.4 : 0; },
    /* Das Standrohr wird eingeschraubt, also waechst es aus dem Schacht
       heraus statt zu erscheinen. */
    standrohrSetzen(an) {
      if (!an) { standrohr.visible = false; return; }
      if (standrohr.visible) return;
      standrohr.visible = true;
      standrohr.scale.set(1, .02, 1);
      Bewegung.neu(.7, (p) => standrohr.scale.set(1, Math.max(.02, p), 1), null, true);
    },
    /* Ankuppelpunkt der B-Leitung – am Abgang, nicht am Boden. */
    anschluss() { return new THREE.Vector3(0, .95, 0); },
  };
  return g;
}

/* ===== Strahlrohr ========================================================== */
function baueStrahlrohr() {
  const g = new THREE.Group();
  const k = new THREE.Mesh(new THREE.CylinderGeometry(.045, .058, .34, 10), Mat.glanz(0xd6392c, .4, .5));
  k.rotation.x = Math.PI / 2;
  g.add(k);
  const d = new THREE.Mesh(new THREE.CylinderGeometry(.026, .04, .14, 10), Mat.glanz(0xb0b8c6, .3, .85));
  d.rotation.x = Math.PI / 2; d.position.z = .23;
  g.add(d);
  const griff = new THREE.Mesh(new THREE.BoxGeometry(.05, .13, .05), Mat.matt(0x1d2330, .7));
  griff.position.set(0, -.1, -.05); griff.rotation.x = .35;
  g.add(griff);
  return g;
}

/* ===== Funkenflug beim Erfolg ============================================== */
function konfetti(anzahl, farben) {
  const g = new THREE.Group();
  const tex = fleckTextur('rgba(255,255,255,1)', .5);
  const teile = [];
  for (let i = 0; i < (anzahl || 70); i++) {
    const f = (farben || [0xffd23f, 0xff4d3d, 0x35c8ff, 0x3ddc84])[i % 4];
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, color: f, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
    s.userData = { v: new THREE.Vector3(rnd(-3, 3), rnd(3, 8), rnd(-3, 3)), leben: rnd(1.2, 2.4), t: 0 };
    s.scale.setScalar(.14);
    g.add(s); teile.push(s);
  }
  g.userData = {
    teile,
    update(dt) {
      let lebt = false;
      this.teile.forEach(s => {
        const u = s.userData;
        u.t += dt;
        if (u.t > u.leben) { s.visible = false; return; }
        lebt = true;
        u.v.y -= 9.2 * dt;
        s.position.addScaledVector(u.v, dt);
        s.material.opacity = 1 - u.t / u.leben;
      });
      return lebt;
    },
  };
  return g;
}

/* ===== Leuchtring unter einer Figur (Hervorhebung) ========================= */
function bodenRing(farbe) {
  const g = new THREE.Group();
  const ring = new THREE.Mesh(new THREE.RingGeometry(.34, .46, 28),
    new THREE.MeshBasicMaterial({ color: farbe, transparent: true, opacity: .85, side: THREE.DoubleSide }));
  ring.rotation.x = -Math.PI / 2; ring.position.y = .03;
  g.add(ring);
  const schein = new THREE.Sprite(new THREE.SpriteMaterial({
    map: fleckTextur('rgba(255,255,255,.9)', .05), color: farbe,
    transparent: true, opacity: .38, blending: THREE.AdditiveBlending, depthWrite: false }));
  schein.scale.set(1.9, 1.9, 1); schein.position.y = .05;
  g.add(schein);
  g.userData = { ring, schein, t: Math.random() * 6 };
  return g;
}
function ringeUpdate(ringe, dt, t) {
  ringe.forEach(r => {
    const p = .78 + Math.sin(t * 3 + r.userData.t) * .18;
    r.userData.ring.material.opacity = p;
    r.userData.schein.material.opacity = p * .45;
    r.scale.setScalar(1 + Math.sin(t * 3 + r.userData.t) * .05);
  });
}

/* ===== Schlauchreserve: der letzte Schlauch in Buchten =====================
   Genau das, was ein Trupp am letzten C-Schlauch legt, damit er vorgehen
   kann, ohne neu kuppeln zu muessen. Der ganze Schlauch bleibt liegen, in
   losen Buchten hin und her – nicht als Knaeuel. So sieht man, dass da noch
   eine ganze Schlauchlaenge zum Vorgehen bereitliegt.                      */
/* Wie weit eine Reserve in Buchten laengs reicht. Die Leitung laesst genau
   dieses Stueck frei, damit die Buchten nicht auf dem geraden Schlauch
   liegen, sondern seine letzte Laenge sind.                                */
function schlauchreserveLaenge(wellen) { return 1.1 + Math.max(1, wellen || 2) * 1.0; }

function baueSchlauchreserve(wellen, art) {
  const g = new THREE.Group();
  const n = Math.max(1, wellen || 2);
  const laenge = schlauchreserveLaenge(n), weite = .78;
  const dick = art === 'B' ? .058 : .036;
  const schritte = 30 * n;
  const punkte = [];
  for (let i = 0; i <= schritte; i++) {
    const t = i / schritte;
    punkte.push(new THREE.Vector3(t * laenge - laenge / 2, .045,
                                  Math.sin(t * Math.PI * 2 * n) * weite));
  }
  const kurve = new THREE.CatmullRomCurve3(punkte);
  const mesh = new THREE.Mesh(new THREE.TubeGeometry(kurve, schritte * 2, dick, 8, false),
                              Mat.matt(art === 'B' ? 0xe8ecf2 : 0xd6392c, .78));
  mesh.castShadow = true;
  g.add(mesh);
  g.userData = { laenge, wellen: n };
  return g;
}

/* Ein zusammengerollter Schlauch, wie ihn der Trupp mitnimmt */
function baueSchlauchrolle(art) {
  const g = new THREE.Group();
  const mat = Mat.matt(art === 'B' ? 0xe8ecf2 : 0xd6392c, .78);
  const dick = art === 'B' ? .052 : .034;
  for (let i = 0; i < 4; i++) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(.13 + i * .038, dick, 7, 20), mat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = .04 + i * .012;
    ring.castShadow = true;
    g.add(ring);
  }
  return g;
}

/* ===== Markierung am Boden: Kreis mit Beschriftung ========================= */
function bodenMarke(farbe, radius) {
  const g = new THREE.Group();
  const r = radius || .8;
  const ring = new THREE.Mesh(new THREE.RingGeometry(r * .82, r, 40),
    new THREE.MeshBasicMaterial({ color: farbe, transparent: true, opacity: .8, side: THREE.DoubleSide }));
  ring.rotation.x = -Math.PI / 2; ring.position.y = .05;
  g.add(ring);
  const fuell = new THREE.Mesh(new THREE.CircleGeometry(r * .82, 40),
    new THREE.MeshBasicMaterial({ color: farbe, transparent: true, opacity: .16, side: THREE.DoubleSide }));
  fuell.rotation.x = -Math.PI / 2; fuell.position.y = .045;
  g.add(fuell);
  g.userData = { ring, fuell, t: Math.random() * 6 };
  return g;
}
function markenUpdate(marken, dt, t) {
  marken.forEach(m => {
    const p = .55 + Math.sin(t * 2.6 + m.userData.t) * .25;
    m.userData.ring.material.opacity = p;
    m.userData.fuell.material.opacity = p * .22;
  });
}
