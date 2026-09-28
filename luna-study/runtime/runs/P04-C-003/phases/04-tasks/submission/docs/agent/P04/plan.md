# P04 implementation plan

## Scope and technical context

Add stable one- and two-key sorting to the existing Folio project task views, following [spec.md](spec.md) and its R01–R12 acceptance conditions. The application uses React 19, TypeScript 6, Vite 8, and installed Playwright 1.63 dependencies. `ProjectView` in `src/App.tsx` loads project tasks from the existing `/api/projects/:id/tasks`; the table renders that sequence and `TaskBoard` filters it into fixed status columns. `TaskDetails` reads by task ID. No API or dependency changes are needed.

Keep the confirmed Folio design and Slovenian labels. All application changes remain in `src/`, feature tests in `tests/agent/`, and evidence in `docs/agent/`. Do not change the server, shared types, baseline/development tests, dependencies, or run settings. The UI reads only `/api/`; sorting adds no writes, test-control access, URL state, or persistent storage.

## Design decisions

1. **Pure sorting projection.** Add a small `src/taskSorting.ts` utility that receives the fetched task array and the four sort settings and returns a new ordered array. Compare text using the specified NFD/mark removal/lowercase/UTF-16 rule, status by explicit rank, and valid ISO dates chronologically. Apply each direction only to its key; use original array position as the final tie-breaker. When primary is `original`, preserve input order regardless of the other settings. Do not mutate tasks or the API response.
2. **Project-local control state.** Keep `(primaryKey, primaryDirection, secondaryKey, secondaryDirection)` in `ProjectView`, initialized to `(original, asc, none, asc)`. Its existing project-ID key provides reset on project change. View and detail navigation keep the mounted project view and its settings; reload initializes defaults. Do not encode these settings in the hash or storage.
3. **One ordered input for both views.** Derive the visible sequence from the fetched array and current settings, then render that same sequence in the table or pass it to `TaskBoard`; its existing status filters preserve relative order and fixed columns. Calculate project totals from the unmodified fetched array. Leave ID-based task links and detail fetching intact.
4. **Small, accessible controls.** Add four native, labelled selects and the “Izvorni vrstni red” button to the task section controls in `ProjectView`. Use the exact option values and Slovenian accessible names from the spec. Style only the new controls in `src/styles.css`, using existing colors, focus treatment, and responsive patterns; keep the full page within 390 px and allow existing table/board inner scrolling.
5. **Focused feature coverage.** Add Playwright coverage under `tests/agent/` for comparator cases and UI lifecycle: defaults/reset, all key and direction combinations, stable ties, duplicate titles/ID details, table/board ordering, view/detail retention, project switch/reload reset, no writes, and empty/single-task data. Use test-only controls or mocked GET responses only from test code. Keep provided `tests/development/P04.spec.ts` and shared tests read-only.

## Files

| File | Planned work |
| --- | --- |
| `src/taskSorting.ts` | New pure comparator/projection and sort-setting types. |
| `src/App.tsx` | Project-local settings, native controls/reset, derive the ordered sequence, retain counts and existing ID links. |
| `src/TaskBoard.tsx` | Reuse the passed ordered sequence; change only if needed to preserve its current fixed columns and per-column order. |
| `src/styles.css` | Responsive styles for the sort controls in the confirmed Folio visual system. |
| `tests/agent/P04.spec.ts` | New focused browser scenarios for R01–R12; add a local helper in `tests/agent/` only if useful. |
| `docs/agent/P04/spec.md` | Update implementation/test traceability with actual files, results, and evidence after the work is verified. |

## Implementation and verification sequence

1. Implement and inspect the pure comparator against the spec, including direction handling and source-order ties.
2. Wire project-local state and controls in `ProjectView`; feed the derived sequence to both views without changing the API, counts, or detail route.
3. Apply the minimal responsive styling and add focused tests for requirements not covered by the provided development scenarios.
4. Run the focused agent tests, then `npm run check` for lint, type/build, the provided P04 development tests, API tests, and shared browser regressions. Record only checks actually run in the specification. Confirm mobile-width overflow, keyboard access, and absence of API writes.

## Constraints and risks

The primary risks are reversing equal items with descending comparisons, sorting the table but not the board, or resetting state when route hash changes. An explicit source-index tie-break, a single shared ordered sequence, and state scoped to the keyed project view address these cases. P04 final tests may use different IDs, Unicode strings, and task counts than the provided examples; implementation and tests must follow the specification rather than hard-coded fixtures.
