/* ============================================================================
   Level 4 – Sitzordnung und Antreteordnung
   Nach den Unterlagen unserer Wehr: LF mit Gruppenbesatzung (3er- und
   4er-Bank gegenüber), KLF mit Staffelbesatzung (4er-Bank).
   Grundlage: FwDV 3, Nr. 3.1 und 3.2.
   ========================================================================== */
LEVELS.push({
  id: 'sitzordnung',
  name: 'Sitzen & Antreten',
  icon: '🚒',
  farbe: 'var(--blau)',
  kurz: 'Wer sitzt wo im LF und im KLF? Und wie tretet ihr nach „Absitzen!" an?',

  start(api) {
    let fehler = 0, teilPerfekt = 0;

    Stage.leeren();
    Stage.welt.add(baueBoden(70));
    // Die Strasse laeuft laengs zum Fahrzeug – sonst steht das LF quer darauf.
    // Bei der Antreteordnung rueckt sie nach links, damit die Mannschaft
    // neben der Fahrbahn antreten kann und nicht mitten darauf steht.
    const strasse = baueStrasse(60, 7.5);
    Stage.welt.add(strasse);
    Stage.welt.add(bei(new THREE.SpotLight(0xffffff, 420, 46, 1.0, .55, 2), 0, 16, 5));
    Stage.welt.add(new THREE.AmbientLight(0x9fb4d8, .55));
    Stage.welt.add(bei(new THREE.DirectionalLight(0x8fb4f0, 1.2), -6, 6, -8));

    let fzg = null;
    const figuren = [];
    Stage.anmelden((dt, t) => { belebeFiguren(figuren, dt, t); if (fzg) blaulichtUpdate(fzg, dt, t); });

    const aufraeumen = () => {
      HotSpots.beenden();
      figuren.forEach(f => Stage.welt.remove(f));
      figuren.length = 0;
      if (fzg) { Stage.welt.remove(fzg); fzg = null; }
    };

    /* ===== Baustein: Plätze besetzen ===================================== */
    /* plaetze: [{ id, x, z, soll, label }]  – Position in Fahrzeugkoordinaten
       oder (bei der Antreteordnung) relativ zum Fahrzeugheck.              */
    const platzAufgabe = (opt) => {
      // opt: { titel, hinweis, fahrzeugTyp, plaetze, imFahrzeug, kamera, merk, danach }
      aufraeumen();
      let eigeneFehler = 0;

      strasse.position.x = opt.strasseX || 0;
      fzg = baueFahrzeug(opt.fahrzeugTyp);
      fzg.position.set(0, 0, 0);
      fzg.userData.blaulichtAn = !opt.imFahrzeug;
      Stage.welt.add(fzg);
      if (opt.imFahrzeug) fahrzeugOeffnen(fzg, true);

      Stage.bildVersatz(0, 0);
      if (opt.draufsicht) Stage.draufsicht.apply(Stage, opt.draufsicht);
      else Stage.kameraSetzen(opt.kamera[0], opt.kamera[1], opt.kamera[2]);

      const offen = opt.plaetze.map(p => p.soll);
      const gesetzt = {};

      UI.zeige('l4-' + opt.id, (s) => {
        const schicht = HotSpots.starten(s);

        /* --- Ablagefelder direkt auf den Plätzen ---------------------- */
        opt.plaetze.forEach(p => {
          // Beim Antreten haengt das Schild ueber dem Kopf: sonst deckt es
          // in der Draufsicht genau die Figur zu, um die es geht.
          const welt = opt.imFahrzeug
            ? sitzWeltPos(fzg, p)
            : new THREE.Vector3(p.x, 1.72, p.z);
          const node = el('div', {
            class: 'ablage', 'data-platz': p.id,
            style: { width: '74px', height: '74px', borderRadius: '18px',
                     border: '2px dashed rgba(255,255,255,.55)', background: 'rgba(10,16,30,.55)',
                     display: 'grid', placeItems: 'center', fontWeight: '900', fontSize: '.92em',
                     backdropFilter: 'blur(3px)', color: 'var(--txt2)' },
          }, '?');
          if (!opt.imFahrzeug) node.style.marginTop = '-40px';
          HotSpots.hinzu(welt, node);
          p._node = node;
          p._welt = welt;
        });

        /* --- Chips zum Ziehen ------------------------------------------ */
        const vorrat = el('div', { style: { display: 'flex', gap: '7px', flexWrap: 'wrap', justifyContent: 'center' } });
        const chips = {};
        shuffle(offen.slice()).forEach((rolleId, n) => {
          const R = ROLE[rolleId];
          const chip = el('div', {
            class: 'panel', 'data-rolle': rolleId,
            style: { padding: '7px 12px', fontWeight: '800', fontSize: '.86em', cursor: 'grab',
                     borderColor: R.farbe + '88', display: 'flex', alignItems: 'center', gap: '.4em' },
          }, el('span', { style: { width: '10px', height: '10px', borderRadius: '3px', background: R.farbe } }),
             el('span', { text: R.name }));
          chips[rolleId] = chip;
          ziehbarMachen(chip, {
            daten: { rolleId },
            // grosszuegiger Fangbereich – zielen soll nicht das Spiel sein.
            // Bei der Antreteordnung liegen die Plaetze dichter beieinander,
            // deshalb faengt sie enger.
            radius: opt.fang || 170,
            aufAblage: (feld, daten, quelle) => {
              const pid = feld.dataset.platz;
              if (!pid || feld.dataset.filled) return;
              const platz = opt.plaetze.find(x => x.id === pid);
              if (platz.soll !== daten.rolleId) {
                eigeneFehler++; fehler++;
                Audio3.falsch();
                feld.classList.add('wackeln');
                setTimeout(() => feld.classList.remove('wackeln'), 500);
                UI.toast(hinweisFuer(platz, daten.rolleId, opt), 'schlecht', 2600);
                return;
              }
              feld.dataset.filled = daten.rolleId;
              feld.style.border = '2px solid ' + ROLE[daten.rolleId].farbe;
              feld.style.background = ROLE[daten.rolleId].farbe + '33';
              feld.style.color = '#fff';
              feld.textContent = ROLE[daten.rolleId].kurz;
              quelle.remove();
              Audio3.richtig();
              gesetzt[pid] = daten.rolleId;
              figurSetzen(platz, daten.rolleId, opt);
              if (Object.keys(gesetzt).length === opt.plaetze.length) {
                if (eigeneFehler === 0) teilPerfekt++;
                Audio3.fanfare();
                setTimeout(() => aufloesung(opt, eigeneFehler), 800);
              }
            },
          });
          vorrat.appendChild(chip);
        });

        const panel = seitenLayout(s, [
          el('div', { class: 'klein', text: opt.schrittText }),
          el('h3', { text: opt.titel }),
          el('p', { class: 'klein', style: { margin: 0 }, text: opt.hinweis }),
          el('div', { class: 'klein', text: 'Zieh die Karten auf die Plätze' }),
          vorrat,
        ], { obenBreit: 0, obenSchmal: 0, rechtsBreit: 0 });

        // Hotspot-Schicht ueber dem Panel halten
        s.appendChild(schicht);

        /* Bildausschnitt ausrichten: nicht nur an den Sitzplaetzen, sondern am
           ganzen Motiv (Kabine bzw. Fahrzeugheck). Sonst zoomt die Kamera so
           weit hinein, dass vom Fahrzeug nichts mehr zu sehen ist.          */
        const punkte = opt.plaetze.map(x => x._welt).concat(rahmenPunkte(opt));
        opt._punkte = punkte;          // der Loesungsbildschirm zeigt dasselbe Motiv
        const einpassen = () => {
          const frei = freieFlaeche(panel, 30, opt.fuellung || .86);
          // entartete Flaeche (Panel noch nicht vermessen) -> lieber ganzes Bild
          // klein und sichtbar schlaegt gross und hinter dem Bedienfeld
          const ziel = (frei.w < 120 || frei.h < 80) ? freieFlaeche(null, 30, .86) : frei;
          Stage.einpassen(punkte, ziel);
        };
        einpassen();
        requestAnimationFrame(() => requestAnimationFrame(einpassen));
        setTimeout(einpassen, 260);
        // Nicht nur auf die Fenstergroesse achten: auch das Bedienfeld aendert
        // beim Nachladen der Schrift noch seine Breite.
        let letzte = '';
        const wache = Stage.anmelden(() => {
          if (!panel.isConnected) return;   // abgeraeumter Bildschirm haelt still
          const r = panel.getBoundingClientRect();
          const jetzt = [innerWidth, innerHeight, Math.round(r.left), Math.round(r.top), Math.round(r.width)].join(',');
          if (jetzt !== letzte) { letzte = jetzt; einpassen(); }
        });
        // HotSpots bleiben stehen – der Loesungsbildschirm zeigt sie weiter
        return () => Stage.abmelden(wache);
      });
    };

    /* Eckpunkte des Motivs: bei der Sitzordnung die Fahrerkabine, beim
       Antreten das Fahrzeugheck. Damit bleibt das Fahrzeug immer im Bild. */
    const rahmenPunkte = (opt) => {
      const F = fzg.userData.F;
      const y = fzg.userData.bodenH + .55;
      const p = [];
      if (opt.imFahrzeug) {
        const z0 = -F.L / 2 - .15, z1 = -F.L / 2 + F.kabineL + .15;
        for (const x of [-F.B / 2 - .15, F.B / 2 + .15])
          for (const z of [z0, z1]) p.push(new THREE.Vector3(x, y, z));
      } else {
        /* Beim Antreten zaehlt die Mannschaft, nicht der Lack: Nur das hintere
           Stueck des Fahrzeugs muss sicher im Bild sein. Wuerde man die ganzen
           7,40 m verlangen, schrumpfen die Figuren auf Streichholzgroesse. */
        for (const x of [-F.B / 2, F.B / 2])
          for (const z of [F.L / 2 - 2.6, F.L / 2]) {
            p.push(new THREE.Vector3(x, .3, z));
            p.push(new THREE.Vector3(x, F.H, z));
          }
      }
      return p;
    };

    /* Gezielter Hinweis statt bloßem „falsch" */
    const hinweisFuer = (platz, gewaehlt, opt) => {
      const richtig = ROLE[platz.soll].name;
      if (platz.reihe === 'Fahrerhaus')
        return 'Im Fahrerhaus sitzen nur Einheitsführer und Maschinist.';
      if (platz.reihe === 'Führer')
        return 'Ganz vorne steht der Einheitsführer – vor seiner Einheit.';
      if (platz.reihe === 'vorn')
        return 'In die vordere Reihe gehören der Maschinist und die Truppführer.';
      if (platz.reihe === 'hinten')
        return 'In die hintere Reihe gehören der Melder und die Truppmänner.';
      if (opt.fahrzeugTyp === 'lf' && platz.reihe === '3er-Bank')
        return 'Denk an den Merksatz: Alle MEiden Atemgifte – A, Me, A.';
      if (opt.fahrzeugTyp === 'lf')
        return 'Denk an den Merksatz: Wasser Sucht Seinen Weg – W, S, S, W.';
      return 'Auf der 4er-Bank sitzt der Angriffstrupp außen, der Wassertrupp innen.';
    };

    /* Figur auf den Platz stellen */
    const figurSetzen = (platz, rolleId, opt) => {
      const f = figurFuerRolle(rolleId, { pa: !!platz.pa });
      if (opt.imFahrzeug) {
        // sitzend andeuten: kleiner und tiefer
        const w = sitzWeltPos(fzg, platz);
        f.position.set(w.x, w.y - 1.42, w.z);
        f.scale.setScalar(.82);
        f.rotation.y = platz.reihe === '3er-Bank' ? 0 : Math.PI;
      } else {
        // Mannschaft blickt zum Einheitsführer, der ihr gegenübersteht
        f.position.set(platz.x, 0, platz.z);
        f.rotation.y = platz.reihe === 'Führer' ? Math.PI : 0;
      }
      Stage.welt.add(f); figuren.push(f);
    };

    /* ===== Auflösung mit Merksatz ======================================== */
    const aufloesung = (opt, eigeneFehler) => {
      if (opt.imFahrzeug) fahrzeugOeffnen(fzg, true);

      UI.zeige('l4-loesung-' + opt.id, (s) => {
        const schicht = HotSpots.schicht;
        const panel = seitenLayout(s, [
          el('div', { style: { fontSize: '2.2em' }, text: eigeneFehler === 0 ? '🎯' : '👍' }),
          el('h3', { text: opt.titel + ' sitzt' }),
          opt.merk ? el('div', {
            class: 'panel', style: { width: '100%', borderColor: 'var(--gelb)', background: 'rgba(255,210,63,.1)' },
          },
            el('div', { class: 'klein', text: opt.merk.titel || 'Merksatz' }),
            el('b', { style: { fontSize: '1.06em', lineHeight: 1.25, display: 'block', margin: '.2em 0' }, text: opt.merk.spruch }),
            el('span', { class: 'klein', text: opt.merk.erklaert })) : null,
          opt.zusatz ? el('p', { class: 'klein', style: { margin: 0 }, text: opt.zusatz }) : null,
          opt.zitat ? UI.zitat(opt.zitat) : null,
          el('button', { class: 'btn gross', onclick: () => { Audio3.klick(); opt.danach(); } }, 'Weiter →'),
        ], { obenBreit: 0, obenSchmal: 0, rechtsBreit: 0 });
        if (schicht) s.appendChild(schicht);

        // gleiches Motiv, aber das Bedienfeld ist jetzt anders hoch – also
        // den Ausschnitt neu bestimmen statt den alten zu erben
        const punkte = opt._punkte || [];
        let letzte = '';
        const wache = Stage.anmelden(() => {
          if (!panel.isConnected) return;   // abgeraeumter Bildschirm haelt still
          const r = panel.getBoundingClientRect();
          const k = [innerWidth, innerHeight, Math.round(r.left), Math.round(r.top), Math.round(r.width)].join(',');
          if (k === letzte || !punkte.length) return;
          letzte = k;
          const frei = freieFlaeche(panel, 30, opt.fuellung || .86);
          Stage.einpassen(punkte, (frei.w < 120 || frei.h < 80) ? freieFlaeche(null, 30, .86) : frei);
        });
        return () => Stage.abmelden(wache);
      });
    };

    /* ===== Die vier Aufgaben ============================================= */
    const aufgabeLF = () => platzAufgabe({
      id: 'lf', schrittText: 'Aufgabe 1 von 3',
      titel: 'Sitzordnung LF',
      hinweis: 'Gruppenbesatzung 1/8/9. Vorne Fahrerhaus, dahinter die 3er-Bank, gegenüber die 4er-Bank.',
      fahrzeugTyp: 'lf', imFahrzeug: true,
      plaetze: FAHRZEUGE.lf.sitze,
      draufsicht: [-1.05, 5.9, 4.1, 1.22], fuellung: .84,
      merk: MERKSPRUECHE.lf,
      zitat: 'Sitzordnung beim Ausrücken oder nach dem Kommando „Aufsitzen!". Durch eine andere Anordnung der Atemschutzgeräte im Mannschaftsraum kann sich die Sitzordnung ändern.',
      danach: aufgabeKLF,
    });

    const aufgabeKLF = () => platzAufgabe({
      id: 'klf', schrittText: 'Aufgabe 2 von 3',
      titel: 'Sitzordnung KLF',
      hinweis: 'Staffelbesatzung 1/5/6. Kein Melder, kein Schlauchtrupp – nur eine 4er-Bank hinten.',
      fahrzeugTyp: 'klf', imFahrzeug: true,
      plaetze: FAHRZEUGE.klf.sitze,
      draufsicht: [-0.60, 4.9, 3.5, 1.13], fuellung: .84,
      merk: MERKSPRUECHE.klf,
      zusatz: 'Kleiner, aber wichtiger Unterschied: Weil das KLF mit Staffel besetzt ist, heißt der Mann auf dem Beifahrersitz hier Staffelführer – nicht Gruppenführer. Der Sitzplatz ist derselbe.',
      danach: aufgabeAntreten,
    });

    const aufgabeAntreten = () => platzAufgabe({
      id: 'antreten', schrittText: 'Aufgabe 3 von 3',
      titel: 'Antreteordnung',
      hinweis: 'Nach „Absitzen!" tritt die Mannschaft hinter dem Fahrzeug an – neben der Fahrbahn, nicht darauf. Am Fahrzeug Maschinist und Melder, rechts daneben Angriffs-, Wasser- und Schlauchtrupp.',
      fahrzeugTyp: 'lf', imFahrzeug: false,
      plaetze: ANTRETEN.gruppe,
      strasseX: -2.0,
      // Blick wie in unserer Zeichnung: Fahrzeug links, die Mannschaft rechts
      // daneben in zwei Reihen. Die Kamera steht hinter dem Einheitsführer,
      // ziemlich steil – sonst verdeckt die vordere Reihe die hintere.
      kamera: [[4.8, 12.9, 13.0], [4.8, .8, 6.4], null], fuellung: .74, fang: 85,
      merk: MERKSPRUECHE.antreten,
      zitat: 'Die Mannschaft sitzt nach dem Eintreffen an der Einsatzstelle erst ab, nachdem der Einheitsführer das Kommando „Absitzen!" gegeben hat. Danach tritt die Mannschaft grundsätzlich hinter dem Fahrzeug wie folgt an.',
      danach: () => schlussFragen(),
    });

    /* ===== Kontrollfragen ================================================= */
    const schlussFragen = () => {
      HotSpots.beenden();
      const fragen = [
        {
          frage: 'Wann darf die Mannschaft absitzen?',
          antworten: ['Sobald das Fahrzeug steht', 'Wenn der Maschinist die Handbremse zieht',
                      'Erst nach dem Kommando „Absitzen!" des Einheitsführers', 'Wenn der Angriffstrupp fertig ist'],
          richtig: 2,
          erklaerung: 'Der Einheitsführer entscheidet, ob und wo abgesessen wird – zum Beispiel auf der verkehrsabgewandten Seite.',
          zitat: 'Die Mannschaft sitzt nach dem Eintreffen an der Einsatzstelle erst ab, nachdem der Einheitsführer das Kommando „Absitzen!" gegeben hat.',
        },
        {
          frage: 'Nach dem Kommando „Gefahr – Alle sofort zurück!" – wie tritt die Mannschaft an?',
          antworten: ['Gar nicht, jeder rennt weg', 'In derselben Aufstellung wie nach „Absitzen!"',
                      'In einer Reihe vor dem Fahrzeug', 'Am Verteiler'],
          richtig: 1,
          erklaerung: 'Genau deshalb übt man die Antreteordnung: Der Einheitsführer sieht auf einen Blick, ob alle da sind.',
          zitat: 'Nach dem Kommando „Gefahr – Alle sofort zurück!" tritt die Mannschaft in gleicher Aufstellung wie nach dem Kommando „Absitzen!" an.',
        },
        {
          frage: 'Warum kann sich die Sitzordnung im Fahrzeug einmal ändern?',
          antworten: ['Weil der Gruppenführer es so will', 'Wenn die Atemschutzgeräte anders angeordnet sind',
                      'Bei Regen', 'Wenn es schnell gehen muss'],
          richtig: 1,
          erklaerung: 'Der Angriffstrupp muss dort sitzen, wo er sich während der Fahrt mit Atemschutz ausrüsten kann.',
          zitat: 'Durch eine andere Anordnung der Atemschutzgeräte im Mannschaftsraum kann sich die Sitzordnung ändern.',
        },
      ];

      UI.zeige('l4-schluss', (s) => {
        Stage.bildVersatz(0, BREIT() ? .1 : 0);
        frageReihe(s, fragen, (richtig, gesamt) => {
          const guete = clamp((teilPerfekt / 3) * .6 + (richtig / gesamt) * .4 - fehler * .03, 0, 1);
          api.fertig({
            guete,
            xp: 60 + teilPerfekt * 20 + richtig * 15,
            titel: `${teilPerfekt} von 3 Ordnungen fehlerfrei${fehler ? ` · ${fehler} Fehlversuch${fehler > 1 ? 'e' : ''}` : ''}`,
            abzeichen: fehler === 0 ? ['sitzordnung'] : [],
            zeilen: [
              el('span', { html: '<b>LF:</b> Alle MEiden Atemgifte, Wasser Sucht Seinen Weg' }),
              el('span', { html: '<b>Antreten:</b> AWS – Alle Wollen Spritzen' }),
              el('span', { html: '<b>Vorne:</b> Maschinist und Truppführer · <b>hinten:</b> Melder und Truppmänner' }),
            ],
          });
        }, (i, n) => el('div', { style: { paddingTop: '4px' } }, UI.schritte(n, i)));
      });
    };

    /* ===== Einstieg ======================================================= */
    fzg = baueFahrzeug('lf');
    Stage.welt.add(fzg);
    fzg.userData.blaulichtAn = true;
    Stage.kameraSetzen([4.5, 3.0, 8.5], [0, 1.2, 0]);
    UI.zeige('l4-intro', (s) => {
      seitenLayout(s, [
        el('div', { class: 'dienstvorschrift', text: 'Level 4' }),
        el('h3', { text: 'Sitzen & Antreten' }),
        el('p', { class: 'hinweis', style: { margin: 0 },
          text: 'Jeder Platz im Fahrzeug gehört einer Funktion – damit auf der Alarmfahrt niemand überlegen muss. Und nach dem Absitzen steht jeder an seinem Platz.' }),
        el('p', { class: 'klein', style: { margin: 0 },
          text: 'Wir nehmen unser LF mit Gruppenbesatzung und unser KLF mit Staffelbesatzung.' }),
        el('button', { class: 'btn gross', onclick: () => { Audio3.klick(); aufgabeLF(); } }, 'Einsteigen →'),
      ], { obenBreit: .04, obenSchmal: .3, rechtsBreit: .18 });
    });
  },
});
