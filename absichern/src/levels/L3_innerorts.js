/* ============================================================================
   Aufgabe 3 – Innerorts

   Die erste richtige Absicherung. Vier Entscheidungen, und die erste ist die
   Zahl: **100 Meter** innerhalb geschlossener Ortschaften.

   Die anderen drei sind die, die man auf dem Papier übersieht:

   * **Nach beiden Seiten.** Eine Straße mit Gegenverkehr hat zwei
     Verkehrsströme, und beide müssen gewarnt werden. Das hängt nicht an der
     Ortstafel, sondern am Gegenverkehr.
   * **Auf dem Bankett laufen, nicht auf der Fahrbahn.** Der häufigste
     Unfall an einer Einsatzstelle ist der mit einer Einsatzkraft.
   * **Von innen nach außen aufbauen.** Man beginnt an der Einsatzstelle und
     arbeitet sich dem Verkehr entgegen. So sieht man, was kommt, und hat
     hinter sich immer schon eine Absperrung stehen.

   Der Maßstab des Plans ist gebrochen: Die Einsatzstelle liegt im großen
   Maßstab, die Anfahrt dahinter gestaucht. Die Leitpfosten stehen trotzdem
   alle 50 Meter — sie sind das Maßband, mit dem auf der Straße wirklich
   gemessen wird.
   ========================================================================== */
