/* ---------- Oberflaeche: Bildschirme, HUD, Toasts, Ziehen -----------------
   Gemeinsame Grundlage beider Seiten. Alles hier ist inhaltsfrei: die Texte,
   Abzeichen und Raenge kommen aus dem jeweiligen Spiel.
   -------------------------------------------------------------------------*/
const UI = {
  wurzel: null, hud: null,
  aktuell: null,          // { id, node, aufraeumen }

  init() {
    this.wurzel = $('#screens');
    this.hud = $('#hud');
  },

  /* --- Bildschirmwechsel -------------------------------------------------
     Sperre: Verlaesst man ein Level, koennen dessen Zeitgeber noch feuern.
     Bildschirme eines anderen Levels werden dann abgewiesen, damit nichts
     ueber das Menue oder das naechste Level gemalt wird.                    */
  sperre: null,          // null = alles erlaubt, sonst Praefix wie 'l5' oder '__menue'
  sperreSetzen(wert) { this.sperre = wert; },
  darfZeigen(id) {
    const m = /^(l\d+)-/.exec(id);
    if (!m) return true;                       // Menue-, Ergebnis- und Beamerbildschirme
    if (this.sperre === null) { this.sperre = m[1]; return true; }
    if (this.sperre === m[1]) return true;
    return false;
  },

  zeige(id, aufbau, opt) {
    if (!this.darfZeigen(id)) return null;
    const o = opt || {};
    if (this.aktuell) {
      if (this.aktuell.aufraeumen) { try { this.aktuell.aufraeumen(); } catch (e) { console.warn(e); } }
      const alt = this.aktuell.node;
      alt.classList.add('raus');
      setTimeout(() => alt.remove(), 260);
    }
    const node = el('section', { class: 'screen rein' + (o.scroll ? ' scrollbar' : ''), 'data-screen': id });
    this.wurzel.appendChild(node);
    const aufraeumen = aufbau(node) || null;
    this.aktuell = { id, node, aufraeumen };
    return node;
  },

  /* --- Kopfzeile --------------------------------------------------------- */
  /* `beschriftung` darf ein Text oder eine Liste von Knoten sein – im Levelmenue
     steht dort „Zurück zur Lernwerkstatt", auf schmalen Bildschirmen kuerzer. */
  hudZeigen(titel, zurueck, beschriftung) {
    this.hud.hidden = false;
    this.hud.innerHTML = '';
    if (zurueck) {
      const text = beschriftung == null ? ['Zurück']
        : (Array.isArray(beschriftung) ? beschriftung : [beschriftung]);
      this.hud.appendChild(el('button', {
        class: 'hud-zurueck', onclick: () => { Audio3.zu(); Audio3.still(); zurueck(); },
      }, '←', el('span', null, text)));
    }
    this.hud.appendChild(el('div', { class: 'hud-titel', text: titel || '' }));
    this.hud.appendChild(el('div', { class: 'hud-spacer' }));
    if (State.modus === 'solo') {
      const r = State.rang(), n = State.naechsterRang();
      this.hud.appendChild(el('div', { class: 'rangchip' }, r.icon, el('span', { text: r.name })));
      const bar = el('div', { class: 'xpbar', title: n ? `${State.xp} / ${n.xp} XP` : `${State.xp} XP` },
        el('i', { style: { width: (State.rangFortschritt() * 100) + '%' } }));
      this.hud.appendChild(bar);
      this.hud.appendChild(el('div', { class: 'chip mono', text: State.xp + ' XP' }));
    }
    this.hud.appendChild(this.tonKnopf());
  },
  hudVerstecken() { this.hud.hidden = true; },

  tonKnopf() {
    const b = el('button', { class: 'hud-zurueck', title: 'Ton an/aus' });
    const mal = () => b.textContent = State.ton ? '🔊' : '🔇';
    b.addEventListener('click', () => {
      State.ton = !State.ton; State.sprache = State.ton; State.sichern();
      if (State.ton) { Audio3.wecken(); Audio3.klick(); } else Audio3.still();
      mal();
    });
    mal();
    return b;
  },

  /* --- Toasts ------------------------------------------------------------ */
  toast(text, art, ms) {
    const t = el('div', { class: 'toast ' + (art || ''), text });
    $('#toasts').appendChild(t);
    setTimeout(() => { t.classList.add('weg'); setTimeout(() => t.remove(), 320); }, ms || 2300);
    return t;
  },

  abzeichenToast(key) {
    const a = ABZEICHEN[key];
    if (!a) return;
    Audio3.fanfare();
    const t = el('div', { class: 'toast gold' }, a.icon, el('span', { html: `<b>Abzeichen: ${a.name}</b>` }));
    $('#toasts').appendChild(t);
    setTimeout(() => { t.classList.add('weg'); setTimeout(() => t.remove(), 320); }, 3400);
  },

  /* --- Standardbausteine ------------------------------------------------- */
  schritte(n, jetzt, fertigBis) {
    const w = el('div', { class: 'schritte' });
    for (let i = 0; i < n; i++) {
      w.appendChild(el('i', { class: i < (fertigBis == null ? jetzt : fertigBis) ? 'fertig' : (i === jetzt ? 'jetzt' : '') }));
    }
    return w;
  },

  zitat(text) { return el('div', { class: 'zitat', text }); },

  /* Abdunkler fuer textlastige Bildschirme vor der 3D-Kulisse */
  dunkler() { return el('div', { class: 'dunkler' }); },

  feedback(gut, titel, text, zitatText) {
    return el('div', { class: 'feedback ' + (gut ? 'gut' : 'schlecht') },
      el('b', { text: titel }),
      el('span', { text: text || '' }),
      zitatText ? this.zitat(zitatText) : null);
  },

  /* --- Nachweis fuer den Jugendwart ---------------------------------------
     Erscheint erst, wenn wirklich alle Abzeichen da sind. Der Code haengt am
     Vornamen und am heutigen Tag; warum das reicht und warum es nicht mehr
     kann, steht in gemeinsam/nachweis.js.

     crypto.subtle rechnet asynchron, die Tafel wird aber synchron gebaut –
     also steht erst ein Platzhalter da und der Code wird nachgetragen.     */
  nachweisKarte(alleKeys) {
    if (!alleKeys.every(k => State.abzeichen[k])) return null;

    const feld = el('div', { class: 'nachweiscode', text: '…' });
    NACHWEIS.erzeugen(SPIEL.id, State.name, alleKeys)
      .then(code => { feld.textContent = code; })
      .catch(() => { feld.textContent = 'geht hier nicht'; feld.classList.add('fehlt'); });

    return el('div', { class: 'panel nachweis' },
      el('div', { style: { fontSize: '2em', lineHeight: 1.1 }, text: '📜' }),
      el('b', { text: 'Alle Abzeichen – Nachweis' }),
      el('div', { class: 'klein', text: `Zeig das deinem Jugendwart. Der Code gehört zu „${State.name}“ und gilt nur mit diesem Namen.` }),
      feld,
      el('div', { class: 'klein', text: NACHWEIS.tagAlsDatum(NACHWEIS.tagVon()) }));
  },

  /* --- Ergebnis eines Levels --------------------------------------------- */
  ergebnis(opt) {
    // opt: { levelId, titel, guete (0..1), xp, abzeichen[], zeilen[], weiter(), nochmal() }
    const g = clamp(opt.guete, 0, 1);
    const sterne = g >= .95 ? 3 : g >= .7 ? 2 : g >= .4 ? 1 : 0;
    const noten = ['Da geht mehr!', 'Solide!', 'Stark!', 'Perfekt!'];

    var xpInfo = null;
    if (State.modus === 'solo') {
      State.levelFertig(opt.levelId, g);
      xpInfo = State.xpFuerLevel(opt.levelId, opt.xp || 0);
      (opt.abzeichen || []).forEach(k => { if (State.abzeichenGeben(k)) setTimeout(() => UI.abzeichenToast(k), 700); });
      // Meisterabzeichen: drei Sterne in jeder einzelnen Aufgabe. Welches
      // Abzeichen das ist, weiss nur das jeweilige Spiel – SPIEL.meister.
      if (SPIEL.meister && State.alleDreiSterne() && State.abzeichenGeben(SPIEL.meister)) {
        setTimeout(() => UI.abzeichenToast(SPIEL.meister), 1500);
      }
    }

    UI.sperreSetzen('__ergebnis');
    UI.zeige('ergebnis-' + opt.levelId, (s) => {
      Stage.bildVersatz(0, 0);
      // eigene Flaeche, damit die Auswertung ueber jeder 3D-Kulisse lesbar bleibt
      const karte = el('div', { class: 'panel glas ergebnis', style: {
        width: 'min(660px,100%)', maxHeight: '84vh', overflowY: 'auto', gap: '14px' } },
        el('div', { style: { fontSize: '2.6em', lineHeight: 1, letterSpacing: '.06em' },
                    text: '★★★☆☆☆'.slice(3 - sterne, 6 - sterne) }),
        el('div', { class: 'note', text: noten[sterne] }),
        el('p', { class: 'hinweis', style: { margin: 0 }, text: opt.titel || '' }),
        xpInfo && xpInfo.gegeben ? el('div', { class: 'chip', text: `+${xpInfo.gegeben} XP` }) : null,
        xpInfo && xpInfo.wiederholung ? el('p', { class: 'klein', style: { margin: 0, opacity: .85 },
          text: `Wiederholung – die vollen ${xpInfo.voll} XP für diese Aufgabe hast du schon. Sterne kannst du trotzdem noch verbessern.` }) : null,
        xpInfo && !xpInfo.wiederholung && xpInfo.gegeben < xpInfo.voll ? el('p', { class: 'klein', style: { margin: 0, opacity: .85 },
          text: 'Nachschlag: Du warst besser als beim letzten Mal – die Differenz gibt es obendrauf.' }) : null,
        opt.zeilen && opt.zeilen.length ? el('div', { class: 'liste', style: { width: '100%' } },
          opt.zeilen.map(z => el('div', { class: 'zeile' }, z))) : null,
        el('div', { class: 'btn-reihe' },
          opt.nochmal ? el('button', { class: 'btn geist', onclick: () => { Audio3.klick(); opt.nochmal(); } }, '↻ Nochmal') : null,
          el('button', { class: 'btn gross', onclick: () => { Audio3.klick(); opt.weiter(); } }, 'Weiter →')),
      );
      karte.classList.add('scrollbar');
      const box = el('div', { class: 'mitte' }, karte);
      s.appendChild(box);
      if (sterne === 3) Audio3.fanfare(); else if (sterne >= 1) Audio3.richtig(); else Audio3.falsch();
      const auf = xpInfo;
      if (auf && auf.aufstieg) {
        setTimeout(() => {
          Audio3.aufstieg();
          UI.toast(`${auf.aufstieg.icon}  Aufstieg: ${auf.aufstieg.name}!`, 'gold', 4200);
        }, 1100);
      }
    });
  },
};

