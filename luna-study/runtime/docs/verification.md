# Preverjanje reference P01

Ponovno preverjeno 20. septembra 2026 po izvedbi protokolov B/0.3 in C/0.2:
68/68 preverjanj reference in 8/8 zaznanih namernih napak. Vsebinske
zahteve in testi ostajajo enaki; poročili vsebujeta aktualne kontrolne
vsote izvajalnika in obeh pripetih predlog Spec Kit. Šestnajst enotskih
testov izvajalnika je prav tako uspešnih.

Referenčna rešitev je uspešno prestala vseh 68 preverjanj. Preverjanje tipov,
sloga kode in gradnja so prav tako uspešni. Uporabljeni sta Node.js 24.11.1
in zaklenjena zbirka odvisnosti osnovne aplikacije.

Izhodišče: `horvatz/mag-app`, commit
`6dc1193f32a1fc00722fbc0983907d32b908cb51`; navodila P01 v0.2.

Izhodišče vsebuje potrjeni dizajn Folio z lebdečim stranskim menijem,
nežnimi modrimi poudarki in kompaktnimi karticami. Referenca uporablja
isti `styles.css` kot osnovna aplikacija, `editor.css` pa doda samo slog
urejanja P01. Zahteve, strežnik in testni scenariji so ostali enaki.

| Sklop | Uspešne izvedbe |
| --- | ---: |
| Skupni testi strežnika | 14/14 |
| Skupni testi vmesnika, računalnik in emulacija telefona | 24/24 |
| Štirje razvojni scenariji P01, oba prikaza | 8/8 |
| Enajst končnih scenarijev P01, oba prikaza | 22/22 |

Vsak test je začel s svežimi podatki. Preverjanja so bila izvedena zaporedno
v Chromiumu, brez samodejnega ponavljanja neuspelih testov. Namizni prikaz
je meril 1440 × 960, mobilni 390 × 664. Dodatni posnetki za vizualni pregled
merijo 1440 × 960 in 390 × 844. Pregledani posnetki obrazca
in napake ne kažejo prekrivanja ali vodoravnega prelivanja; shranjeni so v
`docs/preview/`. Emulacija ni preverjanje na fizičnem telefonu ali v Safariju.

## Namerno napačne različice

Vseh osem različic se je uspešno prevedlo. Vsako je zavrnil predvideni
končni scenarij na računalniškem prikazu:

| Napaka | Scenarij |
| --- | --- |
| M01: shranjevanje že med vnosom | E02 |
| M02: sprememba drugega opravila z enakim naslovom | E08 |
| M03: preverjanje naslova brez odstranitve robnih belih znakov | E03 |
| M04: sprememba samo v lokalnem prikazu | E06 |
| M05: zavrnitev zapre obrazec in zavrže vnos | E09 |
| M06: en pritisk pošlje dve zahtevi | E10 |
| M07: novo opravilo dobi prejšnji začasni vnos | E11 |
| M08: tabla in števci po uspehu ostanejo nespremenjeni | E06 |

Zaznavo potrdi neuspeh predvidene primerjave. Napaka prevajanja ali zagona
ne šteje kot zaznana napaka rešitve. Strojna povzetka sta v
`reports/reference-summary.json` in `reports/mutation-summary.json` ter
vsebujeta enake kontrolne vsote preverjenih virov. Celotni lokalni izpisi
in sledi so izključeni iz Gita.

Ti rezultati potrjujejo uporabnost meril na referenci in osmih konkretnih
napakah. Ne dokazujejo popolnosti testov. Ločen prvi pilot
postopka A je zdaj opravljen; njegov rezultat je v
[poročilu P01-A-001](../runs/P01-A-001/report.md). Rezultati v zgornjih tabelah
se nanašajo na referenco in namerno napačne različice.

Izvoz dovoljenega gradiva, lokalno omejeno okolje, beleženje in preverjanje
predaje so opisani v [protokolu pilota](pilot-protocol.md). Poskuse B in
razliko med uspehom kode ter zaključkom predaje dokumentira
[pregled pilotov](pilot-results.md). Koda B-002 je opravila 68/68 preverjanj,
celoten postopek pa se ni pravilno zaključil. Pri B-003 so uspešne vse tri
predaje in vseh 68 preverjanj. Tudi C-001 je opravil 68/68 preverjanj kode,
vendar ni zaključil predaje. Pri C-002 so uspešni vseh šest korakov Spec Kit
in vseh 68 neodvisnih preverjanj. P01 je zaključen kot prvi pilot A, B in C;
to še ni glavna raziskovalna primerjava.
