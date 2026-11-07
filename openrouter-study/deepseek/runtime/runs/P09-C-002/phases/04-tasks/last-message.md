Tasks step complete (~25s).

**`docs/agent/P09/tasks.md`** contains 24 dependency-ordered tasks in checklist format:
- **Phase 1 (T001–T002):** pure helpers in `src/viewState.ts`; route parsing + `buildHash` in `src/navigation.ts`.
- **Phase 2 (T003–T006):** wire confirmed filters into `App.tsx`, controls + draft state, apply/reset history rule, propagate filters to view/board/details links and project switching.
- **Phase 3 (T007–T018):** requirement verification for R01–R12 (parsing, matching/order, counter and empty state, draft, confirmation, history, view toggle, details, project switch, reset, no writes) plus Folio control styles at 390px.
- **Phase 4 (T019–T022):** own tests `tests/agent/P09.spec.ts`, development tests, shared tests, and typecheck/lint/build.
- **Phase 5 (T023–T024):** record real outcomes in the spec traceability table and constitution scope review.

No implementation code touched yet. Time budget: ~942s remaining.
