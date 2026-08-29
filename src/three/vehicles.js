/* ---------- Feuerwehrfahrzeuge --------------------------------------------
   Zwei Fahrzeuge, angelehnt an unseren Fuhrpark:
     KLF – Staffelbesatzung (1/5/6), Mannschaftsraum mit 4er-Bank
     LF  – Gruppenbesatzung (1/8/9), 3er- und 4er-Bank gegenueber
   Die Sitzplaetze stehen in FAHRZEUGE[].sitze und lassen sich anpassen,
   ohne die Geometrie anzufassen.  x = quer (+ = rechts), z = laengs (+ = hinten)
   -------------------------------------------------------------------------*/
const FEUERROT = 0xd81f10, FELGE = 0xb9c0cc, REIFEN = 0x14171f;

const FAHRZEUGE = {
  /* --- KLF, Staffelbesatzung (1/5/6), Mannschaftsraum mit 4er-Bank --------
     Nach der Sitzordnung unserer Wehr.                                     */
  klf: {
    id:'klf', name:'KLF', lang:'Kleinlöschfahrzeug', einheit:'staffel',
    L: 5.6, B: 2.05, H: 2.55, radstand: 3.2, radR: .40,
    kabineL: 2.9,
    sitze: [
      { id:'ef', x:  .55, z: -2.00, reihe:'Fahrerhaus', soll:'EF',  label:'Einheitsführer' },
      { id:'ma', x: -.55, z: -2.00, reihe:'Fahrerhaus', soll:'MA',  label:'Maschinist' },
      { id:'b1', x:  .72, z:  -.55, reihe:'4er-Bank',   soll:'ATM', pa:true },
      { id:'b2', x:  .24, z:  -.55, reihe:'4er-Bank',   soll:'WTM', pa:true },
      { id:'b3', x: -.24, z:  -.55, reihe:'4er-Bank',   soll:'WTF', pa:true },
      { id:'b4', x: -.72, z:  -.55, reihe:'4er-Bank',   soll:'ATF', pa:true },
    ],
  },

  /* --- LF, Gruppenbesatzung (1/8/9), 3er- und 4er-Bank gegenüber ---------- */
  lf: {
    id:'lf', name:'LF', lang:'Löschgruppenfahrzeug', einheit:'gruppe',
    L: 7.4, B: 2.45, H: 3.05, radstand: 4.1, radR: .49,
    kabineL: 3.5,
    sitze: [
      { id:'ef', x:  .62, z: -2.90, reihe:'Fahrerhaus', soll:'EF',  label:'Gruppenführer' },
      { id:'ma', x: -.62, z: -2.90, reihe:'Fahrerhaus', soll:'MA',  label:'Maschinist' },
      { id:'d1', x:  .70, z: -1.50, reihe:'3er-Bank',   soll:'ATM', pa:true },
      { id:'d2', x:  .00, z: -1.50, reihe:'3er-Bank',   soll:'ME'  },
      { id:'d3', x: -.70, z: -1.50, reihe:'3er-Bank',   soll:'ATF', pa:true },
      { id:'v1', x:  .85, z:  -.55, reihe:'4er-Bank',   soll:'WTM', pa:true },
      { id:'v2', x:  .28, z:  -.55, reihe:'4er-Bank',   soll:'STM' },
      { id:'v3', x: -.28, z:  -.55, reihe:'4er-Bank',   soll:'STF' },
      { id:'v4', x: -.85, z:  -.55, reihe:'4er-Bank',   soll:'WTF', pa:true },
    ],
  },
};

/* Merksprüche unserer Wehr – genau dafür sind sie da */
const MERKSPRUECHE = {
  lf:  { titel:'Merksatz', spruch:'Alle MEiden Atemgifte, Wasser Sucht Seinen Weg',
         erklaert:'Die Anfangsbuchstaben geben die Sitzreihenfolge im Mannschaftsraum: erst die 3er-Bank (A – Me – A), dann die 4er-Bank gegenüber (W – S – S – W).' },
  klf: { titel:'So kannst du es dir merken', spruch:'Angriffstrupp außen, Wassertrupp innen',
         erklaert:'Auf der 4er-Bank des KLF sitzt der Angriffstrupp ganz außen, der Wassertrupp in der Mitte. Truppführer sitzen jeweils auf der Fahrerseite.' },
  antreten: { titel:'Merkspruch', spruch:'AWS: Alle Wollen Spritzen',
         erklaert:'Am Fahrzeug stehen Maschinist und Melder. Rechts daneben die drei Trupps – immer in dieser Reihenfolge: Angriffstrupp, Wassertrupp, Schlauchtrupp. Vorne der Maschinist und die Truppführer, dahinter Melder und Truppmänner. Der Einheitsführer steht vor dem Angriffstrupp.' },
};

