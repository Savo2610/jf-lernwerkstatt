/* ---------- Die Kulisse ----------------------------------------------------
   Alles hier ist SVG als Zeichenkette. Ein einziges Koordinatensystem:
   y = 0 ist der Boden, auf dem die Haeuser stehen, negatives y geht nach oben,
   positives y nach vorne zur Strasse hin. x waechst nach rechts – in
   Fahrtrichtung. Die Ebenen bekommen spaeter nur noch ein translate().

   Farben kommen ausschliesslich aus CSS-Variablen, damit Tag und Nacht
   dieselbe Zeichnung benutzen koennen.
   -------------------------------------------------------------------------*/

/* Bodenstreifen von hinten nach vorne (Werte = y) */
const BODEN = {
  gehweg: 0, bord: 18, strasse: 26, strasseEnde: 112, radspur: 96,
};

const zahl = (n) => Math.round(n * 100) / 100;

/* ---------- Kleinkram ----------------------------------------------------- */

function baum(x, groesse, art) {
  const g = groesse || 1, h = 108 * g, b = 34 * g;
  const laub = art === 2
    ? `<path d="M0 ${-h} C ${b * 1.5} ${-h} ${b * 1.7} ${-h * .42} 0 ${-h * .34}
         C ${-b * 1.7} ${-h * .42} ${-b * 1.5} ${-h} 0 ${-h} Z" fill="var(--laub)"/>
       <path d="M0 ${-h * .96} C ${b * 1.1} ${-h * .92} ${b * 1.2} ${-h * .5} 0 ${-h * .44}
         C ${-b * 1.2} ${-h * .5} ${-b * 1.1} ${-h * .92} 0 ${-h * .96} Z" fill="var(--laub2)" opacity=".55"/>`
    : `<circle cx="0" cy="${-h * .74}" r="${b * 1.24}" fill="var(--laub)"/>
       <circle cx="${-b * .8}" cy="${-h * .55}" r="${b * .92}" fill="var(--laub)"/>
       <circle cx="${b * .82}" cy="${-h * .58}" r="${b * .86}" fill="var(--laub)"/>
       <circle cx="${b * .3}" cy="${-h * .82}" r="${b * .7}" fill="var(--laub2)" opacity=".5"/>`;
  return `<g transform="translate(${zahl(x)},0)">
    <ellipse cx="0" cy="2" rx="${b * 1.2}" ry="${5 * g}" fill="rgba(0,0,0,.14)"/>
    <rect x="${-4 * g}" y="${-h * .5}" width="${8 * g}" height="${h * .5}" fill="var(--stamm)" rx="${2 * g}"/>
    ${laub}</g>`;
}

function busch(x, g) {
  const s = g || 1;
  return `<g transform="translate(${zahl(x)},0)">
    <ellipse cx="0" cy="1" rx="${26 * s}" ry="${5 * s}" fill="rgba(0,0,0,.12)"/>
    <circle cx="${-11 * s}" cy="${-11 * s}" r="${13 * s}" fill="var(--laub2)"/>
    <circle cx="${10 * s}" cy="${-10 * s}" r="${12 * s}" fill="var(--laub2)"/>
    <circle cx="0" cy="${-17 * s}" r="${15 * s}" fill="var(--laub)"/></g>`;
}

/* Strassenlaterne – der Kopf haengt ueber die Fahrbahn, nachts mit Lichtkegel */
function laterne(x) {
  return `<g transform="translate(${zahl(x)},${BODEN.bord})">
    <ellipse cx="0" cy="1" rx="9" ry="3" fill="rgba(0,0,0,.2)"/>
    <rect x="-4" y="-150" width="8" height="150" fill="var(--metall)" rx="3"/>
    <path d="M0 -150 q 0 -22 26 -22 h 12" fill="none" stroke="var(--metall)" stroke-width="7" stroke-linecap="round"/>
    <rect x="34" y="-176" width="26" height="9" rx="4" fill="var(--metall)"/>
    <path d="M36 -167 h22 l-4 9 h-14 Z" fill="var(--fenster-r)"/>
    <path d="M47 -160 l 46 84 h -92 Z" fill="var(--lichtkegel)"/></g>`;
}

function hydrant(x) {
  return `<g transform="translate(${zahl(x)},${BODEN.bord - 2})">
    <ellipse cx="0" cy="1" rx="11" ry="3.5" fill="rgba(0,0,0,.2)"/>
    <rect x="-8" y="-30" width="16" height="30" rx="5" fill="var(--rot)"/>
    <rect x="-13" y="-24" width="26" height="6" rx="3" fill="var(--rot-t)"/>
    <circle cx="0" cy="-33" r="7" fill="var(--rot-t)"/></g>`;
}

