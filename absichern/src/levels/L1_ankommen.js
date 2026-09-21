/* ============================================================================
   Aufgabe 1 – Wir kommen an

   Bevor der erste Kegel steht, sind schon drei Entscheidungen gefallen, und
   alle drei stehen in der Lernunterlage der Landesfeuerwehrschule, Abschnitt
   2.4 „Fließender Straßenverkehr":

   1. **Wohin stellt sich das Fahrzeug?** Zwischen den fließenden Verkehr und
      die Einsatzstelle. Es ist der größte Gegenstand, den die Feuerwehr
      dabeihat, und damit das beste Warnzeichen — und im Zweifel die Wand, die
      etwas abbekommt statt der Mannschaft.
   2. **Was bleibt an?** Blaues Blinklicht, Warnblinkanlage, Fahrlicht. Das
      Martinshorn nicht: Es ist ein Wegerecht für die Fahrt, kein Warngerät
      für die Einsatzstelle.
   3. **Wo steigt man aus und wo tritt man an?** Auf der der Fahrbahn
      abgewandten Seite und vor dem Fahrzeug. Beides sind Sätze, die man
      auswendig lernen kann — hier sieht man, warum sie so lauten.

   Zum Schluss der Satz, an dem der ganze Rest hängt: Auch wenn Verletzte zu
   sehen sind, wird vorher oder gleichzeitig abgesichert. Nicht danach.
   ========================================================================== */
