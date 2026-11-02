# Folio P09 Implementation Plan

## Technical Context

## Stack

- React + TypeScript + Vite (existing)

- lucide-react + custom components

- src/shared/types.ts (Task, TaskStatus, TaskView)

- Public /api/ endpoint (read-only)

## Design Invariants

- Folio UI from docs/dizajn.md: 390px max width, system fonts, blue accent (#2f6dcc), white cards on soft background (#fbfbfd)

- URL params as view state; no localStorage

- Slovene labels; data-task-id on all rows/cards; aria-label="Pregled stanj opravil"

---

## Architecture

## Components (src/)

File | Purpose | Changes
---- | ------- | -------

src/useRoute.ts | URL parsing (q, status, order) | Extend parser for new params

src/api.ts | Public API wrapper | No writes; existing only

src/filter.ts (NEW) | Query normalization (NFD, lowercasing) | New module

src/view.ts (NEW) | Apply/Reset view state + history | New module

src/router.ts (EXTEND) | Navigation integrations (details, projects) | Add filter param preservation

src/App.tsx | Root React component | Mount ViewFilters + ViewControls

src/TaskTable.tsx | Table view (existing) | Conditional rendering

src/TaskBoard.tsx | Board view (existing) | Conditional rendering

src/TaskDetails.tsx | Task details modal (existing) | Preserve filters on open/close

## View Filters Control Layer

Control | Tech | Render Target

Search input | input type=search | Inside filter bar

Status dropdown | select | Inside filter bar

Order dropdown | select | Inside filter bar

Button | Role, aria-label="Rezultati povezave" | Text/Action
------------------ | ------------------------------------------------------------

"Uporabi pogled" | applyView() | Trims q, omits defaults

"Ponastavi pogled" | resetView() | Clears all, keeps view mode

## State Management

State | Storage | Description

Confirmed view | Browser URL | Persisted in history

Draft filters | React state | Modified locally before apply

View mode | URL param | view=board/table


## Implementation Steps

### Phase 1: Parsing & Filtering (R01, R02, R03, R04)

1. src/filter.ts (NEW)
   - normalizeQuery(q): trim, NFD, remove U+0300-U+036F, lowercase
   - buildQuery(params): combine q + status, AND logic
   - getSortedTasks(req): apply order=original/title-asc/title-desc

2. src/useRoute.ts (extend)
   - Parse q, status, order from URL query
   - Defaults: q="", status=all, order=original
   - ignore unknown params
   - preserve existing view=board

### Phase 2: Draft + Apply/Reset (R05, R06, R11)

3. src/view.ts (NEW)
   - draftState: reactive object holding q, status, order
   - renderFilters(): three controls, updates draft only
   - applyView(): HTML encode, confirm (dedupe)
   - resetView(): clear all params, confirm
   - Maintain viewMode (table/board) separate from filters

### Phase 3: View Control Integration (R07, R08, R09, R10)

4. src/App.tsx (update)
   - Mount ViewFilters component
   - Render TaskTable/TaskBoard based on viewMode
   - Fetch tasks via /api/tasks with buildQuery(draftState)

5. src/router.ts (extend)
   - history.push with confirmed params
   - history.state store for Back/Forward
   - details links preserve viewMode + filters

6. src/TaskDetails.tsx (extend)
   - Escape listener closes modal
   - On close: keep filters and viewMode intact

7. Project navigation (existing)
   - projectUrl() extends optional params
   - Click project: sets defaults (q="", status=all, order=original)
   - preserves viewMode (tabla/board)

### Phase 4: Reset + Result Count (R11, R12)

8. src/view.ts (add)
   - Count displayed N
   - Total M (from API response or tasks.length)
   - Ni zadetkov. when M=0
   - Counter text: "Prikazano: N od M."

9. src/TaskTable.tsx/src/TaskBoard.tsx (extend)
   - No modifications to card/row structure
   - Preserve data-task-id
   - Empty state messages as-is

## Traceability

| Req | Implemented In | Test Coverage
|-----|----------------|--------------

R01 | src/filter.ts, src/useRoute.ts | R01 - default state
R02 | src/filter.ts | R02 - query norm
R03 | src/filter.ts | R03 - status + order
R04 | src/useRoute.ts | R04 - unknown params
R05 | src/view.ts | R05 - draft only
R06 | src/view.ts, src/router.ts | R06 - dedupe apply
R07 | src/router.ts | R07 - history nav
R08 | src/App.tsx, src/view.ts | R08 - mode switch
R09 | src/TaskDetails.tsx, src/router.ts | R09 - details nav
R10 | src/App.tsx, src/router.ts | R10 - cross-project
R11 | src/view.ts | R11 - view reset
R12 | src/App.tsx | R12 - no localStorage

## Traceability

| Req | Implemented In | Test Coverage |
|-----|----------------|--------------|
| R01 | src/filter.ts, src/useRoute.ts | R01 - default state
| R02 | src/filter.ts | R02 - query norm
| R03 | src/filter.ts | R03 - status + order
| R04 | src/useRoute.ts | R04 - unknown params
| R05 | src/view.ts | R05 - draft only
| R06 | src/view.ts, src/router.ts | R06 - dedupe apply
| R07 | src/router.ts | R07 - history nav
| R08 | src/App.tsx, src/view.ts | R08 - mode switch
| R09 | src/TaskDetails.tsx, src/router.ts | R09 - details nav
| R10 | src/App.tsx, src/router.ts | R10 - cross-project
| R11 | src/view.ts | R11 - view reset
| R12 | src/App.tsx | R12 - no localStorage

## Open Questions and Limitations
- ID uniqueness across projects: R09 resolves via data model query (by data-task-id) rather than title.
- Task schema: may include due_date, but requirement R03 does not mandate it.
- Test data: baseline tests support 0+ tasks, unique/non-unique IDs, name variations.