function schlauchrolle(x) {
  return `<g transform="translate(${zahl(x)},${BODEN.gehweg - 2})">
    <ellipse cx="0" cy="2" rx="22" ry="6" fill="rgba(0,0,0,.16)"/>
    <circle cx="0" cy="-13" r="16" fill="none" stroke="var(--rot)" stroke-width="7"/>
    <circle cx="0" cy="-13" r="7" fill="none" stroke="var(--rot-t)" stroke-width="5"/></g>`;
}

/* Bauzaun aus Gitterelementen. Stand frueher fest im Brandhaus; seit
   „Brennen & Loeschen" in die Zielgerade gegangen ist, wird er gebraucht,
   wo gerade wirklich gebaut wird – deshalb jetzt als eigener Baustein.      */
function bauzaun(x, breite, hoehe) {
  const b = breite || 220, h = hoehe || 64;
  let gitter = '';
  for (let i = 0; i * 12 < b - 22; i++) {
    gitter += `<line x1="${i * 12}" y1="-2" x2="${i * 12 + 22}" y2="${-h}" stroke="var(--metall)" stroke-width="2.4" opacity=".85"/>`;
  }
  return `<g transform="translate(${zahl(x)},0)" opacity=".9">
    <rect x="0" y="${-h - 2}" width="${b}" height="4" rx="2" fill="var(--metall)"/>
    <rect x="0" y="-6" width="${b}" height="4" rx="2" fill="var(--metall)"/>
    ${gitter}
    <rect x="-4" y="${-h - 6}" width="7" height="${h + 6}" rx="3" fill="var(--metall)"/>
    <rect x="${b - 3}" y="${-h - 6}" width="7" height="${h + 6}" rx="3" fill="var(--metall)"/></g>`;
}

function wolke(x, y, s) {
  return `<g transform="translate(${zahl(x)},${zahl(y)}) scale(${s})" opacity="var(--wolke-a)">
    <circle cx="0" cy="0" r="26" fill="var(--wolke)"/>
    <circle cx="30" cy="6" r="19" fill="var(--wolke)"/>
    <circle cx="-28" cy="7" r="17" fill="var(--wolke)"/>
    <rect x="-28" y="0" width="60" height="20" rx="10" fill="var(--wolke)"/></g>`;
}

function vogel(x, y, s) {
  return `<path transform="translate(${zahl(x)},${zahl(y)}) scale(${s || 1})"
    d="M-9 0 q 5 -6 9 0 q 4 -6 9 0" fill="none" stroke="var(--txt3)" stroke-width="2"
    stroke-linecap="round" opacity=".55"/>`;
}


/* Das KLF 19/49 steht auf dem Hof vor der Wache – gleiche Handschrift wie das
   LF, nur kuerzer und ohne laufendes Blaulicht.                              */
function baueKLF(x) {
  const rad = (cx, r) => `<g transform="translate(${cx},${-r})">
      <circle r="${r}" fill="#181c25"/><circle r="${r * .6}" fill="var(--metall)"/>
      <circle r="${r * .18}" fill="#5a6273"/></g>`;
  return `<g transform="translate(${zahl(x)},${BODEN.gehweg + 8}) scale(.78)">
    <ellipse cx="0" cy="3" rx="76" ry="7" fill="rgba(0,0,0,.2)"/>
    <rect x="-72" y="-34" width="146" height="14" rx="4" fill="#2b3140"/>
    <path d="M-74 -80 h 148 a6 6 0 0 1 6 6 v 52 a6 6 0 0 1 -6 6 h -148 a6 6 0 0 1 -6 -6 v -52 a6 6 0 0 1 6 -6 Z" fill="var(--rot)"/>
    <path d="M-80 -50 h 160 v 8 h -160 Z" fill="#fff" opacity=".9"/>
    <rect x="-68" y="-76" width="52" height="22" rx="2" fill="rgba(0,0,0,.13)"/>
    <path d="M12 -78 h 60 a4 4 0 0 1 4 4 v 24 h -64 Z" fill="#1d2534"/>
    <path d="M16 -74 h 54 a2 2 0 0 1 2 2 v 18 h -56 Z" fill="var(--fenster)" opacity=".92"/>
    <rect x="-16" y="-90" width="46" height="9" rx="4" fill="#20263a"/>
    <rect x="-13" y="-92" width="18" height="8" rx="4" fill="#4bb8ff"/>
    <rect x="9" y="-92" width="18" height="8" rx="4" fill="#4bb8ff"/>
    <text class="t-display" x="-70" y="-28" font-size="14" fill="#fff" letter-spacing=".8">FLORIAN 19/49</text>
    ${rad(-42, 15)}${rad(46, 15)}</g>`;
}

