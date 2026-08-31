/* ============================================================================
   Brennen & Löschen – Inhaltsdaten

   Quelle: Hessische Landesfeuerwehrschule, Ausbildungsleitfaden
   Truppausbildung, Truppmannausbildung Teil 1, Kapitel 2.3 „Brennen und
   Löschen", Ausgabe 10/2012 – ergänzt um den Truppführer-Lehrgang F-II,
   Ausgabe 02/2010 (Löschverfahren und Löschmittel im Einzelnen).
   Brandklassen nach DIN EN 2.

   Wörtliche Sätze sind als `zitat` gekennzeichnet; siehe referenz/brennen-
   loeschen/. Diese Datei ist Inhalt, kein Code: Was hier steht, lernen
   Kinder. Im Zweifel in der Unterlage nachsehen, nicht raten.
   ========================================================================== */

/* --- Die vier Voraussetzungen des Brennens --------------------------------
   Es sind vier – und trotzdem heisst das Bild „Verbrennungsdreieck". Das ist
   kein Widerspruch, sondern die uebliche Darstellung: An den drei Ecken stehen
   brennbarer Stoff, Sauerstoff und Zuendenergie, das richtige Mengenverhaeltnis
   steht in der Mitte. Es kann gar keine eigene Ecke haben, weil es kein Stoff
   ist, sondern das Verhaeltnis ZWISCHEN zweien der Ecken.

   Wer nur „drei" sagt, laesst es ganz weg – und genau daran haengt spaeter das
   halbe Loeschen: Verduennen, Abmagern und Trennen aendern alle nichts anderes
   als das Mengenverhaeltnis. Level 1 zeigt deshalb das vertraute Dreieck und
   benennt den Unterschied ausdruecklich.

   `stofflich` trennt die drei stofflichen von der einen energetischen
   Voraussetzung – so steht es in der Unterlage.                            */
const VORAUSSETZUNGEN = [
  {
    id: 'stoff', name: 'Brennbarer Stoff', icon: '🪵', farbe: '#a8642a', stofflich: true,
    kurz: 'Irgendetwas muss brennen können.',
    text: 'Holz, Benzin, Gas, Metall, Fett – jeder brennbare Stoff verhält sich anders. Deshalb teilt man sie in Brandklassen ein.',
    weg: 'Nimmst du den brennbaren Stoff weg, hat das Feuer nichts mehr zu fressen.',
  },
  {
    id: 'sauerstoff', name: 'Sauerstoff', icon: '💨', farbe: '#3aa8c4', stofflich: true,
    kurz: 'In unserer Luft sind rund 21 Prozent davon.',
    text: 'Der zur Verbrennung nötige Sauerstoff steckt zu etwa 21 Vol.-% in der Umgebungsluft. Unter 15 bis 17 Vol.-% erlöschen die meisten Brände.',
    zitat: 'Der zur Verbrennung notwendige Sauerstoff ist zu ca. 21 Vol.-% in der Umgebungsluft vorhanden.',
    weg: 'Verdrängst du den Sauerstoff, erstickt das Feuer.',
  },
  {
    id: 'menge', name: 'Richtiges Mengenverhältnis', icon: '⚖️', farbe: '#e0a021', stofflich: true,
    kurz: 'Stoff und Sauerstoff müssen zueinander passen.',
    text: 'Zu wenig Brennstoff in der Luft: nichts passiert. Zu viel: auch nichts. Nur dazwischen brennt es – und beim optimalen Verhältnis kann es sogar explodieren.',
    weg: 'Bringst du das Verhältnis durcheinander, hört die Verbrennung auf.',
  },
  {
    id: 'energie', name: 'Zündenergie', icon: '⚡', farbe: '#e8531a', stofflich: false,
    kurz: 'Ein Anstoß von außen muss her.',
    text: 'Ein Funke, eine Flamme, eine heiße Oberfläche, gebündeltes Sonnenlicht. Ohne diesen Anstoß bleibt selbst die perfekte Mischung kalt.',
    weg: 'Kühlst du unter die nötige Temperatur, geht das Feuer aus.',
  },
];

/* --- Was man von einer Verbrennung sieht und merkt -------------------------
   Nicht zu verwechseln mit den Voraussetzungen: Das hier ist das Ergebnis,
   nicht die Zutat. Die Verwechslung ist der häufigste Fehler in diesem Thema,
   deshalb ist genau das die Aufgabe in Level 1.                            */
const ERSCHEINUNGEN = [
  { id: 'flamme', name: 'Flamme', icon: '🔥',
    text: 'Brennende Gase und Dämpfe. Flüssigkeiten brennen nie selbst – es brennen ihre Dämpfe darüber.' },
  { id: 'glut', name: 'Glut', icon: '🟠',
    text: 'Ein fester oder flüssiger Stoff strahlt Wärme ab. Reine Glut gibt es bei Stoffen, die sich nicht weiter zersetzen: Holzkohle, Koks, Metalle.' },
  { id: 'waerme', name: 'Wärme', icon: '🌡️',
    text: 'Schwelbrand 200–300 °C, Großbrand 800–1000 °C, Metallbrand über 2500 °C.' },
  { id: 'rauch', name: 'Verbrennungs- und Zersetzungsprodukte', kurz: 'Rauch & Atemgifte', icon: '☁️',
    text: 'Kohlenmonoxid, Blausäure, Salzsäure und vieles mehr. Sie entstehen bei JEDEM Brand – darum geht ab der Rauchgrenze niemand ohne Atemschutz vor.' },
];

/* --- Brandklassen nach DIN EN 2 -------------------------------------------
   Reihenfolge A, B, C, D, F ist die der Norm. E fehlt nicht versehentlich –
   es gibt sie nicht. Das ist die Fangfrage des Themas.                     */
const BRANDKLASSEN = [
  {
    id: 'A', farbe: '#3f8f4a', icon: '🪵',
    braende: 'feste Stoffe',
    erscheinung: 'Flamme und/oder Glut',
    erscheinungIds: ['flamme', 'glut'],
    beispiele: ['Holz', 'Kohle', 'Papier', 'Stroh', 'Textilien', 'Autoreifen'],
    merke: 'Der Normalfall. Alles, was fest ist und Glut bilden kann.',
  },
  {
    id: 'B', farbe: '#c8442c', icon: '⛽',
    braende: 'flüssige und flüssig werdende Stoffe',
    erscheinung: 'Flamme',
    erscheinungIds: ['flamme'],
    beispiele: ['Benzin', 'Alkohol', 'Paraffin', 'Bitumen', 'Wachs'],
    merke: 'Achtung: „flüssig werdend" heißt, auch Kerzenwachs und viele Kunststoffe gehören hierher.',
  },
  {
    id: 'C', farbe: '#2f7fa8', icon: '🫧',
    braende: 'gasförmige Stoffe',
    erscheinung: 'Flamme',
    erscheinungIds: ['flamme'],
    beispiele: ['Erdgas', 'Acetylen', 'Methan', 'Propan'],
    merke: 'Erst die Zufuhr absperren, dann löschen. Ein gelöschtes Gasleck, aus dem weiter Gas strömt, ist gefährlicher als eine brennende Fackel.',
  },
  {
    id: 'D', farbe: '#7b6ea8', icon: '⚙️',
    braende: 'Metalle',
    erscheinung: 'Glut',
    erscheinungIds: ['glut'],
    beispiele: ['Magnesium', 'Aluminium', 'Natrium'],
    merke: 'Über 2500 °C. Bei diesen Temperaturen zerlegt Wasser sich selbst – kein Wasser, niemals.',
  },
  {
    id: 'F', farbe: '#d98a1f', icon: '🍳',
    braende: 'Speiseöle und -fette',
    erscheinung: 'Flamme',
    erscheinungIds: ['flamme'],
    beispiele: ['Frittierfett', 'Speiseöl', 'Palmin'],
    merke: 'Eigene Klasse, weil Wasser hier explodiert. Erst seit 2005 in der Norm.',
  },
];

