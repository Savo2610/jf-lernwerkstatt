/* ---------- Feuerwehrfiguren ----------------------------------------------
   Stilisiert, aber sofort erkennbar: dunkle Einsatzjacke mit Reflexstreifen,
   Helm, und eine farbige Trupp-Kennzeichnung als Lernhilfe.
   -------------------------------------------------------------------------*/
const HAUT = [0xf0c9a4, 0xdcae86, 0xb9825c, 0x8d5a3b, 0xf5d7b8];
const JACKE = 0x1d2740, HOSE = 0x18203a, REFLEX = 0xf2f5a0, STIEFEL = 0x0d1018;

function baueFigur(opt) {
  const o = opt || {};
  const g = new THREE.Group();
  const haut = o.haut != null ? o.haut : pick(HAUT);
  const helmFarbe = o.helm != null ? o.helm : 0x2c3450;
  const kennung = o.kennung || null;      // Truppfarbe als Weste
  const s = 1;

  const matJacke  = Mat.matt(JACKE, .82);
  const matHose   = Mat.matt(HOSE, .86);
  const matReflex = Mat.leucht(REFLEX, .35);
  const matHaut   = Mat.matt(haut, .78);
  const matStiefel= Mat.matt(STIEFEL, .55);

  // --- Beine -------------------------------------------------------------
  const beinGeo = new THREE.CapsuleGeometry(.105, .52, 3, 8);
  const beine = [];
  for (const x of [-.13, .13]) {
    const pivot = new THREE.Group();
    pivot.position.set(x, .82, 0);
    const bein = new THREE.Mesh(beinGeo, matHose);
    bein.position.y = -.3; bein.castShadow = true;
    pivot.add(bein);
    const stiefel = new THREE.Mesh(new THREE.BoxGeometry(.19, .13, .28), matStiefel);
    stiefel.position.set(0, -.63, .035); stiefel.castShadow = true;
    pivot.add(stiefel);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(.112, .017, 6, 14), matReflex);
    ring.rotation.x = Math.PI / 2; ring.position.y = -.46;
    pivot.add(ring);
    g.add(pivot); beine.push(pivot);
  }

  // --- Rumpf -------------------------------------------------------------
  const rumpf = new THREE.Mesh(new THREE.CapsuleGeometry(.235, .40, 4, 12), matJacke);
  rumpf.position.y = 1.16; rumpf.castShadow = true; rumpf.scale.z = .78;
  g.add(rumpf);
  // Reflexstreifen der Einsatzjacke
  for (const y of [1.03, 1.30]) {
    const st = new THREE.Mesh(new THREE.TorusGeometry(.238, .022, 6, 18), matReflex);
    st.rotation.x = Math.PI / 2; st.position.y = y; st.scale.z = .8;
    g.add(st);
  }
  // Trupp-Kennzeichnung als Weste
  if (kennung) {
    const w = new THREE.Mesh(new THREE.CylinderGeometry(.252, .262, .34, 14, 1, true),
      new THREE.MeshStandardMaterial({ color: kennung, roughness: .62, side: THREE.DoubleSide,
        emissive: kennung, emissiveIntensity: .22 }));
    w.position.y = 1.17; w.scale.z = .8;
    g.add(w);
  }

  // --- Arme --------------------------------------------------------------
  const armGeo = new THREE.CapsuleGeometry(.078, .40, 3, 8);
  const arme = [];
  for (const x of [-.29, .29]) {
    const pivot = new THREE.Group();
    pivot.position.set(x, 1.36, 0);
    const arm = new THREE.Mesh(armGeo, matJacke);
    arm.position.y = -.25; arm.castShadow = true;
    pivot.add(arm);
    const hand = new THREE.Mesh(new THREE.SphereGeometry(.082, 8, 6), matHaut);
    hand.position.y = -.5;
    pivot.add(hand);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(.083, .015, 6, 12), matReflex);
    ring.rotation.x = Math.PI / 2; ring.position.y = -.4;
    pivot.add(ring);
    g.add(pivot); arme.push(pivot);
  }

  // --- Kopf & Helm -------------------------------------------------------
  const hals = new THREE.Mesh(new THREE.CylinderGeometry(.075, .085, .09, 8), matHaut);
  hals.position.y = 1.46; g.add(hals);
  const kopf = new THREE.Mesh(new THREE.SphereGeometry(.145, 14, 12), matHaut);
  kopf.position.y = 1.585; kopf.scale.set(1, 1.1, .95); kopf.castShadow = true;
  g.add(kopf);

  const helmMat = Mat.glanz(helmFarbe, .28, helmFarbe === 0xffffff ? .1 : .35);
  const helm = new THREE.Group();
  const kalotte = new THREE.Mesh(new THREE.SphereGeometry(.168, 16, 12, 0, Math.PI * 2, 0, Math.PI * .58), helmMat);
  helm.add(kalotte);
  const krempe = new THREE.Mesh(new THREE.CylinderGeometry(.2, .225, .028, 18), helmMat);
  krempe.position.y = -.005; krempe.scale.z = 1.15; krempe.position.z = -.012;
  helm.add(krempe);
  const nacken = new THREE.Mesh(new THREE.BoxGeometry(.3, .02, .1), helmMat);
  nacken.position.set(0, -.02, -.17); nacken.rotation.x = .32;
  helm.add(nacken);
  helm.position.y = 1.655; helm.castShadow = true;
  g.add(helm);

  // Augen – macht die Figuren freundlicher und gibt eine Blickrichtung
  const augeGeo = new THREE.SphereGeometry(.021, 8, 6);
  const augeMat = Mat.matt(0x121722, .4);
  for (const ax of [-.052, .052]) {
    const auge = new THREE.Mesh(augeGeo, augeMat);
    auge.position.set(ax, 1.60, .125);
    g.add(auge);
  }

  // Visier
  if (o.pa) {
    const visier = new THREE.Mesh(new THREE.SphereGeometry(.152, 12, 8, -.9, 1.8, .55, .55),
      new THREE.MeshStandardMaterial({ color: 0x1a2436, roughness: .12, metalness: .8, transparent: true, opacity: .62 }));
    visier.position.set(0, 1.6, .012);
    g.add(visier);
  }

  // --- Atemschutzgeraet --------------------------------------------------
  let pa = null;
  if (o.pa) {
    pa = new THREE.Group();
    const flasche = new THREE.Mesh(new THREE.CapsuleGeometry(.085, .30, 4, 10), Mat.glanz(0xd8dee9, .3, .7));
    flasche.rotation.x = .06; flasche.castShadow = true;
    pa.add(flasche);
    const trage = new THREE.Mesh(new THREE.BoxGeometry(.26, .34, .05), Mat.matt(0x11151f, .8));
    trage.position.z = .075;
    pa.add(trage);
    pa.position.set(0, 1.18, -.26);
    g.add(pa);
    // Maske
    const maske = new THREE.Mesh(new THREE.SphereGeometry(.115, 12, 10), Mat.glanz(0x0f1420, .2, .5));
    maske.position.set(0, 1.575, .07); maske.scale.set(1, .95, .75);
    g.add(maske);
  }

  g.userData = { beine, arme, rumpf, kopf, helm, pa, phase: Math.random() * 6.28 };
  g.userData.geht = 0;
  return g;
}

