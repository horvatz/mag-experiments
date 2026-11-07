# P09 izvedbene naloge

## Osnova

- [ ] [T001] Razširi tipe, normalizacijo, razčlenjevanje query parametrov in kanonične URL povezave v `src/navigation.ts`.
- [ ] [T002] Dodaj filtriranje po `q` in `status` ter urejanje naslovov z ohranjenim izvornim zaporedjem pri izenačitvi v `src/App.tsx`.

## Vmesnik

- [ ] [T003] Dodaj dostopna kontrola `Iskanje v povezavi`, `Stanje v povezavi` in `Vrstni red v povezavi`, gumba `Uporabi pogled` ter `Ponastavi pogled`, ločen osnutek, števec in prazno stanje v `src/App.tsx`.
- [ ] [T004] Oblikuj nove kontrole v obstoječem Folio vizualnem jeziku in zagotovi ozko postavitev brez razširjanja strani v `src/styles.css`.

## Navigacija in zgodovina

- [ ] [T005] Ohrani potrjene parametre in način pogleda pri preklopu Preglednica/Tabla, menjavi projekta, odpiranju opravil in zapiranju podrobnosti v `src/App.tsx`, `src/TaskBoard.tsx` in `src/TaskDetails.tsx`.
- [ ] [T006] Uveljavi pravila ene nove zgodovinske entitete za spremenjeno potrditev ter zavrzivanje nepotrjenega osnutka ob navigaciji v `src/App.tsx` in `src/navigation.ts`.

## Preverjanje

- [ ] [T007] Dodaj lastne Playwright teste za R01–R12, vključno z neposrednimi URL-ji, osnutkom, zgodovino, podrobnostmi, ponastavitvijo, praznim rezultatom, javnim API-jem in `localStorage` v `tests/agent/p09.spec.ts`.
- [ ] [T008] Izvedi namenski test `npx playwright test tests/agent/p09.spec.ts --project=agent` in struktorno preverjanje `npm run typecheck`; zapiši izida v `docs/agent/P09/spec.md`.
- [ ] [T009] Izvedi širša preverjanja po skupni predlogi (`npm run lint`, obstoječi skupni testi in build) in posodobi sledljivost ter omejitve v `docs/agent/P09/spec.md`.

**Stanje:** naloge so pripravljene; implementacija in testiranje še sledita.
