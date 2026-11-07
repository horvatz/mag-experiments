# P07 Implementation Plan

## Technical context

- Existing stack: React 19, TypeScript 6, Vite 8, Playwright 1.63, and `lucide-react`.
- Data already comes through `src/api.ts` and `src/useResource.ts` from the public `/api/` endpoints.
- Existing views live in `src/App.tsx` and `src/TaskBoard.tsx`; details and routing must remain unchanged.
- Folio styling and accessibility conventions come from `src/styles.css`, `src/components.tsx`, and `docs/dizajn.md`.
- No dependency, configuration, server, shared-type, baseline-test, or infrastructure change is planned.

## Design decisions

1. **Global favorites, local view filter**
   - Add `src/favorites.ts` for the storage key, strict parsing, UTF-16 sorting, serialization, and a `useFavorites` hook.
   - `App` owns the global favorite ID set so changing projects preserves IDs. `ProjectView` owns the filter state; its existing `key={project.id}` remount resets the filter to `false` on project change and reload.
   - Pass the favorite set and toggle handler into `ProjectView` and `TaskBoard`.

2. **Storage behavior**
   - Read `localStorage["folio:favorites:v1"]` once during initial state. Invalid or missing values yield an empty set without rewriting storage.
   - On toggle and project-favorite removal, write the normalized JSON. Catch read/write exceptions, retain the in-memory set, and expose `role="alert"` text containing `shramba`.
   - Listen to `storage`; apply `event.newValue` only for the feature key, validate it with the same parser, and never write in response.

3. **UI integration**
   - Add controls in the project overview: filter checkbox, remove-current-project button, and a status element with `role="status"`, `aria-label="Število priljubljenih"`, and text `Priljubljeno: X od M.`.
   - Apply filtering before rendering, preserving API order. Counts in the status refer to the entire current project; board column counts refer to visible tasks.
   - Add a separate favorite button to every table row and board card, outside the task link, with accessible name `Priljubljeno opravilo <id>` and `aria-pressed`.
   - When filtering produces no results, show `Ni priljubljenih opravil.` and keep the filter controls enabled. Preserve existing empty-project messaging for the unfiltered case.
   - Extend existing Folio-style CSS minimally for the new controls and buttons; preserve visible keyboard focus, narrow-screen behavior, `data-task-id`, labels, routes, and details.

4. **Traceability and tests**
   - Add focused tests in `tests/agent/` using the installed Playwright test runner and local route interception. They must not import application test controls.
   - Cover storage normalization and invalid input shapes, reload, duplicate IDs, unknown IDs, filtering order, view parity, project switching, remove-current-project behavior, status counts, storage events, storage exceptions, and absence of API writes.
   - Run the focused agent tests and the relevant baseline tests, then typecheck/build if time permits. Record only executed results in `docs/agent/P07/spec.md`.

## Planned files

| File | Change |
| --- | --- |
| `src/favorites.ts` | New storage parser, serializer, UTF-16 sort, and React favorites hook. |
| `src/App.tsx` | Global favorites wiring, filter and removal controls, status, filtered table rendering. |
| `src/TaskBoard.tsx` | Favorite buttons and visible filtered board entries/counts while preserving cards and links. |
| `src/styles.css` | Minimal Folio-compatible styles for new controls and empty state. |
| `tests/agent/` | Focused Playwright coverage for R01–R12. |
| `docs/agent/P07/spec.md` | Update traceability after implementation and actual verification. |

## Execution order

1. Implement storage parsing, serialization, sorting, and the hook.
2. Wire global state and project-level filter/remove/status controls.
3. Update table and board rendering without changing routes or task data.
4. Add Folio-compatible styles and check accessibility/narrow layout.
5. Add focused agent tests and run them alongside relevant baseline coverage.
6. Update requirement traceability with executed results and limitations.
