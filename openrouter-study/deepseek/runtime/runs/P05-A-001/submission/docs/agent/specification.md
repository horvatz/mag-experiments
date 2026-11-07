# Razvojna specifikacija — P05: Straničenje in filter stanja

Izpolnjena predloga `task/specification-template.md` za postopek A (en agent).
Datum: 2026-10-08.

## Problem in kontekst

Uporabnik v projektu Folio pregleduje opravila v preglednici ali na tabli.
Izhodišče prikaže vsa opravila projekta hkrati, brez možnosti omejitve po
stanju ali razdelitve na strani. Pri projektih z veliko opravili je pregled
nepregleden, zato naloga doda:

- izbiro velikosti strani (`all`, `2`, `5`, `10`),
- filter stanja (`all`, `todo`, `in_progress`, `done`),
- premikanje po straneh (prva/prejšnja/naslednja/zadnja stran) z jasnim
  statusom obsega.

Zahteve R01–R12 so v `task/instructions.md`. Aplikacija ostaja odjemalec
javnega API-ja `/api/`; stanje straničenja je lokalno stanje trenutnega
projekta v pomnilniku komponente (brez URL-ja in trajne shrambe).

## Vhodi, dejanja in izidi

Podatki: `Task { id, projectId, title, description, status, assignee, dueDate }`
in `Project { id, name }` iz `shared/types.ts`. Opravila bere
`GET /api/projects/:id/tasks`; podrobnosti berejo `GET /api/tasks/:id`.
Naloga ne dodaja nobenega zapisovalnega klica.

Stanje nove funkcionalnosti v `ProjectView`:

- `size: 'all' | '2' | '5' | '10'`, privzeto `all`;
- `filter: 'all' | 'todo' | 'in_progress' | 'done'`, privzeto `all`;
- `page: number` (1-osnovni), privzeto `1`.

Dovoljena dejanja in izidi:

| Dejanje | Pogoj | Izid |
| --- | --- | --- |
| sprememba velikosti strani | vedno | `size = nova vrednost`, `page = 1` |
| sprememba filtra stanja | vedno | `filter = nova vrednost`, `page = 1` |
| Prva stran | `X > 1` | `page = 1` |
| Prejšnja stran | `X > 1` | `page = X - 1` |
| Naslednja stran | `X < Y` | `page = X + 1` |
| Zadnja stran | `X < Y` | `page = Y` |
| premik na robu | `Y = 0` ali `X = 1` oz. `X = Y` | gumb onemogočen, stanje nespremenjeno |
| preklop pogleda, odprtje/zaprtje podrobnosti | vedno | `size`, `filter`, `page` nespremenjeni |
| menjava projekta, osvežitev strani | vedno | ponovni zagon: `size = all`, `filter = all`, `page = 1` |
| napaka branja | API ne uspe | obstoječi `LoadError` z gumbom Poskusi znova; stanje straničenja se ne prikaže |

## Zahteve in pravila

Splošna pravila (simbologi):

- `P` — opravila projekta v izvornem vrstnem redu iz API-ja, `N = |P|`.
- `F` — filtrirano polje: `F = P`, če je `f = all`, sicer
  `F = [t ∈ P : t.status = f]`; vrstni red elementov `P` se ohrani.
- `M = |F|` — velikost filtriranega polja (N iz besedila zahtev).
- `s ∈ {all, 2, 5, 10}` — velikost strani; `k = s = all ? max(M,1) : s`.
- `Y` — število strani: `Y = 0`, če `M = 0`; `Y = 1`, če `s = all` in `M > 0`;
  sicer `Y = ceil(M / s)`.
