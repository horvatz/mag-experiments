Korak `$speckit-tasks` je zaključen.

**Izdelek**
- `docs/agent/P10/tasks.md` — 16 zaporednih nalog `T001`–`T016` v obliki kontrolnega seznama, vsaka s potjo datoteke, po fazah: priprava, temeljna logika (`src/taskOrder.ts`), P1 premiki in meje, P2 razveljavitev/ponovitev, P3 začetni vrstni red in lokalnost, preverjanje in oddaja.
- Preverjanja iz skupne predloge so zajeta v T014–T016 (lint/build, celotni `npx playwright test`, vpis dejanskih izidov v tabelo sledljivosti `spec.md` z dokazi, brez označevanja neizvedenih testov kot uspešnih).
- Lastni testi so načrtovani v `tests/agent/P10.spec.ts` (T008, T010, T012) z javnim razvojnim pripomočkom; koda še ni bila spremenjena.

Preostanek proračuna: 937 s.
