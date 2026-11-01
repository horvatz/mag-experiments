# P03 – Preverjanje in sledljivost

Datum: 2026-11-01. Faza: `$speckit-implement`. Rezultati so iz dejanskih
zagonov v tem repozitoriju; ukazi so navedeni sproti.

## Zagnani ukazi in izidi

| Ukaz | Izid |
| --- | --- |
| `npm run typecheck` | uspešno, brez napak |
| `npm run lint` | uspešno, brez opozoril |
| `npm run build` | uspešno (`dist/assets/index-*.css` 13,65 kB, `index-*.js` 241,87 kB) |
| `npx playwright test --project=agent` | 9 uspešnih (0 neuspešnih) |
| `npm test` | 55 uspešnih: 38 osnovnih (api + desktop + mobile), 8 razvojnih P03 (development-desktop + development-mobile), 9 lastnih (agent) |

## Spremembe

| Datoteka | Vsebina |
| --- | --- |
| `src/filters.ts` | novo: `normalize`, `splitWords`, `matchesQuery`, `filterTasks`, `assigneeOptions` |
| `src/App.tsx` | lokalno stanje filtrov, vrstica kontrol, `role=status`, povzetek in števci iz prikazanih opravil, `Ni zadetkov.`, ponastavitev ob menjavi projekta |
| `src/TaskBoard.tsx` | brez spremembe: stolpci in števci že izhajajo iz prejetega seznama, zato prejme filtrirana opravila |
| `src/styles.css` | razredi `.filter-bar`, `.filter-field`, `.filter-search`, `.filter-status`, `.no-matches`, prelom pri ozki širini |
| `tests/agent/p03-filters.spec.ts` | 9 lastnih testov (R01–R12) |

## Sledljivost zahtev

| Zahteva | Dokaz (test) | Izid |
| --- | --- | --- |
| R01 | agent `R01, R09: privzeto stanje prikaže vsa opravila v izvornem vrstnem redu` | uspešno |
| R02 | agent `R02, R03: iskanje normalizira črke …` (`CAS`, `CRT`, `kovač`, velikost črk) | uspešno |
| R03 | agent `R02, R03 …` (besede v obeh vrstnih redih, `"citat"`, `=SUM(A1)`, same beline) | uspešno |
| R04 | agent `R04, R05: filtri se vežejo z IN …` (`done` + `Ana Novak`; `Črt` + vsa stanja) | uspešno |
| R05 | agent `R04, R05 …` (možnosti `all` + 5 različnih imen, tudi ko so skrita) | uspešno |
| R06 | agent `R06: oba pogleda kažeta iste filtrirane ID-je …` (`columnIds` po stolpcih) | uspešno |
| R07 | agent `R07, R08 …` (prehod web → launch: privzeti filtri, `Prikazano: 2 od 2.`) | uspešno |
| R08 | agent `R07, R08 …` (osvežitev, naslov brez parametrov filtrov) | uspešno |
| R09 | agent `R01, R09 …` (`Prikazano: 8 od 8.`, povzetek 4/2/2) in razvojni D04 (`Prikazano: 4 od 8.`) | uspešno |
| R10 | agent `R10: ni zadetkov ohrani oba pogleda uporabna …` in `R10: prazen projekt …` (`0 od 0`) | uspešno |
| R11 | agent `R11, R12: čiščenje filtrov …` (`Počisti filtre` vrne vse tri kontrole) | uspešno |
| R12 | agent `R11, R12 …` (`readonly`: ni zapisov, ni prelivanja) in `R12: pri ozki širini …` (390 pik); skupni testi | uspešno |

## Omejitve in nepreverjeno

- Končni skriti testi izvajalca niso dostopni; preverjanje temelji na skupnih
  (`tests/baseline.spec.ts`, `tests/api.spec.ts`), razvojnih (`tests/development/P03.spec.ts`)
  in lastnih testih (`tests/agent/p03-filters.spec.ts`).
- Vrstni red možnosti odgovornih oseb je abeceden; izvirne zahteve ga ne
  predpisujejo, zato je to izbira izvedbe.
- Sočasne spremembe podatkov med nalaganjem in navigacija med nezaključenim
  nalaganjem nista del obsega (kot v specifikaciji).
- Ročni ogled v brskalniku ni bil izveden v tem koraku; preverjanje je
  avtomatizirano prek Playwright (Chromium prek `task/browser.json`).
- Testi niso bili izvedeni na drugih brskalnikih (konfiguracija uporablja
  Chromium).
