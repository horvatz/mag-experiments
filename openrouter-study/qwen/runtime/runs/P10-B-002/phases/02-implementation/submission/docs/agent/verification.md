# Verification Plan

Generated: 2026-11-01T22:38:32.000Z

## Requirements Mapping

| ID | Feature | Status | File | Notes |
| --- | --- | --- | --- | --- |
| R01 | Initial order matches API | TODO | src/App.tsx | Validate initial load |
| R02 | Move task up/down swaps with global neighbors | TODO | TaskMoveButton.tsx | Test before/after permutations |
| R03 | Disabled buttons at boundaries | TODO | TaskMoveButton.tsx | First/last task no movement |
| R04 | Each move saves permutation to history | TODO | TaskHistoryBar.tsx | Verify moves array growth |
| R05 | Undo restores previous order | TODO | TaskHistoryBar.tsx | Test redo sequence |
| R06 | New moves discard undo history | TODO | TaskHistoryBar.tsx | Fresh move after undo |
| R07 | Max 20 undo moves retained | TODO | TaskHistoryBar.tsx | Limit enforcement |
| R08 | Reset to initial order | TODO | TaskResetButton.tsx | Clearing redos |
| R09 | Global rank display | TODO | TaskRow/Table.tsx | aria-label=Mesto |
| R10 | View toggle/project switch persist/reset | TODO | App navigation | Local storage vs reset |
| R11 | Counter display zero state | TODO | TaskHistoryBar.tsx | Disabled at 0 |
| R12 | All changes local, no API writes | TODO | App.tsx + readonly | SaveRequests = 0 |

## Test Scenarios

### D01: Initial Load
- Load tasks API → 8 tasks in order [web-01..web-08]
- Verify columnIds sorted
- All move buttons disabled for first/last tasks

### D02: First Move & Undo
- Move web-02 up → order [web-02, web-01, web-03, ...]
- Check moves[0] = [web-02, web-01, web-03, ...]
- Click Undo → restore [web-01, web-02, web-03, ...]
- Redo should restore again

### D03: Undo Stack Reset
- Undo once → undoCount = 1
- Move down → undos cleared, undoCount = 0
- More moves don't populate undos until next undo

### D04: View Toggle & Reset
- Toggle table/board view → order preserved
- Switch projects → order resets to initial
- Refresh → order resets to initial

### D05: Boundary Cases
- Empty project: no move buttons, counter shows "0. 0."
- Single task: all moves disabled

### D06: Max Undo Limit (20)
- Perform 21 consecutive moves
- Verify moves.length ≤ 20
- Oldest permutation discarded

## Environment Notes
- Chromium via WebSocket only (task/browser.json)
- No chromium.launch() available
- No network access (except test API)
- No permanent storage on refresh

## Open Questions
- [ ] Edge case: 21+ tasks with repeated movements
- [ ] Unicode handling in task names
- [ ] Concurrent reactivity during undo/redo
