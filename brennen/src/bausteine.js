/* ============================================================================
   Bausteine, die mehrere Level dieser Seite brauchen.

   Nichts hiervon gehoert nach `gemeinsam/`: Es loest ein Layoutproblem, das
   nur hier auftritt.
   ========================================================================== */

/* --- Unterbau: Rueckmeldung ueber dem Bedienfeld ---------------------------
   `UI.toast` legt sich ueber alles. Das ist richtig, solange darunter nur die
   Buehne liegt – aber auf dieser Seite stehen die Antwortknoepfe unten am
   Bildrand, damit sie das Motiv nicht zudecken. Ein Toast liegt dann genau auf
   ihnen: Man hat die Rueckmeldung gelesen, will die naechste Antwort tippen
   und muss vier Sekunden warten, bis sie weggeblendet ist.

   Deshalb hier eine Rueckmeldung, die im Fluss steht statt darueber. Sie
   bekommt eine feste Mindesthoehe, auch wenn nichts drinsteht – sonst huepfen
   die Knoepfe darunter bei jeder Meldung eine Zeile hin und her, und man tippt
   daneben.

   Die Leiste gehoert mit ins Bedienfeld, das an `motivWache` uebergeben wird
   (also `unterbau` uebergeben, nicht das Antwortfeld) – sonst rechnet die
   Kamera mit einer freien Flaeche, in die die Leiste hineinragt.

   Aufruf:
     const unten = unterbau(feld);
     s.appendChild(unten);
     unten.hinweis('Nicht ganz. …', 'schlecht');
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
    ab = setTimeout(() => {
      t.classList.add('weg');
      // erst nach der Ausblendung raeumen, sonst springt sie weg statt zu gehen
      setTimeout(() => { if (t.parentNode === leiste) leiste.removeChild(t); }, 320);
    }, dauer == null ? 3600 : dauer);
  };
  return node;
}

/* --- Regler ----------------------------------------------------------------
   Ein Schieberegler mit Live-Anzeige. Level 3 stellt damit den Sauerstoff-
   gehalt ein, Level 4 die Gaskonzentration und die Temperatur.

   Innen steckt ein `input type=range`, und das ist Absicht: Damit bedient man
   ihn mit dem Finger, mit der Maus und mit den Pfeiltasten, ohne dass hier
   irgendetwas davon nachgebaut werden muss. Ein selbstgebauter Regler aus
   pointer-Ereignissen sieht genauso aus und kann nichts davon.

   opt: {
     min, max, schritt, wert   Zahlenbereich
     einheit                   Text hinter der Zahl, z. B. ' Vol.-%'
     beschriftung              Zeile ueber dem Regler
     zonen: [{ von, bis, farbe, name }]   faerben die Schiene ein
     anzeige(wert)             liefert den Text rechts; Standard: Zahl+Einheit
     onWert(wert)              bei jeder Aenderung
   }
   Rueckgabe ist das Element, mit `.wert()` und `.setzen(v)`.
   -------------------------------------------------------------------------*/
function regler(opt) {
  const o = opt || {};
  const min = o.min == null ? 0 : o.min;
  const max = o.max == null ? 100 : o.max;
  const anzeigeText = o.anzeige || ((v) => v + (o.einheit || ''));

  const schiene = el('div', { class: 'reglerschiene' });
  // Zonen als Farbstreifen hinter dem Regler – so sieht man, wo man ist,
  // bevor man etwas ausprobiert hat.
  (o.zonen || []).forEach(z => {
    const links = ((z.von - min) / (max - min)) * 100;
    const breite = ((z.bis - z.von) / (max - min)) * 100;
    schiene.appendChild(el('div', {
      class: 'reglerzone',
      style: { left: links + '%', width: breite + '%', background: z.farbe },
      title: z.name || '',
    }));
  });

  const eingabe = el('input', {
    type: 'range', class: 'reglereingabe',
    min: String(min), max: String(max),
    step: String(o.schritt == null ? 1 : o.schritt),
    value: String(o.wert == null ? min : o.wert),
  });
  if (o.beschriftung) eingabe.setAttribute('aria-label', o.beschriftung);

  const zahl = el('div', { class: 'reglerzahl kennzahl' });
  const node = el('div', { class: 'regler' },
    el('div', { class: 'reglerkopf' },
      el('span', { text: o.beschriftung || '' }), zahl),
    el('div', { class: 'reglerbahn' }, schiene, eingabe));

  const melden = () => {
    const v = Number(eingabe.value);
    zahl.textContent = anzeigeText(v);
    if (o.onWert) o.onWert(v);
  };
  eingabe.addEventListener('input', melden);

  node.wert = () => Number(eingabe.value);
  node.setzen = (v) => { eingabe.value = String(v); melden(); };
  node.sperren = (ja) => { eingabe.disabled = !!ja; node.classList.toggle('zu', !!ja); };
  melden();
  return node;
}
