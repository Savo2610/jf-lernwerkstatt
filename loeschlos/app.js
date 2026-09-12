/* =========================================================================
   LÖSCHLOS – Truppauslosung für die Jugendfeuerwehr
   Alles lokal, alles offline. Vanilla JS, kein Build.
   ========================================================================= */
'use strict';

/* ------------------------------ Rollen ---------------------------------- */
const ROLES = {
  EF : {name:'Einheitsführer',      short:'Einheitsführer', sym:'EF', shape:'schild', group:'EF', rank:'F', color:'ef', hint:'Führt die Gruppe'},
  Ma : {name:'Maschinist',          short:'Maschinist',     sym:'Ma', shape:'rad',    group:'MA', rank:'M', color:'ma', hint:'An der Pumpe'},
  Me : {name:'Melder',              short:'Melder',         sym:'Me', shape:'kreis',  group:'ME', rank:'M', color:'me', hint:'Verbindung'},
  ATF: {name:'Angriffstruppführer', short:'Truppführer',    sym:'A',  shape:'raute',  group:'AT', rank:'F', color:'at'},
  ATM: {name:'Angriffstruppmann',   short:'Truppmann',      sym:'A',  shape:'raute',  group:'AT', rank:'M', color:'at', dup:true},
  WTF: {name:'Wassertruppführer',   short:'Truppführer',    sym:'W',  shape:'raute',  group:'WT', rank:'F', color:'wt'},
  WTM: {name:'Wassertruppmann',     short:'Truppmann',      sym:'W',  shape:'raute',  group:'WT', rank:'M', color:'wt', dup:true},
  STF: {name:'Schlauchtruppführer', short:'Truppführer',    sym:'S',  shape:'raute',  group:'ST', rank:'F', color:'st'},
  STM: {name:'Schlauchtruppmann',   short:'Truppmann',      sym:'S',  shape:'raute',  group:'ST', rank:'M', color:'st', dup:true},
  RES: {name:'Reserve',             short:'Reserve',        sym:'R',  shape:'kreis',  group:'RES',rank:'M', color:'res'},
};
const ORDER  = ['EF','Ma','Me','ATF','ATM','WTF','WTM','STF','STM'];
const GROUPS = {
  AT:{name:'Angriffstrupp', color:'at'},
  WT:{name:'Wassertrupp',   color:'wt'},
  ST:{name:'Schlauchtrupp', color:'st'},
};
const GRID = [
  {label:'Führung & Einzelplätze', keys:['EF','Ma','Me']},
  {label:'Trupps',                 keys:['ATF','ATM','WTF','WTM','STF','STM']},
];

/* Vorschläge nach Kopfzahl (Fahrzeug 1) */
const PRESETS = {
  1 :{ATF:1},
  2 :{ATF:1, ATM:1},
  3 :{ATF:1, ATM:1, Me:1},
  4 :{ATF:1, ATM:1, WTF:1, WTM:1},
  5 :{ATF:1, ATM:1, WTF:1, WTM:1, Me:1},
  6 :{ATF:1, ATM:1, WTF:1, WTM:1, STF:1, STM:1},
  7 :{ATF:1, ATM:1, WTF:1, WTM:1, STF:1, STM:1, Me:1},
  8 :{ATF:1, ATM:1, WTF:1, WTM:1, STF:1, STM:1, Me:1, EF:1},
  9 :{ATF:1, ATM:1, WTF:1, WTM:1, STF:1, STM:1, Me:1, EF:1, Ma:1},
  10:{ATF:1, ATM:2, WTF:1, WTM:1, STF:1, STM:1, Me:1, EF:1, Ma:1},
  11:{ATF:1, ATM:2, WTF:1, WTM:2, STF:1, STM:1, Me:1, EF:1, Ma:1},
};
const MAX_PER_VEH = 11;

const DEMO = ['Ben','Mia','Luca','Emma','Finn','Lina','Noah','Ida','Jonas','Marie','Paul','Leni'];

/* ------------------------------ Sprüche --------------------------------- */
const CHEERS = [
  'Aufsitzen!', 'Wasser marsch!', 'Angriff vor!', 'Fertig zum Einsatz!',
  'Los geht’s!', 'Trupps stehen!', 'Einsatzbereit!', 'Ab auf die Plätze!',
];
const SUBS = [
  'Das Los hat gesprochen.',
  'Frisch aus der Losbox.',
  'Ausgewürfelt und für gut befunden.',
  'Keine Diskussion – das Los ist Chef.',
  'Sauber durchgemischt.',
];

/* ------------------------------- State ---------------------------------- */
const LS = 'loeschlos.v1';
let state = {
  kids: [],            // {id, name, present}
  twoVehicles: false,
  slots: [{}, {}],     // pro Fahrzeug: {roleKey: anzahl}
  slotsTouched: false,
  history: [],         // [{ts, entries:[{id, role, veh}]}]
  sound: false,
  step: 0,
};
let result = null;     // {veh:[[{roleKey,personId}]], reserve:[ids]}
let roundOpen = false; // aktuelle Runde liegt bereits in der History
let editMode = false;

function save(){
  try{
    localStorage.setItem(LS, JSON.stringify({
      kids:state.kids, twoVehicles:state.twoVehicles, slots:state.slots,
      slotsTouched:state.slotsTouched, history:state.history, sound:state.sound,
    }));
  }catch(e){ /* privater Modus – dann halt nur für jetzt */ }
}
function load(){
  try{
    const raw = localStorage.getItem(LS);
    if(!raw) return;
    const d = JSON.parse(raw);
    Object.assign(state, {
      kids: Array.isArray(d.kids) ? d.kids : [],
      twoVehicles: !!d.twoVehicles,
      slots: Array.isArray(d.slots) && d.slots.length === 2 ? d.slots : [{},{}],
      slotsTouched: !!d.slotsTouched,
      history: Array.isArray(d.history) ? d.history : [],
      sound: !!d.sound,
    });
    sortKids();
  }catch(e){ /* egal */ }
}

