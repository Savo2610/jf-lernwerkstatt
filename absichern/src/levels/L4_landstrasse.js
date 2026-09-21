/* ============================================================================
   Aufgabe 4 – Landstraße

   Außerhalb geschlossener Ortschaften sind es **200 Meter**. Das ist die
   halbe Aufgabe. Die andere Hälfte ist der Satz, der direkt darunter steht:

     „Bei unübersichtlicher Straßenführung (Kurven, Kuppen, sonstige
      Sichtbehinderungen) sind gegebenenfalls größere Sicherheitsabstände zu
      wählen. Das Warngerät ist so weit vor dem Sichthindernis aufzustellen,
      dass es bei Annäherung bereits auf Entfernung erkannt wird."

   Daraus folgt etwas, das Kinder regelmäßig falsch machen: Ein Warngerät
   *hinter* einer Kurve nützt nichts, auch wenn der Abstand genau stimmt. Die
   200 Meter sind ein Mindestmaß, keine Vorschrift zum Abzählen.

   Die Kurve ist eine echte Kurve: Die Straße biegt ab 150 Metern weg, und in
   ihrer Innenseite steht ein Waldstück. Genau das ist der Grund, warum man
   nicht hindurchsieht — die Sichtlinie von draußen zur Einsatzstelle verlässt
   die Fahrbahn und läuft durch den Wald. Der graue Streifen auf der Fahrbahn
   sagt, wie weit das reicht.

   Die Kuppe bekommt keine eigene Zeichnung. Eine Kuppe ist eine Steigung, und
   die sieht man in der Draufsicht grundsätzlich nicht — sie bleibt deshalb
   eine Frage.
   ========================================================================== */
