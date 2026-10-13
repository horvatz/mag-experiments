# Folio Constitution

**Version**: 1.0.0 | **Ratified**: 2026-10-13 | **Last Amended**: 2026-10-13

## Project Purpose

Folio is a React application for organizing work across projects. P10 features must build on the existing approved Folio experience without changing its identity or the baseline behavior outside the requested scope.

## Core Principles

### I. Requirements First

Use the P10 requirements and the shared specification template as the source of truth. Preserve the original Slovenian naming and required accessible labels; do not invent requirements or silently narrow them. Record assumptions, limitations, and actual verification evidence honestly.

### II. Preserve Folio

Honor the confirmed Folio design in `docs/dizajn.md`. Reuse existing components, layout language, and style variables where practical. Keep the application responsive and keyboard accessible, including visible focus and scroll contained to the table or board on narrow screens.

### III. Respect Baseline Boundaries

Application changes are limited to `src/`, `tests/agent/`, and `docs/agent/`; the C process may also update `.specify/memory/constitution.md` and `.specify/feature.json`. Treat server data, shared types, shared tests, configuration, dependencies, templates, and skills as read-only unless the process instructions explicitly permit otherwise.

### IV. API and State Integrity

Read and save data only through the public `/api/` interface, selecting records by `id`. Preserve task fields and statuses except where a P10 requirement explicitly defines a local permutation. Do not access test controls from the UI, replace the server with local data, use `localStorage` for persistence, or create persistent records when the requirements specify local, non-persistent state.

### V. Verified, Minimal Change

Prefer small, focused changes with no new dependencies or mandatory architecture rewrites. Verify changed behavior with relevant shared and task-specific tests, then report actual outcomes. Never present an unexecuted check as successful.

## Non-Negotiable Rules

- Keep the direct move, undo, redo, and reset semantics defined by the P10 requirements.
- Keep move controls outside task links and preserve required `data-task-id`, roles, and accessible names.
- Preserve global ordering semantics across table and board views, including moves within fixed status columns.
- Do not alter baseline infrastructure, test fixtures, dependency versions, or test-only endpoints.
- Do not create Git branches or commits during the P10 C process.

## Governance

This constitution governs P10 work. If instructions conflict, the explicit P10 requirements and process boundaries take precedence over convenience or implementation habits. Amendments require clear approval and must not broaden scope or mandate dependencies without a corresponding baseline update.