/* ---------- Kulisse 1: die Feuerwache -------------------------------------
   Am Gehweg haengt ein Schaukasten mit dem Team Zukunft auf Instagram – der
   einzige Weg, der aus der Strasse herausfuehrt. Bewusst klein: wer ihn
   findet, findet ihn; im Fuss steht derselbe Link noch einmal als Fliesstext.

   Der Link traegt tabindex="-1", und das ist Absicht. Ein Tabstopp mitten in
   der Kulisse braechte den Browser dazu, das Ziel sichtbar zu scrollen.
   #buehne steht zwar auf overflow:hidden, laesst sich programmatisch aber
   trotzdem verschieben – die Buehne haengt danach dauerhaft schief. Den
   tastaturgaengigen Weg zu Instagram gibt es unten im Fuss.                  */
function kulisseWache(x) {
  let tore = '';
  for (let i = 0; i < 2; i++) {
    const tx = 30 + i * 112;
    let lamellen = '';
    for (let j = 1; j < 8; j++) lamellen += `<line x1="${tx + 4}" y1="${-116 + j * 14}" x2="${tx + 92}" y2="${-116 + j * 14}" stroke="rgba(0,0,0,.16)" stroke-width="2"/>`;
    tore += `<g><rect x="${tx}" y="-118" width="96" height="118" rx="3" fill="var(--tor)"/>
      ${lamellen}
      <rect x="${tx - 4}" y="-124" width="104" height="8" rx="3" fill="var(--metall)"/></g>`;
  }
  let turmfenster = '';
  for (let i = 0; i < 2; i++) turmfenster += `<rect x="264" y="${-222 + i * 46}" width="34" height="30" rx="3" fill="var(--fenster)"/>`;
  return `<g transform="translate(${zahl(x)},0)">
    <!-- Schlauchturm -->
    <rect x="252" y="-236" width="58" height="236" fill="var(--haus2)"/>
    <rect x="244" y="-250" width="74" height="16" rx="3" fill="var(--dach2)"/>
    ${turmfenster}
    <rect x="279" y="-292" width="4" height="44" fill="var(--metall)"/>
    <circle class="blinker" cx="281" cy="-296" r="5" fill="var(--rot)"/>
    <!-- Hauptbau -->
    <rect x="0" y="-160" width="260" height="160" fill="var(--haus)"/>
    <polygon points="-16,-160 276,-160 258,-202 2,-202" fill="var(--dach)"/>
    <rect x="-18" y="-168" width="296" height="10" rx="4" fill="var(--dach2)"/>
    <rect x="18" y="-152" width="224" height="26" rx="4" fill="var(--schild)"/>
    <text class="t-display" x="130" y="-133" text-anchor="middle" font-size="14"
      letter-spacing="1.6" fill="var(--schild-txt)">FEUERWEHR HARHEIM</text>
    ${tore}
    ${baueKLF(-176)}
    <!-- Schaukasten: der versteckte Weg zum Team Zukunft -->
    <a class="aushang" href="https://www.instagram.com/ff_harheim_teamzukunft/"
       target="_blank" rel="noopener noreferrer" tabindex="-1"
       aria-label="Team Zukunft der Jugendfeuerwehr Harheim auf Instagram">
      <title>Team Zukunft auf Instagram</title>
      <g transform="translate(348,0)">
        <ellipse cx="0" cy="1" rx="16" ry="4" fill="rgba(0,0,0,.18)"/>
        <rect x="-3.5" y="-86" width="7" height="86" rx="3" fill="var(--metall)"/>
        <rect x="-44" y="-146" width="88" height="64" rx="6" fill="var(--metall)"/>
        <rect x="-39" y="-141" width="78" height="54" rx="3" fill="var(--schild)"/>
        <g transform="translate(0,-118)" fill="none" stroke="var(--rot)" stroke-width="2.1">
          <rect x="-8.5" y="-8.5" width="17" height="17" rx="5"/>
          <circle cx="0" cy="0" r="3.9"/>
          <circle cx="5" cy="-5" r="1.1" fill="var(--rot)" stroke="none"/>
        </g>
        <text class="t-text" x="0" y="-93" text-anchor="middle" font-size="7.5"
          letter-spacing=".5" fill="var(--schild-txt)">TEAM ZUKUNFT</text>
      </g>
    </a>
    <!-- Fahnenmast -->
    <rect x="-52" y="-168" width="5" height="168" rx="2" fill="var(--metall)"/>
    <path d="M-47 -166 q 26 8 52 0 v 34 q -26 8 -52 0 Z" fill="var(--rot)"/>
    <text class="t-display" x="-21" y="-142" text-anchor="middle" font-size="15" fill="#fff">JF</text>
  </g>`;
}

