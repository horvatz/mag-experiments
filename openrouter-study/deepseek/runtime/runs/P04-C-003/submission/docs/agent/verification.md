# P04 — Preverjanje izvedbe

Datum: 2026-10-11. Zahteve: `task/instructions.md` R01–R12; specifikacija: `docs/agent/P04/spec.md`;
načrt: `docs/agent/P04/plan.md`. Rezultati so vpisani po dejanski izvedbi; neizvedeni deli so označeni.

## Povzetek

`npm run check` je uspešno preveril slog, tipe, gradnjo in vseh 60 preverjanj (21,0 s):

| Sklop | Uspešne izvedbe |
| --- | ---: |
| Podatkovni vmesnik in strežnik (api) | 14/14 |
| Osnovni UI, računalniški prikaz (desktop) | 12/12 |
| Osnovni UI, emulacija telefona (mobile) | 12/12 |
| Razvojna preverjanja P04 (development-desktop) | 4/4 |
| Razvojna preverjanja P04 (development-mobile) | 4/4 |
| Lastni testi P04 (agent, tests/agent/p04-sort.spec.ts) | 14/14 |

Zagon: `npm run check` (lint → typecheck → vite build → playwright test, vsi projekti).
Med izvedbo je bil en neuspeh lastnega testa R05 zaradi napačne pričakovane vrstice (slovenska
abeceda: dva < ena); pričakovanje je bilo popravljeno, ponovni zagon je uspel. Osnovni testi,
strežnik, odvisnosti in nastavitve niso bili spremenjeni.

## Sledljivost zahtev

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | Privzeti četverec in izvorni vrstni red | agent R01; development D01 | src/sorting.ts (DEFAULT_SORT), src/App.tsx (useState, sortedTasks) | Uspešno (check 60/60). |
| R02 | Normalizirani nizi, UTF-16, brez locale | agent R02 (Unicode, č/d, alfa 2/10) | src/sorting.ts (norm, compareText) | Uspešno (check 60/60). |
| R03 | Rang statusa in kronološki datumi | agent R03; development D02 | src/sorting.ts (compareKey) | Uspešno (check 60/60). |
| R04 | Smer obrne le izbrani ključ | agent R04 (izenačeni naslovi) | src/sorting.ts (sortTasks) | Uspešno (check 60/60). |
| R05 | Sekundarni ključ ob enakosti, neodvisna smer | agent R05; development D02 | src/sorting.ts (sortTasks) | Uspešno (check 60/60). |
| R06 | Stabilnost in original | agent R06 | src/sorting.ts (sortTasks, primary original) | Uspešno (check 60/60). |
| R07 | Stolpci in relativni vrstni red | agent R07; development D03 | src/App.tsx (sortedTasks), src/TaskBoard.tsx | Uspešno (check 60/60). |
| R08 | Preklop pogleda in podrobnosti | agent R08 | src/App.tsx (ProjectView key, useState) | Uspešno (check 60/60). |
| R09 | Menjava projekta, osvežitev, brez URL/shrambe | agent R09 | src/App.tsx (key={project.id}) | Uspešno (check 60/60). |
| R10 | Gumb, prazno in eno opravilo | agent R10 (trije testi); development D04 | src/SortControls.tsx, src/App.tsx (onReset) | Uspešno (check 60/60). |
| R11 | Projekcija brez zapisov | agent R11; development D04 (readonly) | src/App.tsx (sortedTasks), src/sorting.ts | Uspešno (check 60/60). |
| R12 | ID-ji, podrobnosti, 390 pik | agent R12; osnovni mobile testi | src/App.tsx, src/styles.css (.sort-controls) | Uspešno (check 60/60). |

## Omejitve in neizvedeni deli

- Skritih končnih testov izvajalca ni mogoče pognati; niso navedeni kot izvedeni.
- Testi uporabljajo javni testni pripomoček `tests/development/helpers.ts` z nadzorovanimi GET
  odgovori; UI tega pripomočka ne uvaža in ne uporablja testnih kontrol `/__test/`.
- Nove kontrole so vidne tudi ob praznem projektu (potrebno za R10); besedilo in razporeditev
  kontrol nista predpisana in se lahko prilagodita.
