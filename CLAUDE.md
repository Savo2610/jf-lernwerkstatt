# Hinweise für Agenten

Kurzfassung für alle, die hier zum ersten Mal arbeiten. Das ausführliche
Handbuch ist [README.md](README.md) — lies dort mindestens „Aufbau" und
„Etwas ändern", bevor du etwas änderst.

## Was das ist

Drei Seiten, ein Worker, eine Domain:

| Adresse | Was | Quelle |
|---|---|---|
| `jf.veerka.mp/` | Startseite („Lernwerkstatt"), 2D-SVG, Scrollen fährt ein Feuerwehrauto | `hub/src/` |
| `jf.veerka.mp/fwdv3/` | das Spiel „Einsatzbereit" (FwDV 3), 3D mit Three.js | `src/` |
| `jf.veerka.mp/brennen-loeschen/` | das Spiel „Brennen & Löschen" (Brandlehre), 3D | `brennen/src/` |

Beide Spiele stehen auf derselben Basis in `gemeinsam/`: Bühne, Spielstand,
Bildschirme, Klänge, Designsystem. Beide haben acht Aufgaben und einen
Beamer-Modus für den Gruppenabend (`?modus=beamer`) — drüben mit Quiz-Duell und
Memory, hier mit der Feuerwand. Eigen ist jedem nur, was es zeigt — plus
`src/spiel.js` (Name, Speicher, Lichtstimmung) und `src/farben.css` (Palette).
**Wer `gemeinsam/` anfasst, ändert beide Spiele und muss beide ansehen.**

Zielgruppe ist die **Jugendfeuerwehr Harheim**, 10 bis 17 Jahre. Inhaltliche
Grundlage für „Einsatzbereit" ist die FwDV 3 von 2008; Sitz- und
Antreteordnung stammen aus den Unterlagen der Wehr und weichen bewusst an
Stellen von der Vorschrift ab. „Brennen & Löschen" folgt den Unterlagen der
Hessischen Landesfeuerwehrschule (`referenz/brennen-loeschen/`).

## Hausordnung

Diese Regeln stecken überall im Bestand. Halte dich daran, sonst fällt dein
Code sofort auf.

- **Alles ist deutsch.** Bezeichner, Kommentare, Commit-Nachrichten, Oberfläche.
  `radWinkel`, nicht `wheelAngle`. Anführungszeichen sind `„…"`, niemals `“…”`.
- **Keine Abhängigkeiten.** Three.js liegt als Datei in `vendor/` und wird
  eingebettet. Kein npm-Paket zur Laufzeit, kein CDN, kein Framework. Der
  einzige externe Verweis ist Google Fonts.
- **Eine Datei am Ende.** Der Build fasst alles zu einer HTML-Datei zusammen.
  Nichts wird zur Laufzeit nachgeladen.
- **Kommentare erklären das Warum.** Der Bestand ist voll von „das steht so da,
  weil sonst …". Halte das durch — die Fallen sind selten offensichtlich.
- **Kein Wegwerf-Code stehen lassen.** Keine `console.log`, keine auskommentierten
  Versuche. Die Debug-Haken (`window.__eb`, `window.__hub`, `szene`) sind
  Absicht und dokumentiert.
- **Bewegung ist optional.** `prefers-reduced-motion` hat überall einen echten
  Ersatzweg. Wer eine Animation ergänzt, ergänzt auch den.

## Bauen, ansehen, prüfen

```bash
npm run build       # baut alles nach hub/dist/ (beide Spiele inklusive)
npm run dev         # alles wie im Netz, Port 8413
npm run dev:spiel   # nur Einsatzbereit, Port 8412
npm run dev:brennen # nur Brennen & Löschen, Port 8414
```

`npm run build` ruft `hub/build.mjs`, und das ruft `build.mjs` im Hauptordner
und `brennen/build.mjs`. **Ein Befehl baut alles** — so kann man nicht
versehentlich einen alten Stand eines Spiels veröffentlichen.

Zum Prüfen im Browser: [docs/pruefen.md](docs/pruefen.md). Da stehen die
Konsolen-Haken, mit denen man ein Level oder eine Fahrt direkt anspringt,
statt sich durchzuklicken.

## Veröffentlichen

Push auf `main` reicht — Cloudflare Workers Builds baut und veröffentlicht.
Einzelheiten und der Weg von Hand: [docs/deploy.md](docs/deploy.md).

## Was hier sonst noch dranhängt

Die Startseite ist über eine Übergangsanimation mit **veerka.mp** verbunden
(anderes Repo). Wer an `?einfahrt=1` oder an `LERNWERKSTATT` etwas ändert,
ändert einen Vertrag zwischen zwei Repos: [docs/verwandte-projekte.md](docs/verwandte-projekte.md).

## Wo die Fallen liegen

- **`src/data/fwdv3.js` und `brennen/src/data/brandlehre.js` sind Inhalt, kein
  Code.** Änderungen dort ändern, was Kinder lernen. Prüfe gegen `referenz/`,
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
- **`UI.toast` legt sich über die Antwortknöpfe**, wenn die unten am Bildrand
  stehen — und man muss vier Sekunden warten, bis man weitertippen kann. In
  `brennen/` dafür `unterbau(...)` benutzen (`brennen/src/bausteine.js`).
- **CSS-`transform` schlägt das SVG-Attribut `transform`.** Auf der Startseite
  kostet das regelmäßig Zeit; deshalb liegen bewegte Teile in einer
  Wrapper-Gruppe. Und `transform-origin` braucht `transform-box: fill-box`.
- **Der Zurück-Knopf des Browsers holt die Seite aus dem Cache**, samt
  laufender Animation und zugezogener Blende. Alles, was einen Zustand setzt,
  braucht ein `pageshow` mit `e.persisted`.
- **`hub/vorschau/` liegt bewusst neben `hub/dist/`** und nicht darin: was in
  `dist/` liegt, lädt der Worker mit hoch.
