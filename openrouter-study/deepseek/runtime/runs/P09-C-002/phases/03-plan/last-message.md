Plan step complete (~40s).

**`docs/agent/P09/plan.md`** (87 lines) contains:
- Technical context: React 19/TS 6/Vite 8, hash routing via `useSyncExternalStore`, Playwright test projects, no new dependencies.
- Seven design decisions: URL as the single source of truth for confirmed state; pure filter/order logic in a new `src/viewState.ts`; draft as local `ProjectView` state synced to confirmed state on every navigation; apply/reset via one hash write only when the triple changes; counter/empty-state rules; link builders preserving `filters` for view toggle, details, and board cards; project click resets filters but keeps `view`; Folio styling with 390px wrap; no writes (`updateTask` unused, no `/__test/`, no `localStorage`).
- File table mapping each change (`navigation.ts`, `viewState.ts`, `App.tsx`, `TaskBoard.tsx`, `TaskDetails.tsx`, `styles.css`, `tests/agent/P09.spec.ts`, `spec.md` traceability).
- Verification sequence: typecheck/lint/build → development P09 tests → shared tests → own tests, with results recorded in `spec.md`.
- Constitution compliance mapping for principles I–V.

Time budget: ~973s remaining.
