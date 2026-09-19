/* ============================================================================
   Bausteine, die mehrere Level dieses Spiels brauchen.

   Was in `gemeinsam/ui.js` steht, benutzen beide Spiele. Was hier steht, hat
   nur mit der FwDV 3 zu tun – und soll drüben in der Brandlehre nicht
   auftauchen.
   ========================================================================== */

/* --- Fachwörterkarte ------------------------------------------------------
   Erklärt die Wörter aus BEGRIFFE (src/data/fwdv3.js) an der Stelle, an der
   sie zum ersten Mal gebraucht werden. Absichtlich keine ausklappbare Liste:
   Was man erst aufklappen muss, liest niemand – und wer die Wörter schon
   kennt, überfliegt sie in vier Sekunden.

   ids:  Reihenfolge der Begriffe, so wie sie im Level vorkommen
   opt:  { titel, breite }
   -------------------------------------------------------------------------*/
function begriffeKarte(ids, opt) {
  const o = opt || {};
  return el('div', {
    class: 'panel', style: { width: '100%', maxWidth: o.breite || '100%', textAlign: 'left' },
  },
    el('div', { class: 'klein', style: { marginBottom: '.2em' }, text: o.titel || '📖 Kurz erklärt' }),
    ids.map((id, i) => {
      const b = BEGRIFFE[id];
      if (!b) return null;
      return el('div', { style: { marginTop: i ? '.6em' : '.2em' } },
        el('b', { style: { display: 'block' } }, b.icon ? b.icon + ' ' : '', b.name),
        el('span', { class: 'klein', text: b.text }));
    }));
}

/* Ein einzelner Begriff als Merkkasten – für Levelschritte, in denen nur ein
   Wort im Weg steht und eine ganze Karte zu viel wäre. */
function begriffKasten(id) {
  const b = BEGRIFFE[id];
  if (!b) return null;
  return el('div', { class: 'feedback', style: { width: '100%' } },
    el('b', {}, b.icon ? b.icon + ' ' : '', b.name),
    el('span', { text: b.text }));
}
