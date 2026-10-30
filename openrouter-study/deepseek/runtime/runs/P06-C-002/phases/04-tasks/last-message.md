Korak `$speckit-tasks` je opravljen.

**Opravljeno**
- Preveril `.specify/feature.json`, ustavo, `spec.md` in `plan.md`; naloge izpeljane iz njunih odločitev.
- Zapisal `docs/agent/P06/tasks.md` (36 vrstic, 15 nalog v obliki `- [ ] T001 …` z datotekami), razvrščenih po fazah:
  - Faza 1: potrditev obsega (T001).
  - Faza 2: `src/csvExport.ts`, `src/App.tsx` (stanje, kontrole, prenos), `src/styles.css` (T002–T004).
  - Faza 3: privzeti izvoz in narekovanje/nevtralizacija + razvojna primera D01/D03 (T005–T007).
  - Faza 4: izbor kolon, ločila, filter, onemogočenost, pariteta pogledov, ponastavitev + D02/D04 (T008–T011).
  - Faza 5: nespreminjanje podatkov in odsotnost zapisov na API (T012).
  - Faza 6: `typecheck`/`lint`, vsi testni projekti, izpolnitev tabele sledljivosti v `spec.md` (T013–T015).

**Preverjanje**
- Vseh 15 nalog ima oznako T0xx in navedeno datoteko; koda še ni implementirana (kot zahtevano).
- `node task/time-budget.mjs`: 900 s preostanka v fazi.
