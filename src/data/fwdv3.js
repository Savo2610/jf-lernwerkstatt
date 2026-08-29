/* ============================================================================
   FwDV 3 – Inhaltsdaten
   Quelle: Feuerwehr-Dienstvorschrift 3 "Einheiten im Lösch- und
   Hilfeleistungseinsatz", Stand Februar 2008 (AFKzV).
   Alle Zitate wörtlich aus der Vorschrift; siehe referenz/FwDV3-2008-volltext.txt
   ========================================================================== */

const ROLE = {
  EF:  { id:'EF',  kurz:'EF',  name:'Einheitsführer',  farbe:'#ffd23f', helm:'#ffffff' },
  MA:  { id:'MA',  kurz:'Ma',  name:'Maschinist',      farbe:'#b9c4dd', helm:'#2c3450' },
  ME:  { id:'ME',  kurz:'Me',  name:'Melder',          farbe:'#c98bff', helm:'#2c3450' },
  ATF: { id:'ATF', kurz:'A-Tf',name:'Angriffstruppführer', farbe:'#ff4d3d', helm:'#2c3450', trupp:'A' },
  ATM: { id:'ATM', kurz:'A-Tm',name:'Angriffstruppmann',   farbe:'#ff4d3d', helm:'#2c3450', trupp:'A' },
  WTF: { id:'WTF', kurz:'W-Tf',name:'Wassertruppführer',   farbe:'#35c8ff', helm:'#2c3450', trupp:'W' },
  WTM: { id:'WTM', kurz:'W-Tm',name:'Wassertruppmann',     farbe:'#35c8ff', helm:'#2c3450', trupp:'W' },
  STF: { id:'STF', kurz:'S-Tf',name:'Schlauchtruppführer', farbe:'#3ddc84', helm:'#2c3450', trupp:'S' },
  STM: { id:'STM', kurz:'S-Tm',name:'Schlauchtruppmann',   farbe:'#3ddc84', helm:'#2c3450', trupp:'S' },
  TF:  { id:'TF',  kurz:'Tf',  name:'Truppführer',     farbe:'#ffd23f', helm:'#ffffff' },
  TM:  { id:'TM',  kurz:'Tm',  name:'Truppmann',       farbe:'#ff8c42', helm:'#2c3450' },
  ZF:  { id:'ZF',  kurz:'ZF',  name:'Zugführer',       farbe:'#ffd23f', helm:'#ffffff' },
  FA:  { id:'FA',  kurz:'FüA', name:'Führungsassistent',farbe:'#ffe9a3', helm:'#ffffff' },
  FR:  { id:'FR',  kurz:'Fa',  name:'Fahrer',          farbe:'#b9c4dd', helm:'#2c3450' },
};

