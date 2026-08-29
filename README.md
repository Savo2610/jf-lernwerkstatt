# Einsatzbereit — FwDV-3-Lernspiel für die Jugendfeuerwehr

3D-Lernspiel zur Feuerwehr-Dienstvorschrift 3 „Einheiten im Lösch- und
Hilfeleistungseinsatz" (Stand Februar 2008). Zielgruppe: 10 bis 17 Jahre.

**Live:** Startseite https://jf.veerka.mp · Spiel https://jf.veerka.mp/fwdv3/
(die alte Adresse `fwdv3.veerka.mp` leitet dorthin um)
**Vorschau als Artifact:** Spiel https://claude.ai/code/artifact/89189aa0-35ad-4ee7-a675-6b79d20f5d32 ·
Startseite https://claude.ai/code/artifact/8756628e-6754-43ab-bfe4-dad81a4109ca

## Wo was steht

| Datei | Wofür |
|---|---|
| [CLAUDE.md](CLAUDE.md) | Einstieg für Agenten: Hausordnung, Fallen, Kurzbefehle |
| [docs/deploy.md](docs/deploy.md) | Autodeploy, Worker, Routen, DNS |
| [docs/pruefen.md](docs/pruefen.md) | Konsolen-Haken, Direktsprünge, was vor dem Veröffentlichen dran ist |
| [docs/verwandte-projekte.md](docs/verwandte-projekte.md) | die Absprache mit veerka.mp (`?einfahrt=1`) |
| dieses README | das ausführliche Handbuch — Inhalte, Aufbau, Stellschrauben |

---

## Was drin ist

| # | Level | Inhalt |
|---|-------|--------|
| 1 | Die Grundformel | Mannschaft + Einsatzmittel = taktische Einheit |
| 2 | Die Einheiten-Werkstatt | Selbstständiger Trupp, Staffel, Gruppe, Zug zusammensetzen |
| 3 | Der Stärke-Decoder | 1/8/9 lesen, dann Blitzrunde gegen die Uhr |
| 4 | Sitzen & Antreten | Sitzordnung LF und KLF, Antreteordnung — nach **unseren** Unterlagen |
| 5 | Wer macht was? | Aufgaben zuordnen, inklusive der Rettungsregel |
| 6 | Der Befehl | Sieben Befehlselemente, gesprochener Befehl, Befehlswiederholung, dann acht Lagen „mit oder ohne Bereitstellung?" |
| 7 | Die Übung | Wiesenbrand mit zwei Rohren, linker und rechter Brandabschnitt: erst der Befehl, dann die Trupps aus der Vogelperspektive zuordnen, Wasserversorgung aufbauen, am Verteiler in der Großaufnahme anschließen (links 1. Rohr, Mitte B, rechts 2. Rohr), den letzten Schlauch als Reserve in Buchten legen, der Wassertrupp wiederholt seinen eigenen Befehl, Sonderfall Schnellangriffsverteiler |
| 8 | Der Löschangriff (Boss) | Voller Einsatz als Gruppe **und** als Staffel. Erst ab **sieben Sternen** aus den Übungen spielbar |

Dazu ein **Beamer-Modus**: Quiz-Duell, Blitzrunde, Memory, Hot Seat und eine
Punktetafel für zwei Teams.

## Startseite (`hub/`)

Unter https://jf.veerka.mp liegt die Übersicht aller Lernseiten. Sie steckt im
Ordner `hub/` und bringt beim Bauen das Spiel gleich mit — beides wird als
**eine** Auslieferung veröffentlicht.

Die Seite ist eine Straße durch Harheim, von der Seite gesehen. Scrollen fährt
das LF **19/43** daran entlang; an jeder Station hält es an und die zugehörige
Karte fährt ein. Vor dem Feuerwehrhaus steht das KLF **19/49**. Alles ist SVG,
kein Bild und keine Bibliothek.

Die Feuerwache am Anfang hat bewusst **keine** Karte und keinen Knopf: dort
soll gescrollt und nicht geklickt werden. Wegweiser sind der Hinweis unten und
der Streckenplan, dessen Punkte anklickbar sind. Sie steht auch kürzer als die
Themen (`HALT_START` gegen `HALT_GEWICHT` in `hub/src/main.js`) — es gibt dort
nichts zu lesen, also soll es schnell losgehen.

Hin und zurück ist eine Fahrt. Wer auf **Losfahren** drückt, fährt auch los:
die Bedienelemente blenden aus,
die Welt rauscht vorbei, das Fahrzeug zieht rechts aus dem Bild, und das Bild
schließt sich auf den Nachthimmel, mit dem das Spiel aufmacht — 900 ms, in
denen im Hintergrund schon das Spiel geladen wird (`prefetch`, ausgelöst schon
beim Zeigen auf den Knopf). Dauer und Kurve stehen als `AUSRUECKEN_MS` und
`losfahren()` in `hub/src/main.js`. Bei „Bewegung reduzieren" wird schlicht
verlinkt, und beim Zurück-Knopf setzt `pageshow` alles zurück — sonst käme die
Seite mit noch dunkler Blende aus dem Browsercache.

