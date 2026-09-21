/* ============================================================================
   Aufgabe 2 – Was nehmen wir mit?

   Die Ausrüstung steht in der FwDV 1, Kapitel 3.3.2, unter „Trupp mit
   sichernden Aufgaben". Zwei Dinge daran sind es wert, eine eigene Runde zu
   bekommen:

   * **Der Wassertrupp sichert.** Nicht der Angriffstrupp, nicht der Melder.
     Das ist keine Gewohnheit, sondern seine Aufgabe.
   * **Warndreieck und Warnleuchte sind ein Paar.** Jeder der beiden trägt
     beides, und zwar immer. Alles andere — Warnflagge, Winkerkelle,
     Leitkegel, Blitzleuchten — gibt es nur auf Befehl des Einheitsführers.

   Gezogen wird hier und nicht getippt: Es ist die einzige Runde der Seite, in
   der alles gleichzeitig ins Bedienfeld passt. Sobald eine Karte über einen
   halben Kilometer Autobahn wandern müsste, hört das auf zu funktionieren —
   deshalb arbeiten die späteren Aufgaben mit Marken auf der Karte.
   ========================================================================== */
LEVELS.push({
  id: 'geraet',
  name: 'Was nehmen wir mit?',
  icon: '🧰',
  farbe: 'var(--gelb)',
  kurz: 'Der Befehl, der Wassertrupp und sein Gerät — Warndreieck und Warnleuchte immer, der Rest auf Befehl.',

  start(api) {
    let fehler = 0;
    const SCHRITTE = 3;

    /* --- Kulisse: das Fahrzeug mit offenen Geräteräumen -------------------- */
    Stage.leeren();
    const plan = baueStrecke({
      art: 'gegenverkehr', von: -16, bis: 22,
      nah: 999, nahProM: 13, leitpfosten: false, band: false,
    });
    const spur = plan.spurMitte(0);
    stellen(bauePKW('#2f6fd0', true), plan.mx(-11), spur, 6, plan.symbolSkala);
    stellen(baueLF({ name: '19/43' }), plan.mx(9), spur, -9, plan.symbolSkala);
    const wtrf = stellen(baueFigur({ kennung: 'WTrF' }), plan.mx(2.6), spur - 40, 0);
    const wtrm = stellen(baueFigur({ kennung: 'WTrM' }), plan.mx(1.0), spur - 40, 0);
    planZeigen(plan, 1.02);

    const kopf = (i) => UI.schritte(SCHRITTE, i);

    /* --- Runde 1: Wer sichert? -------------------------------------------- */
    const phaseBefehl = () => {
      UI.zeige('l2-befehl', (s) => {
        s.appendChild(auftrag('Der Einheitsführer gibt den Befehl',
          `„${SICHERUNGSBEFEHL}"`));
        Audio3.kommando(SICHERUNGSBEFEHL);
        const feld = bedienfeld(s, [kopf(0)], { oben: .24 });
        feld.appendChild(frageBauen({
          frage: 'Wer ist gemeint?',
          antworten: [
            'Der Wassertrupp',
            'Der Angriffstrupp',
            'Der Schlauchtrupp',
            'Der Melder zusammen mit dem Maschinisten',
          ],
          richtig: 0,
          erklaerung: 'Sichernde Aufgaben nimmt im Allgemeinen der Wassertrupp wahr. Der '
            + 'Angriffstrupp wird für die Menschenrettung gebraucht — der darf nicht am '
            + 'Straßenrand stehen und Kegel zählen.',
          zitat: 'Diese Aufgaben werden im Allgemeinen vom Wassertrupp wahrgenommen.',
          danach: (gut) => { if (!gut) fehler++; phaseAusruesten(); },
        }));
      });
    };

    /* --- Runde 2: ausrüsten ------------------------------------------------
       Der Einheitsführer hat Leitkegel und Blitzleuchten mitbefohlen — sonst
       stünde hier nur zweimal dasselbe Paar, und es gäbe nichts zu
       entscheiden.                                                          */
    const phaseAusruesten = () => {
      const STUECKE = [
        { id: 'warndreieck', wer: 'beide' },
        { id: 'warnleuchte', wer: 'beide' },
        { id: 'winkerkelle', wer: 'truppfuehrer' },
        { id: 'leitkegel', wer: 'truppmann' },
        { id: 'blitzleuchte', wer: 'truppmann' },
      ];
      // „beide" heißt: zweimal im Spiel, eines je Mann.
      const karten = [];
      STUECKE.forEach(st => {
        if (st.wer === 'beide') {
          karten.push({ id: st.id, ziel: 'truppfuehrer' });
          karten.push({ id: st.id, ziel: 'truppmann' });
        } else karten.push({ id: st.id, ziel: st.wer });
      });

      UI.zeige('l2-ausruesten', (s) => {
        s.appendChild(auftrag('Ausrüstung auf Befehl',
          'Dazu befiehlt der Einheitsführer Leitkegel und Blitzleuchten. Zieh jedes Gerät zu dem, '
          + 'der es trägt.'));
        const unten = unterbau();
        const feld = bedienfeld(s, [kopf(1)], { oben: .22 });

        const ablagen = {};
        const feldTrupp = el('div', { class: 'truppfeld' },
          ['truppfuehrer', 'truppmann'].map(wer => {
            const a = AUSRUESTUNG[wer];
            const traegt = el('div', { class: 'traegt' });
            const box = el('div', { class: 'truppablage ablage', 'data-wer': wer },
              el('b', { text: `${a.name} (${a.kurz})` }),
              a.dazu ? el('div', { class: 'klein', text: a.dazu }) : null,
              traegt);
            ablagen[wer] = { box, traegt, hat: [] };
            return box;
          }));
        feld.appendChild(feldTrupp);

        const leiste = el('div', { class: 'geraeteleiste' });
        feld.appendChild(leiste);
        feld.appendChild(unten);

        let offen = karten.length;
        karten.forEach((k, i) => {
          const g = GERAETE[k.id];
          const karte = el('button', { class: 'geraetchip', 'data-nr': String(i) },
            el('span', { class: 'ic', text: g.icon }), el('span', { class: 'nm', text: g.name }));
          leiste.appendChild(karte);
          ziehbarMachen(karte, {
            daten: k,
            aufAblage: (ablage) => {
              const wer = ablage.dataset.wer;
              const richtig = wer === k.ziel
                // Warndreieck und Warnleuchte trägt jeder – das Stück ist also
                // richtig, solange der Mann es noch nicht hat.
                || (GERAETE[k.id] && ['warndreieck', 'warnleuchte'].includes(k.id)
                    && !ablagen[wer].hat.includes(k.id));
              if (!richtig) {
                fehler++;
                Audio3.falsch();
                // Zwei verschiedene Fehler, zwei verschiedene Sätze: Das
                // Gerät gehört dem anderen – oder dieser hat schon eines.
                const schonDa = ablagen[wer].hat.includes(k.id);
                unten.hinweis(schonDa
                  ? `${g.name} hat er schon. Das zweite trägt der andere.`
                  : (k.ziel === 'truppfuehrer'
                      ? `${g.name} trägt der Truppführer.`
                      : `${g.name} trägt der Truppmann.`), 'schlecht', 0);
                karte.classList.add('wackeln');
                setTimeout(() => karte.classList.remove('wackeln'), 460);
                return;
              }
              Audio3.treffer();
              ablagen[wer].hat.push(k.id);
              ablagen[wer].traegt.appendChild(el('span', { text: g.icon + ' ' + g.name }));
              ablagen[wer].box.classList.add('voll');
              karte.remove();
              unten.hinweis(g.kurz, 'gut');
              if (--offen === 0) setTimeout(fertig, 500);
            },
          });
        });

        const fertig = () => {
          Audio3.richtig();
          unten.hinweis('Der Wassertrupp ist ausgerüstet.', 'gut', 0);
          feld.appendChild(UI.feedback(true, 'Ausgerüstet',
            'Warndreieck und Warnleuchte trägt jeder der beiden — immer. Warnflagge, Stabwinker, '
            + 'Leitkegel und Blitzleuchten gibt es nur auf Befehl des Einheitsführers.',
            'Truppführer: … Warndreieck und Warnleuchte. Auf Befehl des Einheitsführers: '
            + 'Warnflagge oder Stabwinker (Winkerkelle). Truppmann: Warndreieck und Warnleuchte. '
            + 'Auf Befehl des Einheitsführers: Warnflagge, Verkehrsleitkegel, '
            + 'Verkehrswarngerät (Blitzleuchten).'));
          feld.appendChild(el('div', { class: 'knopfreihe' },
            el('button', { class: 'btn gross', onclick: () => { Audio3.klick(); phaseKunde(); } }, 'Weiter →')));
          // Die beiden gehen los – das nächste Bild zeigt sie schon unterwegs.
          [wtrf, wtrm].forEach((f, i) => {
            const vonX = f.userData.x, vonY = f.userData.y;
            const nachY = plan.bankettMitte();
            if (RUHIG) return setzen(f, vonX + 40, nachY, 0);
            Bewegung.neu(1.2, (p) => setzen(f, lerp(vonX, vonX + 40 + i * 12, p), lerp(vonY, nachY, p), 0));
          });
        };
      });
    };

    /* --- Runde 3: Gerätekunde ---------------------------------------------- */
    const phaseKunde = () => {
      const FRAGEN = [
        {
          frage: 'Was gehört neben jedes Warndreieck?',
          antworten: ['Eine Warnleuchte', 'Ein zweites Warndreieck',
                      'Ein Leitkegel', 'Nichts — es steht allein'],
          richtig: 0,
          erklaerung: 'Ein Warndreieck lebt vom Tageslicht. Bei Dämmerung, Regen oder Nacht sieht '
            + 'man von zweihundert Metern nur noch die Leuchte.',
          zitat: 'Zur besseren Erkennbarkeit soll neben dem Warndreieck zusätzlich eine '
            + 'Warnleuchte aufgestellt werden.',
        },
        {
          frage: 'Eine Fahrspur soll gesperrt werden. Womit?',
          antworten: ['Fünf Leitkegel und mindestens zwei Blitzleuchten',
                      'Zwei Leitkegel und ein Warndreieck',
                      'Fünf Warndreiecke quer über die Spur',
                      'Ein Leitkegel reicht, wenn er mittig steht'],
          richtig: 0,
          erklaerung: 'Für zwei Spuren werden es fünf bis sieben Kegel und mindestens drei '
            + 'Blitzleuchten. Die Kegel leiten, die Blitzleuchten fallen auf — eines ohne das '
            + 'andere wirkt nicht.',
          zitat: 'Für eine Fahrspur sind in der Regel fünf Leitkegel und mindestens zwei '
            + 'Blitzleuchten zu verwenden.',
        },
        {
          frage: 'Warum reichen Warndreieck und Warnleuchte auf der Autobahn nicht?',
          antworten: ['Sie sind dort nicht auffällig genug',
                      'Sie sind auf Autobahnen verboten',
                      'Sie stehen nicht sicher genug im Fahrtwind',
                      'Sie gehören nur zur Beladung von Pkw'],
          richtig: 0,
          erklaerung: 'Bei Richtgeschwindigkeit bleiben einem Fahrer Sekunden. Deshalb gehören dort '
            + 'zusätzlich mitgeführte Verkehrszeichen oder Faltsignale dazu — große Flächen statt '
            + 'kleiner Zeichen.',
          zitat: 'Warndreieck und Warnleuchte sind zum Absichern von Einsatzstellen auf Autobahnen '
            + 'nicht auffällig genug.',
        },
      ];

      UI.zeige('l2-kunde', (s) => {
        s.appendChild(auftrag('Gerätekunde', 'Drei Fragen zu dem, was ihr gerade in der Hand hattet.'));
        const feld = bedienfeld(s, [kopf(2)], { oben: .24 });
        const box = el('div', { style: { width: '100%' } });
        feld.appendChild(box);
        frageReihe(box, FRAGEN, (richtig, gesamt) => {
          fehler += gesamt - richtig;
          auswerten();
        });
      });
    };

    const auswerten = () => {
      const guete = clamp(1 - fehler * .16, 0, 1);
      api.fertig({
        titel: 'Der Wassertrupp weiß, was er trägt — und warum.',
        guete, xp: 130,
        abzeichen: fehler === 0 ? ['ausgeruestet'] : [],
        zeilen: [
          el('span', { html: '<b>Sichern:</b> im Allgemeinen der Wassertrupp.' }),
          el('span', { html: '<b>Immer dabei:</b> Warndreieck und Warnleuchte, je Mann eines.' }),
          el('span', { html: '<b>Auf Befehl:</b> Warnflagge, Stabwinker, Leitkegel, Blitzleuchten.' }),
          el('span', { text: fehler === 0 ? 'Kein einziger Fehlgriff.' : `Fehlgriffe: ${fehler}` }),
        ],
      });
    };

    phaseBefehl();
  },
});
