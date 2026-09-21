/* ---------- 3D-Buehne ------------------------------------------------------
   Ein einziger Renderer fuer die ganze App. Level haengen ihre Welt in
   Stage.welt und melden eine Update-Funktion an.

   Gemeinsame Grundlage beider Seiten. Himmel, Nebel und Grundlicht kommen
   aus SPIEL.licht – „Einsatzbereit" spielt nachts an der Einsatzstelle,
   „Brennen & Loeschen" mittags auf dem Uebungsplatz. Alles andere hier ist
   von der Tageszeit unabhaengig.
   -------------------------------------------------------------------------*/
const Stage = {
  renderer: null, scene: null, camera: null, welt: null,
  uhr: null, updates: [], laeuft: false, hq: true,

  init() {
    const canvas = $('#stage');
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const L = SPIEL.licht;
    this.scene = new THREE.Scene();
    this.scene.background = himmelTextur();
    this.scene.fog = new THREE.Fog(L.nebel, L.nebelNah, L.nebelFern);

    this.camera = new THREE.PerspectiveCamera(46, 1, 0.1, 220);
    this.camera.position.set(0, 6, 15);
    this.camera.lookAt(0, 1.4, 0);

    this.welt = new THREE.Group();
    this.scene.add(this.welt);

    this.uhr = new THREE.Clock();
    this.groesseAnpassen();
    window.addEventListener('resize', () => this.groesseAnpassen());
    window.addEventListener('orientationchange', () => setTimeout(() => this.groesseAnpassen(), 120));

    // Grundlicht, das immer da ist. `hauptlicht` ist der Mond oder die Sonne,
    // je nach Spiel – wer eine Szene baut, muss das nicht wissen.
    this.renderer.toneMappingExposure = L.belichtung;
    this.himmelslicht = new THREE.HemisphereLight(L.himmelOben, L.himmelUnten, L.himmelStaerke);
    this.scene.add(this.himmelslicht);
    this.hauptlicht = new THREE.DirectionalLight(L.hauptFarbe, L.hauptStaerke);
    this.hauptlicht.position.set(L.hauptPos[0], L.hauptPos[1], L.hauptPos[2]);
    this.hauptlicht.castShadow = true;
    const c = this.hauptlicht.shadow.camera;
    c.left = -20; c.right = 20; c.top = 20; c.bottom = -20; c.near = 1; c.far = 55;
    this.hauptlicht.shadow.bias = -0.0004;
    this.hauptlicht.shadow.normalBias = 0.055;   // verhindert Schattenflimmern auf grossen Flaechen
    this.hauptlicht.shadow.mapSize.set(2048, 2048);
    this.scene.add(this.hauptlicht);

    this.start();
  },

  /* Sichtfeld an das Seitenverhaeltnis koppeln: auf schmalen Bildschirmen
     wird vertikal aufgemacht, damit horizontal nichts abgeschnitten wird. */
  basisFov: 46, basisAspect: 16 / 9,
  /* schiebt den 3D-Inhalt nach oben, wenn unten ein Bedienfeld liegt
     (0 = kein Versatz, .45 = Inhalt sitzt im oberen Bilddrittel) */
  versatz: 0, versatzX: 0,
  /* oben: schiebt den Inhalt nach oben (Bedienfeld unten)
     rechts: schiebt den Inhalt nach links (Bedienfeld rechts)
     Beide duerfen negativ sein – dann geht es andersherum. Ein negatives
     `oben` schiebt den Inhalt nach unten und macht oben Platz; das braucht
     jeder Bildschirm, dessen Auftragstext ueber der Buehne steht statt
     daneben. */
  bildVersatz(oben, rechts) {
    this.versatz = oben || 0;
    this.versatzX = rechts || 0;
    this.groesseAnpassen();
  },
  groesseAnpassen() {
    const w = innerWidth, h = innerHeight;
    // WICHTIG: Stil mitsetzen lassen. Sonst bekommt die Leinwand auf
    // Retina-Bildschirmen die Pixelmasse als CSS-Groesse (also doppelt so
    // gross wie das Fenster) und man sieht nur noch die linke obere Ecke.
    this.renderer.setSize(w, h);
    const aspect = w / h;
    this.camera.aspect = aspect;
    if (aspect < this.basisAspect) {
      const hTan = Math.tan(this.basisFov / 2 * Math.PI / 180) * this.basisAspect;
      this.camera.fov = Math.min(88, 2 * Math.atan(hTan / aspect) * 180 / Math.PI);
    } else {
      this.camera.fov = this.basisFov;
    }
    const ky = this.versatz, kx = this.versatzX;
    if (ky || kx) {
      // Das Bild wird groesser gerechnet als das Fenster, und das Fenster
      // liegt darin verschoben. Bei positivem Wert sitzt es am unteren bzw.
      // rechten Rand (Inhalt rutscht nach oben/links), bei negativem am
      // oberen bzw. linken (Inhalt rutscht nach unten/rechts).
      const ay = Math.abs(ky), ax = Math.abs(kx);
      this.camera.setViewOffset(
        w * (1 + ax), h * (1 + ay),
        kx > 0 ? w * ax : 0,
        ky > 0 ? h * ay : 0,
        w, h);
    } else {
      this.camera.clearViewOffset();
    }
    this.camera.updateProjectionMatrix();
    if (this._drauf && !this._imDrauf) {
      this._imDrauf = true;
      this.draufsicht.apply(this, this._drauf);
      this._imDrauf = false;
    }
  },

  /* --- Weltinhalt tauschen ---------------------------------------------- */
  leeren() {
    this.updates.length = 0;
    this.orbitAus();
    this.bildVersatz(0, 0);
    this._drauf = null;
    while (this.welt.children.length) {
      const k = this.welt.children.pop();
      k.traverse(o => {
        if (o.geometry) o.geometry.dispose();
        if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => {
          if (m.map) m.map.dispose();
          m.dispose();
        });
      });
    }
    this.kameraZiel = null;
  },

  /* Bildschirmflaeche der Leinwand – NDC bezieht sich hierauf, nicht auf das
     Fenster. Wichtig, sobald die Leinwand nicht exakt das Fenster fuellt.   */
  leinwandRect() { return this.renderer.domElement.getBoundingClientRect(); },
  /* NDC -> CSS-Pixel */
  nachBildschirm(v3, ziel) {
    const r = this.leinwandRect();
    const v = (ziel || new THREE.Vector3()).copy(v3).project(this.camera);
    return { x: r.left + (v.x * .5 + .5) * r.width, y: r.top + (-v.y * .5 + .5) * r.height, z: v.z };
  },

  anmelden(fn) { this.updates.push(fn); return fn; },
  abmelden(fn) { const i = this.updates.indexOf(fn); if (i >= 0) this.updates.splice(i, 1); },

  /* --- Kamera weich fahren ---------------------------------------------- */
  kameraZiel: null,
  kameraFahren(pos, blick, dauer) {
    this.orbitAus();
    this._drauf = null;
    this.camera.up.set(0, 1, 0);
    this.kameraZiel = {
      von: this.camera.position.clone(),
      nach: new THREE.Vector3(pos[0], pos[1], pos[2]),
      blickVon: (this._blick || new THREE.Vector3(0, 1.4, 0)).clone(),
      blickNach: new THREE.Vector3(blick[0], blick[1], blick[2]),
      t: 0, dauer: dauer == null ? 1.4 : dauer,
    };
  },
  kameraSetzen(pos, blick, oben) {
    this.orbitAus();
    this.camera.up.set(oben ? oben[0] : 0, oben ? oben[1] : 1, oben ? oben[2] : 0);
    this.camera.position.set(pos[0], pos[1], pos[2]);
    this._blick = new THREE.Vector3(blick[0], blick[1], blick[2]);
    this.camera.lookAt(this._blick);
    this.kameraZiel = null;
  },
  /* Draufsicht wie in unseren Sitzordnungs-Zeichnungen:
     Fahrzeugfront links, rechte Fahrzeugseite oben.
     Der Abstand wird an der tatsaechlichen Projektion nachgemessen – damit
     stimmt der Ausschnitt auf jedem Bildschirm und nach jeder Groessenaenderung. */
  _drauf: null,
  draufsicht(mitteZ, laengeZ, breiteX, zielY) {
    const y0 = zielY == null ? .8 : zielY;
    this._drauf = [mitteZ, laengeZ, breiteX, y0];
    this._draufX = 0;
    let d = 6;
    const v = new THREE.Vector3();
    for (let i = 0; i < 2; i++) {
      this.kameraSetzen([0, y0 + d, mitteZ], [0, y0, mitteZ], [1, 0, 0]);
      this.camera.updateMatrixWorld(true);
      const r = this.leinwandRect();
      const proMeterZ = Math.abs(this.nachBildschirm(new THREE.Vector3(0, y0, mitteZ + .5)).x -
                                 this.nachBildschirm(new THREE.Vector3(0, y0, mitteZ - .5)).x);
      const proMeterX = Math.abs(this.nachBildschirm(new THREE.Vector3(.5, y0, mitteZ)).y -
                                 this.nachBildschirm(new THREE.Vector3(-.5, y0, mitteZ)).y);
      const f = Math.max(proMeterZ * laengeZ / r.width, proMeterX * breiteX / r.height);
      if (!isFinite(f) || f <= 0) break;
      d *= f;
    }
    this.kameraSetzen([0, y0 + d, mitteZ], [0, y0, mitteZ], [1, 0, 0]);
  },
  draufsichtAus() { this._drauf = null; },

  /* Bildausschnitt so einpassen, dass alle Weltpunkte im Zielrechteck liegen
     (Zielrechteck in CSS-Pixeln). Misst an der echten Projektion und korrigiert
     iterativ – unabhaengig von Sichtfeld, Seitenverhaeltnis und Bildversatz.  */
  einpassen(punkte, ziel) {
    if (!punkte || !punkte.length || !this._blick) return;
    // ab jetzt bestimmt die Einpassung den Ausschnitt – die grobe Draufsicht
    // darf nicht mehr dazwischenfunken
    this._drauf = null;
    // Die Kamera wurde eben erst gesetzt – ohne frische Weltmatrix wuerde die
    // erste Messung noch mit dem Ausschnitt des vorigen Bildschirms rechnen
    // und die Einpassung liefe aus dem Ruder.
    this.camera.updateMatrixWorld(true);
    const v = new THREE.Vector3();
    const messen = () => {
      let minX = 1e9, maxX = -1e9, minY = 1e9, maxY = -1e9;
      for (const pkt of punkte) {
        const s2 = this.nachBildschirm(pkt, v);
        minX = Math.min(minX, s2.x); maxX = Math.max(maxX, s2.x);
        minY = Math.min(minY, s2.y); maxY = Math.max(maxY, s2.y);
      }
      return { minX, maxX, minY, maxY, w: Math.max(1, maxX - minX), h: Math.max(1, maxY - minY) };
    };

    for (let runde = 0; runde < 6; runde++) {
      const blick = this._blick.clone();
      const richtung = new THREE.Vector3().subVectors(this.camera.position, blick);
      const d = richtung.length();
      if (d < .001) return;
      richtung.normalize();

      const m = messen();
      const skala = Math.min(ziel.w / m.w, ziel.h / m.h);
      const neuD = clamp(d / skala, .8, 300);

      const rechts = new THREE.Vector3().setFromMatrixColumn(this.camera.matrixWorld, 0);
      const hoch   = new THREE.Vector3().setFromMatrixColumn(this.camera.matrixWorld, 1);
      const a0 = this.nachBildschirm(blick);
      const b0 = this.nachBildschirm(new THREE.Vector3().copy(blick).add(rechts));
      const c0 = this.nachBildschirm(new THREE.Vector3().copy(blick).add(hoch));
      const pxRechts = Math.abs(b0.x - a0.x);
      const pxHoch   = Math.abs(c0.y - a0.y);

      const istX = (m.minX + m.maxX) / 2, istY = (m.minY + m.maxY) / 2;
      const sollX = ziel.x + ziel.w / 2, sollY = ziel.y + ziel.h / 2;

      /* Zoomen und Verschieben greifen ineinander: Nach dem Heranfahren ist
         alles um `faktor` groesser, also auch jeder Pixelabstand. Deshalb
         beides zusammen rechnen – erst der neue Abstand, dann die
         Verschiebung im neuen Massstab. a0 ist der Punkt, an dem der
         Blickpunkt landet (Bildmitte, ggf. samt Bildversatz).            */
      const faktor = d / neuD;
      const neuBlick = blick.clone();
      if (pxRechts > .01) {
        neuBlick.addScaledVector(rechts,
          (istX - a0.x) / pxRechts - (sollX - a0.x) / (pxRechts * faktor));
      }
      if (pxHoch > .01) {
        neuBlick.addScaledVector(hoch,
          (sollY - a0.y) / (pxHoch * faktor) - (istY - a0.y) / pxHoch);
      }

      this.camera.position.copy(neuBlick).addScaledVector(richtung, neuD);
      this._blick = neuBlick;
      this.camera.lookAt(neuBlick);
      this.camera.updateMatrixWorld(true);
    }
  },

  /* --- sanftes Umkreisen fuer Schaubilder -------------------------------- */
  orbit: null,
  orbitAn(radius, hoehe, ziel, tempo) {
    this.camera.up.set(0, 1, 0);
    this._drauf = null;
    this.orbit = { r: radius, h: hoehe, z: new THREE.Vector3(ziel[0], ziel[1], ziel[2]),
                   v: tempo == null ? 0.075 : tempo, a: 0 };
  },
  orbitAus() { this.orbit = null; },

  start() {
    if (this.laeuft) return;
    this.laeuft = true;
    const schleife = () => {
      if (!this.laeuft) return;
      requestAnimationFrame(schleife);
      const dt = Math.min(this.uhr.getDelta(), 0.05);
      const t = this.uhr.elapsedTime;

      // Groesse jeden Frame pruefen: resize-Events sind nicht ueberall
      // verlaesslich (eingebettete Ansichten, Geraetedrehung)
      if (innerWidth !== this._lw || innerHeight !== this._lh) {
        this._lw = innerWidth; this._lh = innerHeight;
        this.groesseAnpassen();
      }

      if (this.orbit) {
        this.orbit.a += dt * this.orbit.v;
        const o = this.orbit;
        this.camera.position.set(o.z.x + Math.sin(o.a) * o.r, o.h, o.z.z + Math.cos(o.a) * o.r);
        this.camera.lookAt(o.z);
        this._blick = o.z;
      } else if (this.kameraZiel) {
        const k = this.kameraZiel;
        k.t = Math.min(k.t + dt / k.dauer, 1);
        const p = easeInOutCubic(k.t);
        this.camera.position.lerpVectors(k.von, k.nach, p);
        this._blick = new THREE.Vector3().lerpVectors(k.blickVon, k.blickNach, p);
        this.camera.lookAt(this._blick);
        if (k.t >= 1) this.kameraZiel = null;
      }

      for (let i = this.updates.length - 1; i >= 0; i--) {
        try { this.updates[i](dt, t); } catch (e) { console.warn(e); }
      }
      this.renderer.render(this.scene, this.camera);
    };
    schleife();
  },
};

