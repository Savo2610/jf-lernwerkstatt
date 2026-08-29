/* ---------- App: Start, Moduswahl, Levelmenue ----------------------------- */
/* Fehler sammeln statt still scheitern – hilft beim Nachvollziehen */
const Fehlerliste = [];
window.addEventListener('error', (e) => {
  Fehlerliste.push(String(e.message) + ' @' + (e.filename || '') + ':' + e.lineno);
});
window.addEventListener('unhandledrejection', (e) => {
  Fehlerliste.push('Promise: ' + String(e.reason && e.reason.message || e.reason));
});

/* Der Boss-Level ist kein Level zum Reinstolpern: Wer eine Gruppe fuehrt,
   sollte die Grundlagen sitzen haben. Sieben Sterne aus den Uebungen. */
const BOSS_STERNE = 7;

/* Rueckweg zur Startseite. Absolut und nicht relativ: das Spiel laeuft auch
   als Artifact und lokal auf Port 8412, dort gibt es kein „eine Ebene hoeher".
   Der Parameter sagt der Startseite, dass sie das Fahrzeug einfahren lassen
   soll, statt es einfach dastehen zu haben. */
const LERNWERKSTATT = 'https://jf.veerka.mp';
const LERNWERKSTATT_RUECK = LERNWERKSTATT + '/?einfahrt=1';

