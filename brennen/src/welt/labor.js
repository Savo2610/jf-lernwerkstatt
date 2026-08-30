/* ============================================================================
   Versuchsaufbauten.

   Was in `platz.js` steht, ist der Uebungsplatz: Beton, Tonnen, Brandgut. Was
   hier steht, ist Versuchsgeraet – eine Glasglocke ueber der Flamme, ein
   Thermometer, ein Glaskasten mit Gas. Die Level 3 und 4 zeigen Dinge, die man
   auf einem Uebungsplatz nicht vorfuehren kann: Sauerstoff wegnehmen,
   Temperaturen genau treffen, Mischungen einstellen.

   Alles bleibt Low-Poly und bewusst spielzeughaft. Es soll nach Schulversuch
   aussehen, nicht nach Labor – wer hier Messingarmaturen modelliert, macht das
   Bild unruhig, ohne dass jemand mehr versteht.
   ========================================================================== */

const LABOR = {
  glas:    0xbfe0ea,
  gestell: 0x7d8590,
  platte:  0x5c6068,
  skala:   0xf2ede2,
  quecksilber: 0xd93a12,
};

/* --- Glasglocke -----------------------------------------------------------
   Faehrt ueber die Flamme und schliesst sie ein. Durchsichtig, aber nicht
   unsichtbar: Ein bisschen Spiegelung muss sein, sonst sieht man nicht, dass
   ueberhaupt etwas heruntergefahren ist.

   `glockeFahren(g, 0..1)` – 0 ist ganz oben (offen), 1 ganz unten (zu).
   -------------------------------------------------------------------------*/
function baueGlasglocke(opt) {
  const o = opt || {};
  const r = o.radius == null ? 1.5 : o.radius;
  const h = o.hoehe == null ? 3.2 : o.hoehe;
  const g = new THREE.Group();

  const glasMat = new THREE.MeshStandardMaterial({
    color: LABOR.glas, transparent: true, opacity: .3,
    roughness: .08, metalness: .1, side: THREE.DoubleSide,
  });

  const mantel = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, 24, 1, true), glasMat);
  mantel.position.y = h / 2;
  g.add(mantel);

  const deckel = new THREE.Mesh(new THREE.SphereGeometry(r, 24, 10, 0, Math.PI * 2, 0, Math.PI / 2), glasMat);
  deckel.position.y = h;
  g.add(deckel);

  // Zwei Reifen geben dem Glas eine Kante – ohne sie verschwindet es vor
  // hellem Himmel praktisch vollstaendig.
  [0.02, h].forEach((y) => {
    const reif = new THREE.Mesh(new THREE.TorusGeometry(r, .045, 8, 28), Mat.glanz(LABOR.gestell, .35, .8));
    reif.rotation.x = -Math.PI / 2;
    reif.position.y = y;
    g.add(reif);
  });

  const griff = new THREE.Mesh(new THREE.TorusGeometry(.22, .05, 8, 20), Mat.glanz(LABOR.gestell, .35, .8));
  griff.position.y = h + r * .45;
  g.add(griff);

  g.userData.glocke = { hoehe: h, oben: h + 1.6 };
  g.position.y = g.userData.glocke.oben;
  return g;
}

/* 0 = offen (oben), 1 = geschlossen (unten). */
function glockeFahren(g, wert) {
  const d = g.userData.glocke;
  g.position.y = lerp(d.oben, 0, clamp(wert, 0, 1));
}

/* --- Anzeigesaeule --------------------------------------------------------
   Ein senkrechter Balken, der sich fuellt. Dient in Level 3 als
   Sauerstoffanzeige und in Level 4 als Thermometer – dasselbe Bauteil, nur
   andere Farbe und Beschriftung. Die Zahl selbst steht immer in der
   Bedienleiste und nie im 3D-Bild: Am Beamer ist eine Ziffer auf einer
   Glassaeule aus der letzten Reihe nicht zu lesen.

   `saeuleFuellen(s, 0..1)`
   -------------------------------------------------------------------------*/
function baueAnzeigesaeule(opt) {
  const o = opt || {};
  const h = o.hoehe == null ? 2.6 : o.hoehe;
  const farbe = o.farbe == null ? LABOR.quecksilber : o.farbe;
  const g = new THREE.Group();

  const fuss = new THREE.Mesh(new THREE.CylinderGeometry(.34, .42, .14, 14), Mat.glanz(LABOR.platte, .5, .6));
  fuss.position.y = .07;
  fuss.castShadow = true;
  g.add(fuss);

  const rohr = new THREE.Mesh(new THREE.CylinderGeometry(.14, .14, h, 14, 1, true),
    new THREE.MeshStandardMaterial({ color: LABOR.glas, transparent: true, opacity: .34,
      roughness: .1, side: THREE.DoubleSide }));
  rohr.position.y = .14 + h / 2;
  g.add(rohr);

  // Die Fuellung sitzt im Rohr und waechst von unten. Skalieren statt neu
  // bauen: Das laeuft jedes Bild und darf nichts kosten.
  const fuellung = new THREE.Mesh(new THREE.CylinderGeometry(.105, .105, 1, 12), Mat.leucht(farbe, .55));
  fuellung.position.y = .16;
  g.add(fuellung);

  // Striche als Skala – nur Andeutung, keine Zahlen
  const strichMat = Mat.matt(LABOR.skala, .9);
  for (let i = 1; i < 5; i++) {
    const st = new THREE.Mesh(new THREE.BoxGeometry(.34, .025, .025), strichMat);
    st.position.set(.16, .14 + (h * i) / 5, 0);
    g.add(st);
  }

  g.userData.saeule = { hoehe: h, fuellung };
  saeuleFuellen(g, 0);
  return g;
}

