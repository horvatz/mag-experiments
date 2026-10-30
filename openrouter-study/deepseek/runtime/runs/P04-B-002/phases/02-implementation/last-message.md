Role complete. Implementation, verification, and handoff notes are saved; time passes to the reviewer.

**Implemented**
- `src/sorting.ts` (new): `sortTasks` with `normalize` (NFD, U+0300–U+036F, lowercase, UTF-16 compare), status ranks, chronological `dueDate`, independent directions, `idx` tiebreak, `original` early return.
- `src/App.tsx`: four controls + `Izvorni vrstni red` button in `ProjectView`; sorted projection feeds table and board; counters/fields untouched; project switch resets via existing `key={project.id}`.
- `src/styles.css`: `.sort-bar` wraps without overflow at 390 px.
- `tests/agent/p04-verification.spec.ts` (new): 14 tests, R01–R12, with own data and hand-computed expectations.

**Verified**
- `npm run check`: lint, types, build, Playwright all green — 60/60 (38 baseline/API, 8 development D01–D04, 14 agent).
- R01–R12 each linked to code and actual test results in `docs/agent/verification.md`.
- No writes on `/api/`, no state in URL or storage; settings survive view switch/details and reset on project change/reload.
- No specification errors found; no spec/review files touched.

**Limitations**
- Hidden final tests unavailable; coverage is via development plus own tests.
- `dueDate` assumed valid `YYYY-MM-DD`; manual browser review not performed (automated Playwright only).
- Git commands are blocked in this sandbox (`~/.gitconfig` denied); changed files are limited to `src/`, `tests/agent/`, `docs/agent/verification.md`.

Handoff: results are saved; the reviewer can take over for inspection and fixes.
