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

## Was der Worker bedient

| Adresse | Ergebnis |
|---|---|
| `jf.veerka.mp/` | Startseite (`hub/dist/index.html`) |
| `jf.veerka.mp/fwdv3/` | das Spiel (`hub/dist/fwdv3/index.html`) |
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
