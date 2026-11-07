Korak `speckit-plan` je opravljen.

- Prebral sem `.specify/feature.json` (pot `docs/agent/P09`), `.specify/memory/constitution.md`, `docs/agent/P09/spec.md` in obstoječo kodo (`src/navigation.ts`, `src/App.tsx`, `src/TaskBoard.tsx`, `src/TaskDetails.tsx`, `src/useResource.ts`, `src/api.ts`) ter razvojne teste in `package.json`.
- `docs/agent/P09/plan.md` vsebuje jedrnat Lean načrt: tehnični kontekst (React 19/TS/Vite, hash usmerjanje, Playwright, brez novih odvisnosti), ključne odločitve (URL kot vir resnice za S; novo jedro `src/viewState.ts` z normalizacijo/razčlenjevanjem/gradnjo hash-a/filtriranjem; razširjena `navigation.ts`; potrditev z največ enim novim zgodovinskim stanjem; samo branje brez `localStorage`), tabelo datotek in vrstni red izvedbe ter način preverjanja (lastni `agent` testi, skupni testi).
- Brez širjenja obsega in brez posegov v infrastrukturo; preostali čas: 917 s od 960 s. Naslednji korak so naloge (`$speckit-tasks`).