/* Figuren beleben: Atmen im Stand, Beinschwung beim Gehen */
function belebeFiguren(gruppe, dt, t) {
  gruppe.forEach(f => {
    const u = f.userData;
    if (!u || !u.beine) return;
    const p = t * 2 + u.phase;
    if (u.geht > 0) {
      const s = Math.sin(t * 9 + u.phase) * .55 * u.geht;
      u.beine[0].rotation.x = s;
      u.beine[1].rotation.x = -s;
      u.arme[0].rotation.x = -s * .8;
      u.arme[1].rotation.x = s * .8;
      f.position.y = Math.abs(Math.sin(t * 9 + u.phase)) * .035 * u.geht;
    } else {
      const a = Math.sin(p) * .022;
      u.rumpf.position.y = 1.16 + a;
      u.kopf.position.y = 1.585 + a;
      u.helm.position.y = 1.655 + a;
      u.beine[0].rotation.x *= .88; u.beine[1].rotation.x *= .88;
      u.arme[0].rotation.x = u.arme[0].rotation.x * .88 + Math.sin(p * .7) * .012;
      u.arme[1].rotation.x = u.arme[1].rotation.x * .88 - Math.sin(p * .7) * .012;
      f.position.y *= .85;
    }
  });
}

/* Figur passend zu einer Funktion bauen */
function figurFuerRolle(rolleId, opt) {
  const r = ROLE[rolleId] || ROLE.TM;
  const fuehrer = /F$/.test(rolleId) === false && (rolleId === 'EF' || rolleId === 'ZF' || rolleId === 'TF' || rolleId === 'FA');
  const istFuehrer = ['EF', 'ZF', 'TF', 'FA'].includes(rolleId);
  const truppFarbe = r.trupp === 'A' ? 0xff4d3d : r.trupp === 'W' ? 0x35c8ff : r.trupp === 'S' ? 0x3ddc84 : null;
  return baueFigur(Object.assign({
    helm: istFuehrer ? 0xffffff : 0x2c3450,
    kennung: truppFarbe,
    pa: (opt && opt.pa) || false,
  }, opt || {}));
}
