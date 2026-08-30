/* ============================================================================
   Der Übungsplatz – Kulisse und Bausteine.

   Kein Fahrzeug, keine Mannschaft: Hier steht nicht die Einsatzstelle im
   Bild, sondern das Experiment. Heller Beton, Sand ringsum, ein paar Kegel
   und eine niedrige Mauer. Die Kamera darf nah ran – was zaehlt, ist das, was
   auf der Platte passiert.

   Boden ist y = 0, nach oben ist positiv.
   ========================================================================== */

const PLATZ = {
  beton:   0xd8d0c0,
  beton2:  0xc9c0ae,
  fuge:    0xb0a692,
  sand:    0xcdb891,
  gras:    0x8fa661,
  stahl:   0x8c9099,
  mauer:   0xc4b7a2,
  holz:    0xa8794a,
};

/* --- Grundflaeche ---------------------------------------------------------
   Eine quadratische Betonplatte mit eingelassenem Fugenraster, ringsum Sand.
   Das Raster ist nicht nur Schmuck: Es gibt dem Auge einen Massstab, und
   ohne Massstab wirkt jedes Objekt in 3D beliebig gross.
   -------------------------------------------------------------------------*/
function baueUebungsplatz(opt) {
  const o = opt || {};
  const seite = o.seite || 26;
  const g = new THREE.Group();

  // Sand bis zum Horizont
  const sand = new THREE.Mesh(
    new THREE.CircleGeometry(o.weite || 90, 48),
    Mat.matt(PLATZ.sand, .96));
  sand.rotation.x = -Math.PI / 2;
  sand.position.y = -0.04;
  sand.receiveShadow = true;
  g.add(sand);

  // Betonplatte
  const platte = new THREE.Mesh(
    new THREE.BoxGeometry(seite, .12, seite),
    Mat.matt(PLATZ.beton, .92));
  platte.position.y = -0.06;
  platte.receiveShadow = true;
  g.add(platte);

  // Fugen: duenne Streifen knapp ueber der Platte. Als eigene Meshes und
  // nicht als Textur – so bleiben sie auch aus naechster Naehe scharf.
  const schritt = o.raster || 3.25;
  const fugeMat = Mat.matt(PLATZ.fuge, .95);
  for (let i = -seite / 2 + schritt; i < seite / 2; i += schritt) {
    const laengs = new THREE.Mesh(new THREE.BoxGeometry(.055, .02, seite), fugeMat);
    laengs.position.set(i, .005, 0);
    g.add(laengs);
    const quer = new THREE.Mesh(new THREE.BoxGeometry(seite, .02, .055), fugeMat);
    quer.position.set(0, .005, i);
    g.add(quer);
  }

  if (o.kulisse !== false) g.add(baueKulisse(seite));
  return g;
}

/* Was am Rand steht. Bewusst weit weg und niedrig: Es soll Tiefe geben und
   sonst nichts – wer auf den Zaun schaut, schaut nicht auf das Feuer. */
function baueKulisse(seite) {
  const g = new THREE.Group();
  const rand = seite / 2 + 6;

  // niedrige Mauer im Ruecken
  const mauer = new THREE.Mesh(new THREE.BoxGeometry(seite + 14, 1.5, .5), Mat.matt(PLATZ.mauer, .93));
  mauer.position.set(0, .75, -rand);
  mauer.castShadow = true; mauer.receiveShadow = true;
  g.add(mauer);
  // Abdeckplatte – erst dadurch sieht eine Mauer nach Mauer aus
  const kappe = new THREE.Mesh(new THREE.BoxGeometry(seite + 14.4, .12, .72), Mat.matt(PLATZ.beton2, .9));
  kappe.position.set(0, 1.56, -rand);
  g.add(kappe);

  // Baeume dahinter
  const baumOrte = [[-16, -rand - 5], [-9, -rand - 8], [4, -rand - 6], [13, -rand - 9], [20, -rand - 4]];
  baumOrte.forEach(([x, z], i) => {
    const b = baueBaum(1 + (i % 3) * .22);
    b.position.set(x, 0, z);
    g.add(b);
  });

  // Grasbueschel im Sand, damit der Rand nicht steril wirkt
  for (let i = 0; i < 26; i++) {
    const w = rnd(0, Math.PI * 2), r = rnd(seite / 2 + 1.5, seite / 2 + 16);
    const bue = new THREE.Mesh(
      new THREE.ConeGeometry(rnd(.14, .3), rnd(.3, .6), 4),
      Mat.matt(PLATZ.gras, .95));
    bue.position.set(Math.cos(w) * r, .18, Math.sin(w) * r);
    bue.rotation.y = rnd(0, 3);
    g.add(bue);
  }
  return g;
}

