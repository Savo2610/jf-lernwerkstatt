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
     kurve: { vonM, bisM, versatz }   die Straße macht dort einen Bogen
   }
   Zurück kommt ein Objekt mit `gruppe` (im Stage.welt), `mx(m)` und den
   Querkoordinaten.

   **Die Straße folgt einer Mittellinie, nicht einem Rechteck.** Gezeichnet
   wird sie aus abgetasteten Linienzügen: Jede Kante – Fahrbahnrand,
   Mittelstreifen, Bankett, Leitplanke – ist ein `polyline` mit konstantem
   Querabstand zur Mitte. Ohne `kurve` ist diese Mitte überall null und es
   kommt genau dasselbe heraus wie aus geraden Rechtecken; mit `kurve` biegt
   sich alles gemeinsam.

   Der Bogen ist eine Verschiebung in y, keine echte Drehung: Die Fahrbahn
   wird dadurch im Bogen ein paar Prozent breiter, als sie sein müsste. Bei
   den flachen Bögen hier sieht das niemand, und dafür bleibt die
   Längsrichtung dieselbe Achse wie überall sonst – Meterzahlen, Maßband und
   Leitpfosten rechnen unverändert weiter.

   **Wer einem Plan eine Kurve gibt, muss alles darauf mit `aufPlan()` setzen**
   (welt/geraete.js) statt mit `stellen()`. Sonst steht das Fahrzeug an der
   Stelle, an der die Straße ohne Kurve gewesen wäre – also neben ihr.
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

  /* Einheiten -> Meter, die Umkehrung von mx. Gebraucht wird sie beim
     Abtasten: Abgetastet wird in Einheiten (sonst lägen die Stützstellen im
     gestauchten Teil viel zu dicht), die Kurve denkt aber in Metern. */
  const xm = (x) => {
    const s2 = x < 0 ? -1 : 1, a = Math.abs(x), knick = o.nah * nahProM;
    return s2 * (a <= knick ? a / nahProM : o.nah + (a - knick) / fernProM);
  };

  /* Die Fahrbahnmitte. Vor `vonM` läuft die Straße gerade; ab dort zieht sie
     quadratisch weg und erreicht bei `bisM` den vollen Versatz. Dahinter geht
     es **tangential** geradeaus weiter.

     Quadratisch und nicht als weiche S-Flanke: Ein Smoothstep hat in der
     Mitte einen Wendepunkt, und dann sind es zwei Kurven hintereinander
     statt einer. Gemeint ist hier eine Kurve – eine, die eine Innenseite hat,
     hinter der etwas stehen und die Sicht nehmen kann.                     */
  const bogenM = (m) => {
    if (!o.kurve) return 0;
    const t = (m - o.kurve.vonM) / (o.kurve.bisM - o.kurve.vonM);
    if (t <= 0) return 0;
    return o.kurve.versatz * (t <= 1 ? t * t : 1 + 2 * (t - 1));
  };
  const bogenX = (x) => bogenM(xm(x));
  /* Steigung der Mittellinie in Grad – Fahrzeuge und Pfeile drehen sich mit. */
  const neigungX = (x) => Math.atan2(bogenX(x + 3) - bogenX(x - 3), 6) * 180 / Math.PI;

  const x0 = mx(o.von), x1 = mx(o.bis), breite = x1 - x0;
  /* Der Asphalt reicht über den betrachteten Abschnitt hinaus: Ein Fahrzeug,
     das ins Bild fährt, soll auf der Straße ankommen und nicht auf der
     Wiese starten. Leitpfosten und Maßband bleiben innerhalb von von..bis. */
  const xa = x0 - 340, xb = x1 + 340, breiteA = xb - xa;
  const fbOben = q.spuren[0].von, fbUnten = q.spuren[q.spuren.length - 1].bis;
  const randOben = fbOben - (q.standstreifen ? 0 : q.bankett) - (q.leitplanke ? 30 : 0);
  const randUnten = (q.standstreifen ? q.standstreifen.bis : fbUnten + q.bankett) + (q.leitplanke ? 30 : 0);

  /* --- Abtastung ----------------------------------------------------------
     Alles Längslaufende entsteht aus denselben Stützstellen. Acht Einheiten
     sind fein genug, dass man die Ecken nicht sieht, und grob genug, dass
     das Markup nicht explodiert. */
  const proben = [];
  for (let x = xa; x < xb; x += 8) proben.push(x);
  proben.push(xb);

  /* Ein Linienzug im Querabstand `quer` zur Fahrbahnmitte. */
  const bahn = (quer, rueckwaerts) => {
    const p = proben.map(x => `${zahl2(x)},${zahl2(quer + bogenX(x))}`);
    return (rueckwaerts ? p.reverse() : p).join(' ');
  };
  /* Eine Fläche zwischen zwei Querabständen – Fahrbahn, Bankett,
     Standstreifen. Heißt bewusst nicht „band": Das ist weiter unten das
     Maßband unter der Straße. */
  const flaeche = (quer1, quer2, fill) =>
    `<polygon points="${bahn(quer1)} ${bahn(quer2, true)}" fill="${fill}"/>`;

  /* --- Untergrund --------------------------------------------------------- */
  // Das Gelände ist das Einzige, was ein Rechteck bleiben darf: Es reicht in
  // alle Richtungen weit über den Plan hinaus, ein Bogen wäre daran nicht zu
  // sehen.
  let s = `<rect x="${xa - 200}" y="${randOben - 900}" width="${breiteA + 400}" height="${randUnten - randOben + 1800}" fill="var(--gelaende)"/>`;

  // Bankett bzw. Standstreifen
  if (q.bankett) {
    s += flaeche(fbOben - q.bankett, fbOben, 'var(--bankett)')
       + flaeche(fbUnten, fbUnten + q.bankett, 'var(--bankett)');
  }
  // Fahrbahn
  s += flaeche(fbOben, fbUnten, 'var(--asphalt)');
  if (q.standstreifen) {
    s += flaeche(q.standstreifen.von, q.standstreifen.bis, 'var(--asphalt2)');
  }

  /* --- Markierungen -------------------------------------------------------
     Durchgezogen am Rand, gestrichelt zwischen den Spuren. Die Striche sind
     in Einheiten gleichmäßig und nicht in Metern: Im gestauchten Teil wären
     sie sonst ein grauer Brei.                                              */
  const strich = (quer, art) =>
    `<polyline points="${bahn(quer)}" fill="none" stroke="var(--markierung)"
       stroke-width="4"${art === 'voll' ? '' : ' stroke-dasharray="26 22" opacity=".9"'}/>`;

  s += strich(fbOben, 'voll') + strich(fbUnten, 'voll');
  if (q.mittellinie != null) s += strich(q.mittellinie, 'strich');
  for (let i = 1; i < q.spuren.length; i++) {
    if (q.spuren[i].von !== q.mittellinie) s += strich(q.spuren[i].von, 'strich');
  }
  if (q.standstreifen) s += strich(q.standstreifen.von, 'voll');

  /* --- Leitplanken --------------------------------------------------------- */
  if (q.leitplanke) {
    for (const quer of [q.leitplanke.oben, q.leitplanke.unten]) {
      s += `<polyline points="${bahn(quer)}" fill="none" stroke="var(--leitplanke)"
              stroke-width="8" stroke-linecap="round"/>`
         + `<polyline points="${bahn(quer)}" fill="none" stroke="var(--leitplanke2)"
              stroke-width="3" opacity=".7"/>`;
    }
  }

  /* --- Leitpfosten ---------------------------------------------------------
     Alle 50 Meter – das Maßband der Einsatzstelle. Wo sie im gestauchten
     Teil aufeinanderkleben, bleiben sie weg: Vier Pfosten zu zählen ist der
     Sinn, ein gepunkteter Streifen wäre keiner.                             */
  if (o.leitpfosten) {
    const querO = fbOben - (q.bankett ? q.bankett * .55 : 16);
    const querU = (q.standstreifen ? q.standstreifen.bis + 16 : fbUnten + q.bankett * .55);
    const start = Math.ceil(o.von / LEITPFOSTEN_ABSTAND) * LEITPFOSTEN_ABSTAND;
    for (let m = start; m <= o.bis; m += LEITPFOSTEN_ABSTAND) {
      if (mx(m + LEITPFOSTEN_ABSTAND) - mx(m) < 16) continue;
      const x = mx(m), hoch = bogenX(x);
      for (const quer of [querO, querU]) {
        s += `<g transform="translate(${zahl2(x)},${zahl2(quer + hoch)})">
          <rect x="-3" y="-11" width="6" height="22" rx="2" fill="var(--pfosten)"/>
          <rect x="-3" y="-4" width="6" height="5" fill="var(--pfosten-band)"/></g>`;
      }
    }
  }

  /* --- Fahrtrichtungspfeile auf dem Asphalt --------------------------------
     Sie liegen auf der Fahrbahn und drehen sich deshalb mit ihr. */
  q.spuren.forEach((sp) => {
    const quer = (sp.von + sp.bis) / 2;
    for (let i = 0; i < 4; i++) {
      const x = x0 + breite * (.12 + i * .25);
      const y = quer + bogenX(x);
      const dreh = neigungX(x) + (sp.richtung < 0 ? 180 : 0);
      s += `<g transform="translate(${zahl2(x)},${zahl2(y)}) rotate(${zahl2(dreh)})">
        <path d="M-26 -9 h 30 v -7 l 17 16 l -17 16 v -7 h -30 Z"
          fill="var(--richtungspfeil)" opacity=".5"/></g>`;
    }
  });

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
  /* Der Bogen zieht die Straße nach oben oder unten aus ihrem geraden
     Streifen heraus. Was er dort an Höhe braucht, muss der Bildausschnitt
     mitbekommen – sonst liegt die halbe Kurve außerhalb. Das Maßband bleibt
     unten, wo es ist: Es misst längs, nicht quer. */
  let bogenAuf = 0, bogenAb = 0;
  for (const x of proben) {
    const h = bogenX(x);
    if (h < bogenAuf) bogenAuf = h;
    if (h > bogenAb) bogenAb = h;
  }
  const oberkante = randOben - 40 + bogenAuf;
  const unterkante = Math.max(randUnten + 26 + bogenAb,
                              o.band === false ? -Infinity : bandY + 60);

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
    /* --- Die Kurve ------------------------------------------------------
       `bogen(m)` ist die Höhe der Fahrbahnmitte an dieser Stelle, `neigung(m)`
       ihre Steigung in Grad, `yAuf(m, quer)` die fertige y-Koordinate für
       einen Querabstand. Auf einem geraden Plan sind das 0, 0 und `quer`. */
    bogen: (m) => bogenM(m),
    neigung: (m) => neigungX(mx(m)),
    yAuf: (m, quer) => quer + bogenM(m),
    /* Eine Fläche entlang der Straße, von Meter zu Meter und zwischen zwei
       Querabständen – für Sichtschatten und alles andere, was sich mitbiegen
       muss. Zurück kommt der `points`-Text für ein <polygon>. */
    flaeche: (vonM, bisM, quer1, quer2) => {
      const p1 = [], p2 = [];
      const schritte = 24;
      for (let i = 0; i <= schritte; i++) {
        const m = lerp(vonM, bisM, i / schritte), x = mx(m), h = bogenM(m);
        p1.push(`${zahl2(x)},${zahl2(quer1 + h)}`);
        p2.unshift(`${zahl2(x)},${zahl2(quer2 + h)}`);
      }
      return p1.concat(p2).join(' ');
    },
    /* das ganze Bild, für Stage.blick */
    breite: () => breite + 60,
    hoehe: () => unterkante - oberkante,
    mitteY: () => (unterkante + oberkante) / 2,
    mitteX: () => (x0 + x1) / 2,
  };
}

/* Bequemer Blick auf einen ganzen Plan. `luft` gibt zusätzlichen Rand. */
function planZeigen(plan, luft) {
  const f = luft == null ? 1.06 : luft;
  Stage.blick(plan.mitteX(), plan.mitteY(), plan.breite() * f, plan.hoehe() * f);
}
