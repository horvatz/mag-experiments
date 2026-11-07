# Naloge P06: Nastavljiv izvoz CSV

Vir: `docs/agent/P06/spec.md` in `docs/agent/P06/plan.md`. Naloge so zaporedne
(odvisnosti so navedene sproti); kode še ne vsebujejo.

## Faza 1: Osnova

- [ ] T001 V `src/csv.ts` dodaj konstanto vrstnega reda kolon K in čiste funkcije `quoteField`, `neutralize`, `filterRows`, `buildCsv` (BOM U+FEFF, CRLF tudi na koncu, glava brez nevtralizacije). Pokriva R02, R05–R09.
- [ ] T002 V `src/ExportControls.tsx` dodaj checkboxe `Stolpec <ime>`, selecta `Ločilo CSV` in `Filter izvoza` ter gumb `Izvozi CSV`; gumb je onemogočen, ko ni izbrane kolone ali ni ustreznih vrstic. Pokriva R02–R04, R06, dogovor o vmesniku. Odvisno od T001.

## Faza 2: Povezava in videz

- [ ] T003 V `src/App.tsx` (`ProjectView`) poveži stanje S, D, F s privzetimi vrednostmi (vse kolone, `;`, `all`), izračunaj dovoljenje in sproži prenos `folio-<projectId>.csv` prek `Blob` + `URL.createObjectURL` brez klicev API-ja. Pokriva R01, R03–R05. Odvisno od T001, T002.
- [ ] T004 Zagotovi, da preklop Preglednica/Tabla ohrani S, D, F, menjava projekta in osvežitev pa ju ponastavita (`key={project.id}`). Pokriva R10, R11. Odvisno od T003.
- [ ] T005 V `src/styles.css` dodaj slog izvozne vrstice po smernicah Folio; preveri, da se pri 390 pik stran ne razširi. Pokriva R12 in dogovor o vmesniku. Odvisno od T002.

## Faza 3: Lastni testi

- [ ] T006 V `tests/agent/helpers.ts` pripravi `mount` z nadzorovanimi GET odgovori, števec zapisov in zajem prenosa z branjem bajtov.
- [ ] T007 V `tests/agent/P06.spec.ts` dodaj preverjanja R01–R04: privzete vrednosti in vrstni red, izbira kolon ne glede na vrstni red klikov, onemogočen izvoz brez kolon, filtri in prazni rezultati. Odvisno od T006.
- [ ] T008 Dodaj preverjanja R05–R09: ime datoteke in BOM, obe ločili, narekovanje in podvajanje, CRLF, nevtralizacija formul z vodilnimi znaki, ohranitev Unicode, `status` in datuma. Odvisno od T006.
- [ ] T009 Dodaj preverjanja R10–R12: preklop pogleda in bajtna enakost, ponastavitev ob menjavi projekta/osvežitvi, odsotnost zapisov in sprememb opravil. Odvisno od T006.

## Faza 4: Preverjanje in predaja

- [ ] T010 Izvedi `npm run typecheck`, `npm run lint`, `npx playwright test --project=agent` in skupne teste; odpravi najdene napake. Odvisno od T005, T007–T009.
- [ ] T011 Vpiši dejanske izide in dokazila (ime testa, dnevnik) v tabelo sledljivosti v `docs/agent/P06/spec.md`; neizvedene primere označi kot nepreverjene. Odvisno od T010.
- [ ] T012 Zaključi s kratkim povzetkom sprememb, preverjanj, rezultatov in omejitev v `docs/agent/P06/spec.md`; brez navajanja neizvedenih testov kot uspešnih. Odvisno od T011.