/* ---------- Ziehen & Ablegen (Maus + Finger) ------------------------------ */
/* ziehbarMachen(node, { daten, aufAblage(ablage,daten,quelle), radius })
   radius = Fangbereich in Pixeln um eine Ablage herum. Man muss also nicht
   punktgenau treffen – das war beim Ziehen auf die Sitzplaetze zu fummelig. */
const FANG_RADIUS = 120;

/* naechste Ablage zum Punkt, wenn direkt darunter keine liegt */
function ablageInDerNaehe(x, y, radius) {
  const r = radius == null ? FANG_RADIUS : radius;
  let beste = null, besteDist = r;
  const alle = $$('.ablage');
  // freie Ablagen zuerst – auf eine schon besetzte will man selten ziehen
  for (const durchgang of [alle.filter(a => !a.dataset.filled), alle]) {
    for (const a of durchgang) {
      const b = a.getBoundingClientRect();
      if (!b.width) continue;
      const dx = Math.max(b.left - x, 0, x - b.right);
      const dy = Math.max(b.top - y, 0, y - b.bottom);
      const d = Math.hypot(dx, dy);
      if (d < besteDist) { besteDist = d; beste = a; }
    }
    if (beste) return beste;
  }
  return null;
}

function ziehbarMachen(node, cfg) {
  node.classList.add('ziehbar');
  let geist = null, aktiveAblage = null, startX = 0, startY = 0, gestartet = false;

  const runter = (e) => {
    if (e.button != null && e.button !== 0) return;
    const p = punkt(e);
    startX = p.x; startY = p.y; gestartet = false;
    window.addEventListener('pointermove', bewegen);
    window.addEventListener('pointerup', hoch);
    window.addEventListener('pointercancel', hoch);
    e.preventDefault();
  };

  const bewegen = (e) => {
    const p = punkt(e);
    if (!gestartet) {
      if (Math.hypot(p.x - startX, p.y - startY) < 6) return;
      gestartet = true;
      const r = node.getBoundingClientRect();
      geist = node.cloneNode(true);
      geist.classList.add('faehrt');
      Object.assign(geist.style, { left: r.left + 'px', top: r.top + 'px', width: r.width + 'px', height: r.height + 'px' });
      geist.dataset.dx = (r.left - p.x); geist.dataset.dy = (r.top - p.y);
      document.body.appendChild(geist);
      node.style.opacity = '.28';
      Audio3.auf();
    }
    geist.style.left = (p.x + Number(geist.dataset.dx)) + 'px';
    geist.style.top  = (p.y + Number(geist.dataset.dy)) + 'px';
    geist.style.transform = 'scale(1.06) rotate(1.5deg)';

    const unten = document.elementFromPoint(p.x, p.y);
    let ziel = unten && unten.closest ? unten.closest('.ablage') : null;
    if (!ziel) ziel = ablageInDerNaehe(p.x, p.y, cfg.radius);
    if (ziel !== aktiveAblage) {
      if (aktiveAblage) aktiveAblage.classList.remove('aktiv');
      aktiveAblage = ziel;
      if (aktiveAblage) { aktiveAblage.classList.add('aktiv'); Audio3.treffer(); }
    }
  };

  const hoch = (e) => {
    window.removeEventListener('pointermove', bewegen);
    window.removeEventListener('pointerup', hoch);
    window.removeEventListener('pointercancel', hoch);
    node.style.opacity = '';
    if (geist) { geist.remove(); geist = null; }
    if (aktiveAblage) aktiveAblage.classList.remove('aktiv');
    if (gestartet && aktiveAblage && cfg.aufAblage) cfg.aufAblage(aktiveAblage, cfg.daten, node);
    else if (gestartet) Audio3.zu();
    aktiveAblage = null; gestartet = false;
  };

  const punkt = (e) => ({ x: e.clientX, y: e.clientY });
  node.addEventListener('pointerdown', runter);
  return () => node.removeEventListener('pointerdown', runter);
}

