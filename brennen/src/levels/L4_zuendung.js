/* ============================================================================
   Level 4 – Ab wann brennt es?

   Die letzten beiden Voraussetzungen: das richtige Mengenverhältnis (die Mitte
   des Dreiecks) und die Zündenergie (die dritte Ecke). Damit ist die erste
   Halbzeit vollständig – danach geht es ums Löschen.

   Drei Runden, drei Missverständnisse:
     1. „Viel Gas = gefährlich." Stimmt nicht. Zu wenig zündet nicht, zu viel
        auch nicht. Nur dazwischen, im Explosionsbereich, geht es los.
     2. „Es brennt, sobald es heiß genug ist." Da fehlt etwas. Am Flammpunkt
        zündet es und erlischt wieder, weil zu wenig nachkommt. Erst am
        Brennpunkt bleibt es. Und ab der Zündtemperatur braucht es überhaupt
        keine Zündquelle mehr.
     3. „Wind entfacht Feuer, also ist Wind eine Zündquelle." Nein – Wind
        bringt Sauerstoff, keine Energie. Eine Zündquelle bringt Energie.

   Quelle: HLFS Truppmann Teil 1, Kapitel 4.2 „Flammpunkt und Brennpunkt",
   4.3 „Explosionsbereich" und 5 „Zündenergie", Ausgabe 10/2012.
   ========================================================================== */
