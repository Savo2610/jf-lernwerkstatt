/* ---------- Die Strecke ----------------------------------------------------
   Setzt aus den Themen eine durchgehende Strasse zusammen: pro Thema eine
   Kulisse, dazwischen Baeume, Buesche und Laternen. Alles wird einmal beim
   Start gezeichnet; spaeter verschieben sich nur noch die Ebenen.
   -------------------------------------------------------------------------*/

const ABSTAND = 1000;                 // Weltmeter zwischen zwei Haltepunkten
const VORLAUF = 900;                  // Strasse vor der ersten und nach der letzten Station
const KULISSE_VERSATZ = { wache: -70, uebungshof: -86, brandhaus: -66, losrad: 34, baustelle: -104 };

/* Immer dieselbe „Zufalls"-Landschaft – sonst springt sie bei jedem Neuladen */
function wuerfel(saat) {
  let s = saat >>> 0;
  return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296;
}

function baueWelt(themen) {
  const z = wuerfel(20260829);
  const stationen = themen.map((t, i) => Object.assign({}, t, { welt: i * ABSTAND, nr: i }));
  const von = -VORLAUF, bis = (themen.length - 1) * ABSTAND + VORLAUF;

  /* --- Ferne Huegel (langsamste Ebene) ---------------------------------- */
  let huegel = '';
  for (let i = 0; i < 26; i++) {
    const hx = -600 + i * 150, h = 90 + z() * 130, b = 190 + z() * 150;
    huegel += `<path d="M${hx - b} 6 Q ${hx} ${-h} ${hx + b} 6 Z" fill="var(--${i % 2 ? 'fern2' : 'fern'})"/>`;
  }
  let wald = '';
  for (let i = 0; i < 90; i++) {
    const wx = -700 + i * 46 + z() * 24, h = 40 + z() * 26;
    wald += `<path d="M${wx} 8 l ${-13} 0 l 13 ${-h} l 13 ${h} Z" fill="var(--wald)"/>`;
  }

  /* --- Ortsrand dahinter -------------------------------------------------- */
  let stadt = '';
  for (let i = 0; i < 46; i++) {
    const sx = -500 + i * 108 + z() * 40, b = 60 + z() * 46, h = 70 + z() * 80;
    stadt += `<g fill="var(--stadt)"><rect x="${sx}" y="${-h}" width="${b}" height="${h + 8}"/>
      <polygon points="${sx - 7},${-h} ${sx + b + 7},${-h} ${sx + b / 2},${-h - 26}"/></g>`;
  }

  /* --- Hauptebene: Strasse, Kulissen, Gruen ------------------------------- */
  let striche = '';
  for (let x = von; x < bis; x += 96) {
    striche += `<rect x="${x}" y="${BODEN.strasse + 40}" width="48" height="5" rx="2.5" fill="var(--weg-linie)" opacity=".8"/>`;
  }
  let gruen = '';
  for (let x = von + 40; x < bis; x += 78) {
    const naheStation = stationen.some(s => Math.abs(x - s.welt) < 400);
    if (naheStation) continue;
    const w = z();
    if (w < .42) gruen += baum(x + z() * 30, .8 + z() * .5, w < .2 ? 1 : 2);
    else if (w < .72) gruen += busch(x + z() * 30, .8 + z() * .6);
  }
  let laternen = '';
  for (let x = von + 210; x < bis; x += 520) laternen += laterne(x);

  let kulissen = '';
  stationen.forEach(s => {
    const f = KULISSEN[s.kulisse];
    if (f) kulissen += f(s.welt + (KULISSE_VERSATZ[s.kulisse] || 0));
  });
  // Die Absperrung steht direkt hinter der letzten Station – dort, wo die
  // Strasse (vorerst) aufhoert. Weiter rechts waere sie hinter der Karte.
  kulissen += kulisseEnde(stationen[stationen.length - 1].welt + 118);

  /* --- Vordergrund: laeuft schneller vorbei, leicht unscharf --------------- */
  let vorn = '';
  for (let x = von; x < bis * 1.5; x += 54) {
    const h = 14 + z() * 20, b = 6 + z() * 6;
    vorn += `<path d="M${x} 0 q ${b} ${-h} ${b * 2} 0 Z" fill="var(--gras-v)"/>`;
    if (z() < .14) vorn += busch(x + 16, .55 + z() * .45);
  }
  // Zweite, groebere Reihe weiter vorne: fuellt im Hochformat den Streifen
  // zwischen Fahrbahn und Karte, auf breiten Bildschirmen liegt sie unterhalb
  // des Bildrands.
  let vorn2 = '';
  for (let x = von; x < bis * 1.5; x += 96) {
    const h = 26 + z() * 30, b = 11 + z() * 10;
    vorn2 += `<path d="M${x} 0 q ${b} ${-h} ${b * 2} 0 Z" fill="var(--gras-d)"/>`;
    if (z() < .3) vorn2 += busch(x + 30, .9 + z() * .7);
  }
  // Der Vordergrund gehoert an den unteren Bildrand, nicht an die Hauswand
  vorn = `<g transform="translate(0,${BODEN.strasseEnde + 30})">${vorn}</g>`
       + `<g transform="translate(0,${BODEN.strasseEnde + 108})">${vorn2}</g>`;

  /* --- Himmel: Sonne bzw. Mond, Wolken, Voegel ----------------------------- */
  let wolken = '';
  for (let i = 0; i < 16; i++) wolken += wolke(-500 + i * 420 + z() * 160, -70 + z() * 140, .7 + z() * .8);
  let voegel = '';
  for (let i = 0; i < 7; i++) voegel += vogel(-200 + i * 640 + z() * 200, -40 + z() * 90, .8 + z() * .6);

  const markup = `
  <defs>
    <linearGradient id="himmelverlauf" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="var(--himmel-o)"/>
      <stop offset="58%" stop-color="var(--himmel-m)"/>
      <stop offset="100%" stop-color="var(--himmel-u)"/>
    </linearGradient>
  </defs>
  <rect id="himmel" x="-10" y="-10" width="100" height="100" fill="url(#himmelverlauf)"/>
  <g id="e-gestirn">
    <circle r="46" fill="var(--gestirn-hof)"/>
    <circle r="30" fill="var(--gestirn)"/>
  </g>
  <g id="e-himmel" data-tiefe="0.05"><g class="wolkenzug">${wolken}${voegel}</g></g>
  <g id="e-fern" data-tiefe="0.1">${huegel}${wald}</g>
  <g id="e-stadt" data-tiefe="0.32">${stadt}</g>
  <g id="boden">
    <rect id="b-gehweg" x="-10" y="${BODEN.gehweg - 2}" width="100" height="${BODEN.bord - BODEN.gehweg + 2}" fill="var(--gehweg)"/>
    <rect id="b-bord"   x="-10" y="${BODEN.bord}" width="100" height="${BODEN.strasse - BODEN.bord}" fill="var(--bord)"/>
    <rect id="b-weg"    x="-10" y="${BODEN.strasse}" width="100" height="${BODEN.strasseEnde - BODEN.strasse}" fill="var(--weg)"/>
    <rect id="b-weg2"   x="-10" y="${BODEN.strasse}" width="100" height="6" fill="var(--weg-h)"/>
    <rect id="b-gras"   x="-10" y="${BODEN.strasseEnde}" width="100" height="600" fill="var(--gras)"/>
    <rect id="b-gras2"  x="-10" y="${BODEN.strasseEnde}" width="100" height="7" fill="var(--gras-d)"/>
    <rect id="b-hinten" x="-10" y="${BODEN.gehweg - 8}" width="100" height="8" fill="var(--gras-d)"/>
  </g>
  <g id="e-welt" data-tiefe="1">${striche}${gruen}${kulissen}${laternen}</g>
  <g id="e-auto">${baueFahrzeug()}</g>
  <g id="e-vorn" data-tiefe="1.45" class="szene-unschaerfe">${vorn}</g>`;

  return { markup, stationen, von, bis };
}
