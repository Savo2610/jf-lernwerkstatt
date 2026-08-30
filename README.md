# Lernwerkstatt der Jugendfeuerwehr Harheim

Startseite und 3D-Lernspiele für die Jugendfeuerwehr, 10 bis 17 Jahre. Alles
läuft ohne Anmeldung im Browser, ohne Server, ohne Abhängigkeiten zur Laufzeit.

| Adresse | Was | Quelle |
|---|---|---|
| `jf.veerka.mp/` | Startseite, 2D-SVG, Scrollen fährt ein Feuerwehrauto | `hub/src/` |
| `jf.veerka.mp/fwdv3/` | **Einsatzbereit** — FwDV 3, Ausgabe Februar 2008 | `src/` |
| `jf.veerka.mp/brennen-loeschen/` | **Brennen & Löschen** — Brandlehre | `brennen/src/` |

Die alte Adresse `fwdv3.veerka.mp` leitet auf `/fwdv3/` um.

**Live:** Startseite https://jf.veerka.mp · Einsatzbereit
https://jf.veerka.mp/fwdv3/ · Brennen & Löschen
https://jf.veerka.mp/brennen-loeschen/

## Wo was steht

| Datei | Wofür |
|---|---|
| [CLAUDE.md](CLAUDE.md) | Einstieg für Agenten: Hausordnung, Fallen, Kurzbefehle |
| [docs/deploy.md](docs/deploy.md) | Autodeploy, Worker, Routen, DNS |
| [docs/pruefen.md](docs/pruefen.md) | Konsolen-Haken, Direktsprünge, was vor dem Veröffentlichen dran ist |
| [docs/verwandte-projekte.md](docs/verwandte-projekte.md) | die Absprache mit veerka.mp (`?einfahrt=1`) |
| [LIZENZ.md](LIZENZ.md) | CC BY 4.0, und was nicht darunter fällt |
| dieses README | das ausführliche Handbuch — Inhalte, Aufbau, Stellschrauben |

---

## Einsatzbereit (FwDV 3)

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

## Brennen & Löschen

Die Brandlehre — warum etwas brennt und warum es aufhört. Anders als
„Einsatzbereit" spielt sie am hellen Tag auf einem Übungsplatz: heller Himmel,
Beton, ein Feuer als Hauptdarsteller. Fortschritt, XP, Ränge und Abzeichen
funktionieren genau wie drüben, alles andere ist eigen.

**Erste Halbzeit — warum es brennt.**

| # | Level | Inhalt |
|---|-------|--------|
| 1 | Das Verbrennungsdreieck | Drei Voraussetzungen auf die Ecken, eine in die Mitte. Eine wegnehmen und zusehen, wie das Feuer zusammenfällt. Danach Voraussetzung und Erscheinung auseinanderhalten |
| 2 | Was brennt denn da? | Acht Brandgüter in die Tonnen A bis F sortieren, die Falle mit der Klasse E, dann Flamme oder Glut je Klasse |
| 3 | Luft zum Brennen | Die Luft aufteilen (78/21/1), unter einer Glasglocke am Sauerstoff drehen, und viermal dasselbe Holz um die Wette abbrennen lassen |
| 4 | Ab wann brennt es? | Den Explosionsbereich abfahren, Flammpunkt, Brennpunkt und Zündtemperatur an drei Versuchen auseinanderhalten, Zündquellen von Nicht-Zündquellen trennen |

**Zweite Halbzeit — warum es aufhört.**

| # | Level | Inhalt |
|---|-------|--------|
| 5 | Wie löscht man? | Fünf Löschverfahren auf ihre fünf Angriffspunkte im Dreieck ziehen. Danach zweimal Wasser — und trotzdem zwei verschiedene Verfahren |
| 6 | Womit löschen wir? | Fünf Löschmittel ihrer Hauptlöschwirkung zuordnen, fünf Brände löschen (und sehen, was bei der falschen Wahl passiert), Vollstrahl gegen Sprühstrahl |
| 7 | Der Feuerlöscher | Von welcher Seite (Wind), mit welcher Technik (Stöße, ein Zug, von oben nach unten), und was nach dem Löschen kommt. Der Vorratsbalken läuft die ganze Zeit mit |
| 8 | Der Ernstfall (Boss) | Vier Einsätze, je drei Entscheidungen: Was brennt da? Was muss weg? Womit? Die Auflösung kommt erst, wenn alle drei stehen |

