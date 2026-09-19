/* ============================================================================
   Level 8 – Der Löschangriff (Boss)
   Derselbe Einsatz einmal als Gruppe, einmal als Staffel. Der Unterschied
   ergibt sich aus FwDV 3, Nr. 5.1: zuerst entfällt der Melder, dann der
   Schlauchtrupp, zuletzt der Wassertrupp.
   ========================================================================== */

/* Feste Punkte der Einsatzstelle.
   Das Fahrzeug steht bewusst weit weg vom Verteiler: eine B-Schlauchleitung
   ist lang, und angekuppelt wird hinten am Fahrzeug. Der Laufweg "gasse"
   liegt vor dem Fahrzeug, damit niemand hindurchgeht und der Wassertrupp
   nicht dahinter verschwindet.                                            */
const EO = {
  fahrzeug:  [-11.5, 0, 3.4],
  fzgVorn:   [-15.2, 0, 3.4],
  heck:      [-7.8, .45, 3.4],    // Abgang am Fahrzeugheck
  hydrant:   [-19.5, 0, 5.8],
  verteiler: [0, 0, -.6],
  tuer:      [1.8, 0, -4.15],
  // Nullpunkt der Antreteordnung: von hier aus stehen Maschinist und Melder
  // am Fahrzeug, rechts daneben Angriffs-, Wasser- und Schlauchtrupp
  antreten:  [-10.2, 0, 2.0],
  brand:     [1.8, 1.75, -4.15],
  gasse:     6.3,                 // freier Laufweg vor dem Fahrzeug
  heckX:     -7.8,                // ab hier beginnt das Fahrzeug
};

