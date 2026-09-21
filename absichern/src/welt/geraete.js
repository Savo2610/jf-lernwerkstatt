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

/* --- Etwas auf die Straße stellen ------------------------------------------
   Wie `stellen()`, aber in Meter und Querabstand statt in Weltkoordinaten —
   und damit kurventauglich: Der Bogen der Fahrbahn kommt auf die Höhe, die
   Steigung auf die Drehung.

   **Auf einem Plan mit Kurve ist das Pflicht.** `stellen()` würde das Objekt
   dorthin setzen, wo die Straße ohne Bogen gewesen wäre — also neben sie.
   Auf einem geraden Plan ist beides dasselbe.
   -------------------------------------------------------------------------*/
function aufPlan(plan, markup, m, quer, dreh, skala) {
  return stellen(markup, plan.mx(m), plan.yAuf(m, quer),
                 (dreh || 0) + plan.neigung(m), skala);
}

/* Dasselbe zum Umsetzen – für Laufwege und Anfahrten. */
function setzenAuf(plan, g, m, quer, dreh) {
  setzen(g, plan.mx(m), plan.yAuf(m, quer),
         (dreh == null ? (g.userData ? g.userData.dreh : 0) : dreh) + plan.neigung(m));
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
   dieser Seite und deshalb die größte Fläche — sie bleibt gelb, egal wer
   darin steckt.

   Die **Funktion** steckt trotzdem in der Farbe, nur eine Schicht weiter
   außen: als Ring um die Figur und im Namensschild. Es sind dieselben Farben
   wie in „Einsatzbereit" und in Löschlos (blau Wassertrupp, rot Angriffstrupp,
   grün Schlauchtrupp, Gold Einheitsführer, Stahl Maschinist), nur dunkler —
   siehe TRUPPFARBEN in data/absicherung.js.

   Das Namensschild ist ein Schild und kein nackter Text: Auf Asphalt, Gras
   und Bankett liegt sonst jede Beschriftung irgendwann auf einem Untergrund,
   der sie schluckt. Seine Breite richtet sich nach der Länge der Kennung,
   damit zwei Figuren nebeneinander nicht ineinanderlaufen.
   -------------------------------------------------------------------------*/
function baueFigur(opt) {
  const o = opt || {};
  const t = o.trupp ? TRUPPFARBEN[o.trupp] : null;
  const ring = t ? t.farbe : 'var(--txt3)';
  const schild = o.kennung ? schildchen(o.kennung, ring) : '';
  return `<g class="figur">
    <ellipse rx="12" ry="11" fill="rgba(0,0,0,.2)" transform="translate(1.5,2.5)"/>
    <ellipse rx="11.5" ry="10" fill="${ring}"/>
    <ellipse rx="8.5" ry="7.5" fill="${o.weste === false ? 'var(--jacke)' : 'var(--weste)'}"/>
    <circle r="5" fill="${o.helm || 'var(--helm)'}"/>
    <circle r="5" fill="none" stroke="rgba(0,0,0,.25)" stroke-width="1"/>
    ${schild}
  </g>`;
}

/* Namensschild unter einer Figur. Breite nach Zeichenzahl – „WTrF" braucht
   mehr als „Ma", und zwei Schilder dürfen sich nicht überlappen.          */
function schildchen(text, farbe) {
  const b = 13 + String(text).length * 8.5;
  return `<g transform="translate(0,25)">
    <rect x="${-b / 2}" y="-10" width="${b}" height="20" rx="10"
      fill="var(--panel)" stroke="${farbe}" stroke-width="1.6" opacity=".96"/>
    <text class="t-plan" x="0" y="6" text-anchor="middle" font-size="13"
      fill="${farbe}">${text}</text></g>`;
}

/* Wie breit ein Namensschild wird – die Level brauchen das, um Figuren weit
   genug auseinanderzustellen. */
function schildBreite(text) { return 13 + String(text).length * 8.5; }

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

/* --- Waldstück in der Innenseite einer Kurve -------------------------------
   Der Grund, warum man nicht um die Kurve sieht. Es steht in der
   **Innenseite** des Bogens — dort, wo die Sichtlinie von draußen zur
   Einsatzstelle die Fahrbahn verlässt. Auf der Außenseite stünde es im Bild
   herum, ohne irgendetwas zu erklären.

   Die Bäume folgen dem Bogen (`plan.yAuf`), sonst lägen sie dort, wo die
   Straße ohne Kurve gewesen wäre — also mitten auf der Fahrbahn.

   Eine Kuppe gibt es hier bewusst nicht: Eine Kuppe ist eine Steigung, und
   die sieht man in der Draufsicht grundsätzlich nicht. Sie bleibt eine Frage.
   -------------------------------------------------------------------------*/
function baueWaldstueck(plan, vonM, bisM) {
  let baeume = '';
  const reihen = 3, jeReihe = 5;
  for (let r = 0; r < reihen; r++) {
    for (let i = 0; i < jeReihe; i++) {
      const m = lerp(vonM, bisM, (i + (r % 2) * .5) / jeReihe);
      const quer = plan.randOben - 16 - r * 26;
      const x = plan.mx(m), y = plan.yAuf(m, quer);
      baeume += `<circle cx="${zahl2(x)}" cy="${zahl2(y)}" r="${13 + (i % 3) * 3}" fill="var(--laub)"/>`;
    }
  }
  return Stage.hinzu(`<g>${baeume}</g>`);
}
