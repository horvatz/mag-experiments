Korak `$speckit-tasks` je opravljen.

**Ustvarjeno**
- `docs/agent/P03/tasks.md` — 12 zaporednih nalog T001–T012 v formatu kontrolnega seznama, z datotekami in oznakami zahtev, po fazah:
  - **Priprava**: T001 preveri izhodišče (typecheck, branje obstoječih pogledov).
  - **Temelj**: T002 `src/filters.ts` (normalizacija, besede, ujemanje, filtriranje, možnosti oseb).
  - **Vmesnik**: T003 stanje filtrov + ponastavitev ob menjavi projekta; T004 kontrole in `role=status` z `Prikazano: N od M.`; T005 povezava prikaza s filtriranim seznamom in prazna stanja; T006 `TaskBoard` s filtriranimi opravili in števci stolpcev; T007 slogi in ozka širina.
  - **Testi in dokazi**: T008 lastni testi `tests/agent/p03-filters.spec.ts` (R01–R12), T009 typecheck/lint/build, T010 regresija in lastni testi, T011 vnos dokazov v `docs/agent/P03/spec.md`.
  - **Zaključek**: T012 ponovno preverjanje in kratko poročilo.

Naloge so odvisnostno urejene, pokrivajo vseh 12 zahtev in preverjanja iz skupne predloge; koda še ni bila spremenjena. Preostanek faze: 1024 s.
