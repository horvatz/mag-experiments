# Naloge P05: Straničenje in filter stanja

Vir: `docs/agent/P05/spec.md` in `docs/agent/P05/plan.md`. Majhna sprememba obstoječega vmesnika; brez novih odvisnosti in infrastrukturnih posegov.

## Faza 1: Priprava

- [ ] T001 Ustvari `src/pagination.ts` s čistimi funkcijami `filterTasks`, `pageCount`, `pageSlice`, `pageBounds`, `statusText`, `clampPage` po predikatih iz specifikacije.

## Faza 2: Temelj

- [ ] T002 V `src/App.tsx` (`ProjectView`) dodaj lokalno stanje `pageSize` (all/2/5/10), `statusFilter` (all/todo/in_progress/done) in `page` (1-osnovna) ter izračun filtra in odseka prek `src/pagination.ts`.
- [ ] T003 V `src/App.tsx` dodaj kontrole v `section-heading`: `select` Velikost strani, `select` Filter strani, gumbe Prva/Prejšnja/Naslednja/Zadnja stran in `role=status` z `aria-label="Stanje straničenja"`; gumbe na robu onemogoči.
- [ ] T004 V `src/styles.css` dopolni slog orodne vrstice, gumbov in statusa z obstoječimi Folio gradniki; brez vodoravnega razširjanja strani pri 390 pik.

## Faza 3: Zgodba 1 – straničenje in filter (R01–R05)

- [ ] T005 Preglednico izriši iz odseka (`odsek`) namesto celotnega polja; privzeto `all`/`all`; menjava velikosti ali filtra postavi `page = 1`.

## Faza 4: Zgodba 2 – pogledi, števci, stanje (R06, R07, R08, R11, R12)

- [ ] T006 `TaskBoard` prejme odsek; tabla združi le trenutno stran, števci stolpcev štejejo odsek, povzetek stanj ostane nad celotnim projektom.
- [ ] T007 Preveri ohranitev `page`/`pageSize`/`statusFilter` ob preklopu pogleda in podrobnostih ter ponastavitev ob menjavi projekta in osvežitvi (obstoječi `key={project.id}`); brez `localStorage` in brez URL-ja za nova stanja.

## Faza 5: Zgodba 3 – status in prazen rezultat (R09, R10)

- [ ] T008 Status izpiši natanko kot `Stran p od Y. Prikazano A–B od n.`; pri praznem rezultatu `Stran 0 od 0. Prikazano 0–0 od 0.` in vsi štirje gumbi onemogočeni; obstoječe sporočilo praznega projekta ohrani.

## Faza 6: Preverjanje in dokazila

- [ ] T009 Dodaj lastne Playwright teste v `tests/agent/p05-pagination.spec.ts` za R01–R12 (privzetki, odseki, robovi, filter, oba pogleda, stanje, status, prazno, števci, brez zapisov).
- [ ] T010 Zaženi `npm run lint` in `npm run typecheck`; odpravi napake v dovoljenih datotekah.
- [ ] T011 Zaženi skupna testa `npx playwright test tests/baseline.spec.ts tests/api.spec.ts`.
- [ ] T012 Zaženi lastne teste in celoten `npm test`; ročno preglej 390 pik.
- [ ] T013 V `docs/agent/P05/spec.md` vpiši izide, dokazila in omejitve (neizvedeno označi kot neizvedeno); ne navajaj neizvedenih testov kot uspešnih.
