# Veröffentlichen

Alles hängt an **einem** Cloudflare Worker namens `jf`. Er liefert die
Startseite, das Spiel und die Umleitung der alten Adresse.

## Der normale Weg: push auf `main`

Cloudflare **Workers Builds** hängt am GitHub-Repo. Ein Push auf `main` baut
und veröffentlicht von selbst. Nichts weiter zu tun.

Einstellungen im Dashboard (Workers & Pages → `jf` → Settings → Build):

| Feld | Wert |
|---|---|
| Repository | `Savo2610/jf-lernwerkstatt` |
| Branch | `main` |
| Root directory | `/` (leer lassen) |
| Build command | `node hub/build.mjs` |
| Deploy command | `npx wrangler deploy --config hub/wrangler.jsonc` |

**Das `--config hub/wrangler.jsonc` ist nicht kosmetisch.** Wrangler löst
`assets.directory` relativ zu der Config-Datei auf, die es tatsächlich gelesen
hat. Wer den Deploy anders aufruft, lädt womöglich einen ganz anderen Ordner
hoch — was das anrichtet, steht unten unter „Wenn die Startseite das Spiel
zeigt".

Warum das Wurzelverzeichnis und nicht `hub/`: der Build braucht **beide**
Bäume. `hub/build.mjs` ruft zuerst `build.mjs` im Hauptordner auf, und das
liest `src/` und `vendor/`. Vom Wurzelverzeichnis aus liegt alles da, wo es
hingehört, und es gibt nur eine `package.json`.

`hub/dist/` steht in `.gitignore`. Das Gebaute gehört nicht ins Repo — es
entsteht bei jedem Build neu, und eine 1-MB-Datei in jedem Commit hätte die
Historie in kurzer Zeit unbrauchbar gemacht.

## Der Weg von Hand

Wenn der Autodeploy klemmt oder etwas dringend live muss:

```bash
npm run deploy
```

Das ist `node hub/build.mjs && wrangler deploy --config hub/wrangler.jsonc`.
Beim ersten Mal fragt Wrangler nach der Anmeldung (`npx wrangler login`).

**Achtung:** Ein Deploy von Hand veröffentlicht den Arbeitsstand, nicht `main`.
Der nächste Push baut dann wieder aus `main` — was von Hand hochgeladen wurde,
ist damit weg. Also hinterher committen.

## Wenn die Startseite das Spiel zeigt

Störungsbild: `jf.veerka.mp/` liefert **Einsatzbereit** statt der Startseite,
und `/fwdv3/` wie `/brennen-loeschen/` geben 404. Der Zurück-Knopf im Spiel
führt dann im Kreis, weil er auf `jf.veerka.mp/?einfahrt=1` zeigt.

Dann liefert der Worker einen falschen Ordner aus. Zum Prüfen:

```bash
curl -s https://jf.veerka.mp/ | grep -o '<title>[^<]*'
```

Steht da `Einsatzbereit` statt `Lernwerkstatt der Jugendfeuerwehr`, ist der
Deploy schuld, nicht der Code. Sofort reparieren mit `npm run deploy` von Hand,
danach die Build-Einstellungen oben gegen das Dashboard halten — insbesondere
**Root directory `/`** und den vollständigen Deploy-Befehl **mit** `--config`.

Am 31. August 2026 ist genau das passiert: der Autodeploy hat das damalige
zweite `dist/` in der Wurzel hochgeladen, in dem nur das rohe Einsatzbereit
lag. Seither gibt es dieses zweite `dist/` nicht mehr — die rohen Spiele liegen
in `bau/`, und `hub/dist/` ist das einzige `dist/` im Repo. Ein Deploy, der den
falschen Ordner meint, findet jetzt gar nichts und bricht ab, statt still die
falsche Seite zu veröffentlichen. Diese Trennung bitte so lassen.

## Was der Worker bedient

| Adresse | Ergebnis |
|---|---|
| `jf.veerka.mp/` | Startseite (`hub/dist/index.html`) |
| `jf.veerka.mp/fwdv3/` | Einsatzbereit (`hub/dist/fwdv3/index.html`) |
| `jf.veerka.mp/brennen-loeschen/` | Brennen & Löschen (`hub/dist/brennen-loeschen/index.html`) |
| `jf.veerka.mp/nachweis/` | Prüfseite für den Jugendwart (`hub/dist/nachweis/index.html`) |
| `jf.veerka.mp/fwdv3` | 301 auf `/fwdv3/` |
| `fwdv3.veerka.mp/*` | 301 auf `jf.veerka.mp/fwdv3/`, Query und Fragment bleiben |

Der Code dafür ist `hub/src/worker.js` — fünfzehn Zeilen, mehr braucht es
nicht.

## DNS und Routen

Steht in `hub/wrangler.jsonc`, hier nochmal im Klartext:

- **`jf.veerka.mp` ist eine Custom Domain.** Den DNS-Eintrag hat Cloudflare
  beim ersten Deploy selbst angelegt. Nicht von Hand anfassen.
- **`fwdv3.veerka.mp` ist eine Worker-Route.** Dort steht noch der alte,
  proxied DNS-Eintrag aus der GitHub-Pages-Zeit. **Der muss orange bleiben** —
  wird er grau (nur DNS), greift die Route nicht mehr und die alte Adresse
  läuft ins Leere.
- **`run_worker_first: true`** ist Pflicht. Ohne das kämen die Dateien vor dem
  Worker dran, und `fwdv3.veerka.mp/` bekäme die Startseite ausgeliefert statt
  einer Umleitung.

## Warum eine Domain und nicht zwei

Startseite und Spiel liegen als Pfade auf **derselben** Domain, nicht auf zwei
Subdomains. Nur dann teilen sie sich den Browserspeicher. Ein gemeinsamer
Fortschritt über mehrere Themen hinweg — Medaillen, Gesamt-XP — ist damit
später ohne Umzug möglich. Wer daran etwas ändert, wirft allen Kindern ihren
Spielstand weg.

## Die Vorgänger

- `Savo2610/fwdv3` auf GitHub ist die **alte** Seite: eine `index.html` plus
  `CNAME`, ausgeliefert über GitHub Pages unter `fwdv3.veerka.mp`. Sie wird
  nicht mehr gepflegt. Der Stand vom Umzugstag liegt hier in `sicherung/`.
- `FwDV3-Julian.pptx` im Hauptordner ist die Präsentation, aus der das Ganze
  ursprünglich hervorgegangen ist.
