/* ---------- Umgebung: Boden, Strasse, Haeuser, Nacht ---------------------- */

/* koerniger Asphalt/Pflaster-Untergrund als Canvas-Textur */
let _bodenTex = null;
function bodenTextur() {
  if (_bodenTex) return _bodenTex;
  const s = 512, c = document.createElement('canvas');
  c.width = c.height = s;
  const g = c.getContext('2d');
  g.fillStyle = '#b4bac6'; g.fillRect(0, 0, s, s);
  // Koernung
  const bild = g.getImageData(0, 0, s, s), d = bild.data;
  for (let i = 0; i < d.length; i += 4) {
    const n = (Math.random() - .5) * 42;
    d[i] += n; d[i + 1] += n; d[i + 2] += n;
  }
  g.putImageData(bild, 0, 0);
  // ein paar hellere Kiesel
  for (let i = 0; i < 900; i++) {
    g.fillStyle = `rgba(255,255,255,${Math.random() * .09})`;
    g.beginPath(); g.arc(Math.random() * s, Math.random() * s, Math.random() * 2.2, 0, 7); g.fill();
  }
  _bodenTex = new THREE.CanvasTexture(c);
  _bodenTex.wrapS = _bodenTex.wrapT = THREE.RepeatWrapping;
  _bodenTex.colorSpace = THREE.SRGBColorSpace;
  return _bodenTex;
}

function baueBoden(groesse) {
  const s = groesse || 90;
  const g = new THREE.Group();
  const tex = bodenTextur().clone();
  tex.needsUpdate = true;
  tex.repeat.set(s / 6, s / 6);
  const boden = new THREE.Mesh(new THREE.PlaneGeometry(s, s),
    new THREE.MeshStandardMaterial({ map: tex, color: 0x59606f, roughness: .97, metalness: 0 }));
  boden.rotation.x = -Math.PI / 2;
  boden.receiveShadow = true;
  g.add(boden);
  return g;
}

function baueStrasse(laenge, breite) {
  const L = laenge || 60, B = breite || 7;
  const g = new THREE.Group();
  const asphalt = new THREE.Mesh(new THREE.PlaneGeometry(B, L), Mat.matt(0x3c414d, .94));
  asphalt.rotation.x = -Math.PI / 2; asphalt.position.y = .012;
  asphalt.receiveShadow = true;
  g.add(asphalt);
  // Mittelstreifen
  const strichMat = Mat.matt(0xb8bec9, .8);
  for (let z = -L / 2 + 2; z < L / 2; z += 4.5) {
    const st = new THREE.Mesh(new THREE.PlaneGeometry(.16, 2.2), strichMat);
    st.rotation.x = -Math.PI / 2; st.position.set(0, .018, z);
    g.add(st);
  }
  // Bordsteine
  for (const x of [-B / 2, B / 2]) {
    const bord = new THREE.Mesh(new THREE.BoxGeometry(.3, .13, L), Mat.matt(0x666d7d, .9));
    bord.position.set(x, .065, 0); bord.receiveShadow = true;
    g.add(bord);
  }
  return g;
}

