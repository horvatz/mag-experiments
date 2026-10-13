# P05: Straničenje in filter stanja

Različica 1.0, glavna naloga. Vsi postopki prejmejo iste zahteve, izhodišče in razvojne teste. Začetni Folio ne vsebuje rešitve pilotov ali drugih glavnih nalog.

## Zahteve

| ID | Pričakovano delovanje |
| --- | --- |
| R01 | Privzeto je velikost strani all in filter all; vidna so vsa opravila v izvornem vrstnem redu. |
| R02 | Velikosti 2, 5 in 10 razdelijo trenutno filtrirano polje na zaporedne, neprekrivajoče se odseke. Zadnja stran je lahko krajša; noben ID se ne izgubi ali podvoji. |
| R03 | Prva stran, Prejšnja stran, Naslednja stran in Zadnja stran vodijo na ustrezno stran. Na robu je neveljavno dejanje onemogočeno in ne spremeni stanja. |
| R04 | Sprememba velikosti strani vedno vrne na prvo stran nove velikosti, tudi če bi bila prejšnja številka še veljavna. all pomeni eno stran pri nepraznem rezultatu. |
| R05 | Filter all/todo/in_progress/done se uporabi pred straničenjem; njegova sprememba vrne na prvo stran. Ne vpliva na vrstni red ujemajočih se opravil. |
| R06 | Preglednica in tabla kažeta iste ID-je trenutne strani. Tabla združi šele ta odsek v stolpce; ne straniči vsakega stolpca ločeno. |
| R07 | Preklop pogleda ter odpiranje in zapiranje podrobnosti ohranijo stran, velikost in filter. |
| R08 | Menjava projekta in osvežitev ponastavita velikost na all, filter na all ter stran na prvo. Stanje se ne hrani v trajni shrambi ali URL-ju. |
| R09 | Za neprazen rezultat status vsebuje Stran X od Y. Prikazano A–B od N., kjer sta A/B indeksa z začetkom 1 in N velikost filtriranega polja. |
| R10 | Za prazen projekt ali prazen rezultat filtra status vsebuje Stran 0 od 0. Prikazano 0–0 od 0. in vsi štirje gumbi za premik so onemogočeni. Ob odstranitvi filtra je spet prva stran. |
| R11 | Pregled stanj šteje celoten nefiltrirani projekt; števci stolpcev table štejejo prikazana opravila trenutne strani. Število vseh opravil se zaradi straničenja ne spremeni. |
| R12 | Straničenje ne spreminja podatkov in ne pošilja zapisov na API. Obstoječe povezave, pravilni ID-ji, podrobnosti, nalaganje in prilagodljiv videz Folio ostanejo uporabni. |

## Dogovor o vmesniku

- HTML select Velikost strani: all/2/5/10; Filter strani: all/todo/in_progress/done.
- Gumbi Prva stran, Prejšnja stran, Naslednja stran, Zadnja stran.
- Element role=status in aria-label=Stanje straničenja z natančnim besedilom iz zahtev (pomišljaj – med indeksoma).

Ohrani `data-task-id` na vrsticah in karticah, dostopna imena obstoječih pogledov in stolpcev ter `aria-label="Pregled stanj opravil"`. Nova dejanja ob opravilu morajo biti zunaj njegove povezave. Na širini 390 pik se cela stran ne razširi; notranje drsenje preglednice in table je dovoljeno. Besedilo, ki ni izrecno določeno zgoraj, in razporeditev novih kontrol nista predpisana.

## Podatki, obseg in preverjanje

Podatke preberi iz obstoječega javnega API-ja. Testi lahko vrnejo poljubno število opravil (tudi nič, eno in več kot deset), drugačne enkratne ID-je, enake naslove, različno zaporedje in veljavne koledarske datume. Tipi in polja so enaki izhodišču. Projekta sta lahko prazna. Naslovi, opisi in imena so navadno besedilo, tudi z Unicode znaki in ločili. V nalogah z izbiro odgovorne osebe so imena neprazna in različna od rezervirane vrednosti `all`. Vsako opravilo pripada svojemu projektu.

Javni pripomoček razvojnih testov podaja dodatne podatke z nadzorovanimi GET odgovori. To je testni mehanizem, ki ga uporabniški vmesnik ne sme uvažati ali uporabljati. Aplikacija bere samo `/api/`; ne bere testnih kontrol `/__test/`. Strežnika, infrastrukture, odvisnosti in skupnih tipov ne spreminjaj. Razvojni primeri niso celoten obseg zahtev; končni primeri lahko uporabijo drugačne podatke iz opisane domene.

Navigacije med nezaključenim nalaganjem in novih sočasnih sprememb podatkov brez osvežitve ne širimo prek obstoječih regresijskih zahtev. Če posamezna zahteva ne določa trajne shrambe ali URL-ja, je stanje nove funkcionalnosti lokalno trenutnemu projektu. Ne dodajaj novih zapisovalnih API-jev.

## Oddaja

Spreminjaj samo `src/`, lastne teste v `tests/agent/` in dokumente v `docs/agent/`. Veljajo projektna pravila; omembe pilotov v dokumentih izhodišča so zgodovinske. Pripravi specifikacijo po skupni predlogi in poveži vseh R01–R12 s pogoji, kodo in dejansko izvedenimi testi. Izbrane pogoje opredeli tudi s predikati. Zapiši nepreverjene dele in omejitve; nedostopnih končnih testov ne navajaj kot opravljenih.
