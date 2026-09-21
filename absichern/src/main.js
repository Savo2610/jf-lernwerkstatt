/* ---------- App: Start, Profil, Levelmenü ----------------------------------
   Aufbau wie bei den beiden 3D-Seiten – wer „Einsatzbereit" oder „Brennen &
   Löschen" kennt, findet sich sofort zurecht. Fortschritt, Ränge, Sterne und
   Abzeichen arbeiten identisch, nur mit eigenem Speicherschlüssel und eigenen
   Inhalten.

   **Es gibt hier keinen Beamer-Modus.** Die Seite ist kurz und als
   Vorbereitung auf die Jugendflamme Stufe 2 gedacht, nicht als Programm für
   einen Gruppenabend: fünf Aufgaben, die man allein durchgeht, bevor man es
   auf dem Hof mit echten Kegeln macht. Ein Quiz-Duell über Abstände wäre ein
   anderes Spiel — und die beiden großen Seiten haben eines.
   -------------------------------------------------------------------------*/
const Fehlerliste = [];
window.addEventListener('error', (e) => {
  Fehlerliste.push(String(e.message) + ' @' + (e.filename || '') + ':' + e.lineno);
});
window.addEventListener('unhandledrejection', (e) => {
  Fehlerliste.push('Promise: ' + String(e.reason && e.reason.message || e.reason));
});

/* Sterne, die der Boss-Level verlangt. Vier Übungen ergeben höchstens zwölf –
   sechs heißt also: die Hälfte sitzt. */
const BOSS_STERNE = 6;

/* Rückweg zur Startseite. Absolut und nicht relativ: die Seite läuft auch als
   Artifact und lokal auf einem eigenen Port, dort gibt es kein „eine Ebene
   höher". Der Parameter sagt der Startseite, dass sie das Fahrzeug einfahren
   lassen soll. */
const LERNWERKSTATT = 'https://jf.veerka.mp';
const LERNWERKSTATT_RUECK = LERNWERKSTATT + '/?einfahrt=1';

