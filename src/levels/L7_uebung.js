/* ============================================================================
   Level 7 – Die Übung: Wiesenbrand
   Kein Innenangriff, kein Atemschutz – dafür der komplette Aufbau der
   Wasserversorgung und zwei Rohre. Hier bekommt auch der Wassertrupp einen
   eigenen Befehl und wiederholt ihn.
   Grundlagen: FwDV 3, Nr. 5.2.1, 5.3, 5.5.1 und 5.5.6.
   ========================================================================== */

/* Feste Punkte des Übungsplatzes. Alles so gelegt, dass keine Leitung und
   kein Trupp durch das Fahrzeug läuft und der Wassertrupp sichtbar bleibt. */
const UO = {
  fahrzeug:  [-9.5, 0, 4.0],
  fzgVorn:   [-13.3, 0, 4.0],     // Front und Heck als Bildpunkte, damit das
  fzgHeck:   [-5.8, 0, 4.0],      // Fahrzeug nie halb aus dem Bild ragt
  heck:      [-5.9, .5, 4.0],     // Abgang am Fahrzeugheck – dort wird gekuppelt
  hydrant:   [-17.0, 0, 6.6],
  verteiler: [0, 0, 0],
  // Zwei Brandabschnitte nebeneinander – links und rechts, wie im Befehl.
  // Beide liegen auf der Wiese, nicht auf dem Feldweg.
  rohr1:     [3.6, 0, -6.4],
  rohr2:     [10.8, 0, -3.2],
  // Nullpunkt der Antreteordnung: Von hier aus stehen Maschinist und Melder
  // am Fahrzeug, rechts daneben Angriffs-, Wasser- und Schlauchtrupp.
  antreten:  [-9.4, 0, 1.4],
  gasse:     7.2,                 // Laufweg hinter dem Fahrzeug, frei von Hindernissen
};

