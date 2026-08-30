/* ---------- Was dieses Spiel von der gemeinsamen Grundlage unterscheidet ---
   `gemeinsam/` weiss nichts von FwDV 3. Alles, was diese Seite von der
   anderen unterscheidet und trotzdem in der Grundlage gebraucht wird, steht
   hier. Diese Datei ist die erste im Bundle.
   -------------------------------------------------------------------------*/
const SPIEL = {
  id: 'fwdv3',
  name: 'Einsatzbereit',

  /* Startseite und Spiele liegen auf einer Domain und teilen sich damit den
     Browserspeicher – jeder Spielstand braucht seinen eigenen Schluessel. */
  speicher: 'fwdv3-einsatzbereit-v1',

  /* Abzeichen fuer drei Sterne in jeder Aufgabe (null = gibt es nicht) */
  meister: 'meister',

  /* Tageszeit der 3D-Buehne: Einsatznacht. Blaulicht braucht einen dunklen
     Grund, sonst verpufft es. */
  licht: {
    belichtung: 1.32,
    himmel: [
      [0.00, '#060a16'],
      [0.42, '#101a34'],
      [0.72, '#22304f'],
      [0.90, '#3b4260'],
      [1.00, '#55483f'],
    ],
    nebel: 0x1a2440, nebelNah: 38, nebelFern: 112,
    himmelOben: 0x6d8cc4, himmelUnten: 0x2a3145, himmelStaerke: 1.45,
    hauptFarbe: 0xbccdf0, hauptStaerke: 1.55, hauptPos: [-9, 15, 8],
  },
};
