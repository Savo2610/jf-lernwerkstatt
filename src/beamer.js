/* ============================================================================
   Beamer-Modus – für den Gruppenabend
   Einer bedient, alle raten mit. Große Schrift, Teamwertung, Moderationsknöpfe.
   ========================================================================== */
const Beamer = {
  /* ---------- Teams einrichten ------------------------------------------ */
  /* Zwei Teams, fest. Mehr braucht ein Gruppenabend nicht – und mit zwei
     Mannschaften geht das Nachziehen bei falscher Antwort sauber auf. */
  anzahl: 2,
  namen: ['Angriffstrupp', 'Wassertrupp'],

  teamsEinrichten() {
    UI.sperreSetzen('__menue');
    UI.hudVerstecken();
    App.menueKulisse();
    const farben = ['#ff4d3d', '#35c8ff'];
    Beamer.anzahl = 2;
    if (Teams.liste.length) Teams.liste.forEach((t, i) => { if (i < 2) Beamer.namen[i] = t.name; });

    UI.zeige('beamer-teams', (s) => {
      const felder = el('div', { style: { display: 'grid', gap: '10px', width: 'min(560px,100%)' } });

      const malen = () => {
        felder.innerHTML = '';
        for (let i = 0; i < Beamer.anzahl; i++) {
          const inp = el('input', {
            type: 'text', value: Beamer.namen[i], maxlength: '18',
            style: { padding: '.6em 1em', borderRadius: '999px', border: '2px solid ' + farben[i],
                     background: 'rgba(10,14,26,.7)', color: 'var(--txt)', fontWeight: '800',
                     textAlign: 'center', width: '100%', font: 'inherit', fontSize: '1em' },
          });
          inp.addEventListener('input', () => Beamer.namen[i] = inp.value);
          felder.appendChild(el('div', { style: { display: 'flex', alignItems: 'center', gap: '10px' } },
            el('div', { style: { width: '18px', height: '18px', borderRadius: '50%', background: farben[i], flex: '0 0 auto' } }),
            inp));
        }
      };
      malen();

      s.appendChild(el('div', { class: 'mitte', style: { justifyContent: 'flex-start', paddingTop: '10px', overflowY: 'auto', width: '100%' } },
        el('div', { class: 'dienstvorschrift', text: 'Gruppenabend' }),
        el('h2', { text: 'Wer tritt gegeneinander an?' }),
        el('p', { class: 'hinweis', text: 'Zwei Mannschaften treten gegeneinander an. Die Namen könnt ihr überschreiben.' }),
        felder,
        el('div', { class: 'btn-reihe' },
          el('button', { class: 'btn geist', onclick: () => { Audio3.klick(); App.soloStart(); } }, '← Alleine üben'),
          el('button', {
            class: 'btn gross',
            onclick: () => {
              Teams.anlegen(Beamer.namen.slice(0, Beamer.anzahl).map((n, i) => (n || '').trim() || ('Team ' + (i + 1))));
              Audio3.klick();
              Beamer.menue();
            },
          }, 'Los geht\u2019s →'))));
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
          karte('❓', 'Quiz-Duell', 'Fragen aus der FwDV 3. Ihr diskutiert, du löst auf und verteilst die Punkte.', 'var(--gelb)', () => Beamer.quizStart()),
          karte('⚡', 'Blitzrunde', 'Zehn Fragen am Stück, kurze Zeit. Wer zuerst ruft, bekommt den Punkt.', 'var(--rot)', () => Beamer.quizStart(true)),
          karte('🧠', 'Memory', 'Begriff und Erklärung finden. Wer ein Paar aufdeckt, darf gleich noch mal.', 'var(--lila)', () => Beamer.memoryStart()),
          karte('🪑', 'Hot Seat', 'Einer kommt nach vorne und spielt ein Level am Beamer. Der Rest berät.', 'var(--blau)', () => Beamer.hotSeat()),
          karte('📊', 'Punkte & Ende', 'Punktestand ansehen, korrigieren oder eine neue Runde starten.', 'var(--gruen)', () => Beamer.punkteVerwalten()),
        )));
      s.classList.add('scrollbar');
    }, { scroll: true });
  },

  /* ---------- Quiz -------------------------------------------------------- */
  quizStart(blitz) {
    const anzahl = blitz ? 10 : 8;
    this.fragen = shuffle(QUIZ).slice(0, anzahl);
    this.fIdx = 0;
    this.blitz = !!blitz;
    this.quizFrage();
  },

  quizFrage() {
    UI.sperreSetzen('__menue');
    if (this.fIdx >= this.fragen.length) return this.quizEnde();
    const q = this.fragen[this.fIdx];
    /* Im Duell ist immer ein Team dran. Trifft es, bekommt es die Punkte
       automatisch. Trifft es daneben, darf das andere Team nachziehen und
       die Punkte abstauben. In der Blitzrunde ruft, wer zuerst kann –
       da vergibt der Moderator die Punkte weiter von Hand.               */
    const startTeam = this.blitz ? null : this.fIdx % Teams.liste.length;
    let dran = startTeam;
    let nachzug = false;
    let aufgeloest = false;
    const vergeben = new Set();

    UI.hudZeigen(`Frage ${this.fIdx + 1} von ${this.fragen.length}`, () => Beamer.menue());
    UI.zeige('beamer-frage-' + this.fIdx, (s) => {
      /* Antworten sind anklickbar: der Moderator tippt einfach die Antwort an,
         die gerufen wurde. */
      const antworten = el('div', { class: 'antworten zwei', style: { width: 'min(1100px,100%)' } },
        q.o.map((a, i) => el('button', { class: 'antwort', 'data-i': i, onclick: () => getippt(i) },
          el('span', { class: 'marker', text: 'ABCD'[i] }), el('span', { text: a }))));

      const erklaerung = el('div', { style: { width: 'min(900px,100%)' } });

      let tafelFeld = Beamer.tafel(dran);
      const tafelFrisch = () => {
        const neu = Beamer.tafel(aufgeloest ? null : dran);
        tafelFeld.replaceWith(neu); tafelFeld = neu;
      };

      const punkteKnoepfe = Teams.liste.map((t, i) => {
        const b = el('button', {
          class: 'btn geist',
          style: { boxShadow: 'inset 0 0 0 2px ' + t.farbe, minWidth: '140px' },
          onclick: () => {
            if (vergeben.has(i)) {
              vergeben.delete(i); Teams.punkten(i, -10);
              b.style.background = 'transparent'; b.textContent = '+ ' + t.name;
              Audio3.zu();
            } else {
              vergeben.add(i); Teams.punkten(i, 10);
              b.style.background = t.farbe + '33'; b.textContent = '✓ ' + t.name + '  +10';
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
        onclick: () => { Audio3.klick(); Beamer.fIdx++; Beamer.quizFrage(); },
      }, 'Nächste Frage →');

      const hinweis = el('div', { class: 'klein', text: this.blitz
        ? 'Wer zuerst ruft! Tippe die genannte Antwort an.'
        : (dran != null ? Teams.liste[dran].name + ' ist dran – tippe die genannte Antwort an.' : '') });

      /* Punkte automatisch buchen und im Korrekturknopf markieren */
      const punktenAn = (idx) => {
        if (idx == null || vergeben.has(idx)) return;
        vergeben.add(idx);
        Teams.punkten(idx, 10);
        const t = Teams.liste[idx], b = punkteKnoepfe[idx];
        if (b) { b.style.background = t.farbe + '33'; b.textContent = '✓ ' + t.name + '  +10'; }
      };

      const getippt = (i) => {
        if (aufgeloest) return;
        if (dran == null) return aufloesen(i, null);      // Blitzrunde
        if (i === q.r) { punktenAn(dran); return aufloesen(i, dran); }

        // Danebengetippt: diese Antwort ist verbrannt
        const knopf = $$('.antwort', antworten)[i];
        knopf.classList.add('falsch');
        knopf.style.pointerEvents = 'none';
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
            text: `+10 für ${Teams.liste[gewinner].name}` + (nachzug ? ' – abgestaubt!' : '') }));
        } else if (dran != null) {
          erklaerung.appendChild(el('div', { class: 'chip', style: { marginTop: '8px' },
            text: 'Diesmal keine Punkte.' }));
        }
        knopfReihe.style.display = 'none';
        punkteText.style.display = 'block';
        punkteReihe.style.display = 'flex';
        weiter.style.display = 'inline-flex';
        hinweis.textContent = this.blitz ? 'Wer hatte es richtig? Tippe die Teams an.' : '';
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

  quizEnde() { this.ende(() => Beamer.quizStart(Beamer.blitz)); },

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
                      text: gleichstand ? '🤝' : ['🥇', '🥈', '🥉', '4.'][i] }),
            el('b', { style: { flex: '1' }, text: t.name }),
            el('span', { class: 'mono', style: { fontSize: '1.3em', fontWeight: '900' }, text: t.punkte })))),
        el('div', { class: 'btn-reihe' },
          el('button', { class: 'btn geist', onclick: () => { Audio3.klick(); Beamer.menue(); } }, '← Menü'),
          el('button', { class: 'btn gross', onclick: () => { Audio3.klick(); nochmal(); } }, 'Noch eine Runde →'))));
    });
  },

  /* ---------- Memory ------------------------------------------------------
     Acht Paare, sechzehn Karten. Die Teams decken abwechselnd zwei Karten
     auf. Wer ein Paar findet, bekommt zehn Punkte und darf gleich weiter.  */
  memoryStart() {
    const paare = shuffle(MEMORY_PAARE.slice()).slice(0, 8);
    this.mKarten = shuffle(paare.reduce((liste, p, i) => liste.concat(
      [{ paar: i, text: p.a, merke: p.merke }, { paar: i, text: p.b, merke: p.merke }]), []));
    this.mDran = 0;
    this.mOffen = [];
    this.mGefunden = {};
    this.mSperre = false;
    this.memoryZeigen();
  },

  memoryZeigen() {
    UI.sperreSetzen('__menue');
    App.menueKulisse();
    UI.hudZeigen('Memory', () => Beamer.menue());
    UI.zeige('beamer-memory', (s) => {
      const gitter = el('div', {
        style: { display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: '10px',
                 width: 'min(1000px,100%)' },
      });
      const rueck = el('div', { class: 'klein', style: { minHeight: '2.4em', textAlign: 'center' } });
      let tafelFeld = Beamer.tafel(Beamer.mDran);

      const tafelFrisch = () => {
        const neu = Beamer.tafel(Beamer.mDran);
        tafelFeld.replaceWith(neu); tafelFeld = neu;
      };

      const malen = () => {
        gitter.innerHTML = '';
        Beamer.mKarten.forEach((k, i) => {
          const gefunden = Beamer.mGefunden[k.paar] != null;
          const offen = gefunden || Beamer.mOffen.indexOf(i) >= 0;
          const farbe = gefunden ? Teams.liste[Beamer.mGefunden[k.paar]].farbe : null;
          const karte = el('button', {
            style: { minHeight: '96px', borderRadius: '16px', padding: '10px 12px', font: 'inherit',
                     fontWeight: '800', lineHeight: 1.2, cursor: offen ? 'default' : 'pointer',
                     whiteSpace: 'normal', transition: 'background .2s, box-shadow .2s, opacity .2s',
                     border: '2px solid ' + (farbe || (offen ? 'var(--gelb)' : 'var(--linie2)')),
                     background: gefunden ? farbe + '2b' : offen ? 'rgba(255,210,63,.14)' : 'rgba(10,16,30,.72)',
                     color: offen ? 'var(--txt)' : 'var(--txt2)', opacity: gefunden ? .75 : 1,
                     fontSize: offen ? 'clamp(.8rem,1.5vw,1.02rem)' : '1.6rem' },
            onclick: () => tippen(i),
          }, offen ? k.text : '❓');
          gitter.appendChild(karte);
        });
      };

      const tippen = (i) => {
        if (Beamer.mSperre) return;
        const k = Beamer.mKarten[i];
        if (Beamer.mGefunden[k.paar] != null || Beamer.mOffen.indexOf(i) >= 0) return;
        if (Beamer.mOffen.length >= 2) return;
        Beamer.mOffen.push(i);
        Audio3.klick();
        malen();
        if (Beamer.mOffen.length < 2) return;

        const [a, b] = Beamer.mOffen.map(x => Beamer.mKarten[x]);
        if (a.paar === b.paar) {
          Teams.punkten(Beamer.mDran, 10);
          Beamer.mGefunden[a.paar] = Beamer.mDran;
          Beamer.mOffen = [];
          Audio3.richtig();
          rueck.textContent = `Paar! +10 für ${Teams.liste[Beamer.mDran].name} · ${a.merke} – und gleich noch mal.`;
          malen(); tafelFrisch();
          if (Object.keys(Beamer.mGefunden).length === Beamer.mKarten.length / 2) {
            setTimeout(() => Beamer.ende(() => Beamer.memoryStart()), 1600);
          }
          return;
        }
        Beamer.mSperre = true;
        Audio3.falsch();
        rueck.textContent = 'Kein Paar. Gut merken – jetzt ist das andere Team dran.';
        setTimeout(() => {
          Beamer.mOffen = [];
          Beamer.mSperre = false;
          Beamer.mDran = (Beamer.mDran + 1) % Teams.liste.length;
          malen(); tafelFrisch();
          rueck.textContent = Teams.liste[Beamer.mDran].name + ' ist dran.';
        }, 2200);
      };

      malen();
      rueck.textContent = Teams.liste[Beamer.mDran].name + ' fängt an – zwei Karten aufdecken.';
      s.appendChild(UI.dunkler());
      s.appendChild(el('div', { class: 'mitte', style: { gap: '14px', justifyContent: 'flex-start', paddingTop: '6px', width: '100%' } },
        tafelFeld,
        el('h2', { style: { margin: 0 }, text: 'Memory: Begriff und Erklärung' }),
        gitter,
        rueck,
        el('div', { class: 'btn-reihe' },
          el('button', { class: 'btn geist', onclick: () => { Audio3.klick(); Beamer.menue(); } }, '← Menü'),
          el('button', { class: 'btn geist', onclick: () => { Audio3.klick(); Beamer.memoryStart(); } }, '↻ Neue Karten'))));
      s.classList.add('scrollbar');
    }, { scroll: true });
  },

  /* ---------- Hot Seat: Level am Beamer spielen -------------------------- */
  hotSeat() {
    UI.sperreSetzen('__menue');
    App.menueKulisse();
    UI.hudZeigen('Hot Seat', () => Beamer.menue());
    UI.zeige('beamer-hotseat', (s) => {
      s.appendChild(el('div', { class: 'mitte', style: { justifyContent: 'flex-start', paddingTop: '8px', overflowY: 'auto', width: '100%' } },
        el('h2', { text: 'Welches Level?' }),
        el('p', { class: 'hinweis', text: 'Einer bedient vorne, der Rest der Gruppe darf reinrufen. Punkte vergibst du danach von Hand im Menü.' }),
        el('div', { class: 'levelgitter' },
          LEVELS.filter(l => l.bereit !== false).map((lv, i) => el('button', {
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
              onclick: () => { Teams.punkten(i, -5); Audio3.zu(); malen(); } }, '−5'),
            el('button', { class: 'btn geist', style: { padding: '.3em .9em' },
              onclick: () => { Teams.punkten(i, 5); Audio3.klick(); malen(); } }, '+5'),
            el('button', { class: 'btn geist', style: { padding: '.3em .9em' },
              onclick: () => { Teams.punkten(i, 10); Audio3.richtig(); malen(); } }, '+10')))),
        el('div', { class: 'btn-reihe' },
          el('button', { class: 'btn geist', onclick: () => { Teams.zuruecksetzen(); Audio3.zu(); malen(); } }, '↻ Alles auf 0'),
          el('button', { class: 'btn geist', onclick: () => { Audio3.klick(); Beamer.teamsEinrichten(); } }, '👥 Teams ändern'),
          el('button', { class: 'btn gross', onclick: () => { Audio3.klick(); Beamer.menue(); } }, 'Zurück →'))));
    });
  },
};