Aufgabe 7 bringt alle sieben Regeln aus Kapitel 6.8 unter, aber keine als
Merksatz — jede steht in einer Lage, in der man sie braucht. Und der Boss fragt
nichts Neues ab: Er verlangt nur, dass man die Kette in der richtigen
Reihenfolge durchgeht, und zwar ohne Zwischenrufe.

Der rote Faden ist das **Verbrennungsdreieck**: brennbarer Stoff, Sauerstoff
und Zündenergie an den Ecken, das richtige Mengenverhältnis in der Mitte.
Aufgabe 1 stellt es auf, und jede weitere Aufgabe nimmt sich genau eine dieser
Voraussetzungen vor — Aufgabe 2 den brennbaren Stoff, Aufgabe 3 den Sauerstoff,
Aufgabe 4 Mischung und Zündenergie. In der zweiten Halbzeit nimmt jedes
Löschverfahren genau eine davon wieder weg — und zwar an einer eigenen Stelle:

| Verfahren | greift an | in Aufgabe 5 |
|---|---|---|
| Abkühlen | Zündenergie | die rechte Säule |
| Ersticken durch Verdünnen | Sauerstoff | die hintere Säule |
| Ersticken durch Abmagern | brennbarer Stoff | die linke Säule |
| Ersticken durch Trennen | beide zugleich | das Feld in der Mitte |
| Hemmen der Reaktion | gar nichts davon | die Flamme selbst |

Das ist nicht ausgedacht: Der Truppführer-Leitfaden nennt zu jeder Spielart des
Erstickens den „Einflussfaktor", und genau der steht in `LOESCHVERFAHREN[].nimmt`
(`brennen/src/data/brandlehre.js`) — bei „Hemmen" als `'reaktion'`, weil es als
einziges Verfahren keine der vier Voraussetzungen anrührt.

### Dreieck oder Viereck?

Beides, und das ist der Punkt. Die Literatur zeichnet ein **Dreieck** mit drei
Ecken und dem Mengenverhältnis in der Mitte; die Lernunterlage zählt **vier
Voraussetzungen**. Das Mengenverhältnis kann keine eigene Ecke haben, weil es
kein Stoff ist, sondern das Verhältnis *zwischen* zweien der Ecken.

Die Bühne in Aufgabe 1 zeigt genau das — drei Säulen, ein Feld in der Mitte —
und eine eigene Runde benennt den Unterschied ausdrücklich. Wer nur „drei"
sagt, lässt das Mengenverhältnis ganz weg, und daran hängt später das halbe
Löschen: Verdünnen, Abmagern und Trennen ändern nichts anderes als das
Mengenverhältnis.

Die zweite Stelle, an der das Spiel bewusst gegen den Alltagssprachgebrauch
steht: Eine **Brandklasse E gibt es nicht**. Sie wurde gestrichen; Brände in
elektrischen Anlagen sind Brände dessen, was dort brennt. Auch das bekommt in
Aufgabe 2 eine eigene Runde.

Beides steht so in den Unterlagen der Hessischen Landesfeuerwehrschule, siehe
[Quellen](#quellen).

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

Am anderen Ende steht die **Baustelle**: eine Station ohne Thema, mit Bauzaun,
Kran und einer Tafel „Thema 3 — ?". Ihre Karte hat zwei Knöpfe, „Wird gerade
gebaut" und „Hilf mit beim Bauen"; der zweite führt ins GitHub-Repo. Sie ist
absichtlich die letzte Station — die Absperrung am Straßenende setzt `welt.js`
automatisch dahinter, sie wandert also mit, sobald ein Thema dazukommt. Wird
die Baustelle irgendwann ein echtes Thema, zieht sie eins nach rechts weiter.

In der Liste „Alle Themen" im Fuß taucht sie **nicht** auf (`fuss: false` in
`hub/src/themen.js`): dort sollen die Themen stehen, die es gibt. Der Weg ins
Repo steht ohnehin darunter im Kleingedruckten.

