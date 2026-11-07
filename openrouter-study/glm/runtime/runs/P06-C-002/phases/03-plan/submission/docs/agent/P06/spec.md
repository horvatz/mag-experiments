# P06 — Nastavljiv izvoz CSV

**Različica:** 1.0 · **Datum specifikacije:** 2026-10-30

## Problem in kontekst

Folio danes prikazuje opravila izbranega projekta v preglednici in tabli ter podatke bere prek javnega API-ja. Uporabnik potrebuje izvoz teh opravil v CSV, ki spoštuje trenutni projekt, izvor in vrstni red ter omogoča izbor kolon, ločila in statusnega filtra.

Izvoz je izključno bralna funkcionalnost uporabniškega vmesnika. Ne spreminja opravil, ne dodaja zapisovalnih API-jev in ne uvaja nove odvisnosti ali infrastrukture.

## Vhodi, dejanja in izidi

- Podatkovni vir je obstoječi `/api/projects/{projectId}/tasks`. Uporabljena so polja `id`, `projectId`, `title`, `status`, `assignee`, `dueDate` in `description`; vsa so nizi.
- Dovoljene kolone so v nespremenljivem vrstnem redu: `id`, `projectId`, `title`, `status`, `assignee`, `dueDate`, `description`.
- Privzeto stanje ob izbiri projekta ali osvežitvi podatkov: izbrane vse kolone, ločilo `;`, filter `all`.
- Uporabnik lahko preklaplja kolone, izbere ločilo `;` ali `,` ter filter `all`, `todo`, `in_progress` ali `done`.
- Izvoz je omogočen natanko tedaj, ko je izbrana vsaj ena kolona in obstaja vsaj eno opravilo, ki ustreza filteru. Med nalaganjem ali napako API-ja izvoz ni na voljo.
- Uspešno dejanje ustvari lokalni prenos z imenom `folio-{projectId}.csv` in bajti UTF-8 z BOM `U+FEFF`. Vsebina se ne pošlje na strežnik in ne odpre nove strani.
- Preklic ali sprememba nastavitev ne ustvari dela datoteke; vsak klik na izvoz uporabi trenutne nastavitve.

### Pravila spremembe stanja

| Začetno stanje | Dogodek | Pričakovano stanje |
| --- | --- | --- |
| Projekte ali opravila se nalagajo | Nalaganje se zaključi | Privzete vrednosti za trenutni projekt; izvoz omogočen le, če obstajajo ustrezne vrstice |
| Nastavitve izvoza | Uporabnik spremeni kolone, ločilo ali filter | Nastavitve se takoj odrazijo v omogočenosti gumba in prihodnji vsebini |
| Nastavitve izvoza | Preklop med Preglednico in Tablo | Kolone, ločilo in filter se ohranijo |
| Nastavitve izvoza | Menjava projekta ali osvežitev podatkov | Vrnitev na privzete vrednosti |
| Veljavne nastavitve | Klik na Izvozi CSV | Ustvari se prenos; nastavitve in opravila ostanejo nespremenjena |

## Uporabniški scenariji

1. Uporabnik izbere projekt in brez sprememb izvozi CSV: prejme vse kolone v nespremenljivem vrstnem redu, vsa opravila v izvornem vrstnem redu ter privzeto ločilo `;`.
2. Uporabnik odstrne vse kolone: gumb je onemogočen in klik ne ustvari prenosa. Po ponovni izbiri kolone se izvoz znova omogoči, če filtrirani rezultat ni prazen.
3. Uporabnik izbere filter brez ujemanj: vmesnik še vedno prikazuje celoten projekt, izvoz pa je onemogočen.
4. Uporabnik izvozi naslove, opise ali odgovorne osebe z ločili, novo vrstico, narekovaji, šumniki ali začetkom formule: vrednosti ostanejo ohranjene, pravilno navedene in po potrebi nevtralizirane.
5. Uporabnik preklopi pogled ali zamenja projekt: pogled ne spremeni nastavitev, menjava projekta pa jih ponastavi.

