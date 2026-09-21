/* ============================================================================
   Was auf der Straße steht: Fahrzeuge, Geräte, Menschen — von oben.

   Alle Größen sind feste Einheiten und werden vom Längsmaßstab des Plans
   nicht mitgestaucht (siehe die Erklärung in plan.js). Ein Löschfahrzeug ist
   hier 128 Einheiten lang und 45 breit; quer gerechnet sind das 7,5 m × 2,6 m,
   und im Nahplan stimmt das auch längs.

   Jede Zeichnung schaut standardmäßig nach **links** — in Fahrtrichtung der
   betroffenen Spur. `stellen()` dreht sie, wenn etwas anders herum steht.
   ========================================================================== */

/* Etwas an einen Punkt der Welt stellen. `dreh` in Grad, 0 = nach links,
   `skala` verkleinert die Zeichnung.

   Der Maßstab ist kein Schmuck. Ein Löschfahrzeug ist hier 128 Einheiten
   lang; auf einem Übersichtsplan mit 5 Einheiten je Meter wären das 26 Meter
   Fahrzeug, und es läge über der halben Einsatzstelle. Fahrzeuge bekommen
   deshalb `plan.symbolSkala` mit — im Nahplan ist die 1, auf der Übersicht
   deutlich kleiner. Menschen und Geräte nicht: Die wären dann nicht mehr zu
   sehen, und ein Leitkegel ist auf einem Plan ohnehin ein Symbol.          */
function stellen(markup, x, y, dreh, skala) {
  const g = Stage.hinzu(`<g transform="${verwandlung(x, y, dreh, skala)}">${markup}</g>`);
  g.userData = { x, y, dreh: dreh || 0, skala: skala || 1 };
  return g;
}

function verwandlung(x, y, dreh, skala) {
  return `translate(${zahl2(x)},${zahl2(y)})`
    + (dreh ? ` rotate(${zahl2(dreh)})` : '')
    + (skala && skala !== 1 ? ` scale(${zahl2(skala)})` : '');
}

/* Eine schon gestellte Gruppe woanders hinsetzen (für Anfahrt und Laufwege). */
function setzen(g, x, y, dreh) {
  const u = g.userData || {};
  const d = dreh == null ? (u.dreh || 0) : dreh;
  g.firstChild.setAttribute('transform', verwandlung(x, y, d, u.skala));
  if (g.userData) { g.userData.x = x; g.userData.y = y; g.userData.dreh = d; }
}

/* --- Löschfahrzeug ---------------------------------------------------------
   `blaulicht` und `warnblinker` sind keine Verzierung: Ein Fahrzeug an einer
   Einsatzstelle im fließenden Verkehr steht mit beidem und mit Fahrlicht da.
   Ein Plan, auf dem sie fehlen, zeigt etwas Falsches.                       */
