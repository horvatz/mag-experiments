# P04 Specification: Stable Two-Key Sorting

## Problem in kontekst

Folio already shows tasks from `/api/` in a table and a fixed-column board.
P04 adds a sorting projection so users can stably order tasks by one primary
key and, only when primary values tie, by one secondary key. Sorting is visual
and local to the selected project; it must not mutate task fields, task counts,
board membership, API data, or the original server array.

The feature preserves the approved Folio design, existing Slovenian labels,
existing routes and views, `data-task-id`, task details, and responsive layout.
At 390 px width the page must not expand; the existing table and board may
scroll within their containers.

## Vhodi, dejanja in izidi

Control domain:

- Primary key: `original`, `title`, `assignee`, `status`, `dueDate`.
- Secondary key: `none`, `title`, `assignee`, `status`, `dueDate`.
- Primary and secondary direction: `asc` or `desc`.
- `Izvorni vrstni red` resets all four controls to their defaults.

A project has zero, one, or many tasks with unique `id`, valid date strings,
and ordinary text names and titles. Assignees, when shown, are non-empty and
not `all`. Each task belongs to its selected project.

State is a tuple
`S = (projectId, view, details, Kp, Dp, Ks, Ds, tasks)`, where `tasks` is the
order received from the public API and details are represented by whether a
task detail view is open. The default sorting state is
`(original, asc, none, asc)`.

State-transition rules:

- `change(Kp, Dp, Ks, Ds)` sets those controls and derives a new displayed order;
  it does not change `projectId`, `view`, `details`, or `tasks`.
- `changeView(V)` replaces only `view`; all four sorting controls remain.
- `openDetails(T)` or `closeDetails()` replaces only `details`; sorting remains.
- `changeProject(P)` resets `details` to closed and sorting to the defaults, then
  loads `tasks(P)` from `/api/projects/P/tasks`.
- `refresh()` performs the equivalent reset for the current project and does not
  persist sorting controls in storage or the URL.
- `resetOriginal()` sets `Kp=original`, `Dp=asc`, `Ks=none`, `Ds=asc` without
  changing `projectId`, `view`, `details`, or `tasks`.
- Data loading, retry, or API failure preserves existing UI behavior and must
  not substitute a local copy of task data.

### Ordering rules

Let `compare(taskA, taskB)` mean the comparison used before any direction
reversal.

- `original`: `compare(a,b) = 0`; the source array order is retained.
- `title` or `assignee`:
  `text(v) = lower(removeDiacritics(v, NFD U+0300–U+036F))`, then compare the
  resulting strings lexicographically by UTF-16 code units with `<` and `>`.
  No locale-aware, numeric, case-sensitive, or Unicode collation ordering is used.
- `status`: values compare in the fixed order `todo < in_progress < done`.
- `dueDate`: valid `YYYY-MM-DD` dates compare chronologically.
- For direction `asc`, use `compare`; for `desc`, use `-compare`. Direction only
  reverses the selected key’s comparison result.
- Secondary comparison runs only when primary comparison yields zero. It has
  its own independent direction rule.
- If both comparisons yield zero, retain the relative order of the source array.
- A secondary key equal to the primary key does not add another reversal.
- If the primary key is `original`, no other key or direction changes the final
  order.
- Sorting is a pure projection: every displayed item is derived from the same
  task object and no source record is mutated.