const App = {
  _gestartet: false,

  /* wie viele Sterne fehlen noch, um dieses Level zu oeffnen (0 = offen) */
  bossFehlt(lv) {
    if (!lv || !lv.boss) return 0;
    if (State.modus === 'beamer') return 0;   // am Gruppenabend entscheidet der Jugendwart
    return Math.max(0, BOSS_STERNE - State.sterneGesamt());
  },
  start() {
    if (this._gestartet) return;      // nur einmal hochfahren
    this._gestartet = true;
    UI.init();
    Stage.init();
    State.laden();
    // Ton darf erst nach einer Nutzeraktion starten
    const wecken = () => { Audio3.wecken(); Audio3.stimmeSuchen(); };
    window.addEventListener('pointerdown', wecken, { once: true });
    window.addEventListener('keydown', wecken, { once: true });

    // Direktsprung fuer Test und Unterricht:  ?level=<id>  bzw.  ?modus=beamer
    const q = new URLSearchParams(location.search);
    window.__eb = { Stage, State, UI, LEVELS, Teams, FAHRZEUGE, ANTRETEN, HotSpots, Fehlerliste, App, Beamer, Bewegung, Audio3 };
    const zielLevel = q.get('level');
    if (q.get('modus') === 'beamer') { this.beamerStart(); return; }
    if (zielLevel && levelHolen(zielLevel)) {
      State.modus = 'solo';
      if (!State.name) { State.name = 'Kamerad'; State.sichern(); }
      this.levelStarten(zielLevel);
      return;
    }
    // Standardweg: alleine ueben. Den Gruppenabend startet man bewusst
    // ueber das Profil – so landet niemand versehentlich im Beamer-Modus.
    this.soloStart();
  },

  /* --- Kulisse fuer Menuebildschirme ------------------------------------- */
  menueKulisse() {
    Stage.leeren();
    Stage.welt.add(baueBoden(70));
    const strasse = baueStrasse(50, 7.5);
    strasse.rotation.y = Math.PI / 2;
    Stage.welt.add(strasse);

    const lf = baueFahrzeug('lf');
    lf.position.set(1.6, 0, 0);
    lf.rotation.y = -Math.PI / 2 + .22;
    lf.userData.blaulichtAn = true;
    Stage.welt.add(lf);

    const haus = baueHaus({ breite: 8, tiefe: 7, hoehe: 6.6 });
    haus.position.set(2, 0, -13);
    Stage.welt.add(haus);
    const l = baueLaterne(); l.position.set(-8, 0, -4); Stage.welt.add(l);
    const b = baueBaum(); b.position.set(9, 0, -6); Stage.welt.add(b);

    // ein paar Kameraden am Fahrzeug
    const figuren = [];
    [['EF', -3.6, 2.2], ['ATF', -3.2, 3.4], ['ATM', -2.4, 3.9]].forEach(([r, x, z]) => {
      const f = figurFuerRolle(r);
      f.position.set(x, 0, z);
      f.rotation.y = rnd(-.6, .6) + Math.PI * .1;
      Stage.welt.add(f); figuren.push(f);
    });

    Stage.orbitAn(17.5, 3.4, [0, 1.5, 0], .05);
    Stage.anmelden((dt, t) => {
      blaulichtUpdate(lf, dt, t);
      belebeFiguren(figuren, dt, t);
    });
  },

  /* --- Solo: Profil ------------------------------------------------------- */
  soloStart() {
    State.modus = 'solo';
    document.body.classList.remove('beamer');
    if (State.name) return this.levelMenue();
    this.profil();
  },

  profil() {
    const farben = ['#ffd23f', '#ff4d3d', '#35c8ff', '#3ddc84', '#c98bff', '#ffffff'];
    UI.hudVerstecken();

    /* 3D-Vorschau: Figur steht links im Bild, Formular liegt rechts daneben */
    Stage.leeren();
    Stage.welt.add(baueBoden(40));
    const schein = new THREE.SpotLight(0xffffff, 90, 22, .75, .5, 2);
    schein.position.set(2.5, 6, 5); schein.castShadow = true;
    Stage.welt.add(schein);
    const gegen = new THREE.DirectionalLight(0x6fa8ff, 1.6);
    gegen.position.set(-4, 3, -4);
    Stage.welt.add(gegen);

    let fig = null;
    const helmVorschau = (farbe) => {
      if (fig) Stage.welt.remove(fig);
      fig = baueFigur({ helm: parseInt(farbe.slice(1), 16), pa: false });
      Stage.welt.add(fig);
    };

    const schmal = () => innerWidth < 900;
    const kameraSetzen = () => {
      if (schmal()) Stage.kameraSetzen([0, 1.45, 4.6], [0, 1.05, 0]);
      else Stage.kameraSetzen([0, 1.4, 4.3], [1.35, 1.02, 0]);
    };
    kameraSetzen();
    Stage.anmelden((dt, t) => {
      if (!fig) return;
      fig.rotation.y += dt * .45;
      belebeFiguren([fig], dt, t);
    });

    UI.zeige('profil', (s) => {
      let gewaehlt = State.helmfarbe || farben[0];
      helmVorschau(gewaehlt);

      const eingabe = el('input', {
        type: 'text', maxlength: '14', placeholder: 'Dein Name', value: State.name || '',
        style: { padding: '.75em 1.2em', borderRadius: '999px', border: '2px solid var(--linie2)',
                 background: 'rgba(10,14,26,.7)', color: 'var(--txt)', fontSize: '1.1em', fontWeight: '700',
                 textAlign: 'center', width: '100%', font: 'inherit' },
      });
      const weiter = () => {
        State.name = (eingabe.value || 'Kamerad').trim().slice(0, 14) || 'Kamerad';
        State.helmfarbe = gewaehlt;
        State.sichern();
        Audio3.klick();
        App.levelMenue();
      };
      eingabe.addEventListener('keydown', e => { if (e.key === 'Enter') weiter(); });

      const farbreihe = el('div', { style: { display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' } },
        farben.map(f => el('button', {
          style: { width: '42px', height: '42px', borderRadius: '50%', background: f, flex: '0 0 auto',
                   boxShadow: f === gewaehlt ? '0 0 0 4px var(--txt)' : '0 0 0 2px var(--linie2)',
                   transition: 'box-shadow .15s, transform .15s' },
          onclick: (e) => {
            gewaehlt = f; Audio3.klick();
            $$('button', farbreihe).forEach(x => x.style.boxShadow = '0 0 0 2px var(--linie2)');
            e.currentTarget.style.boxShadow = '0 0 0 4px var(--txt)';
            helmVorschau(f);
          },
        })));

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
        Audio3.fanfare();
        UI.toast('Fortschritt gelöscht. XP, Sterne und Abzeichen stehen wieder auf null.', 'gut', 3200);
        loeschKnopf.textContent = '✓ Zurückgesetzt';
        loeschKnopf.style.boxShadow = '';
        loeschKnopf.style.color = '';
        scharf = false;
      });

      const karte = el('div', { class: 'panel glas', style: { width: 'min(400px,92vw)', display: 'flex', flexDirection: 'column', gap: '14px', textAlign: 'center' } },
        el('div', { class: 'dienstvorschrift', style: { alignSelf: 'center' }, text: 'Feuerwehr-Dienstvorschrift 3' }),
        el('h2', { text: State.name ? 'Dein Profil' : 'Wer bist du?' }),
        el('p', { class: 'klein', style: { margin: 0 }, text: 'Name und Helmfarbe kannst du jederzeit ändern.' }),
        eingabe,
        el('div', { class: 'klein', style: { marginTop: '4px' }, text: 'Helmfarbe' }),
        farbreihe,
        el('button', { class: 'btn gross', onclick: weiter },
          State.name ? 'Weiter üben \u2192' : 'Los geht\u2019s \u2192'),
        el('div', { style: { height: '1px', background: 'var(--linie)', margin: '2px 0' } }),
        el('button', {
          class: 'btn geist', style: { fontSize: '.92em' },
          onclick: () => {
            State.name = (eingabe.value || State.name || 'Kamerad').trim().slice(0, 14) || 'Kamerad';
            State.helmfarbe = gewaehlt; State.sichern();
            Audio3.klick(); App.beamerStart();
          },
        }, '📽️ Gruppenabend am Beamer starten'),
        // beim allerersten Start gibt es noch nichts zurueckzusetzen
        State.name || State.xp > 0 ? loeschKnopf : null);

      // rechte Haelfte auf breiten Schirmen, unten auf schmalen
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
     Gegenstueck zum Ausruecken auf der Startseite: hier wird das Bild auf den
     Grundton zugezogen, drueben faehrt das Fahrzeug wieder in den Hof ein. Die
     Blende hat dieselbe Farbe wie beide Seiten – man sieht keinen Schnitt.    */
  zurLernwerkstatt() {
    if (this.faehrtHeim) return;
    this.faehrtHeim = true;
    const blende = el('div', { class: 'heimfahrt' });
    document.body.appendChild(blende);
    // ein Bild warten, damit der Uebergang ueberhaupt anlaeuft; der Zeitgeber
    // faengt den Fall ab, dass der Browser gerade keine Bilder zeichnet
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
      const kopf = el('div', { style: { textAlign: 'center', marginBottom: '4px' } },
        el('h2', { text: 'Wähle deine Ausbildung' }),
        el('p', { class: 'hinweis', text: 'Arbeite dich von oben nach unten durch – oder such dir raus, was dich interessiert.' }));

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
                UI.toast(`Noch ${fehlt} ${fehlt === 1 ? 'Stern' : 'Sterne'} – dann darfst du führen.`, 'schlecht', 2800);
                return;
              }
              Audio3.klick(); App.levelStarten(lv.id);
            },
          },
            el('span', { class: 'nr', text: lv.boss ? (fehlt > 0 ? '🔒' : '★') : String(i + 1) }),
            el('span', { class: 'ic', text: lv.icon }),
            el('b', { text: lv.name }),
            el('small', { text: fehlt > 0
              ? `Verschlossen. Sammle ${BOSS_STERNE} Sterne in den Übungen – dir fehlen noch ${fehlt}.`
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
            return el('div', { class: 'panel', style: { textAlign: 'center', opacity: hat ? 1 : .38 } },
              el('div', { style: { fontSize: '2.6em', lineHeight: 1.1 }, text: hat ? a.icon : '🔒' }),
              el('b', { text: a.name }),
              el('div', { class: 'klein', text: a.text }));
          })),
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
    UI.sperreSetzen(null);       // der erste Bildschirm des Levels setzt die Sperre
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
    if (State.modus === 'beamer') this.beamerMenue();
    else this.levelMenue();
  },

  /* --- Beamer ------------------------------------------------------------- */
  beamerStart() {
    State.modus = 'beamer';
    document.body.classList.add('beamer');
    Beamer.teamsEinrichten();
  },
  beamerMenue() { Beamer.menue(); },
};

document.addEventListener('DOMContentLoaded', () => App.start());
if (document.readyState !== 'loading') App.start();
