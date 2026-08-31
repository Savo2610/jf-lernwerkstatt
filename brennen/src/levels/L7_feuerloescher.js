/* ============================================================================
   Level 7 – Der Feuerlöscher

   Bis hierher ging es um Physik: was brennt, was man wegnimmt, womit. Jetzt
   geht es um Handwerk. Ein Feuerlöscher hat sechs bis neun Sekunden Löschzeit
   und ist danach leer – ob er den Brand erwischt hat oder nicht. Genau deshalb
   gibt es Regeln, und genau deshalb sind sie keine Förmlichkeit.

   Die sieben Regeln aus Kapitel 6.8 kommen alle vor, aber keine als Merksatz
   zum Auswendiglernen. Jede steht in einer Lage, in der man sie braucht:

     Mit dem Wind angreifen        → Runde 1, dreimal mit wechselndem Wind
     Flächenbrände von vorn        → Auflösung nach Runde 1
     Feststoff: kurze Stöße        → Runde 2, Lage 1
     Gas/Flüssigkeit: ein Zug      → Runde 2, Lage 2
     Tropfbrand: von oben nach unten → Runde 2, Lage 3
     Mehrere Löscher gleichzeitig  → Auflösung nach Runde 2
     Kontrollieren, Reserve halten → Runde 3

   Der Vorratsbalken ist der heimliche Lehrer dieses Levels. Er steht auch
   dann im Bild, wenn gerade niemand über ihn nachdenkt – und wer zweimal
   danebengreift, sieht ihn leer werden, bevor das Feuer aus ist.

   Quelle: HLFS Truppmann Teil 1, Kapitel 6.8 „Anwendung von Feuerlöschern",
   Ausgabe 10/2012.
   ========================================================================== */
