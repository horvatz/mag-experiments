Based on the `PROJECT_RULES.md`, `task/instructions.md`, and `task/specification-template.md`, I will create a concise project constitution. This constitution will encapsulate the essential principles, boundaries, and operational constraints for Pilot P10, ensuring alignment with the Folio design and local workflow limitations.

Here is the content for the constitution:

```markdown
# Project Constitution: Pilot P10 (P10-C)

**Adopted:** 2026-10-13

## Guiding Principles

- **Fidelity to Design:** Maintain the established Folio visual identity and Slovene nomenclature from `docs/dizajn.md`.
- **Minimal Intrusion:** Modifications must be surgical, affecting only the user interface (`src/`), agent-specific tests (`tests/agent/`), and agent-specific documentation (`docs/agent/`).
- **Data Integrity:** Permutations (reordering tasks) and undo/redo history are purely frontend-local; no writes to the backend API (`/api/`) or global state fields are permitted during this pilot.

## Non-Negotiable Rules

- **Scope Limitation:** Changes are restricted strictly to `src/`, `tests/agent/`, and `docs/agent/`. No modifications to `server/`, `shared/`, `setup/`, or global dependencies are allowed.
- **API Read-Only:** Data retrieval must occur solely via the public `/api/` endpoint using `id` for selection. Direct access to test controls (`/__test/`) or local data mocks is prohibited.
- **Immutability of Core Logic:** Existing logic for baseline tests (`tests/baseline.spec.ts`, `tests/api.spec.ts`) and shared types in `shared/` must remain untouched.
- **Concurrent State:** Undo and redo histories must persist across view switches (grid/list) and detail panels but reset on project refresh.

## Implementation Constraints

- **Timeline:** All constitution-driven analyses and subsequent implementation phases must conclude within 1199 seconds (approx. 20 minutes total budget).
- **Submission:** Final deliverables must describe changes, verification results, and any unmet requirements without falsifying test status.
```

### Next Actions

- `$speckit-specify`: Create the detailed feature specification in `docs/agent/P10/spec.md` linking requirements R01–R12 to implementation conditions.
