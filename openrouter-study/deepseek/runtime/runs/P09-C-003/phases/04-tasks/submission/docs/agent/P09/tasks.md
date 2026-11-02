# Naloge P09 — Stanje pogleda v povezavi in zgodovini

Izvor: `docs/agent/P09/spec.md` (R01–R12) in `docs/agent/P09/plan.md`. Naloge se
izvajajo po vrsti; oznake R… so zahteve iz specifikacije. Kode se ne implementira v
tem koraku.

## Faza 1 — Priprava

- [ ] T001 Preveri omejitve in izhodišče (brez novih odvisnosti; nedotaknjeni `server/`, `shared/`, skupni testi) — `docs/agent/P09/plan.md`.
- [ ] T002 Preglej obstoječe usmerjanje in testni pomočnik — `src/navigation.ts`, `tests/development/helpers.ts`.

## Faza 2 — Temelj (skupna logika)

- [ ] T003 Ustvari `src/viewState.ts`: `ViewParams` in `parseViewParams` (prva pojava; neznano → privzeto) — R01, R04.
- [ ] T004 Dopolni `src/viewState.ts`: `normalize`, `matchesQuery`, `filterTasks` (IN q+status; stabilen `order` ob izenačenju) — R02, R03.
- [ ] T005 Dopolni `src/viewState.ts`: `buildHash` (izpusti privzete, ohrani `view`, odstrani neznane, URL-kodiraj) — R06.
- [ ] T006 Dopolni `src/navigation.ts`: `useRoute` s `params`, `projectUrl`/`taskUrl` s parametri, `navigate` (`pushState` + `hashchange`) — R01, R06, R09.

## Faza 3 — Zgodba 1: potrjeno stanje iz povezave (R01–R04)

- [ ] T007 Vključi filtriranje v `src/App.tsx` in prikaži filtrirano tabelo — R01–R03.
- [ ] T008 Prikaži "Ni zadetkov." in števec "Prikazano: N od M." — R11.
- [ ] T009 Prvi lastni testi v `tests/agent/p09.spec.ts` (neposredne povezave, normalizacija, neznani in ponovljeni parametri) — R01–R04.

## Faza 4 — Zgodba 2: osnutek in potrditev (R05, R06)

- [ ] T010 Ustvari `src/ViewControls.tsx` (iskanje, dva selecta, gumba; oznake iz dogovora) — R05.
- [ ] T011 Osnutek: lokalno stanje, sinhronizacija ob navigaciji, potrditev prek `navigate` — R05, R06, R08.
- [ ] T012 Vključi kontrole v `src/App.tsx` in dopolni slog `src/styles.css` (Folio, 390 px) — R05, R12.
- [ ] T013 Lastni testi: osnutek ne spremeni prikaza/URL-ja, ena vstopnica, obrezovanje in izpust privzetih — `tests/agent/p09.spec.ts` — R05, R06.

## Faza 5 — Zgodba 3: zgodovina in navigacije (R07–R10)

- [ ] T014 Prenesi parametre v povezave tabele/table in podrobnosti (`taskUrl`, `projectUrl`) — R08, R09.
- [ ] T015 Zavržen osnutek in obnova stanja ob Nazaj/Naprej in osvežitvi — R07, R08.
- [ ] T016 Klik na drug projekt (privzeti pregled, ohrani pogled); neposredna povezava s parametri — R10.
- [ ] T017 Lastni testi: back/forward/reload, preklop pogleda, podrobnosti in Escape, enaki naslovi, menjava projekta — `tests/agent/p09.spec.ts` — R07–R10.

## Faza 6 — Zgodba 4: ponastavitev in omejitve (R11, R12)

- [ ] T018 Gumb "Ponastavi pogled" po pravilu potrditve, ohrani način pogleda — R11.
- [ ] T019 Lastni testi: ponastavitev, prazni rezultati, brez zapisov in `localStorage`, 390 px — `tests/agent/p09.spec.ts`, po potrebi `tests/agent/p09-mobile.spec.ts` — R11, R12.

## Faza 7 — Zaključek in preverjanje

- [ ] T020 Poženi `npm run typecheck` in `npm run lint` ter popravi napake — `src/`.
- [ ] T021 Poženi `npx playwright test tests/agent` in `npx playwright test tests/development/P09.spec.ts`.
- [ ] T022 Ob koncu poženi `npm test` (baseline + api + agent) — skupni testi.
- [ ] T023 Posodobi sledljivostno tabelo v `docs/agent/P09/spec.md` z dejanskimi izidi (neizvedenih ne označi kot uspešnih) — R01–R12.
- [ ] T024 Zapiši predajo: spremembe, preverjanja, rezultati, omejitve — `docs/agent/P09/spec.md`.

Zgodovina: 2026-11-02 — v0.1 seznama nalog.