/* Antreteordnung nach „Absitzen!" – die Mannschaft tritt hinter dem Fahrzeug
   an, aber neben der Fahrbahn. Die Angaben sind Weltkoordinaten:
   x waechst nach rechts (vom Fahrzeug weg), z waechst nach hinten.

       Fahrzeug │  Ma   A-Tf  W-Tf  S-Tf      <- vordere Reihe
                │    Me   A-Tm  W-Tm  S-Tm    <- hintere Reihe, leicht versetzt
                            EF (vor dem Angriffstrupp)

   Die hintere Reihe steht um 0,6 m versetzt, damit im Bild niemand hinter
   einem Vordermann verschwindet.                                            */
const A_SPALTE = [2.6, 4.1, 5.6, 7.1];   // Ma/Me, Angriffs-, Wasser-, Schlauchtrupp
const A_VORN = 7.2, A_HINTEN = 5.4, A_VERSATZ = .55, A_FUEHRER = 9.0;

const ANTRETEN = {
  gruppe: [
    { id:'a1', x:A_SPALTE[0], z:A_VORN, reihe:'vorn',   soll:'MA' },
    { id:'a2', x:A_SPALTE[1], z:A_VORN, reihe:'vorn',   soll:'ATF' },
    { id:'a3', x:A_SPALTE[2], z:A_VORN, reihe:'vorn',   soll:'WTF' },
    { id:'a4', x:A_SPALTE[3], z:A_VORN, reihe:'vorn',   soll:'STF' },
    { id:'b1', x:A_SPALTE[0] + A_VERSATZ, z:A_HINTEN, reihe:'hinten', soll:'ME' },
    { id:'b2', x:A_SPALTE[1] + A_VERSATZ, z:A_HINTEN, reihe:'hinten', soll:'ATM' },
    { id:'b3', x:A_SPALTE[2] + A_VERSATZ, z:A_HINTEN, reihe:'hinten', soll:'WTM' },
    { id:'b4', x:A_SPALTE[3] + A_VERSATZ, z:A_HINTEN, reihe:'hinten', soll:'STM' },
    { id:'gf', x:A_SPALTE[1], z:A_FUEHRER, reihe:'Führer', soll:'EF' },
  ],
  staffel: [
    { id:'a1', x:A_SPALTE[0], z:A_VORN, reihe:'vorn',   soll:'MA' },
    { id:'a2', x:A_SPALTE[1], z:A_VORN, reihe:'vorn',   soll:'ATF' },
    { id:'a3', x:A_SPALTE[2], z:A_VORN, reihe:'vorn',   soll:'WTF' },
    { id:'b2', x:A_SPALTE[1] + A_VERSATZ, z:A_HINTEN, reihe:'hinten', soll:'ATM' },
    { id:'b3', x:A_SPALTE[2] + A_VERSATZ, z:A_HINTEN, reihe:'hinten', soll:'WTM' },
    { id:'gf', x:A_SPALTE[1], z:A_FUEHRER, reihe:'Führer', soll:'EF' },
  ],
};

/* Dieselbe Ordnung, aber irgendwo im Gelaende statt im Ursprung.
   `ursprung` ist der Punkt, an dem in der Ordnung das Fahrzeug steht,
   `drehung` seine Drehung um die Hochachse (wie fzg.rotation.y). Die Mann-
   schaft blickt in dieselbe Richtung wie das Fahrzeugheck, der Einheits-
   fuehrer schaut ihr entgegen.                                             */
function antretenWelt(einheit, ursprung, drehung) {
  const dreh = drehung || 0, c = Math.cos(dreh), s = Math.sin(dreh);
  const ox = ursprung[0], oz = ursprung[2];
  return (ANTRETEN[einheit] || ANTRETEN.gruppe).map(p => Object.assign({}, p, {
    wx: ox + p.x * c + p.z * s,
    wz: oz - p.x * s + p.z * c,
    blick: dreh + (p.reihe === 'Führer' ? Math.PI : 0),
  }));
}

