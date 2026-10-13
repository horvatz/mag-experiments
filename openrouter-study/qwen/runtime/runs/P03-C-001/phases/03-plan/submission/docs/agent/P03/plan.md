# P03 Implementation Plan: Search and Filter

**Date:** 2026-10-13
**Feature:** Search and Combined Filters (R01–R12)
**Context:** Folio React/TypeScript/Vite application

## Technical Context

**Existing Infrastructure:**
- Tech Stack: React, TypeScript, Vite
- State Management: React hooks (useState, useMemo, useEffect)
- API: Public GET /api/projects, /api/projects/{id}/tasks
- Components: Monolithic architecture in src/App.tsx, src/TaskBoard.tsx
- Styling: Vanilla CSS in src/styles.css
- Type Definitions: src/shared/types.ts

**Decision: No New Dependencies** (per constraint C01)
Extend existing infrastructure without adding packages. Filtering uses native JS string methods.

## Design Decisions

### 1. Client-Side Filtering
**Decision:** Perform filtering on client with request for all tasks
**Rationale:** R12 prohibits POST/PATCH/PUT/DELETE to /api/; Existent API only supports GET
**Implementation:** src/filter.ts applies filters locally using useMemo

### 2. Unicode Normalization
**Decision:** Use String.normalize("NFD") + regex replacement
**Code:** normalize → NFD → remove U+0300-U+036F → lowercase

### 3. Filter State Management
**Decision:** Centralized filter state hook
**State:** { searchQuery: string, status: "all"|"todo"|"in_progress"|"done", assignee: "all"|string|null }

### 4. Debounced Search
**Decision:** 300ms debounce using setState timeout pattern

### 5. Accessible Controls
**Decision:** Semantic HTML with ARIA attributes
- `<input type="search" aria-label="Išči opravila" />`
- `<select aria-label="Filter stanja" />`
- `<button role="status" aria-label="Rezultati filtriranja" />`

### 6. Project Scope
**Decision:** Filters scoped per project; clear on navigation

## File Structure

### New Files
- src/filter/index.ts - Filter hook and logic
- src/filter/useSearch.ts - Search debounced hook
- src/filter/useFilters.ts - Combined filter state
- src/components/SearchFilter.tsx - Main filter component
- src/components/FilterStatus.tsx - Status dropdown
- src/components/FilterAssignee.tsx - Assignee dropdown
- src/components/ClearFilters.tsx - Reset button
- src/search/index.ts - Search types and utilities
- src/search/search.ts - Search algorithm
- src/types/filters.ts - Filter type definitions

### Modified Files
- src/App.tsx - Add filter controls wrapper
- src/TaskBoard.tsx - Integrate filters
- src/styles.css - Add responsive styles (390px)

## Implementation Steps

**Phase 1: Core Logic (R01, R02, R03)**
1. NormalizeUnicode helper
2. useSearch hook with 300ms debounce
3. Word-based substring matching
4. Išči opravila input component

**Phase 2: Combined Filters (R04, R05, R09)**
1. Combined filter state in useFilters.ts
2. Status dropdown component
3. Assignee selector (unique values)
4. Result count "Prikazano: N od M"

**Phase 3: Integration (R06, R07, R08)**
1. Mount filters on ProjectView
2. Clear filters on project switch
3. Session storage vs global React state
4. Preserve across view switch

**Phase 4: UI Polish (R10, R11, R12)**
1. Ni zadetkov empty state
2. Clear Filters button role=status
3. Responsive at 390px
4. ARIA verification

## Testing Strategy

**Unit Tests (tests/agent/):**
- filter.logic.spec.ts - Unicode, AND logic
- search.algo.spec.ts - Word split, substring match
- filter.component.spec.ts - Rendering, handlers
- ui.accessibility.spec.ts - ARIA, keyboard nav

**Integration (Playwright):**
- project.filter.spec.ts - Filter reset on switch
- search.spec.ts - Cross-project search
- responsive.spec.ts - 390px compliance

## Open Questions
1. Filter persistence: session storage vs global state
2. 390px layout: floating dropdowns vs inline stacking
3. Debounce: native setTimeout vs utility lib
4. API extension: GET /api/tasks query params

## Constraints
- C01: No new API endpoints; use existing GET /api/tasks
- C02: Maintain Folio design, Slovenian UI
- C03: All tests in tests/agent/, shared tests untouched

---
**Traceability:** Spec: docs/agent/P03/spec.md | Feature: .specify/feature.json | Date: 2026-10-13