Umgekehrt genauso: der Knopf oben links im Levelmenü des Spiels
(`App.zurLernwerkstatt()` in `src/main.js`) zieht das Bild auf denselben
Grundton zu und ruft `jf.veerka.mp/?einfahrt=1` auf. Die Startseite beginnt
dann dunkel und lässt das Fahrzeug vor der Wache ausrollen
(`einfahrtStarten()`); den Parameter nimmt sie danach per `replaceState` wieder
aus der Adresszeile.

Dieselbe Einfahrt spielt auch, wer von **veerka.mp** kommt: dort steht in der
verschneiten 3D-Szene ein Feuerwehrauto, und das Schild daran führt hierher.
Es fährt dabei wirklich los und übergibt mit `?einfahrt=1` — die Startseite
kann nicht unterscheiden, aus welcher Richtung jemand ankommt, und muss es
auch nicht. Der Code dafür liegt drüben in `public/scene.js` des Repos
`Savo2610/Julians-Website`; die Absprache zwischen beiden Repos steht in
[docs/verwandte-projekte.md](docs/verwandte-projekte.md).

Nach draußen führt genau ein Link: das **Team Zukunft auf Instagram**, unten im
Fuß zwischen den Themen und dem Kleingedruckten. Er steht bewusst dort und in
keiner Karte — die Karten sind für Lerninhalte da.

Ein Thema hinzufügen: Eintrag in `hub/src/themen.js` ergänzen und `kulisse` auf
eine Kulisse aus `hub/src/szene.js` setzen. Scrolllänge, Streckenplan und die
Liste im Fuß richten sich automatisch danach. Eine neue Kulisse ist eine
Funktion, die SVG zurückgibt — Boden ist `y = 0`, nach oben ist negativ.

Startseite und Spiel liegen bewusst auf **einer** Domain als Pfade und nicht
auf zwei Subdomains: nur dann teilen sie sich den Browserspeicher. Ein
gemeinsamer Fortschritt über mehrere Themen hinweg — Medaillen, Gesamt-XP —
ist damit später ohne Umzug möglich.

## Start

Die Seite startet immer im Modus **Alleine üben**. Beim ersten Aufruf kommt
das Profil (Name, Helmfarbe), danach direkt die Levelauswahl. Den Beamer-Modus
und das Zurücksetzen des Fortschritts findet man im Profil.

## Zwei Modi

- **Alleine üben** — Fortschritt, XP, sieben Ränge, elf Abzeichen. Speichert
  lokal im Browser (`localStorage`), nichts geht nach außen. Der Boss-Level
  bleibt verschlossen, bis in den Übungen sieben von 21 möglichen Sternen
  zusammen sind. Wer in allen acht Aufgaben drei Sterne hat (24 von 24),
  bekommt das Abzeichen „Ausbildungsmeister".
- **Gruppenabend am Beamer** — 42 % größere Schrift, Teamwertung, Moderations-
  knöpfe. Zwei Mannschaften treten gegeneinander an. Im Quiz-Duell ist immer
  ein Team dran: Der Moderator tippt die gerufene Antwort an, bei einem
  Treffer bekommt das Team automatisch zehn Punkte, bei einem Fehlgriff darf
  das andere Team nachziehen und die Punkte abstauben. Von Hand nachjustieren
  geht trotzdem. Im Beamer-Modus ist der Boss-Level nicht gesperrt.

### XP nur einmal

XP gibt es je Aufgabe nur bis zur vollen Punktzahl. Wiederholt man eine
Aufgabe und wird besser, gibt es die Differenz als Nachschlag; wiederholt man
nur seine Bestleistung, bleibt eine kleine Anerkennung von zehn Prozent.
Damit lohnt es sich nicht, Aufgabe 1 endlos zu wiederholen. Die Logik steht in
`State.xpFuerLevel()` in `src/state.js`.

## Technik

- Three.js (r169), vollständig in die HTML-Datei eingebettet
- Kein Build-Tooling nötig zum Ausführen, keine Abhängigkeiten zur Laufzeit
- Einziger externer Verweis: Google Fonts (Archivo Black + Outfit)
- Kommandos werden über die eingebaute Sprachausgabe des Browsers gesprochen
  (`speechSynthesis`, deutsche Stimme) — keine Audiodateien.
  `Audio3.sprechbar()` in `src/audio.js` biegt vorher die Aussprache gerade:
  Ordnungszahlen werden ausgeschrieben und im richtigen Fall gebeugt
  („mit 1. Rohr" → „mit erstem Rohr"), und an Wortfugen mit s+t setzt es einen
  Bindestrich, damit aus „Angriffstrupp" nicht „Angriffschtrupp" wird. Der
  angezeigte Text bleibt davon unberührt — nur das Gesprochene ändert sich.
