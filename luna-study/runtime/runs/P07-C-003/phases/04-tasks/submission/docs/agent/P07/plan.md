# P07 Implementation Plan

## Technical context

- Existing client: React 19, TypeScript 6, Vite 8; use installed dependencies and the current app structure. No dependency, build, server, API, shared-type, or run-setting changes.
- `src/App.tsx` loads projects and each project's tasks through the public `/api/`, owns the route-level view, and renders the table. `ProjectView` is keyed by project ID. `src/TaskBoard.tsx` renders the three status columns; `src/TaskDetails.tsx` loads details by task ID; `src/styles.css` contains the Folio tokens and responsive layout.
- The checked-in development examples are in `tests/development/P07.spec.ts` and are read-only. Add P07-specific checks only in `tests/agent/`.

## Design decisions

1. Keep one global favorites set of task ID strings at the `App` level so a `ProjectView` remount during project navigation cannot discard favorites. Put the favorite set and toggle/clear actions into the table and board as props. Keep the `Prikaži le priljubljena` checkbox in `ProjectView`; its existing project key makes the filter reset to false on project change, while changing table/board view retains it.
2. Add `src/favorites.ts` for the storage key and pure parse/serialize helpers. Parse only the version 1 shape and string ID array, deduplicate in memory, keep unknown IDs, and treat malformed data as empty. Serialize only `{version: 1, ids}` with unique IDs sorted by JavaScript's default UTF-16 string order. Do not write during initial load or while applying a `storage` event.
3. Handle storage access and write exceptions at the app state boundary: keep the current in-memory set usable and expose the specified `role="alert"` warning. Subscribe to `storage` for the exact key; reconcile its value without echoing a write. Favorites actions never call an API or persist task fields.
4. Filter the full ordered task array once before rendering either view. Keep the `role="status"` count with `aria-label="Število priljubljenih"` and `Priljubljeno: X od M.` based on the unfiltered array; derive board column counts from the filtered array. The `Odstrani priljubljene tega projekta` action subtracts IDs from the full project array, not the visible subset. Preserve the specified filtered empty-state text.
5. Keep task identity, detail navigation, loading, and API behavior unchanged. Place favorite buttons outside task links. Extend existing CSS with the smallest controls/empty state needed, using Folio tokens, visible focus, and wrapping/contained scrolling so the page itself does not widen at 390 px.

## Files and responsibilities

| File | Planned change |
| --- | --- |
| `src/favorites.ts` | New key, defensive parser, deterministic serializer; no UI or test-helper imports. |
| `src/App.tsx` | App-level set, safe initialization, storage listener, persistence/error handling; project controls, filtered table, counts and empty state. |
| `src/TaskBoard.tsx` | Render filtered tasks and buttons named `Priljubljeno opravilo <id>` with `aria-pressed`, outside task links; retain `data-task-id`, column names and count behavior. |
| `src/styles.css` | Style added controls, status/alert and empty state within existing Folio visual and responsive system. |
| `tests/agent/P07.favorites.spec.ts` | Add focused scenarios for R01–R12, including malformed/unknown storage, project transitions, storage events/errors, no API writes and narrow viewport. |

`src/TaskDetails.tsx`, `src/navigation.ts`, `src/api.ts`, `shared/`, the server, baseline/development tests, dependencies, and configuration require no planned changes. Keep existing task detail links keyed by ID and verify them in regression coverage.

## Implementation sequence

1. Implement and locally reason about the versioned storage helpers and in-memory state transitions, including deduplication, unknown IDs, exact-key storage events, and exception fallback.
2. Connect shared favorites state to table and board; add the filter, project-only remove action, exact status count, board visible counts, and filtered empty state.
3. Add focused agent-owned browser tests and style the controls for keyboard access and the 390 px layout while preserving the approved Folio design.
4. Run the focused P07 checks and the repository's existing lint, build/typecheck, and regression checks. Record actual results and any unverified requirements in the traceability section of `spec.md`.

## Boundaries

Only `src/`, `tests/agent/`, and `docs/agent/` are implementation outputs. The UI reads application data only from `/api/`; `/__test/` remains test-only. Favorites are the sole new local-storage data and contain IDs only. No architecture-wide refactor, dependency, API, server, shared type, or infrastructure change is part of this plan.