function baueBaum(skala) {
  const g = new THREE.Group();
  const stamm = new THREE.Mesh(new THREE.CylinderGeometry(.16, .22, 2.2, 6), Mat.matt(0x8a6a48, .95));
  stamm.position.y = 1.1;
  g.add(stamm);
  // drei versetzte Kugeln lesen sich besser als Krone als eine einzige
  [[0, 2.9, 0, 1.3], [-.6, 2.5, .3, .95], [.55, 2.55, -.25, .9]].forEach(([x, y, z, r]) => {
    const k = new THREE.Mesh(new THREE.IcosahedronGeometry(r, 0), Mat.matt(0x6f8f4a, .94));
    k.position.set(x, y, z);
    k.castShadow = true;
    g.add(k);
  });
  g.scale.setScalar(skala || 1);
  return g;
}

/* --- Leitkegel ------------------------------------------------------------ */
function baueKegel() {
  const g = new THREE.Group();
  const fuss = new THREE.Mesh(new THREE.BoxGeometry(.44, .05, .44), Mat.matt(0xe05a1a, .8));
  fuss.position.y = .025;
  g.add(fuss);
  const k = new THREE.Mesh(new THREE.ConeGeometry(.17, .58, 8), Mat.matt(0xe8621f, .78));
  k.position.y = .32;
  k.castShadow = true;
  g.add(k);
  const ring = new THREE.Mesh(new THREE.CylinderGeometry(.115, .135, .1, 8), Mat.matt(0xf5f1e8, .7));
  ring.position.y = .36;
  g.add(ring);
  return g;
}

/* --- Sockel mit Tafel -----------------------------------------------------
   Der Traeger fuer eine der vier Voraussetzungen in Level 1. Die Tafel oben
   ist zunaechst leer und bekommt beim Belegen ein Symbol.

   Der Sockel ist absichtlich kein Podest, sondern eine Saeule: Wenn eine
   Voraussetzung wegfaellt, soll man sehen koennen, dass dem Feuer buchstaeblich
   ein Bein weggezogen wird.
   -------------------------------------------------------------------------*/
function baueSockel(opt) {
  const o = opt || {};
  const g = new THREE.Group();
  const hoehe = o.hoehe || 1.15;

  const fuss = new THREE.Mesh(new THREE.CylinderGeometry(.42, .5, .16, 12), Mat.matt(PLATZ.beton2, .92));
  fuss.position.y = .08;
  fuss.receiveShadow = true; fuss.castShadow = true;
  g.add(fuss);

  const saeule = new THREE.Mesh(new THREE.CylinderGeometry(.19, .23, hoehe, 10), Mat.matt(PLATZ.stahl, .5));
  saeule.position.y = .16 + hoehe / 2;
  saeule.castShadow = true;
  g.add(saeule);

  // Die Platte oben: leer = dunkles Metall, belegt = Farbe der Voraussetzung
  const platte = new THREE.Mesh(new THREE.CylinderGeometry(.46, .46, .09, 12), Mat.matt(0x6d7078, .55));
  platte.position.y = .16 + hoehe + .045;
  platte.castShadow = true;
  g.add(platte);

  // Ein Ring um die Platte, der aufleuchtet, sobald richtig belegt ist.
  // Knapp ueber der Plattenoberkante, sonst verschwindet er darin.
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(.5, .04, 8, 24),
    new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0 }));
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = .16 + hoehe + .1;
  g.add(ring);

  g.userData.sockel = { platte, ring, hoehe: .16 + hoehe + .09, belegt: null };
  return g;
}

/* Sockel belegen: faerbt die Platte und laesst den Ring aufleuchten.
   `null` raeumt ihn wieder ab.

   Kein Symbol im 3D-Bild: Die Marke, die per HotSpot am Sockelkopf klebt,
   traegt Symbol und Beschriftung schon. Zweimal dasselbe uebereinander liest
   sich schlechter als einmal. */