- Alle Klänge (Martinshorn, Wasser, Feuer, Fanfaren) sind per WebAudio erzeugt

## Entwickeln

```bash
npm run build     # Startseite und Spiel, alles nach hub/dist/
npm run dev       # beides wie im Netz, http://localhost:8413
npm run dev:spiel # nur das Spiel, http://localhost:8412
```

`npm run build` ist `node hub/build.mjs`; das ruft zuerst `build.mjs` im
Hauptordner auf, der `src/` und `vendor/three.module.min.js` zu einer einzigen
Datei `dist/index.html` zusammenbaut. Reihenfolge der Dateien steht in
`build.mjs`. Nur das Spiel bauen geht mit `node build.mjs`.

Die Server liefern das **Gebaute** aus, nicht die Quellen — nach jeder Änderung
also neu bauen. Kein Hot Reload.

Zum Prüfen im Browser: [docs/pruefen.md](docs/pruefen.md).

### Veröffentlichen

**Push auf `main` reicht.** Cloudflare Workers Builds baut und veröffentlicht
von selbst; die Einstellungen dazu stehen in [docs/deploy.md](docs/deploy.md).

Von Hand geht es auch:

```bash
npm run deploy
```

Ein Befehl für alles: `hub/build.mjs` ruft zuerst `build.mjs` im Hauptordner
auf, legt das fertige Spiel als `hub/dist/fwdv3/index.html` neben die
Startseite und veröffentlicht beides zusammen. Der Umweg ist Absicht — so kann
man nicht versehentlich einen alten Stand des Spiels mit hochladen. Was von
Hand hochgeladen wurde, überschreibt der nächste Push aus `main` allerdings
wieder — also hinterher committen.

Ein einziger Cloudflare Worker (`hub/wrangler.jsonc`, Code in
`hub/src/worker.js`) bedient drei Dinge:

| Adresse | Ergebnis |
|---|---|
| `jf.veerka.mp/` | Startseite |
| `jf.veerka.mp/fwdv3/` | das Spiel |
| `fwdv3.veerka.mp/*` | 301 auf `jf.veerka.mp/fwdv3/`, Query bleibt erhalten |

`jf.veerka.mp` hängt an einer **Custom Domain** — den DNS-Eintrag hat
Cloudflare beim ersten Deploy selbst angelegt. `fwdv3.veerka.mp` hängt an einer
**Worker-Route**, weil dort noch der alte, proxied Eintrag aus der
GitHub-Pages-Zeit steht; der muss orange (proxied) bleiben, sonst greift die
Route nicht. Damit die Umleitung überhaupt zum Zug kommt, läuft der Worker vor
der Dateiauslieferung (`run_worker_first`) — sonst bekäme `fwdv3.veerka.mp/`
einfach die Startseite.

Die alte Seite liegt als Sicherung in `sicherung/`. Alles zu Routen, DNS und
Autodeploy steht ausführlich in [docs/deploy.md](docs/deploy.md).

### Direktsprung zum Testen

- `?level=<id>` springt direkt in ein Level
  (`einheit`, `werkstatt`, `staerke`, `sitzordnung`, `aufgaben`, `befehl`,
  `uebung`, `loeschangriff`) – umgeht auch die Sternsperre des Boss-Levels,
  praktisch für den Gruppenabend
- `?modus=beamer` startet den Beamer-Modus
- `window.__eb` gibt im Browser Zugriff auf Stage, State, UI und die
  Fehlerliste

### Aufbau

```
hub/                 Startseite + Auslieferung von allem (jf.veerka.mp)
  build.mjs          baut Startseite und Spiel, legt beides in hub/dist/
  wrangler.jsonc     der eine Worker für beide Adressen
  src/themen.js      die Lernseiten – hier kommt ein neues Thema rein
  src/szene.js       Fahrzeuge, Gebäude, Bäume als SVG
  src/welt.js        setzt die Strecke aus den Themen zusammen
  src/main.js        Scrollposition -> Fahrt, Karten, Streckenplan
  src/worker.js      Umleitung der alten Adresse, sonst nur Dateien
src/
  data/fwdv3.js      alle Inhalte (Einheiten, Aufgaben, Befehl, Quiz, Lagen)
  util.js            Helfer + Levelregister
  state.js           Spielstand, Ränge, Teams
  audio.js           WebAudio-Klänge + Sprachausgabe
  ui.js              Bildschirme, Ziehen & Ablegen, Hotspots, Seitenlayout
  styles.css         Designsystem
  body.html          DOM-Gerüst
  three/
    stage.js         Renderer, Kamera, Bildeinpassung, Bewegungen, Laufwege
    figures.js       Feuerwehrfiguren
    vehicles.js      KLF und LF inklusive Sitz- und Antreteordnung
    fx.js            Feuer, Wasser, Schläuche, Verteiler, Hydrant
    scenery.js       Boden, Straße, Häuser, Laternen, Bäume
  levels/            ein Level je Datei, trägt sich selbst in LEVELS ein
  beamer.js          Gruppenabend-Modus
  main.js            Start, Menüs, Levelaufruf
```

