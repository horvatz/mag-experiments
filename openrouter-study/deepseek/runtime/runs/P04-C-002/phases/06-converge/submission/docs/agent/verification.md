# P04 — Preverjanje in sledljivost

Datum: 2026-10-14 (pilot). Okolje: lokalni Chromium prek `task/browser.json`
(wsEndpoint), testni strežnik 5174/3102. Končni ocenjevalni testi izvajalca niso
dostopni in niso navedeni kot izvedeni.

## Izvedeni ukazi in rezultati

| Ukaz | Obseg | Rezultat |
| --- | --- | --- |
| `npm run typecheck` | tipi | uspešno (brez izpisa) |
| `npm run lint` | slog | uspešno (brez izpisa) |
| `npx playwright test tests/agent/p04.spec.ts --reporter=line` | lastni testi (A–L) | 20 uspešnih (7,4 s) |
| `npx playwright test tests/development/P04.spec.ts --reporter=line` | referenčni razvojni D01–D04 | uspešno v `npm run check` (8 ponovitev) |
| `npm run check` | slog + tipi + gradnja + vsi testi | 66 uspešnih (23,0 s) |

Dnevnik `npm run check` je vključeval: 38 osnovnih preverjanj, 8 razvojnih
(D01–D04 na dveh profiljih) in 20 lastnih testov; vsi so uspešni.

## Sledljivost zahtev

| Zahteva | Pogoj | Test | Koda | Izid |
| --- | --- | --- | --- | --- |
| R01 | privzeto `original/asc`, `none/asc`; vrstni red polja | A01, I01, I02, J01 | `src/App.tsx`, `src/sortTasks.ts` | uspešno |
| R02 | `normalize` + UTF-16 primerjava za title/assignee | B01, B02 | `src/sortTasks.ts` (`normalize`, `compareKey`) | uspešno |
| R03 | status todo<in_progress<done; datumi kronološko | C01, C02 | `src/sortTasks.ts` (`statusRank`, `compareKey`) | uspešno |
| R04 | smer zanika le primerjavo ključa; izenačeni stabilni | D01 | `src/sortTasks.ts` (`factor`) | uspešno |
| R05 | sekundarni ključ le ob enakem primarnem, samostojna smer | E01, E02 | `src/sortTasks.ts` (`sortTasks`) | uspešno |
| R06 | izenačena oba ključa: izvorni vrstni red; `original` vedno izvorni | F01, F02 | `src/sortTasks.ts` (indeks kot zadnja vez) | uspešno |
| R07 | fiksni stolpci; relativni vrstni red v stolpcu | G01, H01 | `src/TaskBoard.tsx`, `src/App.tsx` | uspešno |
| R08 | preklop pogleda in podrobnosti ohranita nastavitve | H01 | `src/App.tsx` | uspešno |
| R09 | menjava projekta in osvežitev ponastavita; brez shrambe/URL | I01, I02 | `src/App.tsx` (`key={project.id}`) | uspešno |
| R10 | gumb ponastavi vse; prazen projekt in eno opravilo | J01, J02, J03 | `src/App.tsx` | uspešno |
| R11 | projekcija: brez sprememb podatkov in brez zapisov | K01 | `src/sortTasks.ts`, `src/App.tsx` | uspešno (0 zapisov, `saveRequests` 0) |
| R12 | ID-ji enkrat, prave podrobnosti, Folio in 390 pik | L01, L02, K01 | `src/App.tsx`, `src/styles.css` | uspešno |

## Omejitve in nepreverjeno

- Končni ocenjevalni testi izvajalca niso dostopni; ne navajamo jih kot izvedene.
- Navigacija med nezaključenim nalaganjem in sočasne spremembe podatkov brez
  osvežitve niso v obsegu in niso preverjene.
- Manjkajoči ali neveljavni datumi niso zahtevani; testni podatki so veljavni
  `YYYY-MM-DD`.
- Infrastruktura (`server/`, `shared/`, skupni testi, nastavitve, odvisnosti) ni
  bila spremenjena.
