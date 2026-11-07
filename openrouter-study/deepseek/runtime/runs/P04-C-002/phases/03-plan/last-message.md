Plan written to `docs/agent/P04/plan.md`.

**Plan highlights**
- Technical context: existing React/TS/Vite stack, no new dependencies, `/api/` reads only, Playwright for tests.
- Key decisions: pure `src/sortTasks.ts` module (normalize/UTF-16 compare, status rank, date order, explicit-index stable sort); control state in `ProjectView` with project-change remount reset; `useMemo` sorted projection shared by table and board; four labeled `select`s plus the `Izvorni vrstni red` button; Folio design/ARIA preserved.
- Files: `src/sortTasks.ts` (new), `src/App.tsx`, `src/TaskBoard.tsx`, `src/styles.css`, `tests/agent/p04.spec.ts` (new), plus `tasks.md` for breakdown/evidence.
- Verification: own tests (scenarios A–L), unchanged shared tests, optional reference run of dev cases D01–D04, evidence recorded in spec/tasks.

Time remaining: 912s.
