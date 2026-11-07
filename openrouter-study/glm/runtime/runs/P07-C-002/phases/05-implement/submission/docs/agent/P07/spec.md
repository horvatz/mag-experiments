# P07 Specification — Priljubljena opravila in trajna shramba

**Source of truth:** `task/instructions.md`, version 1.0.
**Feature directory:** `docs/agent/P07`.
**Design baseline:** `docs/dizajn.md` (Folio).

## Problem and context

Folio currently lists project tasks in a table and on a board and opens task details by ID. Users need to mark individual tasks as favorites, keep those choices in the browser, and review only the favorite tasks of the current project. Favorites are a local UI concern: they must not alter task records, add write APIs, or replace the existing `/api/` data source.

The feature applies to both task views, preserves existing Slovenian labels, routes, keyboard focus, and narrow-screen behavior, and uses the confirmed Folio visual language.

## Inputs, actions, and outcomes

- **Data:** projects and tasks come only from the existing public `/api/` endpoints. Task identity is the string `id`; equal titles do not make two tasks equivalent.
- **Toggle favorite:** each table row and board card has a separate button named `Priljubljeno opravilo <id>` with `aria-pressed`. Activating it toggles only that ID and does not navigate to details.
- **Filter:** the checkbox `Prikaži le priljubljena` starts unchecked and restricts the current project's table and board to favorite tasks in API order.
- **Remove project favorites:** `Odstrani priljubljene tega projekta` removes only IDs of tasks in the entire current project and is disabled when the current project has no favorite tasks.
- **Persistence:** favorites use `localStorage` key `folio:favorites:v1`. The value is JSON `{version:1,ids:[...]}` with unique string IDs sorted by UTF-16 code units.
- **External update:** a `storage` event for that key replaces the in-memory favorite set using the same validation rules; `null` clears it. Events for other keys are ignored and never cause a write.
- **Storage failure:** if reading or writing throws, the UI remains usable with its current in-memory state and exposes an alert containing the word `shramba`.

No favorite action writes to `/api/`, modifies a task field, reads or writes `/__test/`, or substitutes local task data for API data.

## State rules

Let `F` be the global favorite ID set, `P` the current project, `T(P)` the tasks returned for `P` in source order, and `B` the filter state.

### Parse and serialize

`parse(raw)` produces the initial or event-driven set:

- `raw === null` → empty set.
- Invalid JSON → empty set.
- A non-object JSON value, `version` other than `1`, missing `ids`, `ids` that is not an array, or any non-string in `ids` → empty set.
- Otherwise, use the string IDs, remove duplicates, and sort them by UTF-16 code units.

`serialize(F)` writes exactly:

```json
{"version":1,"ids":["..."]}
```

where `ids` contains each favorite ID once and is sorted by UTF-16 code units. Unknown IDs are retained. Task objects and other task fields are never written.

### Transitions

- **Load or reload:** `F = parse(localStorage["folio:favorites:v1"])`; `B = false`. Invalid or missing storage yields an empty set and is not rewritten.
- **Toggle one task `id`:** `F = F △ {id}`; `B` is unchanged. The UI reflects the new set immediately.
- **Filter:** if `B = true`, visible tasks are `[t ∈ T(P) | t.id ∈ F]` in `T(P)` order; otherwise all `T(P)` are visible. The filter never changes `F`.
- **Remove current-project favorites:** `F = F \ {t.id | t ∈ T(P)}`. IDs belonging to other projects and unknown IDs remain.
- **Project change:** `F` is unchanged; `B` becomes `false`.
- **Storage event for `folio:favorites:v1`:** `F = parse(event.newValue)`; `B` is unchanged. The handler does not write. Events for another key leave both values unchanged.

The status text always reports current-project totals, not filtered totals:

```text
Priljubljeno: X od M.
```

Here `X = |{t ∈ T(P) | t.id ∈ F}|` and `M = |T(P)|`. Board column counts count visible tasks in each status.

## Requirements and acceptance rules

