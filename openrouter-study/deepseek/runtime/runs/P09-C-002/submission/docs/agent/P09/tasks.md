# Naloge P09

Podlaga: `docs/agent/P09/spec.md`, `docs/agent/P09/plan.md`,
`.specify/memory/constitution.md`. Vrstni red je odvisnostni; naloge se
izvedejo po vrsti, oznake so T001–T024.

## Faza 1: Priprava

- [x] T001 Ustvari `src/viewState.ts` s čistimi pomočniki `DEFAULT_FILTERS`, `normalizeText`, `matchesPhrase`, `filterTasks`, `orderTasks`, `sameFilters` po pravilih R02/R03.
- [x] T002 Razširi `src/navigation.ts`: `useRoute()` vrne `filters`, dodaj `buildHash(projectId, {view, taskId, filters})` z izpuščanjem privzetih in ohranitvijo `view=board`; ohrani `projectUrl`/`taskUrl`.

## Faza 2: Temelj

- [x] T003 V `src/App.tsx` poveži potrjene filtre iz `useRoute`, izračunaj `V = orderTasks(filterTasks(T, C))` ter `N`/`M`.
- [x] T004 V `src/App.tsx` dodaj vrstico kontrol (Iskanje v povezavi, Stanje v povezavi, Vrstni red v povezavi) z osnutkom v `useState` in sinhronizacijo `draft := confirmed` ob vsaki navigaciji (R05, R07, R08).
- [x] T005 V `src/App.tsx` izvedi Uporabi pogled in Ponastavi pogled prek `buildHash`: obrez `q`, izpust privzetih, eno novo zgodovinsko stanje le ob spremembi, ohranjen `view` (R06, R11).
- [x] T006 V `src/App.tsx`, `src/TaskBoard.tsx` in `src/TaskDetails.tsx` posreduj `filters` povezavam pogledov, kartic in podrobnosti; klik na projekt uporabi privzete filtre (R08, R09, R10).

## Faza 3: Uporabniške zgodbe

- [x] T007 (R01–R04) Preveri zajem parametrov: privzete vrednosti, prva pojava, neznane vrednosti in parametri, brez prepisa URL-ja; prikaz neposredne povezave brez klika.
- [x] T008 (R02, R03) Prikaži ujemanje po normalizirani frazi in stabilno urejanje `original`/`title-asc`/`title-desc` v preglednici in tabli.
- [x] T009 (R11) Dodaj števec `role=status` `aria-label="Rezultati povezave"` z `Prikazano: N od M.` in sporočilo `Ni zadetkov.` ob praznem rezultatu; ohrani sporočilo praznega projekta.
- [x] T010 (R05) Preveri, da sprememba kontrol ne spremeni prikaza ali URL-ja do potrditve.
- [x] T011 (R06) Preveri potrditev: obrez in kodiranje `q`, ohranjen `view=board`, odstranjeni neznani parametri, brez novega stanja ob enaki potrditvi.
- [x] T012 (R07) Preveri Nazaj/Naprej in osvežitev: obnova potrjenih filtrov, prikaza in osnutka kontrol.
- [x] T013 (R08) Preveri preklop Preglednica/Tabla: isti ID-ji, ohranjeni parametri, zavržen nepotrjen osnutek.
- [x] T014 (R09) Preveri odpiranje/zapiranje podrobnosti (gumb, Escape) z ohranjenimi parametri in povezavo do pravega `id` pri enakih naslovih.
- [x] T015 (R10) Preveri preklop projekta (privzeti pregled, ohranjen `view`) in neposredno povezavo s parametri.
- [x] T016 (R11) Preveri Ponastavi pogled: počiščeni filtri in osnutek, ohranjen `view`, pravilna zgodovina.
- [x] T017 (R12) Preveri, da ni pisanja na API, `localStorage` ali `/__test/`; obstoječi pogledi in nalaganje delujejo.
- [x] T018 V `src/styles.css` dodaj slog vrstice kontrol v duhu Folio in prelom pri 390 pik brez širjenja strani.

## Faza 4: Preverjanje

- [x] T019 Napiši lastne teste `tests/agent/P09.spec.ts` za R01–R12 (neposredna povezava, fraza/šumniki, status IN, vrstni red z izenačenji, ponovljeni/neznani parametri, osnutek, zgodovina, pogled, podrobnosti, projekt, ponastavitev, brez pisanja).
- [x] T020 Zaženi razvojne primere `npx playwright test tests/development/P09.spec.ts` in zabeleži izid.
- [x] T021 Zaženi skupne teste `npx playwright test tests/baseline.spec.ts tests/api.spec.ts` in zabeleži izid.
- [x] T022 Zaženi `npm run typecheck`, `npm run lint` in `npm run build`; odpravi le napake svojih sprememb.

## Faza 5: Zaključek

- [x] T023 Vpiši dejanske izide v tabelo sledljivosti v `docs/agent/P09/spec.md` (ime testa, dnevnik); neizvedene teste označi kot neizvedene.
- [x] T024 Preglej skladnost z ustavo: obseg `src/`–`tests/agent/`–`docs/agent/`, Folio videz, brez novih odvisnosti in infrastrukture.

## Faza 6: Convergence

- [ ] T025 Razširi lastne teste v `tests/agent/P09.spec.ts`: ujemanje fraze v polju `description` dokaži z izvedenim testom (npr. `q=zapis` pred potrditvijo prikaže `web-01` in `web-06`) per R02 (partial).
- [ ] T026 Razširi lastne teste v `tests/agent/P09.spec.ts`: potrditev z ne-ASCII frazo (npr. `q=čšž`) zapiše URL-kodirano vrednost in jo ob osvežitvi obnovi per R06 (partial).
