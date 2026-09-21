# Prüfen, ohne sich durchzuklicken

Alle Seiten haben Haken für die Konsole. Wer sie nicht kennt, klickt sich
für jede Kleinigkeit durch acht Aufgaben oder scrollt eine halbe Seite weit —
und gibt dann irgendwann auf und prüft gar nicht mehr.

## Loslegen

```bash
npm run dev           # alles wie im Netz, Port 8413
npm run dev:spiel     # nur Einsatzbereit, Port 8412
npm run dev:brennen   # nur Brennen & Löschen, Port 8414
npm run dev:absichern # nur Erst sichern!, Port 8415
```

Nach jeder Änderung an `src/`, `brennen/src/`, `absichern/src/`, `gemeinsam/`
oder `hub/src/` muss **neu gebaut** werden (`npm run build`) — die Server
liefern die gebaute Datei aus, nicht die Quellen. Kein Hot Reload.

Wer an `gemeinsam/` etwas ändert, muss **alle drei** Lernseiten ansehen. Der
Bau merkt nicht, dass die eine noch geht und die andere nicht mehr. Und nicht
jede Seite benutzt alles: „Erst sichern!" bringt keine 3D-Bühne mit, sondern
eine eigene in SVG — `gemeinsam/stage.js` fehlt dort, `gemeinsam/ui.js` nicht.

## In Einsatzbereit

Über die Adresszeile:

- `?level=<id>` springt direkt in ein Level und umgeht auch die Sternsperre
  des Boss-Levels. Die Kennungen: `einheit`, `werkstatt`, `staerke`,
  `sitzordnung`, `aufgaben`, `befehl`, `uebung`, `loeschangriff`.
- `?modus=beamer` startet den Beamer-Modus für den Gruppenabend.

In der Konsole:

```js
__eb.State        // Spielstand, Ränge, XP, Abzeichen
__eb.Stage        // Renderer, Kamera, Szene
__eb.UI           // Bildschirme
__eb.LEVELS       // alle Level mit ihren Kennungen
__eb.FAHRZEUGE    // Sitzordnung LF und KLF
__eb.ANTRETEN     // die Antreteordnung
__eb.Fehlerliste  // muss leer sein
```

Anders als der Haken auf veerka.mp steht `__eb` auch im Netz zur Verfügung —
er liest nur, richtet also keinen Schaden an, und beim Gruppenabend ist es
praktisch, im Zweifel nachsehen zu können.

**`__eb.Fehlerliste` ist der wichtigste Wert.** Sie sammelt, was im Spiel
schiefgegangen ist, ohne dass es jemand sieht. Vor jedem Veröffentlichen einmal
hineinschauen.

## In Brennen & Löschen

Über die Adresszeile:

- `?level=<id>` springt direkt in ein Level und umgeht auch die Sternsperre
  des Boss-Levels. Die Kennungen: `dreieck`, `brandklassen`, `sauerstoff`,
  `zuendung`, `loeschverfahren`, `loeschmittel`, `feuerloescher`, `ernstfall`.
- `?modus=beamer` startet den Gruppenabend mit der Feuerwand.

In der Konsole liegt derselbe Satz Haken unter `__bl`, dazu die Inhalte und
die Bausteine, aus denen die Level gebaut sind:

```js
__bl.State                    // Spielstand, Ränge, XP, Abzeichen
__bl.Stage                    // Renderer, Kamera, Szene
__bl.Fehlerliste              // muss leer sein
__bl.VORAUSSETZUNGEN          // drei Ecken plus die Mitte des Dreiecks
__bl.BRANDKLASSEN             // A bis F
__bl.LOESCHMITTEL             // Wasser, Schaum, Pulver, CO2, Fettbrandlöscher
__bl.LOESCHVERFAHREN          // welches Verfahren wo angreift (`nimmt`)
__bl.LOESCHFAMILIEN           // Abkühlen / Ersticken / Hemmen
__bl.BRANDLAGEN               // die fünf Brände aus Aufgabe 6
__bl.STRAHLARTEN              // Vollstrahl und Sprühstrahl
__bl.LOESCHERREGELN           // die sieben Regeln aus Aufgabe 7
__bl.EINSAETZE                // die vier Boss-Einsätze
__bl.KATEGORIEN               // die vier Spalten der Feuerwand
__bl.QUIZ                     // Wandfragen (kat+wert) und Blitzfragen
__bl.Teams                    // Mannschaften am Beamer
__bl.Beamer                   // Gruppenabend: Beamer.wandStart() usw.
__bl.bausteine.baueFeuer      // Flamme bauen
__bl.bausteine.feuerStaerke   // Feuer hoch- und runterfahren
__bl.bausteine.motivEinpassen // Kamera auf Weltpunkte einpassen
__bl.bausteine.regler         // Schieberegler mit Zonen
__bl.bausteine.unterbau       // Bedienfeld mit Rückmeldung darüber
__bl.bausteine.baueStrahl     // Wasserstrahl, `fein` schaltet auf Sprühstrahl
__bl.bausteine.strahlAn       // Strahl auf- und zudrehen
__bl.bausteine.baueSchaumdecke// Schaumdecke, dazu schaumFuellen(0..1)
__bl.bausteine.baueGasfackel  // Propanflasche mit Fackel und Handrad
```

Die Bausteine sind da, um eine Kameraeinstellung oder eine Flamme direkt in der
Konsole auszuprobieren, statt für jeden Versuch neu zu bauen. Beispiel:

```js
__bl.bausteine.motivEinpassen(
  [[-2.7,0,-2.7],[2.7,0,-2.7],[2.7,0,2.7],[-2.7,0,2.7],[0,1.4,0]],
  null, { hoch:.5, weit:.9, anteil:.94, rand:.45 });
```

### Wenn die Vorschau versteckt ist

In einer versteckten oder gedrosselten Vorschau läuft `requestAnimationFrame`
kaum — eine Kamerafahrt scheint dann zu hängen, obwohl sie nur wartet. Die
Bühne lässt sich von Hand weiterrechnen:

```js
for (let t = 0; t < 3; t += .05) __bl.Stage.updates.forEach(f => f(.05, t));
```

Dasselbe in Grün wie `szene.bild()` auf veerka.mp weiter unten.

## In Erst sichern!

Über die Adresszeile:

- `?level=<id>` springt direkt in eine Aufgabe und umgeht auch die Sternsperre
  des Boss-Levels. Die Kennungen: `ankommen`, `geraet`, `innerorts`,
  `landstrasse`, `autobahn`.
- Einen Beamer-Modus gibt es hier nicht — warum, steht oben in
  `absichern/src/main.js`.

In der Konsole liegt derselbe Satz Haken unter `__as`:

```js
__as.State                      // Spielstand, Ränge, XP, Abzeichen
__as.Stage                      // die 2D-Bühne: blick(), bildVersatz(), sicht
__as.Marken                     // die Knöpfe, die an der Karte kleben
__as.Fehlerliste                // muss leer sein
__as.STRASSEN                   // innerorts 100, Landstraße 200, Autobahn 800
__as.GERAETE                    // Warndreieck, Warnleuchte, Leitkegel …
__as.AUSRUESTUNG                // wer was trägt (FwDV 1, 3.3.2)
__as.BELADUNG                   // was ein LF dabeihat – bewusst knapp
__as.REGELN                     // die Sicherheitssätze, richtige und falsche
__as.TRUPPFARBEN                // blau Wassertrupp, rot Angriffstrupp, …
__as.ABZEICHEN, __as.RAENGE     // Abzeichen und Ränge
__as.NACHWEIS                   // der Prüfcode für „alle Abzeichen"
__as.bausteine.baueStrecke      // eine Straße von oben bauen
__as.bausteine.planZeigen       // Bildausschnitt auf einen Plan setzen
__as.bausteine.aufPlan          // etwas in Meter + Querabstand hinstellen
__as.bausteine.setzenAuf        // dasselbe zum Umsetzen (Laufwege)
__as.bausteine.stellen          // in Weltkoordinaten – nur auf geraden Plänen
__as.bausteine.planMarke        // Knopf an einer Weltposition
__as.bausteine.abstandsregler   // Regler, der in Metern und Leitpfosten denkt
```