function sockelBelegen(s, eintrag) {
  const d = s.userData.sockel;
  d.belegt = eintrag || null;
  if (!eintrag) {
    d.platte.material = Mat.matt(0x6d7078, .55);
    d.ring.material.opacity = 0;
    return;
  }
  const farbe = new THREE.Color(eintrag.farbe || '#ffffff');
  d.platte.material = Mat.matt(farbe.getHex(), .55);
  d.ring.material.color.set(farbe);
  d.ring.material.opacity = .95;
}

/* --- Mittelfeld: der Platz in der Mitte ------------------------------------
   Fuer das richtige Mengenverhaeltnis. Es ist keine Zutat wie die anderen –
   man kann es nicht danebenstellen. Es ist das Verhaeltnis ZWISCHEN zweien
   davon, und deshalb steht es nicht auf einer Ecke, sondern in der Mitte, rund
   um die Feuerschale. Genau so zeichnet die Literatur das Verbrennungsdreieck:
   drei Ecken, und das Mengenverhaeltnis in der Mitte.

   Die Schnittstelle ist absichtlich dieselbe wie beim Sockel
   (`userData.sockel` mit platte, ring, hoehe, belegt) – so kommen
   `sockelBelegen` und die Fahrten der Level ohne Sonderfall damit zurecht.
   -------------------------------------------------------------------------*/
function baueMittelfeld(opt) {
  const o = opt || {};
  const g = new THREE.Group();
  const innen = o.innen == null ? 1.3 : o.innen;
  const aussen = o.aussen == null ? 1.95 : o.aussen;

  // Der Belag ist flach: Er soll ein Feld auf dem Boden sein, kein Podest.
  // Wer hier ein Podest baut, macht aus der Mitte die vierte Ecke.
  const platte = new THREE.Mesh(new THREE.RingGeometry(innen, aussen, 44), Mat.matt(0x6d7078, .55));
  platte.rotation.x = -Math.PI / 2;
  platte.position.y = .035;
  platte.receiveShadow = true;
  g.add(platte);

  // Kante aussen – gibt dem flachen Ring im Streiflicht eine Silhouette
  const kante = new THREE.Mesh(new THREE.TorusGeometry(aussen, .055, 8, 44), Mat.matt(PLATZ.beton2, .92));
  kante.rotation.x = -Math.PI / 2;
  kante.position.y = .05;
  kante.castShadow = true;
  g.add(kante);

  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(aussen + .1, .045, 8, 44),
    new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0 }));
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = .06;
  g.add(ring);

  g.userData.sockel = { platte, ring, hoehe: .1, belegt: null, mitte: true };
  return g;
}

/* --- Feuerschale ----------------------------------------------------------
   Steht in der Mitte der vier Sockel. Flach und breit, damit die Flamme
   darueber frei steht und nicht in einem Topf versinkt.
   -------------------------------------------------------------------------*/
function baueFeuerschale(opt) {
  const o = opt || {};
  const g = new THREE.Group();
  const r = o.radius || .9;

  // drei Beine – ein Dreibein wackelt nie, auch nicht optisch
  for (let i = 0; i < 3; i++) {
    const w = (i / 3) * Math.PI * 2 + .5;
    const bein = new THREE.Mesh(new THREE.CylinderGeometry(.045, .055, .55, 6), Mat.glanz(0x555b63, .45, .7));
    bein.position.set(Math.cos(w) * r * .62, .275, Math.sin(w) * r * .62);
    bein.rotation.z = Math.cos(w) * .16;
    bein.rotation.x = -Math.sin(w) * .16;
    bein.castShadow = true;
    g.add(bein);
  }
  const schale = new THREE.Mesh(new THREE.CylinderGeometry(r, r * .78, .26, 20, 1, true), Mat.glanz(0x6b7178, .42, .75));
  schale.position.y = .68;
  schale.castShadow = true;
  schale.material.side = THREE.DoubleSide;
  g.add(schale);
  const boden = new THREE.Mesh(new THREE.CircleGeometry(r * .78, 20), Mat.matt(0x3a3630, .95));
  boden.rotation.x = -Math.PI / 2;
  boden.position.y = .552;
  g.add(boden);

  // Scheitholz in der Schale – sonst brennt sichtbar nichts
  const holzMat = Mat.matt(PLATZ.holz, .95);
  for (let i = 0; i < 5; i++) {
    const w = (i / 5) * Math.PI * 2;
    const scheit = new THREE.Mesh(new THREE.CylinderGeometry(.07, .07, r * 1.25, 6), holzMat);
    scheit.position.set(Math.cos(w) * .12, .63, Math.sin(w) * .12);
    scheit.rotation.z = Math.PI / 2;
    scheit.rotation.y = w + rnd(-.2, .2);
    g.add(scheit);
  }
  g.userData.feuerHoehe = .68;
  return g;
}