/* Kunststoffe stehen in der Unterlage in A UND B, mit Fußnote. Das ist keine
   Schlamperei, sondern der Stand der Norm – und ein gutes Gespräch wert. */
const KUNSTSTOFF_HINWEIS =
  'Kunststoffe stehen in beiden Klassen. Die meisten verbrennen mit Glut wie feste Stoffe (A). ' +
  'Einige schmelzen vorher und brennen dann wie eine Flüssigkeit (B) – zum Beispiel die ' +
  'Verpackungskunststoffe Polyethylen und Polypropylen.';

/* Die Klasse, die es nicht gibt. Früher stand E für Brände in elektrischen
   Anlagen; abgeschafft, weil heute jeder Feuerlöscher bis 1000 V geprüft ist
   und es auf den brennenden Stoff ankommt, nicht auf den Strom. */
const KEINE_KLASSE_E =
  'Es gibt keine Brandklasse E. Es gab sie einmal – für Brände in elektrischen Anlagen. ' +
  'Sie wurde gestrichen, weil Strom kein brennbarer Stoff ist: Es brennt ja die Isolierung ' +
  'oder das Gerät. Einzuhalten sind stattdessen Sicherheitsabstände.';

/* --- Die Löschverfahren ---------------------------------------------------
   Der rote Faden dieser Seite. Level 1 hat gezeigt: Fällt eine der vier
   Voraussetzungen weg, ist Schluss. Die Löschverfahren sind nichts anderes
   als die Wege, genau das absichtlich herbeizuführen – und jeder von ihnen
   greift an einer anderen Stelle des Dreiecks an.

   `nimmt` zeigt auf VORAUSSETZUNGEN.id und ist zugleich der Angriffspunkt in
   Level 5. Die Zuordnung ist nicht geraten, sie steht wörtlich im
   Truppführer-Leitfaden: Zu jeder Spielart des Erstickens ist dort der
   „Einflussfaktor" genannt.
     Verdünnen – Einflussfaktor Sauerstoff
     Abmagern  – Einflussfaktor brennbarer Stoff
     Trennen   – Einflussfaktor Sauerstoff UND brennbarer Stoff
   Trennen sitzt deshalb in der Mitte: Es greift keine der beiden Ecken an,
   sondern das Verhältnis zwischen ihnen. Genau dort steht in Level 1 das
   Mengenverhältnis.

   „Hemmen" fällt aus der Reihe. Es nimmt überhaupt keine Voraussetzung weg,
   sondern greift die Verbrennungsreaktion selbst an – daher `nimmt:
   'reaktion'`, und daher ist sein Angriffspunkt in Level 5 die Flamme und
   kein Sockel. Wer das zu „nimmt die Energie" verkürzt, macht aus fünf
   Verfahren wieder vier und verliert den Wandeffekt.

   `familie` fasst zusammen, wie die Unterlage gliedert: drei Verfahren, und
   das mittlere hat drei Spielarten.                                       */
const LOESCHVERFAHREN = [
  {
    id: 'abkuehlen', name: 'Abkühlen', icon: '🥶', farbe: '#2f9fc4',
    familie: 'abkuehlen', nimmt: 'energie',
    kurz: 'Wärme entziehen, bis es nicht mehr reicht.',
    einfluss: 'Wärme',
    treffer: 'Richtig. Abkühlen entzieht die Wärme – der Angriffspunkt ist die Zündenergie.',
    text: 'Dem brennenden Stoff wird die zur Verbrennung nötige Wärme entzogen. Beim Wasser entzieht das Verdampfen fünfmal mehr Wärme als das bloße Erwärmen.',
    zitat: '„Abkühlen" ist ein Löschverfahren, bei dem den brennenden Stoffen entweder durch das Löschmittel oder durch andere Maßnahmen die zur Aufrechterhaltung der Verbrennung erforderliche Wärme entzogen wird.',
    mittel: ['wasser'],
  },
  {
    id: 'verduennen', name: 'Ersticken durch Verdünnen', kurzname: 'Verdünnen', icon: '🌬️', farbe: '#3aa8c4',
    familie: 'ersticken', nimmt: 'sauerstoff',
    kurz: 'Den Sauerstoff aus der Luft drängen.',
    einfluss: 'Sauerstoff',
    treffer: 'Richtig. Verdünnen drückt den Sauerstoff von 21 auf etwa 15 Vol.-% herunter.',
    text: 'Der Sauerstoffanteil wird von 21 Vol.-% auf die löschwirksame Konzentration von etwa 15 Vol.-% gesenkt.',
    zitat: 'Beim Verdünnen wird die Luftsauerstoffkonzentration von 21 Vol.-% auf die löschwirksame Konzentration von ca. 15 Vol.-%, d. h. unter die zur Aufrechterhaltung der Verbrennung benötigte Mindestsauerstoffkonzentration gesenkt.',
    mittel: ['co2', 'pulver'],
  },
  {
    id: 'abmagern', name: 'Ersticken durch Abmagern', kurzname: 'Abmagern', icon: '💦', farbe: '#5bb8b0',
    familie: 'ersticken', nimmt: 'stoff',
    kurz: 'Der Flüssigkeit die Dämpfe nehmen.',
    einfluss: 'brennbarer Stoff',
    treffer: 'Richtig. Ohne Dämpfe fehlt der brennbare Stoff – auch wenn dabei Wasser fließt.',
    text: 'Eine brennende Flüssigkeit wird mit Sprühstrahl unter ihren Flammpunkt gekühlt. Dann liefert sie keine brennbaren Dämpfe mehr nach – der Nachschub versiegt.',
    zitat: 'Die Löschwirkung beruht auf der Abkühlung brennender Flüssigkeiten durch den Einsatz von Sprühstrahl unter ihren Flammpunkt.',
    mittel: ['wasser'],
  },
  {
    id: 'trennen', name: 'Ersticken durch Trennen', kurzname: 'Trennen', icon: '🛡️', farbe: '#7aa8d8',
    familie: 'ersticken', nimmt: 'menge',
    kurz: 'Eine Decke zwischen Stoff und Luft legen.',
    einfluss: 'beide zusammen',
    treffer: 'Richtig. Stoff und Sauerstoff sind beide noch da. Sie kommen nur nicht mehr zusammen.',
    text: 'Das Löschmittel wird mechanisch zwischen die beiden Reaktionspartner gebracht. Stoff und Sauerstoff kommen gar nicht mehr zusammen.',
    zitat: 'Das Löschverfahren „Ersticken durch Trennen" beruht auf einer kompletten Trennung der beiden Reaktionspartner Sauerstoff und brennbarer Stoff.',
    mittel: ['schaum', 'fett'],
  },
  {
    id: 'hemmen', name: 'Hemmen der Reaktion', kurzname: 'Hemmen', icon: '🧱', farbe: '#c07ad8',
    familie: 'hemmen', nimmt: 'reaktion',
    kurz: 'Der Verbrennung ins Handwerk pfuschen.',
    einfluss: 'die Reaktion selbst',
    treffer: 'Richtig. Hemmen nimmt keine Voraussetzung weg, es bremst die Reaktion selbst aus.',
    text: 'Die Teilchen, die die Verbrennung am Laufen halten, prallen gegen Pulverkörnchen und verlieren dabei ihre Energie. Man nennt das den Wandeffekt.',
    zitat: 'Das reaktionshemmende Löschverfahren beruht auf der Tatsache, dass die zum Aufrechterhalten der Verbrennungsreaktion notwendigen reaktionsbeschleunigenden Energieträger durch den Aufprall auf eine Wand ihre Energie verlieren.',
    mittel: ['pulver'],
  },
];

