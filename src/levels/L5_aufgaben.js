/* ============================================================================
   Level 5 – Wer macht was?
   Kernbotschaft: Angriffs-, Wasser- UND Schlauchtrupp beginnen ihre
   Aufgabenbeschreibung in der FwDV 3 jeweils mit dem Wort "rettet".
   ========================================================================== */
LEVELS.push({
  id: 'aufgaben',
  name: 'Wer macht was?',
  icon: '🧭',
  farbe: 'var(--gruen)',
  kurz: 'Jede Funktion hat ihre Aufgabe. Und eine Regel gilt für alle drei Trupps.',

  start(api) {
    let sortRichtig = 0, sortGesamt = 0, hoechsteSerie = 0;

    /* --- 3D: die drei Trupps ---------------------------------------------- */
    Stage.leeren();
    Stage.welt.add(baueBoden(60));
    Stage.welt.add(bei(Object.assign(new THREE.SpotLight(0xffffff, 150, 42, .95, .45, 2), { castShadow: true }), 0, 12, 10));
    Stage.welt.add(bei(new THREE.DirectionalLight(0x74a9ff, 1.3), -6, 4, -6));

    const TRUPPS = [
      { id: 'A', rollen: ['ATF', 'ATM'], x: -2.6, farbe: 0xff4d3d },
      { id: 'W', rollen: ['WTF', 'WTM'], x: 0,    farbe: 0x35c8ff },
      { id: 'S', rollen: ['STF', 'STM'], x: 2.6,  farbe: 0x3ddc84 },
    ];
    const figuren = [], truppFiguren = {};
    TRUPPS.forEach(t => {
      truppFiguren[t.id] = [];
      t.rollen.forEach((r, i) => {
        const f = figurFuerRolle(r, { pa: t.id !== 'S' });
        f.position.set(t.x + (i ? -.5 : 0), 0, i ? -1.25 : 0);
        Stage.welt.add(f); figuren.push(f); truppFiguren[t.id].push(f);
      });
    });
    const ringe = [];
    Stage.anmelden((dt, t) => { belebeFiguren(figuren, dt, t); ringeUpdate(ringe, dt, t); });

    const ringeFuer = (ids) => {
      ringe.forEach(r => Stage.welt.remove(r)); ringe.length = 0;
      ids.forEach(id => {
        const t = TRUPPS.find(x => x.id === id); if (!t) return;
        truppFiguren[id].forEach(f => {
          const ring = bodenRing(t.farbe);
          ring.position.copy(f.position);
          Stage.welt.add(ring); ringe.push(ring);
        });
      });
    };

    const schilder = [];
    const schilderZeigen = (text) => {
      schilder.forEach(s => Stage.welt.remove(s)); schilder.length = 0;
      if (!text) return;
      TRUPPS.forEach(t => {
        const sp = textSchild(text, { gross: 44, skala: 1.0, rand: '#' + t.farbe.toString(16).padStart(6, '0'), farbe: '#ffffff' });
        sp.position.set(t.x - .25, 2.55, -.6);
        Stage.welt.add(sp); schilder.push(sp);
      });
    };

    /* --- Phase A: die Rettungsregel --------------------------------------- */
    const rettungsFrage = () => {
      ringeFuer([]); schilderZeigen(null);
      Stage.kameraFahren([0, 2.9, 10.6], [0, 1.05, -.6], 1.0);

      UI.zeige('l5-rettung-frage', (s) => {
        seitenLayout(s, [
          el('div', { class: 'dienstvorschrift', text: 'Die wichtigste Frage zuerst' }),
          el('div', { class: 'frage', style: { fontSize: '1.2em' }, text: 'Welcher dieser drei Trupps rettet?' }),
          el('div', { style: { display: 'grid', gap: '10px', width: '100%' } },
            [
              'Nur der Angriffstrupp',
              'Angriffstrupp und Wassertrupp',
              'Alle drei Trupps',
              'Der, den der Gruppenführer bestimmt',
            ].map((t, i) => el('button', {
              class: 'antwort',
              onclick: (e) => waehlen(i, e.currentTarget),
            }, el('span', { class: 'marker', text: 'ABCD'[i] }), el('span', { text: t })))),
        ], { obenBreit: .04, obenSchmal: .34, rechtsBreit: .18 });

        const waehlen = (i, node) => {
          const gut = i === 2;
          $$('.antwort', s).forEach((b, j) => {
            if (j === 2) b.classList.add('richtig');
            else if (j === i) b.classList.add('falsch');
            else b.classList.add('aus');
            b.style.pointerEvents = 'none';
          });
          gut ? Audio3.richtig() : Audio3.falsch();
          setTimeout(rettungsAufloesung, gut ? 800 : 1400);
        };
      });
    };

    const rettungsAufloesung = () => {
      Stage.kameraFahren([0, 2.4, 8.6], [0, 1.15, -.6], 1.2);
      // nacheinander aufleuchten: A, dann W, dann S
      ringeFuer([]);
      setTimeout(() => { ringeFuer(['A']); Audio3.treffer(); }, 250);
      setTimeout(() => { ringeFuer(['A', 'W']); Audio3.treffer(); }, 800);
      setTimeout(() => {
        ringeFuer(['A', 'W', 'S']); Audio3.fanfare();
        schilderZeigen('rettet');
        const k = konfetti(60, [0xff4d3d, 0x35c8ff, 0x3ddc84, 0xffd23f]);
        k.position.set(0, 2, 0);
        Stage.welt.add(k);
        const fn = Stage.anmelden((dt) => { if (!k.userData.update(dt)) { Stage.welt.remove(k); Stage.abmelden(fn); } });
      }, 1350);
      setTimeout(() => Audio3.kommando('Alle drei retten.'), 1900);

      UI.zeige('l5-rettung-loesung', (s) => {
        seitenLayout(s, [
          el('div', { style: { fontSize: '2.4em' }, text: '🚑' }),
          el('h3', { text: 'Alle drei retten.' }),
          el('p', { class: 'hinweis', style: { margin: 0 },
            text: 'In der Vorschrift beginnt die Aufgabenbeschreibung von jedem der drei Trupps mit demselben Wort. Schau genau hin:' }),
          el('div', { class: 'liste', style: { width: '100%' } },
            [['Angriffstrupp', 'rettet; insbesondere aus Bereichen, die nur mit Atemschutzgeräten betreten werden können …', '#ff4d3d'],
             ['Wassertrupp', 'rettet; bringt auf Befehl tragbare Leitern in Stellung …', '#35c8ff'],
             ['Schlauchtrupp', 'rettet; stellt für vorgehende Trupps die Wasserversorgung her …', '#3ddc84']]
              .map(([n, t, c]) => el('div', { class: 'zeile', style: { borderLeft: '4px solid ' + c, textAlign: 'left' } },
                el('div', {}, el('b', { text: n }), el('br'),
                  el('span', { class: 'klein', html: '<b style="color:' + c + '">rettet</b>' + t.slice(6) }))))),
          el('div', { class: 'feedback gut', style: { width: '100%' } },
            el('b', { text: 'Merk dir das so:' }),
            el('span', { text: 'Retten steht bei jedem Trupp an erster Stelle. Wer gerade Menschen retten kann, macht das – Schläuche können warten.' })),
          el('button', { class: 'btn gross', onclick: () => { Audio3.klick(); sortIntro(); } }, 'Weiter →'),
        ], { obenBreit: .04, obenSchmal: .48, rechtsBreit: .18 });
      });
    };

    /* --- Phase B: Aufgaben zuordnen --------------------------------------- */
    const ROLLEN_KNOEPFE = [
      { id: 'EF', name: 'Einheitsführer',    farbe: '#ffd23f' },
      { id: 'MA', name: 'Maschinist',        farbe: '#b9c4dd' },
      { id: 'ME', name: 'Melder',            farbe: '#c98bff' },
      { id: 'A',  name: 'Angriffstrupp',     farbe: '#ff4d3d' },
      { id: 'W',  name: 'Wassertrupp',       farbe: '#35c8ff' },
      { id: 'S',  name: 'Schlauchtrupp',     farbe: '#3ddc84' },
    ];

    const sortIntro = () => {
      ringeFuer([]); schilderZeigen(null);
      UI.zeige('l5-sort-intro', (s) => {
        seitenLayout(s, [
          el('div', { style: { fontSize: '2.4em' }, text: '🗂️' }),
          el('h3', { text: 'Aufgaben zuordnen' }),
          el('p', { class: 'hinweis', style: { margin: 0 },
            text: 'Zwölf Aufgaben fliegen dir entgegen. Tippe jeweils die Funktion an, die dafür zuständig ist. Serien geben Bonuspunkte.' }),
          el('button', { class: 'btn gross gruen', onclick: () => { Audio3.klick(); sortStart(); } }, 'Los geht’s →'),
        ], { obenBreit: .04, obenSchmal: .3, rechtsBreit: .18 });
      });
    };

    const sortStart = () => {
      const karten = shuffle(AUFGABEN_KARTEN).slice(0, 12);
      sortGesamt = karten.length;
      let i = 0, serie = 0;

      const naechste = () => {
        if (i >= karten.length) return schlussFragen();
        const k = karten[i];
        let beantwortet = false;

        UI.zeige('l5-sort-' + i, (s) => {
          const karte = el('div', {
            class: 'panel', style: { width: '100%', padding: '20px', textAlign: 'center',
                                     borderColor: 'var(--linie2)', animation: 'rein .34s var(--ease) both' },
          },
            el('div', { style: { fontSize: '2.2em', lineHeight: 1.1 }, text: k.icon }),
            el('div', { style: { fontWeight: '800', fontSize: '1.06em', lineHeight: 1.3 }, text: k.t }));

          const knoepfe = el('div', {
            style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', width: '100%' },
          }, ROLLEN_KNOEPFE.map(r => el('button', {
            class: 'btn geist', style: { padding: '.62em .6em', fontSize: '.92em', whiteSpace: 'normal', lineHeight: 1.15,
                                         boxShadow: 'inset 0 0 0 2px ' + r.farbe + '66' },
            onclick: (e) => waehlen(r, e.currentTarget),
          }, r.name)));

          const rueck = el('div', { style: { minHeight: '3.4em', width: '100%' } });

          const waehlen = (r, node) => {
            if (beantwortet) return;
            beantwortet = true;
            const gut = r.id === k.ziel;
            const ziel = AUFGABEN[k.ziel];
            if (gut) {
              sortRichtig++; serie++; hoechsteSerie = Math.max(hoechsteSerie, serie);
              Audio3.richtig();
              node.style.boxShadow = 'inset 0 0 0 3px var(--gruen)';
              node.style.background = 'rgba(61,220,132,.18)';
              rueck.appendChild(el('div', { class: 'feedback gut' },
                el('b', { text: serie >= 3 ? `Richtig! Serie: ${serie} 🔥` : 'Richtig!' }),
                el('span', { text: k.hinweis || ziel.kurz })));
            } else {
              serie = 0;
              Audio3.falsch();
              node.style.boxShadow = 'inset 0 0 0 3px var(--rot)';
              rueck.appendChild(el('div', { class: 'feedback schlecht' },
                el('b', { text: 'Das macht der ' + ziel.name + '.' }),
                el('span', { text: k.hinweis || ziel.kurz })));
            }
            $$('.btn', knoepfe).forEach(b => b.style.pointerEvents = 'none');
            setTimeout(() => { i++; naechste(); }, gut ? 950 : 1900);
          };

          seitenLayout(s, [
            el('div', { class: 'klein', text: `Karte ${i + 1} von ${karten.length}  ·  ${sortRichtig} richtig${serie >= 2 ? '  ·  Serie ' + serie : ''}` }),
            UI.schritte(karten.length, i),
            karte,
            el('div', { class: 'klein', text: 'Wer ist zuständig?' }),
            knoepfe,
            rueck,
          ], { obenBreit: .04, obenSchmal: .5, rechtsBreit: .18 });
        });
      };
      naechste();
    };

    /* --- Phase C: Abschlussfragen ------------------------------------------ */
    const schlussFragen = () => {
      const fragen = [
        {
          frage: 'Der Angriffstrupp setzt den Verteiler. Und wer verlegt seine Schlauchleitung, wenn kein Schlauchtrupp da ist?',
          antworten: ['Der Wassertrupp', 'Der Maschinist', 'Er selbst', 'Der Melder'],
          richtig: 2,
          erklaerung: 'Bei einer Staffel gibt es keinen Schlauchtrupp – dann macht der Angriffstrupp das eben selbst.',
          zitat: 'Der Angriffstrupp setzt den Verteiler. Er verlegt seine Schlauchleitung, sofern kein Schlauchtrupp zur Unterstützung bereit steht.',
        },
        {
          frage: 'Der Wassertrupp hat die Wasserversorgung aufgebaut. Was wird er beim Atemschutzeinsatz danach?',
          antworten: ['Zweiter Angriffstrupp', 'Sicherheitstrupp', 'Er löst den Maschinisten ab', 'Er hat Feierabend'],
          richtig: 1,
          erklaerung: 'Der Sicherheitstrupp steht bereit, um einem eingesetzten Atemschutztrupp im Notfall sofort zu helfen.',
          zitat: 'Danach wird er beim Atemschutzeinsatz Sicherheitstrupp oder übernimmt andere Aufgaben.',
        },
        {
          frage: 'Wer ist an keinen bestimmten Platz an der Einsatzstelle gebunden?',
          antworten: ['Der Maschinist', 'Der Melder', 'Der Einheitsführer', 'Der Angriffstruppführer'],
          richtig: 2,
          erklaerung: 'Er muss sich frei bewegen können, um zu erkunden und zu führen – und er ist für die Sicherheit der Mannschaft verantwortlich.',
          zitat: 'Der Einheitsführer führt seine taktische Einheit. Er ist an keinen bestimmten Platz gebunden.',
        },
      ];

      UI.zeige('l5-schluss', (s) => {
        Stage.bildVersatz(0, BREIT() ? .1 : 0);
        frageReihe(s, fragen, (richtig, gesamt) => {
          const quote = sortRichtig / sortGesamt;
          const guete = clamp(quote * .7 + (richtig / gesamt) * .3, 0, 1);
          api.fertig({
            guete,
            xp: 50 + sortRichtig * 8 + richtig * 15,
            titel: `${sortRichtig} von ${sortGesamt} Aufgaben richtig zugeordnet · längste Serie ${hoechsteSerie}`,
            abzeichen: ['retter'],
            zeilen: [
              el('span', { html: '<b style="color:#ff4d3d">Angriffstrupp</b> – rettet, setzt den Verteiler, erstes Rohr' }),
              el('span', { html: '<b style="color:#35c8ff">Wassertrupp</b> – rettet, Wasser bis zum Verteiler, dann Sicherheitstrupp' }),
              el('span', { html: '<b style="color:#3ddc84">Schlauchtrupp</b> – rettet, Wasser ab Verteiler, bedient den Verteiler' }),
            ],
          });
        }, (i, n) => el('div', { style: { paddingTop: '4px' } }, UI.schritte(n, i)));
      });
    };

    /* --- Einstieg ---------------------------------------------------------- */
    Stage.kameraSetzen([0, 2.9, 10.6], [0, 1.05, -.6]);
    UI.zeige('l5-intro', (s) => {
      seitenLayout(s, [
        el('div', { class: 'dienstvorschrift', text: 'Level 5' }),
        el('h3', { text: 'Wer macht was?' }),
        el('p', { class: 'hinweis', style: { margin: 0 },
          text: 'Angriffstrupp, Wassertrupp, Schlauchtrupp – drei Trupps, drei Aufgabenbereiche. Und eine Sache, die alle drei tun.' }),
        el('button', { class: 'btn gross', onclick: () => { Audio3.klick(); rettungsFrage(); } }, 'Anfangen →'),
      ], { obenBreit: .04, obenSchmal: .3, rechtsBreit: .18 });
    });
  },
});
