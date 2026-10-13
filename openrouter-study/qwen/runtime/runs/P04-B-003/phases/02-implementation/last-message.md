I have implemented the required sorting functionality for the P04 pilot task. Here is a summary of the work completed:

### Implementation Summary

**Files Created:**
- **`src/utils/sort.ts`**: Implemented utility functions for:
  - `normalize()`: Handles R02 requirements (NFD normalization, diacritic removal, lowercase conversion)
  - `compareStatus()`: Implements R03 status ordering (todo < in_progress < done)
  - `compareDate()`: Handles R03 date comparisons for YYYY-MM-DD formats
  - `stableSort()`: Implements R06 stable sorting that preserves original indices when primary/secondary keys match

- **`src/hooks/useTaskSort.ts`**: Created React hook managing:
  - Default initial state per R01 (primary: original, direction: asc, secondary: null)
  - Sorting logic with proper primary and secondary key application per R04/R05
  - Reset functionality for R09 (project switch) and R10 (reset button)
  - Local-only persistence (no localStorage or API writes per R11)

**Key Features Implemented:**
- Full dual-key sorting with independent direction control for both primary and secondary keys
- Stability guarantee via original index tracking in the sort comparator
- Proper handling of "original" primary key which bypasses all sorting (R06)
- Edge case handling for empty projects and single-task projects (R10)
- No changes to existing task data structures or API calls (R11 compliance)

**Notes:**
- The implementation follows the existing codebase style (TypeScript, React functional components)
- Sorting utilities use native JavaScript/TypeScript methods for performance
- The hook properly handles the case where secondary sorting shouldn't apply when primary is "original"
- All sorting comparisons are pure functions without side effects

The task is complete and ready for testing via the existing Playwright test suite.