/* Die drei Familien, wie die Unterlage sie gliedert. Nur zum Anzeigen: Die
   Wahrheit über die Zuordnung steht oben in `familie`.                     */
const LOESCHFAMILIEN = [
  { id: 'abkuehlen', name: 'Abkühlen', icon: '🥶',
    kurz: 'Wärme weg. Ein einziges Verfahren, ein einziges Mittel: Wasser.' },
  { id: 'ersticken', name: 'Ersticken', icon: '🫧',
    kurz: 'Am Mengenverhältnis drehen. Das geht auf drei Arten – am Sauerstoff, am Stoff oder an beidem.' },
  { id: 'hemmen', name: 'Hemmen der Reaktion', icon: '🧱',
    kurz: 'Nichts wegnehmen, sondern die Verbrennung selbst ausbremsen. Der Wandeffekt.' },
];

/* --- Die Löschmittel ------------------------------------------------------
   `haupt` ist die Hauptlöschwirkung – danach ordnet die Feuerwehrlehre ein.
   Nebenwirkungen stehen in `neben` und sind ausdrücklich zweitrangig.     */
const LOESCHMITTEL = [
  {
    id: 'wasser', name: 'Wasser', icon: '💧', farbe: '#1e9fc0',
    haupt: 'abkuehlen', neben: ['abmagern'],
    klassen: ['A'],
    wirkung: 'Kühlt. Wasser nimmt sehr viel Wärme auf – erst beim Erwärmen, vor allem aber beim Verdampfen.',
    merke: 'Aus einem Liter Wasser werden beim Sieden rund 1700 Liter Wasserdampf.',
    anwendung: 'Vollstrahl bündelt und dringt in die Glut ein. Sprühstrahl verteilt fein und kühlt viel besser, weil mehr verdampft.',
    grenzen: [
      'Fettbrand – das Wasser verdampft schlagartig und schleudert brennendes Fett meterweit (Fettexplosion).',
      'Metallbrand – über 1500 °C zerfällt Wasser in Wasserstoff und Sauerstoff. Knallgas.',
      'Staub – ein Vollstrahl wirbelt ihn auf, und dann kann es explodieren.',
      'Brennbare Flüssigkeiten – sie schwimmen obenauf und laufen brennend über.',
      'Einsturz – saugfähige Lagergüter werden schwer, Bauteile geben nach.',
      'Strom – Sicherheitsabstände einhalten: Sprühstrahl 1 m, Vollstrahl 5 m bei Niederspannung.',
    ],
  },
  {
    id: 'schaum', name: 'Schaum', icon: '🫧', farbe: '#6fc4d8',
    haupt: 'trennen', neben: ['abkuehlen'],
    klassen: ['A', 'B', 'F'],
    wirkung: 'Legt eine Decke zwischen Brandgut und Luft.',
    merke: 'Schaum ist Wasser plus Schaummittel plus Luft. Zumischrate im Regelfall 3 %.',
    anwendung: 'Bei Brandklasse B immer über eine Hilfsfläche auftragen – eine Wand, den Boden, den Behälterrand –, nie direkt in die brennende Flüssigkeit hinein.',
    grenzen: ['Leitet Strom. Nur in spannungsfreien Anlagen.', 'Pulver zerstört Schaum – die beiden vertragen sich nicht.'],
  },
  {
    id: 'pulver', name: 'Löschpulver', icon: '🌫️', farbe: '#b0a898',
    haupt: 'hemmen', neben: ['verduennen'],
    klassen: ['A', 'B', 'C', 'D'],
    wirkung: 'Greift direkt in die Verbrennungsreaktion ein (Wandeffekt).',
    merke: 'ABC-Pulver ähnelt Düngemittel, BC-Pulver Backpulver, D-Pulver Kochsalz.',
    anwendung: 'Kommt fast immer aus dem Feuerlöscher, als Pulverwolke. Löscht schlagartig – aber nur, wenn die Wolke groß genug ist.',
    grenzen: ['Kühlt kaum – es kann zurückzünden.', 'Geringe Reichweite, begrenzter Vorrat.', 'Die Wolke nimmt die Sicht und verdreckt alles.'],
  },
  {
    id: 'co2', name: 'Kohlendioxid', kurzname: 'CO₂', icon: '❄️', farbe: '#8fa8c0',
    haupt: 'verduennen', neben: [],
    klassen: ['B', 'C'],
    wirkung: 'Verdrängt den Sauerstoff. Das Feuer erstickt.',
    merke: 'Hinterlässt keine Rückstände – deshalb ideal für Serverräume und teure Technik.',
    anwendung: 'Nur in geschlossenen Räumen. Im Freien verweht es, bevor es wirkt.',
    grenzen: [
      'Atemgift. Ab 6–8 Vol.-% drohen Ohnmacht und Atemstillstand.',
      'Erfrierungen – niemals auf Menschen richten.',
      'Nichts für Glut und nichts für Metalle.',
    ],
  },
  {
    id: 'fett', name: 'Fettbrand-Löschmittel', kurzname: 'Fettbrand', icon: '🍳', farbe: '#e0a83f',
    haupt: 'trennen', neben: ['abkuehlen'],
    klassen: ['F', 'A', 'B'],
    wirkung: 'Reagiert mit dem heißen Fett zu einer gasdichten Schaumdecke (Verseifung) und kühlt dabei.',
    merke: 'Der einzige Löscher, der in die Küche gehört.',
    anwendung: 'Fein versprüht auf das brennende Fett.',
    grenzen: ['Nicht bei Metallbränden.', 'Geringe Reichweite.'],
  },
];

/* --- Die beiden Anwendungsarten des Wassers -------------------------------
   Kapitel 2.3 des Truppfuehrer-Leitfadens. Der Unterschied ist kein Detail
   fuer Fortgeschrittene: Er entscheidet, ob das Wasser die Glut ueberhaupt
   erreicht – oder ob es kuehlt, statt nur nass zu machen.               */
const STRAHLARTEN = [
  {
    id: 'voll', name: 'Vollstrahl', icon: '🎯', farbe: '#1e9fc0',
    kurz: 'Gebündelt und punktgenau.',
    text: 'Große Wurfweite und große Auftreffwucht: Der Strahl zerteilt die Glut und dringt tief ein.',
    schwaeche: 'Es verdampft wenig – zum Kühlen ist er der schlechtere Strahl. Und er wirbelt Staub auf.',
  },
  {
    id: 'spruehstrahl', name: 'Sprühstrahl', kurzname: 'Sprühstrahl', icon: '🌧️', farbe: '#6fc4d8',
    kurz: 'Fein verteilt und flächendeckend.',
    text: 'Viele kleine Tropfen haben zusammen eine viel größere Oberfläche. Also verdampft viel mehr Wasser – und Verdampfen kühlt.',
    schwaeche: 'Geringe Wurfweite, wenig Wucht. In die Glut hinein kommt er nicht.',
  },
];

/* Die drei Lagen aus Level 6, Runde 3. Jede hat genau einen Grund, warum die
   eine Strahlart passt und die andere nicht – Geschmackssache ist keine
   davon.                                                                  */
const STRAHLLAGEN = [
  {
    id: 'glutnest', richtig: 'voll',
    lage: 'Ein Holzstapel glüht tief im Inneren. Außen ist die Flamme schon aus.',
    warum: 'Nur der Vollstrahl hat die Wucht, die Glut zu zerteilen und bis in ihre Mitte einzudringen. Sprühstrahl macht den Stapel nur außen nass.',
  },
  {
    id: 'kuehlen', richtig: 'spruehstrahl',
    lage: 'Eine große heiße Wand steht neben dem Brand und muss schnell gekühlt werden.',
    warum: 'Fein verteilt verdampft viel mehr Wasser – und das Verdampfen entzieht fünfmal mehr Wärme als das bloße Erwärmen. Der Vollstrahl liefe größtenteils ungenutzt ab.',
  },
  {
    id: 'abmagern', richtig: 'spruehstrahl',
    lage: 'Eine Wanne mit brennender Flüssigkeit. Sie soll unter ihren Flammpunkt gekühlt werden.',
    warum: 'Das ist Abmagern, und es geht nur mit Sprühstrahl. Ein Vollstrahl würde die brennende Flüssigkeit aus der Wanne schleudern.',
  },
];

