# Folio Constitution

## Guiding Principles

### 1. Preserve the Approved Product
Folio is a React application for reviewing project work. Keep the approved Folio
visual language, Slovenian product names, existing accessibility labels, and the
existing spreadsheet/table behavior unless a requirement explicitly changes it.

### 2. Respect the Baseline Boundary
Change only the user interface in `src/`, agent-owned tests in `tests/agent/`,
and agent documentation in `docs/agent/`, plus the permitted Spec Kit process
files. Do not change the server, shared types, baseline tests, dependencies,
run configuration, templates, skills, or infrastructure.

### 3. Use the Public API
Read and persist application data only through the existing `/api/` interface and
select records by `id`. The interface must not use test controls under `/__test/`,
replace the server with local data, or store application data in `localStorage`.

### 4. Keep Changes Focused and Reversible
Solve the stated requirement directly, reuse existing components and styles, and
avoid speculative features, new dependencies, or mandatory architectural
rewrites. Infrastructure changes require a separately agreed baseline update.

## Non-Negotiable Rules

- Preserve `data-task-id`, the accessible names of existing views and columns, and
  `aria-label="Pregled stanj opravil"`.
- Keep the full page within a 390-pixel viewport width; internal scrolling of the
  spreadsheet and board remains allowed.
- Place new task actions outside the existing task link.
- Use the locked dependency versions and `npm ci` for reproducible setup.
- Verify changed behavior with relevant baseline and agent tests. Record actual
  results, source evidence, untested areas, and limitations honestly.

## Governance

This constitution governs Pilot P06, Procedure C. It derives from
`PROJECT_RULES.md`, `README.md`, `docs/dizajn.md`, and the shared specification
template. Amendments require an explicit pilot instruction and an update to this
document; they do not silently expand the task scope.

**Version**: 1.0.0 | **Ratified**: 2026-10-10 | **Last Amended**: 2026-10-10
