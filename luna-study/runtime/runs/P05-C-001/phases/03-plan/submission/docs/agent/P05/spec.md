# P05: Straničenje in filter stanja

## Problem in kontekst

Folio trenutno prikaže vsa opravila izbranega projekta v izvornem vrstnem redu v preglednici ali tabli. Pri daljših seznamih uporabnik potrebuje izbiro velikosti strani in filtra stanja, pri čemer mora ostati jasno, kateri del filtriranega seznama gleda. Nova funkcionalnost dopolni obstoječi pogled; podatki, neposredne povezave, podrobnosti, nalaganje in potrjeni odzivni dizajn Folio ostanejo uporabni.

Izhodiščni vmesnik bere projekte in opravila prek javnega `/api/`. Preglednica in tabla sta obstoječa pogleda, podrobnosti se odprejo prek povezave opravila, pregled stanj pa šteje celoten projekt. Vedenje določa ta specifikacija ter `task/instructions.md`; oblikovno vodilo je [`docs/dizajn.md`](../../dizajn.md).

## Vhodi, dejanja in izidi

**Vhodi.** Izbrani projekt in njegov urejeni seznam opravil iz API-ja. Vsako opravilo ima enkraten `id` in veljavno stanje `todo`, `in_progress` ali `done`; seznam je lahko prazen ali poljubne dolžine. Podatki se obravnavajo v vrstnem redu prejema, ne po naslovu ali ID-ju.

**Dejanja.** Uporabnik izbere velikost `all`, `2`, `5` ali `10`; izbere filter `all`, `todo`, `in_progress` ali `done`; uporabi gumbe Prva stran, Prejšnja stran, Naslednja stran in Zadnja stran; preklopi med preglednico in tablo; odpre ali zapre podrobnosti; zamenja projekt ali osveži stran.

**Rezultat in preklic.** Velikost in filter določita lokalno prikazan odsek opravil. Ni shranjevanja ali preklicnega postopka: sprememba izbire takoj uveljavi novo stanje. Nedovoljena navigacija na robu je onemogočena in brez učinka. Straničenje in filtriranje ne zapisujeta podatkov na API. Obstoječe nalaganje in napake ostanejo v veljavi; ta specifikacija ne širi navigacije med nezaključenim nalaganjem.

## Zahteve in pravila

### Model in predikati

Naj bo `T` seznam opravil izbranega projekta v vrstnem redu API-ja, `f` izbrani filter, `s` velikost strani in `p` trenutna stran. Filtrirani seznam `F` je `T`, če je `f = all`, sicer seznam elementov `t` iz `T`, za katere velja `status(t) = f`, ob ohranitvi vrstnega reda. Naj bo `N = |F|`.

