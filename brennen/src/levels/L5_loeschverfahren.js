/* ============================================================================
   Level 5 – Wie löscht man?

   Der Angelpunkt der ganzen Seite. Die erste Halbzeit hat das
   Verbrennungsdreieck aufgebaut, Level 1 hat gezeigt: Fällt eine der vier
   Voraussetzungen weg, ist Schluss. Die Löschverfahren sind nichts anderes,
   als genau das mit Absicht herbeizuführen.

   Deshalb steht in Runde 1 wieder dasselbe Dreieck da – nur wird jetzt nicht
   gebaut, sondern angegriffen. Jedes der fünf Verfahren hat genau einen
   Angriffspunkt, und alle fünf sind verschieden:

     Abkühlen   → Zündenergie      (die Wärme)
     Verdünnen  → Sauerstoff       (Einflussfaktor Sauerstoff)
     Abmagern   → brennbarer Stoff (Einflussfaktor brennbarer Stoff)
     Trennen    → Mengenverhältnis (Einflussfaktor beide zusammen)
     Hemmen     → die Flamme       (gar keine Voraussetzung)

   Das ist nicht ausgedacht, sondern die Gliederung des Truppführer-
   Leitfadens: Er nennt zu jeder Spielart des Erstickens den „Einflussfaktor".
   Fünf Karten, fünf Punkte, keiner doppelt – dadurch wird aus einer
   Auswendiglernliste ein Bild, das man ablesen kann.

   Zwei Dinge sind bewusst Stolpersteine:
   1. „Hemmen" gehört auf die Flamme und auf keinen Sockel. Wer es zu „nimmt
      die Wärme" verkürzt, hat vier Verfahren statt fünf und den Wandeffekt
      verloren.
   2. Abmagern klingt nach Abkühlen und ist keines. Die Unterlage warnt selbst
      davor – deshalb bekommt genau dieser Unterschied Runde 2 für sich
      allein, mit zwei Vorführungen, in denen beide Male Wasser fließt.

   Quelle: HLFS Truppführer F-II, Kapitel 1 „Löschverfahren", Ausgabe 02/2010.
   ========================================================================== */
