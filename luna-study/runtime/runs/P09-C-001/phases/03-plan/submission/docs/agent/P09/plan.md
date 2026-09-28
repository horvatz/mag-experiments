# P09 implementation plan

Feature specification: [`spec.md`](./spec.md) (R01–R12).  
Project boundaries: [`PROJECT_RULES.md`](../../../PROJECT_RULES.md); approved appearance: [`docs/dizajn.md`](../../dizajn.md).

## Technical context

- React 19.3, TypeScript 6, Vite 8.3; Node 24.11. Dependencies are already installed. Use the existing browser APIs and current packages; add no dependencies.
- The application reads projects and tasks through `useResource` and the public `/api/`. `useRoute` in `src/navigation.ts` observes `hashchange`, parses project/task paths, and currently recognizes `view=board`.
- `src/App.tsx` owns the project task view and current table; `src/TaskBoard.tsx` renders the board; `src/TaskDetails.tsx` opens and closes details. `src/styles.css` and `docs/dizajn.md` define the Folio layout and responsive treatment.
- Keep confirmed filters in the fragment URL; keep an unconfirmed control draft in component state only. Do not change shared types, server, fixtures, dependencies, test configuration, or shared tests.

## Design decisions

1. Extend `src/navigation.ts` to parse and build project/task URLs containing both the view and confirmed filter parameters. Use `URLSearchParams`; consume the first occurrence of repeated parameters, apply defaults for invalid status/order, and do not rewrite a URL merely by parsing it. On Apply/Reset, serialize the canonical filter state, retain `view=board`, and remove unknown parameters. Add one hash-history entry only when the effective filter triple changes; canonicalize an unchanged triple in place.
2. Keep a typed view-filter status (`all | todo | in_progress | done`) separate from shared `TaskStatus`; leave shared API types unchanged. Use a small pure helper in `src/` for query normalization, matching and ordering if that keeps these rules isolated from route parsing. Normalize with NFD, remove only U+0300–U+036F, lowercase, and compare strings by UTF-16 code units (not locale collation); retain source index as the stable tie-breaker.
3. In `src/App.tsx`, derive visible tasks from the API response and confirmed state. The controls edit a draft; Apply commits all controls together, while Reset commits defaults. Render the same filtered task set in either view, plus the required result count and empty message. Do not send API writes or persist filter state in `localStorage`.
4. Update route builders and link handlers so view changes and detail open/close preserve confirmed filters; project-navigation clicks reset filters but keep the current view. Direct project URLs continue to parse their own filters. Route/history changes reset the draft from the destination URL.
5. Add only focused controls and responsive styles in `src/styles.css`, following the existing Folio tokens and components. Preserve required Slovenian labels, accessible names, `data-task-id` attributes, keyboard-visible focus, and the 390 px no-page-overflow behavior.

## Work sequence and target files

1. Implement and review filter state parsing, validation, normalization, stable ordering, URL serialization, and path builders: `src/navigation.ts` and, if useful, one focused pure helper under `src/`.
2. Wire draft/confirmed state, atomic Apply/Reset, filtering, count and empty state into `src/App.tsx`; pass the same filtered tasks to `src/TaskBoard.tsx` and preserve ID-based detail links through `src/TaskDetails.tsx`.
3. Integrate hash history, view/project/detail navigation, and draft reset behavior across `src/App.tsx`, `src/navigation.ts`, `src/TaskBoard.tsx`, and `src/TaskDetails.tsx`.
4. Add the labeled controls and responsive layout in `src/styles.css`, retaining the approved Folio appearance in `docs/dizajn.md`.
5. Add requirement-focused browser scenarios under `tests/agent/` for direct links, normalization/filter/sort, canonical URLs, history, navigation, empty results, read-only behavior, accessibility, and mobile layout. Run the shared checks and report actual outcomes in `docs/agent/P09/spec.md`; mark anything not exercised as unverified.

## Scope and verification boundaries

Implementation changes are limited to `src/`, `tests/agent/`, and `docs/agent/`. Read data only from `/api/`; the UI must not access `/__test/`, local fixture copies, or `localStorage`. Do not modify `server/`, `shared/`, seed data, baseline tests, dependency manifests, or runtime/test configuration. Keep existing loading, retry, detail, unknown-route, and adaptable Folio behavior. Tests that change data during loading or without refresh are outside the added scope.