LEVELS.push({
  id: 'zuendung',
  name: 'Ab wann brennt es?',
  icon: '⚡',
  farbe: 'var(--rot)',
  kurz: 'Zu wenig Gas zündet nicht. Zu viel auch nicht. Und heiß allein reicht noch lange nicht.',

  start(api) {
    let fehlerPunkte = 0, fehlerQuellen = 0;

    /* --- Kulisse ---------------------------------------------------------- */
    Stage.leeren();
    Stage.welt.add(baueUebungsplatz({ seite: 26 }));

    const fahne = baueWindfahne();
    fahne.position.set(9.5, 0, -4);
    Stage.welt.add(fahne);

    const kasten = baueGaskasten({ breite: 2.6, hoehe: 1.9 });
    kasten.position.set(0, 0, 0);
    Stage.welt.add(kasten);

    // Die Gaswolke im Kasten. Sie sitzt tief: schwerer als Luft, wie die
    // meisten Kraftstoffdämpfe.
    const gas = baueWolken('dampf', 16);
    gas.position.set(0, .8, 0);
    gas.scale.set(.8, .5, .5);
    wolkenStaerke(gas, 0, true);
    Stage.welt.add(gas);

    const knall = baueFeuer({ hoehe: 1.5, breite: .8, zungen: 8, glutAnteil: 0 });
    knall.position.set(0, .25, 0);
    feuerStaerke(knall, 0, true);
    Stage.welt.add(knall);

    const platte = baueHeizplatte({ radius: .85 });
    platte.position.set(0, 0, 0);
    platte.visible = false;
    Stage.welt.add(platte);

    const probeFeuer = baueFeuer({ hoehe: .8, breite: .3, zungen: 5, glutAnteil: 0 });
    probeFeuer.position.set(0, platte.userData.heiz.oberkante, 0);
    feuerStaerke(probeFeuer, 0, true);
    Stage.welt.add(probeFeuer);

    const thermo = baueAnzeigesaeule({ hoehe: 2.4, farbe: 0xd93a12 });
    thermo.position.set(2.0, 0, 0);
    thermo.visible = false;
    Stage.welt.add(thermo);

    Stage.anmelden((dt, t) => {
      feuerUpdate(knall, dt, t);
      feuerUpdate(probeFeuer, dt, t);
      wolkenUpdate(gas, dt);
      windfahneUpdate(fahne, dt, t, -.5);
    });

    const MOTIV_K = [
      [-1.9, 0, -1.1], [1.9, 0, -1.1], [1.9, 0, 1.1], [-1.9, 0, 1.1], [0, 1.9, 0],
    ];

    /* --- Runde 1: der Explosionsbereich ----------------------------------
       Der Regler zeigt keine Zahlen in Prozent, und das ist Absicht: Die
       Grenzen sind für jeden Stoff andere, und die Unterlage nennt sie nur
       am Beispiel. Was hier haengen bleiben soll, ist das Prinzip.        */
    const phaseMischung = () => {
      // Wo der zuendfaehige Bereich auf der Skala 0..100 liegt. Frei gewaehlt,
      // weil die Skala selbst keine Stoffgroesse ist – nur die Form der Kurve
      // ist echt: eine Untergrenze, eine Obergrenze, dazwischen zuendet es.
      const UNTEN = 26, OBEN = 62;
      const bereich = (v) => v < UNTEN ? 'mager' : v > OBEN ? 'fett' : 'bereich';

      let getroffen = { mager: false, bereich: false, fett: false };

      UI.zeige('l4-mischung', (s) => {
        const stand = el('div', { class: 'zustandszeile' });

        const weiter = el('button', { class: 'btn gross',
          onclick: () => { Audio3.klick(); mischungAufloesung(); } });
        weiter.disabled = true;

        const pruefen = () => {
          const alle = getroffen.mager && getroffen.bereich && getroffen.fett;
          weiter.disabled = !alle;
          weiter.textContent = alle ? 'Verstanden →'
            : !getroffen.bereich ? 'Finde erst die Zündung …'
              : 'Probier auch die Ränder …';
        };

        const rg = regler({
          min: 0, max: 100, wert: 8,
          beschriftung: 'Gas in der Luft',
          anzeige: (v) => v < UNTEN ? 'zu mager' : v > OBEN ? 'zu fett' : 'zündfähig',
          zonen: [
            { von: 0, bis: UNTEN, farbe: 'color-mix(in srgb,var(--blau) 34%,#fff)', name: 'zu mager' },
            { von: UNTEN, bis: OBEN, farbe: 'color-mix(in srgb,var(--rot) 34%,#fff)', name: 'Explosionsbereich' },
            { von: OBEN, bis: 100, farbe: 'color-mix(in srgb,#a8642a 46%,#fff)', name: 'zu fett' },
          ],
          onWert: (v) => {
            wolkenStaerke(gas, clamp(v / 70, 0, 1));
            feuerStaerke(knall, 0);
            const b = bereich(v);
            stand.className = 'zustandszeile';
            stand.textContent = b === 'mager'
              ? 'Wenig Gas in der Luft. Da ist zwar etwas – aber zu wenig zum Zünden.'
              : b === 'fett'
                ? 'Viel Gas, wenig Luft. Jetzt fehlt der Sauerstoff.'
                : 'Gas und Luft passen zueinander. Wenn jetzt ein Funke kommt …';
            if (b === 'bereich') stand.classList.add('hoch');
          },
        });

        const zuenden = el('button', { class: 'btn' }, '⚡ Funke schlagen');
        zuenden.addEventListener('click', () => {
          const b = bereich(rg.wert());
          getroffen[b] = true;
          funkenSchauer(Stage.welt, kasten.userData.kasten.zuendPunkt,
            { anzahl: 10, wucht: .4, dauer: .5 });
          if (b === 'bereich') {
            Audio3.feuer();
            feuerStaerke(knall, 1, true);
            wolkenStaerke(gas, 0);
            stand.textContent = 'Zündung! Beim besten Mischungsverhältnis wird daraus eine Explosion.';
            stand.className = 'zustandszeile hoch';
            // nach kurzer Zeit wieder herunterfahren, damit man weiterprobieren kann
            setTimeout(() => { feuerStaerke(knall, 0); wolkenStaerke(gas, clamp(rg.wert() / 70, 0, 1)); }, 1400);
          } else {
            Audio3.zu();
            stand.textContent = b === 'mager'
              ? 'Nichts passiert. Unterhalb der unteren Explosionsgrenze zündet es nicht.'
              : 'Nichts passiert. Oberhalb der oberen Explosionsgrenze zündet es auch nicht.';
            stand.className = 'zustandszeile aus';
          }
          pruefen();
        });

        const panel = el('div', { class: 'panel glas unterbau', style: { textAlign: 'center' } },
          el('p', { class: 'hinweis', style: { margin: '0 0 .5em' }, text:
            'Stell die Mischung ein und schlag einen Funken. Probier alle drei Bereiche.' }),
          rg, stand,
          el('div', { class: 'knopfreihe' }, zuenden, weiter));
        s.appendChild(panel);
        pruefen();

        return motivWache(MOTIV_K, panel,
          { hoch: .26, weit: .88, anteil: .95, rand: .35, panelUnten: true, sofort: true });
      });
    };

    const mischungAufloesung = () => {
      feuerStaerke(knall, 0);
      wolkenStaerke(gas, .5);
      UI.zeige('l4-mischung-aufloesung', (s) => {
        const panel = el('div', { class: 'panel glas unterbau', style: { textAlign: 'center' } },
          el('h2', { text: '💥 Der Explosionsbereich' }),
          el('p', { style: { margin: '.4em 0 0' }, html:
            'Zwischen <b>unterer</b> und <b>oberer Explosionsgrenze</b> kann es zünden – darunter und darüber nicht. ' +
            'Wo genau die Grenzen liegen, ist bei jedem Gas anders.' }),
          el('p', { class: 'hinweis', style: { marginTop: '.5em' }, text:
            'Vorsicht bei „zu fett": Kommt Luft dazu, wandert die Mischung zurück in den Bereich. Deshalb wird ein Raum voller Gas nicht einfach gelüftet, ohne dass jemand nachdenkt.' }),
          el('button', { class: 'btn gross', style: { marginTop: '.5em' },
            onclick: () => { Audio3.klick(); phasePunkte(); } }, 'Weiter →'));
        s.appendChild(panel);
        return motivWache(MOTIV_K, panel, { hoch: .26, weit: .88, anteil: .9, rand: .35, panelUnten: true });
      });
    };

    /* --- Runde 2: Flammpunkt, Brennpunkt, Zündtemperatur ------------------
       Erst vorführen, dann benennen. Jede der drei Vorführungen zeigt genau
       einen Unterschied, und man ordnet den passenden Begriff zu.         */
    const MOTIV_P = [
      [-1.5, 0, -1.0], [2.7, 0, -1.0], [2.7, 0, 1.0], [-1.5, 0, 1.0], [0, 1.7, 0],
    ];

    const phasePunkte = () => {
      // Gaskasten weg, Heizplatte und Thermometer her
      Stage.welt.remove(kasten);
      Stage.welt.remove(gas);
      Stage.welt.remove(knall);
      platte.visible = true;
      thermo.visible = true;
      heizplatteFuellen(platte, 0xc8a64a);

      /* Die drei Vorführungen. `zeigen` spielt ab, was passiert – die Wärme
         steigt, dann kommt (oder kommt nicht) die Zündquelle. */
      const VORFUEHRUNG = [
        {
          id: 'flammpunkt', waerme: .38, zuendquelle: true, bleibt: false,
          text: 'Ein Streichholz kommt an die Schale. Es zündet – und geht gleich wieder aus.',
        },
        {
          id: 'brennpunkt', waerme: .58, zuendquelle: true, bleibt: true,
          text: 'Wieder ein Streichholz, die Flüssigkeit ist jetzt wärmer. Es zündet – und bleibt brennen.',
        },
        {
          id: 'zuendtemperatur', waerme: 1, zuendquelle: false, bleibt: true,
          text: 'Kein Streichholz, gar keine Zündquelle. Es wird nur immer heißer. Und dann brennt es von selbst.',
        },
      ];

      let i = 0;

      const naechste = () => {
        if (i >= VORFUEHRUNG.length) { setTimeout(phaseQuellen, 400); return; }
        const v = VORFUEHRUNG[i];
        const begriff = TEMPERATUREN.find(t => t.id === v.id);

        UI.zeige('l4-punkt-' + v.id, (s) => {
          let beantwortet = false;
          feuerStaerke(probeFeuer, 0, true);
          saeuleFuellen(thermo, 0);
          heizplatteGluehen(platte, 0);

          // Aufheizen, dann zünden – das ist die ganze Vorführung.
          Bewegung.neu(1.5, (p) => {
            saeuleFuellen(thermo, p * v.waerme);
            heizplatteGluehen(platte, p * v.waerme);
          }, () => {
            if (v.zuendquelle) {
              funkenSchauer(Stage.welt, new THREE.Vector3(0, platte.userData.heiz.oberkante + .3, 0),
                { anzahl: 8, wucht: .3, dauer: .4 });
            }
            Audio3.feuer();
            feuerStaerke(probeFeuer, 1, true);
            if (!v.bleibt) setTimeout(() => feuerStaerke(probeFeuer, 0), 900);
          });

          const unten = unterbau();

          const feld = el('div', { class: 'antworten unten drei' },
            ...shuffle(TEMPERATUREN.slice()).map((t, n) => {
              const b = el('button', { class: 'antwort' },
                el('span', { class: 'marker', text: 'ABC'[n] }),
                el('span', { text: t.name }));
              b.addEventListener('click', () => {
                if (beantwortet) return;
                if (t.id !== v.id) {
                  fehlerPunkte++;
                  Audio3.falsch();
                  b.classList.add('falsch', 'wackeln');
                  setTimeout(() => b.classList.remove('wackeln'), 450);
                  unten.hinweis(`${t.name}: ${t.kurz}`, 'schlecht', 3400);
                  return;
                }
                beantwortet = true;
                Audio3.richtig();
                b.classList.add('richtig');
                unten.hinweis(`${begriff.name}: ${begriff.kurz}`, 'gut', 3600);
                i++;
                setTimeout(naechste, 1800);
              });
              return b;
            }));
          unten.appendChild(feld);

          const auftrag = el('div', { class: 'auftrag' },
            el('div', { class: 'dienstvorschrift', text: `Versuch ${i + 1} von 3` }),
            el('h2', { text: 'Was war das gerade?' }),
            el('p', { class: 'hinweis', text: v.text }),
            UI.schritte(VORFUEHRUNG.length, i));
          s.appendChild(auftrag);
          s.appendChild(unten);

          return motivWache(MOTIV_P, unten,
            { hoch: .28, weit: .88, anteil: .94, rand: .3, panelUnten: true, obenNode: auftrag });
        });
      };
      naechste();
    };

    /* --- Runde 3: Was ist eine Zündquelle? -------------------------------- */
    const phaseQuellen = () => {
      feuerStaerke(probeFeuer, 0);
      heizplatteGluehen(platte, 0);
      saeuleFuellen(thermo, 0);

      const begriffe = shuffle(ZUENDQUELLEN.slice());
      let offen = begriffe.length;

      UI.zeige('l4-quellen', (s) => {
        const korb = (id, titel, unterzeile, farbe) => el('div', {
          class: 'ablage korb', 'data-korb': id, style: { '--f': farbe },
        },
          el('b', { text: titel }),
          el('small', { text: unterzeile }),
          el('div', { class: 'korbinhalt' }));

        const koerbe = el('div', { class: 'koerbe' },
          korb('ja', 'Zündquelle', 'Bringt Energie', 'var(--rot)'),
          korb('nein', 'Keine Zündquelle', 'Bringt keine Energie', 'var(--blau)'));

        const vorrat = el('div', { class: 'kartenleiste' });
        const zaehler = el('div', { class: 'chip', text: `noch ${offen}` });
        const unten = unterbau(vorrat);

        begriffe.forEach(q => {
          const node = el('div', { class: 'brennkarte klein' },
            el('span', { class: 'ic', text: q.icon }),
            el('b', { text: q.name }));
          ziehbarMachen(node, {
            daten: q, radius: 150,
            aufAblage: (ablage, daten, quelle) => {
              if (!ablage.dataset.korb) { Audio3.zu(); return; }
              const soll = daten.echt ? 'ja' : 'nein';
              if (ablage.dataset.korb !== soll) {
                fehlerQuellen++;
                Audio3.falsch();
                quelle.classList.add('wackeln');
                setTimeout(() => quelle.classList.remove('wackeln'), 450);
                unten.hinweis(daten.warum
                  || `${daten.name} bringt Energie von außen – das ist genau, was eine Zündquelle ausmacht.`,
                  'schlecht', 3600);
                return;
              }
              offen--;
              Audio3.richtig();
              quelle.remove();
              $('.korbinhalt', ablage).appendChild(
                el('span', { class: 'korbchip' }, daten.icon, el('i', { text: daten.name })));
              zaehler.textContent = offen ? `noch ${offen}` : 'fertig!';
              if (offen === 0) setTimeout(phaseFragen, 900);
            },
          });
          vorrat.appendChild(node);
        });

        const auftrag = el('div', { class: 'auftrag' },
          el('div', { class: 'dienstvorschrift', text: 'Aufgabe 4' }),
          el('h2', { text: 'Was zündet, was nicht?' }),
          el('p', { class: 'hinweis', text: 'Eine Zündquelle bringt Energie von außen. Alles andere gehört nach rechts.' }),
          zaehler);
        s.appendChild(auftrag);
        s.appendChild(koerbe);
        s.appendChild(unten);

        // Kulisse, nicht Bühne – wie beim Sortieren in Aufgabe 1
        return motivWache(MOTIV_P, null, { hoch: .5, weit: .9, anteil: .6, rand: .8 });
      });
    };

    /* --- Fragen ----------------------------------------------------------- */
    const phaseFragen = () => {
      const fragen = [
        {
          frage: 'In einem Raum ist sehr viel Gas ausgetreten – weit über der oberen Explosionsgrenze. Zündet es?',
          antworten: [
            'Ja, je mehr Gas, desto gefährlicher',
            'Nein – es fehlt der Sauerstoff',
            'Nur wenn es warm genug ist',
            'Nur bei offener Flamme',
          ],
          richtig: 1,
          erklaerung: 'Über der oberen Explosionsgrenze ist zu wenig Luft dabei. Gefährlich bleibt es trotzdem: Kommt Luft hinzu, wandert die Mischung zurück in den Explosionsbereich.',
        },
        {
          frage: 'Was ist der Flammpunkt?',
          antworten: [
            'Die Temperatur, ab der es von selbst brennt',
            'Die Temperatur, bei der die Dämpfe zünden – und gleich wieder ausgehen',
            'Die Temperatur der Flamme',
            'Die Temperatur, bei der die Flüssigkeit kocht',
          ],
          richtig: 1,
          erklaerung: 'Am Flammpunkt entstehen gerade genug Dämpfe, dass eine Zündquelle sie entzünden kann. Es kommt aber zu wenig nach – die Flamme erlischt wieder. Erst am Brennpunkt bleibt sie.',
          zitat: 'Der Brennpunkt bezeichnet die niedrigste Temperatur einer brennbaren Flüssigkeit, bei der sich Dämpfe in solchen Mengen entwickeln, dass ein ständiges Brennen unterhalten bleibt.',
        },
        {
          frage: 'Benzin hat einen Flammpunkt unter −20 °C, Diesel über 55 °C. Was heißt das?',
          antworten: [
            'Diesel brennt heißer',
            'Benzin ist gefährlicher – es steht bei jedem Wetter über seinem Flammpunkt',
            'Diesel brennt gar nicht',
            'Benzin muss erst erwärmt werden',
          ],
          richtig: 1,
          erklaerung: 'Benzin liefert bei normaler Umgebungstemperatur immer genug Dämpfe zum Zünden. Diesel muss man erst auf über 55 °C erwärmen – deshalb ist er deutlich harmloser.',
          zitat: 'Am gefährlichsten sind solche brennbaren Flüssigkeiten, die schon bei normaler Umgebungstemperatur ihren Flammpunkt überschritten haben.',
        },
        {
          frage: 'Ist Wind eine Zündquelle?',
          antworten: [
            'Ja, Wind entfacht doch Feuer',
            'Nein – er bringt Sauerstoff, keine Energie',
            'Ja, ab Windstärke 8',
            'Nur bei trockenem Wetter',
          ],
          richtig: 1,
          erklaerung: 'Wind facht ein bestehendes Feuer an, weil er Sauerstoff heranführt. Zünden kann er nichts – dafür braucht es Energie. Genau darum ist Wind keine Zündquelle, sondern eine Sache der zweiten Ecke.',
        },
      ];

      UI.zeige('l4-fragen', (s) => {
        Stage.bildVersatz(0, 0);
        frageReihe(s, fragen,
          (richtig, gesamt) => {
            const guete = clamp(richtig / gesamt - fehlerPunkte * .07 - fehlerQuellen * .05, 0, 1);
            const abzeichen = [];
            if (fehlerPunkte === 0) abzeichen.push('temperatur');
            if (fehlerQuellen === 0) abzeichen.push('zuendung');
            api.fertig({
              guete,
              xp: 50 + richtig * 20,
              titel: `${richtig} von ${gesamt} Fragen richtig` +
                (fehlerPunkte || fehlerQuellen
                  ? ` · ${fehlerPunkte + fehlerQuellen} Fehlgriff${fehlerPunkte + fehlerQuellen > 1 ? 'e' : ''}`
                  : ' · kein einziger Fehlgriff'),
              abzeichen,
              zeilen: [
                el('span', { html: '<b>Explosionsbereich:</b> zu mager zündet nicht, zu fett auch nicht – nur dazwischen.' }),
                el('span', { html: '<b>Flammpunkt:</b> es zündet und geht wieder aus. <b>Brennpunkt:</b> es bleibt.' }),
                el('span', { html: '<b>Zündtemperatur:</b> ab hier brennt es ganz ohne Zündquelle.' }),
                el('span', { html: '<b>Zündquelle</b> bringt Energie. Wind bringt Sauerstoff – das ist etwas anderes.' }),
              ],
            });
          },
          (i, n) => el('div', { style: { paddingTop: '4px' } },
            UI.dunkler(), UI.schritte(n, i)));
      });
    };

    /* --- Einstieg ---------------------------------------------------------- */
    UI.zeige('l4-intro', (s) => {
      Stage.kameraSetzen([0, 2.6, 9], [0, 1, 0]);
      Stage.kameraFahren([-2.8, 2.6, 6.4], [0, .9, 0], 2.2);
      s.appendChild(el('div', { class: 'mitte' },
        el('div', { class: 'panel glas', style: { width: 'min(620px,94vw)', textAlign: 'center' } },
          el('div', { class: 'dienstvorschrift', text: 'Aufgabe 4' }),
          el('h2', { text: 'Ab wann brennt es?' }),
          el('p', { style: { margin: '.5em 0 0' }, text:
            'Brennbarer Stoff ist da, Sauerstoff auch. Trotzdem passiert oft nichts. Es fehlt das richtige Verhältnis – und der Anstoß.' }),
          el('p', { class: 'hinweis', text:
            'Das sind die letzten beiden Voraussetzungen. Danach kennst du das ganze Dreieck samt Mitte, und es geht ans Löschen.' }),
          el('button', { class: 'btn gross', onclick: () => { Audio3.klick(); phaseMischung(); } }, 'Los →'))));
    });
  },
});
