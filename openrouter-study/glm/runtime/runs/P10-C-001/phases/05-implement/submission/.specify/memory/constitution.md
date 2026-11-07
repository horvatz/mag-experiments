# Folio Constitution

**Version:** 1.0 | **Ratified:** 2026-10-09 | **Last amended:** 2026-10-09

## Core Principles

### I. Requirements Are the Source of Truth

- The task requirements and the common specification template define the expected behavior.
- Do not expand scope, invent missing answers, add dependencies, or require architectural rework.
- If an essential fact is unavailable, state the limitation and stop rather than assume a user answer.

### II. Preserve Folio and Existing Contracts

- Preserve the approved Folio design described in `docs/dizajn.md`, including Slovenian naming, existing accessible names, views, and status columns.
- Read and save data only through the public `/api/` interface; select entities by `id` and never use test controls, local data copies, or `localStorage` as substitutes.
- Keep baseline data, the server, shared types, shared tests, dependencies, run settings, official templates, and skills unchanged unless a pilot instruction explicitly permits their update.

### III. Bounded, Focused Changes

- Application work is limited to `src/`, `tests/agent/`, and `docs/agent/`; process work is limited to the files explicitly permitted by the active pilot.
- Make the smallest change that satisfies the governing requirements and keep the result understandable and reviewable.

### IV. Honest Verification

- Verify changed behavior with the relevant available checks and add sensible focused tests without replacing shared infrastructure.
- Report actual results and limitations; never present an unexecuted check as successful.

### V. Process Discipline

- Run the active official local Spec Kit skill as the same persistent agent and do not launch other agents.
- Do not create branches or commits during the pilot.

## Governance

- This constitution records project-level rules for Folio and does not introduce feature requirements, dependencies, or mandatory architecture changes.
- Conflicts are resolved by the active pilot and task instructions; constitution amendments require an explicit instruction and an updated ratification record.