function saeuleFuellen(g, wert) {
  const d = g.userData.saeule;
  const w = clamp(wert, 0, 1) * d.hoehe;
  d.fuellung.scale.y = Math.max(.001, w);
  d.fuellung.position.y = .16 + w / 2;
}

/* --- Gasflasche in Ampelfarbe ---------------------------------------------
   Fuer die Aufteilung der Luft in Level 3. `baueBrandgut('gasflasche')` waere
   naheliegend, faerbt sich aber nicht – und hier muessen drei Flaschen
   nebeneinander auf einen Blick unterscheidbar sein.
   -------------------------------------------------------------------------*/
function baueLuftflasche(farbe) {
  const g = new THREE.Group();
  const koerper = new THREE.Mesh(new THREE.CylinderGeometry(.34, .34, 1.5, 16), Mat.glanz(farbe, .38, .35));
  koerper.position.y = .75;
  koerper.castShadow = true;
  g.add(koerper);

  const schulter = new THREE.Mesh(new THREE.SphereGeometry(.34, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2),
    Mat.glanz(farbe, .38, .35));
  schulter.position.y = 1.5;
  g.add(schulter);

  const ventil = new THREE.Mesh(new THREE.CylinderGeometry(.08, .08, .3, 8), Mat.glanz(0x9a8f6a, .35, .8));
  ventil.position.y = 1.9;
  g.add(ventil);

  const rad = new THREE.Mesh(new THREE.TorusGeometry(.14, .035, 6, 14), Mat.glanz(0x9a8f6a, .35, .8));
  rad.rotation.x = -Math.PI / 2;
  rad.position.y = 2.06;
  g.add(rad);

  g.userData.flasche = { koerper, schulter };
  return g;
}

/* --- Holzprobe nach Zerteilungsgrad ---------------------------------------
   Viermal dieselbe Menge Holz, viermal anders zerteilt. Das ist der ganze
   Punkt von Level 3, Runde 3: gleich viel Masse, ganz verschiedene Oberflaeche.
   Deshalb sieht jede Probe unterschiedlich aus, nimmt aber ungefaehr denselben
   Raum ein.
   -------------------------------------------------------------------------*/
function baueHolzprobe(art) {
  const g = new THREE.Group();
  const m = Mat.matt(PLATZ.holz, .95);

  if (art === 'balken') {
    const b = new THREE.Mesh(new THREE.BoxGeometry(.9, .42, .42), m);
    b.position.y = .21; b.castShadow = true;
    g.add(b);

  } else if (art === 'scheite') {
    for (let i = 0; i < 6; i++) {
      const s = new THREE.Mesh(new THREE.BoxGeometry(.86, .13, .13), m);
      s.position.set(0, .07 + Math.floor(i / 3) * .15, (i % 3 - 1) * .16);
      s.rotation.y = rnd(-.08, .08);
      s.castShadow = true;
      g.add(s);
    }

  } else if (art === 'spaene') {
    for (let i = 0; i < 26; i++) {
      const s = new THREE.Mesh(new THREE.BoxGeometry(rnd(.16, .34), .022, .05), m);
      s.position.set(rnd(-.4, .4), .02 + Math.random() * .16, rnd(-.26, .26));
      s.rotation.set(rnd(-.4, .4), rnd(0, Math.PI), rnd(-.4, .4));
      g.add(s);
    }

  } else if (art === 'staub') {
    // Ein flacher Haufen aus vielen winzigen Wuerfeln. Fein genug, dass man
    // „Staub" liest, grob genug, dass es nicht flimmert.
    for (let i = 0; i < 54; i++) {
      const w = rnd(.03, .055);
      const s = new THREE.Mesh(new THREE.BoxGeometry(w, w, w), m);
      const rr = Math.random() * .42;
      const a = Math.random() * Math.PI * 2;
      s.position.set(Math.cos(a) * rr, .02 + Math.random() * .09 * (1 - rr / .5), Math.sin(a) * rr);
      s.rotation.set(rnd(0, 3), rnd(0, 3), rnd(0, 3));
      g.add(s);
    }
  }

  // Alles liegt auf einer Blechschale – sonst schwebt es optisch
  const schale = new THREE.Mesh(new THREE.BoxGeometry(1.15, .05, .78), Mat.glanz(LABOR.platte, .45, .7));
  schale.position.y = -.025;
  schale.receiveShadow = true;
  g.add(schale);
  return g;
}

