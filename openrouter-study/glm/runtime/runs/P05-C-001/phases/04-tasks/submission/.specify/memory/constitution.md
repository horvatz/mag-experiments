# Folio Constitution

**Version:** 1.0.0 | **Ratified:** 2026-10-09 | **Last Amended:** 2026-10-09

## Core Principles

### I. Folio Design First (NON-NEGOTIABLE)

Folio is the approved visual direction. Preserve its existing layout, colors, system
typography, thin iconography, Slovenian interface names, accessible labels, and visible
keyboard focus. New interface work composes from existing building blocks and style
variables rather than introducing a parallel design language.

### II. Public API Only (NON-NEGOTIABLE)

The browser application reads and writes task data only through the public `/api/`
interface and identifies records by their `id`. It never imports or calls `/__test/`
controls, fakes data with a local copy, uses `localStorage`, or adds write-only API
endpoints. Test controls belong exclusively to test infrastructure.

### III. Baseline Scope Discipline (NON-NEGOTIABLE)

Feature work may modify only `src/`, owned tests in `tests/agent/`, and owned
documentation in `docs/agent/`. During the official Spec Kit workflow, the process may
also update `.specify/memory/constitution.md` and `.specify/feature.json`. Preserve the
server, shared types, shared tests, dependencies, run configuration, and official
templates. Add no dependency, branch, commit, or mandatory architectural rework.

### IV. Requirements Authority

The task requirements and their original wording are the measure of completeness, even
if a later specification omits a detail. Feature specifications follow
`task/specification-template.md`, distinguish general rules from individual test cases,
express chosen conditions as predicates or state-transition rules, and may link to
other Spec Kit documents instead of duplicating them.

### V. Evidence and Transparency

Validate changes with the baseline tests and meaningful owned tests. Do not present an
unexecuted or unavailable test as successful. Record performed validation, its result
source, remaining limitations, and unmet requirements. If an essential fact is absent,
state the limitation instead of inventing user intent.

## Governance

This constitution governs all agent work in this application. Amendments require explicit
project approval, a documented reason, and a new constitution version. Constitutional
changes must not expand feature scope, add dependencies, or require architectural
rework on their own.