Hin und zurück ist eine Fahrt. Wer auf **Losfahren** drückt, fährt auch los:
die Bedienelemente blenden aus,
die Welt rauscht vorbei, das Fahrzeug zieht rechts aus dem Bild, und das Bild
schließt sich auf den Grundton, mit dem das Ziel aufmacht — 900 ms, in
denen im Hintergrund schon das Spiel geladen wird (`prefetch`, ausgelöst schon
beim Zeigen auf den Knopf). Dauer und Kurve stehen als `AUSRUECKEN_MS` und
`losfahren()` in `hub/src/main.js`. Bei „Bewegung reduzieren" wird schlicht
verlinkt, und beim Zurück-Knopf setzt `pageshow` alles zurück — sonst käme die
Seite mit noch dunkler Blende aus dem Browsercache.

**Der Grundton gehört zum Thema, nicht zur Startseite.** „Einsatzbereit"
beginnt in der Nacht, „Brennen & Löschen" am hellen Vormittag — die Blende
fährt jeweils auf den richtigen Ton zu, mit dem Zeichen und dem Namen des
Ziels darauf. Was sie zeigt, steht als `uebergang: { grund, schrift, zeichen }`
in `hub/src/themen.js`; `blendeEinstellen()` in `hub/src/main.js` setzt es beim
Klick ein. Ein neues Thema braucht also keine Zeile im Stil und keine im
`body.html`.

Umgekehrt genauso: der Knopf oben links im Levelmenü des Spiels
(`App.zurLernwerkstatt()`) zieht das Bild zu und ruft
`jf.veerka.mp/?einfahrt=1` auf. Die Startseite beginnt dann dunkel und lässt
das Fahrzeug vor der Wache ausrollen (`einfahrtStarten()`); den Parameter nimmt
sie danach per `replaceState` wieder aus der Adresszeile.

Für den Rückweg gilt die Regel andersherum: **Die Startseite fragt nicht,
woher jemand kommt** — ihre Einfahrt beginnt immer im selben Nachtton. Ein
helles Spiel muss deshalb auf diesen Ton zufahren und nicht auf seinen eigenen,
sonst blitzt beim Ankommen die halbe Seite auf. Dafür gibt es `--heimfarbe`
(gesetzt in `brennen/src/farben.css`, benutzt von `.heimfahrt` in
`gemeinsam/stil.css`).

Dieselbe Einfahrt spielt auch, wer von **veerka.mp** kommt: dort steht in der
verschneiten 3D-Szene ein Feuerwehrauto, und das Schild daran führt hierher.
Es fährt dabei wirklich los und übergibt mit `?einfahrt=1` — die Startseite
kann nicht unterscheiden, aus welcher Richtung jemand ankommt, und muss es
auch nicht. Der Code dafür liegt drüben in `public/scene.js` des Repos
`Savo2610/Julians-Website`; die Absprache zwischen beiden Repos steht in
[docs/verwandte-projekte.md](docs/verwandte-projekte.md).

Nach draußen führen drei Wege, alle bewusst am Rand:

- der **Schaukasten am Feuerwehrhaus**, gleich hinter dem Schlauchturm — ein
  kleines Schild mit dem Instagram-Zeichen und „Team Zukunft". Man fährt auf
  dem Weg zum ersten Thema daran vorbei; wer ihn anklickt, kommt zum Kanal.
  Warum er `tabindex="-1"` trägt, steht im Kommentar über `kulisseWache()`.