/* ------------------------------- Helfer --------------------------------- */
const $  = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => [...r.querySelectorAll(s)];
const uid = () => Math.random().toString(36).slice(2, 9);
const present = () => state.kids.filter(k => k.present);
const byId = id => state.kids.find(k => k.id === id);
const initials = n => n.trim().split(/\s+/).map(w=>w[0]).join('').slice(0,2).toUpperCase() || '?';
const collator = new Intl.Collator('de', {sensitivity:'base', numeric:true});
const sortKids = () => state.kids.sort((a,b) => collator.compare(a.name, b.name));
const reduceMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const plural = (n, one, many) => `${n} ${n===1?one:many}`;

function toast(msg){
  const t = $('#toast');
  t.textContent = msg; t.classList.add('on');
  clearTimeout(toast._t);
  toast._t = setTimeout(()=>t.classList.remove('on'), 2200);
}
function buzz(ms=12){ if(navigator.vibrate) try{ navigator.vibrate(ms); }catch(e){} }

/* --------------------------- Taktische Zeichen --------------------------- */
/* Raute = Trupp (gefüllt: Truppführer, offen: Truppmann)
   Schild = Einheitsführer · Zahnrad-Kreis = Maschinist · Kreis = Melder     */
function sign(roleKey, cls=''){
  const r = ROLES[roleKey];
  const c = `var(--${r.color})`;
  const filled = r.rank === 'F';
  const fill   = filled ? c : 'none';
  const txt    = filled ? '#0b0e14' : c;
  const sw     = 7;
  let body = '';

  if(r.shape === 'raute'){
    body = `<path d="M50 7 L93 50 L50 93 L7 50 Z" fill="${fill}" stroke="${c}" stroke-width="${sw}" stroke-linejoin="round"/>`;
  }else if(r.shape === 'schild'){
    body = `<path d="M50 6 L90 20 V52 C90 74 72 88 50 95 C28 88 10 74 10 52 V20 Z"
             fill="${fill}" stroke="${c}" stroke-width="${sw}" stroke-linejoin="round"/>`;
  }else if(r.shape === 'rad'){
    body = `<circle cx="50" cy="50" r="40" fill="${fill}" stroke="${c}" stroke-width="${sw}"/>
            <circle cx="50" cy="50" r="47" fill="none" stroke="${c}" stroke-width="5"
              stroke-dasharray="7 9" stroke-linecap="round" opacity=".85"/>`;
  }else{
    body = `<circle cx="50" cy="50" r="41" fill="${fill}" stroke="${c}" stroke-width="${sw}"/>`;
  }
  const fs = r.sym.length > 1 ? 33 : 42;
  return `<svg class="sign ${cls}" viewBox="0 0 100 100" role="img" aria-label="${r.name}">
    ${body}
    <text x="50" y="50" text-anchor="middle" dominant-baseline="central"
      font-family="${'ui-sans-serif, system-ui, sans-serif'}" font-weight="900"
      font-size="${fs}" fill="${txt}" letter-spacing="-1">${r.sym}</text>
  </svg>`;
}

/* ============================ SCHRITT 1: LISTE =========================== */
function renderRoster(){
  const box = $('#roster'), empty = $('#roster-empty');
  const has = state.kids.length > 0;
  box.hidden = !has;
  empty.hidden = has;
  $('#quickrow').hidden = !has;
  $('#addbox').hidden = !(editMode || !has);
  if(!has){ box.innerHTML = ''; updateFooter(); return; }

  box.classList.toggle('editing', editMode);
  box.innerHTML = state.kids.map(k => `
    <div class="kid ${k.present && !editMode ? 'present':''}" data-id="${k.id}"
         ${editMode ? '' : `role="button" tabindex="0" aria-pressed="${k.present}"`}>
      <div class="av">${esc(initials(k.name))}</div>
      ${editMode
        ? `<input class="rename" value="${esc(k.name)}" aria-label="Name ändern">
           <button class="del" title="Entfernen">✕</button>`
        : `<div class="nm">${esc(k.name)}</div>
           <svg class="tick" viewBox="0 0 24 24" aria-hidden="true">
             <path d="M4 12.5 L9.5 18 L20 6.5" fill="none" stroke="var(--ok)"
               stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`}
    </div>`).join('');

  const n = present().length;
  $('#roster-sub').textContent = editMode
    ? 'Namen ändern, löschen oder unten neue eintragen.'
    : (n ? `${plural(n,'Kind ist','Kinder sind')} angetreten.` : 'Tippe die Namen an, die antreten.');
  updateFooter();
}
function esc(s){ return String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }

function addNames(str){
  const names = str.split(/[,;\n]/).map(s=>s.trim()).filter(Boolean);
  if(!names.length) return;
  for(const name of names) state.kids.push({id:uid(), name, present:true});
  sortKids();
  state.slotsTouched = false;
  save(); renderRoster();
  toast(names.length===1 ? `${names[0]} ist dabei.` : `${names.length} Namen eingetragen.`);
}

/* ============================ SCHRITT 2: PLÄTZE ========================== */
function slotCount(v){ return Object.values(state.slots[v]||{}).reduce((a,b)=>a+b,0); }
function totalSlots(){ return slotCount(0) + (state.twoVehicles ? slotCount(1) : 0); }

/* Zwei Fahrzeuge gibt es erst ab acht Anwesenden. Fällt die Zahl darunter,
   muss der Schalter zurück – sonst bleibt er unerreichbar eingeschaltet,
   weil seine Zeile dann gar nicht mehr angezeigt wird. */
const VEH2_AB = 8;
function normalizeVehicles(){
  if(state.twoVehicles && present().length < VEH2_AB){
    state.twoVehicles = false;
    state.slots[1] = {};
    state.slotsTouched = false;
    save();
    return true;
  }
  return false;
}

/* Vorschlag je Fahrzeug. Bei zwei Fahrzeugen wird die Mannschaft
   gleichmäßig geteilt; ein übriges Kind geht aufs erste Fahrzeug.
   8 → 4+4 (je AT und WT), 9 → 5+4, 11 → 6+5 und so weiter. */
function presetSplit(){
  const n = present().length;
  if(!state.twoVehicles) return [{...(PRESETS[Math.min(n, MAX_PER_VEH)] || {})}, {}];
  const a = Math.min(Math.ceil(n / 2), MAX_PER_VEH);
  const b = Math.min(n - a, MAX_PER_VEH);
  return [{...(PRESETS[a] || {})}, {...(PRESETS[b] || {})}];
}

