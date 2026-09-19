/* ============================================================================
   Level 6 – Womit löschen wir?

   Level 5 hat die Verfahren geklärt: wo man ansetzt. Jetzt kommt das Gerät,
   mit dem man ansetzt. Die Reihenfolge ist nicht beliebig – die Feuerwehr-
   lehre ordnet die Löschmittel nach ihrer HAUPTlöschwirkung den Verfahren zu,
   und wer die Verfahren nicht kennt, lernt die Tabelle auswendig, statt sie
   zu verstehen.

   Drei Runden, drei verschiedene Fragen an dasselbe Wissen:

   1. Welches Verfahren steckt in welchem Mittel? (Zuordnung Löschmittel –
      Löschverfahren, Truppführer-Leitfaden Kapitel 7)
   2. Fünf Brände, fünf Entscheidungen. Hier wird es ernst: Wasser auf Fett
      und Wasser auf Metall haben Folgen, und die sieht man. Diese Runde ist
      der Grund, warum es dieses Level gibt – die Tabelle allein bleibt nicht
      hängen, die Fettexplosion schon.
   3. Vollstrahl oder Sprühstrahl. Beide Male Wasser, und trotzdem entscheidet
      die Wahl darüber, ob es überhaupt wirkt.

   Der Gasbrand steht bewusst am Schluss. Er ist der einzige, bei dem das
   richtige Löschmittel gar keines ist: Erst absperren. Wer die Fackel löscht
   und das Ventil offen lässt, hat die Lage verschlimmert.

   Quelle: HLFS Truppmann Teil 1, Kapitel 6 „Löschmittel", Ausgabe 10/2012;
   HLFS Truppführer F-II, Kapitel 2 bis 7, Ausgabe 02/2010.
   ========================================================================== */
