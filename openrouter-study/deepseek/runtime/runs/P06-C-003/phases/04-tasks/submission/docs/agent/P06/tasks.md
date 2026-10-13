# P06 — Naloge izvedbe: Nastavljiv izvoz CSV

Vir: `docs/agent/P06/spec.md` in `docs/agent/P06/plan.md`. Vsaka naloga se po izvedbi označi; dokazi gredo v tabelo sledljivosti v `spec.md`. Koda se še ne spreminja.

## Faza 1: Priprava

- [ ] T001 Preberi `docs/agent/P06/spec.md`, `docs/agent/P06/plan.md` in `.specify/memory/constitution.md`; potrdi obseg R01–R12 in meje dovoljenih datotek.
- [ ] T002 Zaženi izhodiščne skupne teste `npm test` in zabeleži začetno stanje (brez sprememb datotek).

## Faza 2: Temelj

- [ ] T003 Ustvari `src/csv.ts`: `EXPORT_COLUMNS`, `neutralizeFormula`, `quoteField`, `buildCsv` (BOM, glava, CRLF) in `downloadCsv` (R01, R05–R09).
- [ ] T004 Ustvari `src/ExportControls.tsx`: checkboxi `Stolpec <ime>`, selecta `Ločilo CSV` in `Filter izvoza`, gumb `Izvozi CSV`, stanje ter omogočenost (R02–R04, R06, R10, R11).
- [ ] T005 Vgradi kontrolnike v `src/App.tsx` (ProjectView) s `key={project.id}`; filtriranje uporabi samo za izvoz, prikaz pusti celoten (R04, R10, R11, R12).
- [ ] T006 Dopolni `src/styles.css` za kontrolnike v jeziku Folio; brez vodoravnega prelivanja pri 390 px (R12).

## Faza 3: Jedro izvoza (R01–R09)

- [ ] T007 Napiši `tests/agent/export.spec.ts`: R01 privzete vrednosti in vrstni red, R02 fiksni vrstni red kolon, R03 onemogočenost brez kolon, R04 filtri in prazne množice, R05 ime datoteke in BOM.
- [ ] T008 V `tests/agent/export.spec.ts` dodaj R06 ločilo in navedba, R07 CRLF ter znaki v vrednostih, R08 nevtralizacija formul, R09 Unicode, status in datum.

## Faza 4: Povezovanje in meje (R10–R12)

- [ ] T009 V `tests/agent/export.spec.ts` dodaj R10 preklop pogleda, R11 ponastavitev ob menjavi projekta in osvežitvi, R12 brez zapisov na API in brez prelivanja pri 390 px.

## Faza 5: Preverjanje in predaja

- [ ] T010 Zaženi `npm run lint`, `npm run build`, `npx playwright test tests/agent/export.spec.ts` in `npm test`; odpravi morebitne napake v dovoljenih datotekah.
- [ ] T011 Vpiši v `docs/agent/P06/spec.md` imena testov in dejanske rezultate za R01–R12; neizvedenih ali neuspešnih ne označi kot uspešnih.
- [ ] T012 Preveri meje: spremenjeni so le `src/`, `tests/agent/` in `docs/agent/`; `server/`, `shared/`, skupni testi, `tests/development/`, nastavitve in odvisnosti ostanejo nespremenjeni.
