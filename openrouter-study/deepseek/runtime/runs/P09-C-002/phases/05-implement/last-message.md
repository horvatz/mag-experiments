Implement step complete. Final report:

**Implementation**
- `src/viewState.ts` (new): `normalizeText`, `matchesPhrase`, `filterTasks`, `orderTasks` (stable UTF-16), `sameFilters`, `DEFAULT_FILTERS`.
- `src/navigation.ts`: `useRoute()` now returns `filters` (first occurrence, defaults, unknown values ignored, no URL rewrite); `buildHash` omits defaults, keeps `view=board`, drops unknown params, encodes values.
- `src/App.tsx`: search/status/order controls with draft state, Apply/Reset per the confirmation rule, `Prikazano: N od M.` counter (`role=status`, `aria-label="Rezultati povezave"`), `Ni zadetkov.` empty result, filtered+ordered table/board, filtered links; empty project keeps the table message and the board columns.
- `src/TaskBoard.tsx`, `src/TaskDetails.tsx`: filters preserved in card and detail links/close.
- `src/styles.css`: Folio-style control row, wraps at 390px without page overflow.

**Verification** (`docs/agent/verification.md`)
- `npm run check` → **61 passed, 0 failed**: 38 shared (`api`/`desktop`/`mobile`), 8 development P09 (desktop+mobile), 15 own tests (`tests/agent/P09.spec.ts` covering R01–R12).
- Typecheck, lint, and build pass. One baseline regression (empty board columns) was caught by the first run and fixed in `src/App.tsx`.

**Docs**
- `tasks.md`: all 24 tasks marked `[x]` (only actually completed work).
- `spec.md`: traceability table filled with real test names/results; no unverified claims.
- Limitation: final external tests were not available and are not claimed as run; navigation during unfinished loading stays out of scope.

Time budget: ~132s remaining in phase.