function applyPreset(){
  state.slots = presetSplit();
  state.slotsTouched = false;
  save(); renderSlots();
}

function renderSlots(){
  normalizeVehicles();
  const n = present().length;
  if(!state.slotsTouched) {
    // stiller Abgleich, ohne Rekursion
    const before = JSON.stringify(state.slots);
    state.slots = presetSplit();
    if(before !== JSON.stringify(state.slots)) save();
  }

  $('#veh2row').classList.toggle('hidden', n < VEH2_AB);
  $('#veh2').checked = state.twoVehicles;

  const vehCount = state.twoVehicles ? 2 : 1;
  $('#vehicles').innerHTML = Array.from({length:vehCount}, (_,v)=>vehicleCard(v)).join('');
  renderBalance();
  updateFooter();
}

function vehicleCard(v){
  const cnt = slotCount(v);
  const head = state.twoVehicles
    ? `<b>${v===0?'Fahrzeug 1':'Fahrzeug 2'}</b>`
    : `<b>Besatzung</b>`;
  return `<div class="veh" data-veh="${v}">
    <div class="veh-head">${head}
      <span class="cnt ${cnt?'full':''}">${plural(cnt,'Platz','Plätze')}</span></div>
    <div class="veh-body">
      ${GRID.map(sec => `
        <div class="grp-label">${sec.label}</div>
        <div class="rolegrid">
          ${sec.keys.map(k => roleCard(k, v)).join('')}
        </div>`).join('')}
    </div></div>`;
}

function roleCard(key, v){
  const r = ROLES[key];
  const c = state.slots[v][key] || 0;
  const gname = GROUPS[r.group] ? GROUPS[r.group].name : r.hint;
  return `<div class="role ${c>0?'on':''} ${c>1?'dup':''} ${r.dup?'dupable':''}" data-role="${key}" data-veh="${v}"
      style="--c:var(--${r.color})" role="button" tabindex="0" aria-pressed="${c>0}">
    ${sign(key)}
    <div class="txt"><b>${r.short}</b><small>${gname}</small></div>
    ${r.dup ? `<button class="plus" title="Zweiter ${r.name}">${c>1?'×2':'+1'}</button>` : ''}
  </div>`;
}

function renderBalance(){
  const n = present().length, s = totalSlots(), diff = n - s;
  const el = $('#balance');
  let cls = 'ok', msg = 'Passt – alle haben einen Platz.';
  if(s > n){ cls = 'over'; msg = `${plural(s-n,'Platz','Plätze')} zu viel – nimm welche raus.`; }
  else if(diff > 0){ cls = ''; msg = `${plural(diff,'Kind','Kinder')} auf der Reservebank.`; }
  if(n === 0){ cls = 'over'; msg = 'Niemand da – zurück zu Schritt 1.'; }
  el.className = `balance ${cls}`;
  el.innerHTML = `<span class="big">${s}</span><span>von ${n} besetzt</span>
                  <span class="msg">· ${msg}</span>`;
}

/* ========================= DIE LOSTROMMEL (fair) ========================= */
/* Drei Dinge fließen in die Bewertung ein:
   1. Erinnerung  – was war zuletzt? Je frischer, desto teurer die Wiederholung.
   2. Quote       – wie oft hatte jemand diese Position bisher, verglichen mit
                    dem, was rechnerisch auf ihn entfallen müsste?
   3. Verworfenes – jeder Vorschlag, den man in dieser Runde weggemischt hat,
                    wird ebenfalls teuer. Sonst pendelt das Neu-Mischen nur
                    zwischen zwei Lösungen hin und her.                        */

const HIST_DEPTH  = 14;   // gewichtete Erinnerung
const COUNT_DEPTH = 40;   // Zählstatistik für die Quote
const W = {
  role:8, group:3.5, rank:2, partner:6, reserve:9,
  roleQuote:4.5, rankQuote:3,
  again:11, againPartner:7,
};

/* In dieser Runde bereits gezeigte und wieder verworfene Auslosungen. */
let discarded = [];

function buildStats(){
  const st = {role:{}, group:{}, rank:{}, partner:{}, reserve:{},
              cntRole:{}, cntRank:{}, rounds:{}, again:{}, againP:{}};
  const ensure = (o,id) => (o[id] = o[id] || {});

  /* 1. Erinnerung – klingt langsam ab, statt nach acht Runden abzureißen. */
  state.history.slice(0, HIST_DEPTH).forEach((round, i) => {
    const w = 1 / (1 + i * 0.6);
    const byGroup = {};
    round.entries.forEach(e => {
      const r = ROLES[e.role]; if(!r) return;
      const R = ensure(st.role,e.id);   R[e.role] = (R[e.role]||0) + w;
      const G = ensure(st.group,e.id);  G[r.group] = (G[r.group]||0) + w;
      const K = ensure(st.rank,e.id);   K[r.rank] = (K[r.rank]||0) + w;
      if(e.role === 'RES') st.reserve[e.id] = (st.reserve[e.id]||0) + w;
      if(GROUPS[r.group]){
        const key = e.veh + '|' + r.group;
        (byGroup[key] = byGroup[key] || []).push(e.id);
      }
    });
    Object.values(byGroup).forEach(ids => {
      for(let a=0;a<ids.length;a++) for(let b=a+1;b<ids.length;b++){
        const P1 = ensure(st.partner,ids[a]), P2 = ensure(st.partner,ids[b]);
        P1[ids[b]] = (P1[ids[b]]||0) + w;
        P2[ids[a]] = (P2[ids[a]]||0) + w;
      }
    });
  });

  /* 2. Quote – ungewichtete Zählung über viele Runden. Damit fällt auf,
        wenn jemand den Einheitsführer schon dreimal hatte und ein anderer
        noch nie, auch wenn das alles länger her ist. */
  state.history.slice(0, COUNT_DEPTH).forEach(round => {
    round.entries.forEach(e => {
      const r = ROLES[e.role]; if(!r) return;
      st.rounds[e.id] = (st.rounds[e.id]||0) + 1;
      const R = ensure(st.cntRole,e.id); R[e.role] = (R[e.role]||0) + 1;
      const K = ensure(st.cntRank,e.id); K[r.rank] = (K[r.rank]||0) + 1;
    });
  });

  /* 3. Verworfenes aus dieser Runde. */
  discarded.slice(-10).forEach(round => {
    const byGroup = {};
    round.entries.forEach(e => {
      const r = ROLES[e.role]; if(!r) return;
      const A = ensure(st.again,e.id); A[e.role] = (A[e.role]||0) + 1;
      if(GROUPS[r.group]){
        const key = e.veh + '|' + r.group;
        (byGroup[key] = byGroup[key] || []).push(e.id);
      }
    });
    Object.values(byGroup).forEach(ids => {
      for(let a=0;a<ids.length;a++) for(let b=a+1;b<ids.length;b++){
        const P1 = ensure(st.againP,ids[a]), P2 = ensure(st.againP,ids[b]);
        P1[ids[b]] = (P1[ids[b]]||0) + 1;
        P2[ids[a]] = (P2[ids[a]]||0) + 1;
      }
    });
  });
  return st;
}