| Requirement | Rule or acceptance condition | Verification focus |
| --- | --- | --- |
| R01 | Every table row and board card has one separate button `Priljubljeno opravilo <id>` with correct `aria-pressed`. Activation toggles only that ID, does not open details, and equal titles remain independent. | Toggle several IDs, including duplicate titles, in both views; assert no dialog opens. |
| R02 | Writes use `folio:favorites:v1` and JSON `{version:1,ids:[...]}`. IDs are unique strings sorted by UTF-16; no task fields are stored. | Inspect storage after toggles and assert the exact normalized JSON. |
| R03 | Reload restores valid IDs. Duplicate IDs normalize to one; unknown IDs remain in storage but never create tasks. | Seed duplicate and unknown IDs, reload, inspect UI and storage. |
| R04 | Missing key, invalid JSON, wrong `version`, missing/non-array `ids`, or any non-string ID yields an empty set. Loading does not rewrite storage and the UI stays usable. | Seed each invalid shape, reload, inspect UI and storage. |
| R05 | `Prikaži le priljubljena` defaults to false. When checked, only current-project favorite tasks appear in source order. | Toggle favorites in known API order and assert visible order. |
| R06 | Removing a visible favorite immediately removes it from the filtered view. With no filtered results, `Ni priljubljenih opravil.` appears and filter controls remain usable. | Remove the only visible favorite while filtering; turn the filter off. |
| R07 | Table and board share `F` and `B`; switching views loses neither. Details still resolve by the correct task ID. | Toggle and filter in one view, switch, assert parity, then open details. |
| R08 | Changing projects preserves `F` and resets `B` to false. Reload restores `F` from storage and also sets `B` to false. | Favorite in two projects, switch projects, reload, inspect filter and buttons. |
| R09 | `Odstrani priljubljene tega projekta` removes only IDs of all tasks in the current project; other-project and unknown IDs remain. It is disabled without current-project favorites. | Seed mixed IDs, remove, inspect storage and button state. |
| R10 | The status element always shows `Priljubljeno: X od M.` for the whole current project, even while filtering. Board status counts count visible tasks. | Compare status text before and during filtering; inspect board counts. |
| R11 | A `storage` event for the correct key applies validated `newValue`; `null` clears the set and other keys are ignored. No event causes a write. Reading or writing failures keep the UI usable and show an alert containing `shramba`. | Dispatch storage events in-page and force storage exceptions in a focused test. |
| R12 | No favorite action writes to the API or changes task fields. Folio, loading, navigation, details, accessibility, and the 390 px layout remain intact. | Monitor API writes, run baseline regression, inspect visible layout and focus. |

## Implementation and traceability

| Requirement | Condition | Test or scenario | Source area | Outcome |
| --- | --- | --- | --- | --- |
| R01 | Favorite toggles are separate controls keyed by task ID and never navigate to details. | `P07 UI: favorite toggles are independent and do not open details` | `src/App.tsx`, `src/TaskBoard.tsx` | Passed |
| R02 | Writes use the exact normalized `folio:favorites:v1` payload. | `P07 storage: toggles write exact normalized JSON` | `src/favorites.ts` | Passed |
| R03 | Reload restores unique known favorites and retains unknown IDs without inventing tasks. | `P07 storage: reload normalizes duplicates and preserves unknown IDs` | `src/favorites.ts`, `src/App.tsx` | Passed |
| R04 | Every invalid or missing payload starts empty without rewriting storage. | `P07 storage: invalid or missing values start empty without rewriting` | `src/favorites.ts` | Passed |
| R05 | The filter defaults off and preserves API order for current-project favorites. | `P07 UI: filter preserves source order and supports empty result` | `src/App.tsx`, `src/TaskBoard.tsx` | Passed |
| R06 | Removing the last visible favorite shows `Ni priljubljenih opravil.` and keeps controls usable. | `P07 UI: filter preserves source order and supports empty result` | `src/App.tsx`, `src/styles.css` | Passed |
| R07 | Both views share favorites and filter state; details still open by ID. | `P07 UI: views share state and details remain reachable` | `src/App.tsx`, `src/TaskBoard.tsx` | Passed |
| R08 | Project changes preserve favorites and reset the filter. | `P07 UI: project change preserves favorites and resets filter` | `src/App.tsx` | Passed |
| R09 | Project removal removes only current-project IDs and disables when none remain. | `P07 UI: project removal keeps other and unknown IDs` | `src/App.tsx` | Passed |
| R10 | The status reports whole-project totals; board columns count visible tasks. | `P07 UI: filter preserves source order and supports empty result`; `P07 UI: views share state and details remain reachable` | `src/App.tsx`, `src/TaskBoard.tsx` | Passed |
| R11 | Correct-key storage events update without writes; `null` clears; failures stay usable and alert. | All three checks in `tests/agent/P07.events.spec.ts` | `src/favorites.ts`, `src/App.tsx` | Passed |
| R12 | No favorite action writes to the API; Folio, navigation, details, and mobile layout remain intact. | API-write assertions across the agent suite, baseline regression, and `P07 UI: mobile layout does not expand the page` | `src/App.tsx`, `src/TaskBoard.tsx`, `src/styles.css` | Passed |

The implementation may use one focused helper for parsing, serialization, sorting, and storage errors. It must not add dependencies, server changes, shared-type changes, or new public API contracts.

## Success criteria

- All R01–R12 behave as specified for zero, one, and many tasks; changing IDs, titles, ordering, Unicode text, and valid calendar dates.
- Storage normalization, reload, project switching, view switching, storage events, and storage failures are demonstrably correct.
- Existing Folio styles, labels, routes, `data-task-id` attributes, details access, and baseline behavior are preserved.
- Final reporting distinguishes executed checks from unexecuted or unavailable checks.

## Open questions and limitations

- There are no unresolved product decisions from the supplied requirements.
- Exact storage-failure wording is not prescribed; the alert must have `role="alert"` and contain `shramba`.
- Browser quota behavior is not externally measured. The required outcome is an in-memory usable UI plus the alert.
- This specification phase creates no implementation or test results; traceability will be updated after implementation and actual verification.
