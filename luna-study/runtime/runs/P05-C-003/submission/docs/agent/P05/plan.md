# P05 implementation plan

**Feature:** `docs/agent/P05`  
**Source:** [`spec.md`](spec.md), requirements R01–R12.

## Technical context

- Existing stack: React 19, TypeScript 6, Vite 8; installed project dependencies and scripts remain unchanged.
- Project tasks are loaded by `useResource` from `/api/projects/:id/tasks`. Task status and ID come from the existing shared types; no new endpoint or persistence is needed.
- `App.tsx` owns `ProjectView`; `TaskBoard.tsx` groups the task array it receives. Existing links encode project, task details and view in the hash. `ProjectView` is keyed by project ID, so local pagination state can reset on project change while surviving same-project view/detail route changes.
- Preserve the approved Folio components, Slovenian labels, style variables and responsive behavior.

## Design decisions

1. Keep page size (`all|2|5|10`), status filter (`all|todo|in_progress|done`) and 1-based page in transient React state scoped to the current project. Initialize/reset to `all`, `all`, page 1 on mount/project change; do not encode these values in URL or persistent storage.
2. Derive the filtered array from API order without sorting or mutating it, then derive page count and visible slice. For `all`, a nonempty result is one page. For empty results, render the zero status and disable all navigation. Guard every page action at its boundary; changing size or filter sets page 1.
3. Feed the visible slice to both render paths. The table keeps slice order; the board groups that slice by status and retains order within each column. Keep project-wide summary/total counts based on the complete task array; board column counts use displayed cards.
4. Keep pagination read-only: use the existing GET data, task IDs and links. Do not call `/__test/`, add local task data, or introduce write requests.
5. Add labeled native selects, the four specified navigation buttons and the exact live status semantics/text from the spec. Place controls within the existing task section and style them with current Folio tokens; avoid page overflow at 390 px.

## Files and work sequence

1. `src/App.tsx` — own pagination/filter state, derive filtered/page arrays and counts, render controls/status, disable boundary buttons, retain full-project summary and totals; pass the page slice to the selected view.
2. `src/TaskBoard.tsx` — continue grouping its input by status; ensure visible IDs and existing `data-task-id`, accessible labels and links remain intact. Avoid per-column pagination.
3. `src/styles.css` — style the controls/status with existing variables and preserve the 390 px layout; keep horizontal scrolling inside table/board containers.
4. `tests/agent/` — add task-specific scenarios for defaults, partition/filter order, navigation/reset behavior, view/detail preservation, empty states, counts, no writes, IDs and responsive layout. Use the supplied test helper only from tests. Preserve shared tests unchanged.
5. Re-read the spec traceability table; run task-specific and shared checks available in the project, record actual outcomes and unresolved coverage in `spec.md`.

## Scope and constraints

Changes stay within `src/`, `tests/agent/` and `docs/agent/`. Do not edit server, shared types/tests, fixtures, dependencies, configuration or shared infrastructure. Keep existing loading, error/retry, detail and navigation behavior; do not expand pagination behavior during unfinished loading or concurrent data changes beyond existing regression requirements.
