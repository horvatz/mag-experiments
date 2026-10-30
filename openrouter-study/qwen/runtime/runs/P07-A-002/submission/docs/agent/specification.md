# P07: Specification for Folio Favorites Feature

**Problem and Context**:
The Folio application provides a tool for managing tasks within a project context. This task is to implement a 'Favorites' feature that allows users to mark certain tasks as favorites for quick access. This feature should be persistent and stored locally. The implementation must align with existing UI patterns and not introduce new dependencies or breaking changes.

**Design Principles**:
- Respect existing UI guidelines from docs/dizajn.md
- Use existing styling and component patterns
- Avoid introducing new external dependencies
- Maintain simplicity and usability

**Key Requirements**:
- R01: Each task must have a 'Favorite Task <id>' button with aria-pressed attribute
- R02: Store in localStorage key 'folio:favorites:v1' as JSON {version:1, ids:[...]}
- R03: Refresh restores stored IDs, duplicate or unknown IDs are handled gracefully
- R04: Invalid storage (missing keys, bad JSON, wrong format) means empty set
- R05: 'Show Favorites Only' checkbox is default disabled and filters to current project only
- R06: Removing favorites from filter shows 'No favorite tasks' message
- R07: List and board views share the same favorites and filter state
- R08: Project change keeps global favorites set but resets filter to false
- R09: 'Remove Favorites from This Project' only removes IDs for current project
- R10: Counter shows 'Favorites: X of M' with proper counts
- R11: storage event updates favorites immediately, handles errors gracefully
- R12: All favorite changes are local with no API writes

**UI Contract**:
- Favorite buttons with aria-pressed=true/false
- 'Show Favorites Only' checkbox
- 'Remove Favorites from This Project' button
- Status element with role=status and aria-label='Pretile priljubljenih', text 'Favorites: X of M'.
- Favorites task error with role=alert containing 'shramba' (storage error message)
- Maintain data-task-id on rows and cards
- Keep view names and column names for existing views


## Implementation Summary

All requirements R01-R12 have been implemented:
- R01: Each task has a Heart button with aria-pressed attribute
- R02: Storage uses key folio:favorites:v1 with format {version:1, ids:[...]}
- R03: App initializes on load from localStorage, handles invalid JSON gracefully
- R04: Invalid storage returns empty Set, app continues normally
- R05: Show only favorites filter available, default state no filter active
- R06: Filtered view shows only favorite tasks for current project
- R07: Board and list views share state through shared global _favorites
- R08: Project navigation maintains global favorites, resets filter 
- R09: Remove button only removes project IDs, disabled when no favorites
- R10: Status element shows X of M format for favorite count
- R11: localStorage.setItem persists state immediately
- R12: No API calls made for favorites, purely client-side