/* Ein Worker fuer beide Adressen.

   jf.veerka.mp    liefert die Startseite und unter /fwdv3/ das Spiel.
   fwdv3.veerka.mp ist die alte Adresse des Spiels und leitet dauerhaft um.

   Der Worker laeuft vor der Dateiauslieferung (`run_worker_first`), sonst
   bekaeme fwdv3.veerka.mp/ die Startseite ausgeliefert, statt umgeleitet zu
   werden.                                                                    */
const ALT = 'fwdv3.veerka.mp';
const NEU = 'https://jf.veerka.mp/fwdv3/';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.hostname === ALT) {
      // Query mitnehmen: ?level=uebung und ?modus=beamer sollen weiter gehen.
      return Response.redirect(NEU + url.search + url.hash, 301);
    }
    // /fwdv3 ohne Schraegstrich landet sonst in der Ersatzseite
    if (url.pathname === '/fwdv3') {
      return Response.redirect(url.origin + '/fwdv3/' + url.search + url.hash, 301);
    }
    return env.ASSETS.fetch(request);
  },
};
