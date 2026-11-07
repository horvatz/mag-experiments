# Folio Constitution

## Core Principles

### I. Requirements Are the Source of Truth
Work follows the supplied original requirements and the shared specification
template. Do not expand scope, add dependencies, or require architectural
rework that the requirements do not justify.

### II. Respect Change Boundaries
Application changes are limited to `src/`, `tests/agent/`, and `docs/agent/`.
Only the C-process constitution and feature metadata may also be updated.
Server, shared types, baseline tests, dependencies, configuration, templates,
and tooling remain unchanged unless an agreed baseline update explicitly
permits otherwise.

### III. Preserve the Approved Folio Design
The user interface preserves the approved Folio identity, Slovenian naming,
accessible interactions, and responsive behavior described by the project’s
design guidance. Use existing visual building blocks and avoid introducing a
competing visual system.

### IV. Use the Public API Only
The client reads and writes task data through the public `/api/` interface and
identifies tasks by `id`. The user interface never accesses `/__test/`,
local data copies, or other test-control mechanisms.

### V. Keep Work Verifiable and Traceable
Specifications trace requirements to concrete conditions, code, scenarios, and
actual evidence. Report unverified work and limitations honestly; never
present an unexecuted test as successful. Applicable baseline and
task-specific tests are used without replacing shared verification.

## Non-Negotiable Rules

- Do not modify infrastructure, dependencies, server code, shared types, or
  official templates beyond the permitted process files.
- Do not read, expose, or control test state through `/__test/`.
- Do not add unrequested persistent storage, URLs, write APIs, or external
  services.
- Do not expand a specification with invented requirements. Record material
  missing information and limitations instead.
- Do not commit changes or create branches during the Spec Kit workflow.

## Governance

The constitution governs all P04 work. If project instructions and this
constitution conflict, the original project rules and supplied feature
requirements prevail. Amendments require an explicit baseline decision and
must preserve the approved Folio design.

**Version**: 1.0.0 | **Ratified**: 2026-10-11 | **Last Amended**: 2026-10-11
