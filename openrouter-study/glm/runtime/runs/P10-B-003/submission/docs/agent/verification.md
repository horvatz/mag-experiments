# Implementer verification

## Planned checks

- Read the complete specification and map R01–R12 to the existing implementation.
- Add focused local tests in `tests/agent/`.
- Run targeted local tests, then the full `npm run check`.
- Verify no UI API writes, localStorage use, or test-only control access are introduced.
- Record traceability, actual results, specification issues, and environment limitations.

## Implementation traceability

| Requirement | Result |
| --- | --- |
| R01 | `ProjectView` initializes the order from the received task array and both views render the global place. |
| R02 | `moveTask` swaps only the selected task with its global predecessor or successor; task objects are reused unchanged. |
| R03 | Boundary buttons are disabled and `moveTask` rejects invalid indices without changing either history. |
| R04 | Every valid move stores the complete previous permutation in the undo stack; undo stores the current permutation in redo. |
| R05 | Undo and redo pop their latest entries, preserving complete permutations without duplicate or missing IDs. |
| R06 | A valid move clears redo; invalid boundary action leaves redo intact. |
| R07 | The undo stack is truncated to its last 20 entries; 21 alternating moves and 20 undos/redos are covered. |
| R08 | Reset restores the original permutation as another undoable action and clears redo; it is disabled when already original. |
| R09 | The table uses global order; `TaskBoard` filters that order into fixed status columns while moves use global neighbors. |
| R10 | Order and histories are local `ProjectView` state; view/detail changes preserve them, while project change/remount resets them. |
| R11 | The exact status text and disabled states are rendered for empty, one-task, and multi-task projects. |
| R12 | No UI write request, localStorage use, or `/__test/` access was added; fields, statuses, details, and Folio styling remain intact. |

## Actual results

- `npm run lint`: passed.
- `npm run typecheck`: passed.
- `npx playwright test --project=development-desktop --project=development-mobile`: 8 passed.
- `npx playwright test tests/agent/P10.spec.ts --project=agent`: 5 passed.
- `npm run check`: passed; production build succeeded and all 51 available tests passed (14 API, 24 baseline, 8 development, 5 agent).

## Specification review

- No defect or omission was found in the handed-over specification.

## Environment limitations

- The public internet is blocked; only local task services were used.
- Playwright used the prepared Chromium WebSocket endpoint from `task/browser.json`.
- Git diff/status is unavailable in this exported workspace (`Not a git repository`), and macOS `xcrun` emits cache warnings because temporary system paths are denied.