LEVELS.push({
  id: 'loeschverfahren',
  name: 'Wie löscht man?',
  icon: '🔻',
  farbe: 'var(--blau)',
  kurz: 'Fünf Verfahren – und jedes greift an einer anderen Stelle des Dreiecks an.',

  start(api) {
    let fehlerAngriff = 0, fehlerWasser = 0;

    /* --- Kulisse: dasselbe Dreieck wie in Aufgabe 1, nur fertig ----------
       Gleiche Maße, gleiche Eckpunkte. Das ist der halbe Lerneffekt: Wer das
       Bild wiedererkennt, weiß sofort wieder, worum es geht. */
    Stage.leeren();
    Stage.welt.add(baueUebungsplatz({ seite: 26 }));

    const schale = baueFeuerschale({ radius: .9 });
    Stage.welt.add(schale);

    // Etwas niedriger als in Aufgabe 1: Dort ist die Schale beim Aufbau noch
    // kalt, hier brennt sie von Anfang an – und eine 2,4 hohe Flamme deckt aus
    // dieser Blickrichtung die hintere Saeule vollstaendig zu.
    const feuer = baueFeuer({ hoehe: 2.0, breite: .8, zungen: 8, licht: true, glutAnteil: .6 });
    feuer.position.y = schale.userData.feuerHoehe;
    feuerStaerke(feuer, 1, true);
    Stage.welt.add(feuer);

    const rauch = baueWolken('rauch', 14);
    rauch.position.y = schale.userData.feuerHoehe + 2.1;
    wolkenStaerke(rauch, .5, true);
    Stage.welt.add(rauch);

    const ECKEN = [[0, -3.5], [2.95, 1.75], [-2.95, 1.75]];
    // Welche Ecke welche Voraussetzung trägt, ist hier festgelegt und nicht
    // wie in Aufgabe 1 frei gewählt: Die Karten müssen ja an einen bestimmten
    // Punkt, und der soll bei jedem Durchgang derselbe sein.
    const ECK_IDS = ['sauerstoff', 'energie', 'stoff'];

    const vor = (id) => VORAUSSETZUNGEN.find(v => v.id === id);

    const saeulen = ECKEN.map(([x, z], i) => {
      const s = baueSockel({ hoehe: 1.15 });
      s.position.set(x, 0, z);
      sockelBelegen(s, vor(ECK_IDS[i]));
      Stage.welt.add(s);
      return s;
    });

    const mittelfeld = baueMittelfeld({ innen: 1.3, aussen: 2.1 });
    sockelBelegen(mittelfeld, vor('menge'));
    Stage.welt.add(mittelfeld);

    /* Die fünf Angriffspunkte. Vier stehen im Dreieck, der fünfte ist die
       Flamme selbst – und das ist keine Spielerei, sondern der Unterschied
       zwischen „Hemmen" und allem anderen. */
    const ZIELE = [
      { id: 'sauerstoff', obj: saeulen[0], marke: () => new THREE.Vector3(ECKEN[0][0], saeulen[0].userData.sockel.hoehe + .3, ECKEN[0][1]) },
      { id: 'energie',    obj: saeulen[1], marke: () => new THREE.Vector3(ECKEN[1][0], saeulen[1].userData.sockel.hoehe + .3, ECKEN[1][1]) },
      { id: 'stoff',      obj: saeulen[2], marke: () => new THREE.Vector3(ECKEN[2][0], saeulen[2].userData.sockel.hoehe + .3, ECKEN[2][1]) },
      { id: 'menge',      obj: mittelfeld, marke: () => new THREE.Vector3(0, .3, 2.05) },
      // Mitten in der Flamme, nicht darueber: Weiter oben stoesst die Marke
      // im Bild an die der hinteren Saeule, und auf dem Handy ueberlappen sie.
      { id: 'reaktion',   obj: null,       marke: () => new THREE.Vector3(0, 1.5, 0),
        name: 'Die Flamme', icon: '🔥', farbe: 'var(--glut)' },
    ];

    [[-6.5, 5.5], [6.5, 5.5], [-6.5, -5.5], [6.5, -5.5]].forEach(([x, z]) => {
      const k = baueKegel(); k.position.set(x, 0, z); Stage.welt.add(k);
    });
    const fahne = baueWindfahne();
    fahne.position.set(9.5, 0, -4);
    Stage.welt.add(fahne);

    /* --- Löschgerät ------------------------------------------------------
       Alles unsichtbar, bis es gebraucht wird. Ein Strahlrohr, das die ganze
       Zeit im Bild liegt, sieht aus wie vergessenes Werkzeug. */
    const strahlVoll = baueStrahl({ weite: 5.4, hoch: 1.9 });
    const strahlFein = baueStrahl({ fein: true, weite: 4.8, hoch: 1.9 });
    // Der Strahl fliegt in seiner eigenen +z-Richtung. Damit er von vorn – aus
    // Blickrichtung – ins Bild kommt, steht er vorn und wird gedreht.
    [strahlVoll, strahlFein].forEach(st => {
      st.position.set(.5, 0, 5.6);
      st.rotation.y = Math.PI;
      strahlAn(st, 0);
      Stage.welt.add(st);
    });

    const dampf = baueWolken('dampf', 14);
    dampf.position.set(0, schale.userData.feuerHoehe + .3, 0);
    wolkenStaerke(dampf, 0, true);
    Stage.welt.add(dampf);

    const pulver = baueWolken('pulver', 16);
    pulver.position.set(0, schale.userData.feuerHoehe + .2, 0);
    wolkenStaerke(pulver, 0, true);
    Stage.welt.add(pulver);

    const schaum = baueSchaumdecke({ radius: 1.05 });
    schaum.position.set(0, schale.userData.feuerHoehe - .05, 0);
    Stage.welt.add(schaum);

    Stage.anmelden((dt, t) => {
      feuerUpdate(feuer, dt, t);
      wolkenUpdate(rauch, dt);
      wolkenUpdate(dampf, dt);
      wolkenUpdate(pulver, dt);
      schaumUpdate(schaum, dt);
      strahlUpdate(strahlVoll, dt);
      strahlUpdate(strahlFein, dt);
      windfahneUpdate(fahne, dt, t, -.6);
    });

    // Wie in Aufgabe 1 nur bis Säulenhöhe fassen – die Flammenspitze bläht
    // den Quader sonst auf und schickt die Kamera in die Ferne.
    const MOTIV = [
      [-3.2, 0, -3.8], [3.2, 0, -3.8], [3.2, 0, 2.4], [-3.2, 0, 2.4],
      [0, 1.4, 0],
    ];

    /* --- Runde 1: fünf Verfahren, fünf Angriffspunkte -------------------- */

    /* Was zu sehen ist, wenn ein Verfahren seinen Punkt gefunden hat. Bewusst
       ohne Anspruch, den echten Einsatz zu zeigen: Auf einem Holzfeuer in
       einer Schale magert niemand ab. Gezeigt wird das Löschmittel, das zum
       Verfahren gehört – wo es hingehört, klärt Level 6. */
    const SCHAU = {
      abkuehlen:  () => { strahlAn(strahlVoll, 1); wolkenStaerke(dampf, .9); Audio3.wasser(); },
      verduennen: () => { wolkenStaerke(dampf, 1); Audio3.whoosh(); },
      abmagern:   () => { strahlAn(strahlFein, 1); wolkenStaerke(dampf, .7); Audio3.wasser(); },
      trennen:    () => { schaumFuellen(schaum, 1); Audio3.whoosh(); },
      hemmen:     () => { wolkenStaerke(pulver, 1); Audio3.whoosh(); },
    };
    const schauAus = () => {
      strahlAn(strahlVoll, 0); strahlAn(strahlFein, 0);
      wolkenStaerke(dampf, 0); wolkenStaerke(pulver, 0);
      schaumFuellen(schaum, 0);
    };

    /* Die Hinweise bei einem Fehlgriff zeigen auf den richtigen Punkt, statt
       nur „falsch" zu sagen. Jeder von ihnen enthält die Begründung, aus der
       sich der Angriffspunkt herleiten lässt – wer ihn zweimal liest, braucht
       ihn nicht mehr. */
    const WOHIN = {
      abkuehlen:  'Abkühlen entzieht die Wärme, die die Verbrennung am Laufen hält. Such die Ecke, an der die Energie steht.',
      verduennen: 'Verdünnen drückt den Sauerstoff von 21 auf etwa 15 Volumenprozent herunter. Welche Ecke ist das?',
      abmagern:   'Abmagern kühlt eine Flüssigkeit unter ihren Flammpunkt – dann kommen keine Dämpfe mehr nach. Es fehlt also plötzlich der brennbare Stoff.',
      trennen:    'Trennen schiebt sich zwischen die beiden Reaktionspartner. Es greift keine der Ecken an, sondern das, was zwischen ihnen steht.',
      hemmen:     'Hemmen nimmt überhaupt keine Voraussetzung weg. Es greift die Verbrennung selbst an – dort, wo man sie sieht.',
    };

    const phaseAngriff = () => {
      const karten = shuffle(LOESCHVERFAHREN.slice());
      let getroffen = 0;
      let laeuft = false;                // während einer Vorführung nichts annehmen

      UI.zeige('l5-angriff', (s) => {
        HotSpots.starten(s);

        const leiste = el('div', { class: 'kartenleiste' });
        const unten = unterbau(leiste);

        const marken = ZIELE.map((z, i) => {
          const v = z.obj ? z.obj.userData.sockel.belegt : z;
          const node = el('div', {
            class: 'ablage sockelziel voll' + (z.id === 'reaktion' ? ' flammenziel' : ''),
            'data-nr': String(i), style: { '--f': v.farbe },
          },
            el('span', { class: 'ic', text: v.icon }),
            el('b', { text: v.name }));
          HotSpots.hinzu(z.marke(), node);
          return node;
        });

        const treffer = (ablage, daten, quelle) => {
          if (laeuft) { Audio3.zu(); return; }
          if (ablage.dataset.filled) { Audio3.zu(); return; }
          const ziel = ZIELE[Number(ablage.dataset.nr)];

          if (ziel.id !== daten.nimmt) {
            fehlerAngriff++;
            Audio3.falsch();
            quelle.classList.add('wackeln');
            setTimeout(() => quelle.classList.remove('wackeln'), 450);
            unten.hinweis(WOHIN[daten.id], 'schlecht', 4200);
            return;
          }

          laeuft = true;
          ablage.dataset.filled = '1';
          ablage.classList.add('erobert');
          ablage.innerHTML = '';
          ablage.appendChild(el('span', { class: 'ic', text: daten.icon }));
          ablage.appendChild(el('b', { text: daten.kurzname || daten.name }));
          ablage.style.setProperty('--f', daten.farbe);
          // Der Sockel nimmt die Farbe des Verfahrens an: Der Angriffspunkt
          // gehört jetzt sichtbar dem Löschverfahren und nicht mehr dem Feuer.
          if (ziel.obj) sockelBelegen(ziel.obj, { farbe: daten.farbe });
          quelle.remove();
          Audio3.richtig();
          SCHAU[daten.id]();
          // Das Feuer duckt sich, richtet sich aber wieder auf: Hier wird noch
          // nicht gelöscht, hier wird gezeigt, wo man ansetzt.
          feuerStaerke(feuer, .3);
          unten.hinweis(daten.treffer, 'gut', 4200);
          getroffen++;

          setTimeout(() => {
            schauAus();
            laeuft = false;
            if (getroffen === ZIELE.length) { HotSpots.beenden(); alleGefunden(); }
            else feuerStaerke(feuer, 1);
          }, 1500);
        };

        karten.forEach(v => {
          const node = el('div', { class: 'brennkarte' },
            el('span', { class: 'ic', text: v.icon }),
            el('b', { text: v.kurzname || v.name }));
          ziehbarMachen(node, { daten: v, aufAblage: treffer, radius: 150 });
          leiste.appendChild(node);
        });

        const auftrag = el('div', { class: 'auftrag' },
          el('div', { class: 'dienstvorschrift', text: 'Aufgabe 5' }),
          el('h2', { text: 'Wo greift welches Verfahren an?' }),
          el('p', { class: 'hinweis', text: 'Fünf Löschverfahren, fünf Punkte im Bild. Jeder Punkt gehört genau einem Verfahren – auch die Flamme.' }));
        s.appendChild(auftrag);
        s.appendChild(unten);

        const wache = motivWache(MOTIV, unten,
          { hoch: .48, weit: .9, anteil: .96, rand: .5, panelUnten: true, obenNode: auftrag, sofort: true });
        return () => { wache(); HotSpots.beenden(); };
      });
    };

    /* Alle fünf sitzen: jetzt wird tatsächlich gelöscht. */
    const alleGefunden = () => {
      Audio3.whoosh();
      wolkenStaerke(pulver, .8);
      wolkenStaerke(dampf, .8);
      schaumFuellen(schaum, 1);
      feuerStaerke(feuer, 0);
      wolkenStaerke(rauch, 0);
      setTimeout(() => { wolkenStaerke(pulver, 0); wolkenStaerke(dampf, 0); }, 2200);
      setTimeout(familien, 1500);
    };

    /* --- Auflösung: drei Verfahren, und eines hat drei Spielarten -------- */
    const familien = () => {
      UI.zeige('l5-familien', (s) => {
        const zeile = (f) => {
          const teile = LOESCHVERFAHREN.filter(v => v.familie === f.id);
          return el('div', { class: 'familie', style: { '--f': teile[0].farbe } },
            el('span', { class: 'ic', text: f.icon }),
            el('div', {},
              el('b', { text: f.name }),
              el('div', { class: 'klein', text: f.kurz }),
              teile.length > 1
                ? el('div', { class: 'spielarten' },
                  teile.map(t => el('span', { class: 'korbchip' }, t.icon,
                    el('i', { text: (t.kurzname || t.name) + ' · ' + t.einfluss }))))
                : null));
        };

        // Unten, nicht in der Mitte: Oben steht das gerade gelöschte Dreieck
        // mit den fünf eroberten Punkten. Genau davon redet der Text.
        const panel = el('div', { class: 'panel glas unterbau', style: { textAlign: 'left' } },
          el('h2', { style: { textAlign: 'center' }, text: '🔻 Drei Verfahren – fünf Wege' }),
          ...LOESCHFAMILIEN.map(zeile),
          el('p', { class: 'hinweis', style: { marginTop: '.6em', textAlign: 'center' }, text:
            'Ersticken heißt immer: am Mengenverhältnis drehen. Man kann dafür am Sauerstoff ansetzen, am brennbaren Stoff – oder beides voneinander trennen.' }),
          el('button', { class: 'btn gross', style: { marginTop: '.5em' },
            onclick: () => { Audio3.klick(); phaseWasser(); } }, 'Weiter →'));
        s.appendChild(panel);
        return motivWache(MOTIV, panel, { hoch: .5, weit: .9, anteil: .9, rand: .5, panelUnten: true });
      });
    };

    /* --- Runde 2: zweimal Wasser, zwei Verfahren ------------------------
       Der Leitfaden warnt ausdrücklich davor, Abmagern für Abkühlen zu
       halten – bei beiden fließt Wasser, und bei beiden wird etwas kälter.
       Der Unterschied liegt darin, WAS kälter wird: beim Abkühlen die
       Reaktionszone, beim Abmagern die Flüssigkeit, die den Nachschub
       liefert.                                                             */
    const WASSERSCHAU = [
      {
        id: 'abkuehlen', gegenstand: 'holz',
        lage: 'Ein Holzstapel glüht. Der Vollstrahl geht mitten hinein, es zischt und dampft.',
        beobachtung: 'Die Glut wird kälter, bis sie die Verbrennung nicht mehr trägt.',
      },
      {
        id: 'abmagern', gegenstand: 'wanne',
        lage: 'Eine Wanne mit brennender Flüssigkeit. Der Sprühstrahl kühlt sie unter ihren Flammpunkt.',
        beobachtung: 'Die Flüssigkeit liefert keine Dämpfe mehr nach – und ohne Dämpfe hat die Flamme nichts mehr zu brennen.',
      },
    ];

    let holzstapel = null, wanne = null, probeFeuer = null;

    const phaseWasser = () => {
      // Erst das Löschmittel aus Runde 1 abräumen: Die Schaumdecke liegt sonst
      // als weisser Fleck mitten in der neuen Kulisse.
      schauAus();
      // Das Dreieck abräumen: Es hat seine Aufgabe erfüllt, und die Sockel
      // stünden jetzt nur noch im Bild herum.
      [...saeulen, mittelfeld].forEach(o => {
        const vonY = o.position.y;
        Bewegung.neu(.7, (p) => { o.position.y = lerp(vonY, -2.4, p); });
      });
      schale.visible = false;
      // Nicht `visible = false`: `feuerUpdate` setzt das jedes Bild neu.
      // Ein Feuer verschwindet hier nur ueber seine Staerke.
      feuerStaerke(feuer, 0, true);
      wolkenStaerke(rauch, 0, true);

      holzstapel = baueBrandgut('holz');
      holzstapel.position.set(0, 0, 0);
      holzstapel.scale.setScalar(1.6);
      holzstapel.visible = false;
      Stage.welt.add(holzstapel);

      wanne = baueWanne({ breite: 2.0, tiefe: 1.4 });
      wanne.position.set(0, 0, 0);
      wanne.visible = false;
      Stage.welt.add(wanne);

      probeFeuer = baueFeuer({ hoehe: 1.25, breite: .62, zungen: 7, licht: true, glutAnteil: .6 });
      probeFeuer.position.set(0, .5, 0);
      feuerStaerke(probeFeuer, 0, true);
      Stage.welt.add(probeFeuer);
      Stage.anmelden((dt, t) => feuerUpdate(probeFeuer, dt, t));

      setTimeout(() => vorfuehrung(0), 800);
    };

    // Enger gefasst als das Dreieck: Hier steht ein einzelner Gegenstand, und
    // der soll das Bild fuellen statt in leerem Beton zu stehen.
    const MOTIV_W = [
      [-1.9, 0, -1.4], [1.9, 0, -1.4], [1.9, 0, 1.5], [-1.9, 0, 1.5], [0, 1.1, 0],
    ];

    const vorfuehrung = (i) => {
      if (i >= WASSERSCHAU.length) { setTimeout(wasserAufloesung, 400); return; }
      const w = WASSERSCHAU[i];

      // Aufbau für diese Vorführung
      const wanneDran = w.gegenstand === 'wanne';
      holzstapel.visible = !wanneDran;
      wanne.visible = wanneDran;
      probeFeuer.position.y = wanneDran ? wanne.userData.wanne.oberkante : .55;
      feuerAnteileSetzen(probeFeuer, 1, wanneDran ? 0 : .7);
      feuerStaerke(probeFeuer, 1, true);
      schaumFuellen(schaum, 0, true);

      UI.zeige('l5-wasser-' + w.id, (s) => {
        let beantwortet = false;

        // Erst brennen lassen, dann Wasser geben – sonst sieht man nicht,
        // dass der Strahl etwas bewirkt hat. Beide Zeitschalter fragen
        // `beantwortet` ab: Wer schnell tippt, hat den Strahl sonst gerade
        // abgestellt und bekommt ihn eine Sekunde spaeter wieder angedreht.
        const rohr = wanneDran ? strahlFein : strahlVoll;
        setTimeout(() => {
          if (beantwortet) return;
          strahlAn(rohr, 1);
          Audio3.wasser();
          wolkenStaerke(dampf, wanneDran ? .5 : 1);
        }, 1200);
        // Das Feuer geht erst eine Sekunde spaeter zurueck. Faellt es sofort
        // zusammen, ist die Vorfuehrung vorbei, bevor der Text gelesen ist.
        setTimeout(() => { if (!beantwortet) feuerStaerke(probeFeuer, .18); }, 2400);
        setTimeout(() => {
          if (beantwortet) return;
          strahlAn(rohr, 0);
          wolkenStaerke(dampf, .25);
        }, 5000);

        const unten = unterbau();
        const feld = el('div', { class: 'antworten unten drei' },
          ...shuffle([
            LOESCHVERFAHREN.find(v => v.id === 'abkuehlen'),
            LOESCHVERFAHREN.find(v => v.id === 'abmagern'),
            LOESCHVERFAHREN.find(v => v.id === 'trennen'),
          ]).map((v, n) => {
            const b = el('button', { class: 'antwort' },
              el('span', { class: 'marker', text: 'ABC'[n] }),
              el('span', { text: v.kurzname || v.name }));
            b.addEventListener('click', () => {
              if (beantwortet) return;
              if (v.id !== w.id) {
                fehlerWasser++;
                Audio3.falsch();
                b.classList.add('falsch', 'wackeln');
                setTimeout(() => b.classList.remove('wackeln'), 450);
                unten.hinweis(v.id === 'trennen'
                  ? 'Trennen legt etwas dazwischen – hier fließt nur Wasser, es liegt nichts obenauf.'
                  : v.id === 'abkuehlen'
                    ? 'Abkühlen nimmt der Verbrennungszone die Wärme. Sieh noch einmal hin: Was genau wird hier kälter?'
                    : 'Abmagern geht nur bei Flüssigkeiten – es nimmt ihnen die Dämpfe. Hier gibt es keine Dämpfe zu nehmen.',
                  'schlecht', 4000);
                return;
              }
              beantwortet = true;
              Audio3.richtig();
              b.classList.add('richtig');
              strahlAn(rohr, 0);
              feuerStaerke(probeFeuer, 0);
              unten.hinweis(w.beobachtung, 'gut', 4000);
              setTimeout(() => { wolkenStaerke(dampf, 0); vorfuehrung(i + 1); }, 2200);
            });
            return b;
          }));
        unten.appendChild(feld);

        const auftrag = el('div', { class: 'auftrag' },
          el('div', { class: 'dienstvorschrift', text: `Vorführung ${i + 1} von 2` }),
          el('h2', { text: 'Welches Verfahren ist das?' }),
          el('p', { class: 'hinweis', text: w.lage }),
          UI.schritte(WASSERSCHAU.length, i));
        s.appendChild(auftrag);
        s.appendChild(unten);

        return motivWache(MOTIV_W, unten,
          { hoch: .3, weit: .88, anteil: .94, rand: .55, panelUnten: true, obenNode: auftrag });
      });
    };

    const wasserAufloesung = () => {
      const abm = LOESCHVERFAHREN.find(v => v.id === 'abmagern');
      UI.zeige('l5-wasser-aufloesung', (s) => {
        const panel = el('div', { class: 'panel glas unterbau', style: { textAlign: 'center' } },
          el('h2', { text: '💧 Zweimal Wasser – zwei Verfahren' }),
          el('p', { style: { margin: '.4em 0 0' }, html:
            '<b>Abkühlen</b> nimmt der Verbrennung die Wärme. Es zielt auf die <b>Zündenergie</b>.' }),
          el('p', { style: { margin: '.4em 0 0' }, html:
            '<b>Abmagern</b> kühlt zwar auch – aber die Flüssigkeit, nicht die Flamme. Weil danach keine Dämpfe mehr nachkommen, fehlt der <b>brennbare Stoff</b>. Deshalb zählt es zum Ersticken.' }),
          UI.zitat(abm.zitat),
          el('p', { class: 'hinweis', style: { marginTop: '.4em' }, text:
            'Merksatz: Es kommt nicht darauf an, dass etwas kälter wird, sondern darauf, WAS kälter wird.' }),
          el('button', { class: 'btn gross', style: { marginTop: '.5em' },
            onclick: () => { Audio3.klick(); phaseFragen(); } }, 'Weiter →'));
        s.appendChild(panel);
        return motivWache(MOTIV_W, panel, { hoch: .4, weit: .88, anteil: .9, rand: .7, panelUnten: true });
      });
    };

    /* --- Fragen ----------------------------------------------------------- */
    const phaseFragen = () => {
      const fragen = [
        {
          frage: 'Was macht das Löschverfahren „Abkühlen"?',
          antworten: [
            'Es verdrängt den Sauerstoff',
            'Es entzieht die Wärme, die die Verbrennung braucht',
            'Es legt eine Decke über den Brand',
            'Es bremst die Verbrennungsreaktion aus',
          ],
          richtig: 1,
          erklaerung: 'Abkühlen greift die Zündenergie an. Bei Wasser entzieht das Verdampfen fünfmal mehr Wärme als das bloße Erwärmen – deshalb kühlt Sprühstrahl besser als Vollstrahl.',
          zitat: '„Abkühlen" ist ein Löschverfahren, bei dem den brennenden Stoffen entweder durch das Löschmittel oder durch andere Maßnahmen die zur Aufrechterhaltung der Verbrennung erforderliche Wärme entzogen wird.',
        },
        {
          frage: 'Ersticken hat drei Spielarten. Welche greift den brennbaren Stoff an?',
          antworten: ['Verdünnen', 'Abmagern', 'Trennen', 'Hemmen'],
          richtig: 1,
          erklaerung: 'Abmagern kühlt eine brennende Flüssigkeit unter ihren Flammpunkt. Dann liefert sie keine Dämpfe mehr nach – der brennbare Stoff bleibt aus. Verdünnen setzt am Sauerstoff an, Trennen an beiden.',
        },
        {
          frage: 'Warum steht „Trennen" in der Mitte des Dreiecks und nicht an einer Ecke?',
          antworten: [
            'Weil es das wichtigste Verfahren ist',
            'Weil es beide Reaktionspartner voneinander trennt – also das Verhältnis zwischen ihnen angreift',
            'Weil Schaum in der Mitte aufgetragen wird',
            'Das ist nur so gezeichnet',
          ],
          richtig: 1,
          erklaerung: 'Trennen nimmt weder den Stoff noch den Sauerstoff weg. Beide sind noch da – sie kommen nur nicht mehr zusammen. Genau das ist das Mengenverhältnis, und das steht in der Mitte.',
          zitat: 'Das Löschverfahren „Ersticken durch Trennen" beruht auf einer kompletten Trennung der beiden Reaktionspartner Sauerstoff und brennbarer Stoff.',
        },
        {
          frage: 'Welche Voraussetzung nimmt „Hemmen der Reaktion" weg?',
          antworten: [
            'Den Sauerstoff',
            'Die Zündenergie',
            'Keine – es greift die Verbrennungsreaktion selbst an',
            'Das Mengenverhältnis',
          ],
          richtig: 2,
          erklaerung: 'Hemmen ist das einzige Verfahren, das keine der vier Voraussetzungen anrührt. Die Teilchen, die die Verbrennung am Laufen halten, prallen gegen Pulverkörnchen und verlieren dabei ihre Energie – der Wandeffekt.',
          zitat: 'Das reaktionshemmende Löschverfahren beruht auf der Tatsache, dass die zum Aufrechterhalten der Verbrennungsreaktion notwendigen reaktionsbeschleunigenden Energieträger durch den Aufprall auf eine Wand ihre Energie verlieren.',
        },
      ];

      UI.zeige('l5-fragen', (s) => {
        Stage.bildVersatz(0, 0);
        frageReihe(s, fragen,
          (richtig, gesamt) => {
            const guete = clamp(richtig / gesamt - fehlerAngriff * .07 - fehlerWasser * .08, 0, 1);
            const abzeichen = [];
            if (fehlerAngriff === 0) abzeichen.push('angriff');
            if (fehlerWasser === 0) abzeichen.push('wasserzwei');
            api.fertig({
              guete,
              xp: 50 + richtig * 20,
              titel: `${richtig} von ${gesamt} Fragen richtig` +
                (fehlerAngriff || fehlerWasser
                  ? ` · ${fehlerAngriff + fehlerWasser} Fehlgriff${fehlerAngriff + fehlerWasser > 1 ? 'e' : ''}`
                  : ' · kein einziger Fehlgriff'),
              abzeichen,
              zeilen: [
                el('span', { html: '<b>Abkühlen</b> → Zündenergie. <b>Hemmen</b> → die Reaktion selbst.' }),
                el('span', { html: '<b>Ersticken</b> dreht am Mengenverhältnis – auf drei Arten.' }),
                el('span', { html: '<b>Verdünnen</b> am Sauerstoff · <b>Abmagern</b> am Stoff · <b>Trennen</b> an beiden.' }),
                el('span', { html: 'Zweimal Wasser, zwei Verfahren: Es zählt, <b>was</b> kälter wird.' }),
              ],
            });
          },
          (i, n) => el('div', { style: { paddingTop: '4px' } },
            UI.dunkler(), UI.schritte(n, i)));
      });
    };

    /* --- Einstieg ---------------------------------------------------------- */
    UI.zeige('l5-intro', (s) => {
      Stage.kameraSetzen([0, 3.4, 12], [0, 1.2, 0]);
      Stage.kameraFahren([-4.5, 4.2, 9.5], [0, 1.3, 0], 2.4);
      s.appendChild(el('div', { class: 'mitte' },
        el('div', { class: 'panel glas', style: { width: 'min(620px,94vw)', textAlign: 'center' } },
          el('div', { class: 'dienstvorschrift', text: 'Aufgabe 5' }),
          el('h2', { text: 'Wie löscht man?' }),
          el('p', { style: { margin: '.5em 0 0' }, text:
            'Das Dreieck steht wieder – diesmal fertig und brennend. In Aufgabe 1 hast du eine Voraussetzung weggenommen, und es war aus. Genau das macht die Feuerwehr. Sie hat nur Namen dafür.' }),
          el('p', { class: 'hinweis', text:
            'Fünf Löschverfahren, und jedes setzt an einer anderen Stelle an. Wenn du weißt, wo, brauchst du nichts auswendig zu lernen.' }),
          el('button', { class: 'btn gross', onclick: () => { Audio3.klick(); phaseAngriff(); } }, 'Los →'))));
    });
  },
});
