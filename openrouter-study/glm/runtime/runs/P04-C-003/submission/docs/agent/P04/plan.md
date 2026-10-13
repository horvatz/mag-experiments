# P04 Implementation Plan

## Technical Context

- Existing stack: React 19, TypeScript, Vite, CSS, Playwright; dependencies stay unchanged.
- Data source remains the existing public REST API under `/api/`; sorting is client-side and read-only.
- The approved Folio layout, existing routes, Slovenian labels, keyboard behavior, and responsive table/board scrolling remain the baseline.

## Design Decisions

| Decision | Choice | Rationale |
| --- | --- | --- |
| Sorting model | Pure projection from `Task[]` to `Task[]` | Prevents mutation of API data, counts, board membership, or source order. |
| State location | Local React state in `ProjectView` | survives view/details changes, while `key={project.id}` and page refresh reset it for a new project. |
| Comparator | Decorate each task with its source index; compare selected keys, then source index | Guarantees stable ties and avoids reversing the final array. |
| Text normalization | NFD, remove `U+0300`–`U+036F`, lowercase, then UTF-16 `<`/`>` | Exactly implements the specified deterministic comparison. |
| Direction | Negate only the chosen primary or secondary comparison result | Preserves tie order and independent secondary direction. |
| Primary `original` | Return a copy of the source array immediately | Guarantees that no other control can affect final order. |
| Board projection | Pass the same sorted array to `TaskBoard`; its status filters remain stable | Produces identical relative order in every column without changing fixed column order. |

## File Changes

| File | Change |
| --- | --- |
| `src/sorting.ts` | Add sorting types, key comparators, normalization, and `sortTasks(tasks, sorting)` with an explicit source-index tie-breaker. |
| `src/SortingControls.tsx` | Add four labeled HTML selects and the reset button `Izvorni vrstni red`. |
| `src/App.tsx` | Add local sorting state, derive sorted tasks with `useMemo`, render controls, use sorted tasks for table and board, and keep counts from raw tasks. |
| `src/styles.css` | Add compact Folio-compatible control styles that wrap responsively and do not expand the page at 390 px. |
| `tests/agent/p04.spec.ts` | Add browser scenarios covering R01–R12 with routed API data, duplicate titles, Unicode text, empty/single-task projects, and 390-px layout. |
| `docs/agent/P04/spec.md` | Update traceability after implementation with actual test names and outcomes; do not claim unexecuted tests. |

`src/TaskBoard.tsx` needs no structural change: it already filters in fixed status order and stable filtering preserves the supplied order.

## Implementation Sequence

1. Implement the pure sorting module and cover the exact key, normalization, direction, tie, and `original` rules.
2. Add local state and controls in `ProjectView`; pass the projected array only to the table and board.
3. Confirm view, details, project, reset, refresh, empty, and one-task transitions without changing API calls.
4. Add the P04 browser suite and make every requirement traceable by ID.
5. Run `npm test -- tests/agent/p04.spec.ts`, then the applicable project checks. Record only actual outcomes and update the specification evidence.

## Boundaries and Non-Goals

- Do not change dependencies, configuration, server code, shared types, baseline tests, navigation semantics, or public API contracts.
- Do not persist sorting in storage or the URL and do not add write requests.
- Do not access `/__test/` from application code; tests may use Playwright routing for controlled data.
- Do not add locale-aware or numeric collation, invalid-date handling, or additional UI requirements.