function buildSlotList(){
  const list = [];
  const vehs = state.twoVehicles ? [0,1] : [0];
  for(const v of vehs){
    for(const key of ORDER){
      const c = state.slots[v][key] || 0;
      for(let i=0;i<c;i++) list.push({role:key, veh:v});
    }
  }
  return list;
}

function draw(){
  const people = present().map(k => k.id);
  const slots  = buildSlotList();
  while(slots.length < people.length) slots.push({role:'RES', veh:-1});
  if(slots.length > people.length || !people.length) return null;

  /* Was gerade auf dem Bildschirm steht, wandert beim Neu-Mischen auf den
     Stapel der verworfenen Vorschläge – sonst kommt es sofort wieder. */
  if(roundOpen && state.history[0]){
    discarded.push(state.history[0]);
    if(discarded.length > 10) discarded.shift();
  }

  const st = buildStats();
  const n = people.length;

  /* Erwartungswert je Rolle und je Rang: so viel entfällt rechnerisch
     auf jedes Kind, wenn alles gleichmäßig zugeht. */
  const expRole = {}, expRank = {F:0, M:0};
  slots.forEach(s2 => {
    expRole[s2.role] = (expRole[s2.role] || 0) + 1 / n;
    expRank[ROLES[s2.role].rank] += 1 / n;
  });

  /* Zufallsrauschen bricht Gleichstände – pro Ziehung fix, damit die
     Bergsteiger-Suche nicht im Kreis läuft. */
  const noise = slots.map(() => people.map(() => Math.random() * 0.9));

  /* Partner-Paare innerhalb eines Trupps vorberechnen */
  const pairs = [];
  for(let i=0;i<slots.length;i++) for(let j=i+1;j<slots.length;j++){
    const a = ROLES[slots[i].role], b = ROLES[slots[j].role];
    if(slots[i].veh === slots[j].veh && a.group === b.group && GROUPS[a.group]) pairs.push([i,j]);
  }

  const slotCost = (si, pi) => {
    const s = slots[si], id = people[pi], r = ROLES[s.role];
    let c = noise[si][pi];

    /* frische Erinnerung */
    c += W.role    * ((st.role[id]||{})[s.role]   || 0);
    c += W.group   * ((st.group[id]||{})[r.group] || 0);
    c += W.rank    * ((st.rank[id]||{})[r.rank]   || 0);
    if(s.role === 'RES') c += W.reserve * (st.reserve[id] || 0);

    /* Quote: Anteil an den bisherigen Runden, gemessen am Erwartungswert.
       Zwei Pseudo-Runden glätten das, solange kaum Historie da ist. */
    const runden = st.rounds[id] || 0;
    const eRole = expRole[s.role] || 1 / n;
    const eRank = expRank[r.rank] || 1 / n;
    const hatRole = (st.cntRole[id]||{})[s.role] || 0;
    const hatRank = (st.cntRank[id]||{})[r.rank] || 0;
    c += W.roleQuote * ((hatRole + 2 * eRole) / (runden + 2)) / eRole;
    c += W.rankQuote * ((hatRank + 2 * eRank) / (runden + 2)) / eRank;

    /* in dieser Runde schon vorgeschlagen und weggemischt */
    c += W.again * ((st.again[id]||{})[s.role] || 0);
    return c;
  };
  const pairCost = perm => {
    let c = 0;
    for(const [i,j] of pairs){
      const a = people[perm[i]], b = people[perm[j]];
      c += W.partner      * ((st.partner[a]||{})[b] || 0);
      c += W.againPartner * ((st.againP[a] ||{})[b] || 0);
    }
    return c;
  };
  const total = perm => {
    let c = pairCost(perm);
    for(let i=0;i<n;i++) c += slotCost(i, perm[i]);
    return c;
  };

  let best = null;
  const restarts = n > 14 ? 18 : 30;
  for(let r=0;r<restarts;r++){
    const perm = people.map((_,i)=>i);
    for(let i=n-1;i>0;i--){ const j=(Math.random()*(i+1))|0; [perm[i],perm[j]]=[perm[j],perm[i]]; }
    let cost = total(perm), moved = true, guard = 0;
    while(moved && guard++ < 40){
      moved = false;
      for(let i=0;i<n;i++) for(let j=i+1;j<n;j++){
        [perm[i],perm[j]] = [perm[j],perm[i]];
        const c2 = total(perm);
        if(c2 < cost - 1e-9){ cost = c2; moved = true; }
        else [perm[i],perm[j]] = [perm[j],perm[i]];
      }
    }
    if(!best || cost < best.cost) best = {cost, perm:perm.slice()};
  }

  const entries = slots.map((s,i) => ({id: people[best.perm[i]], role: s.role, veh: s.veh}));
  const round = {ts: Date.now(), entries};
  if(roundOpen) state.history[0] = round;
  else { state.history.unshift(round); roundOpen = true; }
  state.history = state.history.slice(0, COUNT_DEPTH);
  save();
  return round;
}

