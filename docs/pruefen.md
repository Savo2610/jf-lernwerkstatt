# Prüfen, ohne sich durchzuklicken

Beide Seiten haben Haken für die Konsole. Wer sie nicht kennt, klickt sich für
jede Kleinigkeit durch acht Level oder scrollt eine halbe Seite weit — und
gibt dann irgendwann auf und prüft gar nicht mehr.

## Loslegen

```bash
npm run dev       # Startseite + Spiel unter /fwdv3/, wie im Netz, Port 8413
npm run dev:spiel # nur das Spiel, Port 8412
```

Nach jeder Änderung an `src/` oder `hub/src/` muss **neu gebaut** werden
(`npm run build`) — die Server liefern die gebaute Datei aus, nicht die
Quellen. Kein Hot Reload.

## Im Spiel

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

1. `npm run build` läuft ohne Fehler
2. `__eb.Fehlerliste` ist leer, Browserkonsole ohne Fehler
3. Ein Level und die Startseite einmal bei **360 × 740** — das ist ein
   verbreitetes Android-Format und der Fall, in dem zuerst etwas nicht mehr
   passt. Dazu in der Konsole `document.body.style.setProperty('--skala',1.3)`:
   das entspricht Chromes Textskalierung auf 130 %, die viele eingeschaltet
   haben. Prüfen, ob die Überschrift oben noch sichtbar und alles unten
   erreichbar ist.
4. Die Wege nach draußen einmal anklicken: der Schaukasten an der Wache und
   der Instagram-Link im Fuß, dazu „Hilf mit beim Bauen" an der Baustelle.
   Alle drei sind leicht zu übersehen und fallen deshalb auch nicht auf,
   wenn sie kaputt sind.
5. Bei Animationen: einmal mit „Bewegung reduzieren" — es muss einen
   Ersatzweg geben, nicht nur weniger Bewegung
6. Zurück-Knopf des Browsers, wenn du an einem Übergang warst
