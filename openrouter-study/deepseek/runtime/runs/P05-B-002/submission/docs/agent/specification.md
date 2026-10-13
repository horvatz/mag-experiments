# Razvojna specifikacija P05: Straničenje in filter stanja

Vloga: avtor specifikacije (P05, postopek B). Dokument določa pogoje za R01–R12;
izidi preverjanj se vpišejo po izvedbi (implementer/reviewer). Nič ni označeno kot preverjeno.

## Problem in kontekst

Aplikacija Folio prikazuje opravila enega projekta v preglednici ali na tabli.
Izhodišče prebere vsa opravila prek `GET /api/projects/:id/tasks` in jih prikaže
v celoti; nima izbire velikosti strani, filtra stanja niti navigacije po straneh.
Uporabnik želi v velikih projektih videti le del opravil ter filtrirati po stanju,
ob tem pa morajo pogledi, povezave in obstoječi videz ostati uporabni.

Predvidena sprememba je lokalno stanje v `ProjectView` (`src/App.tsx`) in ožji
pogled na opravila, ki ga prejmeta preglednica (`src/App.tsx`) in tabla
(`src/TaskBoard.tsx`). Podatki se še naprej berejo iz javnega API-ja `/api/`;
strežnik, `shared/`, skupni testi in odvisnosti se ne spreminjajo.

## Vhodi, dejanja in izidi

### Podatki (nespremenjeni tipi iz `shared/types.ts`)

- `Project { id, name }`; `Task { id, projectId, title, description, status, assignee, dueDate }`;
  `status ∈ { todo, in_progress, done }`.
- Branje: `GET /api/projects`, `GET /api/projects/:id/tasks`, `GET /api/tasks/:id`.
  Zapisov (`PATCH`) pri straničenju in filtriranju ni.
- Vrstni red opravil je izvorni vrstni red odgovora API-ja in se ne spreminja.
- Testni podatki so lahko poljubni: nič, eno ali več kot deset opravil, drugačni
  enkratni ID-ji, enaki naslovi, različna zaporedja, veljavni datumi, Unicode besedilo.
  Projekta sta lahko prazna; vsako opravilo pripada svojemu projektu.
- Testni mehanizem `/__test/` in pripomoček razvojnih testov se v UI ne uporabljata
  in se ne uvažata. Stanje se ne shranjuje v `localStorage`/`sessionStorage` niti v URL.

### Stanje straničenja (lokalno, ne v URL-ju)

- `filter ∈ { all, todo, in_progress, done }`, začetno `all`.
- `size ∈ { all, 2, 5, 10 }`, začetno `all`.
- `page` je 1-indeksiran, začetno `1`.
- `F = tasks.filter(matches(filter))` v izvornem vrstnem redu; `n = |F|`.
- `P` (število strani) = `0`, če `n = 0`; `1`, če `size = all`; sicer `ceil(n / size)`.
- `V` (prikazani odsek) = `[]`, če `n = 0`; `F`, če `size = all`; sicer
  `F.slice((page-1)*size, page*size)`.
- Invarianta: ob `n > 0` velja `1 ≤ page ≤ P`; ob `n = 0` je prikazana stran `0 od 0`.

### Dejanja in izidi

| Dejanje | Pravilo | Izid |
| --- | --- | --- |
| Izbira velikosti `s'` | `size := s'; page := 1` | Prva stran nove velikosti; `all` = ena stran pri `n > 0` |
| Izbira filtra `f'` | `filter := f'; page := 1` | `F` po novem filtru, prikaz od začetka; vrstni red nespremenjen |
| Prva stran | `page := 1` | Prva stran |
| Prejšnja stran | če `page > 1`: `page := page - 1`, sicer brez spremembe | Prejšnja stran oz. neveljavno dejanje |
| Naslednja stran | če `page < P`: `page := page + 1`, sicer brez spremembe | Naslednja stran oz. neveljavno dejanje |
| Zadnja stran | če `P > 0`: `page := P`, sicer brez spremembe | Zadnja stran oz. neveljavno dejanje |
| Preklop pogleda / odprtje / zaprtje podrobnosti | brez spremembe `size`, `filter`, `page` | Isti odsek ostane prikazan |
| Menjava projekta / osvežitev | `size := all; filter := all; page := 1` | Ponastavljeno stanje |
| Napaka branja | `retry` ponovi `GET`; brez zapisov | Obstoječe stanje napake/nalaganja |