/* --- Fünf Brände, fünf Entscheidungen -------------------------------------
   Kapitel 6.7 der Truppmann-Unterlage („Löschmittel und Brandklassen"), als
   Lage statt als Tabelle. Level 6, Runde 2.

   `gut` ist das Mittel der Wahl, `auch` ist fachlich ebenfalls zugelassen
   und zählt nicht als Fehler – wer Schaum auf einen Fettbrand gibt, hat
   nichts falsch gemacht, auch wenn der Fettbrandlöscher der bessere Griff
   ist. `neutral` ist richtig gehandelt, löst die Lage aber nicht. Alles
   andere ist ein Fehlgriff und bekommt in `folge` seine Bescherung.

   Die Reihenfolge ist Absicht: erst der klare Fall, dann zwei, bei denen
   Wasser knallt, und zum Schluss der Gasbrand – bei dem das richtige
   Löschmittel gar keines ist.                                            */
const BRANDLAGEN = [
  {
    id: 'holzstapel', art: 'holz', klasse: 'A', name: 'Holzstapel',
    lage: 'Ein Stapel Scheitholz brennt. Unter der Flamme sitzt Glut, tief im Inneren.',
    gut: 'wasser', auch: ['schaum'],
    warum: 'Glut löscht man durch Abkühlen, und dafür ist Wasser gemacht: Beim Verdampfen nimmt es sehr viel Wärme mit.',
    auchWarum: 'Schaum ist in Brandklasse A zugelassen und kühlt auch – nur wäre hier ein Strahlrohr das nächstliegende Gerät.',
    falsch: {
      pulver: { folge: 'rueckzuendung', text: 'Kurz ist die Flamme weg – und dann brennt es wieder. Pulver kühlt so gut wie gar nicht, und die Glut sitzt noch drin.' },
      co2:    { folge: 'verweht', text: 'Im Freien verweht das Kohlendioxid, bevor es wirkt. Und für stark glutbildende Stoffe ist es ohnehin nichts.' },
      fett:   { folge: 'zuwenig', text: 'Der Fettbrandlöscher ist für die Fritteuse gebaut. Für einen Holzstapel reichen Menge und Reichweite hinten und vorne nicht.' },
    },
  },
  {
    id: 'benzin', art: 'kanister', klasse: 'B', name: 'Benzinlache',
    lage: 'Aus einem umgekippten Kanister ist Benzin gelaufen. Die Lache brennt.',
    gut: 'schaum', auch: ['pulver'],
    warum: 'Schaum legt sich als Decke über die Flüssigkeit. Stoff und Sauerstoff kommen nicht mehr zusammen – Ersticken durch Trennen.',
    auchWarum: 'Pulver löscht Brandklasse B schlagartig. Es kühlt aber nicht: Bleib löschbereit, es kann zurückzünden.',
    falsch: {
      wasser: { folge: 'ueberlaufen', text: 'Benzin schwimmt auf dem Wasser. Du hast die brennende Lache nicht gelöscht, sondern vergrößert.' },
      co2:    { folge: 'verweht', text: 'Kohlendioxid wirkt nur in geschlossenen Räumen. Hier draußen ist es weg, bevor es etwas ausrichtet.' },
      fett:   { folge: 'zuwenig', text: 'Zu wenig Löschmittel und zu wenig Reichweite für eine Lache in dieser Größe.' },
    },
    hinweis: 'Schaum wird bei Brandklasse B immer über eine Hilfsfläche aufgetragen – eine Wand, den Boden, den Behälterrand. Nie direkt hineinschießen.',
  },
  {
    id: 'magnesium', art: 'metall', klasse: 'D', name: 'Magnesiumspäne',
    lage: 'Magnesiumspäne brennen grellweiß. Über 2500 °C.',
    gut: 'pulver',
    warum: 'Nur D-Pulver. Es legt sich als Kruste über das Metall und trennt es von der Luft – die Kruste darf danach nicht wieder aufgerissen werden.',
    falsch: {
      wasser: { folge: 'knallgas', text: 'Bei diesen Temperaturen zerlegt Wasser sich selbst in Wasserstoff und Sauerstoff. Das ist Knallgas.' },
      schaum: { folge: 'knallgas', text: 'Schaum besteht zum größten Teil aus Wasser – mit demselben Ergebnis.' },
      co2:    { folge: 'zuwenig', text: 'Für Metallbrände ausdrücklich nicht einsetzbar.' },
      fett:   { folge: 'zuwenig', text: 'Für Metallbrände ausdrücklich nicht einsetzbar.' },
    },
  },
  {
    id: 'fritteuse', art: 'fritteuse', klasse: 'F', name: 'Fritteuse',
    lage: 'In der Küche des Feuerwehrhauses brennt das Frittierfett.',
    gut: 'fett', auch: ['schaum'],
    warum: 'Das Fettbrandlöschmittel reagiert mit dem heißen Fett zu einer gasdichten Decke – Verseifung – und kühlt dabei.',
    auchWarum: 'Schaum ist für Brandklasse F zugelassen. Der Fettbrandlöscher ist trotzdem der Griff, der in der Küche hängt.',
    falsch: {
      wasser: { folge: 'fettexplosion', text: 'Fettexplosion. Das Wasser verdampft im heißen Fett schlagartig auf das 1700-fache und schleudert brennendes Fett meterweit.' },
      pulver: { folge: 'zuwenig', text: 'Pulver ist für Brandklasse F nicht zugelassen. Der Druckstoß kann das brennende Fett außerdem aus der Wanne treiben.' },
      co2:    { folge: 'zuwenig', text: 'Kohlendioxid deckt Fett nicht ab – und der Druckstoß verteilt es im Raum.' },
    },
  },
  {
    id: 'gasflasche', art: 'gasflasche', klasse: 'C', name: 'Propanflasche',
    lage: 'Aus dem offenen Ventil einer Propanflasche schlägt eine Fackel.',
    gut: 'absperren', auch: [],
    neutral: { wasser: 'Die Flasche zu kühlen ist richtig und wichtig – sonst platzt sie. Den Brand löschst du damit aber nicht.' },
    warum: 'Bei Gasbränden wird zuerst die Zufuhr abgesperrt. Erst dann wird gelöscht – wenn dann überhaupt noch etwas brennt.',
    falsch: {
      pulver: { folge: 'gaswolke', text: 'Die Flamme ist aus – und jetzt strömt unsichtbares Gas in den Raum. Das ist gefährlicher als die Fackel, die du gerade gelöscht hast.' },
      co2:    { folge: 'gaswolke', text: 'Dasselbe Problem: gelöscht, aber die Zufuhr läuft weiter. Jetzt sammelt sich Gas.' },
      schaum: { folge: 'zuwenig', text: 'Auf eine Gasfackel bekommst du keine Schaumdecke.' },
      fett:   { folge: 'zuwenig', text: 'Nicht für Gasbrände.' },
    },
  },
];

/* --- Woraus Luft besteht ---------------------------------------------------
   Kapitel 3.1. Die 78 Prozent Stickstoff sind der Grund, warum ein Feuer in
   normaler Luft gemuetlich brennt und in reinem Sauerstoff rast.           */