/* --- Die vier taktischen Einheiten ---------------------------------------- */
const EINHEITEN = {
  trupp: {
    id:'trupp', name:'Selbstständiger Trupp', kurz:'Selbst. Trupp',
    fuehrer:1, mannschaft:2, gesamt:3, staerke:'1/2/3',
    rollen:['TF','MA','TM'],
    gliederung:[
      { rolle:'TF', anzahl:1, spalte:'fuehrer' },
      { rolle:'MA', anzahl:1, spalte:'mannschaft' },
      { rolle:'TM', anzahl:1, spalte:'mannschaft' },
    ],
    zitat:'Der Selbstständige Trupp ist eine taktische Einheit, deren Mannschaft aus einem Truppführer und zwei weiteren Einsatzkräften besteht (1/2/3).',
    merke:'Achtung Verwechslungsgefahr: Ein Angriffs-, Wasser- oder Schlauchtrupp ist NUR ein Teil einer Gruppe. Der Selbstständige Trupp dagegen ist eine eigene taktische Einheit – er kann alleine losfahren.',
    grenze:'Zu dritt geht kein Innenangriff unter Atemschutz. Dafür braucht es mindestens eine Staffel.',
  },
  staffel: {
    id:'staffel', name:'Staffel', kurz:'Staffel',
    fuehrer:1, mannschaft:5, gesamt:6, staerke:'1/5/6',
    rollen:['EF','MA','ATF','ATM','WTF','WTM'],
    gliederung:[
      { rolle:'EF', anzahl:1, spalte:'fuehrer', label:'Staffelführer' },
      { rolle:'MA', anzahl:1, spalte:'mannschaft' },
      { rolle:'A',  anzahl:2, spalte:'mannschaft', label:'Angriffstrupp' },
      { rolle:'W',  anzahl:2, spalte:'mannschaft', label:'Wassertrupp' },
    ],
    zitat:'Die Staffel ist eine taktische Einheit, deren Mannschaft aus einem Staffelführer und fünf weiteren Einsatzkräften besteht (1/5/6).',
    merke:'Der Staffel fehlen gegenüber der Gruppe genau zwei Dinge: der Melder und der Schlauchtrupp. Das sind exakt die ersten beiden, auf die man laut Vorschrift verzichtet.',
    grenze:'Innenangriff unter Atemschutz? Ja, geht.',
  },
  gruppe: {
    id:'gruppe', name:'Gruppe', kurz:'Gruppe',
    fuehrer:1, mannschaft:8, gesamt:9, staerke:'1/8/9',
    rollen:['EF','MA','ME','ATF','ATM','WTF','WTM','STF','STM'],
    gliederung:[
      { rolle:'EF', anzahl:1, spalte:'fuehrer', label:'Gruppenführer' },
      { rolle:'MA', anzahl:1, spalte:'mannschaft' },
      { rolle:'ME', anzahl:1, spalte:'mannschaft' },
      { rolle:'A',  anzahl:2, spalte:'mannschaft', label:'Angriffstrupp' },
      { rolle:'W',  anzahl:2, spalte:'mannschaft', label:'Wassertrupp' },
      { rolle:'S',  anzahl:2, spalte:'mannschaft', label:'Schlauchtrupp' },
    ],
    zitat:'Die Gruppe ist eine taktische Einheit, deren Mannschaft aus einem Gruppenführer und acht weiteren Einsatzkräften besteht (1/8/9).',
    merke:'Die Gruppe ist die taktische GRUNDeinheit der Feuerwehr. Alles andere misst sich an ihr.',
    grenze:'Die Gruppe kann alle Ersteinsatzmaßnahmen alleine abarbeiten.',
    grund:true,
  },
  zug: {
    id:'zug', name:'Zug', kurz:'Zug',
    fuehrer:1, mannschaft:21, gesamt:22, staerke:'22',
    rollen:['ZF','FA','ME','FR'],
    gliederung:[
      { rolle:'ZF', anzahl:1, spalte:'fuehrer' },
      { rolle:'FA', anzahl:1, spalte:'mannschaft' },
      { rolle:'ME', anzahl:1, spalte:'mannschaft' },
      { rolle:'FR', anzahl:1, spalte:'mannschaft' },
    ],
    zitat:'Der Zug ist eine taktische Einheit. Sie besteht aus dem Zugführer, dem Zugtrupp als Führungseinheit und aus Gruppen, Staffeln und/oder Selbstständigen Trupps. Der Zug hat in der Regel eine Mannschaftsstärke von 22.',
    merke:'22 = Zugführer (1) + Zugtrupp (3) + Gruppe (9) + Gruppe (9). Der Führungsassistent ist der Vertreter des Zugführers.',
    grenze:'Für besondere Aufgaben kann der Zug um einen Trupp, eine Staffel oder eine Gruppe erweitert werden.',
  },
};

const EINHEIT_ORDER = ['trupp','staffel','gruppe','zug'];

/* --- Aufgaben im Löscheinsatz (FwDV 3, Nr. 5.2.1) ------------------------- */
const AUFGABEN = {
  EF: {
    name:'Einheitsführer', farbe:'#ffd23f',
    kurz:'Erkundet, befiehlt, ist verantwortlich.',
    punkte:[
      'führt seine taktische Einheit',
      'ist an keinen bestimmten Platz gebunden',
      'ist für die Sicherheit der Mannschaft verantwortlich',
      'bestimmt die Fahrzeugaufstellung und ggf. den Standort der Tragkraftspritze',
    ],
    rettet:false,
  },
  MA: {
    name:'Maschinist', farbe:'#b9c4dd',
    kurz:'Fährt, sichert ab, bedient die Pumpe.',
    punkte:[
      'ist Fahrer und bedient die Feuerlöschkreiselpumpe sowie die eingebauten Aggregate',
      'sichert sofort die Einsatzstelle mit Warnblinkanlage, Fahrlicht und blauem Blinklicht',
      'unterstützt bei der Entnahme der Geräte, ist für die ordnungsgemäße Verlastung verantwortlich',
      'meldet Mängel an den Einsatzmitteln dem Einheitsführer',
      'unterstützt beim Aufbau der Wasserversorgung und auf Befehl bei der Atemschutzüberwachung',
    ],
    rettet:false,
  },
  ME: {
    name:'Melder', farbe:'#c98bff',
    kurz:'Macht, was befohlen wird.',
    punkte:[
      'übernimmt befohlene Aufgaben',
      'z. B. bei der Lagefeststellung',
      'z. B. beim In-Stellung-Bringen der Steckleiter',
      'z. B. beim Betreuen von Personen',
      'z. B. bei der Informationsübertragung',
    ],
    rettet:false,
  },
  A: {
    name:'Angriffstrupp', farbe:'#ff4d3d',
    kurz:'Rettet. Setzt den Verteiler. Erstes Rohr.',
    punkte:[
      'rettet; insbesondere aus Bereichen, die nur mit Atemschutzgeräten betreten werden können',
      'nimmt in der Regel das erste einzusetzende Strahlrohr vor',
      'setzt den Verteiler',
      'verlegt seine Schlauchleitung, sofern kein Schlauchtrupp zur Unterstützung bereit steht',
    ],
    rettet:true,
  },
  W: {
    name:'Wassertrupp', farbe:'#35c8ff',
    kurz:'Rettet. Wasser bis zum Verteiler. Dann Sicherheitstrupp.',
    punkte:[
      'rettet',
      'bringt auf Befehl tragbare Leitern in Stellung',
      'stellt die Wasserversorgung vom Löschfahrzeug zum Verteiler her',
      'stellt die Wasserversorgung zwischen Löschfahrzeug und Wasserentnahmestelle her',
      'kuppelt den Verteiler an die B-Schlauchleitung an',
      'gibt dem Maschinisten das Kommando „Verteiler Wasser marsch!"',
      'wird danach beim Atemschutzeinsatz Sicherheitstrupp',
    ],
    rettet:true,
  },
  S: {
    name:'Schlauchtrupp', farbe:'#3ddc84',
    kurz:'Rettet. Wasser ab Verteiler. Bedient den Verteiler.',
    punkte:[
      'rettet',
      'stellt für vorgehende Trupps die Wasserversorgung zwischen Strahlrohr und Verteiler her',
      'bringt auf Befehl tragbare Leitern in Stellung',
      'bedient den Verteiler',
      'bringt zusätzliche Geräte zum Einsatz (Sprungpolster, Beleuchtungsgerät, Be- und Entlüftungsgerät, Sanitätsgerät)',
    ],
    rettet:true,
  },
};