- derselbe Link noch einmal als **Fließtext im Fuß**, zwischen den Themen und
  dem Kleingedruckten — das ist der Weg für Tastatur und Vorleseprogramme.
- an der **Baustelle** ein zweiter Knopf „Hilf mit beim Bauen", der ins
  GitHub-Repo führt — und dieselbe Adresse noch einmal in der Lizenzzeile
  ganz unten.

In den Karten steht sonst nichts davon — die sind für Lerninhalte da.

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

Brennen & Löschen fragt nur nach dem Namen: dort steht keine Figur im Bild,
sondern ein Feuer — eine Helmfarbe wäre nirgends zu sehen.

## Zwei Modi

Beide Spiele haben beide Modi, und beide funktionieren gleich.

- **Alleine üben** — Fortschritt, XP, sieben Ränge, Abzeichen (elf bei
  Einsatzbereit, sechzehn bei Brennen & Löschen). Speichert lokal im Browser
  (`localStorage`), nichts geht nach außen. Der Boss-Level bleibt verschlossen,
  bis in den Übungen sieben von 21 möglichen Sternen zusammen sind. Wer in
  allen acht Aufgaben drei Sterne hat (24 von 24), bekommt das Meisterabzeichen.
- **Gruppenabend am Beamer** — 42 % größere Schrift, Teamwertung, Moderations-
  knöpfe. Zwei Mannschaften treten gegeneinander an. Der Moderator tippt die
  gerufene Antwort an, bei einem Treffer bekommt das Team die Punkte
  automatisch, bei einem Fehlgriff darf das andere Team nachziehen und sie
  abstauben. Von Hand nachjustieren geht trotzdem. Im Beamer-Modus ist der
  Boss-Level nicht gesperrt.

Die Spielarten unterscheiden sich:

| | Einsatzbereit | Brennen & Löschen |
|---|---|---|
| Hauptteil | Quiz-Duell, acht Fragen | **Feuerwand**: vier Kategorien mal vier Werte, sechzehn brennende Felder. Das Team, das dran ist, sucht sich aus, was es löschen will |
| Schnell | Blitzrunde, zehn Fragen | Blitzrunde, zehn Fragen |
| Dazu | Memory (Begriff und Erklärung) | — |
| Und | Hot Seat, Punkte von Hand | Hot Seat, Punkte von Hand |

Die Feuerwand ist jeden Abend dieselbe. Das ist Absicht: Wer die Fragen schon
kennt, kann sie beantworten, und genau darum geht es. Ein Gruppenabend ist
keine Prüfung.

### XP nur einmal

XP gibt es je Aufgabe nur bis zur vollen Punktzahl. Wiederholt man eine
Aufgabe und wird besser, gibt es die Differenz als Nachschlag; wiederholt man
nur seine Bestleistung, bleibt eine kleine Anerkennung von zehn Prozent.
Damit lohnt es sich nicht, Aufgabe 1 endlos zu wiederholen. Die Logik steht in
`State.xpFuerLevel()` in `gemeinsam/state.js`.

## Technik

- Three.js (r169), vollständig in die HTML-Datei eingebettet
- Kein Build-Tooling nötig zum Ausführen, keine Abhängigkeiten zur Laufzeit
- Einziger externer Verweis: Google Fonts (Archivo Black + Outfit)
- Kommandos werden über die eingebaute Sprachausgabe des Browsers gesprochen
  (`speechSynthesis`, deutsche Stimme) — keine Audiodateien.
  `Audio3.sprechbar()` in `gemeinsam/audio.js` biegt vorher die Aussprache gerade:
  Ordnungszahlen werden ausgeschrieben und im richtigen Fall gebeugt
  („mit 1. Rohr" → „mit erstem Rohr"), und an Wortfugen mit s+t setzt es einen
  Bindestrich, damit aus „Angriffstrupp" nicht „Angriffschtrupp" wird. Der
  angezeigte Text bleibt davon unberührt — nur das Gesprochene ändert sich.
