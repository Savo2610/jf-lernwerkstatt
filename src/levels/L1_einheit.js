/* ============================================================================
   Level 1 – Was ist eine taktische Einheit?
   Kernsatz der FwDV 3: "Taktische Einheiten bestehen aus der Mannschaft und
   den Einsatzmitteln."
   ========================================================================== */
LEVELS.push({
  id: 'einheit',
  name: 'Die Grundformel',
  icon: '🧱',
  farbe: 'var(--gelb)',
  kurz: 'Mannschaft + Einsatzmittel. Ohne das eine ist es keine taktische Einheit.',

  start(api) {
    let fehler = 0;

    /* --- 3D: Fahrzeug allein, Mannschaft kommt dazu ---------------------- */
    Stage.leeren();
    Stage.welt.add(baueBoden(70));
    const lf = baueFahrzeug('lf');
    lf.position.set(3.4, 0, 0);
    lf.rotation.y = -Math.PI / 2;
    Stage.welt.add(lf);

    const mannschaft = [];
    const rollen = ['EF', 'MA', 'ME', 'ATF', 'ATM', 'WTF', 'WTM', 'STF', 'STM'];
    rollen.forEach((r, i) => {
      const f = figurFuerRolle(r);
      const reihe = Math.floor(i / 5), spalte = i % 5;
      f.position.set(-7.5 + spalte * 1.15, 0, -1.2 + reihe * 1.5);
      f.rotation.y = Math.PI / 2;
      f.visible = false;
      Stage.welt.add(f);
      mannschaft.push(f);
    });

    const laterne = baueLaterne(); laterne.position.set(-1, 0, 7); Stage.welt.add(laterne);
    Stage.kameraSetzen([-1, 4.6, 13.5], [0, 1.5, 0]);
    Stage.anmelden((dt, t) => { blaulichtUpdate(lf, dt, t); belebeFiguren(mannschaft, dt, t); });

    const mannschaftZeigen = (an) => mannschaft.forEach((f, i) => {
      setTimeout(() => { f.visible = an; if (an) Audio3.treffer(); }, an ? i * 70 : 0);
    });

    /* --- Ablauf ----------------------------------------------------------- */
    const phaseFormel = () => {
      lf.userData.blaulichtAn = false;
      mannschaftZeigen(false);
      Stage.kameraFahren([-1, 5.2, 15], [0, 1.6, 0], 1.2);

      UI.zeige('l1-formel', (s) => {
        const karten = shuffle([
          { t: 'Mannschaft',    ic: '👥', gut: true },
          { t: 'Einsatzmittel', ic: '🚒', gut: true },
          { t: 'Feuerwehrhaus', ic: '🏠', gut: false },
          { t: 'Die Sirene',    ic: '📢', gut: false },
          { t: 'Der Dienstplan',ic: '📋', gut: false },
        ]);
        let gesetzt = 0;

        const slot = (nr) => el('div', {
          class: 'ablage panel', 'data-slot': nr,
          style: { minWidth: '190px', minHeight: '104px', display: 'grid', placeItems: 'center',
                   borderStyle: 'dashed', borderWidth: '2px', textAlign: 'center', padding: '14px' },
        }, el('span', { class: 'klein', text: '?' }));

        const s1 = slot(1), s2 = slot(2);

        const formel = el('div', {
          style: { display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap', justifyContent: 'center' },
        },
          s1,
          el('div', { style: { fontSize: '2.4em', fontWeight: '900', color: 'var(--gelb)' }, text: '+' }),
          s2,
          el('div', { style: { fontSize: '2.4em', fontWeight: '900', color: 'var(--gelb)' }, text: '=' }),
          el('div', {
            class: 'panel',
            style: { minWidth: '200px', padding: '18px 22px', textAlign: 'center',
                     borderColor: 'var(--gelb)', background: 'rgba(255,210,63,.1)' },
          }, el('b', { style: { fontSize: '1.15em' }, text: 'Taktische Einheit' })));

        const vorrat = el('div', {
          style: { display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center', maxWidth: '760px' },
        });

        karten.forEach(k => {
          const node = el('div', {
            class: 'panel', style: { padding: '14px 20px', display: 'flex', alignItems: 'center',
                                     gap: '.6em', fontWeight: '800', cursor: 'grab' },
          }, el('span', { style: { fontSize: '1.5em' }, text: k.ic }), el('span', { text: k.t }));
          ziehbarMachen(node, {
            daten: k,
            aufAblage: (ablage, daten, quelle) => {
              if (ablage.dataset.filled) return;
              if (!daten.gut) {
                fehler++;
                Audio3.falsch();
                ablage.classList.add('wackeln');
                setTimeout(() => ablage.classList.remove('wackeln'), 500);
                UI.toast(daten.t + ' gehört nicht zur taktischen Einheit.', 'schlecht');
                return;
              }
              ablage.dataset.filled = daten.t;
              ablage.classList.add('voll');
              ablage.innerHTML = '';
              ablage.style.borderColor = 'var(--gruen)';
              ablage.style.background = 'rgba(61,220,132,.12)';
              ablage.appendChild(el('div', { style: { fontSize: '1.9em' }, text: daten.ic }));
              ablage.appendChild(el('b', { text: daten.t }));
              quelle.remove();
              Audio3.richtig();
              gesetzt++;
              if (gesetzt === 2) setTimeout(phaseAufloesung, 620);
            },
          });
          vorrat.appendChild(node);
        });

        s.appendChild(el('div', { class: 'mitte' },
          el('h2', { text: 'Bau die Formel' }),
          el('p', { class: 'hinweis', text: 'Zwei der fünf Karten gehören in die Formel. Zieh sie in die leeren Felder.' }),
          formel,
          el('div', { class: 'klein', text: '↓ zum Ziehen' }),
          vorrat));
      });
    };

    /* --- Auflösung mit 3D-Moment ------------------------------------------ */
    const phaseAufloesung = () => {
      Audio3.fanfare();
      lf.userData.blaulichtAn = true;
      mannschaftZeigen(true);
      Stage.kameraFahren([-2, 3.2, 11], [-1.5, 1.3, 0], 1.6);

      UI.zeige('l1-aufloesung', (s) => {
        s.appendChild(el('div', { class: 'mitte' },
          el('h2', { text: 'Genau so.' }),
          el('div', {
            class: 'panel',
            style: { maxWidth: '640px', textAlign: 'center', fontSize: '1.24em', fontWeight: '800', lineHeight: '1.4' },
          },
            el('span', { style: { color: 'var(--blau)' }, text: 'Mannschaft' }),
            el('span', { style: { color: 'var(--gelb)' }, text: '  +  ' }),
            el('span', { style: { color: 'var(--rot)' }, text: 'Einsatzmittel' }),
            el('br'),
            el('span', { style: { fontSize: '.8em', color: 'var(--txt2)' }, text: 'ergibt die taktische Einheit' })),
          UI.zitat('Taktische Einheiten bestehen aus der Mannschaft und den Einsatzmitteln.'),
          el('div', { class: 'feedback', style: { maxWidth: '640px' } },
            el('b', { text: 'Und was sind Einsatzmittel?' }),
            el('span', { text: 'Fahrzeuge, Geräte und Materialien, die die Einsatzkräfte zur Auftragserfüllung brauchen. Das Feuerwehrhaus gehört nicht dazu – das steht nur rum.' })),
          el('button', { class: 'btn gross', onclick: () => { Audio3.klick(); phaseFragen(); } }, 'Verstanden →')));
      });
    };

    /* --- Kontrollfragen ---------------------------------------------------- */
    const phaseFragen = () => {
      lf.userData.blaulichtAn = false;
      Stage.orbitAn(13, 4.2, [0, 1.4, 0], .05);

      const fragen = [
        {
          frage: 'Neun Leute stehen in Einsatzkleidung an der Straße. Ein Fahrzeug haben sie nicht dabei. Ist das eine taktische Einheit?',
          antworten: ['Ja, neun Leute sind eine Gruppe', 'Nein, die Einsatzmittel fehlen', 'Ja, sobald ein Gruppenführer dabei ist', 'Nur wenn sie angetreten sind'],
          richtig: 1,
          erklaerung: 'Ohne Einsatzmittel fehlt die halbe Formel. Die neun sind eine Mannschaft – aber noch keine taktische Einheit.',
          zitat: 'Taktische Einheiten bestehen aus der Mannschaft und den Einsatzmitteln.',
        },
        {
          frage: 'Was zählt laut FwDV 3 alles zu den Einsatzmitteln?',
          antworten: ['Nur die Fahrzeuge', 'Fahrzeuge und Schläuche', 'Fahrzeuge, Geräte und Materialien', 'Alles, was im Gerätehaus steht'],
          richtig: 2,
          erklaerung: 'Vom Löschfahrzeug über das Strahlrohr bis zum Schaummittel – alles, was ihr zur Auftragserfüllung braucht.',
          zitat: 'Einsatzmittel sind Fahrzeuge, Geräte und Materialien, die die Einsatzkräfte zur Auftragserfüllung benötigen.',
        },
        {
          frage: 'Wozu gibt es taktische Einheiten überhaupt?',
          antworten: ['Damit man weiß, wer wie viel verdient', 'Zur Ordnung an der Einsatzstelle nach Verantwortungs- und Aufgabenbereichen', 'Damit die Fahrzeuge voll werden', 'Für die Statistik'],
          richtig: 1,
          erklaerung: 'Jeder weiß, wofür er zuständig ist und wer sagt, wo es langgeht. Genau das macht den Unterschied zwischen einem Einsatz und einem Chaos.',
          zitat: 'Taktische Einheiten dienen der Ordnung an Einsatzstellen nach Verantwortungs- und Aufgabenbereichen.',
        },
      ];

      UI.zeige('l1-fragen', (s) => {
        frageReihe(s, fragen,
          (richtig, gesamt) => {
            const guete = clamp(richtig / gesamt - fehler * .12, 0, 1);
            api.fertig({
              guete,
              xp: 40 + richtig * 20,
              titel: `${richtig} von ${gesamt} Fragen richtig${fehler ? ` · ${fehler} Fehlversuch${fehler > 1 ? 'e' : ''} bei der Formel` : ''}`,
              abzeichen: guete >= .95 ? [] : [],
              zeilen: [
                el('span', { html: '<b>Merksatz:</b> Mannschaft + Einsatzmittel = taktische Einheit' }),
                el('span', { html: '<b>Einsatzmittel:</b> Fahrzeuge, Geräte und Materialien' }),
              ],
            });
          },
          (i, n) => el('div', { style: { paddingTop: '4px' } }, UI.schritte(n, i)));
      });
    };

    /* --- Einstieg ---------------------------------------------------------- */
    UI.zeige('l1-intro', (s) => {
      lf.userData.blaulichtAn = true;
      Audio3.martinshorn(1);
      s.appendChild(el('div', { class: 'mitte' },
        el('div', { class: 'dienstvorschrift', text: 'Level 1' }),
        el('h2', { text: 'Die Grundformel' }),
        el('p', { class: 'hinweis', style: { fontSize: '1.08em' },
          text: 'Bevor es um Gruppe, Staffel und Zug geht, brauchst du eine einzige Formel. Sie steht ganz am Anfang der Vorschrift – und alles andere baut darauf auf.' }),
        el('button', { class: 'btn gross', onclick: () => { Audio3.klick(); phaseFormel(); } }, 'Los →')));
    });
  },
});
