/* ---------- App: Start, Profil, Levelmenue --------------------------------
   Aufbau bewusst wie bei „Einsatzbereit" – wer beide Seiten kennt, findet
   sich sofort zurecht. Fortschritt, Raenge, Sterne und Abzeichen arbeiten
   identisch, nur eben mit eigenem Speicherschluessel und eigenen Inhalten.

   Der Beamer-Modus fehlt hier noch. Er kommt, wenn die Level stehen.
   -------------------------------------------------------------------------*/
const Fehlerliste = [];
window.addEventListener('error', (e) => {
  Fehlerliste.push(String(e.message) + ' @' + (e.filename || '') + ':' + e.lineno);
});
window.addEventListener('unhandledrejection', (e) => {
  Fehlerliste.push('Promise: ' + String(e.reason && e.reason.message || e.reason));
});

/* Sterne, die der Boss-Level verlangt. Solange es keinen gibt, laeuft die
   Sperre leer mit – die Mechanik steht aber schon. */
const BOSS_STERNE = 7;

/* Rueckweg zur Startseite. Absolut und nicht relativ: die Seite laeuft auch
   als Artifact und lokal auf einem eigenen Port, dort gibt es kein „eine
   Ebene hoeher". Der Parameter sagt der Startseite, dass sie das Fahrzeug
   einfahren lassen soll. */
const LERNWERKSTATT = 'https://jf.veerka.mp';
const LERNWERKSTATT_RUECK = LERNWERKSTATT + '/?einfahrt=1';