/* --- Behaelter fuer die Brandklassen --------------------------------------
   Fuenf Tonnen nebeneinander, jede mit ihrem Buchstaben. Bewusst wie
   Muelltonnen zum Einwerfen: Man versteht sofort, was zu tun ist, ohne dass
   es jemand erklaeren muss.
   -------------------------------------------------------------------------*/
function baueTonne(opt) {
  const o = opt || {};
  const g = new THREE.Group();
  const farbe = new THREE.Color(o.farbe || '#888888').getHex();

  const koerper = new THREE.Mesh(new THREE.CylinderGeometry(.52, .44, 1.35, 14), Mat.matt(farbe, .78));
  koerper.position.y = .675;
  koerper.castShadow = true; koerper.receiveShadow = true;
  g.add(koerper);

  // Rippen, damit die Tonne nicht wie ein Farbeimer aussieht
  [.35, .75, 1.1].forEach(y => {
    const rippe = new THREE.Mesh(new THREE.TorusGeometry(.5, .022, 6, 18), Mat.matt(farbe, .6));
    rippe.rotation.x = Math.PI / 2;
    rippe.position.y = y;
    g.add(rippe);
  });

  // offener Deckelrand – da soll etwas hineinfallen koennen
  const rand = new THREE.Mesh(new THREE.TorusGeometry(.53, .05, 8, 20), Mat.glanz(0x4c5058, .4, .6));
  rand.rotation.x = Math.PI / 2;
  rand.position.y = 1.35;
  g.add(rand);
  const loch = new THREE.Mesh(new THREE.CircleGeometry(.5, 18), Mat.matt(0x241d16, .98));
  loch.rotation.x = -Math.PI / 2;
  loch.position.y = 1.34;
  g.add(loch);

  // Der Buchstabe als Schild auf der Vorderseite
  if (o.buchstabe) {
    const s = textSchild(o.buchstabe, { gross: 82, bg: 'rgba(255,253,249,.96)', farbe: '#2a2018', skala: 1.05 });
    s.position.set(0, .8, .56);
    g.add(s);
  }
  g.userData.tonne = { einwurf: new THREE.Vector3(0, 1.5, 0), farbe: o.farbe };
  return g;
}

/* --- Brandgut -------------------------------------------------------------
   Die Dinge, die man einsortiert. Jedes muss auf einen Blick erkennbar sein –
   ein Kind sortiert nicht nach Beschriftung, sondern nach Form.
   -------------------------------------------------------------------------*/
