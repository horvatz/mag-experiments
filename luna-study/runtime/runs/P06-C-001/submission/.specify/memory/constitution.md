# Folio Constitution

## Core Principles

### I. Preserve the approved Folio experience
Extend the existing interface and retain Folio's approved visual direction, Slovenian naming, responsive views, and visible keyboard focus. Use the existing design guidance in `docs/dizajn.md`.

### II. Use the public data interface
Read and save application data through the public `/api/` interface, identifying tasks by `id`. Do not use test controls as application features or replace server data with a local copy or `localStorage`.

### III. Keep changes within the agreed scope
Application changes belong in `src/`, `tests/agent/`, and `docs/agent/`. Leave starting data, server, shared types and tests, dependencies, and run or check settings unchanged. Shared infrastructure changes require the same pre-agreed baseline update for all procedures.

### IV. Make requirements and evidence traceable
Use the shared specification template to connect task requirements with acceptance conditions and checks. Report only checks that were actually run, with their results and any unverified requirements or limits.

## Development Workflow

Read the task instructions and project rules before changing the application. Preserve the existing design, make only in-scope changes, and describe changes and verification results at handoff.

## Governance

Apply these principles together with the project rules, approved design, shared specification template, and the requirements of each task. Do not infer new requirements, dependencies, or architectural changes from this constitution.

**Version**: 1.0.0 | **Ratified**: 2026-09-27 | **Last Amended**: 2026-09-27
