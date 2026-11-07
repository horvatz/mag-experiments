Korak `$speckit-tasks` je opravljen.

**Izdelek**
- `docs/agent/P07/tasks.md` (37 vrstic) — odvisnostno zaporedje z oznakami T001–T018 in potmi datotek:
  - **Faza 1 Priprava**: T001 obseg/meje, T002 izhodiščno preverjanje (typecheck + skupni testi).
  - **Faza 2 Jedro**: T003 `src/favorites.ts` (validacija/normalizacija/serijalizacija, R02–R04), T004 `src/useFavorites.ts` (stanje, zapis v `try/catch`, `storage`, R02–R04, R11).
  - **Faza 3 Uporabniške zgodbe**: T005 gumbi v preglednici (R01, R07), T006 tabla in števci stolpcev (R01, R07), T007 obnova/neveljavni zapisi/menjava projekta (R02–R04, R08), T008 filter, odstranitev projekta, števec X/M in prazno stanje (R05, R06, R09, R10), T009 opozorilo shrambe (R11), T010 slogi in 390 px (R12).
  - **Faza 4 Lastni testi**: T011–T013 `tests/agent/favorites.spec.ts` — vsi scenariji R01–R12, vključno z `StorageEvent`, izjemo shrambe in ozkim pogledom.
  - **Faza 5 Preverjanje in dokazi**: T014 typecheck/lint/build, T015 lastni testi (`--project=agent`), T016 skupni testi (api/desktop/mobile), T017 vpis dejanskih izidov v `spec.md`, T018 predaja brez vej/commitov.

**Opombe**
- Vsaka naloga v obliki `- [ ] T0NN …` z navedeno datoteko; koda še ni bila spremenjena.
- Proračun: porabljenih ~30 s v tem koraku, skupno ostaja 868 s.
