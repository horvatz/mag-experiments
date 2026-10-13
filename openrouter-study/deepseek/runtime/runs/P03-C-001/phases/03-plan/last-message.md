Korak `$speckit-plan` je opravljen.

**Rezultat**
- `docs/agent/P03/plan.md` (47 vrstic) po Lean veščini: tehnični kontekst (React 19.3/TS 6/Vite 8, obstoječe odvisnosti, `GET /api/.../tasks`, Playwright preverjanje), struktura in odločitve, zaporedje dela ter tveganja in omejitve.
- Ključne odločitve: nova čista logika `src/taskFilters.ts` (`normalizeForSearch`, `matchesQuery`, `visibleTasks`, `assigneeOptions`); stanje filtrov lokalno v `ProjectView` (ponastavitev ob preklopu projekta že prek `key={project.id}`); `TaskBoard` in števci uporabijo prikazana opravila; slogi v `src/styles.css` z obstoječimi spremenljivkami.
- Povezave na `spec.md`, ustavo in izvirne zahteve; izidi se vpišejo v tabelo Izvedba in sledljivost šele po dejanskem preverjanju. Brez sprememb infrastrukture, odvisnosti in obsega.
