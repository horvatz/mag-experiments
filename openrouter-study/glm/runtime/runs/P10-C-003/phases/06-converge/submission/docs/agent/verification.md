# P10 — potrditev izvedbe

**Status**: zaključeno | **Datum**: 2026-10-13

## Izvedene spremembe

- Dodan čisti model lokalnega vrstnega reda v `src/taskOrder.ts`: premik, razveljavitev, ponovitev, reset in največ 20 prejšnjih permutacij.
- Dodan React hook v `src/useTaskOrder.ts`; stanje je lokalno trenutnemu projektu in se ob menjavi ali osvežitvi ponastavi.
- `src/App.tsx` prikazuje globalna mesta, premike po ID-ju zunaj povezav, glavna dejanja zgodovine in usklajen števec.
- `src/TaskBoard.tsx` ohranja stalne stolpce stanj, kartice pa sledijo globalnemu vrstnemu redu in premikajo globalnega soseda.
- `src/styles.css` uporablja obstoječe Folio barve, radij, tipografijo in razmike; notranje drsenje ostane znotraj preglednice/table.
- Dodani lastni testi v `tests/agent/p10.spec.ts`, ki pokrivajo R01–R12, vključno s praznim projektom, enim opravilom, 21 premiki, menjavo projekta, osvežitvijo in širino 390 px.

## Izvedena preverjanja

- `npm run lint`: uspešno, brez napak.
- `npm run build`: uspešno; `tsc --noEmit` in Vite gradnja brez napak.
- `npx playwright test tests/agent/p10.spec.ts`: uspešno, 7/7 testov. Prvi poskus je odkril dve testni napaki (lokalizator števca in napačno izbrani veljavni premik); obe sta odpravljeni, drugi zagon je 7/7.
- `npm run check`: uspešno, 53/53 testov: 14 API, 24 osnovnih brskalnikovih, 8 razvojnih P10 in 7 lastnih.
- Preverjena je odsotnost klicev `updateTask`, `/__test/` in `localStorage` v uporabniških komponentah; pomožna obstoječa funkcija `src/api.ts` ni bila spremenjena niti klicana.

## Omejitve

- Končni testi iz zasebnega repozitorija niso dostopni in niso bili izvedeni.
- Stanje P10 je namerno nepersistentno: menjava projekta ali osvežitev ponastavi vrstni red in obe zgodovini.
- Niso bile spremenjene odvisnosti, nastavitve, strežnik, skupni tipi ali skupni testi.
