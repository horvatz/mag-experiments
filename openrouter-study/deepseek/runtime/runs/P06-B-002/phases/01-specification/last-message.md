Specification is complete and handed off. Both of my files are written and verified:

**Delivered**
- `docs/agent/specification.md` (v1.0): problem/context, inputs-actions-outcomes, symbols with exact predicates (`filter(F)`, `neutralize`, `quote`, `cell`, `row`, `payload`, `enabled`), R01–R12 acceptance rules with verification methods, traceability table (conditions/test scenarios, code and evidence marked as not yet executed), and open questions/limits.
- `docs/agent/specification-history.md`: v0.1 draft and v1.0 handoff, sources, decisions.

**Key handoff points for the implementer**
- Exact byte rules: `\uFEFF` BOM, `folio-<projectId>.csv`, CRLF after every row including the last, all fields quoted, `""` doubling, fixed column order `id, projectId, title, status, assignee, dueDate, description`.
- Formula neutralization predicate `/^[ \t\r\n]*[=+\-@]/` → prefix `'` at the very start; data columns only, never headers.
- Filter applies only to exported rows; export disabled when no column is selected or the filtered set is empty; defaults `all`/all columns/`;`; reset on project change and refresh; view switch preserves settings.
- Constraints kept: existing accessible names, `data-task-id`, `aria-label="Pregled stanj opravil"`, no writes to `/api/`, no `/__test/` usage, 390 px no page overflow.

**Not done by design (my role):** no app run, tests, or UI review. Traceability rows are explicitly marked "Ni izvedeno – čaka implementacijo"; the implementer must run development tests D01–D04 plus new `tests/agent/` tests and record actual evidence, and the reviewer verifies it. Development tests don't cover `+`/`-`/`@`, leading whitespace variants, empty projects, reset-on-project-change, or 390 px — flagged for agent tests.
