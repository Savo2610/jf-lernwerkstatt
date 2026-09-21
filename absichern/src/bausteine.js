/* ============================================================================
   Bausteine, die mehrere Aufgaben dieser Seite brauchen.

   Der Plan liegt oben, das Bedienfeld unten — auf jedem Bildschirm, damit
   eine Draufsicht nie von einer Karte zugedeckt wird. Daraus folgt alles
   hier: eine Rückmeldung, die nicht über den Knöpfen liegt, ein Regler, der
   in Metern denkt, und Chips für das Gerät.
   ========================================================================== */

/* --- Unterbau: Rückmeldung über dem Bedienfeld ------------------------------
   Dasselbe Problem wie bei „Brennen & Löschen": `UI.toast` legt sich mitten
   über die Antwortknöpfe, wenn die unten am Bildrand stehen, und man muss
   vier Sekunden warten, bis man weitertippen kann. Die Rückmeldung gehört
   deshalb in den Fluss darüber und hält ihren Platz frei, auch wenn nichts
   drinsteht — sonst hüpfen die Knöpfe bei jeder Meldung eine Zeile.

   `dauer: 0` lässt die Meldung stehen, bis die nächste kommt. Das ist für
   Fehler gedacht: Wer gerade falsch geraten hat, liest langsamer.
   -------------------------------------------------------------------------*/
function unterbau(...kinder) {
  const leiste = el('div', { class: 'hinweisleiste' });
  const node = el('div', { class: 'unterbau' }, leiste, ...kinder);
  let ab = null;

  node.hinweis = (text, art, dauer) => {
    clearTimeout(ab);
    leiste.innerHTML = '';
    if (!text) return;
    const t = el('div', { class: 'hinweistext ' + (art || ''), text });
    leiste.appendChild(t);
    if (dauer === 0) return;
    ab = setTimeout(() => {
      t.classList.add('weg');
      setTimeout(() => { if (t.parentNode === leiste) leiste.removeChild(t); }, 320);
    }, dauer == null ? 3600 : dauer);
  };
  return node;
}

/* --- Auftragskarte ---------------------------------------------------------
   Steht über dem Plan und sagt in einem Satz, was zu tun ist. Bewusst oben
   und nicht im Bedienfeld: Man soll sie lesen können, während man unten
   etwas antippt.                                                           */
function auftrag(titel, text) {
  return el('div', { class: 'auftrag' },
    el('b', { text: titel }),
    text ? el('span', { text }) : null);
}

/* --- Abstandsregler --------------------------------------------------------
   Ein Schieberegler, der in Metern denkt. Innen steckt ein
   `input type=range` — damit funktionieren Finger, Maus und Pfeiltasten,
   ohne dass hier etwas davon nachgebaut werden muss.

   Angezeigt wird neben den Metern immer auch die Zahl der Leitpfosten. Das
   ist kein Schmuck: Auf der Straße zählt niemand Meter, sondern Pfosten, und
   die stehen 50 m auseinander. Wer 200 m einstellt, soll sehen, dass das
   vier Pfosten sind.

   opt: { max, schritt, wert, onWert(m) }
   -------------------------------------------------------------------------*/
function abstandsregler(opt) {
  const o = opt || {};
  const eingabe = el('input', {
    type: 'range', class: 'reglereingabe',
    min: '0', max: String(o.max || 300), step: String(o.schritt || 10),
    value: String(o.wert || 0),
    'aria-label': 'Abstand vor der Einsatzstelle in Metern',
  });
  const zahl = el('div', { class: 'reglerzahl kennzahl' });
  const pfosten = el('div', { class: 'klein' });
  const node = el('div', { class: 'regler' },
    el('div', { class: 'reglerkopf' },
      el('span', { text: 'Abstand vor der Einsatzstelle' }), zahl),
    el('div', { class: 'reglerbahn' }, el('div', { class: 'reglerschiene' }), eingabe),
    pfosten);

  const melden = () => {
    const m = Number(eingabe.value);
    zahl.textContent = m + ' m';
    const n = m / LEITPFOSTEN_ABSTAND;
    pfosten.textContent = m === 0 ? 'direkt an der Einsatzstelle'
      : `${n === 1 ? 'ein Leitpfosten' : (Number.isInteger(n) ? n + ' Leitpfosten' : 'zwischen zwei Leitpfosten')} weit`;
    if (o.onWert) o.onWert(m);
  };
  eingabe.addEventListener('input', melden);
  node.wert = () => Number(eingabe.value);
  node.sperren = (ja) => { eingabe.disabled = !!ja; node.classList.toggle('zu', !!ja); };
  melden();
  return node;
}