/* --- Aufgabenkarten für das Sortier-Level (Level 5) ------------------------ */
/* jede Karte gehoert genau einer Funktion; "zitat" = Beleg aus der Vorschrift */
const AUFGABEN_KARTEN = [
  { t:'Sichert die Einsatzstelle mit Warnblinkanlage, Fahrlicht und blauem Blinklicht ab', ziel:'MA', icon:'🚨' },
  { t:'Bedient die Feuerlöschkreiselpumpe', ziel:'MA', icon:'⚙️' },
  { t:'Ist für die ordnungsgemäße Verlastung der Geräte verantwortlich', ziel:'MA', icon:'📦' },
  { t:'Bestimmt die Fahrzeugaufstellung', ziel:'EF', icon:'🅿️' },
  { t:'Ist für die Sicherheit der Mannschaft verantwortlich', ziel:'EF', icon:'🛡️' },
  { t:'Erkundet die Lage und gibt Befehle', ziel:'EF', icon:'📣' },
  { t:'Betreut Personen auf Befehl', ziel:'ME', icon:'🤝' },
  { t:'Unterstützt auf Befehl beim In-Stellung-Bringen der Steckleiter', ziel:'ME', icon:'🪜',
    hinweis:'Aufgestellt wird die Leiter vom Wassertrupp. Der Melder hilft dabei – aber nur, wenn der Einheitsführer es befiehlt.' },
  { t:'Setzt den Verteiler', ziel:'A', icon:'🔱' },
  { t:'Nimmt in der Regel das erste Strahlrohr vor', ziel:'A', icon:'💦' },
  { t:'Rettet aus Bereichen, die nur mit Atemschutz betreten werden können', ziel:'A', icon:'😷' },
  { t:'Verlegt die B-Leitung vom Löschfahrzeug zum Verteiler', ziel:'W', icon:'🧵' },
  { t:'Kuppelt den Verteiler an die B-Schlauchleitung an', ziel:'W', icon:'🔗' },
  { t:'Stellt die Wasserversorgung zwischen Fahrzeug und Hydrant her', ziel:'W', icon:'🚰' },
  { t:'Wird beim Atemschutzeinsatz zum Sicherheitstrupp', ziel:'W', icon:'🆘' },
  { t:'Gibt dem Maschinisten das Kommando „Verteiler Wasser marsch!"', ziel:'W', icon:'📢' },
  { t:'Gibt das Kommando „1. Rohr Wasser marsch!"', ziel:'A', icon:'📣' },
  { t:'Legt beim 1. Rohr die Schlauchreserve, bevor er „Wasser marsch!" kommandiert', ziel:'A', icon:'➰',
    hinweis:'Schlauchreserve legt jeder Trupp, der ein Rohr vornimmt. Beim ersten Rohr ist das der Angriffstrupp.' },
  { t:'Verlegt die Schläuche vom Verteiler zum Strahlrohr', ziel:'S', icon:'🪢' },
  { t:'Bedient standardmäßig den Verteiler', ziel:'S', icon:'🎛️',
    hinweis:'Im Regelfall der Schlauchtrupp. Der Einheitsführer kann es aber auch dem Melder befehlen – dann macht der es.' },
  { t:'Bringt das Sprungpolster zum Einsatz', ziel:'S', icon:'🛏️' },
  { t:'Bringt das Beleuchtungsgerät zum Einsatz', ziel:'S', icon:'💡' },
];