/* ---------- Wiederverwendbarer Frage-Baustein ----------------------------- */
/* opt: { frage, antworten[], richtig, erklaerung, zitat, zweispaltig, danach(warRichtig) } */
function frageBauen(opt) {
  const box = el('div', { class: 'mitte', style: { gap: '18px' } });
  box.appendChild(el('div', { class: 'frage', text: opt.frage }));
  let beantwortet = false;

  const feld = el('div', { class: 'antworten' + (opt.zweispaltig ? ' zwei' : '') });
  const buchstaben = 'ABCD';
  opt.antworten.forEach((a, i) => {
    const b = el('button', { class: 'antwort' },
      el('span', { class: 'marker', text: buchstaben[i] }),
      el('span', { text: a }));
    b.addEventListener('click', () => {
      if (beantwortet) return;
      beantwortet = true;
      const gut = i === opt.richtig;
      $$('.antwort', feld).forEach((x, j) => {
        if (j === opt.richtig) x.classList.add('richtig');
        else if (j === i) x.classList.add('falsch');
        else x.classList.add('aus');
      });
      gut ? Audio3.richtig() : Audio3.falsch();
      if (!gut) b.classList.add('wackeln');
      const fb = UI.feedback(gut, gut ? 'Richtig!' : 'Knapp daneben.', opt.erklaerung, opt.zitat);
      box.appendChild(fb);
      const w = el('button', { class: 'btn gross', onclick: () => { Audio3.klick(); opt.danach(gut); } }, 'Weiter →');
      box.appendChild(w);
      setTimeout(() => w.scrollIntoView({ block: 'nearest', behavior: 'smooth' }), 60);
    });
    feld.appendChild(b);
  });
  box.appendChild(feld);
  return box;
}

