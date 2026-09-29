# Folio Constitution

## Core Principles

### I. Preserve the Folio experience
Extend the existing application while retaining its confirmed Folio design, responsive behavior, accessible controls, and Slovenian naming.

### II. Use the established data contract
Read and save application data through the public `/api/` interface and identify projects and tasks by `id`. The UI must not use test-only `/__test/` controls or replace server data with a local copy or `localStorage`.

### III. Keep changes within the task boundary
Application changes belong in `src/`, `tests/agent/`, and `docs/agent/`. Keep the server, shared types and tests, dependencies, and runtime and verification settings unchanged unless a shared baseline update has been agreed in advance.

### IV. Verify and report accurately
Use the applicable shared checks and focused agent checks. Report the checks actually run, their results, and any requirements that remain unmet; do not present unrun tests as successful.

## Governance

These principles summarize `PROJECT_RULES.md` and the confirmed Folio design in `docs/dizajn.md`. Apply them within the task's stated scope; they do not authorize scope expansion or infrastructure changes.

**Version**: 1.0.0 | **Ratified**: 2026-09-27 | **Last Amended**: 2026-09-27