function baueLF(opt) {
  const o = opt || {};
  const name = o.name || '19/43';
  // Der Schein um die Blaulichter braucht `fill-opacity` und nicht `opacity`:
  // Die Blinkanimation in stil-extra.css schreibt `opacity`, und CSS sticht
  // das Präsentationsattribut aus – aus dem zarten Schein würde ein knallblauer
  // Klecks neben dem Fahrzeug.
  const bl = o.blaulicht === false ? '' :
    `<g class="blaulicht">
       <rect class="bl-a" x="-46" y="-25" width="15" height="9" rx="4" fill="var(--blaulicht)"/>
       <rect class="bl-b" x="-46" y="16" width="15" height="9" rx="4" fill="var(--blaulicht)"/>
       <circle class="bl-a" cx="-38" cy="-21" r="17" fill="var(--blaulicht)" fill-opacity=".22"/>
       <circle class="bl-b" cx="-38" cy="21" r="17" fill="var(--blaulicht)" fill-opacity=".22"/>
     </g>`;
  const blinker = o.warnblinker === false ? '' :
    `<g class="warnblinker">
       <circle cx="-60" cy="-19" r="5" fill="var(--warn)"/><circle cx="-60" cy="19" r="5" fill="var(--warn)"/>
       <circle cx="60" cy="-19" r="5" fill="var(--warn)"/><circle cx="60" cy="19" r="5" fill="var(--warn)"/>
     </g>`;
  return `<g class="fahrzeug">
    <rect x="-66" y="-25" width="132" height="50" rx="7" fill="rgba(0,0,0,.22)" transform="translate(3,5)"/>
    <rect x="-64" y="-22.5" width="128" height="45" rx="6" fill="var(--rot)"/>
    <!-- Kabine vorne links -->
    <path d="M-64 -22.5 h 26 v 45 h -26 a6 6 0 0 1 -6 -6 v -33 a6 6 0 0 1 6 -6 Z" fill="var(--rot-d)"/>
    <rect x="-60" y="-17" width="17" height="34" rx="3" fill="var(--fenster)" opacity=".85"/>
    <!-- Aufbau: Geräteräume links und rechts -->
    <rect x="-30" y="-22.5" width="92" height="9" fill="var(--weiss)" opacity=".85"/>
    <rect x="-30" y="13.5" width="92" height="9" fill="var(--weiss)" opacity=".85"/>
    <rect x="-24" y="-9" width="80" height="18" rx="3" fill="var(--rot-d)" opacity=".5"/>
    <!-- Steckleiter auf dem Dach -->
    <rect x="-16" y="-6" width="64" height="3" rx="1.5" fill="var(--metall)"/>
    <rect x="-16" y="3" width="64" height="3" rx="1.5" fill="var(--metall)"/>
    ${bl}${blinker}
    <text class="t-plan" x="16" y="3.5" text-anchor="middle" font-size="13" fill="var(--weiss)"
      letter-spacing=".6">${name}</text>
  </g>`;
}

/* --- Unfallfahrzeug --------------------------------------------------------
   Zwei Autos, die ineinander stehen: das eine gerade, das andere verdreht.
   Mehr braucht es nicht – es ist die Einsatzstelle, nicht die Aufgabe.     */
function bauePKW(farbe, kaputt) {
  return `<g>
    <rect x="-38" y="-19" width="76" height="38" rx="9" fill="rgba(0,0,0,.2)" transform="translate(2,4)"/>
    <rect x="-37" y="-18" width="74" height="36" rx="8" fill="${farbe}"/>
    <rect x="-22" y="-14" width="30" height="28" rx="5" fill="var(--fenster)" opacity=".8"/>
    <rect x="-34" y="-12" width="8" height="24" rx="3" fill="var(--fenster)" opacity=".55"/>
    ${kaputt ? '<path d="M-37 -12 l 14 10 l -14 8 Z" fill="var(--asphalt2)"/>' : ''}
  </g>`;
}

/* --- Geräte ----------------------------------------------------------------
   Klein, aber unterscheidbar: Auf dem Übersichtsplan sind sie nur ein paar
   Pixel groß, und trotzdem muss man Kegel von Warndreieck trennen können.
   Deshalb Form und Farbe verschieden, nicht nur die Farbe.                 */
function baueLeitkegel() {
  return `<g><circle r="11" fill="rgba(0,0,0,.18)" transform="translate(1.5,2.5)"/>
    <circle r="10" fill="var(--kegel)"/><circle r="6" fill="var(--kegel-band)"/>
    <circle r="2.6" fill="var(--kegel)"/></g>`;
}

function baueWarndreieck() {
  return `<g><path d="M0 -15 L14 11 L-14 11 Z" fill="rgba(0,0,0,.2)" transform="translate(1.5,2.5)"/>
    <path d="M0 -15 L14 11 L-14 11 Z" fill="var(--weiss)"/>
    <path d="M0 -12 L11.5 9 L-11.5 9 Z" fill="var(--rot)"/>
    <path d="M0 -6.5 L6 5 L-6 5 Z" fill="var(--weiss)"/></g>`;
}

function baueWarnleuchte() {
  return `<g class="warnleuchte"><circle r="10" fill="var(--warn)" opacity=".28"/>
    <circle r="6" fill="var(--warn)"/><circle r="2.4" fill="var(--weiss)" opacity=".8"/></g>`;
}

function baueBlitzleuchte() {
  return `<g class="blitzleuchte"><circle r="13" fill="var(--warn)" opacity=".22"/>
    <rect x="-7" y="-7" width="14" height="14" rx="3" fill="var(--warn)"/>
    <path d="M1.5 -5 L-4 .5 h 3.5 L-1 5 L4.5 -.5 H1 Z" fill="var(--weiss)"/></g>`;
}