- `X` — veljavna stran: `X = 0`, če `Y = 0`; sicer `X = min(max(page, 1), Y)`.
- `A = M = 0 ? 0 : (X-1)·k + 1`, `B = M = 0 ? 0 : min(X·k, M)`.
- Odsek strani: `S = F[A-1 … B-1]` (prazno pri `M = 0`).
- Status: `Stran X od Y. Prikazano A–B od M.` (pomišljaj U+2013).

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Ob zagonu velja `size = all`, `filter = all`, `page = 1`; `F = P`; prikazani so vsi ID-ji v izvornem vrstnem redu. | Test A01, razvojni D01/D03 |
| R02 | `s ∈ {2,5,10}` razdeli `F` na zaporedne odseke `S_i = F[(i-1)·s … min(i·s, M)-1]`, `i = 1..Y`; unija je `F`, preseki prazni, zato se noben ID ne izgubi ali podvoji; zadnji odsek je lahko krajši. | Test A02/A03, razvojni D01/D02 |
| R03 | Gumbi premikajo `page` natanko na 1, `X-1`, `X+1` oz. `Y`; pri `X = 1` sta prva/prejšnja onemogočena, pri `X = Y` naslednja/zadnja; pri `Y = 0` so vsi štirje onemogočeni; onemogočen gumb ne spremeni stanja. | Test A02/A05, razvojni D02 |
| R04 | Ob spremembi `s` velja `page = 1`, tudi če je prejšnja stran še veljavna; pri `s = all` in `M > 0` je `Y = 1`. | Test A03, razvojni D04 |
| R05 | `F` se izračuna pred straničenjem; sprememba `f` nastavi `page = 1`; `F` ohrani vrstni red `P`. | Test A04, razvojni D03 |
| R06 | Preglednica in tabla prejmeta isti odsek `S`; tabla razdeli `S` v tri stolpce po `status` in ne straniči vsakega stolpca posebej. | Test A07, razvojni D03 |
| R07 | Preklop pogleda ter odprtje/zaprtje podrobnosti ne spremenijo `size`, `filter`, `page` (stanje ostane v `ProjectView`, ki se ne remountira). | Test A08 |
| R08 | Projekt se v `App` renderira s `key={project.id}`, zato menjava projekta ponastavi lokalno stanje; osvežitev ponovno zažene aplikacijo; stanje ni v URL-ju, `localStorage` ali `sessionStorage`. | Test A08/A09 |
| R09 | Pri `M > 0` status vsebuje `Stran X od Y.` in `Prikazano A–B od M.` z 1-osnovnima indeksoma. | Test A01/A02, razvojni D02 |
| R10 | Pri `M = 0` je status natanko `Stran 0 od 0. Prikazano 0–0 od 0.` in vsi štirje gumbi so onemogočeni; vrnitev filtra na `all` nastavi `page = 1`. | Test A05/A06 |
| R11 | Pregled stanj (`Pregled stanj opravil`) šteje celoten nefiltrirani `P`; števci stolpcev table štejejo elemente `S`; skupno število v znački ob naslovu ostane `N` ne glede na `s` in `f`. | Test A07 |
| R12 | Noben premik ali sprememba filtra ne pošlje zapisa (`POST/PATCH/PUT/DELETE`) na `/api/`; povezave opravil, ID-ji, podrobnosti in nalaganje ostanejo delujoči; pri 390 px se cela stran ne razširi. | Test A08/A09/A10, razvojni D04 |

Ločnica med splošnim pravilom in primerom: pravila zgoraj veljajo za poljubne
podatke iz opisane domene (tudi prazne projekte, 0/1/>10 opravil, enake
naslove); testni primeri so le konkretne instance teh pravil.

## Izvedba in sledljivost

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | privzeti `all`/`all`, izvorni vrstni red | A01, D01, D03 | `src/App.tsx` (`useState('all')`, `filtered`), `src/pagination.ts` | izpolnjeno — glej `docs/agent/verification.md` |
| R02 | zaporedni odseki brez izgub | A02, A03, D01, D02 | `src/pagination.ts` (`pageSlice`) | izpolnjeno |
| R03 | premiki in onemogočeni gumbi | A02, A05, D02 | `src/PaginationControls.tsx`, `src/pagination.ts` (`canPrev`, `canNext`) | izpolnjeno |
| R04 | menjava velikosti vrne na prvo stran; `all` = ena stran | A03, D04 | `src/App.tsx` (`onSizeChange`) | izpolnjeno |
| R05 | filter pred straničenjem, ponastavitev strani | A04, A06, D03 | `src/App.tsx` (`filtered`, `onFilterChange`) | izpolnjeno |
| R06 | ista množica ID-jev v obeh pogledih, stolpci iz odseka | A07, D03 | `src/App.tsx` (`pageTasks`), `src/TaskBoard.tsx` | izpolnjeno |
| R07 | pogled in podrobnosti ohranijo stanje | A08 | `src/App.tsx` (stanje v `ProjectView`), `src/navigation.ts` | izpolnjeno |
| R08 | menjava projekta/osvežitev ponastavi; brez URL-ja/shrambe | A08, A09 | `src/App.tsx` (`key={project.id}`) | izpolnjeno |
| R09 | natančno besedilo statusa | A01, A02, D02 | `src/pagination.ts` (`paginationStatus`), `src/PaginationControls.tsx` | izpolnjeno |
| R10 | prazen rezultat: `0 od 0`, vsi gumbi onemogočeni | A05, A06 | `src/pagination.ts`, `src/App.tsx` (prazno stanje) | izpolnjeno |
| R11 | pregled stanj celoten projekt; stolpci odsek | A07 | `src/App.tsx` (`counts` iz `tasks`), `src/TaskBoard.tsx` | izpolnjeno |
| R12 | brez zapisov, povezave, 390 px | A08, A09, A10, D04 | `src/api.ts` (nespremenjen), `src/styles.css` | izpolnjeno |

Zgodovina sprememb specifikacije:

- 2026-10-08, v1.0: začetna različica pred implementacijo.
- 2026-10-08, v1.1: po preverjanju potrjeni navedeni dokazi; vsebina zahtev
  in pravil se ni spremenila. Dejanski izidi so v `docs/agent/verification.md`.

## Odprta vprašanja in omejitve

- Pravila ne določajo vedenja, če se podatki spremenijo med prikazom strani;
  stanje se ob spremembi podatkov ne osvežuje in ob osvežitvi ponastavi.
- Če bi `page` iz lokalnega stanja presegel `Y` (npr. ob spremembi podatkov),
  izračun uporabi `X = min(page, Y)`; uradne prehode to pokrijejo že gumbi.
- Končnih ocenjevalnih testov ni mogoče zagnati; preverjeni so skupni
  razvojni testi in lastni testi v `tests/agent/`.
- Barve in razporeditev novih kontrol niso predpisane; uporabljeni so
  obstoječi gradniki in spremenljivke Folio.