/* --- Gerätechips -----------------------------------------------------------
   Erst das Gerät wählen, dann auf die Karte tippen. Auf dem Handy ist das
   der einzige Weg, der funktioniert: Ein Ziehen über eine halbe Autobahn
   endet dort, wo der Finger den Bildrand erreicht.

   `vorrat` ist die Beladung des Fahrzeugs. Ein Chip ohne Vorrat wird nicht
   versteckt, sondern ausgegraut — man soll sehen, dass das Gerät leer ist,
   und nicht, dass es verschwunden ist.
   -------------------------------------------------------------------------*/
function geraeteLeiste(ids, opt) {
  const o = opt || {};
  const vorrat = Object.assign({}, o.vorrat || {});
  const chips = {};
  let gewaehlt = null;

  const leiste = el('div', { class: 'geraeteleiste' },
    ids.map(id => {
      const g = GERAETE[id];
      const rest = el('span', { class: 'rest' });
      const c = el('button', { class: 'geraetchip', 'data-geraet': id },
        el('span', { class: 'ic', text: g.icon }),
        el('span', { class: 'nm', text: g.name }),
        o.vorrat ? rest : null);
      c.addEventListener('click', () => {
        if (o.vorrat && (vorrat[id] || 0) <= 0) { Audio3.falsch(); if (o.leer) o.leer(id); return; }
        Audio3.klick();
        waehlen(id);
      });
      chips[id] = { node: c, rest };
      return c;
    }));

  const malen = () => {
    for (const id in chips) {
      const leer = o.vorrat && (vorrat[id] || 0) <= 0;
      chips[id].node.classList.toggle('gewaehlt', id === gewaehlt);
      chips[id].node.classList.toggle('leer', !!leer);
      if (o.vorrat) chips[id].rest.textContent = String(vorrat[id] || 0);
    }
  };
  const waehlen = (id) => { gewaehlt = id; malen(); if (o.onWahl) o.onWahl(id); };

  leiste.wahl = () => gewaehlt;
  leiste.waehlen = waehlen;
  leiste.nehmen = (id) => { vorrat[id] = Math.max(0, (vorrat[id] || 0) - 1); malen(); };
  leiste.rest = (id) => vorrat[id] || 0;
  leiste.nachladen = (mehr) => { for (const k in mehr) vorrat[k] = (vorrat[k] || 0) + mehr[k]; malen(); };
  malen();
  if (o.wahl) waehlen(o.wahl);
  return leiste;
}

/* --- Marke auf der Karte ---------------------------------------------------
   Ein runder Knopf, der an einem Weltpunkt klebt. Größe in Bildschirmpixeln
   (siehe Marken in buehne.js), damit er am Handy zu treffen ist.           */
function planMarke(x, y, inhalt, opt) {
  const o = opt || {};
  const node = el('button', { class: 'planmarke' + (o.klasse ? ' ' + o.klasse : ''), title: o.titel || '' },
    typeof inhalt === 'string' ? el('span', { text: inhalt }) : inhalt);
  if (o.onKlick) node.addEventListener('click', () => o.onKlick(node));
  return Marken.hinzu(x, y, node);
}