/* Fertige Figuren nach der Antreteordnung hinstellen. `erzeuge(soll)` liefert
   die Figur zu einer Funktion – so kann jedes Level seine eigenen bauen.
   Zurueck kommen die Figuren in Aufstellungsreihenfolge und ein Register
   nach Funktion (nachRolle.ATF und so weiter).                             */
function antretenStellen(einheit, ursprung, drehung, erzeuge) {
  const figuren = [], nachRolle = {}, plaetze = [];
  antretenWelt(einheit, ursprung, drehung).forEach(p => {
    const f = erzeuge(p.soll, p);
    if (!f) return;
    f.position.set(p.wx, 0, p.wz);
    f.rotation.y = p.blick;
    figuren.push(f); nachRolle[p.soll] = f; plaetze.push(p);
  });
  return { figuren, nachRolle, plaetze };
}

function baueFahrzeug(typ) {
  const F = FAHRZEUGE[typ];
  const g = new THREE.Group();
  const { L, B, H, radR } = F;
  const bodenH = radR + .18;               // Rahmenoberkante

  const rot     = Mat.glanz(FEUERROT, .34, .28);
  const dunkel  = Mat.matt(0x141922, .8);
  const silber  = Mat.glanz(0xc3cad6, .35, .72);
  const glas    = new THREE.MeshStandardMaterial({ color:0x0e1826, roughness:.08, metalness:.6, transparent:true, opacity:.62 });

  /* Aufbau (hinterer Kasten mit Geraeteraeumen) --------------------------- */
  const aufbauL = L - F.kabineL;
  const aufbauTeile = [];
  const aufbau = new THREE.Mesh(new THREE.BoxGeometry(B, H - bodenH - .1, aufbauL), rot);
  aufbau.position.set(0, bodenH + (H - bodenH - .1) / 2, L / 2 - aufbauL / 2 - .05);
  aufbau.castShadow = aufbau.receiveShadow = true;
  g.add(aufbau); aufbauTeile.push(aufbau);

  /* Rollladen der Geraeteraeume ------------------------------------------ */
  const rlH = (H - bodenH) * .56, rlL = aufbauL * .40;
  for (const seite of [-1, 1]) {
    for (let i = 0; i < 2; i++) {
      const rl = new THREE.Mesh(new THREE.BoxGeometry(.035, rlH, rlL), silber);
      rl.position.set(seite * (B / 2 + .004), bodenH + rlH / 2 + .18,
        L / 2 - aufbauL + rlL * .58 + i * (rlL + .16));
      g.add(rl); aufbauTeile.push(rl);
      // Griffleiste
      const griff = new THREE.Mesh(new THREE.BoxGeometry(.05, .05, rlL * .8), Mat.glanz(0x8d95a3, .4, .8));
      griff.position.set(seite * (B / 2 + .03), bodenH + .28, rl.position.z);
      g.add(griff); aufbauTeile.push(griff);
    }
  }
  /* Heckklappe */
  const heck = new THREE.Mesh(new THREE.BoxGeometry(B * .82, rlH, .035), silber);
  heck.position.set(0, bodenH + rlH / 2 + .18, L / 2 + .005);
  g.add(heck); aufbauTeile.push(heck);

  /* Mannschaftskabine ----------------------------------------------------- */
  const kabH = H - bodenH - .32;
  const kab = new THREE.Mesh(new THREE.BoxGeometry(B, kabH, F.kabineL), rot);
  kab.position.set(0, bodenH + kabH / 2, -L / 2 + F.kabineL / 2);
  kab.castShadow = kab.receiveShadow = true;
  g.add(kab);

  /* Frontscheibe + Seitenfenster ------------------------------------------ */
  const front = new THREE.Mesh(new THREE.BoxGeometry(B * .84, kabH * .40, .04), glas);
  front.position.set(0, bodenH + kabH * .74, -L / 2 + .02);
  front.rotation.x = -.11;
  g.add(front);
  for (const seite of [-1, 1]) {
    for (let i = 0; i < (typ === 'lf' ? 3 : 2); i++) {
      const fenster = new THREE.Mesh(new THREE.BoxGeometry(.03, kabH * .32, F.kabineL * .24), glas);
      fenster.position.set(seite * (B / 2 + .006), bodenH + kabH * .72,
        -L / 2 + F.kabineL * .22 + i * F.kabineL * .27);
      g.add(fenster);
    }
  }

  /* Kuehlergrill und Stossfaenger ----------------------------------------- */
  const grill = new THREE.Mesh(new THREE.BoxGeometry(B * .7, .22, .05), dunkel);
  grill.position.set(0, bodenH + .36, -L / 2 - .01);
  g.add(grill);
  const stange = new THREE.Mesh(new THREE.BoxGeometry(B * .98, .18, .18), Mat.matt(0x1b2029, .7));
  stange.position.set(0, bodenH - .02, -L / 2 - .06);
  g.add(stange);

  /* Scheinwerfer ---------------------------------------------------------- */
  const schein = [];
  for (const x of [-B * .34, B * .34]) {
    const s = new THREE.Mesh(new THREE.BoxGeometry(.28, .15, .06), Mat.leucht(0xfff3d0, 0));
    s.position.set(x, bodenH + .56, -L / 2 - .02);
    g.add(s); schein.push(s);
  }

  /* Warnbalken mit Blaulicht ---------------------------------------------- */
  const balken = new THREE.Mesh(new THREE.BoxGeometry(B * .84, .10, .26), Mat.matt(0x11151d, .6));
  balken.position.set(0, bodenH + kabH + .06, -L / 2 + F.kabineL * .28);
  g.add(balken);
  const blau = [];
  for (const x of [-B * .28, B * .28]) {
    const b = new THREE.Mesh(new THREE.BoxGeometry(B * .22, .11, .2),
      new THREE.MeshStandardMaterial({ color:0x2b6cff, emissive:0x2b6cff, emissiveIntensity:0, roughness:.3, transparent:true, opacity:.9 }));
    b.position.set(x, bodenH + kabH + .07, balken.position.z);
    g.add(b); blau.push(b);
    const licht = new THREE.PointLight(0x3b7bff, 0, 14, 2);
    licht.position.copy(b.position); licht.position.y += .1;
    g.add(licht); blau.push(licht);
  }

  /* Leiter auf dem Dach ---------------------------------------------------- */
  const leiter = new THREE.Group();
  const holmGeo = new THREE.BoxGeometry(.05, .05, aufbauL * .8);
  for (const x of [-.28, .28]) {
    const h = new THREE.Mesh(holmGeo, silber); h.position.x = x; leiter.add(h);
  }
  for (let i = 0; i < 8; i++) {
    const sp = new THREE.Mesh(new THREE.BoxGeometry(.56, .035, .035), silber);
    sp.position.z = -aufbauL * .38 + i * (aufbauL * .76 / 7);
    leiter.add(sp);
  }
  leiter.position.set(0, H - .12, L / 2 - aufbauL / 2 - .05);
  g.add(leiter); aufbauTeile.push(leiter);

  /* Reflex-Konturmarkierung ------------------------------------------------ */
  for (const seite of [-1, 1]) {
    const streifen = new THREE.Mesh(new THREE.BoxGeometry(.02, .09, L * .92), Mat.leucht(0xf2f5a0, .3));
    streifen.position.set(seite * (B / 2 + .008), bodenH + .06, 0);
    g.add(streifen);
  }

  /* Kabinenboden – hebt die Draufsicht vom dunklen Untergrund ab ----------- */
  const kabBoden = new THREE.Mesh(new THREE.BoxGeometry(B - .12, .06, F.kabineL - .12), Mat.matt(0x7d8794, .95));
  kabBoden.position.set(0, bodenH + .02, -L / 2 + F.kabineL / 2);
  kabBoden.receiveShadow = true;
  g.add(kabBoden);

  /* Sitze ------------------------------------------------------------------ */
  const sitzPads = [];
  const sitzMat = Mat.matt(0x3d4759, .82);
  const lehneMat = Mat.matt(0x272f3d, .86);
  F.sitze.forEach(sp => {
    const breiteS = sp.reihe === 'Fahrerhaus' ? .48 : .44;
    const flaeche = new THREE.Mesh(new THREE.BoxGeometry(breiteS, .09, .46), sitzMat);
    flaeche.position.set(sp.x, bodenH + .34, sp.z);
    flaeche.receiveShadow = true;
    g.add(flaeche); sitzPads.push(flaeche);
    // Rueckenlehne zeigt die Blickrichtung an
    const hinten = sp.reihe === '3er-Bank' ? -1 : 1;
    const lehne = new THREE.Mesh(new THREE.BoxGeometry(breiteS, .30, .07), lehneMat);
    lehne.position.set(sp.x, bodenH + .50, sp.z + hinten * .23);
    g.add(lehne); sitzPads.push(lehne);
  });

  /* Raeder ----------------------------------------------------------------- */
  const radGeo = new THREE.CylinderGeometry(radR, radR, .26, 18);
  const felgGeo = new THREE.CylinderGeometry(radR * .55, radR * .55, .28, 12);
  const raeder = [];
  for (const z of [-F.radstand / 2, F.radstand / 2]) {
    for (const x of [-B / 2 + .09, B / 2 - .09]) {
      const rad = new THREE.Mesh(radGeo, Mat.matt(REIFEN, .95));
      rad.rotation.z = Math.PI / 2;
      rad.position.set(x, radR, z);
      rad.castShadow = true;
      g.add(rad); raeder.push(rad);
      const fe = new THREE.Mesh(felgGeo, Mat.glanz(FELGE, .35, .8));
      fe.rotation.z = Math.PI / 2;
      fe.position.set(x + (x < 0 ? -.01 : .01), radR, z);
      g.add(fe);
    }
  }

  /* Beschriftung ----------------------------------------------------------- */
  const schild = textSchild('FEUERWEHR', { gross: 40, bg:'rgba(255,255,255,0)', farbe:'#ffffff', skala: 1.2 });
  schild.position.set(0, bodenH + kabH * .30, -L / 2 - .04);
  g.add(schild); aufbauTeile.push(schild);   // in der Draufsicht wuerde die Schrift nur stoeren

  g.userData = {
    typ, F, blau, schein, bodenH, kabH, kabine: kab, dachleiter: leiter, aufbauTeile, sitzPads,
    blaulichtAn: false, phase: 0,
    /* Weltposition eines Sitzplatzes */
    sitzPos(id) {
      const s = F.sitze.find(x => x.id === id);
      if (!s) return null;
      return new THREE.Vector3(s.x, bodenH + .10, s.z);
    },
  };
  return g;
}

