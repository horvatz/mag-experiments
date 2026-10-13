# Specifikacija: P05 straničenje in filter stanja

## Problem in kontekst

Folio prikazuje opravila izbranega projekta v preglednici ali tabli. Vmesnik trenutno prikaže vsa opravila projekta. Uporabnik potrebuje enoten, lokalni filter stanja in straničenje, ki deluje enako v obeh pogledih, ohranja izvorni vrstni red in ne spreminja podatkov.

Podatki ostanejo pridobljeni iz javnega API-ja `/api/projects/{id}/tasks`. Straničenje in filter sta stanje trenutnega projekta, brez trajnega shranjevanja v `localStorage`, URL-ju ali novih zapisovalnih klicih.

## Vhodi, dejanja in izidi

- Vhod: polje `Task[]` z obstoječimi lastnostmi, velikost strani `all | 2 | 5 | 10`, filter `all | todo | in_progress | done` in trenutna stran naravno število.
- Dejanja: izbira velikosti strani, izbira filtra ter gumbi Prva stran, Prejšnja stran, Naslednja stran in Zadnja stran.
- Uspeh: preglednica in tabla prikažeta isti odsek trenutno filtriranega polja v izvornem vrstnem redu; status vsebuje natančno zahtevano besedilo.
- Preklic/neveljavno dejanje: gumb na robu ali ob praznem rezultatu je onemogočen in ne spremeni stanja.
- Napaka: ob napaki nalaganja obstoječe sporočilo in ponovni poskus ostaneta; straničenje se ne usmerja v nove API-je.

## Zahteve in pravila

Za velikost `s` naj bo `filtered = tasks.filter(filter)`, `pages = s == all ? (|filtered| > 0 ? 1 : 0) : ceil(|filtered| / s)`, `start = |filtered| == 0 ? 0 : (page - 1) * s + 1`, `end = |filtered| == 0 ? 0 : min(page * s, |filtered|)` pri `s = all` enako `|filtered|`. Stran `p` je veljavna, če je `1 <= p <= pages`; `pages = 0` pomeni `p = 0`.

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | `s=all`, `filter=all`, `p=1`; prikazani so vsi ID-ji v izvornem redu. | Agent test: začetni ID-ji. |
| R02 | Za `s=2/5/10` odseki zaporedoma pokrivajo `filtered` brez izgube in podvajanja; zadnji je lahko krajši. | Agent test: seštevanje strani po velikostih in vrstni red. |
| R03 | `p=1`, `max(1,p-1)`, `min(p+1,pages)`, `p=pages`; onemogočeno dejanje ne spremeni `p` in `start/end`. | Agent test: premiki in onemogočenost. |
| R04 | Sprememba `s` nastavi `p=1`; `s=all` ima eno stran, če je `|filtered|>0`. | Agent test: velikost 2 → zadnja → velikost 5. |
| R05 | Filter se uporabi pred straničenjem in sprememba filtra nastavi `p=1`; vrstni red ujemajočih se opravil se ne spremeni. | Agent test: filtri in ID-ji. |
| R06 | Preglednica in tabla prejmeta isti `pagedTasks`; tabla združi le ta odsek v stolpce. | Agent test: ID-ji v obeh pogledih in stolpcih. |
| R07 | Preklop pogleda ter odpiranje in zapiranje podrobnosti ohranita `s`, `filter` in `p`. | Agent test: stanje kontrol in ID-jev. |
| R08 | Drug projekt ali osvežitev začne z `s=all`, `filter=all`, `p=1`; stanje ni v trajni shrambi ali URL-ju. | Agent test: menjava projekta in `localStorage` ob osvežitvi. |
| R09 | Za `|filtered|>0` status je `Stran p od pages. Prikazano start–end od |filtered|.` | Agent test: natančno besedilo na neprazni strani. |
| R10 | Za prazen projekt ali prazen filter status je `Stran 0 od 0. Prikazano 0–0 od 0.` in vsi štirje gumbi so onemogočeni; odstranitev filtra vrne prvo stran. | Agent test: prazen filter in ponastavitev. |
| R11 | Pregled stanj šteje celoten `tasks`; števci stolpcev štejejo `pagedTasks`; število vseh opravil se ne spremeni. | Agent test: števci pred in po straničenju. |
| R12 | Straničenje ne sproži ne-GET API klicov in ne spreminja strežniških podatkov; obstoječe povezave, ID-ji, podrobnosti in odzivni videz ostanejo. | Agent test: brez zapisov, odprta podrobnost in širina 390 px. |

## Izvedba in sledljivost

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | Privzeti ID-ji v izvornem redu | A01 | `src/App.tsx`: stanje in `pagedTasks` | Uspešno; A01. |
| R02 | Zaporedni odseki za 2, 5 in 10 | A01 | `src/App.tsx`: izračun `start`, `end` in rezanje | Uspešno; A01. |
| R03 | Štirje premiki in onemogočeni robovi | A01 | `src/App.tsx`: gumbi `page-navigation` | Uspešno; A01. |
| R04 | Sprememba velikosti vrne na prvo stran | A01 | `src/App.tsx`: obravnava izbire velikosti | Uspešno; A01. |
| R05 | Filter pred straničenjem in reset strani | A01 | `src/App.tsx`: `filteredTasks` in izbira filtra | Uspešno; A01. |
| R06 | Enaka ID-ja v preglednici in tabli | A01 | `src/App.tsx` in `src/TaskBoard.tsx`: `pagedTasks` | Uspešno; A01. |
| R07 | Ohranitev stanja ob pogledu in podrobnosti | A01 | `src/App.tsx`: lokalni stanji v `ProjectView` | Uspešno; A01. |
| R08 | Reset ob menavi projekta in osvežitvi | A03, A04 | `src/App.tsx`: `key={project.id}` in začetna stanja | Uspešno; A03 in A04. |
| R09 | Natančno besedilo statusa za neprazen rezultat | A01 | `src/App.tsx`: `pagination-status` | Uspešno; A01. |
| R10 | Stran 0 od 0 ob praznem rezultatu | A02, A03 | `src/App.tsx`: izračun `pageCount` in `currentPage` | Uspešno; A02 in A03. |
| R11 | Projektni števci ostanejo celotni | A01 | `src/App.tsx`: `counts` nad `tasks` | Uspešno; A01. |
| R12 | Brez zapisov, delujoče podrobnosti in 390 px | A01 | `src/App.tsx`, `src/styles.css`, `tests/agent/P05.spec.ts` | Uspešno; A01 in `npm run check`. |

## Odprta vprašanja in omejitve

Dogovorjeno je, da se navigacija med nezaključenim nalaganjem in usklajevanje sočasnih sprememb podatkov brez osvežitve ne širi čez obstoječe regresije. Končni skriti testi so lahko nadrazširitve opisanega podatkovnega obsega, vendar jih tu ni mogoče navesti kot izvedene.

## Zgodovina popravkov

- 2026-10-11: Po prvem celotnem preverjanju je bil popravljen prazen projektni naslov nazaj na izhodiščno besedilo; prazen filter ima svoje sporočilo. Dodani so tudi dejanski izidi preverjanj.
