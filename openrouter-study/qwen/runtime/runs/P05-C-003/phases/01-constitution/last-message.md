I have created the project constitution in `.specify/memory/constitution.md`. The constitution captures the key project principles:

- **Task**: Extend the interface for pagination/filtering tasks by page size (all/2/5/10) and status (all/todo/in_progress/done), with data access via `/api/` by ID.
- **Design**: Maintain Slovene naming, Folio layout, `data-task-id`, view/column names, and `aria-label="Pregled stanj opravil"`.
- **Interface**: All data read/stored via `/api/`; no local storage replacement.
- **Testing**: Use baseline tests, add agent-specific tests in `tests/agent/`; do not access `/__test/` controls.
- **Changes**: Write only to `src/`, `tests/agent/`, `docs/agent/`; do not modify server, shared types, dependencies, or baseline tests.

The constitution is now ready for the next Spec Kit steps (`speckit-specify`, `speckit-plan`, etc.).