/* --- Wer gibt welches Kommando? ------------------------------------------
   Achtung Wortlaut: Die FwDV 3 schreibt beim Wassertrupp schlicht
   „Wasser marsch!". Bei uns wird „Verteiler Wasser marsch!" kommandiert, damit man es
   nicht mit „1. Rohr Wasser marsch!" verwechselt. Wir lernen die deutlichere
   Fassung – und sagen dazu, was in der Vorschrift steht.                 */
const KOMMANDOS = [
  { k:'Absitzen!',                wer:'EF', wann:'nach dem Eintreffen an der Einsatzstelle' },
  { k:'Verteiler Wasser marsch!', wer:'W',  wann:'wenn die B-Leitung am Verteiler angekuppelt ist',
    vorschrift:'In der FwDV 3 steht an dieser Stelle nur „Wasser marsch!".' },
  { k:'1. Rohr Wasser marsch!',   wer:'A',  wann:'wenn das Strahlrohr angekuppelt und die Reserve gelegt ist' },
  { k:'2. Rohr Wasser marsch!',   wer:'S',  wann:'beim zweiten Rohr – vom Führer des beauftragten Trupps' },
  { k:'Zum Abmarsch fertig!',     wer:'EF', wann:'am Ende des Einsatzes' },
];

/* --- Befehlsschema (FwDV 3, Nr. 5.4) -------------------------------------- */
const BEFEHL_ELEMENTE = [
  { id:'wes',  label:'Wasserentnahmestelle', beispiel:'Unterflurhydrant',            farbe:'#35c8ff', icon:'🚰' },
  { id:'vert', label:'Lage des Verteilers',  beispiel:'Verteiler an der Hofeinfahrt',farbe:'#35c8ff', icon:'🔱' },
  { id:'einh', label:'Einheit',              beispiel:'Angriffstrupp',               farbe:'#ff4d3d', icon:'👥' },
  { id:'auft', label:'Auftrag',              beispiel:'zur Brandbekämpfung',         farbe:'#ff8c42', icon:'🎯' },
  { id:'mitt', label:'Mittel',               beispiel:'mit 1. Rohr',                 farbe:'#ffd23f', icon:'🧰' },
  { id:'ziel', label:'Ziel',                 beispiel:'in das Erdgeschoss',          farbe:'#3ddc84', icon:'📍' },
  { id:'weg',  label:'Weg',                  beispiel:'über die Haustür',            farbe:'#c98bff', icon:'🧭' },
];

const BEREITSTELLUNG = {
  mit: {
    id:'mit', name:'Einsatz MIT Bereitstellung', kommando:'ZUM EINSATZ FERTIG!',
    elemente:['wes','vert'],
    wiederholt:'Der Angriffstruppführer wiederholt das Kommando „Zum Einsatz fertig".',
    wann:'Der Einheitsführer weiß erst, WOHER das Wasser kommt und WO der Verteiler steht – aber noch nicht, wer was wohin tun soll.',
    zitat:'Der Einsatz m i t Bereitstellung wird durchgeführt, wenn der Einheitsführer nach dem Eintreffen an der Einsatzstelle die Lage zunächst nur soweit feststellen kann, dass er zwar die Wasserentnahmestelle und die Lage des Verteilers, aber noch nicht den Einsatzauftrag, die Einsatzmittel, das Einsatzziel oder den Einsatzweg bestimmen kann.',
    eselsbruecke:'Bereitstellung = "Macht schon mal fertig, ich schau mir das noch an."',
  },
  ohne: {
    id:'ohne', name:'Einsatz OHNE Bereitstellung', kommando:'VOR!',
    elemente:['wes','vert','einh','auft','mitt','ziel','weg'],
    wiederholt:'Der beauftragte Truppführer wiederholt seinen Befehl ab „Einheit".',
    wann:'Der Einheitsführer hat alles gesehen, was er braucht, und gibt gleich den kompletten Befehl.',
    zitat:'Nur wenn ausreichende Informationen zur Bestimmung des Einsatzauftrages vorliegen, befiehlt der Einheitsführer einen Einsatz o h n e Bereitstellung.',
    eselsbruecke:'Ohne Bereitstellung = "Ich weiß Bescheid – los geht’s, sofort!"',
  },
};