function baueBrandgut(art) {
  const g = new THREE.Group();
  switch (art) {
    case 'holz': {
      const m = Mat.matt(PLATZ.holz, .95);
      for (let i = 0; i < 3; i++) {
        const s = new THREE.Mesh(new THREE.CylinderGeometry(.1, .1, .78, 7), m);
        s.rotation.z = Math.PI / 2;
        s.position.set(0, .1 + i * .17, (i - 1) * .1);
        s.rotation.y = rnd(-.3, .3);
        g.add(s);
      }
      break;
    }
    case 'papier': {
      const m = Mat.matt(0xf2ece0, .9);
      for (let i = 0; i < 4; i++) {
        const b = new THREE.Mesh(new THREE.BoxGeometry(.5, .04, .68), m);
        b.position.set(rnd(-.04, .04), .03 + i * .045, rnd(-.04, .04));
        b.rotation.y = rnd(-.2, .2);
        g.add(b);
      }
      break;
    }
    case 'reifen': {
      const r = new THREE.Mesh(new THREE.TorusGeometry(.34, .15, 10, 20), Mat.matt(0x2e2c2b, .92));
      r.rotation.x = Math.PI / 2;
      r.position.y = .15;
      g.add(r);
      break;
    }
    case 'kanister': {
      const k = new THREE.Mesh(new THREE.BoxGeometry(.42, .58, .26), Mat.matt(0xc8442c, .68));
      k.position.y = .29;
      g.add(k);
      const gr = new THREE.Mesh(new THREE.TorusGeometry(.1, .028, 6, 12, Math.PI), Mat.matt(0xa03422, .7));
      gr.position.set(0, .6, 0);
      g.add(gr);
      const st = new THREE.Mesh(new THREE.CylinderGeometry(.05, .05, .1, 8), Mat.matt(0x3a3430, .6));
      st.position.set(.13, .62, 0);
      g.add(st);
      break;
    }
    case 'kerze': {
      const w = new THREE.Mesh(new THREE.CylinderGeometry(.13, .13, .5, 12), Mat.matt(0xf0e6d0, .85));
      w.position.y = .25;
      g.add(w);
      const d = new THREE.Mesh(new THREE.CylinderGeometry(.008, .008, .09, 4), Mat.matt(0x2a2018, .9));
      d.position.y = .54;
      g.add(d);
      break;
    }
    case 'gasflasche': {
      const f = new THREE.Mesh(new THREE.CylinderGeometry(.22, .22, .78, 14), Mat.glanz(0xd97a12, .35, .5));
      f.position.y = .39;
      g.add(f);
      const kuppel = new THREE.Mesh(new THREE.SphereGeometry(.22, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), Mat.glanz(0xd97a12, .35, .5));
      kuppel.position.y = .78;
      g.add(kuppel);
      const ventil = new THREE.Mesh(new THREE.CylinderGeometry(.055, .055, .16, 8), Mat.glanz(0x8c9099, .3, .8));
      ventil.position.y = 1.03;
      g.add(ventil);
      const kragen = new THREE.Mesh(new THREE.CylinderGeometry(.15, .15, .12, 12, 1, true), Mat.glanz(0x8c9099, .4, .7));
      kragen.material.side = THREE.DoubleSide;
      kragen.position.y = 1.02;
      g.add(kragen);
      break;
    }
    case 'spraydose': {
      const d = new THREE.Mesh(new THREE.CylinderGeometry(.12, .12, .48, 12), Mat.glanz(0x5fa8c8, .3, .6));
      d.position.y = .24;
      g.add(d);
      const kopf = new THREE.Mesh(new THREE.CylinderGeometry(.09, .11, .12, 10), Mat.matt(0xe8e2d6, .7));
      kopf.position.y = .53;
      g.add(kopf);
      break;
    }
    case 'metall': {
      // Spaene: gedrehte Baender, unverwechselbar metallisch. Nur halb
      // metallisch und nicht ganz glatt – voll spiegelnd nehmen sie die Farbe
      // des Bodens an und werden zu schwarzem Gekrakel.
      const m = Mat.glanz(0xd6dae0, .38, .55);
      for (let i = 0; i < 7; i++) {
        const s = new THREE.Mesh(new THREE.TorusGeometry(rnd(.1, .2), .022, 5, 10, rnd(2.5, 5.5)), m);
        s.position.set(rnd(-.22, .22), .06 + rnd(0, .18), rnd(-.22, .22));
        s.rotation.set(rnd(0, 3), rnd(0, 3), rnd(0, 3));
        g.add(s);
      }
      break;
    }
    case 'metallblock': {
      const b = new THREE.Mesh(new THREE.BoxGeometry(.46, .3, .34), Mat.glanz(0xc4c9d0, .4, .55));
      b.position.y = .15;
      g.add(b);
      const b2 = new THREE.Mesh(new THREE.BoxGeometry(.3, .22, .26), Mat.glanz(0xd6dae0, .4, .55));
      b2.position.set(.06, .41, .02);
      b2.rotation.y = .4;
      g.add(b2);
      break;
    }
    case 'pfanne': {
      const p = new THREE.Mesh(new THREE.CylinderGeometry(.42, .34, .16, 18), Mat.glanz(0x3a3a3c, .35, .7));
      p.position.y = .12;
      g.add(p);
      const fett = new THREE.Mesh(new THREE.CylinderGeometry(.36, .33, .06, 18), Mat.matt(0xe8c86a, .35));
      fett.position.y = .17;
      g.add(fett);
      const stiel = new THREE.Mesh(new THREE.CylinderGeometry(.045, .045, .5, 8), Mat.matt(0x24211e, .8));
      stiel.rotation.z = Math.PI / 2;
      stiel.rotation.y = .3;
      stiel.position.set(-.55, .14, .16);
      g.add(stiel);
      break;
    }
    case 'fritteuse': {
      // matt statt metallisch: Eine spiegelnde Flaeche nimmt hier die Farbe
      // des dunklen Bodens an und der Kasten wird zum grauen Kloetzchen.
      const k = new THREE.Mesh(new THREE.BoxGeometry(.52, .36, .44), Mat.matt(0xdde1e6, .5));
      k.position.y = .18;
      g.add(k);
      const rand = new THREE.Mesh(new THREE.BoxGeometry(.56, .05, .48), Mat.matt(0x9aa2ac, .6));
      rand.position.y = .38;
      g.add(rand);
      const oel = new THREE.Mesh(new THREE.BoxGeometry(.42, .05, .34), Mat.matt(0xe8c45a, .35));
      oel.position.y = .385;
      g.add(oel);
      // zwei Griffe – erst dadurch liest man „Fritteuse" und nicht „Kiste"
      [-1, 1].forEach(sx => {
        const griff = new THREE.Mesh(new THREE.BoxGeometry(.07, .06, .2), Mat.matt(0x33383e, .7));
        griff.position.set(sx * .3, .3, 0);
        g.add(griff);
      });
      break;
    }
    case 'stroh': {
      const m = Mat.matt(0xd8b95f, .95);
      const ballen = new THREE.Mesh(new THREE.CylinderGeometry(.34, .34, .52, 12), m);
      ballen.rotation.z = Math.PI / 2;
      ballen.position.y = .34;
      g.add(ballen);
      break;
    }
    default: {
      const b = new THREE.Mesh(new THREE.BoxGeometry(.4, .4, .4), Mat.matt(0xa0a0a0, .8));
      b.position.y = .2;
      g.add(b);
    }
  }
  g.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  return g;
}

