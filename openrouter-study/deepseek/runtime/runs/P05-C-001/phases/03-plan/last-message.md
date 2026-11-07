Korak `$speckit-plan` je opravljen.

**Izdano: `docs/agent/P05/plan.md`** (39 vrstic, Lean)
- Tehnični kontekst: React 19/TS 6/Vite 8 brez novih odvisnosti, obstoječi `useResource`/`request` (samo GET `/api/`), Playwright projekt `agent` in berljivi razvojni pomočnik `tests/development/helpers.ts`.
- Odločitve: stanje `pageSize`/`filter`/`page` v `ProjectView`; ponastavitev prek `<ProjectView key={project.id}>`; izpeljane vrednosti `filtered`, `N`, `Y`, `currentPage`, `A`/`B`, `pageTasks`; dejanja z vrnitvijo na prvo stran in onemogočenimi gumbi na robovih; nova komponenta `src/Pagination.tsx` s statusom `role=status` / `Stanje straničenja` in predpisanim besedilom; isti odsek za preglednico in tablo; `.pagination` v `src/styles.css`.
- Datoteke: `src/App.tsx`, `src/Pagination.tsx` (novo), `src/styles.css`, `tests/agent/p05-pagination.spec.ts` (novo), `TaskBoard.tsx` nespremenjen, sledljivost se po izvedbi vpiše v `spec.md`.
- Preverjanje: `npx playwright test --project=agent`, `npm run lint`, `npm run typecheck`, skupni baseline testi; dokazi sproti v `spec.md`.
- Infrastruktura (`server/`, `shared/`, skupni testi, nastavitve) ostaja nedotaknjena; skladnost z ustavo zapisana.

Naslednji korak je `$speckit-tasks`, ki ga sproži izvajalnik.
