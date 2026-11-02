Specification phase is complete and within budget (~215 s left).

**Handoff**
- `docs/agent/specification.md` — full spec per the shared template: problem/context, inputs/actions/outcomes with predicate definitions (`norm`, `matchQ`, `passS`, `visible`, `writeUrl`), R01–R12 acceptance conditions with verification approach, the mandatory UI contract, planned implementation locations, traceability table (all results marked unverified, to be filled by the implementer), and assumptions/limitations.
- `docs/agent/specification-history.md` — v0.1 record with what was verified against actual code (`shared/types.ts`, `src/navigation.ts`, `src/App.tsx`, `src/TaskBoard.tsx`, `src/TaskDetails.tsx`, development tests/helpers).

**Key conditions for the implementer**
- Committed state is `(q, status, order)` read from the fragment query; defaults `''/all/original`; unknown values → defaults; first occurrence wins; parsing never rewrites the URL.
- Apply/Reset update history only when the committed triple actually changes; defaults are omitted; `q` trimmed; `view=board` preserved; unknown params dropped; draft is discarded on every navigation.
- Matching is a normalized literal substring over `title/description/assignee/id`; ordering compares normalized titles by UTF-16 with stable ties.
- Empty result shows `Ni zadetkov.`; counter `Prikazano: N od M.` in `role=status`/`aria-label="Rezultati povezave"`; no API writes, no `localStorage`.
- No tests were run in this phase (per role); all evidence rows are explicitly marked as not executed.