- Alle Klänge (Martinshorn, Wasser, Feuer, Fanfaren) sind per WebAudio erzeugt

## Entwickeln

```bash
npm run build       # Startseite und beide Spiele, alles nach hub/dist/
npm run dev         # alles wie im Netz, http://localhost:8413
npm run dev:spiel   # nur Einsatzbereit, http://localhost:8412
npm run dev:brennen # nur Brennen & Löschen, http://localhost:8414
```

`npm run build` ist `node hub/build.mjs`; das ruft `build.mjs` im Hauptordner
und `brennen/build.mjs` auf und legt deren Ergebnisse als
`hub/dist/fwdv3/index.html` und `hub/dist/brennen-loeschen/index.html` neben
die Startseite. **Ein Befehl baut alles** — so kann man nicht versehentlich
einen alten Stand eines Spiels veröffentlichen. Einzeln bauen geht mit
`node build.mjs` bzw. `node brennen/build.mjs`; die Reihenfolge der Quelldateien
steht jeweils dort.

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

Ein Befehl für alles: `hub/build.mjs` baut beide Spiele mit und legt sie neben
die Startseite, veröffentlicht wird alles zusammen. Der Umweg ist Absicht — so
kann man nicht versehentlich einen alten Stand eines Spiels mit hochladen. Was von
Hand hochgeladen wurde, überschreibt der nächste Push aus `main` allerdings
wieder — also hinterher committen.

Ein einziger Cloudflare Worker (`hub/wrangler.jsonc`, Code in
`hub/src/worker.js`) bedient drei Dinge:

| Adresse | Ergebnis |
|---|---|
| `jf.veerka.mp/` | Startseite |
| `jf.veerka.mp/fwdv3/` | Einsatzbereit |
| `jf.veerka.mp/brennen-loeschen/` | Brennen & Löschen |
| `fwdv3.veerka.mp/*` | 301 auf `jf.veerka.mp/fwdv3/`, Query bleibt erhalten |

Ein Spielpfad ohne abschließenden Schrägstrich wird auf die Fassung mit
Schrägstrich umgeleitet (`SPIELE` in `hub/src/worker.js`) — sonst landet er in
der Ersatzseite.

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

- `?level=<id>` springt direkt in ein Level. Bei Einsatzbereit: `einheit`,
  `werkstatt`, `staerke`, `sitzordnung`, `aufgaben`, `befehl`, `uebung`,
  `loeschangriff` – umgeht auch die Sternsperre des Boss-Levels, praktisch für
  den Gruppenabend. Bei Brennen & Löschen: `dreieck`, `brandklassen`,
  `sauerstoff`, `zuendung`, `loeschverfahren`, `loeschmittel`,
  `feuerloescher`, `ernstfall` – auch hier umgeht der Direktsprung die
  Sternsperre des Boss-Levels
- `?modus=beamer` startet den Beamer-Modus – gibt es in beiden Spielen
- `window.__eb` bzw. `window.__bl` gibt im Browser Zugriff auf Stage, State, UI
  und die Fehlerliste des jeweiligen Spiels

### Aufbau

