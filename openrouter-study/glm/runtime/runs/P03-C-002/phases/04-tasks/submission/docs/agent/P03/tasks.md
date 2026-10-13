# P03 — Naloge izvedbe

## Priprava

- [ ] [T001] Dodaj čiste pomožne funkcije za normalizacijo, razdelitev iskalnih besed, sestavljeno filtriranje in možnosti odgovornih oseb v `src/taskFilters.ts`.

## Temeljna izvedba

- [ ] [T002] Dodaj lokalno stanje iskanja ter filtrov stanja in odgovorne osebe v `src/App.tsx`; ohrani privzete vrednosti in ponastavitev ob menjavi projekta.
- [ ] [T003] Dodaj kontrolno vrstico z iskalnim vnosom, obema izbirnikoma in gumbom `Počisti filtre` v `src/App.tsx` ter pripadajoče minimalne stile v `src/styles.css`.
- [ ] [T004] Uporabi filtrirane podatke v preglednici, tabli, pregledu stanj, števcih stolpcev in sporočilu `Prikazano: N od M.` v `src/App.tsx`.
- [ ] [T005] Razloči prazen projekt od neujemajočih filtrov ter v obeh pogledih prikaži `Ni zadetih.` v `src/App.tsx`.

## Lastni testi

- [ ] [T006] Dodaj lastne Playwright teste za privzeto stanje, normalizacijo, več besed, kombinacijo filtrov, izbirnik oseb ter menjavo projekta v `tests/agent/P03.spec.ts`.
- [ ] [T007] Dodaj lastne Playwright teste za preklop pogleda, osvežitev, števce, prazen in neujemajoč projekt, čiščenje filtrov ter odsotnost pisalnih zahtev v `tests/agent/P03.spec.ts`.

## Preverjanja in zaključek

- [ ] [T008] Izvedi `npx playwright test --project=agent` in popravi odkrite napake v dovoljenih datotekah.
- [ ] [T009] Izvedi `npm run lint`, `npm run typecheck` in `npm run build` ter popravi odkrite napake v dovoljenih datotekah.
- [ ] [T010] Izvedi skupne Playwright pregle `desktop` in `mobile` za ohranjenost obstoječega delovanja, navigacije in dizajna Folio.
- [ ] [T011] Vedi rezultate preverjanj, morebitne omejitve in sledljivost R01–R12 v `docs/agent/P03/spec.md`.