/* ========================= SCHRITT 3: ERGEBNIS ========================== */
function renderResult(animate){
  if(!result){ $('#result').innerHTML = ''; return; }
  const vehs = state.twoVehicles ? [0,1] : [0];
  const reserve = result.entries.filter(e => e.role === 'RES');

  let html = vehs.map(v => {
    const mine = result.entries.filter(e => e.veh === v);
    const singles = mine.filter(e => !GROUPS[ROLES[e.role].group]);
    const groups  = ['AT','WT','ST'].map(g => ({
      g, items: mine.filter(e => ROLES[e.role].group === g)
                    .sort((a,b)=>ORDER.indexOf(a.role)-ORDER.indexOf(b.role))
    })).filter(x => x.items.length);
    if(!mine.length) return '';
    return `<div class="rveh">
      <div class="rveh-head"><b>${state.twoVehicles ? (v===0?'Fahrzeug 1':'Fahrzeug 2') : 'Besatzung'}</b>
        <span class="stripe stripes" style="background:linear-gradient(90deg,var(--at),var(--wt),var(--st))"></span>
        <span class="cnt" style="font-size:11px;color:var(--txt-mute)">${mine.length}</span></div>
      <div class="rveh-body">
        ${singles.sort((a,b)=>ORDER.indexOf(a.role)-ORDER.indexOf(b.role)).map(slotRow).join('')}
        ${groups.map(x => `
          <div class="trupp" style="--c:var(--${GROUPS[x.g].color})">
            <div class="tname">${GROUPS[x.g].name}</div>
            ${x.items.map(slotRow).join('')}
          </div>`).join('')}
      </div></div>`;
  }).join('');

  if(reserve.length){
    html += `<div class="reserve-box"><b>Reservebank</b>
      <p>${reserve.map(e => esc((byId(e.id)||{}).name || '?')).join(' · ')}</p></div>`;
  }
  html += `<button class="redraw" id="btn-redraw"><span class="dice">🎲</span> Neu mischen</button>`;
  $('#result').innerHTML = html;

  $('#result-title').textContent = pick(CHEERS);
  $('#result-sub').textContent  = pick(SUBS);
  $('#btn-redraw').addEventListener('click', () => doDraw(true));

  const rows = $$('.slot', $('#result'));
  if(animate && !reduceMotion()) slotMachine(rows);
  else rows.forEach(r => { r.classList.add('in'); r.style.animation='none'; r.style.opacity=1; r.style.transform='none'; });
}

function slotRow(e){
  const r = ROLES[e.role];
  const k = byId(e.id) || {name:'?'};
  const fresh = isFirstTime(e.id, e.role);
  return `<div class="slot" style="--c:var(--${r.color})" data-name="${esc(k.name)}">
    ${sign(e.role)}
    <div class="who">
      <div class="name">${esc(k.name)}</div>
      <span class="role">${r.name}</span>
    </div>
    ${fresh ? '<span class="badge new">Premiere</span>' : ''}
  </div>`;
}

/* „Premiere“ nur, wenn es auch etwas zu vergleichen gibt. */
function isFirstTime(id, role){
  if(role === 'RES') return false;
  const past = state.history.slice(1).filter(rd => rd.entries.some(e => e.id === id));
  if(past.length < 4) return false;
  return !past.some(rd => rd.entries.some(e => e.id === id && e.role === role));
}
function pick(a){ return a[(Math.random()*a.length)|0]; }

/* Einarmiger Bandit: Namen rattern kurz durch, dann rastet es ein. */
function slotMachine(rows){
  const names = present().map(k => k.name);
  rows.forEach((row, i) => {
    const el = $('.name', row), final = row.dataset.name;
    row.style.animationDelay = (i * 55) + 'ms';
    row.classList.add('in', 'rolling');
    const stop = 420 + i * 190;
    const tick = setInterval(() => { el.textContent = names[(Math.random()*names.length)|0]; }, 55);
    setTimeout(() => {
      clearInterval(tick);
      el.textContent = final;
      row.classList.remove('rolling');
      row.style.animationDelay = '0ms';
      /* Endzustand fest verdrahten – keine Animation darf ihn wieder wegnehmen. */
      row.style.opacity = '1';
      row.style.transform = 'none';
      row.classList.add('locked');
      blip(520 + i * 40);
      if(i === rows.length - 1){ setTimeout(() => { confetti(); horn(); }, 160); }
    }, stop);
  });
}

/* ------------------------------ Effekte --------------------------------- */
let AC = null;
const audio = () => (AC = AC || new (window.AudioContext||window.webkitAudioContext)());
function tone(freq, t0, dur, gain=0.08, type='triangle'){
  if(!state.sound) return;
  const ac = audio(), o = ac.createOscillator(), g = ac.createGain();
  o.type = type; o.frequency.value = freq;
  g.gain.setValueAtTime(0, ac.currentTime + t0);
  g.gain.linearRampToValueAtTime(gain, ac.currentTime + t0 + .02);
  g.gain.exponentialRampToValueAtTime(.0001, ac.currentTime + t0 + dur);
  o.connect(g).connect(ac.destination);
  o.start(ac.currentTime + t0); o.stop(ac.currentTime + t0 + dur + .05);
}
function blip(f){ tone(f, 0, .07, .045, 'square'); }
function horn(){ /* Martinshorn, klein */
  tone(440, 0, .34, .10); tone(586, .36, .34, .10);
  tone(440, .74, .34, .10); tone(586, 1.10, .40, .10);
}

function alarm(){
  const el = $('#alarmlight');
  el.classList.remove('on'); void el.offsetWidth; el.classList.add('on');
  buzz(24);
}

