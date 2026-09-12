# 🚒 Löschlos

**Die Truppauslosung für die Jugendfeuerwehr.**
Anwesenheit abhaken → Plätze wählen → fair auslosen. Installierbar als PWA, komplett offline, ohne Konto und ohne Server.

![Positionen: Angriffstrupp rot, Wassertrupp blau, Schlauchtrupp grün](icons/icon-192.png)

## Was die App kann

* **Namensliste** – einmal eintragen, bleibt auf dem Gerät. Bearbeiten nur, wenn man will; im Alltag tippt man nur an, wer da ist.
* **Plätze wählen** – alle neun Funktionen der Gruppe, gruppiert nach Trupps. Der Vorschlag für die aktuelle Kopfzahl ist automatisch gesetzt:

  | Anwesend | Vorschlag |
  |---|---|
  | 1–2 | AT |
  | 3 | AT, Melder |
  | 4 | AT, WT |
  | 5 | AT, WT, Melder |
  | 6 | AT, WT, ST |
  | 7 | AT, WT, ST, Melder |
  | 8 | + Einheitsführer |
  | 9 | + Maschinist |
  | 10 | + zweiter Angriffstruppmann |
  | 11 | + zweiter Wassertruppmann |

* **Zweites Fahrzeug** – ab acht Anwesenden zuschaltbar. Die Mannschaft wird dann gleichmäßig geteilt, ein übriges Kind geht aufs erste Fahrzeug: 8 → 4+4 (je Angriffs- und Wassertrupp), 9 → 5+4 (Melder aufs erste), 11 → 6+5, 16 → 8+8. Sinkt die Zahl der Anwesenden wieder unter acht, schaltet sich das zweite Fahrzeug von selbst ab.
* **Reservebank** – wer über die gewählten Plätze hinaus da ist, landet automatisch auf der Bank (und kommt beim nächsten Mal bevorzugt dran).
* **Faires Neu mischen** – drei Dinge fließen in die Bewertung ein:
  * *Erinnerung* – was jemand zuletzt hatte, ist am teuersten; das klingt über rund vierzehn Runden ab.
  * *Quote* – wie oft jemand eine Position bisher hatte, gemessen an dem, was rechnerisch auf ihn entfällt. Damit gleicht sich auch über viele Abende aus, wer den Einheitsführer schon dreimal hatte und wer noch nie.
  * *Verworfenes* – jeder Vorschlag, den man in derselben Runde weggemischt hat, wird ebenfalls teuer. Ohne das pendelt das Neu mischen nur zwischen zwei Lösungen hin und her.

  Ergebnis bei neun Kindern über vierzig Abende: keine einzige Positions- oder Partnerwiederholung in aufeinanderfolgenden Runden, und acht verschiedene Einheitsführer bei neun Mal Neu mischen.
* **Taktische Zeichen** – Raute mit A/W/S für die Trupps (gefüllt = Truppführer, offen = Truppmann), Schild für den Einheitsführer, Zahnrad für den Maschinisten, Kreis für den Melder.
* **Spaß** – Blaulicht, einarmiger Bandit beim Aufdecken, Konfetti und auf Wunsch ein kleines Martinshorn.

## Starten

Einfach `index.html` über einen Webserver ausliefern – es gibt keinen Build-Schritt.

```bash
python3 -m http.server 4173
```

Dann `http://localhost:4173` öffnen.

### Auf GitHub Pages veröffentlichen

Repo auf GitHub pushen, dann unter *Settings → Pages* als Quelle `main` / `/ (root)` wählen.
Die App läuft mit relativen Pfaden und funktioniert deshalb auch in einem Unterverzeichnis.

### Installieren

Im Browser über „Zum Startbildschirm hinzufügen“ bzw. das Installieren-Symbol in der Adresszeile. Danach läuft alles offline.

## Icons neu bauen

```bash
node tools/make-icons.mjs
```

## Daten

Alles liegt in `localStorage` dieses Geräts – Namensliste, Einstellungen und das Runden-Gedächtnis.
Sichern und Laden gehen über das **?**-Menü (JSON-Datei).

## Aufbau

```
index.html   Grundgerüst der drei Schritte
styles.css   Dunkles Gerätehaus-Theme, Signalfarben, Animationen
app.js       Zustand, Rollenlogik, Losalgorithmus, Effekte
sw.js        Service Worker (offline)
tools/       Icon-Generator
```

MIT-Lizenz.