/* ---------- Kulisse 2: der Uebungshof (FwDV 3) ---------------------------- */
function kulisseUebungshof(x) {
  let oeffnungen = '';
  for (let i = 0; i < 3; i++) {
    oeffnungen += `<rect x="86" y="${-234 + i * 58}" width="30" height="38" rx="2" fill="var(--schild)"/>
      <rect x="122" y="${-234 + i * 58}" width="30" height="38" rx="2" fill="var(--fenster)"/>`;
  }
  return `<g transform="translate(${zahl(x)},0)">
    <!-- Steigerturm -->
    <rect x="72" y="-252" width="94" height="252" fill="var(--haus2)"/>
    <rect x="64" y="-266" width="110" height="16" rx="3" fill="var(--dach2)"/>
    ${oeffnungen}
    <rect x="80" y="-196" width="78" height="5" rx="2" fill="var(--metall)"/>
    <rect x="80" y="-138" width="78" height="5" rx="2" fill="var(--metall)"/>
    <!-- Nebengebaeude -->
    <rect x="-40" y="-118" width="110" height="118" fill="var(--haus)"/>
    <polygon points="-52,-118 82,-118 70,-146 -40,-146" fill="var(--dach)"/>
    <rect x="-16" y="-72" width="34" height="72" rx="3" fill="var(--tor)"/>
    <rect x="30" y="-90" width="30" height="30" rx="3" fill="var(--fenster)"/>
    <!-- Schild an der Strasse -->
    <rect x="204" y="-92" width="9" height="92" rx="3" fill="var(--metall)"/>
    <rect x="164" y="-152" width="90" height="62" rx="8" fill="var(--schild)"/>
    <text class="t-display" x="209" y="-124" text-anchor="middle" font-size="26" fill="var(--schild-txt)">FwDV</text>
    <text class="t-display" x="209" y="-101" text-anchor="middle" font-size="22" fill="var(--gelb)">3</text>
    ${schlauchrolle(-108)}
    ${hydrant(-152)}
  </g>`;
}

/* ---------- Kulisse 3: Brennen & Loeschen --------------------------------- */
function kulisseBrandhaus(x) {
  let wellen = '';
  for (let i = 1; i < 9; i++) wellen += `<line x1="${i * 21}" y1="-100" x2="${i * 21}" y2="0" stroke="rgba(0,0,0,.13)" stroke-width="2"/>`;
  const flamme = (dx, h, k) => `<g transform="translate(${dx},0)">
    <path class="flamme ${k}"
      d="M0 0 c -${h * .36} -${h * .3} -${h * .2} -${h * .62} 0 -${h}
         c ${h * .2} ${h * .38} ${h * .36} ${h * .7} 0 ${h} Z" fill="var(--flamme2)"/>
    <path class="flamme ${k}"
      d="M0 0 c -${h * .2} -${h * .18} -${h * .1} -${h * .38} 0 -${h * .6}
         c ${h * .1} ${h * .22} ${h * .2} ${h * .42} 0 ${h * .6} Z" fill="var(--flamme1)"/></g>`;
  return `<g transform="translate(${zahl(x)},0)">
    <!-- Bauwagen -->
    <rect x="0" y="-100" width="190" height="100" rx="4" fill="var(--haus2)"/>
    ${wellen}
    <rect x="-8" y="-112" width="206" height="12" rx="4" fill="var(--metall)"/>
    <rect x="126" y="-70" width="38" height="70" rx="3" fill="var(--tor)"/>
    <rect x="26" y="-76" width="52" height="34" rx="3" fill="var(--fenster)"/>
    <!-- Tafel mit dem Verbrennungsdreieck -->
    <rect x="228" y="-96" width="9" height="96" rx="3" fill="var(--metall)"/>
    <rect x="188" y="-176" width="90" height="84" rx="9" fill="var(--schild)"/>
    <polygon points="233,-166 274,-102 192,-102" fill="none" stroke="var(--gelb)" stroke-width="5" stroke-linejoin="round"/>
    <g transform="translate(233,-114) scale(.52)">${flamme(0, 42, '')}</g>
    <!-- Lagerfeuer im Steinring -->
    <g transform="translate(-104,${BODEN.gehweg + 6})">
      <ellipse cx="0" cy="0" rx="30" ry="9" fill="rgba(0,0,0,.16)"/>
      <rect x="-21" y="-8" width="42" height="8" rx="4" fill="var(--stamm)" transform="rotate(-8)"/>
      <rect x="-21" y="-8" width="42" height="8" rx="4" fill="var(--stamm)" transform="rotate(9)"/>
      ${flamme(-8, 22, 'b')}${flamme(8, 19, 'c')}${flamme(0, 31, '')}
      <ellipse cx="-27" cy="-2" rx="9" ry="6" fill="var(--stein)"/>
      <ellipse cx="27" cy="-2" rx="9" ry="6" fill="var(--stein)"/>
      <ellipse cx="0" cy="2" rx="10" ry="5.5" fill="var(--stein)"/>
    </g>
  </g>`;
}

