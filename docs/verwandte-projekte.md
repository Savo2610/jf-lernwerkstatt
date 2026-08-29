# Was von außen hereinragt

Dieses Repo steht nicht allein. An zwei Stellen gibt es eine Absprache mit
einem anderen Repo, und die sieht man dem Code hier nicht an.

## veerka.mp — die Ausfahrt hierher

**Repo:** `Savo2610/Julians-Website` · **Datei:** `public/scene.js`

Auf Julians Startseite steht in einer verschneiten 3D-Nachtszene ein
Feuerwehrauto. Wer es anklickt, schickt es auf eine Runde durch den Talkessel
und bekommt ein Schild mit dem Link hierher. Ein Klick auf das Schild lässt das
Auto geradeaus davonfahren, blendet auf `#080b14` ab und ruft auf:

```
https://jf.veerka.mp/?einfahrt=1
```

Drüben rollt dasselbe Fahrzeug — jetzt in 2D — vor der Feuerwache aus. Zwei
Seiten, ein Fahrzeug.

## Das Spiel — der Rückweg von hier

Im Levelmenü steht oben links „Zurück zur Lernwerkstatt"
(`App.zurLernwerkstatt()` in `src/main.js`). Der Knopf blendet auf denselben
Grundton ab und ruft dieselbe Adresse auf.

## Der Vertrag

Es gibt genau **einen** Berührungspunkt, und beide Seiten kennen ihn:

| | |
|---|---|
| Anhang | `?einfahrt=1` |
| Wer schickt | veerka.mp (`scene.js`) und das Spiel (`src/main.js`) |
| Wer empfängt | die Startseite, `einfahrtStarten()` in `hub/src/main.js` |
| Was passiert | Seite beginnt dunkel, Fahrzeug rollt vor der Wache aus |
| Danach | `history.replaceState` nimmt den Anhang aus der Adresszeile |

Die Startseite fragt **nicht**, woher jemand kommt. Das ist Absicht: sie muss
nichts über die andere Seite wissen, und ein dritter Absender käme ohne
Änderung dazu.

Wer den Anhang umbenennt, muss **drei** Dateien in **zwei** Repos anfassen.
Wer ihn nur auf einer Seite ändert, bekommt keinen Fehler — nur einen harten
Schnitt statt einer Einfahrt, und das fällt beim Testen leicht nicht auf.

Dasselbe gilt für `LERNWERKSTATT` in `src/main.js` und in `scene.js` drüben:
beides sind fest eingetragene Adressen auf `jf.veerka.mp`. Zieht die Seite
jemals um, sind das die Stellen.

## Instagram

Von der Startseite führt genau ein Link nach draußen: das **Team Zukunft** der
Jugendfeuerwehr auf Instagram, unten im Fuß zwischen den Themen und dem
Kleingedruckten (`hub/src/body.html`). Er steht dort und in keiner Karte — die
Karten sind für Lerninhalte da.

Auf veerka.mp stand dieser Link früher am Feuerwehrauto. Er ist dort durch den
Link hierher ersetzt worden; die Verbindung zu Instagram besteht jetzt über
diese Seite.

## Die alte Adresse

`fwdv3.veerka.mp` war einmal eine GitHub-Pages-Seite aus dem Repo
`Savo2610/fwdv3`. Sie leitet heute dauerhaft auf `jf.veerka.mp/fwdv3/` um, und
zwar im Worker — siehe [deploy.md](deploy.md). Der alte DNS-Eintrag muss dafür
proxied bleiben. Wer irgendwo eine Adresse `fwdv3.veerka.mp` findet: die
funktioniert weiter, ist aber nicht mehr die richtige.
