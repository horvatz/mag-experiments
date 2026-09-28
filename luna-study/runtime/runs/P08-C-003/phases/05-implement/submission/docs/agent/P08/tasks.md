# P08: Koledarski pregled rokov — naloge

Vrstni red sledi [načrtu](plan.md); pogoji in simboli so določeni v [specifikaciji](spec.md). Vse naloge ostanejo znotraj dovoljenih map. Skupne teste samo zaženi, ne spreminjaj jih.

## Setup

- [ ] [T001] V `tests/agent/P08-deadlines.spec.ts` pripravi agentni Playwright ogrodni scenarij in pomoč za nadzorovane odgovore GET na `/api/` z različnimi nabori opravil; UI naj ne uporablja `/__test/`.

## Foundational

- [ ] [T002] V `src/deadlineGroups.ts` dodaj čisto klasifikacijo opravil, koledarsko aritmetiko za `YYYY-MM-DD`, pet števcev iz celotnega projekta in izbor filtriranega seznama v izvornem vrstnem redu (R02–R05, R07).

## User stories

- [ ] [T003] V `src/App.tsx` dodaj lokalno stanje in kontrole za začetni datum `2026-09-21`, skupino `all`, `input type="date"` ter izbirnik s skupinami in natančnimi slovenskimi oznakami (R01, R07).
- [ ] [T004] V `src/App.tsx` izračunaj števce neodvisno od filtra in predaj isti filtrirani nabor preglednici ter `src/TaskBoard.tsx`; ohrani ID-je, vrstni red in statusne stolpce. Pokrij prazen projekt in prazno filtrirano skupino z zahtevanim sporočilom (R06, R07, R09, R11).
- [ ] [T005] V `src/App.tsx` izvedi prehode datuma: veljaven vnos takoj preračuna z ohranjenim filtrom, prazen vnos pokaže predpisano opozorilo in obdrži zadnji veljavni preračun; preklop pogleda ohrani stanje, menjava projekta in osvežitev pa ga ponastavita brez URL/shrambe (R08–R10).
- [ ] [T006] V `src/styles.css` oblikuj kontrole in števce v potrjenem Folio slogu ter ohrani odzivnost pri 390 px, notranje drsenje, viden fokus in obstoječa dostopna imena; preveri, da pregled ne spreminja podatkov ali bralnih podrobnosti (R12).

## Polish

- [ ] [T007] V `tests/agent/P08-deadlines.spec.ts` dodaj Playwright preverjanja za R01–R12: meje rokov, prestopni datum/časovni pas, opravljena opravila, števce in imena, filtre/ID-je, prazen rezultat, prehode stanja, navigacijo/osvežitev, 390 px ter odsotnost zapisov.
- [ ] [T008] Zaženi `npx playwright test --project=agent` in `npm run check` za lastne ter skupne regresijske teste, lint in build; nato v `docs/agent/P08/spec.md` dopolni sledljivost za vsako R01–R12 z datoteko, dejanskim scenarijem, izidom in dokazom. Neoznačena ali neizvedena preverjanja jasno pusti kot taka.