/* Ein Wohnhaus, optional mit brennendem Fenster */
function baueHaus(opt) {
  const o = opt || {};
  const B = o.breite || 8, T = o.tiefe || 7, H = o.hoehe || 7;
  const g = new THREE.Group();
  const wand = Mat.matt(o.farbe || 0x8c8375, .92);
  const koerper = new THREE.Mesh(new THREE.BoxGeometry(B, H, T), wand);
  koerper.position.y = H / 2;
  koerper.castShadow = koerper.receiveShadow = true;
  g.add(koerper);

  // Satteldach als echtes Dreiecksprisma
  const form = new THREE.Shape();
  form.moveTo(-B / 2 - .38, 0);
  form.lineTo(B / 2 + .38, 0);
  form.lineTo(0, B * .30);
  form.closePath();
  const dach = new THREE.Mesh(
    new THREE.ExtrudeGeometry(form, { depth: T + .76, bevelEnabled: false }),
    Mat.matt(0x6b3b2c, .92));
  dach.position.set(0, H, -(T + .76) / 2);
  dach.castShadow = dach.receiveShadow = true;
  g.add(dach);

  // Fenster
  const fensterMat = new THREE.MeshStandardMaterial({ color: 0x1a2436, emissive: 0x2a3a52, emissiveIntensity: .5, roughness: .2, metalness: .3 });
  const fenster = [];
  const reihen = Math.max(1, Math.floor(H / 3));
  for (let r = 0; r < reihen; r++) {
    for (let c = 0; c < 3; c++) {
      const m = fensterMat.clone();
      // ein Teil der Fenster ist beleuchtet – das Haus wirkt bewohnt
      if (Math.random() < .45) { m.emissive = new THREE.Color(0xffd9a0); m.emissiveIntensity = 1.5; }
      const f = new THREE.Mesh(new THREE.BoxGeometry(1.0, 1.25, .1), m);
      f.position.set(-B / 2 + B * (c + 1) / 4, 1.7 + r * 2.6, T / 2 + .02);
      g.add(f); fenster.push(f);
      const rahmen = new THREE.Mesh(new THREE.BoxGeometry(1.14, 1.39, .06), Mat.matt(0xe6e2d8, .85));
      rahmen.position.set(f.position.x, f.position.y, T / 2 + .005);
      g.add(rahmen);
    }
  }
  // Tuer
  const tuer = new THREE.Mesh(new THREE.BoxGeometry(1.15, 2.15, .12), Mat.matt(0x4b3527, .8));
  tuer.position.set(0, 1.08, T / 2 + .03);
  g.add(tuer);

  g.userData = {
    fenster, B, T, H,
    /* Weltposition eines Fensters (Spalte 0..2, Reihe 0..n) relativ zum Haus */
    fensterPos(spalte, reihe) {
      return new THREE.Vector3(-B / 2 + B * (spalte + 1) / 4, 1.7 + (reihe || 0) * 2.6, T / 2 + .05);
    },
  };
  return g;
}

/* Nachtstimmung: Strassenlaternen */
function baueLaterne() {
  const g = new THREE.Group();
  const mast = new THREE.Mesh(new THREE.CylinderGeometry(.06, .09, 5.2, 8), Mat.glanz(0x39404e, .5, .6));
  mast.position.y = 2.6; mast.castShadow = true;
  g.add(mast);
  const arm = new THREE.Mesh(new THREE.BoxGeometry(1.1, .08, .08), Mat.glanz(0x39404e, .5, .6));
  arm.position.set(.5, 5.15, 0);
  g.add(arm);
  const lampe = new THREE.Mesh(new THREE.BoxGeometry(.5, .12, .26), Mat.leucht(0xffe1a8, 1.6));
  lampe.position.set(1.0, 5.06, 0);
  g.add(lampe);
  const licht = new THREE.PointLight(0xffdca0, 7, 15, 2);
  licht.position.set(1.0, 4.9, 0);
  g.add(licht);
  return g;
}

/* Baum als Auflockerung */
function baueBaum() {
  const g = new THREE.Group();
  const stamm = new THREE.Mesh(new THREE.CylinderGeometry(.16, .22, 2.2, 7), Mat.matt(0x4a3626, .95));
  stamm.position.y = 1.1; stamm.castShadow = true;
  g.add(stamm);
  const gr = [0x2c4a2a, 0x37603a, 0x2f5233];
  for (let i = 0; i < 3; i++) {
    const k = new THREE.Mesh(new THREE.IcosahedronGeometry(1.15 - i * .22, 0), Mat.matt(gr[i % 3], .95));
    k.position.set(rnd(-.3, .3), 2.4 + i * .75, rnd(-.3, .3));
    k.castShadow = true;
    g.add(k);
  }
  return g;
}