/* --- Lagekarten: mit oder ohne Bereitstellung? (Level 7) ------------------- */
const LAGEN = [
  { t:'Ihr trefft ein. Aus dem Dachstuhl quillt dichter Rauch, ihr seht aber noch nicht, wo genau es brennt und wie man hinkommt.', a:'mit', warum:'Wasserentnahme und Verteiler sind klar – der Auftrag noch nicht. Also erst mal fertig machen.' },
  { t:'Ein Mülleimer vor der Schule brennt lichterloh. Ihr steht direkt davor und seht alles.', a:'ohne', warum:'Alles ist auf einen Blick klar. Kompletter Befehl, sofort „Vor!".' },
  { t:'PKW-Brand auf dem Parkplatz. Der Wagen steht frei, niemand ist in Gefahr, der Hydrant liegt 20 Meter weiter.', a:'ohne', warum:'Lage vollständig erkundet – da muss niemand warten.' },
  { t:'Gemeldet ist ein Zimmerbrand im 2. OG. Ihr steht vor dem Haus, seht nur eine verrauchte Fassade und wisst noch nicht, ob jemand drin ist.', a:'mit', warum:'Der Einsatzauftrag steht noch nicht fest. Der Gruppenführer erkundet weiter, während die Mannschaft schon aufbaut.' },
  { t:'Ein Gartenlaube brennt. Ihr fahrt vor, seht die Laube komplett, der Weg dorthin ist frei.', a:'ohne', warum:'Ziel und Weg sind eindeutig – kompletter Befehl.' },
  { t:'Feuerschein aus einer großen Lagerhalle. Ihr müsst erst um das Gebäude herum, um zu sehen, was Sache ist.', a:'mit', warum:'Klassiker: Erkundung dauert. Die Mannschaft baut inzwischen schon auf.' },
  { t:'Brennender Holzstapel am Waldrand, direkt an der Straße, gut einsehbar.', a:'ohne', warum:'Vollständige Lage – direkt der ganze Befehl.' },
  { t:'Ihr werdet zu einem Kellerbrand gerufen. Der Zugang zum Keller ist noch unklar, die Rauchentwicklung stark.', a:'mit', warum:'Der Weg fehlt noch. Ohne „Weg" kein Einsatz ohne Bereitstellung.' },
];

/* --- Einsatzgrundsätze (FwDV 3, Nr. 5.3) ---------------------------------- */
const GRUNDSAETZE = [
  { k:'Atemschutz', t:'Die Funktionen für Angriffs- und für den Wassertrupp sollen mit Atemschutzgeräteträgern besetzt sein.' },
  { k:'Zusammen',   t:'Der Trupp geht im Gefahrenbereich grundsätzlich gemeinsam vor.' },
  { k:'Truppführer',t:'Der Truppführer ist für die Auftragserledigung und für die Sicherheit seines Trupps verantwortlich.' },
  { k:'Wiederholen',t:'Einsatzbefehle werden von der beauftragten Einsatzkraft bzw. vom jeweiligen Truppführer wiederholt.' },
  { k:'Reihenfolge',t:'Die Wasserversorgung wird bei Löschfahrzeugen mit Löschwasserbehälter zuerst vom Löschfahrzeug zum Verteiler und danach zwischen Löschfahrzeug und Wasserentnahmestelle verlegt.' },
  { k:'Innenangriff',t:'Mit dem Innenangriff darf erst begonnen werden, wenn eine ständige Wasserabgabe sichergestellt ist, z. B. wenn das mitgeführte Löschwasser bis zum Aufbau einer Löschwasserversorgung ausreicht.' },
  { k:'Rückmeldung',t:'Trupps, die ihre Aufgabe erledigt haben und einsatzbereit sind, melden sich beim Einheitsführer.' },
  { k:'Notfall',    t:'Bei besonderer Gefahr gibt jede Einsatzkraft das Kommando „Gefahr – Alle sofort zurück!". Alle gehen zurück und sammeln sich am Feuerwehrfahrzeug.' },
];

/* --- Verzichtsreihenfolge (FwDV 3, Nr. 5.1) – Kern für Gruppe vs. Staffel -- */
const VERZICHT = {
  reihenfolge:['ME','S','W'],
  zitat:'Es wird zuerst auf den Melder, dann auf den Schlauchtrupp und schließlich auf den Wassertrupp vorübergehend verzichtet.',
  innenangriff:'Ein Innenangriff mit Atemschutzgeräten kann nur durchgeführt werden, wenn eine Gruppe oder Staffel an der Einsatzstelle ist. Die Mannschaft eines Selbstständigen Trupps reicht hierfür nicht aus.',
};

/* --- Ränge (Spielfortschritt) --------------------------------------------- */
const RAENGE = [
  { xp:0,    name:'Neuling',            icon:'🔰' },
  { xp:120,  name:'Feuerwehranwärter',  icon:'🧯' },
  { xp:320,  name:'Truppmann',          icon:'🪖' },
  { xp:600,  name:'Truppführer',        icon:'🎖️' },
  { xp:950,  name:'Maschinist',         icon:'⚙️' },
  { xp:1400, name:'Gruppenführer',      icon:'⭐' },
  { xp:2000, name:'Zugführer',          icon:'🌟' },
];

