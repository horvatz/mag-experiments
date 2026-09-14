# Preverjanje P01, 15. september 2026

Referenčna rešitev je uspešno prestala vseh 68 preverjanj. Preverjanje tipov,
sloga kode in gradnja so prav tako uspešni. Uporabljeni sta Node.js 24.11.1
in zaklenjena zbirka odvisnosti osnovne aplikacije.

Izhodišče: `horvatz/mag-app`, commit
`6b383a6e16c87e3f6b276b48d781b70ca2354c97`; navodila P01 v0.2.

| Sklop | Uspešne izvedbe |
| --- | ---: |
| Skupni testi strežnika | 14/14 |
| Skupni testi vmesnika, računalnik in emulacija telefona | 24/24 |
| Štirje razvojni scenariji P01, oba prikaza | 8/8 |
| Enajst končnih scenarijev P01, oba prikaza | 22/22 |

Vsak test je začel s svežimi podatki. Preverjanja so bila izvedena zaporedno
v Chromiumu, brez samodejnega ponavljanja neuspelih testov. Namizni prikaz
je meril 1440 × 960, mobilni 390 × 664. Ročno pregledani posnetki obrazca
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
napakah. Ne dokazujejo popolnosti testov. Agentne izvedbe A/B/C še niso
bile opravljene; rezultati niso primerjava postopkov razvoja.

Pred prvo izvedbo potrebujemo izolirano okolje z dovoljenim gradivom,
preverjanje predanih sprememb, določene pozive in model ter skupne omejitve
časa in porabe. Lokalni strežnik in ločene mape so trenutno namenjeni
pripravi meril.
