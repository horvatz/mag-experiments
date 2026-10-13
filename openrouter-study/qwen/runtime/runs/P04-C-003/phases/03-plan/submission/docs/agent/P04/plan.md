# P04 Plan: Stable Two-Key Sorting
**Context**: React/TypeScript/Vite baseline. API-only data access (no local storage). Preserve Folio design.

## Core Components
### sorting.ts (NEW)
- `multiKeySort(tasks, keys, orders)`  
- `normalizeString()`: NFD → strip diacritics (U+0300-036F) → lowercase  
- Status ordinal: todo(1) < in_progress(2) < done(3)  
- Date: valid YYYY-MM-DD lexicographic compare  
- Stability: original array index preserved for equal keys

### SortControls.tsx (NEW)  
- Dropdowns: primary/secondary keys + asc/desc  
- No persistent state (session only per R08-R10)  
- Reset on project switch (R09)

### TaskList & ListItem (MOD)  
- Integrate sort params from controls  
- Ensure `data-task-id` visible for R12

## File Structure
src/services/sorting.ts (NEW): core logic
src/components/SortControls.tsx (NEW): UI controls  
src/components/TaskList.tsx (MOD): integrate params
src/components/ListItem.tsx (MOD): data-task-id
src/App.tsx (MOD): state wiring
tests/agent/p04-sorting.spec.ts (NEW): verify R01-R12

## Testing
1. Unit: normalizeString(), status ordinals, date parsing  
2. Integration: multi-key sort edge cases  
3. E2E: controls persist, reset behavior
4. Regression: existing API responses unchanged

## Constraints
- Session-only storage (no localStorage)
- Date validation: YYYY-MM-DD only
- UI max width: 390px
- Projection only (R11): no save endpoint

