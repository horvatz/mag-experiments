# Naloge P03

## Priprava

- [ ] T001 Dodaj stanje filtrov in čisto izpeljavo `visibleTasks` v `src/App.tsx`, vključno z normalizacijo iskanja, natančno primerjavo stanja in osebe ter logičnim IN.

## Osnova

- [ ] T002 Dodaj kontrolno vrstico z iskalnim vnosom, obema `select` filtroma, gumbom `Počisti filtre` in sporočilom `Prikazano: N od M.` v `src/App.tsx`.
- [ ] T003 Posodobi preglednico, `TaskBoard` in vse števce, da uporabljajo isti nabor `visibleTasks` v `src/App.tsx` in `src/TaskBoard.tsx`.
- [ ] T004 Doda minimalne Folio stile za kontrolno vrstico, ozki prikaz in sporočilo o rezultatih v `src/styles.css`.

## Preverjanje

- [ ] T005 Doda Playwright teste v `tests/agent/p03.spec.ts` za R01–R12: začetno stanje, normalizacijo, večbesedno iskanje, kombinirane filtre, preklop pogleda, menjavo projekta, števce, prazne zadetke, čiščenje filtrov, navigacijo in odsotnost pisalnih zahtev.
- [ ] T006 Izvede `npm run check` ter po potrebi popravi odkrite napake v `src/` in `tests/agent/`; v dokumentaciji zabeleži dejanske izide in omejitve.

## Sledljivost

- Specifikacija: `docs/agent/P03/spec.md`
- Načrt: `docs/agent/P03/plan.md`
- Zahteve: `task/instructions.md`
