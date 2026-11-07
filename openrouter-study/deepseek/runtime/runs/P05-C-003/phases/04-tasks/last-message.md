Korak `$speckit-tasks` je opravljen.

**Izdelek**
- `docs/agent/P05/tasks.md` — 15 nalog `T001`–`T015` v checklist obliki z odvisnostnim zaporedjem in potmi datotek:
  - **Priprava**: T001 preveri pogodbo vmesnika v razvojnih testih (samo branje).
  - **Temelj**: T002 `src/pagination.ts` (čista logika), T003 `src/PaginationControls.tsx` (kontrole).
  - **Zgodbe po prioriteti**: T004–T005 straničenje in navigacija (R01–R04, R09); T006 filter in prazni rezultat (R05, R10, R11); T007 pogledi, ohranitev in ponastavitev stanja (R06–R08); T008 slog Folio (R12, 390 px).
  - **Testi**: T009 scenariji R01–R05, R09–R11; T010 scenariji R06–R08 in `readonly` (R12).
  - **Preverjanje in dokazila**: T011 typecheck/lint, T012 razvojni testi D01–D04, T013 lastni testi, T014 regresija izhodišča, T015 vpis dejanskih izidov v `spec.md`.

**Opombe**
- Kode v tem koraku nisem pisal; obseg in infrastruktura nespremenjena.
- Preostanek proračuna: ~986 s. Naslednji korak (`$speckit-implement`) lahko izvede T001–T015 v tem vrstnem redu.
