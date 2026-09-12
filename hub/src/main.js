/* ---------- Die Fahrt ------------------------------------------------------
   Scrollen ist Gasgeben. Aus der Scrollposition wird eine Position auf der
   Strasse: an jeder Station gibt es ein Plateau, dazwischen wird weich
   beschleunigt und gebremst. Das Fahrzeug bleibt im Bild stehen, die Welt
   zieht an ihm vorbei – so kann man an jeder Haltestelle in Ruhe lesen.
   -------------------------------------------------------------------------*/

const klemm = (v, a, b) => v < a ? a : v > b ? b : v;
const weich = (t) => t * t * (3 - 2 * t);

const RUHIG = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Wie sich die Scrollstrecke auf Stehen und Fahren verteilt. Die Feuerwache am
   Anfang steht kuerzer als die Themen: dort gibt es nichts zu lesen, also soll
   es auch schnell losgehen. HALT_SCROLL ist die Standzeit in Bildschirmhoehen. */
const HALT_GEWICHT = 1, HALT_START = .4, FAHRT_GEWICHT = 1.75, HALT_SCROLL = .85;

const welt = baueWelt(THEMEN);
const STATIONEN = welt.stationen;

/* --- Scrollposition -> Streckenposition ---------------------------------- */
const marken = [];
{
  const halt = (s) => s.status === 'start' ? HALT_START : HALT_GEWICHT;
  const gesamt = STATIONEN.reduce((n, s) => n + halt(s), 0)
               + (STATIONEN.length - 1) * FAHRT_GEWICHT;
  let acc = 0;
  STATIONEN.forEach((s, i) => {
    marken.push({ p: acc / gesamt, x: s.welt });
    acc += halt(s);
    marken.push({ p: acc / gesamt, x: s.welt });
    if (i < STATIONEN.length - 1) acc += FAHRT_GEWICHT;
  });
  var GESAMT_GEWICHT = gesamt;
}

function streckeFuer(p) {
  p = klemm(p, 0, 1);
  for (let i = 0; i < marken.length - 1; i++) {
    const a = marken[i], b = marken[i + 1];
    if (p > b.p) continue;
    if (a.x === b.x) return a.x;
    // Sanft anfahren und bremsen, aber ohne Gedenksekunde: `weich` legt am
    // Anfang der Fahrt deutlich frueher los als eine kubische Kurve.
    const t = (p - a.p) / (b.p - a.p || 1);
    return a.x + (b.x - a.x) * weich(klemm(t, 0, 1));
  }
  return marken[marken.length - 1].x;
}

/* Mitte des Plateaus einer Station – dorthin scrollt der Streckenplan */
function scrollFuerStation(i) {
  const a = marken[i * 2], b = marken[i * 2 + 1];
  return (a.p + b.p) / 2 * scrollLaenge();
}

/* ---------- Aufbau -------------------------------------------------------- */
const strecke = document.getElementById('strecke');
const buehne  = document.getElementById('buehne');
const svg     = document.getElementById('szene');
svg.innerHTML = welt.markup;

const ebenen  = [...svg.querySelectorAll('[data-tiefe]')];
const gestirn = svg.querySelector('#e-gestirn');
const bodenG  = svg.querySelector('#boden');
const autoG   = svg.querySelector('#e-auto');
const wagen   = svg.querySelector('#wagen');
const felgen  = [...svg.querySelectorAll('.felge')];
const himmel  = svg.querySelector('#himmel');
const bodenRechtecke = [...bodenG.children];

let W = 1000, H = 560, skala = 1, bodenY = 300, autoX = 400, breit = true;