const App = {
  _gestartet: false,

  bossFehlt(lv) {
    if (!lv || !lv.boss) return 0;
    if (State.modus === 'beamer') return 0;
    return Math.max(0, BOSS_STERNE - State.sterneGesamt());
  },

  start() {
    if (this._gestartet) return;
    this._gestartet = true;
    UI.init();
    Stage.init();
    State.laden();
    const wecken = () => { Audio3.wecken(); Audio3.stimmeSuchen(); };
    window.addEventListener('pointerdown', wecken, { once: true });
    window.addEventListener('keydown', wecken, { once: true });

    const q = new URLSearchParams(location.search);
    // Debug-Haken zum Pruefen im Browser – siehe docs/pruefen.md. Die
    // Bausteine sind mit drin, damit man einen Bildschirm nachstellen kann,
    // ohne das halbe Level davor durchspielen zu muessen.
    window.__bl = {
      Stage, State, UI, LEVELS, HotSpots, Fehlerliste, App, Bewegung, Audio3,
      Teams, Beamer,
      VORAUSSETZUNGEN, ERSCHEINUNGEN, BRANDKLASSEN, LOESCHMITTEL, LOESCHVERFAHREN,
      LOESCHFAMILIEN, BRANDLAGEN, STRAHLARTEN, STRAHLLAGEN, LOESCHERREGELN,
      EINSAETZE, KATEGORIEN, QUIZ,
      LUFT, SAUERSTOFF, KENNGROESSEN, ZERTEILUNG, MISCHUNG, ZUENDQUELLEN, TEMPERATUREN,
      bausteine: { frageReihe, frageBauen, motivEinpassen, motivWache, ziehbarMachen,
                   baueFeuer, feuerStaerke, baueWolken, wolkenStaerke, funkenSchauer,
                   baueStrahl, strahlAn, baueSchaumdecke, schaumFuellen, baueLoescher,
                   baueWanne, baueGasfackel, unterbau, regler },
    };
    // Direktsprung fuer Test und Unterricht:  ?level=<id>  bzw.  ?modus=beamer
    if (q.get('modus') === 'beamer') { this.beamerStart(); return; }
    const zielLevel = q.get('level');
    if (zielLevel && levelHolen(zielLevel)) {
      State.modus = 'solo';
      if (!State.name) { State.name = 'Kamerad'; State.sichern(); }
      this.levelStarten(zielLevel);
      return;
    }
    this.soloStart();
  },

  /* --- Kulisse fuer Menuebildschirme -------------------------------------
     Der Uebungsplatz mit einem ruhig brennenden Feuer. Kein Fahrzeug, keine
     Mannschaft: Das hier ist eine Lehrstunde, keine Einsatzlage.          */
  menueKulisse() {
    Stage.leeren();
    Stage.welt.add(baueUebungsplatz({ seite: 26 }));

    const schale = baueFeuerschale({ radius: .9 });
    schale.position.set(0, 0, 0);
    Stage.welt.add(schale);
    const feuer = baueFeuer({ hoehe: 2.2, breite: .78, zungen: 7, licht: true, glutAnteil: .6 });
    feuer.position.y = schale.userData.feuerHoehe;
    Stage.welt.add(feuer);
    const rauch = baueWolken('rauch', 10);
    rauch.position.y = schale.userData.feuerHoehe + 1.9;
    wolkenStaerke(rauch, .45, true);
    Stage.welt.add(rauch);

    const bank = baueWerkbank(2.8);
    bank.position.set(-4.6, 0, 2.2);
    bank.rotation.y = .38;
    Stage.welt.add(bank);
    [[4.8, 3.4], [-5.6, -3.2], [5.2, -4.4]].forEach(([x, z]) => {
      const k = baueKegel(); k.position.set(x, 0, z); Stage.welt.add(k);
    });
    const fahne = baueWindfahne();
    fahne.position.set(8.5, 0, -3.5);
    Stage.welt.add(fahne);

    Stage.orbitAn(13.5, 4.2, [0, 1.2, 0], .045);
    Stage.anmelden((dt, t) => {
      feuerUpdate(feuer, dt, t);
      wolkenUpdate(rauch, dt);
      windfahneUpdate(fahne, dt, t, -.6);
    });
  },

  /* --- Solo: Profil ------------------------------------------------------- */
  soloStart() {
    State.modus = 'solo';
    document.body.classList.remove('beamer');
    if (State.name) return this.levelMenue();
    this.profil();
  },

  /* Bewusst schlichter als drueben: Dort waehlt man eine Helmfarbe, weil dort
     die eigene Figur im Bild steht. Hier steht keine Figur im Bild, sondern
     ein Feuer – also gibt es auch nichts einzufaerben. Nur der Name. */
  profil() {
    UI.hudVerstecken();
    Stage.leeren();
    Stage.welt.add(baueUebungsplatz({ seite: 22 }));
    const schale = baueFeuerschale({ radius: .9 });
    Stage.welt.add(schale);
    const feuer = baueFeuer({ hoehe: 2.2, breite: .8, zungen: 7, licht: true, glutAnteil: .55 });
    feuer.position.y = schale.userData.feuerHoehe;
    feuerStaerke(feuer, .25, true);
    Stage.welt.add(feuer);
    const rauch = baueWolken('rauch', 10);
    rauch.position.y = schale.userData.feuerHoehe + 1.9;
    wolkenStaerke(rauch, .2, true);
    Stage.welt.add(rauch);
    Stage.anmelden((dt, t) => { feuerUpdate(feuer, dt, t); wolkenUpdate(rauch, dt); });

    const schmal = () => innerWidth < 900;
    const kameraSetzen = () => {
      if (schmal()) Stage.kameraSetzen([0, 2.2, 5.2], [0, 1.5, 0]);
      else Stage.kameraSetzen([-2.1, 2.0, 4.4], [.8, 1.4, 0]);
    };
    kameraSetzen();

    UI.zeige('profil', (s) => {
      const eingabe = el('input', {
        type: 'text', maxlength: '14', placeholder: 'Dein Name', value: State.name || '',
        style: { padding: '.75em 1.2em', borderRadius: '999px', border: '2px solid var(--linie2)',
                 background: 'var(--panel)', color: 'var(--txt)', fontSize: '1.1em', fontWeight: '700',
                 textAlign: 'center', width: '100%', font: 'inherit' },
      });
      /* Ab dem ersten Abzeichen gehoert der Name zum Nachweis und ist
         festgeschrieben – siehe gemeinsam/nachweis.js. Aendern geht nur noch
         ueber „Fortschritt zuruecksetzen", und das kostet dann eben alles. */
      if (State.nameGesperrt()) {
        eingabe.readOnly = true;
        eingabe.tabIndex = -1;
        eingabe.style.opacity = '.7';
        eingabe.style.cursor = 'default';
        eingabe.title = 'Dein Name gehört zu deinen Abzeichen.';
      }

      // Kleine Belohnung fuers Tippen: Das Feuer zieht an, sobald ein Name
      // dasteht. Kostet nichts und macht den ersten Bildschirm lebendig.
      eingabe.addEventListener('input', () => {
        feuerStaerke(feuer, eingabe.value.trim() ? 1 : .25);
        wolkenStaerke(rauch, eingabe.value.trim() ? .5 : .2);
      });

      const weiter = () => {
        if (!State.nameGesperrt()) State.name = (eingabe.value || 'Kamerad').trim().slice(0, 14) || 'Kamerad';
        State.sichern();
        Audio3.klick();
        App.levelMenue();
      };
      eingabe.addEventListener('keydown', e => { if (e.key === 'Enter') weiter(); });

      /* --- Fortschritt loeschen: zwei Klicks, damit es kein Versehen wird - */
      const loeschKnopf = el('button', { class: 'btn geist', style: { fontSize: '.88em' } },
        '↻ Fortschritt zurücksetzen');
      let scharf = false;
      loeschKnopf.addEventListener('click', () => {
        if (!scharf) {
          scharf = true;
          Audio3.zu();
          loeschKnopf.textContent = 'Wirklich? Alles auf Anfang – hier klicken';
          loeschKnopf.style.boxShadow = 'inset 0 0 0 2px var(--rot)';
          loeschKnopf.style.color = 'var(--rot)';
          setTimeout(() => {
            if (!scharf) return;
            scharf = false;
            loeschKnopf.textContent = '↻ Fortschritt zurücksetzen';
            loeschKnopf.style.boxShadow = '';
            loeschKnopf.style.color = '';
          }, 4000);
          return;
        }
        State.zuruecksetzen();
        // Ohne Abzeichen ist auch der Name wieder frei – sonst bliebe das Feld
        // gesperrt, bis jemand den Bildschirm neu aufbaut.
        eingabe.readOnly = false;
        eingabe.tabIndex = 0;
        eingabe.style.opacity = '';
        eingabe.style.cursor = '';
        eingabe.removeAttribute('title');
        Audio3.fanfare();
        UI.toast('Fortschritt gelöscht. XP, Sterne und Abzeichen stehen wieder auf null.', 'gut', 3200);
        loeschKnopf.textContent = '✓ Zurückgesetzt';
        loeschKnopf.style.boxShadow = '';
        loeschKnopf.style.color = '';
        scharf = false;
      });

      const karte = el('div', { class: 'panel glas', style: { width: 'min(400px,92vw)', display: 'flex', flexDirection: 'column', gap: '14px', textAlign: 'center' } },
        el('div', { class: 'dienstvorschrift', style: { alignSelf: 'center' }, text: 'Brennen & Löschen' }),
        el('h2', { text: State.name ? 'Dein Profil' : 'Wer bist du?' }),
        el('p', { class: 'klein', style: { margin: 0 }, text: State.nameGesperrt()
          ? 'Dein Name gehört jetzt zu deinen Abzeichen und steht fest.'
          : 'Den Namen kannst du jederzeit ändern – bis zum ersten Abzeichen.' }),
        eingabe,
        el('button', { class: 'btn gross', onclick: weiter },
          State.name ? 'Weiter üben →' : 'Los geht’s →'),
        el('div', { style: { height: '1px', background: 'var(--linie)', margin: '2px 0' } }),
        // Der Gruppenabend haengt bewusst hier hinten und nicht im Levelmenue:
        // So landet niemand versehentlich im Beamer-Modus, und der Jugendwart
        // findet ihn trotzdem an der Stelle, an der er ohnehin vorbeikommt.
        el('button', {
          class: 'btn geist', style: { fontSize: '.92em' },
          onclick: () => {
            if (!State.nameGesperrt()) State.name = (eingabe.value || State.name || 'Kamerad').trim().slice(0, 14) || 'Kamerad';
            State.sichern();
            Audio3.klick(); App.beamerStart();
          },
        }, '📽️ Gruppenabend am Beamer starten'),
        State.name || State.xp > 0 ? loeschKnopf : null);

      s.appendChild(el('div', {
        style: { flex: '1', display: 'flex',
                 justifyContent: schmal() ? 'center' : 'flex-end',
                 paddingRight: schmal() ? '0' : 'min(7vw,80px)',
                 paddingBottom: schmal() ? '4vh' : '0',
                 alignItems: schmal() ? 'flex-end' : 'center' },
      }, karte));

      setTimeout(() => eingabe.focus(), 260);
      const beiResize = () => kameraSetzen();
      window.addEventListener('resize', beiResize);
      return () => window.removeEventListener('resize', beiResize);
    });
  },

  /* --- Zurueck zur Lernwerkstatt ------------------------------------------
     Wie drueben: Das Bild zieht sich auf den Grundton zu, mit dem die
     Startseite ihre Einfahrt beginnt – man sieht keinen Schnitt.           */
  zurLernwerkstatt() {
    if (this.faehrtHeim) return;
    this.faehrtHeim = true;
    const blende = el('div', { class: 'heimfahrt' });
    document.body.appendChild(blende);
    requestAnimationFrame(() => blende.classList.add('an'));
    setTimeout(() => blende.classList.add('an'), 40);
    setTimeout(() => { location.href = LERNWERKSTATT_RUECK; }, 520);
  },

  /* --- Levelmenue --------------------------------------------------------- */
  levelMenue() {
    UI.sperreSetzen('__menue');
    this.menueKulisse();
    UI.hudZeigen(`Willkommen, ${State.name}`, () => App.zurLernwerkstatt(),
      [el('i', { class: 'nur-breit' }, 'Zurück zur '), 'Lernwerkstatt']);
    UI.zeige('menue', (s) => {
      // Auf Glas, nicht direkt auf den Himmel: Der Untertitel steht in der
      // gedeckten Nebenfarbe, und die hat gegen das helle Blau der Kulisse zu
      // wenig Kontrast – am Beamer im hellen Raum liest ihn niemand mehr.
      const kopf = el('div', { class: 'menuekopf' },
        el('h2', { text: 'Warum brennt es – und warum hört es auf?' }),
        el('p', { class: 'hinweis', text: 'Arbeite dich von oben nach unten durch. Der erste Teil erklärt das Feuer, der zweite das Löschen.' }));

      const habe = State.sterneGesamt();
      const gitter = el('div', { class: 'levelgitter' },
        LEVELS.map((lv, i) => {
          const best = State.levelBest(lv.id);
          const sterne = State.sterne(lv.id);
          const fehlt = App.bossFehlt(lv);
          const gesperrt = lv.bereit === false || fehlt > 0;
          return el('button', {
            class: 'levelkarte' + (lv.boss ? ' boss' : '') + (gesperrt ? ' zu' : ''),
            style: { '--f': lv.farbe },
            onclick: () => {
              if (lv.bereit === false) return;
              if (fehlt > 0) {
                Audio3.falsch();
                UI.toast(`Noch ${fehlt} ${fehlt === 1 ? 'Stern' : 'Sterne'}.`, 'schlecht', 2800);
                return;
              }
              Audio3.klick(); App.levelStarten(lv.id);
            },
          },
            el('span', { class: 'nr', text: lv.boss ? (fehlt > 0 ? '🔒' : '★') : String(i + 1) }),
            el('span', { class: 'ic', text: lv.icon }),
            el('b', { text: lv.name }),
            el('small', { text: fehlt > 0
              ? `Verschlossen. Sammle ${BOSS_STERNE} Sterne – dir fehlen noch ${fehlt}.`
              : lv.kurz }),
            fehlt > 0
              ? el('div', { class: 'balken' }, el('i', { style: { width: (habe / BOSS_STERNE * 100) + '%' } }))
              : (best > 0 ? el('div', { class: 'balken' }, el('i', { style: { width: (best * 100) + '%' } })) : null),
            fehlt > 0
              ? el('span', { class: 'sterne', text: `${habe}/${BOSS_STERNE} ★` })
              : (sterne ? el('span', { class: 'sterne', text: '★'.repeat(sterne) }) : null),
          );
        }));

      const fuss = el('div', { style: { textAlign: 'center', paddingBottom: '16px' } },
        el('div', { class: 'chip', style: { marginBottom: '12px' },
                    text: `★ ${State.sterneAlle()} von ${State.sterneMoeglich()} Sternen` +
                          (State.alleDreiSterne() ? '  ·  🎖️ alles auf drei Sternen!' : '') }),
        el('div', { class: 'btn-reihe' },
          el('button', { class: 'btn geist', onclick: () => { Audio3.klick(); App.abzeichenSchau(); } },
            `🏅 Abzeichen (${State.abzeichenAnzahl()}/${Object.keys(ABZEICHEN).length})`),
          el('button', { class: 'btn geist', onclick: () => { Audio3.klick(); App.profil(); } }, '👤 Profil')));

      s.appendChild(el('div', { class: 'mitte', style: { justifyContent: 'flex-start', paddingTop: '10px', overflowY: 'auto', width: '100%' } },
        kopf, gitter, fuss));
      s.classList.add('scrollbar');
    }, { scroll: true });
  },

  abzeichenSchau() {
    UI.sperreSetzen('__menue');
    UI.hudZeigen('Abzeichen', () => App.levelMenue());
    UI.zeige('abzeichen', (s) => {
      const keys = Object.keys(ABZEICHEN);
      s.appendChild(el('div', { class: 'mitte', style: { justifyContent: 'flex-start', paddingTop: '10px', width: '100%', overflowY: 'auto' } },
        el('h2', { text: `${State.abzeichenAnzahl()} von ${keys.length} Abzeichen` }),
        el('div', { class: 'levelgitter', style: { maxWidth: '900px' } },
          keys.map(k => {
            const a = ABZEICHEN[k], hat = !!State.abzeichen[k];
            const tag = State.abzeichenTag(k);
            return el('div', { class: 'panel', style: { textAlign: 'center', opacity: hat ? 1 : .38 } },
              el('div', { style: { fontSize: '2.6em', lineHeight: 1.1 }, text: hat ? a.icon : '🔒' }),
              el('b', { text: a.name }),
              el('div', { class: 'klein', text: a.text }),
              // Wann das Abzeichen fiel. Spielstaende von vor dieser Aenderung
              // wissen den Tag nicht mehr – dann steht hier eben nichts.
              tag ? el('div', { class: 'klein mono', style: { marginTop: '6px' },
                                text: NACHWEIS.tagAlsDatum(tag) }) : null);
          }),
          UI.nachweisKarte(keys)),
        el('button', { class: 'btn geist', onclick: () => { Audio3.klick(); App.levelMenue(); } }, '← Zurück')));
    }, { scroll: true });
  },

  /* --- Level starten ------------------------------------------------------ */
  levelStarten(id) {
    const lv = levelHolen(id);
    if (!lv) return;
    Audio3.still();
    Bewegung.alleWeg();
    HotSpots.beenden();
    UI.sperreSetzen(null);
    UI.hudZeigen(lv.name, () => App.zurueckInsMenue());
    lv.start({
      fertig: (erg) => {
        UI.ergebnis(Object.assign({
          levelId: id,
          weiter: () => App.zurueckInsMenue(),
          nochmal: () => App.levelStarten(id),
        }, erg));
      },
      abbruch: () => App.zurueckInsMenue(),
    });
  },

  zurueckInsMenue() {
    Audio3.still();
    Bewegung.alleWeg();
    HotSpots.beenden();
    UI.sperreSetzen('__menue');
    if (State.modus === 'beamer') return Beamer.menue();
    this.levelMenue();
  },

  /* --- Beamer ------------------------------------------------------------- */
  beamerStart() {
    State.modus = 'beamer';
    document.body.classList.add('beamer');
    Beamer.teamsEinrichten();
  },
};

document.addEventListener('DOMContentLoaded', () => App.start());
if (document.readyState !== 'loading') App.start();
