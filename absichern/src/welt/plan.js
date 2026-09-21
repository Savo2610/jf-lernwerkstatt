/* ============================================================================
   Die Straße von oben.

   Zwei Maßstäbe in einem Bild – und das ist Absicht, keine Schlamperei:

   * **Quer** ist ein Meter immer `QUER` Einheiten. Eine Fahrspur ist 3,5 m
     breit und damit überall gleich breit.
   * **Längs** entscheidet der Plan selbst. Eine Einsatzstelle ist 30 Meter
     lang, die Absicherung davor 800. Beides gleichzeitig maßstäblich geht
     nicht – auf einem Handy wäre entweder das Fahrzeug ein Strich oder die
     800 Meter außerhalb des Bildes. Die FwDV-1-Zeichnung löst das genauso:
     Sie bricht den Maßstab und setzt ein `//` an die Bruchstelle.

   Deshalb gibt es `nahProM` (Einheiten je Meter rund um die Einsatzstelle)
   und `fernProM` (Einheiten je Meter draußen). Wo beide gleich sind, ist der
   Plan maßstäblich und wird zur Nahaufnahme.

   **Fahrzeuge und Geräte werden nicht mitgestaucht.** Sie haben feste Größen
   in Einheiten. Im Nahplan sieht das richtig aus, im Übersichtsplan sind sie
   Symbole – wieder wie in der Vorschrift.

   Verkehrsrichtung: Der Verkehr auf der betroffenen Spur kommt **von rechts**
   und fließt nach links. Positive Meter liegen also vor der Einsatzstelle,
   dort wird abgesichert. Die Gegenrichtung kommt von links, ihre Absicherung
   liegt bei negativen Metern.
   ========================================================================== */

const QUER = 17;                       // Einheiten je Meter quer zur Fahrbahn
const SPUR = Math.round(3.5 * QUER);   // eine Fahrspur, 60

/* Die Querschnitte. `spuren` sind die Fahrstreifen von oben nach unten,
   jeweils { von, bis, richtung }. richtung -1 = nach links, +1 = nach rechts. */
const QUERSCHNITT = {
  /* Landstraße und Ortsdurchfahrt: zwei Spuren, Gegenverkehr, Bankett. */
  gegenverkehr: {
    spuren: [
      { von: -SPUR, bis: 0, richtung: -1 },
      { von: 0, bis: SPUR, richtung: 1 },
    ],
    bankett: 34, mittellinie: 0, leitplanke: null, standstreifen: null,
  },
  /* Autobahn: eine Richtungsfahrbahn, links der Mittelstreifen mit
     Leitplanke, rechts der Standstreifen und noch eine Leitplanke. */
  richtung: {
    spuren: [
      { von: -SPUR, bis: 0, richtung: -1 },
      { von: 0, bis: SPUR, richtung: -1 },
    ],
    bankett: 0, mittellinie: null,
    standstreifen: { von: SPUR, bis: SPUR + 52 },
    leitplanke: { oben: -SPUR - 26, unten: SPUR + 62 },
  },
};

const zahl2 = (n) => Math.round(n * 10) / 10;

/* --- Die Strecke bauen -----------------------------------------------------
   opt: {
     art: 'gegenverkehr' | 'richtung'
     von, bis      Meter, die gezeichnet werden
     nah           bis hierher großer Maßstab (Meter)
     nahProM, fernProM   Einheiten je Meter
     marken: [Meter]     bekommen eine Raute am Maßband
     leitpfosten: true   weiße Pfosten alle 50 m
   }
   Zurück kommt ein Objekt mit `gruppe` (im Stage.welt), `mx(m)` und den
   Querkoordinaten.
   -------------------------------------------------------------------------*/