/* --- Fragenpool für den Beamer-Modus (Team-Quiz) --------------------------- */
/* typ: 'mc' = Multiple Choice, 'schaetz' = Schätzfrage, 'blitz' = Blitzrunde  */
const QUIZ = [
  { typ:'mc', f:'Woraus besteht eine taktische Einheit?', o:['Mannschaft + Einsatzmittel','Fahrzeug + Schläuche','Gruppenführer + Trupps','Mannschaft + Fahrzeug'], r:0,
    e:'„Taktische Einheiten bestehen aus der Mannschaft und den Einsatzmitteln." Ohne eins von beidem ist es keine taktische Einheit.' },
  { typ:'mc', f:'Welche Stärke hat die Gruppe?', o:['1/5/6','1/8/9','1/2/3','1/7/8'], r:1,
    e:'1 Gruppenführer + 8 weitere = 9 Personen.' },
  { typ:'mc', f:'Welche Stärke hat die Staffel?', o:['1/4/5','1/2/3','1/5/6','1/6/7'], r:2,
    e:'1 Staffelführer + 5 weitere = 6 Personen.' },
  { typ:'mc', f:'Welche Stärke hat der Selbstständige Trupp?', o:['1/2/3','0/3/3','1/1/2','1/3/4'], r:0,
    e:'Truppführer, Maschinist, Truppmann.' },
  { typ:'mc', f:'Wie viele Personen hat ein Zug in der Regel?', o:['18','20','22','24'], r:2,
    e:'Zugführer + Zugtrupp (3) + zwei Gruppen (18) = 22.' },
  { typ:'mc', f:'Was bedeutet die MITTLERE Zahl bei 1/8/9?', o:['Die Anzahl der Trupps','Die übrige Mannschaft ohne Führer','Die Gesamtstärke','Die Anzahl der Fahrzeuge'], r:1,
    e:'Erste Zahl = Führer, zweite = übrige Mannschaft, dritte = Gesamt. 1 + 8 = 9.' },
  { typ:'mc', f:'Welcher Trupp rettet?', o:['Nur der Angriffstrupp','Angriffstrupp und Wassertrupp','Alle drei Trupps','Nur der Trupp mit Atemschutz'], r:2,
    e:'In der FwDV 3 beginnt die Aufgabenbeschreibung von Angriffs-, Wasser- UND Schlauchtrupp jeweils mit dem Wort „rettet".' },
  { typ:'mc', f:'Wer setzt den Verteiler?', o:['Der Wassertrupp','Der Schlauchtrupp','Der Angriffstrupp','Der Melder'], r:2,
    e:'„Der Angriffstrupp setzt den Verteiler."' },
  { typ:'mc', f:'Wer kuppelt den Verteiler an die B-Schlauchleitung an?', o:['Der Angriffstrupp','Der Wassertrupp','Der Schlauchtrupp','Der Maschinist'], r:1,
    e:'Der Wassertrupp verlegt die B-Leitung zum Verteiler kuppelt an und kommandiert „Verteiler Wasser marsch!". In der Vorschrift steht dort kurz „Wasser marsch!".' },
  { typ:'mc', f:'Wer verlegt die Schläuche vom Verteiler zum Strahlrohr?', o:['Der Angriffstrupp','Der Wassertrupp','Der Schlauchtrupp','Der Melder'], r:2,
    e:'Der Schlauchtrupp stellt die Wasserversorgung zwischen Strahlrohr und Verteiler her.' },
  { typ:'mc', f:'Wer sichert die Einsatzstelle mit Blaulicht ab?', o:['Der Melder','Der Maschinist','Der Einheitsführer','Der Wassertrupp'], r:1,
    e:'„Er sichert sofort die Einsatzstelle mit Warnblinkanlage, Fahrlicht und blauem Blinklicht."' },
  { typ:'mc', f:'Auf wen wird zuerst verzichtet, wenn Leute fehlen?', o:['Auf den Schlauchtrupp','Auf den Melder','Auf den Wassertrupp','Auf den Maschinisten'], r:1,
    e:'Reihenfolge: erst Melder, dann Schlauchtrupp, dann Wassertrupp.' },
  { typ:'mc', f:'Womit endet der Befehl beim Einsatz MIT Bereitstellung?', o:['„Vor!"','„Wasser marsch!"','„Zum Einsatz fertig!"','„Zum Abmarsch fertig!"'], r:2,
    e:'Mit Bereitstellung endet auf „Zum Einsatz fertig!", ohne Bereitstellung auf „Vor!".' },
  { typ:'mc', f:'Wie viele Befehlselemente hat der Befehl OHNE Bereitstellung?', o:['5','6','7','8'], r:2,
    e:'Wasserentnahmestelle, Lage des Verteilers, Einheit, Auftrag, Mittel, Ziel, Weg.' },
  { typ:'mc', f:'Ab welchem Element wiederholt der Truppführer den Befehl?', o:['Ab „Wasserentnahmestelle"','Ab „Einheit"','Ab „Auftrag"','Er wiederholt alles'], r:1,
    e:'„Der beauftragte Truppführer wiederholt seinen Befehl ab „Einheit"."' },
  { typ:'mc', f:'Welche Einheit ist die taktische GRUNDeinheit der Feuerwehr?', o:['Der Selbstständige Trupp','Die Staffel','Die Gruppe','Der Zug'], r:2,
    e:'„Die Gruppe ist die taktische Grundeinheit der Feuerwehr."' },
  { typ:'mc', f:'Ein Selbstständiger Trupp trifft ein. Innenangriff unter Atemschutz – geht das?', o:['Ja, immer','Ja, wenn der Maschinist mitgeht','Nein, dafür braucht es mindestens eine Staffel','Nur bei kleinen Bränden'], r:2,
    e:'„Die Mannschaft eines Selbstständigen Trupps reicht hierfür nicht aus."' },
  { typ:'mc', f:'Wozu wird der Wassertrupp beim Atemschutzeinsatz, nachdem er fertig ist?', o:['Zum Sicherheitstrupp','Zum Angriffstrupp','Zum Schlauchtrupp','Er hat Pause'], r:0,
    e:'Der Sicherheitstrupp hilft eingesetzten Atemschutztrupps im Notfall unverzüglich.' },
  { typ:'mc', f:'Aus wem besteht der Zugtrupp?', o:['Zugführer, Melder, Fahrer','Führungsassistent, Melder, Fahrer','Zugführer, Maschinist, Melder','Führungsassistent, Maschinist, Fahrer'], r:1,
    e:'Der Zugtrupp gliedert sich in Führungsassistent, Melder und Fahrer. Der Zugführer kommt noch dazu.' },
  { typ:'mc', f:'Wer ist der Vertreter des Zugführers?', o:['Der älteste Gruppenführer','Der Führungsassistent','Der Melder','Der Fahrer'], r:1,
    e:'„Der Führungsassistent ist Vertreter des Zugführers."' },
  { typ:'mc', f:'Welches Kommando bringt bei Gefahr sofort alle zurück?', o:['„Alle Mann zurück!"','„Gefahr – Alle sofort zurück!"','„Abbrechen!"','„Rückzug!"'], r:1,
    e:'Jede Einsatzkraft darf es geben und jede gibt es weiter. Sammeln am Fahrzeug.' },
  { typ:'mc', f:'Der Staffel fehlen gegenüber der Gruppe …', o:['Melder und Schlauchtrupp','Melder und Wassertrupp','Maschinist und Melder','Schlauchtrupp und Wassertrupp'], r:0,
    e:'Staffel = Gruppe minus Melder minus Schlauchtrupp. Genau die ersten beiden der Verzichtsreihenfolge.' },
  { typ:'mc', f:'Wer darf von den Regeln der FwDV 3 abweichen, wenn es für den Einsatzerfolg nötig ist?', o:['Niemand','Der Führer der taktischen Einheit','Nur der Zugführer','Jede Einsatzkraft'], r:1,
    e:'„Der Führer einer taktischen Einheit kann von den Regelungen dieser Feuerwehr-Dienstvorschrift abweichen, wenn dies zur Sicherstellung des Einsatzerfolges erforderlich ist."' },
  { typ:'mc', f:'Wann darf mit dem Innenangriff begonnen werden?', o:['Sofort nach dem Befehl','Wenn eine ständige Wasserabgabe sichergestellt ist','Wenn der Verteiler steht','Wenn der Hydrant gefunden ist'], r:1,
    e:'Ohne sichere Wasserabgabe kein Innenangriff. Der Hydrant muss dafür aber noch nicht stehen – das mitgeführte Löschwasser im Tank zählt ausdrücklich mit.' },
  { typ:'mc', f:'Wer kommandiert „1. Rohr Wasser marsch!"?', o:['Der Wassertruppführer','Der Angriffstruppführer','Der Maschinist','Der Gruppenführer'], r:1,
    e:'Der Wassertrupp kommandiert „Verteiler Wasser marsch!", sobald der Verteiler Wasser hat. Das Rohr fordert der Truppführer an, der es selbst vornimmt.' },
  { typ:'mc', f:'Wozu legt der Angriffstrupp am letzten C-Schlauch eine Schlauchreserve?', o:['Damit der Schlauch nicht knickt','Damit er vorgehen kann, ohne neu kuppeln zu müssen','Damit mehr Wasser durchgeht','Weil es besser aussieht'], r:1,
    e:'„Er stellt ausreichend Schlauchreserve sicher." Ein paar Buchten am Eingang – dann kann der Trupp weiter vor, ohne dass der Schlauch stramm wird.' },
  { typ:'mc', f:'Wie tritt die Mannschaft nach dem Kommando „Absitzen!" an?', o:['Vor dem Fahrzeug','Neben dem Fahrzeug','Hinter dem Fahrzeug','Am Verteiler'], r:2,
    e:'„Danach tritt die Mannschaft grundsätzlich hinter dem Fahrzeug wie folgt an" – etwa 2,0 Meter Abstand.' },
];

