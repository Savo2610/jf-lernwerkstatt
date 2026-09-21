# Veröffentlichen

Alles hängt an **einem** Cloudflare Worker namens `jf`. Er liefert die
Startseite, die Spiele und Löschlos.

Löschlos ist dabei der einzige Pfad, unter dem **mehrere** Dateien liegen: als
PWA braucht es CSS, JS, Manifest und Symbole einzeln. Wenn dort etwas fehlt,
zeigt sich das nicht als 404 im Bild, sondern daran, dass die App sich nicht
mehr installieren lässt — der Service Worker sammelt seine Dateien vorab ein
und gibt beim ersten Fehlschlag ganz auf.

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
und `/fwdv3/`, `/brennen-loeschen/` wie `/absichern/` geben 404. Der Zurück-Knopf im Spiel
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
| `jf.veerka.mp/absichern/` | Erst sichern! (`hub/dist/absichern/index.html`) |
| `jf.veerka.mp/loeschlos/` | Löschlos (`hub/dist/loeschlos/`, mehrere Dateien) |
| `jf.veerka.mp/nachweis/` | Prüfseite für den Jugendwart (`hub/dist/nachweis/index.html`) |
| `jf.veerka.mp/fwdv3` | 301 auf `/fwdv3/` — genauso für die anderen Unterseiten |
| `jf.veerka.mp/löschlos` | 301 auf `/loeschlos/` — der Umlaut kommt als `%C3%B6` an |

Der Code dafür ist `hub/src/worker.js` — zwanzig Zeilen, mehr braucht es
nicht.

## DNS und Routen

Steht in `hub/wrangler.jsonc`, hier nochmal im Klartext:

- **`jf.veerka.mp` ist eine Custom Domain.** Den DNS-Eintrag hat Cloudflare
  beim ersten Deploy selbst angelegt. Nicht von Hand anfassen.
- **Einen zweiten Hostnamen gibt es nicht.** Alles liegt als Pfad unter
  `jf.veerka.mp`. Wer einen weiteren anlegt, braucht dafür eine eigene Route
  *und* einen proxied DNS-Eintrag — fehlt einer von beiden, läuft die Adresse
  ins Leere, ohne dass hier irgendetwas kaputtgeht. Genau so ist die alte
  Spieladresse `fwdv3.veerka.mp` gestorben, und deshalb ist sie im September
  2026 ganz aus Worker und Config geflogen.
- **`run_worker_first: true`** ist Pflicht. Ohne das kämen die Dateien vor dem
  Worker dran, und `jf.veerka.mp/absichern` (ohne Schrägstrich) fiele über
  `not_found_handling` still in die Startseite, statt umgeleitet zu werden.

## Warum eine Domain und nicht zwei

Startseite und Lernseiten liegen als Pfade auf **derselben** Domain, nicht auf
mehreren Subdomains. Nur dann teilen sie sich den Browserspeicher. Ein gemeinsamer
Fortschritt über mehrere Themen hinweg — Medaillen, Gesamt-XP — ist damit
später ohne Umzug möglich. Wer daran etwas ändert, wirft allen Kindern ihren
Spielstand weg.

## Die Vorgänger

- `Savo2610/fwdv3` auf GitHub ist die **alte** Seite: eine `index.html` plus
  `CNAME`, ausgeliefert über GitHub Pages unter einer eigenen Subdomain. Sie
  wird nicht mehr gepflegt, die Adresse ist abgeschaltet und wird nirgends
  mehr umgeleitet. Der Stand vom Umzugstag liegt hier in `sicherung/`.
- `FwDV3-Julian.pptx` im Hauptordner ist die Präsentation, aus der das Ganze
  ursprünglich hervorgegangen ist.
