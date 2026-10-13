# Implementer verification

## Planned verification

- Review the handed-over specification against the original P08 requirements before implementation.
- Add agent UI tests for date-group boundaries, counters, filters, empty states, view switching, and reset behavior.
- Run the focused agent tests, then the shared development tests and full `npm run check`.
- Record actual results, requirement mapping, and environment limitations here.

## Implementation summary

- Added pure UTC calendar helpers in `src/deadline.ts`: deadline groups, inclusive 7-day boundary, date validation, and `plusDays`.
- Added project-local reference date and deadline view state in `src/App.tsx`; values reset on project change and refresh, and are not persisted in URL or storage.
- Added the required date input, select, five counters, exact empty-date alert, filtered table rows, and shared filtering for table and board.
- Kept existing status board columns, table columns, `data-task-id`, task links, detail behavior, and public `/api/` reads.
- Styled the new controls to preserve the existing Folio layout and avoid page expansion on 390 px.
- Added focused agent coverage in `tests/agent/deadline.spec.ts`.

## Requirement mapping

| Requirement | Implementation and checks |
| --- | --- |
| R01 | Fixed `2026-09-21` and initial `all`; agent test verifies mount, project switch, and reload. |
| R02 | `deadlineGroup` returns `done` before date comparisons; tests cover open and done statuses. |
| R03 | Open dates before/equal to the reference classify as `overdue`/`today`; pure boundary test verifies this. |
| R04 | Open dates from the next day through inclusive day 7 are `week`; later dates are `later`; agent tests cover boundaries. |
| R05 | `plusDays` uses `Date.UTC`, UTC getters, and fixed 24-hour day arithmetic; agent tests cover 2026 and leap 2028. |
| R06 | Five counters are calculated from all current-project tasks before applying the selected filter; agent test verifies unchanged counts. |
| R07 | `visibleTasks` preserves table order and relative order inside existing board status columns; agent test compares IDs. |
| R08 | Valid input updates immediately; empty input shows the exact alert while retaining the last valid calculation; agent test verifies recovery. |
| R09 | Table and board receive the same `visibleTasks`; agent test switches views with an active filter and checks preserved values and IDs. |
| R10 | Local state is in `ProjectView`, keyed by project; agent test verifies reset after project switch/reload and no URL or storage persistence. |
| R11 | Empty project yields five zero counters; empty selected group shows the exact message and permits another selection; agent test verifies both. |
| R12 | Agent tests verify GET-only `/api/` use, no `/__test/` request from UI, `data-task-id`, and 390 px width. Full shared suite passes. |

## Verification results

- `npm run lint` — passed.
- `npm run typecheck` — passed.
- `npx playwright test --project=agent` — 6/6 passed.
- `npx playwright test --project=development-desktop --project=development-mobile` — 8/8 passed.
- `npm run check` — passed: lint, typecheck, production build, and 52/52 Playwright tests.

## Specification discrepancy

- No missing or conflicting requirement was found in `docs/agent/specification.md`; it was consistent with the original R01–R12 requirements.

## Environment limitations

- Public internet access is blocked by the environment.
- Tests use the prepared Chromium endpoint from `task/browser.json`; direct `chromium.launch()` is not used.
- Verification is automated; the reviewer owns the separate final visual review.