/* --- Seitenlayout dieser Seite ---------------------------------------------
   Plan oben, Bedienfeld unten — und zwar immer, auch auf dem Beamer. Eine
   Draufsicht ist breit; ein Bedienfeld daneben würde sie auf ein Drittel
   zusammenquetschen. `seitenLayout` aus gemeinsam/ui.js macht es deshalb
   hier nicht, dieser Baustein schon.

   Der Bildversatz wird **gemessen und nicht geraten**. Wie hoch das
   Bedienfeld wird, weiß niemand vorher: In einer Runde stehen dort vier
   Fortschrittspunkte, in der nächsten drei Antwortkarten und eine Auflösung.
   Ein fester Wert lässt den Plan entweder unter dem Feld verschwinden oder
   am oberen Bildrand kleben, während unten die halbe Wiese leer bleibt.
   Deshalb: freie Fläche zwischen Kopfzeile und Bedienfeld ausmessen und den
   Plan genau dorthin schieben — bei jeder Änderung neu.

   `Stage.versatz` ist ein Anteil der sichtbaren Welthöhe, und die entspricht
   der Fensterhöhe. Der Weg in Pixeln lässt sich deshalb direkt umrechnen.
   -------------------------------------------------------------------------*/

/* Es darf immer nur **ein** Bedienfeld den Ausschnitt bestimmen.

   Bei einem Bildschirmwechsel bleibt der alte Bildschirm 260 ms lang im Baum,
   während er ausblendet — sein Feld ist also noch `isConnected` und maß
   munter weiter. Und weil die Bühne ihre Wachen von hinten nach vorn abläuft,
   kam die *alte* zuletzt dran und gewann: Der Plan zuckte bei jedem „Weiter"
   zwischen beiden Ausschnitten hin und her und sprang erst zurecht, wenn der
   alte Bildschirm verschwand. Deshalb meldet ein neues Feld das vorige gleich
   ab. Den Rest glättet die Bühne (`ausschnittZiehen` in buehne.js).        */
let feldWache = null;

function bedienfeld(screen, inhalt, opt) {
  const o = opt || {};
  const feld = el('div', { class: 'bedienfeld panel glas scrollbar' }, inhalt);
  screen.appendChild(el('div', { class: 'feldhuelle' }, feld));

  if (feldWache) Stage.abmelden(feldWache);

  let letzte = '';
  const nachfuehren = () => {
    const hud = $('#hud');
    const oben = hud && !hud.hidden ? hud.getBoundingClientRect().bottom : 0;
    // Auch die Auftragskarte liegt über der Bühne und nimmt ihr Platz weg.
    const karte = screen.querySelector('.auftrag');
    const obenEcht = Math.max(oben, karte ? karte.getBoundingClientRect().bottom : 0);
    const unten = feld.getBoundingClientRect().top;
    const k = Math.round(obenEcht) + 'x' + Math.round(unten) + 'x' + innerHeight;
    if (k === letzte) return;
    letzte = k;
    Stage.bildVersatz((innerHeight / 2 - (obenEcht + unten) / 2) / innerHeight, 0,
                      (unten - obenEcht) / innerHeight);
  };
  /* Die Wache hängt am Bildschirm: Ist er abgeräumt, meldet sie sich selbst
     ab, sonst zöge sie dem nächsten Bildschirm den Ausschnitt weg.

     Und sie misst **erst im nächsten Bild**, nicht sofort. `bedienfeld` wird
     mitten im Aufbau eines Bildschirms gerufen; was danach noch an Karten,
     Reglern und Auflösungen dazukommt, steht jetzt noch nicht drin. Ein Maß
     von jetzt wäre also das eines halb leeren Feldes — und genau das war der
     zweite Sprung, den man beim „Weiter" gesehen hat.                      */
  const fn = Stage.anmelden(() => {
    if (!feld.isConnected) {
      Stage.abmelden(fn);
      if (feldWache === fn) feldWache = null;
      return;
    }
    nachfuehren();
  });
  feldWache = fn;
  return feld;
}
