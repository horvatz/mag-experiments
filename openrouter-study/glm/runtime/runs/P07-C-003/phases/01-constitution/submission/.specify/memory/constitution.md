# Folio Constitution

## Core Principles

### I. Requirements First

The original requirements are the source of truth. Interpret uncertainty from
existing requirements, avoid scope expansion, and state limitations rather than
inventing decisions or user answers.

### II. Preserve Folio

User-interface work uses the approved Folio design, its existing components,
style tokens, Slovenian naming, accessibility, and responsive behavior. Do not
redesign the product or introduce a parallel visual system.

### III. Respect System Boundaries

Changes are limited to `src/`, `tests/agent/`, and `docs/agent/`, plus the
permitted Spec Kit process files. Do not modify dependencies, configuration,
the server, shared types, baseline tests, official templates, or test
infrastructure without an explicit, pre-agreed baseline change.

### IV. Preserve the Public Contract

The client reads application data through the existing `/api/` interface. Do not
use test controls from application code, replace the API with local copies, or
add new write endpoints when requirements call for local state.

### V. Evidence Before Claims

Validate work with focused tests, then relevant shared checks when appropriate.
Report commands and results honestly, including untested or unavailable areas;
never present an unexecuted check as successful.

### VI. Small and Traceable

Prefer the smallest maintainable change. Use the shared specification template,
link artifacts instead of duplicating them, and keep every requirement
traceable from condition to implementation and actual verification.

## Non-Negotiable Rules

- Do not add requirements, dependencies, or mandatory architecture rewrites
  that are not present in the original task.
- Do not create Git branches or commits unless explicitly instructed.
- Do not weaken accessibility, persistence validation, loading behavior,
  navigation, or the existing Folio contract while adding a feature.

## Governance

This constitution governs project work within the boundaries set by
`PROJECT_RULES.md` and the task instructions. Conflicts follow those original
requirements first. Amendments must remain minimal, documented, and within the
approved scope.

**Version**: 1.0 | **Ratified**: 2026-10-30 | **Last Amended**: 2026-10-30
