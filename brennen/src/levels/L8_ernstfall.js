/* ============================================================================
   Level 8 – Der Ernstfall (Boss)

   Der Boss fragt nichts Neues ab. Er verlangt nur, dass man die Kette in der
   richtigen Reihenfolge durchgeht, und zwar ohne Zwischenrufe:

       Was brennt da?  →  Was muss weg?  →  Womit?

   Deshalb kommt die Auflösung erst, wenn alle drei Entscheidungen stehen. Wer
   nach der ersten Antwort ein „richtig" bekommt, denkt die zweite nicht mehr
   selbst zu Ende – er liest sie ab. Im Ernstfall sagt einem auch niemand nach
   der Brandklasse, ob sie gestimmt hat.

   Vier Einsätze, drei Entscheidungen, zwölf Punkte. Die Kulisse ist jedes Mal
   die Einsatzstelle und nicht das Labor: Am Gasgrill hinter dem Gerätehaus
   erkennt man die Lage schneller wieder als an einer Aufzählung.

   Der Einsatz wird nicht wiederholt, wenn etwas schiefgeht. Die Auflösung
   erklärt es, das Feuer geht aus, und es geht weiter – das hier ist die
   Prüfung und nicht die Übung.
   ========================================================================== */
LEVELS.push({
  id: 'ernstfall',
  name: 'Der Ernstfall',
  icon: '🎓',
  farbe: 'var(--glut)',
  boss: true,
  kurz: 'Vier Einsätze. Was brennt da, was muss weg, womit? Am Stück, ohne Zwischenrufe.',

  start(api) {
    let punkte = 0;                      // von 12
    const protokoll = [];                // pro Einsatz: [bool, bool, bool]

    /* --- Kulisse ---------------------------------------------------------- */
    Stage.leeren();
    Stage.welt.add(baueUebungsplatz({ seite: 26 }));

    const buehne = new THREE.Group();
    Stage.welt.add(buehne);

    const feuer = baueFeuer({ hoehe: 1.5, breite: .55, zungen: 7, licht: true, glutAnteil: .3 });
    feuerStaerke(feuer, 0, true);
    Stage.welt.add(feuer);

    const rauch = baueWolken('rauch', 14);
    rauch.position.set(0, 1.8, 0);
    wolkenStaerke(rauch, 0, true);
    Stage.welt.add(rauch);

    // Was zum Löschen aus dem Bild kommt: eine Wolke für Pulver und CO₂, ein
    // Strahl für Wasser, eine Decke für Schaum und Fettbrandlöschmittel. Mehr
    // braucht es nicht – gezeigt wird die Wirkung, nicht die Technik.
    const wolke = baueWolken('pulver', 16);
    wolke.position.set(0, .6, 0);
    wolkenStaerke(wolke, 0, true);
    Stage.welt.add(wolke);

    const strahl = baueStrahl({ weite: 3.2, hoch: 1.5, farbe: 0x8fd6ee });
    strahl.position.set(.4, .9, 3.4);
    strahl.rotation.y = Math.PI;
    Stage.welt.add(strahl);

    const decke = baueSchaumdecke({ radius: 1.0, tiefeAnteil: .85 });
    Stage.welt.add(decke);

    let fackel = null;                   // nur im Gaseinsatz vorhanden

    Stage.anmelden((dt, t) => {
      feuerUpdate(feuer, dt, t);
      if (fackel && fackel.userData.fackel.flamme) feuerUpdate(fackel.userData.fackel.flamme, dt, t);
      wolkenUpdate(rauch, dt);
      wolkenUpdate(wolke, dt);
      strahlUpdate(strahl, dt);
      schaumUpdate(decke, dt);
    });

    /* Anzeigename eines Verfahrens bzw. Löschmittels. „Zufuhr absperren" ist
       kein Löschmittel, steht aber an derselben Stelle – deshalb hier mit. */
    const verfahrenName = (id) => {
      const v = LOESCHVERFAHREN.find(x => x.id === id);
      return v.kurzname || v.name;
    };
    const mittelName = (id) => {
      if (id === 'absperren') return 'Zufuhr absperren';
      const m = LOESCHMITTEL.find(x => x.id === id);
      return m.kurzname || m.name;
    };

    const MOTIV = [
      [-2.4, 0, -2.0], [2.4, 0, -2.0], [2.4, 0, 1.8], [-2.4, 0, 1.8], [0, 1.6, 0],
    ];

    /* --- Kulisse pro Einsatz ---------------------------------------------- */
    const AUFBAU = {
      kueche: () => {
        const bank = baueWerkbank(2.4);
        buehne.add(bank);
        const h = bank.userData.hoehe || 1.05;
        const fr = baueBrandgut('fritteuse');
        fr.position.set(0, h, 0);
        fr.scale.setScalar(1.35);
        buehne.add(fr);
        feuer.position.set(0, h + .5, 0);
        feuer.scale.set(1.0, .8, 1.0);
        decke.position.set(0, h + .52, 0);
        decke.scale.setScalar(.42);
        return [[-1.5, 0, -1.4], [1.5, 0, -1.4], [1.5, 0, 1.6], [-1.5, 0, 1.6], [0, h + 1.1, 0]];
      },
      laube: () => {
        [-.75, 0, .75].forEach(x => {
          const s = baueBrandgut('holz');
          s.position.set(x, 0, rnd(-.2, .2));
          s.scale.setScalar(1.2);
          buehne.add(s);
        });
        feuer.position.set(0, .35, 0);
        feuer.scale.set(2.0, 1, 1.6);
        feuerAnteileSetzen(feuer, 1, .8);
        decke.position.set(0, .5, 0);
        decke.scale.setScalar(1);
        return MOTIV;
      },
      werkstatt: () => {
        const bank = baueWerkbank(2.4);
        buehne.add(bank);
        const h = bank.userData.hoehe || 1.05;
        const sp = baueBrandgut('metall');
        sp.position.set(0, h, 0);
        sp.scale.setScalar(1.3);
        buehne.add(sp);
        feuer.position.set(0, h + .1, 0);
        feuer.scale.set(1.1, .55, 1.1);
        // Metall brennt fast ohne Flamme, dafür grellweiß glühend.
        feuerAnteileSetzen(feuer, .25, 1);
        decke.position.set(0, h + .2, 0);
        decke.scale.setScalar(.5);
        return [[-1.5, 0, -1.4], [1.5, 0, -1.4], [1.5, 0, 1.6], [-1.5, 0, 1.6], [0, h + .9, 0]];
      },
      grill: () => {
        fackel = baueGasfackel({ mitFlamme: true });
        fackel.position.set(0, 0, 0);
        buehne.add(fackel);
        // Der Brandherd ist die Fackel selbst – das Hauptfeuer bleibt aus.
        feuerStaerke(feuer, 0, true);
        decke.position.set(0, .5, 0);
        decke.scale.setScalar(1);
        return [[-1.6, 0, -1.4], [1.6, 0, -1.4], [1.6, 0, 1.6], [-1.6, 0, 1.6], [0, 2.5, 0]];
      },
    };

    const kulisseSetzen = (e) => {
      buehne.clear();
      fackel = null;
      schaumFuellen(decke, 0, true);
      wolkenStaerke(wolke, 0, true);
      strahlAn(strahl, 0);
      feuerAnteileSetzen(feuer, 1, .3);
      feuer.scale.setScalar(1);
      const motiv = AUFBAU[e.id]();
      if (e.id !== 'grill') feuerStaerke(feuer, 1, true);
      wolkenStaerke(rauch, e.id === 'werkstatt' ? .3 : .7);
      rauch.position.set(0, feuer.position.y + 1.4, 0);
      return motiv;
    };

    /* Das Feuer ausmachen – so, wie es das gewählte Löschmittel täte. Wer
       falsch gegriffen hat, sieht trotzdem die richtige Wirkung: Der Einsatz
       ist vorbei, hier wird erklärt und nicht mehr geprüft. */
    const loeschschau = (e, danach) => {
      const aus = () => {
        feuerStaerke(feuer, 0);
        wolkenStaerke(rauch, 0);
        setTimeout(danach, 900);
      };
      if (e.mittel === 'absperren') {
        fackelAbsperren(fackel, () => { wolkenStaerke(rauch, 0); setTimeout(danach, 700); });
        return;
      }
      if (e.mittel === 'wasser') {
        Audio3.wasser();
        strahlAn(strahl, 1);
        setTimeout(() => { aus(); strahlAn(strahl, 0); }, 900);
        return;
      }
      if (e.mittel === 'pulver') {
        Audio3.whoosh();
        wolkenStaerke(wolke, 1);
        setTimeout(aus, 800);
        setTimeout(() => wolkenStaerke(wolke, 0), 2400);
        return;
      }
      // Schaum und Fettbrandlöschmittel: eine Decke, die sich schliesst.
      Audio3.whoosh();
      schaumFuellen(decke, 1);
      setTimeout(aus, 900);
    };

    /* --- Ein Einsatz ------------------------------------------------------- */
    const einsatz = (n) => {
      if (n >= EINSAETZE.length) { setTimeout(schlussbild, 400); return; }
      const e = EINSAETZE[n];
      const motiv = kulisseSetzen(e);
      const antworten = { klasse: null, verfahren: null, mittel: null };

      /* Die drei Entscheidungen als Kette über den Knöpfen. Sie steht auch
         dann da, wenn erst eine gefallen ist – so sieht man, wie viel noch
         kommt, und nach welcher Frage man gerade sucht. */
      const kette = el('div', { class: 'kette' });
      const SCHRITTE = [
        { id: 'klasse',    kurz: 'Brandklasse' },
        { id: 'verfahren', kurz: 'Verfahren' },
        { id: 'mittel',    kurz: 'Löschmittel' },
      ];
      const ketteZeichnen = (jetzt) => {
        kette.innerHTML = '';
        SCHRITTE.forEach((sch, i) => {
          const wert = antworten[sch.id];
          kette.appendChild(el('div', {
            class: 'kettenglied' + (wert ? ' voll' : '') + (i === jetzt ? ' jetzt' : ''),
          },
            el('span', { class: 'klein', text: sch.kurz }),
            el('b', { text: wert ? wert.name : '?' })));
          if (i < SCHRITTE.length - 1) kette.appendChild(el('span', { class: 'kettenpfeil', text: '→' }));
        });
      };

      /* Eine Frage: Knöpfe bauen, Antwort merken, weiter. Kein „richtig",
         kein „falsch" – das kommt alles erst am Ende. */
      const frage = (schritt, titel, hilfe, auswahl) => {
        ketteZeichnen(schritt);
        UI.zeige(`l8-${e.id}-${schritt}`, (s) => {
          const unten = unterbau(kette);
          const feld = el('div', { class: 'mittelwahl' },
            ...auswahl.map(a => {
              const b = el('button', { class: 'mittelknopf' },
                el('span', { class: 'ic', text: a.icon }),
                el('span', { text: a.name }));
              b.addEventListener('click', () => {
                Audio3.klick();
                antworten[SCHRITTE[schritt].id] = a;
                weiter(schritt + 1);
              });
              return b;
            }));
          unten.appendChild(feld);

          const auftrag = el('div', { class: 'auftrag' },
            el('div', { class: 'dienstvorschrift', text: `Einsatz ${n + 1} von ${EINSAETZE.length} · ${e.ort}` }),
            el('h2', { text: titel }),
            el('p', { class: 'hinweis', text: schritt === 0 ? e.lage : hilfe }));
          s.appendChild(auftrag);
          s.appendChild(unten);

          return motivWache(motiv, unten,
            { hoch: .4, weit: .9, anteil: .94, rand: .5, panelUnten: true, obenNode: auftrag, sofort: schritt === 0 });
        });
      };

      const weiter = (schritt) => {
        if (schritt === 0) {
          frage(0, 'Was brennt da?', '',
            BRANDKLASSEN.map(k => ({ id: k.id, icon: k.icon, name: `${k.id} – ${k.braende}` })));
        } else if (schritt === 1) {
          frage(1, 'Was muss weg?', 'Welche der vier Voraussetzungen nimmst du dem Feuer – oder greifst du die Reaktion selbst an?',
            LOESCHVERFAHREN.map(v => ({ id: v.id, icon: v.icon, name: v.kurzname || v.name })));
        } else if (schritt === 2) {
          frage(2, 'Womit?', 'Fünf Löschmittel – und die Möglichkeit, gar nicht zu löschen.',
            LOESCHMITTEL.map(m => ({ id: m.id, icon: m.icon, name: m.kurzname || m.name }))
              .concat([{ id: 'absperren', icon: '🔧', name: 'Zufuhr absperren' }]));
        } else {
          aufloesung();
        }
      };

      /* --- Auflösung: alle drei auf einmal ---------------------------------- */
      const aufloesung = () => {
        const richtigVerfahren = [e.verfahren].concat(e.verfahrenAuch || []);
        const richtigMittel = [e.mittel].concat(e.mittelAuch || []);
        const ergebnis = [
          { schritt: SCHRITTE[0], gewaehlt: antworten.klasse, gut: antworten.klasse.id === e.klasse,
            soll: BRANDKLASSEN.find(k => k.id === e.klasse).id + ' – ' + BRANDKLASSEN.find(k => k.id === e.klasse).braende },
          { schritt: SCHRITTE[1], gewaehlt: antworten.verfahren, gut: richtigVerfahren.indexOf(antworten.verfahren.id) >= 0,
            soll: verfahrenName(e.verfahren) },
          { schritt: SCHRITTE[2], gewaehlt: antworten.mittel, gut: richtigMittel.indexOf(antworten.mittel.id) >= 0,
            soll: mittelName(e.mittel) },
        ];
        const gut = ergebnis.filter(r => r.gut).length;
        punkte += gut;
        protokoll.push(ergebnis.map(r => r.gut));
        if (gut === 3) Audio3.richtig(); else if (gut === 0) Audio3.falsch(); else Audio3.treffer();

        loeschschau(e, () => {});

        UI.zeige('l8-' + e.id + '-aufloesung', (s) => {
          const panel = el('div', { class: 'panel glas unterbau' },
            el('div', { class: 'dienstvorschrift', style: { alignSelf: 'center' }, text: e.ort }),
            el('h2', { style: { textAlign: 'center' },
              text: gut === 3 ? '✓ Alles richtig' : `${gut} von 3 richtig` }),
            el('div', { class: 'liste' },
              ergebnis.map(r => el('div', { class: 'zeile' },
                el('span', { style: { fontSize: '1.2em' }, text: r.gut ? '✅' : '❌' }),
                el('div', {},
                  el('div', { class: 'klein', text: r.schritt.kurz }),
                  el('b', { text: r.gewaehlt.name }),
                  r.gut ? null : el('div', { class: 'klein',
                    style: { color: 'var(--gruen)' }, text: 'Richtig wäre: ' + r.soll }))))),
            el('p', { style: { margin: '.5em 0 0' }, text: e.aufloesung }),
            e.hinweisMittel ? el('p', { class: 'hinweis', text: e.hinweisMittel }) : null,
            el('button', { class: 'btn gross', style: { marginTop: '.5em' },
              onclick: () => { Audio3.klick(); einsatz(n + 1); } },
              n + 1 < EINSAETZE.length ? 'Nächster Einsatz →' : 'Auswertung →'));
          s.appendChild(panel);
          return motivWache(motiv, panel, { hoch: .45, weit: .9, anteil: .82, rand: .8, panelUnten: true });
        }, { scroll: true });
      };

      weiter(0);
    };

    /* --- Auswertung -------------------------------------------------------- */
    const schlussbild = () => {
      const gesamt = EINSAETZE.length * 3;
      const guete = punkte / gesamt;
      const abzeichen = punkte === gesamt ? ['ernstfall'] : [];
      api.fertig({
        guete,
        xp: 60 + punkte * 15,
        titel: `${punkte} von ${gesamt} Entscheidungen richtig`,
        abzeichen,
        zeilen: EINSAETZE.map((e, i) => {
          const p = protokoll[i] || [];
          return el('span', { html:
            `<b>${e.ort}:</b> ${p.map(b => b ? '✅' : '❌').join(' ')} &nbsp;` +
            `${e.klasse} → ${verfahrenName(e.verfahren)} → ` +
            `${mittelName(e.mittel)}` });
        }),
      });
    };

    /* --- Einstieg ---------------------------------------------------------- */
    UI.zeige('l8-intro', (s) => {
      Stage.kameraSetzen([0, 3.4, 12], [0, 1, 0]);
      Stage.kameraFahren([-3.0, 2.6, 8.0], [0, .9, 0], 2.4);
      s.appendChild(el('div', { class: 'mitte' },
        el('div', { class: 'panel glas', style: { width: 'min(640px,94vw)', textAlign: 'center' } },
          el('div', { class: 'dienstvorschrift', text: 'Abschluss' }),
          el('h2', { text: 'Der Ernstfall' }),
          el('p', { style: { margin: '.5em 0 0' }, text:
            'Vier Einsätze. Bei jedem entscheidest du dreimal: Was brennt da? Was muss weg? Womit?' }),
          el('p', { class: 'hinweis', text:
            'Die Auflösung kommt erst, wenn alle drei Entscheidungen stehen. Draußen sagt dir auch niemand nach der Brandklasse, ob sie gestimmt hat.' }),
          el('button', { class: 'btn gross', onclick: () => { Audio3.klick(); einsatz(0); } }, 'Einsatz →'))));
    });
  },
});
