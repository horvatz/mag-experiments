# Folio Constitution

## Core Principles

### I. Requirements First
Folio changes begin from `PROJECT_RULES.md`, `task/instructions.md`, the shared specification template, and the governing task prompt. Original requirements remain authoritative if later documentation omits them. Do not invent scope, dependencies, APIs, or user decisions.

### II. Confirmed Folio Design
Preserve the approved Folio design, existing style foundations, Slovenian terminology, accessible names, and responsive behavior. New UI must fit the established layout rather than introduce a parallel visual system.

### III. Public API Boundary
The UI reads and writes task and project data only through the existing `/api/` interface. Test-only `/__test/` controls, replacement local data stores, and unnecessary persistent storage or URL state are forbidden in application code.

### IV. Minimal Scoped Change
Application changes are limited to `src/`, `tests/agent/`, and `docs/agent/`; procedure C may additionally update `.specify/memory/constitution.md` and `.specify/feature.json`. Baseline server code, shared types, tests, dependencies, configuration, templates, and infrastructure remain unchanged unless explicitly permitted by the governing instructions.

### V. Honest Verification
Use focused agent tests, relevant baseline checks, and the common specification template. Record only tests actually executed and their actual outcomes. Clearly state unverified cases, limitations, and unresolved material gaps; never report unrun work as successful.

## Non-Negotiable Rules

- Follow the governing instructions in order; do not launch other agents, create branches, or commit changes.
- Treat dates in this feature as calendar `YYYY-MM-DD` values, independent of device time, time zone, and daylight-saving transitions, when task requirements require it.
- Test-only data controls belong only to the test harness; application code must not import or use them.
- Do not add dependencies, build tooling, server endpoints, infrastructure changes, or architectural rewrites not required by the original task.
- Preserve baseline accessibility, keyboard focus visibility, `data-task-id` behavior, and existing project/task navigation semantics.
- Keep documentation concise, traceable, and free of duplicated content across Spec Kit artifacts.

## Governance

This constitution records the project-wide rules ratified for Pilot P08, procedure C. Feature-specific acceptance rules and implementation plans live in the relevant Spec Kit artifacts. Direct governing instructions take precedence over this summary. Changes require a concise amendment, an explicit reason, and confirmation that the baseline change rules remain respected.

**Version**: 1.0.0 | **Ratified**: 2026-10-13 | **Last Amended**: 2026-10-13