/* --- Sammelbare Abzeichen -------------------------------------------------- */
const ABZEICHEN = {
  ersteinheit:  { icon:'🧩', name:'Baumeister',      text:'Erste taktische Einheit korrekt zusammengesetzt' },
  staerkeprofi: { icon:'🔢', name:'Zahlendreher',    text:'Stärke-Blitzrunde ohne Fehler' },
  retter:       { icon:'🚑', name:'Retter',          text:'Die Rettungsregel verstanden' },
  befehlsgeber: { icon:'📣', name:'Befehlsgeber',    text:'Befehlsschema fehlerfrei aufgebaut' },
  entscheider:  { icon:'⚖️', name:'Entscheider',     text:'Mit oder ohne Bereitstellung – alles richtig' },
  gruppe:       { icon:'🔥', name:'Gruppenführer',   text:'Löschangriff als Gruppe gemeistert' },
  staffel:      { icon:'💪', name:'Improvisator',    text:'Löschangriff als Staffel gemeistert' },
  perfekt:      { icon:'🏅', name:'Musterlöschangriff', text:'Ein Löschangriff ganz ohne Fehler' },
  sitzordnung:  { icon:'🚒', name:'Platzanweiser',   text:'Sitz- und Antreteordnung sitzt' },
  wasserversorgung: { icon:'💧', name:'Wasserträger',  text:'Die Übung fehlerfrei durchgezogen' },
  meister:      { icon:'🎖️', name:'Ausbildungsmeister', text:'Drei Sterne in jeder einzelnen Aufgabe' },
};

