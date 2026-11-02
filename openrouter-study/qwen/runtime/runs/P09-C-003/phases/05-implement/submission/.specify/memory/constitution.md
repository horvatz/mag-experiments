# Folio Pivot Constitution

## Core Principles

### I. Folio Design Faithfulness (NON-NEGOTIABLE)
Preserve the approved Folio UI design from `docs/dizajn.md`: Slovene labels, visual style, component layout. No structural UI changes.

### II. API-Only Data Access (NON-NEGOTIABLE)
Read/write exclusively via `/api/` endpoints. Never access test controls `/__test/`, localStorage, or replicate server logic locally.

### III. View State Management (NON-NEGOTIABLE)
View filters (q, status, order) mutate drafts without UI/URL changes until "Uporabi pogled" confirms all three values simultaneously.

### IV. Incremental Implementation (NON-NEGOTIABLE)
Write proofs incrementally and concisely. Avoid duplicate documentation. Connect new requirements to existing task IDs.

### V. Scope Boundaries (NON-NEGOTIABLE)
Modify only `src/`, `tests/agent/`, and `docs/agent/`. Preserve server/, shared/, base configs, APIs, and test infrastructure. No remote repositories or Git branches.

### VI. Slovene Language Preservation (NON-NEGOTIABLE)
Maintain all UI text in Slovene. IDs, component names, and aria-labels remain in original language.

## Additional Constraints

### Technology Stack
- Use provided dependencies and Chromium. No external packages.
- No connectors, remote repositories, or additional Git branches.

### Feature Limitation
The C process may update only `.specify/memory/constitution.md` and `.specify/feature.json`. All other Spec Kit files are read-only.

### Test Invariants
- Baseline tests (`tests/baseline.spec.ts`, `tests/api.spec.ts`) remain unchanged.
- View state persists in browser history via URL, not localStorage.
- Tabla/Board switch preserves filters.

## Development Workflow

1. Read task requirements and specification template.
2. Complete existing Folio UI; preserve Slovene labels.
3. Read/write data via `/api/` endpoints (query by ID).
4. Verify with baseline tests and add agent-specific tests in `tests/agent/`.
5. Document implemented requirements, unverified portions, and limits.

**Version**: 1.0 | **Ratified**: 2026-11-02 | **Last Amended**: N/A
