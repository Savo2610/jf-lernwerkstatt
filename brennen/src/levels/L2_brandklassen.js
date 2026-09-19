/* ============================================================================
   Level 2 – Was brennt denn da?

   Die Brandklassen nach DIN EN 2. Fünf Tonnen stehen auf dem Platz, das
   Brandgut kommt einzeln vorbei und muss einsortiert werden.

   Zwei Dinge sitzen absichtlich als Stolperstellen drin:
   1. Der Kerzenstumpf. Wachs ist fest, wenn man es anfasst – und gehört
      trotzdem in B, weil es beim Brennen flüssig wird. „Flüssig werdend"
      steht genau deshalb in der Norm.
   2. Die Brandklasse E. Es gibt sie nicht. Wer sie sucht, sucht ewig.

   Danach die Erscheinung: Flamme, Glut oder beides? Das ist keine Zugabe,
   sondern der Grund für die ganze Einteilung – Glut löscht man anders als
   eine Flamme. Level 5 baut darauf auf.

   Quelle: HLFS Truppmann Teil 1, Kapitel 2.1 „Brandklassen nach EN 2",
   Ausgabe 10/2012.
   ========================================================================== */
LEVELS.push({
  id: 'brandklassen',
  name: 'Was brennt denn da?',
  icon: '🅰️',
  farbe: 'var(--blau)',
  kurz: 'Fünf Brandklassen von A bis F. Und eine, die es gar nicht gibt.',

  start(api) {
    let fehlerSortieren = 0, fehlerErscheinung = 0, fielAufEHerein = false;

    /* --- Das Brandgut, das durchläuft ------------------------------------
       Reihenfolge ist nicht zufällig: erst ein klarer Fall zum Warmwerden,
       die beiden Stolpersteine in der Mitte, wenn man den Dreh raushat.   */
    const RUNDE = [
      { art: 'holz',       name: 'Scheitholz',        klasse: 'A',
        hinweis: 'Holz ist fest und bildet Glut. Der Normalfall – Brandklasse A.' },
      { art: 'kanister',   name: 'Benzinkanister',    klasse: 'B',
        hinweis: 'Benzin ist flüssig. Es brennt nie selbst, es brennen seine Dämpfe darüber.' },
      { art: 'gasflasche', name: 'Propanflasche',     klasse: 'C',
        hinweis: 'Gasförmig, also C. Und Achtung: Erst die Zufuhr absperren, dann löschen.' },
      { art: 'kerze',      name: 'Kerzenwachs',       klasse: 'B',
        hinweis: 'Der Klassiker zum Reinfallen: Wachs fühlt sich fest an, wird beim Brennen aber flüssig. Die Norm sagt „flüssige und flüssig werdende Stoffe" – also B.',
        stolper: true },
      { art: 'metall',     name: 'Magnesiumspäne',    klasse: 'D',
        hinweis: 'Metall, also D. Über 2500 °C heiß – und niemals mit Wasser.' },
      { art: 'reifen',     name: 'Autoreifen',        klasse: 'A',
        hinweis: 'Gummi ist ein fester Stoff und bildet Glut. A – auch wenn es aussieht wie Chemie.',
        stolper: true },
      { art: 'fritteuse',  name: 'Frittierfett',      klasse: 'F',
        hinweis: 'Speisefett hat seit 2005 eine eigene Klasse. Der Grund: Wasser explodiert darin.' },
      { art: 'stroh',      name: 'Strohballen',       klasse: 'A',
        hinweis: 'Fest, also A. Wasser läuft hier allerdings oben ab – dagegen hilft ein Netzmittel.' },
    ];

    /* --- Kulisse: fünf Tonnen im Bogen, Podest in der Mitte -------------- */
    Stage.leeren();
    Stage.welt.add(baueUebungsplatz({ seite: 26 }));

    // Bogen statt Reihe: In einer Reihe stehen die äußeren Tonnen so schräg,
    // dass man ihre Buchstaben nicht mehr liest.
    const tonnen = BRANDKLASSEN.map((bk, i) => {
      const w = (-0.5 + i / (BRANDKLASSEN.length - 1)) * 1.5;   // ±0.75 rad
      const t = baueTonne({ farbe: bk.farbe, buchstabe: bk.id });
      t.position.set(Math.sin(w) * 5.6, 0, -Math.cos(w) * 5.6 + 2.6);
      t.rotation.y = w;
      t.userData.klasse = bk;
      Stage.welt.add(t);
      return t;
    });

    // Das Podest, auf dem das Brandgut erscheint. Knapp bemessen: Es soll das
    // Stueck tragen, nicht mit ihm um Aufmerksamkeit streiten.
    const podest = new THREE.Mesh(
      new THREE.CylinderGeometry(.72, .84, .34, 16),
      Mat.matt(PLATZ.beton2, .9));
    podest.position.set(0, .17, 2.0);
    podest.receiveShadow = true; podest.castShadow = true;
    Stage.welt.add(podest);

    const buehne = new THREE.Group();
    buehne.position.set(0, .34, 2.0);
    Stage.welt.add(buehne);

    // Ein kleines Feuer zeigt, wie das Brandgut brennt. Schmal und ein Stueck
    // nach hinten versetzt: Mittig und breit verdeckt es genau das Stueck, das
    // man erkennen soll – und beim Einsortieren zaehlt der Gegenstand, nicht
    // die Flamme.
    const probeFeuer = baueFeuer({ hoehe: .8, breite: .26, zungen: 4, glutAnteil: .5 });
    probeFeuer.position.set(0, .18, -.34);
    feuerStaerke(probeFeuer, 0, true);
    buehne.add(probeFeuer);

    /* Metall gluht weiss, alles andere rot. Ohne den Unterschied sieht der
       Magnesiumbrand aus wie ein mattes Kohlefeuer – dabei ist genau das
       grelle, fast flammenlose Leuchten das, woran man ihn erkennt. Wer es
       einmal gesehen hat, sucht bei Metall nicht mehr nach einer Flamme. */
    const glutFarbeFuer = (klasse) => klasse === 'D'
      ? feuerGlutFarbe(probeFeuer, FEUERFARBEN.weissglut, 1)
      : feuerGlutFarbe(probeFeuer, null, 0);

    [[-8.5, 6.5], [8.5, 6.5]].forEach(([x, z]) => {
      const k = baueKegel(); k.position.set(x, 0, z); Stage.welt.add(k);
    });
    const fahne = baueWindfahne();
    fahne.position.set(10, 0, 1);
    Stage.welt.add(fahne);

    Stage.anmelden((dt, t) => {
      feuerUpdate(probeFeuer, dt, t);
      windfahneUpdate(fahne, dt, t, -.5);
    });

    // Knapp um Tonnenreihe und Podest herum. Grosszuegiger gefasst bleibt
    // unten ein breiter Streifen leerer Beton stehen.
    const MOTIV = [
      [-5.4, 0, -3.9], [5.4, 0, -3.9], [-1.4, 0, 2.9], [1.4, 0, 2.9], [0, 2.3, 2.0],
    ];

    /* Aufraeumen. Nur die Geometrien: Die Materialien kommen aus dem Cache in
       `Mat` und gehoeren allen. Wer sie hier freigibt, nimmt sie dem naechsten
       Stueck gleich mit weg. */
    const stueckWeg = (obj) => {
      obj.parent && obj.parent.remove(obj);
      obj.traverse(o => { if (o.geometry) o.geometry.dispose(); });
    };

    /* Das aktuelle Stück auf dem Podest. Wird bei jedem Wechsel getauscht. */
    let stueck = null;
    const stueckSetzen = (art) => {
      if (stueck) { stueckWeg(stueck); stueck = null; }
      const neu = baueBrandgut(art);
      stueck = neu;
      buehne.add(neu);
      // Faellt von oben herein – so sieht man, dass etwas Neues gekommen ist.
      // Die Bewegung haelt `neu` fest und nicht die Variable `stueck`: Wer
      // waehrend des Falls schon eine Tonne antippt, setzt `stueck` auf null,
      // und der naechste Schritt liefe ins Leere. Ein Fehler mitten in einer
      // Bewegung reisst die ganze Bewegungsschleife mit – dann steht das
      // Level.
      neu.position.y = 3.5;
      Bewegung.neu(.55, (p) => { neu.position.y = lerp(3.5, 0, p); });
      Audio3.auf();
    };

    /* Das Stück fliegt in eine Tonne. Bogen statt gerader Linie: eine gerade
       Bewegung sieht aus, als würde es hineingeschoben, ein Bogen wie ein
       Wurf – und geworfen wird hier ja auch. */
    const stueckWerfen = (tonne, danach) => {
      if (!stueck) { if (danach) danach(); return; }
      const s = stueck;
      stueck = null;
      const von = new THREE.Vector3().copy(buehne.position).add(s.position);
      const nach = tonne.position.clone().add(tonne.userData.tonne.einwurf);
      buehne.remove(s);
      s.position.copy(von);
      Stage.welt.add(s);
      Bewegung.neu(.62, (p) => {
        s.position.x = lerp(von.x, nach.x, p);
        s.position.z = lerp(von.z, nach.z, p);
        s.position.y = lerp(von.y, nach.y, p) + Math.sin(p * Math.PI) * 2.2;
        s.rotation.y = p * 5;
        s.scale.setScalar(1 - p * .45);
      }, () => {
        stueckWeg(s);
        if (danach) danach();
      }, false);
    };

    /* --- Runde 1: einsortieren -------------------------------------------- */
    const phaseSortieren = () => {
      let i = 0;

      const naechstes = () => {
        if (i >= RUNDE.length) return setTimeout(phaseKeinE, 500);
        const eintrag = RUNDE[i];
        stueckSetzen(eintrag.art);
        // Das Probefeuer zeigt schon, wie es brennt – ein Hinweis für alle,
        // die die Erscheinung vor der Klasse erkennen.
        const bk = BRANDKLASSEN.find(b => b.id === eintrag.klasse);
        feuerAnteileSetzen(probeFeuer,
          bk.erscheinungIds.includes('flamme') ? 1 : 0,
          bk.erscheinungIds.includes('glut') ? .9 : 0);
        glutFarbeFuer(bk.id);
        feuerStaerke(probeFeuer, .8);

        UI.zeige('l2-sortieren-' + i, (s) => {
          HotSpots.starten(s);
          let vergeben = false;

          // Dieselbe Zeile traegt die Frage und die Fehlermeldung. Zwei Zeilen
          // uebereinander waeren hoeher als die Auftragskarte hergibt – und
          // die Hoehe fehlt unten der Buehne.
          const frageZeile = el('p', { class: 'hinweis',
            text: 'In welche Brandklasse gehört das? Tipp den Buchstaben auf der Tonne an.' });

          tonnen.forEach(t => {
            const bkT = t.userData.klasse;
            const node = el('button', { class: 'weltmarke tonnenknopf', style: { '--f': bkT.farbe } },
              el('span', { class: 'ic', text: bkT.icon }),
              el('b', { text: bkT.id }));
            node.addEventListener('click', () => {
              if (vergeben) return;
              if (bkT.id !== eintrag.klasse) {
                fehlerSortieren++;
                Audio3.falsch();
                // Kein Toast: Der lief nach drei Sekunden weg, und genau wer
                // gerade danebengegriffen hat, liest langsam. Die Zeile steht
                // in der Auftragskarte und bleibt, bis das naechste Stueck
                // kommt.
                frageZeile.className = 'hinweistext schlecht';
                frageZeile.textContent =
                  `${bkT.id} ist die Brandklasse für ${bkT.braende}. ${eintrag.name} gehört woanders hin.`;
                return;
              }
              vergeben = true;
              Audio3.richtig();
              feuerStaerke(probeFeuer, 0);
              stueckWerfen(t, () => {
                i++;
                setTimeout(naechstes, 260);
              });
              UI.toast(`${eintrag.klasse} – richtig. ${eintrag.hinweis}`, 'gut', 3800);
            });
            HotSpots.hinzu(new THREE.Vector3(t.position.x, 2.05, t.position.z), node);
          });

          const auftrag = el('div', { class: 'auftrag' },
            el('div', { class: 'dienstvorschrift', text: `Stück ${i + 1} von ${RUNDE.length}` }),
            el('h2', { text: eintrag.name }),
            frageZeile,
            UI.schritte(RUNDE.length, i));
          s.appendChild(auftrag);

          const wache = motivWache(MOTIV, null,
            { hoch: .3, weit: .9, anteil: .96, rand: .5, obenNode: auftrag,
              sofort: true });   // der Einstieg fährt die Kamera – die Fahrt endet hier

          return () => { wache(); HotSpots.beenden(); };
        });
      };
      naechstes();
    };

    /* --- Runde 2: die Klasse, die es nicht gibt ---------------------------
       Kein Ratespiel, sondern eine Falle mit Auflösung: Eine sechste Tonne
       fährt heran, beschriftet mit E. Man soll etwas hineinwerfen – und es
       gibt nichts, was hineingehört.                                       */
    const phaseKeinE = () => {
      // Von der Seite herein und VOR die Reihe: Die Mitte der Reihe ist die
      // C-Tonne, dort wuerde die E sie einfach verdecken – und dann liest man
      // ein C an einer grauen Tonne. Frei davor steht sie allein im Bild,
      // und genau darum geht es hier.
      const tonneE = baueTonne({ farbe: '#8c8f96', buchstabe: 'E' });
      tonneE.position.set(-12, 0, .6);
      Stage.welt.add(tonneE);
      Bewegung.neu(1.1, (p) => {
        tonneE.position.x = lerp(-12, 0, p);
        // volle Umdrehung, damit sie am Ende gerade steht und nicht schief
        tonneE.rotation.z = -p * Math.PI * 2;
      });

      const angebote = [
        { art: 'spraydose', name: 'Ein Kabel unter Strom' },
        { art: 'metallblock', name: 'Ein Sicherungskasten' },
        { art: 'papier', name: 'Ein Verteilerkasten' },
      ];

      UI.zeige('l2-keinE', (s) => {

        const antwort = (richtig, text) => () => {
          if (richtig) {
            Audio3.richtig();
            aufloesungE();
          } else {
            fielAufEHerein = true;
            Audio3.falsch();
            unten.hinweis(text, 'schlecht');
          }
        };

        const feld = el('div', { class: 'antworten unten' },
          ...angebote.map(a => el('button', { class: 'antwort', onclick: antwort(false,
            'Auch das nicht. Es brennt ja nicht der Strom, sondern die Isolierung oder das Gehäuse.') },
            el('span', { class: 'marker', text: '?' }), el('span', { text: a.name }))),
          el('button', { class: 'antwort', onclick: antwort(true) },
            el('span', { class: 'marker', text: '!' }),
            el('span', { text: 'Gar nichts – diese Tonne ist ein Irrtum' })));

        const unten = unterbau(feld);

        const auftrag = el('div', { class: 'auftrag' },
          el('div', { class: 'dienstvorschrift', text: 'Und noch eine Tonne' }),
          el('h2', { text: 'Was gehört in die E?' }),
          el('p', { class: 'hinweis', text: 'Da kommt noch eine angerollt. Was wirfst du hinein?' }));
        s.appendChild(auftrag);
        s.appendChild(unten);

        // Eng um die Tonne herum: Sie ist die Pointe dieser Runde und muss
        // zwischen Auftrag und Antworten sichtbar bleiben. Wer die Punkte
        // grosszuegiger setzt, passt eine grosse Box ein – und die Tonne wird
        // dann klein.
        const wache = motivWache(
          [[-.95, 0, -.35], [.95, 0, -.35], [-.95, 0, 1.55], [.95, 0, 1.55], [0, 1.8, .6]],
          unten, { hoch: .3, weit: .86, anteil: .94, rand: .3, panelUnten: true, obenNode: auftrag });
        return wache;
      });

      const aufloesungE = () => {
        // Die Tonne kippt um und rollt aus dem Bild – sie hat hier nichts
        // verloren, und das soll man sehen.
        Bewegung.neu(1.2, (p) => {
          tonneE.rotation.z = p * 1.9;
          tonneE.position.y = Math.sin(p * Math.PI) * .5;
          tonneE.position.x = p * 11;
        }, () => Stage.welt.remove(tonneE));
        Audio3.whoosh();

        UI.zeige('l2-keinE-aufloesung', (s) => {
          Stage.bildVersatz(-.10, 0);
          s.appendChild(el('div', { class: 'mitte' },
            el('div', { class: 'panel glas', style: { width: 'min(620px,94vw)', textAlign: 'center' } },
              el('div', { style: { fontSize: '2.8em', lineHeight: 1 }, text: '🚫' }),
              // Die Überschrift darf nicht denselben Satz sagen wie der Text
              // gleich darunter – KEINE_KLASSE_E fängt damit an.
              el('h2', { text: 'Genau – die gibt es nicht.' }),
              el('p', { style: { margin: '.5em 0 0' }, text: KEINE_KLASSE_E }),
              el('p', { class: 'hinweis', text:
                'Merk dir die fünf, die es gibt: A, B, C, D und F. Zwischen D und F fehlt genau ein Buchstabe – und das ist die Frage, die im Quiz kommt.' }),
              el('button', { class: 'btn gross', style: { marginTop: '.6em' },
                onclick: () => { Audio3.klick(); phaseErscheinung(); } }, 'Weiter →'))));
        });
      };
    };

    /* --- Runde 3: Flamme, Glut oder beides? -------------------------------
       Hier zeigt das Probefeuer live, was die Antwort bedeutet. Der Sinn der
       ganzen Einteilung liegt genau darin: Glut löscht man durch Abkühlen,
       eine Flamme durch Ersticken.                                         */
    const phaseErscheinung = () => {
      const reihe = shuffle(BRANDKLASSEN.slice());
      let i = 0;

      const naechste = () => {
        if (i >= reihe.length) return setTimeout(phaseFragen, 400);
        const bk = reihe[i];
        stueckSetzen(RUNDE.find(r => r.klasse === bk.id).art);
        glutFarbeFuer(bk.id);
        feuerStaerke(probeFeuer, 0, true);

        UI.zeige('l2-erscheinung-' + i, (s) => {
          let beantwortet = false;

          const zeigen = (flamme, glut) => {
            feuerAnteileSetzen(probeFeuer, flamme, glut);
            feuerStaerke(probeFeuer, .85);
          };

          const wahl = [
            { text: 'Nur Flamme', f: 1, g: 0, ids: ['flamme'] },
            { text: 'Nur Glut', f: 0, g: .95, ids: ['glut'] },
            { text: 'Flamme und Glut', f: 1, g: .8, ids: ['flamme', 'glut'] },
          ];

          const feld = el('div', { class: 'antworten unten drei' },
            ...wahl.map((w, n) => {
              const b = el('button', { class: 'antwort' },
                el('span', { class: 'marker', text: 'ABC'[n] }),
                el('span', { text: w.text }));
              // Beim Zeigen schon die Vorschau anwerfen: Man soll die drei
              // Möglichkeiten am echten Feuer vergleichen können, bevor man
              // sich festlegt.
              b.addEventListener('pointerenter', () => { if (!beantwortet) zeigen(w.f, w.g); });
              b.addEventListener('click', () => {
                if (beantwortet) return;
                const gut = w.ids.length === bk.erscheinungIds.length
                  && w.ids.every(x => bk.erscheinungIds.includes(x));
                zeigen(w.f, w.g);
                if (!gut) {
                  fehlerErscheinung++;
                  Audio3.falsch();
                  b.classList.add('falsch', 'wackeln');
                  setTimeout(() => b.classList.remove('wackeln'), 450);
                  // 0 = bleibt stehen, bis die richtige Antwort kommt
                  unten.hinweis(`Nicht ganz. ${bk.braende.charAt(0).toUpperCase() + bk.braende.slice(1)} brennen mit: ${bk.erscheinung}.`, 'schlecht', 0);
                  return;
                }
                beantwortet = true;
                Audio3.richtig();
                b.classList.add('richtig');
                unten.hinweis(`${bk.id}: ${bk.erscheinung}. ${bk.merke}`, 'gut', 4000);
                i++;
                setTimeout(naechste, 1500);
              });
              return b;
            }));

          const unten = unterbau(feld);

          const auftrag = el('div', { class: 'auftrag' },
            el('div', { class: 'dienstvorschrift', text: `Brandklasse ${bk.id}` }),
            el('h2', { text: `Wie brennen ${bk.braende}?` }),
            // Kurz halten: Jede Zeile hier fehlt der Bühne darunter. Und
            // „fahr mit der Maus" hilft am Tablet ohnehin niemandem.
            el('p', { class: 'hinweis', text: 'Das Feuer zeigt dir, was gemeint ist.' }),
            UI.schritte(reihe.length, i));
          s.appendChild(auftrag);
          s.appendChild(unten);

          // Nahaufnahme auf Podest und Probe: Hier zählt allein, wie es
          // brennt – die Tonnen im Rücken dürfen aus dem Bild fallen.
          const wache = motivWache(
            [[-.8, .2, 1.4], [.8, .2, 1.4], [-.8, .2, 2.6], [.8, .2, 2.6], [0, 1.5, 2.0]],
            unten, { hoch: .32, weit: .88, anteil: .94, rand: .25, panelUnten: true, obenNode: auftrag });
          return wache;
        });
      };
      naechste();
    };

    /* --- Fragen ----------------------------------------------------------- */
    const phaseFragen = () => {
      feuerStaerke(probeFeuer, 0);
      const fragen = [
        {
          frage: 'Welche Brandklasse gibt es nicht?',
          antworten: ['B', 'C', 'E', 'F'],
          richtig: 2,
          erklaerung: 'A, B, C, D und F – dazwischen klafft die Lücke. E gab es früher für elektrische Anlagen, sie wurde gestrichen.',
        },
        {
          frage: 'Was ist die Brandklasse von flüssigen Stoffen?',
          antworten: ['A', 'B', 'C', 'D'],
          richtig: 1,
          erklaerung: 'B – und zwar für „flüssige und flüssig werdende Stoffe". Deshalb gehört auch Kerzenwachs dazu.',
          zitat: 'Brandklasse B: Brände von flüssigen und flüssig werdenden Stoffen.',
        },
        {
          frage: 'In der Küche brennt eine Pfanne mit Speiseöl. Welche Klasse?',
          antworten: ['A – es ist ja fest angebrannt', 'B – Öl ist flüssig', 'F – Speiseöle und -fette', 'D – wegen der Metallpfanne'],
          richtig: 2,
          erklaerung: 'Speiseöle und -fette haben eine eigene Klasse, weil sie so heiß werden, dass Wasser darin schlagartig verdampft und brennendes Fett durch den Raum schleudert.',
        },
        {
          frage: 'Warum ist die Einteilung in Brandklassen überhaupt wichtig?',
          antworten: [
            'Damit man weiß, wie heiß es wird',
            'Damit man das passende Löschmittel auswählen kann',
            'Für die Einsatzstatistik',
            'Damit die Feuerwehr weiß, wie viele Fahrzeuge kommen',
          ],
          richtig: 1,
          erklaerung: 'Das ist ihr einziger Zweck. Wer die Klasse kennt, weiß, was er nehmen darf – und vor allem, was nicht.',
          zitat: 'Sie dient dazu, bestimmten Bränden geeignete Löschmittel zuordnen zu können.',
        },
      ];

      UI.zeige('l2-fragen', (s) => {
        Stage.bildVersatz(0, 0);
        frageReihe(s, fragen,
          (richtig, gesamt) => {
            const guete = clamp(richtig / gesamt - fehlerSortieren * .07 - fehlerErscheinung * .07, 0, 1);
            const abzeichen = [];
            if (fehlerSortieren === 0) abzeichen.push('klassen');
            if (!fielAufEHerein) abzeichen.push('keinE');
            api.fertig({
              guete,
              xp: 50 + richtig * 20,
              titel: `${richtig} von ${gesamt} Fragen richtig` +
                (fehlerSortieren ? ` · ${fehlerSortieren} beim Einsortieren daneben` : ' · fehlerfrei einsortiert'),
              abzeichen,
              zeilen: BRANDKLASSEN.map(bk => el('span', { html:
                `<b>${bk.id}</b> — ${bk.braende} <i style="opacity:.7">(${bk.erscheinung})</i>` }))
                .concat([el('span', { html: '<b>E</b> — gibt es nicht.' })]),
            });
          },
          (i, n) => el('div', { style: { paddingTop: '4px' } },
            UI.dunkler(), UI.schritte(n, i)));
      });
    };

    /* --- Einstieg ---------------------------------------------------------- */
    UI.zeige('l2-intro', (s) => {
      Stage.kameraSetzen([0, 4.2, 14], [0, 1.2, 0]);
      Stage.kameraFahren([-3.5, 3.6, 11], [0, 1.4, 0], 2.4);
      s.appendChild(el('div', { class: 'mitte' },
        el('div', { class: 'panel glas', style: { width: 'min(620px,94vw)', textAlign: 'center' } },
          el('div', { class: 'dienstvorschrift', text: 'Aufgabe 2' }),
          el('h2', { text: 'Was brennt denn da?' }),
          el('p', { style: { margin: '.5em 0 0' }, html:
            'Ein brennender Strohballen und eine brennende Fritteuse haben wenig gemeinsam. Deshalb werden Brände eingeteilt – nach dem, was da brennt. Diese Schubladen heißen <b>Brandklassen</b>.' }),
          el('p', { style: { margin: '.5em 0 0' }, html:
            'Fünf gibt es: <b>A, B, C, D</b> und <b>F</b>. Sie stehen nicht dafür, wie gefährlich ein Brand ist, sondern allein dafür, <b>womit man ihn löschen darf</b> – auf jedem Feuerlöscher stehen genau diese Buchstaben.' }),
          el('p', { class: 'hinweis', text:
            'Fünf Tonnen stehen bereit, eine je Klasse. Sortier ein, was gleich vorbeikommt – und pass auf, es sind zwei Fallen dabei.' }),
          el('button', { class: 'btn gross', onclick: () => { Audio3.klick(); phaseSortieren(); } }, 'Los →'))));
    });
  },
});
