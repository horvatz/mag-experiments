# P10: Lokalni vrstni red z razveljavitvami

Različica 1.0, glavna naloga. Vsi postopki prejmejo iste zahteve, izhodišče in razvojne teste. Začetni Folio ne vsebuje rešitve pilotov ali drugih glavnih nalog.

## Zahteve

| ID | Pričakovano delovanje |
| --- | --- |
| R01 | Ob začetku je vrstni red enak prejetemu polju. Vsako opravilo ima prikazano globalno mesto od 1 do N po svojem ID-ju; enaki naslovi se ne povezujejo. |
| R02 | Gumb Premakni <id> gor zamenja opravilo z neposrednim globalnim predhodnikom; Premakni <id> dol z neposrednim naslednikom. Polja opravil in status ostanejo nespremenjeni. |
| R03 | Premik gor za prvo oziroma dol za zadnje opravilo je onemogočen. Neveljavno ali ponovljeno robno dejanje ne spremeni vrstnega reda in ne doda zgodovine. |
| R04 | Vsak veljaven premik doda prejšnjo celotno permutacijo v zgodovino razveljavitev. Gumb Razveljavi premik obnovi zadnjo prejšnjo permutacijo in trenutni vrstni red shrani za ponovno izvedbo. |
| R05 | Gumb Ponovi premik obnovi zadnjo razveljavljeno permutacijo. Več razveljavitev in ponovitev ohrani pravilni zaporedji brez izgube ali podvajanja ID-jev. |
| R06 | Nov veljaven premik po razveljavitvi zavrže vso zgodovino ponovitev. Neveljaven premik na robu zgodovine ponovitev ne zavrže. |
| R07 | Hrani se največ 20 prejšnjih permutacij za razveljavitev; ob 21. veljavnem premiku se zavrže najstarejša. Ponovitve delujejo za vse trenutno razveljavljene korake. |
| R08 | Gumb Začetni vrstni red vrne izvorno permutacijo kot eno novo razveljavljivo dejanje in počisti ponovitve. Če je vrstni red že izvoren, je gumb onemogočen in ne spreminja zgodovine. |
| R09 | Preglednica prikazuje globalni vrstni red, tabla pa njegov relativni vrstni red znotraj stalnih stolpcev stanj. Na tabli premiki še vedno uporabljajo globalnega soseda, kar pokaže globalno mesto; ne spreminjajo statusa. |
| R10 | Preklop pogleda in odpiranje/zapiranje podrobnosti ohranita vrstni red ter obe zgodovini. Menjava projekta in osvežitev vse ponastavita na njegovo izhodišče. Podatki se ne shranjujejo trajno. |
| R11 | Števec kaže Razveljavitve: U. Ponovitve: R. in je usklajen z gumboma, ki sta onemogočena pri ničli. Prazen projekt in projekt z enim opravilom ostaneta uporabna brez dovoljenega premika. |
| R12 | Vse spremembe so lokalne permutacije iste množice ID-jev; ni zapisov na API ali sprememb polj. Števci stanj in pravilne podrobnosti ostanejo enaki, prilagodljiv Folio je ohranjen. |

## Dogovor o vmesniku

- Ob vrstici/kartici: gumba Premakni <id> gor in Premakni <id> dol, ločena od povezave; element aria-label=Mesto opravila <id> z globalno številko.
- Gumbi Razveljavi premik, Ponovi premik, Začetni vrstni red.
- Element role=status, aria-label=Zgodovina vrstnega reda, besedilo Razveljavitve: U. Ponovitve: R..

Ohrani `data-task-id` na vrsticah in karticah, dostopna imena obstoječih pogledov in stolpcev ter `aria-label="Pregled stanj opravil"`. Nova dejanja ob opravilu morajo biti zunaj njegove povezave. Na širini 390 pik se cela stran ne razširi; notranje drsenje preglednice in table je dovoljeno. Besedilo, ki ni izrecno določeno zgoraj, in razporeditev novih kontrol nista predpisana.

## Podatki, obseg in preverjanje

Podatke preberi iz obstoječega javnega API-ja. Testi lahko vrnejo poljubno število opravil (tudi nič, eno in več kot deset), drugačne enkratne ID-je, enake naslove, različno zaporedje in veljavne koledarske datume. Tipi in polja so enaki izhodišču. Projekta sta lahko prazna. Naslovi, opisi in imena so navadno besedilo, tudi z Unicode znaki in ločili. V nalogah z izbiro odgovorne osebe so imena neprazna in različna od rezervirane vrednosti `all`. Vsako opravilo pripada svojemu projektu.

Javni pripomoček razvojnih testov podaja dodatne podatke z nadzorovanimi GET odgovori. To je testni mehanizem, ki ga uporabniški vmesnik ne sme uvažati ali uporabljati. Aplikacija bere samo `/api/`; ne bere testnih kontrol `/__test/`. Strežnika, infrastrukture, odvisnosti in skupnih tipov ne spreminjaj. Razvojni primeri niso celoten obseg zahtev; končni primeri lahko uporabijo drugačne podatke iz opisane domene.

Navigacije med nezaključenim nalaganjem in novih sočasnih sprememb podatkov brez osvežitve ne širimo prek obstoječih regresijskih zahtev. Če posamezna zahteva ne določa trajne shrambe ali URL-ja, je stanje nove funkcionalnosti lokalno trenutnemu projektu. Ne dodajaj novih zapisovalnih API-jev.

## Oddaja

Spreminjaj samo `src/`, lastne teste v `tests/agent/` in dokumente v `docs/agent/`. Veljajo projektna pravila; omembe pilotov v dokumentih izhodišča so zgodovinske. Pripravi specifikacijo po skupni predlogi in poveži vseh R01–R12 s pogoji, kodo in dejansko izvedenimi testi. Izbrane pogoje opredeli tudi s predikati. Zapiši nepreverjene dele in omejitve; nedostopnih končnih testov ne navajaj kot opravljenih.
