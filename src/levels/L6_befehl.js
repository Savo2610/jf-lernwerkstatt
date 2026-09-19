/* ============================================================================
   Level 6 – Der Befehl
   Befehlsschema nach FwDV 3, Nr. 5.4. Sieben Elemente ohne Bereitstellung,
   zwei mit Bereitstellung.
   ========================================================================== */
LEVELS.push({
  id: 'befehl',
  name: 'Der Befehl',
  icon: '📣',
  farbe: 'var(--lila)',
  kurz: 'Sieben Elemente, zwei Kommandos – und die Entscheidung: mit oder ohne Bereitstellung?',

  start(api) {
    let fehler = 0, lagenRichtig = 0, lagenSerie = 0;

    /* --- 3D: Gruppenführer vor der Mannschaft ------------------------------ */
    Stage.leeren();
    Stage.welt.add(baueBoden(60));
    Stage.welt.add(bei(Object.assign(new THREE.SpotLight(0xffffff, 150, 42, .95, .45, 2), { castShadow: true }), -2, 12, 9));
    Stage.welt.add(bei(new THREE.DirectionalLight(0x74a9ff, 1.2), -6, 4, -6));

    /* Fahrzeug und Gruppe stehen in der Antreteordnung aus Aufgabe 4:
       Maschinist und Melder am Fahrzeug, rechts daneben Angriffs-, Wasser-
       und Schlauchtrupp, der Gruppenführer gegenüber dem Angriffstrupp.
       Die Kamera steht hinter ihm und schaut seiner Einheit ins Gesicht.   */
    const HECK = [0, 0, -7.4];

    const lf = baueFahrzeug('lf');
    lf.position.set(HECK[0], 0, HECK[2]);
    lf.userData.blaulichtAn = true;
    Stage.welt.add(lf);

    const aufstellung = antretenStellen('gruppe', HECK, 0,
      (soll) => figurFuerRolle(soll, { pa: soll === 'ATF' || soll === 'ATM' }));
    const alle = aufstellung.figuren;
    alle.forEach(f => Stage.welt.add(f));
    const gf = aufstellung.nachRolle.EF;
    Stage.anmelden((dt, t) => { belebeFiguren(alle, dt, t); blaulichtUpdate(lf, dt, t); });

    /* Bildpunkte: die ganze Mannschaft in Kopfhöhe plus das Fahrzeugheck.
       Der Rest des Fahrzeugs darf oben aus dem Bild laufen.                */
    const MOTIV = alle.map(f => new THREE.Vector3(f.position.x, 1.75, f.position.z))
      .concat([new THREE.Vector3(HECK[0] - 1.2, .4, HECK[2] + 3.7),
               new THREE.Vector3(HECK[0] + 1.2, 2.6, HECK[2] + 3.7)]);
    const blickWache = (panel) => motivWache(MOTIV, panel, { hoch: .38, weit: .92, anteil: .96, rand: .7 });

    /* --- Phase 0: Was heißt überhaupt „Bereitstellung"? --------------------
       Vorher fing das Level mit der Überschrift „Einsatz OHNE Bereitstellung"
       an – und niemand hatte je gehört, was eine Bereitstellung ist. Hier
       kann man beide Befehle nebeneinander umschalten und hört, wie sie
       enden. Die sieben Elemente stehen bewusst noch nicht drin: Die
       Reihenfolge herauszufinden bleibt die Aufgabe danach.               */
    const tutorial = () => {
      let art = 'mit';

      UI.zeige('l6-tutorial', (s) => {
        const kasten = el('div', { class: 'panel', style: { width: '100%', textAlign: 'left' } });
        const schalter = el('div', { style: { display: 'flex', gap: '8px', width: '100%' } });

        const zeichnen = () => {
          const B = BEREITSTELLUNG[art];
          kasten.innerHTML = '';
          kasten.style.borderColor = art === 'mit' ? 'var(--gelb)' : 'var(--rot)';
          kasten.appendChild(el('b', { style: { display: 'block', marginBottom: '.25em' }, text: B.name }));
          kasten.appendChild(el('div', { class: 'klein', text: 'Wann?' }));
          kasten.appendChild(el('span', { text: B.wann }));
          kasten.appendChild(el('div', { class: 'klein', style: { marginTop: '.7em' }, text: 'Was der Befehl enthält' }));
          kasten.appendChild(el('span', { text: art === 'mit'
            ? 'Nur zwei Angaben: woher das Wasser kommt und wo der Verteiler steht.'
            : 'Alle sieben Angaben – bis hin zu Ziel und Weg des Trupps.' }));
          kasten.appendChild(el('div', { class: 'klein', style: { marginTop: '.7em' }, text: 'Was dann passiert' }));
          kasten.appendChild(el('span', { text: B.passiert }));
          kasten.appendChild(el('div', {
            class: 'kennzahl',
            style: { fontSize: 'clamp(1.05rem,2.6vw,1.5rem)', textAlign: 'center', marginTop: '.7em',
                     color: art === 'mit' ? 'var(--gelb)' : 'var(--rot)' },
            text: '„' + B.kommando + '"',
          }));
          kasten.appendChild(el('div', { class: 'klein', style: { textAlign: 'center' }, text: 'so endet er' }));
          $$('button', schalter).forEach(b => b.className = 'btn ' + (b.dataset.art === art ? 'gelb' : 'geist'));
        };

        ['mit', 'ohne'].forEach(a => schalter.appendChild(el('button', {
          class: 'btn geist', 'data-art': a, style: { flex: '1', padding: '.55em .6em', fontSize: '.92em' },
          onclick: () => {
            art = a; Audio3.klick(); zeichnen();
            Audio3.kommando(BEREITSTELLUNG[a].kommando);
          },
        }, a === 'mit' ? 'MIT Bereitstellung' : 'OHNE Bereitstellung')));

        const panel = seitenLayout(s, [
          el('div', { class: 'dienstvorschrift', text: 'Bevor du befiehlst' }),
          el('h3', { text: 'Was ist eine Bereitstellung?' }),
          el('p', { class: 'hinweis', style: { margin: 0 },
            text: 'Bereitstellen heißt: fertig machen und warten. Die Mannschaft baut die Wasserversorgung auf – aber niemand geht vor, weil noch niemand weiß, wohin. Genau danach richtet sich, welchen der beiden Befehle der Gruppenführer gibt.' }),
          schalter,
          kasten,
          el('button', { class: 'btn gross', onclick: () => { Audio3.klick(); reihenfolgePhase(); } },
            'Verstanden – jetzt du →'),
        ], { obenBreit: .04, obenSchmal: .5, rechtsBreit: .18 });
        zeichnen();
        return blickWache(panel);
      });
    };

    /* --- Phase 1: Reihenfolge bauen (ohne Bereitstellung) ------------------ */
    const reihenfolgePhase = () => {
      const soll = BEFEHL_ELEMENTE.map(e => e.id);
      let pos = 0;
      const gemischt = shuffle(BEFEHL_ELEMENTE.slice());

      UI.zeige('l6-reihenfolge', (s) => {
        const slots = el('div', { style: { display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' } },
          BEFEHL_ELEMENTE.map((_, i) => el('div', {
            'data-pos': i,
            style: { display: 'flex', alignItems: 'center', gap: '.6em', padding: '.5em .8em', borderRadius: '12px',
                     border: '2px dashed var(--linie2)', minHeight: '2.6em', fontSize: '.94em',
                     background: i === 0 ? 'rgba(255,210,63,.08)' : 'transparent',
                     borderColor: i === 0 ? 'var(--gelb)' : 'var(--linie2)', transition: 'all .2s' },
          },
            el('span', { class: 'klein mono', style: { minWidth: '1.4em' }, text: (i + 1) + '.' }),
            el('span', { class: 'klein', text: '…' }))));

        const chips = el('div', { style: { display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' } },
          gemischt.map(e => el('button', {
            class: 'btn geist', 'data-id': e.id,
            style: { padding: '.5em 1em', fontSize: '.92em', boxShadow: 'inset 0 0 0 2px ' + e.farbe + '77' },
            onclick: (ev) => waehlen(e, ev.currentTarget),
          }, e.icon + ' ' + e.label)));

        const rueck = el('div', { class: 'klein', style: { minHeight: '2.4em' }, text: 'Womit fängt der Befehl an?' });

        const waehlen = (e, node) => {
          if (e.id === soll[pos]) {
            const slot = $$('[data-pos]', slots)[pos];
            slot.innerHTML = '';
            slot.style.borderStyle = 'solid';
            slot.style.borderColor = e.farbe;
            slot.style.background = e.farbe + '1f';
            slot.appendChild(el('span', { class: 'klein mono', style: { minWidth: '1.4em' }, text: (pos + 1) + '.' }));
            slot.appendChild(el('span', { style: { fontWeight: '800' }, text: e.icon + ' ' + e.label }));
            slot.appendChild(el('span', { class: 'klein', style: { marginLeft: 'auto', opacity: .8 }, text: e.beispiel }));
            node.remove();
            Audio3.richtig();
            Audio3.sprich(e.label, { rate: 1.05 });
            pos++;
            if (pos < soll.length) {
              const naechster = $$('[data-pos]', slots)[pos];
              naechster.style.borderColor = 'var(--gelb)';
              naechster.style.background = 'rgba(255,210,63,.08)';
              rueck.textContent = 'Und was kommt jetzt?';
            } else {
              rueck.textContent = '';
              setTimeout(befehlSprechen, 500);
            }
          } else {
            fehler++;
            Audio3.falsch();
            node.classList.add('wackeln');
            setTimeout(() => node.classList.remove('wackeln'), 500);
            const richtig = BEFEHL_ELEMENTE.find(x => x.id === soll[pos]);
            rueck.textContent = tippFuer(richtig.id);
          }
        };

        const panel = seitenLayout(s, [
          el('h3', { text: 'Einsatz OHNE Bereitstellung' }),
          el('p', { class: 'klein', style: { margin: 0 }, text: 'Tippe die Befehlselemente in der richtigen Reihenfolge an.' }),
          slots,
          rueck,
          chips,
        ], { obenBreit: .04, obenSchmal: .5, rechtsBreit: .18 });
        return blickWache(panel);
      });
    };

    const tippFuer = (id) => ({
      wes:  'Zuerst muss klar sein, WOHER das Wasser kommt.',
      vert: 'Danach: wo steht der Verteiler?',
      einh: 'Jetzt kommt: WER soll ran? Ab hier wiederholt der Truppführer.',
      auft: 'Was soll der Trupp tun?',
      mitt: 'Womit soll er das tun?',
      ziel: 'Wohin geht es?',
      weg:  'Und auf welchem Weg?',
    })[id] || '';

    /* --- Phase 2: der Befehl wird gesprochen ------------------------------- */
    const befehlSprechen = () => {
      const zeilen = [
        ['Wasserentnahmestelle', 'Unterflurhydrant'],
        ['Lage des Verteilers', 'Verteiler an der Hofeinfahrt'],
        ['Einheit', 'Angriffstrupp'],
        ['Auftrag', 'zur Brandbekämpfung'],
        ['Mittel', 'mit 1. Rohr'],
        ['Ziel', 'in das Erdgeschoss'],
        ['Weg', 'über die Haustür'],
      ];

      UI.zeige('l6-sprechen', (s) => {
        const liste = el('div', { class: 'liste', style: { width: '100%' } },
          zeilen.map(([k, v], i) => el('div', {
            class: 'zeile', 'data-z': i,
            style: { textAlign: 'left', opacity: .3, transition: 'opacity .3s, transform .3s' },
          },
            el('span', { class: 'klein', style: { minWidth: '11ch' }, text: k }),
            el('b', { text: v }))));

        const vor = el('div', {
          class: 'kennzahl',
          style: { fontSize: 'clamp(1.8rem,5vw,2.8rem)', color: 'var(--rot)',
                   opacity: 0, transition: 'opacity .3s, transform .4s', transform: 'scale(.7)' },
          text: 'VOR!',
        });

        const weiter = el('button', {
          class: 'btn gross', style: { opacity: 0, pointerEvents: 'none', transition: 'opacity .3s' },
          onclick: () => { Audio3.klick(); mitBereitstellung(); },
        }, 'Weiter →');

        const panel = seitenLayout(s, [
          el('h3', { text: 'So klingt der Befehl' }),
          el('p', { class: 'klein', style: { margin: 0 }, text: 'Der Gruppenführer gibt ihn – hör genau hin.' }),
          liste, vor, weiter,
        ], { obenBreit: .04, obenSchmal: .5, rechtsBreit: .18 });

        // Zeile für Zeile aufleuchten und sprechen. Die erste Zeile wird mit
        // ihrer Bezeichnung gesprochen – sonst faengt der Befehl fuer den
        // Zuhoerer aus dem Nichts mit „Unterflurhydrant" an.
        const satz = zeilen.map(([k, v], i) => (i === 0 ? k + ' ' + v : v)).join('. ');
        Audio3.kommando(satz + '. Vor!');
        zeilen.forEach((z, i) => {
          setTimeout(() => {
            const n = $$('[data-z]', liste)[i];
            n.style.opacity = '1';
            n.style.transform = 'translateX(6px)';
            Audio3.treffer();
          }, 400 + i * 900);
        });
        setTimeout(() => {
          vor.style.opacity = '1'; vor.style.transform = 'scale(1)';
          Audio3.fanfare();
          gf.userData.arme[1].rotation.x = -2.2;   // Arm hoch beim Kommando
        }, 400 + zeilen.length * 900);
        setTimeout(() => { weiter.style.opacity = '1'; weiter.style.pointerEvents = 'auto'; },
          900 + zeilen.length * 900);
        return blickWache(panel);
      });
    };

    /* --- Phase 3: mit Bereitstellung --------------------------------------- */
    const mitBereitstellung = () => {
      gf.userData.arme[1].rotation.x = 0;
      const M = BEREITSTELLUNG.mit;

      UI.zeige('l6-mit', (s) => {
        const soll = M.elemente;
        let pos = 0;
        const rueck = el('div', { class: 'klein', style: { minHeight: '2.2em' },
          text: 'Nur zwei Elemente – welche?' });

        const slots = el('div', { style: { display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' } },
          soll.map((_, i) => el('div', {
            'data-pos': i,
            style: { padding: '.5em .8em', borderRadius: '12px', border: '2px dashed var(--gelb)',
                     minHeight: '2.6em', display: 'flex', alignItems: 'center', gap: '.6em', fontSize: '.94em' },
          }, el('span', { class: 'klein mono', text: (i + 1) + '.' }), el('span', { class: 'klein', text: '…' }))));

        const chips = el('div', { style: { display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' } },
          shuffle(BEFEHL_ELEMENTE.slice()).map(e => el('button', {
            class: 'btn geist', style: { padding: '.5em 1em', fontSize: '.92em', boxShadow: 'inset 0 0 0 2px ' + e.farbe + '77' },
            onclick: (ev) => {
              if (e.id === soll[pos]) {
                const slot = $$('[data-pos]', slots)[pos];
                slot.innerHTML = '';
                slot.style.borderStyle = 'solid'; slot.style.borderColor = e.farbe;
                slot.style.background = e.farbe + '1f';
                slot.appendChild(el('span', { class: 'klein mono', text: (pos + 1) + '.' }));
                slot.appendChild(el('span', { style: { fontWeight: '800' }, text: e.icon + ' ' + e.label }));
                ev.currentTarget.remove();
                Audio3.richtig(); pos++;
                if (pos >= soll.length) { rueck.textContent = ''; setTimeout(bereitFertig, 450); }
                else rueck.textContent = 'Und das zweite?';
              } else {
                fehler++; Audio3.falsch();
                ev.currentTarget.classList.add('wackeln');
                setTimeout(() => ev.currentTarget.classList.remove('wackeln'), 500);
                rueck.textContent = 'Nein. Der Gruppenführer weiß noch nicht, wer was tun soll – er kennt nur Wasser und Verteiler.';
              }
            },
          }, e.icon + ' ' + e.label)));

        const panel = seitenLayout(s, [
          el('h3', { text: 'Einsatz MIT Bereitstellung' }),
          el('p', { class: 'klein', style: { margin: 0 }, text: M.wann }),
          slots, rueck, chips,
        ], { obenBreit: .04, obenSchmal: .5, rechtsBreit: .18 });
        return blickWache(panel);
      });
    };

    const bereitFertig = () => {
      Audio3.kommando('Zum Einsatz fertig!');
      UI.zeige('l6-bereit-fertig', (s) => {
        const panel = seitenLayout(s, [
          el('div', { class: 'kennzahl', style: { fontSize: 'clamp(1.4rem,4vw,2.1rem)', color: 'var(--gelb)', lineHeight: 1.15 },
            text: 'ZUM EINSATZ FERTIG!' }),
          el('p', { class: 'hinweis', style: { margin: 0 },
            text: 'So endet der Befehl mit Bereitstellung. Der Angriffstruppführer wiederholt das Kommando, die Mannschaft baut auf – und der Gruppenführer erkundet weiter.' }),
          UI.zitat('Der Befehl für einen Einsatz m i t Bereitstellung enthält: Wasserentnahmestelle, Lage des Verteilers. Er schließt mit dem Kommando: „Zum Einsatz fertig!"'),
          el('div', { class: 'feedback', style: { width: '100%' } },
            el('b', { text: 'Der Unterschied in einem Satz' }),
            el('span', { text: 'Ohne Bereitstellung endet der Befehl auf „Vor!" und enthält alle sieben Elemente. Mit Bereitstellung endet er auf „Zum Einsatz fertig!" und enthält nur die ersten zwei.' })),
          el('button', { class: 'btn gross', onclick: () => { Audio3.klick(); wiederholung(); } }, 'Weiter →'),
        ], { obenBreit: .04, obenSchmal: .5, rechtsBreit: .18 });
        return blickWache(panel);
      });
    };

    /* --- Phase 4: Ab wo wiederholt der Truppführer? ------------------------
       Statt einer Quizfrage: den Befehl selbst antippen. Wer die Stelle
       findet, hat es verstanden.                                            */
    const wiederholung = () => {
      const zeilen = [
        ['Wasserentnahmestelle', 'Unterflurhydrant', false],
        ['Lage des Verteilers',  'Verteiler an der Hofeinfahrt', false],
        ['Einheit',              'Angriffstrupp', true],
        ['Auftrag',              'zur Brandbekämpfung', false],
        ['Mittel',               'mit 1. Rohr', false],
        ['Ziel',                 'in das Erdgeschoss', false],
        ['Weg',                  'über die Haustür', false],
      ];
      let fertig = false;

      UI.zeige('l6-wiederholung', (s) => {
        const rueck = el('div', { style: { width: '100%' } });

        const liste = el('div', { class: 'liste', style: { width: '100%' } },
          zeilen.map(([k, v, ist], i) => el('button', {
            class: 'zeile', 'data-z': i,
            style: { textAlign: 'left', cursor: 'pointer', width: '100%', transition: 'all .2s' },
            onclick: (e) => tippen(i, ist, e.currentTarget),
          },
            el('span', { class: 'klein', style: { minWidth: '11ch' }, text: k }),
            el('b', { text: v }))));

        const tippen = (i, ist, node) => {
          if (fertig) return;
          if (!ist) {
            fehler++;
            Audio3.falsch();
            node.classList.add('wackeln');
            setTimeout(() => node.classList.remove('wackeln'), 500);
            rueck.innerHTML = '';
            rueck.appendChild(el('div', { class: 'klein', style: { color: 'var(--rot)' },
              text: i < 2
                ? 'Wasserentnahmestelle und Verteiler gelten für alle – die muss kein einzelner Trupp wiederholen.'
                : 'Fast. Such die Stelle, ab der es zum ersten Mal um SEINEN Trupp geht.' }));
            return;
          }
          fertig = true;
          Audio3.richtig();
          $$('[data-z]', liste).forEach((n, k) => {
            if (k >= 2) { n.style.borderLeft = '5px solid var(--gruen)'; n.style.background = 'rgba(61,220,132,.12)'; }
            else n.style.opacity = '.45';
            n.style.pointerEvents = 'none';
          });
          Audio3.kommando('Angriffstrupp zur Brandbekämpfung mit 1. Rohr in das Erdgeschoss über die Haustür. Vor!');
          rueck.innerHTML = '';
          rueck.appendChild(UI.feedback(true, 'Genau ab hier.',
            'Alles ab „Einheit" betrifft direkt seinen Trupp – das muss sitzen. An einer lauten, dunklen Einsatzstelle versteht man schnell etwas falsch; die Wiederholung ist die Kontrolle.',
            'Der beauftragte Truppführer wiederholt seinen Befehl ab „Einheit".'));
          rueck.appendChild(el('button', { class: 'btn gross', style: { marginTop: '12px' },
            onclick: () => { Audio3.klick(); lagenIntro(); } }, 'Weiter →'));
        };

        const panel = seitenLayout(s, [
          el('h3', { text: 'Der Truppführer wiederholt' }),
          el('p', { class: 'klein', style: { margin: 0 },
            text: 'Der Angriffstruppführer wiederholt den Befehl – aber nicht von vorne. Tippe die Zeile an, ab der er anfängt.' }),
          liste,
          rueck,
        ], { obenBreit: .04, obenSchmal: .5, rechtsBreit: .18 });
        return blickWache(panel);
      });
    };

    /* --- Phase 5: Mit oder ohne Bereitstellung? ----------------------------
       Gehört hierher und nicht in ein eigenes Level: Es ist dieselbe Frage,
       nur von der anderen Seite – welchen der beiden Befehle gebe ich?      */
    const lagen = shuffle(LAGEN);
    let lIdx = 0;

    const einsatzKulisse = () => {
      Stage.leeren();
      Stage.welt.add(baueEinsatzstelle());
      const wagen = baueFahrzeug('lf');
      wagen.position.set(-1.5, 0, 3);
      wagen.rotation.y = Math.PI;
      wagen.userData.blaulichtAn = true;
      Stage.welt.add(wagen);

      const feuer = baueFeuer({ anzahl: 40, breite: 1.4, hoehe: 2.6 });
      feuer.position.set(6.6, 3.4, 2);
      feuer.userData.staerke = .34;
      Stage.welt.add(feuer);

      const chef = figurFuerRolle('EF');
      chef.position.set(1.2, 0, 5.4);
      chef.rotation.y = -.7;
      Stage.welt.add(chef);

      Stage.anmelden((dt, t) => {
        blaulichtUpdate(wagen, dt, t);
        feuer.userData.update(dt, t);
        belebeFiguren([chef], dt, t);
      });
      Stage.kameraSetzen([-2.5, 3.4, 12.5], [3.5, 2.0, 1.5]);
      return feuer;
    };
    let lagenFeuer = null;

    const lagenIntro = () => {
      lagenFeuer = einsatzKulisse();
      UI.zeige('l6-lagen-intro', (s) => {
        seitenLayout(s, [
          el('div', { class: 'dienstvorschrift', text: 'Jetzt du' }),
          el('h3', { text: 'Mit oder ohne Bereitstellung?' }),
          el('p', { class: 'hinweis', style: { margin: 0 },
            text: 'Du bist Gruppenführer. Du kommst an, siehst dich um – und musst dich für einen der beiden Befehle entscheiden.' }),
          el('div', { class: 'feedback', style: { width: '100%' } },
            el('b', { text: 'Die Faustregel' }),
            el('span', { text: 'Weißt du schon, WER WAS WOHIN tun soll? Dann ohne Bereitstellung, kompletter Befehl, „Vor!". Wenn nicht: mit Bereitstellung, nur Wasser und Verteiler, „Zum Einsatz fertig!".' })),
          el('button', { class: 'btn gross', onclick: () => { Audio3.klick(); naechsteLage(); } },
            `Erste von ${lagen.length} Lagen →`),
        ], { obenBreit: .04, obenSchmal: .4, rechtsBreit: .18 });
      });
    };

    const naechsteLage = () => {
      if (lIdx >= lagen.length) return abschluss();
      const L = lagen[lIdx];
      let beantwortet = false;
      if (lagenFeuer) lagenFeuer.userData.staerke = L.a === 'mit' ? .28 : .75;

      UI.zeige('l6-lage-' + lIdx, (s) => {
        const rueck = el('div', { style: { minHeight: '4.2em', width: '100%' } });

        const knopf = (art) => {
          const B = BEREITSTELLUNG[art];
          return el('button', {
            class: 'btn ' + (art === 'mit' ? 'gelb' : ''),
            style: { flex: '1 1 160px', flexDirection: 'column', gap: '.1em', padding: '.7em 1em', lineHeight: 1.15 },
            onclick: (e) => waehlen(art, e.currentTarget),
          },
            el('span', { style: { fontSize: '1.02em' }, text: art === 'mit' ? 'MIT Bereitstellung' : 'OHNE Bereitstellung' }),
            el('small', { style: { opacity: .82, fontWeight: '700', fontSize: '.8em' }, text: B.kommando }));
        };
        const knoepfe = el('div', { style: { display: 'flex', gap: '10px', width: '100%', flexWrap: 'wrap' } },
          knopf('mit'), knopf('ohne'));

        const waehlen = (art, node) => {
          if (beantwortet) return;
          beantwortet = true;
          const gut = art === L.a;
          const B = BEREITSTELLUNG[L.a];
          if (gut) { lagenRichtig++; lagenSerie++; Audio3.richtig(); }
          else { lagenSerie = 0; Audio3.falsch(); node.classList.add('wackeln'); }
          $$('.btn', knoepfe).forEach(b => b.style.pointerEvents = 'none');
          if (!gut) node.style.filter = 'grayscale(.6) brightness(.8)';

          rueck.appendChild(el('div', { class: 'feedback ' + (gut ? 'gut' : 'schlecht') },
            el('b', { text: gut ? `Richtig – ${B.name}` : `Nein: ${B.name}` }),
            el('span', { text: L.warum }),
            el('div', { class: 'klein', style: { marginTop: '.5em' }, text: B.eselsbruecke })));
          rueck.appendChild(el('button', { class: 'btn gross', style: { marginTop: '10px' },
            onclick: () => { Audio3.klick(); lIdx++; naechsteLage(); } },
            lIdx < lagen.length - 1 ? 'Nächste Lage →' : 'Auswertung →'));
          if (gut) Audio3.kommando(B.kommando);
        };

        seitenLayout(s, [
          el('div', { class: 'klein', text: `Lage ${lIdx + 1} von ${lagen.length}  ·  ${lagenRichtig} richtig${lagenSerie >= 2 ? '  ·  Serie ' + lagenSerie : ''}` }),
          UI.schritte(lagen.length, lIdx),
          el('div', { class: 'panel', style: { width: '100%', padding: '16px', textAlign: 'left', fontSize: '1.0em',
                                               lineHeight: 1.35, borderLeft: '4px solid var(--glut)' } },
            el('div', { class: 'klein', style: { marginBottom: '.3em' }, text: '📻 Lagemeldung' }),
            el('span', { text: L.t })),
          el('div', { class: 'klein', text: 'Was befiehlst du?' }),
          knoepfe,
          rueck,
        ], { obenBreit: .04, obenSchmal: .5, rechtsBreit: .18 });
      });
    };

    /* --- Abschluss ---------------------------------------------------------- */
    const abschluss = () => {
      const lagenQuote = lagenRichtig / lagen.length;
      const aufbauGuete = 1 - clamp(fehler * .1, 0, 1);
      const guete = clamp(lagenQuote * .6 + aufbauGuete * .4, 0, 1);
      const abz = [];
      if (fehler === 0) abz.push('befehlsgeber');
      if (lagenRichtig === lagen.length) abz.push('entscheider');
      api.fertig({
        guete,
        xp: 60 + lagenRichtig * 16 + (fehler === 0 ? 30 : 0),
        titel: `${lagenRichtig} von ${lagen.length} Lagen richtig entschieden` +
               (fehler ? ` · ${fehler} Fehlversuch${fehler > 1 ? 'e' : ''} beim Aufbau` : ' · Befehlsaufbau fehlerfrei'),
        abzeichen: abz,
        zeilen: [
          el('span', { html: '<b>Ohne Bereitstellung:</b> Wasserentnahmestelle · Lage des Verteilers · Einheit · Auftrag · Mittel · Ziel · Weg → <b style="color:var(--rot)">VOR!</b>' }),
          el('span', { html: '<b>Mit Bereitstellung:</b> Wasserentnahmestelle · Lage des Verteilers → <b style="color:var(--gelb)">ZUM EINSATZ FERTIG!</b>' }),
          el('span', { html: 'Der Truppführer wiederholt <b>ab „Einheit"</b>.' }),
        ],
      });
    };

    /* --- Einstieg ---------------------------------------------------------- */
    Stage.kameraSetzen([-1.4, 2.6, 8.2], [-.4, 1.15, -.4]);
    UI.zeige('l6-intro', (s) => {
      seitenLayout(s, [
        el('div', { class: 'dienstvorschrift', text: 'Level 6' }),
        el('h3', { text: 'Der Befehl' }),
        el('p', { class: 'hinweis', style: { margin: 0 },
          text: 'Ein Befehl der Feuerwehr ist kein Zuruf, sondern ein festes Schema. Immer gleich aufgebaut – damit jeder sofort weiß, was gemeint ist.' }),
        el('button', { class: 'btn gross', onclick: () => { Audio3.klick(); tutorial(); } }, 'Anfangen →'),
      ], { obenBreit: .04, obenSchmal: .3, rechtsBreit: .18 });
    });
  },
});