## Zahteve in pravila

Splošni predikati:

- `selectedColumns ⊆ allowedColumns`
- `filteredTasks = Filter(tasks, filter)`
- `canExport = selectedColumns ≠ ∅ ∧ filteredTasks ≠ ∅`
- `csvValue(value) = Quote(FormulaNeutral(value))` za podatkovne vrednosti.
- `FormulaNeutral(value)` doda uvodni apostrof na začetek originalnega niza, če se niz po nič ali več začetnih znakih iz množice `{presledek, tabulator, CR, LF}` začne z `=`, `+`, `-` ali `@`; drugače vrednost vrne nespremenjeno.
- `Quote(value)` obda vrednost z dvojnimi narekovaji in podvoji vsak notranji dvojni narekovaj.
- Glava je sestavljena iz imen izbranih kolon v vrstnem redu `allowedColumns`; podatkovne vrstice sledijo vrstnemu redu `filteredTasks`, njihove vrednosti pa vrstnemu redu izbranih kolon.

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Izvoz zajame samo opravila trenutnega projekta v vrstnem redu API-ja. Privzeti filter je `all`, vse kolone so izbrane in ločilo je `;`. | Test s kontroliranim GET odgovorom preveri vrstni red in privzete nastavitve. |
| R02 | Uporabnik lahko izbira samo sedem dovoljenih kolon. Glava in vrednosti vedno sledijo nespremenljivemu vrstnemu redu, ne glede na zaporedje klikov. | Test izbira kolone v različnem vrstnem redu in primerja glavo ter vrstice. |
| R03 | Če ni izbrana nobena kolona, je izvoz onemogočen in klik ne ustvari prenosa. Ponovna izbira kolone omogoči izvoz, če obstajajo ustrezne vrstice. | Test preveri stanje gumba ter odsotnost oziroma prisotnost prekinitve prenosa. |
| R04 | Filter `all`, `todo`, `in_progress` ali `done` določi samo izvožene vrstice. Vmesnik ostane prikazan celoten projekt. Prazen projekt ali prazen filtrirani rezultat onemogoči izvoz. | Test s praznim projektom, praznim rezultatom in vsaj enim ujemajočim opravilom. |
| R05 | Ime datoteke je `folio-{projectId}.csv`. Bajti se začnejo z UTF-8 BOM `EF BB BF`. Prenos je lokalni, brez nove strani in brez pošiljanja vsebine na strežnik. | Playwright prestreze prenos in zahteve ter primerja bajte. |
| R06 | Ločilo je `;` ali `,`. Vsaka glava in vsaka vrednost sta obdani z dvojnimi narekovaji; notranji dvojni narekovaj je podvojen. | Test vsebuje vrednosti z obema ločiloma in narekovaji. |
| R07 | Vrstice CSV so ločene s CRLF, zadnja vrstica se konča s CRLF. Ločila in prelomi vrstic v vrednostih ostanejo znotraj navedene vrednosti. | Test vsebuje novo vrstico, CR, LF in obe dovoljeni ločili ter primerja bajte. |
| R08 | Pred navedbo podatkovne vrednosti se formula nevtralizira z uvodnim apostrofom, če se po presledku, tabulatorju, CR ali LF pojavi `=`, `+`, `-` ali `@`. Glava se ne nevtralizira. | Test zajame neposredne in preskočene nevarne začetke ter neškodljive vrednosti. |
| R09 | Unicode, presledki, šumniki in opisi ostanejo nespremenjeni, razen uvodnega apostrofa pri nevtralizaciji. `status` se izvozi kot `todo`, `in_progress` ali `done`; `dueDate` kot izvirni `YYYY-MM-DD`. | Test vsebuje Unicode, presledke, dolg opis, vse statuse in datume. |
| R10 | Preklop Preglednica/Tabla ohrani kolone, ločilo in filter. Enake nastavitve v obeh pogledih ustvarijo enake bajte datoteke. | Test izvozi v obeh pogledih in primerja bajte. |
| R11 | Menjava projekta ali osvežitev ponastavi kolone, ločilo in filter. Zaporedna izvoza po spremembi nastavitev vedno odražata trenutne nastavitve. | Test zamenja projekt, osveži podatke in dvakrat izvozi po spremembah. |
| R12 | Izvoz in njegove kontrole ne spremenijo opravila, izvornih polj ali obstoječih bralnih funkcij in ne pošljejo zapisov na API. Folio ostane prilagodljiv. | Regresijski testi preverijo obstoječe bralne poti, odsotnost zapisovalnih zahtev in obstoječe oznake. |

