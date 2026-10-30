# Naloge P05: Straničenje in filter stanja

**Feature directory**: `docs/agent/P05` | **Viri**: `spec.md`, `plan.md`, `../../task/instructions.md` | **Format**: `- [ ] Txxx opis (pot)`

Zaporedje je odvisnostno: najprej čista logika in kontrole, nato povezava v pogled, nato testi in preverjanja. Vsaka naloga je majhna in preverljiva; kode se v tem koraku ne piše.

## Faza 1: Priprava

- [ ] T001 Preveri pogodbo vmesnika v obstoječih razvojnih testih (dostopna imena `Velikost strani`, `Filter strani`, gumbi, `role=status` z `aria-label="Stanje straničenja"`) (`tests/development/P05.spec.ts`, `tests/development/helpers.ts`; samo branje).

## Faza 2: Temelj

- [ ] T002 Ustvari `src/pagination.ts`: tipi, konstante `PAGE_SIZES`/`STATUS_FILTERS` ter čiste funkcije `filterTasks`, `paginate`, `statusText` po specifikaciji (R02, R05, R09, R10).
- [ ] T003 Ustvari `src/PaginationControls.tsx`: selecta `Velikost strani` in `Filter strani`, gumbi Prva/Prejšnja/Naslednja/Zadnja stran, element `role=status` z `aria-label="Stanje straničenja"` (R03, R04, R05, R09, R10).

## Faza 3: Uporabniške zgodbe

### Zgodba 1: velikost strani in navigacija (R01–R04, R09)

- [ ] T004 V `src/App.tsx` dodaj stanje `(pageSize, filter, page)` v `ProjectView` s privzetkom all/all/1 in napajanje preglednice z odsekom `S` (R01, R02, R04).
- [ ] T005 V `src/App.tsx` vključi `PaginationControls`: navigacija z onemogočenimi gumbi na robu (R03), besedilo statusa (R09), sprememba velikosti vrne na prvo stran (R04).

### Zgodba 2: filter stanja (R05, R10, R11)

- [ ] T006 V `src/App.tsx` uporabi filter pred straničenjem (`F` kot podzaporedje `T`, `p := 1`) (R05); prazen rezultat da besedilo `Stran 0 od 0. Prikazano 0–0 od 0.` in onemogočene gumbe (R10); pregled stanj šteje celoten nefiltrirani seznam (R11).

### Zgodba 3: pogledi, ohranitev stanja in nespremenljivost (R06–R08, R12)

- [ ] T007 V `src/App.tsx` napajaj odsek tudi v `TaskBoard` (isti id-ji, stolpci le odsek) (R06); preveri ohranitev `s`/`f`/`p` ob preklopu pogleda in podrobnostih (R07) ter ponastavitev ob menjavi projekta in osvežitvi (R08); `src/navigation.ts` ostane nespremenjen.
- [ ] T008 V `src/styles.css` dodaj slog kontrol v duhu Folio: prelom pri ozkem zaslonu, brez vodoravnega razširjanja strani pri 390 pik, notranje drsenje ostane (R12).

## Faza 4: Lastni testi

- [ ] T009 Ustvari `tests/agent/p05.spec.ts` s scenariji R01–R05 in R09–R11 (pomožne funkcije iz `tests/development/helpers.ts`: `mount`, `expectIds`, `select`, `click`, `summary`): privzeto stanje, straničenje 2/5/10, robovi, sprememba velikosti, filter, obe besedili statusa, števci.
- [ ] T010 V `tests/agent/p05.spec.ts` dodaj scenarije R06–R08 in R12: skladnost preglednice in table, ohranitev stanja, ponastavitev ob menjavi projekta in osvežitvi, `readonly` (brez zapisov).

## Faza 5: Preverjanje in dokazila

- [ ] T011 Poženi `npm run typecheck` in `npm run lint`.
- [ ] T012 Poženi `npx playwright test tests/development/P05.spec.ts` (razvojni primeri D01–D04).
- [ ] T013 Poženi `npx playwright test tests/agent/` (lastni testi R01–R12).
- [ ] T014 Poženi `npx playwright test tests/baseline.spec.ts tests/api.spec.ts` (regresija izhodišča).
- [ ] T015 Vpiši dejanske izide v tabelo sledljivosti v `docs/agent/P05/spec.md` in po potrebi popravi `docs/agent/P05/plan.md`; neizvedenih preverjanj ne označi kot uspešnih.