function vermessen() {
  // In einem versteckten Tab meldet der Browser 0 x 0 – dann waere alles NaN.
  const vw = Math.max(320, buehne.clientWidth || innerWidth || 1280);
  const vh = Math.max(320, buehne.clientHeight || innerHeight || 800);
  breit = innerWidth > 900;
  // Die Szene braucht rund 480 Einheiten Hoehe, damit Turm, Strasse und
  // Vordergrund zusammen ins Bild passen. Daraus folgt die Breite.
  // Untergrenze: sonst wird auf dem Handy alles winzig. Obergrenze nur als
  // Notbremse – bei sehr flachen Fenstern (Banner im ruhigen Modus) muss die
  // Szene weiter herauszoomen duerfen, sonst schneidet sie die Haeuser ab.
  const einheiten = klemm(Math.max(470, 480 * vw / vh), 470, 1500);
  skala = vw / einheiten;
  W = einheiten; H = vh / skala;
  // Im Hochformat sitzt die Karte unten. Die Strasse muss darueber passen,
  // sonst faehrt das Fahrzeug hinter der Karte.
  const hoch = vh > vw;
  bodenY = hoch ? H * .46 : Math.max(H * .62, Math.min(H - 120, 268));
  bodenY = klemm(bodenY, 150, H - 118);
  autoX = W * (breit ? .40 : .5);

  svg.setAttribute('viewBox', `0 0 ${W.toFixed(1)} ${H.toFixed(1)}`);
  himmel.setAttribute('width', W + 20);
  himmel.setAttribute('height', H + 20);
  bodenRechtecke.forEach(r => { r.setAttribute('x', -10); r.setAttribute('width', W + 20); });
  const gras = svg.querySelector('#b-gras');
  gras.setAttribute('height', Math.max(80, H - bodenY - BODEN.strasseEnde + 20));
  bodenG.setAttribute('transform', `translate(0,${bodenY.toFixed(1)})`);
  gestirn.setAttribute('transform', `translate(${(W * .8).toFixed(1)},${(bodenY * .26).toFixed(1)})`);
  autoG.setAttribute('transform', `translate(${autoX.toFixed(1)},${(bodenY + BODEN.radspur).toFixed(1)})`);

  if (!RUHIG) strecke.style.height = Math.round(vh * (1 + HALT_SCROLL * GESAMT_GEWICHT)) + 'px';
}

function scrollLaenge() { return Math.max(1, strecke.offsetHeight - buehne.clientHeight); }

/* ---------- Karten und Streckenplan --------------------------------------- */
const kartenBox = document.getElementById('karten');
const planBox   = document.getElementById('plan');
const hinweis   = document.getElementById('hinweis');

const karten = STATIONEN.map((s) => {
  // Die Feuerwache am Anfang bekommt bewusst keine Karte: dort soll man
  // scrollen, nicht klicken.
  if (s.status === 'start') return null;

  const k = document.createElement('article');
  k.className = 'karte';
  k.id = 'karte-' + s.id;
  const chip = `<span class="chip${s.status === 'bald' ? ' bald' : ''}">${s.chip}</span>`;
  const liste = s.punkte ? '<ul>' + s.punkte.map(p => `<li>${p}</li>`).join('') + '</ul>' : '';
  // `data-fahrt` markiert den einen Knopf, an dem die Ausrueck-Animation
  // haengt. Ohne die Marke wuerde die Suche weiter unten an der Baustelle den
  // GitHub-Knopf erwischen und die Abfahrt vor einem fremden Ziel abspielen.
  const knopf = s.status === 'offen'
    ? `<a class="knopf" data-fahrt href="${s.ziel}">${s.knopf}
        <svg width="18" height="14" viewBox="0 0 18 14" aria-hidden="true"><path d="M1 7h14M10 2l5 5-5 5"
          fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg></a>`
    : `<span class="knopf still">${s.knopf}</span>`;
  // Zweiter Knopf, bislang nur an der Baustelle. Fuehrt aus der Seite heraus,
  // also neuer Tab und keine Abfahrt.
  const mit = s.mit
    ? `<a class="knopf geist" href="${s.mit.ziel}" target="_blank" rel="noopener noreferrer">
        <svg width="17" height="17" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor"><path
          d="M12 .3a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2c-3.3.7-4-1.6-4-1.6-.6-1.4-1.4-1.8-1.4-1.8-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1.1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.8-1.6-2.7-.3-5.5-1.3-5.5-5.9 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.5.1-3.2 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0C17.2 4 18.2 4.3 18.2 4.3c.6 1.7.2 2.9.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.6-5.5 5.9.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0 0 12 .3Z"/></svg>
        ${s.mit.text}</a>`
    : '';
  k.innerHTML = `<p class="karte-ober">${s.ober}${chip}</p>
    <h2>${s.titel}</h2>
    <p class="zeile">${s.zeile}</p>${liste}
    <div class="karte-knoepfe">${knopf}${mit}</div>`;
  // Bis eine Karte an der Reihe ist, ist sie fuer Tastatur und Vorlese-
  // programme nicht vorhanden – sonst springt der Fokus in unsichtbare Links.
  k.inert = true; k.setAttribute('aria-hidden', 'true');
  kartenBox.appendChild(k);
  return k;
});