/* Kompletter Einsatzort für den Löschangriff */
function baueEinsatzstelle() {
  const g = new THREE.Group();
  g.add(baueBoden(100));
  const strasse = baueStrasse(70, 7.5);
  strasse.position.x = -3;
  g.add(strasse);

  const haus = baueHaus({ breite: 9, tiefe: 8, hoehe: 7.4, farbe: 0x94897a });
  haus.position.set(9.5, 0, 2);
  haus.rotation.y = -Math.PI / 2;
  g.add(haus);

  const nachbar1 = baueHaus({ breite: 7, tiefe: 7, hoehe: 6, farbe: 0x7d8590 });
  nachbar1.position.set(10, 0, -11); nachbar1.rotation.y = -Math.PI / 2;
  g.add(nachbar1);
  const nachbar2 = baueHaus({ breite: 7.5, tiefe: 7, hoehe: 6.6, farbe: 0x8a7f73 });
  nachbar2.position.set(10, 0, 15); nachbar2.rotation.y = -Math.PI / 2;
  g.add(nachbar2);

  for (const z of [-14, 0, 14]) {
    const l = baueLaterne();
    l.position.set(-7.5, 0, z);
    l.rotation.y = Math.PI;
    g.add(l);
  }
  for (const [x, z] of [[-11, -8], [-12, 6], [-10.5, 18]]) {
    const b = baueBaum(); b.position.set(x, 0, z); b.scale.setScalar(rnd(.8, 1.2));
    g.add(b);
  }
  g.userData = { haus };
  return g;
}

/* Wiese fuer die Uebung – heller Grasgrund, damit sie sich vom Asphalt absetzt */
let _grasTex = null;
function grasTextur() {
  if (_grasTex) return _grasTex;
  const s = 512, c = document.createElement('canvas');
  c.width = c.height = s;
  const g = c.getContext('2d');
  g.fillStyle = '#7f9457'; g.fillRect(0, 0, s, s);
  for (let i = 0; i < 5200; i++) {
    const h = 60 + Math.random() * 55;
    g.strokeStyle = `hsl(${78 + Math.random() * 26},${28 + Math.random() * 22}%,${h / 3.2}%)`;
    g.lineWidth = 1 + Math.random();
    const x = Math.random() * s, y = Math.random() * s;
    g.beginPath(); g.moveTo(x, y); g.lineTo(x + rnd(-2, 2), y - rnd(3, 9)); g.stroke();
  }
  _grasTex = new THREE.CanvasTexture(c);
  _grasTex.wrapS = _grasTex.wrapT = THREE.RepeatWrapping;
  _grasTex.colorSpace = THREE.SRGBColorSpace;
  return _grasTex;
}

function baueWiese(breite, tiefe) {
  const B = breite || 40, T = tiefe || 30;
  const g = new THREE.Group();
  const tex = grasTextur().clone();
  tex.needsUpdate = true;
  tex.repeat.set(B / 5, T / 5);
  const flaeche = new THREE.Mesh(new THREE.PlaneGeometry(B, T),
    new THREE.MeshStandardMaterial({ map: tex, color: 0x94a86a, roughness: .98, metalness: 0 }));
  flaeche.rotation.x = -Math.PI / 2;
  flaeche.position.y = .015;
  flaeche.receiveShadow = true;
  g.add(flaeche);
  // ein paar Buesche als Massstab
  for (let i = 0; i < 7; i++) {
    const b = new THREE.Mesh(new THREE.IcosahedronGeometry(rnd(.35, .7), 0), Mat.matt(0x3f5c33, .95));
    b.position.set(rnd(-B / 2 + 2, B / 2 - 2), .3, rnd(-T / 2 + 2, T / 2 - 2));
    b.castShadow = true;
    g.add(b);
  }
  return g;
}

/* Feldweg – schmaler Schotterstreifen */
function baueFeldweg(laenge, breite) {
  const L = laenge || 50, B = breite || 3.6;
  const g = new THREE.Group();
  const weg = new THREE.Mesh(new THREE.PlaneGeometry(L, B), Mat.matt(0x8b8574, .96));
  weg.rotation.x = -Math.PI / 2; weg.position.y = .03;
  weg.receiveShadow = true;
  g.add(weg);
  return g;
}