/* Himmel als senkrechter Farbverlauf, von oben nach unten. Die Stopps stehen
   in SPIEL.licht.himmel – nachts tiefes Blau mit warmem Horizont, tagsueber
   umgekehrt: kraeftiges Blau oben, heller Dunst unten.                      */
let _himmel = null;
function himmelTextur() {
  if (_himmel) return _himmel;
  const c = document.createElement('canvas');
  c.width = 8; c.height = 256;
  const g = c.getContext('2d');
  const grad = g.createLinearGradient(0, 0, 0, 256);
  SPIEL.licht.himmel.forEach(([pos, farbe]) => grad.addColorStop(pos, farbe));
  g.fillStyle = grad; g.fillRect(0, 0, 8, 256);
  _himmel = new THREE.CanvasTexture(c);
  _himmel.colorSpace = THREE.SRGBColorSpace;
  _himmel.mapping = THREE.EquirectangularReflectionMapping;
  return _himmel;
}

/* ---------- wiederverwendbare Materialien und Texturen -------------------- */
const Mat = {
  cache: {},
  matt(farbe, rau) {
    const k = 'm' + farbe + (rau || 0.8);
    return this.cache[k] || (this.cache[k] = new THREE.MeshStandardMaterial({
      color: farbe, roughness: rau == null ? 0.8 : rau, metalness: 0.05,
    }));
  },
  glanz(farbe, rau, metall) {
    const k = 'g' + farbe + rau + metall;
    return this.cache[k] || (this.cache[k] = new THREE.MeshStandardMaterial({
      color: farbe, roughness: rau == null ? 0.32 : rau, metalness: metall == null ? 0.65 : metall,
    }));
  },
  leucht(farbe, staerke) {
    const k = 'l' + farbe + (staerke || 1);
    return this.cache[k] || (this.cache[k] = new THREE.MeshStandardMaterial({
      color: farbe, emissive: farbe, emissiveIntensity: staerke == null ? 1 : staerke, roughness: 0.5,
    }));
  },
};

