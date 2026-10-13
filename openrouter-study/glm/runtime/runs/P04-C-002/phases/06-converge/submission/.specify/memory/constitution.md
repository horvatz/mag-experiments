# Folio (mag-app) Constitution

## Core Principles

### I. Requirements First

The original task requirements and the shared specification template are the source of truth. Do not expand scope, invent missing answers, or treat development examples as the full requirement domain.

### II. Folio Continuity (NON-NEGOTIABLE)

Preserve the approved Folio design, Slovenian naming, accessible interaction states, and existing public UI names unless a requirement explicitly changes them.

### III. Controlled Change Surface (NON-NEGOTIABLE)

Application work is limited to `src/`, `tests/agent/`, and `docs/agent/`; process work may additionally update `.specify/memory/constitution.md` and `.specify/feature.json`. Do not modify the server, shared types, baseline tests, dependencies, run configuration, official templates, skills, or infrastructure. Do not create branches or commits.

### IV. Public API Only

Read and save task data through the public `/api/` interface and address tasks by `id`. The UI must not use `/__test/`, a local data replacement, or persistent browser storage. Test controls belong only to the test runner.

### V. Small, Reversible Features

Make focused changes that preserve existing read features and interface contracts. Do not add dependencies or require an architectural rework not stated by the requirements.

### VI. Honest Verification

Use the available baseline tests and add sensible agent-owned checks for task requirements. Report only actually executed results, including unresolved requirements, limitations, and unexecuted tests.

## Governance

This constitution records project-level rules only. Feature-specific behavior must be captured in the relevant Spec Kit artifacts. Amendments must be explicitly requested, documented, and limited to the same governed scope.

**Version**: 1.0 | **Ratified**: 2026-10-13 | **Last Amended**: 2026-10-13