karten.forEach((k, i) => {
  // Die Station gehoert zur Karte: Aus ihr kommt der Grundton der Blende.
  const s = STATIONEN[i];
  const a = k && k.querySelector('a.knopf[data-fahrt]');
  if (!a || RUHIG) return;
  a.addEventListener('pointerenter', () => vorladen(a.href));
  a.addEventListener('focus', () => vorladen(a.href));
  a.addEventListener('click', (e) => {
    // In neuem Tab oeffnen o. ae. bleibt, wie es ist – nur der schlichte
    // Klick faehrt die Animation.
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    losfahren(a.href, s);
  });
});

/* Das Losrad in der Kulisse fuehrt dorthin, wo auch sein Knopf hinfuehrt –
   also soll es dieselbe Fahrt ausloesen und nicht hart umschalten. Der Link
   steckt im SVG, das oben schon gebaut wurde. In SVG ist `href` ein
   SVGAnimatedString, die Adresse steht deshalb in `baseVal`.                */
const radLink = svg.querySelector('a[data-fahrt]');
const radStation = STATIONEN.find(t => t.id === 'loeschlos');
if (radLink && radStation && !RUHIG) {
  const radZiel = radLink.href.baseVal;
  radLink.addEventListener('pointerenter', () => vorladen(radZiel));
  radLink.addEventListener('click', (e) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    losfahren(radZiel, radStation);
  });
}

STATIONEN.forEach((s, i) => {
  if (i) planBox.appendChild(Object.assign(document.createElement('span'), { className: 'plan-strich' }));
  const b = document.createElement('button');
  b.type = 'button'; b.className = 'plan-halt';
  b.innerHTML = `<i></i><span>${s.kurz}</span>`;
  b.addEventListener('click', () => zuStation(i));
  planBox.appendChild(b);
});
const planKnoepfe = [...planBox.querySelectorAll('.plan-halt')];

/* --- Ausruecken: Uebergang von der Strasse ins Spiel --------------------- */
const AUSRUECKEN_MS = 900;
const vorgeladen = {};

/* Beim ersten Zeigen schon mal holen – das Spiel ist ein Megabyte gross, und
   waehrend der Abfahrt ist ohnehin nichts anderes zu tun. */
function vorladen(url) {
  if (vorgeladen[url]) return;
  vorgeladen[url] = true;
  const l = document.createElement('link');
  l.rel = 'prefetch'; l.href = url;
  document.head.appendChild(l);
}

/* --- Einfahrt: die Gegenrichtung, ausgeloest vom Spiel ------------------- */
const EINFAHRT_MS = 1100, EINFAHRT_WEG = 780;

