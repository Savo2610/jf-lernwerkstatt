/* ============================================================================
   Aufgabe 5 – Autobahn (Boss)

   Hier ändert sich nicht nur die Zahl. Vier Dinge sind anders als auf der
   Landstraße, und alle vier stehen in der FwDV 1, Kapitel 19:

   1. **Entgegen der Fahrtrichtung, nur die eigene Richtungsfahrbahn.** Es
      gibt keinen Gegenverkehr, den man warnen müsste.
   2. **800 Meter**, wo die Geschwindigkeit frei ist — und die Zeichen alle
      **200 Meter** wiederholt.
   3. **Das Material eines Fahrzeugs reicht nicht.** Ein LF hat zwei
      Warndreiecke und zwei Warnleuchten dabei, gebraucht werden vier von
      jedem. Deshalb kommt ein zweites Fahrzeug — und das gehört mit
      eingeschalteter Warnblinkanlage, Fahrlicht und blauem Blinklicht bei
      800 Metern auf den Standstreifen, ohne Besatzung.
   4. **Warndreieck und Warnleuchte sind hier nicht auffällig genug.**
      Zusätzlich gehören Verkehrszeichen oder Faltsignale dazu.

   Die Zahl der Warndreiecke in BELADUNG ist deshalb bewusst knapp. Wer sie
   großzügiger macht, nimmt dieser Aufgabe ihren Kern.
   ========================================================================== */
