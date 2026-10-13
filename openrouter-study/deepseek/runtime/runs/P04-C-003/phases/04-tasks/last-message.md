Seznam nalog je zapisan v `docs/agent/P04/tasks.md` (10 nalog, T001–T010).

**Struktura**
- **Faza 1 (temelj):** T001 tipi, `DEFAULT_SORT` in `norm` v `src/sorting.ts`; T002 `compareByKey` in `sortTasks` z ohranitvijo izvornega vrstnega reda.
- **Faza 2 (vmesnik):** T003 `SortControls.tsx`; T004 stanje in projekcija v `App.tsx`; T005 tabla prejme razvrščeno polje; T006 slogi v Folio okviru.
- **Faza 3 (preverjanje):** T007–T008 lastni Playwright testi v `tests/agent/p04-sort.spec.ts` po zahtevah R01–R12; T009 `npm run check` in `npx playwright test --project=agent`; T010 vnos dejanskih izidov v preglednico sledljivosti v `spec.md`.
- Opombe navajajo odvisnosti (T002 po T001, T004 po T003, T005 po T004, T010 po T009) in meje: brez sprememb strežnika, `shared/`, skupnih testov, odvisnosti ali nastavitev.

Kode nisem implementiral; spremenjen je bil samo novi dokument `docs/agent/P04/tasks.md`.