/* weicher runder Fleck als Textur – Basis fuer Glanz, Rauch, Funken */
function fleckTextur(farbe, haerte) {
  const s = 128, c = document.createElement('canvas');
  c.width = c.height = s;
  const g = c.getContext('2d');
  const grad = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
  const h = haerte == null ? 0.25 : haerte;
  grad.addColorStop(0, farbe || 'rgba(255,255,255,1)');
  grad.addColorStop(h, farbe || 'rgba(255,255,255,.8)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grad; g.fillRect(0, 0, s, s);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/* Beschriftung als Sprite – so bleibt Text im 3D-Bild scharf und lesbar */
function textSchild(text, opt) {
  const o = opt || {};
  const gross = o.gross || 46;
  const pad = 22;
  const mess = document.createElement('canvas').getContext('2d');
  mess.font = `800 ${gross}px Outfit, sans-serif`;
  const b = Math.ceil(mess.measureText(text).width) + pad * 2;
  const h = gross + pad * 1.4;
  const c = document.createElement('canvas');
  c.width = b; c.height = h;
  const g = c.getContext('2d');
  const rad = h / 2;
  g.fillStyle = o.bg || 'rgba(12,17,30,.88)';
  g.beginPath(); g.roundRect(0, 0, b, h, rad); g.fill();
  if (o.rand) { g.strokeStyle = o.rand; g.lineWidth = 4; g.stroke(); }
  g.font = `800 ${gross}px Outfit, sans-serif`;
  g.fillStyle = o.farbe || '#eaf0ff';
  g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText(text, b / 2, h / 2 + 1);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false }));
  const skala = (o.skala || 1) * 0.0042;
  sp.scale.set(b * skala, h * skala, 1);
  sp.userData.breite = b * skala;
  return sp;
}

