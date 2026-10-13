# Verification Plan - P04 雙鍵穩定排序
## Initial State
- Implementer has not created src implementation or tests/agent tests
- Existing dev tests tests/development/P04.spec.ts define D01-D04

## Components to Implement
### src/utils/sort.ts
- `normalize(s): string` - R02: NFD normalization, remove U+0300-U+036F diacritics, lowercase
- `compareStatus(a: Task, b: Task): number` - R03: todo < in_progress < done
- `compareDate(a: Task, b: Task): number` - R03: YYYY-MM-DD string comparison
- `stableSort<T>(items: T[], comparator: (a: T, b: T) => number): T[]` - R06: preserve original indices

### src/hooks/useTaskSort.ts
- `useState` - R01: `primary: "original", direction: "asc", secondary: null, secondaryDirection: "asc"`
- `persistent local state` - R08: refresh does not reset
- `resetSort()` - R09/R10: reset to initial
- `tasksSorted` computed value
- Reset on project switch - R09

### src/TaskBoard.tsx or App.tsx
- Controls: primary key, direction, secondary key, secondary direction, "Izvorni vrstni red" button
- Three columns remain consistent - R07
- wrapper with table-scroll - max 390px width - R07

## Testing Strategy

### Custom tests/agent/
1. sort.spec.ts - normalize, compareStatus, compareDueDate, stableSort tests - R02,R03,R06
2. sorting.spec.ts - Playwright tests D01-D04

## Limitations & Notes
- Cannot call chromium.connect() directly as wsEndpoint not in test environment
- Must rely on playwright test runtime
- Internet is blocked, only local API available