LEVELS.push({
  id: 'ankommen',
  name: 'Wir kommen an',
  icon: '🚒',
  farbe: 'var(--rot)',
  kurz: 'Anfahrt, Fahrzeugstellung, absitzen, antreten — bevor überhaupt ein Kegel steht.',

  start(api) {
    let fehler = 0;
    const SCHRITTE = 4;

    /* --- Kulisse: Nahaufnahme, längs und quer derselbe Maßstab ------------ */
    Stage.leeren();
    const plan = baueStrecke({
      art: 'gegenverkehr', von: -26, bis: 30,
      nah: 999, nahProM: 13, leitpfosten: false, band: false,
    });
    const spurOben = plan.spurMitte(0);

    // Die Unfallstelle: ein Wagen quer, einer dahinter. Sie liegt in der
    // oberen Spur — dort, wo der Verkehr von rechts nach links fließt.
    stellen(bauePKW('#2f6fd0', true), plan.mx(-2), spurOben, 4, plan.symbolSkala);
    stellen(bauePKW('#3f9a4a', true), plan.mx(3.5), spurOben + 14, 26, plan.symbolSkala);

    // Das Fahrzeug wartet außerhalb des Bildes. Es fährt gleich herein.
    const lf = stellen(baueLF({ name: '19/43' }), plan.mx(64), spurOben, 0, plan.symbolSkala);

    const HALTE = {
      vor:      { m: 15, y: spurOben, dreh: -9 },
      dahinter: { m: -16, y: spurOben, dreh: 0 },
      bankett:  { m: 15, y: plan.bankettMitte(), dreh: 0 },
    };

    // Einmal einstellen reicht: Stage.groesseAnpassen rechnet den Ausschnitt
    // bei jeder Fenstergröße neu aus demselben Weltfenster.
    planZeigen(plan, 1.02);

    const kopf = (i) => el('div', { style: { display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center', width: '100%' } },
      UI.schritte(SCHRITTE, i), null);

    /* --- Runde 1: Wo hält das Fahrzeug? ----------------------------------- */
    const phaseStellung = () => {
      let entschieden = false;
      UI.zeige('l1-stellung', (s) => {
        s.appendChild(auftrag('Einsatzstelle in Sicht',
          'Das LF 19/43 fährt heran. Der Verkehr kommt von rechts. Tipp an, wo es halten soll.'));
        Marken.starten(s);

        const unten = unterbau();
        const feld = bedienfeld(s, [kopf(0), unten], { oben: .22 });

        // Die Marken heißen nach ihrer Lage und nicht „hier": Es ist eine
        // Entscheidung, keine Ratestunde – man soll wissen, was man antippt.
        const BESCHRIFTUNG = {
          vor: { kurz: 'davor', lang: 'Vor der Einsatzstelle, in der gesperrten Spur' },
          dahinter: { kurz: 'dahinter', lang: 'Hinter der Einsatzstelle' },
          bankett: { kurz: 'Bankett', lang: 'Auf dem Bankett daneben' },
        };
        const marken = {};
        for (const id in HALTE) {
          const h = HALTE[id];
          marken[id] = planMarke(plan.mx(h.m), h.y, BESCHRIFTUNG[id].kurz, {
            titel: BESCHRIFTUNG[id].lang,
            onKlick: () => waehlen(id),
          });
        }

        const waehlen = (id) => {
          if (entschieden) return;
          entschieden = true;
          Audio3.klick();
          for (const k in marken) marken[k].node.classList.add('still');
          const h = HALTE[id];
          // Erst fahren, dann urteilen. Wer eine Stelle antippt, will sehen,
          // wie es dort aussteht – nicht sofort gesagt bekommen, dass es
          // falsch war.
          fahren(h, () => urteil(id));
        };

        const fahren = (h, danach) => {
          const vonX = lf.userData.x, vonY = lf.userData.y;
          const nachX = plan.mx(h.m);
          if (RUHIG) { setzen(lf, nachX, h.y, h.dreh); return danach(); }
          Bewegung.neu(1.5, (p) => {
            setzen(lf, lerp(vonX, nachX, p), lerp(vonY, h.y, p), lerp(0, h.dreh, p));
          }, danach);
        };

        const urteil = (id) => {
          const gut = id === 'vor';
          marken[id].node.classList.add(gut ? 'gesetzt' : 'falsch');
          if (gut) {
            Audio3.richtig();
            unten.hinweis('Genau so. Das Fahrzeug steht als Schutzschild davor.', 'gut', 0);
            feld.appendChild(UI.feedback(true, 'Schutzschild',
              'Das Löschfahrzeug ist der größte Gegenstand, den ihr dabeihabt — und damit das '
              + 'erste Warnzeichen. Es steht zwischen dem fließenden Verkehr und den Leuten, die arbeiten.'));
          } else {
            fehler++;
            Audio3.falsch();
            const warum = id === 'dahinter'
              ? 'Der Verkehr kommt von rechts. Dort steht das Fahrzeug hinter der Unfallstelle — '
                + 'der erste, der zu schnell kommt, trifft die Verletzten und nicht das Blech des LF.'
              : 'Auf dem Bankett schützt es niemanden, und den Streifen brauchen die Einsatzkräfte '
                + 'zum Laufen. Ein Fahrzeug, das nicht abschirmt, steht nur im Weg.';
            unten.hinweis('Nicht ganz.', 'schlecht', 0);
            feld.appendChild(UI.feedback(false, 'Das schirmt nicht ab', warum));
            marken.vor.node.classList.add('gesetzt');
            setTimeout(() => fahren(HALTE.vor, () => {}), 700);
          }
          const w = el('button', { class: 'btn gross', onclick: () => { Audio3.klick(); phaseLichter(); } }, 'Weiter →');
          feld.appendChild(el('div', { class: 'knopfreihe' }, w));
          setTimeout(() => w.scrollIntoView({ block: 'nearest', behavior: 'smooth' }), 60);
        };

        return () => Marken.beenden();
      });
    };

    /* --- Runde 2: Was bleibt eingeschaltet? --------------------------------
       Mehrfachauswahl statt vier Einzelfragen: Das Martinshorn fällt nur
       dann auf, wenn es neben den drei richtigen steht.                    */
    const phaseLichter = () => {
      const WAHL = [
        { id: 'blau', name: 'Blaues Blinklicht', icon: '🔵', gilt: true },
        { id: 'warn', name: 'Warnblinkanlage', icon: '🔶', gilt: true },
        { id: 'fahr', name: 'Fahrlicht', icon: '💡', gilt: true },
        { id: 'horn', name: 'Martinshorn', icon: '📢', gilt: false },
      ];
      const an = {};
      UI.zeige('l1-lichter', (s) => {
        s.appendChild(auftrag('Das Fahrzeug steht',
          'Was bleibt an der Einsatzstelle eingeschaltet? Tipp alles an, was dazugehört.'));
        const unten = unterbau();
        const feld = bedienfeld(s, [kopf(1), unten], { oben: .24 });

        const leiste = el('div', { class: 'geraeteleiste' },
          WAHL.map(w => {
            const c = el('button', { class: 'geraetchip' },
              el('span', { class: 'ic', text: w.icon }), el('span', { class: 'nm', text: w.name }));
            c.addEventListener('click', () => {
              if (c.classList.contains('aus')) return;
              an[w.id] = !an[w.id];
              c.classList.toggle('gewaehlt', !!an[w.id]);
              Audio3.klick();
            });
            w.node = c;
            return c;
          }));
        feld.insertBefore(leiste, unten);

        const pruefen = el('button', { class: 'btn gross' }, 'Passt so →');
        pruefen.addEventListener('click', () => {
          const falschDabei = WAHL.filter(w => !!an[w.id] !== w.gilt);
          WAHL.forEach(w => { w.node.classList.add('aus'); w.node.classList.toggle('gewaehlt', w.gilt); });
          pruefen.remove();
          if (falschDabei.length) {
            fehler++;
            Audio3.falsch();
            feld.appendChild(UI.feedback(false, 'Fast.',
              'Blaues Blinklicht, Warnblinkanlage und Fahrlicht bleiben an — so steht es in der '
              + 'Lernunterlage. Das Martinshorn gehört zur Fahrt, nicht zur Einsatzstelle: '
              + 'Es fordert freie Bahn, und die braucht ein Fahrzeug nicht mehr, das steht.'));
          } else {
            Audio3.richtig();
            feld.appendChild(UI.feedback(true, 'Alles richtig gegriffen.',
              'Drei Lichter, kein Ton. Das Martinshorn ist ein Wegerecht für die Fahrt, kein Warngerät.'));
          }
          feld.appendChild(el('div', { class: 'knopfreihe' },
            el('button', { class: 'btn gross', onclick: () => { Audio3.klick(); phaseAbsitzen(); } }, 'Weiter →')));
        });
        feld.insertBefore(pruefen, unten);
      });
    };

    /* --- Runde 3: absitzen und antreten ------------------------------------ */
    const phaseAbsitzen = () => {
      const h = HALTE.vor;
      setzen(lf, plan.mx(h.m), h.y, h.dreh);
      let stufe = 0;             // 0 = Seite wählen, 1 = antreten
      let sauber = true;
      const figuren = [];

      UI.zeige('l1-absitzen', (s) => {
        s.appendChild(auftrag('Absitzen',
          'Auf welcher Seite steigt die Mannschaft aus? Tipp die Seite an.'));
        Marken.starten(s);
        const unten = unterbau();
        const feld = bedienfeld(s, [kopf(2), unten], { oben: .22 });

        const mLF = plan.mx(h.m);
        const seiten = {
          bankett: planMarke(mLF, h.y - 46, 'diese Seite', { titel: 'Zum Bankett hin', onKlick: () => seite('bankett') }),
          fahrbahn: planMarke(mLF, h.y + 46, 'diese Seite', { titel: 'Zur Fahrbahn hin', onKlick: () => seite('fahrbahn') }),
        };

        /* Wer hier steht, steht in der Farbe seiner Funktion: blau der
           Wassertrupp, Stahl der Maschinist – dieselbe Zuordnung wie in
           „Einsatzbereit" und in Löschlos (TRUPPFARBEN). */
        const MANNSCHAFT = [
          { kennung: 'Ma', trupp: 'ma' },
          { kennung: 'WTrF', trupp: 'wasser' },
          { kennung: 'WTrM', trupp: 'wasser' },
        ];
        /* Abstand der drei: Ein Namensschild ist gut vierzig Einheiten breit,
           und zwei davon dürfen sich nicht überlappen – sonst liest man
           „WTrFWTrM". */
        const ABSTAND_FIGUR = 56;
        const ABSITZ_Y = h.y - 78;

        const figurSetzen = (x, y, mann) => {
          const f = stellen(baueFigur(mann), x, y, 0);
          figuren.push(f);
          return f;
        };

        const seite = (welche) => {
          if (stufe !== 0) return;
          stufe = 1;
          Audio3.klick();
          for (const k in seiten) seiten[k].node.classList.add('still');
          const gut = welche === 'bankett';
          seiten[welche].node.classList.add(gut ? 'gesetzt' : 'falsch');
          if (!gut) { seiten.bankett.node.classList.add('gesetzt'); fehler++; sauber = false; }
          /* Weit genug vom Fahrzeug weg, dass die Namensschilder nicht auf
             dem Aufbau liegen: Ein Schild hängt 25 Einheiten unter seiner
             Figur, und bei -40 landet es mitten auf dem Löschfahrzeug. */
          MANNSCHAFT.forEach((mann, i) => figurSetzen(mLF + (i - 1) * ABSTAND_FIGUR, ABSITZ_Y, mann));
          gut ? Audio3.richtig() : Audio3.falsch();
          unten.hinweis(gut
            ? 'Richtig — der Fahrbahn abgewandt.'
            : 'Zur Fahrbahn hin steigt niemand aus. Dort fährt der Verkehr.', gut ? 'gut' : 'schlecht', 0);
          setTimeout(antretenFragen, 600);
        };

        const antretenFragen = () => {
          s.querySelector('.auftrag b').textContent = 'Antreten';
          s.querySelector('.auftrag span').textContent = 'Und wo tritt der Trupp an? Tipp die Stelle an.';
          /* Die beiden Seitenmarken verschwinden: Vier Marken auf zwei
             Fahrzeuglängen liegen am Handy übereinander, und die Antwort
             steht ohnehin schon unten in der Rückmeldung. */
          for (const k in seiten) seiten[k].node.style.display = 'none';
          /* Kurze Beschriftung, und unterhalb der Fahrbahn: „vor dem Fahrzeug"
             und „hinter dem Fahrzeug" nebeneinander sind breiter als der
             Abstand, den sie bezeichnen — sie überlappten sich gegenseitig.
             Der lange Text steht als `titel` im Tooltip. */
          const markeY = plan.fbUnten + plan.bankett / 2;
          const ziele = {
            vorn: planMarke(mLF - 105, markeY, 'vorn',
              { titel: 'Vor dem Fahrzeug', onKlick: () => antreten('vorn') }),
            hinten: planMarke(mLF + 105, markeY, 'hinten',
              { titel: 'Hinter dem Fahrzeug', onKlick: () => antreten('hinten') }),
          };

          const antreten = (wo) => {
            for (const k in ziele) ziele[k].node.classList.add('still');
            const gut = wo === 'vorn';
            ziele[wo].node.classList.add(gut ? 'gesetzt' : 'falsch');
            if (!gut) { ziele.vorn.node.classList.add('gesetzt'); fehler++; sauber = false; }
            gut ? Audio3.richtig() : Audio3.falsch();
            // Sie laufen immer nach vorn – auch nach einem Fehlgriff. Das Bild
            // soll am Ende die richtige Lage zeigen, nicht die geratene.
            const zielX = mLF - 105;
            figuren.forEach((f, i) => {
              const vonX = f.userData.x, vonY = f.userData.y;
              const nachX = zielX + (i - 1) * ABSTAND_FIGUR, nachY = ABSITZ_Y;
              if (RUHIG) return setzen(f, nachX, nachY, 0);
              Bewegung.neu(1.0 + i * .12, (p) => setzen(f, lerp(vonX, nachX, p), lerp(vonY, nachY, p), 0));
            });
            feld.appendChild(UI.feedback(gut, gut ? 'So steht es in der Unterlage.' : 'Andersherum.',
              'Vor dem Fahrzeug ist der Platz, den das Fahrzeug abdeckt. Hinter ihm steht man genau '
              + 'da, wo der Verkehr ankommt — und der sieht euch als Letztes.',
              'Die Mannschaft verlässt das Einsatzfahrzeug nur auf der der Fahrbahn abgewendeten '
              + 'Fahrzeugseite und tritt vor dem Einsatzfahrzeug an.'));
            feld.appendChild(el('div', { class: 'knopfreihe' },
              el('button', { class: 'btn gross', onclick: () => { Audio3.klick(); if (sauber) merkeAbzeichen(); phaseReihenfolge(); } }, 'Weiter →')));
          };
        };

        return () => Marken.beenden();
      });
    };

    let abzeichenSeite = false;
    const merkeAbzeichen = () => { abzeichenSeite = true; };

    /* --- Runde 4: absichern oder versorgen? -------------------------------- */
    const phaseReihenfolge = () => {
      UI.zeige('l1-reihenfolge', (s) => {
        s.appendChild(auftrag('Und jetzt?',
          'Im grünen Wagen sitzt jemand, der Hilfe braucht. Was passiert zuerst?'));
        const feld = bedienfeld(s, [kopf(3)], { oben: .24 });
        feld.appendChild(frageBauen({
          frage: 'Absichern oder versorgen?',
          antworten: [
            'Absichern kommt vor der Versorgung oder läuft gleichzeitig',
            'Erst die Verletzten versorgen, dann absichern',
            'Absichern erst, wenn die Polizei da ist',
            'Bei Verletzten wird gar nicht abgesichert',
          ],
          richtig: 0,
          erklaerung: 'Die Lernunterlage wird an der Stelle sehr deutlich: Auch wenn bereits Verletzte '
            + 'zu sehen sind, wird vorher oder parallel abgesichert. Wer in eine ungesicherte Stelle '
            + 'hineinläuft, liegt gleich mit daneben — dann sind es zwei Patienten statt einem.',
          danach: (gut) => {
            if (!gut) fehler++;
            auswerten();
          },
        }));
      });
    };

    /* --- Auswertung -------------------------------------------------------- */
    const auswerten = () => {
      const guete = clamp(1 - fehler * .22, 0, 1);
      const abzeichen = [];
      if (fehler === 0) abzeichen.push('schutzschild');
      if (abzeichenSeite) abzeichen.push('abgewandt');
      api.fertig({
        titel: 'Ankommen, hinstellen, aussteigen — und erst dann alles andere.',
        guete, xp: 120, abzeichen,
        zeilen: [
          el('span', { html: '<b>Schutzschild:</b> Das Fahrzeug steht zwischen Verkehr und Einsatzstelle.' }),
          el('span', { html: '<b>Absitzen:</b> auf der der Fahrbahn abgewandten Seite, antreten vor dem Fahrzeug.' }),
          el('span', { html: '<b>Reihenfolge:</b> absichern vor oder gleichzeitig mit der Versorgung.' }),
          el('span', { text: fehler === 0 ? 'Ohne einen einzigen Fehlgriff.' : `Fehlgriffe: ${fehler}` }),
        ],
      });
    };

    phaseStellung();
  },
});