/* ---------- Kulisse 4: die Baustelle --------------------------------------
   Hinter dem Zaun steht noch nichts – das ist der Punkt. Ein Kran, ein Stapel
   Rohre, ein Haufen Aushub: hier entsteht das naechste Thema. Frueher stand
   der Zaun vor dem Brandhaus; er ist eine Station weitergewandert, als
   „Brennen & Loeschen" in die Zielgerade ging.                               */
function kulisseBaustelle(x) {
  // Gittermast: pro Feld ein Andreaskreuz, sonst wirkt er wie ein Balken
  let mast = '';
  for (let i = 0; i < 7; i++) {
    const y = -24 - i * 30;
    mast += `<path d="M0 ${y} L26 ${y - 30} M26 ${y} L0 ${y - 30}" stroke="var(--metall)" stroke-width="2.4" opacity=".8"/>`;
  }
  // Rohrstapel: drei, zwei, eins
  let rohre = '';
  for (let r = 0; r < 3; r++) {
    for (let i = 0; i < 3 - r; i++) {
      rohre += `<circle cx="${i * 24 + r * 12}" cy="${-11 - r * 21}" r="11.5" fill="var(--metall)"/>
        <circle cx="${i * 24 + r * 12}" cy="${-11 - r * 21}" r="6" fill="rgba(0,0,0,.22)"/>`;
    }
  }
  return `<g transform="translate(${zahl(x)},0)">
    <!-- Kran. Der Ausleger zeigt nach links, ueber die Grube. -->
    <g transform="translate(176,0)">
      <rect x="-14" y="-16" width="54" height="16" rx="4" fill="var(--metall)"/>
      <rect x="0" y="-234" width="4" height="234" fill="var(--metall)"/>
      <rect x="22" y="-234" width="4" height="234" fill="var(--metall)"/>
      ${mast}
      <rect x="-8" y="-258" width="42" height="10" rx="4" fill="var(--rot)"/>
      <rect x="-152" y="-250" width="152" height="5" rx="2.5" fill="var(--metall)"/>
      <path d="M-150 -247 L0 -256 M-150 -247 L-74 -247" stroke="var(--metall)" stroke-width="2.4" fill="none" opacity=".8"/>
      <g class="haken">
        <line x1="-112" y1="-245" x2="-112" y2="-124" stroke="var(--metall)" stroke-width="2"/>
        <rect x="-121" y="-126" width="18" height="10" rx="3" fill="var(--gelb)"/>
        <path d="M-112 -116 q -9 8 0 15 q 9 -7 0 -15 Z" fill="var(--metall)"/>
      </g>
    </g>
    <!-- Grube mit Aushub -->
    <g transform="translate(0,${BODEN.gehweg - 1})">
      <ellipse cx="96" cy="0" rx="86" ry="12" fill="rgba(0,0,0,.2)"/>
      <path d="M-6 -3 q 22 -30 46 -2 Z" fill="var(--stein)"/>
      <path d="M150 -3 q 26 -36 54 -2 Z" fill="var(--stein)"/>
    </g>
    <g transform="translate(24,${BODEN.gehweg - 2})">${rohre}</g>
    ${bauzaun(-24, 236, 66)}
    <!-- Bautafel am Zaun statt am Strassenrand: an der Strasse stuende sie
         der Absperrung im Weg, die welt.js hinter die letzte Station setzt. -->
    <g transform="translate(62,-62)">
      <rect x="0" y="0" width="88" height="50" rx="4" fill="var(--schild)"/>
      <text class="t-text" x="44" y="16" text-anchor="middle" font-size="9.5"
        letter-spacing="1.3" fill="var(--schild-txt)">THEMA 4</text>
      <text class="t-display" x="44" y="44" text-anchor="middle" font-size="27" fill="var(--gelb)">?</text>
    </g>
  </g>`;
}

/* ---------- Kulisse 5: das Losrad -----------------------------------------
   Auf dem Hof steht ein Glueckrad mit neun Feldern – eines je Platz in der
   Gruppe, in genau den Farben, die Loeschlos benutzt: rot Angriffstrupp, blau
   Wassertrupp, gruen Schlauchtrupp, dazu Gold fuer den Einheitsfuehrer,
   Orange fuer den Melder und Stahl fuer den Maschinisten. Wer das Rad antippt,
   landet in der Auslosung; derselbe Weg steht als Knopf auf der Karte.

   Das Rad dreht sich langsam von allein (`.losrad`). Steht es still, weil
   jemand Bewegung abbestellt hat, sieht man an den Feldern trotzdem, was es
   ist – der Ersatzweg kostet hier also nichts.

   Der drehende Teil liegt in einer eigenen Gruppe ohne eigenes
   transform-Attribut: CSS-transform wuerde es sonst ueberschreiben und das
   Rad sprungweise in die Bildecke setzen.                                    */
