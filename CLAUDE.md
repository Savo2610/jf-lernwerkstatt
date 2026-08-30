# Hinweise für Agenten

Kurzfassung für alle, die hier zum ersten Mal arbeiten. Das ausführliche
Handbuch ist [README.md](README.md) — lies dort mindestens „Aufbau" und
„Etwas ändern", bevor du etwas änderst.

## Was das ist

Zwei Seiten, ein Worker, eine Domain:

| Adresse | Was | Quelle |
|---|---|---|
| `jf.veerka.mp/` | Startseite („Lernwerkstatt"), 2D-SVG, Scrollen fährt ein Feuerwehrauto | `hub/src/` |
| `jf.veerka.mp/fwdv3/` | das Spiel „Einsatzbereit", 3D mit Three.js | `src/` |

Zielgruppe ist die **Jugendfeuerwehr Harheim**, 10 bis 17 Jahre. Inhaltliche
Grundlage ist die FwDV 3 von 2008; Sitz- und Antreteordnung stammen aus den
Unterlagen der Wehr und weichen bewusst an Stellen von der Vorschrift ab.

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
npm run build     # baut alles nach hub/dist/ (Spiel inklusive)
npm run dev       # Startseite + Spiel wie im Netz, Port 8413
npm run dev:spiel # nur das Spiel, Port 8412
```

`npm run build` ruft `hub/build.mjs`, und das ruft zuerst `build.mjs` im
Hauptordner. **Ein Befehl baut beides** — so kann man nicht versehentlich einen
alten Stand des Spiels veröffentlichen.

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

- **`src/data/fwdv3.js` ist Inhalt, kein Code.** Änderungen dort ändern, was
  Kinder lernen. Prüfe gegen `referenz/`, rate nicht.
- **Die Antreteordnung ist an einer Stelle definiert** (`ANTRETEN.gruppe` in
  `src/three/vehicles.js`) und wird von vier Leveln benutzt. Änderst du sie,
  ändert sich alles Vier.
- **Der Boss ist gesperrt** (`BOSS_STERNE`), bis sieben Sterne da sind. Zum
  Testen `?level=loeschangriff` benutzen, nicht die Sperre herausnehmen.
- **Zentrieren und `overflow:hidden` vertragen sich nicht.** Ein Flex-Container
  mit `justify-content:center` läuft bei Überlänge an *beiden* Enden über —
  oben ist dann nicht einmal durch Scrollen erreichbar. Deshalb steht auf
  `.mitte` ein `justify-content:safe center`. Wer einen neuen Bildschirm baut,
  prüft ihn bei 360 × 740 mit `--skala: 1.3` (das entspricht Chromes
  Textskalierung auf 130 %).
- **CSS-`transform` schlägt das SVG-Attribut `transform`.** Auf der Startseite
  kostet das regelmäßig Zeit; deshalb liegen bewegte Teile in einer
  Wrapper-Gruppe. Und `transform-origin` braucht `transform-box: fill-box`.
- **Der Zurück-Knopf des Browsers holt die Seite aus dem Cache**, samt
  laufender Animation und zugezogener Blende. Alles, was einen Zustand setzt,
  braucht ein `pageshow` mit `e.persisted`.
- **`hub/vorschau/` liegt bewusst neben `hub/dist/`** und nicht darin: was in
  `dist/` liegt, lädt der Worker mit hoch.
