# Folio Constitution

## Purpose

Folio is a React application for organizing work across projects. This constitution
defines the project-level principles and non-negotiable boundaries for all Spec Kit
feature work. It does not prescribe implementation details or add product requirements.

## Core Principles

### I. Requirements First

The original feature requirements are the source of truth. Every feature is specified
against those requirements before implementation, including acceptance conditions,
traceability, verification, and any known limits.

### II. Preserve the Approved Folio Design

The confirmed Folio visual language—neutral surfaces, soft blue accents, the floating
sidebar, small cards, and existing typographic and interaction patterns—remains the
baseline. Feature work must preserve accessibility, responsive behavior, and Slovenian
naming unless a requirement explicitly changes them.

### III. Respect the Public API Boundary

The client reads and persists task data through the existing `/api/` interface. It must
not read or change test controls under `/__test/`, replace server behavior with local
copies, or introduce new write endpoints.

### IV. Change Only Within Agreed Boundaries

Application changes are limited to `src/`, agent-owned tests in `tests/agent/`, and
agent documentation in `docs/agent/`. Process changes are limited to this constitution
and `.specify/feature.json` when the procedure explicitly permits them. Server code,
shared types, baseline tests, dependencies, settings, templates, and infrastructure
remain unchanged without a separately agreed baseline update.

### V. Honest Verification

Verification claims must be based on actual executed checks. Report passed, failed, and
not-run results separately, and never present unavailable tests as successful.

### VI. Simple, Focused Delivery

Use the smallest coherent change that satisfies the requirements. Do not expand scope,
add dependencies, refactor unrelated code, or introduce speculative architecture.

## Non-Negotiable Rules

- Do not use `/__test/` controls from the application UI.
- Do not bypass `/api/` with persistent local storage or a substitute server.
- Do not alter the existing data model, public API behavior, dependencies, or shared
  infrastructure without an explicitly agreed baseline change.
- Do not break existing navigation, readable details, keyboard access, narrow-screen
  behavior, or the approved Folio presentation.
- Do not invent answers when a requirement is missing; state the limitation clearly.

## Governance

This constitution guides all later specs, plans, implementations, and reviews. It is
amended only through an explicit governance change with documented rationale and scope.
More specific feature requirements may add detail, but they must not contradict this
constitution.

**Version**: 1.0 | **Ratified**: 2026-10-12 | **Last Amended**: 2026-10-12