Eine Straße direkt in der Konsole ausprobieren, ohne neu zu bauen:

```js
__as.Stage.leeren();
const p = __as.bausteine.baueStrecke({
  art:'richtung', von:-90, bis:870, nah:30, nahProM:4, fernProM:.62,
  marken:[800,600,400,200] });
__as.bausteine.planZeigen(p);
__as.bausteine.stellen(__as.bausteine.baueLF({}), p.mx(12), p.spurMitte(1), -7, p.symbolSkala);
```

**Der Längsmaßstab ist gebrochen**, quer nicht — das ist der häufigste Grund
für ein Bild, das falsch aussieht. `p.symbolSkala` gehört an jedes Fahrzeug;
ohne sie ist ein Löschfahrzeug auf dem Übersichtsplan fünfzig Meter lang.
Warum das so ist, steht oben in `absichern/src/welt/plan.js`.

Der zweite häufige Grund: **eine Kurve im Plan.** `baueStrecke({ kurve: … })`
biegt die ganze Straße; alles, was darauf steht, muss dann mit `aufPlan()`
gesetzt werden statt mit `stellen()`. Sonst steht es dort, wo die Straße ohne
Bogen gewesen wäre — also neben ihr.

### Wenn der Plan beim „Weiter" zuckt

Der Bildausschnitt kommt aus der gemessenen freien Fläche über dem Bedienfeld.
Beim Bildschirmwechsel gibt es kurz zwei Felder, und wenn beide melden, springt
das Bild. So sieht man, wer meldet:

```js
const echt = __as.Stage.bildVersatz.bind(__as.Stage);
__as.Stage.bildVersatz = (o, r, f) => { console.log('Versatz', o, f); return echt(o, r, f); };
```

Pro Bildschirmwechsel darf **eine** Zeile kommen. Kommen zwei oder drei
unmittelbar hintereinander mit verschiedenen `f`, meldet noch ein altes Feld
mit — dann fehlt die Abmeldung in `bedienfeld()` (`feldWache`).

### Wenn die Vorschau versteckt ist

Dasselbe wie bei den 3D-Seiten: In einer versteckten oder gedrosselten
Vorschau läuft `requestAnimationFrame` kaum, und dann steht jede Bewegung
still — das Fahrzeug fährt nicht an, der Trupp läuft nicht los, und die
Rückmeldung danach kommt nie. `document.visibilityState` sagt, ob das der
Grund ist. Von Hand weiterdrehen:

```js
for (let t = 0; t < 3; t += .05) __as.Stage.updates.slice().forEach(f => f(.05, t));
```

## Auf der Startseite

```js
__hub.pos            // gefahrene Strecke in Welteinheiten
__hub.ziel           // wohin sie gerade läuft
__hub.stationen      // die Stationen mit ihren Weltpositionen
__hub.zuStation(1)   // dorthin scrollen
__hub.vor(90)        // 90 Bilder weiterrechnen, ohne zu scrollen
__hub.springe(x)     // an eine Weltposition springen (koppelt vom Scrollen ab)
__hub.loesen()       // wieder ans Scrollen koppeln
__hub.vermessen()    // Bild neu einpassen
```

Die Fahrt hängt an der Scrollposition, gelesen in der Bildschleife und nicht
über ein `scroll`-Ereignis. Das ist Absicht: Ereignisse werden zusammengefasst
oder verworfen, und in manchen eingebetteten Vorschauen kommen sie überhaupt
nicht an. Wer die Seite dort prüft, sollte deshalb `__hub.zuStation()` benutzen
statt zu scrollen.