function einfahrtBeenden() {
  einfahren = null;
  frei = false;
  document.getElementById('fahrtwind').classList.remove('an');
  document.getElementById('blende').classList.remove('sofort', 'an');
  document.body.classList.remove('faehrt-ein');
}

/* Das Spiel haengt beim Zurueckgehen ?einfahrt=1 an. Dann startet die Seite
   dunkel – in derselben Farbe, in die das Spiel sich verabschiedet hat – und
   das Fahrzeug rollt vor der Wache aus. */
function einfahrtStarten() {
  const blende = document.getElementById('blende');
  // Beim Ankommen faehrt die Startseite selbst auf – nicht ein Thema. Also
  // ihr eigener Grundton, und ohne Zeichen (siehe .faehrt-ein im Stil).
  blendeEinstellen(null);
  frei = true;
  einfahren = { t0: performance.now() };
  strassePos = ziel = -EINFAHRT_WEG;
  document.body.classList.add('faehrt-ein');
  document.getElementById('fahrtwind').classList.add('an');
  blende.classList.add('sofort', 'an');
  // Zwei Bilder warten: erst muss die dunkle Blende einmal gezeichnet worden
  // sein, sonst blitzt die helle Seite auf. Der Zeitgeber ist die Rueckfall-
  // ebene, falls der Browser gerade keine Bilder zeichnet (Hintergrund-Tab).
  requestAnimationFrame(() => {
    blende.classList.remove('sofort');
    requestAnimationFrame(() => blende.classList.remove('an'));
  });
  setTimeout(() => blende.classList.remove('sofort', 'an'), 400);
  setTimeout(() => document.getElementById('fahrtwind').classList.remove('an'), 620);
  // Die Adresszeile soll den Parameter nicht behalten – sonst faehrt es beim
  // Neuladen jedes Mal wieder ein.
  history.replaceState(null, '', location.pathname);
}

/* Die Blende auf das Ziel einstellen: Grundton, Schriftfarbe, Zeichen und
   Name. Erst dadurch faehrt man in „Brennen & Loeschen" in einen hellen
   Vormittag und nicht in dieselbe Nacht wie nebenan. */
function blendeEinstellen(station) {
  const blende = document.getElementById('blende');
  const u = (station && station.uebergang) || null;
  blende.style.setProperty('--blende-grund', u ? u.grund : '#080b14');
  blende.style.setProperty('--blende-schrift', u ? u.schrift : '#eaf0ff');
  blende.querySelector('.blende-innen').innerHTML =
    (u && u.zeichen ? u.zeichen : '') + (station && station.titel ? `<b>${station.titel}</b>` : '');
}

function losfahren(url, station) {
  if (ausruecken) return;
  vorladen(url);
  blendeEinstellen(station);
  frei = true;
  ausruecken = { von: strassePos, t0: performance.now() };
  document.body.classList.add('ausrueckt');
  document.getElementById('fahrtwind').classList.add('an');
  setTimeout(() => document.getElementById('blende').classList.add('an'), 480);
  setTimeout(() => { location.href = url; }, AUSRUECKEN_MS);
}

/* Zurueck-Knopf: der Browser holt die Seite aus dem Cache, wie sie war – also
   mitten im Ausruecken, mit dunkler Blende. Beim Anzeigen wird deshalb immer
   zurueckgesetzt, sonst steht man vor einem schwarzen Bild.                  */
function abbrechen() {
  ausruecken = null;
  einfahren = null;
  frei = false;
  document.body.classList.remove('faehrt-ein', 'ausrueckt');
  document.getElementById('fahrtwind').classList.remove('an');
  document.getElementById('blende').classList.remove('an', 'sofort');
  beiScroll();
  strassePos = ziel;
  zeichne(.016);   // sofort neu zeichnen, nicht erst beim naechsten Bild
}

/* Nur beim Zurueck-Knopf aufraeumen. `pageshow` kommt auch beim ganz normalen
   Laden – dort wuerde es die gerade gestartete Einfahrt sofort abwuergen.    */
