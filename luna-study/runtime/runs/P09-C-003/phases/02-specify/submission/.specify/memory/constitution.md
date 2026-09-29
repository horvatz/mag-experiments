# Folio Pilot P09 Constitution

## Core Principles

### I. Preserve the approved experience
Extend the existing interface, keep its Slovenian naming, and preserve the approved Folio design in `docs/dizajn.md`.

### II. Respect the application contracts
Read and save application data through the public `/api/` interface and identify records by `id`. The user interface must not access test-only `/__test/` controls or substitute local data or `localStorage` for the API.

### III. Keep changes within the agreed boundary
Limit application changes to `src/`, agent-owned tests in `tests/agent/`, and agent documentation in `docs/agent/`. Leave seed data, server, shared types, baseline tests, dependencies, and run or verification settings unchanged unless a shared baseline update has been agreed in advance.

### IV. Verify and report accurately
Run the applicable shared checks and add focused agent-owned checks where useful. Report the checks actually run, their results, and any unmet or unverified requirements; do not describe an unrun check as passing.

## Governance

These principles guide work on the Folio P09 application. The task's explicit requirements define feature behavior; this constitution does not add feature requirements. Changes to shared infrastructure require the advance agreement described in the project rules.

**Version**: 1.0.0 | **Ratified**: 2026-09-29 | **Last Amended**: 2026-09-29