/* --- Kleinkram ------------------------------------------------------------ */

/* Ein Tisch, auf dem Versuche stattfinden. Wird ab Level 3 gebraucht. */
function baueWerkbank(breite) {
  const b = breite || 2.6;
  const g = new THREE.Group();
  const platte = new THREE.Mesh(new THREE.BoxGeometry(b, .1, 1.1), Mat.matt(0xb98f5c, .88));
  platte.position.y = .86;
  platte.castShadow = true; platte.receiveShadow = true;
  g.add(platte);
  [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sz]) => {
    const bein = new THREE.Mesh(new THREE.BoxGeometry(.09, .86, .09), Mat.glanz(0x6b7178, .45, .7));
    bein.position.set(sx * (b / 2 - .16), .43, sz * .42);
    bein.castShadow = true;
    g.add(bein);
  });
  g.userData.hoehe = .91;
  return g;
}

/* Windfahne – braucht der Boss-Level, steht aber schon ab jetzt am Platz und
   dreht sich. Kleine Dinge, die sich bewegen, machen eine Kulisse lebendig. */
function baueWindfahne() {
  const g = new THREE.Group();
  const mast = new THREE.Mesh(new THREE.CylinderGeometry(.05, .07, 3.2, 8), Mat.glanz(0x9aa0a8, .4, .7));
  mast.position.y = 1.6;
  mast.castShadow = true;
  g.add(mast);
  const dreh = new THREE.Group();
  dreh.position.y = 3.2;
  g.add(dreh);
  // Windsack: Kegelstumpf, offen
  const sack = new THREE.Mesh(new THREE.CylinderGeometry(.14, .28, 1.1, 10, 1, true), Mat.matt(0xe8621f, .85));
  sack.material.side = THREE.DoubleSide;
  sack.rotation.z = Math.PI / 2;
  sack.position.x = .62;
  dreh.add(sack);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(.28, .022, 6, 16), Mat.glanz(0xf5f1e8, .4, .5));
  ring.rotation.y = Math.PI / 2;
  ring.position.x = .1;
  dreh.add(ring);
  g.userData.dreh = dreh;
  return g;
}

/* Windfahne im Wind. `richtung` in Bogenmass; bei 0 zeigt der Sack nach +x,
   der Wind blaest also nach rechts. Der Sack zeigt mit dem Wind, nicht dagegen. */
function windfahneUpdate(f, dt, t, richtung) {
  const d = f.userData.dreh;
  if (!d) return;
  const ziel = (richtung == null ? 0 : richtung) + Math.sin(t * .7) * .09;
  d.rotation.y += (ziel - d.rotation.y) * Math.min(1, dt * 1.6);
}