## Zahteve, pravila in sprejemni pogoji

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | New project state starts as `(original, asc, none, asc)`. | Verify controls and displayed order immediately after project selection and page refresh. |
| R02 | `title` and `assignee` use NFD, strip `U+0300`–`U+036F`, lowercase, then UTF-16 `<`/`>` comparison; no locale or numeric collation. | Browser test with Unicode, punctuation, mixed case, and same initial letters. |
| R03 | `status` maps to `todo < in_progress < done`; `dueDate` compares valid dates chronologically. | Browser tests across all status values and multiple calendar dates. |
| R04 | `asc`/`desc` negates only the selected key comparison. It never reverses the whole final array or a tie group. | Browser test with ties and both directions independently and together. |
| R05 | Secondary key is consulted only when primary values are equal and has its own direction. | Browser test where only tied primary values change order. |
| R06 | Final ties retain source order; repeated primary and secondary keys do not introduce extra reversal; primary `original` always preserves the source order. | Browser tests with duplicate titles, duplicate statuses, and repeated key selections. |
| R07 | Board columns remain `todo`, `in_progress`, `done` in that order; within each column use the same projected order as the table. | Browser test on the same state, comparing IDs by column. |
| R08 | Changing table/board view preserves all four controls; opening and closing details preserves them. | Browser test alternating view and details between sorting changes. |
| R09 | Changing project or refreshing resets all four controls; no sorting value is stored in persistent storage or the URL. | Browser test across projects, full page reload, storage, and hash inspection. |
| R10 | `Izvorni vrstni red` resets all four controls; empty and one-task projects remain usable with every key and direction. | Browser test for reset and exhaustive controls on boundary-sized projects. |
| R11 | Sorting is only a projection: task fields, project membership, counts, original data, and task-update requests due to sorting do not change. | Browser/API test comparing data and confirming sorting sends no task-update request. |
| R12 | Every task `id` appears exactly once, opens the correct details despite duplicate titles, and existing readable functions plus Folio accessibility and 390-px layout remain intact. | Browser tests with duplicate titles, keyboard access, details, and 390-px viewport. |

## Izvedba in sledljivost

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | Default controls and source order. | Agent test 1; development D01. | `src/App.tsx` state; `src/sorting.ts` default and `original`. | Passed in `npm run check` (51/51). |
| R02 | NFD text normalization and UTF-16 comparison. | Agent test 1. | `src/sorting.ts` `normalizeText`, `compareText`. | Passed in `npm run check`. |
| R03 | Status and chronological date comparison. | Agent test 2. | `src/sorting.ts` `statusOrder`, `compareValues`. | Passed in `npm run check`. |
| R04 | Direction changes only selected key result. | Agent test 1. | `src/sorting.ts` `direction` calls. | Passed in `npm run check`. |
| R05 | Secondary key only on primary tie. | Agent test 2. | `src/sorting.ts` comparator. | Passed in `npm run check`. |
| R06 | Stable ties and `original` precedence. | Agent test 1. | `src/sorting.ts` source index and `original`. | Passed in `npm run check`. |
| R07 | Board column and relative order. | Agent test 3; development D03. | `src/App.tsx` sorted board input; `src/TaskBoard.tsx`. | Passed in `npm run check`. |
| R08 | View and details preserve controls. | Agent test 3. | `src/App.tsx` local sorting state. | Passed in `npm run check`. |
| R09 | Project and refresh reset; no persistence. | Agent test 4. | `src/App.tsx` `key={project.id}` and default state. | Passed in `npm run check`. |
| R10 | Reset and empty/single-task usability. | Agent test 4. | `src/SortingControls.tsx` reset; `src/App.tsx` rendering. | Passed in `npm run check`. |
| R11 | Read-only projection and no task updates. | Agent test 5; development D04. | `src/sorting.ts` copy-on-sort; `src/App.tsx` raw counts. | Passed in `npm run check`. |
| R12 | Unique IDs, correct details, and narrow layout. | Agent test 5; baseline regressions. | `src/App.tsx` and `src/TaskBoard.tsx` `data-task-id`. | Passed in `npm run check`. |

Evidence source: `docs/agent/verification.md` and the `npm run check` console log (51 passed).

## Odprta vprašanja in omejitve

- No requirement asks for persistence in storage or the URL; none may be added.
- No new write API or test-control access is allowed.
- Navigation during unfinished loading and simultaneous data changes without
  refresh are outside the added regression scope.
- Invalid or missing dates are not part of P04 because supplied dates are valid
  `YYYY-MM-DD`.
- Hidden final tests are unavailable and must never be reported as executed.
