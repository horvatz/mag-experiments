Korak `$speckit-plan` je opravljen.

**Izvedeno**
- Prebral `.specify/feature.json` (`docs/agent/P07`), konstitucijo, `spec.md` ter obstoječo kodo (`src/App.tsx`, `TaskBoard.tsx`, `components.tsx`, `api.ts`, `useResource.ts`, `navigation.ts`, `shared/types.ts`) in testno okolje (`package.json`, `playwright.config.ts`, `tests/development/P07.spec.ts`).
- Zapisal `docs/agent/P07/plan.md`.

**Vsebina načrta**
- **Tehnični kontekst** — React 19.3/TS 6/Vite 8, obstoječi `/api/` (samo branje), Playwright (projekt `agent`, razvojni D01–D04 kot merilo, skupni testi kot regresija), brez novih odvisnosti.
- **Arhitektura in odločitve** — nov modul `src/favorites.ts` (validacija P3, zapis `{version:1,ids}` s `unique` + UTF-16 `sort`, `useSyncExternalStore` + `storage` poslušalec brez povratnega zapisa, napake shrambe); filter kot lokalno stanje v `ProjectView` (privzeto in ob menjavi projekta `false`); skupna filtrirana množica za tabelo in tablo; gumbi z `aria-pressed` zunaj povezav opravil; števec `role=status` iz vseh opravil projekta; prazno stanje `Ni priljubljenih opravil.`; opozorilo `role=alert` z besedo `shramba`; nespremenjeni `data-task-id` in dostopna imena; brez zapisov na API.
- **Datoteke** — `src/favorites.ts`, `src/FavoriteButton.tsx` (novi), `src/App.tsx`, `src/TaskBoard.tsx`, `src/styles.css`, `tests/agent/p07.spec.ts`.
- **Zaporedje izvedbe in preverjanje** — od modula shrambe do agentnih testov; ukazi `typecheck`, `lint`, `npm test`, razvojni test P07; izidi se vpišejo v spec.md.

Koda in infrastruktura nista bili spremenjeni. Časovni ostanek: 838 s.