const LUFT = [
  { id: 'stickstoff', name: 'Stickstoff', anteil: 78, icon: '🟦', farbe: '#7f96b8',
    text: 'Brennt nicht mit und hilft auch nicht. Er ist einfach da – und verdünnt alles.' },
  { id: 'sauerstoff', name: 'Sauerstoff', anteil: 21, icon: '💨', farbe: '#3aa8c4',
    text: 'Der Teil, auf den es ankommt. Rund ein Fünftel der Luft.' },
  { id: 'rest', name: 'Edelgase und CO₂', kurz: 'Rest', anteil: 1, icon: '⚪', farbe: '#b0a898',
    text: 'Argon, Kohlendioxid und Spuren von anderem. Für den Brand belanglos.' },
];

/* Ab wann ein Brand mangels Sauerstoff ausgeht. Der genaue Wert haengt vom
   Brennstoff ab und heisst Mindestsauerstoffkonzentration – fuer die
   Jugendfeuerwehr reicht die Spanne.                                       */
const SAUERSTOFF = {
  inLuft: 21,
  erlischtVon: 15,
  erlischtBis: 17,
  zitat: 'Die meisten Brände erlöschen bei einer Sauerstoffkonzentration von 15 Vol.-% bis 17 Vol.-%.',
};

/* --- Was mit mehr Sauerstoff zunimmt --------------------------------------
   Kapitel 3.3. Alle vier steigen, keine sinkt – das ist die Pointe.        */
const KENNGROESSEN = [
  { id: 'entzuendbarkeit', name: 'Entzündbarkeit', icon: '⚡',
    kurz: 'Es zündet leichter.',
    text: 'Je weniger Energie zum Zünden nötig ist, desto leichter entzündbar. In reinem Sauerstoff entzünden sich manche Stoffe von selbst – deshalb darf an Sauerstoffflaschen niemals Fett oder Öl.' },
  { id: 'brennbarkeit', name: 'Brennbarkeit', icon: '🔥',
    kurz: 'Es brennt weiter, auch ohne Zündquelle.',
    text: 'Bei genug Sauerstoff brennen sogar Stoffe, die sonst als nicht brennbar gelten – Eisen und Stahl zum Beispiel.' },
  { id: 'abbrandrate', name: 'Abbrandrate', icon: '⏱️',
    kurz: 'Es brennt schneller ab.',
    text: 'Ein Holzspan brennt in leicht erhöhter Sauerstoffkonzentration mit großer, heller, rauschender Flamme – und in viel kürzerer Zeit.' },
  { id: 'brandtemperatur', name: 'Brandtemperatur', icon: '🌡️',
    kurz: 'Es wird heißer.',
    text: 'Beim autogenen Schweißen nutzt man genau das aus: Acetylen mit reinem Sauerstoff.' },
];

/* --- Zerteilungsgrad ------------------------------------------------------
   Kapitel 4.1. Dieselbe Masse Holz, ganz verschiedenes Brandverhalten – der
   Unterschied ist allein die Oberflaeche, die Luft beruehren kann. `tempo`
   ist keine Messgroesse aus der Unterlage, sondern der Faktor, mit dem das
   Spiel das Rennen abspielt.                                              */
const ZERTEILUNG = [
  { id: 'balken', name: 'Ein Balken', icon: '🪵', tempo: 1,
    text: 'Wenig Oberfläche. Er glimmt außen und braucht ewig.' },
  { id: 'scheite', name: 'Gespalten', icon: '🪓', tempo: 2.4,
    text: 'Schon deutlich mehr Oberfläche – so legt man ein Lagerfeuer an.' },
  { id: 'spaene', name: 'Späne', icon: '🌾', tempo: 6,
    text: 'Viel Oberfläche. Entzündet sich sofort und ist genauso schnell wieder weg.' },
  { id: 'staub', name: 'Holzstaub', icon: '💥', tempo: 18,
    warnung: true,
    text: 'Feinstverteilt verhält sich ein Feststoff wie ein Gas – und kann explodieren. Damit ist in Mühlen, Schreinereien, Bäckereien und auf Dachböden zu rechnen.' },
];

/* --- Explosionsbereich ----------------------------------------------------
   Kapitel 4.3. Bewusst ohne Zahlenwerte: Die Grenzen sind stoffabhaengig,
   und fuer die Jugendfeuerwehr zaehlt das Prinzip – zu wenig geht nicht, zu
   viel auch nicht, dazwischen brennt es, und in der Mitte kracht es.      */
const MISCHUNG = [
  { id: 'mager', name: 'Zu mager', icon: '🌬️', farbe: '#7f96b8',
    kurz: 'Zu wenig Gas in der Luft.',
    text: 'Unterhalb der unteren Explosionsgrenze. Es ist zwar Gas da, aber zu wenig – es zündet nicht.' },
  { id: 'bereich', name: 'Im Explosionsbereich', icon: '💥', farbe: '#e8531a',
    kurz: 'Genau dazwischen. Es zündet.',
    text: 'Zwischen unterer und oberer Explosionsgrenze. Beim optimalen Mischungsverhältnis kann sich die Verbrennung bis zur Explosion steigern.' },
  { id: 'fett', name: 'Zu fett', icon: '🛢️', farbe: '#a8642a',
    kurz: 'Zu viel Gas in der Luft.',
    text: 'Oberhalb der oberen Explosionsgrenze. Jetzt fehlt der Sauerstoff – es zündet ebenfalls nicht. Gefährlich bleibt es trotzdem: Kommt Luft dazu, wandert die Mischung zurück in den Bereich.' },
];

/* --- Zuendquellen ---------------------------------------------------------
   Kapitel 5. Fremdzuendung heisst: Die Energie kommt von aussen.          */
const ZUENDQUELLEN = [
  { id: 'flamme',  name: 'Offene Flamme', icon: '🕯️', echt: true },
  { id: 'funke',   name: 'Funke',         icon: '✨', echt: true },
  { id: 'heiss',   name: 'Heiße Oberfläche', icon: '🍳', echt: true },
  { id: 'sonne',   name: 'Gebündeltes Sonnenlicht', icon: '🔍', echt: true },
  { id: 'reibung', name: 'Reibung',       icon: '🌀', echt: true },
  { id: 'strom',   name: 'Elektrischer Strom', icon: '🔌', echt: true },
  { id: 'blitz',   name: 'Blitzschlag',   icon: '🌩️', echt: true },
  { id: 'wind',    name: 'Wind',          icon: '🍃', echt: false,
    warum: 'Wind facht ein Feuer an, aber er zündet keines. Er bringt keine Energie – er bringt Sauerstoff.' },
  { id: 'rauch',   name: 'Rauch',         icon: '☁️', echt: false,
    warum: 'Rauch entsteht beim Brennen. Er ist Ergebnis, nicht Anstoß.' },
  { id: 'kaelte',  name: 'Kälte',         icon: '❄️', echt: false,
    warum: 'Kälte nimmt Energie weg. Genau damit löscht man.' },
];

/* --- Temperaturbegriffe ---------------------------------------------------
   Die drei werden gern verwechselt. Der Unterschied zwischen Flamm- und
   Brennpunkt ist genau einer: ob die Flamme bleibt.                       */
const TEMPERATUREN = [
  {
    id: 'flammpunkt', name: 'Flammpunkt', farbe: '#e0a021',
    kurz: 'Es zündet – und geht gleich wieder aus.',
    text: 'Die niedrigste Temperatur, bei der über einer Flüssigkeit so viele Dämpfe stehen, dass eine Zündquelle sie entzünden kann. Danach erlischt die Flamme wieder, weil zu wenig nachkommt.',
    braucht: 'Zündquelle',
    beispiele: [
      { stoff: 'Benzin', wert: 'unter −20 °C', hinweis: 'Steht bei jedem Wetter über seinem Flammpunkt. Deshalb so gefährlich.' },
      { stoff: 'Diesel', wert: 'über 55 °C', hinweis: 'Muss erst erwärmt werden – deutlich harmloser.' },
    ],
  },
  {
    id: 'brennpunkt', name: 'Brennpunkt', farbe: '#e8531a',
    kurz: 'Es zündet – und bleibt.',
    text: 'Die niedrigste Temperatur, bei der so viele Dämpfe nachkommen, dass die Verbrennung von selbst weiterläuft.',
    braucht: 'Zündquelle',
  },
  {
    id: 'zuendtemperatur', name: 'Zündtemperatur', farbe: '#c8241a',
    kurz: 'Es zündet ganz von allein.',
    text: 'Der Wärmezustand, bei dem sich ein Stoff in Gegenwart von Luft ohne jede Zündquelle entzündet.',
    braucht: 'keine Zündquelle',
  },
];

