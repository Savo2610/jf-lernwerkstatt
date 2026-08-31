/* ============================================================================
   Level 1 – Das Verbrennungsdreieck

   Der Einstieg und zugleich die Landkarte für alles Weitere: Was zusammen-
   kommen muss, damit es brennt. Fällt eines weg, ist Schluss. Genau daran
   hängt später jedes Löschverfahren.

   Warum Dreieck und trotzdem vier Voraussetzungen
   -----------------------------------------------
   Die Literatur zeichnet ein Dreieck: brennbarer Stoff, Sauerstoff,
   Zündenergie – und in der Mitte das richtige Mengenverhältnis. Die
   Lernunterlage zählt vier Voraussetzungen auf. Beides ist richtig, und die
   Bühne zeigt genau das: drei Säulen an den Ecken, ein flaches Feld in der
   Mitte. Das Mengenverhältnis kann gar keine vierte Ecke haben, denn es ist
   kein eigener Stoff, sondern das Verhältnis ZWISCHEN zweien der Ecken.

   Vorher stand hier ein Viereck aus vier gleichen Säulen. Das war fachlich
   vertretbar, aber es widersprach jedem Buch und jedem Plakat, das die Kinder
   sonst sehen – und ein Widerspruch, den niemand auflöst, bleibt als Unsinn
   hängen. Also: das vertraute Bild zeigen und den Unterschied benennen.

   Der didaktische Kniff steckt in den falschen Karten: Die Verführer sind
   nicht irgendwelche, sondern genau die ERSCHEINUNGEN des Feuers – Flamme,
   Wärme, Rauch. Wer sie in Runde eins auf einen Sockel zieht, macht den
   Fehler, den dieses Thema jedem stellt. Runde vier löst ihn auf: Das eine
   ist die Zutat, das andere das Ergebnis.

   Quelle: HLFS Truppmann Teil 1, Kapitel 1 „Merkmale und Voraussetzungen
   des Brennens", Ausgabe 10/2012.
   ========================================================================== */
