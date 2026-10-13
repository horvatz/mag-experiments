All tasks complete and verified.

**Implementation**
- `src/sortTasks.ts` (new): `normalize` (NFD, U+0300–U+036F removed, lowercase), UTF-16 string comparison, status rank, chronological `YYYY-MM-DD`, direction negation, explicit-index stable sort; `original` always returns source order.
- `src/App.tsx`: four controls with defaults `original/asc/none/asc`, `useMemo` sorted projection, reset via `Izvorni vrstni red`, project-change reset (`key={project.id}`), no storage/URL.
- `src/styles.css`: control layout, 390px-safe, visible focus. `TaskBoard` needed no change (filters sorted array; columns fixed).

**Verification** (`docs/agent/verification.md`)
- `npm run typecheck`, `npm run lint`: pass.
- Own tests `tests/agent/p04.spec.ts` (scenarios A–L, 20 tests): 20 passed.
- `npm run check` end-to-end: 66 passed — 38 baseline, 8 dev D01–D04, 20 own; build succeeds.
- No `/__test/` usage in `src/`; sorting produced 0 API writes and `saveRequests` 0 (test K01); page does not overflow at 390px.

**Evidence trail**
- `docs/agent/P04/tasks.md`: all T001–T014 marked `[x]` with evidence notes.
- `docs/agent/P04/spec.md`: traceability table now maps each R01–R12 to actual passing tests and code.
- Limitation recorded: final grader tests are not available and are not claimed as executed; navigation during loading/concurrent changes remain out of scope.

Time remaining: ~6.5 min in phase budget.
