# Folio Constitution

## Core Principles

### I. Requirements and Scope First
Follow the supplied task requirements, project rules, and shared specification
template before implementation. Keep each feature within the documented scope and
do not invent requirements, dependencies, or mandatory architectural rewrites.

### II. Preserve the Approved Folio Design
Extend the existing `mag-app` interface with its approved Folio visual language,
accessible names, responsive behavior, and existing components. Do not replace
the design system opportunistically.

### III. Respect Existing Contracts
Read and change task data only through the public `/api/` interface. Preserve
existing fields, identifiers, shared types, server behavior, test controls
boundaries, and baseline functionality.

### IV. Evidence-Based Delivery
Verify changed behavior with relevant tests, report only tests actually executed,
and clearly state unverified areas or limitations. Every requirement remains
traceable to its specification, implementation, and evidence.

## Non-Negotiable Rules

- Change only the files allowed by the active task; application work is limited to
  `src/`, `tests/agent/`, and `docs/agent/` unless the task explicitly adds governed
  Spec Kit files.
- Do not alter dependencies, settings, server code, shared infrastructure, official
  templates, or skill files.
- Do not use `/__test/` controls or persistent local storage as application state.
- Do not create branches or commits during this pilot process.

## Governance

These principles govern P10 procedure C. If task instructions and this constitution
conflict, the more restrictive rule applies. Amendments require an explicit task
instruction and must preserve the approved Folio design.

**Version**: 1.0.0 | **Ratified**: 2026-11-01 | **Last Amended**: 2026-11-01