```
hub/                 Startseite + Auslieferung von allem (jf.veerka.mp)
  build.mjs          baut Startseite und beide Spiele nach hub/dist/
  wrangler.jsonc     der eine Worker für alle Adressen
  src/themen.js      die Lernseiten – hier kommt ein neues Thema rein
  src/szene.js       Fahrzeuge, Gebäude, Bäume als SVG
  src/welt.js        setzt die Strecke aus den Themen zusammen
  src/main.js        Scrollposition -> Fahrt, Karten, Streckenplan
  src/worker.js      Umleitung der alten Adresse, sonst nur Dateien
gemeinsam/           was beide Spiele teilen – siehe unten
  bauen.mjs          der Bauvorgang: Three einbetten, alles zu einer Datei
  util.js            Helfer + Levelregister
  state.js           Spielstand, Ränge, Teams
  audio.js           WebAudio-Klänge + Sprachausgabe
  stage.js           Renderer, Kamera, Bildeinpassung, Bewegungen, Laufwege
  ui.js              Bildschirme, Ziehen & Ablegen, Hotspots, Seitenlayout
  stil.css           Designsystem, ganz über Farbvariablen
src/                 Einsatzbereit (jf.veerka.mp/fwdv3/)
  spiel.js           Name, Speicherschlüssel, Lichtstimmung
  farben.css         die Nachtpalette
  data/fwdv3.js      alle Inhalte (Einheiten, Aufgaben, Befehl, Quiz, Lagen)
  body.html          DOM-Gerüst
  three/
    figures.js       Feuerwehrfiguren
    vehicles.js      KLF und LF inklusive Sitz- und Antreteordnung
    fx.js            Feuer, Wasser, Schläuche, Verteiler, Hydrant
    scenery.js       Boden, Straße, Häuser, Laternen, Bäume
  levels/            ein Level je Datei, trägt sich selbst in LEVELS ein
  beamer.js          Gruppenabend-Modus
  main.js            Start, Menüs, Levelaufruf
brennen/             Brennen & Löschen (jf.veerka.mp/brennen-loeschen/)
  build.mjs          eigener Bauvorgang, ruft gemeinsam/bauen.mjs
  server.mjs         Vorschau auf Port 8414
  src/spiel.js       Name, Speicherschlüssel, Lichtstimmung (heller Tag)
  src/farben.css     die helle Palette
  src/stil-extra.css nur was es hier gibt: Karten, Sockel, Körbe, Weltmarken
  src/data/brandlehre.js   alle Inhalte (Dreieck, Brandklassen, Löschmittel …)
  src/welt/feuer.js  Flamme, Glut, Rauch, Dampf, Löschstrahl
  src/welt/platz.js  Übungsplatz, Tonnen, Brandgut, Feuerschale, Windfahne
  src/welt/labor.js  Versuchsgerät: Glasglocke, Gaskasten, Heizplatte, Anzeigesäule
  src/welt/loeschen.js  Wanne, Schaumdecke, Feuerlöscher, Gasfackel
  src/bausteine.js   Unterbau (Rückmeldung im Fluss) und Regler
  src/levels/        ein Level je Datei, trägt sich selbst in LEVELS ein
  src/beamer.js      Gruppenabend-Modus mit der Feuerwand
  src/main.js        Start, Menüs, Levelaufruf
```

### Die gemeinsame Basis (`gemeinsam/`)

Beide Spiele benutzen dieselbe Bühne, denselben Spielstand, dieselben
Bildschirme. Was ein Spiel für sich behält, sind Inhalte, Welt, Level — und
zwei kleine Dateien, über die es die Basis einstellt:

- **`src/spiel.js`** definiert `SPIEL`: Kennung, Name, Speicherschlüssel,
  Name des Meister-Abzeichens und `licht` (Himmelsverlauf, Nebel, Haupt- und
  Himmelslicht, Belichtung). `gemeinsam/stage.js` baut daraus die Stimmung —
  deshalb ist die eine Seite Nacht und die andere heller Tag, ohne dass an der
  Bühne etwas doppelt vorliegt.
- **`src/farben.css`** setzt die Farbvariablen. `gemeinsam/stil.css` benutzt
  ausschließlich Variablen, keine festen Farben; eine neue Palette ist damit
  eine Datei und kein Umbau.

Die Speicherschlüssel sind verschieden (`fwdv3-einsatzbereit-v1` gegen
`jf-brennen-loeschen-v1`), obwohl beide auf einer Domain liegen und sich den
Browserspeicher teilen — jedes Spiel hat seinen eigenen Fortschritt. Der
gemeinsame Speicher ist der Grund, warum das später auch anders gehen kann.