Neveljavna dejanja so onemogočena (disabled) in ne spremenijo stanja. Med
nalaganjem in ob sočasnih spremembah podatkov velja invarianta iz prejšnjega
razdelka; če `page > P` ob `n > 0`, se stran omeji na `P` (brez izgube ID-jev).

## Zahteve in pravila

Simbole `F`, `n`, `P`, `V`, `page`, `size`, `filter` definira prejšnji razdelek.
`A = 1`, `B = n`, če `size = all` in `n > 0`; sicer `A = (page-1)*size + 1`,
`B = min(page*size, n)`. Pri `n > 0` je besedilo statusa natančno
`Stran {page} od {P}. Prikazano {A}–{B} od {n}.` (pomišljaj `–`, pika na koncu);
pri `n = 0` je besedilo `Stran 0 od 0. Prikazano 0–0 od 0.`
Za `size = all` je `P = 1` pri `n > 0`.

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Ob zagonu velja `size = all`, `filter = all`, `page = 1`; prikazan je `V = F = vsa opravila` v izvornem vrstnem redu. | Skupni D-test + lastni test: privzeti vrednosti obeh izbir in vrstni red vseh ID-jev. |
| R02 | Za `size ∈ {2,5,10}` je `V` zaporedni odsek `F` brez prekrivanja: `F = V(1) ++ … ++ V(P)` po vrsti; `|V| ≤ size`, zadnja stran je lahko krajša; vsak ID iz `F` točno enkrat. | Lastni test z znanim zaporedjem: zberi ID-je po straneh in primerjaj z `F`. |
| R03 | Prva/Prejšnja/Naslednja/Zadnja vodijo na `page = 1 / page-1 / page+1 / P`; na robu (`page ≤ 1` oz. `page ≥ P`) je gumb disabled in klik ne spremeni stanja. | Lastni test: kliki na robovih in primerjava ID-jev pred/po. |
| R04 | Vsaka sprememba velikosti nastavi `page = 1` tudi, če bi bila prejšnja stran veljavna; `all` pomeni `P = 1` pri `n > 0`. | Skupni D04 + lastni test: z veljavne srednje strani na novo velikost → prva stran; `all` → vsa opravila. |
| R05 | Filtriranje se izvede pred straničenjem (`F`, nato `V`); sprememba filtra nastavi `page = 1`; relativni vrstni red ujemajočih se opravil je nespremenjen. | Skupni D03 + lastni test: filter `todo` z velikostjo 2 → prva stran filtriranega zaporedja. |
| R06 | Preglednica in tabla prikažeta iste ID-je `V`; tabla razdeli `V` v stolpce po stanju (ne straniči vsakega stolpca posebej). | Skupni D03 + lastni test: primerjaj ID-je tabele in table ob istem stanju. |
| R07 | Preklop pogleda, odprtje in zaprtje podrobnosti ne spremenijo `size`, `filter`, `page`. | Lastni test: nastavi stran/velikost/filter, preklopi pogled in odpri/zapri podrobnosti, nato preveri isti `V` in status. |
| R08 | Menjava projekta in osvežitev (`reload`) nastavita `size = all`, `filter = all`, `page = 1`; stanje ni v trajni shrambi niti v URL-ju. | Lastni test: spremeni stanje, zamenjaj projekt/osveži, preveri privzete vrednosti; pregled, da URL/hash ne vsebuje parametrov strani. |
| R09 | Pri `n > 0`: status vsebuje `Stran {page} od {P}.` in `Prikazano {A}–{B} od {n}.` z 1-indeksoma `A`,`B`. | Skupni D02 + lastni test: srednja in zadnja stran z natančnim besedilom. |
| R10 | Pri `n = 0` (prazen projekt ali prazen rezultat filtra): status vsebuje `Stran 0 od 0. Prikazano 0–0 od 0.` in vsi štirje gumbi so disabled; ob vrnitvi filtra na `all` je `page = 1` in prikaz `F` (oz. prazno stanje). | Lastni test: prazen projekt; neprazen projekt z filtrom brez zadetkov; odstranitev filtra. |
| R11 | `Pregled stanj opravil` šteje celoten nefiltrirani projekt (vsi statusi); števci stolpcev table štejejo le `V`; skupno število opravil se zaradi straničenja ne zmanjša (npr. značka ob naslovu ostane `n` oz. skupno število, ne `|V|`). | Lastni test: primerjaj vsoto števcev pregleda s celotnim projektom, števce stolpcev z `V`, značko z `n`. |
| R12 | Straničenje ne pošilja zapisov (`POST/PUT/PATCH/DELETE`) in ne spremeni podatkov; obstoječe povezave na podrobnosti, `data-task-id`, `aria-label="Pregled stanj opravil"`, dostopna imena pogledov/stolpcev in Folio videz ostanejo uporabni; pri širini 390 px ni vodoravnega prelivanja strani (notranje drsenje tabele/table dovoljeno). | Skupni D04 (`readonly`) + lastni test: klik na povezavo/podrobnosti, `data-task-id` na vrsticah in karticah, preveritev širine. |