LEVELS.push({
  id: 'innerorts',
  name: 'Innerorts',
  icon: '🏘️',
  farbe: 'var(--blau)',
  kurz: '100 Meter, nach beiden Seiten — und der Weg dorthin führt nicht über die Fahrbahn.',

  start(api) {
    const STR = STRASSEN.innerorts;
    let fehler = 0;
    const SCHRITTE = 4;
    let abzeichen = { hundert: false, vorsichtig: false, vonInnen: false };

    /* --- Kulisse: Übersicht mit gebrochenem Maßstab ------------------------ */
    Stage.leeren();
    const plan = baueStrecke({
      art: 'gegenverkehr', von: -140, bis: 140,
      nah: 22, nahProM: 5, fernProM: 1.35,
      marken: [-100, 100], leitpfosten: true,
    });
    const spurOben = plan.spurMitte(0), spurUnten = plan.spurMitte(1);
    const bankettOben = plan.bankettMitte();
    const bankettUnten = plan.fbUnten + plan.bankett / 2;

    stellen(bauePKW('#2f6fd0', true), plan.mx(-2), spurOben, 5, plan.symbolSkala);
    stellen(bauePKW('#3f9a4a', true), plan.mx(2), spurOben + 13, 24, plan.symbolSkala);
    stellen(baueLF({ name: '19/43' }), plan.mx(12), spurOben, -9, plan.symbolSkala);

    // Der Trupp steht vor dem Fahrzeug – dort, wo Aufgabe 1 aufgehört hat.
    const trupp = stellen(baueFigur({ trupp: 'wasser', kennung: 'WTr' }), plan.mx(4), bankettOben, 0);
    planZeigen(plan, 1.02);

    const kopf = (i) => UI.schritte(SCHRITTE, i);

    /* --- Runde 1: Wie weit vor der Einsatzstelle? -------------------------- */
    const phaseAbstand = () => {
      let warngeraet = null;
      UI.zeige('l3-abstand', (s) => {
        s.appendChild(auftrag('Ortsdurchfahrt, Tempo 50',
          'Wie weit vor der Einsatzstelle beginnt die Absicherung? Schieb das Warngerät hin.'));
        const unten = unterbau();
        const feld = bedienfeld(s, [kopf(0)], { oben: .26 });

        // Warndreieck und Warnleuchte fahren mit dem Regler mit. Zwei Geräte,
        // ein Punkt: Sie gehören zusammen und stehen deshalb nebeneinander.
        warngeraet = stellen(
          `<g>${baueWarndreieck()}<g transform="translate(24,2)">${baueWarnleuchte()}</g></g>`,
          plan.mx(0), bankettOben, 0);

        const regler = abstandsregler({
          max: 200, schritt: 10, wert: 0,
          onWert: (m) => setzen(warngeraet, plan.mx(m), bankettOben, 0),
        });
        feld.appendChild(regler);

        const knopf = el('button', { class: 'btn gross' }, 'Hier aufstellen');
        feld.appendChild(el('div', { class: 'knopfreihe' }, knopf));
        feld.appendChild(unten);

        knopf.addEventListener('click', () => {
          const m = regler.wert();
          const gut = m === STR.abstand;
          regler.sperren(true);
          knopf.remove();
          if (gut) {
            Audio3.richtig();
            abzeichen.hundert = true;
            feld.insertBefore(UI.feedback(true, '100 Meter — richtig.',
              'Innerhalb geschlossener Ortschaften sind es 100 Meter. Das sind zwei Leitpfosten, '
              + 'und die stehen an jeder Straße.', STR.zitat), unten);
          } else {
            fehler++;
            Audio3.falsch();
            const warum = m < STR.abstand
              ? 'Zu nah. Wer erst dort bremst, steht mitten in eurer Einsatzstelle.'
              : 'Zu weit. Das ist der Abstand für außerorts — innerorts fährt niemand so schnell, '
                + 'und eine Absperrung, die niemand mit der Einsatzstelle in Verbindung bringt, '
                + 'wird überfahren.';
            feld.insertBefore(UI.feedback(false, `${m} Meter`,
              warum + ' Innerorts sind es 100 Meter.', STR.zitat), unten);
            setzen(warngeraet, plan.mx(STR.abstand), bankettOben, 0);
            regler.sperren(false);
            // Der Regler springt auf den richtigen Wert – man soll ihn einmal
            // an der richtigen Stelle gesehen haben, nicht nur gelesen.
            const eingabe = regler.querySelector('.reglereingabe');
            eingabe.value = String(STR.abstand);
            eingabe.dispatchEvent(new Event('input'));
            regler.sperren(true);
          }
          unten.hinweis(gut ? '100 Meter stehen.' : 'Das Warngerät steht jetzt auf 100 Metern.',
            gut ? 'gut' : 'schlecht', 0);
          feld.appendChild(el('div', { class: 'knopfreihe' },
            el('button', { class: 'btn gross', onclick: () => { Audio3.klick(); phaseSeiten(); } }, 'Weiter →')));
        });
      });
    };

    /* --- Runde 2: nach welchen Seiten? ------------------------------------- */
    const phaseSeiten = () => {
      UI.zeige('l3-seiten', (s) => {
        s.appendChild(auftrag('Ein Gerät steht',
          'Auf der anderen Seite kommt auch Verkehr. Reicht das eine Warngerät?'));
        const feld = bedienfeld(s, [kopf(1)], { oben: .26 });
        feld.appendChild(frageBauen({
          frage: 'Nach welchen Seiten wird gesichert?',
          antworten: [
            'Nach beiden — die Straße hat Gegenverkehr',
            'Nur in die Richtung, aus der wir gekommen sind',
            'Nur dorthin, wo das Unfallfahrzeug steht',
            'Nach beiden, aber auf der Gegenseite reichen 50 Meter',
          ],
          richtig: 0,
          erklaerung: 'Bei Straßen mit Gegenverkehr muss stets nach beiden Seiten gesichert werden — '
            + 'und zwar mit demselben Abstand. Der Gegenverkehr fährt genauso schnell.',
          zitat: 'Bei Straßen mit Gegenverkehr muss stets nach beiden Seiten gesichert werden.',
          danach: (gut) => {
            if (!gut) fehler++;
            // Das zweite Gerät wird gesetzt – auf der anderen Fahrbahnseite,
            // 100 Meter in die andere Richtung.
            stellen(`<g>${baueWarndreieck()}<g transform="translate(24,2)">${baueWarnleuchte()}</g></g>`,
              plan.mx(-STR.abstand), bankettUnten, 0);
            Audio3.auf();
            phaseWeg();
          },
        }));
      });
    };

    /* --- Runde 3: der Weg dorthin ------------------------------------------
       Der gefährlichste Teil der Absicherung ist der Gang dorthin. Deshalb
       eine eigene Runde – und ein Auto, das vorbeifährt.                    */
    const phaseWeg = () => {
      const WEGE = [
        { id: 'bankett', gut: true, text: 'Auf dem Bankett neben der Fahrbahn', y: () => bankettOben },
        { id: 'fahrbahn', gut: false, text: 'Auf der Fahrbahn, am rechten Rand entlang', y: () => spurOben + 14 },
        { id: 'mitte', gut: false, text: 'Auf der Mittellinie — da sieht man mich von beiden Seiten', y: () => 0 },
      ];
      UI.zeige('l3-weg', (s) => {
        s.appendChild(auftrag('100 Meter zu Fuß',
          'Der Truppmann geht mit dem zweiten Warngerät los. Wo läuft er?'));
        const unten = unterbau();
        const feld = bedienfeld(s, [kopf(2)], { oben: .26 });
        const liste = el('div', { class: 'liste', style: { width: '100%' } });
        feld.appendChild(liste);
        feld.appendChild(unten);

        WEGE.forEach(w => {
          const k = el('button', { class: 'regelkarte' },
            el('span', { class: 'ja', text: w.gut ? '🦺' : '🚶' }),
            el('span', { text: w.text }));
          k.addEventListener('click', () => {
            $$('.regelkarte', liste).forEach(x => x.classList.add('aus'));
            k.classList.remove('aus');
            k.classList.add(w.gut ? 'gut' : 'schlecht');
            Audio3.klick();
            laufen(w, k);
          });
          liste.appendChild(k);
        });

        const laufen = (w, karte) => {
          const vonX = trupp.userData.x, y = w.y();
          const nachX = plan.mx(STR.abstand);
          const dauer = RUHIG ? .01 : 2.0;
          Bewegung.neu(dauer, (p) => setzen(trupp, lerp(vonX, nachX, p), lerp(trupp.userData.y, y, Math.min(1, p * 4)), 0), () => {
            // Ein Auto fährt durch – in der freien Spur, wie im Leben.
            const auto = stellen(bauePKW('#c9ccd1'), plan.mx(150), spurUnten, 0, plan.symbolSkala);
            Bewegung.neu(RUHIG ? .01 : 1.6, (p) => setzen(auto, lerp(plan.mx(150), plan.mx(-150), p), spurUnten, 0),
              () => { auto.remove(); urteil(w, karte); }, false);
          }, false);
        };

        const urteil = (w, karte) => {
          if (w.gut) {
            Audio3.richtig();
            abzeichen.vorsichtig = true;
            unten.hinweis('Sicher angekommen.', 'gut', 0);
            feld.appendChild(UI.feedback(true, 'Auf dem Bankett',
              'Der Seitenstreifen ist der Weg. Wo es eine Leitplanke gibt, läuft man dahinter — '
              + 'auch beim Wiedereinsammeln, nicht nur beim Aufbauen.',
              'Sicherungs- und Absperrmaßnahmen sind nur mit äußerster Vorsicht unter Beachtung '
              + 'des fließenden Verkehrs durchzuführen.'));
          } else {
            fehler++;
            Audio3.falsch();
            karte.classList.add('wackeln');
            setzen(trupp, trupp.userData.x, bankettOben, 0);
            unten.hinweis('Das war knapp.', 'schlecht', 0);
            feld.appendChild(UI.feedback(false, 'Nicht auf die Fahrbahn',
              w.id === 'mitte'
                ? 'Gesehen zu werden ist nicht dasselbe wie sicher zu sein. Auf der Mittellinie steht '
                  + 'man zwischen zwei Verkehrsströmen und kann nach keiner Seite ausweichen.'
                : 'Auch am Rand der Fahrbahn steht man auf der Fahrbahn. Ein Lkw braucht mehr Platz, '
                  + 'als er aussieht, und ein Außenspiegel ist auf Kopfhöhe.'));
          }
          feld.appendChild(el('div', { class: 'knopfreihe' },
            el('button', { class: 'btn gross', onclick: () => { Audio3.klick(); phaseKegel(); } }, 'Weiter →')));
        };
      });
    };

    /* --- Runde 4: die Verjüngung -------------------------------------------
       Für diese Runde wird die Bühne neu gebaut: eine Nahaufnahme, in der
       längs und quer derselbe Maßstab gilt. Auf dem Übersichtsplan wäre eine
       Verjüngung von zwanzig Metern ein Strich – dort ist der Maßstab
       gebrochen, und genau dieser Bereich ist der gestauchte.

       Die Reihenfolge wird gefragt und nicht getippt. Vier Kegelstellen auf
       zwanzig Metern liegen auf einem Handy so eng, dass vier Knöpfe
       übereinanderlägen – man würde die Reihenfolge dann nicht wissen,
       sondern treffen müssen.                                              */
    const phaseKegel = () => {
      Stage.leeren();
      const nah = baueStrecke({
        art: 'gegenverkehr', von: -14, bis: 46,
        nah: 999, nahProM: 12, leitpfosten: false, band: false,
      });
      const nahSpur = nah.spurMitte(0);
      stellen(bauePKW('#2f6fd0', true), nah.mx(-6), nahSpur, 5, nah.symbolSkala);
      stellen(baueLF({ name: '19/43' }), nah.mx(5), nahSpur, -9, nah.symbolSkala);
      const laeufer = stellen(baueFigur({ trupp: 'wasser', kennung: 'WTr' }), nah.mx(12), nah.bankettMitte(), 0);
      planZeigen(nah, 1.02);

      // Von der Mittellinie am Fahrzeug bis an den Fahrbahnrand draußen:
      // Der Kegel ganz außen steht am Rand, der innerste an der Mittellinie.
      // So wird der Verkehr hinübergezogen und nicht gestoppt.
      const punkte = verjuengungPunkte(nah, 16, 40, nahSpur + 24, nahSpur - 26, 4);
      punkte.forEach((pt, i) => {
        Stage.hinzu(`<g transform="translate(${zahl2(nah.mx(pt.m))},${zahl2(pt.y)})">
          <circle r="15" fill="none" stroke="var(--txt3)" stroke-width="2.5" stroke-dasharray="5 5"/>
          <text class="t-plan" x="0" y="-24" text-anchor="middle" font-size="24"
            fill="var(--txt2)">${i + 1}</text></g>`);
      });

      UI.zeige('l3-kegel', (s) => {
        s.appendChild(auftrag('Die Spur verengen',
          'Vier Leitkegel ziehen den Verkehr an der Einsatzstelle vorbei. Stelle 1 liegt am '
          + 'Fahrzeug, Stelle 4 draußen — dort, wo der Verkehr herkommt.'));
        const feld = bedienfeld(s, [kopf(3)], { oben: .26 });
        feld.appendChild(frageBauen({
          frage: 'In welcher Reihenfolge stellst du sie auf?',
          antworten: [
            'Von innen nach außen: 1, 2, 3, 4 — dem Verkehr entgegen',
            'Von außen nach innen: 4, 3, 2, 1 — mit dem Verkehr',
            'Egal, Hauptsache am Ende stehen alle vier',
            'Alle gleichzeitig: jeder der beiden nimmt zwei',
          ],
          richtig: 0,
          erklaerung: 'Wer von innen nach außen aufbaut, geht dem Verkehr entgegen und sieht ihn '
            + 'kommen. Und hinter ihm steht mit jedem Schritt mehr Absperrung — von außen nach '
            + 'innen wäre es genau umgekehrt: Man hätte den Verkehr im Rücken und vor sich nichts.',
          zitat: 'An Einsatzstellen auf Autobahnen und Kraftfahrstraßen mit getrennten '
            + 'Richtungsfahrbahnen erfolgt die Absicherung entgegen der Fahrtrichtung des '
            + 'fließenden Verkehrs.',
          danach: (gut) => {
            if (gut) abzeichen.vonInnen = true; else fehler++;
            stellenLassen();
          },
        }));

        /* Die Kegel werden gesetzt – immer in der richtigen Reihenfolge, auch
           nach einer falschen Antwort. Das Bild am Ende soll stimmen. */
        const stellenLassen = () => {
          let i = 0;
          const weiter = () => {
            if (i >= punkte.length) {
              Audio3.richtig();
              return feld.appendChild(el('div', { class: 'knopfreihe' },
                el('button', { class: 'btn gross', onclick: () => { Audio3.klick(); auswerten(); } }, 'Fertig →')));
            }
            const pt = punkte[i++];
            const zielX = nah.mx(pt.m), vonX = laeufer.userData.x, vonY = laeufer.userData.y;
            const gehen = (p) => setzen(laeufer, lerp(vonX, zielX, p), lerp(vonY, pt.y - 34, p), 0);
            if (RUHIG) { gehen(1); stellen(baueLeitkegel(), zielX, pt.y, 0); Audio3.treffer(); return weiter(); }
            Bewegung.neu(.75, gehen, () => {
              stellen(baueLeitkegel(), zielX, pt.y, 0);
              Audio3.treffer();
              weiter();
            }, false);
          };
          weiter();
        };
      });
    };

    const auswerten = () => {
      const guete = clamp(1 - fehler * .18, 0, 1);
      const gegeben = Object.keys(abzeichen).filter(k => abzeichen[k]);
      api.fertig({
        titel: 'Innerorts: 100 Meter, beide Richtungen, Bankett statt Fahrbahn.',
        guete, xp: 160, abzeichen: gegeben,
        zeilen: [
          el('span', { html: '<b>100 m</b> innerhalb geschlossener Ortschaften — zwei Leitpfosten.' }),
          el('span', { html: '<b>Gegenverkehr</b> heißt: nach beiden Seiten, gleicher Abstand.' }),
          el('span', { html: '<b>Aufbauen</b> von innen nach außen, dem Verkehr entgegen.' }),
          el('span', { text: fehler === 0 ? 'Ohne einen einzigen Fehlgriff.' : `Fehlgriffe: ${fehler}` }),
        ],
      });
    };

    phaseAbstand();
  },
});
