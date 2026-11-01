# P04 Tasks

## Foundational

- [ ] [T001] Implement pure sorting types, defaults, normalization, comparators, and stable projection in `src/sorting.ts`.
- [ ] [T002] Add project-local sort state, four required selects, reset button, and shared `visibleTasks` projection to `src/App.tsx`.
- [ ] [T003] Add Folio-consistent responsive styles for the sort controls without page overflow in `src/styles.css`.

## Verification

- [ ] [T004] Create Playwright coverage for R01–R12, empty and single-task projects, duplicate values, view/details persistence, project reset, projection safety, unique IDs, and 390 px width in `tests/agent/P04.spec.ts`.
- [ ] [T005] Run the focused agent suite `npm test -- tests/agent/P04.spec.ts`, fix P04 defects, and rerun it until it passes.
- [ ] [T006] Run the shared regression suites `npm test -- tests/baseline.spec.ts tests/api.spec.ts`, fix P04 regressions, and rerun them until they pass.
- [ ] [T007] Run `npm run lint` and `npm run build`, fix findings, and rerun both successfully.

## Polish

- [ ] [T008] Update requirement traceability and actual test evidence in `docs/agent/P04/spec.md`.
- [ ] [T009] Mark completed tasks and record any unverified limitation in `docs/agent/P04/tasks.md`.
