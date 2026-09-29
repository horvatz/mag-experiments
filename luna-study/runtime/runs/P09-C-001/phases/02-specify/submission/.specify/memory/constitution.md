# Folio (Pilot P09) Constitution

## Core Principles

### I. Preserve the Folio experience
Extend the existing application, preserving its approved Folio design, responsive behavior, and Slovenian labels. Keep changes focused; do not add dependencies or require broad architectural rearrangements.

### II. Respect application boundaries
Use the existing public `/api/` interface for application data and select records by `id`. Do not substitute local data or `localStorage` for the API. The `/__test/` controls are for test programs only and must not be used by the user interface.

### III. Keep shared foundations stable
Limit application changes to `src/`, agent-owned tests in `tests/agent/`, and agent-owned documentation in `docs/agent/`. Keep seed data, server, shared types, baseline tests, dependencies, and runtime or test configuration unchanged unless a common baseline update has been agreed in advance.

### IV. Verify and report accurately
Check changes with the applicable shared tests and add focused agent-owned checks where useful. Report what was actually run and its result; state unverified behavior and unmet requirements plainly.

## Development Constraints

Preserve existing unknown-route handling, loading and detail behavior, and the adaptable Folio layout when extending the interface. Test controls must not expose or modify test state through the application.

## Governance

These principles guide feature specifications and implementation in this project. Where a task sets narrower boundaries, follow those boundaries. Amend this constitution only when project rules change; keep its version and dates accurate.

**Version**: 1.0.0 | **Ratified**: 2026-09-28 | **Last Amended**: 2026-09-28
