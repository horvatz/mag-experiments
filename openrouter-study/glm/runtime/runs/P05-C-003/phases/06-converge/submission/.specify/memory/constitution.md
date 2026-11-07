# Folio Constitution

## Core Principles

### I. Requirements Are Authoritative

The original task requirements, the shared specification template, and the approved Folio design define the expected behavior. Do not expand scope, add requirements, invent missing user intent, or treat development fixtures as product behavior. Resolve material ambiguity with existing project guidance rather than assumptions.

### II. Preserve Folio and Existing Contracts

The product name is **Folio**. Preserve the approved visual language, Slovenian interface naming, accessibility, responsive behavior, existing navigation, task identifiers, view and column names, and public API contracts. New controls must fit existing patterns without changing shared infrastructure, dependencies, or run configuration.

### III. Use the Public API and Bound State

Read and save task data only through the existing `/api/` interface. User-interface state is in-memory and scoped to the current project; do not use test controls, local replacement data, persistent storage, URL state, or new write APIs. Features such as filtering and pagination must not mutate task data or issue unintended writes.

### IV. Keep Changes Minimal and Traceable

Change only `src/`, `tests/agent/`, `docs/agent/`, and the permitted Spec Kit process files. Capture requirements with explicit rules, predicates, test evidence, file references, and limitations. Never present an unexecuted check as successful, and keep documentation concise without duplicating source documents.

## Development Workflow

Use the official local Spec Kit skills in the prescribed order while preserving one agent's history. Read the relevant task instructions and templates first. Validate against meaningful baseline and agent tests, then report changed files, executed checks, results, and unresolved limitations.

## Governance

This constitution governs Folio development and supersedes conflicting ad hoc practices. Amendments require explicit approval, a documented reason, a migration consideration, and must not add dependencies or impose architectural rework beyond the approved project rules.

**Version**: 1.0.0 | **Ratified**: 2026-10-30 | **Last Amended**: 2026-10-30
