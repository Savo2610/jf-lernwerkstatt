/* ============================================================================
   Level 3 – Luft zum Brennen

   Die zweite Ecke des Dreiecks. Level 2 hat den brennbaren Stoff durchgenommen,
   hier ist der Sauerstoff dran.

   Drei Einsichten, in dieser Reihenfolge:
     1. Luft ist zu vier Fünfteln Stickstoff. Nur ein Fünftel brennt mit.
     2. Weniger Sauerstoff → das Feuer geht aus. Mehr → es rast.
        Das ist nicht nur Wissen, das ist das Löschverfahren Ersticken,
        eine Halbzeit im Voraus.
     3. Es kommt nicht nur darauf an, WIE VIEL Sauerstoff da ist, sondern auch,
        wie gut er an den Stoff herankommt. Gleich viel Holz, vier Zerteilungs-
        grade, vier völlig verschiedene Brände.

   Die dritte Runde ist zugleich die Brücke zu Level 4: Beim Staub sind wir
   beim Mengenverhältnis, und da geht es weiter.

   Quelle: HLFS Truppmann Teil 1, Kapitel 3 „Sauerstoff" und 4.1 „Verhältnis
   Masse zu Oberfläche", Ausgabe 10/2012.
   ========================================================================== */
LEVELS.push({
  id: 'sauerstoff',
  name: 'Luft zum Brennen',
  icon: '💨',
  farbe: 'var(--blau)',
  kurz: 'Nur ein Fünftel der Luft brennt mit. Was passiert, wenn es weniger wird?',

  start(api) {
    let fehlerLuft = 0, fehlerOberflaeche = 0;

    /* --- Kulisse ---------------------------------------------------------- */
    Stage.leeren();
    Stage.welt.add(baueUebungsplatz({ seite: 26 }));

    // Die Werkbank wird erst in Runde 3 gebraucht. Bis dahin stünde sie
    // zwischen Kamera und Glocke und verdeckte genau das, worum es geht.
    const werkbank = baueWerkbank(6.4);
    werkbank.position.set(0, 0, 3.2);
    werkbank.visible = false;
    Stage.welt.add(werkbank);

    const fahne = baueWindfahne();
    fahne.position.set(9.5, 0, -4);
    Stage.welt.add(fahne);

    // Die Schale steht auf dem Boden, nicht auf der Werkbank: Über sie fährt
    // die Glocke, und die braucht Luft nach oben.
    const schale = baueFeuerschale({ radius: .78 });
    schale.position.set(0, 0, -1.2);
    // wie die Glocke: erst ab Runde 2 im Bild
    schale.visible = false;
    Stage.welt.add(schale);

    const feuer = baueFeuer({ hoehe: 2.0, breite: .7, zungen: 7, licht: true, glutAnteil: .5 });
    feuer.position.set(0, schale.userData.feuerHoehe, -1.2);
    feuerStaerke(feuer, 0, true);
    Stage.welt.add(feuer);

    const rauch = baueWolken('rauch', 12);
    rauch.position.set(0, schale.userData.feuerHoehe + 1.9, -1.2);
    wolkenStaerke(rauch, 0, true);
    Stage.welt.add(rauch);

    const glocke = baueGlasglocke({ radius: 1.35, hoehe: 3.0 });
    glocke.position.set(0, 0, -1.2);
    // In Runde 1 hängt sie sonst als Glaszylinder mitten zwischen den
    // Flaschen. Sie kommt erst, wenn sie gebraucht wird.
    glocke.visible = false;
    Stage.welt.add(glocke);

    Stage.anmelden((dt, t) => {
      feuerUpdate(feuer, dt, t);
      wolkenUpdate(rauch, dt);
      windfahneUpdate(fahne, dt, t, -.5);
    });

    /* --- Runde 1: Woraus besteht Luft? -----------------------------------
       Drei Flaschen, drei Anteile. Die Falle ist der Reflex: Wer nur ans
       Feuer denkt, gibt dem Sauerstoff den grossen Anteil.                */
    const phaseLuft = () => {
      // Flaschen aufstellen, jede in ihrer Farbe
      const flaschen = LUFT.map((teil, i) => {
        const f = baueLuftflasche(new THREE.Color(teil.farbe).getHex());
        f.position.set((i - 1) * 2.3, 0, .4);
        Stage.welt.add(f);
        return f;
      });

      const MOTIV_L = [
        [-3.6, 0, -.6], [3.6, 0, -.6], [3.6, 0, 1.4], [-3.6, 0, 1.4], [0, 2.1, .4],
      ];

      let gesetzt = 0;

      UI.zeige('l3-luft', (s) => {
        HotSpots.starten(s);

        const ablagen = LUFT.map((teil, i) => {
          // Kurzname an der Marke: Im Hochformat stehen die drei Flaschen im
          // Bild eine Handbreit auseinander, und „Edelgase und CO₂" schiebt
          // sich dann über die Nachbarmarke.
          const node = el('div', { class: 'ablage sockelziel', 'data-id': teil.id },
            el('b', { text: teil.kurz || teil.name }),
            el('span', { class: 'fragezeichen', text: '?' }));
          HotSpots.hinzu(new THREE.Vector3((i - 1) * 2.3, 2.5, .4), node);
          return node;
        });

        const leiste = el('div', { class: 'kartenleiste' });
        const unten = unterbau(leiste);

        // Die Prozentzahlen als Karten, gemischt
        shuffle(LUFT.map(t => ({ id: t.id, anteil: t.anteil, quelle: t }))).forEach(k => {
          const node = el('div', { class: 'brennkarte' },
            el('b', { class: 'kennzahl', text: k.anteil + ' %' }));
          ziehbarMachen(node, {
            daten: k, radius: 150,
            aufAblage: (ablage, daten, quelle) => {
              if (ablage.dataset.filled) { Audio3.zu(); return; }
              const ziel = LUFT.find(t => t.id === ablage.dataset.id);
              if (!ziel || ziel.id !== daten.id) {
                fehlerLuft++;
                Audio3.falsch();
                quelle.classList.add('wackeln');
                setTimeout(() => quelle.classList.remove('wackeln'), 450);
                unten.hinweis(daten.anteil === 78
                  ? 'So viel ist es – aber nicht davon. Der große Anteil gehört zu dem Gas, das gar nicht mitbrennt.'
                  : `${daten.anteil} % gehören woanders hin.`, 'schlecht', 3200);
                return;
              }
              ablage.dataset.filled = '1';
              ablage.classList.add('voll');
              ablage.innerHTML = '';
              ablage.appendChild(el('b', { text: ziel.kurz || ziel.name }));
              ablage.appendChild(el('span', { class: 'kennzahl gross', text: ziel.anteil + ' %' }));
              ablage.style.setProperty('--f', ziel.farbe);
              quelle.remove();
              Audio3.richtig();
              gesetzt++;
              if (gesetzt === LUFT.length) setTimeout(luftAufloesung, 700);
            },
          });
          leiste.appendChild(node);
        });

        const auftrag = el('div', { class: 'auftrag' },
          el('div', { class: 'dienstvorschrift', text: 'Aufgabe 3' }),
          el('h2', { text: 'Woraus besteht Luft?' }),
          el('p', { class: 'hinweis', text: 'Drei Flaschen, drei Anteile. Zieh jede Zahl an die richtige Flasche.' }));
        s.appendChild(auftrag);
        s.appendChild(unten);

        const wache = motivWache(MOTIV_L, unten,
          { hoch: .34, weit: .9, anteil: .95, rand: .45, panelUnten: true, obenNode: auftrag,
            sofort: true });
        return () => { wache(); HotSpots.beenden(); };
      });

      const luftAufloesung = () => {
        UI.zeige('l3-luft-aufloesung', (s) => {
          const panel = el('div', { class: 'panel glas unterbau', style: { textAlign: 'center' } },
            el('h2', { text: '💨 Ein Fünftel. Mehr nicht.' }),
            el('p', { style: { margin: '.4em 0 0' }, html:
              'Von der Luft, die du gerade einatmest, sind rund <b>21 Prozent</b> Sauerstoff. ' +
              'Die großen 78 Prozent sind <b>Stickstoff</b> – der brennt nicht mit und hilft dem Feuer kein bisschen.' }),
            el('p', { class: 'hinweis', style: { marginTop: '.5em' }, text:
              'Und trotzdem reicht dieses eine Fünftel für jeden Brand, den die Feuerwehr je gelöscht hat.' }),
            el('button', { class: 'btn gross', style: { marginTop: '.5em' },
              onclick: () => {
                Audio3.klick();
                // Erst absinken lassen, dann weiter: Sonst steht die nächste
                // Runde schon da, während die Flaschen noch im Bild sind.
                flaschenAbraeumen();
                setTimeout(phaseGlocke, 720);
              } }, 'Weiter →'));
          s.appendChild(panel);
          return motivWache(MOTIV_L, panel, { hoch: .34, weit: .9, anteil: .9, rand: .45, panelUnten: true });
        });
      };

      const flaschenAbraeumen = () => {
        flaschen.forEach((f, i) => {
          Bewegung.neu(.7, (p) => { f.position.y = -p * 3; },
            () => { Stage.welt.remove(f); f.traverse(o => { if (o.geometry) o.geometry.dispose(); }); });
        });
      };
    };

    /* --- Runde 2: die Glasglocke ----------------------------------------
       Der Regler ist das Herzstück dieses Levels. Man sieht die Grenze nicht
       nur, man fährt sie ab: Bei 21 brennt es ruhig, ab etwa 16 wird es
       zappelig, darunter geht es aus, und nach oben lodert es.            */
    const MOTIV_G = [
      [-1.9, 0, -3.1], [1.9, 0, -3.1], [1.9, 0, .7], [-1.9, 0, .7], [0, 2.6, -1.2],
    ];

    const phaseGlocke = () => {
      glocke.visible = true;
      schale.visible = true;
      feuerStaerke(feuer, 1, true);
      wolkenStaerke(rauch, .4);
      Audio3.feuer();

      // Wie kräftig das Feuer bei einem Sauerstoffgehalt brennt.
      // Unterhalb der Mindestkonzentration ist Schluss, darüber wächst es –
      // bei reinem Sauerstoff deutlich über das normale Maß hinaus.
      const staerkeBei = (o2) => {
        if (o2 <= SAUERSTOFF.erlischtVon) return 0;
        if (o2 >= SAUERSTOFF.inLuft) return clamp(1 + (o2 - SAUERSTOFF.inLuft) * .04, 1, 2.4);
        return clamp((o2 - SAUERSTOFF.erlischtVon) / (SAUERSTOFF.inLuft - SAUERSTOFF.erlischtVon), 0, 1);
      };

      let warAus = false, warHoch = false;

      UI.zeige('l3-glocke', (s) => {
        glockeFahren(glocke, 1);

        const stand = el('div', { class: 'zustandszeile' });

        // Muss VOR dem Regler stehen: `regler()` meldet den Startwert sofort,
        // damit die Anzeige gleich stimmt – und dabei läuft `onWert` einmal
        // durch. Wer den Knopf erst darunter anlegt, greift dort auf eine
        // Konstante zu, die es noch nicht gibt, und das Level bleibt leer.
        const weiter = el('button', { class: 'btn gross',
          onclick: () => { Audio3.klick(); feuer.scale.setScalar(1); glockeAufloesung(); } });
        weiter.disabled = true;

        const rg = regler({
          min: 0, max: 40, wert: 21, einheit: ' Vol.-%',
          beschriftung: 'Sauerstoff unter der Glocke',
          zonen: [
            { von: 0, bis: SAUERSTOFF.erlischtVon, farbe: 'color-mix(in srgb,var(--blau) 30%,#fff)', name: 'zu wenig – es geht aus' },
            { von: SAUERSTOFF.erlischtVon, bis: SAUERSTOFF.erlischtBis, farbe: 'color-mix(in srgb,var(--gelb) 45%,#fff)', name: 'Grenzbereich' },
            { von: SAUERSTOFF.erlischtBis, bis: 40, farbe: 'color-mix(in srgb,var(--glut) 34%,#fff)', name: 'es brennt' },
          ],
          onWert: (v) => {
            const st = staerkeBei(v);
            feuerStaerke(feuer, Math.min(1, st));
            // Über 100 % wächst nicht mehr die Stärke, sondern die Flamme
            feuer.scale.setScalar(clamp(st, .0001, 2.4));
            wolkenStaerke(rauch, st > 0 ? .3 + st * .25 : 0);
            if (st === 0) {
              warAus = true;
              stand.textContent = 'Aus. Zu wenig Sauerstoff – genau so erstickt man ein Feuer.';
              stand.className = 'zustandszeile aus';
            } else if (v > 26) {
              warHoch = true;
              stand.textContent = 'Es rast. Mehr Sauerstoff heißt: leichter entzündbar, schneller abgebrannt, heißer.';
              stand.className = 'zustandszeile hoch';
            } else if (v >= SAUERSTOFF.erlischtVon && v <= SAUERSTOFF.erlischtBis) {
              stand.textContent = 'Grenzbereich. Hier geben die meisten Brände auf.';
              stand.className = 'zustandszeile grenze';
            } else {
              stand.textContent = 'Normale Luft. So brennt ein Lagerfeuer.';
              stand.className = 'zustandszeile normal';
            }
            weiter.disabled = !(warAus && warHoch);
            weiter.textContent = warAus && warHoch
              ? 'Verstanden →'
              : warAus ? 'Und jetzt mehr als normal …'
                : 'Erst mal ausmachen …';
          },
        });

        // Keine Auftragskarte in dieser Runde: Regler, Zustandszeile und Knopf
        // sind zusammen schon hoch, und mit einer Karte obendrauf bliebe der
        // Glocke ein Streifen von zwei Fingerbreit. Die Aufgabe steht deshalb
        // als erste Zeile im Bedienfeld – dort, wo man ohnehin hinschaut.
        const panel = el('div', { class: 'panel glas unterbau', style: { textAlign: 'center' } },
          el('p', { class: 'hinweis', style: { margin: '0 0 .5em' }, text:
            'Mach das Feuer aus – und lass es danach lodern.' }),
          rg, stand, weiter);
        s.appendChild(panel);

        return motivWache(MOTIV_G, panel,
          { hoch: .3, weit: .88, anteil: .95, rand: .4, panelUnten: true });
      });
    };

    const glockeAufloesung = () => {
      feuerStaerke(feuer, 1);
      UI.zeige('l3-glocke-aufloesung', (s) => {
        const panel = el('div', { class: 'panel glas unterbau', style: { textAlign: 'center' } },
          el('h2', { text: '💨 Weniger reicht schon' }),
          el('p', { style: { margin: '.4em 0 0' }, html:
            `Die meisten Brände erlöschen bereits bei <b>${SAUERSTOFF.erlischtVon} bis ${SAUERSTOFF.erlischtBis} Vol.-%</b>. ` +
            'Man muss den Sauerstoff also gar nicht ganz wegnehmen – ein Stück weit runter genügt.' }),
          el('div', { class: 'zitat', style: { marginTop: '.6em' }, text: SAUERSTOFF.zitat }),
          el('p', { class: 'hinweis', style: { marginTop: '.5em' }, text:
            'Und nach oben? Da steigt alles: Entzündbarkeit, Brennbarkeit, Abbrandrate, Brandtemperatur. In reinem Sauerstoff brennt sogar Stahl.' }),
          el('button', { class: 'btn gross', style: { marginTop: '.5em' },
            onclick: () => { Audio3.klick(); phaseOberflaeche(); } }, 'Weiter →'));
        s.appendChild(panel);
        return motivWache(MOTIV_G, panel, { hoch: .3, weit: .88, anteil: .9, rand: .4, panelUnten: true });
      });
    };

    /* --- Runde 3: gleich viel Holz, vier Zerteilungsgrade -----------------
       Erst tippen, dann zusehen. Die Reihenfolge ist wichtig: Wer erst rät,
       merkt sich das Ergebnis; wer nur zuschaut, vergisst es.             */
    const phaseOberflaeche = () => {
      // Glocke hoch, Feuer aus, jetzt kommt die Werkbank ins Bild
      werkbank.visible = true;
      glockeFahren(glocke, 0);
      feuerStaerke(feuer, 0);
      wolkenStaerke(rauch, 0);

      const proben = ZERTEILUNG.map((z, i) => {
        const p = baueHolzprobe(z.id);
        p.position.set((i - 1.5) * 1.55, werkbank.userData.hoehe || 1.05, 3.2);
        Stage.welt.add(p);
        const f = baueFeuer({ hoehe: .95, breite: .34, zungen: 4, glutAnteil: .5 });
        f.position.set((i - 1.5) * 1.55, (werkbank.userData.hoehe || 1.05) + .2, 3.2);
        feuerStaerke(f, 0, true);
        Stage.welt.add(f);
        Stage.anmelden((dt, t) => feuerUpdate(f, dt, t));
        return { z, obj: p, feuer: f };
      });

      glocke.visible = false;
      schale.visible = false;

      const MOTIV_O = [
        [-3.3, 1.0, 2.6], [3.3, 1.0, 2.6], [3.3, 1.0, 3.8], [-3.3, 1.0, 3.8], [0, 2.0, 3.2],
      ];

      UI.zeige('l3-oberflaeche', (s) => {
        HotSpots.starten(s);
        let beantwortet = false;

        const marken = proben.map((pr, i) => {
          const node = el('button', { class: 'weltmarke probenknopf' },
            el('span', { class: 'ic', text: pr.z.icon }),
            el('b', { text: pr.z.name }));
          node.addEventListener('click', () => {
            if (beantwortet) return;
            if (pr.z.id !== 'staub') {
              fehlerOberflaeche++;
              Audio3.falsch();
              node.classList.add('falsch');
              setTimeout(() => node.classList.remove('falsch'), 600);
              unten.hinweis(`${pr.z.name}: ${pr.z.text}`, 'schlecht', 3400);
              return;
            }
            beantwortet = true;
            Audio3.richtig();
            node.classList.add('richtig');
            unten.hinweis('Genau. Je feiner zerteilt, desto mehr Oberfläche berührt Luft.', 'gut', 4000);
            setTimeout(rennen, 900);
          });
          HotSpots.hinzu(new THREE.Vector3((i - 1.5) * 1.55, (werkbank.userData.hoehe || 1.05) + .95, 3.2), node);
          return node;
        });

        const unten = unterbau();

        const auftrag = el('div', { class: 'auftrag' },
          el('div', { class: 'dienstvorschrift', text: 'Aufgabe 3' }),
          el('h2', { text: 'Viermal dasselbe Holz' }),
          el('p', { class: 'hinweis', text: 'Gleiche Menge, nur anders zerteilt. Was brennt am schnellsten ab?' }));
        s.appendChild(auftrag);
        s.appendChild(unten);

        const wache = motivWache(MOTIV_O, unten,
          { hoch: .3, weit: .92, anteil: .95, rand: .35, panelUnten: true, obenNode: auftrag });
        return () => { wache(); HotSpots.beenden(); };
      });

      /* Alle vier gleichzeitig anzünden. Jede Probe brennt so lange, wie ihr
         `tempo` es zulässt – man sieht das Ergebnis, statt es zu lesen. */
      const rennen = () => {
        UI.zeige('l3-rennen', (s) => {
          HotSpots.starten(s);
          Audio3.feuer();

          const marken = proben.map((pr, i) => {
            const node = el('div', { class: 'weltmarke' },
              el('span', { class: 'ic', text: pr.z.icon }),
              el('b', { text: pr.z.name }));
            HotSpots.hinzu(new THREE.Vector3((i - 1.5) * 1.55, (werkbank.userData.hoehe || 1.05) + .95, 3.2), node);
            return node;
          });

          // Jede Probe: schnell auflodern, dann über ihre Brenndauer ausgehen.
          // Die Dauer ist umgekehrt proportional zum Zerteilungsgrad.
          proben.forEach((pr, i) => {
            const dauer = 7 / pr.z.tempo;
            feuerStaerke(pr.feuer, 1);
            pr.feuer.scale.setScalar(clamp(.7 + pr.z.tempo * .12, .7, 2.2));
            Bewegung.neu(dauer, () => {}, () => {
              feuerStaerke(pr.feuer, 0);
              marken[i].classList.add('fertig');
              marken[i].appendChild(el('small', { text: 'abgebrannt' }));
            });
          });

          const panel = el('div', { class: 'panel glas unterbau', style: { textAlign: 'center' } },
            el('h2', { text: '🌾 Die Oberfläche macht das Tempo' }),
            el('p', { style: { margin: '.4em 0 0' }, text:
              'Dieselbe Masse Holz. Der Balken glimmt vor sich hin, die Späne sind sofort weg – weil viel mehr Oberfläche Luft berührt.' }),
            el('p', { class: 'hinweis', style: { marginTop: '.5em' }, html:
              'Ganz fein verteilt verhält sich ein Feststoff wie ein Gas: <b>Holzstaub kann explodieren.</b> ' +
              'Damit ist in Mühlen, Schreinereien, Bäckereien, Kohlenkellern und auf Dachböden zu rechnen.' }),
            el('button', { class: 'btn gross', style: { marginTop: '.5em' },
              onclick: () => { Audio3.klick(); phaseFragen(); } }, 'Weiter →'));
          s.appendChild(panel);

          const wache = motivWache(MOTIV_O, panel,
            { hoch: .3, weit: .92, anteil: .92, rand: .35, panelUnten: true });
          return () => { wache(); HotSpots.beenden(); };
        });
      };
    };

    /* --- Fragen ----------------------------------------------------------- */
    const phaseFragen = () => {
      const fragen = [
        {
          frage: 'Wie viel Prozent der Luft sind Sauerstoff?',
          antworten: ['ca. 21 %', 'ca. 50 %', 'ca. 78 %', 'ca. 100 %'],
          richtig: 0,
          erklaerung: 'Rund ein Fünftel. Der große Rest ist Stickstoff, der nicht mitbrennt.',
          zitat: 'Der zur Verbrennung notwendige Sauerstoff ist zu ca. 21 Vol.-% in der Umgebungsluft vorhanden.',
        },
        {
          frage: 'Ab welcher Sauerstoffkonzentration erlöschen die meisten Brände?',
          antworten: ['unter 15–17 Vol.-%', 'unter 5 Vol.-%', 'erst bei 0 Vol.-%', 'unter 20 Vol.-%'],
          richtig: 0,
          erklaerung: 'Man muss den Sauerstoff nicht restlos wegnehmen. Ein Stück weit runter genügt – der genaue Wert hängt vom Brennstoff ab und heißt Mindestsauerstoffkonzentration.',
          zitat: SAUERSTOFF.zitat,
        },
        {
          frage: 'Was passiert, wenn mehr Sauerstoff dazukommt?',
          antworten: [
            'Das Feuer wird kleiner',
            'Nichts, 21 % sind das Maximum',
            'Es brennt leichter, schneller und heißer',
            'Nur die Farbe der Flamme ändert sich',
          ],
          richtig: 2,
          erklaerung: 'Entzündbarkeit, Brennbarkeit, Abbrandrate und Brandtemperatur steigen alle. In reinem Sauerstoff brennen sogar Eisen und Stahl.',
        },
        {
          frage: 'Ein Balken und ein Haufen Späne, gleich viel Holz. Was brennt schneller?',
          antworten: [
            'Der Balken – er ist massiver',
            'Die Späne – sie haben mehr Oberfläche',
            'Beide gleich, es ist ja dasselbe Holz',
            'Kommt allein auf die Zündquelle an',
          ],
          richtig: 1,
          erklaerung: 'Je feiner zerteilt, desto größer die Oberfläche, die mit Luftsauerstoff in Kontakt kommt. Ganz fein verteilt – als Staub – kann es sogar explodieren.',
          zitat: 'Die Verbrennung ist bei fein verteilten brennbaren Stoffen intensiver als bei massiv vorliegenden Stoffen, da eine bessere Mischung von Sauerstoff und brennbarem Stoff vorliegt.',
        },
      ];

      UI.zeige('l3-fragen', (s) => {
        Stage.bildVersatz(0, 0);
        frageReihe(s, fragen,
          (richtig, gesamt) => {
            const guete = clamp(richtig / gesamt - fehlerLuft * .08 - fehlerOberflaeche * .06, 0, 1);
            const abzeichen = [];
            if (fehlerLuft === 0) abzeichen.push('luft');
            if (fehlerOberflaeche === 0) abzeichen.push('oberflaeche');
            api.fertig({
              guete,
              xp: 50 + richtig * 20,
              titel: `${richtig} von ${gesamt} Fragen richtig` +
                (fehlerLuft || fehlerOberflaeche
                  ? ` · ${fehlerLuft + fehlerOberflaeche} Fehlgriff${fehlerLuft + fehlerOberflaeche > 1 ? 'e' : ''}`
                  : ' · kein einziger Fehlgriff'),
              abzeichen,
              zeilen: [
                el('span', { html: '<b>Luft:</b> 21 % Sauerstoff, 78 % Stickstoff, 1 % Rest.' }),
                el('span', { html: `<b>Aus:</b> unter ${SAUERSTOFF.erlischtVon}–${SAUERSTOFF.erlischtBis} Vol.-% erlöschen die meisten Brände.` }),
                el('span', { html: '<b>Mehr Sauerstoff:</b> leichter entzündbar, schneller abgebrannt, heißer.' }),
                el('span', { html: '<b>Oberfläche:</b> fein zerteilt brennt schneller – Staub kann explodieren.' }),
              ],
            });
          },
          (i, n) => el('div', { style: { paddingTop: '4px' } },
            UI.dunkler(), UI.schritte(n, i)));
      });
    };

    /* --- Einstieg ---------------------------------------------------------- */
    UI.zeige('l3-intro', (s) => {
      Stage.kameraSetzen([0, 3.2, 11], [0, 1.2, 0]);
      Stage.kameraFahren([-3.6, 3.8, 8.6], [0, 1.1, .4], 2.2);
      s.appendChild(el('div', { class: 'mitte' },
        el('div', { class: 'panel glas', style: { width: 'min(620px,94vw)', textAlign: 'center' } },
          el('div', { class: 'dienstvorschrift', text: 'Aufgabe 3' }),
          el('h2', { text: 'Luft zum Brennen' }),
          el('p', { style: { margin: '.5em 0 0' }, text:
            'Die zweite Ecke des Dreiecks: der Sauerstoff. Er ist überall, wo Luft ist – aber viel weniger, als die meisten denken.' }),
          el('p', { class: 'hinweis', text:
            'Und wenn du weißt, wie wenig davon ein Feuer braucht, weißt du auch schon, wie man es erstickt.' }),
          el('button', { class: 'btn gross', onclick: () => { Audio3.klick(); phaseLuft(); } }, 'Los →'))));
    });
  },
});
