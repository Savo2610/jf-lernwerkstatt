/* ============================================================================
   Level 3 – Der Stärke-Decoder
   Wie liest man 1/8/9? Erste Zahl Führer, zweite die übrige Mannschaft,
   dritte die Summe.
   ========================================================================== */
LEVELS.push({
  id: 'staerke',
  name: 'Der Stärke-Decoder',
  icon: '🔢',
  farbe: 'var(--blau)',
  kurz: '1/8/9 – was bedeuten die drei Zahlen? Danach: Blitzrunde gegen die Uhr.',

  start(api) {
    let fehler = 0, blitzRichtig = 0, blitzGesamt = 0;

    /* --- 3D: eine Gruppe steht bereit ------------------------------------- */
    Stage.leeren();
    Stage.welt.add(baueBoden(60));
    const scheinwerfer = new THREE.SpotLight(0xffffff, 140, 40, .9, .45, 2);
    scheinwerfer.position.set(0, 12, 9); scheinwerfer.castShadow = true;
    Stage.welt.add(scheinwerfer);
    Stage.welt.add(bei(new THREE.DirectionalLight(0x74a9ff, 1.3), -6, 4, -6));

    const plan = AUFSTELLUNG.gruppe;
    const figuren = [], nachRolle = {};
    Object.keys(plan).forEach(r => {
      const p = plan[r];
      const hinten = p[1] < -.5;
      const f = figurFuerRolle(r);
      f.position.set(p[0] + (hinten ? -.5 : 0), 0, p[1]);
      Stage.welt.add(f);
      figuren.push(f); nachRolle[r] = f;
    });
    const ringe = [];
    Stage.anmelden((dt, t) => { belebeFiguren(figuren, dt, t); ringeUpdate(ringe, dt, t); });

    const ringeSetzen = (rollen, farbe) => {
      ringe.forEach(r => Stage.welt.remove(r));
      ringe.length = 0;
      rollen.forEach(r => {
        const f = nachRolle[r]; if (!f) return;
        const ring = bodenRing(farbe);
        ring.position.copy(f.position);
        Stage.welt.add(ring); ringe.push(ring);
      });
    };

    /* --- Phase 1: Der Decoder erklärt sich ------------------------------- */
    const ALLE = Object.keys(plan);
    const OHNE_EF = ALLE.filter(r => r !== 'EF');

    const schritte = [
      { zahl: 0, titel: 'Die erste Zahl: Führer',
        text: 'Ganz vorne steht, wie viele Führer die Einheit hat. Bei der Gruppe ist das genau einer – der Gruppenführer.',
        rollen: ['EF'], farbe: 0xffd23f, anzeige: ['1', '_', '_'] },
      { zahl: 1, titel: 'Die zweite Zahl: übrige Mannschaft',
        text: 'Dann kommen alle anderen: Maschinist, Melder und die drei Trupps. Zusammen acht Personen.',
        rollen: OHNE_EF, farbe: 0x35c8ff, anzeige: ['1', '8', '_'] },
      { zahl: 2, titel: 'Die dritte Zahl: alle zusammen',
        text: 'Die letzte Zahl ist einfach die Summe der beiden davor. 1 + 8 = 9. Sie muss immer aufgehen – das ist deine Kontrolle.',
        rollen: ALLE, farbe: 0x3ddc84, anzeige: ['1', '8', '9'] },
    ];
    let sIdx = 0;

    const decoderZeigen = () => {
      const sch = schritte[sIdx];
      ringeSetzen(sch.rollen, sch.farbe);
      Audio3.treffer();
      Stage.kameraFahren([.1, 2.9, 11.4], [.1, 1.0, -.7], .9);

      UI.zeige('l3-decoder-' + sIdx, (s) => {
        const zahlen = el('div', {
          class: 'kennzahl',
          style: { display: 'flex', alignItems: 'center', gap: '.18em', fontSize: 'clamp(2.4rem,7vw,4rem)', justifyContent: 'center' },
        }, sch.anzeige.map((z, i) => el('span', {
          style: { color: i === sch.zahl ? '#' + sch.farbe.toString(16).padStart(6, '0') : 'var(--txt3)',
                   transition: 'color .3s' },
        }, z === '_' ? '·' : z)).flatMap((n, i) => i < 2
          ? [n, el('span', { style: { color: 'var(--txt3)', opacity: .5 }, text: '/' })] : [n]));

        seitenLayout(s, [
          UI.schritte(3, sIdx),
          zahlen,
          el('h3', { text: sch.titel }),
          el('p', { class: 'hinweis', style: { margin: 0 }, text: sch.text }),
          el('button', {
            class: 'btn gross',
            onclick: () => {
              Audio3.klick(); sIdx++;
              if (sIdx < schritte.length) decoderZeigen(); else dialPhase();
            },
          }, sIdx < schritte.length - 1 ? 'Weiter →' : 'Verstanden, jetzt ich →'),
        ], { obenBreit: .04, obenSchmal: .32, rechtsBreit: .18 });
      });
    };

    /* --- Phase 2: Stärke selbst einstellen -------------------------------- */
    const dialAufgaben = ['trupp', 'staffel', 'gruppe'];
    let dIdx = 0;

    const dialPhase = () => {
      if (dIdx >= dialAufgaben.length) return blitzIntro();
      const E = EINHEITEN[dialAufgaben[dIdx]];
      ringeSetzen([], 0);

      // passende Figuren zeigen
      figuren.forEach(f => f.visible = false);
      const zeigen = { trupp: ['TF', 'MA', 'TM'], staffel: ['EF', 'MA', 'ATF', 'ATM', 'WTF', 'WTM'],
                       gruppe: ALLE }[E.id];
      // fuer Trupp/Staffel greifen wir auf vorhandene Figuren zurueck
      const passend = { trupp: ['EF', 'MA', 'ATF'], staffel: ['EF', 'MA', 'ATF', 'ATM', 'WTF', 'WTM'], gruppe: ALLE }[E.id];
      passend.forEach(r => { if (nachRolle[r]) nachRolle[r].visible = true; });
      Stage.kameraFahren([.1, 2.7, E.gesamt > 6 ? 11.4 : 9.2], [.1, 1.0, -.7], .9);

      let f1 = 0, f2 = 0;
      UI.zeige('l3-dial-' + E.id, (s) => {
        const anzeige1 = el('span', { class: 'mono', text: '0' });
        const anzeige2 = el('span', { class: 'mono', text: '0' });
        const anzeige3 = el('span', { class: 'mono', style: { color: 'var(--gruen)' }, text: '0' });
        const rueck = el('div', { class: 'klein', style: { minHeight: '1.4em' }, text: '' });

        const auffrischen = () => {
          anzeige1.textContent = f1; anzeige2.textContent = f2; anzeige3.textContent = f1 + f2;
        };
        const stepper = (label, get, set, max) => {
          const wert = el('div', { style: { fontSize: '1.5em', fontWeight: '900', minWidth: '1.6em' }, text: '0' });
          const mal = () => wert.textContent = get();
          const box = el('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' } },
            el('div', { class: 'klein', text: label }),
            el('div', { style: { display: 'flex', alignItems: 'center', gap: '8px' } },
              el('button', { class: 'btn geist', style: { padding: '.3em .8em' },
                onclick: () => { set(clamp(get() - 1, 0, max)); mal(); auffrischen(); Audio3.klick(); } }, '−'),
              wert,
              el('button', { class: 'btn geist', style: { padding: '.3em .8em' },
                onclick: () => { set(clamp(get() + 1, 0, max)); mal(); auffrischen(); Audio3.klick(); } }, '+')));
          mal();
          return box;
        };

        const pruefen = () => {
          if (f1 === E.fuehrer && f2 === E.mannschaft) {
            Audio3.fanfare();
            rueck.textContent = '';
            dIdx++;
            setTimeout(dialPhase, 700);
          } else {
            fehler++;
            Audio3.falsch();
            rueck.textContent = f1 + f2 !== E.gesamt
              ? `Zusammen müssen es ${E.gesamt} sein – du hast ${f1 + f2}.`
              : 'Die Aufteilung stimmt noch nicht. Wie viele davon führen?';
            $('.panel', $('.screen')).classList.add('wackeln');
            setTimeout(() => $('.panel', $('.screen')).classList.remove('wackeln'), 500);
          }
        };

        seitenLayout(s, [
          UI.schritte(3, dIdx),
          el('h3', { text: 'Stelle die Stärke der ' + (E.id === 'trupp' ? 'Einheit' : E.name) + ' ein' }),
          el('p', { class: 'klein', style: { margin: 0 }, text: E.name }),
          el('div', { class: 'kennzahl', style: { display: 'flex', alignItems: 'center', gap: '.2em', fontSize: 'clamp(2rem,6vw,3.2rem)' } },
            anzeige1, el('span', { style: { color: 'var(--txt3)' }, text: '/' }),
            anzeige2, el('span', { style: { color: 'var(--txt3)' }, text: '/' }), anzeige3),
          el('div', { style: { display: 'flex', gap: '18px', justifyContent: 'center' } },
            stepper('Führer', () => f1, v => f1 = v, 3),
            stepper('übrige', () => f2, v => f2 = v, 12)),
          el('div', { class: 'klein', text: 'Die dritte Zahl rechnet sich von selbst.' }),
          rueck,
          el('button', { class: 'btn gross', onclick: pruefen }, 'Prüfen'),
        ], { obenBreit: .04, obenSchmal: .34, rechtsBreit: .18 });
        auffrischen();
      });
    };

    /* --- Phase 3: Blitzrunde ---------------------------------------------- */
    const blitzIntro = () => {
      figuren.forEach(f => f.visible = true);
      ringeSetzen([], 0);
      UI.zeige('l3-blitz-intro', (s) => {
        seitenLayout(s, [
          el('div', { style: { fontSize: '2.6em' }, text: '⚡' }),
          el('h3', { text: 'Blitzrunde' }),
          el('p', { class: 'hinweis', style: { margin: 0 },
            text: 'Acht Fragen, je zehn Sekunden. Je schneller du antwortest, desto mehr Punkte. Bereit?' }),
          el('button', { class: 'btn gross gelb', onclick: () => { Audio3.klick(); blitzStart(); } }, 'Los! ⚡'),
        ], { obenBreit: .04, obenSchmal: .3, rechtsBreit: .18 });
      });
    };

    const blitzFragen = () => shuffle([
      { f: 'Gruppe', a: '1/8/9' }, { f: 'Staffel', a: '1/5/6' }, { f: 'Selbstständiger Trupp', a: '1/2/3' },
      { f: '1/8/9', a: 'Gruppe' }, { f: '1/5/6', a: 'Staffel' }, { f: '1/2/3', a: 'Selbstständiger Trupp' },
      { f: 'Zug', a: '22' }, { f: 'Wie viele Personen hat die Gruppe?', a: '9' },
      { f: 'Wie viele Personen hat die Staffel?', a: '6' },
      { f: 'Wie viele Führer hat eine Gruppe?', a: '1' },
    ]).slice(0, 8);

    const ALLE_ANTWORTEN = ['1/8/9', '1/5/6', '1/2/3', '22', 'Gruppe', 'Staffel', 'Selbstständiger Trupp', 'Zug', '9', '6', '1', '3'];

    const blitzStart = () => {
      const fragen = blitzFragen();
      let i = 0, punkte = 0;
      blitzGesamt = fragen.length;

      const naechste = () => {
        if (i >= fragen.length) return blitzEnde(punkte);
        const q = fragen[i];
        const falsche = shuffle(ALLE_ANTWORTEN.filter(x => x !== q.a)).slice(0, 3);
        const opt = shuffle([q.a, ...falsche]);
        let zeit = 10, laeuft = true;

        UI.zeige('l3-blitz-' + i, (s) => {
          const balken = el('i', { style: { width: '100%' } });
          const uhr = el('div', { class: 'uhr', text: '10' });
          const frageText = /\?$/.test(q.f) ? q.f : `Welche Angabe gehört zu: ${q.f}`;

          const antwortFeld = el('div', { style: { display: 'grid', gap: '10px', width: '100%' } },
            opt.map(o => el('button', { class: 'antwort', onclick: () => antworten(o) },
              el('span', { class: 'marker', text: '?' }), el('span', { text: o }))));

          const antworten = (gewaehlt) => {
            if (!laeuft) return;
            laeuft = false;
            const gut = gewaehlt === q.a;
            if (gut) { punkte += Math.max(1, Math.ceil(zeit)); blitzRichtig++; Audio3.richtig(); }
            else Audio3.falsch();
            $$('.antwort', antwortFeld).forEach(b => {
              const t = b.textContent.trim().replace(/^\?/, '');
              if (t === q.a) b.classList.add('richtig');
              else if (t === gewaehlt) b.classList.add('falsch');
              else b.classList.add('aus');
            });
            setTimeout(() => { i++; naechste(); }, gut ? 620 : 1150);
          };

          seitenLayout(s, [
            el('div', { style: { display: 'flex', alignItems: 'center', gap: '12px', width: '100%', justifyContent: 'center' } },
              uhr, el('div', { class: 'zeitbalken', style: { flex: '1' } }, balken)),
            el('div', { class: 'klein', text: `Frage ${i + 1} von ${fragen.length}  ·  ${punkte} Punkte` }),
            el('div', { class: 'frage', style: { fontSize: '1.15em' }, text: frageText }),
            antwortFeld,
          ], { obenBreit: .04, obenSchmal: .34, rechtsBreit: .18 });

          const t0 = performance.now();
          const ticken = () => {
            if (!laeuft) return;
            zeit = 10 - (performance.now() - t0) / 1000;
            if (zeit <= 0) {
              laeuft = false; Audio3.falsch();
              $$('.antwort', antwortFeld).forEach(b => {
                if (b.textContent.trim().replace(/^\?/, '') === q.a) b.classList.add('richtig');
                else b.classList.add('aus');
              });
              setTimeout(() => { i++; naechste(); }, 1150);
              return;
            }
            uhr.textContent = Math.ceil(zeit);
            uhr.classList.toggle('eilig', zeit < 4);
            balken.style.width = (zeit / 10 * 100) + '%';
            requestAnimationFrame(ticken);
          };
          requestAnimationFrame(ticken);
          return () => { laeuft = false; };
        });
      };
      naechste();
    };

    const blitzEnde = (punkte) => {
      const guete = clamp(blitzRichtig / blitzGesamt - fehler * .05, 0, 1);
      api.fertig({
        guete,
        xp: 50 + punkte * 2,
        titel: `Blitzrunde: ${blitzRichtig} von ${blitzGesamt} richtig · ${punkte} Punkte`,
        abzeichen: blitzRichtig === blitzGesamt ? ['staerkeprofi'] : [],
        zeilen: [
          el('span', { html: '<b>1</b> / 8 / 9 &nbsp;→&nbsp; Führer' }),
          el('span', { html: '1 / <b>8</b> / 9 &nbsp;→&nbsp; übrige Mannschaft' }),
          el('span', { html: '1 / 8 / <b>9</b> &nbsp;→&nbsp; alle zusammen (1 + 8)' }),
        ],
      });
    };

    /* --- Einstieg ---------------------------------------------------------- */
    Stage.kameraSetzen([.1, 2.9, 11.4], [.1, 1.0, -.7]);
    UI.zeige('l3-intro', (s) => {
      seitenLayout(s, [
        el('div', { class: 'dienstvorschrift', text: 'Level 3' }),
        el('h3', { text: 'Der Stärke-Decoder' }),
        el('p', { class: 'hinweis', style: { margin: 0 },
          text: '1/8/9 – drei Zahlen, ein Schrägstrich dazwischen. Wenn du das einmal geknackt hast, liest du jede Stärkeangabe in zwei Sekunden.' }),
        el('button', { class: 'btn gross', onclick: () => { Audio3.klick(); decoderZeigen(); } }, 'Decoder starten →'),
      ], { obenBreit: .04, obenSchmal: .3, rechtsBreit: .18 });
    });
  },
});
