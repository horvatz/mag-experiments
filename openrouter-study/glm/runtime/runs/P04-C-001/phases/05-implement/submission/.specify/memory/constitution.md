# Folio Constitution

**Project**: Folio (`mag-app`)
**Version**: 1.0.0
**Ratified**: 2026-11-01
**Last Amended**: 2026-11-01

## Core Principles

### I. Requirements First

Implement the supplied P04 requirements exactly. Do not add features, dependencies, APIs, or architectural changes that the requirements do not justify.

### II. Preserve Folio

Use the approved Folio identity, existing UI building blocks, style variables, accessible labels, and responsive behavior. New UI work must remain consistent with the confirmed design.

### III. API-Only Data Access

The user interface reads and writes application data only through the public `/api/` interface. It must not use `/__test/` controls, replace the server, or persist task state in local storage or URLs unless explicitly required.

### IV. Stable Projection

Ordering is a projection of current data. It must preserve task identity, original order for equal comparisons, existing fields, aggregate counts, and API state. It must not issue API writes merely because the order changes.

### V. Minimal Change Boundary

Application work is limited to `src/`, agent-owned tests in `tests/agent/`, and agent documentation in `docs/agent/`. Shared infrastructure, dependencies, server code, public types, baseline tests, and official Spec Kit templates are not changed by a feature procedure.

### VI. Honest Traceability

Specifications and delivery notes must trace each requirement to a condition, implementation location, and actual verification. Report unverified cases and limitations clearly; never present an unexecuted test as successful.

## Governance

These principles apply to all P04 procedures. Resolve ambiguity from the supplied requirements; do not invent unavailable answers. Changes to these principles require an explicit, documented amendment approved before use.
