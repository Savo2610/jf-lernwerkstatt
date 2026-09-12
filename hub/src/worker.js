/* Ein Worker fuer beide Adressen.

   jf.veerka.mp    liefert die Startseite und darunter die Spiele
                   /fwdv3/ und /brennen-loeschen/, die Truppauslosung
                   /loeschlos/ sowie /nachweis/ – die Pruefseite fuer den
                   Jugendwart, nirgends verlinkt.
   fwdv3.veerka.mp ist die alte Adresse des Spiels und leitet dauerhaft um.

   Der Worker laeuft vor der Dateiauslieferung (`run_worker_first`), sonst
   bekaeme fwdv3.veerka.mp/ die Startseite ausgeliefert, statt umgeleitet zu
   werden.                                                                    */
const ALT = 'fwdv3.veerka.mp';
const NEU = 'https://jf.veerka.mp/fwdv3/';
const UNTERSEITEN = ['/fwdv3', '/brennen-loeschen', '/nachweis', '/loeschlos'];

/* Loeschlos heisst mit Umlaut, die Adresse nicht. Ein oe im Pfad kommt als
   %C3%B6 an und ueberlebt weder QR-Code noch Zettel an der Pinnwand zuverlaessig.
   Kanonisch ist deshalb /loeschlos/; wer /löschlos tippt, wird dorthin
   geschickt. Gross- und Kleinschreibung der Prozentzeichen wechselt je nach
   Browser, darum beide Formen.                                              */
const MIT_UMLAUT = /^\/l(?:\u00f6|%C3%B6|%c3%b6)schlos\/?$/;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.hostname === ALT) {
      // Query mitnehmen: ?level=uebung und ?modus=beamer sollen weiter gehen.
      return Response.redirect(NEU + url.search + url.hash, 301);
    }
    if (MIT_UMLAUT.test(url.pathname)) {
      return Response.redirect(url.origin + '/loeschlos/' + url.search + url.hash, 301);
    }
    // Ohne Schraegstrich landet eine Unterseite sonst in der Ersatzseite
    if (UNTERSEITEN.includes(url.pathname)) {
      return Response.redirect(url.origin + url.pathname + '/' + url.search + url.hash, 301);
    }
    return env.ASSETS.fetch(request);
  },
};
