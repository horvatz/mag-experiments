# Naloge izvedbe: P03

## Setup

- [ ] [T001] V `tests/agent/P03.spec.ts` dodaj Playwright scenarije R01–R12; testne zbirke podaj s prestrezanjem GET zahtev na `/api/` in pokrij Unicode, ločila, različne velikosti/vrstne rede projektov, prazen projekt, enake ID-je v obeh pogledih, navigacijo/podrobnosti ter odsotnost zapisovalnih zahtev.

## Foundational

- [ ] [T002] V `src/taskFilters.ts` uvedi tipizirane čiste funkcije za NFD/diakritično normalizacijo, ujemanje vseh dobesednih besed, sestavljeni filter IN in enolična neprazna imena oseb; ohrani izvorni vrstni red opravil.

## User stories (po vrstnem redu)

- [ ] [T003] V `src/App.tsx` dodaj dostopne kontrole iskanja, stanja in osebe ter lokalno stanje filtrov v `ProjectView`; poveži jih s funkcijami iz `src/taskFilters.ts` in pokrij R01–R05.
- [ ] [T004] V `src/App.tsx` zagotovi ponastavitev filtrov ob menjavi projekta, privzete vrednosti po osvežitvi, obstojnost ob menjavi pogleda in enodejavni gumb za čiščenje; filtrov ne zapisuj v URL ali trajno shrambo ter pokrij R07, R08 in R11.
- [ ] [T005] V `src/App.tsx` in `src/TaskBoard.tsx` oba pogleda veži na isti filtrirani seznam; iz njega izračunaj pregled stanj in števce, prikaži N od M ter loči stanje brez zadetkov od praznega projekta; ohrani ID-je in dostopna imena iz R06, R09, R10 in R12.

## Polish

- [ ] [T006] V `src/styles.css` oblikuj kontrole po potrjenem Folio dizajnu in preveri, da pri 390 px stran ne preseže širine, notranje drsenje pogledov ostane uporabno ter fokus vmesnika viden.
- [ ] [T007] Zaženi `npm run check` (lint, build, skupni in agentni testi); odpravi regresije znotraj dovoljenih datotek in v `docs/agent/P03/spec.md` zapiši dejanske datoteke, teste, izide, dokazila ter nepreverjene omejitve.
