# Plan: P05 - Pagination and Status Filter Implementation

## Technical Context
- Stack: React, TypeScript, Vite
- UI Library: Internal components (TaskBoard, components.tsx)
- Data Access: Public /api/ endpoint for project tasks
- Design: Folio design system (preserved)

## Architecture Decisions
1. State Management: Local React state for pagination, filtering, and view mode. No server-side persistence or URL encoding.
2. Data Fetching: Single call to /api/projects/{id}/tasks on filter/page-size change. No separate pagination endpoints.
3. UI Components: Extend existing TaskBoard and TaskTable to include pagination controls and filter dropdowns.
4. Localization: All UI text, controls, and aria-labels in Slovenian to match existing Folio app.

## Implementation Outline
1. State Hook: Create usePagination hook managing page, pageSize, filter, and selected project.
2. Filter Logic: Filter tasks client-side based on selected status before pagination.
3. Pagination Logic: Calculate total pages, valid ranges, and current slice based on filtered list length.
4. UI Controls:
   - Two select elements: one for page size (all/2/5/10), one for filter (all/todo/in_progress/done).
   - Four buttons for navigation (First, Prev, Next, Last).
   - Status badge showing "Page X of Y".
5. View Switching: Ensure switching between table/board views preserves pagination state.
6. Reset Logic: Changing project clears state to defaults (page=0, pageSize=all, filter=all).
7. Responsive Design: Internal scroll for table at 390px width; no horizontal overflow of the entire page.
8. Aria Labels: Add aria-label="Stanje straničenja" with exact count text per R09.

## Success Criteria
- All 12 requirements (R01-R12) from spec.md are implemented and tested.
- UI matches Folio design guidelines.
- No breaking changes to existing API or core app logic.

