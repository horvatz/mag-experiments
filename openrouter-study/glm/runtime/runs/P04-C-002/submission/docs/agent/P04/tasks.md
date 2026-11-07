# P04 — Naloge izvedbe

## Priprava

- [x] [T001] Dodaj razvrščevalni modul, tipe stanja, privzeto stanje in stabilno `sortTasks` v `src/sorting.ts`.

## Temelji

- [x] [T002] Poveži štiri kontrole, stanje projekta in razvrščeno polje s preglednico v `src/App.tsx`.
- [x] [T003] Posreduj razvrščeno polje v obstoječo tablo v `src/TaskBoard.tsx` in dodaj Folio postavitev kontrol v `src/styles.css`.

## Uporabniški scenariji

- [x] [T004] Dodaj Playwright preverjanja za R01, R02, R03, R04, R05 in R06: privzeto stanje, normalizacija UTF-16, status in datume, smeri ter stabilnost v `tests/agent/p04.spec.ts`.
- [x] [T005] Dodaj Playwright preverjanja za R07, R08, R09, R10, R11 in R12: tabla, ohranjanje in ponastavitev stanja, prazni/enoopravilni projekti, projekcija brez API zapisov in sledljivost ID-jev v `tests/agent/p04.spec.ts`.

## Preverjanje in dokončanje

- [x] [T006] Poženi `npm run typecheck`, `npm run lint` in ciljne Playwright teste iz `tests/agent/p04.spec.ts`; popravljaj samo ugotovljene P04 napake.
- [x] [T007] Posodobi sledljivost R01–R12 z dejanskimi izidi in omejitvami v `docs/agent/P04/spec.md`.
- [x] [T008] Preveri obseg sprememb, ohranjenost dizajna Folio in javnega API-ja ter pripravi jedrnato predajo v `docs/agent/P04/tasks.md`.
