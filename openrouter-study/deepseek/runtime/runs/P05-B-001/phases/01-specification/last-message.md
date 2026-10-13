**Handoff: specification complete**

- `docs/agent/specification.md` — full P05 spec following the shared template: state model (`P`, `F`, `N`, `S`, `Y`, `X`, `A`, `B`, `V`), predicates for status text and disabled buttons, R01–R12 acceptance conditions, DOM/accessibility contract (selects `Velikost strani`/`Filter strani`, four navigation buttons, `role=status` with `aria-label="Stanje straničenja"`, preserved `data-task-id`, board/column names, 390 px rule), and a traceability table.
- `docs/agent/specification-history.md` — session log with the code findings that shaped the spec (project switch remounts `ProjectView`, view/details don't; no write APIs allowed for pagination; dev test selectors).

Key handoff notes for the implementer:
- Pagination/filter state is local to `ProjectView`; no URL, storage, or new write APIs.
- Empty result: `Stran 0 od 0. Prikazano 0–0 od 0.`, all four buttons disabled; non-empty uses 1-based `Stran X od Y. Prikazano A–B od N.` with en dash.
- Summary counts stay on the unfiltered project; board column counts use only the current page slice.
- All traceability results are marked `ni izvedeno` since testing belongs to the implementation phase; the implementer should record actual evidence in their own notes, and the reviewer in `review.md`.
