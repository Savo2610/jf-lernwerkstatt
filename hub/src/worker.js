/* Ein Worker fuer die ganze Domain.

   jf.veerka.mp liefert die Startseite und darunter die Lernseiten /fwdv3/,
   /brennen-loeschen/ und /absichern/, die Truppauslosung /loeschlos/ sowie
   /nachweis/ – die Pruefseite fuer den Jugendwart, nirgends verlinkt.

   Der Worker laeuft vor der Dateiauslieferung (`run_worker_first`). Sonst
   kaemen die Dateien zuerst dran, und ein Pfad ohne Schraegstrich fiele ueber
   `not_found_handling` still in die Startseite, statt umgeleitet zu werden.  */
const UNTERSEITEN = ['/fwdv3', '/brennen-loeschen', '/absichern', '/nachweis', '/loeschlos'];

/* Loeschlos heisst mit Umlaut, die Adresse nicht. Ein oe im Pfad kommt als
   %C3%B6 an und ueberlebt weder QR-Code noch Zettel an der Pinnwand zuverlaessig.
   Kanonisch ist deshalb /loeschlos/; wer /löschlos tippt, wird dorthin
   geschickt. Gross- und Kleinschreibung der Prozentzeichen wechselt je nach
   Browser, darum beide Formen.                                              */
const MIT_UMLAUT = /^\/l(?:ö|%C3%B6|%c3%b6)schlos\/?$/;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
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