- Število strani `Y = 0`, če je `N = 0`; sicer `Y = 1`, če je `s = all`; sicer `Y = ceil(N / s)`.
- Za neprazen rezultat velja `1 ≤ p ≤ Y`. Prikazani seznam `D` je celoten `F`, kadar je `s = all`; sicer `F[(p−1)s : min(ps, N)]`. Za prazen rezultat je `D = []` in status straničenja kaže stran 0 od 0.
- Za neprazen rezultat sta indeksa prikazanega odseka `A = (p−1)s + 1` in `B = min(ps, N)` pri številčni velikosti; pri `all` sta `A = 1`, `B = N`. Pri praznem rezultatu sta `A = B = 0`.
- Sprememba velikosti ali filtra nastavi `p = 1`. Menjava projekta in osvežitev nastavita `(s, f, p) = (all, all, 1)`. Preklop pogleda in odpiranje/zapiranje podrobnosti ohranijo `(s, f, p)`.
- Navigacija nastavi prvo stran na `1`, zadnjo na `Y`, prejšnjo na `p−1` in naslednjo na `p+1`, kadar je cilj veljaven. Če cilj ni veljaven, je ustrezni gumb onemogočen in stanje ostane nespremenjeno. Pri `Y = 0` so vsi štirje gumbi onemogočeni.
- Filtriranje in straničenje spreminjata samo izpeljan prikaz. Ne spreminjata `T`, ne sprožita zapisovalnega klica API-ja in stanja ne zapisujeta v trajno shrambo ali URL.

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Ob začetku sta `s = all`, `f = all`; vidni ID-ji so vsi iz `T` v istem vrstnem redu. | Začetno stanje z urejenim seznamom različnih opravil; primerjava vseh vidnih ID-jev in vrstnega reda. |
| R02 | Pri `s ∈ {2,5,10}` zaporedne strani razdelijo `F` v neprekrivajoče se odseke; zadnja je lahko krajša, združitev strani pa vsebuje vsak ID natanko enkrat. | Navigacija po seznamu različnih dolžin, vključno z nič, enim in več kot deset opravili; preverjanje ID-jev na vseh straneh. |
| R03 | Štirje gumbi izvedejo ustrezen veljaven premik. Na robu je premik onemogočen in ne spremeni `p`. | Preverjanje prve/srednje/zadnje strani ter neaktivnih gumbov in nespremenjenega stanja na robovih. |
| R04 | Vsaka sprememba velikosti nastavi prvo stran nove velikosti, tudi če bi stara številka strani še obstajala. `all` je ena stran za `N > 0`. | Sprememba velikosti z ne-prve strani, vključno s primerom, ko stara stran ostane znotraj novega obsega; preverjanje `all`. |
| R05 | Filter se uporabi pred straničenjem, ohrani vrstni red ujemajočih se opravil in ob spremembi nastavi prvo stran. | Mešana stanja in znan vrstni red; preverjanje vsebine, vrstnega reda in ponastavitve strani za vse štiri filtre. |
| R06 | Preglednica in tabla vsebujeta iste ID-je trenutnega `D`, vsak natanko enkrat. Tabla razdeli `D` v stolpce šele po straničenju. | Primerjava množic ID-jev obeh pogledov in stolpcev za stran z več stanji. |
| R07 | Preklop pogleda ter odpiranje in zapiranje podrobnosti ohranijo `s`, `f` in `p`. | Izvesti te prehode z neprivzetim filtrom, velikostjo in stranjo; po vsakem preveriti stanje in `D`. |
| R08 | Menjava projekta in osvežitev ponastavita `(s, f, p)` na `(all, all, 1)`; novo stanje straničenja ni v trajni shrambi ali URL-ju. | Preverjanje pred in po menjavi projekta ter osvežitvi, tudi pri ponovnem obisku in neposredni povezavi. |
| R09 | Pri `N > 0` status z `role="status"` in `aria-label="Stanje straničenja"` vsebuje `Stran X od Y` in `Prikazano A–B od N.`; indeksi se začnejo z 1. | Preveriti natančno besedilo za prvo, srednjo, zadnjo in `all` stran ter dostopne atribute. |
| R10 | Pri praznem projektu ali praznem rezultatu status vsebuje `Stran 0 od 0` in `Prikazano 0–0 od 0.`; vsi štirje gumbi so onemogočeni. Odstranitev filtra vrne prikaz na prvo stran. | Preveriti prazen API-jev seznam, filter brez ujemanj, onemogočene gumbe in obnovitev prve strani po filtru `all`. |
| R11 | Pregled stanj in skupno število opravil odražata celoten nefiltrirani `T`; števci stolpcev table odražajo samo opravila trenutnega `D`. | Primerjava celotnih števcev s `T` ter števcev stolpcev z vidnimi karticami pri filtrirani in omejeni strani. |
| R12 | Navigacija po straneh ne spremeni opravil in ne pošilja zapisov na API. Obstoječe povezave, ID-ji, podrobnosti, nalaganje in odzivni Folio ostanejo delujoči. | Preveriti nespremenjene podatke, odsotnost zapisovalnih zahtev ter regresijske povezave, podrobnosti in prikaz pri širini 390 px. |

### Dogovor o vmesniku in ohranjene omejitve

- HTML izbirnika: **Velikost strani** z vrednostmi `all/2/5/10` in **Filter strani** z vrednostmi `all/todo/in_progress/done`.
- Gumbi: **Prva stran**, **Prejšnja stran**, **Naslednja stran**, **Zadnja stran**.
- Status ima `role="status"`, `aria-label="Stanje straničenja"` ter zahtevani besedili z znakom `–` med indeksoma.
- Ohranijo se `data-task-id` na vrsticah in karticah, obstoječa dostopna imena pogledov in stolpcev ter `aria-label="Pregled stanj opravil"`. Nova dejanja ob opravilu so zunaj njegove povezave.
- Pri širini 390 px se stran kot celota ne razširi; dovoljena sta notranje drsenje preglednice in table. Dodatno besedilo in razporeditev novih kontrol nista predpisana; uporabi se potrjeni dizajn Folio.
- Uporabljajo se obstoječi tipi in polja. Testni podatki lahko vsebujejo poljubno število opravil, enolične različne ID-je, enake naslove, različen vrstni red in veljavne koledarske datume; projekt je lahko prazen. Vrednosti so navadno besedilo, tudi z Unicode znaki in ločili. Vsako opravilo pripada izbranemu projektu. Če testni podatki vsebujejo imena odgovornih oseb, so neprazna in različna od rezervirane vrednosti `all`.
- Testi lahko nadomestijo odgovore javnega API-ja z nadzorovanimi GET odzivi. Vmesnik bere samo `/api/`; ne uvaža ali kliče testnih pripomočkov in ne kliče `/__test/` za nastavitev odzivov, branje testnega stanja ali ponastavitev podatkov. Ne spreminjajo se strežnik, infrastruktura, odvisnosti ali skupni tipi. Ne dodajajo se zapisovalni API-ji.
- Navigacija med nezaključenim nalaganjem in ob novih sočasnih spremembah podatkov brez osvežitve ne dobi vedenja zunaj obstoječih regresijskih zahtev.