### Etwas ändern

- **Sitzordnung anpassen:** `FAHRZEUGE.lf.sitze` bzw. `.klf.sitze` in
  `src/three/vehicles.js`. `x` ist quer (+ = rechte Fahrzeugseite),
  `z` ist längs (− = vorne). `soll` ist die Funktion, die dort hingehört.
- **Antreteordnung anpassen:** `ANTRETEN.gruppe` in derselben Datei.
  Die Werte sind Fahrzeugkoordinaten in Metern: Das Fahrzeug steht im
  Ursprung längs der z-Achse, die Mannschaft rechts daneben (`x` wächst nach
  rechts, `z` nach hinten). `A_SPALTE` sind die vier Spalten (Ma/Me,
  Angriffs-, Wasser-, Schlauchtrupp), `A_VORN`/`A_HINTEN` die beiden Reihen,
  `A_VERSATZ` der seitliche Versatz der hinteren Reihe.
  Dieselbe Ordnung gilt in den Aufgaben 4, 6, 7 und 8 — sie stellen ihre
  Mannschaft alle über `antretenStellen(einheit, ursprung, drehung, erzeuge)`
  auf, damit sie überall gleich aussieht.
- **Merksprüche:** `MERKSPRUECHE` in derselben Datei.
- **Quizfragen ergänzen:** `QUIZ` in `src/data/fwdv3.js`.
- **Neues Level:** Datei in `src/levels/` anlegen, `LEVELS.push({...})`.
  Der Dateiname bestimmt die Reihenfolge (alphabetisch).
- **Kommandos:** `KOMMANDOS` in `src/data/fwdv3.js`. Dort steht auch, wo wir
  bewusst vom Wortlaut der Vorschrift abweichen.
- **Boss-Sperre:** `BOSS_STERNE` in `src/main.js`.
- **Rückweg zur Startseite:** `LERNWERKSTATT` in `src/main.js` – der Knopf
  steht oben links im Levelmenü, wo sonst „Zurück" steht.
- **Aussprache:** `Audio3.ORDNUNG` und `Audio3.FUGEN` in `src/audio.js`.
- **Memory-Karten:** `MEMORY_PAARE` in `src/data/fwdv3.js`. Jeder Text darf
  nur einmal vorkommen, sonst wird geraten statt gelernt.
- **Verteiler:** `VERTEILER_ABGANG` in `src/three/fx.js`. Links und rechts
  sind aus der Sicht dessen gemeint, der hinter dem Verteiler steht und zum
  Brand schaut.
- **Schlauchreserve:** `baueSchlauchreserve(wellen, art)` in `src/three/fx.js`
  legt Serpentinen. Die Leitung davor endet genau dort, wo die Buchten
  anfangen (`schlauchreserveLaenge()`) – die Reserve ist die letzte
  Schlauchlänge, nicht ein Extra obendrauf.

### Bildausschnitt

Kameras werden nicht mehr von Hand gesetzt, sondern eingepasst:
`motivEinpassen(punkte, panel, opt)` und `motivWache(...)` in `src/ui.js`
richten die Kamera so aus, dass die übergebenen Weltpunkte vollständig in der
freien Fläche neben bzw. über dem Bedienfeld liegen – vom Handy bis zum
Beamer. `opt.hoch` / `opt.weit` bestimmen den Blickwinkel (steil für die
Vogelperspektive, flach für die Einsatzstelle).

## Quellen

- `referenz/FwDV3-2008-volltext.txt` — Volltext der Dienstvorschrift
  (Hessische Landesfeuerwehrschule, Ausgabe 2008)
- `referenz/merkblatt-loeschangriff.txt` — Merkblatt Löschangriff
- `referenz/bilder/` — Sitzordnung LF, Sitzordnung KLF, Antreteordnung
  (eigene Unterlagen)

Alle Zitate im Spiel sind wörtlich aus der FwDV 3 übernommen und als solche
gekennzeichnet.
