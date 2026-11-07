Korak `$speckit-plan` je opravljen.

**Ustvarjeno**
- `docs/agent/P03/plan.md` — jedrnat Lean načrt: tehnični kontekst, odločitve D1–D7, pregled datotek, način preverjanja in omejitve.

**Ključne odločitve**
- Nova čista logika v `src/filters.ts` (normalizacija NFD, besede, ujemanje, filtriranje, možnosti oseb) — brez stanja in omrežja.
- Stanje filtrov v `ProjectView`, ponastavitev ob menjavi projekta prek `key={project.id}`; `view` ostane v usmerjevalniku.
- Filtriranje odjemalsko nad naloženim seznamom (`useMemo`), brez ponovnih klicev API-ja in brez pisanja.
- En vir resnice `visible`; `M = tasks.length`, `N = visible.length`; povzetek in števci stolpcev iz `visible`, `TaskBoard` prejme filtrirana opravila.
- Prazna stanja: `Ni zadetkov.` le ob `M > 0 ∧ N = 0`; prazen projekt ohrani obstoječe stanje s `0 od 0`.
- Vmesnik: `input type=search`, dva `select`, gumb `Počisti filtre`, `role=status` z `Prikazano: N od M.`, obstoječi gradniki in spremenljivke.
- Datoteke: `src/filters.ts` (novo), `src/App.tsx`, `src/TaskBoard.tsx`, `src/styles.css`, `tests/agent/p03-filters.spec.ts`, vnosi dokazov v `docs/agent/P03/spec.md`.

**Preverjanje (načrt)**
- `npm run typecheck`, `npm run lint`, `npm run build`; regresija s skupnimi testi; lastni testi prek `npx playwright test --project=agent` z javnim pomočnikom `tests/development/helpers.ts` (samo branje).

Brez novih odvisnosti, sprememb strežnika, skupnih tipov, nastavitev ali skupnih testov. Preostanek faze: 1045 s.