LEVELS.push({
  id: 'landstrasse',
  name: 'Landstraße',
  icon: '🌾',
  farbe: 'var(--gruen)',
  kurz: '200 Meter — und was passiert, wenn dazwischen eine Kurve liegt.',

  start(api) {
    const STR = STRASSEN.landstrasse;
    /* Die Kurve liegt **weiter draußen als die 200 Meter** – das ist der ganze
       Punkt der Runde. Läge sie näher an der Einsatzstelle, stünde das
       Warngerät auf 200 Metern längst vor dem Hindernis und die Aufgabe hätte
       keine. So dagegen sitzt es dahinter, und man sieht es erst, wenn man
       schon aus der Kurve heraus ist. */
    const KURVE_M = 230;          // hier ist die Sicht endgültig weg
    const KURVE_VON = 150;        // hier fängt die Straße an, wegzubiegen
    let fehler = 0;
    const SCHRITTE = 4;
    const abzeichen = { zweihundert: false, sichthindernis: true };

    /* --- Kulisse ----------------------------------------------------------- */
    Stage.leeren();
    const plan = baueStrecke({
      art: 'gegenverkehr', von: -240, bis: 370,
      nah: 25, nahProM: 4, fernProM: .92,
      marken: [-200, 200], leitpfosten: true,
      // Nach oben weg: Dann liegt die Innenseite der Kurve über der Straße,
      // und der Wald steht dort, wo ohnehin Platz ist. Nach unten läge er auf
      // dem Maßband.
      kurve: { vonM: KURVE_VON, bisM: KURVE_M + 90, versatz: -62 },
    });
    const spurOben = plan.spurMitte(0);
    const bankettOben = plan.bankettMitte();
    const bankettUnten = plan.fbUnten + plan.bankett / 2;

    // Auf einem Plan mit Kurve wird mit `aufPlan` gestellt, nicht mit
    // `stellen` – siehe welt/plan.js.
    aufPlan(plan, bauePKW('#2f6fd0', true), -3, spurOben, 7, plan.symbolSkala);
    aufPlan(plan, baueLF({ name: '19/43' }), 11, spurOben, -8, plan.symbolSkala);
    aufPlan(plan, `<g>${baueWarndreieck()}<g transform="translate(24,2)">${baueWarnleuchte()}</g></g>`,
      -STR.abstand, bankettUnten, 0);
    planZeigen(plan, 1.02);

    const warngeraet = `<g>${baueWarndreieck()}<g transform="translate(24,2)">${baueWarnleuchte()}</g></g>`;
    const kopf = (i) => UI.schritte(SCHRITTE, i);

    /* --- Runde 1: der Abstand ---------------------------------------------- */
    const phaseAbstand = () => {
      UI.zeige('l4-abstand', (s) => {
        s.appendChild(auftrag('Landstraße, Tempo 100',
          'Dieselbe Lage, andere Straße: außerhalb der Ortschaft. Wie weit vor der Einsatzstelle?'));
        const unten = unterbau();
        const feld = bedienfeld(s, [kopf(0)], { oben: .26 });
        const geraet = aufPlan(plan, warngeraet, 0, bankettOben, 0);

        /* Der Regler endet bei 200 – also genau dort, wo die richtige Antwort
           liegt, und man zieht bis zum Anschlag. Ein größerer Höchstwert wäre
           eine willkürliche Zahl, die nichts bedeutet; 200 ist die Zahl aus
           der Vorschrift. Dass die Autobahn später trotzdem bis 1000 geht,
           ist Absicht: Dort sind es 800, und wer „immer bis zum Anschlag"
           gelernt hätte, läge falsch. */
        const regler = abstandsregler({
          max: STR.abstand, schritt: 10, wert: 0,
          onWert: (m) => setzenAuf(plan, geraet, m, bankettOben, 0),
        });
        feld.appendChild(regler);
        const knopf = el('button', { class: 'btn gross' }, 'Hier aufstellen');
        feld.appendChild(el('div', { class: 'knopfreihe' }, knopf));
        feld.appendChild(unten);

        knopf.addEventListener('click', () => {
          const m = regler.wert();
          const gut = m === STR.abstand;
          knopf.remove();
          regler.sperren(true);
          setzenAuf(plan, geraet, STR.abstand, bankettOben, 0);
          if (gut) {
            Audio3.richtig();
            abzeichen.zweihundert = true;
            feld.insertBefore(UI.feedback(true, '200 Meter — richtig.',
              'Vier Leitpfosten. Außerorts wird schneller gefahren, und ein Bremsweg wächst nicht '
              + 'gleichmäßig mit der Geschwindigkeit, sondern im Quadrat.',
              'Der Beginn der Absicherung auf Straßen außerhalb geschlossener Ortschaften hat '
              + 'ungefähr 200 Meter vor der Einsatzstelle zu erfolgen.'), unten);
          } else {
            fehler++;
            Audio3.falsch();
            feld.insertBefore(UI.feedback(false, `${m} Meter`,
              (m === 100 ? 'Das sind die 100 Meter von innerorts. ' : '')
              + 'Außerhalb geschlossener Ortschaften sind es 200 Meter — vier Leitpfosten.',
              'Der Beginn der Absicherung auf Straßen außerhalb geschlossener Ortschaften hat '
              + 'ungefähr 200 Meter vor der Einsatzstelle zu erfolgen.'), unten);
          }
          unten.hinweis(gut ? '200 Meter stehen.' : 'Das Warngerät steht jetzt auf 200 Metern.',
            gut ? 'gut' : 'schlecht', 0);
          feld.appendChild(el('div', { class: 'knopfreihe' },
            el('button', { class: 'btn gross', onclick: () => { Audio3.klick(); phaseKurve(); } }, 'Weiter →')));
        });
      });
    };

    /* --- Runde 2: die Kurve ------------------------------------------------- */
    const phaseKurve = () => {
      baueWaldstueck(plan, KURVE_VON + 20, KURVE_M + 40);
      /* Was hinter der Kurve liegt, sieht ein Ankommender nicht. Der graue
         Streifen sagt das, bevor jemand falsch tippt – die Aufgabe ist nicht,
         die Kurve zu entdecken, sondern daraus zu folgern. Er liegt als
         Fläche auf der Fahrbahn und biegt sich deshalb mit ihr (`flaeche`
         statt `rect`). */
      /* Was hinter der Kurve liegt, sieht ein Ankommender nicht. Der Streifen
         sagt das, bevor jemand falsch tippt — die Aufgabe ist nicht, die
         Kurve zu entdecken, sondern daraus zu folgern.

         Aufgehellt statt abgedunkelt: Auf dunklem Asphalt verschwindet eine
         dunkle Schicht, und genau dort muss man sie sehen. Die Fläche biegt
         sich mit der Straße (`flaeche` statt `rect`), und an ihrem Ende steht
         eine Linie quer über die Fahrbahn — das ist die Stelle, ab der die
         Sicht weg ist, und die soll man benennen können.

         Eine eingezeichnete Sichtlinie wäre hier eine Lüge: Bei diesem
         Maßstab verlässt sie die Fahrbahn nur um Zentimeter und liefe
         scheinbar parallel zur Straße. Dass die Sicht trotzdem weg ist, liegt
         am Wald unmittelbar am Fahrbahnrand — nicht an der Krümmung allein. */
      const grenzeOben = plan.yAuf(KURVE_M, plan.randOben + 22);
      const grenzeUnten = plan.yAuf(KURVE_M, plan.randUnten);
      const schatten = Stage.hinzu(`<g>
        <polygon points="${plan.flaeche(0, KURVE_M, plan.randOben + 22, plan.randUnten)}"
          fill="var(--weiss)" opacity=".42"/>
        <line x1="${zahl2(plan.mx(KURVE_M))}" y1="${zahl2(grenzeOben)}"
              x2="${zahl2(plan.mx(KURVE_M))}" y2="${zahl2(grenzeUnten)}"
          stroke="var(--rot)" stroke-width="3" stroke-dasharray="10 8"/>
        <text class="t-plan" x="${(plan.mx(0) + plan.mx(KURVE_M)) / 2}" y="${plan.randUnten + 26}"
          text-anchor="middle" font-size="24" fill="var(--txt2)">hinter der Kurve – von weitem nicht zu sehen</text></g>`);

      const WAHL = [
        { m: 300, gut: true, text: 'Bei 300 m — vor dem Waldstück' },
        { m: 200, gut: false, text: 'Bei 200 m, wie die Vorschrift sagt' },
        { m: 120, gut: false, text: 'Bei 120 m, näher an die Einsatzstelle' },
      ];

      UI.zeige('l4-kurve', (s) => {
        s.appendChild(auftrag('Ein Waldstück nimmt die Sicht',
          'Ab 150 Metern biegt die Straße ab. Euer Warngerät auf 200 Metern liegt dahinter.'));
        const unten = unterbau();
        const feld = bedienfeld(s, [kopf(1)], { oben: .26 });
        const liste = el('div', { class: 'liste', style: { width: '100%' } });
        feld.appendChild(liste);
        feld.appendChild(unten);

        WAHL.forEach(w => {
          const k = el('button', { class: 'regelkarte' },
            el('span', { class: 'ja', text: '⚠️' }), el('span', { text: w.text }));
          k.addEventListener('click', () => {
            $$('.regelkarte', liste).forEach(x => x.classList.add('aus'));
            k.classList.remove('aus');
            k.classList.add(w.gut ? 'gut' : 'schlecht');
            const g = aufPlan(plan, warngeraet, w.m, bankettOben, 0);
            if (w.gut) {
              Audio3.richtig();
              unten.hinweis('Von weitem zu sehen.', 'gut', 0);
              feld.appendChild(UI.feedback(true, 'Vor das Hindernis',
                'Die 200 Meter sind ein Mindestmaß, kein Maßband. Wo die Sicht endet, endet die '
                + 'Wirkung — also gehört das Warngerät so weit davor, dass man es bei Annäherung '
                + 'schon von Weitem erkennt.', STR.zitat));
            } else {
              fehler++; abzeichen.sichthindernis = false;
              Audio3.falsch();
              g.firstChild.setAttribute('opacity', '.45');
              unten.hinweis('Da sieht es niemand.', 'schlecht', 0);
              feld.appendChild(UI.feedback(false, 'Hinter der Kurve',
                w.m === 200
                  ? 'Der Abstand stimmt, die Wirkung nicht. Wer aus der Kurve kommt, hat das '
                    + 'Warngerät erst im Blick, wenn er schon fast dasteht. Bei Sichtbehinderungen '
                    + 'wird der Abstand größer, nicht genauer.'
                  : 'Noch näher heran macht es schlimmer: Das Warngerät liegt dann erst recht im '
                    + 'toten Winkel der Kurve. Bei Sichtbehinderungen geht es nach außen, nicht '
                    + 'nach innen.', STR.zitat));
            }
            feld.appendChild(el('div', { class: 'knopfreihe' },
              el('button', { class: 'btn gross', onclick: () => { Audio3.klick(); schatten.remove(); phaseKuppe(); } }, 'Weiter →')));
          });
          liste.appendChild(k);
        });
      });
    };

    /* --- Runde 3: die Kuppe -------------------------------------------------- */
    const phaseKuppe = () => {
      UI.zeige('l4-kuppe', (s) => {
        s.appendChild(auftrag('Und eine Kuppe?',
          'Dieselbe Landstraße, statt der Kurve eine Kuppe. Gilt dasselbe?'));
        const feld = bedienfeld(s, [kopf(2)], { oben: .26 });
        feld.appendChild(frageBauen({
          frage: 'Was macht eine Kuppe mit der Absicherung?',
          antworten: [
            'Dasselbe wie eine Kurve: das Warngerät gehört davor',
            'Nichts — über eine Kuppe sieht man weiter als um eine Kurve',
            'Die Absicherung gehört genau auf die Kuppe, dort steht sie am höchsten',
            'Bei einer Kuppe reichen 100 Meter, weil dort langsamer gefahren wird',
          ],
          richtig: 0,
          erklaerung: 'Kurve, Kuppe, Nebel, eine Lärmschutzwand — die Vorschrift zählt sie in einem '
            + 'Atemzug auf: „Kurven, Kuppen, sonstige Sichtbehinderungen". Wer über eine Kuppe '
            + 'kommt, sieht die Straße dahinter erst, wenn er oben ist.',
          zitat: 'Das Warngerät ist so weit vor dem Sichthindernis aufzustellen, dass es bei '
            + 'Annäherung bereits auf Entfernung erkannt wird.',
          danach: (gut) => {
            if (!gut) { fehler++; abzeichen.sichthindernis = false; }
            phasePosten();
          },
        }));
      });
    };

    /* --- Runde 4: der Sicherungsposten --------------------------------------- */
    const phasePosten = () => {
      UI.zeige('l4-posten', (s) => {
        s.appendChild(auftrag('Und wenn das immer noch nicht reicht?',
          'Manche Stellen bekommt man mit Gerät allein nicht sicher.'));
        const feld = bedienfeld(s, [kopf(3)], { oben: .26 });
        feld.appendChild(frageBauen({
          frage: 'Wann kommt ein Sicherungsposten dazu — und was hat er dabei?',
          antworten: [
            'Wenn das Hindernis sonst nicht ausreichend kenntlich zu machen ist — mit Warnflagge oder Winkerkelle',
            'Immer, sobald mehr als vier Kegel stehen — mit einem Warndreieck',
            'Nur nachts, und dann mit einer Blitzleuchte in der Hand',
            'Nur auf Autobahnen, und dort mit einem Faltsignal',
          ],
          richtig: 0,
          erklaerung: 'Er steht zusätzlich zum Warngerät, nicht statt dessen — und er steht dort, '
            + 'wo er selbst sicher ist und den Verkehr sehen kann.',
          zitat: 'Sicherungsposten müssen zusätzlich zum Warngerät eingesetzt werden, wenn '
            + 'Hindernisse im Verkehrsbereich sonst nicht ausreichend kenntlich gemacht werden können.',
          danach: (gut) => {
            if (!gut) fehler++;
            aufPlan(plan, `<g>${baueFigur({ trupp: 'wasser', kennung: 'Posten' })}
              <g transform="translate(18,-16)">
                <rect x="-2" y="-16" width="3" height="22" fill="var(--metall)"/>
                <rect x="0" y="-18" width="16" height="12" rx="2" fill="var(--rot)"/></g></g>`,
              330, bankettOben, 0);
            auswerten();
          },
        }));
      });
    };

    const auswerten = () => {
      const guete = clamp(1 - fehler * .2, 0, 1);
      const gegeben = [];
      if (abzeichen.zweihundert) gegeben.push('zweihundert');
      if (abzeichen.sichthindernis) gegeben.push('sichthindernis');
      api.fertig({
        titel: 'Außerorts: 200 Meter — und mehr, sobald etwas die Sicht nimmt.',
        guete, xp: 170, abzeichen: gegeben,
        zeilen: [
          el('span', { html: '<b>200 m</b> außerhalb geschlossener Ortschaften — vier Leitpfosten.' }),
          el('span', { html: '<b>Kurve, Kuppe, Sichtbehinderung:</b> Warngerät davor, Abstand größer.' }),
          el('span', { html: '<b>Sicherungsposten</b> kommt dazu, wenn Gerät allein nicht reicht.' }),
          el('span', { text: fehler === 0 ? 'Ohne einen einzigen Fehlgriff.' : `Fehlgriffe: ${fehler}` }),
        ],
      });
    };

    phaseAbstand();
  },
});
