## Core Principles
> 
> ### I. Library-First
> All functionality derived from existing shared libraries in `server/` and `shared/`.
> 
> ### II. Spec-Kit Workflow
> Spec Kit is the unified method for specifications, plans, and implementation; local skills are exclusive to these steps.
> 
> ### III. Test-Verified (NON-NEGOTIABLE)
> All new actions require appropriate tests in `tests/agent/` before execution; shared tests remain untouched.
> 
> ### IV. API-Constrained
> All readers and writers use the public API `/api/`; internal test control `/__test/` is available only to development tests.
> 
> ### V. Slovenian by Design
> The user interface maintains Slovenian naming, UI text, and controls from the certified Folio design.
> 
> ## Scope Boundaries
> - UI code in `src/` with blue accents, system font, and Folio color scheme.
> - Custom tests in `tests/agent/` and custom documentation in `docs/agent/`.
> - Templates, dependencies, server, shared types, and shared tests remain untouched.
> - Changes to shared infrastructure require a unified, pre-agreed update for all processes.
> 
> ## UI Constraints
> - Searcher must be `input type=search` with label Išči opravila.
> - Filters must be `select` elements for statuses and responsible persons.
> - Button Počisti filtre with `role=status` and `aria-label=Rezultati filtriranja`.
> - `data-task-id` on all tasks; `aria-label=Pregled stanj opravil` for view.
> - At 390px width page remains compact without horizontal scroll.
## Acceptance Criteria
> 
> | Requirement | Rule | Verification |
> |---|---|---|
> | R01 | Empty fields on mount | Load state test |
> | R02 | Unicode NFD matching | Unicode test |
> | R03 | Word-based substring | Split matching test |
> | R04 | AND logic | Combined filter test |
> | R05 | Unique assignees | Selector population test |
> | R06 | View consistency | Cross-view test |
> | R07 | Project isolation | Project switch test |
> | R08 | Default reset | Refresh test |
> | R09 | Accurate counting | Count verification test |
> | R10 | Empty state | Zero match test |
> | R11 | Reset all | Clear button test |
> | R12 | Accessibility | Network and render test |
> 
> ## Traceability
> - Source: task/instructions.md
> - Date: 2026-10-13
> - File: docs/agent/P03/spec.md
# P03: Search and Combined Filters
> 
> ## Overview
> The Search and Combined Filters feature for the Folio agent task management application.
> 
> **Purpose:** Enable users to search and filter projects by keyword, status, and assignee.
> 
> **Functional Requirements:** R01 through R12 define the core behavior.
> 
> ## Functional Requirements
> 
> ### R01: Initial State
> On mount, search input empty, filters reset to all, all tasks displayed in original order.
> 
> ### R02: Unicode-aware Search
> Search reviews ID, title, description, assignee. NFD normalization, removes combining marks U+0300-U+036F, lowercase. č=c+C matches.
> 
> ### R03: Word-based Search
> Input splits by whitespace. All words must be substrings. Empty input returns all. Order agnostic.
> 
> ### R04: Combined Filtering
> Status and assignee filters AND with search. All conditions must match simultaneously.
> 
> ### R05: Assignee Selector
> Includes all plus every unique non-empty project name exactly once. Project switch resets selection.
> 
> ### R06: Consistent Views
> Table and Grid show same IDs. View switch preserves all filters.
> 
> ### R07: Project Context
> Filters scoped to current project only. Switch resets search and both filters.
> 
> ### R08: Default on Refresh
> Page refresh starts with default filters. Not saved in URL or persistent storage.
> 
> ### R09: Result Counts
> Prikazano: N od M. N=displayed count, M=total project count. Column counts match.
> 
> ### R10: Empty Results
> Message Ni zadetkov. shown. Both views usable. Empty project keeps default state.
> 
> ### R11: Clear Filters
> Single button resets all three controls to defaults. Original order restored.
> 
> ### R12: UI Accessibility
> Navigation and breadcrumbs work. No POST/PATCH/PUT/DELETE to /api/. At 390px no horizontal scroll.