Wer an `gemeinsam/` etwas ändert, ändert **beide** Spiele. Danach beide
ansehen, nicht nur eines.

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
- **Aussprache:** `Audio3.ORDNUNG` und `Audio3.FUGEN` in `gemeinsam/audio.js`.
- **Memory-Karten:** `MEMORY_PAARE` in `src/data/fwdv3.js`. Jeder Text darf
  nur einmal vorkommen, sonst wird geraten statt gelernt.
- **Verteiler:** `VERTEILER_ABGANG` in `src/three/fx.js`. Links und rechts
  sind aus der Sicht dessen gemeint, der hinter dem Verteiler steht und zum
  Brand schaut.
- **Schlauchreserve:** `baueSchlauchreserve(wellen, art)` in `src/three/fx.js`
  legt Serpentinen. Die Leitung davor endet genau dort, wo die Buchten
  anfangen (`schlauchreserveLaenge()`) – die Reserve ist die letzte
  Schlauchlänge, nicht ein Extra obendrauf.

In **Brennen & Löschen**:

- **Brandlehre-Inhalte:** `brennen/src/data/brandlehre.js`. Dort steht alles:
  die vier `VORAUSSETZUNGEN`, die `ERSCHEINUNGEN`, die `BRANDKLASSEN`, die
  `LOESCHVERFAHREN` mit ihrem Verweis auf die Voraussetzung, die sie wegnehmen,
  die `LOESCHMITTEL`, `TEMPERATUREN`, `LOESCHERREGELN`, Ränge und Abzeichen.
  Änderungen dort ändern, was Kinder lernen – gegen `referenz/brennen-loeschen/`
  prüfen, nicht raten.
- **Lichtstimmung:** `SPIEL.licht` in `brennen/src/spiel.js`.
- **Feuer:** `baueFeuer(opt)` in `brennen/src/welt/feuer.js`. Die Flamme sind
  vier ineinandergesteckte Kegel; jeder innere ist **höher** als der äußere,
  sonst verdeckt die deckende Hülle ihn vollständig. `feuerAnteileSetzen(f,
  flamme, glut)` stellt Flammen- gegen Glutbrand ein – das braucht Level 2.
- **Brandgut:** `baueBrandgut(art)` in `brennen/src/welt/platz.js`.
- **Löschgerät:** `brennen/src/welt/loeschen.js` — Wanne mit brennender
  Flüssigkeit, Schaumdecke (`schaumFuellen`), tragbarer Feuerlöscher, Gasfackel
  mit Handrad (`fackelAbsperren`). Der Wasserstrahl selbst steht bei der Flamme
  in `feuer.js`: `baueStrahl({ fein, farbe, weite, hoch })`, `strahlAn(s, 0..1)`.
- **Rückmeldung, die nichts verdeckt:** `unterbau(...)` in
  `brennen/src/bausteine.js`. Auf dieser Seite stehen die Antwortknöpfe unten am
  Bildrand; ein `UI.toast` liegt dann genau auf ihnen, und man muss vier
  Sekunden warten, bis man weitertippen kann. `unterbau` setzt die Rückmeldung
  stattdessen in den Fluss darüber und hält ihren Platz frei. Wichtig: dem
  `motivWache` den Unterbau übergeben, nicht das Antwortfeld darin.
- **Regler:** `regler(opt)` in `brennen/src/bausteine.js`, innen ein
  `input type=range` – damit funktionieren Finger, Maus und Pfeiltasten ohne
  eigenes Zutun. `zonen` färbt die Schiene ein.
- **Neues Level:** Datei in `brennen/src/levels/` anlegen, `LEVELS.push({...})`,
  Dateiname bestimmt die Reihenfolge.
- **Boss-Einsätze:** `EINSAETZE` in `brennen/src/data/brandlehre.js`. Jeder
  Einsatz nennt Brandklasse, Löschverfahren und Löschmittel; `mittelAuch` und
  `verfahrenAuch` sind fachlich ebenfalls zulässige Antworten und zählen als
  richtig.
