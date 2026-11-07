# Folio Constitution

**Ratified:** 2026-10-30

## Core Principles

### I. Preserve Folio

Folio is the confirmed product design. UI work uses its existing components, layout tokens, typography, colors, Slovenian terminology, and visible keyboard focus. Visual additions integrate with this language rather than replacing it.

### II. Respect the Source Boundary

The application reads task data only through the public `/api/` interface and selects records by `id`. UI code never reads or writes test controls under `/__test/`, never substitutes a local data copy for the API, and never changes server behavior, shared types, dependencies, or build infrastructure.

### III. Keep State Honest and Local

Any browser persistence must follow an explicitly specified contract. Feature state is local unless a requirement says otherwise; API records are not modified by UI-only behavior. Validation failures or unavailable storage must leave the current in-memory UI usable.

### IV. Build Accessibly and Testably

Interactive controls have accessible names and state where relevant. Shared baseline behavior remains intact. Feature changes receive focused tests, and only executed checks are reported as passing.

### V. Stay Minimal and Traceable

Solutions implement the original requirements without expanding scope. Application changes remain within `src/`, agent tests within `tests/agent/`, and agent documentation within `docs/agent/`. Documentation links each requirement to its condition, implementation, and verification result or limitation.

## Non-Negotiable Rules

- Do not add requirements, dependencies, APIs, migrations, or architectural rewrites that are not requested.
- Do not alter test-only controls, baseline tests, server code, shared types, dependency versions, or validation infrastructure.
- Do not create Git branches or commits during the procedure.
- Do not invent missing user decisions. State the limitation and use only the provided requirements and local context.

## Governance

The original task requirements are the source of truth. This constitution guides execution and may be clarified only without adding new obligations. Conflicts defer to the task-specific instructions.

**Version:** 1.0 | **Last Amended:** 2026-10-30
