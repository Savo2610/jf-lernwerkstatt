/* ---------- Nachweis: „Ich habe alle Abzeichen" ---------------------------
   Wer alle Abzeichen eines Spiels hat, bekommt einen kurzen Code, den er dem
   Jugendwart zeigt. Der prueft ihn auf der Nachweisseite gegen den Vornamen.

   WAS DAS KANN UND WAS NICHT – bitte vor dem Aendern lesen:

   Der Code haengt am Vornamen. Weitersagen nuetzt deshalb nichts: Toms Code
   gilt nur zu „Tom", und der Jugendwart kennt seine Leute. Das ist der Fall,
   der wirklich vorkommt.

   Nicht verhindern kann er, dass jemand mit offener Entwicklerkonsole seinen
   Spielstand faelscht. Das Geheimnis unten steht im ausgelieferten Code – es
   muss dort stehen, weil das Spiel den Code ohne Netz erzeugen soll. Es macht
   das Nachbauen muehsam, nicht unmoeglich. Wer es trotzdem schafft, hat mehr
   ueber Informatik gelernt, als hier drinsteht; damit laesst sich leben.

   Die eigentliche Huerde steht woanders, naemlich in state.js: Sobald das
   erste Abzeichen da ist, ist der Name festgeschrieben. Sonst koennte ein
   fertiges Kind der halben Gruppe Codes ausstellen, indem es kurz den Namen
   wechselt. Wer ihn danach aendern will, faengt von vorne an – Schummeln
   kostet dann genau so viel wie ehrlich spielen.
   -------------------------------------------------------------------------*/

const NACHWEIS = {
  /* Kein echtes Geheimnis (siehe oben), sondern Streusalz: Es sorgt dafuer,
     dass man den Code nicht mit einem Standard-SHA256 aus Name und Datum
     nachrechnen kann, sondern das Spiel auseinandernehmen muss.            */
  salz: '97bda74a4beb57596b47394f3fb8492ec951d831f0775f4d',

  /* Ohne 0/O und 1/I/L: Die Codes werden abgetippt und vorgelesen.        */
  alphabet: '23456789ABCDEFGHJKMNPQRSTUVWXYZ',

  /* Wie weit die Nachweisseite rueckwaerts sucht. Ein Jahr reicht – laenger
     her, und das Kind ist ohnehin nicht mehr in derselben Gruppe.          */
  tageZurueck: 400,

  /* „Marie", „marie " und „MARIE" muessen denselben Code ergeben, sonst
     scheitert die Pruefung an der Gross-/Kleinschreibung statt am Schummeln. */
  nameNormalisieren(name) {
    return String(name || '')
      .toLowerCase()
      .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
      .replace(/[^a-z0-9]/g, '');
  },

  /* Tage seit 1970, in Ortszeit. Nicht Date.now()/86400000: Das springt in
     unserer Zeitzone abends um und ergaebe fuer denselben Abend zwei Tage. */
  tagVon(d) {
    const t = d || new Date();
    return Math.floor(Date.UTC(t.getFullYear(), t.getMonth(), t.getDate()) / 86400000);
  },

  tagAlsDatum(tag) {
    const d = new Date(tag * 86400000);
    return `${String(d.getUTCDate()).padStart(2, '0')}.${String(d.getUTCMonth() + 1).padStart(2, '0')}.${d.getUTCFullYear()}`;
  },

  /* Der Code bindet vier Dinge zusammen: welches Spiel, wer, welche
     Abzeichen, welcher Tag. Das Spiel muss mit rein, sonst gaelte ein
     Nachweis aus „Brennen & Loeschen" auch fuer „Einsatzbereit".           */
  async rechnen(spielId, name, schluessel, tag) {
    const stoff = [spielId, this.nameNormalisieren(name),
                   schluessel.slice().sort().join(','), tag].join('|');
    const roh = new TextEncoder().encode(stoff);
    const key = await crypto.subtle.importKey(
      'raw', new TextEncoder().encode(this.salz),
      { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
    const sig = new Uint8Array(await crypto.subtle.sign('HMAC', key, roh));
    let aus = '';
    for (let i = 0; i < 8; i++) aus += this.alphabet[sig[i] % this.alphabet.length];
    return aus.slice(0, 4) + '-' + aus.slice(4);
  },

  /* Fuer das Spiel: Code fuer heute. */
  erzeugen(spielId, name, schluessel) {
    return this.rechnen(spielId, name, schluessel, this.tagVon());
  },

  /* Fuer die Nachweisseite: Wir kennen den Tag nicht, an dem das Kind fertig
     wurde – also probieren wir rueckwaerts, bis es passt. Vierhundert
     HMACs kosten weniger als eine Zehntelsekunde, und der Jugendwart muss
     dafuer nur den Vornamen eintippen statt zusaetzlich ein Datum.         */
  async pruefen(spielId, name, schluessel, code) {
    const gesucht = String(code || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (gesucht.length !== 8) return { gilt: false };
    const heute = this.tagVon();
    for (let i = 0; i <= this.tageZurueck; i++) {
      const tag = heute - i;
      const soll = (await this.rechnen(spielId, name, schluessel, tag)).replace('-', '');
      if (soll === gesucht) return { gilt: true, tag, datum: this.tagAlsDatum(tag) };
    }
    return { gilt: false };
  },
};