function kulisseLosrad(x) {
  const HOCH = -150, R = 68;
  // Reihenfolge wie die Sitzordnung: Einheitsfuehrer, Maschinist, Melder,
  // dann die drei Trupps mit je zwei Feldern.
  const FELDER = ['gelb', 'metall', 'flamme2', 'rot', 'rot', 'blau', 'blau', 'gruen', 'gruen'];
  const punkt = (grad) => {
    const b = (grad - 90) * Math.PI / 180;
    return zahl(Math.cos(b) * R) + ' ' + zahl(Math.sin(b) * R);
  };
  let felder = '', naegel = '';
  FELDER.forEach((farbe, i) => {
    felder += `<path d="M0 0 L${punkt(i * 40)} A${R} ${R} 0 0 1 ${punkt((i + 1) * 40)} Z" fill="var(--${farbe})"/>`;
    const b = (i * 40 - 90) * Math.PI / 180;
    naegel += `<circle cx="${zahl(Math.cos(b) * (R - 7))}" cy="${zahl(Math.sin(b) * (R - 7))}" r="3.2" fill="var(--metall)"/>`;
  });
  // Die Rauten am Schild sagen, worum es geht – am Rad selbst stuenden sie
  // nach einer halben Umdrehung auf dem Kopf.
  const raute = (cx, farbe, zeichen) => `<g transform="translate(${cx},0)">
    <path d="M0 -11 L11 0 L0 11 L-11 0 Z" fill="var(--${farbe})"/>
    <text class="t-text" x="0" y="4.2" text-anchor="middle" font-size="11" fill="#fff">${zeichen}</text></g>`;

  // Wie der Schaukasten an der Wache: ein Link mitten in der Kulisse, also
  // ohne Tabstopp. Den tastaturgaengigen Weg gibt es auf der Karte und im Fuss.
  return `<a class="aushang" data-fahrt href="https://jf.veerka.mp/loeschlos/"
     tabindex="-1" aria-label="Löschlos öffnen – die Truppauslosung">
    <title>Löschlos: Positionen auslosen</title>
    <g transform="translate(${zahl(x)},0)">
    <ellipse cx="0" cy="2" rx="74" ry="9" fill="rgba(0,0,0,.18)"/>
    <!-- Bock: zwei Beine und ein Querholz, darauf sitzt die Nabe -->
    <path d="M-46 0 L-6 ${HOCH} M46 0 L6 ${HOCH}" stroke="var(--metall)" stroke-width="8" stroke-linecap="round"/>
    <rect x="-38" y="${HOCH + 96}" width="76" height="6.5" rx="3.2" fill="var(--metall)"/>
    <g transform="translate(0,${HOCH})">
      <g class="losrad">
        ${felder}
        <circle r="${R}" fill="none" stroke="var(--metall)" stroke-width="7"/>
        ${naegel}
        <circle r="13" fill="var(--metall)"/>
        <circle r="5" fill="var(--schild)"/>
      </g>
      <!-- Zeiger: haengt fest ueber dem Rad und dreht sich nicht mit -->
      <path d="M0 ${-R + 16} L-11 ${-R - 13} L11 ${-R - 13} Z" fill="var(--gelb)"/>
      <path d="M0 ${-R + 16} L-11 ${-R - 13} L11 ${-R - 13} Z" fill="none"
        stroke="var(--rot-t)" stroke-width="2.5" stroke-linejoin="round"/>
    </g>
    <!-- Schild links vom Rad: rechts liegt auf breiten Bildschirmen die
         Themenkarte, dort saehe man davon nur die Haelfte. -->
    <g transform="translate(-186,0)">
      <ellipse cx="0" cy="1" rx="16" ry="4" fill="rgba(0,0,0,.18)"/>
      <rect x="-5" y="-100" width="10" height="100" rx="4" fill="var(--metall)"/>
      <rect x="-64" y="-182" width="128" height="88" rx="8" fill="var(--schild)"/>
      <text class="t-display" x="0" y="-149" text-anchor="middle" font-size="21"
        fill="var(--schild-txt)">LÖSCHLOS</text>
      <text class="t-text" x="0" y="-133" text-anchor="middle" font-size="8.5"
        letter-spacing="1.5" fill="var(--gelb)">WER MACHT HEUTE WAS?</text>
      <g transform="translate(0,-114)">
        ${raute(-30, 'rot', 'A')}${raute(0, 'blau', 'W')}${raute(30, 'gruen', 'S')}
      </g>
    </g>
  </g></a>`;
}

