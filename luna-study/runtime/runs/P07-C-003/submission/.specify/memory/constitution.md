# Folio Constitution

## Core Principles

### I. Preserve Folio
Extend the existing application while preserving its accepted Folio design, Slovenian naming, established navigation, and responsive behavior.

### II. Respect data ownership
Use the existing public `/api/` for server-managed application data and identify tasks by `id`. Keep test-only controls out of the user interface; do not mirror server data in local storage or use local storage in place of the API.

### III. Keep changes within the agreed boundary
Limit application changes to `src/`, agent-owned tests in `tests/agent/`, and agent documentation in `docs/agent/`. Keep the server, shared types, baseline tests, dependencies, and run/check settings unchanged. Shared infrastructure changes require an agreed baseline update.

### IV. Verify and report honestly
Use relevant shared checks and add task-specific checks when useful. Report only checks actually run and their results; state unverified requirements and limits plainly.

## Development Constraints

These principles derive from `PROJECT_RULES.md`. They do not prescribe new dependencies, architecture, or implementation techniques. Follow task-specific requirements within these project boundaries.

## Governance

Apply these principles when planning and reviewing application changes. Where a task instruction and these principles appear to conflict, follow the project rules and the task's explicit scope; do not infer permission to alter shared infrastructure.

**Version**: 1.0.0 | **Ratified**: 2026-09-28 | **Last Amended**: 2026-09-28