LEVELS.push({
  id: 'dreieck',
  name: 'Das Verbrennungsdreieck',
  icon: '🔺',
  farbe: 'var(--glut)',
  kurz: 'Drei Ecken, eine Mitte – und ohne eines davon brennt gar nichts.',

  start(api) {
    let fehlerAufbau = 0, fehlerSortieren = 0;

    /* --- Die Kulisse: drei Sockel im Dreieck, ein Feld in der Mitte ------ */
    Stage.leeren();
    Stage.welt.add(baueUebungsplatz({ seite: 26 }));

    const schale = baueFeuerschale({ radius: .9 });
    Stage.welt.add(schale);

    const feuer = baueFeuer({ hoehe: 2.4, breite: .84, zungen: 8, licht: true, glutAnteil: .6 });
    feuer.position.y = schale.userData.feuerHoehe;
    feuerStaerke(feuer, 0, true);
    Stage.welt.add(feuer);

    const rauch = baueWolken('rauch', 14);
    rauch.position.y = schale.userData.feuerHoehe + 2.1;
    wolkenStaerke(rauch, 0, true);
    Stage.welt.add(rauch);

    /* Die drei Ecken. Eine hinten, zwei vorn – nicht umgekehrt: Stünde eine
       Säule vorn in der Mitte, verdeckte sie aus jeder Kameraposition genau
       die Feuerschale, um die es geht. Der Schwerpunkt des Dreiecks liegt
       damit im Ursprung, wo die Schale steht. */
    const ECKEN = [[0, -3.5], [2.95, 1.75], [-2.95, 1.75]];

    // Welche Voraussetzung in die Mitte gehört. Die drei Ecken sind
    // untereinander austauschbar – es gibt keinen Grund, warum Sauerstoff
    // ausgerechnet hinten stehen müsste, und wer das erzwingt, lässt raten
    // statt verstehen.
    const MITTE = 'menge';

    const saeulen = ECKEN.map(([x, z]) => {
      const s = baueSockel({ hoehe: 1.15 });
      s.position.set(x, 0, z);
      Stage.welt.add(s);
      return s;
    });

    const mittelfeld = baueMittelfeld({ innen: 1.3, aussen: 2.1 });
    Stage.welt.add(mittelfeld);

    /* Alle vier Plätze in einer Liste – die Runden behandeln sie gleich.
       `marke` ist der Punkt, an dem die Beschriftung im Bild klebt: über dem
       Säulenkopf, beim Mittelfeld vorn am Rand. Vorn, nicht in der Mitte:
       Dort stünde sie im Feuer. Und weit genug vorn, dass zwischen ihr und den
       Marken der beiden vorderen Säulen im Bild noch Luft bleibt – auf dem
       Handy stossen sie sonst aneinander. */
    const plaetze = [
      ...saeulen.map((so) => ({
        obj: so,
        marke: () => new THREE.Vector3(so.position.x, so.userData.sockel.hoehe + .3, so.position.z),
      })),
      {
        obj: mittelfeld, mitte: true,
        marke: () => new THREE.Vector3(0, .3, 2.05),
      },
    ];

    // ein paar Kegel und die Windfahne als Kulisse
    [[-6.5, 5.5], [6.5, 5.5], [-6.5, -5.5], [6.5, -5.5]].forEach(([x, z]) => {
      const k = baueKegel(); k.position.set(x, 0, z); Stage.welt.add(k);
    });
    const fahne = baueWindfahne();
    fahne.position.set(9.5, 0, -4);
    Stage.welt.add(fahne);

    Stage.anmelden((dt, t) => {
      feuerUpdate(feuer, dt, t);
      wolkenUpdate(rauch, dt);
      windfahneUpdate(fahne, dt, t, -.6);
    });

    /* Alle Punkte, die im Bild sein müssen – damit die Kamera auf dem Handy
       genauso passt wie am Beamer.

       Achtung, hier steckt eine Falle: `Stage.einpassen` legt einen Quader um
       diese Punkte und passt dessen acht Ecken ein, nicht die Punkte selbst.
       Die volle Flammenhöhe (2,4) hier einzutragen zieht deshalb vier Ecken
       hoch über die Säulen, wo gar nichts steht – der Quader wird fast doppelt
       so hoch wie das Motiv, und die Kamera fährt entsprechend weit weg. Also
       nur bis Säulenhöhe. Die Flammenspitze steht dann etwas über dem Quader
       und ragt oben aus der eingepassten Fläche heraus – genau dafür ist
       `rand` da. */
    const MOTIV = [
      [-3.2, 0, -3.8], [3.2, 0, -3.8], [3.2, 0, 2.4], [-3.2, 0, 2.4],
      [0, 1.4, 0],
    ];

    /* Einen Platz auf eine Höhe fahren. Immer vom aktuellen Stand aus, nie von
       einem angenommenen: Wird zweimal hintereinander gefahren, bevor die
       erste Fahrt durch ist, springt er sonst. */
    const platzFahren = (obj, zielY, dauer) => {
      const vonY = obj.position.y;
      Bewegung.neu(dauer, (p) => { obj.position.y = lerp(vonY, zielY, p); });
    };

    /* --- Runde 1: das Dreieck aufbauen ----------------------------------- */
    const phaseAufbau = () => {
      // Verführer sind die Erscheinungen. Das ist Absicht: Genau diese
      // Verwechslung räumt Runde 4 aus.
      const karten = shuffle([
        ...VORAUSSETZUNGEN.map(v => ({ id: v.id, text: v.name, icon: v.icon, farbe: v.farbe, gut: true, quelle: v })),
        { id: 'x-flamme', text: 'Flamme',  icon: '🔥',  gut: false,
          warum: 'Die Flamme ist das, was du siehst, wenn es schon brennt – keine Zutat.' },
        { id: 'x-waerme', text: 'Wärme',   icon: '🌡️', gut: false,
          warum: 'Wärme entsteht beim Brennen. Was das Feuer zum Starten braucht, heißt Zündenergie.' },
        { id: 'x-rauch',  text: 'Rauch',   icon: '☁️',  gut: false,
          warum: 'Rauch ist ein Verbrennungsprodukt. Er kommt heraus, er geht nicht hinein.' },
      ]);

      let gesetzt = 0;

      UI.zeige('l1-aufbau', (s) => {
        HotSpots.starten(s);

        /* Über jedem Sockelkopf klebt eine Ablage, und eine liegt in der
           Mitte. Man zieht die Karte also direkt auf ihren Platz im Bild und
           nicht in eine Liste daneben – der Unterschied entscheidet, ob das
           Dreieck begriffen wird.

           Die drei Ecken nehmen jede der drei Eckkarten – nur die Mitte ist
           wählerisch. Das ist der ganze Punkt dieser Runde: Das
           Mengenverhältnis gehört in die Mitte und nirgendwo sonst hin. */
        const ablagen = plaetze.map((pl, i) => {
          const node = el('div', {
            class: 'ablage sockelziel' + (pl.mitte ? ' mittelziel' : ''),
            'data-nr': String(i),
          }, el('span', { class: 'fragezeichen', text: '?' }));
          HotSpots.hinzu(pl.marke(), node);
          return node;
        });

        const leiste = el('div', { class: 'kartenleiste' });
        const unten = unterbau(leiste);

        const kartePruefen = (ablage, daten, quelle) => {
          if (ablage.dataset.filled) { Audio3.zu(); return; }
          const nr = Number(ablage.dataset.nr);
          const platz = plaetze[nr];

          if (!daten.gut) {
            fehlerAufbau++;
            Audio3.falsch();
            quelle.classList.add('wackeln');
            setTimeout(() => quelle.classList.remove('wackeln'), 450);
            unten.hinweis(daten.warum, 'schlecht');
            return;
          }
          // Richtige Karte, falscher Platz. Kein Fehler für die Wertung – man
          // soll ausprobieren dürfen, wohin was gehört. Nur der Fehlgriff auf
          // eine Erscheinung zählt.
          // `!!`, weil die Ecken kein `mitte` tragen: undefined !== false wäre
          // sonst immer wahr, und keine einzige Eckkarte käme je an.
          if (!!platz.mitte !== (daten.id === MITTE)) {
            Audio3.zu();
            quelle.classList.add('wackeln');
            setTimeout(() => quelle.classList.remove('wackeln'), 450);
            unten.hinweis(daten.id === MITTE
              ? 'Das Mengenverhältnis hat keine eigene Ecke – es ist ja das Verhältnis zwischen Stoff und Sauerstoff. Zieh es in die Mitte.'
              : `${daten.text} ist ein eigener Stoff und gehört auf eine Ecke. In die Mitte kommt das, was zwischen zweien davon steht.`,
              'schlecht', 3400);
            return;
          }

          ablage.dataset.filled = '1';
          ablage.classList.add('voll');
          ablage.innerHTML = '';
          ablage.appendChild(el('span', { class: 'ic', text: daten.icon }));
          ablage.appendChild(el('b', { text: daten.text }));
          ablage.style.setProperty('--f', daten.farbe);
          sockelBelegen(platz.obj, daten.quelle);
          quelle.remove();
          Audio3.richtig();
          funkenSchauer(Stage.welt, platz.marke(), { anzahl: 12, wucht: .5, dauer: .8 });
          gesetzt++;
          if (gesetzt === plaetze.length) setTimeout(entzuenden, 520);
        };

        karten.forEach(k => {
          const node = el('div', { class: 'brennkarte' + (k.gut ? '' : ' verfuehrer') },
            el('span', { class: 'ic', text: k.icon }),
            el('b', { text: k.text }));
          ziehbarMachen(node, { daten: k, aufAblage: kartePruefen, radius: 150 });
          leiste.appendChild(node);
        });

        const auftrag = el('div', { class: 'auftrag' },
          el('div', { class: 'dienstvorschrift', text: 'Aufgabe 1' }),
          el('h2', { text: 'Bau das Verbrennungsdreieck' }),
          el('p', { class: 'hinweis', text: 'Drei Karten auf die Sockel, eine in die Mitte. Drei gehören gar nicht hierher.' }));
        s.appendChild(auftrag);
        s.appendChild(unten);

        // Erst der Aufbau, dann die Kamera: Sie richtet sich nach dem Platz
        // zwischen Auftragskarte und Kartenleiste, und den gibt es erst,
        // wenn beide im Dokument hängen.
        const wache = motivWache(MOTIV, unten,
          { hoch: .48, weit: .9, anteil: .96, rand: .5, panelUnten: true, obenNode: auftrag,
            sofort: true });   // der Einstieg fährt die Kamera – die Fahrt endet hier

        return () => { wache(); HotSpots.beenden(); };
      });

      const entzuenden = () => {
        Audio3.feuer();
        funkenSchauer(Stage.welt, new THREE.Vector3(0, schale.userData.feuerHoehe + .3, 0),
          { anzahl: 34, wucht: 1.5, dauer: 1.3 });
        feuerStaerke(feuer, 1);
        wolkenStaerke(rauch, .55);
        setTimeout(phaseBenennen, 1600);
      };
    };

    /* --- Runde 2: dem Bild seinen Namen geben ----------------------------
       Der Moment, in dem das Dreieck fertig dasteht und brennt, ist der
       richtige, um den Begriff zu klären. Vorher wäre es eine Behauptung,
       nachher käme es zu spät: Die Kinder sehen anderswo Dreiecke und hören
       hier von vier Voraussetzungen – wer diesen Widerspruch nicht auflöst,
       lässt ihn stehen.                                                     */
    const phaseBenennen = () => {
      UI.zeige('l1-benennen', (s) => {
        // Das Panel gehört nach unten, nicht in die Mitte: Der Text redet vom
        // Bild („an den drei Ecken", „in der Mitte"), und wer dabei die Bühne
        // zudeckt, lässt genau das Bild verschwinden, das er erklärt.
        const panel = el('div', { class: 'panel glas unterbau', style: { textAlign: 'center' } },
          el('h2', { text: '🔺 Drei Ecken – vier Voraussetzungen' }),
          el('p', { style: { margin: '.5em 0 0' }, html:
            'Das Bild vor dir heißt <b>Verbrennungsdreieck</b>. So findest du es in jedem Buch: ' +
            'brennbarer Stoff, Sauerstoff und Zündenergie an den drei Ecken.' }),
          el('p', { style: { margin: '.5em 0 0' }, html:
            'Das <b>richtige Mengenverhältnis</b> steht in der Mitte. Es ist ja kein eigener Stoff, ' +
            'sondern das Verhältnis <i>zwischen</i> Stoff und Sauerstoff – und hat deshalb keine eigene Ecke.' }),
          el('p', { class: 'hinweis', style: { marginTop: '.5em' }, text:
            'Gezählt werden trotzdem vier. Wenn dich also jemand fragt: vier – drei an den Ecken, eine in der Mitte.' }),
          el('button', { class: 'btn gross', style: { marginTop: '.5em' },
            onclick: () => { Audio3.klick(); phaseWegnehmen(); } }, 'Verstanden →'));
        s.appendChild(panel);

        const wache = motivWache(MOTIV, panel,
          { hoch: .5, weit: .9, anteil: .94, rand: .4, panelUnten: true });
        return wache;
      });
    };

    /* --- Runde 3: eine Voraussetzung wegnehmen ---------------------------
       Kurz gehalten. Es geht um eine einzige Einsicht: Es ist egal, welche –
       eine reicht. Genau darauf baut später jedes Löschverfahren auf.      */
    const phaseWegnehmen = () => {
      UI.zeige('l1-wegnehmen', (s) => {
        HotSpots.starten(s);
        let schonWeg = false;

        plaetze.forEach((pl) => {
          const v = pl.obj.userData.sockel.belegt;
          // Der Name muss mit drauf: Ein Symbol allein sagt nicht, welche
          // der Voraussetzungen hier gerade wegfällt.
          const node = el('button', { class: 'sockelknopf', style: { '--f': v.farbe } },
            el('span', { class: 'ic', text: v.icon }),
            el('b', { text: v.name }),
            el('small', { text: 'wegnehmen' }));
          node.addEventListener('click', () => {
            if (schonWeg) return;
            schonWeg = true;
            Audio3.whoosh();
            // Der Platz sinkt in den Boden, das Feuer fällt in sich zusammen.
            platzFahren(pl.obj, -2.2, .8);
            feuerStaerke(feuer, 0);
            wolkenStaerke(rauch, 0);
            HotSpots.beenden();
            setTimeout(() => erkenntnis(v), 1000);
          });
          HotSpots.hinzu(pl.marke(), node);
        });

        const auftrag = el('div', { class: 'auftrag' },
          el('div', { class: 'dienstvorschrift', text: 'Aufgabe 1' }),
          el('h2', { text: 'Jetzt brennt es. Mach es aus.' }),
          el('p', { class: 'hinweis', text: 'Nimm eine der vier Voraussetzungen weg – du darfst dir aussuchen, welche.' }));
        s.appendChild(auftrag);

        const wache = motivWache(MOTIV, null,
          { hoch: .5, weit: .9, anteil: .94, rand: .45, obenNode: auftrag });

        return () => { wache(); HotSpots.beenden(); };
      });
    };

    const erkenntnis = (v) => {
      UI.zeige('l1-erkenntnis', (s) => {
        // Auch hier unten: Oben steht die Lücke, in die eben noch eine Säule
        // gehörte, und das erloschene Feuer. Beides ist die eigentliche
        // Aussage dieser Runde – ein Panel mitten drauf wäre verschenkt.
        const panel = el('div', { class: 'panel glas unterbau', style: { textAlign: 'center' } },
          el('h2', { text: `${v.icon} Aus.` }),
          el('p', { style: { margin: '.4em 0 0' }, html:
            `Du hast <b>${v.name}</b> weggenommen. ${v.weg}` }),
          el('p', { class: 'hinweis', style: { marginTop: '.5em' }, text:
            'Es hätte jedes der vier sein können – die drei Ecken so gut wie die Mitte. Eines reicht immer. Genau das ist der Trick beim Löschen: Man muss nie alles wegnehmen, nur eines davon.' }),
          el('button', { class: 'btn gross', style: { marginTop: '.5em' },
            onclick: () => { Audio3.klick(); phaseSortieren(); } }, 'Verstanden →'));
        s.appendChild(panel);

        const wache = motivWache(MOTIV, panel,
          { hoch: .5, weit: .9, anteil: .94, rand: .4, panelUnten: true });
        return wache;
      });
    };

    /* --- Runde 4: Zutat oder Ergebnis? -----------------------------------
       Die Auflösung der Falle aus Runde 1.                                 */
    const phaseSortieren = () => {
      // Platz wieder hochfahren und Feuer neu entzünden – die Kulisse soll
      // nicht als Ruine dastehen, während man sortiert.
      plaetze.forEach(pl => { if (pl.obj.position.y < -.01) platzFahren(pl.obj, 0, .6); });
      setTimeout(() => { feuerStaerke(feuer, .85); wolkenStaerke(rauch, .5); }, 500);

      const begriffe = shuffle([
        ...VORAUSSETZUNGEN.map(v => ({ text: v.name, icon: v.icon, korb: 'zutat', hilfe: v.kurz })),
        ...ERSCHEINUNGEN.map(e => ({ text: e.kurz || e.name, icon: e.icon, korb: 'ergebnis', hilfe: e.text })),
      ]);
      let offen = begriffe.length;

      UI.zeige('l1-sortieren', (s) => {

        const korb = (id, titel, unterzeile, farbe) => el('div', {
          class: 'ablage korb', 'data-korb': id, style: { '--f': farbe },
        },
          el('b', { text: titel }),
          el('small', { text: unterzeile }),
          el('div', { class: 'korbinhalt' }));

        const koerbe = el('div', { class: 'koerbe' },
          korb('zutat', 'Voraussetzung', 'Das braucht das Feuer', 'var(--glut)'),
          korb('ergebnis', 'Erscheinung', 'Das macht das Feuer', 'var(--blau)'));

        const vorrat = el('div', { class: 'kartenleiste' });
        const zaehler = el('div', { class: 'chip', text: `noch ${offen}` });
        const unten = unterbau(vorrat);

        begriffe.forEach(b => {
          const node = el('div', { class: 'brennkarte klein' },
            el('span', { class: 'ic', text: b.icon }),
            el('b', { text: b.text }));
          ziehbarMachen(node, {
            daten: b, radius: 150,
            aufAblage: (ablage, daten, quelle) => {
              if (!ablage.dataset.korb) { Audio3.zu(); return; }
              if (ablage.dataset.korb !== daten.korb) {
                fehlerSortieren++;
                Audio3.falsch();
                quelle.classList.add('wackeln');
                setTimeout(() => quelle.classList.remove('wackeln'), 450);
                unten.hinweis(daten.hilfe, 'schlecht', 3400);
                return;
              }
              offen--;
              Audio3.richtig();
              quelle.remove();
              $('.korbinhalt', ablage).appendChild(
                el('span', { class: 'korbchip' }, daten.icon, el('i', { text: daten.text })));
              zaehler.textContent = offen ? `noch ${offen}` : 'fertig!';
              if (offen === 0) setTimeout(phaseFragen, 900);
            },
          });
          vorrat.appendChild(node);
        });

        const auftrag = el('div', { class: 'auftrag' },
          el('div', { class: 'dienstvorschrift', text: 'Aufgabe 1' }),
          el('h2', { text: 'Zutat oder Ergebnis?' }),
          el('p', { class: 'hinweis', text: 'Acht Begriffe, zwei Körbe. Was das Feuer braucht, kommt links – was das Feuer macht, kommt rechts.' }),
          zaehler);
        s.appendChild(auftrag);
        s.appendChild(koerbe);
        s.appendChild(unten);

        // Kulisse, nicht Bühne: In dieser Runde wird sortiert, nicht geschaut.
        // Auftragskarte, Körbe und Kartenleiste lassen zusammen keinen
        // Bildstreifen mehr übrig – wer hier trotzdem einpasst, bekommt das
        // Motiv in der Mindesthöhe und einen Übungsplatz von der Größe einer
        // Briefmarke. Also mittig und klein hinter die Karten legen.
        const wache = motivWache(MOTIV, null, { hoch: .6, weit: .9, anteil: .62, rand: .8 });
        return wache;
      });
    };

    /* --- Fragen ----------------------------------------------------------- */
    const phaseFragen = () => {
      const fragen = [
        {
          frage: 'Das Verbrennungsdreieck hat drei Ecken. Wie viele Voraussetzungen sind es?',
          antworten: ['Drei', 'Vier', 'Fünf', 'Das ist dasselbe'],
          richtig: 1,
          erklaerung: 'An den Ecken stehen brennbarer Stoff, Sauerstoff und Zündenergie. Das richtige Mengenverhältnis kommt dazu – es steht in der Mitte, weil es kein eigener Stoff ist, sondern das Verhältnis zwischen zweien der Ecken.',
          zitat: 'Um eine Verbrennung zu ermöglichen, müssen brennbarer Stoff und Sauerstoff im richtigen Mengenverhältnis vorhanden sein … Die Zündenergie, als energetische Voraussetzung, muss ebenfalls zur Verfügung stehen.',
        },
        {
          frage: 'Zu welchem Anteil ist Sauerstoff in der Luft enthalten?',
          antworten: ['ca. 19 %', 'ca. 21 %', 'ca. 78 %', 'ca. 82 %'],
          richtig: 1,
          erklaerung: 'Rund 21 Prozent. Die 78 Prozent sind Stickstoff – der brennt nicht mit.',
          zitat: 'Der zur Verbrennung notwendige Sauerstoff ist zu ca. 21 Vol.-% in der Umgebungsluft vorhanden.',
        },
        {
          frage: 'Eine Flüssigkeit brennt. Was brennt dabei eigentlich?',
          antworten: ['Die Flüssigkeit selbst', 'Die Dämpfe darüber', 'Der Behälter darunter', 'Der Sauerstoff darin'],
          richtig: 1,
          erklaerung: 'Nie die Flüssigkeit selbst. Es brennt immer das Dampf-Luft-Gemisch darüber. Deshalb hört eine Flüssigkeit auf zu brennen, sobald sie zu kalt für Dämpfe wird.',
          zitat: 'Bei brennbaren Flüssigkeiten brennt nicht die Flüssigkeit selbst, sondern es brennen die Dämpfe oberhalb der Flüssigkeit.',
        },
        {
          frage: 'Warum geht ab der Rauchgrenze niemand ohne Atemschutz vor?',
          antworten: [
            'Weil man sonst nichts sieht',
            'Weil es dort zu heiß ist',
            'Weil bei jedem Brand Atemgifte entstehen',
            'Weil es die Vorschrift so will',
          ],
          richtig: 2,
          erklaerung: 'Kohlenmonoxid, Blausäure, Salzsäure – was genau entsteht, hängt vom Brandgut ab. Dass etwas entsteht, hängt von gar nichts ab. Es passiert immer.',
          zitat: 'Da diese Atemgifte bei jedem Löscheinsatz vorkommen, ist das Vorgehen ab der Rauchgrenze nur unter Atemschutz möglich.',
        },
      ];

      UI.zeige('l1-fragen', (s) => {
        Stage.bildVersatz(0, 0);
        frageReihe(s, fragen,
          (richtig, gesamt) => {
            // Fehler beim Aufbau wiegen schwerer als beim Sortieren: Wer
            // Rauch auf einen Sockel zieht, hat die Kernidee noch nicht.
            const guete = clamp(richtig / gesamt - fehlerAufbau * .1 - fehlerSortieren * .06, 0, 1);
            const abzeichen = [];
            if (fehlerAufbau === 0) abzeichen.push('dreieck');
            if (fehlerSortieren === 0) abzeichen.push('erscheinung');
            api.fertig({
              guete,
              xp: 50 + richtig * 20,
              titel: `${richtig} von ${gesamt} Fragen richtig` +
                (fehlerAufbau || fehlerSortieren
                  ? ` · ${fehlerAufbau + fehlerSortieren} Fehlgriff${fehlerAufbau + fehlerSortieren > 1 ? 'e' : ''}`
                  : ' · kein einziger Fehlgriff'),
              abzeichen,
              zeilen: [
                el('span', { html: '<b>Die drei Ecken:</b> brennbarer Stoff · Sauerstoff · Zündenergie' }),
                el('span', { html: '<b>In der Mitte:</b> das richtige Mengenverhältnis. Macht zusammen vier Voraussetzungen.' }),
                el('span', { html: '<b>Zum Löschen:</b> eines davon wegnehmen reicht. Immer.' }),
                el('span', { html: '<b>Nicht verwechseln:</b> Flamme, Glut, Wärme und Rauch sind das Ergebnis – nicht die Zutat.' }),
              ],
            });
          },
          // Der Abdunkler gehört in den Kopf und nicht davor: frageReihe
          // räumt den Bildschirm vor jeder Frage leer, alles außerhalb des
          // Kopfes wäre nach der ersten Frage weg.
          (i, n) => el('div', { style: { paddingTop: '4px' } },
            UI.dunkler(), UI.schritte(n, i)));
      });
    };

    /* --- Einstieg ---------------------------------------------------------- */
    UI.zeige('l1-intro', (s) => {
      Stage.kameraSetzen([0, 3.4, 12], [0, 1.2, 0]);
      Stage.kameraFahren([-4.5, 4.2, 9.5], [0, 1.3, 0], 2.4);
      s.appendChild(el('div', { class: 'mitte' },
        el('div', { class: 'panel glas', style: { width: 'min(620px,94vw)', textAlign: 'center' } },
          el('div', { class: 'dienstvorschrift', text: 'Aufgabe 1' }),
          el('h2', { text: 'Das Verbrennungsdreieck' }),
          el('p', { style: { margin: '.5em 0 0' }, text:
            'Vor dir steht eine leere Feuerschale, drei leere Sockel und ein leeres Feld in der Mitte. Damit hier etwas brennt, muss alles davon besetzt sein – gleichzeitig.' }),
          el('p', { class: 'hinweis', text:
            'Das klingt nach einer Kleinigkeit. Es ist die wichtigste Seite dieses ganzen Themas: Wer das Dreieck kennt, versteht anschließend jedes Löschmittel von selbst.' }),
          el('button', { class: 'btn gross', onclick: () => { Audio3.klick(); phaseAufbau(); } }, 'Los →'))));
    });
  },
});
