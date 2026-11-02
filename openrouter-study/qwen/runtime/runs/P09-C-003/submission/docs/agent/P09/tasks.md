# P09 Implementation Tasks

## Phase 1: Core Logic & Utilities

- [ ] T001 Implement query normalization function (trim NFD, remove unicode marks, lowercase) in src/filter.ts
- [ ] T002 Build query builder function to combine q and status filters (AND logic) in src/filter.ts
- [ ] T003 Implement sort function supporting original, title-asc, and title-desc order in src/filter.ts

## Phase 2: Routing & State Management

- [ ] T004 Extend src/useRoute.ts to parse q, status, order params from URL with defaults
- [ ] T005 Implement useViewStore hook to manage draft vs confirmed state locally without localStorage
- [ ] T006 Create useFilteredTasks custom hook to fetch and filter data based on current state

## Phase 3: UI Components

- [ ] T007 Create ViewFiltersBar component with search input, status select, and order select
- [ ] T008 Implement "Uporabi pogled" button with applyView function (history.push) and deduplication logic
- [ ] T009 Implement "Ponastavi pogled" button with resetView function
- [ ] T010 Extend Task Table to support "Preglednica" layout with custom columns
- [ ] T011 Extend Task Board to support "Tabla" layout with dynamic columns
- [ ] T012 Update TaskDetails modal to receive and preserve open state of filters

## Phase 4: Integration & Edge Cases

- [ ] T013 Integrate custom filters into existing TaskTable and TaskBoard components
- [ ] T014 Add browser history management (pushState/poolState) for Back/Forward navigation
- [ ] T015 Handle cross-project navigation: reset filters to defaults when switching projects
- [ ] T016 Validate URL params to ignore unknown parameters gracefully (no breaking changes)

## Accessibility & Polish

- [ ] T017 Add aria-labels for search control and result count (Prikazano: N od M)
- [ ] T018 Ensure container respects 390px max-width constraint for scroll behavior
- [ ] T019 Test empty state display: show "Ni zadetkov." when result array is empty
- [ ] T020 Final integration test: verify URL state persists across page refresh
