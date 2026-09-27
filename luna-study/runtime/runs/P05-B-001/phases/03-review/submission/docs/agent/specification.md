# Specifikacija: straničenje in filter stanja

## Problem in kontekst

Folio prikaže opravila izbranega projekta kot preglednico ali tablo. Dodati je
treba filter stanja in straničenje, ki pred obema pogledoma izbereta isti
odsek seznama, ne da bi spremenila obstoječi videz, povezave ali podatke.

## Vhodi, dejanja in izidi

`Project` ima `id`, `name`; `Task` ima `id`, `projectId`, `title`, `description`,
`status`, `assignee`, `dueDate`. `TaskStatus` je `todo | in_progress | done`.
Projekti in opravila se berejo z `GET /api/projects` ter
`GET /api/projects/{id}/tasks`; vrstni red API-ja se ohrani.

Velikosti strani: `all`, `2`, `5`, `10`; filter: `all`, `todo`, `in_progress`,
`done`. Kontrole so selecta »Velikost strani« in »Filter strani« ter gumbi
»Prva stran«, »Prejšnja stran«, »Naslednja stran«, »Zadnja stran«. Status je
`role=status`, `aria-label="Stanje straničenja"`. Obstoječa imena pogledov in
stolpcev, `data-task-id`, `aria-label="Pregled stanj opravil"` ter povezave do
podrobnosti ostanejo; morebitno novo dejanje je zunaj povezave opravila.

Naj bo `T` API-seznam projekta, `F` filter, `S` velikost. `M` je filtrirani `T`
v istem vrstnem redu, `N=|M|`. Pri `N>0`: `Y=ceil(N/S)` za številčni `S`, sicer
`Y=1`; dovoljena stran `p∈[1,Y]`. `D=M[(p-1)S:pS]` za številčni `S`, sicer
`D=M`. Pri `N=0`: `Y=0`, `p=0`, `D=[]`. Tabla razporedi `D` po statusih šele po
straničenju. Ob spremembi filtra ali velikosti je `p=1`, če `N>0`, sicer `0`.

## Zahteve in pravila

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Začetno `S=all`, `F=all`; `D=T` v izvornem vrstnem redu. | Začetni seznam: ID-ji in vrstni red. |
| R02 | Velikosti 2/5/10 tvorijo zaporedne, disjunktne odseke `M`; zadnji sme biti krajši. | Primerjati ID-je čez vse strani. |
| R03 | Štirje gumbi nastavijo 1, `p−1`, `p+1`, `Y`; nedovoljen premik je onemogočen. | Preveriti cilje in robove. |
| R04 | Sprememba `S` vrne na prvo stran; `all` je ena stran za neprazen `M`. | Spremeniti velikost z zadnje strani. |
| R05 | Filter se uporabi pred straničenjem in spremeni stran na prvo; vrstni red ostane. | Filtrirati na strani `p>1`. |
| R06 | Preglednica in tabla pokažeta iste ID-je `D`; tabla ne straniči stolpcev ločeno. | Pri enakem stanju primerjati ID-je pogledov. |
| R07 | Menjava pogleda ter odpiranje/zapiranje podrobnosti ohranijo `S,F,p`. | Primerjati pred in po dejanju. |
| R08 | Menjava projekta/osvežitev ponastavi `S,F` na `all` ter `p=1` (oziroma `p=0` pri `N=0`); URL/shramba ne hranita straničenja. | Menjati projekt, osvežiti, pregledati izvedbo. |
| R09 | Pri `N>0`: »Stran p od Y« in »Prikazano A–B od N.«; `A=(p−1)S+1`, `B=min(pS,N)` (za `all`: `1,N`). | Polna in zadnja kratka stran. |
| R10 | Pri `N=0`: »Stran 0 od 0«, »Prikazano 0–0 od 0.«, vsi gumbi onemogočeni; izpraznitev filtra vrne na prvo stran. | Prazen projekt/filter in odstranitev filtra. |
| R11 | Pregled stanj in skupno število štejeta `T`; števci table štejejo samo kartice v `D`. | Primerjati števce med stranmi. |
| R12 | Straničenje ne spreminja podatkov in ne kliče zapisovalnega API-ja; ID-ji, podrobnosti, nalaganje ter Folio pri 390 px ostanejo uporabni; notranje drsenje je dovoljeno. | Pregled tokov API-ja, povezav in ozke postavitve. |

Pogoji veljajo za poljubno število opravil (0, 1, več kot 10), različne ID-je,
naslove z Unicode/ločili in poljuben vrstni red. Pri praznem rezultatu je
»Prikazano« dobesedno `0–0 od 0.`; pri nepraznem `A–B od N.`. Nezaključenega
nalaganja in sočasnih sprememb podatkov zahteve ne razširjajo.

## Izvedba in sledljivost

Pregled izhodiščne kode je opravil specifikacijski avtor; izvedba funkcije in
testi še niso preverjeni. Ciljna razporeditev odgovornosti:

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01–R05, R09–R10 | Izbor, reset strani, robovi in natančna oznaka po zgornjih pravilih. | Začetno, filtrirano, prazno, polno in zadnje stanje strani. | `src/App.tsx`, `ProjectView` — izračuni in kontrolniki. | Cilj pregleda; ni implementirano/preverjeno v tej fazi. |
| R06, R11 | `D` enak v tabeli/tabli; povzetek iz `T`, stolpci iz `D`. | Primerjati DOM-ID-je in števce ob preklopu/strani. | `src/App.tsx`, `ProjectView`; `src/TaskBoard.tsx`, `TaskBoard`. | Ni implementirano/preverjeno. |
| R07–R08 | Lokalna izbira traja view/detail hash-navigacijo; projekt/refresh resetira. | Navigacija med pogledi, detail open/close, projekt in reload. | `src/App.tsx`, `ProjectView`/`App`; `src/navigation.ts`, `useRoute`; `src/TaskDetails.tsx`, `close`. | Izvorni tok pregledan; nova izbira/test ni preverjena. |
| R12 | Branje ostane prek javnega API-ja; brez zapisov zaradi straničenja; odziven pogled in povezave delujejo. | Pregled zahteve API, ID-jev in širine 390 px. | `src/api.ts`, `src/useResource.ts`, `src/TaskBoard.tsx`, `src/styles.css`. | Samo izhodiščna koda pregledana; nova rešitev ni preverjena. |

Osnovna UI-vloga in poti potrjene v `src/App.tsx`; podatkovni tipi v
`shared/types.ts`; statusni stolpci in `data-task-id` v `src/TaskBoard.tsx`,
statusna značka ter nalaganje v `src/components.tsx`/`src/useResource.ts`.
Izhodiščni `App.tsx` še prikazuje vsa opravila brez filtra/straničenja.

## Odprta vprašanja in omejitve

Specifikacija določa ciljno vedenje, ne uspeha izvedbe. Implementer naj poroča
o dejansko izvedenih testih in dnevniku zagona; v tej vlogi aplikacije ali testov
nisem zagnal in videza nisem pregledal.
