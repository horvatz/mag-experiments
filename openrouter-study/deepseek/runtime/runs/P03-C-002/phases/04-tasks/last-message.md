Korak `$speckit-tasks` je končan.

**Rezultat**
- `docs/agent/P03/tasks.md` z 15 zaporednimi nalogami v formatu `- [ ] T001 …`:
  - Setup: branje meja, nov `src/filters.ts`.
  - Temelj: stanje filtrov in izračun `S`/`N`, kontrolna vrstica, `role=status` in `Ni zadetkov.`.
  - Zgodbe: preglednica, pregled stanj, `TaskBoard` stolpci, `styles.css` (390 px, fokus).
  - Preverjanje: lastni testi `tests/agent/P03.spec.ts` za R01–R12, `typecheck`/`build`, skupni in agentni zagoni, ročna kontrola.
  - Zaključek: vpis dokazov v sledljivost `spec.md`, kontrola meja (brez veje/commita).
- Vsaka naloga navaja datoteke in zahteve R01–R12; koda še ni implementirana.

**Preverjanje**
- `node task/time-budget.mjs`: 175 s preostanka v fazi; delo shranjeno.

Naslednji korak: `$speckit-implement` — izvedba nalog T001–T015.