/* --- Regeln für den Feuerlöscher ------------------------------------------
   Aus der Unterlage, Kapitel 6.8. `richtig`/`falsch` sind die beiden Seiten
   des Bildpaares, mit dem das im Unterricht gezeigt wird.                 */
const LOESCHERREGELN = [
  { id: 'wind', icon: '🌬️', regel: 'Feuer mit dem Wind angreifen',
    warum: 'Der Wind trägt das Löschmittel ins Feuer statt weg – und hält den Rauch von dir fern.' },
  { id: 'flaeche', icon: '➡️', regel: 'Flächenbrände von vorn beginnend löschen',
    warum: 'Von vorn nach hinten, sonst treibst du das Feuer vor dir her.' },
  { id: 'stoss', icon: '💨', regel: 'Feststoffbrände mit kurzen Pulverstößen löschen',
    warum: 'So reicht der begrenzte Vorrat für die ganze Fläche.' },
  { id: 'zug', icon: '🔁', regel: 'Gas- und Flüssigkeitsbrände in einem Zug ohne Unterbrechung löschen',
    warum: 'Die Flammen müssen komplett von der Pulverwolke eingeschlossen werden. Eine Lücke – und es brennt weiter.' },
  { id: 'oben', icon: '⬇️', regel: 'Tropf- und Fließbrände von oben nach unten löschen',
    warum: 'Sonst zündet die nachlaufende brennende Flüssigkeit die schon gelöschte Fläche immer wieder neu an.' },
  { id: 'mehrere', icon: '🧯', regel: 'Ausreichend Feuerlöscher gleichzeitig einsetzen',
    warum: 'Nacheinander bringt weniger als gleichzeitig. Massiv drauf, dann ist es schlagartig aus.' },
  { id: 'kontrolle', icon: '👀', regel: 'Nach dem Löschen kontrollieren und Reserve behalten',
    warum: 'Pulver kühlt kaum. Es kann jederzeit zurückzünden.' },
];

/* --- Einsätze für den Ernstfall (Level 8) ---------------------------------
   Der Boss fragt nichts Neues ab. Er verlangt nur, dass man die Kette in der
   richtigen Reihenfolge durchgeht, so wie im Einsatz auch:

     Was brennt da?  →  Was muss weg?  →  Womit?

   Deshalb drei Entscheidungen je Lage und erst danach die Auflösung. Wer
   vorher schon eine Rückmeldung bekäme, könnte sich zur nächsten Antwort
   durchhangeln, statt sie zu wissen.

   `klasse`, `verfahren` und `mittel` zeigen auf BRANDKLASSEN, LOESCHVERFAHREN
   und LOESCHMITTEL. `mittelAuch` ist fachlich ebenfalls zulässig.          */
const EINSAETZE = [
  {
    id: 'kueche', art: 'fritteuse', ort: 'Küche im Feuerwehrhaus',
    lage: 'Beim Grillfest hat jemand die Fritteuse vergessen. Das Fett brennt.',
    klasse: 'F', verfahren: 'trennen', mittel: 'fett', mittelAuch: ['schaum'],
    aufloesung: 'Speisefett ist Brandklasse F. Der Fettbrandlöscher verseift die Oberfläche zu einer gasdichten Decke – Ersticken durch Trennen. Wasser wäre hier eine Fettexplosion.',
  },
  {
    id: 'laube', art: 'holz', ort: 'Gartenlaube',
    lage: 'Ein Holzstapel neben der Laube brennt lichterloh. Darunter sitzt Glut.',
    klasse: 'A', verfahren: 'abkuehlen', mittel: 'wasser', mittelAuch: ['schaum'],
    aufloesung: 'Fester Stoff mit Glut, also Brandklasse A. Glut löscht man durch Abkühlen, und dafür ist Wasser gemacht.',
  },
  {
    id: 'werkstatt', art: 'metall', ort: 'Werkstatt',
    lage: 'In der Metallwerkstatt brennen Magnesiumspäne grellweiß.',
    klasse: 'D', verfahren: 'trennen', mittel: 'pulver',
    aufloesung: 'Metall ist Brandklasse D. D-Pulver legt sich als Kruste über das Metall und trennt es von der Luft. Wasser zerfällt bei über 2500 °C zu Knallgas.',
  },
  {
    id: 'grill', art: 'gasflasche', ort: 'Hinter dem Gerätehaus',
    lage: 'Am Gasgrill hat sich der Schlauch gelöst. Aus der Flasche schlägt eine Fackel.',
    // Beim Verfahren zaehlen zwei Antworten: CO2 verduennt, Pulver hemmt –
    // beides sind zugelassene Loeschmittel fuer Klasse C. Die eigentliche
    // Pruefung dieses Einsatzes steckt in der dritten Frage.
    klasse: 'C', verfahren: 'verduennen', verfahrenAuch: ['hemmen'], mittel: 'absperren',
    aufloesung: 'Gas ist Brandklasse C. Löschen würde man es mit CO₂ (Verdünnen) oder mit Pulver (Hemmen) – aber davor steht immer das Absperren. Ein gelöschtes Leck, aus dem weiter Gas strömt, füllt den Raum mit einem unsichtbaren zündfähigen Gemisch.',
    hinweisMittel: 'Bei Gasbränden steht die Zufuhr an erster Stelle – vor jedem Löschmittel.',
  },
];

/* --- Fragen für den Gruppenabend ------------------------------------------
   `kat` und `wert` bauen die Feuerwand: vier Spalten, vier Reihen, 100 bis
   400 Punkte. Die Wand ist absichtlich jeden Abend dieselbe – der Jugendwart
   soll wissen, was kommt, und die Gruppe soll beim zweiten Mal merken, dass
   sie es jetzt kann.

   Fragen ohne `kat` kommen nur in der Blitzrunde vor.                     */
/* In den langen Namen steckt ein weiches Trennzeichen (U+00AD). Auf dem
   Beamer sieht man es nie; auf einem schmalen Schirm bricht die Spalte dort
   um, wo es hingehoert, statt mitten im Wort. */
const KATEGORIEN = [
  { id: 'brennen',  name: 'Warum es brennt',   icon: '🔥' },
  { id: 'klassen',  name: 'Brand\u00ADklassen',  icon: '🅰️' },
  { id: 'verfahren',name: 'Lösch\u00ADverfahren', icon: '🔻' },
  { id: 'mittel',   name: 'Lösch\u00ADmittel',    icon: '💧' },
];