function confetti(){
  if(reduceMotion()) return;
  const cv = $('#confetti'), ctx = cv.getContext('2d');
  const dpr = Math.min(devicePixelRatio||1, 2);
  cv.width = innerWidth*dpr; cv.height = innerHeight*dpr; cv.style.display='block';
  ctx.scale(dpr, dpr);
  const cols = ['#ff4433','#3b8cff','#22c55e','#f7b733','#fb923c','#ffffff'];
  const P = Array.from({length: 90}, () => ({
    x: innerWidth*Math.random(), y: -20 - Math.random()*innerHeight*.4,
    vx: (Math.random()-.5)*2.4, vy: 2 + Math.random()*3.4,
    w: 5+Math.random()*7, h: 4+Math.random()*6,
    rot: Math.random()*Math.PI, vr:(Math.random()-.5)*.26,
    c: cols[(Math.random()*cols.length)|0],
  }));
  let t0 = performance.now();
  (function frame(t){
    const dt = Math.min((t-t0)/16.7, 3); t0 = t;
    ctx.clearRect(0,0,innerWidth,innerHeight);
    let alive = false;
    for(const p of P){
      p.x += p.vx*dt; p.y += p.vy*dt; p.vy += .035*dt; p.rot += p.vr*dt;
      if(p.y < innerHeight + 30) alive = true;
      ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(p.rot);
      ctx.fillStyle = p.c; ctx.fillRect(-p.w/2,-p.h/2,p.w,p.h); ctx.restore();
    }
    if(alive) requestAnimationFrame(frame);
    else { ctx.clearRect(0,0,innerWidth,innerHeight); cv.style.display='none'; }
  })(t0);
}

/* ------------------------------ Navigation ------------------------------ */
function go(step){
  if(step === state.step) return;
  state.step = step;
  $$('.screen').forEach((s,i) => s.classList.toggle('on', i === step));
  $$('#stepper button').forEach((b,i) => {
    b.classList.toggle('active', i === step);
    b.classList.toggle('done', i < step);
  });
  $('#stepbar').style.width = ((step+1)/3*100) + '%';
  if(step === 1) renderSlots();
  updateFooter();
  scrollTo({top:0, behavior: reduceMotion() ? 'auto' : 'smooth'});
}

function updateFooter(){
  normalizeVehicles();
  const n = present().length, s = totalSlots();
  const cta = $('#btn-next'), lbl = $('#cta-label'), back = $('#btn-back');
  back.hidden = state.step === 0;
  cta.classList.toggle('go', state.step === 1);
  if(state.step === 0){
    cta.disabled = n === 0;
    lbl.textContent = n === 0 ? 'Erst Namen antippen' : `Weiter mit ${n}`;
  }else if(state.step === 1){
    cta.disabled = n === 0 || s > n || s === 0;
    lbl.textContent = s > n ? 'Zu viele Plätze'
                    : s === 0 ? 'Plätze wählen'
                    : 'Auslosen! 🎲';
  }else{
    cta.disabled = false;
    lbl.textContent = 'Neue Runde';
  }
}

function doDraw(isRedraw){
  const round = draw();
  if(!round){ toast('Das passt noch nicht zusammen.'); return; }
  result = round;
  if(state.step !== 2) go(2);
  alarm();
  renderResult(true);
  if(isRedraw) toast('Neu gemischt – andere Plätze, andere Partner.');
}

/* -------------------------------- Teilen ---------------------------------
   Drei Wege, und nur einer davon kann Formatierung:

   1. Das Teilen-Blatt des Systems kennt ausschliesslich reinen Text. Ein Wort
      laesst sich dort nicht verlinken – die Adresse geht deshalb als eigenes
      Feld mit, und Messenger machen aus einer nackten Adresse von selbst
      einen Link samt Vorschau. Nicht in den Text schreiben, sonst steht sie
      bei den meisten Zielen zweimal drin.
   2. Die Zwischenablage kann beides tragen. Wer in Mail, Notizen oder ein
      Textprogramm einfuegt, bekommt „Löschlos" als echten Link.
   3. Wer nur Text einfuegt – jeder Messenger am Rechner – bekommt die
      Adresse als letzte Zeile. Anklickbar macht sie dort wieder der Messenger.
                                                                            */
const TEILEN_URL = 'https://jf.veerka.mp/loeschlos/';

/* Die Einteilung einmal als Zeilen, aus denen beide Fassungen entstehen. */
function ergebnisZeilen(){
  const vehs = state.twoVehicles ? [0,1] : [0];
  const bloecke = [];
  for(const v of vehs){
    const mine = result.entries.filter(e => e.veh === v)
      .sort((a,b)=>ORDER.indexOf(a.role)-ORDER.indexOf(b.role));
    if(!mine.length) continue;
    bloecke.push({
      kopf: state.twoVehicles ? (v===0 ? 'Fahrzeug 1' : 'Fahrzeug 2') : '',
      zeilen: mine.map(e => [ROLES[e.role].name, (byId(e.id)||{}).name || '?']),
    });
  }
  const res = result.entries.filter(e => e.role === 'RES');
  if(res.length) bloecke.push({
    kopf: '', zeilen: [['Reserve', res.map(e => (byId(e.id)||{}).name).join(', ')]],
  });
  return bloecke;
}

function ergebnisText(mitAdresse){
  const datum = new Date().toLocaleDateString('de-DE');
  let out = `Löschlos – Einteilung vom ${datum}\n`;
  for(const b of ergebnisZeilen()){
    out += '\n' + (b.kopf ? `— ${b.kopf} —\n` : '');
    out += b.zeilen.map(([rolle, wer]) => `${rolle}: ${wer}`).join('\n') + '\n';
  }
  if(mitAdresse) out += `\n${TEILEN_URL}\n`;
  return out;
}

function ergebnisHtml(){
  const datum = new Date().toLocaleDateString('de-DE');
  let out = `<p><a href="${TEILEN_URL}"><b>Löschlos</b></a> – Einteilung vom ${datum}</p>`;
  for(const b of ergebnisZeilen()){
    out += '<p>' + (b.kopf ? `<b>${esc(b.kopf)}</b><br>` : '');
    out += b.zeilen.map(([rolle, wer]) => `${esc(rolle)}: <b>${esc(wer)}</b>`).join('<br>') + '</p>';
  }
  return out;
}

/* Beide Fassungen in einem Rutsch in die Ablage. Firefox konnte `text/html`
   lange nicht und wirft dann – deshalb der Rückfall auf reinen Text, statt
   den Nutzer mit leerer Ablage stehen zu lassen. */