/* --- Memory für den Gruppenabend ------------------------------------------
   Immer ein Begriff und seine Entsprechung. Zwei Teams decken abwechselnd
   zwei Karten auf. Kein Text darf doppelt vorkommen – sonst wird geraten
   statt gelernt.                                                            */
const MEMORY_PAARE = [
  { a:'🚒 Gruppe',              b:'1/8/9', merke:'Gruppenführer + acht weitere Einsatzkräfte.' },
  { a:'🚐 Staffel',             b:'1/5/6', merke:'Der Staffel fehlen Melder und Schlauchtrupp.' },
  { a:'🚕 Selbstständiger Trupp', b:'1/2/3', merke:'Eigene taktische Einheit – nicht zu verwechseln mit dem Angriffstrupp.' },
  { a:'🚻 Zug',                 b:'Stärke 22', merke:'Zugführer + Zugtrupp + zwei Gruppen.' },
  { a:'Setzt den Verteiler',       b:'Angriffstrupp', merke:'Und nimmt in der Regel das erste Rohr vor.' },
  { a:'Bedient die Pumpe',         b:'Maschinist', merke:'Er sichert auch sofort die Einsatzstelle ab.' },
  { a:'Wasser bis zum Verteiler',  b:'Wassertrupp', merke:'Erst Fahrzeug → Verteiler, dann Fahrzeug → Hydrant.' },
  { a:'Wasser ab dem Verteiler',   b:'Schlauchtrupp', merke:'Danach bedient er den Verteiler.' },
  { a:'„Verteiler Wasser marsch!"', b:'Wassertruppführer', merke:'In der FwDV 3 steht dafür kurz „Wasser marsch!".' },
  { a:'„1. Rohr Wasser marsch!"',   b:'Angriffstruppführer', merke:'Erst Reserve legen und ankuppeln – dann Wasser anfordern.' },
  { a:'„Absitzen!"',               b:'Einheitsführer', merke:'Vorher bleibt die Mannschaft im Fahrzeug.' },
  { a:'Hilft dem Atemschutztrupp im Notfall', b:'Sicherheitstrupp', merke:'Beim Atemschutzeinsatz wird der Wassertrupp dazu.' },
  { a:'Mit Bereitstellung',        b:'„Zum Einsatz fertig!"', merke:'Nur Wasserentnahmestelle und Lage des Verteilers.' },
  { a:'Ohne Bereitstellung',       b:'„Vor!"', merke:'Der komplette Befehl mit Auftrag, Mittel, Ziel und Weg.' },
  { a:'Schlauchreserve',           b:'Buchten vor dem Strahlrohr', merke:'Außerhalb des Gefahrenbereichs, spätestens an der Rauchgrenze.' },
  { a:'Antreteordnung',            b:'AWS – Alle Wollen Spritzen', merke:'Angriffstrupp, Wassertrupp, Schlauchtrupp – in dieser Reihenfolge.' },
];