## Auf veerka.mp (anderes Repo)

Nur auf `localhost` gibt es dort:

```js
szene.springe(1)                  // ans Ende der Abfahrt, ins Tal
szene.bild(30, 0.1)               // 30 Einzelbilder mit je 0,1 s rechnen
szene.klickbar[0].userData.tun()  // Feuerwehrauto auf die Runde schicken
szene.klickbar[1].userData.tun()  // Drohne
szene.masse(390, 844)             // Bildausschnitt erzwingen
```

`szene.bild(n, dt)` ist der Weg, eine Animation Bild für Bild zu prüfen,
statt ihr in Echtzeit hinterherzuschauen. In einer versteckten oder gedrosselten
Vorschau läuft `requestAnimationFrame` sonst so langsam, dass eine
Sieben-Sekunden-Runde eine Minute dauert und man glaubt, es sei kaputt.

## Was vor dem Veröffentlichen dran ist

1. `npm run build` läuft ohne Fehler — er baut Startseite und alle drei
   Lernseiten
2. `__eb.Fehlerliste`, `__bl.Fehlerliste` und `__as.Fehlerliste` sind leer,
   Browserkonsole ohne Fehler
3. Ein Level je Lernseite und die Startseite einmal bei **360 × 740** — das ist ein
   verbreitetes Android-Format und der Fall, in dem zuerst etwas nicht mehr
   passt. Dazu in der Konsole `document.body.style.setProperty('--skala',1.3)`:
   das entspricht Chromes Textskalierung auf 130 %, die viele eingeschaltet
   haben. Prüfen, ob die Überschrift oben noch sichtbar und alles unten
   erreichbar ist. Was an einem 3D-Objekt klebt, stößt dort als erstes an:
   vier Marken an vier Säulen liegen schnell übereinander.
4. Die Wege nach draußen einmal anklicken: der Schaukasten an der Wache und
   der Instagram-Link im Fuß, dazu „Hilf mit beim Bauen" an der Baustelle.
   Alle drei sind leicht zu übersehen und fallen deshalb auch nicht auf,
   wenn sie kaputt sind.
5. Jeden Übergang einmal fahren: von der Startseite in jede Lernseite (die
   Blende muss den Grundton des Ziels haben, nicht den des Nachbarn) und mit
   dem Knopf oben links wieder zurück.
6. Bei Animationen: einmal mit „Bewegung reduzieren" — es muss einen
   Ersatzweg geben, nicht nur weniger Bewegung
7. Zurück-Knopf des Browsers, wenn du an einem Übergang warst

## Löschlos

Liegt unter `/loeschlos/` und hat kein Level, durch das man sich klicken
müsste — nur eine Namensliste, die beim ersten Öffnen leer ist. Damit man zum
Ausprobieren nicht jedes Mal neun Namen tippt, liegen zwölf in der Konsole:

```js
__loeschlos.beispiele()   // zwölf Namen eintragen, alle anwesend
__loeschlos.state         // Namen, Plätze, Gedächtnis der letzten Runden
__loeschlos.ziehen()      // eine Runde auslosen, ohne zu klicken
```

Die Beispielnamen stehen bewusst **nicht** als Knopf in der Oberfläche: wer
die App zum ersten Mal öffnet, soll seine eigene Gruppe eintragen und nicht
erst zwölf fremde Kinder wieder löschen.

Was beim Prüfen gern hängt, ist der **Service Worker**. Er liefert zuerst aus
dem Netz und fällt nur offline auf den Cache zurück, ein Neuladen reicht also
normalerweise. Wenn doch ein alter Stand klebt:

```js
(await navigator.serviceWorker.getRegistrations()).forEach(r => r.unregister());
(await caches.keys()).forEach(k => caches.delete(k));
```
