# P07 Tasks

## Setup

- [x] [T001] Confirm the existing `/api/` data contracts, route behavior, and Folio selectors against `src/api.ts`, `src/App.tsx`, `src/TaskBoard.tsx`, and `src/styles.css`.

## Foundation

- [x] [T002] Implement strict `folio:favorites:v1` parsing, UTF-16 sorting, serialization, storage errors, and the React favorites hook in `src/favorites.ts`.
- [x] [T003] Wire the global favorite set, storage event handling, project-scoped removal, and storage alerts through `src/App.tsx`.

## User Value

- [x] [T004] Add the default-off favorites filter, remove-current-project action, and whole-project status element in `src/App.tsx`.
- [x] [T005] Add independent favorite toggles outside task links and filtered table rendering while preserving details and `data-task-id` in `src/App.tsx`.
- [x] [T006] Add independent favorite toggles outside card links and filtered board rendering/counting in `src/TaskBoard.tsx`.
- [x] [T007] Extend the existing visual language for new controls, focus states, empty state, and 390 px layout behavior in `src/styles.css`.

## Verification

- [x] [T008] Add focused storage tests for valid/invalid shapes, duplicates, unknown IDs, normalization, reload, project changes, and exact persisted JSON in `tests/agent/P07.storage.spec.ts`.
- [x] [T009] Add focused interaction tests for toggling by ID, filtering order, no-results state, view parity, details, project switching, status/count behavior, and project-scoped removal in `tests/agent/P07.ui.spec.ts`.
- [x] [T010] Add focused event/error tests for correct- and wrong-key `storage` events, `null`, storage exceptions, in-memory usability, and absence of API writes in `tests/agent/P07.events.spec.ts`.
- [x] [T011] Run the focused agent suite with `npm test tests/agent/P07.storage.spec.ts tests/agent/P07.ui.spec.ts tests/agent/P07.events.spec.ts`.
- [x] [T012] Run the existing baseline regression with `npm run test:ui`, then typecheck/build with `npm run build` if time permits.

## Polish

- [x] [T013] Update R01–R12 traceability with executed checks, actual outcomes, and clear limitations in `docs/agent/P07/spec.md`.
