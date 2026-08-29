/* ============================================================================
   Level 2 – Die Einheiten-Werkstatt
   Aufbau der vier taktischen Einheiten. Die Aufstellung im 3D entspricht der
   Gliederungsgrafik der FwDV 3 (Nr. 2.1 bis 2.4): vordere Reihe die Führer,
   dahinter versetzt die Truppmänner.
   ========================================================================== */

/* Bausteine, die man in die Einheiten setzen kann */
const BAUSTEINE = {
  tf:  { id:'tf',  name:'Truppführer',   n:1, ic:'🎖️', farbe:'#ffd23f', rollen:['TF'] },
  tm:  { id:'tm',  name:'Truppmann',     n:1, ic:'🪖', farbe:'#ff8c42', rollen:['TM'] },
  stf: { id:'stf', name:'Staffelführer', n:1, ic:'🎖️', farbe:'#ffd23f', rollen:['EF'] },
  gf:  { id:'gf',  name:'Gruppenführer', n:1, ic:'⭐', farbe:'#ffd23f', rollen:['EF'] },
  zf:  { id:'zf',  name:'Zugführer',     n:1, ic:'🌟', farbe:'#ffd23f', rollen:['ZF'] },
  ma:  { id:'ma',  name:'Maschinist',    n:1, ic:'⚙️', farbe:'#b9c4dd', rollen:['MA'] },
  me:  { id:'me',  name:'Melder',        n:1, ic:'📻', farbe:'#c98bff', rollen:['ME'] },
  a:   { id:'a',   name:'Angriffstrupp', n:2, ic:'🔴', farbe:'#ff4d3d', rollen:['ATF','ATM'] },
  w:   { id:'w',   name:'Wassertrupp',   n:2, ic:'🔵', farbe:'#35c8ff', rollen:['WTF','WTM'] },
  s:   { id:'s',   name:'Schlauchtrupp', n:2, ic:'🟢', farbe:'#3ddc84', rollen:['STF','STM'] },
  zt:  { id:'zt',  name:'Zugtrupp',      n:3, ic:'📋', farbe:'#ffe9a3', rollen:['FA','ME','FR'],
         hinweis:'Führungsassistent, Melder und Fahrer' },
  gr:  { id:'gr',  name:'Gruppe',        n:9, ic:'🚒', farbe:'#ff8c42', rollen:[], einheit:true, staerke:'1/8/9' },
  sta: { id:'sta', name:'Staffel',       n:6, ic:'🚐', farbe:'#8fd3ff', rollen:[], einheit:true, staerke:'1/5/6' },
  tr:  { id:'tr',  name:'Selbst. Trupp', n:3, ic:'🛻', farbe:'#c98bff', rollen:[], einheit:true, staerke:'1/2/3' },
};

/* Aus welchen Rollen besteht ein ganzer Block im 3D? */
const BLOCK_ROLLEN = {
  gr:  ['EF','MA','ME','ATF','ATM','WTF','WTM','STF','STM'],
  sta: ['EF','MA','ATF','ATM','WTF','WTM'],
  tr:  ['TF','MA','TM'],
  zt:  ['FA','ME','FR'],
  zf:  ['ZF'],
};

/* Aufstellung im 3D je Einheit – exakt nach der Gliederungsgrafik der FwDV 3 */
const AUFSTELLUNG = {
  trupp:   { TF:[-1.15,0], MA:[0,0], TM:[0,-1.35] },
  staffel: { EF:[-2.3,0], MA:[-1.15,0], ATF:[0,0], WTF:[1.15,0], ATM:[0,-1.35], WTM:[1.15,-1.35] },
  gruppe:  { EF:[-2.3,0], MA:[-1.15,0], ATF:[0,0], WTF:[1.15,0], STF:[2.3,0],
             ME:[-1.15,-1.35], ATM:[0,-1.35], WTM:[1.15,-1.35], STM:[2.3,-1.35] },
};

