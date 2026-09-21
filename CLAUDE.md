# Hinweise für Agenten

Kurzfassung für alle, die hier zum ersten Mal arbeiten. Das ausführliche
Handbuch ist [README.md](README.md) — lies dort mindestens „Aufbau" und
„Etwas ändern", bevor du etwas änderst.

## Was das ist

Vier Seiten, ein Worker, eine Domain:

| Adresse | Was | Quelle |
|---|---|---|
| `jf.veerka.mp/` | Startseite („Lernwerkstatt"), 2D-SVG, Scrollen fährt ein Feuerwehrauto | `hub/src/` |
| `jf.veerka.mp/fwdv3/` | das Spiel „Einsatzbereit" (FwDV 3), 3D mit Three.js | `src/` |
| `jf.veerka.mp/brennen-loeschen/` | das Spiel „Brennen & Löschen" (Brandlehre), 3D | `brennen/src/` |
| `jf.veerka.mp/absichern/` | „Erst sichern!", Verkehrsabsicherung nach FwDV 1, 2D-Draufsicht | `absichern/src/` |
| `jf.veerka.mp/loeschlos/` | „Löschlos", Truppauslosung für den Gruppenabend, PWA | `loeschlos/` |
| `jf.veerka.mp/nachweis/` | Prüfseite für den Jugendwart, nirgends verlinkt | `hub/src/nachweis.*` |

Alle drei Lernseiten stehen auf derselben Basis in `gemeinsam/`: Spielstand,
Bildschirme, Klänge, Designsystem. Eigen ist jeder nur, was sie zeigt — plus
`spiel.js` (Name, Speicher) und `farben.css` (Palette).
**Wer `gemeinsam/` anfasst, ändert alle drei und muss alle drei ansehen.**

Die beiden 3D-Spiele teilen sich zusätzlich die Bühne (`gemeinsam/stage.js`,
Three.js), haben acht Aufgaben und einen Beamer-Modus für den Gruppenabend
(`?modus=beamer`) — „Einsatzbereit" mit Quiz-Duell und Memory, „Brennen &
Löschen" mit der Feuerwand.

**„Erst sichern!" fällt bewusst aus diesem Muster.** Es schaut von oben auf
eine Straße, zeichnet SVG statt 3D und bringt deshalb seine eigene Bühne mit
(`absichern/src/buehne.js`); Three.js ist dort gar nicht im Bundle
(`three: false` in seinem `build.mjs`). Es hat fünf Aufgaben statt acht und
keinen Beamer-Modus: Es ist die Vorbereitung auf die **Jugendflamme Stufe 2**,
kein Programm für einen Gruppenabend.

Zielgruppe ist die **Jugendfeuerwehr Harheim**, 10 bis 17 Jahre. Inhaltliche
Grundlage für „Einsatzbereit" ist die FwDV 3 von 2008; Sitz- und
Antreteordnung stammen aus den Unterlagen der Wehr und weichen bewusst an
Stellen von der Vorschrift ab. „Brennen & Löschen" folgt den Unterlagen der
Hessischen Landesfeuerwehrschule (`referenz/brennen-loeschen/`), „Erst
sichern!" der FwDV 1 von 2006, Kapitel 19 (`referenz/verkehrsabsicherung/`).

## Hausordnung

Diese Regeln stecken überall im Bestand. Halte dich daran, sonst fällt dein
Code sofort auf.

- **Alles ist deutsch.** Bezeichner, Kommentare, Commit-Nachrichten, Oberfläche.
  `radWinkel`, nicht `wheelAngle`. Anführungszeichen sind `„…"`, niemals `“…”`.
- **Keine Abhängigkeiten.** Three.js liegt als Datei in `vendor/` und wird
  eingebettet. Kein npm-Paket zur Laufzeit, kein CDN, kein Framework. Der
  einzige externe Verweis ist Google Fonts.
- **Eine Datei am Ende.** Der Build fasst alles zu einer HTML-Datei zusammen.
  Nichts wird zur Laufzeit nachgeladen. **Ausnahme ist `loeschlos/`**: eine PWA
  braucht Service Worker und Manifest als eigene Dateien, der Ordner wird
  deshalb kopiert statt gebaut. Dort gilt auch die Deutschpflicht bei den
  Bezeichnern nicht — es ist zugewandert und hat seine eigene Historie.
- **Kommentare erklären das Warum.** Der Bestand ist voll von „das steht so da,
  weil sonst …". Halte das durch — die Fallen sind selten offensichtlich.
- **Kein Wegwerf-Code stehen lassen.** Keine `console.log`, keine auskommentierten
  Versuche. Die Debug-Haken (`window.__eb`, `window.__hub`, `szene`) sind
  Absicht und dokumentiert.
- **Bewegung ist optional.** `prefers-reduced-motion` hat überall einen echten
  Ersatzweg. Wer eine Animation ergänzt, ergänzt auch den.

## Bauen, ansehen, prüfen

```bash
npm run build         # baut alles nach hub/dist/ (alle drei Lernseiten inklusive)
npm run dev           # alles wie im Netz, Port 8413
npm run dev:spiel     # nur Einsatzbereit, Port 8412
npm run dev:brennen   # nur Brennen & Löschen, Port 8414
npm run dev:absichern # nur Erst sichern!, Port 8415
```

`npm run build` ruft `hub/build.mjs`, und das ruft `build.mjs` im Hauptordner,
`brennen/build.mjs` und `absichern/build.mjs`. **Ein Befehl baut alles** — so
kann man nicht versehentlich einen alten Stand einer Seite veröffentlichen. Die
rohen Seiten liegen dabei in `bau/`; `hub/dist/` ist das **einzige** `dist/` im
Repo und muss es bleiben (siehe Fallen).

Zum Prüfen im Browser: [docs/pruefen.md](docs/pruefen.md). Da stehen die
Konsolen-Haken, mit denen man ein Level oder eine Fahrt direkt anspringt,
statt sich durchzuklicken.

## Veröffentlichen

Push auf `main` reicht — Cloudflare Workers Builds baut und veröffentlicht.
Einzelheiten und der Weg von Hand: [docs/deploy.md](docs/deploy.md).

Was hier entsteht, steht unter **CC BY 4.0**. Was nicht — Three.js, der
Volltext der FwDV 3, die Unterlagen der Wehr — steht in [LIZENZ.md](LIZENZ.md).

## Was hier sonst noch dranhängt

Die Startseite ist über eine Übergangsanimation mit **veerka.mp** verbunden
(anderes Repo). Wer an `?einfahrt=1` oder an `LERNWERKSTATT` etwas ändert,
ändert einen Vertrag zwischen zwei Repos: [docs/verwandte-projekte.md](docs/verwandte-projekte.md).

## Wo die Fallen liegen

- **`src/data/fwdv3.js`, `brennen/src/data/brandlehre.js` und
  `absichern/src/data/absicherung.js` sind Inhalt, kein Code.** Änderungen dort ändern, was Kinder lernen. Prüfe gegen `referenz/`,
  rate nicht. Zwei Stellen, an denen das Spiel bewusst genauer ist als der
  Alltagssprachgebrauch:
  - **Dreieck mit vier Voraussetzungen.** Die drei Ecken sind brennbarer Stoff,
    Sauerstoff und Zündenergie; das richtige Mengenverhältnis steht in der
    Mitte, weil es kein Stoff ist, sondern das Verhältnis *zwischen* zwei
    Ecken. Beides zusammen sagen, nie nur eines – wer „drei" sagt, lässt das
    Mengenverhältnis weg, und daran hängt später das halbe Löschen.
  - Eine **Brandklasse E gibt es nicht**.
  Beide bekommen im Spiel eine eigene Runde. Wer die Texte ändert, muss diese
  Runden mitdenken.
- **`LOESCHVERFAHREN[].nimmt` ist der Angriffspunkt in Level 5** und stammt aus
  dem „Einflussfaktor" des Truppführer-Leitfadens, nicht aus der Anschauung:
  Verdünnen → Sauerstoff, Abmagern → brennbarer Stoff, Trennen → beide, also
  die Mitte. **Hemmen nimmt gar keine Voraussetzung weg** (`'reaktion'`) und
  gehört im Bild auf die Flamme. Wer daraus „nimmt die Wärme" macht, hat vier
  Verfahren statt fünf und den Wandeffekt verloren.
- **Abmagern ist kein Abkühlen**, auch wenn beide Male Wasser fließt und etwas
  kälter wird. Die Unterlage grenzt das ausdrücklich ab; Level 5 hat dafür eine
  eigene Runde mit zwei Vorführungen.
- **Die Antreteordnung ist an einer Stelle definiert** (`ANTRETEN.gruppe` in
  `src/three/vehicles.js`) und wird von vier Leveln benutzt. Änderst du sie,
  ändert sich alles Vier.
- **Löschlos wird kopiert, nicht gebaut** (`loeschlosUebernehmen` in
  `hub/build.mjs`). Kopiert wird alles ausser `README.md`, `LICENSE` und
  `tools/` — also andersherum als eine Liste der gewollten Dateien. Das ist
  Absicht: fehlt der PWA beim Installieren eine einzige Datei, die ihr Service
  Worker vorab einsammelt, bricht er ganz ab. Eine vergessene Zeile in einer
  Positivliste wäre dieser Fehler, und man sähe ihn erst im Netz.
- **Der lokale Server braucht Dateitypen** (`hub/server.mjs`). Die Spiele sind
  je eine HTML-Datei, Löschlos nicht: mit `text/html` für alles lädt der
  Browser das Stylesheet nicht und verweigert den Service Worker. Im Netz macht
  das der Worker richtig, lokal muss es dieser Server nachstellen.
- **Die Baustelle ist die letzte Station** (`hub/src/themen.js`). Die
  Absperrung am Straßenende setzt `welt.js` automatisch dahinter. Wer ein
  Thema anhängt, schiebt die Baustelle eins weiter nach rechts, statt sie zu
  überschreiben — sonst ist der Weg ins Repo weg.
- **Der Boss ist gesperrt** (`BOSS_STERNE`), bis sieben Sterne da sind. Zum
  Testen `?level=loeschangriff` bzw. `?level=ernstfall` benutzen, nicht die
  Sperre herausnehmen.
- **Die Blende beim Ausrücken gehört zum Thema, nicht zur Startseite.** Farbe,
  Schrift und Zeichen stehen als `uebergang` in `hub/src/themen.js` und werden
  von `blendeEinstellen()` gesetzt; im `body.html` steht nur noch eine leere
  Hülle. Ein neues Thema, das dort nichts einträgt, fährt in den Nachtton von
  „Einsatzbereit" — und das ist dann falsch, nicht kaputt.
- **Die Startseite fragt nicht, woher jemand kommt.** Ihre Einfahrt beginnt
  immer im selben Nachtton. Ein helles Spiel muss deshalb mit `--heimfarbe`
  (in seiner `farben.css`) auf genau diesen Ton zufahren und nicht auf sein
  eigenes `--bg`, sonst blitzt beim Ankommen die halbe Seite auf.
- **Was an einem 3D-Objekt klebt, darf sein eigenes `transform` nicht
  anfassen.** `HotSpots` schreibt es jedes Bild neu; ein `:hover` oder eine
  Animation mit `transform` reißt die Marke schlagartig in die Bildecke.
  Stattdessen Rahmen und Schatten animieren und nur Inneres skalieren.
- **`Stage.einpassen` passt den Quader ein, nicht die Punkte.** Ein hoher Punkt
  in der Mitte über flacher Grundfläche bläht ihn auf das Doppelte auf, und die
  Kamera fährt weit weg. Motivpunkte knapp fassen. Und wo Auftragskarte,
  Bedienfeld und Karten zusammen keinen Bildstreifen übrig lassen, gar nicht
  erst einpassen: kleiner `anteil` ohne Panel-Bindung, dann ist die Bühne
  ehrlich Kulisse.
- **Ein Panel in der Bildmitte deckt zu, wovon sein Text redet.** Erklärt der
  Text die Bühne („an den drei Ecken"), gehört er nach unten
  (`.panel.unterbau` plus `panelUnten: true`), nicht in die Mitte.
- **Kulisse hinter dem Motiv steht am Ende in der Bildmitte.** Was weiter weg
  ist, rückt perspektivisch zur Mitte — eine Reihe Feuerlöscher hinter dem
  Podest hat deshalb immer eine Flasche genau hinter der Flamme, und weder mehr
  Abstand noch eine Lücke in der Reihe hilft. Entweder die Reihe seitlich
  stellen oder sie ausblenden, sobald sie nichts mehr zu sagen hat (so macht es
  `brennen/src/levels/L6_loeschmittel.js`).
- **`baueFeuer` legt Höhe und Breite beim Bauen fest.** `userData.feuer.hoehe`
  nachträglich zu ändern steuert nur noch den Funkenflug – die Flammenkegel
  bleiben, wie sie sind. Wer eine Flamme umformen will, skaliert die Gruppe
  (`f.scale.set(breit, hoch, breit)`).
- **Wo man Karten zieht, muss alles gleichzeitig ins Bild passen.** Scrollen
  ist dort keine Rettung: Was unter dem Bildrand liegt, kann man nicht
  anfassen, um es nach oben zu ziehen. Aufgabe 6 Runde 1 war deshalb am Handy
  eine Sackgasse — vier Körbe untereinander, und die Kartenleiste stand außer
  Reichweite. Im Hochformat also alles zusammenstreichen, was nicht die
  Aufgabe ist (`.korb > small` verschwindet dort ganz), und `scroll: true`
  nur als Netz für große Textskalierung.
- **Antwortmöglichkeiten gleich lang halten.** Wer als einzige Antwort seine
  Begründung mitbringt, wird an der Länge erkannt und nicht gewusst. Die
  Begründung gehört in die Auflösung (`e` bzw. `erklaerung`), nicht in die
  Antwort. Gilt für `QUIZ` genauso wie für die Fragen in den Leveln.
- **`UI.toast` legt sich über die Antwortknöpfe**, wenn die unten am Bildrand
  stehen — und man muss vier Sekunden warten, bis man weitertippen kann. In
  `brennen/` dafür `unterbau(...)` benutzen (`brennen/src/bausteine.js`).
- **Zentrieren und `overflow:hidden` vertragen sich nicht.** Ein Flex-Container
  mit `justify-content:center` läuft bei Überlänge an *beiden* Enden über —
  oben ist dann nicht einmal durch Scrollen erreichbar. Deshalb steht auf
  `.mitte` ein `justify-content:safe center`. Wer einen neuen Bildschirm baut,
  prüft ihn bei 360 × 740 mit `--skala: 1.3` (das entspricht Chromes
  Textskalierung auf 130 %).
- **Im Kulissen-SVG dürfen keine Backticks stehen.** `hub/src/szene.js` baut
  jede Kulisse als Template-Literal. Ein Backtick in einem SVG-Kommentar
  beendet die Zeichenkette — die Seite bleibt dann weiß, ohne Fehler in der
  Konsole, weil das Skript gar nicht erst geparst wird. Lange Erklärungen
  gehören darum über die Funktion, nicht ins Markup.
- **Ein Link mitten in der Kulisse braucht `tabindex="-1"`.** Sonst scrollt der
  Browser beim Tabben das Ziel sichtbar. `#buehne` steht auf `overflow:hidden`,
  lässt sich programmatisch aber trotzdem verschieben, und die Bühne hängt
  danach dauerhaft schief. Der Schaukasten an der Wache macht es so; der
  tastaturgängige Weg zu Instagram steht im Fuß.
- **CSS-`transform` schlägt das SVG-Attribut `transform`.** Auf der Startseite
  kostet das regelmäßig Zeit; deshalb liegen bewegte Teile in einer
  Wrapper-Gruppe. Und `transform-origin` braucht `transform-box: fill-box`.
- **Der Zurück-Knopf des Browsers holt die Seite aus dem Cache**, samt
  laufender Animation und zugezogener Blende. Alles, was einen Zustand setzt,
  braucht ein `pageshow` mit `e.persisted`.
- **Es darf nur ein `dist/` geben, nämlich `hub/dist/`.** Wrangler löst
  `assets.directory` relativ zu der Config auf, die es gelesen hat. Als das
  rohe Einsatzbereit noch in einem zweiten `dist/` in der Wurzel lag, hat ein
  Deploy ohne `--config hub/wrangler.jsonc` genau dieses hochgeladen: die
  Startseite war weg, beide Spiele 404, und der Zurück-Knopf lief im Kreis.
  Deshalb heißen die Zwischenstände jetzt `bau/fwdv3.html`,
  `bau/brennen-loeschen.html` und `bau/absichern.html`. Wer sie nach `dist/`
  zurückbenennt, holt einen stillen Fehlschlag zurück, den man erst im Netz
  sieht.
- **Der Nachweiscode haengt am Vornamen — und der Name ist deshalb ab dem
  ersten Abzeichen gesperrt** (`State.nameGesperrt()`). Ohne diese Sperre
  koennte ein fertiges Kind der ganzen Gruppe Codes ausstellen: Name aendern,
  Code abschreiben, Name zurueckstellen. Wer die Sperre herausnimmt, macht den
  ganzen Nachweis wertlos. Was er kann und was nicht, steht ausfuehrlich in
  `gemeinsam/nachweis.js` — kurz: gegen Weitergeben hilft er, gegen einen
  gefälschten Spielstand nicht, und das ist bewusst so.
- **Wer ein Abzeichen ergänzt, ändert alle bisherigen Nachweiscodes.** Der Satz
  der Schlüssel steckt im Hash. `hub/build.mjs` liest ihn beim Bauen aus den
  Datendateien; ändert sich dort die Schreibweise des `ABZEICHEN`-Blocks,
  bricht der Build absichtlich ab, statt still falsche Urteile zu fällen.
- **`hub/vorschau/` liegt bewusst neben `hub/dist/`** und nicht darin: was in
  `dist/` liegt, lädt der Worker mit hoch.

### Nur in „Erst sichern!" (`absichern/`)

- **Die Straße folgt einer Mittellinie, nicht einem Rechteck.** Jede Kante —
  Fahrbahnrand, Mittelstreifen, Bankett, Leitplanke — ist ein abgetasteter
  Linienzug mit konstantem Querabstand zu dieser Mitte. Ohne `kurve` ist die
  Mitte überall null und es kommt dasselbe heraus wie aus Rechtecken; mit
  `kurve` biegt sich alles gemeinsam. **Wer einem Plan eine Kurve gibt, muss
  alles darauf mit `aufPlan()` / `setzenAuf()` setzen** statt mit `stellen()` /
  `setzen()` — sonst steht das Fahrzeug dort, wo die Straße ohne Bogen gewesen
  wäre, also neben ihr. Flächen auf der Fahrbahn (Sichtschatten) brauchen
  `plan.flaeche(...)` statt eines `rect`.
- **Ein Bogen lässt sich nicht nachträglich einschalten**, er steckt in der
  Geometrie jeder Kante. Aufgabe 4 baut die Strecke deshalb zweimal
  (`streckeBauen`): Runde 1 zeigt eine gerade Landstraße, erst Runde 2 dieselbe
  mit Kurve. Das ist auch didaktisch so gewollt — wer die Kurve schon sieht,
  während er die 200 Meter einstellen soll, sucht den Haken, statt die Zahl zu
  lernen. Zum Austauschen **`Stage.inhaltLeeren()` benutzen, nicht
  `Stage.leeren()`**: Das volle Leeren nimmt dem laufenden Bildschirm die Wache
  seines Bedienfelds mit, und der Plan springt einmal auf volle Fensterhöhe.
- **Der Längsmaßstab ist gebrochen, der Querschnitt nicht.** Quer ist ein
  Meter immer `QUER` Einheiten, längs entscheidet der Plan (`nahProM`,
  `fernProM` in `welt/plan.js`). Das ist Absicht — eine Einsatzstelle von
  dreißig Metern und eine Absicherung von achthundert passen nicht gleichzeitig
  maßstäblich auf einen Handybildschirm, und die FwDV-1-Zeichnung löst es
  genauso. Folge: **jedes Fahrzeug braucht `plan.symbolSkala`** als fünftes
  Argument von `stellen()`. Ohne sie ist ein Löschfahrzeug auf dem
  Übersichtsplan fünfzig Meter lang und deckt die halbe Unfallstelle zu.
- **Was auf dem Übersichtsplan nah beieinander liegt, liegt auf dem Handy
  übereinander.** Eine Verjüngung aus vier Kegeln ist dort zwanzig Pixel breit;
  vier Knöpfe darauf kann man nicht mehr treffen, sondern nur raten. Deshalb
  wird die Reihenfolge der Kegel **gefragt** statt getippt, und wo wirklich
  getippt wird (Aufgabe 5), liegen die Marken zweihundert Meter auseinander.
- **Das Bedienfeld misst sich selbst aus.** `bedienfeld()` rechnet den
  Bildversatz aus der freien Fläche zwischen Kopfzeile, Auftragskarte und
  Panel — ein fester Wert lässt den Plan entweder verschwinden oder oben
  kleben. Der Anteil ist nach unten gedeckelt (`Stage.frei`), sonst schrumpft
  der Plan bei einer langen Auflösung auf Briefmarkengröße.
- **Nur ein Bedienfeld darf messen, und der Ausschnitt wird nachgezogen.**
  Beim Bildschirmwechsel bleibt der alte Bildschirm 260 ms im Baum; sein Feld
  ist noch `isConnected` und misst weiter, und weil die Bühne ihre Wachen von
  hinten nach vorn abläuft, gewann das *alte*. Der Plan zuckte bei jedem
  „Weiter" zwischen beiden Ausschnitten. Deshalb meldet ein neues Feld das
  vorige gleich ab (`feldWache` in `bausteine.js`), misst erst im nächsten Bild
  (beim Aufruf ist der Bildschirm noch halb leer) und die Bühne zieht
  `versatz`/`frei` weich nach (`ausschnittZiehen`). Wer einen dieser drei
  Teile herausnimmt, holt das Flackern zurück.
- **Marken dürfen ihr eigenes `transform` nicht anfassen** — dieselbe Falle wie
  bei `HotSpots` drüben. Die Bühne schreibt es jedes Bild neu; ein `:hover` mit
  `transform` reißt die Marke in die Bildecke. Rahmen und Schatten animieren.
- **Blinkende Teile brauchen `fill-opacity`, nicht `opacity`.** Die
  Blinkanimation in `stil-extra.css` schreibt `opacity`, und CSS sticht das
  SVG-Präsentationsattribut aus: Aus dem zarten Schein um das Blaulicht würde
  sonst ein knallblauer Klecks.
- **Das Sichthindernis muss weiter draußen liegen als der Regelabstand.**
  In Aufgabe 4 ist die Sicht ab 230 Metern weg, nicht ab 170 — läge die Kurve
  näher an der Einsatzstelle, stünde das Warngerät auf 200 Metern längst davor
  und die ganze Runde hätte keine Aufgabe mehr.
- **Der Wald gehört in die Innenseite der Kurve.** Dort verlässt die
  Sichtlinie die Fahrbahn; auf der Außenseite stünde er herum, ohne etwas zu
  erklären. Eine eingezeichnete Sichtlinie gibt es bewusst nicht: Bei diesem
  Maßstab verlässt sie die Fahrbahn nur um Zentimeter und liefe scheinbar
  parallel zur Straße — sie würde das Gegenteil von dem zeigen, was gemeint
  ist. Und eine **Kuppe** wird gar nicht gezeichnet: Eine Steigung sieht man
  in der Draufsicht grundsätzlich nicht, sie bleibt eine Frage.
- **Die Truppfarben sind dieselben wie überall** (`TRUPPFARBEN` in
  `data/absicherung.js`): blau Wassertrupp, rot Angriffstrupp, grün
  Schlauchtrupp, Gold Einheitsführer, Stahl Maschinist. Nur dunkler als in
  „Einsatzbereit" — dort liegen sie auf einer Nachtszene, hier auf hellem
  Asphalt. Die Truppfarbe ist die **Fläche** der Figur; von der Warnweste
  bleibt ein schmaler Reflexstreifen über den Schultern. Umgekehrt — gelbe
  Weste groß, Truppfarbe als Ring darum — sah jede Figur aus wie in einem
  gelben Rahmen und war auf dem Plan lauter als alles, worum es geht. Dass die
  Mannschaft Warnkleidung trägt, lehrt Aufgabe 2, nicht ein Leuchtpunkt.
- **Die Kennung unter einer Figur ist Schrift, kein Schild.** Klein, in der
  Truppfarbe, mit hellem Rand dahinter (`paint-order="stroke"`) — damit sie
  auch auf dunklem Asphalt lesbar bleibt, ohne dass ein Kasten mit farbiger
  Kante nötig wäre. Der war die lauteste Sache auf dem ganzen Plan.
- **Kennungen brauchen Abstand.** Gut dreißig Einheiten breit; zwei Figuren,
  die enger stehen, ergeben „WTrFWTrM". `schildBreite()` sagt, wie breit es
  wird. Und sie steht 22 Einheiten unter der Figur — wer eine Figur dicht
  neben ein Fahrzeug stellt, legt ihre Kennung auf den Aufbau.
- **`BELADUNG` ist bewusst knapp** (zwei Warndreiecke, zwei Warnleuchten).
  Aufgabe 5 braucht vier von jedem, und genau daran merkt man, dass auf der
  Autobahn ein zweites Fahrzeug dazugehört. Wer die Zahlen großzügiger macht,
  nimmt der Aufgabe ihren Kern.
