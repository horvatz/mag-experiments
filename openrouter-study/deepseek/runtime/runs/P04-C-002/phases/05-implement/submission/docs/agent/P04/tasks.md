# P04 — Naloge

Izvedeno 2026-10-14; dokazi so v `docs/agent/verification.md`. Vse spodnje naloge so opravljene.

## Setup

- [x] T001 Ustvari `src/sortTasks.ts`: tipi `SortKey`, `Direction`, `SortState`; `normalize` (NFD, odstranitev U+0300–U+036F, male črke), primerjava nizov po UTF-16, `rank(status)`, kronološka primerjava `YYYY-MM-DD`, stabilno urejanje z izvornim indeksom (R01–R06, R11).
- [x] T002 Dopolni `src/App.tsx`: stanje štirih kontrol s privzetimi vrednostmi `original/asc/none/asc`, ponastavitev ob menjavi projekta (`key={project.id}`), `useMemo` projekcija iz `tasks` in `S` (R01, R04–R06, R09–R11).

## Temelj in vmesnik

- [x] T003 Dopolni `src/App.tsx`: štirje `select` z `label` (Primarni ključ, Primarna smer, Sekundarni ključ, Sekundarna smer), možnosti ključev in smeri, gumb Izvorni vrstni red (R01, R10).
- [x] T004 Dopolni `src/styles.css`: razporeditev novih kontrol, brez vodoravnega prelivanja cele strani pri 390 pik, viden fokus (R12).
- [x] T005 Preveri `src/TaskBoard.tsx`: prejme razvrščeno polje; stolpci todo/in_progress/done fiksni, relativni vrstni red enak preglednici; sprememba ni bila potrebna (R07).
- [x] T006 Preveri ohranitev: `data-task-id`, `aria-label="Pregled stanj opravil"`, `aria-pressed`, dostopna imena stolpcev, podrobnosti po `id` pri enakih naslovih (R08, R12).

## Lastni testi

- [x] T007 `tests/agent/p04.spec.ts`, scenariji A–F (R01–R06).
- [x] T008 `tests/agent/p04.spec.ts`, scenariji G–J (R07–R10).
- [x] T009 `tests/agent/p04.spec.ts`, scenariji K–L (R11, R12).

## Preverjanja

- [x] T010 `npx playwright test tests/agent/p04.spec.ts`: 20 uspešnih.
- [x] T011 Skupni testi v `npm run check`: vsi uspešni, infrastruktura nespremenjena.
- [x] T012 Referenčni razvojni primeri D01–D04 v `npm run check`: uspešni (8 ponovitev).
- [x] T013 Preverjanje zapisov: K01 in `readonly` (0 zapisov, `saveRequests` 0); `/__test/` se v `src/` ne uporablja.

## Predaja

- [x] T014 `docs/agent/P04/spec.md` in `docs/agent/verification.md` vsebujeta povezave zahteva–pogoj–test–koda–dokaz ter omejitve.