LEVELS.push({
  id: 'loeschmittel',
  name: 'Womit löschen wir?',
  icon: '💧',
  farbe: 'var(--gruen)',
  kurz: 'Wasser, Schaum, Pulver, CO₂ und der Fettbrandlöscher – und wann welches knallt.',

  start(api) {
    let fehlerWirkung = 0, fehlerEinsatz = 0, fehlerStrahl = 0;

    const mittel = (id) => LOESCHMITTEL.find(m => m.id === id);

    /* --- Kulisse ---------------------------------------------------------- */
    Stage.leeren();
    Stage.welt.add(baueUebungsplatz({ seite: 26 }));

    // Das Podest, auf dem der jeweilige Brand steht. Gleiche Bauart wie in
    // Aufgabe 2 – wer die Seite kennt, weiss sofort: Hier kommt gleich etwas.
    const podest = new THREE.Mesh(
      new THREE.CylinderGeometry(.78, .9, .34, 16),
      Mat.matt(PLATZ.beton2, .9));
    podest.position.set(0, .17, 0);
    podest.receiveShadow = true; podest.castShadow = true;
    Stage.welt.add(podest);

    const buehne = new THREE.Group();
    buehne.position.set(0, .34, 0);
    Stage.welt.add(buehne);

    /* Die fünf Löschmittel stehen als Geräte in einer Reihe. Sie sind Kulisse
       und Merkhilfe zugleich: Beim Wählen hüpft das Gerät, zu dem man
       gegriffen hat – so hängt der Knopf im Bedienfeld an einem Ding, das man
       im Bild sieht, und nicht in der Luft.

       Die Reihe steht HINTER dem Podest, nicht davor. Vorn läge sie zwischen
       Kamera und Brand: Die Kamera passt das Motiv um das Podest ein, und was
       näher steht als das Motiv, wächst dabei ins Riesenhafte und deckt genau
       das zu, worauf man schauen soll.

       Ab Runde 2 wird sie ausgeblendet. Hinten in einer Reihe steht immer eine
       Flasche genau hinter der Flamme, und weil Entferntes zur Bildmitte hin
       zusammenrückt, hilft weder mehr Abstand noch eine Lücke – man müsste die
       Reihe so weit auseinanderziehen, dass der Brand zur Briefmarke wird. */
    const GERAET = {
      wasser: { farbe: 0x1e9fc0, schild: 'Wasser' },
      schaum: { farbe: 0x6fc4d8, schild: 'Schaum' },
      pulver: { farbe: 0xc8241a, schild: 'Pulver' },
      co2:    { farbe: 0x3a3a3c, schild: 'CO2' },
      fett:   { farbe: 0xe0a83f, schild: 'Fett' },
    };
    const geraete = {};
    LOESCHMITTEL.forEach((m, i) => {
      const g = baueLoescher({ farbe: GERAET[m.id].farbe, schild: GERAET[m.id].schild });
      const x = (i - (LOESCHMITTEL.length - 1) / 2) * 1.15;
      g.position.set(x, 0, -2.7);
      Stage.welt.add(g);
      geraete[m.id] = g;
    });

    const geraeteZeigen = (ja) => LOESCHMITTEL.forEach(m => { geraete[m.id].visible = ja; });

    const geraetHuepfen = (id) => {
      const g = geraete[id];
      if (!g || !g.visible) return;
      Bewegung.neu(.5, (p) => { g.position.y = Math.sin(p * Math.PI) * .34; });
    };

    const fahne = baueWindfahne();
    fahne.position.set(9, 0, -3);
    Stage.welt.add(fahne);
    [[-7.5, 6], [7.5, 6]].forEach(([x, z]) => {
      const k = baueKegel(); k.position.set(x, 0, z); Stage.welt.add(k);
    });

    /* --- Löschmittel in Aktion ------------------------------------------- */
    // Kuerzer als in Aufgabe 5: Dort steht die Kamera weit weg vom Dreieck und
    // der ganze Bogen ist im Bild. Hier ist der Ausschnitt eng um das Podest,
    // und ein Strahl, der sechs Meter vor der Kamera anfaengt, ist nur noch als
    // gepunktete Linie am unteren Bildrand zu sehen.
    const strahlVoll = baueStrahl({ weite: 3.4, hoch: 1.7 });
    const strahlFein = baueStrahl({ fein: true, weite: 3.1, hoch: 1.7 });
    const strahlSchaum = baueStrahl({ farbe: LOESCHEN.schaum, weite: 3.3, hoch: 1.7 });
    [strahlVoll, strahlFein, strahlSchaum].forEach(st => {
      st.position.set(.35, 0, 3.6);
      st.rotation.y = Math.PI;
      strahlAn(st, 0);
      Stage.welt.add(st);
    });

    const dampf = baueWolken('dampf', 14);
    dampf.position.set(0, .9, 0);
    wolkenStaerke(dampf, 0, true);
    Stage.welt.add(dampf);

    const pulverwolke = baueWolken('pulver', 16);
    pulverwolke.position.set(0, .6, 0);
    wolkenStaerke(pulverwolke, 0, true);
    Stage.welt.add(pulverwolke);

    const rauch = baueWolken('rauch', 12);
    rauch.position.set(0, 2.0, 0);
    wolkenStaerke(rauch, 0, true);
    Stage.welt.add(rauch);

    const schaumdecke = baueSchaumdecke({ radius: .85 });
    schaumdecke.position.set(0, .42, 0);
    Stage.welt.add(schaumdecke);

    // Das Feuer auf dem Podest. Ein einziges für alle Lagen: Höhe, Breite und
    // das Verhältnis Flamme zu Glut werden je Brand umgestellt.
    const brandFeuer = baueFeuer({ hoehe: 1.5, breite: .6, zungen: 7, licht: true, glutAnteil: .5 });
    brandFeuer.position.set(0, .5, 0);
    feuerStaerke(brandFeuer, 0, true);
    Stage.welt.add(brandFeuer);

    let fackel = null;      // wird erst für den Gasbrand gebaut

    Stage.anmelden((dt, t) => {
      feuerUpdate(brandFeuer, dt, t);
      if (fackel && fackel.userData.fackel.flamme) feuerUpdate(fackel.userData.fackel.flamme, dt, t);
      wolkenUpdate(dampf, dt);
      wolkenUpdate(pulverwolke, dt);
      wolkenUpdate(rauch, dt);
      schaumUpdate(schaumdecke, dt);
      strahlUpdate(strahlVoll, dt);
      strahlUpdate(strahlFein, dt);
      strahlUpdate(strahlSchaum, dt);
      windfahneUpdate(fahne, dt, t, -.5);
    });

    const allesAus = () => {
      strahlAn(strahlVoll, 0); strahlAn(strahlFein, 0); strahlAn(strahlSchaum, 0);
      wolkenStaerke(dampf, 0); wolkenStaerke(pulverwolke, 0);
      schaumFuellen(schaumdecke, 0);
    };

    /* Bildausschnitte. Alle drei fassen das Podest und die Gerätereihe
       dahinter – nur bis Geräthöhe, denn der Quader wird um diese Punkte
       gelegt und nicht um das Motiv: Ein hoher Punkt in der Mitte bläht ihn
       auf und schickt die Kamera in die Ferne.

       Sie stehen hier oben und nicht bei ihrer Runde, damit keine von ihnen
       aus einer Funktion heraus benutzt wird, bevor sie angelegt ist. */
    const MOTIV_KLEIN  = [[-3.4, 0, -3.2], [3.4, 0, -3.2], [3.4, 0, 1.6], [-3.4, 0, 1.6], [0, 1.0, 0]];
    const MOTIV_BRAND  = [[-2.1, 0, -1.9], [2.1, 0, -1.9], [2.1, 0, 1.7], [-2.1, 0, 1.7], [0, 1.3, 0]];
    /* Runde 3 bekommt je Lage ihren eigenen Ausschnitt. Ein gemeinsamer
       müsste die 2,8 breite Wand fassen – und dann steht der Holzstapel als
       Streichholzschachtel in einem Feld leerem Beton. */
    const MOTIV_STRAHL = {
      glutnest: [[-1.5, 0, -1.2], [1.5, 0, -1.2], [1.5, 0, 1.2], [-1.5, 0, 1.2], [0, .9, 0]],
      kuehlen:  [[-2.0, 0, -1.3], [2.4, 0, -1.3], [2.4, 0, 1.2], [-2.0, 0, 1.2],
                 [-2.0, 2.2, -1.2], [.8, 2.2, -1.2]],
      abmagern: [[-1.6, 0, -1.1], [1.6, 0, -1.1], [1.6, 0, 1.2], [-1.6, 0, 1.2], [0, 1.0, 0]],
    };

    /* --- Runde 1: Hauptlöschwirkung -------------------------------------- */
    const phaseWirkung = () => {
      // Nur die vier Verfahren, die tatsächlich Hauptlöschwirkung eines
      // Mittels sind. Abmagern fehlt – das ist kein Versehen und wird gleich
      // danach erklärt.
      geraeteZeigen(true);
      const koerbeIds = ['abkuehlen', 'verduennen', 'trennen', 'hemmen'];
      const karten = shuffle(LOESCHMITTEL.slice());
      let offen = karten.length;

      // scrollbar als Netz: Bei eingeschalteter Textskalierung wird selbst das
      // kompakte Hochformat-Layout zu hoch. Ziehen und Scrollen kommen sich
      // nicht in die Quere – `.ziehbar` steht auf `touch-action:none`.
      UI.zeige('l6-wirkung', (s) => {
        const korb = (v) => el('div', {
          class: 'ablage korb', 'data-korb': v.id, style: { '--f': v.farbe },
        },
          el('b', { text: (v.kurzname || v.name) }),
          el('small', { text: v.kurz }),
          el('div', { class: 'korbinhalt' }));

        const koerbe = el('div', { class: 'koerbe' },
          koerbeIds.map(id => korb(LOESCHVERFAHREN.find(v => v.id === id))));

        const vorrat = el('div', { class: 'kartenleiste' });
        const zaehler = el('div', { class: 'chip', text: `noch ${offen}` });
        const unten = unterbau(vorrat);

        karten.forEach(m => {
          const node = el('div', { class: 'brennkarte' },
            el('span', { class: 'ic', text: m.icon }),
            el('b', { text: m.kurzname || m.name }));
          ziehbarMachen(node, {
            daten: m, radius: 150,
            aufAblage: (ablage, daten, quelle) => {
              if (!ablage.dataset.korb) { Audio3.zu(); return; }
              if (ablage.dataset.korb !== daten.haupt) {
                fehlerWirkung++;
                Audio3.falsch();
                quelle.classList.add('wackeln');
                setTimeout(() => quelle.classList.remove('wackeln'), 450);
                // Der Hinweis nennt die Wirkung, nicht das Verfahren – sonst
                // wäre er die Antwort statt eines Wegweisers.
                unten.hinweis(daten.wirkung, 'schlecht', 4000);
                return;
              }
              offen--;
              Audio3.richtig();
              geraetHuepfen(daten.id);
              quelle.remove();
              $('.korbinhalt', ablage).appendChild(
                el('span', { class: 'korbchip' }, daten.icon, el('i', { text: daten.kurzname || daten.name })));
              zaehler.textContent = offen ? `noch ${offen}` : 'fertig!';
              if (offen === 0) setTimeout(wirkungAufloesung, 900);
            },
          });
          vorrat.appendChild(node);
        });

        const auftrag = el('div', { class: 'auftrag' },
          el('div', { class: 'dienstvorschrift', text: 'Aufgabe 6' }),
          el('h2', { text: 'Welches Mittel kann welches Verfahren?' }),
          el('p', { class: 'hinweis', text: 'Jedes Löschmittel hat eine Hauptlöschwirkung – danach wird es eingeordnet. Nebenwirkungen zählen hier nicht.' }),
          zaehler);
        s.appendChild(auftrag);
        s.appendChild(koerbe);
        s.appendChild(unten);

        // Kulisse, nicht Bühne: Auftrag, vier Körbe und die Kartenleiste
        // lassen keinen Bildstreifen übrig, in den sich etwas einpassen liesse.
        return motivWache(MOTIV_KLEIN, null, { hoch: .55, weit: .9, anteil: .58, rand: .9 });
      }, { scroll: true });
    };



    const wirkungAufloesung = () => {
      UI.zeige('l6-wirkung-aufloesung', (s) => {
        const panel = el('div', { class: 'panel glas', style: { width: 'min(660px,94vw)', textAlign: 'center' } },
          el('h2', { text: '🫧 Und wo bleibt das Abmagern?' }),
          el('p', { style: { margin: '.5em 0 0' }, html:
            'Vier Verfahren, fünf Mittel – <b>Abmagern</b> war nicht dabei. Das stimmt so: Es ist bei keinem Löschmittel die Hauptwirkung.' }),
          el('p', { style: { margin: '.5em 0 0' }, html:
            'Abmagern ist eine <b>Nebenwirkung des Wassers</b>, und zwar nur im Sprühstrahl auf brennende Flüssigkeiten. Auch Schaum kühlt nebenbei, und Pulver verdünnt nebenbei – eingeordnet wird trotzdem nach der Hauptwirkung.' }),
          el('p', { class: 'hinweis', style: { marginTop: '.5em' }, text:
            'Jetzt kommt der Ernstfall: fünf Brände, und du entscheidest.' }),
          el('button', { class: 'btn gross', style: { marginTop: '.5em' },
            onclick: () => { Audio3.klick(); phaseEinsatz(); } }, 'Weiter →'));
        s.appendChild(el('div', { class: 'mitte' }, panel));
      });
    };

    /* --- Runde 2: fünf Brände -------------------------------------------- */

    /* Wie der jeweilige Brand aussieht. Nicht nur Deko: Ein Metallbrand
       leuchtet fast ohne Flamme, ein Gasbrand schiesst als Fackel heraus –
       daran erkennt man die Brandklasse, bevor man das Schild liest. */
    /* `flammeXY` skaliert die Flammengruppe – breit und flach für eine Lache,
       schmal und hoch für die Fritteuse. Über `userData.feuer.hoehe` ginge das
       NICHT: Die Kegel bekommen ihre Masse beim Bauen, der Wert steuert nur
       noch den Funkenflug. */
    const BRANDBILD = {
      holz:      { flammeXY: [1.0, 1.0], flamme: 1,   glut: .85, y: .55, skala: 1.5 },
      kanister:  { flammeXY: [1.1, .8],  flamme: 1,   glut: 0,   y: .26, skala: 1.4 },
      // Magnesium ohne Flamme: Es gluht blendend weiss, und genau daran
      // erkennt man einen Metallbrand. Eine Flamme daraufzusetzen waere
      // huebscher und falsch – und Kinder, die hier eine Flamme sehen,
      // suchen im Ernstfall nach einer.
      metall:    { flammeXY: [.85, .5],  flamme: 0,   glut: 1,   y: .26, skala: 1.5,
                   glutFarbe: FEUERFARBEN.weissglut, schein: 1 },
      fritteuse: { flammeXY: [.8, .7],   flamme: 1,   glut: 0,   y: .50, skala: 1.4 },
    };

    // Die Skalierung der laufenden Lage – die Folgen einer Fehlentscheidung
    // blasen die Flamme auf und müssen danach wieder hierhin zurückfinden.
    let basisSkala = [1, 1];

    let stueck = null;
    const stueckWeg = () => {
      // Nur die Geometrien freigeben. Die Materialien kommen aus `Mat` und
      // gehören allen – wer sie hier wegwirft, nimmt sie dem nächsten Brand.
      if (stueck) {
        buehne.remove(stueck);
        stueck.traverse(o => { if (o.geometry) o.geometry.dispose(); });
        stueck = null;
      }
      if (fackel) { buehne.remove(fackel); fackel = null; }
    };

    const lageAufbauen = (lage) => {
      stueckWeg();
      allesAus();
      wolkenStaerke(rauch, .3);
      basisSkala = [1, 1];
      brandFeuer.scale.setScalar(1);

      if (lage.klasse === 'C') {
        feuerStaerke(brandFeuer, 0, true);
        fackel = baueGasfackel({ mitFlamme: true });
        fackel.scale.setScalar(1.05);
        buehne.add(fackel);
        feuerStaerke(fackel.userData.fackel.flamme, 1, true);
        return;
      }

      const b = BRANDBILD[lage.art];
      stueck = baueBrandgut(lage.art);
      stueck.scale.setScalar(b.skala);
      buehne.add(stueck);
      brandFeuer.position.set(0, .34 + b.y, 0);
      basisSkala = b.flammeXY;
      brandFeuer.scale.set(b.flammeXY[0], b.flammeXY[1], b.flammeXY[0]);
      feuerAnteileSetzen(brandFeuer, b.flamme, b.glut);
      feuerGlutFarbe(brandFeuer, b.glutFarbe, b.schein);
      feuerStaerke(brandFeuer, 1, true);
    };

    const brandAus = () => {
      feuerStaerke(brandFeuer, 0);
      if (fackel && fackel.userData.fackel.flamme) feuerStaerke(fackel.userData.fackel.flamme, 0);
      wolkenStaerke(rauch, 0);
    };

    /* Was man sieht, wenn richtig gegriffen wurde. */
    const LOESCHSCHAU = {
      wasser: () => { strahlAn(strahlVoll, 1); wolkenStaerke(dampf, 1); Audio3.wasser(); },
      schaum: () => { strahlAn(strahlSchaum, 1); schaumFuellen(schaumdecke, 1); Audio3.whoosh(); },
      pulver: () => { wolkenStaerke(pulverwolke, 1); Audio3.whoosh(); },
      co2:    () => { wolkenStaerke(dampf, 1); Audio3.whoosh(); },
      fett:   () => { strahlAn(strahlFein, 1); schaumFuellen(schaumdecke, 1); Audio3.whoosh(); },
      absperren: () => { if (fackel) fackelAbsperren(fackel); Audio3.klick(); },
    };

    /* Und was man sieht, wenn nicht. Jede Folge ist die, die im Leitfaden
       unter „Anwendungsgrenzen" steht – keine ausgedachte Strafe. */
    const folgeSpielen = (art) => {
      const oben = new THREE.Vector3(0, 1.1, 0);
      switch (art) {
        case 'fettexplosion':
          strahlAn(strahlVoll, 1);
          setTimeout(() => {
            strahlAn(strahlVoll, 0);
            Audio3.feuer();
            brandFeuer.scale.set(basisSkala[0] * 2.6, basisSkala[1] * 2.2, basisSkala[0] * 2.6);
            feuerStaerke(brandFeuer, 1, true);
            wolkenStaerke(rauch, 1);
            funkenSchauer(Stage.welt, oben, { anzahl: 46, wucht: 2.4, dauer: 1.4 });
          }, 700);
          break;
        case 'knallgas':
          strahlAn(strahlVoll, 1);
          setTimeout(() => {
            strahlAn(strahlVoll, 0);
            Audio3.feuer();
            brandFeuer.scale.set(basisSkala[0] * 2.2, basisSkala[1] * 2.4, basisSkala[0] * 2.2);
            feuerAnteileSetzen(brandFeuer, 1, 1);
            feuerStaerke(brandFeuer, 1, true);
            funkenSchauer(Stage.welt, oben, { anzahl: 54, wucht: 2.8, dauer: 1.2 });
          }, 700);
          break;
        case 'ueberlaufen':
          strahlAn(strahlVoll, 1);
          setTimeout(() => {
            strahlAn(strahlVoll, 0);
            Audio3.feuer();
            // breiter, nicht höher: Die Lache läuft brennend auseinander
            brandFeuer.scale.set(basisSkala[0] * 2.6, basisSkala[1] * 1.1, basisSkala[0] * 2.6);
            feuerStaerke(brandFeuer, 1, true);
            wolkenStaerke(rauch, .9);
          }, 700);
          break;
        case 'rueckzuendung':
          wolkenStaerke(pulverwolke, 1);
          feuerStaerke(brandFeuer, 0);
          setTimeout(() => {
            wolkenStaerke(pulverwolke, 0);
            Audio3.feuer();
            feuerStaerke(brandFeuer, 1);
            funkenSchauer(Stage.welt, oben, { anzahl: 14, wucht: .7, dauer: .7 });
          }, 1600);
          break;
        case 'gaswolke':
          wolkenStaerke(pulverwolke, 1);
          if (fackel && fackel.userData.fackel.flamme) feuerStaerke(fackel.userData.fackel.flamme, 0);
          setTimeout(() => {
            wolkenStaerke(pulverwolke, 0);
            // Farbloses Gas, das sich sammelt: der Dampfwerfer, ganz langsam
            // und breit. Es passiert nichts – und genau das ist das Schlimme.
            wolkenStaerke(dampf, .9);
          }, 1400);
          break;
        case 'verweht':
          wolkenStaerke(dampf, .8);
          setTimeout(() => wolkenStaerke(dampf, 0), 1400);
          Audio3.zu();
          break;
        default:
          Audio3.zu();
      }
    };



    const lageZeigen = (i) => {
      if (i >= BRANDLAGEN.length) { setTimeout(phaseStrahl, 600); return; }
      const lage = BRANDLAGEN[i];
      lageAufbauen(lage);

      UI.zeige('l6-lage-' + lage.id, (s) => {
        let fertig = false, laeuft = false;
        const unten = unterbau();

        // Die Wahl: fünf Löschmittel plus „absperren". Absperren steht in
        // jeder Lage zur Wahl, nicht nur beim Gasbrand – sonst wäre es dort
        // die Antwort, bevor die Frage gestellt ist.
        const wahl = el('div', { class: 'mittelwahl' });

        const knopf = (id, icon, name) => {
          const b = el('button', { class: 'mittelknopf' },
            el('span', { class: 'ic', text: icon }),
            el('span', { text: name }));
          b.addEventListener('click', () => {
            if (fertig || laeuft) return;
            if (id !== 'absperren') geraetHuepfen(id);

            // Richtig – oder fachlich ebenfalls zulässig
            const auch = (lage.auch || []).indexOf(id) >= 0;
            if (id === lage.gut || auch) {
              fertig = true;
              b.classList.add('richtig');
              Audio3.richtig();
              LOESCHSCHAU[id]();
              setTimeout(brandAus, id === 'absperren' ? 900 : 500);
              unten.hinweis(auch ? lage.auchWarum : lage.warum, 'gut', 5000);
              setTimeout(() => { allesAus(); lageZeigen(i + 1); }, 3400);
              return;
            }

            // Richtig gehandelt, aber die Lage ist damit nicht erledigt
            const neutral = lage.neutral && lage.neutral[id];
            if (neutral) {
              Audio3.zu();
              unten.hinweis(neutral, '', 5000);
              return;
            }

            // Absperren ist nie ein Fehlgriff, sondern höchstens sinnlos:
            // Wer die Zufuhr sucht, hat richtig gedacht – hier gibt es nur
            // keine. Dafür einen Fehler anzurechnen, bestraft das richtige
            // Denken und verrät zugleich, wo der Gasbrand kommt.
            if (id === 'absperren') {
              Audio3.zu();
              unten.hinweis('Hier gibt es keine Zufuhr, die man zudrehen könnte – der Stoff liegt schon da und brennt.', '', 4200);
              return;
            }

            const f = (lage.falsch && lage.falsch[id])
              || { folge: 'zuwenig', text: 'Dieses Löschmittel ist für diesen Brand nicht zugelassen.' };
            fehlerEinsatz++;
            laeuft = true;
            Audio3.falsch();
            b.classList.add('falsch', 'wackeln');
            setTimeout(() => b.classList.remove('wackeln'), 450);
            folgeSpielen(f.folge);
            unten.hinweis(f.text, 'schlecht', 6000);
            // Danach dieselbe Lage noch einmal – man soll den richtigen Griff
            // auch wirklich machen, nicht nur den falschen erklärt bekommen.
            setTimeout(() => {
              allesAus();
              lageAufbauen(lage);
              b.classList.remove('falsch');
              laeuft = false;
            }, 3600);
          });
          return b;
        };

        LOESCHMITTEL.forEach(m => wahl.appendChild(knopf(m.id, m.icon, m.kurzname || m.name)));
        wahl.appendChild(knopf('absperren', '🔧', 'Zufuhr absperren'));
        unten.appendChild(wahl);

        const auftrag = el('div', { class: 'auftrag' },
          el('div', { class: 'dienstvorschrift', text: `Brand ${i + 1} von ${BRANDLAGEN.length} · Klasse ${lage.klasse}` }),
          el('h2', { text: lage.name }),
          el('p', { class: 'hinweis', text: lage.lage }),
          UI.schritte(BRANDLAGEN.length, i));
        s.appendChild(auftrag);
        s.appendChild(unten);

        return motivWache(MOTIV_BRAND, unten,
          { hoch: .34, weit: .88, anteil: .94, rand: .5, panelUnten: true, obenNode: auftrag });
      });
    };

    const phaseEinsatz = () => { geraeteZeigen(false); lageZeigen(0); };

    /* --- Runde 3: Vollstrahl oder Sprühstrahl ---------------------------- */
    let wand = null, glutstapel = null, strahlwanne = null;

    const phaseStrahl = () => {
      stueckWeg();
      allesAus();
      feuerStaerke(brandFeuer, 0, true);
      wolkenStaerke(rauch, 0);
      // Das Podest hat ausgedient. In dieser Runde steht alles auf dem Boden –
      // eine Wand auf einem Podest wäre ein Denkmal, keine Wand.
      podest.visible = false;
      buehne.visible = false;

      glutstapel = baueBrandgut('holz');
      glutstapel.scale.setScalar(1.7);
      glutstapel.position.set(0, 0, 0);
      glutstapel.visible = false;
      Stage.welt.add(glutstapel);

      wand = new THREE.Group();
      const platte = new THREE.Mesh(new THREE.BoxGeometry(2.8, 2.2, .24), Mat.matt(PLATZ.beton2, .92));
      platte.position.set(0, 1.1, 0);
      platte.castShadow = true; platte.receiveShadow = true;
      wand.add(platte);
      wand.position.set(-.6, 0, -1.2);
      wand.visible = false;
      Stage.welt.add(wand);

      strahlwanne = baueWanne({ breite: 2.0, tiefe: 1.3 });
      strahlwanne.position.set(0, 0, 0);
      strahlwanne.visible = false;
      Stage.welt.add(strahlwanne);

      lageStrahl(0);
    };



    const lageStrahl = (i) => {
      if (i >= STRAHLLAGEN.length) { setTimeout(phaseFragen, 500); return; }
      const l = STRAHLLAGEN[i];

      // Aufbau
      glutstapel.visible = l.id === 'glutnest';
      wand.visible = l.id === 'kuehlen';
      strahlwanne.visible = l.id === 'abmagern';
      allesAus();
      // Glutnest: fast keine Flamme, dafür volle Glut – nur so sieht man, dass
      // es hier nichts mehr auszupusten gibt, sondern etwas auszukühlen.
      if (l.id === 'glutnest') {
        brandFeuer.scale.set(1.1, .35, 1.1);
        brandFeuer.position.set(0, .5, 0);
        feuerAnteileSetzen(brandFeuer, .12, 1);
      } else if (l.id === 'kuehlen') {
        brandFeuer.scale.set(.9, 1.1, .9);
        brandFeuer.position.set(1.5, .2, -.6);
        feuerAnteileSetzen(brandFeuer, 1, .3);
      } else {
        brandFeuer.scale.set(1.5, .7, 1.5);
        brandFeuer.position.set(0, strahlwanne.userData.wanne.oberkante, 0);
        feuerAnteileSetzen(brandFeuer, 1, 0);
      }
      feuerStaerke(brandFeuer, 1, true);

      UI.zeige('l6-strahl-' + l.id, (s) => {
        let beantwortet = false;
        const unten = unterbau();

        const feld = el('div', { class: 'antworten unten' },
          ...STRAHLARTEN.map((a, n) => {
            const b = el('button', { class: 'antwort' },
              el('span', { class: 'marker', text: 'AB'[n] }),
              el('span', { text: a.name }));
            b.addEventListener('click', () => {
              if (beantwortet) return;
              const rohr = a.id === 'voll' ? strahlVoll : strahlFein;
              if (a.id !== l.richtig) {
                fehlerStrahl++;
                Audio3.falsch();
                b.classList.add('falsch', 'wackeln');
                setTimeout(() => b.classList.remove('wackeln'), 450);
                // Zeigen, warum es nicht reicht: Der Strahl läuft, das Feuer
                // bleibt. Ein Text allein überzeugt hier niemanden.
                strahlAn(rohr, 1);
                Audio3.wasser();
                setTimeout(() => strahlAn(rohr, 0), 1600);
                unten.hinweis(a.schwaeche, 'schlecht', 4400);
                return;
              }
              beantwortet = true;
              Audio3.richtig();
              b.classList.add('richtig');
              strahlAn(rohr, 1);
              Audio3.wasser();
              wolkenStaerke(dampf, a.id === 'voll' ? .6 : 1);
              feuerStaerke(brandFeuer, 0);
              unten.hinweis(l.warum, 'gut', 5000);
              setTimeout(() => {
                strahlAn(rohr, 0); wolkenStaerke(dampf, 0);
                lageStrahl(i + 1);
              }, 3400);
            });
            return b;
          }));
        unten.appendChild(feld);

        const auftrag = el('div', { class: 'auftrag' },
          el('div', { class: 'dienstvorschrift', text: `Lage ${i + 1} von ${STRAHLLAGEN.length}` }),
          el('h2', { text: 'Vollstrahl oder Sprühstrahl?' }),
          el('p', { class: 'hinweis', text: l.lage }),
          UI.schritte(STRAHLLAGEN.length, i));
        s.appendChild(auftrag);
        s.appendChild(unten);

        return motivWache(MOTIV_STRAHL[l.id], unten,
          { hoch: .32, weit: .88, anteil: .94, rand: .5, panelUnten: true, obenNode: auftrag });
      });
    };

    /* --- Fragen ----------------------------------------------------------- */
    const phaseFragen = () => {
      const fragen = [
        {
          frage: 'Was ist die Hauptlöschwirkung von Löschschaum?',
          antworten: [
            'Abkühlen',
            'Ersticken durch Trennen',
            'Hemmen der Reaktion',
            'Ersticken durch Verdünnen',
          ],
          richtig: 1,
          erklaerung: 'Schaum legt sich als Decke zwischen Brandgut und Luft – Stoff und Sauerstoff kommen nicht mehr zusammen. Kühlen tut er auch, aber nur nebenbei.',
          zitat: 'Ersticken durch Trennen des brennbaren Stoffes vom Sauerstoff.',
        },
        {
          frage: 'In der Küche brennt das Frittierfett. Warum niemals Wasser?',
          antworten: [
            'Weil das Wasser das Fett verdünnt',
            'Weil das Wasser schlagartig verdampft',
            'Weil das Wasser den Strom weiterleitet',
            'Weil das Fett dabei hart wird',
          ],
          richtig: 1,
          erklaerung: 'Aus einem Liter Wasser werden beim Verdampfen rund 1700 Liter Dampf. Passiert das unter der Fettoberfläche, fliegt das brennende Fett durch den Raum – die Fettexplosion. Deshalb hat Klasse F ein eigenes Löschmittel.',
        },
        {
          frage: 'Aus einer Propanflasche schlägt eine Fackel. Was zuerst?',
          antworten: [
            'Mit Pulver löschen',
            'Mit CO₂ löschen',
            'Die Zufuhr absperren',
            'Mit Schaum abdecken',
          ],
          richtig: 2,
          erklaerung: 'Erst absperren, dann löschen. Eine gelöschte Gasflasche, aus der weiter Gas strömt, füllt den Raum mit einem unsichtbaren zündfähigen Gemisch – das ist gefährlicher als die Fackel, die man gerade weggenommen hat.',
        },
        {
          frage: 'Ein Holzstapel glüht tief im Inneren. Welche Strahlart?',
          antworten: [
            'Sprühstrahl, wegen der besseren Kühlung',
            'Vollstrahl, wegen der Auftreffwucht',
            'Egal, Hauptsache viel Wasser',
            'Erst Sprühstrahl, dann Pulver',
          ],
          richtig: 1,
          erklaerung: 'Der Sprühstrahl kühlt zwar besser – nur kommt er nicht bis zur Glut. Der Vollstrahl hat die Wurfweite und die Auftreffwucht, um sie zu zerteilen und einzudringen. Zum Kühlen großer Flächen nimmt man dann wieder Sprühstrahl.',
          zitat: 'Der Vollstrahl wird eingesetzt, damit das Löschmittel Wasser die Glut überhaupt erreicht, durch die Auftreffwucht die Glut zerteilt und Wasser tief in die Glut eindringen kann.',
        },
      ];

      UI.zeige('l6-fragen', (s) => {
        Stage.bildVersatz(0, 0);
        frageReihe(s, fragen,
          (richtig, gesamt) => {
            const fehler = fehlerWirkung + fehlerEinsatz + fehlerStrahl;
            const guete = clamp(richtig / gesamt - fehlerWirkung * .05 - fehlerEinsatz * .07 - fehlerStrahl * .05, 0, 1);
            const abzeichen = [];
            if (fehlerWirkung === 0) abzeichen.push('wirkung');
            if (fehlerEinsatz === 0) abzeichen.push('einsatz');
            api.fertig({
              guete,
              xp: 50 + richtig * 20,
              titel: `${richtig} von ${gesamt} Fragen richtig` +
                (fehler ? ` · ${fehler} Fehlgriff${fehler > 1 ? 'e' : ''}` : ' · kein einziger Fehlgriff'),
              abzeichen,
              zeilen: [
                el('span', { html: '<b>Wasser</b> kühlt · <b>Schaum</b> trennt · <b>Pulver</b> hemmt · <b>CO₂</b> verdünnt · <b>Fettbrand</b> trennt und kühlt.' }),
                el('span', { html: '<b>Niemals Wasser</b> auf Fett und auf Metall. Und nicht auf brennende Flüssigkeiten.' }),
                el('span', { html: '<b>Gasbrand:</b> erst absperren, dann löschen.' }),
                el('span', { html: '<b>Vollstrahl</b> dringt ein, <b>Sprühstrahl</b> kühlt. Beides ist Wasser.' }),
              ],
            });
          },
          (i, n) => el('div', { style: { paddingTop: '4px' } },
            UI.dunkler(), UI.schritte(n, i)));
      });
    };

    /* --- Einstieg ---------------------------------------------------------- */
    UI.zeige('l6-intro', (s) => {
      Stage.kameraSetzen([0, 3.0, 11], [0, 1.0, 1]);
      Stage.kameraFahren([-3.4, 2.6, 7.6], [0, .9, .8], 2.2);
      s.appendChild(el('div', { class: 'mitte' },
        el('div', { class: 'panel glas', style: { width: 'min(620px,94vw)', textAlign: 'center' } },
          el('div', { class: 'dienstvorschrift', text: 'Aufgabe 6' }),
          el('h2', { text: 'Womit löschen wir?' }),
          el('p', { style: { margin: '.5em 0 0' }, text:
            'Fünf Löschmittel stehen bereit. Jedes kann eines der Verfahren aus der letzten Aufgabe – und jedes hat eine Stelle, an der es nichts ausrichtet oder sogar gefährlich wird.' }),
          el('p', { class: 'hinweis', text:
            'Danach kommen fünf Brände. Du entscheidest, wozu du greifst. Was dabei herauskommt, siehst du.' }),
          el('button', { class: 'btn gross', onclick: () => { Audio3.klick(); phaseWirkung(); } }, 'Los →'))));
    });
  },
});