function baueFaltsignal() {
  return `<g><rect x="-13" y="-13" width="26" height="26" rx="3" fill="var(--weiss)"/>
    <path d="M0 -10 L10 8 L-10 8 Z" fill="var(--rot)"/>
    <path d="M0 -5 L5.5 5.5 L-5.5 5.5 Z" fill="var(--weiss)"/></g>`;
}

/* --- Einsatzkraft ----------------------------------------------------------
   Von oben sieht man Helm und Schultern. Die Warnweste ist der ganze Punkt
   dieser Seite und deshalb die größte Fläche.                              */
function baueFigur(opt) {
  const o = opt || {};
  return `<g class="figur">
    <ellipse rx="11" ry="10" fill="rgba(0,0,0,.2)" transform="translate(1.5,2.5)"/>
    <ellipse rx="10.5" ry="9" fill="${o.weste === false ? 'var(--jacke)' : 'var(--weste)'}"/>
    <circle r="5.5" fill="${o.helm || 'var(--helm)'}"/>
    <circle r="5.5" fill="none" stroke="rgba(0,0,0,.25)" stroke-width="1"/>
    ${o.kennung ? `<text class="t-plan" x="0" y="20" text-anchor="middle" font-size="15"
      fill="var(--txt)">${o.kennung}</text>` : ''}
  </g>`;
}

/* --- Verjüngung aus Leitkegeln ---------------------------------------------
   Kegel stehen nie quer über der Fahrbahn, sondern schräg: Sie ziehen den
   Verkehr von der gesperrten Spur herüber. `vonM`/`bisM` sind die Meter, in
   denen die Verjüngung läuft (von außen zur Einsatzstelle hin), `vonY`/`bisY`
   die Querpositionen. Zurück kommt die Liste der Punkte – die Aufgaben
   brauchen sie, um Kegel einzeln zu setzen.                                */
function verjuengungPunkte(plan, vonM, bisM, vonY, bisY, anzahl) {
  const p = [];
  for (let i = 0; i < anzahl; i++) {
    const t = anzahl === 1 ? 0 : i / (anzahl - 1);
    p.push({ m: lerp(vonM, bisM, t), y: lerp(vonY, bisY, t) });
  }
  return p;
}

/* --- Sichthindernisse für die Landstraße -----------------------------------
   Kurve und Kuppe werden nicht als verbogene Straße gezeichnet – ein
   gestauchter Maßstab und eine Kurve zusammen ergeben ein Bild, das niemand
   mehr liest. Stattdessen steht ein Waldstück bzw. ein Hügelrücken an der
   Stelle, an der die Sicht endet.

   Beides liegt **über** der Fahrbahn, nicht auf dem Bankett: Dort steht das
   Warngerät, und ein Baum, der es zudeckt, verwechselt „nimmt die Sicht" mit
   „nimmt das Gerät weg". Beschriftet wird nicht hier, sondern im Level —
   unter der Straße ist Platz, darüber nicht.
   -------------------------------------------------------------------------*/
function baueSichthindernis(plan, m, art) {
  const x = plan.mx(m);
  const oben = plan.randOben, unten = plan.randUnten + 10;
  if (art === 'kuppe') {
    return Stage.hinzu(`<g>
      <rect x="${x - 40}" y="${oben - 30}" width="80" height="${unten - oben + 30}"
        fill="var(--kuppe)" opacity=".55"/>
      <rect x="${x - 3}" y="${oben - 30}" width="6" height="${unten - oben + 30}"
        fill="var(--kuppe2)" opacity=".8"/></g>`);
  }
  let baeume = '';
  for (let i = 0; i < 9; i++) {
    const bx = x - 44 + (i % 3) * 32 + (i % 2) * 8;
    const by = oben - 44 + Math.floor(i / 3) * 16;
    baeume += `<circle cx="${bx}" cy="${by}" r="${10 + (i % 3) * 3}" fill="var(--laub)"/>`;
  }
  return Stage.hinzu(`<g>${baeume}</g>`);
}