addEventListener('pageshow', (e) => { if (e.persisted || ausruecken) abbrechen(); });

function zuStation(i) {
  scrollTo({ top: scrollFuerStation(i), behavior: RUHIG ? 'auto' : 'smooth' });
}

/* ---------- Fuss: dieselben Themen noch einmal als schlichte Liste ---------
   Nur die, die es wirklich gibt. Die Baustelle steht auf der Strecke, aber
   nicht hier: eine Liste „Alle Themen" soll Themen aufzaehlen, keine
   Absichtserklaerungen. Der Weg ins Repo steht ohnehin unter der Liste.    */
const fussListe = document.getElementById('fuss-liste');
THEMEN.filter(t => t.status !== 'start' && t.fuss !== false).forEach(t => {
  const offen = t.status === 'offen';
  const el = document.createElement(offen ? 'a' : 'div');
  if (offen) el.href = t.ziel;
  const punkte = t.punkte ? '<ul>' + t.punkte.map(p => `<li>${p}</li>`).join('') + '</ul>' : '';
  // Im Fuss gibt es keine Knoepfe. Wo die Karte einen stillen Knopf zeigt,
  // muss der Satz selbst sagen, woran man ist.
  const satz = offen ? t.zeile : t.zeile + ' ' + t.nachsatz;
  el.innerHTML = `<b>${t.titel}</b><small>${satz}</small>${punkte}`;
  const li = document.createElement('li');
  li.appendChild(el); fussListe.appendChild(li);
});

/* ---------- Bild aufbauen -------------------------------------------------- */
let strassePos = 0, ziel = 0, radWinkel = 0, letzte = 0, aktiv = -1, frei = false;
let ausruecken = null;      // { von, t0 } waehrend der Abfahrt ins Spiel
let einfahren = null;       // { t0 } waehrend der Rueckkehr aus dem Spiel

