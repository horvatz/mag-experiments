# P04 implementation tasks

Behavioral contract and traceability: [spec.md](spec.md). Technical decisions: [plan.md](plan.md). Keep each implementation change within `src/`, `tests/agent/`, or `docs/agent/`; do not modify shared infrastructure or development tests.

## Phase 1 — Setup

- [ ] [T001] Add agent-owned Playwright coverage in `tests/agent/P04.spec.ts`, reusing the read-only fixture in `tests/development/helpers.ts`. Cover ordering cases missing from D01–D04 (Unicode normalization/UTF-16, dates, both directions, stable ties, equal/same keys, and `original` override), lifecycle, empty and singleton lists across all primary/secondary keys and directions, duplicate-title detail identity, no writes, unchanged counts, accessibility hooks, and 390 px width.

## Phase 2 — Foundational

- [ ] [T002] Implement a pure typed projection helper in `src/sortTasks.ts`. Compare normalized strings, status rank, and valid dates as specified in `spec.md`; apply primary and optional secondary directions independently, keep source-index ties stable, make `original` preserve the source sequence regardless of other settings, and leave the input unmodified.

## Phase 3 — User Story 1: Sort the project task list

- [ ] [T003] Add the four labeled native sort controls, default settings, and **Izvorni vrstni red** reset action to `src/App.tsx`. Keep settings local to `ProjectView` and use the comparison helper from `src/sortTasks.ts` to derive a display sequence.
- [ ] [T004] Use that same derived sequence for the table and `src/TaskBoard.tsx`; retain the board's fixed status-column order and existing per-column filtering. Keep summaries based on fetched tasks, preserve task IDs and links, and ensure sorting triggers no write request.

## Phase 4 — User Story 2: Preserve the required view and project behavior

- [ ] [T005] Verify and, if needed, adjust state ownership in `src/App.tsx` and integration with `src/TaskDetails.tsx` / `src/navigation.ts`: view changes and detail open/close retain all four settings; project changes and reload restore defaults; settings are absent from URL and persistent storage. Ensure duplicate titles still open details by ID.

## Phase 5 — Polish and verification

- [ ] [T006] Style the controls in `src/styles.css` using existing Folio tokens and visible focus styles. Verify in `src/App.tsx` and `src/TaskBoard.tsx` that existing accessible names, `aria-label="Pregled stanj opravil"`, `data-task-id`, and link boundaries remain intact; the page must not widen at 390 px.
- [ ] [T007] Run the P04 development and agent Playwright cases, then `npm run check` for lint, build, shared tests, and regression coverage. Update the R01–R12 implementation traceability and evidence in `docs/agent/P04/spec.md`, recording actual results and any unrun or inaccessible checks.