function baueStrecke(opt) {
  const o = Object.assign({
    art: 'gegenverkehr', von: -60, bis: 60, nah: 25,
    nahProM: 5, fernProM: 1, leitpfosten: true, marken: [],
  }, opt);
  const q = QUERSCHNITT[o.art];
  const nahProM = o.nahProM, fernProM = o.fernProM == null ? o.nahProM : o.fernProM;

  /* Meter -> Einheiten. Bis `nah` im großen Maßstab, danach gestaucht. */
  const mx = (m) => {
    const s = m < 0 ? -1 : 1, a = Math.abs(m);
    return s * (a <= o.nah ? a * nahProM : o.nah * nahProM + (a - o.nah) * fernProM);
  };
  const gebrochen = fernProM !== nahProM;

  const x0 = mx(o.von), x1 = mx(o.bis), breite = x1 - x0;
  /* Der Asphalt reicht über den betrachteten Abschnitt hinaus: Ein Fahrzeug,
     das ins Bild fährt, soll auf der Straße ankommen und nicht auf der
     Wiese starten. Leitpfosten und Maßband bleiben innerhalb von von..bis. */
  const xa = x0 - 340, xb = x1 + 340, breiteA = xb - xa;
  const fbOben = q.spuren[0].von, fbUnten = q.spuren[q.spuren.length - 1].bis;
  const randOben = fbOben - (q.standstreifen ? 0 : q.bankett) - (q.leitplanke ? 30 : 0);
  const randUnten = (q.standstreifen ? q.standstreifen.bis : fbUnten + q.bankett) + (q.leitplanke ? 30 : 0);

  /* --- Untergrund --------------------------------------------------------- */
  let s = `<rect x="${xa - 200}" y="${randOben - 900}" width="${breiteA + 400}" height="${randUnten - randOben + 1800}" fill="var(--gelaende)"/>`;

  // Bankett bzw. Standstreifen
  if (q.bankett) {
    s += `<rect x="${xa}" y="${fbOben - q.bankett}" width="${breiteA}" height="${q.bankett}" fill="var(--bankett)"/>`
       + `<rect x="${xa}" y="${fbUnten}" width="${breiteA}" height="${q.bankett}" fill="var(--bankett)"/>`;
  }
  // Fahrbahn
  s += `<rect x="${xa}" y="${fbOben}" width="${breiteA}" height="${fbUnten - fbOben}" fill="var(--asphalt)"/>`;
  if (q.standstreifen) {
    s += `<rect x="${xa}" y="${q.standstreifen.von}" width="${breiteA}" height="${q.standstreifen.bis - q.standstreifen.von}" fill="var(--asphalt2)"/>`;
  }

  /* --- Markierungen -------------------------------------------------------
     Durchgezogen am Rand, gestrichelt zwischen den Spuren. Die Striche sind
     in Einheiten gleichmäßig und nicht in Metern: Im gestauchten Teil wären
     sie sonst ein grauer Brei.                                              */
  const strich = (y, art) => art === 'voll'
    ? `<rect x="${xa}" y="${y - 2}" width="${breiteA}" height="4" fill="var(--markierung)"/>`
    : `<line x1="${xa}" y1="${y}" x2="${xb}" y2="${y}" stroke="var(--markierung)" stroke-width="4"
         stroke-dasharray="26 22" opacity=".9"/>`;

  s += strich(fbOben, 'voll') + strich(fbUnten, 'voll');
  if (q.mittellinie != null) s += strich(q.mittellinie, 'strich');
  for (let i = 1; i < q.spuren.length; i++) {
    if (q.spuren[i].von !== q.mittellinie) s += strich(q.spuren[i].von, 'strich');
  }
  if (q.standstreifen) s += strich(q.standstreifen.von, 'voll');

  /* --- Leitplanken --------------------------------------------------------- */
  if (q.leitplanke) {
    for (const y of [q.leitplanke.oben, q.leitplanke.unten]) {
      s += `<rect x="${xa}" y="${y - 4}" width="${breiteA}" height="8" rx="4" fill="var(--leitplanke)"/>`
         + `<rect x="${xa}" y="${y - 1.5}" width="${breiteA}" height="3" fill="var(--leitplanke2)" opacity=".7"/>`;
    }
  }

  /* --- Leitpfosten ---------------------------------------------------------
     Alle 50 Meter – das Maßband der Einsatzstelle. Wo sie im gestauchten
     Teil aufeinanderkleben, bleiben sie weg: Vier Pfosten zu zählen ist der
     Sinn, ein gepunkteter Streifen wäre keiner.                             */
  let pfosten = '';
  if (o.leitpfosten) {
    const yO = fbOben - (q.bankett ? q.bankett * .55 : 16);
    const yU = (q.standstreifen ? q.standstreifen.bis + 16 : fbUnten + q.bankett * .55);
    const start = Math.ceil(o.von / LEITPFOSTEN_ABSTAND) * LEITPFOSTEN_ABSTAND;
    for (let m = start; m <= o.bis; m += LEITPFOSTEN_ABSTAND) {
      const abstandEinheiten = mx(m + LEITPFOSTEN_ABSTAND) - mx(m);
      if (abstandEinheiten < 16) continue;
      const x = mx(m);
      for (const y of [yO, yU]) {
        pfosten += `<g transform="translate(${zahl2(x)},${zahl2(y)})">
          <rect x="-3" y="-11" width="6" height="22" rx="2" fill="var(--pfosten)"/>
          <rect x="-3" y="-4" width="6" height="5" fill="var(--pfosten-band)"/></g>`;
      }
    }
  }
  s += pfosten;

  /* --- Fahrtrichtungspfeile auf dem Asphalt -------------------------------- */
  let pfeile = '';
  q.spuren.forEach((sp) => {
    const y = (sp.von + sp.bis) / 2;
    for (let i = 0; i < 4; i++) {
      const x = x0 + breite * (.12 + i * .25);
      const d = sp.richtung;
      pfeile += `<path d="M${x - 26 * d} ${y - 9} h 30 v -7 l 17 16 l -17 16 v -7 h -30 Z"
        transform="${d < 0 ? `rotate(180,${x},${y})` : ''}" fill="var(--richtungspfeil)" opacity=".5"/>`;
    }
  });
  s += pfeile;

  const gruppe = Stage.hinzu(s);

  /* --- Maßband unter der Straße --------------------------------------------
     Die Linie mit den Rauten aus der Vorschrift. Sie sagt, was das Bild
     sonst verschweigt: dass der Maßstab gebrochen ist.

     In der Nahaufnahme bleibt es weg (`band: false`): Dort gibt es keine
     Entfernungen zu lesen, und ein Band ohne Marken ist nur ein Strich, der
     Platz kostet.                                                          */
  const bandY = randUnten + 54;
  let band = `<line x1="${x0}" y1="${bandY}" x2="${x1}" y2="${bandY}" stroke="var(--band)" stroke-width="2.5"/>`;
  const raute = (x, betont) => `<path d="M${x} ${bandY - 9} L${x + 9} ${bandY} L${x} ${bandY + 9} L${x - 9} ${bandY} Z"
      fill="${betont ? 'var(--warn)' : 'var(--band)'}"/>`;
  band += raute(mx(0), true);
  (o.marken || []).forEach(m => {
    band += raute(mx(m));
    band += `<text class="t-plan" x="${mx(m)}" y="${bandY + 32}" text-anchor="middle" font-size="26" fill="var(--band-txt)">${Math.abs(m)} m</text>`;
  });
  band += `<text class="t-plan" x="${mx(0)}" y="${bandY + 32}" text-anchor="middle" font-size="26" fill="var(--warn)">Einsatzstelle</text>`;
  // Bruchstelle sichtbar machen – zweimal, links und rechts
  if (gebrochen) {
    for (const s2 of [-1, 1]) {
      const bx = mx(s2 * (o.nah + (Math.abs(s2 > 0 ? o.bis : o.von) - o.nah) * .5));
      if (Math.abs(bx) < 20 || (s2 > 0 ? o.bis : -o.von) <= o.nah) continue;
      band += `<path d="M${bx - 11} ${bandY + 10} l 9 -20 M${bx + 2} ${bandY + 10} l 9 -20"
        stroke="var(--band)" stroke-width="2.5" fill="none"/>`;
    }
  }
  const bandGruppe = o.band === false ? null : Stage.hinzu(band);
  const unterkante = o.band === false ? randUnten + 26 : bandY + 60;

  return {
    gruppe, bandGruppe, mx, art: o.art, von: o.von, bis: o.bis,
    spuren: q.spuren, fbOben, fbUnten, randOben, randUnten,
    bankett: q.bankett, standstreifen: q.standstreifen, leitplanke: q.leitplanke,
    /* Mitte einer Fahrspur (0 = oben) */
    spurMitte: (i) => (q.spuren[i].von + q.spuren[i].bis) / 2,
    /* Mitte des Banketts bzw. des Standstreifens auf der Einsatzstellenseite */
    bankettMitte: () => q.standstreifen
      ? (q.standstreifen.von + q.standstreifen.bis) / 2
      : fbOben - q.bankett / 2,
    /* Hinter der Leitplanke – dort, wo man laufen soll, wenn es eine gibt */
    hinterPlanke: () => q.leitplanke ? q.leitplanke.unten + 24 : fbUnten + q.bankett + 22,
    /* Maßstab für Fahrzeuge. Sie sind in festen Einheiten gezeichnet; wo der
       Längsmaßstab klein ist, müssen sie mitschrumpfen, sonst deckt ein
       Löschfahrzeug fünfzig Meter Straße ab. Nach unten gedeckelt, weil ein
       Fahrzeug auch auf 800 Metern noch als Fahrzeug erkennbar bleiben muss. */
    symbolSkala: clamp(nahProM / 13, .42, 1),
    /* das ganze Bild, für Stage.blick */
    breite: () => breite + 60,
    hoehe: () => unterkante - (randOben - 40),
    mitteY: () => (unterkante + (randOben - 40)) / 2,
    mitteX: () => (x0 + x1) / 2,
  };
}

/* Bequemer Blick auf einen ganzen Plan. `luft` gibt zusätzlichen Rand. */
function planZeigen(plan, luft) {
  const f = luft == null ? 1.06 : luft;
  Stage.blick(plan.mitteX(), plan.mitteY(), plan.breite() * f, plan.hoehe() * f);
}
