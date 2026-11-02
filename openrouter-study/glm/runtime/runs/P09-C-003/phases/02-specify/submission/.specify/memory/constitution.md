# Folio Constitution

## Core Principles

### I. Requirements Are Authoritative
The original task requirements are the source of truth, even if a later specification omits them. Clarifications must come from existing requirements; missing material information is recorded as a limitation rather than invented.

### II. Preserve Confirmed Folio Design
Folio is the approved product identity. Interface work preserves its Slovenian naming, floating navigation, gentle blue accents, accessible focus, responsive behavior, and existing visual language unless the governing requirements explicitly require otherwise.

### III. Respect Product Boundaries
The user interface obtains project and task data only through the public `/api/` interface, selects records by `id`, and does not read, reset, or configure data through test-only `/__test/` controls. URL state represents the current project/task route and approved view parameters; it does not replace server data.

### IV. Keep Changes Minimal and Traceable
Changes stay within the scope and write limits established for the governing procedure. Specifications follow the shared template, map every requirement to a condition and verification method, and distinguish verified outcomes from unverified or limited cases.

### V. Prove Claims Honestly
A behavior is reported as working only after a relevant check was actually run and its source is identifiable. Failed or unavailable checks are reported as such. Do not present planned, skipped, or unrelated tests as passing evidence.

## Non-Negotiable Rules

- Do not add dependencies, change test infrastructure, alter the public API contract, or replace server-backed data with a local copy or `localStorage`.
- Do not let the application consume test controls, test state, or fixtures.
- Do not expand scope beyond the governing requirements or introduce a mandatory architectural rewrite without an explicitly approved baseline change.
- Do not create Git branches or commits during a procedure that forbids them.
- Do not weaken accessibility, responsive behavior, loading, error, detail, or unknown-route behavior already guaranteed by the requirements.

## Governance

This constitution governs project work and takes precedence over conflicting local practices that are not part of an approved governing instruction. Amendments require an explicit, documented baseline change and must preserve the shared specification and traceability obligations.

**Version**: 1.0.0 | **Ratified**: 2026-11-02 | **Last Amended**: 2026-11-02
