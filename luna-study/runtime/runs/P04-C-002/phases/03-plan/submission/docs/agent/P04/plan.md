# P04 implementation plan

Behavioral contract: [spec.md](spec.md), especially its comparison/state rules and R01–R12 acceptance matrix. This plan maps that contract to the existing Folio application without changing its infrastructure or confirmed design.

## Technical context

- React 19, TypeScript 6, Vite 8; existing React, `lucide-react`, Playwright, and Chromium dependencies are installed. No dependency or configuration change is needed.
- `src/App.tsx` fetches each selected project's tasks through the existing `/api/` resource hook, renders the table, and selects table/board routes. `ProjectView` is keyed by project ID. `src/TaskBoard.tsx` renders the fixed status columns by filtering its task sequence. `src/styles.css` owns the Folio layout and responsive rules.
- Existing types in `shared/types.ts` already define the task fields and status union. Keep shared types, server, fixtures, common tests, and test configuration unchanged.

## Decisions

1. Add a small pure sorting helper under `src/` (planned: `src/sortTasks.ts`) typed against the existing `Task` and a four-field sort-settings type. Return a new sequence; do not mutate API data. Carry each task's input index through comparison and use it as the final tie-breaker. Keep all comparison rules centralized there, following the predicates in `spec.md`.
2. Keep the four settings as local React state inside `ProjectView`, initialized to `(original, asc, none, asc)`. The existing project key resets the state when the project changes; view hash changes and the details dialog retain the mounted `ProjectView`; a page reload initializes defaults. Do not put sort settings in navigation, storage, or API requests.
3. In `src/App.tsx`, render four labeled native `select` controls and the **Izvorni vrstni red** button. Derive the sorted sequence for both the table and `TaskBoard`; calculate summary counts from the fetched tasks. Sorting performs no writes.
4. Keep `TaskBoard`'s existing fixed column order and pass it the sorted sequence so its current per-status filtering retains the correct relative order. Preserve existing task links, IDs, `data-task-id`, view/column accessible names, and detail behavior.
5. Add only the styles needed for the controls in `src/styles.css`, reusing Folio's neutral surfaces, blue accent, typography, and visible focus treatment. At 390 px, allow controls to fit or wrap within the content and preserve internal scrolling for the table and board without widening the page.

## Files and sequence

1. Implement the pure comparison/projection helper in `src/sortTasks.ts`.
2. Add local sort state, labeled controls, reset action, and shared sorted projection in `src/App.tsx`; pass the projection to `src/TaskBoard.tsx` while leaving status counts based on source data.
3. Add responsive control styling in `src/styles.css`. Modify `src/TaskDetails.tsx` or `src/navigation.ts` only if implementation reveals a necessary integration change; do not serialize sort state there.
4. Add focused Playwright coverage in `tests/agent/` for the comparison and state rules missing from the provided development cases. Leave `tests/development/`, shared tests, and test setup unchanged.

## Verification plan

- Use the existing `tests/development/P04.spec.ts` cases D01–D04 for default/title ordering, status with independent secondary direction, board order, reset, and no writes. Playwright runs this suite in its configured desktop and mobile development projects.
- Add agent-owned coverage for Unicode normalization and UTF-16 ordering, due dates and status order, direction and stable ties, same-key/original behavior, view/detail persistence, project/reload resets, empty and singleton projects, duplicate-title detail identity, accessibility hooks, and the 390 px page-width condition.
- After implementation, run the existing project check (`npm run check`) and report its actual result plus any unrun or inaccessible final checks. This plan step itself makes no test claim.

## Scope limits

Only `src/`, `tests/agent/`, and `docs/agent/` are implementation targets. Do not edit dependencies, scripts, Vite/Playwright configuration, server, shared types, fixtures, common/development tests, or official Spec Kit files. The UI reads through the existing `/api/` and never uses `/__test/`.
