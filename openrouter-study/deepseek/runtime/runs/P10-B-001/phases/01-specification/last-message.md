**Specification handed off**

- `docs/agent/specification.md` — complete R01–R12 conditions with state symbols (`I`, `P`, `U`, `R`), action/state-transition table, exact UI contract (button names, `aria-label="Mesto opravila <id>"`, `role=status` text, `data-task-id`, 390px), and a per-requirement verification plan referencing D01–D04 plus proposed own tests.
- `docs/agent/specification-history.md` — version 1.0 entry, sources reviewed, open points for implementer/reviewer.
- Traceability table leaves code locations and actual evidence for the implementer; no test is claimed as run in this role.

Key assumptions recorded: undo stack capped at 20 on every push, reset counts as one undoable action, invalid boundary actions are strict no-ops. Time check at handoff: 94s left in phase, 934s total.
