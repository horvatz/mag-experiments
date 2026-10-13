Korak `$speckit-plan` je opravljen.

**Izdelek**: `docs/agent/P08/plan.md` (67 vrstic)
- Tehnični kontekst: obstoječi React 19/TS/Vite, javni API prek `useResource`, Playwright (projekt `agent`), brez novih odvisnosti.
- Odločitve: čisti koledarski modul `src/deadlines.ts` (UTC, brez ure naprave), nova komponenta `src/DeadlineControls.tsx`, stanje v `ProjectView` z remontom ob menjavi projekta, en vir filtriranih opravil za oba pogleda, prazna stanja, ohranjen videz Folio.
- Datoteke: `src/deadlines.ts`, `src/DeadlineControls.tsx`, `src/App.tsx`, `src/TaskBoard.tsx`, `src/styles.css`, `tests/agent/p08.spec.ts`.
- Preverjanje: `typecheck`, `lint`, `npx playwright test --project=agent`, poleg tega razvojni primeri `tests/development/P08.spec.ts` (samo branje).

Pomembno odkritje za izvedbo: `tests/development/P08.spec.ts` s pomočnikom `tests/development/helpers.ts` določa točne selektorje (dostopni imeni `Referenčni datum` in `Pogled rokov`, `aria-label` `Število rokov <ključ>`, `role=alert`, `data-task-id`, prepoved zapisov in preverjanje širine strani).

Preostali čas: ~367 s.