## Izvedba in sledljivost

Načrtovana izvedba je v `src/App.tsx` in po potrebi v pomožnem modulu znotraj `src/`. Lastni scenariji bodo v `tests/agent/csv-export.spec.ts`; skupne regresijske teste je treba pognati po implementaciji.

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | Trenutni projekt, izvorni vrstni red in privzete nastavitve | `P06 default export` | Izvoz v uporabniškem vmesniku | Ni izvedeno v fazi specifikacije |
| R02 | Nespremenljivi vrstni red kolon | `P06 column order` | Izvoz v uporabniškem vmesniku | Ni izvedeno v fazi specifikacije |
| R03 | Onemogočen izvoz brez kolon | `P06 no columns` | Stanje gumba izvoza | Ni izvedeno v fazi specifikacije |
| R04 | Filtriranje in prazen rezultat | `P06 filters` | Izvoz v uporabniškem vmesniku | Ni izvedeno v fazi specifikacije |
| R05 | Ime, BOM in lokalni prenos | `P06 download bytes` | Izvoz v uporabniškem vmesniku | Ni izvedeno v fazi specifikacije |
| R06 | Ločilo, navedba in podvajanje | `P06 quoting` | Izvozna pretvorba CSV | Ni izvedeno v fazi specifikacije |
| R07 | CRLF in ohranjene vrednosti | `P06 line endings` | Izvozna pretvorba CSV | Ni izvedeno v fazi specifikacije |
| R08 | Nevtralizacija podatkovnih formul | `P06 formula neutralization` | Izvozna pretvorba CSV | Ni izvedeno v fazi specifikacije |
| R09 | Unicode, status in datum | `P06 unicode and raw values` | Izvozna pretvorba CSV | Ni izvedeno v fazi specifikacije |
| R10 | Ohranitev nastavitev med pogledi | `P06 view parity` | Stanje izvoza v uporabniškem vmesniku | Ni izvedeno v fazi specifikacije |
| R11 | Ponastavitev ob menjavi ali osvežitvi | `P06 project reset` | Stanje izvoza v uporabniškem vmesniku | Ni izvedeno v fazi specifikacije |
| R12 | Brez sprememb podatkov in API-jev | `P06 read-only regression` | Izvoz v uporabniškem vmesniku | Ni izvedeno v fazi specifikacije |

## Sprejemni pogoji

- Vsi testi, ki pokrivajo R01–R12, so dejansko izvedeni in uspešni.
- Skupni testi izhodišča ostanejo uspešni.
- Nobena zahteva iz `task/instructions.md` ni izpuščena ali razširjena z novimi zunanjimi merljivimi cilji.

## Odprta vprašanja in omejitve

- Bistvenih odprtih vprašanj ni. Nedoločena razporeditev novih kontrol in nepredpisano besedilo ostajata prosto oblikovni odločitvi v okviru Folia.
- Stanje izvoza ni shranjeno v URL ali trajno shrambo; velja za trenutni projekt in se ponastavi ob menjavi projekta ali osvežitvi podatkov.
- Sočasna spreminjanja podatkov brez osvežitve niso del obstoječih regresijskih zahtev in niso razširjena.
- V tej fazi specifikacije testi še niso izvedeni. Izidov, ki jih bo prinesla implementacija, ne smemo označiti za uspešne pred dejavnim zagonom.