- **Feuerwand:** `KATEGORIEN` und `QUIZ` in derselben Datei. Auf der Wand
  landet, was `kat` und `wert` (100 bis 400) trägt – vier je Kategorie. Fragen
  ohne `kat` kommen nur in der Blitzrunde vor.
- **Beamer-Modus:** `brennen/src/beamer.js`, Einstieg über `?modus=beamer`
  oder den Knopf im Profil.

### Bildausschnitt

Kameras werden nicht mehr von Hand gesetzt, sondern eingepasst:
`motivEinpassen(punkte, panel, opt)` und `motivWache(...)` in `gemeinsam/ui.js`
richten die Kamera so aus, dass die übergebenen Weltpunkte vollständig in der
freien Fläche neben bzw. über dem Bedienfeld liegen – vom Handy bis zum
Beamer. `opt.hoch` / `opt.weit` bestimmen den Blickwinkel (steil für die
Vogelperspektive, flach für die Einsatzstelle). `opt.obenNode` schiebt die
Oberkante der freien Fläche unter ein Element, das über der Bühne liegt
(Auftragskarte); `opt.panelUnten` erzwingt das Bedienfeld unter der Bühne,
auch auf breiten Schirmen.

**Die Falle dabei:** eingepasst werden nicht die übergebenen Punkte, sondern
die acht Ecken des Quaders um sie herum. Ein einzelner hoher Punkt in der Mitte
– die Flammenspitze über einer flachen Grundfläche – zieht deshalb vier Ecken
hoch über Stellen, an denen gar nichts steht. Der Quader wird fast doppelt so
hoch wie das Motiv, und die Kamera fährt entsprechend weit weg. Punkte also
knapp fassen, notfalls die Spitze weglassen und über `rand` Luft geben.

Wo ohnehin kein Bildstreifen frei bleibt – Auftragskarte oben, Bedienfeld
unten, Karten dazwischen –, lohnt das Einpassen nicht: dann lieber ein kleiner
`anteil` ohne Panel-Bindung, und die Bühne ist ehrlich Kulisse hinter den
Karten.

## Quellen

**Einsatzbereit:**

- `referenz/FwDV3-2008-volltext.txt` — Volltext der Dienstvorschrift
  (Hessische Landesfeuerwehrschule, Ausgabe 2008)
- `referenz/merkblatt-loeschangriff.txt` — Merkblatt Löschangriff
- `referenz/bilder/` — Sitzordnung LF, Sitzordnung KLF, Antreteordnung
  (eigene Unterlagen)

Alle Zitate im Spiel sind wörtlich aus der FwDV 3 übernommen und als solche
gekennzeichnet. Woher die Inhalte stammen, steht im Spiel selbst — unten im
Levelmenü — und nicht auf der Startseite: gelernt wird im Spiel, also gehört
die Quelle dorthin.

**Brennen & Löschen:**

- `referenz/brennen-loeschen/HLFS-Truppmann1-Brennen-und-Loeschen-2012.txt` —
  Hessische Landesfeuerwehrschule, Truppmannausbildung Teil 1, Kapitel 2.3,
  Ausgabe 10/2012
- `referenz/brennen-loeschen/HLFS-Truppfuehrer-F-II-Brennen-und-Loeschen-2010.txt` —
  dieselbe Schule, Lehrgang Truppführer (F II), Kapitel 2.3, Ausgabe 02/2010
- `referenz/brennen-loeschen/QUELLEN.md` — was woher stammt und warum diese
  Quellen. Die HLFS ist die für Harheim zuständige Landesfeuerwehrschule;
  die Brandklassen folgen DIN EN 2.

Zitate sind mit „Lernunterlage · " gekennzeichnet.

## Lizenz

Was hier selbst gebaut wurde, steht unter **CC BY 4.0** ([LICENSE](LICENSE)).
Three.js in `vendor/`, der Volltext der FwDV 3 und die Unterlagen der Wehr in
`referenz/` fallen nicht darunter — Einzelheiten in [LIZENZ.md](LIZENZ.md).
