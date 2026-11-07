# P07 Tasks

Vir: `docs/agent/P07/spec.md` in `docs/agent/P07/plan.md`. Naloge so zaporedne in pokrivajo vse zahteve `R01`–`R12` brez širjenja obsega.

## Foundational

- [x] [T001] Implement the favorite storage contract in `src/favorites.ts`: key, strict parsing, UTF-16 sorting, duplicate removal, and safe read/write serialization for `R02`, `R03`, and `R04`.
- [x] [T002] Integrate favorite state and `storage` handling in `src/useFavorites.ts`, including cross-tab updates, `null`, ignored keys, no write-back, and storage-error alerts for `R02`–`R4` and `R11`.

## User stories

- [x] [T003] Add project controls in `src/App.tsx`: favorite counter, `Prikaži le priljubljena`, and `Odstrani priljubljene tega projekta`, with project-wide counts and shared filtered task order for `R05`, `R06`, `R08`, `R09`, and `R10`.
- [x] [T004] Add per-task favorite buttons to the table and board in `src/App.tsx` and `src/TaskBoard.tsx`, using IDs, `aria-pressed`, unchanged detail links, and one shared state/filter for `R01` and `R07`.
- [x] [T005] Extend Folio styling in `src/styles.css` for the new controls while preserving focus visibility, internal scrolling, existing navigation, loading states, and the 390 px non-expanding layout for `R12`.

## Verification

- [x] [T006] Add focused Playwright coverage in `tests/agent/p07.spec.ts` for parsing/persistence, project filtering and counters, view switching, project changes, current-project removal, storage events/errors, no API writes, duplicate/unknown IDs, and the 390 px layout.
- [x] [T007] Run the focused P07 test, then `npm run typecheck`, `npm run lint`, `npm run build`, and the relevant available shared Playwright suite; record actual commands, failures, and retests honestly.
- [x] [T008] Update requirement traceability in `docs/agent/P07/spec.md` with actual implementation paths, test names, and verified results only after each check has run.

## Polish

- [x] [T009] Review all changes against `task/instructions.md`, remove accidental scope creep, confirm no server, API-contract, dependency, configuration, or shared-test changes, and leave the worktree without branches or commits.

## Phase 1: Convergence

- [ ] T010 Show the required `Ni priljubljenih opravil.` empty state in board view when `Prikaži le priljubljena` is active and no current-project tasks match, keep the filter controls usable for turning the filter off, add focused agent coverage for this case, and update requirement traceability only after an actual rerun (R06) (partial).
