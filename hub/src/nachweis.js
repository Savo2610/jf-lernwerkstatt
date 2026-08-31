/* Nachweisseite: Vorname + Code rein, Urteil raus.

   Geprueft wird gegen beide Spiele, weil das Kind selten dazusagt, aus welchem
   sein Code stammt – und weil ein Code ohnehin nur zu einem passt: die
   Spielkennung steckt mit im Hash (siehe gemeinsam/nachweis.js).

   SPIELE wird beim Bauen eingesetzt: hub/build.mjs liest die Abzeichenschluessel
   aus den beiden Datendateien. Wer dort ein Abzeichen ergaenzt, aendert damit
   auch alle Codes – das ist gewollt, ein Nachweis ueber „alle Abzeichen" muss
   sich auf den aktuellen Satz beziehen.                                      */

const form = document.getElementById('form');
const feldName = document.getElementById('name');
const feldCode = document.getElementById('code');
const knopf = document.getElementById('knopf');
const kasten = document.getElementById('ergebnis');

function zeigen(klasse, titel, ...zeilen) {
  kasten.className = klasse;
  kasten.innerHTML = '';
  const b = document.createElement('b');
  b.textContent = titel;
  kasten.appendChild(b);
  for (const z of zeilen) {
    if (!z) continue;
    const p = document.createElement('div');
    p.className = 'klein';
    p.textContent = z;
    kasten.appendChild(p);
  }
  kasten.hidden = false;
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = feldName.value.trim();
  const code = feldCode.value.trim();
  if (!name || !code) return;

  knopf.disabled = true;
  knopf.textContent = 'Prüfe …';
  try {
    for (const spiel of SPIELE) {
      const r = await NACHWEIS.pruefen(spiel.id, name, spiel.abzeichen, code);
      if (r.gilt) {
        // Angezeigt wird der eingetippte Name, nur vorne gross – sonst steht
        // hier „jonas hat alle …", wenn der Jugendwart klein getippt hat.
        const gross = name.charAt(0).toUpperCase() + name.slice(1);
        zeigen('gilt', '✓ Stimmt',
          `${gross} hat alle ${spiel.abzeichen.length} Abzeichen in „${spiel.name}“.`,
          `Fertig geworden am ${r.datum}.`);
        return;
      }
    }
    zeigen('nein', '✕ Stimmt nicht',
      'Zu diesem Vornamen gehört dieser Code nicht.',
      'Häufigster Grund: Der Code stammt von jemand anderem. Sonst nachsehen, '
      + 'ob der Vorname im Spiel genau so geschrieben steht — und ob der Code '
      + 'richtig abgetippt ist.');
  } catch (err) {
    // Web Crypto gibt es nur im sicheren Kontext. Ueber https ist das immer
    // erfuellt; wer die Datei lokal doppelklickt, steht hier sonst ratlos.
    zeigen('nein', 'Geht hier nicht',
      'Diese Seite braucht eine https-Adresse. Über jf.veerka.mp/nachweis/ funktioniert sie.');
  } finally {
    knopf.disabled = false;
    knopf.textContent = 'Prüfen';
  }
});

// Bindestrich beim Tippen selbst setzen: Die Kinder lesen den Code meist vor,
// und niemand sagt „Bindestrich".
feldCode.addEventListener('input', () => {
  const roh = feldCode.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8);
  feldCode.value = roh.length > 4 ? roh.slice(0, 4) + '-' + roh.slice(4) : roh;
});
