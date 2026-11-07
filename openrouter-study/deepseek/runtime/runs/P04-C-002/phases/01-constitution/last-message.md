Constitution completed in `.specify/memory/constitution.md` (v1.0.0, ratified 2026-10-13).

**Principles** (derived from `PROJECT_RULES.md` and the shared template, no new requirements):
- `I. Meje dovoljenih sprememb` — writes limited to `src/`, `tests/agent/`, `docs/agent/`, plus the two Spec Kit process files; infrastructure stays untouched.
- `II. Podatki samo prek javnega API-ja` — data via `/api/` only, select by `id`; no `/__test/` use, no `localStorage`, no new write APIs.
- `III. Ohranitev potrjenega dizajna Folio` — keeps Slovenian naming, Folio styling, `data-task-id`, ARIA labels, 390px behavior per `docs/dizajn.md`.
- `IV. Preverjanje z dejanskimi dokazi` — R01–R12 tied to conditions, code, and actually executed tests; no unexecuted test claimed as passing.
- `V. Najmanjši obseg` — no scope expansion, dependencies, or architectural rework; original requirements remain the benchmark.

No non-governance intents were present, so no `Next Actions` were deferred. No application files were touched; time remaining 1148s.
