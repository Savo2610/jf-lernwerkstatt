/* ============================================================================
   Beamer-Modus – für den Gruppenabend

   Einer bedient, alle raten mit. Große Schrift, Teamwertung, Moderationsknöpfe.
   Gebaut wie drüben bei „Einsatzbereit", mit einem Unterschied: Das Herzstück
   ist hier die Feuerwand – sechzehn brennende Felder, und jedes geht erst
   aus, wenn jemand die Frage dahinter beantwortet hat.

   Der Moderator tippt an, was gerufen wurde. Er muss nichts abhaken und
   nichts zusammenrechnen; die Punkte laufen mit, und korrigieren kann er
   sie hinterher immer noch.
   ========================================================================== */
const Beamer = {
  /* Zwei Mannschaften, fest. Mehr braucht ein Gruppenabend nicht – und mit
     zweien geht das Nachziehen bei falscher Antwort sauber auf. */
  namen: ['Funkenflug', 'Wasserwerfer'],

  /* ---------- Teams einrichten ------------------------------------------ */
  teamsEinrichten() {
    UI.sperreSetzen('__menue');
    UI.hudVerstecken();
    App.menueKulisse();
    const farben = ['#ff4d3d', '#35c8ff'];
    // Namen aus einer schon laufenden Runde übernehmen: Wer zwischendurch
    // ins Menü zurückgeht, will nicht wieder tippen.
    if (Teams.liste.length) Teams.liste.forEach((t, i) => { if (i < 2) Beamer.namen[i] = t.name; });

    UI.zeige('beamer-teams', (s) => {
      const felder = el('div', { style: { display: 'grid', gap: '10px', width: 'min(560px,100%)' } });
      for (let i = 0; i < 2; i++) {
        const inp = el('input', {
          type: 'text', value: Beamer.namen[i], maxlength: '18',
          style: { padding: '.6em 1em', borderRadius: '999px', border: '2px solid ' + farben[i],
                   background: 'var(--panel)', color: 'var(--txt)', fontWeight: '800',
                   textAlign: 'center', width: '100%', font: 'inherit', fontSize: '1em' },
        });
        inp.addEventListener('input', () => Beamer.namen[i] = inp.value);
        felder.appendChild(el('div', { style: { display: 'flex', alignItems: 'center', gap: '10px' } },
          el('div', { style: { width: '18px', height: '18px', borderRadius: '50%', background: farben[i], flex: '0 0 auto' } }),
          inp));
      }

      s.appendChild(el('div', { class: 'mitte', style: { justifyContent: 'flex-start', paddingTop: '10px', overflowY: 'auto', width: '100%' } },
        el('div', { class: 'dienstvorschrift', text: 'Gruppenabend' }),
        el('h2', { text: 'Wer tritt gegeneinander an?' }),
        el('p', { class: 'hinweis', text: 'Zwei Mannschaften. Die Namen könnt ihr überschreiben.' }),
        felder,
        el('div', { class: 'btn-reihe' },
          el('button', { class: 'btn geist', onclick: () => { Audio3.klick(); App.soloStart(); } }, '← Alleine üben'),
          el('button', {
            class: 'btn gross',
            onclick: () => {
              Teams.anlegen(Beamer.namen.slice(0, 2).map((n, i) => (n || '').trim() || ('Team ' + (i + 1))));
              Audio3.klick();
              Beamer.menue();
            },
          }, 'Los geht’s →'))));
      s.classList.add('scrollbar');
    }, { scroll: true });
  },

  /* ---------- Punktetafel ------------------------------------------------ */
  tafel(hervor) {
    return el('div', { class: 'teamleiste' },
      Teams.liste.map((t, i) => el('div', {
        class: 'teamkarte' + (hervor === i ? ' dran' : ''),
        style: { borderColor: hervor === i ? t.farbe : 'var(--linie)' },
      },
        el('div', { class: 'nm', style: { color: t.farbe }, text: t.name }),
        el('div', { class: 'pt', text: String(t.punkte) }))));
  },

  /* ---------- Hauptmenü --------------------------------------------------- */
  menue() {
    UI.sperreSetzen('__menue');
    App.menueKulisse();
    UI.hudZeigen('Gruppenabend', () => App.soloStart());
    UI.zeige('beamer-menue', (s) => {
      const karte = (icon, titel, text, farbe, fn) => el('button', {
        class: 'moduskarte', style: { '--f': farbe },
        onclick: () => { Audio3.klick(); fn(); },
      },
        el('span', { class: 'ic', text: icon }),
        el('b', { text: titel }),
        el('span', { text }));

      s.appendChild(el('div', { class: 'mitte', style: { justifyContent: 'flex-start', paddingTop: '8px', overflowY: 'auto', width: '100%' } },
        this.tafel(),
        el('h2', { text: 'Was machen wir?' }),
        el('div', { class: 'moduswahl', style: { maxWidth: '1000px' } },
          karte('🔥', 'Feuerwand', 'Sechzehn brennende Felder in vier Kategorien. Ihr sucht euch aus, was ihr löschen wollt – je heißer, desto mehr Punkte.', 'var(--glut)', () => Beamer.wandStart()),
          karte('⚡', 'Blitzrunde', 'Zehn Fragen am Stück, quer durch alles. Wer zuerst ruft, bekommt den Punkt.', 'var(--rot)', () => Beamer.blitzStart()),
          karte('🪑', 'Hot Seat', 'Einer kommt nach vorne und spielt eine Aufgabe am Beamer. Der Rest berät.', 'var(--blau)', () => Beamer.hotSeat()),
          karte('📊', 'Punkte & Ende', 'Punktestand ansehen, korrigieren oder eine neue Runde starten.', 'var(--gruen)', () => Beamer.punkteVerwalten()),
        )));
      s.classList.add('scrollbar');
    }, { scroll: true });
  },

  /* ---------- Feuerwand ---------------------------------------------------
     Vier Kategorien, vier Werte. Die Wand ist jeden Abend dieselbe – das ist
     Absicht: Wer die Fragen schon kennt, kann sie beantworten, und genau
     darum geht es. Ein Gruppenabend ist keine Prüfung.

     Ablauf: Das Team, das dran ist, sucht ein Feld aus. Trifft es, bekommt
     es den Wert. Trifft es daneben, darf das andere Team nachziehen und den
     vollen Wert abstauben – so hört auch das Team zu, das gerade nicht dran
     ist. Das Feld ist danach in jedem Fall gelöscht.
     -------------------------------------------------------------------- */
  wandStart() {
    this.wDran = 0;
    this.wErledigt = {};        // 'kat:wert' -> gewinnender Team-Index oder -1
    this.wandZeigen();
  },

  wandZeigen() {
    UI.sperreSetzen('__menue');
    App.menueKulisse();
    const offen = KATEGORIEN.length * 4 - Object.keys(this.wErledigt).length;
    UI.hudZeigen(`Feuerwand – noch ${offen} Felder`, () => Beamer.menue());
    UI.zeige('beamer-wand', (s) => {
      const wand = el('div', { class: 'feuerwand' });
      KATEGORIEN.forEach(k => {
        const spalte = el('div', { class: 'wandspalte' },
          el('div', { class: 'wandkopf' },
            el('span', { class: 'ic', text: k.icon }),
            el('b', { text: k.name })));
        [100, 200, 300, 400].forEach(wert => {
          const schluessel = k.id + ':' + wert;
          const gewinner = Beamer.wErledigt[schluessel];
          const frage = QUIZ.find(q => q.kat === k.id && q.wert === wert);
          if (gewinner != null) {
            // Gelöschtes Feld: Es bleibt stehen und trägt die Farbe des
            // Teams, das es geholt hat. Eine Lücke wäre schwerer zu lesen.
            const t = gewinner >= 0 ? Teams.liste[gewinner] : null;
            spalte.appendChild(el('div', {
              class: 'wandfeld aus', style: t ? { '--f': t.farbe } : {},
            }, el('span', { text: t ? '💧' : '—' }),
               el('small', { text: t ? t.name : 'niemand' })));
            return;
          }
          spalte.appendChild(el('button', {
            class: 'wandfeld', onclick: () => { Audio3.klick(); Beamer.wandFrage(k, wert, frage); },
          }, el('span', { class: 'ic', text: '🔥' }), el('b', { text: String(wert) })));
        });
        wand.appendChild(spalte);
      });

      s.appendChild(el('div', { class: 'mitte', style: { gap: '12px', justifyContent: 'flex-start', paddingTop: '6px', width: '100%' } },
        this.tafel(this.wDran),
        // als Chip und nicht als blosser Text: Die Zeile steht hier frei ueber
        // der hellen Kulisse, und am Beamer im hellen Raum verschwindet
        // gedeckte Schrift auf hellem Grund vollstaendig.
        el('div', { class: 'chip', text: `${Teams.liste[this.wDran].name} sucht ein Feld aus.` }),
        wand));
      s.classList.add('scrollbar');
    }, { scroll: true });
  },

  wandFrage(kat, wert, q) {
    const schluessel = kat.id + ':' + wert;
    this.frageZeigen(q, {
      kopf: `${kat.icon} ${kat.name} · ${wert} Punkte`,
      wert,
      dran: this.wDran,
      zurueck: () => Beamer.wandZeigen(),
      fertig: (gewinner) => {
        Beamer.wErledigt[schluessel] = gewinner == null ? -1 : gewinner;
        // Der Zug wechselt immer, egal wie es ausgegangen ist. Sonst sucht
        // ein starkes Team die ganze Wand allein leer.
        Beamer.wDran = (Beamer.wDran + 1) % Teams.liste.length;
        if (Object.keys(Beamer.wErledigt).length >= KATEGORIEN.length * 4) {
          Beamer.ende(() => Beamer.wandStart());
        } else {
          Beamer.wandZeigen();
        }
      },
    });
  },

  /* ---------- Blitzrunde ---------------------------------------------------
     Zehn Fragen quer durch alles, auch die, die auf der Wand nicht stehen.
     Hier ist niemand „dran": Wer zuerst ruft, bekommt den Punkt, und der
     Moderator tippt an, wer es war.
     -------------------------------------------------------------------- */
  blitzStart() {
    this.bFragen = shuffle(QUIZ.slice()).slice(0, 10);
    this.bIdx = 0;
    this.blitzFrage();
  },

  blitzFrage() {
    if (this.bIdx >= this.bFragen.length) return this.ende(() => Beamer.blitzStart());
    this.frageZeigen(this.bFragen[this.bIdx], {
      kopf: `Blitzrunde · Frage ${this.bIdx + 1} von ${this.bFragen.length}`,
      wert: 10,
      dran: null,
      zurueck: () => Beamer.menue(),
      fertig: () => { Beamer.bIdx++; Beamer.blitzFrage(); },
    });
  },

  /* ---------- Ein Frage-Bildschirm für beide Spielarten --------------------
     opt: { kopf, wert, dran (Team-Index oder null), zurueck(), fertig(gewinner) }
     -------------------------------------------------------------------- */
  frageZeigen(q, opt) {
    UI.sperreSetzen('__menue');
    let dran = opt.dran;
    let nachzug = false;
    let aufgeloest = false;
    let sieger = null;
    const vergeben = new Set();

    UI.hudZeigen(opt.kopf, opt.zurueck);
    UI.zeige('beamer-frage-' + Math.random().toString(36).slice(2, 7), (s) => {
      const antworten = el('div', { class: 'antworten zwei', style: { width: 'min(1100px,100%)' } },
        q.o.map((a, i) => el('button', { class: 'antwort', onclick: () => getippt(i) },
          el('span', { class: 'marker', text: 'ABCD'[i] }), el('span', { text: a }))));

      const erklaerung = el('div', { style: { width: 'min(900px,100%)' } });

      let tafelFeld = Beamer.tafel(dran);
      const tafelFrisch = () => {
        const neu = Beamer.tafel(aufgeloest ? null : dran);
        tafelFeld.replaceWith(neu); tafelFeld = neu;
      };

      /* Punkte laufen automatisch mit. Die Knöpfe darunter sind nur für den
         Fall, dass die Gruppe sich anders einigt – deshalb tauchen sie erst
         nach der Auflösung auf. */
      const punkteKnoepfe = Teams.liste.map((t, i) => {
        const b = el('button', {
          class: 'btn geist',
          style: { boxShadow: 'inset 0 0 0 2px ' + t.farbe, minWidth: '140px' },
          onclick: () => {
            if (vergeben.has(i)) {
              vergeben.delete(i); Teams.punkten(i, -opt.wert);
              b.style.background = 'transparent'; b.textContent = '+ ' + t.name;
              Audio3.zu();
            } else {
              vergeben.add(i); Teams.punkten(i, opt.wert);
              b.style.background = t.farbe + '33'; b.textContent = `✓ ${t.name}  +${opt.wert}`;
              Audio3.richtig();
            }
            tafelFrisch();
          },
        }, '+ ' + t.name);
        return b;
      });
      const punkteReihe = el('div', { class: 'btn-reihe', style: { display: 'none' } }, punkteKnoepfe);
      const punkteText = el('div', { class: 'klein', style: { display: 'none' },
        text: 'Punkte anpassen (falls ihr euch anders einigt):' });

      const weiter = el('button', {
        class: 'btn gross', style: { display: 'none' },
        onclick: () => { Audio3.klick(); opt.fertig(sieger); },
      }, 'Weiter →');

      const hinweis = el('div', { class: 'klein', text: dran == null
        ? 'Wer zuerst ruft! Tippe die genannte Antwort an.'
        : Teams.liste[dran].name + ' ist dran – tippe die genannte Antwort an.' });

      const punktenAn = (idx) => {
        if (idx == null || vergeben.has(idx)) return;
        vergeben.add(idx);
        Teams.punkten(idx, opt.wert);
        const t = Teams.liste[idx], b = punkteKnoepfe[idx];
        if (b) { b.style.background = t.farbe + '33'; b.textContent = `✓ ${t.name}  +${opt.wert}`; }
      };

      const getippt = (i) => {
        if (aufgeloest) return;
        if (dran == null) {                       // Blitzrunde: nur auflösen
          return aufloesen(i, null);
        }
        if (i === q.r) { punktenAn(dran); return aufloesen(i, dran); }

        // Danebengetippt: diese Antwort ist verbrannt, das andere Team zieht nach
        $$('.antwort', antworten)[i].classList.add('falsch');
        $$('.antwort', antworten)[i].style.pointerEvents = 'none';
        Audio3.falsch();
        if (!nachzug && Teams.liste.length > 1) {
          nachzug = true;
          dran = (dran + 1) % Teams.liste.length;
          tafelFrisch();
          hinweis.textContent = Teams.liste[dran].name + ' darf nachziehen – und die Punkte abstauben.';
          return;
        }
        aufloesen(i, null);
      };

      const aufloesen = (gewaehlt, gewinner) => {
        if (aufgeloest) return;
        aufgeloest = true;
        sieger = gewinner;
        $$('.antwort', antworten).forEach((b, i) => {
          if (i === q.r) { b.classList.remove('falsch', 'aus'); b.classList.add('richtig'); }
          else if (i === gewaehlt) b.classList.add('falsch');
          else if (!b.classList.contains('falsch')) b.classList.add('aus');
          b.style.pointerEvents = 'none';
        });
        const getroffen = gewaehlt === q.r;
        (getroffen ? Audio3.richtig() : Audio3.falsch());
        erklaerung.appendChild(el('div', { class: 'feedback ' + (getroffen ? 'gut' : 'schlecht') },
          el('b', { text: 'Richtig ist ' + 'ABCD'[q.r] + ': ' + q.o[q.r] }), el('span', { text: q.e })));
        if (gewinner != null) {
          erklaerung.appendChild(el('div', { class: 'chip', style: { marginTop: '8px' },
            text: `+${opt.wert} für ${Teams.liste[gewinner].name}` + (nachzug ? ' – abgestaubt!' : '') }));
        } else if (opt.dran != null) {
          erklaerung.appendChild(el('div', { class: 'chip', style: { marginTop: '8px' },
            text: 'Das Feld bleibt ungelöscht – diesmal keine Punkte.' }));
        }
        knopfReihe.style.display = 'none';
        punkteText.style.display = 'block';
        punkteReihe.style.display = 'flex';
        weiter.style.display = 'inline-flex';
        hinweis.textContent = opt.dran == null ? 'Wer hatte es richtig? Tippe das Team an.' : '';
        tafelFrisch();
        setTimeout(() => weiter.scrollIntoView({ block: 'nearest', behavior: 'smooth' }), 120);
      };

      const knopfReihe = el('div', { class: 'btn-reihe' },
        el('button', { class: 'btn gross gelb', onclick: () => aufloesen(null, null) }, 'Auflösen 👀'));

      s.appendChild(UI.dunkler());
      s.appendChild(el('div', { class: 'mitte', style: { gap: '16px', justifyContent: 'flex-start', paddingTop: '6px', width: '100%' } },
        tafelFeld,
        el('div', { class: 'frage', style: { maxWidth: '30ch' }, text: q.f }),
        antworten,
        hinweis,
        erklaerung,
        knopfReihe,
        punkteText,
        punkteReihe,
        weiter));
      s.classList.add('scrollbar');
    }, { scroll: true });
  },

  /* ---------- Ergebnisbildschirm für alle Spielarten --------------------- */
  ende(nochmal) {
    UI.sperreSetzen('__menue');
    const rang = Teams.rangliste();
    const gleichstand = rang.length > 1 && rang[0].punkte === rang[1].punkte;
    UI.hudZeigen('Ergebnis', () => Beamer.menue());
    UI.zeige('beamer-ende', (s) => {
      Audio3.fanfare();
      s.appendChild(UI.dunkler());
      s.appendChild(el('div', { class: 'mitte' },
        el('div', { style: { fontSize: '3.4em' }, text: gleichstand ? '🤝' : '🏆' }),
        el('h2', { text: gleichstand
          ? (rang[0].punkte > 0 ? `Unentschieden – ${rang[0].punkte} zu ${rang[1].punkte}!` : 'Unentschieden')
          : rang[0].name + ' gewinnt!' }),
        el('div', { class: 'liste', style: { width: 'min(680px,100%)' } },
          rang.map((t, i) => el('div', { class: 'zeile', style: { borderLeft: '5px solid ' + t.farbe } },
            el('b', { style: { fontSize: '1.3em', minWidth: '2ch' },
                      text: gleichstand ? '🤝' : ['🥇', '🥈'][i] || '–' }),
            el('b', { style: { flex: '1' }, text: t.name }),
            el('span', { class: 'mono', style: { fontSize: '1.3em', fontWeight: '900' }, text: t.punkte })))),
        el('div', { class: 'btn-reihe' },
          el('button', { class: 'btn geist', onclick: () => { Audio3.klick(); Beamer.menue(); } }, '← Menü'),
          el('button', { class: 'btn gross', onclick: () => { Audio3.klick(); nochmal(); } }, 'Noch eine Runde →'))));
    });
  },

  /* ---------- Hot Seat: eine Aufgabe am Beamer spielen ------------------- */
  hotSeat() {
    UI.sperreSetzen('__menue');
    App.menueKulisse();
    UI.hudZeigen('Hot Seat', () => Beamer.menue());
    UI.zeige('beamer-hotseat', (s) => {
      s.appendChild(el('div', { class: 'mitte', style: { justifyContent: 'flex-start', paddingTop: '8px', overflowY: 'auto', width: '100%' } },
        el('h2', { text: 'Welche Aufgabe?' }),
        el('p', { class: 'hinweis', text: 'Einer bedient vorne, der Rest der Gruppe darf reinrufen. Punkte vergibst du danach von Hand im Menü.' }),
        el('div', { class: 'levelgitter' },
          LEVELS.map((lv, i) => el('button', {
            class: 'levelkarte' + (lv.boss ? ' boss' : ''), style: { '--f': lv.farbe },
            onclick: () => { Audio3.klick(); App.levelStarten(lv.id); },
          },
            el('span', { class: 'nr', text: lv.boss ? '★' : String(i + 1) }),
            el('span', { class: 'ic', text: lv.icon }),
            el('b', { text: lv.name }),
            el('small', { text: lv.kurz })))),
        el('button', { class: 'btn geist', onclick: () => { Audio3.klick(); Beamer.menue(); } }, '← Zurück')));
      s.classList.add('scrollbar');
    }, { scroll: true });
  },

  /* ---------- Punkte von Hand verwalten ---------------------------------- */
  punkteVerwalten() {
    UI.sperreSetzen('__menue');
    UI.hudZeigen('Punkte', () => Beamer.menue());
    UI.zeige('beamer-punkte', (s) => {
      const tafel = el('div', {});
      const malen = () => { tafel.innerHTML = ''; tafel.appendChild(Beamer.tafel()); };
      malen();

      s.appendChild(el('div', { class: 'mitte' },
        el('h2', { text: 'Punktestand' }),
        tafel,
        el('div', { class: 'liste', style: { width: 'min(720px,100%)' } },
          Teams.liste.map((t, i) => el('div', { class: 'zeile' },
            el('b', { style: { flex: '1', color: t.farbe }, text: t.name }),
            el('button', { class: 'btn geist', style: { padding: '.3em .9em' },
              onclick: () => { Teams.punkten(i, -100); Audio3.zu(); malen(); } }, '−100'),
            el('button', { class: 'btn geist', style: { padding: '.3em .9em' },
              onclick: () => { Teams.punkten(i, 100); Audio3.klick(); malen(); } }, '+100')))),
        el('div', { class: 'btn-reihe' },
          el('button', { class: 'btn geist', onclick: () => { Teams.zuruecksetzen(); Audio3.zu(); malen(); } }, '↻ Alles auf 0'),
          el('button', { class: 'btn geist', onclick: () => { Audio3.klick(); Beamer.teamsEinrichten(); } }, '👥 Teams ändern'),
          el('button', { class: 'btn gross', onclick: () => { Audio3.klick(); Beamer.menue(); } }, 'Zurück →'))));
    });
  },
};
