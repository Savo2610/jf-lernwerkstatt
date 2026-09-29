# Was von außen hereinragt

Dieses Repo steht nicht allein. An zwei Stellen gibt es eine Absprache mit
einem anderen Repo, und die sieht man dem Code hier nicht an.

## veerka.mp — die Ausfahrt hierher

**Repo:** `Savo2610/Julians-Website` · **Dateien:** `src/stations/stations.js`
(`ausruecken()`), `src/world/props/firetruck.js` (die Fahrt), `src/style.css`
(`.ausfahrt`, die Blende), Adresse in `src/stations/links.js`

Auf Julians Startseite steht in einem verschneiten 3D-Skital am Waldrand ein
Feuerwehrauto, der „Löschzug“. Wer davor Enter drückt oder es antippt, zoomt
heran, und es schaltet Blaulicht und Scheinwerfer an. Die Auswahl darunter hat
ein Ziel, „Ausrücken“: das Auto setzt zurück und biegt in eine Lücke zwischen
den Tannen, dabei schließt eine Blende, und nach 1,9 s ruft dieselbe Seite
(kein neuer Tab) auf:

```
https://jf.veerka.mp/?einfahrt=1
```

Drüben rollt dasselbe Fahrzeug — jetzt in 2D — vor der Feuerwache aus. Zwei
Seiten, ein Fahrzeug.

Die Farbe der Blende richtet sich nach dem ersten Bild, das diese Startseite
mit `?einfahrt=1` zeigt, und das hängt vom Farbschema ab (gemessen am
30.09.2026 mit den ersten Bildern der Einfahrt): dunkel ist es `#080b14`,
hell schon die unscharfe Straße am Tag. Das Tal blendet deshalb dunkel auf
`#080b14` und hell auf einen Verlauf aus genau diesem Bild (Himmel, Häuser,
Straße, Wiese). Beide Seiten folgen nur `prefers-color-scheme`. **Ändert sich
hier, wie die Einfahrt im hellen Schema beginnt, muss `.ausfahrt` drüben
mitziehen** — sonst gibt es beim Ankommen einen harten Farbsprung.

## Das Spiel — der Rückweg von hier

Im Levelmenü steht oben links „Zurück zur Lernwerkstatt"
(`App.zurLernwerkstatt()` in `src/main.js`). Der Knopf blendet auf denselben
Grundton ab und ruft dieselbe Adresse auf.

## Der Vertrag

Es gibt genau **einen** Berührungspunkt, und beide Seiten kennen ihn:

| | |
|---|---|
| Anhang | `?einfahrt=1` |
| Wer schickt | veerka.mp (`src/stations/stations.js`) und das Spiel (`src/main.js`) |
| Wer empfängt | die Startseite, `einfahrtStarten()` in `hub/src/main.js` |
| Was passiert | Seite beginnt dunkel, Fahrzeug rollt vor der Wache aus |
| Danach | `history.replaceState` nimmt den Anhang aus der Adresszeile |

Die Startseite fragt **nicht**, woher jemand kommt. Das ist Absicht: sie muss
nichts über die andere Seite wissen, und ein dritter Absender käme ohne
Änderung dazu.

Wer den Anhang umbenennt, muss **drei** Dateien in **zwei** Repos anfassen.
Wer ihn nur auf einer Seite ändert, bekommt keinen Fehler — nur einen harten
Schnitt statt einer Einfahrt, und das fällt beim Testen leicht nicht auf.

Dasselbe gilt für `LERNWERKSTATT` in `src/main.js` und `jugendfeuerwehr` in
`src/stations/links.js` drüben: beides sind fest eingetragene Adressen auf `jf.veerka.mp`. Zieht die Seite
jemals um, sind das die Stellen.

## Instagram

Von der Startseite führen zwei Wege zum **Team Zukunft** der Jugendfeuerwehr
auf Instagram — derselbe Kanal, zweimal:

- der **Schaukasten** am Feuerwehrhaus, gleich hinter dem Schlauchturm. Er
  liegt auf dem Weg zum ersten Thema und ist bewusst klein gehalten. Er trägt
  `tabindex="-1"`, weil ein Tabstopp in der Kulisse den Browser dazu brächte,
  die Bühne zu scrollen — die steht auf `overflow:hidden` und hinge danach
  dauerhaft schief. Deshalb braucht es den zweiten Weg:
- der Link **im Fuß**, zwischen den Themen und dem Kleingedruckten. Das ist
  der tastaturgängige. Solange er dort steht, darf der Schaukasten stumm sein.

Auf veerka.mp stand dieser Link früher am Feuerwehrauto. Er ist dort durch den
Link hierher ersetzt worden.

## GitHub

Das Repo ist selbst verlinkt, an zwei Stellen: als zweiter Knopf „Hilf mit
beim Bauen" auf der Baustellen-Karte, und in der Lizenzzeile ganz unten. Das
eine steht als `mit` in `hub/src/themen.js`, das andere als Fließtext in
`hub/src/body.html`. Zieht das Repo um, sind das die Stellen — dazu
`LIZENZ.md` und die Zeile in `README.md`.

## Die alte Adresse

Das Spiel hatte vor dem Umzug eine eigene Subdomain — eine GitHub-Pages-Seite
aus dem Repo `Savo2610/fwdv3`. Die ist **abgeschaltet**: kein DNS-Eintrag,
keine Worker-Route, keine Umleitung. Die einzige richtige Adresse ist
`jf.veerka.mp/fwdv3/`.

Wer sie noch irgendwo findet — auf einem alten Zettel, in einem QR-Code, in
einem Lesezeichen —, ersetzt sie. Sie wird nicht wiederkommen; eine Umleitung
für eine Adresse, die niemand mehr aufruft, ist nur eine Stelle mehr, an der
etwas kaputtgehen kann.
