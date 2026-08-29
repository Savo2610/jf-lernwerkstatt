/* ---------- Ton: alles synthetisch, keine Audiodateien --------------------- */
const Audio3 = {
  ctx: null,
  master: null,

  init() {
    if (this.ctx) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    this.ctx = new AC();
    this.master = this.ctx.createGain();
    this.master.gain.value = 0.5;
    this.master.connect(this.ctx.destination);
  },
  an() { return State.ton && this.ctx; },
  wecken() {
    this.init();
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
  },

  /* Grundbaustein: Ton mit Huellkurve */
  ton(freq, dauer, typ, vol, glideZu) {
    if (!this.an()) return;
    const t = this.ctx.currentTime;
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.type = typ || 'sine';
    o.frequency.setValueAtTime(freq, t);
    if (glideZu) o.frequency.exponentialRampToValueAtTime(glideZu, t + dauer);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol == null ? 0.25 : vol, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dauer);
    o.connect(g); g.connect(this.master);
    o.start(t); o.stop(t + dauer + 0.02);
  },

  /* Rauschbaustein für Wasser, Whoosh, Feuer */
  rauschen(dauer, freqVon, freqBis, vol, q) {
    if (!this.an()) return;
    const t = this.ctx.currentTime;
    const len = Math.ceil(this.ctx.sampleRate * dauer);
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    const src = this.ctx.createBufferSource(); src.buffer = buf;
    const f = this.ctx.createBiquadFilter();
    f.type = 'bandpass'; f.Q.value = q == null ? 1.2 : q;
    f.frequency.setValueAtTime(freqVon, t);
    f.frequency.exponentialRampToValueAtTime(freqBis, t + dauer);
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol == null ? 0.2 : vol, t + dauer * 0.15);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dauer);
    src.connect(f); f.connect(g); g.connect(this.master);
    src.start(t); src.stop(t + dauer);
  },

  /* --- konkrete Effekte -------------------------------------------------- */
  klick()    { this.ton(660, 0.07, 'triangle', 0.16); },
  auf()      { this.ton(520, 0.10, 'triangle', 0.16, 880); },
  zu()       { this.ton(520, 0.10, 'triangle', 0.14, 300); },
  richtig()  { this.ton(660, 0.11, 'triangle', 0.22); setTimeout(() => this.ton(990, 0.20, 'triangle', 0.22), 90); },
  falsch()   { this.ton(180, 0.24, 'sawtooth', 0.14, 110); },
  treffer()  { this.ton(880, 0.08, 'square', 0.12); },
  whoosh()   { this.rauschen(0.42, 220, 2600, 0.14, 0.8); },
  wasser()   { this.rauschen(1.5, 500, 2200, 0.10, 0.5); },
  feuer()    { this.rauschen(0.9, 120, 700, 0.07, 0.7); },

  fanfare() {
    if (!this.an()) return;
    [523, 659, 784, 1047].forEach((f, i) =>
      setTimeout(() => this.ton(f, 0.34, 'triangle', 0.20), i * 105));
  },
  aufstieg() {
    if (!this.an()) return;
    [392, 523, 659, 784, 1047, 1319].forEach((f, i) =>
      setTimeout(() => this.ton(f, 0.42, 'triangle', 0.18), i * 85));
  },

  /* Martinshorn: deutsches Zweiklanghorn, a' und d'' */
  martinshorn(runden) {
    if (!this.an()) return;
    const n = runden || 2;
    for (let i = 0; i < n; i++) {
      setTimeout(() => this.ton(440, 0.45, 'square', 0.12), i * 900);
      setTimeout(() => this.ton(586, 0.45, 'square', 0.12), i * 900 + 450);
    }
  },

  /* --- Sprachausgabe der Kommandos --------------------------------------- */
  stimme: null,
  stimmeSuchen() {
    if (!window.speechSynthesis) return null;
    const alle = speechSynthesis.getVoices();
    if (!alle.length) return null;
    const de = alle.filter(v => /^de/i.test(v.lang));
    // bevorzugt eine lokale, maennlich klingende deutsche Stimme
    this.stimme = de.find(v => v.localService && /markus|yannick|conrad|male/i.test(v.name))
               || de.find(v => v.localService) || de[0] || null;
    return this.stimme;
  },

  /* --- Aussprache geradebiegen ------------------------------------------
     Zwei Macken der deutschen Sprachausgabe:
     1. "1. Rohr" wird als "eins Punkt Rohr" oder im falschen Fall gelesen.
        Wir schreiben die Ordnungszahl aus – und zwar im richtigen Fall,
        je nachdem ob ein "mit" davorsteht.
     2. Zusammensetzungen mit s+t an der Fuge werden wie am Wortanfang
        gesprochen ("Angriffschtrupp"). Ein Bindestrich an der Fuge trennt
        die Silben und die Aussprache stimmt.
     Der angezeigte Text bleibt davon unberuehrt.                          */
  ORDNUNG: [
    [/\bmit\s+1\.\s*Rohr\b/gi, 'mit erstem Rohr'],
    [/\bmit\s+2\.\s*Rohr\b/gi, 'mit zweitem Rohr'],
    [/\bmit\s+3\.\s*Rohr\b/gi, 'mit drittem Rohr'],
    [/\b1\.\s*Rohr\b/g,  'Erstes Rohr'],
    [/\b2\.\s*Rohr\b/g,  'Zweites Rohr'],
    [/\b3\.\s*Rohr\b/g,  'Drittes Rohr'],
  ],
  FUGEN: [
    ['Angriffstrupp', 'Angriffs-Trupp'],
    ['Einsatzstelle', 'Einsatz-Stelle'],
    ['Wasserentnahmestelle', 'Wasserentnahme-Stelle'],
    ['Unterflurhydrant', 'Unterflur-Hydrant'],
    ['Überflurhydrant', 'Überflur-Hydrant'],
    ['Löschfahrzeugs', 'Löschfahrzeuges'],
    ['Brandabschnitt', 'Brand-Abschnitt'],
  ],
  sprechbar(text) {
    let t = String(text);
    for (const [muster, ersatz] of this.ORDNUNG) t = t.replace(muster, ersatz);
    for (const [wort, ersatz] of this.FUGEN) {
      t = t.split(wort).join(ersatz);
      const klein = wort.charAt(0).toLowerCase() + wort.slice(1);
      const ersatzKlein = ersatz.charAt(0).toLowerCase() + ersatz.slice(1);
      t = t.split(klein).join(ersatzKlein);
    }
    return t;
  },

  sprich(text, opt) {
    if (!State.sprache || !window.speechSynthesis) return;
    const o = opt || {};
    try {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(this.sprechbar(text));
      if (!this.stimme) this.stimmeSuchen();
      if (this.stimme) u.voice = this.stimme;
      u.lang = 'de-DE';
      u.rate = o.rate || 1.0;
      u.pitch = o.pitch || 1.0;
      u.volume = o.volume == null ? 1 : o.volume;
      speechSynthesis.speak(u);
    } catch (e) { /* Sprachausgabe nicht verfuegbar – kein Drama */ }
  },

  /* ein Kommando: laut, bestimmt, etwas tiefer */
  kommando(text) { this.sprich(text, { rate: 0.98, pitch: 0.85 }); },
  still() { try { speechSynthesis.cancel(); } catch (e) {} },
};

if (window.speechSynthesis) {
  speechSynthesis.addEventListener('voiceschanged', () => Audio3.stimmeSuchen());
}