const App = {
  _gestartet: false,

  bossFehlt(lv) {
    if (!lv || !lv.boss) return 0;
    return Math.max(0, BOSS_STERNE - State.sterneGesamt());
  },

  start() {
    if (this._gestartet) return;
    this._gestartet = true;
    UI.init();
    Stage.init();
    State.laden();
    State.modus = 'solo';
    const wecken = () => { Audio3.wecken(); Audio3.stimmeSuchen(); };
    window.addEventListener('pointerdown', wecken, { once: true });
    window.addEventListener('keydown', wecken, { once: true });

    const q = new URLSearchParams(location.search);
    // Debug-Haken zum Prüfen im Browser – siehe docs/pruefen.md.
    window.__as = {
      Stage, State, UI, LEVELS, Marken, Fehlerliste, App, Bewegung, Audio3,
      STRASSEN, GERAETE, AUSRUESTUNG, BELADUNG, REGELN, LEITPFOSTEN_ABSTAND,
      TRUPPFARBEN, RAENGE, ABZEICHEN, NACHWEIS,
      bausteine: { baueStrecke, planZeigen, stellen, setzen, baueLF, bauePKW,
                   baueLeitkegel, baueWarndreieck, baueWarnleuchte, baueBlitzleuchte,
                   baueFaltsignal, baueFigur, baueWaldstueck, verjuengungPunkte,
                   aufPlan, setzenAuf,
                   unterbau, auftrag, abstandsregler, geraeteLeiste, planMarke, bedienfeld },
    };
    if (q.get('level') && levelHolen(q.get('level'))) {
      if (!State.name) { State.name = 'Kamerad'; State.sichern(); }
      this.levelStarten(q.get('level'));
      return;
    }
    if (State.name) this.levelMenue(); else this.profil();
  },

  /* --- Kulisse für die Menübildschirme -----------------------------------
     Eine abgesicherte Einsatzstelle, von oben und in Ruhe: das Bild, auf das
     die ganze Seite hinausläuft. Kein Unfall, keine Hektik – wer ins Menü
     kommt, soll sehen, wie es aussehen soll, wenn es fertig ist.          */
  menueKulisse() {
    Stage.leeren();
    const plan = baueStrecke({
      art: 'gegenverkehr', von: -130, bis: 130,
      nah: 22, nahProM: 5, fernProM: 1.35,
      marken: [-100, 100], leitpfosten: true,
    });
    const spurOben = plan.spurMitte(0);
    const bankettOben = plan.bankettMitte();
    const bankettUnten = plan.fbUnten + plan.bankett / 2;
    const warngeraet = `<g>${baueWarndreieck()}<g transform="translate(24,2)">${baueWarnleuchte()}</g></g>`;

    stellen(bauePKW('#2f6fd0', true), plan.mx(-2), spurOben, 5, plan.symbolSkala);
    stellen(baueLF({ name: '19/43' }), plan.mx(12), spurOben, -9, plan.symbolSkala);
    stellen(warngeraet, plan.mx(100), bankettOben, 0);
    stellen(warngeraet, plan.mx(-100), bankettUnten, 0);
    // Die Verjüngung liegt hinter dem Fahrzeug, also weiter draußen: Auf dem
    // gestauchten Teil des Plans reichen 26 bis 70 Meter für vier Kegel, die
    // man noch auseinanderhalten kann.
    verjuengungPunkte(plan, 26, 70, spurOben + 24, spurOben - 26, 4)
      .forEach(pt => stellen(baueLeitkegel(), plan.mx(pt.m), pt.y, 0));
    stellen(baueFigur({ trupp: 'wasser' }), plan.mx(6), bankettOben, 0);
    stellen(baueFigur({ trupp: 'wasser' }), plan.mx(3), bankettOben, 0);
    planZeigen(plan, 1.04);
  },

  /* --- Profil -------------------------------------------------------------
     Nur der Name, wie bei „Brennen & Löschen": Es steht keine eigene Figur
     im Bild, die eine Helmfarbe tragen könnte – von oben sieht man ohnehin
     vor allem die Warnweste, und die ist bei allen gleich.                */
  profil() {
    UI.hudVerstecken();
    this.menueKulisse();

    UI.zeige('profil', (s) => {
      const eingabe = el('input', {
        type: 'text', maxlength: '14', placeholder: 'Dein Name', value: State.name || '',
        style: { padding: '.75em 1.2em', borderRadius: '999px', border: '2px solid var(--linie2)',
                 background: 'var(--panel)', color: 'var(--txt)', fontSize: '1.1em', fontWeight: '700',
                 textAlign: 'center', width: '100%', font: 'inherit' },
      });
      /* Ab dem ersten Abzeichen gehört der Name zum Nachweis und steht fest –
         siehe gemeinsam/nachweis.js. Ändern geht nur noch über „Fortschritt
         zurücksetzen", und das kostet dann eben alles. */
      if (State.nameGesperrt()) {
        eingabe.readOnly = true;
        eingabe.tabIndex = -1;
        eingabe.style.opacity = '.7';
        eingabe.style.cursor = 'default';
        eingabe.title = 'Dein Name gehört zu deinen Abzeichen.';
      }

      const weiter = () => {
        if (!State.nameGesperrt()) State.name = (eingabe.value || 'Kamerad').trim().slice(0, 14) || 'Kamerad';
        State.sichern();
        Audio3.klick();
        App.levelMenue();
      };
      eingabe.addEventListener('keydown', e => { if (e.key === 'Enter') weiter(); });

      /* --- Fortschritt löschen: zwei Klicks, damit es kein Versehen wird -- */
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
        el('div', { class: 'dienstvorschrift', style: { alignSelf: 'center' }, text: 'Erst sichern!' }),
        el('h2', { text: State.name ? 'Dein Profil' : 'Wer bist du?' }),
        el('p', { class: 'klein', style: { margin: 0 }, text: State.nameGesperrt()
          ? 'Dein Name gehört jetzt zu deinen Abzeichen und steht fest.'
          : 'Den Namen kannst du jederzeit ändern – bis zum ersten Abzeichen.' }),
        eingabe,
        el('button', { class: 'btn gross', onclick: weiter },
          State.name ? 'Weiter üben →' : 'Los geht’s →'),
        State.name || State.xp > 0 ? loeschKnopf : null);

      s.appendChild(el('div', { style: { flex: '1', display: 'flex', justifyContent: 'center',
                                         alignItems: 'flex-end', paddingBottom: '4vh' } }, karte));
      setTimeout(() => eingabe.focus(), 260);
    });
  },

  /* --- Zurück zur Lernwerkstatt ------------------------------------------
     Wie bei den anderen: Das Bild zieht sich auf den Grundton zu, mit dem
     die Startseite ihre Einfahrt beginnt – man sieht keinen Schnitt.      */
  zurLernwerkstatt() {
    if (this.faehrtHeim) return;
    this.faehrtHeim = true;
    const blende = el('div', { class: 'heimfahrt' });
    document.body.appendChild(blende);
    requestAnimationFrame(() => blende.classList.add('an'));
    setTimeout(() => blende.classList.add('an'), 40);
    setTimeout(() => { location.href = LERNWERKSTATT_RUECK; }, 520);
  },

  /* --- Levelmenü ---------------------------------------------------------- */
  levelMenue() {
    UI.sperreSetzen('__menue');
    this.menueKulisse();
    UI.hudZeigen(`Willkommen, ${State.name}`, () => App.zurLernwerkstatt(),
      [el('i', { class: 'nur-breit' }, 'Zurück zur '), 'Lernwerkstatt']);
    UI.zeige('menue', (s) => {
      const kopf = el('div', { class: 'menuekopf' },
        el('h2', { text: 'Erst sichern, dann arbeiten' }),
        el('p', { class: 'hinweis', text: 'Fünf Aufgaben von der Anfahrt bis zur Autobahn. '
          + 'Vorbereitung auf die Jugendflamme Stufe 2 — geübt wird danach auf dem Hof.' }));

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

      // Woher die Inhalte stammen, steht hier und nicht auf der Startseite:
      // gelernt wird hier, also gehört die Quelle auch hierhin.
      fuss.appendChild(el('p', { class: 'quelle-fuss',
        text: 'Inhalte nach der FwDV 1 „Grundtätigkeiten – Lösch- und Hilfeleistungseinsatz", '
            + 'Kapitel 19, Stand Januar 2006, und der Lernunterlage „Verhalten bei Gefahr" der '
            + 'Hessischen Landesfeuerwehrschule. Alle Infos ohne Gewähr und kein Ersatz für die '
            + 'Ausbildung in der eigenen Wehr.' }));

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
    Marken.beenden();
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
    Marken.beenden();
    UI.sperreSetzen('__menue');
    this.levelMenue();
  },
};

document.addEventListener('DOMContentLoaded', () => App.start());
if (document.readyState !== 'loading') App.start();