const QUIZ = [
  // --- Warum es brennt ---
  { kat: 'brennen', wert: 100, f: 'Zu wie viel Prozent steckt Sauerstoff in der Luft?',
    o: ['ca. 12 %', 'ca. 21 %', 'ca. 45 %', 'ca. 78 %'], r: 1,
    e: 'Rund 21 Vol.-%. Die 78 % sind Stickstoff – der brennt nicht mit.' },
  { kat: 'brennen', wert: 200, f: 'Wie viele Voraussetzungen braucht eine Verbrennung?',
    o: ['Zwei', 'Drei', 'Vier', 'Fünf'], r: 2,
    e: 'Brennbarer Stoff, Sauerstoff und Zündenergie an den Ecken – und das richtige Mengenverhältnis in der Mitte. Deshalb heißt das Bild Dreieck und die Antwort trotzdem vier.' },
  { kat: 'brennen', wert: 300, f: 'Was ist der Unterschied zwischen Flammpunkt und Brennpunkt?',
    o: ['Am Brennpunkt braucht es keine Zündquelle mehr',
        'Am Flammpunkt geht es wieder aus, am Brennpunkt nicht',
        'Der Brennpunkt liegt unter dem Flammpunkt',
        'Es gibt zwischen beiden keinen Unterschied'], r: 1,
    e: 'Am Flammpunkt kommen gerade genug Dämpfe nach, dass es zündet – aber zu wenige, damit es weiterbrennt. Ohne Zündquelle geht es erst ab der Zündtemperatur.' },
  // Transferfrage: Die Zahl steht nirgends, man muss den Flammpunkt gegen die
  // Umgebungstemperatur halten. Genau das ist im Einsatz die Frage.
  { kat: 'brennen', wert: 400, f: 'Ein Lösungsmittel hat einen Flammpunkt von −20 °C. Was heißt das an einem Wintertag bei −5 °C?',
    o: ['Es kann nicht brennen, dafür ist es zu kalt',
        'Es gibt zündfähige Dämpfe ab',
        'Es entzündet sich von selbst',
        'Es brennt erst ab seinem Brennpunkt'], r: 1,
    e: 'Der Flammpunkt liegt unter der Umgebungstemperatur – über der Flüssigkeit steht also ein zündfähiges Dampf-Luft-Gemisch, und eine Zündquelle genügt. Von selbst zündet es trotzdem nicht: dafür bräuchte es die Zündtemperatur.' },

  // --- Brandklassen ---
  { kat: 'klassen', wert: 100, f: 'Welche Brandklasse hat ein brennender Holzstapel?',
    o: ['A', 'B', 'C', 'D'], r: 0,
    e: 'Feste Stoffe, die Glut bilden – Brandklasse A. Der Normalfall.' },
  { kat: 'klassen', wert: 200, f: 'Ein Kerzenstumpf brennt. Er fühlt sich fest an. Welche Klasse?',
    o: ['A', 'B', 'D', 'F'], r: 1,
    e: 'B. Die Norm sagt „flüssige und flüssig werdende Stoffe" – Wachs wird beim Brennen flüssig.' },
  { kat: 'klassen', wert: 300, f: 'Welche Brandklasse gibt es gar nicht?',
    o: ['C', 'D', 'E', 'F'], r: 2,
    e: 'Es gab sie einmal, für Brände in elektrischen Anlagen. Strom ist aber kein brennbarer Stoff – es brennt die Isolierung. Statt einer Klasse gelten Sicherheitsabstände.' },
  { kat: 'klassen', wert: 400, f: 'Ab welcher Temperatur zerfällt Wasser in Wasserstoff und Sauerstoff?',
    o: ['über 500 °C', 'über 1000 °C', 'über 1500 °C', 'über 2500 °C'], r: 2,
    e: 'Über 1500 °C. Ein Metallbrand wird über 2500 °C heiß – Wasser darauf ergibt Knallgas. Deshalb hat Klasse D ein eigenes Pulver.' },

  // --- Löschverfahren ---
  { kat: 'verfahren', wert: 100, f: 'Wie heißt das Verfahren, bei dem dem Brand Wärme entzogen wird?',
    o: ['Ersticken', 'Abkühlen', 'Hemmen', 'Abmagern'], r: 1,
    e: 'Abkühlen. Es greift die Zündenergie an – eine der drei Ecken des Dreiecks.' },
  { kat: 'verfahren', wert: 200, f: 'Welches Löschverfahren nimmt gar keine Voraussetzung weg?',
    o: ['Abkühlen', 'Verdünnen', 'Trennen', 'Hemmen'], r: 3,
    e: 'Hemmen greift die Verbrennungsreaktion selbst an: Die Energieträger prallen gegen Pulverkörnchen und verlieren ihre Energie. Das nennt man den Wandeffekt.' },
  { kat: 'verfahren', wert: 300, f: 'Wobei fließt Wasser – und es ist trotzdem kein Abkühlen?',
    o: ['Beim Verdünnen', 'Beim Abmagern', 'Beim Hemmen', 'Beim Vollstrahl'], r: 1,
    e: 'Abmagern kühlt eine brennende Flüssigkeit unter ihren Flammpunkt. Danach kommen keine Dämpfe mehr nach – es fehlt der brennbare Stoff, nicht die Wärme.' },
  { kat: 'verfahren', wert: 400, f: 'Ein Schaumteppich liegt auf einer Benzinlache. Welche Voraussetzung ist damit weg?',
    o: ['Der brennbare Stoff', 'Der Sauerstoff', 'Die Zündenergie', 'Das Mengenverhältnis'], r: 3,
    e: 'Keiner der beiden Stoffe ist weg – Benzin und Luft sind noch da. Sie kommen nur nicht mehr zusammen, und genau das ist das Mengenverhältnis. Deshalb steht Trennen in der Mitte des Dreiecks und nicht an einer Ecke.' },

  // --- Löschmittel ---
  { kat: 'mittel', wert: 100, f: 'Womit löscht ihr einen brennenden Holzstapel am besten?',
    o: ['Wasser', 'Kohlendioxid', 'Fettbrandlöscher', 'Gar nicht'], r: 0,
    e: 'Wasser. Es kühlt wie kein zweites Löschmittel – beim Verdampfen nimmt es sehr viel Wärme mit.' },
  { kat: 'mittel', wert: 200, f: 'Was ist die Hauptlöschwirkung von Löschpulver?',
    o: ['Abkühlen', 'Trennen', 'Hemmen', 'Abmagern'], r: 2,
    e: 'Der direkte Eingriff in die Verbrennungsreaktion. Dass die Wolke nebenbei auch verdünnt, ist ausdrücklich zweitrangig.' },
  { kat: 'mittel', wert: 300, f: 'Warum niemals Wasser in eine brennende Fritteuse?',
    o: ['Weil das Fett dabei hart wird',
        'Weil das Wasser den Strom weiterleitet',
        'Weil das Wasser schlagartig verdampft',
        'Weil das Fett dann nicht mehr brennt'], r: 2,
    e: 'Die Fettexplosion. Aus einem Liter Wasser werden 1700 Liter Dampf – und der reißt das brennende Fett meterweit mit.' },
  { kat: 'mittel', wert: 400, f: 'Aus einem Liter Wasser wird beim Verdampfen wie viel Wasserdampf?',
    o: ['etwa 17 Liter', 'etwa 170 Liter', 'etwa 1700 Liter', 'etwa 17 000 Liter'], r: 2,
    e: 'Rund 1700 Liter. Diese Ausdehnung ist der Grund, warum Wasser so gut kühlt – und warum es im heißen Fett explodiert.' },

  // --- nur für die Blitzrunde ---
  // Hier steht, was auf der Wand zu leicht wäre oder inhaltlich schon
  // besetzt ist. In der Blitzrunde zählt Tempo, nicht Schwierigkeit.
  { f: 'Ersticken hat drei Spielarten. Welche sind es?',
    o: ['Kühlen, Decken, Wehren', 'Verdünnen, Abmagern, Trennen',
        'Sprühen, Schäumen, Pulvern', 'Verdünnen, Kühlen, Hemmen'], r: 1,
    e: 'Alle drei ändern das Mengenverhältnis: Verdünnen am Sauerstoff, Abmagern am brennbaren Stoff, Trennen an beiden zugleich.' },
  { f: 'Bei welcher Sauerstoffkonzentration erlöschen die meisten Brände?',
    o: ['bei 2 bis 5 Vol.-%', 'bei 8 bis 10 Vol.-%', 'bei 15 bis 17 Vol.-%', 'bei 19 bis 20 Vol.-%'], r: 2,
    e: 'Zwischen 15 und 17 Vol.-%. Genau darauf zielt das Verdünnen: Es senkt den Sauerstoff von 21 Vol.-% unter die Mindestkonzentration.' },
  { f: 'Warum ist Kohlendioxid im Freien nutzlos?',
    o: ['Es ist zu kalt für den Brand', 'Es verweht, bevor es wirkt',
        'Es ist im Freien nicht zugelassen', 'Es brennt bei Hitze selbst'], r: 1,
    e: 'CO₂ löscht durch Verdünnen – dafür muss es beim Feuer bleiben. Im Freien zieht es ab. Deshalb nur in geschlossenen Räumen.' },
  { f: 'Warum hat Speisefett seit 2005 eine eigene Brandklasse?',
    o: ['Weil es besonders heiß brennt', 'Weil Wasser darin explodiert',
        'Weil es in der Küche vorkommt', 'Weil es sehr viel Rauch macht'], r: 1,
    e: 'Wasser verdampft im heißen Fett schlagartig auf das 1700-fache und schleudert brennendes Fett meterweit. Deshalb Klasse F und ein eigenes Löschmittel.' },
  { f: 'Was brennt bei einer brennenden Flüssigkeit?',
    o: ['Die Flüssigkeit selbst', 'Die Dämpfe darüber', 'Der Behälter darunter', 'Der Sauerstoff darin'], r: 1,
    e: 'Immer die Dämpfe über der Flüssigkeit. Nie die Flüssigkeit selbst.' },
  { f: 'Wind facht ein Feuer an. Was bringt er ihm?',
    o: ['Zündenergie', 'Sauerstoff', 'Brennbaren Stoff', 'Wärme'], r: 1,
    e: 'Sauerstoff. Energie bringt er keine – deshalb ist Wind auch keine Zündquelle.' },
  { f: 'Dieselbe Menge Holz: Was brennt am schnellsten ab?',
    o: ['Ein Balken', 'Gespaltene Scheite', 'Späne', 'Holzstaub'], r: 3,
    e: 'Je feiner verteilt, desto größer die Oberfläche. Holzstaub verhält sich wie ein Gas – und kann explodieren.' },
  { f: 'Was tut ihr zuerst bei einem Gasbrand?',
    o: ['Mit Pulver löschen', 'Die Zufuhr absperren', 'Wasser draufgeben', 'Wegrennen'], r: 1,
    e: 'Erst absperren, dann löschen. Sonst strömt unsichtbares Gas weiter.' },
  { f: 'Von welcher Seite greift man einen Brand mit dem Feuerlöscher an?',
    o: ['Gegen den Wind', 'Mit dem Wind', 'Von oben', 'Egal'], r: 1,
    e: 'Mit dem Wind. Der trägt das Löschmittel ins Feuer statt weg – und hält den Rauch von dir fern.' },
  { f: 'Feststoffbrand mit dem Pulverlöscher: wie?',
    o: ['In einem Zug leeren', 'In kurzen Stößen', 'Von hinten nach vorn', 'Mit Pausen von einer Minute'], r: 1,
    e: 'Kurze Stöße – so reicht der begrenzte Vorrat für die ganze Fläche.' },
  { f: 'Ihr seid zu zweit und habt zwei Feuerlöscher. Wie setzt ihr sie ein?',
    o: ['Einen nach dem anderen', 'Beide gleichzeitig',
        'Einen davon als Reserve zurückhalten', 'Abwechselnd in kurzen Stößen'], r: 1,
    e: 'Gleichzeitig. Nacheinander drückt der erste das Feuer nur herunter, und bis der zweite kommt, steht es wieder – dann sind beide leer.' },
  { f: 'Warum geht ab der Rauchgrenze niemand ohne Atemschutz vor?',
    o: ['Wegen der schlechten Sicht im Rauch', 'Wegen der Hitze im Brandraum',
        'Weil bei jedem Brand Atemgifte entstehen', 'Weil es die Vorschrift verlangt'], r: 2,
    e: 'Kohlenmonoxid, Blausäure und anderes entstehen bei JEDEM Brand. Was genau, hängt vom Brandgut ab – dass etwas entsteht, hängt von gar nichts ab.' },
  { f: 'Wie viel Schaummittel kommt im Regelfall ins Wasser?',
    o: ['0,5 %', '3 %', '10 %', '25 %'], r: 1,
    e: 'Die Zumischrate beträgt in der Regel 3 %. Wenn niemand etwas anderes sagt, stellt man den Zumischer darauf.' },
];