/* --- Glaskasten fuer Gasmischungen ----------------------------------------
   Level 4, Explosionsbereich. Innen sitzt eine Wolke, deren Dichte man
   einstellt; oben sitzt ein Zuender, der Funken schlaegt.
   -------------------------------------------------------------------------*/
function baueGaskasten(opt) {
  const o = opt || {};
  const b = o.breite == null ? 2.4 : o.breite;
  const h = o.hoehe == null ? 1.8 : o.hoehe;
  const g = new THREE.Group();

  const glasMat = new THREE.MeshStandardMaterial({
    color: LABOR.glas, transparent: true, opacity: .22,
    roughness: .06, metalness: .1, side: THREE.DoubleSide,
  });
  const kasten = new THREE.Mesh(new THREE.BoxGeometry(b, h, b * .6), glasMat);
  kasten.position.y = h / 2 + .1;
  g.add(kasten);

  // Kanten aus duennen Staeben: Ohne sie steht ein durchsichtiger Kasten vor
  // hellem Himmel praktisch nicht im Bild.
  const kantMat = Mat.glanz(LABOR.gestell, .4, .75);
  const t = b * .6;
  const kante = (l, x, y, z, achse) => {
    const geo = achse === 'x' ? new THREE.BoxGeometry(l, .05, .05)
      : achse === 'y' ? new THREE.BoxGeometry(.05, l, .05)
        : new THREE.BoxGeometry(.05, .05, l);
    const k = new THREE.Mesh(geo, kantMat);
    k.position.set(x, y, z);
    g.add(k);
  };
  [-1, 1].forEach(sz => {
    [-1, 1].forEach(sy => {
      kante(b, 0, h / 2 + .1 + sy * h / 2, sz * t / 2, 'x');
      kante(t, sy * b / 2, h / 2 + .1 + sz * h / 2, 0, 'z');
    });
    [-1, 1].forEach(sx => kante(h, sx * b / 2, h / 2 + .1, sz * t / 2, 'y'));
  });

  const boden = new THREE.Mesh(new THREE.BoxGeometry(b + .16, .2, t + .16), Mat.glanz(LABOR.platte, .5, .6));
  boden.position.y = .1;
  boden.receiveShadow = true; boden.castShadow = true;
  g.add(boden);

  // Zuender: zwei Elektroden unter dem Deckel
  const zuender = new THREE.Group();
  [-.12, .12].forEach(x => {
    const e = new THREE.Mesh(new THREE.CylinderGeometry(.03, .03, .34, 6), Mat.glanz(0x9a8f6a, .3, .85));
    e.position.set(x, h - .05, 0);
    zuender.add(e);
  });
  g.add(zuender);

  g.userData.kasten = { breite: b, hoehe: h, tiefe: t, zuendPunkt: new THREE.Vector3(0, h - .22, 0) };
  return g;
}

/* --- Heizplatte mit Schale ------------------------------------------------
   Level 4, Flammpunkt und Brennpunkt. Die Platte glueht mit steigender
   Temperatur – das ist die einzige Rueckmeldung, die aus der letzten Reihe
   noch zu sehen ist.

   `heizplatteGluehen(p, 0..1)`
   -------------------------------------------------------------------------*/
function baueHeizplatte(opt) {
  const o = opt || {};
  const r = o.radius == null ? .95 : o.radius;
  const g = new THREE.Group();

  const sockel = new THREE.Mesh(new THREE.BoxGeometry(r * 2.3, .26, r * 2.3), Mat.glanz(LABOR.platte, .55, .5));
  sockel.position.y = .13;
  sockel.castShadow = true; sockel.receiveShadow = true;
  g.add(sockel);

  const platte = new THREE.Mesh(new THREE.CylinderGeometry(r, r, .08, 26),
    new THREE.MeshStandardMaterial({ color: 0x3f4248, roughness: .6, emissive: 0x000000 }));
  platte.position.y = .3;
  g.add(platte);

  // Schale mit Fluessigkeit
  const schale = new THREE.Mesh(new THREE.CylinderGeometry(r * .66, r * .58, .22, 20, 1, true),
    Mat.glanz(0x8e959d, .35, .8));
  schale.position.y = .45;
  schale.material.side = THREE.DoubleSide;
  g.add(schale);

  const spiegel = new THREE.Mesh(new THREE.CircleGeometry(r * .62, 20), Mat.glanz(0xc8a64a, .18, .25));
  spiegel.rotation.x = -Math.PI / 2;
  spiegel.position.y = .5;
  g.add(spiegel);

  g.userData.heiz = { platte, spiegel, oberkante: .56, radius: r };
  return g;
}

function heizplatteGluehen(p, wert) {
  const w = clamp(wert, 0, 1);
  const m = p.userData.heiz.platte.material;
  m.emissive.setHex(0xd93a12);
  m.emissiveIntensity = w * 1.5;
  m.color.setHex(w > .02 ? 0x5a3028 : 0x3f4248);
}

/* Farbe der Fluessigkeit in der Schale setzen (Benzin hell, Diesel dunkel). */
function heizplatteFuellen(p, farbe) {
  p.userData.heiz.spiegel.material = Mat.glanz(farbe, .18, .25);
}
