Načrt je pripravljen v `docs/agent/P10/plan.md`.

**Ključne odločitve**
- Čisto jedro zgodovine v novem `src/taskOrder.ts` (premiki, razveljavitev, ponovitev, začetni vrstni red; `undo` največ 20, `redo` počisti veljaven premik) in hook `useTaskOrder(tasks)`, vezan na `ProjectView` (`key={project.id}`), zato menjava projekta/OSvežitev ponastavita, preklop pogleda in podrobnosti pa ne.
- Nove kontrole `src/OrderControls.tsx`: `MoveButtons` zunaj povezave opravila in `HistoryControls` s `role=status` (`Razveljavitve: U. Ponovitve: R.`).
- Prikaz `Mesto opravila <id>` v preglednici in na tabli; tabla filtrira po statusu, premiki pa uporabljajo globalnega soseda.
- Brez novih odvisnosti, brez sprememb infrastrukture; slogovni dodatki v `src/styles.css` z ohranjenim Folio in 390 px brez razširitve.

**Preverjanje (načrt)**: `npm run typecheck`, `npm run lint`, `npx playwright test --project=agent`, nato celoten `npm test`; dokazi se vpišejo v sledljivost `spec.md`. Čas do roka faze: 652 s. Naslednji korak je `$speckit-tasks`.
