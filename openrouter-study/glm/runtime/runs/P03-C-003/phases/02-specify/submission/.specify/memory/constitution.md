# Folio Constitution

**Version**: 1.0 | **Ratified**: 2026-11-01 | **Last Amended**: 2026-11-01

## Guiding Principles

1. **Requirements are the source of truth.** Implement the original task requirements exactly; do not expand scope, invent missing user choices, or treat an incomplete specification as permission to reinterpret them.
2. **Preserve Folio.** Build on the confirmed Folio visual language, existing components, style variables, Slovenian naming, accessibility conventions, and responsive behavior.
3. **Respect the application boundary.** Change only `src/`, agent-owned tests and documentation, and the files explicitly allowed by the active pilot process. Do not alter dependencies, settings, the server, shared types, shared tests, or official templates.
4. **Use the public API.** Read and persist task data only through `/api/`, address records by `id`, and keep UI code independent of `/__test/`, `localStorage`, and server-implementation details.
5. **Prevent accidental writes.** Read-only features must not issue `POST`, `PATCH`, `PUT`, or `DELETE` requests unless a task explicitly requires that behavior.
6. **Report verified truth.** Use relevant tests or focused checks where available, record actual results, and clearly disclose unverified scenarios, limitations, and deviations.

## Non-Negotiable Rules

- Original requirements remain authoritative even when a derived specification omits or simplifies them.
- Do not introduce new requirements, dependencies, migrations, or architectural changes without explicit approval from the active governance process.
- Test control endpoints belong to the test harness, never to production UI logic.
- Filters, search, navigation, and other client state must operate only on the current project’s data and must not leak across projects.
- Accessibility contracts, visible labels, routes, and existing read/detail behavior may only change when an explicit requirement requires it.
- Do not create branches or commits during a pilot step unless the pilot instructions explicitly request them.

## Governance

This constitution guides all Folio pilot work. If a requirement or implementation approach conflicts with it, resolve the conflict through the active project rules and task instructions before proceeding. Amendments require a documented reason, explicit approval in the active pilot process, and an assessment of their impact on scope and existing behavior.
