/* ---------- Was diese Seite von der gemeinsamen Grundlage unterscheidet ----
   Gegenstueck zu src/spiel.js drueben. Erste Datei im Bundle.
   -------------------------------------------------------------------------*/
const SPIEL = {
  id: 'brennen',
  name: 'Brennen & Löschen',

  /* Eigener Schluessel: Startseite und beide Spiele liegen auf einer Domain
     und teilen sich damit den Browserspeicher. Mit dem Schluessel von
     „Einsatzbereit" wuerden sich die Spielstaende gegenseitig loeschen. */
  speicher: 'jf-brennen-loeschen-v1',

  meister: 'meister',

  /* Tageszeit der 3D-Buehne: Vormittag auf dem Uebungsplatz. Hoch stehende
     Sonne, harte Schatten, dunstiger Horizont. Genau umgekehrt zur
     Einsatznacht drueben – und der Grund, warum Himmel und Licht ueberhaupt
     aus dieser Datei kommen. */
  licht: {
    // niedriger als nachts: sonst brennen die hellen Flaechen aus
    belichtung: 1.05,
    himmel: [
      [0.00, '#5fa8d8'],   // kraeftiges Blau im Zenit
      [0.38, '#93c8e4'],
      [0.66, '#c6e0ec'],
      [0.86, '#e8e4d6'],   // Dunst ueber dem Horizont
      [1.00, '#d8c9ae'],   // Sand
    ],
    nebel: 0xd8dfe0, nebelNah: 48, nebelFern: 150,
    himmelOben: 0xbcd8ee, himmelUnten: 0xd6c9ac, himmelStaerke: 2.1,
    hauptFarbe: 0xfff2dc, hauptStaerke: 2.5, hauptPos: [8, 19, 7],
  },
};