LEVELS.push({
  id: 'werkstatt',
  name: 'Die Einheiten-Werkstatt',
  icon: '🧩',
  farbe: 'var(--rot)',
  kurz: 'Bau Trupp, Staffel, Gruppe und Zug aus den richtigen Bausteinen zusammen.',

  start(api) {
    const aufgaben = [
      { einheit:'trupp',   teile:['tf','ma','tm'],
        vorrat:['tf','ma','tm','me','a'],
        tipp:'Drei Personen. Einer führt, einer fährt, einer packt mit an.' },
      { einheit:'staffel', teile:['stf','ma','a','w'],
        vorrat:['stf','ma','me','a','w','s'],
        tipp:'Sechs Personen. Zwei Trupps – aber welche?' },
      { einheit:'gruppe',  teile:['gf','ma','me','a','w','s'],
        vorrat:['gf','ma','me','a','w','s'],
        tipp:'Neun Personen. Die taktische Grundeinheit – hier ist alles dabei.' },
      { einheit:'zug',     teile:['zf','zt','gr','gr'],
        vorrat:['zf','zt','gr','sta','tr','ma'],
        // Der Zug ist die einzige taktische Einheit, die selbst aus taktischen
        // Einheiten besteht. Deshalb hier feste, beschriftete Steckplaetze.
        slots:[
          { akzeptiert:['zf'],           label:'Der Führer' },
          { akzeptiert:['zt'],           label:'Seine Führungseinheit' },
          { akzeptiert:['gr','sta','tr'],label:'Taktische Einheit' },
          { akzeptiert:['gr','sta','tr'],label:'Taktische Einheit' },
        ],
        tipp:'Hier baust du nicht mehr aus Personen, sondern aus ganzen Einheiten. Welche du unten einhängst, darfst du selbst entscheiden.' },
    ];

    let idx = 0, fehlerGesamt = 0, perfekt = 0;

    /* --- 3D-Aufbau -------------------------------------------------------- */
    Stage.leeren();
    Stage.welt.add(baueBoden(60));
    const figuren = [];
    const buehne = new THREE.Group();
    Stage.welt.add(buehne);

    const scheinwerfer = new THREE.SpotLight(0xffffff, 130, 34, .82, .45, 2);
    scheinwerfer.position.set(1, 10, 8); scheinwerfer.castShadow = true;
    Stage.welt.add(scheinwerfer);
    const kante = new THREE.DirectionalLight(0x74a9ff, 1.4);
    kante.position.set(-6, 4, -6);
    Stage.welt.add(kante);

    Stage.anmelden((dt, t) => belebeFiguren(figuren, dt, t));

    const buehneLeeren = () => {
      while (buehne.children.length) buehne.remove(buehne.children[0]);
      figuren.length = 0;
    };

    /* Figuren fuer einen Baustein aufstellen */
    const figurenSetzen = (einheitId, bausteinId) => {
      const b = BAUSTEINE[bausteinId];
      const plan = AUFSTELLUNG[einheitId];
      if (!plan) {                       // Zug: Einheiten als Bloecke andeuten
        blockSetzen(bausteinId);
        return;
      }
      b.rollen.forEach(r => {
        const p = plan[r];
        if (!p) return;
        const f = figurFuerRolle(r, { pa: r === 'ATF' || r === 'ATM' });
        f.position.set(p[0], 0, p[1]);
        f.scale.setScalar(0.001);
        buehne.add(f); figuren.push(f);
        // kleines Aufploppen
        const t0 = performance.now();
        const wachsen = () => {
          const p2 = clamp((performance.now() - t0) / 380, 0, 1);
          f.scale.setScalar(easeOutBack(p2));
          if (p2 < 1) requestAnimationFrame(wachsen);
        };
        requestAnimationFrame(wachsen);
        const hintenDran = p[1] < -.5;      // hintere Reihe der Gliederungsgrafik
        // seitlich versetzt, damit die hintere Reihe zwischen der vorderen durchschaut
        const px = p[0] + (hintenDran ? -.5 : 0);
        f.position.x = px;
        const schild = textSchild(ROLE[r].kurz, { gross: 34, skala: .78, rand: ROLE[r].farbe });
        schild.position.set(px, hintenDran ? 2.62 : 2.02, p[1]);
        buehne.add(schild);
      });
    };

    /* Fuer den Zug: ganze Einheiten als Bloecke – jede mit eigenem Schild.
       So sieht man sofort: der Zug besteht aus taktischen Einheiten.       */
    let blockX = -6.2;
    const blockSetzen = (bausteinId) => {
      const b = BAUSTEINE[bausteinId];
      const rollen = BLOCK_ROLLEN[bausteinId] || Array.from({ length: b.n }, () => 'TM');
      const spalten = rollen.length > 4 ? 3 : rollen.length;
      const gruppe = new THREE.Group();
      rollen.forEach((r, i) => {
        const f = figurFuerRolle(r, { pa: r === 'ATF' || r === 'ATM' });
        f.position.set((i % spalten) * .86, 0, -Math.floor(i / spalten) * 1.05);
        f.scale.setScalar(.70);
        gruppe.add(f); figuren.push(f);
      });
      const breite = (spalten - 1) * .86;
      gruppe.position.set(blockX, 0, .8);
      buehne.add(gruppe);
      const schild = textSchild(b.name + (b.staerke ? '  ' + b.staerke : ''),
        { gross: 34, skala: .86, rand: b.farbe });
      schild.position.set(blockX + breite / 2, 2.05, -.5);
      buehne.add(schild);
      blockX += breite + 1.7;
    };

    /* Zug im 3D komplett neu stellen – fuer die Varianten am Ende */
    const zugStellen = (einheiten) => {
      buehneLeeren();
      blockX = -6.2;
      ['zf', 'zt'].concat(einheiten).forEach(blockSetzen);
    };

    /* Bildausschnitt automatisch auf das setzen, was gerade auf der Buehne
       steht. Damit passt es vom Handy bis zum Beamer – und die Einheit waechst
       sichtbar aus dem Bild heraus, statt hinter dem Bedienfeld zu verschwinden. */
    const buehneEinpassen = (panel, anteil) => {
      const box = new THREE.Box3().setFromObject(buehne);
      if (box.isEmpty()) return;
      const mitte = box.getCenter(new THREE.Vector3());
      const punkte = [];
      for (const x of [box.min.x, box.max.x])
        for (const y of [box.min.y, box.max.y])
          for (const z of [box.min.z, box.max.z]) punkte.push(new THREE.Vector3(x, y, z));
      const abstand = Math.max(6, box.getSize(new THREE.Vector3()).length());
      Stage.kameraZiel = null;
      Stage.kameraSetzen([mitte.x, mitte.y + abstand * .30, mitte.z + abstand], [mitte.x, mitte.y, mitte.z]);
      const frei = freieFlaeche(panel, 30, anteil || .84);
      Stage.einpassen(punkte, (frei.w < 180 || frei.h < 150) ? freieFlaeche(null, 30, .84) : frei);
    };

    /* laufend nachfuehren, solange der Bildschirm steht */
    const einpassWache = (panel, anteil) => {
      let letzte = '';
      const fn = Stage.anmelden(() => {
        const r = panel.getBoundingClientRect();
        const k = [innerWidth, innerHeight, Math.round(r.left), Math.round(r.top),
                   Math.round(r.width), buehne.children.length].join(',');
        if (k !== letzte) { letzte = k; buehneEinpassen(panel, anteil); }
      });
      return () => Stage.abmelden(fn);
    };

    /* --- Ein Durchgang ---------------------------------------------------- */
    const aufgabeZeigen = () => {
      if (idx >= aufgaben.length) return abschluss();
      const auf = aufgaben[idx];
      const E = EINHEITEN[auf.einheit];
      const gesetzt = [];
      let fehler = 0;

      buehneLeeren();
      blockX = -6.2;

      UI.zeige('l2-' + auf.einheit, (s) => {
        /* Stärkeanzeige, zählt beim Setzen live mit */
        const zFuehrer = el('span', { class: 'mono', text: '0' });
        const zMann = el('span', { class: 'mono', text: '0' });
        const zGesamt = el('span', { class: 'mono', text: '0' });
        const staerke = el('div', {
          class: 'kennzahl',
          style: { display: 'flex', alignItems: 'center', gap: '.28em', fontSize: 'clamp(1.9rem,5vw,3rem)' },
        },
          zFuehrer, el('span', { style: { color: 'var(--txt3)' }, text: '/' }),
          zMann, el('span', { style: { color: 'var(--txt3)' }, text: '/' }),
          zGesamt);

        // Fuer den Zug nennt die FwDV 3 nur die Gesamtstaerke (22) – wir
        // erfinden dort keine Dreierangabe.
        const istZugAnzeige = auf.einheit === 'zug';
        const zugZahl = el('span', { class: 'mono', text: '0' });
        const rechnung = el('div', { class: 'klein mono', style: { minHeight: '1.3em', color: 'var(--gelb)' } });
        const staerkeBox = el('div', { style: { textAlign: 'center' } },
          istZugAnzeige
            ? el('div', { class: 'kennzahl', style: { fontSize: 'clamp(1.9rem,5vw,3rem)' } }, zugZahl)
            : staerke,
          el('div', { class: 'klein', text: istZugAnzeige ? 'Personen gesamt' : 'Führer / übrige Mannschaft / gesamt' }),
          istZugAnzeige ? rechnung : null);

        /* Ablagefelder */
        const felder = el('div', {
          style: { display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' },
        });
        const slots = auf.slots || auf.teile.map(() => ({ akzeptiert: null }));
        slots.forEach((slot, i) => {
          felder.appendChild(el('div', {
            class: 'ablage', 'data-i': i,
            style: { width: 'clamp(96px,13vw,132px)', minHeight: '84px', borderRadius: '16px',
                     border: '2px dashed var(--linie2)', background: 'rgba(255,255,255,.03)',
                     display: 'grid', placeItems: 'center', textAlign: 'center', padding: '6px', fontSize: '.86em' },
          }, el('span', { class: 'klein', text: slot.label || '?' })));
        });

        /* Vorrat */
        const vorrat = el('div', {
          style: { display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center', maxWidth: '820px' },
        });

        const staerkeAktualisieren = () => {
          let f = 0, m = 0;
          gesetzt.forEach(id => {
            const b = BAUSTEINE[id];
            if (['tf','stf','gf','zf'].includes(id)) f += 1;
            else if (id === 'gr') { f += 1; m += 8; }
            else if (id === 'sta') { f += 1; m += 5; }
            else m += b.n;
          });
          const gesamt = gesetzt.reduce((a, id) => a + BAUSTEINE[id].n, 0);
          if (istZugAnzeige) {
            countUp(zugZahl, Number(zugZahl.textContent), gesamt, 300);
            rechnung.textContent = gesetzt.length
              ? gesetzt.map(id => BAUSTEINE[id].n).join(' + ') + ' = ' + gesamt
              : '';
            return;
          }
          countUp(zFuehrer, Number(zFuehrer.textContent), f, 300);
          countUp(zMann, Number(zMann.textContent), m, 300);
          countUp(zGesamt, Number(zGesamt.textContent), gesamt, 300);
        };

        const pruefeFertig = () => {
          if ($$('.ablage[data-i]:not([data-filled])', felder).length) return;
          if (!auf.slots) {
            const soll = auf.teile.slice().sort().join(',');
            const ist = gesetzt.slice().sort().join(',');
            if (soll !== ist) return;
          }
          Audio3.fanfare();
          if (fehler === 0) perfekt++;
          const gebaut = $$('.ablage[data-i]', felder).map(f => f.dataset.filled);
          setTimeout(() => aufloesung(auf, E, fehler, gebaut), 700);
        };

        auf.vorrat.forEach(bid => {
          const b = BAUSTEINE[bid];
          const node = el('div', {
            class: 'panel', style: { padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '.5em',
                                     fontWeight: '800', cursor: 'grab', borderColor: b.farbe + '55', fontSize: '.94em' },
          },
            el('span', { style: { fontSize: '1.25em' }, text: b.ic }),
            el('span', {}, b.name, b.n > 1 ? el('small', { class: 'klein', text: ` (${b.n})` }) : null));

          ziehbarMachen(node, {
            daten: b,
            aufAblage: (feld, daten) => {
              if (feld.dataset.filled) return;
              const slot = slots[Number(feld.dataset.i)] || {};
              const daneben = (text) => {
                fehler++; fehlerGesamt++;
                Audio3.falsch();
                feld.classList.add('wackeln');
                setTimeout(() => feld.classList.remove('wackeln'), 500);
                UI.toast(text, 'schlecht', 2800);
              };
              if (slot.akzeptiert) {
                // getypter Steckplatz (Zug): hier passt nur ganz Bestimmtes hinein
                if (!slot.akzeptiert.includes(daten.id)) {
                  return daneben(slot.akzeptiert.length > 1
                    ? `Hier gehört eine ganze taktische Einheit hinein – Gruppe, Staffel oder Selbstständiger Trupp. ${daten.name} ist keine.`
                    : `Auf diesen Platz gehört: ${BAUSTEINE[slot.akzeptiert[0]].name}.`);
                }
              } else {
                // wie oft darf dieser Baustein noch?
                const erlaubt = auf.teile.filter(x => x === daten.id).length;
                const schonDa = gesetzt.filter(x => x === daten.id).length;
                if (schonDa >= erlaubt) {
                  return daneben(erlaubt === 0
                    ? `${daten.name} gehört nicht zu ${E.kurz === 'Zug' ? 'einem Zug' : 'einer ' + E.kurz}.`
                    : `${daten.name} ist schon drin.`);
                }
              }
              feld.dataset.filled = daten.id;
              feld.classList.add('voll');
              feld.style.borderColor = daten.farbe;
              feld.style.background = daten.farbe + '22';
              feld.innerHTML = '';
              feld.appendChild(el('div', { style: { fontSize: '1.4em', lineHeight: 1 }, text: daten.ic }));
              feld.appendChild(el('b', { style: { fontSize: '.88em' }, text: daten.name }));
              if (daten.n > 1) feld.appendChild(el('div', { class: 'klein', text: daten.n + ' Personen' }));
              gesetzt.push(daten.id);
              Audio3.richtig();
              figurenSetzen(auf.einheit, daten.id);
              staerkeAktualisieren();
              pruefeFertig();
            },
          });
          vorrat.appendChild(node);
        });

        const panel = seitenLayout(s, [
          UI.schritte(aufgaben.length, idx),
          el('h3', { text: 'Baue: ' + E.name }),
          el('p', { class: 'klein', style: { margin: 0 }, text: auf.tipp }),
          staerkeBox,
          felder,
          el('div', { class: 'klein', text: BREIT() ? 'zieh die Bausteine in die Felder' : '↓ zieh die Bausteine nach oben' }),
          vorrat,
        ], { obenBreit: 0, obenSchmal: 0, rechtsBreit: 0 });
        // leere Buehne: erst mal ruhig von vorn schauen
        Stage.kameraSetzen([0, 2.4, 9], [0, 1.1, -.6]);
        return einpassWache(panel, .90);
      });
    };

    /* --- Auflösung nach jeder Einheit -------------------------------------- */
    const aufloesung = (auf, E, fehler, gebaut) => {
      if (auf.einheit === 'zug') return zugAufloesung(E, gebaut);

      UI.zeige('l2-loesung-' + auf.einheit, (s) => {
        const panel = seitenLayout(s, [
          el('div', { class: 'kennzahl', style: { fontSize: 'clamp(2.4rem,6vw,3.6rem)', color: 'var(--gelb)' }, text: E.staerke }),
          el('h3', { text: E.name }),
          el('p', { class: 'hinweis', style: { margin: 0 }, text: E.merke }),
          UI.zitat(E.zitat),
          el('button', {
            class: 'btn gross',
            onclick: () => { Audio3.klick(); idx++; aufgabeZeigen(); },
          }, idx < aufgaben.length - 1 ? 'Nächste Einheit →' : 'Abschluss →'),
        ], { obenBreit: 0, obenSchmal: 0, rechtsBreit: 0 });
        return einpassWache(panel, .88);
      });
    };

    /* --- Der Zug bekommt eine eigene Auflösung -----------------------------
       Kernaussage: Der Zug ist die einzige taktische Einheit, die selbst aus
       taktischen Einheiten besteht. 22 ist der Regelfall, nicht das Gesetz.  */
    const zugAufloesung = (E, gebaut) => {
      const VARIANTEN = [
        { id:'gg',  teile:['gr','gr'],  name:'zwei Gruppen',            summe:22, note:'Der Regelfall: 1 + 3 + 9 + 9 = 22.' },
        { id:'gs',  teile:['gr','sta'], name:'Gruppe + Staffel',        summe:19, note:'Auch ein Zug – nur ist die zweite Einheit kleiner.' },
        { id:'ss',  teile:['sta','sta'],name:'zwei Staffeln',           summe:16, note:'Immer noch ein Zug. Die Vorschrift sagt „in der Regel 22" – nicht „immer 22".' },
        { id:'gt',  teile:['gr','tr'],  name:'Gruppe + Selbst. Trupp',  summe:16, note:'Auch das geht: der Zug darf aus Gruppen, Staffeln und Selbstständigen Trupps bestehen.' },
      ];
      const eigene = (gebaut || []).slice(2);
      let aktiv = VARIANTEN.find(v => v.teile.slice().sort().join() === eigene.slice().sort().join()) || VARIANTEN[0];

      UI.zeige('l2-loesung-zug', (s) => {
        const summe = el('div', { class: 'kennzahl', style: { fontSize: 'clamp(2.2rem,6vw,3.4rem)', color: 'var(--gelb)' } });
        const rechnung = el('div', { class: 'klein mono' });
        const notiz = el('p', { class: 'hinweis', style: { margin: 0 } });
        const knoepfe = el('div', { style: { display: 'grid', gap: '7px', width: '100%' } });

        const zeigen = (v) => {
          aktiv = v;
          zugStellen(v.teile);
          summe.textContent = String(v.summe);
          rechnung.textContent = '1 + 3 + ' + v.teile.map(t => BAUSTEINE[t].n).join(' + ') + ' = ' + v.summe;
          notiz.textContent = v.note;
          $$('button', knoepfe).forEach(b => {
            const an = b.dataset.v === v.id;
            b.className = 'btn ' + (an ? 'gelb' : 'geist');
          });
          Audio3.treffer();
        };

        VARIANTEN.forEach(v => knoepfe.appendChild(el('button', {
          class: 'btn geist', 'data-v': v.id,
          style: { padding: '.5em 1em', fontSize: '.92em' },
          onclick: () => zeigen(v),
        }, `Zugtrupp + ${v.name}`)));

        const panel = seitenLayout(s, [
          el('div', { class: 'dienstvorschrift', text: 'Der Zug' }),
          summe,
          rechnung,
          el('div', { class: 'klein', text: 'Personen gesamt' }),
          el('div', { class: 'feedback gut', style: { width: '100%' } },
            el('b', { text: 'Der Zug ist der einzige Sonderfall' }),
            el('span', { text: 'Trupp, Staffel und Gruppe bestehen aus Personen. Der Zug besteht aus ganzen taktischen Einheiten – dazu kommen der Zugführer und sein Zugtrupp als Führungseinheit.' })),
          el('div', { class: 'klein', text: 'Probier aus, wie sich der Zug ändert:' }),
          knoepfe,
          notiz,
          UI.zitat(E.zitat),
          el('button', {
            class: 'btn gross',
            onclick: () => { Audio3.klick(); idx++; aufgabeZeigen(); },
          }, 'Abschluss →'),
        ], { obenBreit: 0, obenSchmal: 0, rechtsBreit: 0 });

        zeigen(aktiv);
        return einpassWache(panel, .92);
      });
    };

    /* --- Abschluss ---------------------------------------------------------- */
    const abschluss = () => {
      const guete = clamp(1 - fehlerGesamt * .08, 0, 1);
      api.fertig({
        guete,
        xp: 60 + perfekt * 25,
        titel: fehlerGesamt === 0
          ? 'Alle vier Einheiten auf Anhieb richtig zusammengesetzt.'
          : `${perfekt} von 4 Einheiten fehlerfrei · ${fehlerGesamt} Fehlversuch${fehlerGesamt > 1 ? 'e' : ''}`,
        abzeichen: fehlerGesamt === 0 ? ['ersteinheit'] : [],
        zeilen: EINHEIT_ORDER.map(k => {
          const E = EINHEITEN[k];
          return el('span', { style: { display: 'flex', justifyContent: 'space-between', width: '100%', gap: '1em' } },
            el('b', { text: E.name }),
            el('span', { class: 'mono', style: { color: 'var(--gelb)' },
                         text: k === 'zug' ? 'in der Regel 22' : E.staerke }));
        }).concat([
          el('span', { html: '<b>Merke:</b> Nur der Zug besteht aus anderen taktischen Einheiten.' }),
        ]),
      });
    };

    /* --- Einstieg ----------------------------------------------------------- */
    Stage.kameraSetzen([0, 2.4, 9], [0, 1.1, -.6]);
    UI.zeige('l2-intro', (s) => {
      s.appendChild(el('div', { class: 'mitte' },
        el('div', { class: 'dienstvorschrift', text: 'Level 2' }),
        el('h2', { text: 'Die Einheiten-Werkstatt' }),
        el('p', { class: 'hinweis', style: { fontSize: '1.06em' },
          text: 'Vier taktische Einheiten, vom kleinsten Trupp bis zum ganzen Zug. Zieh die richtigen Bausteine in die Felder – und schau zu, wie die Einheit vor dir antritt.' }),
        el('p', { class: 'klein', text: 'Die Aufstellung entspricht der Gliederungsgrafik aus der FwDV 3.' }),
        el('button', { class: 'btn gross', onclick: () => { Audio3.klick(); aufgabeZeigen(); } }, 'Werkstatt öffnen →')));
    });
  },
});