LEVELS.push({
  id: 'loeschangriff',
  name: 'Der Löschangriff',
  icon: '🔥',
  farbe: 'var(--rot)',
  boss: true,
  kurz: 'Du führst. Einmal als Gruppe, einmal als Staffel – und merkst den Unterschied.',

  start(api) {
    /* ===== Zustand ======================================================== */
    let modus = null;              // 'gruppe' | 'staffel'
    let punkte = 0, fehler = 0, schrittNr = 0;
    const protokoll = [];

    /* ===== Kulisse ======================================================== */
    Stage.leeren();
    Bewegung.alleWeg();
    Stage.welt.add(baueBoden(110));

    const strasse = baueStrasse(70, 7.2);
    strasse.rotation.y = Math.PI / 2;
    strasse.position.z = 3.4;
    Stage.welt.add(strasse);

    const haus = baueHaus({ breite: 9.5, tiefe: 8, hoehe: 7.6, farbe: 0x8f8577 });
    haus.position.set(1.8, 0, -8.4);
    Stage.welt.add(haus);
    for (const [x, z] of [[-13, -6], [13, -5], [-22, 10]]) {
      const b = baueBaum(); b.position.set(x, 0, z); b.scale.setScalar(rnd(.9, 1.3));
      Stage.welt.add(b);
    }
    for (const x of [-16, 2, 14]) {
      const l = baueLaterne(); l.position.set(x, 0, 8.6); l.rotation.y = Math.PI;
      Stage.welt.add(l);
    }

    const hydrant = baueHydrant();
    hydrant.position.set(EO.hydrant[0], 0, EO.hydrant[2]);
    hydrant.visible = false;
    Stage.welt.add(hydrant);

    const verteiler = baueVerteiler();
    verteiler.position.set(EO.verteiler[0], 0, EO.verteiler[2]);
    // Abgaenge zur Haustuer, der B-Eingang zurueck zum Fahrzeug
    verteiler.rotation.y = Math.atan2(EO.tuer[0] - EO.verteiler[0], EO.tuer[2] - EO.verteiler[2]);
    verteiler.visible = false;
    Stage.welt.add(verteiler);
    // Der B-Eingang sitzt mittig hinten – dort endet die Leitung vom Fahrzeug.
    const eingangWelt = () => verteiler.localToWorld(verteiler.userData.eingang());
    const alsPunkt = (v) => [v.x, v.y, v.z];

    const feuer = baueFeuer({ anzahl: 54, breite: 1.5, hoehe: 3.0 });
    feuer.position.set(EO.brand[0], EO.brand[1] - .55, EO.brand[2] + .12);
    Stage.welt.add(feuer);

    const strahl = baueWasserstrahl();
    Stage.welt.add(strahl);

    let fzg = null;
    let antretenPunkte = [];       // Bildpunkte der Aufstellung, je Einheit neu
    const figuren = [], nachRolle = {};
    const schlaeuche = { b1: null, b2: null, c1: null, c2: null };

    Stage.anmelden((dt, t) => {
      belebeFiguren(figuren, dt, t);
      feuer.userData.update(dt, t);
      strahl.userData.update(dt, t);
      if (fzg) blaulichtUpdate(fzg, dt, t);
    });

    /* ===== Aufbau je nach Einheit ========================================= */
    const ROLLEN = {
      gruppe:  ['EF', 'MA', 'ME', 'ATF', 'ATM', 'WTF', 'WTM', 'STF', 'STM'],
      staffel: ['EF', 'MA', 'ATF', 'ATM', 'WTF', 'WTM'],
    };

    const einheitAufbauen = (art) => {
      figuren.forEach(f => Stage.welt.remove(f));
      figuren.length = 0;
      Object.keys(nachRolle).forEach(k => delete nachRolle[k]);
      if (fzg) Stage.welt.remove(fzg);

      fzg = baueFahrzeug(art === 'gruppe' ? 'lf' : 'klf');
      fzg.position.set(EO.fahrzeug[0], 0, EO.fahrzeug[2]);
      fzg.rotation.y = Math.PI / 2;
      fzg.userData.blaulichtAn = true;
      Stage.welt.add(fzg);

      /* Angetreten wird wie in Aufgabe 4: Maschinist und Melder am Fahrzeug,
         rechts daneben Angriffs-, Wasser- und Schlauchtrupp, der Einheits-
         führer gegenüber dem Angriffstrupp. Bei der Staffel fallen Melder
         und Schlauchtrupp weg – die Ordnung bleibt dieselbe.               */
      const aufstellung = antretenStellen(art, EO.antreten, 0,
        (soll) => figurFuerRolle(soll, { pa: ['ATF', 'ATM', 'WTF', 'WTM'].includes(soll) }));
      aufstellung.figuren.forEach(f => { Stage.welt.add(f); figuren.push(f); });
      Object.assign(nachRolle, aufstellung.nachRolle);
      antretenPunkte = aufstellung.figuren.map(f => [f.position.x, 1.7, f.position.z]);

      Object.keys(schlaeuche).forEach(k => {
        if (schlaeuche[k]) { Stage.welt.remove(schlaeuche[k].mesh || schlaeuche[k]); schlaeuche[k] = null; }
      });
      verteiler.visible = false;
      hydrant.visible = false;
      // beim zweiten Durchgang faengt der Hydrant wieder zu: Kappe geschlossen,
      // Standrohr noch auf dem Fahrzeug
      hydrant.userData.standrohrSetzen(false);
      hydrant.userData.deckelOeffnen(false);
      feuer.userData.staerke = 1;
      strahl.userData.an = false; strahl.visible = false;
    };

    const trupp = (id) => id === 'A' ? [nachRolle.ATF, nachRolle.ATM].filter(Boolean)
                        : id === 'W' ? [nachRolle.WTF, nachRolle.WTM].filter(Boolean)
                        : id === 'S' ? [nachRolle.STF, nachRolle.STM].filter(Boolean) : [];

    /* Weg zu einem Ziel – geht bei Bedarf vor dem Fahrzeug entlang, statt
       mitten hindurch. ziel: [x, z]                                        */
    const wegNach = (von, ziel) => {
      const stationen = [];
      if ((von.x < EO.heckX) !== (ziel[0] < EO.heckX)) {
        stationen.push([von.x, EO.gasse], [ziel[0], EO.gasse]);
      }
      stationen.push([ziel[0], ziel[1]]);
      return stationen;
    };
    /* ziele: [[x,z], [x,z]] – ein Ziel je Truppmitglied */
    const truppLaufen = (id, ziele, danach) => {
      const figs = trupp(id);
      if (!figs.length) { if (danach) danach(); return; }
      truppWeg(figs, figs.map((f, i) => wegNach(f.position, ziele[i] || ziele[0])), 2.6, danach);
    };

    /* Der Abgang sitzt am Heck – und das KLF ist kuerzer als das LF. */
    const heckPunkt = (dz) => {
      const L = fzg ? fzg.userData.F.L : 7.4;
      return [EO.fahrzeug[0] + L / 2 + .15, .45, EO.fahrzeug[2] + (dz || 0)];
    };

    /* Schlauch wachsen lassen */
    const schlauchLegen = (schluessel, punkteListe, art, dauer, danach) => {
      const w = wachsenderSchlauch(Stage.welt, punkteListe, art);
      schlaeuche[schluessel] = { setzen: w.setzen };
      Bewegung.neu(dauer, (p) => w.setzen(p), danach, false);
    };

    /* ===== Ablaufsteuerung =============================================== */
    let schritte = [];
    let sIdx = 0;

    const naechsterSchritt = () => {
      sIdx++;
      if (sIdx >= schritte.length) return;   // Ende wird vom letzten Schritt selbst ausgeloest
      schritte[sIdx].tun();
    };

    /* ===== Bildausschnitt ================================================
       Flacher Winkel: Bei der Menschenrettung soll man das Haus sehen, nicht
       nur den Grundriss. Der Ausschnitt wird trotzdem automatisch eingepasst. */
    const KINO = { hoch: .40, weit: .92, anteil: .84 };
    const UEBERSICHT = [EO.fzgVorn, EO.heck, EO.verteiler, EO.tuer, [EO.brand[0], 5, EO.brand[2]]];
    const blickWache = (punkte, panel) => motivWache(punkte || UEBERSICHT, panel, KINO);

    /* ===== Bausteine für Bildschirme ===================================== */
    const funkKarte = (text) => el('div', {
      class: 'panel', style: { width: '100%', padding: '14px', textAlign: 'left', lineHeight: 1.35,
                               borderLeft: '4px solid var(--glut)', fontSize: '.98em' },
    }, el('div', { class: 'klein', style: { marginBottom: '.25em' }, text: '📻 Lage' }), el('span', { text }));

    const entscheidung = (opt) => {
      // opt: { titel, lage, frage, optionen:[{t, gut, warum, zitat}], danach() }
      UI.zeige('l8-' + schrittNr++, (s) => {
        const rueck = el('div', { style: { width: '100%' } });
        let fertig = false;
        const knoepfe = el('div', { style: { display: 'grid', gap: '8px', width: '100%' } },
          opt.optionen.map((o, i) => el('button', {
            class: 'antwort', style: { fontSize: '.95em' },
            onclick: (e) => waehlen(o, i, e.currentTarget),
          }, el('span', { class: 'marker', text: 'ABCD'[i] }), el('span', { text: o.t }))));

        const waehlen = (o, i, node) => {
          if (fertig) return;
          fertig = true;
          $$('.antwort', knoepfe).forEach((b, j) => {
            if (opt.optionen[j].gut) b.classList.add('richtig');
            else if (j === i) b.classList.add('falsch');
            else b.classList.add('aus');
            b.style.pointerEvents = 'none';
          });
          const gut = !!o.gut;
          if (gut) { punkte += 10; Audio3.richtig(); }
          else { fehler++; Audio3.falsch(); }
          protokoll.push({ titel: opt.titel, gut });
          const richtige = opt.optionen.find(x => x.gut);
          rueck.appendChild(UI.feedback(gut, gut ? 'Richtig.' : 'Nicht optimal.',
            gut ? o.warum : richtige.warum, (gut ? o : richtige).zitat));
          rueck.appendChild(el('button', {
            class: 'btn gross', style: { marginTop: '10px' },
            onclick: () => { Audio3.klick(); opt.danach(gut, o); },
          }, 'Weiter →'));
        };

        const panel = seitenLayout(s, [
          el('div', { class: 'klein', text: opt.titel }),
          opt.lage ? funkKarte(opt.lage) : null,
          el('div', { class: 'frage', style: { fontSize: '1.08em' }, text: opt.frage }),
          knoepfe, rueck,
        ], { obenBreit: 0, obenSchmal: 0, rechtsBreit: 0 });
        return blickWache(opt.blick, panel);
      });
    };

    const ablauf = (opt) => {
      // opt: { titel, text, kommando, dauer, tun(), danach() }
      UI.zeige('l8-ablauf-' + schrittNr++, (s) => {
        const weiter = el('button', {
          class: 'btn gross', style: { opacity: '0', pointerEvents: 'none', transition: 'opacity .3s' },
          onclick: () => { Audio3.klick(); opt.danach(); },
        }, 'Weiter →');
        const panel = seitenLayout(s, [
          el('div', { class: 'klein', text: opt.titel }),
          opt.kommando ? el('div', {
            class: 'kennzahl',
            style: { fontSize: 'clamp(1.15rem,3vw,1.7rem)', color: 'var(--gelb)', lineHeight: 1.25 },
            text: '„' + opt.kommando + '"',
          }) : null,
          el('p', { class: 'hinweis', style: { margin: 0 }, text: opt.text }),
          opt.zitat ? UI.zitat(opt.zitat) : null,
          weiter,
        ], { obenBreit: 0, obenSchmal: 0, rechtsBreit: 0 });
        const stop = blickWache(opt.blick, panel);
        if (opt.kommando) Audio3.kommando(opt.kommando);
        if (opt.tun) opt.tun();
        setTimeout(() => { weiter.style.opacity = '1'; weiter.style.pointerEvents = 'auto'; },
          (opt.dauer || 2.2) * 1000);
        return stop;
      });
    };

    /* ===== Der Einsatz =================================================== */
    const einsatzStarten = (art) => {
      modus = art;
      punkte = 0; fehler = 0; sIdx = -1;
      protokoll.length = 0;
      einheitAufbauen(art);
      Stage.kameraSetzen([-6.0, 10.2, 25.5], [-3.4, 2.4, -2.0]);

      const istGruppe = art === 'gruppe';
      const E = EINHEITEN[art];

      schritte = [
        /* --- 1. Ankommen, absitzen ------------------------------------- */
        { tun: () => ablauf({
            titel: 'Eintreffen an der Einsatzstelle',
            blick: [EO.fzgVorn, EO.heck].concat(antretenPunkte),
            kommando: 'Absitzen!',
            text: `Ihr seid mit ${istGruppe ? 'dem LF als Gruppe (1/8/9)' : 'dem KLF als Staffel (1/5/6)'} eingetroffen. Die Mannschaft sitzt erst ab, wenn du als Einheitsführer das Kommando gibst – und tritt dann hinter dem Fahrzeug an.`,
            zitat: 'Die Mannschaft sitzt nach dem Eintreffen an der Einsatzstelle erst ab, nachdem der Einheitsführer das Kommando „Absitzen!" gegeben hat.',
            dauer: 2.4,
            tun: () => {
              Audio3.martinshorn(1);
            },
            danach: naechsterSchritt,
          }) },

        /* --- 2. Maschinist sichert ab ----------------------------------- */
        { tun: () => entscheidung({
            titel: 'Erste Maßnahme',
            lage: 'Ihr steht auf der Straße vor dem Haus. Aus einem Fenster im Erdgeschoss quillt dichter Rauch. Eine Nachbarin ruft: „Da ist noch jemand drin!"',
            frage: 'Wer sichert die Einsatzstelle sofort mit Warnblinkanlage, Fahrlicht und blauem Blinklicht ab?',
            optionen: shuffle([
              { t: 'Der Maschinist', gut: true,
                warum: 'Das macht er von sich aus, ohne Befehl – gleich nach dem Anhalten.',
                zitat: 'Er sichert sofort die Einsatzstelle mit Warnblinkanlage, Fahrlicht und blauem Blinklicht.' },
              { t: 'Der Melder', warum: 'Der Melder wird nur auf Befehl tätig – und bei einer Staffel gibt es ihn gar nicht.',
                zitat: 'Der Melder übernimmt befohlene Aufgaben.' },
              { t: 'Der Wassertrupp', warum: 'Der Wassertrupp kümmert sich um die Wasserversorgung.',
                zitat: 'Der Wassertrupp stellt die Wasserversorgung vom Löschfahrzeug zum Verteiler her.' },
              { t: 'Du selbst als Einheitsführer', warum: 'Du erkundest und befiehlst – absichern ist Sache des Maschinisten.',
                zitat: 'Der Einheitsführer führt seine taktische Einheit.' },
            ]),
            danach: naechsterSchritt,
          }) },

        /* --- 3. Mit oder ohne Bereitstellung ---------------------------- */
        { tun: () => entscheidung({
            titel: 'Deine Entscheidung',
            lage: 'Du siehst: Rauch aus dem Erdgeschossfenster, die Haustür ist frei zugänglich, ein Unterflurhydrant liegt etwa 20 Meter links. Die Nachbarin zeigt dir genau, wo die Person sein soll.',
            frage: 'Befiehlst du einen Einsatz mit oder ohne Bereitstellung?',
            optionen: [
              { t: 'OHNE Bereitstellung – ich weiß genug für den kompletten Befehl', gut: true,
                warum: 'Du kennst Wasserentnahme, Verteiler, Auftrag, Mittel, Ziel und Weg. Dann darf – und soll – der ganze Befehl kommen. Jede Sekunde zählt.',
                zitat: 'Nur wenn ausreichende Informationen zur Bestimmung des Einsatzauftrages vorliegen, befiehlt der Einheitsführer einen Einsatz o h n e Bereitstellung.' },
              { t: 'MIT Bereitstellung – erst mal aufbauen lassen',
                warum: 'Bereitstellung ist richtig, wenn der Auftrag noch unklar ist. Hier weißt du aber schon alles – dann wäre das verschenkte Zeit.',
                zitat: 'Der Einsatz m i t Bereitstellung wird durchgeführt, wenn der Einheitsführer … noch nicht den Einsatzauftrag … bestimmen kann.' },
            ],
            danach: naechsterSchritt,
          }) },

        /* --- 4. Welche Einheit bekommt den Auftrag? --------------------- */
        { tun: () => entscheidung({
            titel: 'Der Befehl – Element „Einheit"',
            frage: 'Es geht um Menschenrettung unter Atemschutz. Welchen Trupp setzt du dafür ein?',
            optionen: shuffle([
              { t: 'Angriffstrupp', gut: true,
                warum: 'Er rettet – insbesondere aus Bereichen, die man nur mit Atemschutz betreten kann. Und er nimmt in der Regel das erste Rohr vor.',
                zitat: 'Der Angriffstrupp rettet; insbesondere aus Bereichen, die nur mit Atemschutzgeräten betreten werden können. Er nimmt in der Regel das erste einzusetzende Strahlrohr vor.' },
              { t: 'Wassertrupp',
                warum: 'Der Wassertrupp rettet zwar auch – aber zuerst braucht ihr Wasser. Und danach wird er Sicherheitstrupp.',
                zitat: 'Der Wassertrupp rettet; … stellt die Wasserversorgung … her. Danach wird er beim Atemschutzeinsatz Sicherheitstrupp.' },
              istGruppe
                ? { t: 'Schlauchtrupp',
                    warum: 'Der Schlauchtrupp rettet zwar auch, ist aber für die Wasserversorgung ab dem Verteiler zuständig.',
                    zitat: 'Der Schlauchtrupp rettet; stellt für vorgehende Trupps die Wasserversorgung zwischen Strahlrohr und Verteiler her.' }
                : { t: 'Der Maschinist geht mit rein',
                    warum: 'Der Maschinist bleibt an der Pumpe. Ohne ihn gibt es kein Wasser.',
                    zitat: 'Der Maschinist ist Fahrer und bedient die Feuerlöschkreiselpumpe.' },
            ]),
            danach: naechsterSchritt,
          }) },

        /* --- 5. Der Befehl wird ausgeführt ------------------------------ */
        { tun: () => ablauf({
            titel: 'Du gibst den Befehl',
            blick: [EO.fzgVorn, EO.heck, EO.verteiler, EO.tuer],
            kommando: 'Wasserentnahmestelle Unterflurhydrant. Verteiler an der Hofeinfahrt. Angriffstrupp zur Menschenrettung mit 1. Rohr in das Erdgeschoss über die Haustür. Vor!',
            text: 'Der Angriffstruppführer wiederholt ab „Einheit". Dann läuft alles gleichzeitig los.',
            dauer: 5.5,
            tun: () => {
              hydrant.visible = true;
              // Angriffstrupp setzt den Verteiler
              truppLaufen('A', [[EO.verteiler[0] - .5, EO.verteiler[2] + .5],
                                [EO.verteiler[0] + .5, EO.verteiler[2] + .6]], () => {
                verteiler.visible = true;
                Audio3.treffer();
              });
              // Wassertrupp legt die B-Leitung – vom Heck aus, nicht quer durchs Fahrzeug
              setTimeout(() => {
                truppLaufen('W', [[-4.6, 2.6], [-3.8, 2.9]], () => {
                  schlauchLegen('b1', [heckPunkt(0), [-5.0, .16, 2.4], [-2.0, .16, .6],
                                       alsPunkt(eingangWelt())], 'B', 1.8);
                });
              }, 700);
            },
            danach: naechsterSchritt,
          }) },

        /* --- 6. Wasser marsch ------------------------------------------- */
        { tun: () => entscheidung({
            titel: 'Wasserversorgung',
            blick: [EO.hydrant, EO.fzgVorn, EO.heck, EO.verteiler],
            frage: 'Die B-Leitung liegt vom Fahrzeugheck zum Verteiler. Wer kuppelt den Verteiler an und kommandiert „Verteiler Wasser marsch!"?',
            optionen: shuffle([
              { t: 'Der Wassertrupp', gut: true,
                warum: 'Er hat die Leitung gelegt, er kuppelt an, er gibt das Kommando. Danach geht er um das Fahrzeug herum und stellt die Verbindung zum Hydranten her.',
                zitat: 'Er kuppelt den Verteiler an die B-Schlauchleitung an. … gibt dem Maschinisten das Kommando: „Wasser marsch!"' },
              { t: 'Der Angriffstrupp',
                warum: 'Der Angriffstrupp setzt den Verteiler – ankuppeln und „Verteiler Wasser marsch!" macht der Wassertrupp. Anders ist es nur, wenn der Verteiler schon fertig an der B-Leitung hängt.',
                zitat: 'Der Angriffstrupp setzt den Verteiler.' },
              { t: 'Der Maschinist selbst',
                warum: 'Der Maschinist bedient die Pumpe – aber er wartet auf das Kommando.',
                zitat: 'Der Maschinist … bedient die Feuerlöschkreiselpumpe.' },
            ]),
            danach: (gut) => {
              Audio3.kommando('Verteiler Wasser marsch!');
              Audio3.wasser();
              /* Um das Fahrzeug herum zum Hydranten – nicht hindurch. Und dort
                 erst arbeiten: Kappe auf, Standrohr einschrauben, dann
                 ankuppeln. Ein Unterflurhydrant gibt ohne Standrohr nichts her. */
              truppLaufen('W', [[EO.hydrant[0] + 1.4, EO.gasse - .4], [EO.hydrant[0] + .6, EO.gasse - 1.1]], () => {
                hydrant.userData.deckelOeffnen(true);
                Audio3.treffer();
                hydrant.userData.standrohrSetzen(true);
                setTimeout(() => {
                  const an = hydrant.position.clone().add(hydrant.userData.anschluss());
                  schlauchLegen('b2', [heckPunkt(.9), [-8.6, .16, EO.gasse],
                                       [-16.5, .16, EO.gasse], alsPunkt(an)], 'B', 1.8);
                }, 700);
              });
              naechsterSchritt();
            },
          }) },

        /* --- 7. Wer legt die C-Leitung? (der Kern-Unterschied) ---------- */
        { tun: () => entscheidung({
            titel: istGruppe ? 'Wasserversorgung ab Verteiler' : 'Wasserversorgung ab Verteiler – aber wie?',
            lage: istGruppe
              ? 'Der Verteiler steht, Wasser ist drauf. Jetzt muss die C-Leitung vom Verteiler zur Haustür.'
              : 'Der Verteiler steht, Wasser ist drauf. Jetzt muss die C-Leitung vom Verteiler zur Haustür – nur: einen Schlauchtrupp habt ihr nicht.',
            frage: 'Wer verlegt die Schläuche vom Verteiler zum Strahlrohr?',
            optionen: istGruppe
              ? shuffle([
                  { t: 'Der Schlauchtrupp', gut: true,
                    warum: 'Genau dafür ist er da: Wasserversorgung zwischen Verteiler und Strahlrohr. Danach bedient er den Verteiler.',
                    zitat: 'Der Schlauchtrupp … stellt für vorgehende Trupps die Wasserversorgung zwischen Strahlrohr und Verteiler her.' },
                  { t: 'Der Angriffstrupp selbst',
                    warum: 'Nur wenn kein Schlauchtrupp da ist. Hier ist einer da – der soll das machen, damit der Angriffstrupp schneller rein kann.',
                    zitat: 'Er verlegt seine Schlauchleitung, sofern kein Schlauchtrupp zur Unterstützung bereit steht.' },
                  { t: 'Der Wassertrupp',
                    warum: 'Der Wassertrupp ist bis zum Verteiler zuständig – ab dem Verteiler übernimmt der Schlauchtrupp.',
                    zitat: 'Der Wassertrupp stellt die Wasserversorgung vom Löschfahrzeug zum Verteiler … her.' },
                ])
              : shuffle([
                  { t: 'Der Angriffstrupp selbst', gut: true,
                    warum: 'Kein Schlauchtrupp da – also macht der Angriffstrupp seine Schlauchleitung selbst. Genau das steht in der Vorschrift.',
                    zitat: 'Der Angriffstrupp … verlegt seine Schlauchleitung, sofern kein Schlauchtrupp zur Unterstützung bereit steht.' },
                  { t: 'Der Wassertrupp – der hat ja gerade Zeit',
                    warum: 'Der Wassertrupp wird gleich als Sicherheitstrupp gebraucht. Der muss einsatzbereit bleiben.',
                    zitat: 'Danach wird er beim Atemschutzeinsatz Sicherheitstrupp.' },
                  { t: 'Der Maschinist',
                    warum: 'Der Maschinist bleibt an der Pumpe – die darf nicht unbeaufsichtigt laufen.',
                    zitat: 'Der Maschinist … bedient die Feuerlöschkreiselpumpe sowie die im Löschfahrzeug eingebauten Aggregate.' },
                ]),
            danach: () => {
              const leger = istGruppe ? 'S' : 'A';
              truppLaufen(leger, [[.4, -1.8], [1.1, -1.4]], () => {
                schlauchLegen('c1', [[EO.verteiler[0] + .2, .16, EO.verteiler[2] + .1],
                                     [1.0, .1, -2.2], [EO.tuer[0], .12, EO.tuer[2] + .3]], 'C', 1.5);
              });
              naechsterSchritt();
            },
          }) },

        /* --- 8. Sicherheitstrupp ---------------------------------------- */
        { tun: () => entscheidung({
            titel: 'Vor dem Innenangriff',
            frage: 'Der Angriffstrupp geht gleich unter Atemschutz rein. Wer wird jetzt Sicherheitstrupp?',
            optionen: shuffle([
              { t: 'Der Wassertrupp', gut: true,
                warum: 'Sobald er die Wasserversorgung stehen hat, rüstet er sich als Sicherheitstrupp aus und meldet sich einsatzbereit.',
                zitat: 'Der Wassertrupp rüstet sich nun im Falle eines Atemschutzeinsatzes des Angriffstrupps mit Atemschutzgeräten als Sicherheitstrupp aus.' },
              istGruppe
                ? { t: 'Der Schlauchtrupp',
                    warum: 'Der Schlauchtrupp bedient den Verteiler und unterstützt. Sicherheitstrupp ist der Wassertrupp.',
                    zitat: 'Der Wassertruppführer meldet dem Einheitsführer: „Wassertrupp als Sicherheitstrupp einsatzbereit!"' }
                : { t: 'Der Maschinist',
                    warum: 'Ein Sicherheitstrupp besteht aus zwei Kräften unter Atemschutz. Der Maschinist bleibt an der Pumpe.',
                    zitat: 'Der Sicherheitstrupp ist ein mit Atemschutzgeräten ausgerüsteter Trupp.' },
              { t: 'Keiner – das dauert zu lange',
                warum: 'Ohne Sicherheitstrupp geht niemand unter Atemschutz rein. Der Trupp drinnen muss sich darauf verlassen können, dass jemand kommt.',
                zitat: 'Der Sicherheitstrupp … hat die Aufgabe, bereits eingesetzten Atemschutztrupps im Notfall unverzüglich Hilfe zu leisten.' },
            ]),
            danach: () => {
              truppLaufen('W', [[-1.4, 1.0], [-.7, 1.2]]);
              naechsterSchritt();
            },
          }) },

        /* --- 9. Innenangriff: was heisst „staendige Wasserabgabe"? ------- */
        { tun: () => entscheidung({
            titel: 'Der kritische Moment',
            lage: 'Der Angriffstrupp steht an der Haustür, Strahlrohr angekuppelt, am Verteiler liegt Wasser an. Nur: Der Wassertrupp ist noch am Hydranten – gespeist wird also bis auf Weiteres aus dem Tank des Fahrzeugs.',
            frage: 'Schickst du den Angriffstrupp jetzt rein?',
            optionen: [
              { t: 'Ja – der Tank sichert die Wasserabgabe, bis der Hydrant steht', gut: true,
                warum: 'Genau. Die Vorschrift verlangt eine ständige Wasserabgabe – nicht zwingend schon den Hydranten. Das mitgeführte Löschwasser wird ausdrücklich als Beispiel genannt. Der Maschinist behält den Tankinhalt im Blick und meldet, wenn es knapp wird.',
                zitat: 'Mit dem Innenangriff darf erst begonnen werden, wenn eine ständige Wasserabgabe sichergestellt ist, z. B. wenn das mitgeführte Löschwasser bis zum Aufbau einer Löschwasserversorgung ausreicht.' },
              { t: 'Nein – erst wenn der Hydrant angeschlossen ist',
                warum: 'Damit verschenkst du Zeit, die die Person im Haus nicht hat. Dafür ist der Tank da: Er überbrückt genau die Minuten, bis die Versorgung steht. Warten musst du nur, wenn der Tankinhalt dafür nicht reicht.',
                zitat: 'Mit dem Innenangriff darf erst begonnen werden, wenn eine ständige Wasserabgabe sichergestellt ist, z. B. wenn das mitgeführte Löschwasser bis zum Aufbau einer Löschwasserversorgung ausreicht.' },
              { t: 'Ja – rein geht es immer, Wasser kommt schon noch',
                warum: 'Nein. Ohne gesicherte Wasserabgabe geht niemand in den Brandrauch. Der Unterschied ist: Hier IST sie gesichert – durch den Tank im Fahrzeug.',
                zitat: 'Mit dem Innenangriff darf erst begonnen werden, wenn eine ständige Wasserabgabe sichergestellt ist.' },
            ],
            danach: (gut) => {
              if (!gut) return nachgehakt();
              innenangriff();
            },
          }) },
      ];

      /* --- Nachgehakt: die Regel hat zwei Seiten ------------------------- */
      const nachgehakt = () => {
        ablauf({
          titel: 'Nachgehakt',
          blick: [EO.verteiler, EO.tuer, [EO.brand[0], 4, EO.brand[2]]],
          kommando: 'Rohr gibt kein Wasser!',
          text: 'So klingt es, wenn wirklich nichts anliegt: Das Strahlrohr spuckt kurz, dann ist Schluss – und der Trupp muss sofort zurück. Genau davor schützt die Regel. Sie verlangt aber nur eine ständige Wasserabgabe, und die liefert auch der Tank im Fahrzeug. Steht die B-Leitung zum Verteiler und ist der Tank voll, darf der Trupp vor.',
          zitat: 'Mit dem Innenangriff darf erst begonnen werden, wenn eine ständige Wasserabgabe sichergestellt ist, z. B. wenn das mitgeführte Löschwasser bis zum Aufbau einer Löschwasserversorgung ausreicht.',
          dauer: 3.6,
          tun: () => {
            strahl.visible = true; strahl.userData.an = true;
            strahl.userData.setzen(new THREE.Vector3(EO.tuer[0], 1.1, EO.tuer[2] + .4),
                                   new THREE.Vector3(EO.brand[0], 1.6, EO.brand[2]));
            setTimeout(() => { strahl.userData.an = false; strahl.visible = false; }, 900);
          },
          danach: innenangriff,
        });
      };

      /* --- Innenangriff und Löschen -------------------------------------- */
      const innenangriff = () => {
        ablauf({
          titel: 'Innenangriff',
          blick: [EO.verteiler, EO.tuer, [EO.brand[0], 5, EO.brand[2]]],
          kommando: 'Erstes Rohr Wasser marsch!',
          text: 'Wasser steht. Der Angriffstrupp geht unter Atemschutz vor, der Sicherheitstrupp ist bereit. Jetzt zählt jede Sekunde für die Person im Haus.',
          dauer: 4.5,
          tun: () => {
            
            Audio3.wasser();
            strahl.visible = true; strahl.userData.an = true;
            strahl.userData.setzen(new THREE.Vector3(EO.tuer[0] - .2, 1.15, EO.tuer[2] + .6),
                                   new THREE.Vector3(EO.brand[0], 1.7, EO.brand[2]));
            truppLaufen('A', [[EO.tuer[0] - .3, EO.tuer[2] + .8], [EO.tuer[0] + .4, EO.tuer[2] + 1.0]]);
            Bewegung.neu(4.0, (p) => { feuer.userData.staerke = 1 - p * .82; }, null, false);
          },
          danach: () => zweitesRohr(),
        });
      };

      /* --- Zweites Rohr: hier trennt sich Gruppe von Staffel ------------- */
      const zweitesRohr = () => {
        if (istGruppe) {
          entscheidung({
            titel: 'Zweites Rohr',
            lage: 'Das Feuer geht zurück, aber im Nebenraum brennt es weiter. Du willst ein zweites Rohr vornehmen.',
            frage: 'Wer nimmt beim Atemschutzeinsatz das zweite Rohr vor?',
            optionen: shuffle([
              { t: 'Der Schlauchtrupp', gut: true,
                warum: 'Genau so steht es in der Vorschrift. Der Wassertrupp bleibt Sicherheitstrupp und muss einsatzbereit bleiben.',
                zitat: 'Beim Atemschutzeinsatz nimmt der Schlauchtrupp das zweite Rohr vor.' },
              { t: 'Der Wassertrupp',
                warum: 'Der ist Sicherheitstrupp. Wenn der ein Rohr vornimmt, hat der Trupp im Haus keine Rückversicherung mehr.',
                zitat: 'Beim Atemschutzeinsatz muss grundsätzlich die Einsatzbereitschaft des Sicherheitstrupps sichergestellt sein.' },
              { t: 'Der Melder',
                warum: 'Der Melder arbeitet auf Befehl – er kann zum Beispiel den Verteiler bedienen, aber kein Rohr vornehmen.',
                zitat: 'Der Melder bedient auf Befehl den Verteiler.' },
            ]),
            danach: () => {
              truppLaufen('S', [[2.4, -2.4], [3.0, -2.0]], () => {
                schlauchLegen('c2', [[EO.verteiler[0] + .3, .16, EO.verteiler[2] + .2],
                                     [2.2, .1, -2.4], [3.2, .12, -3.6]], 'C', 1.2);
              });
              Bewegung.neu(3.0, (p) => { feuer.userData.staerke = .18 * (1 - p); }, null, false);
              naechsterSchritt();
            },
          });
          schritte.push({ tun: () => abschlussSchritt() });
        } else {
          entscheidung({
            titel: 'Zweites Rohr – als Staffel',
            lage: 'Das Feuer geht zurück, aber im Nebenraum brennt es weiter. Ein zweites Rohr wäre gut. Deine Staffel: Führer, Maschinist, Angriffstrupp (drinnen), Wassertrupp (Sicherheitstrupp).',
            frage: 'Was machst du?',
            optionen: [
              { t: 'Kein zweites Rohr – ich fordere Verstärkung nach', gut: true,
                warum: 'Genau das ist die Grenze der Staffel. Der Angriffstrupp ist gebunden, der Wassertrupp muss als Sicherheitstrupp bereitstehen. Es ist schlicht niemand mehr da.',
                zitat: 'Beim Atemschutzeinsatz muss grundsätzlich die Einsatzbereitschaft des Sicherheitstrupps sichergestellt sein.' },
              { t: 'Der Wassertrupp nimmt das zweite Rohr vor',
                warum: 'Dann hätte der Trupp im Haus keinen Sicherheitstrupp mehr. Das darfst du nicht.',
                zitat: 'Beim Atemschutzeinsatz muss grundsätzlich die Einsatzbereitschaft des Sicherheitstrupps sichergestellt sein.' },
              { t: 'Der Maschinist und ich nehmen das Rohr',
                warum: 'Der Maschinist bleibt an der Pumpe, und du musst führen. Beides ist nicht verhandelbar.',
                zitat: 'Der Einheitsführer führt seine taktische Einheit. Er ist für die Sicherheit der Mannschaft verantwortlich.' },
            ],
            danach: () => {
              Bewegung.neu(3.5, (p) => { feuer.userData.staerke = .18 * (1 - p); }, null, false);
              naechsterSchritt();
            },
          });
          schritte.push({ tun: () => abschlussSchritt() });
        }
      };

      const abschlussSchritt = () => {
        strahl.userData.an = false; strahl.visible = false;
        feuer.userData.staerke = 0;
        ablauf({
          titel: 'Feuer aus',
          blick: [EO.fzgVorn, EO.heck, EO.verteiler, EO.tuer, [EO.brand[0], 6, EO.brand[2]]],
          kommando: 'Zum Abmarsch fertig!',
          text: 'Die Person ist gerettet, das Feuer ist aus. Der Maschinist schaltet die Pumpe ab, alle Geräte kommen zurück ans Fahrzeug. Erst wenn er „Fahrzeug fahrbereit!" meldet, geht es heim.',
          zitat: 'Die Mannschaft tritt am Löschfahrzeug an … Er meldet daraufhin dem Einheitsführer: „Fahrzeug fahrbereit!"',
          dauer: 3.0,
          tun: () => {
            const k = konfetti(80);
            k.position.set(0, 2.5, 0);
            Stage.welt.add(k);
            const fn = Stage.anmelden((dt) => { if (!k.userData.update(dt)) { Stage.welt.remove(k); Stage.abmelden(fn); } });
            Audio3.fanfare();
          },
          danach: () => rundeEnde(),
        });
      };

      const rundeEnde = () => {
        const gesamt = protokoll.length;
        const richtig = protokoll.filter(p => p.gut).length;
        const guete = gesamt ? richtig / gesamt : 1;
        const abz = [];
        if (modus === 'gruppe') abz.push('gruppe');
        if (modus === 'staffel') abz.push('staffel');
        if (fehler === 0) abz.push('perfekt');

        if (State.modus === 'solo') {
          State.levelFertig('loeschangriff-' + modus, guete);
        }

        UI.zeige('l8-rundeende', (s) => {
          const anderer = modus === 'gruppe' ? 'staffel' : 'gruppe';
          const schonGemacht = State.levelBest('loeschangriff-' + anderer) > 0;
          const panel = seitenLayout(s, [
            el('div', { style: { fontSize: '2.6em' }, text: fehler === 0 ? '🏅' : guete >= .7 ? '👏' : '💪' }),
            el('h3', { text: modus === 'gruppe' ? 'Löschangriff als Gruppe' : 'Löschangriff als Staffel' }),
            el('div', { class: 'note', style: { fontSize: 'clamp(2rem,6vw,3rem)' }, text: `${richtig}/${gesamt}` }),
            el('p', { class: 'hinweis', style: { margin: 0 },
              text: fehler === 0 ? 'Kein einziger Fehler. Genau so läuft ein Löschangriff.'
                                 : `${fehler} Entscheidung${fehler > 1 ? 'en' : ''} war${fehler > 1 ? 'en' : ''} nicht optimal – aber daraus lernt man am meisten.` }),
            el('div', { class: 'feedback', style: { width: '100%' } },
              el('b', { text: modus === 'gruppe' ? 'Das war die volle Besetzung' : 'Das war die Staffel' }),
              el('span', { text: modus === 'gruppe'
                ? 'Neun Personen, drei Trupps, alles besetzt. Spiel den Einsatz jetzt als Staffel – du wirst merken, wo es eng wird.'
                : 'Sechs Personen. Kein Melder, kein Schlauchtrupp. Der Angriffstrupp musste seine Leitung selbst legen, und für ein zweites Rohr war schlicht niemand mehr da.' })),
            !schonGemacht ? el('button', {
              class: 'btn gross gelb',
              onclick: () => { Audio3.klick(); einsatzStarten(anderer); },
            }, modus === 'gruppe' ? 'Jetzt als Staffel →' : 'Jetzt als Gruppe →') : null,
            el('button', {
              class: 'btn ' + (schonGemacht ? 'gross' : 'geist'),
              onclick: () => {
                Audio3.klick();
                api.fertig({
                  guete, xp: 100 + richtig * 15,
                  titel: `Löschangriff als ${modus === 'gruppe' ? 'Gruppe' : 'Staffel'}: ${richtig} von ${gesamt} richtig`,
                  abzeichen: abz,
                  zeilen: schonGemacht ? [
                    el('span', { html: '<b>Gruppe (1/8/9):</b> Schlauchtrupp legt die C-Leitung, nimmt beim Atemschutzeinsatz das zweite Rohr vor.' }),
                    el('span', { html: '<b>Staffel (1/5/6):</b> Kein Melder, kein Schlauchtrupp. Angriffstrupp legt selbst, zweites Rohr geht nicht.' }),
                    el('span', { html: '<b>Reihenfolge des Verzichts:</b> erst Melder, dann Schlauchtrupp, dann Wassertrupp.' }),
                  ] : [
                    el('span', { text: 'Spiel den Einsatz auch mit der anderen Einheit – der Vergleich ist der eigentliche Lerneffekt.' }),
                  ],
                });
              },
            }, schonGemacht ? 'Auswertung →' : 'Für heute reicht’s'),
          ], { obenBreit: 0, obenSchmal: 0, rechtsBreit: 0 });
          return blickWache(null, panel);
        });
      };

      // Ablauf starten
      naechsterSchritt();
    };

    /* ===== Einheit wählen ================================================ */
    const einheitWaehlen = () => {
      Stage.kameraSetzen([-6.0, 10.2, 25.5], [-3.4, 2.4, -2.0]);
      feuer.userData.staerke = 1;
      UI.zeige('l8-wahl', (s) => {
        const karte = (art, name, staerke, fzgName, text) => el('button', {
          class: 'moduskarte', style: { '--f': art === 'gruppe' ? 'var(--rot)' : 'var(--blau)', width: '100%' },
          onclick: () => { Audio3.klick(); einsatzStarten(art); },
        },
          el('span', { class: 'ic', text: art === 'gruppe' ? '🚒' : '🚐' }),
          el('b', { text: `${name}  ·  ${staerke}` }),
          el('span', { text: `${fzgName} — ${text}` }),
          State.levelBest('loeschangriff-' + art) > 0
            ? el('span', { class: 'chip', style: { marginTop: '8px' }, text: '✓ schon gespielt' }) : null);

        const panel = seitenLayout(s, [
          el('div', { class: 'dienstvorschrift', text: 'Boss-Level' }),
          el('h3', { text: 'Mit welcher Einheit rückst du aus?' }),
          el('p', { class: 'klein', style: { margin: 0 },
            text: 'Gleiche Lage, gleiches Haus, gleiche Person im Gebäude. Nur die Mannschaft ist anders. Spiel am besten beide.' }),
          karte('gruppe', 'Gruppe', '1/8/9', 'LF', 'Alles besetzt: Melder, Angriffs-, Wasser- und Schlauchtrupp.'),
          karte('staffel', 'Staffel', '1/5/6', 'KLF', 'Ohne Melder, ohne Schlauchtrupp. Wird eng.'),
        ], { obenBreit: 0, obenSchmal: 0, rechtsBreit: 0 });
        return blickWache(null, panel);
      });
    };

    /* ===== Einstieg ====================================================== */
    Stage.kameraSetzen([-6.0, 10.2, 25.5], [-3.4, 2.4, -2.0]);
    UI.zeige('l8-intro', (s) => {
      Audio3.martinshorn(2);
      const panel = seitenLayout(s, [
        el('div', { class: 'dienstvorschrift', text: 'Boss-Level' }),
        el('h3', { text: 'Der Löschangriff' }),
        el('p', { class: 'hinweis', style: { margin: 0 },
          text: 'Wohnhausbrand, eine Person vermisst. Du bist Einheitsführer und triffst jede Entscheidung selbst. Deine Mannschaft macht genau das, was du befiehlst – auch wenn es falsch ist.' }),
        el('div', { class: 'feedback', style: { width: '100%' } },
          el('b', { text: 'Zweimal derselbe Einsatz' }),
          el('span', { text: 'Einmal als Gruppe mit neun Leuten, einmal als Staffel mit sechs. Erst im Vergleich siehst du, was der Melder und der Schlauchtrupp wirklich wert sind.' })),
        el('button', { class: 'btn gross', onclick: () => { Audio3.klick(); einheitWaehlen(); } }, 'Einheit wählen →'),
      ], { obenBreit: 0, obenSchmal: 0, rechtsBreit: 0 });
      return blickWache(null, panel);
    });
  },
});