## Uporabniški scenariji

1. **Preglej vsa opravila.** Po odprtju projekta uporabnik vidi vsa opravila po vrsti API-ja, privzeto brez filtra in brez omejitve strani.
2. **Najdi stanje na več straneh.** Uporabnik izbere stanje in velikost, prelista rezultate ter vidi ujemajoče se ID-je v zaporednih odsekih. Zamenjava filtra ali velikosti začne pri prvi strani.
3. **Premakni se po straneh.** Uporabnik se premika na prvo, prejšnjo, naslednjo ali zadnjo stran; na mejah neveljavna gumba ne dovolita spremembe.
4. **Primerjaj pogleda in preglej opravilo.** Uporabnik preklaplja med preglednico in tablo ter odpira/zapira podrobnosti; izbrana stran, velikost in filter ostanejo enaki.
5. **Obravnavaj prazen rezultat.** Prazen projekt ali filter brez ujemanj pokaže ničelni status in onemogoči premike. Po odstranitvi filtra se prikaže prva stran rezultatov.
6. **Zamenjaj projekt ali osveži.** Uporabnik začne z `all/all/prva stran`; nov način straničenja se po osvežitvi ne obnovi iz shrambe ali URL-ja.

## Merila uspeha

- Za vseh R01–R12 je mogoče preveriti zapisani pogoj na poljubnih dovoljenih podatkih, ne le na začetnih fixture-jih.
- Noben ID ni izpuščen ali podvojen med stranmi; oba pogleda predstavljata isto trenutno stran.
- Status in gumbi nedvoumno predstavljajo običajne in prazne rezultate, števci pa sledijo zahtevanim celotnim oziroma trenutnim množicam.
- Straničenje ostane lokalna predstavitev podatkov ter ohrani obstoječe Folio poti in odzivni prikaz.

## Izvedba in sledljivost

Spodnja matrika povezuje vsak pogoj z načrtovanim preverjanjem. To je specifikacija pred izvedbo: koda, dejansko izvedeni testi in njihovi dnevniki še niso določeni ali potrjeni. Izid ostane **nepreverjen**, dokler ga poznejša faza ne podpre z dejanskim dokazom. Razdelitev dela bo v [`plan.md`](plan.md) in [`tasks.md`](tasks.md); po izvedbi se ta matrika dopolni s potmi do kode, testov in izvora rezultatov, brez podvajanja njihove vsebine.

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | Zgornji pogoj R01 | Začetno stanje in vrstni red | Določi se v planu/opravilih | Ni še izvedeno |
| R02 | Zgornji pogoj R02 | Celoten prehod čez zaporedne strani | Določi se v planu/opravilih | Ni še izvedeno |
| R03 | Zgornji pogoj R03 | Navigacija in robni gumbi | Določi se v planu/opravilih | Ni še izvedeno |
| R04 | Zgornji pogoj R04 | Menjava velikosti z ne-prve strani | Določi se v planu/opravilih | Ni še izvedeno |
| R05 | Zgornji pogoj R05 | Filtri, vrstni red in ponastavitev | Določi se v planu/opravilih | Ni še izvedeno |
| R06 | Zgornji pogoj R06 | Primerjava ID-jev preglednice in table | Določi se v planu/opravilih | Ni še izvedeno |
| R07 | Zgornji pogoj R07 | Preklop pogleda ter odpiranje/zapiranje | Določi se v planu/opravilih | Ni še izvedeno |
| R08 | Zgornji pogoj R08 | Menjava projekta, osvežitev in neposredna povezava | Določi se v planu/opravilih | Ni še izvedeno |
| R09 | Zgornji pogoj R09 | Besedilo in dostopnost statusa | Določi se v planu/opravilih | Ni še izvedeno |
| R10 | Zgornji pogoj R10 | Prazen projekt, prazen filter, odstranitev filtra | Določi se v planu/opravilih | Ni še izvedeno |
| R11 | Zgornji pogoj R11 | Celotni in prikazani števci | Določi se v planu/opravilih | Ni še izvedeno |
| R12 | Zgornji pogoj R12 | API brez zapisov in regresijski prikaz | Določi se v planu/opravilih | Ni še izvedeno |

## Odprta vprašanja in omejitve

Odprto vprašanje, ki bi preprečevalo specifikacijo, ni ostalo: vedenje in vrednosti kontrol določa `task/instructions.md`. Besedilo izven predpisanih oznak in razporeditev novih kontrol sta namenoma prepuščena izvedbi ob ohranitvi Folio. Končnih testov v tej fazi ni bilo mogoče potrditi; zgornja preverjanja so načrt, ne trditev o izvedenih testih.
