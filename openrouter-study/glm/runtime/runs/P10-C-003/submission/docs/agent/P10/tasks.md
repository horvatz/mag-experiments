# P10 — naloge izvedbe

**Specifikacija**: `docs/agent/P10/spec.md` | **Načrt**: `docs/agent/P10/plan.md`

## Osnova

- [x] [T001] Dopolni čisti model vrstnega reda z akcijami `move`, `undo`, `redo` in `reset` ter omejitvijo 20 vnosov v `src/taskOrder.ts`.
- [x] [T002] Dodelaj React hook, ki ob uspešno prejetem polju opravil inicializira lokalno stanje in izpostavi urejena opravila ter dejanja zgodovine, v `src/useTaskOrder.ts`.

## Uporabniški vmesnik

- [x] [T003] Poveži hook z obstoječim `ProjectView`, dodaj števec zgodovine ter gumba `Razveljavi premik`, `Ponovi premik` in `Začetni vrstni red` v `src/App.tsx`.
- [x] [T004] Dopolni vrstice preglednice z globalnim mestom, gumboma gor/dol zunaj povezave in onemogočenimi robnimi dejanji v `src/App.tsx`.
- [x] [T005] Dopolni tablo tako da stolpci stanj ostanejo nespremenjeni, kartice pa sledijo globalnemu vrstnemu redu in omogočajo premik globalnega soseda v `src/TaskBoard.tsx`.
- [x] [T006] Dopolni Folio slogovne razrede za zgodovinske kontrol, mesta opravil in ozke zaslone v `src/styles.css`.

## Preverjanje in sledljivost

- [x] [T007] Dodaj lastne Playwright teste za R01–R12, vključno s praznim projektom, enim opravilom, 21 veljavnimi premiki, menjavo projekta, osvežitvijo in širino 390 px, v `tests/agent/p10.spec.ts`.
- [x] [T008] Poženi ciljne lastne teste z `npx playwright test tests/agent/p10.spec.ts` in popravi samo napake P10 v `src/` ter `tests/agent/p10.spec.ts`.
- [x] [T009] Poženi skupna vrata `npm run lint`, `npm run build` in `npm test`; preveri tudi odsotnost klicev `PATCH`/`POST`, `/__test/` in `localStorage` v uporabniškem vmesniku `src/`.
- [x] [T010] Posodobi sledljivost v `docs/agent/P10/spec.md` z dejanskimi izidi testov, morebitnimi nepreverjenimi deli in omejitvami.

## Odvisnosti

- T002 potrebuje T001; T003 potrebuje T002; T004 in T005 potrebujeta T003; T006 potrebuje T004 in T005; T007 potrebuje celoten uporabniški vmesnik; T008–T010 so zaporedne validacijske naloge.
