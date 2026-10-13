# P04 — Naloge

Zaporedje: setup → temelj → izvedba → preverjanja → predaja. Vsaka naloga navaja ciljno datoteko.
Izidi in dokazi se vpišejo sproti; neizvedeno ostane neoznačeno.

## Setup

- [ ] T001 Ustvari `src/sortTasks.ts`: tipi `SortKey`, `Direction`, `SortState`; `normalize` (NFD, odstranitev U+0300–U+036F, male črke), primerjava nizov po UTF-16, `rank(status)`, kronološka primerjava `YYYY-MM-DD`, stabilno urejanje z izvornim indeksom (R01–R06, R11).
- [ ] T002 Dopolni `src/App.tsx`: stanje štirih kontrol s privzetimi vrednostmi `original/asc/none/asc`, ponastavitev ob menjavi projekta (`key={project.id}` ali učinek), `useMemo` projekcija iz `tasks` in `S` (R01, R04–R06, R09–R11).

## Temelj in vmesnik

- [ ] T003 Dopolni `src/App.tsx`: štirje `select` z `label` (dostopna imena Primarni ključ, Primarna smer, Sekundarni ključ, Sekundarna smer), možnosti ključev in smeri, gumb Izvorni vrstni red; umeščeni ob preklop pogleda (R01, R10).
- [ ] T004 Dopolni `src/styles.css`: razporeditev novih kontrol z obstoječimi spremenljivkami, brez vodoravnega prelivanja cele strani pri 390 pik, viden fokus (R12).
- [ ] T005 Preveri `src/TaskBoard.tsx`: prejme razvrščeno polje; stolpci todo/in_progress/done fiksni, znotraj stolpca relativni vrstni red enak preglednici; po potrebi manjša prilagoditev (R07).
- [ ] T006 Preveri ohranitev: `data-task-id` na vrsticah in karticah, `aria-label="Pregled stanj opravil"`, `aria-pressed` pogledov, dostopna imena stolpcev, odpiranje podrobnosti po `id` pri enakih naslovih (R08, R12).

## Lastni testi

- [ ] T007 Napiši `tests/agent/p04.spec.ts`, scenariji A–F: privzete vrednosti in vrstni red polja, Unicode/male črke/ločila pri `title`/`assignee`, status in datumi, obe smeri, sekundarni ključ z neodvisno smerjo, stabilnost in `original` (R01–R06).
- [ ] T008 Dopolni `tests/agent/p04.spec.ts`, scenariji G–J: tabla in relativni vrstni red, preklop pogleda in podrobnosti, menjava projekta in osvežitev, gumb Izvorni vrstni red, prazen projekt in eno opravilo (R07–R10).
- [ ] T009 Dopolni `tests/agent/p04.spec.ts`, scenariji K–L: brez zapisov in nespremenjena polja/skupna števila, vsi ID-ji natanko enkrat, prave podrobnosti pri enakih naslovih, 390 pik (R11, R12).

## Preverjanja

- [ ] T010 Zaženi `npx playwright test tests/agent/p04.spec.ts --reporter=line`; vpiši izide v razdelek Izvedba in sledljivost v `spec.md`.
- [ ] T011 Zaženi skupne teste `npx playwright test tests/baseline.spec.ts tests/api.spec.ts --reporter=line`; potrdi nespremenjeno infrastrukturo.
- [ ] T012 Po želji zaženi referenčne razvojne primere `npx playwright test tests/development/P04.spec.ts --reporter=line`; rezultat ni nadomestilo za T010.
- [ ] T013 Preveri odsotnost zapisov med razvrščanjem (štetje zahtev in `/__test/state` saveRequests) in odsotnost uporabe `/__test/` v `src/`.

## Predaja

- [ ] T014 Posodobi `docs/agent/P04/spec.md` (povezave zahteva–pogoj–test–koda–dokaz) in `tasks.md` z dejanskimi izidi; zapiši nepreverjene dele in omejitve.