/* Blaulicht animieren – deutsches Doppelblitz-Muster */
function blaulichtUpdate(fzg, dt, t) {
  const u = fzg.userData;
  if (!u || !u.blau) return;
  const an = u.blaulichtAn;
  const takt = (t * 2.2) % 1;
  const blitz = an ? (takt < .06 || (takt > .13 && takt < .19) ? 1 : 0) : 0;
  const blitz2 = an ? (takt > .5 && takt < .56) || (takt > .63 && takt < .69) ? 1 : 0 : 0;
  u.blau.forEach((b, i) => {
    const wert = (i % 4 < 2) ? blitz : blitz2;
    if (b.isPointLight) b.intensity = wert * 22;
    else b.material.emissiveIntensity = wert * 3.2 + .05;
  });
  if (u.schein) u.schein.forEach(s => s.material.emissiveIntensity = an ? 1.6 : 0);
}

/* Draufsicht: Kabine durchsichtig schalten, damit man die Sitze sieht */
function fahrzeugOeffnen(fzg, an) {
  const u = fzg.userData;
  if (!u || !u.kabine) return;
  if (an) {
    if (!u._origMat) u._origMat = u.kabine.material;
    if (!u._umriss) {
      u._umriss = new THREE.LineSegments(
        new THREE.EdgesGeometry(u.kabine.geometry),
        new THREE.LineBasicMaterial({ color: 0xffd9d2, transparent: true, opacity: .75 }));
      u._umriss.position.copy(u.kabine.position);
      fzg.add(u._umriss);
    }
    u._umriss.visible = true;
    u.kabine.material = new THREE.MeshStandardMaterial({
      color: FEUERROT, roughness: .42, metalness: .2, transparent: true, opacity: .14,
      depthWrite: false, side: THREE.DoubleSide,
    });
    // Geraeteaufbau ausblenden – in der Draufsicht zaehlt nur die Kabine,
    // genau wie in unserer Sitzordnungs-Zeichnung
    (u.aufbauTeile || []).forEach(t => t.visible = false);
  } else {
    if (u._origMat) u.kabine.material = u._origMat;
    if (u._umriss) u._umriss.visible = false;
    (u.aufbauTeile || []).forEach(t => t.visible = true);
  }
}

/* Sitzplatz als Weltposition (Fahrzeug- in Weltkoordinaten) */
function sitzWeltPos(fzg, sitz) {
  const u = fzg.userData;
  return fzg.localToWorld(new THREE.Vector3(sitz.x, u.bodenH + .55, sitz.z));
}
