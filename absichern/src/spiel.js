/* ---------- Was diese Seite von der gemeinsamen Grundlage unterscheidet ----
   Gegenstueck zu src/spiel.js („Einsatzbereit") und brennen/src/spiel.js.
   Erste Datei im Bundle.

   Ein Unterschied faellt sofort auf: Hier fehlt `licht`. Die beiden anderen
   Seiten stellen damit die Tageszeit ihrer 3D-Buehne ein – diese Seite hat
   keine. Sie spielt in der Draufsicht, und eine Draufsicht hat keinen Himmel.
   gemeinsam/stage.js ist deshalb gar nicht mit im Bundle; die Buehne steht in
   absichern/src/buehne.js und zeichnet SVG.
   -------------------------------------------------------------------------*/
const SPIEL = {
  id: 'absichern',
  name: 'Erst sichern!',

  /* Eigener Schluessel: Startseite und alle Spiele liegen auf einer Domain
     und teilen sich damit den Browserspeicher. Mit dem Schluessel einer
     anderen Seite wuerden sich die Spielstaende gegenseitig loeschen. */
  speicher: 'jf-absichern-v1',

  meister: 'meister',
};