/* ---------- Strassenende: hier geht es spaeter weiter ---------------------- */
/* ---------- Kulisse 6: die Absicherung -------------------------------------
   Eine abgesicherte Einsatzstelle am Strassenrand: Warndreieck mit
   Warnleuchte, eine Verjuengung aus Leitkegeln und ein Schild mit der Zahl,
   um die sich die ganze Lernseite dreht.

   Auf dem Schild stehen 200 m und nicht 100: Die Landstrasse ist der Fall,
   den man draussen vor Harheim wirklich hat, und 200 ist die Zahl, die man
   sich merken soll. Wer sie aendert, muss auch in absichern/ nachsehen.

   Die Kegel stehen schraeg gestaffelt statt in einer Linie – eine Verjuengung
   zieht den Verkehr herueber, sie sperrt ihn nicht. Genau das lehrt die
   Seite, und die Kulisse darf nichts anderes zeigen.

   Alles liegt links vom Haltepunkt: Dort steht gleich das Fahrzeug, und das
   ist zweihundert Pixel breit. Was rechts davon stuende, waere hinter ihm.  */
function kulisseAbsicherung(x) {
  let kegel = '';
  for (let i = 0; i < 3; i++) {
    const kx = -175 + i * 30, ky = BODEN.bord + 4 + i * 7, gr = 1 - i * .06;
    kegel += '<g transform="translate(' + kx + ',' + ky + ') scale(' + zahl(gr) + ')">'
      + '<ellipse cx="0" cy="0" rx="15" ry="4" fill="rgba(0,0,0,.16)"/>'
      + '<path d="M-13 0 h26 l-3 -5 h-20 Z" fill="#c74a10"/>'
      + '<path d="M-9 -5 L-3 -34 h6 L9 -5 Z" fill="#ef5b12"/>'
      + '<path d="M-6.6 -21 L6.6 -21 L5.4 -28 L-5.4 -28 Z" fill="#f7f4ef"/></g>';
  }
  return '<g transform="translate(' + zahl(x) + ',0)">'
    + '<g transform="translate(-215,' + (BODEN.gehweg - 2) + ')">'
    + '<ellipse cx="0" cy="2" rx="20" ry="5" fill="rgba(0,0,0,.2)"/>'
    + '<path d="M-14 0 h28 l-4 -7 h-20 Z" fill="var(--metall)"/>'
    + '<path d="M0 -62 L20 -8 L-20 -8 Z" fill="#f2f0e6"/>'
    + '<path d="M0 -54 L15 -12 L-15 -12 Z" fill="var(--rot)"/>'
    + '<path d="M0 -44 L9 -17 L-9 -17 Z" fill="#f2f0e6"/>'
    + '<circle cx="24" cy="-16" r="9" fill="#f59e0b" opacity=".35"/>'
    + '<circle cx="24" cy="-16" r="5.5" fill="#f59e0b"/></g>'
    + kegel
    + '<g transform="translate(-150,' + (BODEN.gehweg - 4) + ')">'
    + '<rect x="-3" y="-96" width="6" height="96" rx="3" fill="var(--metall)"/>'
    + '<rect x="-46" y="-150" width="92" height="56" rx="6" fill="var(--schild)"/>'
    + '<text class="t-text" x="0" y="-126" text-anchor="middle" font-size="11"'
    + ' letter-spacing="1.2" fill="var(--schild-txt)">ABSTAND</text>'
    + '<text class="t-display" x="0" y="-104" text-anchor="middle" font-size="25"'
    + ' fill="var(--gelb)">200 m</text></g>'
    + '</g>';
}

function kulisseEnde(x) {
  let streifen = '';
  for (let i = 0; i < 5; i++) streifen += `<rect x="${i * 24}" y="-42" width="12" height="26" fill="var(--rot)"/>`;
  return `<g transform="translate(${zahl(x)},${BODEN.strasse + 34})">
    <ellipse cx="60" cy="4" rx="70" ry="9" fill="rgba(0,0,0,.16)"/>
    <rect x="0" y="-46" width="120" height="34" rx="4" fill="#f2f0e6"/>
    <g>${streifen}</g>
    <rect x="10" y="-12" width="8" height="14" fill="var(--metall)"/>
    <rect x="102" y="-12" width="8" height="14" fill="var(--metall)"/>
    <rect x="34" y="-96" width="8" height="52" rx="3" fill="var(--metall)"/>
    <rect x="78" y="-96" width="8" height="52" rx="3" fill="var(--metall)"/>
    <rect x="18" y="-124" width="84" height="30" rx="6" fill="var(--schild)"/>
    <text class="t-text" x="60" y="-104" text-anchor="middle" font-size="13"
      letter-spacing="1" fill="var(--schild-txt)">BAUSTELLE</text>
  </g>`;
}