async function inDieAblage(text, html){
  try{
    if(window.ClipboardItem && navigator.clipboard && navigator.clipboard.write){
      await navigator.clipboard.write([new ClipboardItem({
        'text/plain': new Blob([text], {type: 'text/plain'}),
        'text/html':  new Blob([html], {type: 'text/html'}),
      })]);
      return true;
    }
  }catch(e){ /* kann kein HTML – dann eben nur Text */ }
  try{ await navigator.clipboard.writeText(text); return true; }
  catch(e){ return false; }
}

function copyResult(){
  if(!result) return;

  if(navigator.share){
    navigator.share({
      title: 'Löschlos – Einteilung',
      text: ergebnisText(false),
      url: TEILEN_URL,
    }).catch(() => {});
    return;
  }
  inDieAblage(ergebnisText(true), ergebnisHtml()).then(
    ok => toast(ok ? 'Kopiert – fertig zum Einfügen.' : 'Kopieren hat nicht geklappt.'));
}

/* ------------------------------- Events --------------------------------- */
function newRound(){ roundOpen = false; discarded = []; }

$('#roster').addEventListener('click', ev => {
  const kid = ev.target.closest('.kid'); if(!kid) return;
  const k = byId(kid.dataset.id); if(!k) return;
  if(ev.target.closest('.del')){
    state.kids = state.kids.filter(x => x.id !== k.id);
    state.slotsTouched = false; newRound(); save(); renderRoster();
    toast(`${k.name} ist raus.`); return;
  }
  if(editMode) return;
  k.present = !k.present;
  kid.classList.toggle('present', k.present);
  kid.setAttribute('aria-pressed', String(k.present));
  state.slotsTouched = false; newRound(); save();
  buzz(8); blip(k.present ? 760 : 380);
  $('#roster-sub').textContent = present().length
    ? `${plural(present().length,'Kind ist','Kinder sind')} angetreten.`
    : 'Tippe die Namen an, die antreten.';
  updateFooter();
});
$('#roster').addEventListener('keydown', ev => {
  if(ev.key !== 'Enter' && ev.key !== ' ') return;
  const kid = ev.target.closest('.kid');
  if(!kid || editMode) return;
  ev.preventDefault(); kid.click();
});
$('#roster').addEventListener('input', ev => {
  if(!ev.target.classList.contains('rename')) return;
  const k = byId(ev.target.closest('.kid').dataset.id); if(!k) return;
  k.name = ev.target.value;
  ev.target.closest('.kid').querySelector('.av').textContent = initials(k.name || '?');
  clearTimeout(save._t); save._t = setTimeout(save, 400);
});

$('#btn-edit').addEventListener('click', e => {
  editMode = !editMode;
  e.currentTarget.textContent = editMode ? 'Fertig' : 'Bearbeiten';
  e.currentTarget.classList.toggle('on', editMode);
  state.kids = state.kids.filter(k => k.name.trim());
  if(!editMode){ sortKids(); save(); }
  renderRoster();
  if(editMode) setTimeout(()=>$('#new-name')?.focus(), 80);
});
$('#btn-add').addEventListener('click', () => {
  const i = $('#new-name'); addNames(i.value); i.value=''; i.focus();
});
$('#new-name').addEventListener('keydown', e => {
  if(e.key === 'Enter'){ addNames(e.target.value); e.target.value=''; }
});
/* ------------------------------ Debug-Haken ------------------------------
   Beispielnamen sind zum Ausprobieren da, nicht zum Anbieten: wer die App
   zum ersten Mal öffnet, soll seine eigene Gruppe eintragen und nicht erst
   zwölf fremde Kinder wieder löschen. Über die Konsole bleiben sie greifbar:

       __loeschlos.beispiele()   zwölf Namen eintragen, alle anwesend
       __loeschlos.state         Namen, Plätze, Gedächtnis
       __loeschlos.ziehen()      eine Runde auslosen, ohne zu klicken
                                                                            */
window.__loeschlos = {
  beispiele: () => addNames(DEMO.join(',')),
  get state(){ return state; },
  ziehen: () => doDraw(false),
};
$('#btn-all').addEventListener('click', () => {
  state.kids.forEach(k=>k.present=true); state.slotsTouched=false; newRound(); save(); renderRoster(); buzz();
});
$('#btn-none').addEventListener('click', () => {
  state.kids.forEach(k=>k.present=false); state.slotsTouched=false; newRound(); save(); renderRoster();
});
$('#btn-invert').addEventListener('click', () => {
  state.kids.forEach(k=>k.present=!k.present); state.slotsTouched=false; newRound(); save(); renderRoster();
});

$('#vehicles').addEventListener('click', ev => {
  const card = ev.target.closest('.role'); if(!card) return;
  const key = card.dataset.role, v = +card.dataset.veh;
  const cur = state.slots[v][key] || 0;
  if(ev.target.closest('.plus')){
    state.slots[v][key] = cur > 1 ? 1 : 2;
  }else{
    if(cur > 0) delete state.slots[v][key];
    else state.slots[v][key] = 1;
  }
  state.slotsTouched = true; newRound(); save(); renderSlots();
  buzz(8); blip((state.slots[v][key]||0) ? 700 : 340);
});
$('#vehicles').addEventListener('keydown', ev => {
  if(ev.key !== 'Enter' && ev.key !== ' ') return;
  const card = ev.target.closest('.role'); if(!card) return;
  ev.preventDefault(); card.click();
});
$('#veh2').addEventListener('change', e => {
  state.twoVehicles = e.target.checked;
  state.slotsTouched = false; newRound(); save(); renderSlots();
  toast(state.twoVehicles ? 'Zweites Fahrzeug dabei.' : 'Nur noch ein Fahrzeug.');
});
$('#btn-preset').addEventListener('click', () => { applyPreset(); toast('Vorschlag gesetzt.'); });

$('#btn-next').addEventListener('click', () => {
  if(state.step === 0) go(1);
  else if(state.step === 1) doDraw(false);
  else { newRound(); go(0); }
});
$('#btn-back').addEventListener('click', () => go(Math.max(0, state.step - 1)));
$$('#stepper button').forEach(b => b.addEventListener('click', () => {
  const t = +b.dataset.step;
  if(t === 2 && !result) return;
  go(t);
}));
$('#btn-copy').addEventListener('click', copyResult);

