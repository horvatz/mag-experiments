# Naloge P05 — Straničenje in filter stanja

Naloge so odvisne od prejšnjih; izvajaj jih zaporedno. Oznake R se nanašajo na [`task/instructions.md`](../../../task/instructions.md).

## Priprava in osnova

- [x] [T001] Dodaj čiste izpeljevalne funkcije in tipe za filter, velikost strani, število strani in trenutni odsek v `src/pagination.ts` (R01, R02, R04, R05, R09, R10).
- [x] [T002] Vključi lokalna stanja filter, velikost in stran ter nadzore za izbiro ter premikanje v `src/App.tsx`; ohrani privzete vrednosti `all`, onemogoči neveljavne premike in izpiši natančen status (R01, R03, R04, R05, R07, R08, R09, R10).
- [x] [T003] Posreduj isti trenutni odsek preglednici in tabli, ohrani razdelitev table po stanjih ter izračunaj pregled stanj iz celotnega nefiltriranega polja v `src/App.tsx` in `src/TaskBoard.tsx` (R02, R06, R11).
- [x] [T004] Dopolni obstoječe Folio sloge za nove nadzore, odzivnost pri 390 pik, viden fokus in notranje drsenje v `src/styles.css` (R12).

## Uporabniški scenariji in lastna preverjanja

- [x] [T005] Dodaj test privzetega pogleda: velikost `all`, filter `all`, izvirno zaporedje in vsi `id` v `tests/agent/p05.spec.ts` (R01).
- [x] [T006] Dodaj teste deljenja na strani za velikosti `2`, `5` in `10` ter veljavne in onemogočene premike na robu v `tests/agent/p05.spec.ts` (R02, R03).
- [x] [T007] Dodaj teste spremembe velikosti in filtra, ponastavitve na prvo stran, praznega rezultata in natančnega statusa v `tests/agent/p05.spec.ts` (R04, R05, R09, R10).
- [x] [T008] Dodaj teste ohranjanja stanja ob preklopu pogleda in podrobnostih ter ponastavitve ob menjavi projekta in osvežitvi v `tests/agent/p05.spec.ts` (R07, R08).
- [x] [T009] Dodaj teste istih `id` v preglednici in tabli, števcev pregleda in stolpcev, odsotnosti zapisovalnih klicev ter ozkega zaslona v `tests/agent/p05.spec.ts` (R06, R11, R12).

## Zaključek in predaja

- [x] [T010] Izvedi ciljne lastne teste z `npx playwright test tests/agent/p05.spec.ts` in odpravi odkrite napake v `src/` ter `tests/agent/p05.spec.ts`.
- [x] [T011] Izvedi `npm run build` in skupno preverjanje z `npm run check`; rezultate zapiši brez navajanja neizvedenih testov kot uspešnih.
- [x] [T012] Posodobi sledljivost in omejitve v `docs/agent/P05/spec.md` ter pripravi končno predajo z dejanskimi rezultati v `docs/agent/P05/`.

