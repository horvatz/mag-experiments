# Folio P09: View State Management with Filters
## Problem and Context
Enhance the existing Folio application with dynamic view state management. Users should be able to filter tasks by query term, status, and sort order, with persistent browser history navigation. The implementation must maintain the approved Folio design and access data only through the public `/api/` endpoint.
## Inputs, Actions, and Outputs
### Data Fields
- `q`: Search query (string)
- `status`: Filter status (string: all/todo/in_progress/done)
- `order`: Sort order (string: original/title-asc/title-desc)
- Tasks: title, description, assignee, id, due_date
### Actions
- Set view filters via URL parameters
- Apply/Reset view state via UI controls
- Navigate browser history (Back/Forward)
- Switch between Table/Board view
- Open task details with navigation
### Outputs
- Filtered and sorted task list
- Updated URL
- Reversed/Restored view controls
- Task details panel (when applicable)

### R01: View State Parameters
The view state consists of three parameters: `q`, `status`, `order`
in the query portion of the URL fragment for an existing project or task view.
- Default: `q=""`, `status=all`, `order=original`
- On direct URL access, the state applies immediately without additional clicks.

### R02: Search Query Normalization
The q parameter accepts a single literal phrase:
- Trim surrounding whitespace
- Apply NFD normalization
- Remove Unicode marks U+0300–U+036F and convert to lowercase for matching
- Matches against title, description, assignee, or id fields
- Treated as a substring (non-regex) match
- Does not split into multiple words

### R03: Status and Sort Filtering
`status` supports: all, todo, in_progress, done
- Combined with q using logical AND (both must match)
`order` options: original, title-asc, title-desc
- Title uses identical normalization + UTF-16 comparison
- Preserves original order for ties in ordering

### R04: Unknown Parameter Handling
- Unknown status or order values default to their respective defaults
- First occurrence of repeated params takes precedence
- Unknown parameters do not affect the displayed state
- Parsing does not auto-update browser URL

### R05: Draft State Behavior
- Changing the three controls updates the draft state only
- UI and URL remain unchanged until "Uporabi pogled" (Apply View) is clicked
- Applying creates a new history entry iff the combined state differs

### R06: View Confirmation Logic
- On confirmation, q is trimmed
- Default values are omitted from the URL
- Remaining parameters are properly URL-encoded
- Existing view=board parameter is preserved
- Unknown parameters are removed
- Repeated identical confirmation does not add a new history entry

### R07: Browser History Navigation
- Back/Forward buttons restore previous/next confirmed filter states
- UI controls and draft view revert accordingly
- Page refresh restores the confirmed state from the URL

### R08: View Mode Switching
- Swapping between "Table" (Preglednica) and "Board" (Tabla) preserves confirmed parameters
- Displays the same task IDs
- Unconfirmed draft is discarded on each navigation

### R09: Task Details Navigation
- Opening and closing task details via button or Escape key preserves confirmed parameters and view mode
- Direct links to task IDs correctly resolve even if multiple tasks share the same title

### R10: Cross-Project Navigation
- Clicking another project initializes its view with: q="", status=all, order=original
- Current view mode (tabla/board) is retained
- Direct links to other projects with parameters apply those parameters immediately

### R11: Reset View Functionality
- "Ponastavi pogled" (Reset View) clears q, status, order, and draft state
- Applies the same history rules as "Apply View"
- Current view mode is preserved
- Empty result set displays: "Ni zadetkov."
- Counter displays: "Prikazano: N od M."

### R12: Data Integrity Constraints
- No actions modify persisted data or send to the backend
- View state is never stored in localStorage
- Existing behaviors remain intact: unknown route, loading state, details view, Folio responsive layout

## User Interface Contract
- input type=search with aria-label="Iskanje v povezavi"
- select for status: all/todo/in_progress/done
- select for order: original/title-asc/title-desc
- Buttons: "Uporabi pogled" and "Ponastavi pogled"
- Buttons have role=status
- aria-label="Rezultati povezave"
- Counter text: "Prikazano: N od M.."
- Example URL structure
```
#/projects/web?view=board&q=Pregled&status=todo&order=title-desc
```
- Parameter order is not specified
- Preserve data-task-id on rows and cards
- Maintain existing view names and aria-label="Pregled stanj opravil"
- Max width 390px; no full-page expansion; internal scroll allowed for panels/lists

## Data, Scope, and Constraints
- Fetch data from existing public `/api/` endpoint
- Tests may include: 0..∞ tasks, unique/non-unique IDs, name variations, date formats
- Task schema: id, title, description, assignee, due_date
- Projects may be empty; assignees may not match `all` reserve; multiple tasks may share title

### Forbidden Behaviors
- NO usage of `/__test/` endpoints or mock data generators
- NO localStorage persistence
- NO modifications to server, shared types, dependencies, or baseline API contracts
- NO additional write endpoints
- Modify only: src/, tests/agent/, docs/agent/
- Pilot mentions in docs are historical; use current date 2026-11-02 for new ratifications

## Execution and Traceability

| Req | Rule/Condition                          | Test Approach             | File/Code Ref | Proof/Outcome        |
|-----|----------------------------------------|---------------------------|---------------|---------------------|
| R01 | Default params on bare URL access      | Test direct URL access    | src/view.js   | Initial state       |
| R02 | Normalize query for substring matches  | Verify special char strip | src/filter.js | Match succeeds       |
| R03 | Status + order combined logic          | Test combined queries     | src/filter.js | Results match        |
| R04 | Unknown params ignored                 | Inject unknown params URL | src/parser.js | UI unchanged         |
| R05 | Draft-only until Apply View click      | Modify without clicking   | src/view.js   | URL unchanged        |
| R06 | Deduplicate Apply View in history      | Click Apply twice         | src/history.js| Single history entry |
| R07 | Browser history restores states        | F5, Back, Forward         | src/router.js | Filters restored     |
| R08 | Tabla/Board switch keeps filters       | Toggle view with filters  | src/view.js   | ID set intact        |
| R09 | Details preserve filters + ID resolve  | Open/close by ID/Escape   | src/details.js| UI preserved         |
| R10 | Cross-proj initialization with defaults | Click other project       | src/router.js | Defaults applied     |
| R11 | Reset clears filters + draft           | Click Reset Control       | src/view.js   | All fields blank     |
| R12 | No localStorage/API writes             | Verify state immutation   | src/view.js   | Assertions pass      |

## Open Questions and Limitations
- ID uniqueness across projects: R09 resolves via data model query (by `data-task-id`) rather than title.
- Task schema: may include `due_date`, but requirement R03 does not mandate it.
- Test data: baseline tests support 0+ tasks, unique/non-unique IDs, name variations.