/* Reihe von Fragen nacheinander abarbeiten */
function frageReihe(screen, fragen, fertig, kopfBauer) {
  let i = 0, richtig = 0;
  const naechste = () => {
    screen.innerHTML = '';
    if (kopfBauer) screen.appendChild(kopfBauer(i, fragen.length));
    if (i >= fragen.length) return fertig(richtig, fragen.length);
    const f = fragen[i];
    screen.appendChild(frageBauen(Object.assign({}, f, {
      danach: (gut) => { if (gut) richtig++; i++; naechste(); },
    })));
  };
  naechste();
}

/* ---------- Seitenlayout: 3D links, Bedienfeld rechts (breit) ------------- */
/* Auf schmalen Schirmen wandert das Bedienfeld nach unten. Gibt den Container
   zurueck und setzt den passenden Bildversatz der 3D-Buehne.                */
const BREIT = () => innerWidth >= 1000;

function seitenLayout(screen, panelInhalt, opt) {
  const o = opt || {};
  const breit = BREIT();
  Stage.bildVersatz(breit ? (o.obenBreit || 0) : (o.obenSchmal == null ? .30 : o.obenSchmal),
                    breit ? (o.rechtsBreit == null ? .18 : o.rechtsBreit) : 0);

  const panel = el('div', {
    class: 'panel glas',
    style: breit
      ? { width: 'min(430px,38vw)', maxHeight: '86vh', overflowY: 'auto',
          display: 'flex', flexDirection: 'column', gap: '14px', alignItems: 'center', textAlign: 'center' }
      : { width: '100%', maxHeight: '58vh', overflowY: 'auto',
          display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center', textAlign: 'center' },
  }, panelInhalt);
  panel.classList.add('scrollbar');

  const huelle = el('div', {
    style: breit
      ? { flex: '1', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', minHeight: 0 }
      : { flex: '1', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', minHeight: 0 },
  }, panel);

  screen.appendChild(huelle);
  return panel;
}

/* ---------- Hotspots: HTML-Elemente kleben an 3D-Positionen --------------- */
/* So lassen sich Sitzplaetze im Fahrzeug direkt antippen und bespielen.     */
const HotSpots = {
  liste: [], schicht: null, updateFn: null,

  starten(screen) {
    this.beenden();
    // fixed, damit der Ursprung der Ebene dem Viewport entspricht – sonst
    // verschieben Kopfzeile und Innenabstand die projizierten Positionen
    this.schicht = el('div', { style: { position: 'fixed', inset: '0', pointerEvents: 'none', zIndex: '6' } });
    screen.appendChild(this.schicht);
    const v = new THREE.Vector3();
    this.updateFn = Stage.anmelden(() => {
      if (!this.liste.length || !this.schicht) return;
      // Die Ebene haengt im Bildschirm, und der hat waehrend seiner Einblend-
      // animation einen transform. Damit ist "fixed" nicht mehr am Fenster
      // ausgerichtet, sondern an ihm. Deshalb den Ursprung jedes Bild neu
      // messen, statt Fensterkoordinaten anzunehmen.
      const u = this.schicht.getBoundingClientRect();
      for (const hs of this.liste) {
        const p = Stage.nachBildschirm(hs.welt, v);
        const sichtbar = p.z < 1;
        hs.node.style.transform =
          `translate(-50%,-50%) translate(${p.x - u.left}px,${p.y - u.top}px)`;
        hs.node.style.opacity = sichtbar ? '1' : '0';
        hs.node.style.pointerEvents = sichtbar ? 'auto' : 'none';
      }
    });
    return this.schicht;
  },

  hinzu(weltPos, node) {
    node.style.position = 'fixed';
    node.style.left = '0'; node.style.top = '0';
    node.style.pointerEvents = 'auto';
    // Der Punkt wird jedes Bild neu gesetzt – eine CSS-Ueberblendung auf
    // transform wuerde ihn dauerhaft hinter der 3D-Position herhinken lassen.
    node.style.transition = 'background .16s, border-color .16s, opacity .2s';
    this.schicht.appendChild(node);
    const hs = { welt: weltPos.clone ? weltPos.clone() : new THREE.Vector3(weltPos[0], weltPos[1], weltPos[2]), node };
    this.liste.push(hs);
    return hs;
  },

  beenden() {
    if (this.updateFn) { Stage.abmelden(this.updateFn); this.updateFn = null; }
    if (this.schicht) this.schicht.remove();
    this.schicht = null;
    this.liste.length = 0;
  },
};

/* ---------- Motiv einpassen ------------------------------------------------
   Setzt die Kamera so, dass eine Menge von Weltpunkten vollstaendig in der
   freien Bildflaeche liegt – auf dem Handy genauso wie am Beamer. Damit muss
   keine Kameraposition mehr von Hand geraten werden.
   punkte: [[x,y,z]] oder Vector3
   opt: { hoch, weit } Blickwinkel, { anteil } Fuellgrad, { rand } Luft ums Motiv
   -------------------------------------------------------------------------*/
function motivEinpassen(punkte, panel, opt) {
  const o = opt || {};
  const box = new THREE.Box3();
  punkte.forEach(p => box.expandByPoint(
    p && p.isVector3 ? p : new THREE.Vector3(p[0], p[1] || 0, p[2])));
  if (box.isEmpty()) return;
  box.expandByScalar(o.rand == null ? 1.4 : o.rand);
  const mitte = box.getCenter(new THREE.Vector3());
  const d = Math.max(o.mindest || 10, box.getSize(new THREE.Vector3()).length());
  const ecken = [];
  for (const x of [box.min.x, box.max.x])
    for (const y of [box.min.y, box.max.y])
      for (const z of [box.min.z, box.max.z]) ecken.push(new THREE.Vector3(x, y, z));
  const hoch = o.hoch == null ? .62 : o.hoch;
  const weit = o.weit == null ? .80 : o.weit;
  // Blickrichtung frei waehlbar: manche Motive liest man nur in einer
  // bestimmten Ausrichtung (z. B. Fahrzeug links, Mannschaft rechts).
  const r = o.richtung
    ? new THREE.Vector3(o.richtung[0], o.richtung[1], o.richtung[2]).normalize()
    : new THREE.Vector3(0, hoch, weit).normalize();
  Stage.kameraZiel = null;
  Stage.kameraSetzen([mitte.x + r.x * d, mitte.y + r.y * d, mitte.z + r.z * d],
                     [mitte.x, mitte.y, mitte.z], o.oben);
  // Auf dem Handy bleibt ueber dem Bedienfeld nur ein schmaler Streifen.
  // Lieber klein und sichtbar als gross und hinter dem Panel – ausgewichen
  // wird nur, wenn wirklich keine brauchbare Flaeche uebrig bleibt (das
  // passiert, wenn der Bildschirm schon abgeraeumt ist).
  const rand = { unten: o.panelUnten, obenNode: o.obenNode };
  const frei = freieFlaeche(panel, o.randPx == null ? 28 : o.randPx, o.anteil || .86, rand);
  Stage.einpassen(ecken, (frei.w < 120 || frei.h < 80) ? freieFlaeche(null, 28, .86, rand) : frei);
}

/* Dasselbe, aber laufend nachgefuehrt: Fenstergroesse und Bedienfeld aendern
   sich noch, nachdem der Bildschirm gebaut wurde. Gibt die Abmeldefunktion
   zurueck. Waehrend einer Kamerafahrt haelt sich die Wache heraus.

   opt.sofort bricht eine laufende Fahrt ab und passt einmal direkt ein. Das
   braucht jeder Bildschirm, der auf einen Einstieg mit Kamerafahrt folgt:
   Sonst wartet die Wache das Ende der Fahrt ab und die Kamera springt
   mittendrin um.                                                            */
function motivWache(punkte, panel, opt) {
  let letzte = '';
  if (opt && opt.sofort) motivEinpassen(punkte, panel, opt);
  const fn = Stage.anmelden(() => {
    if (Stage.kameraZiel) return;          // laufende Kamerafahrt nicht stoeren
    // Bildschirm schon abgeraeumt? Dann hat diese Wache hier nichts mehr zu
    // suchen – sonst zieht sie dem naechsten Bildschirm die Kamera weg.
    if (panel && !panel.isConnected) return;
    const r = panel ? panel.getBoundingClientRect() : { left: 0, top: 0, width: 0 };
    const k = [innerWidth, innerHeight, Math.round(r.left), Math.round(r.top), Math.round(r.width)].join(',');
    if (k !== letzte) { letzte = k; motivEinpassen(punkte, panel, opt); }
  });
  return () => Stage.abmelden(fn);
}

/* freie Bildflaeche neben bzw. ueber dem Bedienfeld – Ziel fuer Stage.einpassen
   opt.unten:    Bedienfeld liegt unter der Buehne, auch auf breiten Schirmen.
                 Ohne das entscheidet die Bildschirmbreite, und ein unten
                 liegendes Antwortfeld wuerde auf dem Beamer als „rechts"
                 gelesen – dann sitzt das Motiv links daneben statt darueber.
   opt.obenNode: Element, das oben ueber der Buehne liegt (Auftragskarte).
                 Seine Unterkante wird zur Oberkante der freien Flaeche.     */
function freieFlaeche(panelNode, rand, anteil, opt) {
  const o = opt || {};
  const r = rand == null ? 26 : rand;
  const hud = $('#hud');
  let oben = (hud && !hud.hidden ? hud.getBoundingClientRect().height : 0) + r;
  if (o.obenNode && o.obenNode.isConnected) {
    oben = Math.max(oben, o.obenNode.getBoundingClientRect().bottom + r);
  }
  let f;
  if (!panelNode) f = { x: r, y: oben, w: innerWidth - 2 * r, h: innerHeight - oben - r };
  else {
    const p = panelNode.getBoundingClientRect();
    f = (BREIT() && !o.unten)
      ? { x: r, y: oben, w: Math.max(120, p.left - 2 * r), h: Math.max(120, innerHeight - oben - r) }
      : { x: r, y: oben, w: innerWidth - 2 * r, h: Math.max(120, p.top - oben - r) };
  }
  // Anteil < 1 laesst Luft rundherum, damit das Motiv nicht am Rand klebt
  const a = anteil == null ? 1 : anteil;
  if (a < 1) {
    const nw = f.w * a, nh = f.h * a;
    f = { x: f.x + (f.w - nw) / 2, y: f.y + (f.h - nh) / 2, w: nw, h: nh };
  }
  return f;
}