Dodatne omejitve vmesnika: `<select>` z dostopnim imenom `Velikost strani`
(vrednosti `all`, `2`, `5`, `10`) in `Filter strani` (`all`, `todo`, `in_progress`,
`done`); gumbi z imeni `Prva stran`, `Prejšnja stran`, `Naslednja stran`,
`Zadnja stran`; element `role=status` z `aria-label="Stanje straničenja"`.
Nova dejanja ob opravilu morajo biti zunaj njegove povezave. Besedilo, ki ni
določeno zgoraj, in razporeditev novih kontrol nista predpisana.

## Izvedba in sledljivost

Predvideni nosilci kode: stanje in izračun `F`, `P`, `V`, status ter kontrole v
`src/App.tsx` (komponenta `ProjectView`), tabla prejme le `V` v `src/TaskBoard.tsx`.
Skupni testi `tests/development/P05.spec.ts` (D01–D04) in `tests/development/helpers.ts`
so samo berljivi; lastni testi implementerja v `tests/agent/`.

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | privzeto all/all, vsa opravila | D-test privzetkov + lastni | `src/App.tsx` (stanje `ProjectView`) | ni še izvedeno |
| R02 | odseki brez izgube/podvajanja | lastni (znano zaporedje) | `src/App.tsx` (izračun `V`) | ni še izvedeno |
| R03 | navigacija in robovi | lastni (kliki, disabled) | `src/App.tsx` (gumbi) | ni še izvedeno |
| R04 | sprememba velikosti → stran 1 | D04 + lastni | `src/App.tsx` (handler velikosti) | ni še izvedeno |
| R05 | filter pred straničenjem | D03 + lastni | `src/App.tsx` (`F`) | ni še izvedeno |
| R06 | ista stran v obeh pogledih | D03 + lastni | `src/App.tsx`, `src/TaskBoard.tsx` | ni še izvedeno |
| R07 | pogled/podrobnosti ohranijo stanje | lastni | `src/App.tsx`, `src/navigation.ts` | ni še izvedeno |
| R08 | reset ob projektu/osvežitvi | lastni | `src/App.tsx` (`key={project.id}`) | ni še izvedeno |
| R09 | natančno besedilo statusa | D02 + lastni | `src/App.tsx` (status) | ni še izvedeno |
| R10 | prazno stanje in disabled | lastni | `src/App.tsx` (status, gumbi) | ni še izvedeno |
| R11 | pregled vsa, stolpci stran | lastni | `src/App.tsx`, `src/TaskBoard.tsx` | ni še izvedeno |
| R12 | brez zapisov, povezave, 390 px | D04 (`readonly`) + lastni | `src/App.tsx`, `src/TaskBoard.tsx`, `src/styles.css` | ni še izvedeno |

Dokazi morajo navajati ime testa in dnevnik zagona. Skupni testi D01–D04 so
izhodiščni primeri, ne celoten obseg; končne primere določajo zahteve R01–R12.

## Odprta vprašanja in omejitve

- Značka ob naslovu `Opravila` in razmerje `X / N končanih` v nogi nista izrecno
  predpisana; za R11 velja, da se ob straničenju ne smeta zmanjšati na `|V|`.
  Predpostavka: značka = `n` (filtrirani seznam), noga pa ohrani obstoječi pomen.
- Kaj se zgodi ob neuspešnem `GET` po spremembi strani, ni posebej predpisano;
  veljata obstoječa stanja nalaganja/napake in invarianta `page ≤ P`.
- Sočasne spremembe podatkov brez osvežitve niso del obsega (navedeno v navodilih).
- V tej fazi niso bili zagnani aplikacija, skupni testi niti lastni testi; vpise
  izidov in morebitne popravke opravi implementer oz. avtor v nadaljevani seji.
