# P04 Implementation Plan

## Overview
Client-side projection sorting for the Folio task view, supporting primary and secondary keys with stability.

## Requirements
R01: Default sort (original, asc, none, asc).
R02: Unicode normalization for string keys (NFD, remove accents, lowercase).
R03: Status order (todo -> in_progress -> done), Date (YYYY-MM-DD).
R04: Asc/Desc inverts comparison only.
R05: Secondary key applies when primary is equal.
R06: Stable sort preserves original order for equals.
R07: Three-column table layout.
R08: View toggle preserves sort.
R09: Project reset defaults.
R10: Reset button restates defaults.
R11: Projection, no mutation.
R12: Unique IDs visible.

## Architecture
- **Logic:** Client-side sort state.
- **Data:** Read-only /api/ usage.
- **Design:** Folio standard (224px sidebar).

## Implementation
### Source (src/)
-  (R02, R03, R04, R05, R06)
-  (R02)
-  (State management)
-  (UI for keys/directions)

### UI
- Apply sort state to  or .
- Reset button logic.

### Tests (tests/agent/P04/)
-  (Unit tests for comparison)
-  (UI flows)

## File Structure
docs/agent/P04/plan.md (This file)
