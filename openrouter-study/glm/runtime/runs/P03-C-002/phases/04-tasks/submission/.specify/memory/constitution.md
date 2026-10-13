# Folio Constitution

## Core Principles

### I. Requirements Are the Contract
The original task requirements, the common P03 specification template, and all twelve P03 requirements remain the measure of success. Do not silently narrow them, invent requirements, or expand scope.

### II. Preserve the Approved Folio Design
User-interface changes must keep the confirmed Folio identity, its Slovenian naming, existing navigation and detail behavior, and its narrow-screen behavior. Reuse existing layout patterns, components, and style tokens rather than redesigning them.

### III. Respect the Baseline Boundary
Only `src/`, own tests under `tests/agent/`, own documentation under `docs/agent/`, and the two permitted Spec Kit process files may change. Do not modify dependencies, configuration, shared code, the server, baseline tests, official templates, or workflow infrastructure.

### IV. Use the Public API Correctly
The user interface reads and saves data only through the public `/api/` interface and selects records by `id`. It must not read or set test controls, replace the server with a local copy, or use browser persistence for task data.

### V. Keep Work Verifiable and Honest
Use the available tests and add focused own checks where useful. Preserve source order and data fields unless a requirement says otherwise. Report only checks that were actually run, and state unresolved limitations clearly.

## Governance

The constitution records project rules only; it does not prescribe implementation details or authorize refactors. Changes to this constitution require a documented reason and an explicit update of the affected process rules.

**Version**: 1.0.0 | **Ratified**: 2026-10-09 | **Last Amended**: 2026-10-09