LEVELS.push({
  id: 'feuerloescher',
  name: 'Der Feuerlöscher',
  icon: '🧯',
  farbe: 'var(--rot)',
  kurz: 'Neun Sekunden Löschzeit. Danach ist er leer – egal, ob es gereicht hat.',

  start(api) {
    let fehlerWind = 0, fehlerTechnik = 0, fehlerMehrere = 0, fehlerSchluss = 0;

    const regel = (id) => LOESCHERREGELN.find(r => r.id === id);

    /* --- Kulisse ---------------------------------------------------------- */
    Stage.leeren();
    Stage.welt.add(baueUebungsplatz({ seite: 26 }));

    // Die Windfahne steht diesmal nicht am Rand, sondern mitten im Bild: In
    // Runde 1 ist sie die Aufgabe und nicht die Ausstattung.
    const fahne = baueWindfahne();
    fahne.position.set(-1.9, 0, -2.4);
    fahne.scale.setScalar(.78);
    Stage.welt.add(fahne);
    let wind = 1;                 // +1: Wind bläst nach rechts, -1: nach links

    const buehne = new THREE.Group();
    Stage.welt.add(buehne);

    const brandFeuer = baueFeuer({ hoehe: 1.6, breite: .7, zungen: 8, licht: true, glutAnteil: .5 });
    brandFeuer.position.set(0, .1, 0);
    feuerStaerke(brandFeuer, 0, true);
    Stage.welt.add(brandFeuer);

    // Zweites Feuer für den Tropfbrand: oben an der Tonne, während unten die
    // Lache brennt. Zwei Brandherde übereinander sind der ganze Witz der Lage.
    const tropfFeuer = baueFeuer({ hoehe: .9, breite: .28, zungen: 5, glutAnteil: 0 });
    tropfFeuer.position.set(0, 1.5, 0);
    feuerStaerke(tropfFeuer, 0, true);
    Stage.welt.add(tropfFeuer);

    const rauch = baueWolken('rauch', 14);
    rauch.position.set(0, 1.2, 0);
    wolkenStaerke(rauch, 0, true);
    Stage.welt.add(rauch);

    const pulverwolke = baueWolken('pulver', 16);
    pulverwolke.position.set(0, .5, 0);
    wolkenStaerke(pulverwolke, 0, true);
    Stage.welt.add(pulverwolke);

    Stage.anmelden((dt, t) => {
      feuerUpdate(brandFeuer, dt, t);
      feuerUpdate(tropfFeuer, dt, t);
      wolkenUpdate(rauch, dt);
      wolkenUpdate(pulverwolke, dt);
      // Der Rauch legt sich in den Wind. Ohne das müsste man die Windrichtung
      // an der Fahne ablesen, und die steht vier Meter hinter dem Feuer.
      rauch.position.x += (wind * 1.1 - rauch.position.x) * Math.min(1, dt * 1.4);
      pulverwolke.position.x += (wind * .5 - pulverwolke.position.x) * Math.min(1, dt * 1.4);
      // Sack zeigt in Windrichtung: bei +x ist das die Nullstellung.
      windfahneUpdate(fahne, dt, t, wind > 0 ? 0 : Math.PI);
    });

    // Der Mast gehoert mit ins Motiv, sonst steht die Windmarke ueber dem
    // Bildrand – und die Windrichtung ist in Runde 1 die halbe Aufgabe.
    const MOTIV = [
      [-2.8, 0, -2.4], [2.8, 0, -2.4], [2.8, 0, 2.2], [-2.8, 0, 2.2],
      [-1.9, 2.7, -2.4], [0, 1.5, 0],
    ];

    /* Der Vorrat im Löscher, 0 bis 1. Er steht in jeder Runde im Bild – auch
       da, wo er nichts entscheidet. Genau das ist die Lektion.

       Jeder Brand bekommt seinen eigenen Löscher: Der Balken faengt bei jedem
       Anlauf wieder voll an. Nur Runde 3 baut ihn absichtlich angebrochen –
       da geht es genau darum, was mit dem Rest passiert. */
    const vorratBauen = (start, name) => {
      let wert = start == null ? 1 : start;
      const balken = el('div', { class: 'vorratbalken' }, el('i', { style: { width: (wert * 100) + '%' } }));
      const node = el('div', { class: 'vorrat' },
        el('span', { class: 'ic', text: '🧯' }),
        el('div', { style: { flex: '1' } },
          el('div', { class: 'klein', text: name || 'Löschmittel im Löscher' }),
          balken));
      node.setzen = (v) => {
        wert = clamp(v, 0, 1);
        $('i', balken).style.width = (wert * 100) + '%';
        node.classList.toggle('leer', wert <= .02);
      };
      node.wert = () => wert;
      // Weich leeren statt springen: Ein Balken, der in einem Bild von voll
      // auf leer geht, wird nicht als Verbrauch gelesen, sondern als Fehler.
      node.leeren = (auf, dauer) => {
        const von = wert;
        Bewegung.neu(dauer || 1.2, (p) => node.setzen(lerp(von, auf, p)));
      };
      return node;
    };

    /* --- Runde 1: von welcher Seite? ------------------------------------- */
    const WINDLAGEN = [1, -1, 1];    // fest, nicht zufällig: gleiche Aufgabe für alle

    const flaechenbrand = () => {
      buehne.clear();
      [-.85, 0, .85].forEach(x => {
        const h = baueBrandgut('holz');
        h.position.set(x, 0, rnd(-.2, .2));
        h.rotation.y = rnd(-.4, .4);
        h.scale.setScalar(1.15);
        buehne.add(h);
      });
      brandFeuer.position.set(0, .35, 0);
      brandFeuer.scale.set(2.0, 1.05, 1.6);
      feuerAnteileSetzen(brandFeuer, 1, .7);
      feuerStaerke(brandFeuer, 1, true);
      feuerStaerke(tropfFeuer, 0, true);
      wolkenStaerke(rauch, .8);
    };

    const phaseWind = (i) => {
      if (i === 0) flaechenbrand();
      if (i >= WINDLAGEN.length) { setTimeout(windAufloesung, 500); return; }
      wind = WINDLAGEN[i];
      wolkenStaerke(pulverwolke, 0);
      wolkenStaerke(rauch, .8);
      feuerStaerke(brandFeuer, 1);

      UI.zeige('l7-wind-' + i, (s) => {
        HotSpots.starten(s);
        let fertig = false;
        const balken = vorratBauen();
        const unten = unterbau(balken);

        // Die Windrichtung steht als Wort neben der Fahne. Der Windsack und
        // der Rauch zeigen sie auch, aber ein Kind, das den Sack zum ersten
        // Mal sieht, weiss nicht, ob er in den Wind zeigt oder aus ihm heraus.
        const windMarke = el('div', { class: 'weltmarke windmarke' },
          el('span', { class: 'ic', text: '💨' }),
          el('b', { text: wind > 0 ? 'Wind nach rechts' : 'Wind nach links' }));
        HotSpots.hinzu(new THREE.Vector3(-1.9, 1.15, -2.4), windMarke);

        // Zwei Standplätze, links und rechts vom Brand. Sie kleben im Bild an
        // der Stelle, an der man tatsächlich stünde – eine Liste daneben
        // würde aus einer Ortsfrage eine Vokabelfrage machen.
        [-1, 1].forEach(seite => {
          const node = el('button', { class: 'weltmarke standplatz' },
            el('span', { class: 'ic', text: '🧯' }),
            el('b', { text: seite < 0 ? 'Von links' : 'Von rechts' }));
          node.addEventListener('click', () => {
            if (fertig) return;
            // Mit dem Wind heisst: der Wind kommt von hinten. Bläst er nach
            // rechts, steht man links davon.
            if (seite !== -wind) {
              fehlerWind++;
              Audio3.falsch();
              node.classList.add('falsch');
              setTimeout(() => node.classList.remove('falsch'), 2200);
              // Sichtbar machen, was schiefgeht: Die Wolke zieht einem
              // entgegen und kommt gar nicht erst am Feuer an.
              wolkenStaerke(pulverwolke, 1);
              unten.hinweis('Von dort bläst dir der Wind das Löschmittel und den Rauch entgegen. Es kommt nicht am Feuer an – und du stehst im Qualm.', 'schlecht', 4600);
              setTimeout(() => wolkenStaerke(pulverwolke, 0), 1800);
              return;
            }
            fertig = true;
            Audio3.richtig();
            node.classList.add('richtig');
            Audio3.wasser();
            wolkenStaerke(pulverwolke, 1);
            balken.leeren(.4, 1.0);
            setTimeout(() => { feuerStaerke(brandFeuer, 0); wolkenStaerke(rauch, 0); }, 700);
            unten.hinweis(regel('wind').warum, 'gut', 4200);
            setTimeout(() => {
              wolkenStaerke(pulverwolke, 0);
              HotSpots.beenden();
              phaseWind(i + 1);
            }, 2800);
          });
          HotSpots.hinzu(new THREE.Vector3(seite * 2.4, .95, 1.3), node);
        });

        const auftrag = el('div', { class: 'auftrag' },
          el('div', { class: 'dienstvorschrift', text: `Anlauf ${i + 1} von ${WINDLAGEN.length}` }),
          el('h2', { text: 'Von welcher Seite gehst du ran?' }),
          el('p', { class: 'hinweis', text: 'Der Windsack zeigt, wohin der Wind bläst. Von wo aus arbeitest du mit dem Wind statt gegen ihn?' }),
          UI.schritte(WINDLAGEN.length, i));
        s.appendChild(auftrag);
        s.appendChild(unten);

        const wache = motivWache(MOTIV, unten,
          { hoch: .5, weit: .9, anteil: .94, rand: .5, panelUnten: true, obenNode: auftrag, sofort: i === 0 });
        return () => { wache(); HotSpots.beenden(); };
      });
    };

    const windAufloesung = () => {
      UI.zeige('l7-wind-aufloesung', (s) => {
        const panel = el('div', { class: 'panel glas unterbau', style: { textAlign: 'center' } },
          el('h2', { text: '🌬️ Mit dem Wind, nie dagegen' }),
          el('p', { style: { margin: '.4em 0 0' }, text: regel('wind').warum }),
          el('p', { style: { margin: '.5em 0 0' }, html:
            'Und noch etwas gehört zur Richtung: <b>Flächenbrände löscht man von vorn beginnend</b> – von der Kante, an der du stehst, nach hinten durch. ' +
            'Fängst du hinten an, treibst du das Feuer vor dir her.' }),
          el('button', { class: 'btn gross', style: { marginTop: '.6em' },
            onclick: () => { Audio3.klick(); phaseTechnik(0); } }, 'Weiter →'));
        s.appendChild(panel);
        return motivWache(MOTIV, panel, { hoch: .4, weit: .9, anteil: .9, rand: .6, panelUnten: true });
      });
    };

    /* --- Runde 2: welche Technik? ---------------------------------------- */
    const TECHNIKEN = [
      { id: 'stoss', name: 'Kurze Stöße', icon: '💨' },
      { id: 'zug',   name: 'Ein Zug, ohne Unterbrechung', icon: '➡️' },
      { id: 'oben',  name: 'Von oben nach unten', icon: '⬇️' },
    ];

    const LAGEN = [
      {
        id: 'stoss', titel: 'Holzstapel', klasse: 'Feststoffbrand',
        // `kosten`: was die richtige Technik vom Vorrat braucht. Ein Fehlgriff
        // kostet immer den ganzen Löscher – deshalb steht dafür keine Zahl da.
        lage: 'Drei Stapel Scheitholz brennen nebeneinander. Eine breite Fläche, aber nichts läuft und nichts strömt.',
        aufbau: () => {
          buehne.clear();
          [-.85, 0, .85].forEach(x => {
            const h = baueBrandgut('holz');
            h.position.set(x, 0, rnd(-.2, .2));
            h.scale.setScalar(1.15);
            buehne.add(h);
          });
          brandFeuer.position.set(0, .35, 0);
          brandFeuer.scale.set(2.0, 1.05, 1.6);
          feuerAnteileSetzen(brandFeuer, 1, .8);
          feuerStaerke(brandFeuer, 1, true);
          feuerStaerke(tropfFeuer, 0, true);
        },
        kosten: .3,
        warumFalsch: {
          zug: 'In einem Zug ist der Löscher nach neun Sekunden leer, und die halbe Fläche brennt noch. Für Feststoffe reicht der Vorrat nur, wenn du ihn einteilst.',
          oben: 'Hier läuft nichts nach unten. Von oben nach unten ist die Regel für Tropf- und Fließbrände.',
        },
      },
      {
        id: 'zug', titel: 'Benzinlache', klasse: 'Flüssigkeitsbrand',
        lage: 'Eine Lache brennt in voller Breite. Die Flammen stehen zusammenhängend über der ganzen Fläche.',
        aufbau: () => {
          buehne.clear();
          const w = baueWanne({ breite: 2.2, tiefe: 1.4 });
          buehne.add(w);
          brandFeuer.position.set(0, w.userData.wanne.oberkante, 0);
          brandFeuer.scale.set(2.2, .8, 1.8);
          feuerAnteileSetzen(brandFeuer, 1, 0);
          feuerStaerke(brandFeuer, 1, true);
          feuerStaerke(tropfFeuer, 0, true);
        },
        kosten: .45,
        warumFalsch: {
          stoss: 'Zwischen zwei Stößen schlagen die Flammen zurück. Die Pulverwolke muss die Flammen komplett einschließen – eine Lücke, und es brennt weiter.',
          oben: 'Von oben nach unten hilft, wo etwas herunterläuft. Diese Lache liegt.',
        },
      },
      {
        id: 'oben', titel: 'Undichtes Fass', klasse: 'Tropfbrand',
        lage: 'Aus einem Fass läuft brennende Flüssigkeit heraus. Oben brennt das Leck, unten sammelt sich die Lache.',
        aufbau: () => {
          buehne.clear();
          const bock = new THREE.Mesh(new THREE.BoxGeometry(1.5, .9, 1.1), Mat.matt(PLATZ.beton2, .92));
          bock.position.set(0, .45, 0);
          bock.castShadow = true; bock.receiveShadow = true;
          buehne.add(bock);
          const tonne = baueTonne({ farbe: '#8a6a3a' });
          tonne.position.set(0, .9, 0);
          tonne.rotation.z = .12;
          buehne.add(tonne);
          brandFeuer.position.set(.2, .06, .7);
          brandFeuer.scale.set(1.5, .55, 1.2);
          feuerAnteileSetzen(brandFeuer, 1, 0);
          feuerStaerke(brandFeuer, 1, true);
          tropfFeuer.position.set(.28, 1.35, .5);
          feuerStaerke(tropfFeuer, 1, true);
        },
        kosten: .5,
        warumFalsch: {
          stoss: 'Du löschst die Lache – und von oben läuft brennende Flüssigkeit nach und zündet sie wieder an. Erst muss das Leck aus sein.',
          zug: 'Die Richtung stimmt nicht. Solange oben etwas nachläuft, brennt unten immer wieder neu an.',
        },
      },
    ];

    const phaseTechnik = (i) => {
      if (i >= LAGEN.length) { setTimeout(technikAufloesung, 500); return; }
      const l = LAGEN[i];
      l.aufbau();
      wind = 1;
      wolkenStaerke(rauch, .6);
      wolkenStaerke(pulverwolke, 0);

      UI.zeige('l7-technik-' + l.id, (s) => {
        let fertig = false;
        const balken = vorratBauen();
        const unten = unterbau(balken);

        const feld = el('div', { class: 'antworten unten drei' },
          ...TECHNIKEN.map((t, n) => {
            const b = el('button', { class: 'antwort' },
              el('span', { class: 'marker', text: 'ABC'[n] }),
              el('span', { text: t.name }));
            b.addEventListener('click', () => {
              if (fertig) return;
              wolkenStaerke(pulverwolke, 1);
              setTimeout(() => wolkenStaerke(pulverwolke, 0), 1900);
              if (t.id !== l.id) {
                fehlerTechnik++;
                Audio3.falsch();
                b.classList.add('falsch', 'wackeln');
                setTimeout(() => b.classList.remove('wackeln'), 450);
                balken.leeren(0, 1.4);
                unten.hinweis(l.warumFalsch[t.id], 'schlecht', 5200);
                // Der Löscher ist leer, das Feuer brennt weiter – und für die
                // nächste Lage gibt es einen neuen. Genau so ist es im Ernst:
                // Der Fehler kostet ein Gerät, nicht den Versuch.
                setTimeout(() => balken.leeren(1, .5), 2600);
                return;
              }
              fertig = true;
              Audio3.richtig();
              b.classList.add('richtig');
              balken.leeren(1 - l.kosten, 1.2);
              setTimeout(() => {
                feuerStaerke(brandFeuer, 0);
                feuerStaerke(tropfFeuer, 0);
                wolkenStaerke(rauch, 0);
              }, 900);
              unten.hinweis(regel(l.id).warum, 'gut', 4600);
              setTimeout(() => phaseTechnik(i + 1), 3000);
            });
            return b;
          }));
        unten.appendChild(feld);

        const auftrag = el('div', { class: 'auftrag' },
          el('div', { class: 'dienstvorschrift', text: `${l.klasse} · Lage ${i + 1} von ${LAGEN.length}` }),
          el('h2', { text: l.titel }),
          el('p', { class: 'hinweis', text: l.lage }),
          UI.schritte(LAGEN.length, i));
        s.appendChild(auftrag);
        s.appendChild(unten);

        return motivWache(MOTIV, unten,
          { hoch: .34, weit: .9, anteil: .94, rand: .5, panelUnten: true, obenNode: auftrag });
      });
    };

    const technikAufloesung = () => {
      UI.zeige('l7-technik-aufloesung', (s) => {
        const panel = el('div', { class: 'panel glas unterbau', style: { textAlign: 'left' } },
          el('h2', { style: { textAlign: 'center' }, text: '🧯 Drei Lagen, drei Techniken' }),
          el('div', { class: 'liste' },
            ['stoss', 'zug', 'oben'].map(id => {
              const r = regel(id);
              return el('div', { class: 'zeile' },
                el('span', { style: { fontSize: '1.4em' }, text: r.icon }),
                el('div', {}, el('b', { text: r.regel }), el('div', { class: 'klein', text: r.warum })));
            })),
          el('button', { class: 'btn gross', style: { marginTop: '.5em' },
            onclick: () => { Audio3.klick(); phaseMehrere(); } }, 'Weiter →'));
        s.appendChild(panel);
        return motivWache(MOTIV, panel, { hoch: .45, weit: .9, anteil: .88, rand: .8, panelUnten: true });
      });
    };

    /* --- Runde 2b: einer nach dem anderen oder beide auf einmal? ----------
       Die Regel „ausreichend Feuerlöscher gleichzeitig einsetzen" stand bisher
       nur als Satz in der Auflösung. Als Satz glaubt sie einem niemand – sie
       klingt nach Verschwendung. Also wird sie vorgeführt: Zwei Balken, und
       man sieht, dass nacheinander beide leer sind und es trotzdem brennt.  */
    const phaseMehrere = () => {
      buehne.clear();
      [-1.15, 0, 1.15].forEach(x => {
        const h = baueBrandgut('holz');
        h.position.set(x, 0, rnd(-.2, .2));
        h.rotation.y = rnd(-.4, .4);
        h.scale.setScalar(1.2);
        buehne.add(h);
      });
      brandFeuer.position.set(0, .35, 0);
      brandFeuer.scale.set(2.4, 1.2, 1.7);
      feuerAnteileSetzen(brandFeuer, 1, .7);
      feuerStaerke(brandFeuer, 1, true);
      feuerStaerke(tropfFeuer, 0, true);
      wind = 1;
      wolkenStaerke(rauch, .8);

      UI.zeige('l7-mehrere', (s) => {
        let fertig = false, laeuft = false;
        const eins = vorratBauen(1, 'Löscher 1');
        const zwei = vorratBauen(1, 'Löscher 2');
        const unten = unterbau(el('div', { class: 'vorratreihe' }, eins, zwei));

        const zuruecksetzen = () => {
          eins.setzen(1); zwei.setzen(1);
          feuerAnteileSetzen(brandFeuer, 1, .7);
          brandFeuer.scale.set(2.4, 1.2, 1.7);
          feuerStaerke(brandFeuer, 1);
          wolkenStaerke(rauch, .8);
          wolkenStaerke(pulverwolke, 0);
          laeuft = false;
        };

        const WAHL = [
          {
            id: 'gleich', text: 'Beide gleichzeitig draufhalten',
            spielen: () => {
              Audio3.whoosh();
              wolkenStaerke(pulverwolke, 1);
              eins.leeren(.35, 1.2);
              zwei.leeren(.35, 1.2);
              setTimeout(() => { feuerStaerke(brandFeuer, 0); wolkenStaerke(rauch, 0); }, 900);
              setTimeout(() => wolkenStaerke(pulverwolke, 0), 2200);
            },
          },
          {
            id: 'nach', text: 'Erst den einen, dann den anderen',
            spielen: () => {
              // Der erste drückt das Feuer nur herunter. Bis der zweite kommt,
              // steht es wieder – und dann ist gar nichts mehr übrig.
              Audio3.whoosh();
              wolkenStaerke(pulverwolke, 1);
              eins.leeren(0, 1.1);
              setTimeout(() => feuerStaerke(brandFeuer, .25), 500);
              setTimeout(() => {
                wolkenStaerke(pulverwolke, 0);
                feuerStaerke(brandFeuer, 1);
                Audio3.feuer();
                funkenSchauer(Stage.welt, new THREE.Vector3(0, 1, 0), { anzahl: 16, wucht: .9, dauer: .9 });
              }, 1400);
              setTimeout(() => {
                Audio3.whoosh();
                wolkenStaerke(pulverwolke, 1);
                zwei.leeren(0, 1.1);
              }, 2200);
              setTimeout(() => wolkenStaerke(pulverwolke, 0), 3600);
            },
          },
          {
            id: 'reserve', text: 'Einen nehmen, den anderen als Reserve behalten',
            spielen: () => {
              Audio3.whoosh();
              wolkenStaerke(pulverwolke, 1);
              eins.leeren(0, 1.2);
              setTimeout(() => feuerStaerke(brandFeuer, .3), 700);
              setTimeout(() => {
                wolkenStaerke(pulverwolke, 0);
                feuerStaerke(brandFeuer, 1);
                Audio3.feuer();
              }, 1900);
            },
          },
        ];

        const WARUM = {
          nach: 'Der erste Löscher hat das Feuer nur heruntergedrückt. Bis der zweite kommt, steht es wieder – und jetzt sind beide leer.',
          reserve: 'Ein Löscher reicht für diesen Brand nicht. Die Reserve gehört ans Ende, nicht an den Anfang: erst löschen, dann kontrollieren.',
        };

        const feld = el('div', { class: 'antworten unten drei' },
          ...WAHL.map((w, n) => {
            const b = el('button', { class: 'antwort' },
              el('span', { class: 'marker', text: 'ABC'[n] }),
              el('span', { text: w.text }));
            b.addEventListener('click', () => {
              if (fertig || laeuft) return;
              laeuft = true;
              w.spielen();
              if (w.id !== 'gleich') {
                fehlerMehrere++;
                Audio3.falsch();
                b.classList.add('falsch');
                unten.hinweis(WARUM[w.id], 'schlecht', 6000);
                setTimeout(() => { b.classList.remove('falsch'); zuruecksetzen(); },
                  w.id === 'nach' ? 4600 : 3400);
                return;
              }
              fertig = true;
              Audio3.richtig();
              b.classList.add('richtig');
              unten.hinweis(regel('mehrere').warum, 'gut', 4600);
              setTimeout(phaseSchluss, 3000);
            });
            return b;
          }));
        unten.appendChild(feld);

        const auftrag = el('div', { class: 'auftrag' },
          el('div', { class: 'dienstvorschrift', text: 'Zu zweit am Brand' }),
          el('h2', { text: 'Zwei Löscher, ein Feuer' }),
          el('p', { class: 'hinweis', text: 'Der Stapel brennt in voller Breite, und ihr seid zu zweit. Jeder hat einen vollen Löscher in der Hand.' }));
        s.appendChild(auftrag);
        s.appendChild(unten);

        return motivWache(MOTIV, unten,
          { hoch: .34, weit: .9, anteil: .94, rand: .5, panelUnten: true, obenNode: auftrag });
      });
    };

    /* --- Runde 3: und danach? -------------------------------------------- */
    const phaseSchluss = () => {
      // Ein Feststoffbrand, gerade gelöscht, mit Glut darunter. Genau die
      // Lage, in der ein Löscher zurückgestellt wird und zwei Minuten später
      // wieder jemand rennt.
      buehne.clear();
      [-.9, .3].forEach(x => {
        const h = baueBrandgut('holz');
        h.position.set(x, 0, rnd(-.2, .2));
        h.scale.setScalar(1.2);
        buehne.add(h);
      });
      brandFeuer.position.set(0, .35, 0);
      brandFeuer.scale.set(1.8, .5, 1.8);
      feuerAnteileSetzen(brandFeuer, .1, 1);
      feuerStaerke(brandFeuer, .35, true);
      feuerStaerke(tropfFeuer, 0, true);
      wolkenStaerke(rauch, .25);

      UI.zeige('l7-schluss', (s) => {
        let fertig = false;
        // angebrochen: Auf diesen Brand ist der Löscher schon einmal
        // draufgegangen. Was mit dem Rest passiert, ist die Frage.
        const balken = vorratBauen(.4);
        const unten = unterbau(balken);

        const WAHL = [
          { id: 'leer', text: 'Den Rest hinterherschicken – dann ist es sicher aus' },
          { id: 'gut',  text: 'Reserve behalten und die Brandstelle kontrollieren' },
          { id: 'weg',  text: 'Löscher zurückhängen, der Brand ist aus' },
        ];

        const feld = el('div', { class: 'antworten unten drei' },
          ...shuffle(WAHL.slice()).map((w, n) => {
            const b = el('button', { class: 'antwort' },
              el('span', { class: 'marker', text: 'ABC'[n] }),
              el('span', { text: w.text }));
            b.addEventListener('click', () => {
              if (fertig) return;
              if (w.id !== 'gut') {
                fehlerSchluss++;
                Audio3.falsch();
                b.classList.add('falsch', 'wackeln');
                setTimeout(() => b.classList.remove('wackeln'), 450);
                if (w.id === 'leer') balken.leeren(0, .8);
                // Die Rückzündung vorführen: Pulver kühlt kaum, die Glut sitzt
                // noch drin. Ein Satz darüber wirkt halb so gut wie das Bild.
                setTimeout(() => {
                  Audio3.feuer();
                  feuerAnteileSetzen(brandFeuer, 1, .8);
                  feuerStaerke(brandFeuer, 1);
                  wolkenStaerke(rauch, .8);
                  funkenSchauer(Stage.welt, new THREE.Vector3(0, .9, 0), { anzahl: 18, wucht: .9, dauer: .9 });
                }, 900);
                unten.hinweis(w.id === 'leer'
                  ? 'Zurückgezündet – und jetzt ist der Löscher leer. Pulver kühlt kaum, die Glut sitzt noch im Holz.'
                  : 'Zurückgezündet. Pulver kühlt kaum: Was aussieht wie aus, ist oft nur oberflächlich aus.',
                  'schlecht', 5200);
                setTimeout(() => {
                  feuerAnteileSetzen(brandFeuer, .1, 1);
                  feuerStaerke(brandFeuer, .35);
                  wolkenStaerke(rauch, .25);
                  balken.setzen(.4);
                }, 3600);
                return;
              }
              fertig = true;
              Audio3.richtig();
              b.classList.add('richtig');
              feuerStaerke(brandFeuer, 0);
              wolkenStaerke(rauch, 0);
              unten.hinweis(regel('kontrolle').warum, 'gut', 4600);
              setTimeout(phaseFragen, 2800);
            });
            return b;
          }));
        unten.appendChild(feld);

        const auftrag = el('div', { class: 'auftrag' },
          el('div', { class: 'dienstvorschrift', text: 'Nach dem Löschen' }),
          el('h2', { text: 'Die Flammen sind weg. Und jetzt?' }),
          el('p', { class: 'hinweis', text: 'Unter dem Holz glüht es noch. Im Löscher ist gut ein Drittel übrig.' }));
        s.appendChild(auftrag);
        s.appendChild(unten);

        return motivWache(MOTIV, unten,
          { hoch: .34, weit: .9, anteil: .94, rand: .5, panelUnten: true, obenNode: auftrag });
      });
    };

    /* --- Fragen ----------------------------------------------------------- */
    const phaseFragen = () => {
      const fragen = [
        {
          frage: 'Von welcher Seite greifst du einen Brand im Freien an?',
          antworten: ['Gegen den Wind', 'Mit dem Wind', 'Immer von Norden', 'Das ist egal'],
          richtig: 1,
          erklaerung: 'Mit dem Wind. Er trägt das Löschmittel ins Feuer statt daran vorbei – und er hält den Rauch und die Atemgifte von dir fern.',
        },
        {
          frage: 'Ein Feststoffbrand über eine größere Fläche. Wie gibst du das Pulver?',
          antworten: [
            'In einem Zug, bis der Löscher leer ist',
            'In kurzen Stößen',
            'Von oben nach unten',
            'Erst nach zwei Minuten Wartezeit',
          ],
          richtig: 1,
          erklaerung: 'Kurze Stöße. Der Vorrat ist knapp – in einem Zug ist der Löscher nach wenigen Sekunden leer und die halbe Fläche brennt noch.',
        },
        {
          frage: 'Und bei einem Gas- oder Flüssigkeitsbrand?',
          antworten: [
            'Auch in kurzen Stößen',
            'In einem Zug, ohne Pause',
            'Von hinten nach vorn',
            'Mit Wasser hinterher',
          ],
          richtig: 1,
          erklaerung: 'Ohne Unterbrechung. Die Flammen müssen komplett von der Löschpulverwolke eingeschlossen werden – eine Lücke, und es brennt weiter.',
          zitat: 'Brände von Gasen oder Flüssigkeiten müssen ohne Unterbrechung des Löschstrahls gelöscht werden.',
        },
        {
          frage: 'Der Brand ist aus. Was gehört noch dazu?',
          antworten: [
            'Löscher leeren, damit nichts übrig bleibt',
            'Brandstelle kontrollieren und eine Reserve behalten',
            'Sofort aufräumen',
            'Nichts weiter',
          ],
          richtig: 1,
          erklaerung: 'Pulver kühlt kaum – es kann jederzeit zurückzünden. Deshalb wird die Brandstelle eingehend kontrolliert und nach Möglichkeit eine Löschmittelreserve zurückgehalten.',
          zitat: 'Beim Einsatz von Feuerlöschern ist generell die Gefahr von Rückzündungen zu beachten, daher ist die Brandstelle nach dem Löschen eingehend zu kontrollieren und nach Möglichkeit eine Löschmittelreserve zurück zu halten.',
        },
      ];

      UI.zeige('l7-fragen', (s) => {
        Stage.bildVersatz(0, 0);
        frageReihe(s, fragen,
          (richtig, gesamt) => {
            const fehler = fehlerWind + fehlerTechnik + fehlerMehrere + fehlerSchluss;
            const guete = clamp(richtig / gesamt - fehlerWind * .07 - fehlerTechnik * .08
              - fehlerMehrere * .06 - fehlerSchluss * .06, 0, 1);
            const abzeichen = [];
            if (fehlerWind === 0) abzeichen.push('wind');
            if (fehlerTechnik === 0) abzeichen.push('technik');
            api.fertig({
              guete,
              xp: 50 + richtig * 20,
              titel: `${richtig} von ${gesamt} Fragen richtig` +
                (fehler ? ` · ${fehler} Fehlgriff${fehler > 1 ? 'e' : ''}` : ' · kein einziger Fehlgriff'),
              abzeichen,
              zeilen: [
                el('span', { html: '<b>Mit dem Wind</b> angreifen, Flächenbrände von vorn beginnend.' }),
                el('span', { html: '<b>Feststoff:</b> kurze Stöße. <b>Gas und Flüssigkeit:</b> ein Zug ohne Lücke.' }),
                el('span', { html: '<b>Tropfbrand:</b> von oben nach unten – sonst zündet das Nachlaufende wieder an.' }),
                el('span', { html: '<b>Zu zweit:</b> beide Löscher gleichzeitig. Nacheinander sind nur beide leer.' }),
                el('span', { html: '<b>Danach:</b> kontrollieren und eine Reserve behalten. Pulver kühlt kaum.' }),
              ],
            });
          },
          (i, n) => el('div', { style: { paddingTop: '4px' } },
            UI.dunkler(), UI.schritte(n, i)));
      });
    };

    /* --- Einstieg ---------------------------------------------------------- */
    UI.zeige('l7-intro', (s) => {
      Stage.kameraSetzen([0, 3.2, 11], [0, 1, 0]);
      Stage.kameraFahren([-3.2, 2.8, 8.2], [0, .9, 0], 2.2);
      s.appendChild(el('div', { class: 'mitte' },
        el('div', { class: 'panel glas', style: { width: 'min(620px,94vw)', textAlign: 'center' } },
          el('div', { class: 'dienstvorschrift', text: 'Aufgabe 7' }),
          el('h2', { text: 'Der Feuerlöscher' }),
          el('p', { style: { margin: '.5em 0 0' }, text:
            'Du weißt jetzt, welches Mittel wohin gehört. Bleibt die Frage, wie man es einsetzt – und die ist keine Kleinigkeit: Ein tragbarer Feuerlöscher ist nach wenigen Sekunden leer.' }),
          el('p', { class: 'hinweis', text:
            'Ob es gereicht hat, entscheidet sich vorher: an der Seite, von der du rangehst, und an der Art, wie du drückst.' }),
          el('button', { class: 'btn gross', onclick: () => { Audio3.klick(); phaseWind(0); } }, 'Los →'))));
    });
  },
});
