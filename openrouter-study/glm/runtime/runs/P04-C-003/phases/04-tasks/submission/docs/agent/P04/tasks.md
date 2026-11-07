# P04 Tasks

## Implementation

- [ ] T001 Implement pure sorting types, normalization, comparators, direction handling, and stable `sortTasks` in `src/sorting.ts`.
- [ ] T002 Add four accessible sorting selects and `Izvorni vrstni red` reset control in `src/SortingControls.tsx`.
- [ ] T003 Integrate local sorting state and derived task order into `src/App.tsx`; pass the same projected order to table and board while preserving raw-task counts.
- [ ] T004 Add compact, wrapping Folio-compatible control styles in `src/styles.css` without expanding the 390-px page.

## Verification

- [ ] T005 Add P04 browser scenarios in `tests/agent/p04.spec.ts` covering R01–R12, duplicate titles, Unicode normalization, ties, board order, state transitions, empty/single-task projects, API purity, details, and 390-px layout.
- [ ] T006 Run `npm test -- tests/agent/p04.spec.ts`, record the actual result, and fix only P04-related failures.
- [ ] T007 Run `npm run lint` and `npm run build`, record actual outcomes, and fix only P04-related failures.
- [ ] T008 Run `npm test` for baseline regression, record the actual outcome, and do not claim unavailable hidden tests.
- [ ] T009 Update requirement-to-code-test traceability and evidence in `docs/agent/P04/spec.md`, marking only verified outcomes.

## Handoff

- [ ] T010 Summarize implemented changes, executed checks, actual outcomes, remaining limitations, and requirement coverage in `docs/agent/P04/handoff.md`.