/* Objekt anlegen und gleich positionieren (position ist schreibgeschuetzt,
   darf also nicht per Object.assign gesetzt werden) */
function bei(objekt, x, y, z) { objekt.position.set(x, y, z); return objekt; }

/* Die Animationshilfe `Bewegung` stand frueher hier. Sie kennt kein 3D und
   liegt jetzt in gemeinsam/util.js – die 2D-Seite „Erst sichern!" braucht sie
   genauso und bringt keine Three-Buehne mit.                                */

/* Figur zu einem Punkt laufen lassen (dreht sich in Laufrichtung) */
function figurGehen(f, ziel, tempo, danach) {
  const von = f.position.clone();
  const nach = new THREE.Vector3(ziel[0], 0, ziel[2] == null ? ziel[1] : ziel[2]);
  const strecke = von.distanceTo(nach);
  if (strecke < .05) { if (danach) danach(); return; }
  const dauer = strecke / (tempo || 2.6);
  const winkel = Math.atan2(nach.x - von.x, nach.z - von.z);
  f.rotation.y = winkel;
  f.userData.geht = 1;
  return Bewegung.neu(dauer, (p) => {
    f.position.x = lerp(von.x, nach.x, p);
    f.position.z = lerp(von.z, nach.z, p);
  }, () => { f.userData.geht = 0; if (danach) danach(); }, false);
}

/* mehrere Figuren gemeinsam bewegen, Rueckmeldung wenn alle da sind */
function truppGehen(figuren, ziele, tempo, danach) {
  if (!figuren.length) { if (danach) danach(); return; }
  let offen = figuren.length;
  figuren.forEach((f, i) => figurGehen(f, ziele[i], tempo, () => { if (--offen === 0 && danach) danach(); }));
}

/* Figur ueber mehrere Wegpunkte schicken – damit niemand durchs Fahrzeug
   laeuft. punkte: [[x,z],[x,z],...]                                        */
function figurWeg(f, punkte, tempo, danach) {
  let i = 0;
  const weiter = () => {
    if (i >= punkte.length) { if (danach) danach(); return; }
    const p = punkte[i++];
    figurGehen(f, [p[0], 0, p[1]], tempo, weiter);
  };
  weiter();
}

/* ganzer Trupp ueber je eigene Wegpunkte */
function truppWeg(figuren, wege, tempo, danach) {
  if (!figuren.length) { if (danach) danach(); return; }
  let offen = figuren.length;
  figuren.forEach((f, i) => figurWeg(f, wege[i] || wege[0], tempo, () => { if (--offen === 0 && danach) danach(); }));
}
