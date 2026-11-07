Korak `$speckit-tasks` je opravljen.

**Ustvarjeno**
- `docs/agent/P07/tasks.md` (34 vrstice), 14 zaporednih nalog `T001`–`T014` v formatu kontrolnega seznama z datotekami:
  - Priprava: `T001` izhodiščni `typecheck`/`npm test`.
  - Temelj: `T002` `src/favorites.ts` (validacija P2, serializacija UTF-16, `storage`, izjeme), `T003` `src/useFavorites.ts`.
  - Uporabniške zgodbe: `T004`–`T008` (gumb z `aria-pressed`, stanje/filter/števec/opozorilo v `App.tsx`, tabela, tabla, `styles.css`), vezane na R01–R12.
  - Lastni testi: `T009`–`T011` (`tests/agent/helpers.ts`, `tests/agent/p07-favorites.spec.ts` za vse R01–R12).
  - Preverjanje in sledljivost: `T012` typecheck/lint/build, `T013` lastni in skupni testi, `T014` vpis dejanskih dokazov v `spec.md`.

**Omejitve**
- Koda še ni implementirana; brez novih zahtev, odvisnosti ali infrastrukturnih sprememb. Druge datoteke nespremenjene.

Preostanek proračuna: ~1015 s.
