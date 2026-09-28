# Folio Project Constitution

## Core Principles

### I. Preserve the approved Folio experience
Keep the Folio identity, confirmed visual design, and Slovenian user-facing language. Extend the existing interface using its established components and style variables.

### II. Keep changes within the agreed scope
Application changes belong in `src/`, `tests/agent/`, and `docs/agent/`. Keep seed data, server, shared types, baseline tests, dependencies, and run and test settings unchanged. A shared infrastructure change requires the same agreed baseline update for every procedure.

### III. Respect the public data contract
Read and store application data through the public `/api/` interface, and identify tasks by `id`. The interface must not use test-only `/__test/` controls or replace the server with local data or `localStorage`.

### IV. Make work verifiable
Relate requirements to acceptance conditions, implementation, and actual checks in the task documentation. Report only checks that were run and record unmet requirements and unverified scenarios.

## Governance

These principles derive from `PROJECT_RULES.md` and the shared task template. Apply them with the specific task requirements; where shared infrastructure must change, follow the agreed common-baseline rule above.

**Version**: 1.0.0 | **Ratified**: 2026-09-28 | **Last Amended**: 2026-09-28