LEVELS.push({
  id: 'autobahn',
  name: 'Autobahn',
  icon: '🛣️',
  farbe: 'var(--kegel)',
  boss: true,
  kurz: '800 Meter, alle 200 wiederholt — und ein Fahrzeug, dessen Beladung nicht reicht.',

  start(api) {
    const STR = STRASSEN.autobahn;
    const MARKEN_M = [800, 600, 400, 200];
    let fehler = 0;
    const SCHRITTE = 4;
    const abzeichen = { achthundert: true, zweitesFahrzeug: false };
    const vorrat = Object.assign({}, BELADUNG);

    /* --- Kulisse: eine Richtungsfahrbahn, 800 Meter weit ------------------- */
    Stage.leeren();
    const plan = baueStrecke({
      art: 'richtung', von: -90, bis: 870,
      nah: 30, nahProM: 4, fernProM: .62,
      marken: MARKEN_M, leitpfosten: true,
    });
    const spurRechts = plan.spurMitte(1);
    const stand = plan.bankettMitte();
    /* Warngerät und Sicherungsfahrzeug teilen sich den Standstreifen. Beide
       auf dieselbe Höhe zu setzen heißt, dass das Fahrzeug bei 800 Metern
       genau das Warndreieck zudeckt, das dort schon steht – also das Gerät
       an die innere Kante, das Fahrzeug an die äußere. */
    const geraetY = stand - 20, fahrzeugY = stand + 10;

    stellen(bauePKW('#2f6fd0', true), plan.mx(-4), spurRechts, 6, plan.symbolSkala);
    stellen(baueLF({ name: '19/43' }), plan.mx(12), spurRechts, -7, plan.symbolSkala);
    const trupp = stellen(baueFigur({ trupp: 'wasser', kennung: 'WTr' }), plan.mx(4), stand, 0);
    planZeigen(plan, 1.02);

    const warngeraet = `<g>${baueWarndreieck()}<g transform="translate(24,2)">${baueWarnleuchte()}</g></g>`;
    const kopf = (i) => UI.schritte(SCHRITTE, i);

    /* Der Trupp geht dorthin, wo gerade etwas aufgestellt wird. Ohne das
       stünde er die ganze Aufgabe lang am Fahrzeug, während 800 Meter weiter
       Geräte aus dem Nichts erscheinen. */
    const truppGeht = (x, danach) => {
      const vonX = trupp.userData.x;
      if (RUHIG) { setzen(trupp, x, stand, 0); return danach && danach(); }
      Bewegung.neu(.9, (p) => setzen(trupp, lerp(vonX, x, p), stand, 0), danach, false);
    };

    /* --- Runde 1: in welche Richtung? -------------------------------------- */
    const phaseRichtung = () => {
      UI.zeige('l5-richtung', (s) => {
        s.appendChild(auftrag('Autobahn, Richtungsfahrbahnen',
          'Kein Gegenverkehr — die andere Richtung liegt hinter der Mittelleitplanke.'));
        const feld = bedienfeld(s, [kopf(0)], { oben: .26 });
        feld.appendChild(frageBauen({
          frage: 'In welche Richtung wird abgesichert?',
          antworten: [
            'Nur entgegen der Fahrtrichtung, auf der eigenen Richtungsfahrbahn',
            'Nach beiden Seiten, wie auf der Landstraße',
            'Auf beiden Richtungsfahrbahnen, damit niemand gafft',
            'In Fahrtrichtung, damit der Verkehr die Absperrung von hinten sieht',
          ],
          richtig: 0,
          erklaerung: 'Der Verkehr auf der anderen Richtungsfahrbahn kommt an eurer Einsatzstelle '
            + 'gar nicht vorbei — dort steht die Mittelleitplanke dazwischen. Abgesichert wird '
            + 'dorthin, wo der Verkehr herkommt.',
          zitat: STR.zitat,
          danach: (gut) => { if (!gut) fehler++; phaseAbstand(); },
        }));
      });
    };

    /* --- Runde 2: 800 Meter ------------------------------------------------- */
    const phaseAbstand = () => {
      UI.zeige('l5-abstand', (s) => {
        s.appendChild(auftrag('Freie Strecke, kein Tempolimit',
          'Wo beginnt die Absicherung? Schieb das erste Warngerät hin.'));
        const unten = unterbau();
        const feld = bedienfeld(s, [kopf(1)], { oben: .26 });
        const geraet = stellen(warngeraet, plan.mx(0), geraetY, 0);
        const regler = abstandsregler({
          max: 1000, schritt: 50, wert: 0,
          onWert: (m) => setzen(geraet, plan.mx(m), geraetY, 0),
        });
        feld.appendChild(regler);
        const knopf = el('button', { class: 'btn gross' }, 'Hier aufstellen');
        feld.appendChild(el('div', { class: 'knopfreihe' }, knopf));
        feld.appendChild(unten);

        knopf.addEventListener('click', () => {
          const m = regler.wert();
          const gut = m === STR.abstand;
          knopf.remove();
          regler.sperren(true);
          setzen(geraet, plan.mx(STR.abstand), geraetY, 0);
          vorrat.warndreieck--; vorrat.warnleuchte--;
          if (gut) {
            Audio3.richtig();
            feld.insertBefore(UI.feedback(true, '800 Meter — richtig.',
              'Sechzehn Leitpfosten. Wo die Geschwindigkeit frei ist, braucht ein schneller Wagen '
              + 'mehrere hundert Meter, bis er steht — und der Fahrer muss vorher überhaupt erst '
              + 'begreifen, was da vor ihm liegt.', STR.zitat), unten);
          } else {
            fehler++; abzeichen.achthundert = false;
            Audio3.falsch();
            feld.insertBefore(UI.feedback(false, `${m} Meter`,
              'In Streckenbereichen ohne Geschwindigkeitsbegrenzung beginnt die Absicherung '
              + '800 Meter vor der Einsatzstelle.', STR.zitat), unten);
          }
          unten.hinweis('Das erste Warngerät steht bei 800 Metern.', gut ? 'gut' : 'schlecht', 0);
          truppGeht(plan.mx(STR.abstand));
          feld.appendChild(el('div', { class: 'knopfreihe' },
            el('button', { class: 'btn gross', onclick: () => { Audio3.klick(); phaseWiederholen(); } }, 'Weiter →')));
        });
      });
    };

    /* --- Runde 3: wiederholen – und das Material geht aus ------------------- */
    const phaseWiederholen = () => {
      const offen = [600, 400, 200];
      let gesetzt = 0;
      let nachgefordert = false;

      UI.zeige('l5-wiederholen', (s) => {
        s.appendChild(auftrag('Die Zeichen wiederholen',
          'Nach 200 Metern in Fahrtrichtung soll das Zeichen wiederholt werden. Tipp die drei '
          + 'Stellen an — von außen kommend, also 600, 400, 200.'));
        Marken.starten(s);
        const unten = unterbau();
        const feld = bedienfeld(s, [kopf(2)], { oben: .22 });

        const leiste = geraeteLeiste(['warndreieck', 'warnleuchte'], {
          vorrat,
          leer: () => nachforderungAnbieten(),
        });
        feld.appendChild(leiste);
        feld.appendChild(unten);

        /* Die Marken stehen unter der Fahrbahn und nicht darauf: Oben lägen
           sie über der Spur, über dem Standstreifen und über dem Gerät, das
           sie gerade setzen sollen. Unten haben sie ihre eigene Zeile,
           direkt über dem Maßband mit denselben Zahlen. */
        const markeY = plan.randUnten + 18;
        // Das erste Gerät steht schon – seine Marke ist nur noch Beschriftung.
        planMarke(plan.mx(800), markeY, '800 m', { klasse: 'gesetzt still' });

        const marken = offen.map(m => planMarke(plan.mx(m), markeY, m + ' m', {
          onKlick: () => markeSetzen(m),
        }));

        const markeSetzen = (m) => {
          const i = offen.indexOf(m);
          if (marken[i].node.classList.contains('gesetzt')) return;
          if (vorrat.warndreieck <= 0) {
            Audio3.falsch();
            unten.hinweis('Kein Warndreieck mehr auf dem Fahrzeug.', 'schlecht', 0);
            nachforderungAnbieten();
            return;
          }
          Audio3.treffer();
          vorrat.warndreieck--; vorrat.warnleuchte--;
          leiste.nehmen('warndreieck'); leiste.nehmen('warnleuchte');
          truppGeht(plan.mx(m), () => stellen(warngeraet, plan.mx(m), geraetY, 0));
          marken[i].node.classList.add('gesetzt', 'still');
          gesetzt++;
          if (gesetzt === offen.length) setTimeout(fertig, 700);
          else if (vorrat.warndreieck <= 0) nachforderungAnbieten();
        };

        /* --- Das zweite Fahrzeug -------------------------------------------
           Es kommt nicht, weil die Kegel alle sind, sondern weil die FwDV 1
           es ohnehin vorsieht: Ein an der Einsatzstelle nicht benötigtes
           Fahrzeug gehört bei 800 Metern auf den Standstreifen. Dass es das
           fehlende Material mitbringt, ist die Zugabe.                     */
        const nachforderungAnbieten = () => {
          if (nachgefordert) return;
          nachgefordert = true;
          const knopf = el('button', { class: 'btn gross gelb' }, '📻 Zweites Fahrzeug nachfordern');
          knopf.addEventListener('click', () => {
            Audio3.klick();
            knopf.remove();
            abzeichen.zweitesFahrzeug = true;
            frageWohin();
          });
          feld.insertBefore(el('div', { class: 'knopfreihe' }, knopf), unten);
          feld.insertBefore(UI.feedback(false, 'Das Material reicht nicht',
            'Ein Löschfahrzeug hat zwei Warndreiecke und zwei Warnleuchten dabei. Für vier Marken '
            + 'braucht ihr vier von jedem. Auf der Autobahn ist das der Normalfall — nicht das '
            + 'Zeichen dafür, dass jemand falsch gerechnet hat.'), knopf.parentNode);
        };

        const frageWohin = () => {
          const fenster = el('div', { class: 'panel', style: { width: '100%', textAlign: 'left' } });
          feld.insertBefore(fenster, unten);
          fenster.appendChild(el('b', { text: 'Das 19/44 ist da. Wo stellt es sich hin?' }));
          const WAHL = [
            { gut: true, text: 'Bei 800 Metern auf den Standstreifen — Warnblinkanlage, Fahrlicht und Blaulicht an, niemand sitzt drin' },
            { gut: false, text: 'Direkt hinter das 19/43 an der Einsatzstelle' },
            { gut: false, text: 'Quer über die rechte Spur bei 200 Metern, damit da keiner durchkommt' },
          ];
          const liste = el('div', { class: 'liste', style: { width: '100%' } }, WAHL.map(w => {
            const k = el('button', { class: 'regelkarte' },
              el('span', { class: 'ja', text: '🚒' }), el('span', { text: w.text }));
            k.addEventListener('click', () => {
              $$('.regelkarte', liste).forEach(x => x.classList.add('aus'));
              k.classList.remove('aus');
              k.classList.add(w.gut ? 'gut' : 'schlecht');
              if (!w.gut) { fehler++; Audio3.falsch(); } else Audio3.richtig();
              // Es stellt sich immer richtig hin – das Bild soll stimmen.
              const zweites = stellen(baueLF({ name: '19/44' }), plan.mx(940), fahrzeugY, 0, plan.symbolSkala);
              const zielX = plan.mx(810);
              if (RUHIG) setzen(zweites, zielX, fahrzeugY, 0);
              else Bewegung.neu(1.6, (p) => setzen(zweites, lerp(plan.mx(940), zielX, p), fahrzeugY, 0));
              leiste.nachladen({ warndreieck: 2, warnleuchte: 2 });
              vorrat.warndreieck += 2; vorrat.warnleuchte += 2; vorrat.faltsignal += 2;
              fenster.appendChild(UI.feedback(w.gut, w.gut ? 'Genau dorthin.' : 'Nicht dorthin.',
                'Ein Fahrzeug, das an der Einsatzstelle nicht gebraucht wird, ist das beste '
                + 'Warnzeichen, das ihr habt — aber nur ganz außen. Und es bleibt leer: Wer darin '
                + 'sitzt, sitzt in dem Fahrzeug, das zuerst getroffen wird.',
                'Steht ein zusätzliches für den Einsatz an der Einsatzstelle nicht benötigtes '
                + 'Feuerwehrfahrzeug zur Verfügung, sollte dieses zur Warnung bei 800 m auf dem '
                + 'Standstreifen mit eingeschalteter Warnblinkanlage, Fahrlicht und blauem '
                + 'Blinklicht aufgestellt werden.'));
              unten.hinweis('Material ist da — weiter mit den Marken.', 'gut', 0);
            });
            return k;
          }));
          fenster.appendChild(liste);
        };

        const fertig = () => {
          Audio3.richtig();
          unten.hinweis('800, 600, 400, 200 — alle vier stehen.', 'gut', 0);
          feld.appendChild(UI.feedback(true, 'Alle 200 Meter wiederholt',
            'Wer bei 800 Metern in die Absperrung einfährt, wird alle 200 Meter daran erinnert, '
            + 'dass er noch drin ist. Ein einzelnes Zeichen vergisst man auf acht Kilometern '
            + 'Geradeaus.', 'Die Zeichen sollen nach 200 Metern in Fahrtrichtung wiederholt werden.'));
          feld.appendChild(el('div', { class: 'knopfreihe' },
            el('button', { class: 'btn gross', onclick: () => { Audio3.klick(); phaseSperren(); } }, 'Weiter →')));
        };

        return () => Marken.beenden();
      });
    };

    /* --- Runde 4: die Spur sperren und die Regeln --------------------------- */
    const phaseSperren = () => {
      // Die Verjüngung bei 200 Metern: fünf Kegel, zwei Blitzleuchten.
      /* Von innen nach außen: Der erste Kegel steht bei 120 Metern an der
         Spurgrenze, der letzte bei 200 Metern am rechten Fahrbahnrand. So
         wird die rechte Spur zugezogen und der Verkehr nach links geleitet —
         eine Reihe quer über beide Spuren wäre eine Mauer und keine
         Verjüngung. */
      const punkte = verjuengungPunkte(plan, 120, 200,
        plan.spurMitte(1) - 26, plan.spurMitte(1) + 26, 5);
      let i = 0;
      const legen = () => {
        if (i >= punkte.length) {
          // Zwei Blitzleuchten gehören zu den Kegeln, nicht daneben: eine am
          // Anfang der Verjüngung, eine am Ende.
          [punkte[0], punkte[punkte.length - 1]].forEach(pt =>
            stellen(baueBlitzleuchte(), plan.mx(pt.m) - 18, pt.y, 0));
          stellen(baueFaltsignal(), plan.mx(240), geraetY, 0);
          return;
        }
        const pt = punkte[i++];
        stellen(baueLeitkegel(), plan.mx(pt.m), pt.y, 0);
        Audio3.treffer();
        setTimeout(legen, RUHIG ? 0 : 180);
      };
      legen();
      truppGeht(plan.mx(200));

      const KARTEN = [
        REGELN.find(r => r.id === 'leitplanke'),
        REGELN.find(r => r.id === 'leerFahrzeug'),
        REGELN.find(r => r.id === 'stvo100'),
        REGELN.find(r => r.id === 'sichererPlatz'),
        REGELN.find(r => r.id === 'quer'),
        REGELN.find(r => r.id === 'erstVerletzte'),
      ];
      UI.zeige('l5-regeln', (s) => {
        s.appendChild(auftrag('Die Spur ist gesperrt',
          'Fünf Leitkegel, zwei Blitzleuchten, dazu ein Faltsignal. Bleibt das Wichtigste: '
          + 'wie ihr euch dabei bewegt.'));
        const unten = unterbau();
        const feld = bedienfeld(s, [kopf(3)], { oben: .24 });
        feld.appendChild(el('p', { class: 'hinweis', style: { margin: 0 },
          text: 'Stimmt der Satz? Tipp ihn an, wenn er richtig ist — lass ihn stehen, wenn nicht.' }));
        const liste = el('div', { class: 'liste', style: { width: '100%' } });
        feld.appendChild(liste);
        feld.appendChild(unten);

        KARTEN.forEach(r => {
          const k = el('button', { class: 'regelkarte' },
            el('span', { class: 'ja', text: '☐' }), el('span', { text: r.text }));
          let getippt = false;
          k.addEventListener('click', () => {
            if (getippt) return;
            getippt = true;
            k.classList.add(r.gilt ? 'gut' : 'schlecht');
            k.firstChild.textContent = r.gilt ? '✓' : '✗';
            if (!r.gilt) { fehler++; Audio3.falsch(); unten.hinweis('Der Satz stimmt nicht.', 'schlecht', 0); }
            else { Audio3.treffer(); unten.hinweis('Stimmt.', 'gut'); }
          });
          liste.appendChild(k);
        });

        // Wer nichts mehr antippen will, ist fertig – die stehen gelassenen
        // Sätze sind seine Antwort „stimmt nicht".
        const fertigKnopf = el('button', { class: 'btn gross' }, 'Fertig →');
        fertigKnopf.addEventListener('click', () => {
          Audio3.klick();
          $$('.regelkarte', liste).forEach((k, idx) => {
            if (k.classList.contains('gut') || k.classList.contains('schlecht')) return;
            const r = KARTEN[idx];
            // Stehen gelassen heißt „stimmt nicht" – bei einem richtigen Satz
            // ist das ein Fehler.
            if (r.gilt) { fehler++; k.classList.add('schlecht'); k.firstChild.textContent = '✗'; }
            else { k.classList.add('gut'); k.firstChild.textContent = '✓'; }
            k.classList.add('aus');
          });
          auswerten();
        });
        feld.appendChild(el('div', { class: 'knopfreihe' }, fertigKnopf));
      });
    };

    const auswerten = () => {
      const guete = clamp(1 - fehler * .13, 0, 1);
      const gegeben = [];
      if (abzeichen.achthundert) gegeben.push('achthundert');
      if (abzeichen.zweitesFahrzeug) gegeben.push('zweitesFahrzeug');
      api.fertig({
        titel: 'Autobahn: 800 Meter, alle 200 wiederholt, zwei Fahrzeuge.',
        guete, xp: 220, abzeichen: gegeben,
        zeilen: [
          el('span', { html: '<b>800 m</b> ohne Tempolimit, entgegen der Fahrtrichtung.' }),
          el('span', { html: '<b>Alle 200 m</b> wiederholen — 800, 600, 400, 200.' }),
          el('span', { html: '<b>Eine Spur sperren:</b> fünf Leitkegel, mindestens zwei Blitzleuchten.' }),
          el('span', { html: '<b>Zweites Fahrzeug:</b> bei 800 m auf den Standstreifen, und niemand sitzt drin.' }),
          el('span', { text: fehler === 0 ? 'Ohne einen einzigen Fehlgriff.' : `Fehlgriffe: ${fehler}` }),
        ],
      });
    };

    phaseRichtung();
  },
});