LEVELS.push({
  id: 'uebung',
  name: 'Die Übung',
  icon: '💧',
  farbe: 'var(--gruen)',
  kurz: 'Wiesenbrand, zwei Rohre. Wasserversorgung aufbauen, Schlauchreserve legen, Befehle wiederholen.',

  start(api) {
    let punkte = 0, fehler = 0, schrittNr = 0;
    const protokoll = [];

    /* ===== Kulisse ======================================================== */
    Stage.leeren();
    Bewegung.alleWeg();
    Stage.welt.add(baueBoden(120));
    const wiese = baueWiese(44, 34);
    wiese.position.set(8, 0, -2);
    Stage.welt.add(wiese);
    const weg = baueFeldweg(60, 4.2);
    weg.position.set(-6, 0, 5.6);
    Stage.welt.add(weg);

    Stage.welt.add(new THREE.AmbientLight(0x8ea6c8, .5));
    Stage.welt.add(bei(new THREE.DirectionalLight(0xbcd0f0, 1.1), -8, 12, 14));
    Stage.welt.add(bei(new THREE.SpotLight(0xffffff, 260, 60, 1.15, .6, 2), -4, 22, 10));

    for (const [x, z] of [[-2, -13], [16, -12], [-20, -6]]) {
      const b = baueBaum(); b.position.set(x, 0, z); b.scale.setScalar(rnd(1.0, 1.5));
      Stage.welt.add(b);
    }

    const hydrant = baueHydrant();
    hydrant.position.set(UO.hydrant[0], 0, UO.hydrant[2]);
    Stage.welt.add(hydrant);
    const hydrantSchild = textSchild('Unterflurhydrant', { gross: 34, skala: .9, rand: '#35c8ff' });
    hydrantSchild.position.set(UO.hydrant[0], 2.2, UO.hydrant[2]);
    Stage.welt.add(hydrantSchild);

    const verteiler = baueVerteiler();
    verteiler.position.set(UO.verteiler[0], 0, UO.verteiler[2]);
    // Abgaenge zeigen zu den Brandabschnitten, der B-Eingang zum Fahrzeug
    const zumBrand = [(UO.rohr1[0] + UO.rohr2[0]) / 2 - UO.verteiler[0],
                      (UO.rohr1[2] + UO.rohr2[2]) / 2 - UO.verteiler[2]];
    verteiler.rotation.y = Math.atan2(zumBrand[0], zumBrand[1]);
    verteiler.visible = false;
    Stage.welt.add(verteiler);
    // Weltposition einer Verteilermuendung (0 = links, 1 = Mitte, 2 = rechts)
    const abgangWelt = (i) => verteiler.localToWorld(verteiler.userData.abgang(i));
    // und die des B-Eingangs hinten. Dort endet die Leitung vom Fahrzeug –
    // mittig und in Kupplungshoehe, nicht irgendwo neben dem Verteiler.
    const eingangWelt = () => verteiler.localToWorld(verteiler.userData.eingang());
    const alsPunkt = (v) => [v.x, v.y, v.z];

    const feuer1 = baueFeuer({ anzahl: 46, breite: 2.6, hoehe: 1.9 });
    feuer1.position.set(UO.rohr1[0] + 1.5, 0, UO.rohr1[2] - 1.8);
    Stage.welt.add(feuer1);
    const feuer2 = baueFeuer({ anzahl: 40, breite: 2.2, hoehe: 1.6 });
    feuer2.position.set(UO.rohr2[0] + 1.5, 0, UO.rohr2[2] - 1.6);
    Stage.welt.add(feuer2);

    // Beschriftung der Abschnitte – der Befehl nennt sie beim Namen
    const abschnitt1 = textSchild('linker Brandabschnitt', { gross: 40, skala: 1.5, rand: '#ff8c42' });
    abschnitt1.position.set(UO.rohr1[0] + 1.5, 3.4, UO.rohr1[2] - 1.8);
    Stage.welt.add(abschnitt1);
    const abschnitt2 = textSchild('rechter Brandabschnitt', { gross: 40, skala: 1.5, rand: '#ff8c42' });
    abschnitt2.position.set(UO.rohr2[0] + 1.5, 3.2, UO.rohr2[2] - 1.6);
    Stage.welt.add(abschnitt2);

    const strahl1 = baueWasserstrahl(); Stage.welt.add(strahl1);
    const strahl2 = baueWasserstrahl(); Stage.welt.add(strahl2);

    const fzg = baueFahrzeug('lf');
    fzg.position.set(UO.fahrzeug[0], 0, UO.fahrzeug[2]);
    fzg.rotation.y = Math.PI / 2;          // Heck zeigt zur Einsatzstelle
    fzg.userData.blaulichtAn = true;
    Stage.welt.add(fzg);

    const marken = [], figuren = [], nachRolle = {};
    let reserve = null;
    const schlaeuche = {};

    /* Die Gruppe steht angetreten wie in Aufgabe 4: Maschinist und Melder am
       Fahrzeug, rechts daneben Angriffs-, Wasser- und Schlauchtrupp, der
       Gruppenführer gegenüber dem Angriffstrupp.                            */
    const aufstellung = antretenStellen('gruppe', UO.antreten, 0, (soll) => figurFuerRolle(soll));
    aufstellung.figuren.forEach(f => { Stage.welt.add(f); figuren.push(f); });
    Object.assign(nachRolle, aufstellung.nachRolle);
    // Bildpunkte der Aufstellung – damit die Mannschaft im Bild bleibt,
    // solange sie noch angetreten steht
    const ANTRETEN_PUNKTE = aufstellung.figuren.map(f => [f.position.x, 1.7, f.position.z]);

    Stage.anmelden((dt, t) => {
      belebeFiguren(figuren, dt, t);
      feuer1.userData.update(dt, t);
      feuer2.userData.update(dt, t);
      strahl1.userData.update(dt, t);
      strahl2.userData.update(dt, t);
      markenUpdate(marken, dt, t);
      blaulichtUpdate(fzg, dt, t);
    });

    const trupp = (id) => id === 'A' ? [nachRolle.ATF, nachRolle.ATM]
                        : id === 'W' ? [nachRolle.WTF, nachRolle.WTM]
                        : id === 'S' ? [nachRolle.STF, nachRolle.STM] : [];

    /* Laufweg, der hinter dem Fahrzeug entlangführt statt hindurch. */
    const wegNach = (von, ziel) => {
      const stationen = [];
      const kreuztFahrzeug = (von.x < -5.5) !== (ziel[0] < -5.5);
      if (kreuztFahrzeug) stationen.push([von.x, UO.gasse], [ziel[0], UO.gasse]);
      stationen.push([ziel[0], ziel[1]]);
      return stationen;
    };
    const truppLaufen = (id, ziele, danach) => {
      const figs = trupp(id).filter(Boolean);
      truppWeg(figs, figs.map((f, i) => wegNach(f.position, ziele[i] || ziele[0])), 2.7, danach);
    };
    const einzelLaufen = (rolle, ziel, danach) => {
      const f = nachRolle[rolle];
      if (!f) return danach && danach();
      figurWeg(f, wegNach(f.position, ziel), 2.7, danach);
    };

    const schlauchLegen = (schluessel, punkteListe, art, dauer, danach) => {
      const w = wachsenderSchlauch(Stage.welt, punkteListe, art);
      schlaeuche[schluessel] = w;
      Bewegung.neu(dauer, (p) => w.setzen(p), danach, false);
    };

    /* ===== Bildausschnitt: Vogelperspektive auf das, was gerade zählt =====
       Steilerer Winkel als sonst – man soll die Wege sehen, die Figuren aber
       noch erkennen.                                                        */
    const VOGEL = { hoch: .78, weit: .58 };
    const blickAuf = (punkte, panel, anteil) =>
      motivEinpassen(punkte, panel, Object.assign({ anteil: anteil || .86 }, VOGEL));
    const blickWache = (punkte, panel, anteil) =>
      motivWache(punkte, panel, Object.assign({ anteil: anteil || .86 }, VOGEL));

    /* ===== Bausteine für Bildschirme ===================================== */
    const lageKarte = (text) => el('div', {
      class: 'panel', style: { width: '100%', padding: '14px', textAlign: 'left', lineHeight: 1.35,
                               borderLeft: '4px solid var(--glut)', fontSize: '.98em' },
    }, el('div', { class: 'klein', style: { marginBottom: '.25em' }, text: '📻 Lage' }), el('span', { text }));

    /* Erzählschritt mit Kommando und Animation */
    const ablauf = (opt) => {
      UI.zeige('l7-' + (schrittNr++), (s) => {
        const weiter = el('button', {
          class: 'btn gross', style: { opacity: '0', pointerEvents: 'none', transition: 'opacity .3s' },
          onclick: () => { Audio3.klick(); opt.danach(); },
        }, opt.knopf || 'Weiter →');
        const panel = seitenLayout(s, [
          el('div', { class: 'klein', text: opt.titel }),
          opt.kommando ? el('div', {
            class: 'kennzahl',
            style: { fontSize: 'clamp(1.1rem,2.8vw,1.6rem)', color: 'var(--gelb)', lineHeight: 1.25 },
            text: '„' + opt.kommando + '"',
          }) : null,
          opt.wer ? el('div', { class: 'chip', text: opt.wer }) : null,
          el('p', { class: 'hinweis', style: { margin: 0 }, text: opt.text }),
          opt.zitat ? UI.zitat(opt.zitat) : null,
          opt.merke ? el('div', { class: 'feedback', style: { width: '100%' } },
            el('b', { text: opt.merke[0] }), el('span', { text: opt.merke[1] })) : null,
          weiter,
        ], { obenBreit: 0, obenSchmal: 0, rechtsBreit: 0 });
        const stop = blickWache(opt.blick || [UO.fzgVorn, UO.fzgHeck, UO.verteiler, UO.rohr1], panel, opt.anteil);
        if (opt.kommando) Audio3.kommando(opt.kommando);
        if (opt.tun) opt.tun();
        setTimeout(() => { weiter.style.opacity = '1'; weiter.style.pointerEvents = 'auto'; },
          (opt.dauer || 2.2) * 1000);
        return stop;
      });
    };

    /* Entscheidung mit Begründung */
    const entscheidung = (opt) => {
      UI.zeige('l7-' + (schrittNr++), (s) => {
        const rueck = el('div', { style: { width: '100%' } });
        let erledigt = false;
        const knoepfe = el('div', { style: { display: 'grid', gap: '8px', width: '100%' } },
          opt.optionen.map((o, i) => el('button', {
            class: 'antwort', style: { fontSize: '.95em' },
            onclick: (e) => waehlen(o, i, e.currentTarget),
          }, el('span', { class: 'marker', text: 'ABCD'[i] }), el('span', { text: o.t }))));

        const waehlen = (o, i) => {
          if (erledigt) return;
          erledigt = true;
          $$('.antwort', knoepfe).forEach((b, j) => {
            if (opt.optionen[j].gut) b.classList.add('richtig');
            else if (j === i) b.classList.add('falsch');
            else b.classList.add('aus');
            b.style.pointerEvents = 'none';
          });
          const gut = !!o.gut;
          if (gut) { punkte += 10; Audio3.richtig(); } else { fehler++; Audio3.falsch(); }
          protokoll.push({ titel: opt.titel, gut });
          const richtige = opt.optionen.find(x => x.gut);
          rueck.appendChild(UI.feedback(gut, gut ? 'Richtig.' : 'Nicht ganz.',
            gut ? o.warum : richtige.warum, (gut ? o : richtige).zitat));
          rueck.appendChild(el('button', { class: 'btn gross', style: { marginTop: '10px' },
            onclick: () => { Audio3.klick(); opt.danach(gut); } }, 'Weiter →'));
        };

        const panel = seitenLayout(s, [
          el('div', { class: 'klein', text: opt.titel }),
          opt.lage ? lageKarte(opt.lage) : null,
          el('div', { class: 'frage', style: { fontSize: '1.06em' }, text: opt.frage }),
          knoepfe, rueck,
        ], { obenBreit: 0, obenSchmal: 0, rechtsBreit: 0 });
        return blickWache(opt.blick || [UO.fzgVorn, UO.fzgHeck, UO.verteiler, UO.rohr1], panel, opt.anteil);
      });
    };

    /* ===================================================================== */
    /* 1. Lage                                                               */
    /* ===================================================================== */
    const intro = () => {
      UI.zeige('l7-intro', (s) => {
        const panel = seitenLayout(s, [
          el('div', { class: 'dienstvorschrift', text: 'Level 7 · Übung' }),
          el('h3', { text: 'Wiesenbrand am Ortsrand' }),
          lageKarte('Auf der Wiese hinter dem Feldweg brennt trockenes Gras – in zwei Abschnitten nebeneinander. Niemand ist in Gefahr, kein Gebäude betroffen. Ihr rückt als Gruppe mit dem LF aus.'),
          el('div', { class: 'feedback', style: { width: '100%' } },
            el('b', { text: 'Warum diese Übung?' }),
            el('span', { text: 'Kein Innenangriff, kein Atemschutz – dafür der komplette Aufbau: Verteiler, B-Leitung, Hydrant, zwei C-Rohre. Und weil der Wassertrupp hier nicht als Sicherheitstrupp gebunden ist, bekommt er das zweite Rohr und wiederholt seinen Befehl selbst.' })),
          // Die beiden Wörter kommen gleich in jedem zweiten Satz vor. Verteiler
          // und C-Leitung bekommen später ihre eigene Runde – dort stehen sie
          // dann im Bild, und das erklärt mehr als jeder Satz hier.
          begriffeKarte(['rohr', 'bleitung'], { titel: '📖 Die Wörter dazu' }),
          el('button', { class: 'btn gross gruen', onclick: () => { Audio3.klick(); Audio3.martinshorn(1); befehl1(); } }, 'Absitzen →'),
        ], { obenBreit: 0, obenSchmal: 0, rechtsBreit: 0 });
        return blickWache([UO.fzgVorn, UO.fzgHeck, UO.rohr1, UO.rohr2, UO.hydrant]
          .concat(ANTRETEN_PUNKTE), panel, .84);
      });
    };

    /* ===================================================================== */
    /* 2. Von oben: wer geht wohin?                                          */
    /* ===================================================================== */
    const PLAETZE = [
      { id: 'pumpe', pos: [-6.6, .1, 5.2], soll: 'MA', name: 'An der Pumpe',
        tipp: 'Hier wird die Feuerlöschkreiselpumpe bedient. Wer bleibt da?' },
      { id: 'vert',  pos: [ .0, .1, -.2],  soll: 'A',  name: 'Am Verteiler',
        tipp: 'Wer setzt den Verteiler und legt sich seine C-Schläuche dort bereit?' },
      { id: 'b',     pos: [-3.2, .1, 2.2], soll: 'W',  name: 'Fahrzeug → Verteiler',
        tipp: 'Wer verlegt die B-Leitung und stellt danach die Verbindung zum Hydranten her?' },
      { id: 'c',     pos: [ 3.4, .1, -2.4],soll: 'S',  name: 'Verteiler → Strahlrohr',
        tipp: 'Wer verlegt ab dem Verteiler und bedient ihn danach?' },
      { id: 'ef',    pos: [-2.4, .1, 5.6], soll: 'ME', name: 'Beim Einheitsführer',
        tipp: 'Wer arbeitet auf Befehl – Lagefeststellung, Leiter, Verteiler bedienen?' },
    ];

    const plan = {};          // Platz -> Funktion, wird beim Befehl ausgeführt

    const zuordnung = () => {
      const gesetzt = {};
      let eigeneFehler = 0;

      UI.zeige('l7-zuordnung', (s) => {
        const schicht = HotSpots.starten(s);

        PLAETZE.forEach(p => {
          const marke = bodenMarke(0xffd23f, .9);
          marke.position.set(p.pos[0], 0, p.pos[2]);
          Stage.welt.add(marke); marken.push(marke);
          p._marke = marke;

          const node = el('div', {
            class: 'ablage', 'data-platz': p.id,
            style: { minWidth: '112px', padding: '8px 10px', borderRadius: '14px',
                     border: '2px dashed rgba(255,255,255,.55)', background: 'rgba(10,16,30,.7)',
                     textAlign: 'center', fontWeight: '800', fontSize: '.8em', lineHeight: 1.2,
                     backdropFilter: 'blur(3px)', color: 'var(--txt2)' },
          }, p.name);
          // am Boden verankern und das Schild per Bildschirmversatz darueber
          // legen – so klebt es exakt auf seiner Markierung
          node.style.marginTop = '-34px';
          HotSpots.hinzu(new THREE.Vector3(p.pos[0], .12, p.pos[2]), node);
          p._node = node;
        });

        const chips = el('div', { style: { display: 'flex', gap: '7px', flexWrap: 'wrap', justifyContent: 'center' } });
        const CHIPS = [
          { id: 'MA', name: 'Maschinist',    farbe: '#b9c4dd' },
          { id: 'ME', name: 'Melder',        farbe: '#c98bff' },
          { id: 'A',  name: 'Angriffstrupp', farbe: '#ff4d3d' },
          { id: 'W',  name: 'Wassertrupp',   farbe: '#35c8ff' },
          { id: 'S',  name: 'Schlauchtrupp', farbe: '#3ddc84' },
        ];
        shuffle(CHIPS).forEach(c => {
          const chip = el('div', {
            class: 'panel',
            style: { padding: '8px 13px', fontWeight: '800', fontSize: '.88em', cursor: 'grab',
                     borderColor: c.farbe + '88', display: 'flex', alignItems: 'center', gap: '.4em' },
          }, el('span', { style: { width: '10px', height: '10px', borderRadius: '3px', background: c.farbe } }),
             el('span', { text: c.name }));
          ziehbarMachen(chip, {
            daten: c, radius: 180,
            aufAblage: (feld, daten, quelle) => {
              const pid = feld.dataset.platz;
              if (!pid || feld.dataset.filled) return;
              const platz = PLAETZE.find(x => x.id === pid);
              if (platz.soll !== daten.id) {
                eigeneFehler++; fehler++;
                Audio3.falsch();
                feld.classList.add('wackeln');
                setTimeout(() => feld.classList.remove('wackeln'), 500);
                UI.toast(platz.tipp, 'schlecht', 3000);
                return;
              }
              feld.dataset.filled = daten.id;
              feld.style.border = '2px solid ' + daten.farbe;
              feld.style.background = daten.farbe + '33';
              feld.style.color = '#fff';
              feld.innerHTML = '';
              feld.appendChild(el('b', { text: daten.name }));
              feld.appendChild(el('div', { class: 'klein', style: { color: 'rgba(255,255,255,.75)' }, text: platz.name }));
              quelle.remove();
              Audio3.richtig();
              gesetzt[pid] = daten.id;
              plan[pid] = daten.id;
              if (platz._marke) {
                platz._marke.userData.ring.material.color.set(daten.farbe);
                platz._marke.userData.fuell.material.color.set(daten.farbe);
              }
              if (Object.keys(gesetzt).length === PLAETZE.length) {
                punkte += 20;
                Audio3.fanfare();
                setTimeout(() => zuordnungFertig(eigeneFehler), 1100);
              }
            },
          });
          chips.appendChild(chip);
        });

        const panel = seitenLayout(s, [
          el('div', { class: 'klein', text: 'Schritt 1 von 5' }),
          el('h3', { text: 'Wer geht wohin?' }),
          el('p', { class: 'klein', style: { margin: 0 },
            text: 'Der Befehl ist raus – jetzt setzt sich die Gruppe in Bewegung. Du siehst die Einsatzstelle von oben: Zieh jede Funktion auf den Platz, an den sie jetzt gehört.' }),
          chips,
        ], { obenBreit: 0, obenSchmal: 0, rechtsBreit: 0 });
        s.appendChild(schicht);
        const stop = blickWache(PLAETZE.map(p => p.pos)
          .concat([UO.fzgVorn, UO.fzgHeck, UO.rohr1], ANTRETEN_PUNKTE), panel, .82);
        return () => { stop(); };
      });
    };

    const hinschicken = (platz, wer) => {
      const ziel = [platz.pos[0], platz.pos[2]];
      if (wer === 'MA' || wer === 'ME') einzelLaufen(wer, ziel);
      else truppLaufen(wer, [[ziel[0] - .5, ziel[1] + .3], [ziel[0] + .5, ziel[1] - .3]]);
    };

    const zuordnungFertig = (eigeneFehler) => {
      HotSpots.beenden();
      // Jetzt laufen sie los – der Befehl ist ja schon gegeben
      PLAETZE.forEach(p => { if (plan[p.id]) hinschicken(p, plan[p.id]); });
      marken.forEach(m => Stage.welt.remove(m)); marken.length = 0;
      setTimeout(() => { verteiler.visible = true; Audio3.treffer(); }, 2600);
      ablauf({
        titel: 'Die Gruppe arbeitet',
        text: eigeneFehler === 0
          ? 'Ohne einen einzigen Fehlgriff. Genau so ist die FwDV 3 gedacht: Jede Funktion weiß von sich aus, wo ihr Platz ist – der Einheitsführer muss das nicht einzeln befehlen. Er hat einen Befehl gegeben, und alle neun wissen, was zu tun ist.'
          : 'Jetzt steht jeder da, wo er hingehört. Der Sinn dahinter: Jede Funktion kennt ihren Platz, ohne dass der Einheitsführer es einzeln befehlen muss – ein Befehl genügt für die ganze Gruppe.',
        zitat: 'Der Maschinist ist Fahrer und bedient die Feuerlöschkreiselpumpe. Der Angriffstrupp setzt den Verteiler. Der Wassertrupp stellt die Wasserversorgung vom Löschfahrzeug zum Verteiler her. Der Schlauchtrupp stellt für vorgehende Trupps die Wasserversorgung zwischen Strahlrohr und Verteiler her.',
        dauer: 3.4,
        blick: PLAETZE.map(p => p.pos).concat([UO.fzgVorn, UO.fzgHeck]),
        danach: reihenfolge,
      });
    };

    /* ===================================================================== */
    /* 3. Der Befehl für das erste Rohr                                      */
    /* ===================================================================== */
    const befehl1 = () => {
      ablauf({
        titel: 'Dein Befehl – Einsatz ohne Bereitstellung',
        kommando: 'Wasserentnahmestelle Unterflurhydrant. Verteiler am Feldweg. Angriffstrupp zur Brandbekämpfung mit 1. Rohr zum linken Brandabschnitt über den Feldweg. Vor!',
        wer: 'Du als Gruppenführer',
        text: 'Der Angriffstruppführer wiederholt ab „Einheit". Jetzt weiß die ganze Gruppe Bescheid – und jeder geht ohne weiteres Zutun auf seinen Platz. Weißt du, wo das ist?',
        dauer: 6.5,
        knopf: 'Absitzen und aufbauen →',
        blick: [UO.fzgVorn, UO.fzgHeck, UO.verteiler, UO.rohr1].concat(ANTRETEN_PUNKTE),
        danach: zuordnung,
      });
    };

    /* ===================================================================== */
    /* 4. Reihenfolge der Wasserversorgung                                   */
    /* ===================================================================== */
    const reihenfolge = () => {
      const SCHRITTE = [
        { id: 'vert', t: 'Vom Löschfahrzeug zum Verteiler', ic: '🔱',
          note: 'Zuerst. Der Tank im Fahrzeug reicht für den Anfang – so kommt sofort Wasser an den Verteiler.' },
        { id: 'hyd',  t: 'Vom Löschfahrzeug zum Hydranten', ic: '🚰',
          note: 'Danach. Jetzt wird nachgespeist, damit der Tank nicht leer läuft.' },
      ];
      let pos = 0;

      UI.zeige('l7-reihenfolge', (s) => {
        const rueck = el('div', { class: 'klein', style: { minHeight: '2.6em' },
          text: 'Womit fängt der Wassertrupp an?' });
        const liste = el('div', { style: { display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' } });
        const gemischt = shuffle(SCHRITTE.slice());

        const karten = gemischt.map(k => el('button', {
          class: 'antwort', style: { fontSize: '.95em' },
          onclick: (e) => tippen(k, e.currentTarget),
        }, el('span', { class: 'marker', text: k.ic }), el('span', { text: k.t })));
        karten.forEach(k => liste.appendChild(k));

        const tippen = (k, node) => {
          if (k.id !== SCHRITTE[pos].id) {
            fehler++; Audio3.falsch();
            node.classList.add('wackeln');
            setTimeout(() => node.classList.remove('wackeln'), 500);
            rueck.textContent = 'Andersherum. Überleg, wo das Wasser als Erstes gebraucht wird – am Verteiler oder im Tank?';
            return;
          }
          Audio3.richtig();
          node.classList.add('richtig');
          node.style.pointerEvents = 'none';
          node.appendChild(el('div', { class: 'klein', style: { width: '100%', marginTop: '.3em' }, text: k.note }));
          if (pos === 0) {
            truppLaufen('W', [[-3.4, 2.6], [-2.6, 1.9]], () => {
              schlauchLegen('b1', [UO.heck, [-3.6, .16, 2.6], [-1.6, .16, 1.0],
                                   alsPunkt(eingangWelt())], 'B', 1.8);
            });
          } else {
            /* Zum Hydranten gehoert Arbeit: Kappe auf, Standrohr einschrauben,
               erst dann ankuppeln. Deshalb laeuft der Trupp zuerst hin und die
               Leitung waechst danach – vorher haengt sie an nichts.        */
            truppLaufen('W', [[UO.hydrant[0] + 1.5, UO.hydrant[2] + .3],
                              [UO.hydrant[0] + .7, UO.hydrant[2] + 1.2]], () => {
              hydrant.userData.deckelOeffnen(true);
              Audio3.treffer();
              hydrant.userData.standrohrSetzen(true);
              setTimeout(() => {
                const an = hydrant.position.clone().add(hydrant.userData.anschluss());
                schlauchLegen('b2', [[UO.heck[0], .45, UO.heck[2] + .8], [-7.2, .16, UO.gasse],
                                     [-13.5, .16, UO.gasse], alsPunkt(an)], 'B', 1.8);
              }, 700);
            });
          }
          pos++;
          if (pos < SCHRITTE.length) { rueck.textContent = 'Und danach?'; return; }
          punkte += 10;
          rueck.textContent = '';
          setTimeout(wasserMarsch, 2400);
        };

        const panel = seitenLayout(s, [
          el('div', { class: 'klein', text: 'Schritt 2 von 5' }),
          el('h3', { text: 'Wasserversorgung – in welcher Reihenfolge?' }),
          el('p', { class: 'klein', style: { margin: 0 },
            text: 'Der Wassertrupp hat zwei Aufgaben. Tippe sie in der richtigen Reihenfolge an.' }),
          liste,
          rueck,
          begriffKasten('hydrant'),
          UI.zitat('Die Wasserversorgung wird bei Löschfahrzeugen mit Löschwasserbehälter zuerst vom Löschfahrzeug zum Verteiler und danach zwischen Löschfahrzeug und Wasserentnahmestelle verlegt.'),
        ], { obenBreit: 0, obenSchmal: 0, rechtsBreit: 0 });
        return blickWache([UO.hydrant, UO.fzgVorn, UO.fzgHeck, UO.verteiler], panel, .84);
      });
    };

    /* ===================================================================== */
    /* 5. „Verteiler Wasser marsch!"                                          */
    /* ===================================================================== */
    const wasserMarsch = () => {
      ablauf({
        titel: 'Der Wassertrupp kommandiert',
        kommando: 'Verteiler Wasser marsch!',
        wer: 'Wassertruppführer → Maschinist',
        text: 'Der Wassertrupp hat die B-Leitung gelegt und den Verteiler angekuppelt. Erst jetzt darf Wasser kommen – und er sagt es dem Maschinisten selbst.',
        zitat: 'Er schließt den Verteiler an und gibt dem Maschinisten das Kommando: „Wasser marsch!"',
        merke: ['Kleiner Unterschied im Wortlaut',
                'In der Vorschrift steht kurz „Wasser marsch!". Bei uns wird „Verteiler Wasser marsch!" kommandiert – damit man es nicht mit „1. Rohr Wasser marsch!" verwechselt. Gemeint ist dasselbe.'],
        dauer: 3.6,
        blick: [UO.fzgVorn, UO.fzgHeck, UO.verteiler],
        anteil: .82,
        tun: () => { Audio3.wasser(); },
        danach: verteilerAnschluss,
      });
    };

    /* ===================================================================== */
    /* 6. Großaufnahme Verteiler: welcher Abgang für welchen Trupp?          */
    /* ===================================================================== */
    const verteilerAnschluss = () => {
      const ABGAENGE = [
        { i: 0, soll: 'A', name: 'links',  lang: 'linker C-Abgang',
          warum: 'Auf den linken C-Abgang kommt immer das erste Rohr. So weiß jeder am Verteiler sofort, welcher Hebel zu welchem Trupp gehört – auch nachts und im Rauch.' },
        { i: 1, soll: null, name: 'Mitte', lang: 'mittlerer B-Abgang',
          warum: 'Die Mitte ist der B-Abgang. Der bleibt frei – für eine weiterführende B-Leitung, einen zweiten Verteiler oder ein B-Rohr. Ein C-Rohr gehört da nicht hin.' },
        { i: 2, soll: 'W', name: 'rechts', lang: 'rechter C-Abgang',
          warum: 'Rechts kommt das zweite Rohr an. Links erstes Rohr, rechts zweites Rohr, Mitte B – diese Ordnung gilt an jedem Verteiler.' },
      ];
      const CHIPS = [
        { id: 'A', name: 'Angriffstrupp · 1. Rohr', farbe: '#ff4d3d' },
        { id: 'W', name: 'Wassertrupp · 2. Rohr',   farbe: '#35c8ff' },
      ];
      const gesetzt = {};
      let eigeneFehler = 0;
      // Grossaufnahme heisst Grossaufnahme: Fuer diesen Schritt treten die
      // Figuren beiseite, sonst stehen zwei Paar Stiefel im Bild.
      figuren.forEach(f => f.visible = false);

      UI.zeige('l7-verteiler', (s) => {
        const schicht = HotSpots.starten(s);
        const rueck = el('div', { style: { width: '100%' } });

        ABGAENGE.forEach(a => {
          const node = el('div', {
            class: 'ablage', 'data-platz': String(a.i),
            style: { minWidth: '96px', padding: '7px 10px', borderRadius: '14px',
                     border: '2px dashed rgba(255,255,255,.55)', background: 'rgba(10,16,30,.72)',
                     textAlign: 'center', fontWeight: '800', fontSize: '.82em', lineHeight: 1.15,
                     backdropFilter: 'blur(3px)', color: 'var(--txt2)' },
          }, a.name);
          node.style.marginTop = '-46px';
          HotSpots.hinzu(abgangWelt(a.i), node);
          a._node = node;
        });

        const chipReihe = el('div', { style: { display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' } });
        CHIPS.forEach(c => {
          const chip = el('div', {
            class: 'panel',
            style: { padding: '8px 13px', fontWeight: '800', fontSize: '.88em', cursor: 'grab',
                     borderColor: c.farbe + '88', display: 'flex', alignItems: 'center', gap: '.4em' },
          }, el('span', { style: { width: '10px', height: '10px', borderRadius: '3px', background: c.farbe } }),
             el('span', { text: c.name }));
          ziehbarMachen(chip, {
            daten: c, radius: 70,
            aufAblage: (feld, daten, quelle) => {
              const a = ABGAENGE[Number(feld.dataset.platz)];
              if (!a || feld.dataset.filled) return;
              if (a.soll !== daten.id) {
                eigeneFehler++; fehler++;
                Audio3.falsch();
                feld.classList.add('wackeln');
                setTimeout(() => feld.classList.remove('wackeln'), 500);
                UI.toast(a.warum, 'schlecht', 3400);
                return;
              }
              feld.dataset.filled = daten.id;
              feld.style.border = '2px solid ' + daten.farbe;
              feld.style.background = daten.farbe + '33';
              feld.style.color = '#fff';
              feld.textContent = a.name + ' · ' + (daten.id === 'A' ? '1. Rohr' : '2. Rohr');
              quelle.remove();
              Audio3.richtig();
              gesetzt[a.i] = daten.id;
              if (Object.keys(gesetzt).length === 2) fertig();
            },
          });
          chipReihe.appendChild(chip);
        });

        const fertig = () => {
          punkte += 10;
          Audio3.fanfare();
          chipReihe.remove();
          rueck.appendChild(UI.feedback(true,
            eigeneFehler === 0 ? 'Sitzt.' : 'Jetzt stimmt es.',
            'Links das erste, rechts das zweite Rohr, in der Mitte der B-Abgang. Wer den Verteiler bedient, greift dann blind zum richtigen Hebel.',
            'Der Schlauchtrupp bedient den Verteiler.'));
          rueck.appendChild(el('button', { class: 'btn gross', style: { marginTop: '10px' },
            onclick: () => {
              Audio3.klick(); HotSpots.beenden();
              figuren.forEach(f => f.visible = true);
              schlauchreserve();
            } }, 'Weiter →'));
        };

        const panel = seitenLayout(s, [
          el('div', { class: 'klein', text: 'Schritt 3 von 5' }),
          el('h3', { text: 'Wo wird angeschlossen?' }),
          el('p', { class: 'klein', style: { margin: 0 },
            text: 'Großaufnahme: Du stehst hinter dem Verteiler und schaust zum Brand. Hinten kommt die B-Leitung an, vorne sind drei Abgänge. Zieh die beiden Trupps auf ihren Abgang.' }),
          chipReihe,
          rueck,
        ], { obenBreit: 0, obenSchmal: 0, rechtsBreit: 0 });
        s.appendChild(schicht);

        // Nah dran und von hinten: genau der Blick des Schlauchtruppführers
        const hinten = new THREE.Vector3(Math.sin(verteiler.rotation.y), 0, Math.cos(verteiler.rotation.y));
        const eckpunkte = [abgangWelt(0), abgangWelt(1), abgangWelt(2),
                           new THREE.Vector3(UO.verteiler[0], .75, UO.verteiler[2]),
                           new THREE.Vector3(UO.verteiler[0], 0, UO.verteiler[2])];
        return motivWache(eckpunkte, panel, {
          richtung: [-hinten.x * .70, .72, -hinten.z * .70], mindest: 1.8, rand: .16, anteil: .78 });
      });
    };

    /* ===================================================================== */
    /* 7. Schlauchreserve in Buchten                                         */
    /* ===================================================================== */
    const schlauchreserve = () => {
      /* Die Reserve ist keine Zutat, sondern die letzte Schlauchlänge selbst.
         Deshalb wird die C-Leitung nur bis zu ihrem Anfang verlegt – sonst
         läge die Serpentine auf einem geraden Schlauch. Das Stück vom Knick
         bis zum Strahlrohr ist genau eine Reserve lang.                     */
      const knick = [1.8, -3.2];
      const RES = schlauchreserveLaenge(2);
      const dx = UO.rohr1[0] - knick[0], dz = UO.rohr1[2] - knick[1];
      const laenge = Math.hypot(dx, dz), ux = dx / laenge, uz = dz / laenge;
      const resStart = [UO.rohr1[0] - ux * RES, UO.rohr1[2] - uz * RES];
      const resMitte = [UO.rohr1[0] - ux * RES / 2, UO.rohr1[2] - uz * RES / 2];

      const ORTE = [
        { id: 'vert',  pos: [.8, .1, -1.0], gut: false, name: 'Direkt am Verteiler',
          warum: 'Am Verteiler liegen die Schläuche sowieso bereit. Die Reserve nützt dem Trupp nur da, wo er vorgeht.' },
        { id: 'mitte', pos: [1.5, .1, -2.6],gut: false, name: 'Mitten auf der Strecke',
          warum: 'Auf halber Strecke bringt die Reserve nichts – der Trupp braucht sie dort, wo er weiter vorgeht.' },
        { id: 'rohr',  pos: [resMitte[0], .1, resMitte[1]], gut: true, name: 'Kurz vorm Strahlrohr',
          warum: 'Genau hier. Der letzte Schlauch bleibt außerhalb des Gefahrenbereichs in Buchten liegen – dann kann der Trupp vorgehen, ohne dass die Leitung stramm wird und ohne neu zu kuppeln.' },
      ];
      let erledigt = false;

      // Der Trupp hat zwei Schläuche dabei. Einer wird verlegt – und zwar nur
      // bis dorthin, wo der zweite in Buchten liegen bleibt.
      truppLaufen('S', [[1.6, -2.4], [2.4, -3.2]], () => {
        schlauchLegen('c1', [[abgangWelt(0).x, .16, abgangWelt(0).z], [knick[0], .1, knick[1]],
                             [resStart[0], .1, resStart[1]]], 'C', 1.6);
      });
      truppLaufen('A', [[UO.rohr1[0] - .3, UO.rohr1[2] + .7], [UO.rohr1[0] + .6, UO.rohr1[2] + 1.1]]);
      const rollen = [];
      setTimeout(() => {
        [[-.9, 1.5], [-.3, 1.9]].forEach(([dx, dz]) => {
          const r = baueSchlauchrolle('C');
          r.position.set(UO.rohr1[0] + dx, 0, UO.rohr1[2] + dz);
          Stage.welt.add(r); rollen.push(r);
        });
      }, 1400);

      UI.zeige('l7-reserve', (s) => {
        const schicht = HotSpots.starten(s);
        const rueck = el('div', { style: { width: '100%' } });

        ORTE.forEach(o => {
          const marke = bodenMarke(o.gut ? 0xffd23f : 0xffd23f, .7);
          marke.position.set(o.pos[0], 0, o.pos[2]);
          Stage.welt.add(marke); marken.push(marke);
          const node = el('button', {
            style: { padding: '8px 12px', borderRadius: '14px', border: '2px solid rgba(255,255,255,.5)',
                     background: 'rgba(10,16,30,.78)', color: 'var(--txt)', fontWeight: '800',
                     fontSize: '.8em', backdropFilter: 'blur(3px)', whiteSpace: 'nowrap' },
            onclick: () => waehlen(o, node),
          }, o.name);
          node.style.marginTop = '-30px';
          HotSpots.hinzu(new THREE.Vector3(o.pos[0], .12, o.pos[2]), node);
        });

        const waehlen = (o, node) => {
          if (erledigt) return;
          if (!o.gut) {
            fehler++; Audio3.falsch();
            node.classList.add('wackeln');
            setTimeout(() => node.classList.remove('wackeln'), 500);
            UI.toast(o.warum, 'schlecht', 3200);
            return;
          }
          erledigt = true;
          punkte += 10;
          Audio3.richtig();
          marken.forEach(m => Stage.welt.remove(m)); marken.length = 0;
          HotSpots.beenden();
          rollen.forEach(r => Stage.welt.remove(r)); rollen.length = 0;
          reserve = baueSchlauchreserve(2, 'C');
          reserve.position.set(resMitte[0], 0, resMitte[1]);
          // Serpentine laengs in die Luecke legen: ihre Enden treffen genau
          // auf das Ende der Leitung und auf das Strahlrohr
          reserve.rotation.y = Math.atan2(-uz, ux);
          reserve.scale.setScalar(.01);
          Stage.welt.add(reserve);
          Bewegung.neu(.6, (p) => reserve.scale.setScalar(p), null, true);
          rueck.appendChild(UI.feedback(true, 'Genau da hin.', o.warum + ' Der ganze Schlauch bleibt liegen – so hast du im Ernstfall Reserve, ohne nachkuppeln zu müssen.',
            'Er stellt ausreichend Schlauchreserve sicher und kuppelt außerhalb des Gefahrenbereichs – spätestens aber an der Rauchgrenze – das Strahlrohr an.'));
          rueck.appendChild(el('button', { class: 'btn gross', style: { marginTop: '10px' },
            onclick: () => { Audio3.klick(); ersterRohr(); } }, 'Weiter →'));
        };

        const panel = seitenLayout(s, [
          el('div', { class: 'klein', text: 'Schritt 4 von 5' }),
          el('h3', { text: 'Wohin mit der Schlauchreserve?' }),
          el('p', { class: 'klein', style: { margin: 0 },
            text: 'Jeder Trupp nimmt zwei C-Schläuche mit. Einer wird verlegt – der letzte wird gar nicht erst stramm gezogen, sondern bleibt komplett in Buchten liegen. Tippe die richtige Stelle an.' }),
          el('div', { class: 'feedback', style: { width: '100%' } },
            el('b', { text: 'Was ist eine Bucht?' }),
            el('span', { text: 'Eine lose Schlaufe. Der Schlauch wird nicht stramm gezogen, sondern in Buchten abgelegt. Weil der ganze letzte Schlauch liegen bleibt, hat der Trupp gleich 15 Meter Luft: genug, um im Gelände oder im Gebäude weiterzugehen, ohne nachzukuppeln. Und genug, falls sich das Feuer ausbreitet.' })),
          rueck,
        ], { obenBreit: 0, obenSchmal: 0, rechtsBreit: 0 });
        s.appendChild(schicht);
        return blickWache([UO.verteiler, UO.rohr1, [8.5, 0, -5.5]], panel, .82);
      });
    };

    /* ===================================================================== */
    /* 7. Erstes Rohr Wasser marsch                                          */
    /* ===================================================================== */
    const ersterRohr = () => {
      ablauf({
        titel: 'Das erste Rohr geht vor',
        kommando: '1. Rohr Wasser marsch!',
        wer: 'Angriffstruppführer → Verteiler',
        text: 'Strahlrohr angekuppelt, Reserve liegt. Der Angriffstruppführer fordert Wasser für sein Rohr an – der Schlauchtrupp öffnet den Abgang am Verteiler.',
        zitat: 'Der Angriffstruppführer gibt nun das Kommando: „1. Rohr Wasser Marsch!"',
        merke: [BEGRIFFE.rohr.name + ' – was heißt das?', BEGRIFFE.rohr.text],
        dauer: 4.2,
        blick: [UO.verteiler, UO.rohr1, [9, 0, -6]],
        anteil: .82,
        tun: () => {
          Audio3.wasser();
          verteiler.userData.oeffnen(0);   // linker C-Abgang: erstes Rohr
          strahl1.visible = true; strahl1.userData.an = true;
          strahl1.userData.setzen(new THREE.Vector3(UO.rohr1[0] + .2, .9, UO.rohr1[2] + .2),
                                  new THREE.Vector3(UO.rohr1[0] + 1.5, .5, UO.rohr1[2] - 1.8));
          Bewegung.neu(4.0, (p) => { feuer1.userData.staerke = 1 - p * .85; }, null, false);
        },
        danach: zweitesRohrBefehl,
      });
    };

    /* ===================================================================== */
    /* 8. Zweites Rohr: der Wassertrupp ist dran                             */
    /* ===================================================================== */
    const zweitesRohrBefehl = () => {
      entscheidung({
        titel: 'Der rechte Abschnitt brennt weiter',
        lage: 'Der linke Brandabschnitt ist fast aus. Rechts daneben brennt es weiter. Deine Gruppe: Angriffstrupp am ersten Rohr, Schlauchtrupp am Verteiler, Wassertrupp fertig mit der Wasserversorgung, Melder bei dir.',
        frage: 'Wer nimmt das zweite Rohr vor?',
        blick: [UO.verteiler, UO.rohr2, UO.rohr1],
        optionen: shuffle([
          { t: 'Der Wassertrupp', gut: true,
            warum: 'Hier geht niemand unter Atemschutz vor – also wird kein Sicherheitstrupp gebraucht. Der Wassertrupp ist fertig und frei. Genau deshalb übt man den Wiesenbrand: Der Wassertrupp bekommt einen eigenen Befehl und wiederholt ihn selbst.',
            zitat: 'Weitere Rohre können vorgenommen werden, wenn Trupps einsatzbereit zur Verfügung stehen.' },
          { t: 'Der Schlauchtrupp',
            warum: 'Beim Atemschutzeinsatz wäre das richtig – da ist der Wassertrupp als Sicherheitstrupp gebunden. Hier ist er frei, und der Schlauchtrupp wird am Verteiler gebraucht.',
            zitat: 'Beim Atemschutzeinsatz nimmt der Schlauchtrupp das zweite Rohr vor.' },
          { t: 'Der Melder',
            warum: 'Der Melder arbeitet auf Befehl – er kann zum Beispiel den Verteiler bedienen, aber er ist kein Trupp und nimmt kein Rohr vor.',
            zitat: 'Der Melder bedient auf Befehl den Verteiler.' },
        ]),
        danach: befehl2Bauen,
      });
    };

    /* Befehl für das zweite Rohr zusammensetzen – ohne Wasserentnahmestelle
       und ohne Verteiler, die stehen ja längst.                             */
    const befehl2Bauen = () => {
      const soll = ['einh', 'auft', 'mitt', 'ziel', 'weg'];
      const wegLassen = ['wes', 'vert'];
      let pos = 0;

      UI.zeige('l7-befehl2', (s) => {
        const BEISPIEL = {
          einh: 'Wassertrupp', auft: 'zur Brandbekämpfung', mitt: 'mit 2. Rohr',
          ziel: 'zum rechten Brandabschnitt', weg: 'über den Feldweg',
        };
        const rueck = el('div', { class: 'klein', style: { minHeight: '2.6em' },
          text: 'Der Verteiler steht, das Wasser läuft. Womit fängt dieser Befehl an?' });

        const slots = el('div', { style: { display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' } },
          soll.map((_, i) => el('div', {
            'data-pos': i,
            style: { display: 'flex', alignItems: 'center', gap: '.6em', padding: '.5em .8em', borderRadius: '12px',
                     border: '2px dashed var(--linie2)', minHeight: '2.5em', fontSize: '.93em',
                     borderColor: i === 0 ? 'var(--gelb)' : 'var(--linie2)', transition: 'all .2s' },
          }, el('span', { class: 'klein mono', style: { minWidth: '1.4em' }, text: (i + 1) + '.' }),
             el('span', { class: 'klein', text: '…' }))));

        const chips = el('div', { style: { display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' } },
          shuffle(BEFEHL_ELEMENTE.slice()).map(e => el('button', {
            class: 'btn geist', 'data-id': e.id,
            style: { padding: '.5em 1em', fontSize: '.9em', boxShadow: 'inset 0 0 0 2px ' + e.farbe + '77' },
            onclick: (ev) => waehlen(e, ev.currentTarget),
          }, e.icon + ' ' + e.label)));

        const waehlen = (e, node) => {
          if (wegLassen.includes(e.id)) {
            fehler++; Audio3.falsch();
            node.classList.add('wackeln');
            setTimeout(() => node.classList.remove('wackeln'), 500);
            rueck.textContent = e.id === 'wes'
              ? 'Die Wasserentnahmestelle ist längst aufgebaut. Bei weiteren Rohren fängt der Befehl direkt bei der Einheit an.'
              : 'Der Verteiler steht schon. Den musst du nicht noch einmal befehlen.';
            return;
          }
          if (e.id !== soll[pos]) {
            fehler++; Audio3.falsch();
            node.classList.add('wackeln');
            setTimeout(() => node.classList.remove('wackeln'), 500);
            rueck.textContent = { einh: 'Zuerst: WER soll ran?', auft: 'Was soll er tun?',
                                  mitt: 'Womit?', ziel: 'Wohin?', weg: 'Auf welchem Weg?' }[soll[pos]];
            return;
          }
          const slot = $$('[data-pos]', slots)[pos];
          slot.innerHTML = '';
          slot.style.borderStyle = 'solid';
          slot.style.borderColor = e.farbe;
          slot.style.background = e.farbe + '1f';
          slot.appendChild(el('span', { class: 'klein mono', style: { minWidth: '1.4em' }, text: (pos + 1) + '.' }));
          slot.appendChild(el('span', { style: { fontWeight: '800' }, text: e.icon + ' ' + e.label }));
          slot.appendChild(el('span', { class: 'klein', style: { marginLeft: 'auto', opacity: .85 }, text: BEISPIEL[e.id] }));
          node.remove();
          Audio3.richtig();
          pos++;
          if (pos < soll.length) {
            const n = $$('[data-pos]', slots)[pos];
            n.style.borderColor = 'var(--gelb)';
            rueck.textContent = 'Und weiter?';
          } else {
            punkte += 15;
            rueck.textContent = '';
            setTimeout(wassertruppWiederholt, 450);
          }
        };

        const panel = seitenLayout(s, [
          el('div', { class: 'klein', text: 'Schritt 5 von 5' }),
          el('h3', { text: 'Befiehl das zweite Rohr' }),
          el('p', { class: 'klein', style: { margin: 0 },
            text: 'Fünf Elemente – zwei aus dem großen Befehl brauchst du hier nicht mehr. Tippe sie in der richtigen Reihenfolge an.' }),
          slots, rueck, chips,
        ], { obenBreit: 0, obenSchmal: 0, rechtsBreit: 0 });
        return blickWache([UO.verteiler, UO.rohr2], panel, .8);
      });
    };

    const wassertruppWiederholt = () => {
      ablauf({
        titel: 'Der Wassertruppführer wiederholt',
        kommando: 'Wassertrupp zur Brandbekämpfung mit 2. Rohr zum rechten Brandabschnitt über den Feldweg. Vor!',
        wer: 'Wassertruppführer',
        text: 'Nicht nur der Angriffstrupp wiederholt. Jeder Truppführer, der einen Befehl bekommt, sagt ihn laut zurück – ab „Einheit". So merkt man sofort, wenn etwas falsch angekommen ist.',
        zitat: 'Der angesprochene ……truppführer wiederholt den Befehl.',
        dauer: 5.5,
        blick: [UO.verteiler, UO.rohr2, UO.rohr1],
        anteil: .82,
        tun: () => {
          /* Genau wie beim ersten Rohr: Die Leitung endet dort, wo die Reserve
             anfaengt, und die Reserve ist ihre letzte Laenge. Vorher lag sie
             quer ueber dem schon verlegten Schlauch – und sie lag da, bevor
             der Trupp ueberhaupt angefangen hatte zu verlegen. */
          const knick = [5.6, -1.4];
          const RES = schlauchreserveLaenge(2);
          const dx = UO.rohr2[0] - knick[0], dz = UO.rohr2[2] - knick[1];
          const laenge = Math.hypot(dx, dz), ux = dx / laenge, uz = dz / laenge;
          const resStart = [UO.rohr2[0] - ux * RES, UO.rohr2[2] - uz * RES];
          const resMitte = [UO.rohr2[0] - ux * RES / 2, UO.rohr2[2] - uz * RES / 2];

          truppLaufen('W', [[UO.rohr2[0] - .4, UO.rohr2[2] + .6], [UO.rohr2[0] + .5, UO.rohr2[2] + 1.0]], () => {
            schlauchLegen('c2', [[abgangWelt(2).x, .16, abgangWelt(2).z], [knick[0], .1, knick[1]],
                                 [resStart[0], .1, resStart[1]]], 'C', 1.6, () => {
              // und jetzt erst die Reserve – als das, was sie ist: der letzte
              // Schlauch, der in Buchten liegen bleibt
              const res2 = baueSchlauchreserve(2, 'C');
              res2.position.set(resMitte[0], 0, resMitte[1]);
              res2.rotation.y = Math.atan2(-uz, ux);
              res2.scale.setScalar(.01);
              Stage.welt.add(res2);
              Bewegung.neu(.6, (p) => res2.scale.setScalar(p), null, true);
            });
          });
        },
        danach: zweitesRohrWasser,
      });
    };

    const zweitesRohrWasser = () => {
      ablauf({
        titel: 'Zweites Rohr',
        kommando: '2. Rohr Wasser marsch!',
        wer: 'Wassertruppführer → Verteiler',
        text: 'Der Wassertrupp hat seine Leitung verlegt, die Reserve liegt kurz vorm Strahlrohr, das Rohr ist angekuppelt. Erst jetzt fordert er Wasser an – und der Schlauchtrupp öffnet den zweiten Abgang.',
        dauer: 4.0,
        blick: [UO.verteiler, UO.rohr2, [9.5, 0, 5.5]],
        anteil: .82,
        tun: () => {
          Audio3.wasser();
          verteiler.userData.oeffnen(2);   // rechter C-Abgang: zweites Rohr
          strahl2.visible = true; strahl2.userData.an = true;
          strahl2.userData.setzen(new THREE.Vector3(UO.rohr2[0] + .2, .9, UO.rohr2[2] + .2),
                                  new THREE.Vector3(UO.rohr2[0] + 1.5, .5, UO.rohr2[2] - 1.6));
          Bewegung.neu(4.0, (p) => { feuer2.userData.staerke = 1 - p * .9; }, null, false);
        },
        danach: schnellangriff,
      });
    };

    /* ===================================================================== */
    /* 9. Sonderfall: Verteiler hängt schon an der B-Leitung                 */
    /* ===================================================================== */
    const schnellangriff = () => {
      entscheidung({
        titel: 'Sonderfall',
        lage: 'Beim nächsten Mal fahrt ihr mit einem Fahrzeug, bei dem der Verteiler schon fertig an der B-Schlauchleitung hängt – ein Schnellangriffsverteiler. Der Angriffstrupp nimmt ihn beim Absitzen einfach mit.',
        frage: 'Wer gibt in diesem Fall dem Maschinisten „Wasser marsch!"?',
        blick: [UO.fzgVorn, UO.fzgHeck, UO.verteiler],
        anteil: .82,
        optionen: shuffle([
          { t: 'Der Angriffstrupp – er hat den Verteiler ja mitgenommen', gut: true,
            warum: 'Genau. Wenn der Verteiler schon angekuppelt ist, nimmt der Angriffstrupp diesen Verteiler vor und gibt nach dem Setzen selbst „Wasser marsch!". Der Wassertrupp muss sich um die B-Leitung zum Verteiler dann gar nicht kümmern – er geht direkt an den Hydranten.',
            zitat: 'Bei Fahrzeugen mit bereits an die B-Schlauchleitung angekuppeltem Verteiler nimmt der Angriffstrupp d i e s e n Verteiler vor, sofern die Länge der B-Schlauchleitung ausreicht. Er gibt – im Falle des angekuppelten Verteilers – nach dem Setzen des Verteilers dem Maschinisten das Kommando: „Wasser Marsch!"' },
          { t: 'Trotzdem der Wassertrupp',
            warum: 'Normalerweise ja – aber nur, weil er sonst die B-Leitung legt und ankuppelt. Hängt der Verteiler schon dran, macht das der Angriffstrupp.',
            zitat: 'Er gibt – im Falle des angekuppelten Verteilers – nach dem Setzen des Verteilers dem Maschinisten das Kommando: „Wasser Marsch!"' },
          { t: 'Der Maschinist gibt von selbst Wasser',
            warum: 'Der Maschinist wartet immer auf ein Kommando. Er weiß nicht, ob am anderen Ende schon jemand fertig ist.',
            zitat: 'Der Maschinist ist Fahrer und bedient die Feuerlöschkreiselpumpe.' },
        ]),
        danach: () => nochEinSonderfall(),
      });
    };

    const nochEinSonderfall = () => {
      ablauf({
        titel: 'Und der Schnellangriff?',
        text: 'Nicht verwechseln: Der Schnellangriffsverteiler ist ein fertig angekuppelter Verteiler. Der Schnellangriff dagegen ist die feste Haspel am Fahrzeug – da entfallen im Befehl sogar „Lage des Verteilers" und „Weg", weil es nichts zu verlegen gibt.',
        zitat: 'Der Schnellangriff wird in der Regel vorgenommen, wenn kein weiteres Rohr vorgenommen werden muss und die Länge der Schnellangriffsleitung ausreicht.',
        merke: ['Merksatz für den Schnellangriff',
                'Nur für den ersten schnellen Zugriff auf ein kleines Feuer – für einen Einsatz mit zwei Rohren wie heute reicht er nicht.'],
        dauer: 2.4,
        blick: [UO.fzgVorn, UO.fzgHeck, UO.verteiler],
        anteil: .82,
        danach: feuerAus,
      });
    };

    /* ===================================================================== */
    /* 10. Abschluss                                                         */
    /* ===================================================================== */
    const feuerAus = () => {
      Stage.welt.remove(abschnitt1); Stage.welt.remove(abschnitt2);
      Bewegung.neu(2.5, (p) => {
        feuer1.userData.staerke = .15 * (1 - p);
        feuer2.userData.staerke = .10 * (1 - p);
      }, () => {
        strahl1.userData.an = false; strahl1.visible = false;
        strahl2.userData.an = false; strahl2.visible = false;
      }, false);

      ablauf({
        titel: 'Feuer aus',
        kommando: 'Zum Abmarsch fertig!',
        wer: 'Du als Gruppenführer',
        text: 'Beide Abschnitte sind aus. Der Maschinist schaltet die Pumpe ab, die Trupps kuppeln ab und bringen alles gemeinsam zum Fahrzeug zurück. Erst wenn er „Fahrzeug fahrbereit!" meldet, geht es heim.',
        zitat: 'Die Mannschaft tritt am Löschfahrzeug an, der Maschinist überzeugt sich, ob alle Geräte vorhanden, sicher gelagert und sämtliche Geräteräume geschlossen sind.',
        dauer: 3.0,
        knopf: 'Auswertung →',
        blick: [UO.fzgVorn, UO.fzgHeck, UO.verteiler, UO.rohr1, UO.rohr2],
        tun: () => {
          const k = konfetti(70, [0x3ddc84, 0x35c8ff, 0xffd23f, 0xff8c42]);
          k.position.set(UO.verteiler[0], 2, UO.verteiler[2]);
          Stage.welt.add(k);
          const fn = Stage.anmelden((dt) => {
            if (!k.userData.update(dt)) { Stage.welt.remove(k); Stage.abmelden(fn); }
          });
          Audio3.fanfare();
        },
        danach: () => {
          const moeglich = 85;
          const guete = clamp(punkte / moeglich - fehler * .05, 0, 1);
          api.fertig({
            guete,
            xp: 70 + punkte,
            titel: fehler === 0
              ? 'Übung ohne einen einzigen Fehlgriff durchgezogen.'
              : `${fehler} Fehlversuch${fehler > 1 ? 'e' : ''} – genau dafür ist eine Übung da.`,
            abzeichen: fehler === 0 ? ['wasserversorgung'] : [],
            zeilen: [
              el('span', { html: '<b>Reihenfolge:</b> erst Fahrzeug → Verteiler, dann Fahrzeug → Hydrant.' }),
              el('span', { html: '<b style="color:#35c8ff">Wassertrupp:</b> „Verteiler Wasser marsch!" · <b style="color:#ff4d3d">Angriffstrupp:</b> „1. Rohr Wasser marsch!"' }),
              el('span', { html: '<b>Schlauchreserve:</b> der ganze letzte Schlauch in Buchten – kurz vor dem Strahlrohr, außerhalb des Gefahrenbereichs.' }),
              el('span', { html: '<b>Verteiler:</b> links 1. Rohr · Mitte B-Abgang · rechts 2. Rohr.' }),
              el('span', { html: '<b>Weitere Rohre:</b> Befehl ab „Einheit" – der angesprochene Truppführer wiederholt.' }),
              el('span', { html: '<b>Schnellangriffsverteiler:</b> hängt schon an der B-Leitung – dann gibt der Angriffstrupp „Wasser marsch!".' }),
            ],
          });
        },
      });
    };

    /* ===== Einstieg ====================================================== */
    Stage.kameraSetzen([-1, 14, 18], [-1, 0, 1]);
    intro();
  },
});
