/* ---------- kleine Helfer ------------------------------------------------- */
const $  = (sel, root) => (root || document).querySelector(sel);
const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));

function el(tag, attrs, ...kids) {
  const n = document.createElement(tag);
  if (attrs) for (const k in attrs) {
    const v = attrs[k];
    if (v == null || v === false) continue;
    if (k === 'class') n.className = v;
    else if (k === 'html') n.innerHTML = v;
    else if (k === 'text') n.textContent = v;
    else if (k === 'style' && typeof v === 'object') Object.assign(n.style, v);
    else if (k.startsWith('on') && typeof v === 'function') n.addEventListener(k.slice(2), v);
    else n.setAttribute(k, v === true ? '' : v);
  }
  for (const kid of kids.flat()) {
    if (kid == null || kid === false) continue;
    n.appendChild(typeof kid === 'string' ? document.createTextNode(kid) : kid);
  }
  return n;
}

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const lerp  = (a, b, t) => a + (b - a) * t;
const rnd   = (a, b) => a + Math.random() * (b - a);
const rndInt= (a, b) => Math.floor(rnd(a, b + 1));
const pick  = (arr) => arr[Math.floor(Math.random() * arr.length)];
const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
const easeInOutCubic = (t) => t < .5 ? 4*t*t*t : 1 - Math.pow(-2*t+2, 3)/2;
const easeOutBack = (t) => { const c1=1.70158, c3=c1+1; return 1 + c3*Math.pow(t-1,3) + c1*Math.pow(t-1,2); };

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function wait(ms) { return new Promise(res => setTimeout(res, ms)); }

/* animiert einen Zahlenwert im DOM hoch */
function countUp(node, from, to, ms) {
  const t0 = performance.now();
  function step(t) {
    const p = clamp((t - t0) / ms, 0, 1);
    node.textContent = Math.round(lerp(from, to, easeOutCubic(p)));
    if (p < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

/* prueft, ob das Geraet eher ein Touch-Geraet ist */
const IS_TOUCH = window.matchMedia('(pointer: coarse)').matches;

/* ---------- kleine Animationshilfe ----------------------------------------
   Laufende Bewegungen; der Taktgeber der Buehne dreht sie jedes Bild weiter.
   Das hier weiss nichts von 3D: Es braucht nur eine Buehne mit `anmelden`,
   `abmelden` und `updates`. Deshalb steht es bei den Helfern und nicht in
   gemeinsam/stage.js – „Erst sichern!" hat eine SVG-Buehne und dieselbe
   Bewegung.                                                                 */
const Bewegung = {
  liste: [],
  /* Stage.leeren() wirft alle Update-Funktionen weg – auch unsere. Deshalb
     nicht "einmal anmelden und gut", sondern bei jeder neuen Bewegung
     pruefen, ob der Taktgeber noch haengt. Sonst laufen Figuren auf der
     Stelle, weil ihre Bewegung nie weitergedreht wird.                     */
  init() {
    if (!this._fn) {
      this._fn = (dt) => {
        for (let i = this.liste.length - 1; i >= 0; i--) {
          const b = this.liste[i];
          b.t += dt;
          const p = clamp(b.t / b.dauer, 0, 1);
          b.schritt(b.glatt ? easeInOutCubic(p) : p, p);
          if (p >= 1) { this.liste.splice(i, 1); if (b.fertig) b.fertig(); }
        }
      };
    }
    if (Stage.updates.indexOf(this._fn) < 0) Stage.anmelden(this._fn);
  },
  neu(dauer, schritt, fertig, glatt) {
    this.init();
    const b = { t: 0, dauer: Math.max(.01, dauer), schritt, fertig, glatt: glatt !== false };
    this.liste.push(b);
    return b;
  },
  alleWeg() { this.liste.length = 0; },
};

/* Level-Register: jede Leveldatei traegt sich hier ein */
const LEVELS = [];
function levelHolen(id){ return LEVELS.find(l => l.id === id); }