/* --- Ränge ----------------------------------------------------------------
   Eigene Reihe, nicht die des FwDV-3-Spiels: hier geht es um Brandlehre,
   nicht um Führung. Die Schwellen sind dieselben – gleiches Spielgefühl. */
const RAENGE = [
  { xp: 0,    name: 'Neugierig',        icon: '🔍' },
  { xp: 120,  name: 'Funkenfänger',     icon: '✨' },
  { xp: 320,  name: 'Brandwache',       icon: '👀' },
  { xp: 600,  name: 'Löschhelfer',      icon: '🪣' },
  { xp: 950,  name: 'Strahlrohrführer', icon: '💧' },
  { xp: 1400, name: 'Löschmeister',     icon: '🧯' },
  { xp: 2000, name: 'Brandkundler',     icon: '🎓' },
];

/* --- Abzeichen ------------------------------------------------------------ */
const ABZEICHEN = {
  dreieck:    { icon: '🔺', name: 'Statiker',        text: 'Das Verbrennungsdreieck auf Anhieb richtig aufgebaut' },
  erscheinung:{ icon: '👁️', name: 'Beobachter',      text: 'Voraussetzung und Erscheinung sauber getrennt' },
  klassen:    { icon: '🅰️', name: 'Sortierer',       text: 'Alle Brandklassen ohne Fehler zugeordnet' },
  keinE:      { icon: '🚫', name: 'Nicht reingefallen', text: 'Die Brandklasse E gibt es nicht – und du wusstest es' },
  luft:       { icon: '💨', name: 'Luftikus',        text: 'Die Luft ohne Fehler aufgeteilt' },
  oberflaeche:{ icon: '🌾', name: 'Spanleger',       text: 'Erkannt, dass die Oberfläche das Tempo macht' },
  temperatur: { icon: '🌡️', name: 'Punktgenau',      text: 'Flammpunkt, Brennpunkt und Zündtemperatur sauber getrennt' },
  zuendung:   { icon: '⚡', name: 'Funkensucher',    text: 'Jede Zündquelle erkannt – und jede Nicht-Zündquelle stehen lassen' },
  angriff:    { icon: '🎯', name: 'Angriffspunkt',   text: 'Jedes Löschverfahren an der richtigen Stelle angesetzt' },
  wasserzwei: { icon: '💦', name: 'Feinhörig',       text: 'Abkühlen und Abmagern auseinandergehalten – zweimal Wasser, zwei Verfahren' },
  wirkung:    { icon: '🫧', name: 'Wirkungsgradkenner', text: 'Jedem Löschmittel seine Hauptlöschwirkung zugeordnet' },
  einsatz:    { icon: '🧯', name: 'Löschmeister',    text: 'Fünf Brände, fünfmal richtig gegriffen' },
  wind:       { icon: '🌬️', name: 'Windleser',       text: 'Jeden Brand von der richtigen Seite angegriffen' },
  technik:    { icon: '🧯', name: 'Stoßweise',       text: 'Jedem Brand die richtige Löschtechnik gegeben' },
  ernstfall:  { icon: '🎓', name: 'Prüfungsreif',    text: 'Alle vier Einsätze ohne einen einzigen Fehlgriff entschieden' },
  meister:    { icon: '🎖️', name: 'Brandmeister',    text: 'Drei Sterne in jeder einzelnen Aufgabe' },
};
