Korak `$speckit-plan` je opravljen.

**Opravljeno**
- Prebrani `.specify/feature.json`, `.specify/memory/constitution.md`, `docs/agent/P10/spec.md` ter ključna izhodiščna koda (`src/App.tsx`, `src/TaskBoard.tsx`, `src/useResource.ts`, `src/api.ts`, `src/navigation.ts`, `src/TaskDetails.tsx`) in vzorci razvojnih testov.
- `docs/agent/P10/plan.md` ustvarjen po Lean navodilih (tehnični kontekst, odločitve, datoteke, preverjanje, tveganja).

**Ključne odločitve**
- Stanje `order` + sklada `undo`/`redo` v `ProjectView`; menjava projekta in osvežitev ponastavita (R10).
- Čista prehodna logika v novem `src/order.ts` (robovi, meja 20, čiščenje ponovitev).
- Nov `src/OrderControls.tsx` (gumbi zgodovine + `role=status`), mesta in gumbi premika v preglednici in na tabli zunaj povezav.
- Brez novih odvisnosti, brez zapisov na API; lastni Playwright testi v `tests/agent/` po vzoru razvojnih.
- Preverjanje: `typecheck`, `lint`, `--project=agent` ter skupna baseline/api regresija; dokazi se vpišejo v `spec.md`.

Časovni ostanek: ~899 s.