/* --------------------------- Aufs Handy holen ---------------------------
   Chrome fragt von sich aus, aber nur einmal und leicht zu uebersehen. Wir
   fangen die Frage ab und stellen sie in der Legende noch einmal, wo man sie
   wiederfindet. Safari fragt nie – dort bleibt nur der Weg ueber das
   Teilen-Menue, und den muss man erklaeren.                                 */
let installRuf = null;
addEventListener('beforeinstallprompt', ev => { ev.preventDefault(); installRuf = ev; renderPwa(); });
addEventListener('appinstalled', () => { installRuf = null; renderPwa(); toast('Liegt jetzt auf dem Startbildschirm.'); });

const laeuftAlsApp = () =>
  matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;

function renderPwa(){
  const box = $('#pwa'); if(!box) return;

  if(laeuftAlsApp()){
    box.innerHTML = '<p class="hint">Läuft schon als App – nichts weiter zu tun.</p>';
    return;
  }
  if(installRuf){
    box.innerHTML = '<p class="hint">Dann liegt Löschlos als Symbol auf dem Startbildschirm ' +
      'und startet auch ohne Netz.</p>' +
      '<button class="cta small" id="btn-install">Auf dem Startbildschirm ablegen</button>';
    $('#btn-install').addEventListener('click', async () => {
      const ruf = installRuf; installRuf = null;
      ruf.prompt();
      await ruf.userChoice;
      renderPwa();
    });
    return;
  }

  /* Kein Angebot vom Browser: dann die Schritte von Hand. iPadOS meldet sich
     als Mac – dort hilft nur die Kombination aus Safari, MacIntel und echten
     Touchpunkten. Ohne die Safari-Prüfung hält sich jedes Chromium auf einem
     MacBook für ein iPad und erklärt das Teilen-Menü, das es gar nicht hat. */
  const ua = navigator.userAgent;
  const safari = /^((?!chrome|chromium|android|crios|fxios|edg|opr).)*safari/i.test(ua);
  const apfel = /iPad|iPhone|iPod/.test(ua) ||
                (safari && navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const handy = apfel || /Android/.test(ua);
  const schritte = apfel
    ? ['Unten auf das <b>Teilen</b>-Symbol tippen – das Kästchen mit dem Pfeil nach oben',
       'In der Liste <b>„Zum Home-Bildschirm"</b> wählen',
       'Oben rechts auf <b>Hinzufügen</b>']
    : handy
    ? ['Oben rechts auf die <b>drei Punkte</b> tippen',
       '<b>„App installieren"</b> wählen – je nach Gerät heißt es „Zum Startbildschirm zufügen"',
       'Bestätigen']
    : ['In der Adresszeile auf das <b>Installieren</b>-Symbol klicken',
       'oder im Browsermenü <b>„Löschlos installieren"</b> wählen'];

  box.innerHTML = '<p class="hint">Dann liegt Löschlos als Symbol auf dem Startbildschirm ' +
    'und startet auch ohne Netz.</p><ol class="schritte">' +
    schritte.map(t => `<li>${t}</li>`).join('') + '</ol>';
}

/* ------------------------------- Dialog --------------------------------- */
$('#btn-help').addEventListener('click', () => {
  $('#legend').innerHTML = [...ORDER,'RES'].map(k =>
    `<div>${sign(k)}<span>${ROLES[k].name}</span></div>`).join('');
  $('#hist-count').textContent = `${plural(state.history.length,'Runde','Runden')} im Gedächtnis`;
  renderPwa();
  $('#help-dlg').showModal();
});
$('#btn-close-help').addEventListener('click', () => $('#help-dlg').close());
$('#help-dlg').addEventListener('click', ev => { if(ev.target.id === 'help-dlg') $('#help-dlg').close(); });

$('#btn-forget').addEventListener('click', () => {
  if(!confirm('Alle gemerkten Runden löschen? Die Namensliste bleibt.')) return;
  state.history = []; roundOpen = false; save();
  $('#hist-count').textContent = '0 Runden im Gedächtnis';
  toast('Gedächtnis geleert.');
});
$('#btn-export').addEventListener('click', () => {
  const blob = new Blob([JSON.stringify({kids:state.kids, history:state.history}, null, 2)],
    {type:'application/json'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `loeschlos-${new Date().toISOString().slice(0,10)}.json`;
  a.click(); setTimeout(()=>URL.revokeObjectURL(a.href), 2000);
  toast('Datei gesichert.');
});
$('#btn-import').addEventListener('click', () => {
  const inp = document.createElement('input');
  inp.type = 'file'; inp.accept = 'application/json,.json';
  inp.onchange = () => {
    const f = inp.files[0]; if(!f) return;
    f.text().then(t => {
      const d = JSON.parse(t);
      if(!Array.isArray(d.kids)) throw 0;
      state.kids = d.kids.map(k => ({id:k.id||uid(), name:String(k.name||''), present:!!k.present}));
      if(Array.isArray(d.history)) state.history = d.history;
      sortKids();
      state.slotsTouched = false; roundOpen = false; save();
      renderRoster(); $('#help-dlg').close(); go(0);
      toast(`${plural(state.kids.length,'Name','Namen')} geladen.`);
    }).catch(() => toast('Die Datei konnte ich nicht lesen.'));
  };
  inp.click();
});

$('#btn-sound').addEventListener('click', e => {
  state.sound = !state.sound; save();
  const b = e.currentTarget;
  b.setAttribute('aria-pressed', String(state.sound));
  b.querySelector('.ico').textContent = state.sound ? '🔊' : '🔇';
  if(state.sound){ try{ audio().resume(); }catch(_){} blip(660); toast('Ton an – Tatü, Tata.'); }
});

/* --------------------------------- Start -------------------------------- */
load();
$('#btn-sound').setAttribute('aria-pressed', String(state.sound));
$('#btn-sound').querySelector('.ico').textContent = state.sound ? '🔊' : '🔇';
renderRoster();
state.step = -1;   /* erzwingt den ersten Renderdurchlauf */
go(0);

if('serviceWorker' in navigator){
  addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(()=>{}));
}