const KULISSEN = {
  wache: kulisseWache,
  uebungshof: kulisseUebungshof,
  brandhaus: kulisseBrandhaus,
  losrad: kulisseLosrad,
  absicherung: kulisseAbsicherung,
  baustelle: kulisseBaustelle,
};

/* ---------- Das Loeschfahrzeug -------------------------------------------- */
/* Ursprung liegt auf der Fahrbahn, mittig zwischen den Achsen. Nach rechts
   zeigt die Front. Die Raeder haben eigene Gruppen, die spaeter gedreht
   werden – sonst sieht man nicht, dass das Auto faehrt.                      */
function baueFahrzeug() {
  const rad = (cx, r) => {
    let speichen = '';
    for (let i = 0; i < 5; i++) speichen += `<rect x="-1.6" y="${-r * .52}" width="3.2" height="${r * .52}" rx="1.4"
      fill="var(--metall)" transform="rotate(${i * 72})"/>`;
    return `<g transform="translate(${cx},${-r})">
      <circle r="${r}" fill="#181c25"/>
      <circle r="${r * .62}" fill="var(--metall)"/>
      <g class="felge">${speichen}<circle r="${r * .2}" fill="#5a6273"/></g>
      <circle r="${r}" fill="none" stroke="rgba(255,255,255,.14)" stroke-width="2"/>
    </g>`;
  };
  let lamellen = '';
  for (let i = 0; i < 3; i++) {
    const lx = -94 + i * 42;
    lamellen += `<rect x="${lx}" y="-82" width="34" height="26" rx="2" fill="rgba(0,0,0,.13)"/>`;
    for (let j = 1; j < 4; j++) lamellen += `<line x1="${lx + 2}" y1="${-82 + j * 7}" x2="${lx + 32}" y2="${-82 + j * 7}" stroke="rgba(255,255,255,.16)" stroke-width="1.6"/>`;
  }
  return `<g id="fahrzeug">
    <ellipse cx="0" cy="3" rx="104" ry="8" fill="rgba(0,0,0,.22)"/>
    <g id="wagen">
      <!-- Rahmen -->
      <rect x="-98" y="-36" width="200" height="16" rx="4" fill="#2b3140"/>
      <!-- Aufbau und Kabine in einem Zug, cab over engine -->
      <path d="M-100 -88 h 202 a6 6 0 0 1 6 6 v 58 a6 6 0 0 1 -6 6 h -202 a6 6 0 0 1 -6 -6 v -58 a6 6 0 0 1 6 -6 Z"
        fill="var(--rot)"/>
      <path d="M-106 -54 h 214 v 9 h -214 Z" fill="#fff" opacity=".92"/>
      ${lamellen}
      <!-- Kabine -->
      <path d="M40 -84 h 62 a4 4 0 0 1 4 4 v 26 h -66 Z" fill="#1d2534"/>
      <path d="M44 -80 h 56 a2 2 0 0 1 2 2 v 20 h -58 Z" fill="var(--fenster)" opacity=".92"/>
      <rect x="70" y="-82" width="3" height="26" fill="var(--rot-t)" opacity=".55"/>
      <!-- Blaulichtbalken -->
      <rect x="-26" y="-98" width="62" height="10" rx="4" fill="#20263a"/>
      <rect class="bl-a" x="-22" y="-101" width="24" height="9" rx="4" fill="#4bb8ff"/>
      <rect class="bl-b" x="8" y="-101" width="24" height="9" rx="4" fill="#4bb8ff"/>
      <circle class="bl-a" cx="-10" cy="-96" r="11" fill="#7fd2ff" opacity=".4"/>
      <circle class="bl-b" cx="20" cy="-96" r="11" fill="#7fd2ff" opacity=".4"/>
      <!-- Steckleiter auf dem Dach -->
      <rect x="-98" y="-96" width="66" height="4" rx="2" fill="var(--metall)"/>
      <rect x="-98" y="-90" width="66" height="4" rx="2" fill="var(--metall)"/>
      <!-- Front -->
      <rect x="104" y="-42" width="10" height="20" rx="3" fill="#2b3140"/>
      <circle cx="105" cy="-44" r="5" fill="var(--fenster-r)"/>
      <!-- Funkrufname: Florian Frankfurt 19/43, unser LF 10/6 -->
      <text class="t-display" x="-96" y="-30" font-size="15" fill="#fff" letter-spacing=".8">FLORIAN 19/43</text>
      <path d="M56 -44 h 30 v 13 q 0 8 -15 12 q -15 -4 -15 -12 Z" fill="var(--gelb)"/>
      <text class="t-display" x="71" y="-33" text-anchor="middle" font-size="11" fill="#7a2b0b">JF</text>
    </g>
    <g id="rad-h">${rad(-60, 18)}</g>
    <g id="rad-v">${rad(64, 18)}</g>
  </g>`;
}
