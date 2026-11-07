# Naloge: P10 – Lokalni vrstni red z razveljavitvami

**Viri**: `spec.md`, `plan.md`, `.specify/memory/constitution.md` | **Datum**: 2026-10-13

## Faza 1 – Temelj

- [ ] T001 V `src/taskOrder.ts` ustvari čisto jedro zgodovine: tip stanja `{order, initial, undo, redo}`, funkcije `moveUp/moveDown/undo/redo/reset` z mejo `UNDO_LIMIT = 20`, no-op na robu, čiščenjem ponovitev ob veljavnem premiku in hook `useTaskOrder(tasks)` za inicializacijo iz nalaganja.

## Faza 2 – Uporabniški scenariji

- [ ] T002 V `src/OrderControls.tsx` dodaj `MoveButtons` (`Premakni <id> gor/dol`, onemogočena na robu, zunaj povezave opravila) in `HistoryControls` (`Razveljavi premik`, `Ponovi premik`, `Začetni vrstni red`, `role=status` z `aria-label="Zgodovina vrstnega reda"` in besedilom `Razveljavitve: U. Ponovitve: R.`) (R02–R05, R08, R11).
- [ ] T003 V `src/App.tsx` poveži `useTaskOrder`, prikaži opravila v globalnem vrstnem redu, dodaj `aria-label="Mesto opravila <id>"` z globalno številko in `MoveButtons` v vsako vrstico ter ohrani `data-task-id`, `aria-label="Pregled stanj opravil"` in obstoječa dostopna imena (R01–R03, R11).
- [ ] T004 V `src/TaskBoard.tsx` prejmi globalno urejena opravila in preslikavo mest; stolpci naj filtrirajo po statusu, kartice dobijo mesto in `MoveButtons` (globalni sosed, status nespremenjen) (R09, R12).
- [ ] T005 V `src/styles.css` razporedi nove kontrole z obstoječimi gradniki in spremenljivkami Folio: ločena dejanja od povezave, viden fokus, pri 390 px brez razširitve strani (notranje drsenje ostane) (R09, R12).

## Faza 3 – Preverjanja

- [ ] T006 V `tests/agent/order.spec.ts` preveri začetni vrstni red in globalna mesta, premik gor/dol, nespremenjena polja/statuse, robna onemogočena gumba in prazni/enojni projekt (R01–R03, R09, R11).
- [ ] T007 V `tests/agent/history.spec.ts` preveri razveljavitev/ponovitev, čiščenje ponovitev po novem premiku, mejo 20 in vrnitev na začetni vrstni red (R04–R08, R11).
- [ ] T008 V `tests/agent/state.spec.ts` preveri preklop pogleda/podrobnosti, menjavo projekta in osvežitev, prazni/enojni projekt, ohranjene atribute in pri 390 px brez razširitve strani (R10–R12).
- [ ] T009 Zaženi `npm run typecheck`, `npm run lint`, `npx playwright test --project=agent` ter razvojne primere `npx playwright test tests/development/P10.spec.ts`; nato celoten `npm test` (api, baseline, development, agent) (R01–R12).
- [ ] T010 V `docs/agent/P10/spec.md` vpiši dejanske izide in dokaze (imena testov, dnevniki), posodobi povezave ter zabeleži neizvedene dele in omejitve; po potrebi uskladi `plan.md` (vse R).