function zeichne(dt) {
  const alt = strassePos;
  let versatz = 0;          // seitlicher Versatz des Fahrzeugs in Einheiten
  if (ausruecken) {
    // gleichmaessig beschleunigt statt weich eingebremst – es geht zum Einsatz
    const t = klemm((performance.now() - ausruecken.t0) / AUSRUECKEN_MS, 0, 1);
    strassePos = ausruecken.von + 3400 * t * t;
    const raus = klemm((t - .42) / .58, 0, 1);
    versatz = raus * raus * (W + 280 - autoX);
  } else if (einfahren) {
    // Rueckkehr: rollt aus und haelt vor der Wache
    const t = klemm((performance.now() - einfahren.t0) / EINFAHRT_MS, 0, 1);
    const e = 1 - Math.pow(1 - t, 3);
    strassePos = -EINFAHRT_WEG * (1 - e);
    versatz = -(1 - e) * (1 - e) * 240;
    if (t >= 1) einfahrtBeenden();
  } else {
    strassePos += (ziel - strassePos) * klemm(dt * 9, 0, 1);
  }
  const v = dt > 0 ? (strassePos - alt) / dt : 0;

  // Bezugspunkt ist die Stelle, an der das Fahrzeug steht: dort, wo die Welt
  // gerade `strassePos` erreicht hat. Nur so haelt es genau vor der Station.
  ebenen.forEach(g => {
    const t = parseFloat(g.dataset.tiefe);
    const y = g.id === 'e-himmel' ? bodenY * .42 : bodenY;
    g.setAttribute('transform', `translate(${(autoX - strassePos * t).toFixed(1)},${y.toFixed(1)})`);
  });

  radWinkel = (radWinkel + (strassePos - alt) * (180 / (Math.PI * 18))) % 360;
  felgen.forEach(f => f.setAttribute('transform', `rotate(${radWinkel.toFixed(1)})`));

  const fahrt = klemm(Math.abs(v) / 420, 0, 1);
  const zeit = performance.now() / 1000;
  const wippe = Math.sin(zeit * (7 + fahrt * 16)) * (.3 + fahrt * .9);
  const neigung = klemm(-v * .0016, -1.7, 1.7);
  wagen.setAttribute('transform', `translate(0,${wippe.toFixed(2)}) rotate(${neigung.toFixed(2)})`);

  // Immer setzen, nicht nur waehrend einer Fahrt: sonst bliebe das Fahrzeug
  // nach dem Zurueck-Knopf ausserhalb des Bildes stehen.
  autoG.setAttribute('transform',
    `translate(${(autoX + versatz).toFixed(1)},${(bodenY + BODEN.radspur).toFixed(1)})`);

  let naechste = 0, bestAbstand = Infinity;
  STATIONEN.forEach((s, i) => {
    const d = s.welt - strassePos, ad = Math.abs(d);
    if (ad < bestAbstand) { bestAbstand = ad; naechste = i; }
    const k = karten[i];
    if (!k) return;
    const e = weich(klemm(1 - ad / 320, 0, 1));
    const dx = klemm(d * skala * .38, -700, 700);
    k.style.opacity = e.toFixed(3);
    k.style.transform = `translate3d(${dx.toFixed(1)}px,${((1 - e) * 26).toFixed(1)}px,0) scale(${(.95 + e * .05).toFixed(3)})`;
    const an = e > .55;
    if (k.classList.contains('aktiv') !== an) {
      k.classList.toggle('aktiv', an);
      k.inert = !an;
      k.setAttribute('aria-hidden', an ? 'false' : 'true');
    }
  });
  // Der Hinweis haengt an der gefahrenen Strecke, nicht an der Scrollposition:
  // so kann er nie ueber einer Karte stehen.
  if (hinweis) hinweis.style.opacity = strassePos > 30 ? '0' : '1';

  if (naechste !== aktiv) {
    aktiv = naechste;
    planKnoepfe.forEach((b, i) => b.setAttribute('aria-current', i === naechste ? 'true' : 'false'));
  }
}

/* Die Scrollposition wird im Bildtakt gelesen statt per scroll-Ereignis:
   Ereignisse werden von manchen Browsern zusammengefasst oder verschluckt,
   und wir zeichnen ohnehin jedes Bild neu.                                   */
function beiScroll() {
  if (frei) return;
  ziel = streckeFuer(scrollY / scrollLaenge());
}

function schleife(t) {
  const dt = Math.min(.05, (t - letzte) / 1000 || .016);
  letzte = t;
  beiScroll();
  zeichne(dt);
  requestAnimationFrame(schleife);
}

/* ---------- Start ---------------------------------------------------------- */
if (RUHIG) document.body.classList.add('ruhig');
vermessen();
addEventListener('resize', () => { vermessen(); beiScroll(); });
beiScroll();
strassePos = ziel;
zeichne(.016);
if (!RUHIG) requestAnimationFrame(schleife);

/* Handreichung fuers Testen in der Konsole */
window.__hub = {
  get pos() { return strassePos; },
  get ziel() { return ziel; },
  stationen: STATIONEN, zuStation, vermessen,
  vor(n) { for (let i = 0; i < (n || 90); i++) { beiScroll(); zeichne(.016); } },
  // Position setzen, ohne zu scrollen – zum Nachschauen einzelner Stationen
  springe(x) { frei = true; ziel = strassePos = x; zeichne(.016); },
  loesen() { frei = false; },
};

/* Rueckkehr aus dem Spiel */
if (!RUHIG && /[?&]einfahrt=1\b/.test(location.search)) einfahrtStarten();

/* Direktsprung: /#fwdv3 haelt gleich an der richtigen Station */
if (location.hash) {
  const i = STATIONEN.findIndex(s => '#' + s.id === location.hash);
  if (i > 0) setTimeout(() => zuStation(i), 60);
}
